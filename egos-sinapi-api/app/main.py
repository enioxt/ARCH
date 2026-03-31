"""
EGOS SINAPI API - FastAPI application
Internal pricing API for SINAPI, SUDECAP, SICRO3, and other Brazilian price tables
"""

import logging
import os
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.responses import JSONResponse, Response, HTMLResponse
import psycopg2
import psycopg2.extras

from .models import (
    BuscaRequest,
    BuscaResponse,
    InsumoResponse,
    PrecoRequest,
    PrecoResponse,
    UpdateStatus,
    UpdateTriggerRequest,
    UpdateTriggerResponse,
    HealthResponse,
    ErrorResponse,
)

# Import telemetry (dual: Prometheus + SSOT)
from .telemetry import (
    TelemetryMiddleware,
    get_prometheus_metrics,
    get_detailed_health_status,
    log_search_request as log_search_prometheus,
    log_price_lookup as log_price_prometheus,
    logger as telemetry_logger,
)
from .telemetry_ssot import (
    log_search_request as log_search_ssot,
    log_price_lookup as log_price_ssot,
    log_http_request as log_http_ssot,
)
from prometheus_client import CONTENT_TYPE_LATEST

# Import scheduler
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from jobs.scheduler import get_scheduler, start_scheduler, stop_scheduler

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


# Database connection management
def get_db_connection():
    """Get database connection"""
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "egos_sinapi"),
            user=os.getenv("DB_USER", "sinapi_user"),
            password=os.getenv("DB_PASS", "sinapi_pass"),
        )
        return conn
    except psycopg2.Error as e:
        logger.error(f"Database connection error: {e}")
        raise


def check_database():
    """Check if database is accessible"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Database check failed: {e}")
        return False


# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage app startup and shutdown"""
    # Startup
    logger.info("Starting SINAPI API...")

    # Check database
    db_ok = check_database()
    if not db_ok:
        logger.warning("Database check failed, but continuing startup...")

    # Start scheduler
    try:
        start_scheduler()
        logger.info("Scheduler started")
    except Exception as e:
        logger.error(f"Scheduler startup failed: {e}")

    yield

    # Shutdown
    logger.info("Shutting down SINAPI API...")
    try:
        stop_scheduler()
        logger.info("Scheduler stopped")
    except Exception as e:
        logger.error(f"Scheduler shutdown error: {e}")


# Create FastAPI app
app = FastAPI(
    title="EGOS SINAPI API",
    description="Internal API for Brazilian construction price tables (SINAPI, SUDECAP, SICRO3, etc)",
    version="1.0.0",
    lifespan=lifespan,
)

# Add telemetry middleware
app.add_middleware(TelemetryMiddleware)


# ============================================================================
# ENDPOINTS
# ============================================================================


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    db_ok = check_database()
    scheduler = get_scheduler()
    scheduler_status = "running" if scheduler.scheduler.running else "stopped"

    messages = []
    if not db_ok:
        messages.append("⚠️ Database connection failed")

    status = "healthy" if db_ok else "degraded"

    return HealthResponse(
        status=status,
        timestamp=datetime.now(),
        database="ok" if db_ok else "error",
        scheduler=scheduler_status,
        last_sync=scheduler.last_sync_time,
        messages=messages,
    )


