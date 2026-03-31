"""
Pydantic models for SINAPI API
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class InsumoBase(BaseModel):
    """Base model for insumo (input/material)"""
    codigo: str = Field(..., description="Código único do insumo (ex: 030101.001)")
    descricao: str = Field(..., description="Descrição do insumo")
    unidade: str = Field(..., description="Unidade de medida (m, m2, kg, etc)")
    preco_atual: float = Field(..., description="Preço atual em R$")


class InsumoResponse(InsumoBase):
    """Response model with additional metadata"""
    id: int
    uf: str = Field(..., description="Estado (UF) ou BR para nacional")
    tabela_origem: str = Field(..., description="Tabela de origem (SINAPI, SUDECAP, etc)")
    data_referencia: datetime = Field(..., description="Data de referência do preço")
    historico_precos: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Histórico de preços: [{data: '2026-03-31', preco: 450}, ...]"
    )
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BuscaRequest(BaseModel):
    """Request model for full-text search"""
    query: str = Field(..., min_length=1, max_length=200)
    uf: Optional[str] = Field(None, description="Filtrar por estado (SP, MG, RJ, etc)")
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)


class BuscaResponse(BaseModel):
    """Response model for search results"""
    total: int
    results: List[InsumoResponse]
    query: str
    took_ms: float


class PrecoRequest(BaseModel):
    """Request model for price lookup"""
    codigo: str = Field(..., description="Código do insumo")
    uf: Optional[str] = Field(None, description="Filtrar por UF")


class PrecoResponse(BaseModel):
    """Response model for single price lookup"""
    codigo: str
    descricao: str
    unidade: str
    preco_atual: float
    uf: str
    tabela_origem: str
    data_referencia: datetime
    historico_precos: List[Dict[str, Any]]


class UpdateStatus(BaseModel):
    """Status of last update"""
    status: str = Field(..., description="success, failed, running, pending")
    last_sync_time: Optional[datetime]
    last_sync_status: Optional[str]
    last_error: Optional[str]
    mes_ano: Optional[str] = Field(None, description="Month/year of last sync (MM/YYYY)")


class UpdateTriggerRequest(BaseModel):
    """Request to manually trigger update"""
    mes: Optional[int] = Field(None, description="Month (1-12), defaults to current")
    ano: Optional[int] = Field(None, description="Year (2024, 2025...), defaults to current")
    force: bool = Field(default=False, description="Force sync even if recent sync exists")


class UpdateTriggerResponse(BaseModel):
    """Response from update trigger"""
    status: str = Field(..., description="queued, running, scheduled")
    message: str
    next_check_in_seconds: Optional[int]


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="healthy, degraded, unhealthy")
    timestamp: datetime
    database: str = Field(..., description="ok, error, checking")
    scheduler: str = Field(..., description="running, stopped, error")
    last_sync: Optional[datetime]
    messages: List[str] = Field(default_factory=list)


class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str
    detail: Optional[str]
    timestamp: datetime
