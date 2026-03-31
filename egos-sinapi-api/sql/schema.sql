/**
 * EGOS SINAPI API - PostgreSQL Schema
 * Database for storing Brazilian construction price tables
 */

-- Create database (if needed)
-- CREATE DATABASE egos_sinapi;

-- Connect to database
-- \c egos_sinapi;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- INSUMOS TABLE (Materials/Inputs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS insumos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    unidade VARCHAR(10) NOT NULL,
    preco_atual DECIMAL(12, 2),
    uf CHAR(2) NOT NULL DEFAULT 'BR',  -- UF or 'BR' for national
    tabela_origem VARCHAR(50) NOT NULL,  -- SINAPI, SUDECAP, SICRO3, etc
    data_referencia DATE NOT NULL,

    -- Full price history: [{data: "2026-03-31", preco: 450.00}, ...]
    historico_precos JSONB DEFAULT '[]'::jsonb,

    -- Full-text search vector (Portuguese)
    tsvector_desc tsvector GENERATED ALWAYS AS (
        to_tsvector('portuguese', descricao || ' ' || codigo)
    ) STORED,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Indices
    CONSTRAINT valid_uf CHECK (uf ~ '^[A-Z]{2}|BR$'),
    CONSTRAINT valid_preco CHECK (preco_atual >= 0)
);

CREATE INDEX idx_insumos_codigo ON insumos(codigo);
CREATE INDEX idx_insumos_uf ON insumos(uf);
CREATE INDEX idx_insumos_tabela_origem ON insumos(tabela_origem);
CREATE INDEX idx_insumos_data_referencia ON insumos(data_referencia);
CREATE INDEX idx_insumos_tsvector ON insumos USING gin(tsvector_desc);
CREATE INDEX idx_insumos_historico ON insumos USING gin(historico_precos);

-- ============================================================================
-- COMPOSICOES TABLE (Compositions/Assemblies)
-- ============================================================================

CREATE TABLE IF NOT EXISTS composicoes (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    unidade VARCHAR(10) NOT NULL,
    uf CHAR(2) NOT NULL DEFAULT 'BR',
    tabela_origem VARCHAR(50) NOT NULL,
    data_referencia DATE NOT NULL,

    -- JSON array of insumos in this composition
    -- [{codigo: "030101.001", descricao: "Cimento...", quantidade: 350, unidade: "kg"}, ...]
    insumos JSONB DEFAULT '[]'::jsonb,

    -- Calculated total cost
    preco_total DECIMAL(12, 2),
    preco_unitario DECIMAL(12, 2),  -- per unit of composition

    tsvector_desc tsvector GENERATED ALWAYS AS (
        to_tsvector('portuguese', descricao || ' ' || codigo)
    ) STORED,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_uf CHECK (uf ~ '^[A-Z]{2}|BR$')
);

CREATE INDEX idx_composicoes_codigo ON composicoes(codigo);
CREATE INDEX idx_composicoes_uf ON composicoes(uf);
CREATE INDEX idx_composicoes_tsvector ON composicoes USING gin(tsvector_desc);
CREATE INDEX idx_composicoes_insumos ON composicoes USING gin(insumos);

-- ============================================================================
-- UPDATE_LOG TABLE (Sync audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS update_log (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) NOT NULL,  -- success, failed, running, partial
    tabela_origem VARCHAR(50) NOT NULL,
    mes INT,
    ano INT,

    -- Statistics
    insumos_inserted INT DEFAULT 0,
    insumos_updated INT DEFAULT 0,
    insumos_total INT DEFAULT 0,
    composicoes_inserted INT DEFAULT 0,
    composicoes_updated INT DEFAULT 0,

    -- Error tracking
    error_message TEXT,
    error_details JSONB,

    -- Timestamps
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    duration_seconds INT,

    CONSTRAINT valid_status CHECK (status IN ('success', 'failed', 'running', 'partial'))
);

CREATE INDEX idx_update_log_status ON update_log(status);
CREATE INDEX idx_update_log_tabela_origem ON update_log(tabela_origem);
CREATE INDEX idx_update_log_started_at ON update_log(started_at);

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_insumos_updated_at
    BEFORE UPDATE ON insumos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_composicoes_updated_at
    BEFORE UPDATE ON composicoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS (For convenience)
-- ============================================================================

-- Latest prices by UF
CREATE VIEW v_latest_precos AS
SELECT DISTINCT ON (codigo, uf)
    codigo,
    descricao,
    unidade,
    preco_atual,
    uf,
    tabela_origem,
    data_referencia,
    updated_at
FROM insumos
WHERE preco_atual IS NOT NULL
ORDER BY codigo, uf, data_referencia DESC;

-- Price history summary (simplified)
CREATE VIEW v_preco_history AS
SELECT
    codigo,
    uf,
    COUNT(*) as total_records,
    MAX(data_referencia) as last_update,
    MAX(preco_atual) as current_price
FROM insumos
WHERE historico_precos IS NOT NULL
GROUP BY codigo, uf;

-- ============================================================================
-- INITIAL ROLE SETUP (for production)
-- ============================================================================

-- Create read-only user for API access (optional)
-- CREATE ROLE sinapi_api WITH LOGIN PASSWORD 'secure_password';
-- GRANT CONNECT ON DATABASE egos_sinapi TO sinapi_api;
-- GRANT USAGE ON SCHEMA public TO sinapi_api;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO sinapi_api;

-- Admin user for data management
-- CREATE ROLE sinapi_admin WITH LOGIN PASSWORD 'admin_password';
-- GRANT ALL PRIVILEGES ON DATABASE egos_sinapi TO sinapi_admin;
