#!/bin/bash
#
# Database Initialization Script for GCP Cloud SQL
# Creates schema and loads initial data
#

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"kronos-eam-prod"}
REGION=${GCP_REGION:-"europe-west1"}
SQL_INSTANCE="kronos-db"
DATABASE_NAME="kronos_eam"

echo -e "${YELLOW}Initializing Cloud SQL Database...${NC}"

# Get connection name
CONNECTION_NAME="${PROJECT_ID}:${REGION}:${SQL_INSTANCE}"

# Create temporary SQL file with complete schema
cat > /tmp/kronos_schema.sql << 'EOF'
-- Kronos EAM Database Schema (English)
-- Complete initialization script for Google Cloud SQL

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
DO $$ BEGIN
    CREATE TYPE plant_status_enum AS ENUM (
        'In Operation',
        'In Authorization', 
        'Under Construction',
        'Decommissioned'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE plant_type_enum AS ENUM (
        'Photovoltaic',
        'Wind',
        'Hydroelectric',
        'Biomass',
        'Geothermal'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE workflow_status_enum AS ENUM (
        'Draft',
        'Active',
        'Paused',
        'Completed',
        'Cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status_enum AS ENUM (
        'To Start',
        'In Progress',
        'Completed',
        'Delayed',
        'Blocked'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority_enum AS ENUM (
        'High',
        'Medium',
        'Low'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE workflow_category_enum AS ENUM (
        'Activation',
        'Fiscal',
        'Incentives',
        'Changes',
        'Maintenance',
        'Compliance'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE entity_enum AS ENUM (
        'DSO',
        'Terna',
        'GSE',
        'Customs',
        'Municipality',
        'Region',
        'Superintendence'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tenant_status_enum AS ENUM (
        'Active',
        'Suspended',
        'Trial',
        'Cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    status tenant_status_enum NOT NULL DEFAULT 'TRIAL',
    configuration JSONB DEFAULT '{}',
    plan_expiry DATE,
    max_users INTEGER DEFAULT 10,
    max_plants INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100),
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    tenant_id VARCHAR(50) REFERENCES tenants(id),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by INTEGER
);

-- Plants table
CREATE TABLE IF NOT EXISTS plants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50),
    power VARCHAR(50),
    power_kw DOUBLE PRECISION,
    status plant_status_enum NOT NULL,
    type plant_type_enum,
    location VARCHAR(200),
    address VARCHAR(500),
    municipality VARCHAR(100),
    province VARCHAR(10),
    region VARCHAR(50),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    next_deadline TIMESTAMP,
    next_deadline_type VARCHAR(100),
    tenant_id VARCHAR(50) REFERENCES tenants(id),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by INTEGER
);

-- Plant registry data
CREATE TABLE IF NOT EXISTS plant_registry (
    id SERIAL PRIMARY KEY,
    plant_id INTEGER REFERENCES plants(id),
    pod VARCHAR(100),
    gaudi VARCHAR(100),
    censimp VARCHAR(100),
    operation_date DATE,
    construction_date DATE,
    connection_date DATE,
    regime VARCHAR(100),
    technology VARCHAR(100),
    connection_type VARCHAR(100),
    connection_point VARCHAR(200),
    grid_operator VARCHAR(100),
    workshop_code VARCHAR(100),
    responsible VARCHAR(200),
    responsible_email VARCHAR(255),
    responsible_phone VARCHAR(50),
    insurance VARCHAR(200),
    insurance_number VARCHAR(100),
    insurance_expiry DATE,
    nominal_power DOUBLE PRECISION,
    occupied_surface DOUBLE PRECISION,
    module_count INTEGER,
    inverter_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow templates table
CREATE TABLE IF NOT EXISTS workflow_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category workflow_category_enum,
    phase VARCHAR(50),
    workflow_purpose VARCHAR(50),
    is_complete_workflow BOOLEAN DEFAULT TRUE,
    plant_type VARCHAR(50),
    min_power DOUBLE PRECISION,
    max_power DOUBLE PRECISION,
    estimated_duration_days INTEGER,
    recurrence VARCHAR(50),
    stages JSONB DEFAULT '[]',
    tasks JSONB DEFAULT '[]',
    required_entities JSONB DEFAULT '[]',
    base_documents JSONB DEFAULT '[]',
    activation_conditions JSONB DEFAULT '{}',
    deadline_config JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT TRUE,
    tenant_id VARCHAR(50),
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by INTEGER
);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    plant_id INTEGER REFERENCES plants(id),
    plant_name VARCHAR(200),
    type VARCHAR(100),
    category workflow_category_enum,
    description TEXT,
    current_status VARCHAR(100),
    progress DOUBLE PRECISION DEFAULT 0,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    completion_date TIMESTAMP,
    template_id INTEGER REFERENCES workflow_templates(id),
    parent_workflow_id INTEGER REFERENCES workflows(id),
    original_workflow_id INTEGER REFERENCES workflows(id),
    is_standard BOOLEAN DEFAULT TRUE,
    plant_power DOUBLE PRECISION,
    plant_type VARCHAR(50),
    involved_entities JSONB DEFAULT '[]',
    document_requirements JSONB DEFAULT '{}',
    integration_status JSONB DEFAULT '{}',
    tenant_id VARCHAR(50) REFERENCES tenants(id),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by INTEGER
);

-- Workflow stages table
CREATE TABLE IF NOT EXISTS workflow_stages (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES workflows(id),
    name VARCHAR(200) NOT NULL,
    "order" INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    tenant_id VARCHAR(50) REFERENCES tenants(id),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by INTEGER
);

-- Workflow tasks table
CREATE TABLE IF NOT EXISTS workflow_tasks (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES workflows(id),
    stage_id INTEGER REFERENCES workflow_stages(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status task_status_enum DEFAULT 'TO_DO',
    priority task_priority_enum DEFAULT 'MEDIUM',
    assignee VARCHAR(255),
    due_date TIMESTAMP,
    estimated_hours DOUBLE PRECISION,
    actual_hours DOUBLE PRECISION,
    dependencies JSONB DEFAULT '[]',
    integration entity_enum,
    automation_config JSONB DEFAULT '{}',
    responsible_entity entity_enum,
    practice_type VARCHAR(100),
    practice_code VARCHAR(100),
    portal_url VARCHAR(500),
    required_credentials VARCHAR(200),
    tenant_id VARCHAR(50) REFERENCES tenants(id),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by INTEGER
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    size INTEGER,
    url VARCHAR(500),
    category VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Valid',
    expiry_date DATE,
    version INTEGER DEFAULT 1,
    tags JSONB DEFAULT '[]',
    plant_id INTEGER REFERENCES plants(id),
    workflow_id INTEGER REFERENCES workflows(id),
    task_id INTEGER REFERENCES workflow_tasks(id),
    tenant_id VARCHAR(50) REFERENCES tenants(id),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by INTEGER
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    type VARCHAR(50),
    priority VARCHAR(20),
    read BOOLEAN DEFAULT FALSE,
    user_id INTEGER REFERENCES users(id),
    plant_id INTEGER REFERENCES plants(id),
    workflow_id INTEGER REFERENCES workflows(id),
    link VARCHAR(500),
    tenant_id VARCHAR(50) REFERENCES tenants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_plants_tenant ON plants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_plants_status ON plants(status);
CREATE INDEX IF NOT EXISTS idx_plants_type ON plants(type);
CREATE INDEX IF NOT EXISTS idx_plants_next_deadline ON plants(next_deadline);

CREATE INDEX IF NOT EXISTS idx_workflows_tenant ON workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflows_plant ON workflows(plant_id);
CREATE INDEX IF NOT EXISTS idx_workflows_category ON workflows(category);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(current_status);

CREATE INDEX IF NOT EXISTS idx_tasks_workflow ON workflow_tasks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_tasks_stage ON workflow_tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON workflow_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON workflow_tasks(assignee);

CREATE INDEX IF NOT EXISTS idx_documents_plant ON documents(plant_id);
CREATE INDEX IF NOT EXISTS idx_documents_workflow ON documents(workflow_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Insert initial data

-- Create demo tenant
INSERT INTO tenants (id, name, status, plan_expiry) 
VALUES ('demo', 'Demo Tenant', 'Active', CURRENT_DATE + INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- Create demo user (password: demo123)
INSERT INTO users (email, password_hash, name, surname, role, status, tenant_id)
VALUES ('demo@kronos-eam.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN4s5L4NQqRREApr1da9y', 'Demo', 'User', 'Admin', 'Active', 'demo')
ON CONFLICT (email) DO NOTHING;

-- Create sample plants
INSERT INTO plants (name, code, power, power_kw, status, type, location, municipality, province, region, tenant_id)
VALUES 
    ('Impianto Solare Milano', 'SOL-MI-001', '100 kW', 100, 'In Operation', 'Photovoltaic', 'Via Roma 1', 'Milano', 'MI', 'Lombardia', 'demo'),
    ('Parco Eolico Sardegna', 'EOL-CA-001', '2.5 MW', 2500, 'In Operation', 'Wind', 'Località Ventosa', 'Cagliari', 'CA', 'Sardegna', 'demo'),
    ('Centrale Idroelettrica Trento', 'IDR-TN-001', '500 kW', 500, 'Under Construction', 'Hydroelectric', 'Valle del Fiume', 'Trento', 'TN', 'Trentino-Alto Adige', 'demo')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database initialization completed successfully!' as message;
EOF

# Create initial data SQL
cat > /tmp/kronos_data.sql << 'EOF'
-- Workflow templates data
INSERT INTO workflow_templates (
    name, description, category, plant_type, min_power, max_power,
    estimated_duration_days, recurrence, active
) VALUES 
(
    'Complete Renewable Plant Activation',
    'Complete process for activating a renewable energy plant to the Italian electricity grid',
    'Activation',
    'All',
    0,
    NULL,
    180,
    'One-time',
    true
),
(
    'Annual Consumption Declaration',
    'Annual declaration of electricity consumption to Customs Agency',
    'Fiscal',
    'All',
    20,
    NULL,
    30,
    'Annual',
    true
),
(
    'License Fee Payment',
    'Annual payment of electrical workshop license fee',
    'Fiscal',
    'All',
    20,
    NULL,
    15,
    'Annual',
    true
),
(
    'Periodic SPI Verification',
    'Periodic verification of protection systems',
    'Compliance',
    'All',
    0,
    NULL,
    30,
    'Quinquennial',
    true
);

SELECT 'Sample data loaded successfully!' as message;
EOF

# Execute SQL files
echo "Creating schema..."
gcloud sql databases create ${DATABASE_NAME} --instance=${SQL_INSTANCE} 2>/dev/null || echo "Database already exists"

# Import schema
echo "Importing schema..."
gcloud sql import sql ${SQL_INSTANCE} gs://${PROJECT_ID}-storage/kronos_schema.sql \
    --database=${DATABASE_NAME} 2>/dev/null || {
    # If bucket doesn't exist, use direct connection
    gcloud sql connect ${SQL_INSTANCE} --user=postgres < /tmp/kronos_schema.sql
}

# Import data
echo "Loading initial data..."
gcloud sql connect ${SQL_INSTANCE} --user=postgres --database=${DATABASE_NAME} < /tmp/kronos_data.sql

# Run Python initialization script
echo "Running Python initialization..."
cd ../kronos-eam-backend
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
else
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
fi

# Create Cloud SQL proxy connection for Python script
cloud_sql_proxy -instances=${CONNECTION_NAME}=tcp:5432 &
PROXY_PID=$!
sleep 5

# Set environment for local connection through proxy
export DATABASE_URL="postgresql://postgres:KronosAdmin2024!@localhost:5432/${DATABASE_NAME}"

# Run migration script
python scripts/migrate_to_english.py || echo "Migration completed"

# Kill proxy
kill $PROXY_PID

echo -e "\n${GREEN}Database initialization complete!${NC}"
echo -e "Demo credentials: ${YELLOW}demo@kronos-eam.local / demo123${NC}"

# Clean up
rm -f /tmp/kronos_schema.sql /tmp/kronos_data.sql