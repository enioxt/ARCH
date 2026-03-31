"""
SINAPI Downloader and Parser
Automatically downloads and parses official SINAPI tables from Caixa Federal
"""

import os
import io
import logging
import zipfile
import pandas as pd
from datetime import datetime, date
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import httpx
import psycopg2
from psycopg2.extras import execute_values
import json

logger = logging.getLogger(__name__)


class SINAPIDownloader:
    """
    Downloads SINAPI tables from Caixa Federal and syncs to PostgreSQL
    """

    # SINAPI download URLs (organized by state/region)
    SINAPI_SOURCES = {
        "sinapi": {
            "url": "https://www.caixa.gov.br/Downloads/sinapi/Tabelas_SINAPI/SINAPI_{mes}{ano}.zip",
            "description": "Tabela SINAPI (Caixa Federal) - Main reference table"
        }
    }

    def __init__(
        self,
        db_host: str = "localhost",
        db_name: str = "egos_sinapi",
        db_user: str = "sinapi_user",
        db_pass: str = "sinapi_pass",
        download_dir: str = "./downloads"
    ):
        """Initialize downloader with database credentials"""
        self.db_host = db_host
        self.db_name = db_name
        self.db_user = db_user
        self.db_pass = db_pass
        self.download_dir = Path(download_dir)
        self.download_dir.mkdir(parents=True, exist_ok=True)

    def get_db_connection(self):
        """Establish PostgreSQL connection"""
        try:
            conn = psycopg2.connect(
                host=self.db_host,
                database=self.db_name,
                user=self.db_user,
                password=self.db_pass
            )
            return conn
        except psycopg2.Error as e:
            logger.error(f"Database connection error: {e}")
            raise

    def download_sinapi(self, mes: int, ano: int) -> Optional[Path]:
        """
        Download SINAPI table for given month/year

        Args:
            mes: Month (1-12)
            ano: Year (2024, 2025, etc)

        Returns:
            Path to downloaded ZIP file or None if failed
        """
        # Format: SINAPI_032026.zip for March 2026
        formatted_mes = str(mes).zfill(2)
        formatted_ano = str(ano)

        url = (
            f"https://www.caixa.gov.br/Downloads/sinapi/Tabelas_SINAPI/SINAPI_{formatted_mes}{formatted_ano}.zip"
        )

        file_path = self.download_dir / f"SINAPI_{formatted_mes}{formatted_ano}.zip"

        logger.info(f"Downloading SINAPI {formatted_mes}/{formatted_ano} from {url}")

        try:
            with httpx.stream("GET", url, timeout=60.0) as response:
                response.raise_for_status()

                with open(file_path, "wb") as f:
                    for chunk in response.iter_bytes():
                        f.write(chunk)

            logger.info(f"Downloaded to {file_path} ({file_path.stat().st_size} bytes)")
            return file_path

        except httpx.RequestError as e:
            logger.error(f"Download failed: {e}")
            return None

    def parse_sinapi_zip(self, zip_path: Path) -> Dict[str, pd.DataFrame]:
        """
        Parse SINAPI ZIP file and extract insumos and composicoes

        Returns:
            {
                "insumos": DataFrame with columns [codigo, descricao, unidade, preco],
                "composicoes": DataFrame with columns [codigo, descricao, insumos_json]
            }
        """
        data = {"insumos": None, "composicoes": None}

        try:
            with zipfile.ZipFile(zip_path, "r") as z:
                # List all files
                file_list = z.namelist()
                logger.info(f"ZIP contents: {file_list[:5]}... ({len(file_list)} files)")

                # Find XLSX files
                xlsx_files = [f for f in file_list if f.endswith(".xlsx")]

                if not xlsx_files:
                    logger.error("No XLSX files found in ZIP")
                    return data

                # Parse first XLSX (usually contains insumos)
                with z.open(xlsx_files[0]) as xls_file:
                    # Try to read with pandas
                    try:
                        df = pd.read_excel(io.BytesIO(xls_file.read()), sheet_name=0)

                        # Expected columns: Código | Descrição | Unidade | Preço
                        expected_cols = ["Código", "Descrição", "Unidade", "Preço"]
                        actual_cols = df.columns.tolist()

                        logger.info(f"Sheet columns: {actual_cols}")

                        # Normalize columns (case-insensitive)
                        df_normalized = df.copy()
                        df_normalized.columns = [col.lower() for col in df_normalized.columns]

                        # Filter rows with valid data
                        df_clean = df_normalized.dropna(subset=["código"])

                        data["insumos"] = df_clean[[
                            "código", "descrição", "unidade", "preço"
                        ]].rename(columns={
                            "código": "codigo",
                            "descrição": "descricao",
                            "unidade": "unidade",
                            "preço": "preco"
                        })

                        logger.info(f"Parsed {len(data['insumos'])} insumos from {xlsx_files[0]}")

                    except Exception as e:
                        logger.error(f"Error reading XLSX: {e}")
                        return data

        except zipfile.BadZipFile as e:
            logger.error(f"Invalid ZIP file: {e}")

        return data

    def upsert_insumos(self, df: pd.DataFrame, uf: str = "BR", tabela_origem: str = "SINAPI"):
        """
        Insert/update insumos in PostgreSQL with price history

        Args:
            df: DataFrame with [codigo, descricao, unidade, preco]
            uf: State code (SP, MG, RJ, etc) or BR for national
            tabela_origem: Source table name
        """
        if df is None or df.empty:
            logger.warning("Empty DataFrame, skipping upsert")
            return

        conn = self.get_db_connection()
        cursor = conn.cursor()

        data_referencia = date.today()

        try:
            for _, row in df.iterrows():
                codigo = row["codigo"]
                descricao = row["descricao"]
                unidade = row["unidade"]
                preco = float(row["preco"]) if pd.notna(row["preco"]) else None

                if preco is None:
                    continue

                # Build history entry
                historico_entry = {
                    "data": data_referencia.isoformat(),
                    "preco": preco
                }

                # Upsert insumo
                cursor.execute("""
                    INSERT INTO insumos (
                        codigo, descricao, unidade, preco_atual,
                        uf, tabela_origem, data_referencia, historico_precos
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (codigo) DO UPDATE SET
                        preco_atual = EXCLUDED.preco_atual,
                        tabela_origem = EXCLUDED.tabela_origem,
                        data_referencia = EXCLUDED.data_referencia,
                        historico_precos = (
                            SELECT jsonb_agg(DISTINCT item)
                            FROM jsonb_array_elements(
                                insumos.historico_precos || EXCLUDED.historico_precos
                            ) AS item
                        ),
                        updated_at = NOW()
                    RETURNING id;
                """, (
                    codigo,
                    descricao,
                    unidade,
                    preco,
                    uf,
                    tabela_origem,
                    data_referencia,
                    json.dumps([historico_entry])
                ))

            conn.commit()
            logger.info(f"Upserted {len(df)} insumos into database")

        except Exception as e:
            conn.rollback()
            logger.error(f"Upsert error: {e}")
            raise
        finally:
            cursor.close()
            conn.close()

    def run_full_sync(self, mes: int = None, ano: int = None) -> bool:
        """
        Execute full SINAPI sync pipeline

        If mes/ano not provided, uses current month/year
        """
        if mes is None or ano is None:
            today = datetime.now()
            mes = today.month
            ano = today.year

        logger.info(f"Starting SINAPI sync for {mes}/{ano}")

        # 1. Download
        zip_path = self.download_sinapi(mes, ano)
        if not zip_path:
            logger.error("Download failed, aborting sync")
            return False

        # 2. Parse
        parsed_data = self.parse_sinapi_zip(zip_path)
        if parsed_data["insumos"] is None:
            logger.error("Parse failed, aborting sync")
            return False

        # 3. Upsert to database
        try:
            self.upsert_insumos(parsed_data["insumos"], uf="BR", tabela_origem="SINAPI")
            logger.info("SINAPI sync completed successfully")
            return True
        except Exception as e:
            logger.error(f"Upsert failed: {e}")
            return False


# CLI usage
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    downloader = SINAPIDownloader(
        db_host=os.getenv("DB_HOST", "localhost"),
        db_name=os.getenv("DB_NAME", "egos_sinapi"),
        db_user=os.getenv("DB_USER", "sinapi_user"),
        db_pass=os.getenv("DB_PASS", "sinapi_pass"),
    )

    # Run sync for current month
    success = downloader.run_full_sync()
    exit(0 if success else 1)
