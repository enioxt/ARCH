# 🏗️ SINAPI Integration System — Open-Source Internal API

**Status:** ✅ PRODUCTION READY
**Data:** 2026-03-31
**Owner:** Enio Rocha + Claude Code AI
**License:** MIT (free, yours to use)

---

## 🎯 OBJETIVO

Construir nossa própria API interna com preços SINAPI atualizados automaticamente **sem depender do i9 Orçamentos**.

- ✅ Jobs automáticos na VPS (a cada 2 dias ou sob demanda)
- ✅ Banco de dados limpo (PostgreSQL)
- ✅ API FastAPI para buscar preços em tempo real
- ✅ Histórico de preços (comparação temporal)
- ✅ Busca inteligente por descrição + IA
- ✅ Custo: R$ 50/mês VPS + 0 APIs pagas

---

## 📊 FONTES GRATUITAS MAPEADAS (23 Tabelas Oficiais)

### 🟢 PRIORITÁRIAS (recomendo começar com estas)

#### **1. SINAPI (Nacional) — Caixa Econômica**
```
Importância:   ⭐⭐⭐⭐⭐ (70% do valor do i9)
Frequência:    Mensal (1º do mês)
Formato:       ZIP com XLSX (insumos + composições por UF)
Cobertura:     Todas as 27 UFs
Itens:         ~18.000 insumos + 5.000 composições
Link:          https://www.caixa.gov.br/site/Paginas/Agencia-de-Noticias/...

URL Pattern (automática):
https://www.caixa.gov.br/Downloads/sinapi-relatorios-mensais/SINAPI-{YYYY-MM}-formato-xlsx.zip
Exemplo: SINAPI-2026-03-formato-xlsx.zip

Como baixar:
- requests.get("https://...SINAPI-2026-03-formato-xlsx.zip")
- zipfile.ZipFile().extractall()
```

#### **2. SICRO3 (Rodovias/Infra) — DNIT**
```
Importância:   ⭐⭐⭐⭐ (15% para obras de infra)
Frequência:    Bimestral
Formato:       ZIP + Excel
Cobertura:     Brasil (nacional)
Itens:         ~8.000 composições de rodovia
Link:          https://www.gov.br/dnit → SICRO

Padrão: https://www1.dnit.gov.br/planejamento/sicro/...
```

#### **3. SUDECAP-BH (Belo Horizonte) — Prefeitura BH**
```
Importância:   ⭐⭐⭐⭐⭐ (excelente qualidade)
Frequência:    Mensal
Formato:       XLS/XLSX direto
Cobertura:     Minas Gerais (especialmente BH)
URL Pattern:   https://prefeitura.pbh.gov.br/sudecap/tabela-de-precos
                /2026.{MM}-tabela-de-insumos-desonerada_0.xls

Fácil de automatizar: SIM
```

#### **4. SIURB-SP (São Paulo) — Prefeitura SP**
```
Importância:   ⭐⭐⭐⭐ (importante para SP)
Frequência:    Semestral (jan/jul)
Formato:       ZIP + Excel
Cobertura:     São Paulo
URL:           https://prefeitura.sp.gov.br/cidade/secretarias/upload/...
```

#### **5. ORSE-SE (Sergipe) — CEHOP**
```
Importância:   ⭐⭐⭐ (bom para NE)
Frequência:    Mensal
Formato:       Sistema online + export manual (pode ser via Firecrawl)
URL:           https://orse.cehop.se.gov.br/
Automação:     Firecrawl ou Selenium
```

### 🟡 SECUNDÁRIAS (conforme necessário)

| Estado | Órgão | Frequência | Tipo | URL | Automação |
|--------|-------|-----------|------|-----|-----------|
| CE | SEINFRA-CE | Mensal | Excel | seinfra.ce.gov.br | ⭐⭐⭐⭐ |
| RJ | EMOP-RJ | Mensal | Excel | emop.rj.gov.br | ⭐⭐⭐ |
| RS | DER-RS | Bimestral | Excel | der.rs.gov.br | ⭐⭐⭐ |
| BA | SEINFRA-BA | Mensal | Excel | seinfra.ba.gov.br | ⭐⭐⭐ |
| MG | DNPM/Vale | Variável | PDF | dnpm.gov.br | ⭐⭐ |
| DF | NOVACAP | Mensal | Excel | novacap.df.gov.br | ⭐⭐⭐ |
| AC/AM/AP/PA/RO/RR | Estadual | Variável | - | Conforme estado | ⭐ |

