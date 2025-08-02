# Workflow Guide Pattern Documentation

## Overview

The Kronos EAM workflow system is designed as an interactive guide/wizard system that helps plant administrators, installers, and owners manage the complete lifecycle of renewable energy plants. Rather than automating processes, workflows guide users through complex bureaucratic procedures by providing step-by-step instructions, document checklists, and role-based task assignments.

## Key Design Principles

### 1. User Guidance Over Automation
- Workflows are **wizards** that guide users through processes
- Each task provides detailed instructions and checklists
- External portal links and required credentials are clearly indicated
- No attempt to automate SPID/CNS authenticated processes

### 2. Multi-Role Support
- **Plant Installers**: Initial setup and technical documentation
- **Plant Administrators**: Day-to-day management and compliance
- **Plant Owners**: Strategic decisions and authorizations
- **Technicians**: Maintenance and technical tasks
- **Consultants**: Specialized compliance and regulatory tasks

### 3. Lifecycle Management
Workflows cover the entire plant lifecycle:
- **Installation Phase**: From planning to grid connection
- **Registration Phase**: GAUDÌ, GSE, and regulatory registrations
- **Operational Phase**: Recurring compliance and maintenance
- **Decommissioning Phase**: End-of-life procedures

## Database Schema Updates

### Renamed Fields
- `automation_config` → `guide_config`: Stores instructions and guidance
- `automation_available` → `has_guide`: Indicates if detailed guidance exists

### New Fields

#### WorkflowTask Model
```python
instructions = Column(Text)  # Step-by-step instructions
checklist_items = Column(JSON)  # List of items to check/complete
external_resources = Column(JSON)  # Links to guides, forms, portals
allowed_roles = Column(JSON)  # Roles that can handle this task
suggested_assignee_role = Column(String(50))  # Recommended role
```

#### Workflow Model
```python
created_by_role = Column(String(50))  # Role of workflow creator
```

## Frontend Implementation

### WorkflowWizard Component
The wizard now includes:
1. **Role Selection**: Users specify their role when creating workflows
2. **Task Assignment Suggestions**: Based on task type and user roles
3. **Guide Information Display**: Instructions and checklists for each task
4. **External Resource Links**: Direct links to relevant portals and forms

### User Experience Flow
1. User selects their role (installer, administrator, owner)
2. Wizard suggests appropriate workflow templates
3. Tasks are pre-assigned based on role suggestions
4. Each task shows:
   - Required entity/portal
   - Step-by-step instructions
   - Document checklist
   - External resource links

## API Changes

### Workflow Creation
```json
POST /api/v1/workflows
{
  "name": "New Plant Connection",
  "plant_id": 123,
  "template_id": 1,
  "created_by_role": "installer",
  "task_assignments": {
    "task_1": "mario.rossi@example.com"
  }
}
```

### Task Structure
```json
{
  "id": 1,
  "title": "Submit TICA Request",
  "ente_responsabile": "DSO",
  "portal_url": "https://portale.e-distribuzione.it",
  "required_credentials": "SPID",
  "instructions": "1. Access the DSO portal\n2. Navigate to 'New Connections'\n3. Fill the TICA form...",
  "checklist_items": [
    "Plant technical specifications prepared",
    "Property documents ready",
    "Power requirements calculated"
  ],
  "suggested_assignee_role": "technician",
  "allowed_roles": ["technician", "administrator"]
}
```

## Benefits of the Guide Pattern

1. **Legal Compliance**: Respects SPID/CNS authentication requirements
2. **Flexibility**: Users maintain control over external interactions
3. **Knowledge Transfer**: Builds user expertise over time
4. **Audit Trail**: Complete tracking of who did what and when
5. **Role Clarity**: Clear assignment of responsibilities
6. **Reduced Errors**: Checklists and instructions minimize mistakes

## Migration Notes

When migrating existing workflows:
1. Run migration: `alembic upgrade head`
2. Update any custom workflows to use `guide_config` instead of `automation_config`
3. Add role information to existing users
4. Review and update task assignments based on new role suggestions

## Future Enhancements

1. **Role-Based Dashboards**: Customized views for each user role
2. **Progress Tracking**: Visual indicators of workflow completion by role
3. **Knowledge Base Integration**: Link tasks to detailed how-to articles
4. **Template Library**: Role-specific workflow templates
5. **Notification System**: Role-aware task notifications