# Claude Code 2-Person Team Collaboration Setup - Kronos EAM

## Phase 1: Initial Setup (30 minutes)

### Step 1: Subscription Setup
**Each developer needs their own subscription** - Claude Code is NOT available in Team plans.

```bash
# Choose your subscription level:
# Pro: $20/month - Good for lighter development
# Max: $100-200/month - For heavy coding sessions

# Recommendation for 2-person teams:
# Developer A (lead): Claude Max ($100/month)
# Developer B: Claude Pro ($20/month)
# Total: $120/month
```

### Step 2: Install Claude Code
```bash
# Both developers run:
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version

# Initial configuration
claude config
# Follow prompts to authenticate with your Claude account
```

### Step 3: Project Repository Setup
```bash
# Clone existing repository
git clone <repo-url> kronos-eam
cd kronos-eam

# Add Claude-specific files to .gitignore
echo "# Claude Code local files" >> .gitignore
echo ".claude/sessions/" >> .gitignore
echo "CLAUDE.local.md" >> .gitignore
```

## Phase 2: Collaboration Infrastructure (45 minutes)

### Step 4: Git Worktree Strategy
**This is the key to avoiding conflicts** - each developer works in separate worktrees.

```bash
# Developer A (in main repo):
git worktree add ../kronos-frontend feature/frontend-dashboard
git worktree add ../kronos-workflows feature/workflow-engine

# Developer B gets repository:
git clone <repo-url> kronos-eam
cd kronos-eam
git worktree add ../kronos-backend feature/backend-api
git worktree add ../kronos-integrations feature/external-integrations

# Each developer works in their assigned worktree:
# Developer A: cd ../kronos-frontend && claude
# Developer B: cd ../kronos-backend && claude
```

### Step 5: Create Team CLAUDE.md
**This file is critical** - it gives Claude context about your team's standards.

```bash
# Update the existing CLAUDE.md in project root
# Ensure it includes team collaboration sections
```

**Add this collaboration section to CLAUDE.md:**

```markdown
## Team Collaboration

### Git Workflow
- **Branch naming**: `feature/[component]-[feature-name]`
  - Components: frontend, backend, workflow, integration, docs
- **Commit format**: `[type]([scope]): brief description`
  - Types: feat, fix, docs, style, refactor, test, chore, perf
  - Scopes: api, ui, workflow, auth, db, integration
- **PR title**: Include component name and brief description
- **Merge strategy**: Squash and merge for features, merge commit for releases

### Code Standards

#### Backend (Python/FastAPI)
- **Style**: Black formatter, isort for imports, flake8 for linting
- **Type hints**: Required for all functions and methods
- **Testing**: pytest with 80% minimum coverage
- **Documentation**: Docstrings for all public functions
- **API**: RESTful conventions, Pydantic for validation

#### Frontend (React/TypeScript)
- **Style**: Prettier + ESLint configuration
- **Components**: Functional components with TypeScript
- **State**: Redux Toolkit for global state
- **UI**: Material-UI (MUI) components, Tailwind for utilities
- **Testing**: React Testing Library + Jest

### Claude Code Guidelines
- **Context**: Always read CLAUDE.md at session start
- **Changes**: Show modified files and explain approach
- **Testing**: Write tests alongside implementation
- **Review**: All Claude code needs human review before merge
- **Documentation**: Update relevant docs with changes

## Development Commands

### Backend
```bash
cd kronos-eam-backend
source venv/bin/activate       # Activate Python environment
./run_api.sh                   # Start API server (includes protobuf fix)
pytest                         # Run tests
black app/                     # Format code
mypy app/                      # Type checking
```

### Frontend
```bash
cd kronos-eam-react
npm install                    # Install dependencies
npm start                      # Start development server
npm test                       # Run tests
npm run build                  # Production build
npm run lint                   # Check code style
```

### Docker Services
```bash
cd kronos-eam-backend
docker-compose up -d           # Start PostgreSQL, Redis, Qdrant
docker-compose ps              # Check service status
docker-compose logs [service]  # View logs
```
```

### Step 6: Individual Developer Setup
Each developer creates their personal configuration:

```bash
# Create personal Claude settings (not committed to Git)
touch CLAUDE.local.md
```

