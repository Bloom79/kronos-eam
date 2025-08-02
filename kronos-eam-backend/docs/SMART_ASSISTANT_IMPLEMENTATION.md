# Smart Assistant Implementation Plan

> **Document Version**: 1.0  
> **Created**: December 2024  
> **Status**: Implementation Ready

## Overview

Following the RPA feasibility analysis, Kronos EAM implements a "Smart Assistant" approach that provides 80% time savings while maintaining full legal compliance with Italian digital identity requirements.

## Core Principles

1. **Compliance First**: Never attempt to automate SPID/CNS authentication
2. **Maximum Assistance**: Pre-fill everything that can be legally automated
3. **Guided Workflows**: Provide step-by-step instructions for manual steps
4. **API Integration**: Use official APIs where available
5. **Hybrid Automation**: Combine automated preparation with human checkpoints

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Smart Assistant                      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐    │
│  │  Document   │ │   Portal    │ │    Workflow     │    │
│  │ Generation  │ │ Integration │ │   Automation    │    │
│  └─────────────┘ └─────────────┘ └─────────────────┘    │
└─────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │ PDF Forms   │   │  API Calls  │   │ Monitoring  │
    │ Generator   │   │ (Terna/DSO) │   │  Services   │
    └─────────────┘   └─────────────┘   └─────────────┘
