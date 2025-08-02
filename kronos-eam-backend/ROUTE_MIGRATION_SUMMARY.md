# API Route Migration Summary - Italian to English

## Changes Made

### 1. File Renamed
- `app/api/v1/endpoints/plants.py` → `app/api/v1/endpoints/plants.py`

### 2. Route Changes
- `/plants` → `/plants`
- `/plants/{plant_id}/manutenzioni` → `/plants/{plant_id}/maintenance`

### 3. Router Registration Updates
- In `app/api/v1/api.py`:
  - Import changed from `impianti` to `plants`
  - Router prefix changed from `/plants` to `/plants`
  - Tags changed from `["impianti"]` to `["plants"]`

- In `run_full_backend.py`:
  - Import changed from `impianti` to `plants`
  - Router prefix changed from `/api/v1/plants` to `/api/v1/plants`

### 4. Function Names Updated
- `list_impianti` → `list_plants`
- `get_impianti_summary` → `get_plants_summary`
- `get_impianto` → `get_plant`
- `create_impianto` → `create_plant`
- `update_impianto` → `update_plant`
- `delete_impianto` → `delete_plant`
- `get_impianto_performance` → `get_plant_performance`
- `get_impianto_maintenance` → `get_plant_maintenance`
- `get_impianto_metrics` → `get_plant_metrics`
- `bulk_update_impianti` → `bulk_update_plants`

### 5. Parameter Names Updated
- `impianto_id` → `plant_id` (throughout the file)
- `impianto` → `plant` (variable names)
- `impianti` → `plants` (variable names)

### 6. Schema Imports Updated
All Italian schema names were replaced with their English equivalents:
- `ImpiantoCreate` → `PlantCreate`
- `ImpiantoUpdate` → `PlantUpdate`
- `ImpiantoResponse` → `PlantResponse`
- `ImpiantoList` → `PlantList`
- `ImpiantoSummary` → `PlantSummary`
- `ImpiantoMetrics` → `PlantMetrics`
- `ManutenzioneCreate` → `MaintenanceCreate`
- `ManutenzioneUpdate` → `MaintenanceUpdate`
- `ManutenzioneResponse` → `MaintenanceResponse`

### 7. Variable Names Updated
- `manutenzioni` → `maintenances`
- `manutenzione` → `maintenance`
- `manutenzioni_count` → `maintenance_count`
- `manutenzioni_totali` → `total_maintenance`
- `manutenzioni_pianificate` → `planned_maintenance`
- `costo_manutenzione_totale` → `total_maintenance_cost`

### 8. Fixed Field References
- `impianti_autorizzati` → `authorized_plants` (in dashboard.py)
  - Note: The User model already uses `authorized_plants` field name

## Areas Not Changed (But Could Be Considered)

### Internal Variable Names
Many internal variables in other files still use Italian names (e.g., in dashboard.py):
- `impianti_query`, `impianti_ids`, `impianti_attivi`, `impianti_totali`

### Schema Field Names
Some schema fields still use Italian names (in dashboard.py schemas):
- `impianti_attivi`, `impianti_totali` in DashboardMetrics
- `ImpiantoStatusDistribution` class name
- `impianto` field in various schemas

### Database Column Names
The database models still reference Italian terms in some places:
- `impianto_id` foreign key in various tables

## Testing the New Routes

The API endpoints have been successfully migrated. Test the new routes:

```bash
# Old route (no longer works)
GET /api/v1/plants

# New route
GET /api/v1/plants

# Old maintenance route (no longer works)
GET /api/v1/plants/{id}/manutenzioni

# New maintenance route
GET /api/v1/plants/{id}/maintenance
```

## Next Steps

1. Update frontend API calls to use new `/plants` endpoints
2. Update API documentation
3. Consider migrating remaining Italian variable names and schema fields
4. Update any integration tests that reference the old routes