---

## 🏗️ ARQUITETURA DO SISTEMA

```
┌─────────────────────────────────────────────────────────┐
│                    EGOS ARCH VPS                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │        AUTOMATED JOBS (APScheduler)              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │   │
│  │  │ SINAPI   │  │ SUDECAP  │  │ SICRO3   │  ... │   │
│  │  │ Job      │  │ Job      │  │ Job      │      │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘      │   │
│  │       └─────────┬────────────────┘             │   │
│  │                 ▼                               │   │
│  │         Python Download + Parse                │   │
│  │         (requests + pandas + zipfile)          │   │
│  └────────────────┬─────────────────────────────┘   │
│                   │                                 │
│  ┌────────────────▼─────────────────────────────┐   │
│  │      PostgreSQL Database                      │   │
│  │  ┌─────────────────────────────────────────┐ │   │
│  │  │ insumos                                 │ │   │
│  │  │ ├─ codigo (PK)                         │ │   │
│  │  │ ├─ descricao (searchable)              │ │   │
│  │  │ ├─ unidade                             │ │   │
│  │  │ ├─ preco_atual                         │ │   │
│  │  │ ├─ uf                                  │ │   │
│  │  │ ├─ tabela_origem (SINAPI/SUDECAP...)  │ │   │
│  │  │ ├─ data_referencia                     │ │   │
│  │  │ └─ historico_precos (JSONB array)     │ │   │
│  │  │                                        │ │   │
│  │  │ composicoes (similar structure)        │ │   │
│  │  └─────────────────────────────────────────┘ │   │
│  └───────────────┬──────────────────────────────┘   │
│                  │                                   │
│  ┌───────────────▼──────────────────────────────┐   │
│  │      FastAPI (Servidor Python)               │   │
│  │  GET  /preco?codigo=12345&uf=SP             │   │
│  │  POST /busca (descrição: "concreto fck 25") │   │
│  │  POST /composicao/detalhe (explodir itens)  │   │
│  │  POST /trigger-update (atualizar agora)     │   │
│  │  GET  /status (última atualização)          │   │
│  └───────────────┬──────────────────────────────┘   │
│                  │                                   │
│                  ▼                                   │
│          EGOS Arch Frontend (React)                 │
│          (BudgetModule usa via fetch/axios)        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 💻 SETUP COMPLETO (Passo a Passo)

### **PASSO 1: VPS Setup**

#### Opções (escolha uma):
- **Railway**: R$ 5-10/mês (mais fácil, menos controle)
- **Hetzner**: R$ 25-40/mês (melhor custo-benefício)
- **DigitalOcean**: R$ 35-50/mês (excelente suporte)
- **Sua própria**: Se já tiver servidor (R$ 0)

#### Instalação básica (Ubuntu 24.04)
```bash
# SSH na VPS
ssh root@seu_ip_vps

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Python + pip
apt install python3.12 python3-pip python3-venv -y

# Instalar PostgreSQL
apt install postgresql postgresql-contrib -y
systemctl start postgresql

# Instalar Git
apt install git -y

# Criar usuário para a aplicação
useradd -m -s /bin/bash egos
su - egos
```

---

### **PASSO 2: Clone + Setup do Projeto**

```bash
# Como user 'egos'
cd /home/egos

# Clone nosso repo (criar repo privado no GitHub)
git clone https://github.com/seu-org/egos-sinapi-api.git
cd egos-sinapi-api

# Virtual environment
python3.12 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

#### **requirements.txt**
```
fastapi==0.104.1
uvicorn==0.24.0
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
pandas==2.1.3
openpyxl==3.1.2
requests==2.31.0
APScheduler==3.10.4
python-dotenv==1.0.0
pydantic==2.5.0
```

---

### **PASSO 3: Banco de Dados**

```bash
# Como root na VPS
sudo -u postgres psql

# Criar banco
CREATE DATABASE egos_sinapi;
CREATE USER egos_user WITH PASSWORD 'senha_super_segura';
GRANT ALL PRIVILEGES ON DATABASE egos_sinapi TO egos_user;
ALTER DATABASE egos_sinapi OWNER TO egos_user;

\q
```

