# Database Architecture - Kronos EAM

## Overview

Kronos EAM uses PostgreSQL as its primary database, with different configurations for local development and cloud production environments.

## Database Environments

### 1. Local Development Database

```mermaid
graph TB
    subgraph "Local PostgreSQL Instance"
        LocalDB[(Database: kronos_eam<br/>Host: localhost:5432)]
        
        subgraph "Configuration"
            User[User: kronos]
            Pass[Password: KronosAdmin2024!]
            Version[PostgreSQL 14+]
        end
        
        subgraph "Data"
            Schema[Current Schema<br/>May have inconsistencies]
            TestData[Test Data<br/>Local testing]
        end
    end
    
    Backend[Local Backend<br/>Port 8000] -->|Direct Connection| LocalDB
    Alembic[Alembic CLI] -->|Migrations| LocalDB
    
    style LocalDB fill:#336791
    style Backend fill:#009688
```

**Connection String:**
```
postgresql://kronos:KronosAdmin2024!@localhost:5432/kronos_eam
```

**Characteristics:**
- Direct connection without proxy
- May have schema drift from testing
- Contains local test data
- No automatic backups
- Single user access

### 2. Cloud Production Database

```mermaid
graph TB
    subgraph "Google Cloud SQL"
        CloudSQL[(Instance: kronos-db<br/>Database: kronos_eam)]
        
        subgraph "Configuration"
            Region[Region: europe-west1]
            Type[Type: PostgreSQL 14]
            Machine[Machine: db-f1-micro]
            Storage[Storage: 10GB SSD]
        end
        
        subgraph "Features"
            Backups[Daily Backups<br/>7-day retention]
            HA[High Availability<br/>Optional]
            SSL[SSL/TLS Only]
            Monitor[Monitoring<br/>Metrics]
        end
    end
    
    subgraph "Access Layer"
        Proxy[Cloud SQL Proxy]
        IAM[IAM Authentication]
    end
    
    Backend[Cloud Run Backend] -->|Secure Connection| Proxy
    Proxy -->|Private IP| CloudSQL
    IAM -->|Authorize| Proxy
    
    style CloudSQL fill:#ea4335
    style Backend fill:#34a853
    style Proxy fill:#4285f4
```

**Connection String (from Cloud Run):**
```
postgresql://postgres:KronosAdmin2024!@/kronos_eam?host=/cloudsql/kronos-eam-prod-20250802:europe-west1:kronos-db
```

**Characteristics:**
- Managed by Google Cloud
- Automatic daily backups
- High availability option
- Encrypted at rest and in transit
- Accessible only via Cloud SQL Proxy
- Auto-scaling storage

## Database Schema

### Core Tables Structure

```mermaid
erDiagram
    TENANTS {
        varchar(50) id PK
        varchar(200) name
        enum status "Active|Suspended|Trial|Cancelled"
        jsonb configuration
        date plan_expiry
        integer max_users
        integer max_plants
        timestamp created_at
        timestamp updated_at
    }
    
    USERS {
        serial id PK
        varchar(255) email UK
        varchar(255) password_hash
        varchar(100) name
        varchar(100) surname
        varchar(50) role "Admin|Asset Manager|Plant Owner|Operator|Viewer"
        varchar(20) status
        varchar(50) tenant_id FK
        timestamp last_login
        boolean is_deleted
    }
    
    PLANTS {
        serial id PK
        varchar(200) name
        varchar(50) code
        varchar(50) power
        float power_kw
        enum status "In Operation|In Authorization|Under Construction|Decommissioned"
        enum type "Photovoltaic|Wind|Hydroelectric|Biomass|Geothermal"
        varchar(200) location
        varchar(500) address
        varchar(100) municipality
        varchar(10) province
        varchar(50) region
        float latitude
        float longitude
        timestamp next_deadline
        varchar(100) next_deadline_type
        varchar(50) tenant_id FK
        integer created_by FK
        boolean is_deleted
    }
    
    WORKFLOWS {
        serial id PK
        varchar(200) name
        integer plant_id FK
        varchar(100) type
        enum category "Activation|Fiscal|Incentives|Changes|Maintenance|Compliance"
        text description
        varchar(100) current_status
        float progress
        timestamp due_date
        jsonb involved_entities
        jsonb document_requirements
        varchar(50) tenant_id FK
    }
    
    WORKFLOW_TASKS {
        serial id PK
        integer workflow_id FK
        integer stage_id FK
        varchar(200) title
        text description
        enum status "To Start|In Progress|Completed|Delayed|Blocked"
        enum priority "High|Medium|Low"
        varchar(255) assignee
        timestamp due_date
        enum responsible_entity "DSO|Terna|GSE|Customs|Municipality|Region|Superintendence"
        varchar(100) practice_type
        varchar(500) portal_url
    }
    
    DOCUMENTS {
        serial id PK
        varchar(255) name
        varchar(50) type
        integer size
        varchar(500) url
        varchar(50) category
        varchar(50) status
        date expiry_date
        integer version
        jsonb tags
        integer plant_id FK
        integer workflow_id FK
        varchar(50) tenant_id FK
    }
```

