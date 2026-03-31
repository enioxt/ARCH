"""
EGOS SINAPI API - Telemetria compatível com SSOT
Implementa o schema TelemetryEventBase do EGOS em Python
"""

import json
import time
import hashlib
from datetime import datetime
from typing import Dict, Any, Optional, Literal
from dataclasses import dataclass, asdict, field

# ===========================================================================
# SSOT Base Schema (from /home/enio/egos/docs/TELEMETRY_SSOT.md)
# ===========================================================================

EventType = Literal[
    "api_call",
    "db_query",
    "sync_job",
    "price_lookup",
    "search_request",
    "health_check",
    "error",
    "custom"
]


@dataclass
class TelemetryEventBase:
    """
    Base telemetry event following EGOS SSOT schema.
    All repos must extend this base.
    """
    # Core
    event_type: EventType
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")

    # Costs & Performance
    tokens_in: Optional[int] = None
    tokens_out: Optional[int] = None
    cost_usd: Optional[float] = None
    duration_ms: Optional[float] = None

    # AI Model (N/A for SINAPI, but kept for SSOT compliance)
    model_id: Optional[str] = None
    provider: Optional[str] = None

    # Context
    client_ip_hash: Optional[str] = None
    request_id: Optional[str] = None
    user_id: Optional[str] = None

    # Results
    status_code: Optional[int] = None
    error_message: Optional[str] = None

    # Extension (SINAPI-specific data goes here)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SINAPITelemetryEvent(TelemetryEventBase):
    """
    SINAPI-specific extension of base telemetry.

    Event Types:
    - api_call: HTTP request received
    - db_query: Database operation
    - sync_job: SINAPI data synchronization
    - price_lookup: Price query by code
    - search_request: Full-text search
    - health_check: Health monitoring
    - error: Any error occurred
    """

    def __post_init__(self):
        """Add SINAPI-specific metadata defaults"""
        if 'service' not in self.metadata:
            self.metadata['service'] = 'sinapi-api'
        if 'version' not in self.metadata:
            self.metadata['version'] = '1.0.0'


# ===========================================================================
# Telemetry Recorder (SSOT-compliant)
# ===========================================================================

