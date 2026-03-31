/**
 * EGOS Arch - Database Schema
 * PostgreSQL schema for project persistence
 */

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(50), -- residential, commercial, industrial, etc

    -- Geometry
    area_m2 DECIMAL(10, 2),
    floors INTEGER DEFAULT 1,
    rooms INTEGER,

    -- Location
    region VARCHAR(10), -- MG, SP, RJ, etc
    city VARCHAR(100),

    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- draft, in_progress, completed, archived

    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100), -- User ID or email

    -- Full-text search
    tsvector_search tsvector GENERATED ALWAYS AS (
        to_tsvector('portuguese', coalesce(name, '') || ' ' || coalesce(description, ''))
    ) STORED
);

CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_search ON projects USING gin(tsvector_search);


-- ============================================================================
-- BUDGETS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Metadata
    version VARCHAR(20) NOT NULL, -- Semantic versioning: 1.0.0, 1.1.0, etc
    status VARCHAR(20) DEFAULT 'draft', -- draft, approved, locked, obsolete

    -- Configuration
    region VARCHAR(10), -- MG, SP, RJ, etc
    scenario_default VARCHAR(20) DEFAULT 'padrao', -- economico, padrao, premium

    -- Totals (cached for performance)
    total_low DECIMAL(15, 2) DEFAULT 0,
    total_mid DECIMAL(15, 2) DEFAULT 0,
    total_high DECIMAL(15, 2) DEFAULT 0,

    -- Methodology
    methodology JSONB DEFAULT '[]'::jsonb, -- Array of strings
    assumptions JSONB DEFAULT '{}'::jsonb, -- Key-value pairs
    alerts JSONB DEFAULT '[]'::jsonb, -- Array of alert strings

    -- Timestamps
    generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    locked_at TIMESTAMP, -- When budget was locked (immutable after this)

    CONSTRAINT unique_project_version UNIQUE (project_id, version)
);

CREATE INDEX idx_budgets_project_id ON budgets(project_id);
CREATE INDEX idx_budgets_version ON budgets(version);
CREATE INDEX idx_budgets_status ON budgets(status);
CREATE INDEX idx_budgets_updated_at ON budgets(updated_at DESC);


-- ============================================================================
-- BUDGET_ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,

    -- Classification
    category VARCHAR(50) NOT NULL, -- foundation, structure, finishing, etc
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Quantities
    quantity DECIMAL(10, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- m2, m3, kg, un, etc
    waste_factor DECIMAL(5, 3) DEFAULT 1.05, -- 5% waste
    regional_factor DECIMAL(5, 3) DEFAULT 1.0,
    complexity_factor DECIMAL(5, 3) DEFAULT 1.0,

    -- Scenario choice
    chosen_scenario VARCHAR(20) DEFAULT 'padrao', -- economico, padrao, premium

    -- Calculated totals (cached)
    total_low DECIMAL(15, 2) DEFAULT 0,
    total_mid DECIMAL(15, 2) DEFAULT 0,
    total_high DECIMAL(15, 2) DEFAULT 0,
    confidence_score DECIMAL(5, 3) DEFAULT 0, -- 0.0 to 1.0

    -- Additional data
    assumptions JSONB DEFAULT '[]'::jsonb, -- Array of strings
    last_updated TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Ordering
    display_order INTEGER DEFAULT 0
);

CREATE INDEX idx_budget_items_budget_id ON budget_items(budget_id);
CREATE INDEX idx_budget_items_category ON budget_items(category);
CREATE INDEX idx_budget_items_display_order ON budget_items(budget_id, display_order);


-- ============================================================================
-- PRICE_SOURCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS price_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_item_id UUID NOT NULL REFERENCES budget_items(id) ON DELETE CASCADE,

    -- Source info
    name VARCHAR(255) NOT NULL, -- "SINAPI (BR)", "Leroy Merlin", etc
    type VARCHAR(50) NOT NULL, -- sinapi, cub, orse, supplier, retail
    url TEXT,

    -- Pricing
    low DECIMAL(15, 2) NOT NULL,
    mid DECIMAL(15, 2) NOT NULL,
    high DECIMAL(15, 2) NOT NULL,
    confidence DECIMAL(5, 3) NOT NULL, -- 0.0 to 1.0

    -- Metadata
    fetched_at TIMESTAMP NOT NULL DEFAULT NOW(),
    data_age_days INTEGER, -- How old the source data is

    -- Additional context
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_price_sources_item_id ON price_sources(budget_item_id);
CREATE INDEX idx_price_sources_type ON price_sources(type);
CREATE INDEX idx_price_sources_fetched_at ON price_sources(fetched_at DESC);


-- ============================================================================
-- PRICE_POINTS TABLE (Historical tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS price_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_item_id UUID NOT NULL REFERENCES budget_items(id) ON DELETE CASCADE,

    -- Scenario
    scenario VARCHAR(20) NOT NULL, -- economico, padrao, premium

    -- Price
    price DECIMAL(15, 2) NOT NULL,
    source_id UUID REFERENCES price_sources(id) ON DELETE SET NULL,

    -- Timestamp
    recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_points_item_id ON price_points(budget_item_id);
CREATE INDEX idx_price_points_scenario ON price_points(scenario);
CREATE INDEX idx_price_points_recorded_at ON price_points(recorded_at DESC);


-- ============================================================================
-- BUDGET_AUDIT_LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS budget_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,

    -- Event
    event_type VARCHAR(50) NOT NULL, -- created, updated, locked, recalculated, etc
    event_description TEXT,

    -- Changes
    changes JSONB DEFAULT '{}'::jsonb, -- Diff of changes

    -- Actor
    actor VARCHAR(100), -- User ID or "system"

    -- Timestamp
    occurred_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_budget_id ON budget_audit_log(budget_id);
CREATE INDEX idx_audit_log_event_type ON budget_audit_log(event_type);
CREATE INDEX idx_audit_log_occurred_at ON budget_audit_log(occurred_at DESC);


-- ============================================================================
-- VIEWS
-- ============================================================================

-- Budget summary view with aggregated data
CREATE OR REPLACE VIEW budget_summary AS
SELECT
    b.id AS budget_id,
    b.project_id,
    p.name AS project_name,
    b.version,
    b.status,
    b.region,
    COUNT(DISTINCT bi.id) AS item_count,
    SUM(bi.total_mid) AS total_mid,
    AVG(bi.confidence_score) AS avg_confidence,
    b.updated_at
FROM budgets b
JOIN projects p ON b.project_id = p.id
LEFT JOIN budget_items bi ON b.id = bi.budget_id
GROUP BY b.id, p.name;


-- Latest budget per project view
CREATE OR REPLACE VIEW latest_budgets AS
SELECT DISTINCT ON (project_id)
    *
FROM budgets
ORDER BY project_id, updated_at DESC;


-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

-- Insert sample project
INSERT INTO projects (name, description, project_type, area_m2, floors, region, status)
VALUES (
    'Hexagonal House',
    'Modern hexagonal residence with sustainable design',
    'residential',
    200.00,
    2,
    'MG',
    'draft'
) ON CONFLICT DO NOTHING;