### Relationships

```mermaid
graph LR
    subgraph "Multi-Tenancy"
        T[Tenant] -->|1:N| U[Users]
        T -->|1:N| P[Plants]
        T -->|1:N| W[Workflows]
        T -->|1:N| D[Documents]
    end
    
    subgraph "Core Relations"
        U -->|Creates| P
        P -->|Has Many| W
        W -->|Contains| S[Stages]
        S -->|Contains| K[Tasks]
        W -->|Requires| D
        K -->|Produces| D
    end
    
    subgraph "Registry"
        P -->|1:1| R[Plant Registry]
        R -->|Contains| Details[Technical Details<br/>POD, GAUDI, etc.]
    end
```

## Migration Management

### Migration Strategy

```mermaid
graph TB
    subgraph "Development Flow"
        Dev[Developer Changes] -->|Create| Migration
        Migration -->|Test Locally| LocalDB[(Local DB)]
        LocalDB -->|Verify| Testing
    end
    
    subgraph "Production Flow"
        Push[Git Push] -->|Trigger| CICD[CI/CD Pipeline]
        CICD -->|Deploy| Container[Backend Container]
        Container -->|Run on Startup| Alembic[Alembic Upgrade]
        Alembic -->|Apply to| CloudDB[(Cloud SQL)]
    end
    
    Testing -->|Commit| Push
    
    style Dev fill:#f9f
    style CloudDB fill:#9f9
    style Container fill:#99f
```

### Current Migration Structure

```
alembic/versions/
├── 001_complete_initial_schema.py  # Active - Single consolidated migration
└── archive/                        # Old migrations (not used)
    ├── 001_initial_schema.py
    ├── add_plant_owner_role.py
    └── fix_enum_formats.py
```

### Migration Execution

**Local Development:**
```bash
# Check current version
alembic current

# Upgrade to latest
alembic upgrade head

# Create new migration
alembic revision -m "description"
```

**Cloud Production (Automatic):**
```bash
# In entrypoint.sh
echo "Running database migrations..."
alembic upgrade head
```

## Data Model Details

### Enum Types (English)

```sql
-- Plant Status
'In Operation'       -- Plant is operational
'In Authorization'   -- Awaiting permits
'Under Construction' -- Being built
'Decommissioned'    -- No longer active

-- Plant Types
'Photovoltaic'   -- Solar panels
'Wind'           -- Wind turbines
'Hydroelectric'  -- Water power
'Biomass'        -- Organic materials
'Geothermal'     -- Earth heat

-- User Roles
'Admin'          -- Full system access
'Asset Manager'  -- Manage multiple plants
'Plant Owner'    -- Own specific plants
'Operator'       -- Operational tasks
'Viewer'         -- Read-only access

-- Workflow Categories
'Activation'     -- New plant activation
'Fiscal'         -- Tax and fees
'Incentives'     -- Government incentives
'Changes'        -- Modifications
'Maintenance'    -- Regular maintenance
'Compliance'     -- Regulatory compliance
```

### Multi-Tenant Isolation

```mermaid
graph TB
    subgraph "Tenant: Demo"
        DemoUsers[Demo Users]
        DemoPlants[Demo Plants]
        DemoWorkflows[Demo Workflows]
    end
    
    subgraph "Tenant: Customer1"
        Cust1Users[Customer1 Users]
        Cust1Plants[Customer1 Plants]
        Cust1Workflows[Customer1 Workflows]
    end
    
    subgraph "Database Layer"
        Filter[Row-Level Security<br/>WHERE tenant_id = ?]
        Indexes[Tenant Indexes<br/>Optimized Queries]
    end
    
    DemoUsers -->|tenant_id='demo'| Filter
    Cust1Users -->|tenant_id='customer1'| Filter
    Filter --> Indexes
    
    style Filter fill:#f96
    style Indexes fill:#69f
```

## Performance Optimization

### Indexes

```sql
-- Primary indexes for performance
CREATE INDEX idx_plants_tenant ON plants(tenant_id);
CREATE INDEX idx_plants_status ON plants(status);
CREATE INDEX idx_plants_next_deadline ON plants(next_deadline);
CREATE INDEX idx_workflows_tenant ON workflows(tenant_id);
CREATE INDEX idx_workflows_plant ON workflows(plant_id);
CREATE INDEX idx_tasks_status ON workflow_tasks(status);
CREATE INDEX idx_documents_plant ON documents(plant_id);
```

### Query Optimization

```mermaid
graph LR
    subgraph "Query Patterns"
        A[Tenant Filter First]
        B[Status Filters]
        C[Date Ranges]
        D[Joins on Indexed Columns]
    end
    
    subgraph "Caching Strategy"
        E[Redis Cache]
        F[Query Results]
        G[User Sessions]
    end
    
    A --> E
    B --> F
    C --> F
    D --> G
```

