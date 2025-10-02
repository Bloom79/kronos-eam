# Workflow Enhancement Guide

## Overview

The workflow system has been comprehensively enhanced based on the Italian solar panel installation ProcessGuide, incorporating all 9 phases from initial evaluation to final activation, plus maintenance workflows. The system now includes:

- **Complete Installation Workflows**: From evaluation to customs declaration
- **Specialized Workflows**: Quick residential, large commercial, CER community, and maintenance
- **Document Templates**: 30+ templates for all required forms and checklists
- **Conditional Logic**: Smart workflow adaptation based on plant characteristics
- **2025 Regulatory Compliance**: Updated with latest Italian regulations and incentives

## Key Enhancements

### 1. Comprehensive Workflow Templates (`workflowTemplates.ts`)

#### Main Installation Workflow
- **ID**: `installazione-completa-fotovoltaico`
- **Duration**: 180 days
- **Phases**: All 9 phases with detailed tasks, documents, and checkpoints
- **Key Features**:
  - Phase-specific requirements with exact document lists
  - Portal URLs and authentication methods
  - Cost breakdowns and payment details
  - Conditional tasks (e.g., customs only for >20kW)

#### Specialized Workflows

1. **Quick Residential (<6kW)**
   - Simplified CILA procedure
   - 2-day express installation
   - Fast-track SSP activation

2. **Commercial/Industrial (>20kW)**
   - Regional Authorization (AU) process
   - Medium voltage connection
   - Complete customs registration

3. **CER Community Energy**
   - PNRR 40% funding process
   - Legal entity constitution
   - Member contract management

4. **Annual Maintenance**
   - Preventive maintenance
   - Compliance declarations
   - Performance monitoring

### 2. Enhanced Phase Templates (`phaseTemplates.json`)

Each phase now includes:

- **Detailed Task Specifications**:
  ```json
  {
    "name": "Task Name",
    "tipo_pratica": "Practice Type",
    "documenti_richiesti": ["Required documents"],
    "checkpoints": ["Verification points"],
    "portal_url": "Official portal",
    "required_credentials": "SPID/CIE/CNS",
    "cost_amount": 150,
    "regulatory_deadline": "30 days"
  }
  ```

- **Portal Navigation Guides**: Step-by-step instructions for government portals
- **Technical Specifications**: Exact requirements (e.g., "portata minima 25 kg/m²")
- **Cost Breakdowns**: TICA calculations, connection fees, incentives
- **Safety Requirements**: DPI lists, procedures, certifications

### 3. Document Template System (`documentTemplates.ts`)

30+ document templates organized by category:

- **Authorization**: PAS, CILA, AU forms
- **Technical**: Schemas, reports, Model Unico
- **Economic**: Business plans, cost calculators
- **Safety**: POS, DVR, checklists
- **Compliance**: DiCo, test reports, certificates
- **Fiscal**: Customs declarations, annual reports
- **Maintenance**: Registers, performance reports

Each template includes:
- Required fields with validation
- Official URLs where applicable
- Version tracking
- Regulatory references

### 4. Conditional Workflow Logic (`workflowConditions.ts`)

Smart conditions that adapt workflows based on:

- **Plant Characteristics**: Power, type, location
- **Authorization Path**: PAS vs CILA vs AU selection
- **Incentive Eligibility**: Automatic qualification checks
- **Safety Requirements**: PSC/CSE requirements
- **Fiscal Obligations**: Customs thresholds

Example usage:
```typescript
const context: WorkflowContext = {
  powerKw: 50,
  plantType: 'commercial',
  locationConstraints: { isProtectedArea: false },
  cityPopulation: 3000
};

const authPath = getRecommendedAuthorizationPath(context); // Returns 'PAS'
const incentives = calculateEstimatedIncentives(context);
const applicableTasks = getApplicableWorkflowTasks(tasks, context);
```

## Implementation Guide

### 1. Using the Workflow System

```typescript
// Get complete installation workflow
const mainWorkflow = workflowTemplates.find(w => 
  w.id === 'installazione-completa-fotovoltaico'
);

// Filter tasks based on conditions
const context: WorkflowContext = {
  powerKw: 15,
  plantType: 'residential',
  ownerType: 'individual'
};

const tasks = getApplicableWorkflowTasks(mainWorkflow.tasks, context);
```

### 2. Document Generation

```typescript
// Get templates for a phase
const designTemplates = getTemplatesForWorkflowPhase('DESIGN');

// Validate document data
const validationResult = validateDocumentFields('pas-standard', {
  comune: 'Milano',
  richiedente: 'Mario Rossi',
  potenza: 20
});
```

### 3. Workflow Customization

The system supports customization through:
- Conditional task inclusion
- Dynamic document requirements
- Context-aware cost calculations
- Automated incentive qualification

### 4. Integration Points

#### Portal Integration
- E-Distribuzione for DSO connection
- GAUDÌ for Terna registration
- GSE Area Clienti for incentives
- PUDM for customs declarations

#### Authentication Methods
- SPID: Primary for most portals
- CIE: Alternative digital identity
- CNS: Business digital certificate
- Email + OTP: DSO portals

## Best Practices

1. **Always validate context** before starting workflow:
   ```typescript
   const validation = validateWorkflowContext(context);
   if (!validation.valid) {
     console.error('Missing fields:', validation.missingFields);
   }
   ```

2. **Check conditions** for each phase:
   ```typescript
   const conditions = evaluateConditions(context);
   if (conditions['requires-customs-declaration']) {
     // Include customs phase
   }
   ```

3. **Use appropriate workflow** based on project type:
   - Residential <6kW → Quick installation workflow
   - Commercial >20kW → Full commercial workflow
   - Community project → CER workflow

4. **Track document completeness**:
   - Use template required fields
   - Validate before submission
   - Maintain version control

## Regulatory Compliance

The system is updated for 2025 Italian regulations:

- **Authorization**: D.Lgs. 387/2003, DM 19/05/2015
- **Technical**: CEI 0-21, CEI 82-25, CEI 64-8
- **Safety**: D.Lgs. 81/08
- **Fiscal**: Customs regulations for >20kW
- **Incentives**: 
  - Bonus 50% (until 31/12/2025)
  - Reddito Energetico Nazionale
  - CER PNRR funds

## Future Enhancements

1. **API Integration**: Direct portal submission
2. **AI Assistant**: Guided workflow completion
3. **Mobile App**: On-site checklist completion
4. **Blockchain**: Document authenticity verification
5. **IoT Integration**: Automatic performance monitoring