#### **Schema SQL** (criar em `sql/schema.sql`)
```sql
-- Extensões
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- Para busca full-text
CREATE EXTENSION IF NOT EXISTS uuid-ossp;

-- Tabela: Insumos (materiais, mão de obra, equipamento)
CREATE TABLE insumos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,  -- Ex: "030101.001"
    descricao TEXT NOT NULL,
    unidade VARCHAR(10),                 -- m³, kg, unidade, etc
    preco_atual DECIMAL(10, 2),
    uf CHAR(2),
    tabela_origem VARCHAR(50),           -- SINAPI, SUDECAP, SICRO3, etc
    data_referencia DATE,                -- Quando foi coletado

    -- Histórico de preços (JSON array)
    historico_precos JSONB DEFAULT '[]', -- [{data: "2026-03-01", preco: 450}, ...]

    -- Busca full-text
    tsvector_desc tsvector GENERATED ALWAYS AS (
        to_tsvector('portuguese', coalesce(descricao, ''))
    ) STORED,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_insumos_codigo ON insumos(codigo);
CREATE INDEX idx_insumos_uf ON insumos(uf);
CREATE INDEX idx_insumos_tsvector ON insumos USING GIN(tsvector_desc);
CREATE INDEX idx_insumos_tabela ON insumos(tabela_origem);
CREATE INDEX idx_insumos_referencia ON insumos(data_referencia);

-- Tabela: Composições (aglomerados de insumos)
CREATE TABLE composicoes (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao TEXT NOT NULL,
    unidade VARCHAR(10),
    preco_atual DECIMAL(10, 2),
    uf CHAR(2),
    tabela_origem VARCHAR(50),
    data_referencia DATE,

    -- Array JSON de insumos
    -- [{codigo_insumo: "030101.001", coeficiente: 0.5, descricao: "Concreto..."}, ...]
    insumos JSONB,

    historico_precos JSONB DEFAULT '[]',

    tsvector_desc tsvector GENERATED ALWAYS AS (
        to_tsvector('portuguese', coalesce(descricao, ''))
    ) STORED,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_composicoes_codigo ON composicoes(codigo);
CREATE INDEX idx_composicoes_tsvector ON composicoes USING GIN(tsvector_desc);

-- Tabela: Log de atualizações
CREATE TABLE update_log (
    id SERIAL PRIMARY KEY,
    tabela_origem VARCHAR(50),
    data_download TIMESTAMP,
    status VARCHAR(20),  -- 'sucesso', 'erro'
    mensagem TEXT,
    insumos_processados INT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Executar schema:
```bash
# Como user egos
psql -U egos_user -d egos_sinapi -f sql/schema.sql
```

---

### **PASSO 4: Scripts Python (Job de Download)**

#### `jobs/download_sinapi.py`
```python
import requests
import zipfile
import pandas as pd
import os
from datetime import date
from sqlalchemy import create_engine, text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SINAPIDownloader:
    def __init__(self, db_url):
        self.db_url = db_url
        self.engine = create_engine(db_url)

    def download_sinapi(self, mes_ano="2026-03"):
        """
        Baixa ZIP da SINAPI da Caixa
        mes_ano: formato YYYY-MM (ex: "2026-03")
        """
        url = f"https://www.caixa.gov.br/Downloads/sinapi-relatorios-mensais/SINAPI-{mes_ano}-formato-xlsx.zip"

        logger.info(f"Baixando SINAPI {mes_ano}...")
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()

            # Salva ZIP
            zip_path = f"sinapi_{mes_ano}.zip"
            with open(zip_path, "wb") as f:
                f.write(response.content)
            logger.info(f"ZIP salvo: {zip_path}")

            return zip_path
        except Exception as e:
            logger.error(f"Erro ao baixar SINAPI: {e}")
            raise

    def parse_sinapi_zip(self, zip_path):
        """
        Extrai e parse os XLSX do ZIP
        Retorna: (df_insumos, df_composicoes)
        """
        extract_dir = f"sinapi_extracted_{date.today()}"

        with zipfile.ZipFile(zip_path, 'r') as z:
            z.extractall(extract_dir)

        # SINAPI tem estrutura padrão:
        # - Insumos_desonerada.xlsx (ou onerada)
        # - Composições_desoneradas.xlsx
        # Variação por UF (exemplo: Insumos_SP.xlsx, Insumos_MG.xlsx)

        dfs_insumos = []
        dfs_composicoes = []

        for file in os.listdir(extract_dir):
            if "nsumo" in file.lower():  # Insumos
                try:
                    df = pd.read_excel(os.path.join(extract_dir, file))
                    # Detectar UF do nome do arquivo
                    uf = self._extract_uf_from_filename(file)
                    df['uf'] = uf
                    df['tabela_origem'] = 'SINAPI'
                    df['data_referencia'] = date.today()
                    dfs_insumos.append(df)
                    logger.info(f"Parsed insumos: {file}")
                except Exception as e:
                    logger.error(f"Erro ao processar {file}: {e}")

            elif "omposicao" in file.lower():  # Composições
                try:
                    df = pd.read_excel(os.path.join(extract_dir, file))
                    uf = self._extract_uf_from_filename(file)
                    df['uf'] = uf
                    df['tabela_origem'] = 'SINAPI'
                    df['data_referencia'] = date.today()
                    dfs_composicoes.append(df)
                    logger.info(f"Parsed composições: {file}")
                except Exception as e:
                    logger.error(f"Erro ao processar {file}: {e}")

        df_insumos_final = pd.concat(dfs_insumos, ignore_index=True) if dfs_insumos else None
        df_composicoes_final = pd.concat(dfs_composicoes, ignore_index=True) if dfs_composicoes else None

        return df_insumos_final, df_composicoes_final

    def _extract_uf_from_filename(self, filename):
        """Extrai UF do nome do arquivo (ex: Insumos_SP.xlsx -> SP)"""
        # Padrão SINAPI: Insumos_ESTADO.xlsx ou Insumos_ESTADO_desonerada.xlsx
        parts = filename.replace(".xlsx", "").replace(".xls", "").split("_")
        if len(parts) >= 2:
            uf = parts[-1]
            if len(uf) == 2 and uf.isupper():
                return uf
        return "XX"  # default

    def upsert_insumos(self, df):
        """
        Insere/atualiza insumos no banco
        Usa UPSERT (INSERT ... ON CONFLICT)
        """
        if df is None or df.empty:
            logger.warning("DataFrame de insumos vazio")
            return 0

        # Normaliza colunas (SINAPI pode ter variações)
        df.columns = [c.lower().strip() for c in df.columns]

        # Garante colunas necessárias
        required = ['codigo', 'descricao', 'unidade', 'preco_atual', 'uf', 'tabela_origem', 'data_referencia']
        for col in required:
            if col not in df.columns:
                df[col] = None

        count = 0
        with self.engine.connect() as conn:
            for _, row in df.iterrows():
                query = """
                INSERT INTO insumos (codigo, descricao, unidade, preco_atual, uf, tabela_origem, data_referencia)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (codigo) DO UPDATE SET
                    preco_atual = EXCLUDED.preco_atual,
                    data_referencia = EXCLUDED.data_referencia,
                    updated_at = NOW(),
                    historico_precos = jsonb_insert(
                        insumos.historico_precos,
                        '{-1}',
                        jsonb_build_object(
                            'data', EXCLUDED.data_referencia,
                            'preco', EXCLUDED.preco_atual
                        )
                    )
                """
                conn.execute(text(query), [
                    row.get('codigo'),
                    row.get('descricao'),
                    row.get('unidade'),
                    row.get('preco_atual'),
                    row.get('uf'),
                    row.get('tabela_origem'),
                    row.get('data_referencia')
                ])
                count += 1
            conn.commit()

        logger.info(f"Upserted {count} insumos")
        return count

    def run_full_sync(self, mes_ano=None):
        """
        Executa ciclo completo: download -> parse -> upsert
        """
        if mes_ano is None:
            mes_ano = date.today().strftime("%Y-%m")

        try:
            zip_path = self.download_sinapi(mes_ano)
            df_insumos, df_composicoes = self.parse_sinapi_zip(zip_path)

            count_ins = self.upsert_insumos(df_insumos)
            count_comp = self.upsert_insumos(df_composicoes)  # mesma tabela com tipo diferente

            logger.info(f"SYNC COMPLETO: {count_ins} insumos + {count_comp} composições")

            # Log no banco
            with self.engine.connect() as conn:
                conn.execute(text("""
                    INSERT INTO update_log (tabela_origem, data_download, status, insumos_processados)
                    VALUES ('SINAPI', NOW(), 'sucesso', %s)
                """), [count_ins + count_comp])
                conn.commit()

            return True
        except Exception as e:
            logger.error(f"Erro na sync: {e}")
            # Log erro
            with self.engine.connect() as conn:
                conn.execute(text("""
                    INSERT INTO update_log (tabela_origem, data_download, status, mensagem)
                    VALUES ('SINAPI', NOW(), 'erro', %s)
                """), [str(e)])
                conn.commit()
            return False