## Backup and Recovery

### Cloud SQL Backup Strategy

```mermaid
graph TB
    subgraph "Automated Backups"
        Daily[Daily Backup<br/>3:00 AM CET]
        Weekly[Weekly Export<br/>Sunday]
        PITR[Point-in-Time<br/>Recovery]
    end
    
    subgraph "Retention"
        Seven[7 Days<br/>Daily Backups]
        Thirty[30 Days<br/>Weekly Exports]
        Archive[Long-term<br/>Google Storage]
    end
    
    subgraph "Recovery Options"
        Restore[Restore Instance<br/>~10 min]
        Clone[Clone for Testing<br/>~15 min]
        Export[Export SQL<br/>For migration]
    end
    
    Daily --> Seven
    Weekly --> Thirty
    Seven --> PITR
    Thirty --> Archive
    PITR --> Restore
    Archive --> Clone
    Archive --> Export
```

### Local Backup Commands

```bash
# Backup local database
pg_dump -h localhost -U kronos kronos_eam > backup_$(date +%Y%m%d).sql

# Restore local database
psql -h localhost -U kronos kronos_eam < backup_20250802.sql

# Backup cloud database (via proxy)
cloud_sql_proxy -instances=PROJECT:REGION:INSTANCE=tcp:5432 &
pg_dump -h localhost -U postgres kronos_eam > cloud_backup.sql
```

## Security Considerations

### Access Control

```mermaid
graph TB
    subgraph "Authentication Layers"
        IAM[Google IAM<br/>Service Accounts]
        SQL[SQL Authentication<br/>Username/Password]
        APP[Application Layer<br/>JWT Tokens]
    end
    
    subgraph "Encryption"
        Transit[TLS in Transit<br/>Cloud SQL Proxy]
        Rest[Encryption at Rest<br/>Google Managed]
        Backup[Backup Encryption<br/>AES-256]
    end
    
    subgraph "Audit"
        Logs[Access Logs<br/>Cloud Logging]
        Changes[Change Tracking<br/>Updated_by fields]
        History[Audit Tables<br/>Future feature]
    end
    
    IAM --> Transit
    SQL --> Rest
    APP --> Logs
```

### Best Practices

1. **Never expose database publicly**
   - Always use Cloud SQL Proxy
   - No public IP assignment

2. **Use strong passwords**
   - Minimum 16 characters
   - Store in Secret Manager

3. **Regular security updates**
   - Auto-update minor versions
   - Plan major version upgrades

4. **Monitor access patterns**
   - Alert on unusual queries
   - Track failed connections

## Monitoring and Alerts

### Key Metrics

```mermaid
graph LR
    subgraph "Database Metrics"
        CPU[CPU Usage<br/><70%]
        Memory[Memory<br/><80%]
        Storage[Storage<br/>Auto-expand]
        Connections[Connections<br/><80% of max]
    end
    
    subgraph "Application Metrics"
        QueryTime[Query Time<br/><100ms avg]
        ErrorRate[Error Rate<br/><1%]
        DeadLocks[Deadlocks<br/>Alert on any]
    end
    
    subgraph "Alerts"
        Email[Email Alerts]
        SMS[SMS Critical]
        Slack[Slack Integration]
    end
    
    CPU --> Email
    Memory --> Email
    Storage --> SMS
    Connections --> Email
    QueryTime --> Slack
    ErrorRate --> SMS
    DeadLocks --> SMS
```

## Cost Optimization

### Database Costs

| Component | Configuration | Monthly Cost |
|-----------|--------------|-------------|
| Cloud SQL Instance | db-f1-micro (0.6GB RAM) | ~$15 |
| Storage | 10GB SSD | ~$1.70 |
| Backups | 7-day retention | ~$0.50 |
| Network | Egress to Cloud Run | $0 (same region) |
| **Total** | **Basic Setup** | **~$17/month** |

### Scaling Options

```mermaid
graph TB
    subgraph "Vertical Scaling"
        Micro[db-f1-micro<br/>$15/mo<br/>1-10 users]
        Small[db-g1-small<br/>$35/mo<br/>10-50 users]
        Custom[db-custom<br/>$100+/mo<br/>50+ users]
    end
    
    subgraph "Features"
        Basic[Basic<br/>No HA]
        Standard[Standard<br/>Optional HA]
        Premium[Premium<br/>HA + Read Replicas]
    end
    
    Micro --> Basic
    Small --> Standard
    Custom --> Premium
```

## Future Enhancements

1. **Read Replicas**
   - For reporting workloads
   - Geographic distribution

2. **Connection Pooling**
   - PgBouncer integration
   - Better connection management

3. **Advanced Monitoring**
   - Query performance insights
   - Slow query analysis

4. **Data Archival**
   - Move old data to cold storage
   - Partition large tables