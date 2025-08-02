# Kronos EAM - Complete Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Local Development Architecture](#local-development-architecture)
3. [Cloud Production Architecture](#cloud-production-architecture)
4. [Database Architecture](#database-architecture)
5. [Deployment Process](#deployment-process)
6. [Security Architecture](#security-architecture)
7. [Cost Analysis](#cost-analysis)

## Overview

Kronos EAM is a cloud-native SaaS platform for managing renewable energy assets in Italy. The system supports both local development and cloud production environments with different database configurations.

### Key Components
- **Frontend**: React TypeScript application with Material-UI
- **Backend**: Python FastAPI with async support
- **Database**: PostgreSQL with Alembic migrations
- **Cloud Provider**: Google Cloud Platform (GCP)
- **Container Runtime**: Docker
- **CI/CD**: GitHub Actions

## Local Development Architecture

```mermaid
graph TB
    subgraph "Developer Machine"
        subgraph "Frontend (Port 3000)"
            React[React App<br/>TypeScript + MUI]
            I18n[i18n<br/>IT/EN Support]
        end
        
        subgraph "Backend (Port 8000)"
            FastAPI[FastAPI Server]
            Alembic[Alembic Migrations]
            Auth[JWT Auth]
            Services[Business Services]
        end
        
        subgraph "Local Database"
            PG_Local[(PostgreSQL<br/>localhost:5432<br/>DB: kronos_eam)]
        end
        
        subgraph "External Services"
            Redis[Redis<br/>localhost:6379]
            Mail[Mail Server<br/>Optional]
        end
    end
    
    React -->|API Calls<br/>http://localhost:8000| FastAPI
    FastAPI -->|SQLAlchemy ORM| PG_Local
    FastAPI -->|Session/Cache| Redis
    FastAPI -->|Notifications| Mail
    
    style React fill:#61dafb
    style FastAPI fill:#009688
    style PG_Local fill:#336791
    style Redis fill:#dc382d
```

### Local Environment Details

#### Database Configuration
```yaml
Host: localhost
Port: 5432
Database: kronos_eam
User: kronos
Password: KronosAdmin2024!
Connection: postgresql://kronos:KronosAdmin2024!@localhost:5432/kronos_eam
```

#### Service URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

#### Required Services
```bash
# PostgreSQL
docker run -d --name kronos-postgres \
  -e POSTGRES_USER=kronos \
  -e POSTGRES_PASSWORD=KronosAdmin2024! \
  -e POSTGRES_DB=kronos_eam \
  -p 5432:5432 \
  postgres:14

# Redis (optional)
docker run -d --name kronos-redis \
  -p 6379:6379 \
  redis:7-alpine
```

## Cloud Production Architecture

```mermaid
graph TB
    subgraph "Internet"
        Users[Users<br/>HTTPS]
        GitHub[GitHub<br/>Repository]
    end
    
    subgraph "Google Cloud Platform - Project: kronos-eam-prod-20250802"
        subgraph "Cloud Run Services"
            CR_Frontend[Cloud Run<br/>kronos-frontend<br/>React App]
            CR_Backend[Cloud Run<br/>kronos-backend<br/>FastAPI]
        end
        
        subgraph "Cloud SQL"
            CloudSQL[(Cloud SQL<br/>PostgreSQL 14<br/>kronos-db)]
            Proxy[Cloud SQL Proxy<br/>Secure Connection]
        end
        
        subgraph "Storage & Registry"
            AR[Artifact Registry<br/>Docker Images]
            GCS[Cloud Storage<br/>Static Assets]
        end
        
        subgraph "Security & Networking"
            LB[Load Balancer<br/>SSL/TLS]
            IAM[IAM & Service Accounts]
            SM[Secret Manager<br/>API Keys & Passwords]
        end
    end
    
    Users -->|HTTPS| LB
    LB -->|Route /api/*| CR_Backend
    LB -->|Route /*| CR_Frontend
    CR_Frontend -->|API Calls| CR_Backend
    CR_Backend -->|SQL| Proxy
    Proxy -->|Secure| CloudSQL
    CR_Backend -->|Secrets| SM
    
    GitHub -->|CI/CD Pipeline| AR
    AR -->|Deploy Images| CR_Frontend
    AR -->|Deploy Images| CR_Backend
    
    style CR_Frontend fill:#4285f4
    style CR_Backend fill:#34a853
    style CloudSQL fill:#ea4335
    style AR fill:#fbbc04
```

### Cloud Environment Details

#### GCP Resources
```yaml
Project ID: kronos-eam-prod-20250802
Region: europe-west1
Zone: europe-west1-b

Services:
  - Cloud Run (Frontend): kronos-frontend
  - Cloud Run (Backend): kronos-backend
  - Cloud SQL Instance: kronos-db
  - Artifact Registry: kronos-eam
  - Secret Manager: Enabled
  - Cloud Build: Enabled
```

#### Database Configuration
```yaml
Instance: kronos-db
Type: Cloud SQL PostgreSQL 14
Machine Type: db-f1-micro
Storage: 10GB SSD (auto-expanding)
Backups: Daily automatic
High Availability: Optional
Connection Name: kronos-eam-prod-20250802:europe-west1:kronos-db
```

#### Service Accounts
```yaml
Deployment SA: kronos-deploy@kronos-eam-prod-20250802.iam.gserviceaccount.com
Frontend SA: kronos-frontend@kronos-eam-prod-20250802.iam.gserviceaccount.com
Backend SA: kronos-backend@kronos-eam-prod-20250802.iam.gserviceaccount.com
```

## Database Architecture

### Schema Overview

```mermaid
erDiagram
    TENANTS ||--o{ USERS : "has"
    TENANTS ||--o{ PLANTS : "owns"
    USERS ||--o{ PLANTS : "manages"
    PLANTS ||--o{ PLANT_REGISTRY : "has details"
    PLANTS ||--o{ WORKFLOWS : "has"
    WORKFLOWS ||--o{ WORKFLOW_STAGES : "contains"
    WORKFLOW_STAGES ||--o{ WORKFLOW_TASKS : "includes"
    WORKFLOWS ||--o{ DOCUMENTS : "requires"
    WORKFLOW_TASKS ||--o{ DOCUMENTS : "produces"
    USERS ||--o{ NOTIFICATIONS : "receives"
    WORKFLOW_TEMPLATES ||--o{ WORKFLOWS : "generates"
    
    TENANTS {
        string id PK
        string name
        enum status
        jsonb configuration
        date plan_expiry
        int max_users
        int max_plants
    }
    
    USERS {
        int id PK
        string email UK
        string password_hash
        string name
        string role
        string tenant_id FK
        timestamp last_login
    }
    
    PLANTS {
        int id PK
        string name
        string code
        float power_kw
        enum status
        enum type
        string location
        string tenant_id FK
        timestamp next_deadline
    }
    
    WORKFLOWS {
        int id PK
        string name
        int plant_id FK
        enum category
        string current_status
        float progress
        timestamp due_date
        jsonb involved_entities
    }
```

### Enum Types

```sql
-- Plant Status
CREATE TYPE plant_status_enum AS ENUM (
    'In Operation',
    'In Authorization',
    'Under Construction',
    'Decommissioned'
);

-- Plant Type
CREATE TYPE plant_type_enum AS ENUM (
    'Photovoltaic',
    'Wind',
    'Hydroelectric',
    'Biomass',
    'Geothermal'
);

-- User Roles
CREATE TYPE user_role_enum AS ENUM (
    'Admin',
    'Asset Manager',
    'Plant Owner',
    'Operator',
    'Viewer'
);

-- Workflow Status
CREATE TYPE workflow_status_enum AS ENUM (
    'Draft',
    'Active',
    'Paused',
    'Completed',
    'Cancelled'
);
```

### Migration Strategy

```mermaid
graph LR
    subgraph "Version Control"
        A[001_complete_initial_schema.py<br/>Single Migration File]
    end
    
    subgraph "Local Development"
        B[Alembic Head<br/>Current State]
        C[Manual SQL<br/>Scripts]
    end
    
    subgraph "Cloud Deployment"
        D[Fresh Database<br/>Clean State]
        E[Alembic Upgrade<br/>Automatic]
        F[Init Data Script<br/>Demo Data]
    end
    
    A -->|alembic upgrade head| B
    A -->|First Deploy| D
    D --> E
    E --> F
    
    style A fill:#f9f
    style D fill:#9f9
    style E fill:#99f
```

## Deployment Process

### CI/CD Pipeline

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant GA as GitHub Actions
    participant GCB as Cloud Build
    participant AR as Artifact Registry
    participant CR as Cloud Run
    participant SQL as Cloud SQL
    
    Dev->>GH: git push main
    GH->>GA: Trigger workflow
    GA->>GA: Run tests
    GA->>GA: Build images
    GA->>AR: Push images
    GA->>SQL: Create instance (if needed)
    GA->>CR: Deploy backend
    Note over CR,SQL: Run migrations
    GA->>CR: Deploy frontend
    GA->>Dev: Deployment complete ✓
```

### Deployment Steps

1. **GitHub Actions Triggered**
   ```yaml
   on:
     push:
       branches: [main]
   ```

2. **Test Phase**
   - Python tests with pytest
   - Frontend tests with Jest
   - Build verification

3. **Build Phase**
   - Backend: Docker multi-stage build
   - Frontend: Node.js build with webpack
   - Images tagged with commit SHA

4. **Deploy Phase**
   - Cloud SQL instance creation/update
   - Backend deployment with migrations
   - Frontend deployment
   - Health checks

### Environment Variables

```mermaid
graph TB
    subgraph "GitHub Secrets"
        GCP_PROJECT_ID[GCP_PROJECT_ID<br/>kronos-eam-prod-20250802]
        GCP_SA_KEY[GCP_SA_KEY<br/>Service Account JSON]
        DB_PASSWORD[DB_PASSWORD<br/>KronosAdmin2024!]
    end
    
    subgraph "Cloud Run Environment"
        DATABASE_URL[DATABASE_URL<br/>postgresql://...]
        SECRET_KEY[SECRET_KEY<br/>Generated]
        ENVIRONMENT[ENVIRONMENT<br/>production]
        
        API_KEYS[External API Keys<br/>Optional]
    end
    
    GCP_PROJECT_ID -->|Deploy Time| DATABASE_URL
    GCP_SA_KEY -->|Authentication| DATABASE_URL
    DB_PASSWORD -->|Runtime| DATABASE_URL
```

## Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    participant JWT
    
    User->>Frontend: Login (email/password)
    Frontend->>Backend: POST /api/v1/auth/login
    Backend->>Database: Verify credentials
    Database-->>Backend: User data
    Backend->>JWT: Generate token
    JWT-->>Backend: Access token
    Backend-->>Frontend: {token, user}
    Frontend->>Frontend: Store token
    
    Note over Frontend,Backend: Subsequent requests
    Frontend->>Backend: GET /api/v1/plants<br/>Authorization: Bearer {token}
    Backend->>JWT: Verify token
    JWT-->>Backend: Valid/Invalid
    Backend->>Database: Fetch data (if valid)
    Database-->>Backend: Plants data
    Backend-->>Frontend: Response
```

### Security Layers

1. **Network Security**
   - HTTPS only (managed SSL)
   - Cloud Run native DDoS protection
   - No public IPs for database

2. **Application Security**
   - JWT authentication
   - Role-based access control
   - Tenant isolation
   - Input validation

3. **Database Security**
   - Cloud SQL Proxy connection
   - SSL/TLS encryption
   - Automatic backups
   - IAM-based access

4. **Secret Management**
   - Google Secret Manager for runtime secrets
   - GitHub encrypted secrets for deployment
   - Environment separation (dev/staging/prod)
   
### Secret Architecture

```mermaid
graph TB
    subgraph "Google Secret Manager"
        JWT[jwt-secret<br/>Random 32-byte key]
        REDIS[redis-password<br/>Random 32-byte key]
        DB[db-password<br/>PostgreSQL password]
    end
    
    subgraph "Cloud Run Backend"
        ENV1[Environment Variables]
        APP[FastAPI Application]
    end
    
    subgraph "Usage"
        AUTH[JWT Authentication]
        CACHE[Redis Cache]
        DATABASE[PostgreSQL]
    end
    
    JWT -->|Maps to SECRET_KEY| ENV1
    REDIS -->|Maps to REDIS_PASSWORD| ENV1
    DB -->|Used in DATABASE_URL| ENV1
    
    ENV1 --> APP
    
    APP -->|Signs tokens| AUTH
    APP -->|Secures cache| CACHE
    APP -->|Connects to| DATABASE
    
    style JWT fill:#ff6b6b
    style REDIS fill:#4ecdc4
    style DB fill:#95e1d3
```

**Required Secrets:**

| Secret Name | Purpose | Why It's Critical |
|------------|---------|-------------------|
| `jwt-secret` | Signs JWT tokens | Without it, authentication system cannot start |
| `redis-password` | Redis authentication | Required even for internal Redis instances |
| `db-password` | Database access | Can use GitHub Secrets instead |

**Security Benefits:**
- Secrets never exposed in logs or container images
- Automatic encryption at rest
- IAM-controlled access per service account
- Audit trail for all secret access
- Version control with rollback capability

## Cost Analysis

### Monthly Cost Breakdown (Estimated)

```mermaid
pie title "GCP Monthly Costs - Basic Tier"
    "Cloud Run Backend" : 15
    "Cloud Run Frontend" : 10
    "Cloud SQL Instance" : 15
    "Cloud SQL Storage" : 5
    "Artifact Registry" : 5
    "Load Balancer" : 20
    "Other Services" : 10
```

### Detailed Costs

| Service | Configuration | Estimated Monthly Cost |
|---------|--------------|----------------------|
| Cloud Run Backend | 1 vCPU, 512MB RAM, 1-10 instances | $10-30 |
| Cloud Run Frontend | 1 vCPU, 256MB RAM, 1-10 instances | $5-20 |
| Cloud SQL | db-f1-micro, 10GB SSD | $15-20 |
| Load Balancer | HTTPS with SSL | $18-25 |
| Artifact Registry | 10GB storage | $5 |
| Secret Manager | <10K operations | $0.06 |
| Cloud Build | <120 min/day | Free |
| **Total** | **Basic Usage** | **~$60-100/month** |

### Scaling Costs

```mermaid
graph LR
    subgraph "User Tiers"
        A[1-10 Users<br/>$60/mo]
        B[10-50 Users<br/>$150/mo]
        C[50-200 Users<br/>$400/mo]
        D[200+ Users<br/>Custom]
    end
    
    subgraph "Resources"
        E[Basic<br/>Shared CPU]
        F[Standard<br/>Dedicated CPU]
        G[Premium<br/>HA Database]
        H[Enterprise<br/>Multi-Region]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
```

## Monitoring and Observability

### Cloud Monitoring Setup

```mermaid
graph TB
    subgraph "Application Metrics"
        A[Cloud Run Metrics<br/>CPU, Memory, Requests]
        B[Cloud SQL Metrics<br/>Connections, Storage]
        C[Custom Metrics<br/>Business KPIs]
    end
    
    subgraph "Monitoring Tools"
        D[Cloud Monitoring<br/>Dashboards]
        E[Cloud Logging<br/>Centralized Logs]
        F[Error Reporting<br/>Automatic Alerts]
        G[Uptime Checks<br/>Availability]
    end
    
    subgraph "Alerting"
        H[Email Alerts]
        I[SMS Alerts<br/>Critical Only]
        J[PagerDuty<br/>Integration]
    end
    
    A --> D
    B --> D
    C --> D
    D --> H
    E --> F
    F --> I
    G --> J
```

### Key Metrics to Monitor

1. **Application Performance**
   - Request latency (p50, p90, p99)
   - Error rate (<1% target)
   - Active users
   - API usage by endpoint

2. **Infrastructure Health**
   - CPU utilization (<70%)
   - Memory usage (<80%)
   - Database connections
   - Storage growth rate

3. **Business Metrics**
   - Active plants
   - Workflow completion rate
   - Document processing time
   - User engagement

## Disaster Recovery

### Backup Strategy

```mermaid
graph TB
    subgraph "Automated Backups"
        A[Cloud SQL<br/>Daily @ 3 AM CET]
        B[Retention<br/>7 days]
        C[Point-in-time<br/>Recovery]
    end
    
    subgraph "Manual Backups"
        D[Pre-deployment<br/>Snapshots]
        E[Monthly Archives<br/>Long-term]
    end
    
    subgraph "Recovery Options"
        F[Restore to new instance<br/>~10 minutes]
        G[Clone for testing<br/>~15 minutes]
        H[Export to bucket<br/>For migration]
    end
    
    A --> B
    B --> C
    A --> F
    D --> G
    E --> H
```

### RTO/RPO Targets

- **RTO (Recovery Time Objective)**: 30 minutes
- **RPO (Recovery Point Objective)**: 24 hours
- **Uptime Target**: 99.5% (allows ~3.5 hours downtime/month)

## Development Workflow

### Local to Cloud Development

```mermaid
graph LR
    subgraph "Local Development"
        A[Code Changes]
        B[Local Testing]
        C[Git Commit]
    end
    
    subgraph "Version Control"
        D[Feature Branch]
        E[Pull Request]
        F[Code Review]
        G[Merge to Main]
    end
    
    subgraph "Cloud Deployment"
        H[Auto Deploy]
        I[Staging Tests]
        J[Production]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    
    style A fill:#f9f
    style G fill:#9f9
    style J fill:#99f
```

## Conclusion

Kronos EAM provides a robust, scalable architecture suitable for both local development and cloud production. The system leverages Google Cloud Platform's managed services to minimize operational overhead while maintaining security and reliability.

### Key Advantages
- **Scalability**: Auto-scaling from 1 to 1000s of users
- **Security**: Multiple layers of protection
- **Reliability**: Managed services with SLAs
- **Cost-effective**: Pay-per-use model
- **Developer-friendly**: Local development mirrors production

### Next Steps
1. Complete initial deployment
2. Set up monitoring dashboards
3. Configure alerting rules
4. Plan for scaling strategy
5. Implement backup verification