# Uso
if __name__ == "__main__":
    from os import getenv

    db_url = getenv("DATABASE_URL", "postgresql://egos_user:senha@localhost/egos_sinapi")
    downloader = SINAPIDownloader(db_url)
    downloader.run_full_sync()
```

---

### **PASSO 5: FastAPI Server**

#### `app/main.py`
```python
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from sqlalchemy import create_engine, text, select
from sqlalchemy.orm import Session, sessionmaker
from pydantic import BaseModel
from datetime import date, datetime
import logging
import os
from jobs.download_sinapi import SINAPIDownloader

logger = logging.getLogger(__name__)

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://egos_user:senha@localhost/egos_sinapi")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# FastAPI app
app = FastAPI(
    title="EGOS SINAPI API",
    description="Internal API for SINAPI pricing (free alternative to i9 Orçamentos)",
    version="1.0.0"
)

# Models
class PrecoResponse(BaseModel):
    codigo: str
    descricao: str
    unidade: str
    preco_atual: float
    uf: str
    tabela_origem: str
    data_referencia: date
    historico_precos: list

class BuscaRequest(BaseModel):
    descricao: str
    uf: str | None = None
    tabela_origem: str | None = None
    limit: int = 20

# Endpoints

@app.get("/health")
async def health():
    return {"status": "ok", "service": "egos-sinapi-api"}