```

## Implementation Phases

### Phase 3.1: Document Generation & Form Pre-filling

#### Core Components

1. **PDF Form Generator**
   ```python
   class PDFFormGenerator:
       def generate_gse_rid_form(self, plant_data: PlantData) -> bytes:
           # Generate pre-filled RID application
           pass
       
       def generate_terna_gaudi_form(self, plant_data: PlantData) -> bytes:
           # Generate GAUDÌ registration form
           pass
       
       def generate_dso_tica_request(self, plant_data: PlantData) -> bytes:
           # Generate TICA request with all technical data
           pass
   ```

2. **Smart Data Mapping**
   ```python
   class DataMapper:
       def map_plant_to_gse_format(self, plant: Impianto) -> Dict[str, Any]:
           # Convert internal plant data to GSE required format
           return {
               'codice_censimp': plant.anagrafica.codice_censimp,
               'potenza_installata': self.convert_kw_to_gse_format(plant.potenza_installata),
               'data_attivazione': self.format_date_for_gse(plant.data_attivazione),
               # ... all required fields
           }
   ```

3. **Pre-calculation Engines**
   ```python
   class CalculationEngine:
       def calculate_gse_incentives(self, plant_data: PlantData) -> IncentiveCalculation:
           # Calculate expected incentives for RID/SSP
           pass
       
       def calculate_utf_fees(self, annual_production: float) -> UTFFeeCalculation:
           # Calculate annual UTF license fees
           pass
   ```

#### Templates by Portal

1. **GSE Templates**
   - RID application form
   - SSP registration form
   - Anti-mafia declaration
   - Incentive modification requests

2. **Terna Templates**
   - GAUDÌ plant registration
   - Technical data updates
   - Connection point modifications

3. **DSO Templates**
   - TICA cost estimate requests
   - Connection activation forms
   - Meter installation requests

4. **Dogane Templates**
   - UTF license applications
   - Annual consumption declarations
   - Fee payment forms

### Phase 3.2: Portal Integration & Monitoring

#### API Integration

1. **Terna API Client**
   ```python
   class TernaAPIClient:
       def __init__(self, certificate_path: str, api_key: str):
           self.session = requests.Session()
           self.session.cert = certificate_path
           self.session.headers['X-API-Key'] = api_key
       
       async def get_plant_data(self, censimp_code: str) -> PlantData:
           # Retrieve plant data from Terna
           pass
       
       async def update_technical_data(self, censimp_code: str, updates: dict) -> bool:
           # Update technical specifications
           pass
   ```

2. **E-Distribuzione B2B Client**
   ```python
   class EDistribuzioneClient:
       async def submit_tica_request(self, request_data: TICARequest) -> TICAResponse:
           # Submit TICA via B2B API
           pass
       
       async def check_connection_status(self, pod: str) -> ConnectionStatus:
           # Check connection status
           pass
   ```

#### Public Status Monitoring

1. **Portal Monitors**
   ```python
   class PortalMonitor:
       async def check_gse_announcements(self) -> List[Announcement]:
           # Scrape GSE public announcements
           pass
       
       async def monitor_regulation_changes(self) -> List[RegulationUpdate]:
           # Monitor for new regulations
           pass
   ```

2. **Status Checkers**
   ```python
   class StatusChecker:
       async def check_public_tica_status(self, request_id: str) -> TICAStatus:
           # Check TICA status on public pages
           pass
   ```

### Phase 3.3: Hybrid Automation Features

#### Guided Workflows

1. **Workflow Engine**
   ```python
   class GuidedWorkflow:
       def generate_gse_submission_guide(self, forms: List[bytes]) -> WorkflowGuide:
           return WorkflowGuide(
               steps=[
                   Step(
                       title="Access GSE Portal",
                       instruction="Navigate to https://areaclienti.gse.it",
                       screenshot="gse_login.png"
                   ),
                   Step(
                       title="Authenticate with SPID",
                       instruction="Click 'Entra con SPID' and follow authentication",
                       note="This step requires manual interaction"
                   ),
                   Step(
                       title="Upload Pre-filled Forms",
                       instruction="Use the generated forms from Kronos EAM",
                       files=forms
                   )
               ]
           )
   ```

2. **Document Packages**
   ```python
   class DocumentPackage:
       def create_gse_submission_package(self, plant_id: int) -> SubmissionPackage:
           return SubmissionPackage(
               forms=self.generate_all_forms(plant_id),
               supporting_docs=self.get_supporting_documents(plant_id),
               checklist=self.create_submission_checklist(),
               instructions=self.create_step_by_step_guide()
           )
   ```

#### Team Collaboration

1. **Task Assignment**
   ```python
   class TaskManager:
       def assign_submission_task(self, 
                                 submission: SubmissionPackage, 
                                 assignee: User) -> Task:
           return Task(
               type="portal_submission",
               assignee=assignee,
               deadline=self.calculate_deadline(),
               package=submission,
               instructions=submission.instructions
           )
   ```

2. **Progress Tracking**
   ```python
   class ProgressTracker:
       def update_submission_status(self, 
                                   task_id: str, 
                                   status: SubmissionStatus,
                                   confirmation_number: Optional[str] = None):
           # Track submission progress
           pass
   ```

## Service Implementation

### 1. Smart Assistant Service

```python
class SmartAssistantService:
    def __init__(self):
        self.pdf_generator = PDFFormGenerator()
        self.data_mapper = DataMapper()
        self.calculation_engine = CalculationEngine()
        self.workflow_engine = GuidedWorkflow()
    
    async def prepare_gse_submission(self, 
                                   plant_id: int, 
                                   submission_type: str) -> SubmissionPackage:
        """
        Prepare complete GSE submission package
        """
        plant = await self.get_plant_data(plant_id)
        
        # Generate forms
        forms = []
        if submission_type == "RID":
            forms.append(self.pdf_generator.generate_gse_rid_form(plant))
        elif submission_type == "SSP":
            forms.append(self.pdf_generator.generate_gse_ssp_form(plant))
        
        # Calculate values
        calculations = self.calculation_engine.calculate_gse_incentives(plant)
        
        # Create workflow guide
        guide = self.workflow_engine.generate_gse_submission_guide(forms)
        
        return SubmissionPackage(
            forms=forms,
            calculations=calculations,
            guide=guide,
            checklist=self.create_checklist(submission_type)
        )
    
    async def monitor_submission_status(self, 
                                      submission_id: str) -> SubmissionStatus:
        """
        Monitor submission status across all portals
        """
        # Check public status pages
        # Notify if manual check required
        pass
```

### 2. API Integration Service

```python
class PortalIntegrationService:
    def __init__(self):
        self.terna_client = TernaAPIClient()
        self.dso_client = EDistribuzioneClient()
        self.monitor = PortalMonitor()
    
    async def sync_with_terna(self, plant_id: int) -> SyncResult:
        """
        Sync plant data with Terna via API
        """
        plant = await self.get_plant_data(plant_id)
        censimp = plant.anagrafica.codice_censimp
        
        # Get latest data from Terna
        terna_data = await self.terna_client.get_plant_data(censimp)
        
        # Compare and update if needed
        if self.has_differences(plant, terna_data):
            updates = self.calculate_updates(plant, terna_data)
            result = await self.terna_client.update_technical_data(censimp, updates)
            return SyncResult(success=result, changes=updates)
        
        return SyncResult(success=True, changes=[])