@app.get("/preco", response_model=PrecoResponse)
async def get_preco(
    codigo: str = Query(..., description="Código do insumo (ex: 030101.001)"),
    uf: str = Query(None, description="Filtrar por UF (SP, MG, etc), padrão: BR nacional"),
):
    """
    Get price for specific insumo by code

    Example: /preco?codigo=030101.001&uf=SP
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Build query
        query = "SELECT * FROM insumos WHERE codigo = %s"
        params = [codigo]

        if uf:
            query += " AND (uf = %s OR uf = 'BR')"
            params.append(uf)

        cursor.execute(query, params)
        row = cursor.fetchone()
        cursor.close()
        conn.close()

        if not row:
            raise HTTPException(
                status_code=404,
                detail=f"Insumo {codigo} not found",
            )

        # Log price lookup with telemetry (dual: Prometheus + SSOT)
        import time
        start_lookup = time.time()
        duration = time.time() - start_lookup

        log_price_prometheus(codigo, found=True, duration=duration)  # Prometheus metrics
        log_price_ssot(codigo, found=True, duration=duration, uf=uf)  # SSOT JSON (duration in seconds)

        return PrecoResponse(
            codigo=row["codigo"],
            descricao=row["descricao"],
            unidade=row["unidade"],
            preco_atual=float(row["preco_atual"]),
            uf=row["uf"],
            tabela_origem=row["tabela_origem"],
            data_referencia=row["data_referencia"],
            historico_precos=row["historico_precos"],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching price: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/busca", response_model=BuscaResponse)
async def busca_insumos(request: BuscaRequest):
    """
    Full-text search for insumos in Portuguese

    Example:
    {
        "query": "concreto fck 30",
        "uf": "SP",
        "limit": 20,
        "offset": 0
    }
    """
    try:
        import time

        start_time = time.time()

        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Build full-text search query
        query = """
            SELECT *, ts_rank(tsvector_desc, plainto_tsquery('portuguese', %s)) AS rank
            FROM insumos
            WHERE tsvector_desc @@ plainto_tsquery('portuguese', %s)
        """
        params = [request.query, request.query]

        # Add UF filter if provided
        if request.uf:
            query += " AND (uf = %s OR uf = 'BR')"
            params.append(request.uf)

        # Add ordering and pagination
        query += " ORDER BY rank DESC LIMIT %s OFFSET %s"
        params.extend([request.limit, request.offset])

        # Execute search
        cursor.execute(query, params)
        rows = cursor.fetchall()

        # Get total count
        count_query = "SELECT COUNT(*) FROM insumos WHERE tsvector_desc @@ plainto_tsquery('portuguese', %s)"
        count_params = [request.query]

        if request.uf:
            count_query += " AND (uf = %s OR uf = 'BR')"
            count_params.append(request.uf)

        cursor.execute(count_query, count_params)
        total = cursor.fetchone()["count"]

        cursor.close()
        conn.close()

        took_ms = (time.time() - start_time) * 1000

        # Log search request with telemetry (dual: Prometheus + SSOT)
        log_search_prometheus(request.query, len(rows), (time.time() - start_time))  # Prometheus
        log_search_ssot(request.query, len(rows), took_ms, request.uf)  # SSOT JSON

        results = [
            InsumoResponse(
                id=row["id"],
                codigo=row["codigo"],
                descricao=row["descricao"],
                unidade=row["unidade"],
                preco_atual=float(row["preco_atual"]),
                uf=row["uf"],
                tabela_origem=row["tabela_origem"],
                data_referencia=row["data_referencia"],
                historico_precos=row["historico_precos"],
                created_at=row["created_at"],
                updated_at=row["updated_at"],
            )
            for row in rows
        ]

        return BuscaResponse(
            total=total,
            results=results,
            query=request.query,
            took_ms=took_ms,
        )

    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/update-status", response_model=UpdateStatus)
async def get_update_status():
    """Get status of last SINAPI update"""
    scheduler = get_scheduler()

    return UpdateStatus(
        status=scheduler.last_sync_status or "pending",
        last_sync_time=scheduler.last_sync_time,
        last_sync_status=scheduler.last_sync_status,
        last_error=None,  # Could be expanded to store error messages
        mes_ano=scheduler.last_sync_time.strftime("%m/%Y") if scheduler.last_sync_time else None,
    )


@app.post("/trigger-update", response_model=UpdateTriggerResponse)
async def trigger_update(request: UpdateTriggerRequest = None):
    """
    Manually trigger SINAPI update job

    Optional:
        mes: Month (1-12), defaults to current
        ano: Year (2024, 2025, etc), defaults to current
        force: Force sync even if recent sync exists
    """
    try:
        scheduler = get_scheduler()

        # Check if job already running
        running_jobs = [job for job in scheduler.scheduler.get_jobs() if job.name == "Manual Sync"]
        if running_jobs and not (request and request.force):
            return UpdateTriggerResponse(
                status="running",
                message="Sync already in progress",
                next_check_in_seconds=30,
            )

        # Queue background job
        from apscheduler.triggers.date import DateTrigger
        from datetime import datetime

        scheduler.scheduler.add_job(
            scheduler.sync_sinapi_job,
            DateTrigger(run_date=datetime.now()),
            id=f"manual_sync_{datetime.now().timestamp()}",
            name="Manual Sync",
        )

        return UpdateTriggerResponse(
            status="queued",
            message="Sync job queued, will start within 30 seconds",
            next_check_in_seconds=30,
        )

    except Exception as e:
        logger.error(f"Manual update trigger error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(content=get_prometheus_metrics(), media_type=CONTENT_TYPE_LATEST)


@app.get("/admin", response_class=HTMLResponse)
async def admin_dashboard():
    """Admin dashboard with real-time metrics"""
    # Get database config for health check
    db_config = {
        "host": os.getenv("DB_HOST", "localhost"),
        "database": os.getenv("DB_NAME", "egos_sinapi"),
        "user": os.getenv("DB_USER", "sinapi_user"),
        "password": os.getenv("DB_PASS", "sinapi_pass"),
    }

    health_status = get_detailed_health_status(db_config)

    html_content = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EGOS SINAPI API - Admin Dashboard</title>
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                background: #0f172a;
                color: #e2e8f0;
                padding: 2rem;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 2rem;
                border-radius: 1rem;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
            }}
            h1 {{ font-size: 2rem; margin-bottom: 0.5rem; }}
            .subtitle {{ opacity: 0.9; }}
            .container {{ max-width: 1400px; margin: 0 auto; }}
            .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }}
            .card {{
                background: #1e293b;
                border-radius: 0.75rem;
                padding: 1.5rem;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                border: 1px solid #334155;
            }}
            .card h2 {{ font-size: 1.25rem; margin-bottom: 1rem; color: #94a3b8; }}
            .metric {{ display: flex; justify-content: space-between; margin-bottom: 0.75rem; padding: 0.5rem; background: #0f172a; border-radius: 0.5rem; }}
            .metric-label {{ color: #94a3b8; }}
            .metric-value {{ font-weight: bold; color: #e2e8f0; }}
            .status-badge {{
                display: inline-block;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.875rem;
                font-weight: 600;
            }}
            .status-healthy {{ background: #10b981; color: #fff; }}
            .status-degraded {{ background: #f59e0b; color: #fff; }}
            .status-error {{ background: #ef4444; color: #fff; }}
            .status-ok {{ background: #10b981; color: #fff; }}
            .status-running {{ background: #3b82f6; color: #fff; }}
            .progress-bar {{
                width: 100%;
                height: 8px;
                background: #334155;
                border-radius: 4px;
                overflow: hidden;
                margin-top: 0.5rem;
            }}
            .progress-fill {{
                height: 100%;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                transition: width 0.3s ease;
            }}
            .endpoint-list {{
                list-style: none;
                padding: 0;
            }}
            .endpoint-item {{
                background: #0f172a;
                padding: 0.75rem;
                margin-bottom: 0.5rem;
                border-radius: 0.5rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }}
            .method {{
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.75rem;
                font-weight: bold;
            }}
            .method-get {{ background: #10b981; color: #fff; }}
            .method-post {{ background: #3b82f6; color: #fff; }}
            .refresh-btn {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 600;
                margin-top: 1rem;
                transition: transform 0.2s;
            }}
            .refresh-btn:hover {{ transform: translateY(-2px); }}
            .timestamp {{ text-align: center; color: #64748b; margin-top: 2rem; font-size: 0.875rem; }}
        </style>
        <script>
            function refreshMetrics() {{
                location.reload();
            }}
            // Auto-refresh every 30 seconds
            setTimeout(refreshMetrics, 30000);
        </script>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎛️ EGOS SINAPI API - Admin Dashboard</h1>
                <p class="subtitle">Observabilidade e Transparência Radical</p>
            </div>

            <div class="grid">
                <!-- System Status -->
                <div class="card">
                    <h2>📊 Status Geral</h2>
                    <div class="metric">
                        <span class="metric-label">Status:</span>
                        <span class="status-badge status-{health_status['status']}">
                            {health_status['status'].upper()}
                        </span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Timestamp:</span>
                        <span class="metric-value">{health_status['timestamp']}</span>
                    </div>
                </div>

                <!-- Database Status -->
                <div class="card">
                    <h2>🗄️ Banco de Dados</h2>
                    <div class="metric">
                        <span class="metric-label">Status:</span>
                        <span class="status-badge status-{health_status['components']['database']['status']}">
                            {health_status['components']['database']['status'].upper()}
                        </span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Insumos:</span>
                        <span class="metric-value">{health_status['components']['database']['items_count']:,}</span>
                    </div>
                </div>

                <!-- Scheduler Status -->
                <div class="card">
                    <h2>⏱️ Scheduler</h2>
                    <div class="metric">
                        <span class="metric-label">Status:</span>
                        <span class="status-badge status-{health_status['components']['scheduler']['status']}">
                            {health_status['components']['scheduler']['status'].upper()}
                        </span>
                    </div>
                </div>
            </div>

            <div class="grid">
                <!-- System Resources -->
                <div class="card">
                    <h2>💻 Recursos do Sistema</h2>
                    <div class="metric">
                        <span class="metric-label">CPU:</span>
                        <span class="metric-value">{health_status['components']['system']['cpu_percent']}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {health_status['components']['system']['cpu_percent']}%"></div>
                    </div>

                    <div class="metric" style="margin-top: 1rem;">
                        <span class="metric-label">Memória:</span>
                        <span class="metric-value">{health_status['components']['system']['memory_percent']}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {health_status['components']['system']['memory_percent']}%"></div>
                    </div>

                    <div class="metric" style="margin-top: 1rem;">
                        <span class="metric-label">Disco:</span>
                        <span class="metric-value">{health_status['components']['system']['disk_percent']}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {health_status['components']['system']['disk_percent']}%"></div>
                    </div>
                </div>

                <!-- API Endpoints -->
                <div class="card">
                    <h2>🔌 Endpoints Disponíveis</h2>
                    <ul class="endpoint-list">
                        <li class="endpoint-item">
                            <span><span class="method method-get">GET</span> /health</span>
                        </li>
                        <li class="endpoint-item">
                            <span><span class="method method-get">GET</span> /preco</span>
                        </li>
                        <li class="endpoint-item">
                            <span><span class="method method-post">POST</span> /busca</span>
                        </li>
                        <li class="endpoint-item">
                            <span><span class="method method-get">GET</span> /update-status</span>
                        </li>
                        <li class="endpoint-item">
                            <span><span class="method method-post">POST</span> /trigger-update</span>
                        </li>
                        <li class="endpoint-item">
                            <span><span class="method method-get">GET</span> /metrics</span>
                        </li>
                    </ul>
                </div>

                <!-- Quick Links -->
                <div class="card">
                    <h2>🔗 Links Rápidos</h2>
                    <div class="metric">
                        <span class="metric-label">Métricas Prometheus:</span>
                        <a href="{health_status['metrics_endpoint']}" style="color: #60a5fa;">/metrics</a>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Documentação API:</span>
                        <a href="/docs" style="color: #60a5fa;">/docs</a>
                    </div>
                    <div class="metric">
                        <span class="metric-label">ReDoc:</span>
                        <a href="/redoc" style="color: #60a5fa;">/redoc</a>
                    </div>
                </div>
            </div>

            <center>
                <button class="refresh-btn" onclick="refreshMetrics()">🔄 Atualizar Métricas</button>
            </center>

            <p class="timestamp">
                Última atualização: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}<br>
                Auto-refresh em 30 segundos
            </p>
        </div>
    </body>
    </html>
    """

    return html_content


@app.get("/")
async def root():
    """Root endpoint - API info"""
    return {
        "name": "EGOS SINAPI API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "GET /health": "Health check",
            "GET /preco?codigo=...&uf=...": "Get price by code",
            "POST /busca": "Full-text search",
            "GET /update-status": "Get last sync status",
            "POST /trigger-update": "Manually trigger sync",
            "GET /metrics": "Prometheus metrics",
            "GET /admin": "Admin dashboard",
        },
        "docs": "/docs",
    }


# Error handling
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "timestamp": datetime.now().isoformat(),
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