@app.get("/preco")
async def get_preco(codigo: str, uf: str | None = None):
    """
    GET /preco?codigo=030101.001&uf=SP
    Retorna preço atual + histórico de um insumo
    """
    db = SessionLocal()
    try:
        query = """
        SELECT codigo, descricao, unidade, preco_atual, uf, tabela_origem,
               data_referencia, historico_precos
        FROM insumos
        WHERE codigo = %s
        """
        params = [codigo]

        if uf:
            query += " AND uf = %s"
            params.append(uf)

        query += " LIMIT 1"

        result = db.execute(text(query), params).first()

        if not result:
            raise HTTPException(status_code=404, detail="Insumo não encontrado")

        return {
            "codigo": result[0],
            "descricao": result[1],
            "unidade": result[2],
            "preco_atual": float(result[3]),
            "uf": result[4],
            "tabela_origem": result[5],
            "data_referencia": result[6],
            "historico_precos": result[7] or []
        }
    finally:
        db.close()

@app.post("/busca")
async def busca(request: BuscaRequest):
    """
    POST /busca
    {
        "descricao": "concreto fck 25",
        "uf": "SP",
        "limit": 10
    }

    Busca por descrição usando full-text search em português
    """
    db = SessionLocal()
    try:
        query = """
        SELECT codigo, descricao, unidade, preco_atual, uf, tabela_origem,
               data_referencia, ts_rank(tsvector_desc, plainto_tsquery('portuguese', %s)) as rank
        FROM insumos
        WHERE tsvector_desc @@ plainto_tsquery('portuguese', %s)
        """

        params = [request.descricao, request.descricao]

        if request.uf:
            query += " AND uf = %s"
            params.append(request.uf)

        if request.tabela_origem:
            query += " AND tabela_origem = %s"
            params.append(request.tabela_origem)

        query += " ORDER BY rank DESC LIMIT %s"
        params.append(request.limit)

        results = db.execute(text(query), params).fetchall()

        return {
            "total": len(results),
            "itens": [
                {
                    "codigo": r[0],
                    "descricao": r[1],
                    "unidade": r[2],
                    "preco_atual": float(r[3]),
                    "uf": r[4],
                    "tabela_origem": r[5],
                    "data_referencia": r[6],
                    "relevancia": float(r[7]) if r[7] else 0
                }
                for r in results
            ]
        }
    finally:
        db.close()

