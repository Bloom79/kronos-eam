# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

You run in an environment where ast-grep (sg) is available; whenever a search requires syntax-aware or structural matching, default to sg
-lang rust -p'<pattern>' (or set --lang appropriately) and avoid falling back to text-only tools like 'g' or 'grep unless I explicitly request a plain-text search.

## Project Documentation Workflow

### Primary Development Documents
1. **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Current system state, completed features, critical issues
2. **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - Sprint-based enhancement roadmap with priorities
3. **[TECHNICAL_DEBT.md](./TECHNICAL_DEBT.md)** - Debt register with effort estimates and quick wins
4. **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing procedures and authentication details

### Development Workflow
1. **Before Starting Work**: Review PROJECT_STATUS.md for current issues and PROJECT_PLAN.md for sprint priorities
2. **During Development**: Follow priorities (P0 → P1 → P2 → P3) and update TODO lists
3. **After Completing Tasks**: Update PROJECT_STATUS.md with progress and mark items complete in PROJECT_PLAN.md
4. **Weekly Reviews**: Update all three documents with current status, new issues, and adjusted timelines

### Document Update Requirements
- **PROJECT_STATUS.md**: Update after completing major features or fixing critical issues
- **PROJECT_PLAN.md**: Update sprint progress weekly, adjust timelines as needed
- **TECHNICAL_DEBT.md**: Update when debt is resolved or new debt is identified
- **All Documents**: Must reflect current reality - no outdated status allowed

## Critical Development Standards

### Language and Code Requirements
1. **Database Structure**: All database tables, columns, and enums MUST be in English
   - Column names: `name` not `nome`, `status` not `stato`, `description` not `descrizione`
   - Enum values: `"Active"` not `"Attivo"`, `"Completed"` not `"Completato"`
   - Table names: `plants` not `impianti`, `workflows` not `flussi_lavoro`

2. **Code Comments**: All code comments and documentation MUST be in English
   - Python docstrings in English
   - TypeScript/JavaScript comments in English
   - README files and technical documentation in English

3. **Frontend UI**: The frontend MUST support multiple languages with user selection
   - Language selector component in the main header
   - Support for Italian and English (extendable to more languages)
   - User language preference persisted in localStorage
   - Translation files using i18next framework

### Implementation Resources
- **Database Migration**: `/home/bloom/sentrics/kronos-eam-backend/scripts/migrate_to_english.py`
- **Translation Files**: `/home/bloom/sentrics/kronos-eam-react/src/i18n/locales/`
- **Language Selector**: `/home/bloom/sentrics/kronos-eam-react/src/components/common/LanguageSelector.tsx`

## 🚨 CRITICAL: GCP Project Configuration

### ⚠️ DO NOT CONFUSE LOCAL DIRECTORY WITH GCP PROJECT ID

**Correct GCP Project Information:**
- **Project ID**: `kronos-eam-prod-20250802` ← **USE THIS IN ALL WORKFLOWS**
- **Project Number**: `949811571472`
- **Project Name**: Kronos EAM Production
- **Region**: `europe-west1`

**Common Mistake to AVOID:**
- **Local Directory**: `/home/bloom/sentrics/`
- **GCP Project ID**: `kronos-eam-prod-20250802`

**THESE ARE DIFFERENT!** The directory name "sentrics" is NOT the GCP project ID.

**Always verify in workflows:**
```yaml
env:
  PROJECT_ID: kronos-eam-prod-20250802  # ✅ CORRECT
  # NOT: sentrics-1025 ❌ WRONG
```

**Production Services:**
- Backend: `https://kronos-backend-e7xnmhn7ra-ew.a.run.app`
- Frontend: `https://kronos-frontend-949811571472.europe-west1.run.app`
- Cloud SQL Instance: `kronos-db`

---

## Project Overview

Kronos EAM (previously referred to as Sentrics) is a cloud-native SaaS platform for managing administrative and compliance workflows for renewable energy assets in Italy. The platform centralizes asset data, provides intelligent assistance for bureaucratic processes, and manages regulatory deadlines for photovoltaic and wind power plants.

**📖 For comprehensive application documentation, see [APPLICATION_GUIDE.md](./APPLICATION_GUIDE.md)**

**Important Update**: Following comprehensive feasibility analysis, full RPA automation is not possible due to SPID/CNS authentication requirements. The platform implements a "Smart Assistant" approach that provides 80% time savings while maintaining full legal compliance.

