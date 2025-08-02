# Kronos EAM Testing Guide

This document provides testing procedures and common troubleshooting steps for the Kronos EAM application.

## Test Credentials

### Demo User (Admin)
- **Email**: mario.rossi@energysolutions.it
- **Password**: Demo123!
- **Role**: Admin
- **Tenant**: demo

## API Testing

### 1. Authentication

#### Login via cURL
```bash
# Login and get access token
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=mario.rossi@energysolutions.it&password=Demo123!"
```

Response will include:
- `access_token`: JWT token for API requests
- `refresh_token`: Token for refreshing access
- `expires_in`: Token expiry time in seconds (1800 = 30 minutes)

#### Using the Token
```bash
# Example: Get plants list
curl -X GET "http://localhost:8000/api/v1/plants/?skip=0&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Automated Testing Scripts

#### 1. Plants API Test Suite
```bash
cd /home/bloom/sentrics/kronos-eam-backend
source venv/bin/activate
python test_plants_api.py
```

This script automatically:
- Checks API health
- Authenticates with demo credentials
- Tests plants list endpoint
- Tests plant detail endpoint
- Provides detailed error reporting

#### 2. Frontend Integration Test
```bash
cd /home/bloom/sentrics/kronos-eam-backend
source venv/bin/activate
python test_frontend_plants.py
```

This script validates:
- Authentication flow
- Plants API response structure
- CORS configuration
- Frontend-backend compatibility

### 2. Common API Endpoints

#### Plants Management
```bash
# List plants
GET /api/v1/plants/?skip=0&limit=20&sort_by=name&sort_order=asc

# Get single plant
GET /api/v1/plants/{id}

# Create plant
POST /api/v1/plants/
{
  "name": "Plant Name",
  "code": "PLANT001",
  "power": "1.5 MW",
  "power_kw": 1500,
  "status": "In Operation",
  "type": "Photovoltaic",
  "location": "Location Name"
}
```

#### Workflow Management
```bash
# List workflows
GET /api/v1/workflow/?skip=0&limit=20

# Get workflow templates
GET /api/v1/workflow/templates

# Create workflow instance
POST /api/v1/workflow/
```

## Frontend Testing

### Running the Frontend
```bash
cd /home/bloom/sentrics/kronos-eam-react
npm start
# Opens at http://localhost:3000
```

### Manual UI Testing Flow
1. Navigate to http://localhost:3000
2. Login with demo credentials
3. Test main features:
   - Dashboard overview
   - Plants list and management
   - Workflow creation and tracking
   - Document management
   - User settings and language switching

### Language Testing
- Click language selector in header
- Switch between Italian and English
- Verify all UI elements translate correctly

## Backend Service Management

### Starting Backend
```bash
cd /home/bloom/sentrics/kronos-eam-backend
source venv/bin/activate
export PYTHONPATH=/home/bloom/sentrics/kronos-eam-backend
python app/main.py
```

### Checking Backend Status
```bash
# Check if backend is running
ps aux | grep "python app/main.py"

# Check backend logs
tail -f logs/api.log

# Test health endpoint
curl http://localhost:8000/health
```

### Restarting Backend
```bash
# Kill existing process
lsof -ti:8000 | xargs kill -9

# Start backend
cd /home/bloom/sentrics/kronos-eam-backend
source venv/bin/activate
export PYTHONPATH=/home/bloom/sentrics/kronos-eam-backend
python app/main.py &
```

## Database Testing

### Connect to PostgreSQL
```bash
psql -U kronos_user -d kronos_db -h localhost
# Password: kronos_password_123
```

### Check Sample Data
```sql
-- Check plants
SELECT id, name, code, power_kw, status FROM plants WHERE tenant_id = 'demo';

-- Check users
SELECT id, email, name, role, status FROM users WHERE tenant_id = 'demo';