**Developer A (Frontend & Workflow Lead) - CLAUDE.local.md:**
```markdown
# Personal Claude Settings - Developer A

## My Responsibilities
- React frontend development
- Workflow UI components
- Dashboard and data visualizations
- Frontend testing and performance

## My Preferences
- Use TypeScript strict mode
- Material-UI components with Tailwind utilities
- Redux Toolkit for state management
- Chart.js for data visualization
- Focus on responsive design

## My Working Style
- Start with TypeScript interfaces
- Build reusable components
- Implement proper error boundaries
- Focus on UX and accessibility
```

**Developer B (Backend & Integration Lead) - CLAUDE.local.md:**
```markdown
# Personal Claude Settings - Developer B

## My Responsibilities
- FastAPI backend development
- External system integrations (GSE, Terna, DSO)
- Database schema and migrations
- Authentication and security

## My Preferences
- FastAPI with comprehensive type hints
- SQLAlchemy with proper relationships
- Pydantic for strict validation
- Comprehensive error handling
- Focus on performance and security

## My Working Style
- API-first design approach
- Write integration tests first
- Document all external integrations
- Implement proper retry mechanisms
```

## Phase 3: Workflow Implementation (Daily Operations)

### Step 7: Daily Workflow Pattern

**Morning Sync (10 minutes)**
```bash
# Both developers:
git checkout main
git pull origin main

# Check what teammate worked on
git log --oneline --since="1 day ago"

# Create/switch to your worktree
cd ../your-assigned-worktree
git checkout -b feature/[component]-[today's-feature]
```

**Starting Claude Session**
```bash
# In your worktree directory:
claude

# First command in each session:
/read CLAUDE.md
/read CLAUDE.local.md

# Then start your work:
"Today I'm working on [specific feature] for Kronos EAM. Let's start by understanding the current implementation."
```

### Step 8: Feature Development Workflow

**Example: Developer A working on workflow phase UI**
```bash
cd ../kronos-frontend
claude

# In Claude session:
/read CLAUDE.md
"I need to enhance the workflow phase selector component. Let's:
1. Review the current PhaseTemplateSelector implementation
2. Add loading states and error handling
3. Implement template filtering by power requirements
4. Add visual indicators for phase completion
5. Write comprehensive tests

Show me the current component structure first."
```

**Example: Developer B working on GSE integration**
```bash
cd ../kronos-backend
claude

# In Claude session:
/read CLAUDE.md
"I need to implement GSE portal integration. Let's:
1. Review the current integration service structure
2. Design the GSE-specific data models
3. Implement form pre-filling logic
4. Add retry mechanisms for API calls
5. Create comprehensive integration tests

Start by showing me the existing integration patterns."
```

### Step 9: Code Review and Integration

**Before Creating PR:**
```bash
# Backend checks
source venv/bin/activate
black app/
isort app/
flake8 app/
pytest
mypy app/

# Frontend checks
npm run lint
npm run test
npm run type-check

# If issues found, ask Claude to fix:
claude "Fix these linting errors in the Kronos EAM codebase: [paste errors]"
```

**Creating PR with Claude Code:**
```bash
git add .
git commit -m "feat(workflow): implement phase-based template selection"
git push origin feature/frontend-phase-selector

# Create PR with this template:
```

**PR Template:**
```markdown
## Changes Made
- [List specific changes to Kronos EAM]

## Claude Code Contribution
- Generated by Claude Code: [percentage, e.g., 80%]
- Human review completed: ✅
- Tests written: ✅
- Documentation updated: ✅

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass (if applicable)
- [ ] Manual testing completed
- [ ] Tested with sample renewable energy data

## Kronos EAM Specific Checks
- [ ] Multi-tenant isolation verified
- [ ] External integration compatibility checked
- [ ] Compliance with Italian regulations considered
- [ ] Performance impact assessed

## Review Checklist
- [ ] Code follows Kronos EAM conventions
- [ ] Security considerations addressed
- [ ] Error handling implemented
- [ ] API documentation updated (if backend)
- [ ] UI is responsive (if frontend)
```

### Step 10: Merge Conflict Resolution

**When conflicts occur:**
```bash
# Pull latest changes
git checkout main
git pull origin main
git checkout your-feature-branch
git merge main

# If conflicts arise:
claude "I have merge conflicts in the Kronos EAM project. Help me resolve them by:
1. Understanding both the frontend React/TypeScript and backend FastAPI/Python changes
2. Preserving multi-tenant functionality
3. Maintaining API compatibility
4. Testing the merged result

Here are the conflicts: [paste conflict markers]"
```

## Phase 4: Advanced Collaboration Techniques