### Current System Status ✅
- **Internationalization**: Complete English codebase with Italian/English UI support
- **Database**: Fully migrated to English column names and schema
- **Workflow System**: Fully functional template-based workflow creation from plant context
- **Document Management**: Complete document lifecycle with English field names
- **User Management**: Multi-tenant RBAC system operational
- **Integration**: Government portal integration framework established

## Architecture

### Technology Stack
- **Cloud Provider**: Microsoft Azure (primary recommendation)
- **Architecture Pattern**: Microservices with serverless components
- **Frontend**: React.js with TypeScript, Tailwind CSS
- **Backend**: Node.js (NestJS/Fastify) for I/O-intensive services, Python (FastAPI/Django) for AI/data processing
- **Databases**: 
  - PostgreSQL (Azure Database) for structured data and workflow states
  - Azure Cosmos DB for semi-structured data (logs, JSON results)
  - Azure Blob Storage for document storage
- **AI Services**: Azure AI Document Intelligence for document extraction
- **API Management**: Azure API Management as the gateway
- **Security**: Microsoft Entra ID (formerly Azure AD), Azure Key Vault, MFA

### Multi-Tenancy Design
- Database segregated model with shared schema
- Each table contains mandatory `TenantID` column
- Role-Based Access Control (RBAC) within each tenant

## Key Business Workflows

### 1. New Plant Activation Workflow
Manages interactions with:
- **DSO (Distribution System Operator)**: Connection requests, TICA preventive, work completion
- **Terna**: GAUDÌ registration for plant census
- **GSE (Energy Services Manager)**: Convention activation (RID, SSP), anti-mafia declarations
- **Customs Agency (ADM)**: Electric workshop license for plants > 20 kW

### 2. Recurring Compliance Tasks
- Annual consumption declarations (deadline: March 31)
- Annual license fee payment (deadline: December 16)
- Periodic meter calibration (typically every 3 years)
- Annual Fuel Mix communication to GSE
- Periodic protection systems verification (every 5 years)

### 3. Integration Requirements
The platform must handle heterogeneous government systems:
- **REST APIs**: Where available (Terna, E-Distribuzione B2B)
- **E.D.I. File Generation**: For Customs Agency declarations (Idoc format)
- **Smart Portal Assistance**: Pre-filled forms and guided workflows (GSE, GAUDÌ)
- **Document Generation**: PDF forms ready for manual submission
- **Status Monitoring**: Public portal monitoring for updates
- **PEC Management**: For certified email communications

**Key Constraints**:
- SPID authentication cannot be automated (legal restrictions)
- Digital certificates (CNS) require physical tokens
- MFA/OTP requires human interaction
- Solution: Hybrid approach with 80% automation + human checkpoints

## Development Guidelines

### Priority-Based Development Process
1. **Always Start with P0 (Blocking)**: Fix critical issues before adding features
2. **Follow Sprint Plan**: Use PROJECT_PLAN.md sprint goals as development roadmap
3. **Address Technical Debt**: Allocate 20% of time to TECHNICAL_DEBT.md items
4. **Update Documentation**: After each significant change, update relevant .md files

### Current Sprint Focus (Sprint 1 - Critical Fixes)
**P0 - Must Complete This Week**:
- [ ] Fix i18n system (translation keys showing instead of values)
- [ ] Fix Error Boundary import in App.tsx
- [ ] Fix backend API router syntax error
- [ ] Implement consistent loading states

**P1 - High Priority**:
- [ ] Add form validation framework (react-hook-form + zod)
- [ ] Standardize API error handling
- [ ] Create reusable components

### When implementing features:
1. **Compliance First**: Every feature must consider GDPR compliance and data segregation
2. **Audit Trail**: All stakeholder interactions must be logged and traceable
3. **Document Versioning**: Maintain version history for all regulatory documents
4. **Deadline Management**: Critical deadlines must trigger proactive notifications
5. **Multi-Entity Support**: Design for managing portfolios from 3 kW residential to 10 MW commercial plants
6. **Test-Driven**: Add tests for new features (current coverage: 0% - needs improvement)

### Security Considerations
- Encrypt all data at rest and in transit
- Implement proper authentication flows for external system credentials
- Maintain data processing agreements (DPA) compliance
- Log all access to sensitive personal data

## Module Structure

### Core Modules
1. **Centralized Registry (Anagrafica)**: Master data for all plants
2. **Workflow Engine**: Manages bureaucratic processes
3. **Smart Calendar**: Proactive deadline and compliance management
4. **Business Intelligence**: Performance analytics and reporting
5. **Document Management**: Structured storage with metadata and versioning

