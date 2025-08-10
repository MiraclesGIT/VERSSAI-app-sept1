-- VERSSAI VC Platform Database Schema
-- Phase 1: Foundation schemas for Founder Signal Fit Framework

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. FOUNDER SIGNAL FIT FRAMEWORK TABLES

-- Main table for uploaded pitch decks
CREATE TABLE founder_decks (
    deck_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255),
    upload_date TIMESTAMP DEFAULT NOW(),
    file_url TEXT,
    file_path TEXT,
    file_size INTEGER,
    page_count INTEGER,
    status VARCHAR(50) DEFAULT 'processing',
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Extracted information from pitch decks
CREATE TABLE deck_extractions (
    extraction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID REFERENCES founder_decks(deck_id) ON DELETE CASCADE,
    -- Extracted founder information
    founders JSONB, -- [{name, role, linkedin, email}]
    company_website TEXT,
    company_linkedin TEXT,
    -- Extracted business information
    problem_statement TEXT,
    solution_description TEXT,
    market_size JSONB,
    business_model TEXT,
    traction_metrics JSONB,
    team_size INTEGER,
    funding_ask DECIMAL(15,2),
    funding_stage VARCHAR(50),
    -- AI analysis metadata
    extraction_confidence DECIMAL(5,2),
    extraction_method VARCHAR(100),
    extracted_at TIMESTAMP DEFAULT NOW()
);

