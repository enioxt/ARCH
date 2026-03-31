"""
EGOS SINAPI API - Telemetry & Observability
Complete monitoring, metrics, and structured logging system
"""

import time
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import structlog
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
import psutil
import psycopg2

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# ============================================================================
# PROMETHEUS METRICS
# ============================================================================

# Request metrics
http_requests_total = Counter(
    'sinapi_http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

http_request_duration_seconds = Histogram(
    'sinapi_http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint']
)

# Database metrics
db_queries_total = Counter(
    'sinapi_db_queries_total',
    'Total database queries',
    ['query_type', 'status']
)

db_query_duration_seconds = Histogram(
    'sinapi_db_query_duration_seconds',
    'Database query latency',
    ['query_type']
)

db_connections_active = Gauge(
    'sinapi_db_connections_active',
    'Active database connections'
)

# SINAPI sync metrics
sinapi_sync_total = Counter(
    'sinapi_sync_total',
    'Total SINAPI sync jobs',
    ['status']
)

sinapi_sync_duration_seconds = Histogram(
    'sinapi_sync_duration_seconds',
    'SINAPI sync job duration'
)

sinapi_items_synced = Gauge(
    'sinapi_items_synced',
    'Total items in database'
)

# System metrics
system_cpu_percent = Gauge(
    'sinapi_system_cpu_percent',
    'CPU usage percentage'
)

system_memory_percent = Gauge(
    'sinapi_system_memory_percent',
    'Memory usage percentage'
)

system_disk_percent = Gauge(
    'sinapi_system_disk_percent',
    'Disk usage percentage'
)

# API usage metrics
api_search_requests = Counter(
    'sinapi_api_search_requests',
    'Total search requests',
    ['query_type']
)

api_price_lookups = Counter(
    'sinapi_api_price_lookups',
    'Total price lookup requests',
    ['found']
)


# ============================================================================
# TELEMETRY MIDDLEWARE
# ============================================================================

class TelemetryMiddleware(BaseHTTPMiddleware):
    """Middleware to collect request/response metrics and logs"""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Extract request info
        method = request.method
        path = request.url.path
        client_host = request.client.host if request.client else "unknown"

        # Log request
        logger.info(
            "request_started",
            method=method,
            path=path,
            client=client_host,
            headers=dict(request.headers)
        )

        # Process request
        try:
            response = await call_next(request)
            status_code = response.status_code

            # Calculate duration
            duration = time.time() - start_time

            # Record metrics
            http_requests_total.labels(
                method=method,
                endpoint=path,
                status=status_code
            ).inc()

            http_request_duration_seconds.labels(
                method=method,
                endpoint=path
            ).observe(duration)

            # Log response
            logger.info(
                "request_completed",
                method=method,
                path=path,
                status=status_code,
                duration_ms=round(duration * 1000, 2),
                client=client_host
            )

            return response

        except Exception as e:
            duration = time.time() - start_time

            # Record error metrics
            http_requests_total.labels(
                method=method,
                endpoint=path,
                status=500
            ).inc()

            # Log error
            logger.error(
                "request_failed",
                method=method,
                path=path,
                error=str(e),
                duration_ms=round(duration * 1000, 2),
                client=client_host,
                exc_info=True
            )

            raise


# ============================================================================
# SYSTEM METRICS COLLECTOR
# ============================================================================

def collect_system_metrics():
    """Collect system resource metrics"""
    try:
        # CPU
        cpu_percent = psutil.cpu_percent(interval=1)
        system_cpu_percent.set(cpu_percent)

        # Memory
        memory = psutil.virtual_memory()
        system_memory_percent.set(memory.percent)

        # Disk
        disk = psutil.disk_usage('/')
        system_disk_percent.set(disk.percent)

        logger.debug(
            "system_metrics_collected",
            cpu_percent=cpu_percent,
            memory_percent=memory.percent,
            disk_percent=disk.percent
        )

    except Exception as e:
        logger.error("system_metrics_collection_failed", error=str(e))


# ============================================================================
# DATABASE METRICS COLLECTOR
# ============================================================================