-- Check workflows
SELECT id, name, status, phase FROM workflows WHERE tenant_id = 'demo';
```

## Common Issues and Solutions

### 1. "Not authenticated" Error
**Problem**: API returns 401 or "Not authenticated"
**Solution**: 
- Ensure you're using a valid access token
- Check token hasn't expired (30 minute expiry)
- Include "Bearer " prefix in Authorization header

### 2. Plants Not Loading
**Problem**: Plants page shows loading spinner indefinitely
**Solution**:
- Check backend is running: `ps aux | grep main.py`
- Verify authentication token in browser localStorage
- Check browser console for errors
- Ensure sample data exists in database

### 3. 500 Internal Server Errors
**Problem**: API returns 500 errors
**Solution**:
- Check backend logs: `tail -n 50 logs/api.log`
- Common causes:
  - Missing database columns
  - Enum value mismatches
  - Missing imports or circular dependencies

### 4. Frontend Compilation Errors
**Problem**: React app won't compile
**Solution**:
- Install missing dependencies: `npm install`
- Check for TypeScript errors: `npm run type-check`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Testing Checklist

Before deploying or after major changes:

- [ ] Backend starts without errors
- [ ] All API endpoints return 200/201 status codes
- [ ] Authentication flow works (login/logout/refresh)
- [ ] Plants CRUD operations work
- [ ] Workflows can be created and updated
- [ ] Frontend compiles without errors
- [ ] UI language switching works
- [ ] All pages load without console errors
- [ ] Data pagination works correctly
- [ ] Search and filters function properly

## Performance Testing

### API Response Times
```bash
# Test plants endpoint performance
time curl -X GET "http://localhost:8000/api/v1/plants/" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: < 200ms for list operations
```

### Database Query Performance
```sql
-- Check slow queries
SELECT query, calls, mean_time 
FROM pg_stat_statements 
WHERE mean_time > 100 
ORDER BY mean_time DESC;
```

## Integration Testing

### Test Multi-Tenant Isolation
1. Create data for tenant "demo"
2. Create another tenant "test"
3. Verify data is completely isolated
4. Check API responses only show tenant-specific data

### Test External Integrations
- GSE API connection (if configured)
- Email sending (password reset, notifications)
- Document storage and retrieval
- Export functionality (CSV/PDF)

## Quick Diagnostic Scripts

### 1. Full System Health Check
```bash
cd /home/bloom/sentrics/kronos-eam-backend
source venv/bin/activate

# Run all diagnostic tests
python test_plants_api.py
python test_frontend_plants.py
python simulate_browser_login.py
```

### 2. Frontend Debugging Steps
If plants are not loading in the browser:

1. **Check Browser Console**
   ```javascript
   // In browser console (F12)
   localStorage.getItem('kronos_access_token')
   localStorage.getItem('kronos_user_data')
   ```

2. **Test API Directly from Browser Console**
   ```javascript
   // Get token
   const token = localStorage.getItem('kronos_access_token');
   
   // Test plants API
   fetch('http://localhost:8000/api/v1/plants/', {
     headers: {
       'Authorization': `Bearer ${token}`,
       'Accept': 'application/json'
     }
   })
   .then(res => res.json())
   .then(data => console.log('Plants:', data))
   .catch(err => console.error('Error:', err));
   ```

3. **Clear Browser Cache**
   ```javascript
   // If having issues, clear all app data
   localStorage.clear();
   sessionStorage.clear();
   // Then refresh and login again
   ```

### 3. Common Fixes Applied
- Fixed `ComplianceChecklistResponse.last_updated` → `last_update` field mismatch
- Fixed `PlantResponse.registry_data` → `registry` field mismatch
- Added proper error handling in plants endpoint
- Ensured proper CORS configuration for frontend

### 4. Verified Working Flow
1. Backend API: ✓ Authentication working
2. Backend API: ✓ Plants endpoint returning data
3. Frontend: ✓ Can authenticate and store tokens
4. Frontend: ✓ Can fetch and display plants data
5. Database: ✓ Contains 6 sample plants for demo tenant