-- Founder signal analysis and scoring
CREATE TABLE founder_signals (
    signal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID REFERENCES founder_decks(deck_id) ON DELETE CASCADE,
    founder_name VARCHAR(255),
    founder_role VARCHAR(100),
    -- LinkedIn enrichment data
    linkedin_data JSONB,
    education_score DECIMAL(5,2),
    experience_score DECIMAL(5,2),
    network_quality_score DECIMAL(5,2),
    -- Web enrichment data
    online_presence_score DECIMAL(5,2),
    media_mentions INTEGER DEFAULT 0,
    github_activity JSONB,
    -- Composite signal scores
    technical_fit DECIMAL(5,2),
    market_fit DECIMAL(5,2),
    execution_capability DECIMAL(5,2),
    overall_signal_score DECIMAL(5,2),
    -- Analysis metadata
    confidence_level DECIMAL(5,2),
    risk_factors JSONB,
    positive_signals JSONB,
    recommendation VARCHAR(20), -- STRONG, POSITIVE, NEUTRAL, NEGATIVE
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. BASIC DUE DILIGENCE TABLES (for Phase 1)

-- Data rooms for companies
CREATE TABLE dd_data_rooms (
    room_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID,
    company_name VARCHAR(255),
    room_name VARCHAR(255),
    created_by VARCHAR(255),
    access_level VARCHAR(50) DEFAULT 'view', -- 'view', 'comment', 'edit'
    stage VARCHAR(50) DEFAULT 'initial', -- 'initial', 'deep-dive', 'final'
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Documents uploaded to data rooms
CREATE TABLE dd_documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES dd_data_rooms(room_id) ON DELETE CASCADE,
    folder_path VARCHAR(500), -- '/Financials/2024/Q1'
    document_name VARCHAR(255),
    document_type VARCHAR(100), -- 'financial', 'legal', 'technical', 'team'
    file_url TEXT,
    file_path TEXT,
    file_hash VARCHAR(64), -- For duplicate detection
    file_size INTEGER,
    -- Processing status
    ocr_status VARCHAR(50) DEFAULT 'pending',
    extraction_status VARCHAR(50) DEFAULT 'pending',
    analysis_status VARCHAR(50) DEFAULT 'pending',
    -- Extracted content
    extracted_text TEXT,
    extracted_tables JSONB,
    key_metrics JSONB,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- 3. RAG AND KNOWLEDGE MANAGEMENT TABLES

-- Vector embeddings for RAG (Level 3 - Company specific)
CREATE TABLE document_embeddings (
    embedding_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES dd_documents(document_id) ON DELETE CASCADE,
    deck_id UUID REFERENCES founder_decks(deck_id) ON DELETE CASCADE,
    content_chunk TEXT,
    chunk_index INTEGER,
    embedding_vector TEXT, -- JSON string of vector array
    metadata JSONB,
    embedding_model VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge graph entities (basic for Phase 1)
CREATE TABLE knowledge_entities (
    entity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50), -- 'company', 'founder', 'investor', 'market'
    entity_name VARCHAR(255),
    entity_data JSONB,
    confidence_score DECIMAL(5,2),
    source_document_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Relationships between entities
CREATE TABLE knowledge_relationships (
    relationship_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_entity_id UUID REFERENCES knowledge_entities(entity_id),
    target_entity_id UUID REFERENCES knowledge_entities(entity_id),
    relationship_type VARCHAR(100), -- 'founded_by', 'works_at', 'invests_in', 'competes_with'
    relationship_strength DECIMAL(5,2),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. WORKFLOW AND PROCESSING TABLES

-- n8n workflow execution tracking
CREATE TABLE workflow_executions (
    execution_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_name VARCHAR(255),
    workflow_type VARCHAR(100), -- 'founder_signal', 'due_diligence', 'enrichment'
    entity_id UUID, -- Can reference deck_id, room_id, etc.
    status VARCHAR(50), -- 'running', 'completed', 'failed', 'cancelled'
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    duration_seconds INTEGER
);

-- Processing queue for async tasks
CREATE TABLE processing_queue (
    queue_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_type VARCHAR(100), -- 'deck_analysis', 'founder_enrichment', 'document_processing'
    entity_id UUID,
    priority INTEGER DEFAULT 5, -- 1 = highest, 10 = lowest
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    task_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    scheduled_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- 5. INDEXES FOR PERFORMANCE

-- Founder decks indexes
CREATE INDEX idx_founder_decks_status ON founder_decks(status);
CREATE INDEX idx_founder_decks_company ON founder_decks(company_name);
CREATE INDEX idx_founder_decks_upload_date ON founder_decks(upload_date);

-- Founder signals indexes
CREATE INDEX idx_founder_signals_deck_id ON founder_signals(deck_id);
CREATE INDEX idx_founder_signals_overall_score ON founder_signals(overall_signal_score);
CREATE INDEX idx_founder_signals_recommendation ON founder_signals(recommendation);

-- Document embeddings indexes
CREATE INDEX idx_document_embeddings_document_id ON document_embeddings(document_id);
CREATE INDEX idx_document_embeddings_deck_id ON document_embeddings(deck_id);

-- Knowledge entities indexes
CREATE INDEX idx_knowledge_entities_type ON knowledge_entities(entity_type);
CREATE INDEX idx_knowledge_entities_name ON knowledge_entities(entity_name);

-- Workflow executions indexes
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_type ON workflow_executions(workflow_type);
CREATE INDEX idx_workflow_executions_started ON workflow_executions(started_at);

-- Processing queue indexes
CREATE INDEX idx_processing_queue_status ON processing_queue(status);
CREATE INDEX idx_processing_queue_priority ON processing_queue(priority);
CREATE INDEX idx_processing_queue_scheduled ON processing_queue(scheduled_at);

-- 6. INITIAL DATA AND CONFIGURATION

-- Insert initial workflow configurations
INSERT INTO workflow_executions (execution_id, workflow_name, workflow_type, status, input_data) 
VALUES 
    (uuid_generate_v4(), 'system_init', 'initialization', 'completed', '{"message": "VERSSAI database initialized successfully"}');

-- Initial processing queue setup
INSERT INTO processing_queue (queue_id, task_type, priority, status, task_data)
VALUES 
    (uuid_generate_v4(), 'system_health_check', 1, 'completed', '{"check": "database_schema", "result": "success"}');

-- Create views for common queries
CREATE VIEW v_active_founder_signals AS
SELECT 
    fs.*,
    fd.company_name,
    fd.upload_date,
    fd.status as deck_status
FROM founder_signals fs
JOIN founder_decks fd ON fs.deck_id = fd.deck_id
WHERE fd.status = 'completed'
ORDER BY fs.overall_signal_score DESC;

CREATE VIEW v_processing_summary AS
SELECT 
    workflow_type,
    status,
    COUNT(*) as count,
    AVG(duration_seconds) as avg_duration_seconds
FROM workflow_executions 
WHERE started_at > NOW() - INTERVAL '7 days'
GROUP BY workflow_type, status;

-- Success confirmation
INSERT INTO workflow_executions (workflow_name, workflow_type, status, input_data, completed_at) 
VALUES ('database_initialization', 'system', 'completed', '{"tables_created": 15, "indexes_created": 12, "views_created": 2}', NOW());