### Step 11: Shared Claude Commands
Create team-wide Claude commands for common Kronos EAM tasks:

```bash
mkdir -p .claude/commands
```

**Create `.claude/commands/implement-workflow-feature.md`:**
```markdown
Implement workflow feature: $ARGUMENTS

1. Read CLAUDE.md for Kronos EAM conventions
2. Analyze existing workflow models and services
3. Create/update Pydantic schemas if backend
4. Create/update TypeScript interfaces if frontend
5. Implement feature following established patterns
6. Add multi-tenant support
7. Write comprehensive tests
8. Update API documentation
9. Run all quality checks

Remember: Workflows must support Italian regulatory requirements
```

**Create `.claude/commands/implement-integration.md`:**
```markdown
Implement external integration: $ARGUMENTS

1. Review existing integration patterns in Kronos EAM
2. Design data models for the external system
3. Implement authentication mechanism (SPID/CNS aware)
4. Create retry and error handling logic
5. Add proper logging for compliance
6. Write integration tests with mocked responses
7. Document the integration flow
8. Consider Italian regulatory requirements

Follow the Smart Assistant approach - no full automation for SPID/CNS
```

### Step 12: Quality Assurance Automation

**Set up pre-commit hooks:**
```bash
# Backend pre-commit
pip install pre-commit
cat > .pre-commit-config.yaml << EOF
repos:
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort
  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
EOF

# Frontend package.json additions:
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### Step 13: Communication Protocols

**Daily Standup Template:**
```markdown
## Developer A Update (Frontend & Workflows)
- Yesterday: [e.g., Implemented phase selector UI]
- Today: [e.g., Adding workflow template filtering]
- Blockers: [e.g., Need API endpoint for power-based filtering]
- Claude highlights: [e.g., Used Claude to generate TypeScript types from API]

## Developer B Update (Backend & Integrations)
- Yesterday: [e.g., Created GSE integration service]
- Today: [e.g., Implementing GAUDÌ API client]
- Blockers: [e.g., Need test data for Terna integration]
- Claude highlights: [e.g., Claude helped design retry mechanism]

## Coordination
- Integration points: [e.g., New API endpoints needed for UI]
- Review requests: [PRs needing attention]
- Regulatory updates: [Any compliance changes to discuss]
```

## Phase 5: Troubleshooting Common Issues

### Problem: Claude Doesn't Understand Kronos EAM Context
**Solution:**
```bash
# In Claude session:
/clear
/read CLAUDE.md
/read CLAUDE.local.md
"I'm working on Kronos EAM, a renewable energy compliance platform for Italy. 
Specifically, I'm in the [backend/frontend] working on [specific feature]."
```

### Problem: Multi-tenant Data Isolation Issues
**Solution:**
```bash
claude "Review this code for multi-tenant isolation in Kronos EAM:
1. Ensure all queries filter by tenant_id
2. Check that tenant context is properly passed
3. Verify no cross-tenant data leakage
4. Add appropriate tests

[paste the code]"
```

### Problem: Integration Complexity
**Solution:**
Update CLAUDE.md with specific integration patterns:
```markdown
## Integration Patterns
- Always implement retry with exponential backoff
- Log all external API calls for compliance
- Handle SPID/CNS limitations gracefully
- Provide manual fallback options
- Document response formats thoroughly
```

## Success Metrics and Monitoring

### Weekly Review Questions:
1. How many integration points were successfully implemented?
2. What percentage of workflows are fully automated vs assisted?
3. How many regulatory compliance features were added?
4. What frontend components were made reusable?
5. Which external systems caused the most issues?

### Monthly Optimization:
1. Review and update integration documentation
2. Assess multi-tenant performance
3. Update compliance mappings
4. Refine error handling patterns
5. Evaluate need for additional Claude commands

## Quick Reference Commands

```bash
# Daily startup
cd your-worktree && claude
/read CLAUDE.md

# Backend development
source venv/bin/activate
./run_api.sh

# Frontend development  
npm start

# Run all services
docker-compose up -d
./run_api.sh
npm start

# Quality checks
# Backend:
black app/ && isort app/ && flake8 app/ && pytest

# Frontend:
npm run lint && npm test

# Create feature branch
git checkout -b feature/[component]-[name]

# Emergency fixes
claude "Fix this urgent issue in Kronos EAM: [paste error]"
```

This guide provides a complete framework for 2-person Claude Code collaboration on the Kronos EAM project, adapted for your specific tech stack and requirements.