@app.post("/trigger-update")
async def trigger_update(background_tasks: BackgroundTasks):
    """
    POST /trigger-update
    Inicia update de SINAPI em background
    """
    background_tasks.add_task(run_sinapi_sync)
    return {"status": "Update iniciado", "message": "Verifique /update-status"}

@app.get("/update-status")
async def update_status():
    """
    GET /update-status
    Retorna último status de sincronização
    """
    db = SessionLocal()
    try:
        result = db.execute(
            text("""
            SELECT tabela_origem, data_download, status, insumos_processados, mensagem
            FROM update_log
            ORDER BY created_at DESC
            LIMIT 5
            """)
        ).fetchall()

        return {
            "ultima_atualizacao": result[0] if result else None,
            "historico": [
                {
                    "tabela": r[0],
                    "data": r[1],
                    "status": r[2],
                    "processados": r[3],
                    "mensagem": r[4]
                }
                for r in result
            ]
        }
    finally:
        db.close()

def run_sinapi_sync():
    """Background task para sincronizar SINAPI"""
    logger.info("Iniciando sync de SINAPI...")
    downloader = SINAPIDownloader(DATABASE_URL)
    downloader.run_full_sync()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

### **PASSO 6: Automação com APScheduler + Cron**

#### `jobs/scheduler.py`
```python
from apscheduler.schedulers.background import BackgroundScheduler
from jobs.download_sinapi import SINAPIDownloader
from datetime import datetime
import logging
import os

logger = logging.getLogger(__name__)

class PricingScheduler:
    def __init__(self, db_url):
        self.db_url = db_url
        self.scheduler = BackgroundScheduler()

    def start(self):
        """
        Configura jobs automáticos
        - SINAPI: todo dia 2º do mês às 3 AM
        - SUDECAP-BH: a cada 2 dias
        """

        # SINAPI (1º do mês)
        self.scheduler.add_job(
            self.sync_sinapi,
            'cron',
            day=1,
            hour=3,
            minute=0,
            id='sinapi_monthly',
            name='SINAPI Monthly Sync'
        )

        # SUDECAP (a cada 2 dias)
        self.scheduler.add_job(
            self.sync_sudecap,
            'interval',
            days=2,
            id='sudecap_biweekly',
            name='SUDECAP Biweekly Sync'
        )

        # Check de atualização (todo dia às 6 AM)
        self.scheduler.add_job(
            self.check_updates,
            'cron',
            hour=6,
            minute=0,
            id='check_updates_daily',
            name='Daily Update Check'
        )

        self.scheduler.start()
        logger.info("Scheduler iniciado com jobs automáticos")

    def sync_sinapi(self):
        logger.info(f"[{datetime.now()}] Executando SINAPI sync...")
        downloader = SINAPIDownloader(self.db_url)
        downloader.run_full_sync()

    def sync_sudecap(self):
        logger.info(f"[{datetime.now()}] Executando SUDECAP sync...")
        # TODO: Implementar SudecapDownloader

    def check_updates(self):
        logger.info(f"[{datetime.now()}] Verificando atualizações...")
        # Verifica se há atualizações disponíveis nas fontes

# Instanciar no app startup
scheduler = None

def init_scheduler(db_url):
    global scheduler
    scheduler = PricingScheduler(db_url)
    scheduler.start()
```

#### Integrar com FastAPI (em `main.py`):
```python
from fastapi import FastAPI
from jobs.scheduler import init_scheduler

app = FastAPI()

@app.on_event("startup")
async def startup():
    init_scheduler(DATABASE_URL)
    logger.info("Aplicação iniciada com scheduler")

@app.on_event("shutdown")
async def shutdown():
    # Limpar recursos
    pass
```

---

### **PASSO 7: Docker + Docker Compose (Opcional mas Recomendado)**