class SINAPITelemetryRecorder:
    """
    Telemetry recorder following EGOS SSOT pattern.

    Features:
    - Dual output: JSON console logs (Docker-friendly) + Prometheus
    - Privacy-safe: IP hashing
    - SSOT-compliant schema
    - Optional Supabase persistence (future)
    """

    def __init__(
        self,
        log_prefix: str = "sinapi",
        enable_supabase: bool = False,
        supabase_table: Optional[str] = "sinapi_events"
    ):
        self.log_prefix = log_prefix
        self.enable_supabase = enable_supabase
        self.supabase_table = supabase_table

    def hash_ip(self, ip: str) -> str:
        """Hash IP address for privacy (SSOT requirement)"""
        return hashlib.sha256(ip.encode()).hexdigest()[:16]

    def record_event(self, event: SINAPITelemetryEvent) -> None:
        """
        Record telemetry event following SSOT pattern.

        Output:
        1. JSON console log (parseable by Docker/ELK/Datadog)
        2. Prometheus metrics (kept for compatibility)
        3. Supabase (optional, future implementation)
        """
        # Convert to dict and clean None values
        event_dict = asdict(event)
        clean_dict = {k: v for k, v in event_dict.items() if v is not None}

        # SSOT-compliant JSON log output
        log_line = json.dumps({
            "logPrefix": self.log_prefix,
            **clean_dict
        })

        print(f"[{self.log_prefix}-telemetry] {log_line}")

        # TODO: Supabase persistence (Phase 2)
        # if self.enable_supabase:
        #     await supabase.from(self.supabase_table).insert(clean_dict)

    def record_http_request(
        self,
        method: str,
        path: str,
        status_code: int,
        duration_ms: float,
        client_ip: Optional[str] = None,
        request_id: Optional[str] = None,
        error: Optional[str] = None
    ) -> None:
        """Record HTTP API call"""
        event = SINAPITelemetryEvent(
            event_type="api_call",
            status_code=status_code,
            duration_ms=duration_ms,
            client_ip_hash=self.hash_ip(client_ip) if client_ip else None,
            request_id=request_id,
            error_message=error,
            metadata={
                "service": "sinapi-api",
                "http_method": method,
                "http_path": path,
            }
        )
        self.record_event(event)

    def record_db_query(
        self,
        query_type: str,
        duration_ms: float,
        status: str = "success",
        error: Optional[str] = None
    ) -> None:
        """Record database query"""
        event = SINAPITelemetryEvent(
            event_type="db_query",
            duration_ms=duration_ms,
            status_code=200 if status == "success" else 500,
            error_message=error,
            metadata={
                "service": "sinapi-api",
                "query_type": query_type,
                "status": status,
            }
        )
        self.record_event(event)

    def record_price_lookup(
        self,
        codigo: str,
        found: bool,
        duration_ms: float,
        uf: Optional[str] = None
    ) -> None:
        """Record price lookup"""
        event = SINAPITelemetryEvent(
            event_type="price_lookup",
            duration_ms=duration_ms,
            status_code=200 if found else 404,
            metadata={
                "service": "sinapi-api",
                "codigo": codigo,
                "found": found,
                "uf": uf,
            }
        )
        self.record_event(event)

    def record_search_request(
        self,
        query: str,
        result_count: int,
        duration_ms: float,
        uf: Optional[str] = None
    ) -> None:
        """Record full-text search"""
        event = SINAPITelemetryEvent(
            event_type="search_request",
            duration_ms=duration_ms,
            status_code=200,
            metadata={
                "service": "sinapi-api",
                "query": query,
                "result_count": result_count,
                "uf": uf,
            }
        )
        self.record_event(event)

    def record_sync_job(
        self,
        status: str,
        duration_ms: float,
        items_synced: int = 0,
        error: Optional[str] = None
    ) -> None:
        """Record SINAPI sync job"""
        event = SINAPITelemetryEvent(
            event_type="sync_job",
            duration_ms=duration_ms,
            status_code=200 if status == "success" else 500,
            error_message=error,
            metadata={
                "service": "sinapi-api",
                "status": status,
                "items_synced": items_synced,
            }
        )
        self.record_event(event)

    def record_health_check(
        self,
        status: str,
        components: Dict[str, str],
        duration_ms: float
    ) -> None:
        """Record health check"""
        event = SINAPITelemetryEvent(
            event_type="health_check",
            duration_ms=duration_ms,
            status_code=200 if status == "healthy" else 503,
            metadata={
                "service": "sinapi-api",
                "status": status,
                "components": components,
            }
        )
        self.record_event(event)

    def record_error(
        self,
        error_type: str,
        error_message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> None:
        """Record error event"""
        event = SINAPITelemetryEvent(
            event_type="error",
            status_code=500,
            error_message=error_message,
            metadata={
                "service": "sinapi-api",
                "error_type": error_type,
                **(context or {})
            }
        )
        self.record_event(event)


# ===========================================================================
# Global Recorder Instance
# ===========================================================================

# Create singleton instance
ssot_telemetry = SINAPITelemetryRecorder(
    log_prefix="sinapi",
    enable_supabase=False  # TODO: Enable in Phase 2
)


# ===========================================================================
# Helper Functions (backward compatibility)
# ===========================================================================

def log_http_request(method: str, path: str, status: int, duration: float,
                     client_ip: Optional[str] = None, request_id: Optional[str] = None):
    """Helper for logging HTTP requests (SSOT-compliant)"""
    ssot_telemetry.record_http_request(method, path, status, duration, client_ip, request_id)


def log_db_query(query_type: str, duration: float, status: str = "success",
                error: Optional[str] = None):
    """Helper for logging DB queries (SSOT-compliant)"""
    ssot_telemetry.record_db_query(query_type, duration, status, error)


def log_price_lookup(codigo: str, found: bool, duration: float, uf: Optional[str] = None):
    """Helper for logging price lookups (SSOT-compliant)"""
    ssot_telemetry.record_price_lookup(codigo, found, duration, uf)


def log_search_request(query: str, result_count: int, duration: float, uf: Optional[str] = None):
    """Helper for logging search requests (SSOT-compliant)"""
    ssot_telemetry.record_search_request(query, result_count, duration, uf)


def log_sync_job(status: str, duration: float, items_synced: int = 0,
                error: Optional[str] = None):
    """Helper for logging sync jobs (SSOT-compliant)"""
    ssot_telemetry.record_sync_job(status, duration, items_synced, error)


def log_error(error_type: str, error_message: str, context: Optional[Dict[str, Any]] = None):
    """Helper for logging errors (SSOT-compliant)"""
    ssot_telemetry.record_error(error_type, error_message, context)


# ===========================================================================
# Migration Path (Prometheus → SSOT)
# ===========================================================================

def migrate_prometheus_to_ssot():
    """
    Migration strategy:

    1. Keep Prometheus metrics (they are complementary, not conflicting)
    2. Add SSOT JSON logging alongside
    3. Eventually: Phase out custom telemetry.py in favor of telemetry_ssot.py
    4. Supabase persistence optional (Phase 2)

    Usage in main.py:

    ```python
    # Old way (Prometheus only)
    from .telemetry import log_search_request

    # New way (SSOT + Prometheus)
    from .telemetry_ssot import log_search_request as log_search_ssot
    from .telemetry import log_search_request  # Keep for Prometheus

    # Call both
    log_search_ssot(query, count, duration)  # SSOT JSON
    log_search_request(query, count, duration)  # Prometheus metrics
    ```

    Future (Phase 2):
    - Remove old telemetry.py
    - Only use telemetry_ssot.py
    - Prometheus metrics exposed via /metrics (keep this)
    """
    pass
