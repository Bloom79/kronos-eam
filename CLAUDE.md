# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Testing Guide
For comprehensive testing procedures, authentication details, and troubleshooting steps, see: **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**

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

## Project Overview

Kronos EAM (previously referred to as Sentrics) is a cloud-native SaaS platform for managing administrative and compliance workflows for renewable energy assets in Italy. The platform centralizes asset data, provides intelligent assistance for bureaucratic processes, and manages regulatory deadlines for photovoltaic and wind power plants.

**Important Update**: Following comprehensive feasibility analysis, full RPA automation is not possible due to SPID/CNS authentication requirements. The platform implements a "Smart Assistant" approach that provides 80% time savings while maintaining full legal compliance.

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

### When implementing features:
1. **Compliance First**: Every feature must consider GDPR compliance and data segregation
2. **Audit Trail**: All stakeholder interactions must be logged and traceable
3. **Document Versioning**: Maintain version history for all regulatory documents
4. **Deadline Management**: Critical deadlines must trigger proactive notifications
5. **Multi-Entity Support**: Design for managing portfolios from 3 kW residential to 10 MW commercial plants

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

Since this is primarily a documentation and planning repository, there are no specific build or test commands at this stage. When development begins, this section should be updated with:
- Environment setup instructions
- Docker commands for local development
- API testing procedures
- Deployment pipelines