def collect_db_metrics(db_config: Dict[str, str]):
    """Collect database metrics"""
    try:
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()

        # Count active connections
        cursor.execute("""
            SELECT COUNT(*) FROM pg_stat_activity
            WHERE state = 'active' AND datname = %s
        """, (db_config['database'],))
        active_connections = cursor.fetchone()[0]
        db_connections_active.set(active_connections)

        # Count total items
        cursor.execute("SELECT COUNT(*) FROM insumos")
        total_items = cursor.fetchone()[0]
        sinapi_items_synced.set(total_items)

        cursor.close()
        conn.close()

        logger.debug(
            "db_metrics_collected",
            active_connections=active_connections,
            total_items=total_items
        )

    except Exception as e:
        logger.error("db_metrics_collection_failed", error=str(e))


# ============================================================================
# TELEMETRY HELPERS
# ============================================================================

def log_db_query(query_type: str, duration: float, status: str = "success", error: Optional[str] = None):
    """Log database query with metrics"""
    db_queries_total.labels(query_type=query_type, status=status).inc()
    db_query_duration_seconds.labels(query_type=query_type).observe(duration)

    if status == "success":
        logger.debug(
            "db_query_executed",
            query_type=query_type,
            duration_ms=round(duration * 1000, 2)
        )
    else:
        logger.error(
            "db_query_failed",
            query_type=query_type,
            duration_ms=round(duration * 1000, 2),
            error=error
        )


def log_search_request(query: str, result_count: int, duration: float):
    """Log search request with metrics"""
    api_search_requests.labels(query_type="full_text").inc()

    logger.info(
        "search_executed",
        query=query,
        result_count=result_count,
        duration_ms=round(duration * 1000, 2)
    )


def log_price_lookup(codigo: str, found: bool, duration: float):
    """Log price lookup with metrics"""
    api_price_lookups.labels(found=str(found).lower()).inc()

    logger.info(
        "price_lookup",
        codigo=codigo,
        found=found,
        duration_ms=round(duration * 1000, 2)
    )


def log_sync_job(status: str, duration: float, items_synced: int = 0, error: Optional[str] = None):
    """Log SINAPI sync job with metrics"""
    sinapi_sync_total.labels(status=status).inc()
    sinapi_sync_duration_seconds.observe(duration)

    if status == "success":
        logger.info(
            "sync_job_completed",
            status=status,
            duration_minutes=round(duration / 60, 2),
            items_synced=items_synced
        )
    else:
        logger.error(
            "sync_job_failed",
            status=status,
            duration_minutes=round(duration / 60, 2),
            error=error
        )


# ============================================================================
# METRICS ENDPOINT
# ============================================================================

def get_prometheus_metrics() -> str:
    """Generate Prometheus metrics in text format"""
    # Update system metrics before exporting
    collect_system_metrics()

    return generate_latest()


# ============================================================================
# HEALTH CHECK WITH DETAILED STATUS
# ============================================================================

def get_detailed_health_status(db_config: Dict[str, str]) -> Dict[str, Any]:
    """Get detailed health status with all metrics"""
    try:
        # Database check
        db_healthy = False
        db_items_count = 0
        try:
            conn = psycopg2.connect(**db_config)
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM insumos")
            db_items_count = cursor.fetchone()[0]
            cursor.close()
            conn.close()
            db_healthy = True
        except Exception as e:
            logger.error("health_check_db_failed", error=str(e))

        # System metrics
        cpu_percent = psutil.cpu_percent(interval=0.5)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')

        return {
            "status": "healthy" if db_healthy else "degraded",
            "timestamp": datetime.utcnow().isoformat(),
            "components": {
                "database": {
                    "status": "ok" if db_healthy else "error",
                    "items_count": db_items_count,
                },
                "scheduler": {
                    "status": "running",
                },
                "system": {
                    "cpu_percent": round(cpu_percent, 2),
                    "memory_percent": round(memory.percent, 2),
                    "disk_percent": round(disk.percent, 2),
                }
            },
            "metrics_endpoint": "/metrics",
            "admin_dashboard": "/admin"
        }

    except Exception as e:
        logger.error("health_check_failed", error=str(e))
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        }