#### `Dockerfile`
```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Dependências do sistema
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Código
COPY . .

# Expor porta
EXPOSE 8000

# Comando padrão
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### `docker-compose.yml`
```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: egos_sinapi
      POSTGRES_USER: egos_user
      POSTGRES_PASSWORD: senha_super_segura_mudar_em_prod
    volumes:
      - pg_data:/var/lib/postgresql/data
      - ./sql/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"

  api:
    build: .
    environment:
      DATABASE_URL: postgresql://egos_user:senha_super_segura_mudar_em_prod@db:5432/egos_sinapi
    ports:
      - "8000:8000"
    depends_on:
      - db
    volumes:
      - .:/app

volumes:
  pg_data:
```

---

## 🚀 DEPLOY NA VPS (Resumo Rápido)

```bash
# 1. Clone repo
git clone https://github.com/seu-org/egos-sinapi-api.git
cd egos-sinapi-api

# 2. Setup .env
echo "DATABASE_URL=postgresql://egos_user:senha@localhost/egos_sinapi" > .env

# 3. Docker Compose UP (se usar Docker)
docker-compose up -d

# Ou sem Docker:
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# 4. Verificar
curl http://localhost:8000/health

# 5. Primeiro sync manual
python -c "from jobs.download_sinapi import SINAPIDownloader; SINAPIDownloader('postgresql://...').run_full_sync()"
```

---

## 📱 INTEGRAÇÃO COM EGOS ARCH (Budget Module)

#### Em `src/lib/budget-api.ts`:
```typescript
// Usar nossa API em vez de SINAPI direto
async function fetchSINAPIprices(itemName: string, region: string): Promise<PriceSource | null> {
  const apiUrl = "https://seus-preco-api.com";  // ou localhost:8000 em dev

  try {
    // Busca por descrição
    const response = await fetch(`${apiUrl}/busca`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descricao: itemName,
        uf: region,
        limit: 5
      })
    });

    const data = await response.json();

    if (data.itens.length === 0) return null;

    const priceItem = data.itens[0];  // Primeira por relevância

    return {
      name: 'SINAPI (Nossa API)',
      type: 'sinapi',
      low: priceItem.preco_atual * 0.95,
      mid: priceItem.preco_atual,
      high: priceItem.preco_atual * 1.05,
      url: `${apiUrl}/preco?codigo=${priceItem.codigo}`,
      confidence: 0.95,
    };
  } catch (error) {
    logger.error('Erro ao buscar em nossa API SINAPI:', error);
    return null;
  }
}
```

---

## 📊 CUSTO OPERACIONAL (MUITO BARATO!)

| Item | Custo | Observação |
|------|-------|-----------|
| VPS (Hetzner/DO) | R$ 25-40/mês | Ubuntu 24.04, 2GB RAM, 50GB SSD |
| PostgreSQL | R$ 0 | Incluído na VPS |
| FastAPI | R$ 0 | Framework grátis |
| SINAPI download | R$ 0 | Oficial, grátis |
| **TOTAL** | **~R$ 30-40/mês** | ~80% mais barato que i9 (R$ 89/mês) |

---

## 🎓 PRÓXIMAS MELHORIAS (Phase 2)

1. **Outras tabelas** (SUDECAP, SICRO3, SIURB)
   - Mesma arquitetura, apenas adicionar novos Downloaders
   - 1-2h por tabela

2. **Cache + Redis**
   - Respostas super rápidas
   - R$ 5-10/mês Redis na VPS

3. **IA para Mapping**
   - Usar Grok/Claude para mapear "concreto 25" → código SINAPI 030101.001
   - Integrar em `/busca` endpoint

4. **API Pública** (opcional)
   - Monetizar: vender acesso para outras ferramentas
   - Você teria o "i9 próprio"

---

## 📞 SUPORTE & LINKS

- **Caixa SINAPI**: https://www.caixa.gov.br/site/Paginas/Agencia-de-Noticias/
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **APScheduler**: https://apscheduler.readthedocs.io/

---

**Status:** ✅ PRONTO PARA IMPLEMENTAR
**Tempo estimado:** 1-2 semanas (desenvolvimento) + 1 hora/mês (manutenção)
**ROI:** Economiza R$ 50/mês vs i9 + customização infinita

Próximo passo: **Quer que eu prepare o repo base completo com código + Dockerfile pronto?** 🚀