```

## API Endpoints

### Smart Assistant Endpoints

```python
@router.post("/smart-assistant/prepare-submission")
async def prepare_submission(
    portal: PortalType,
    submission_type: str,
    plant_id: int,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Prepare complete submission package"""
    pass

@router.get("/smart-assistant/generate-forms/{plant_id}")
async def generate_forms(
    plant_id: int,
    portal: PortalType,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Generate pre-filled forms for portal"""
    pass

@router.post("/smart-assistant/track-submission")
async def track_submission(
    submission_data: SubmissionTrackingData,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Track submission status"""
    pass
```

### Portal Integration Endpoints

```python
@router.post("/portal-integration/sync-terna")
async def sync_with_terna(
    plant_id: int,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Sync plant data with Terna API"""
    pass

@router.get("/portal-integration/status/{portal}")
async def check_portal_status(
    portal: PortalType,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Check portal availability and announcements"""
    pass
```

## Benefits of Smart Assistant Approach

### Quantified Value Proposition

| Manual Process | Smart Assistant | Time Saved |
|----------------|-----------------|------------|
| GSE RID Submission (2 hours) | Pre-filled forms + guide (20 min) | 85% |
| Terna Registration (90 min) | API sync + forms (15 min) | 83% |
| DSO TICA Request (45 min) | API submission (5 min) | 89% |
| UTF Declaration (60 min) | EDI file generation (10 min) | 83% |

**Average Time Savings: 85%**

### User Experience

1. **Before Smart Assistant**:
   - Log into 4-5 different portals
   - Remember different credentials
   - Fill the same data multiple times
   - Calculate values manually
   - Track deadlines in spreadsheets

2. **With Smart Assistant**:
   - Single Kronos EAM interface
   - All forms pre-filled and ready
   - Step-by-step guidance
   - Automatic deadline tracking
   - Team collaboration built-in

### Compliance Benefits

1. **Legal Compliance**: Respects all SPID/CNS requirements
2. **Audit Trail**: Complete record of all submissions
3. **Error Reduction**: No manual data entry errors
4. **Deadline Management**: Never miss a compliance deadline
5. **Document Versioning**: Track all submission versions

## Risk Mitigation

### Technical Risks

1. **Portal Changes**: Monitor for UI changes, update templates
2. **API Changes**: Version management, fallback to forms
3. **Calculation Errors**: Validation layers, user review required

### Legal Risks

1. **Authentication**: Never automate SPID/CNS
2. **Data Privacy**: Encrypt all stored data
3. **Digital Signatures**: Always require human approval

### Business Risks

1. **User Expectations**: Clear communication about approach
2. **Training**: Comprehensive user training program
3. **Support**: Dedicated support for portal interactions

## Success Metrics

### Primary KPIs

- **Time Savings**: Target 80% reduction in bureaucratic time
- **Error Reduction**: Target 95% reduction in form errors
- **Deadline Compliance**: Target 100% on-time submissions
- **User Satisfaction**: Target 4.5/5 user rating

### Secondary KPIs

- **API Usage**: Percentage of operations via API vs manual
- **Form Generation**: Number of forms auto-generated
- **Status Monitoring**: Percentage of statuses auto-tracked
- **Team Collaboration**: Usage of collaboration features

## Implementation Timeline

### Week 1-2: Foundation
- PDF form generation service
- Data mapping engines
- Basic calculation logic

### Week 3-4: Portal Integration
- Terna API integration
- E-Distribuzione B2B client
- Public status monitoring

### Week 5-6: User Experience
- Guided workflow engine
- Document package creation
- Team collaboration features

### Week 7-8: Testing & Refinement
- End-to-end testing
- User acceptance testing
- Performance optimization

This Smart Assistant approach delivers substantial value while respecting the technical and legal constraints of the Italian energy sector, positioning Kronos EAM as an intelligent bureaucracy management platform rather than a full automation solution.