### MVP Focus
The Minimum Viable Product concentrates on the "New Plant Connection" workflow, validating the core value proposition with minimal investment.

## External Stakeholder Integration Matrix

| Stakeholder | System | Authentication | Integration Method | Automation Level |
|------------|---------|----------------|-------------------|------------------|
| Terna | GAUDÌ/Developer Portal | Digital Certificate | REST API + Smart Forms | 70% - API where possible |
| GSE | Client Area | SPID + MFA | Smart Forms + Guided Workflow | 80% - Pre-fill everything |
| DSO | Producer Portal | User ID/Password + OTP | B2B API + Smart Forms | 85% - Good API coverage |
| ADM | PUDM/Telematic Service | SPID/CNS/CIE | E.D.I. Files + Smart Forms | 90% - File generation only |

**Legend**:
- **Smart Forms**: Pre-filled PDF forms ready for manual submission
- **Guided Workflow**: Step-by-step instructions with portal navigation
- **Automation Level**: Percentage of manual work eliminated

## Key Differentiators

- **Compliance System of Record**: Unlike competitors focusing on physical monitoring, Kronos EAM manages administrative lifecycle
- **Smart Bureaucracy Assistant**: Eliminates 80% of manual work while respecting legal constraints
- **Intelligent Deadline Management**: The "Kronos" module prevents costly compliance failures
- **Hardware Agnostic**: Works with any equipment manufacturer
- **Legal Compliance First**: Respects SPID/CNS authentication requirements while maximizing automation

## Development Commands

### Frontend (React + TypeScript)
```bash
# Development
cd kronos-eam-react
npm install
npm run dev

# Testing
npm run test
npm run test:coverage

# Build
npm run build
npm run preview
```

### Backend (FastAPI + Python)
```bash
# Development
cd kronos-eam-backend
pip install -r requirements.txt
python run_full_backend.py

# Testing
pytest
pytest --coverage

# Database
alembic upgrade head
python scripts/migrate_to_english.py  # If needed
```

### Documentation Update Workflow
```bash
# After completing tasks, update status
# 1. Mark completed items in PROJECT_PLAN.md
# 2. Update metrics in PROJECT_STATUS.md
# 3. Remove resolved items from TECHNICAL_DEBT.md
# 4. Update CLAUDE.md current sprint focus
```

### Quick Status Check
```bash
# Check current priority tasks
grep -E "P0|P1" PROJECT_PLAN.md
grep -E "Critical|High Priority" TECHNICAL_DEBT.md

# Check completion status
grep -c "✅\|completed" PROJECT_STATUS.md
```

### Document Maintenance Schedule
- **Daily**: Check TECHNICAL_DEBT.md for quick wins
- **Weekly**: Update all three main documents with progress
- **Sprint End**: Complete sprint review and plan next sprint
- **Monthly**: Full document review and stakeholder update

## Deployment Configuration (Production-Verified)

### Critical Requirements
⚠️ **MUST use SINGLE `--set-env-vars` flag** - Multiple flags will cause deployment failure
⚠️ **Use `1`/`0` for booleans** - Not `true`/`false` to ensure proper parsing
⚠️ **CORS as JSON array** - Format: `BACKEND_CORS_ORIGINS=["https://frontend-url"]`

### Complete Deployment Documentation
📚 **See [DEPLOYMENT_REQUIREMENTS.md](./DEPLOYMENT_REQUIREMENTS.md)** for full deployment guide

### Quick Reference - Required Environment Variables
```bash
# Backend (all required for proper operation)
DATABASE_URL=postgresql://postgres:PASSWORD@/kronos_eam?host=/cloudsql/PROJECT:REGION:INSTANCE
ENVIRONMENT=production
DISABLE_REDIS=1
DISABLE_QDRANT=1
DISABLE_RATE_LIMIT=1
TENANT_ISOLATION_MODE=shared
RUN_MIGRATIONS=1
RUN_INIT_DATA=1
BACKEND_CORS_ORIGINS=["https://frontend-url"]
```

### GCP Secrets Required
- `jwt-secret` - JWT signing key (32+ chars)
- `db-password` - PostgreSQL password
- `redis-password` - Redis password (unused but required)

### Deployment Verification
```bash
# Check all env vars are set (should see 12 total)
gcloud run services describe kronos-backend --region=europe-west1 \
  --format='value(spec.template.spec.containers[0].env)' | tr ';' '\n' | grep "'name':" | wc -l

# Test login endpoint
curl -X POST https://backend-url/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "X-Tenant-ID: demo" \
  -d "username=demo@kronos-eam.local&password=Demo2024!"
```