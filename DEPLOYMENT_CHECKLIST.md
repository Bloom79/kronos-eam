# Deployment Readiness Checklist

## Pre-Deployment Database Alignment

### ✅ Completed Items
1. **Created database alignment check script** (`scripts/check_db_alignment.py`)
2. **Generated alignment report** showing current issues
3. **Created single consolidated migration** (`alembic/versions/001_complete_initial_schema.py`)
   - Includes all tables with correct structure
   - Plant Owner role included from the start
   - All enums use proper space-separated format
   - No migration history baggage
4. **Updated init_data.py** to use correct enum formats
5. **Updated entrypoint.sh** with optional alignment check
6. **Fixed translation files** for Italian/English support
7. **Archived old migrations** to `alembic/versions/archive/`

### ⚠️ Required Before Deployment

1. **For fresh deployment** (recommended):
   - No action needed - the single migration will create everything correctly
   
2. **For local testing with existing database**:
   ```bash
   # Backup current database first!
   pg_dump kronos_eam > kronos_eam_backup.sql
   
   # Reset alembic version
   psql -d kronos_eam -f scripts/reset_alembic_version.sql
   ```

3. **Test application locally**:
   - Start backend with the single migration
   - Verify Plant Owner role works
   - Check plant status/type displays correctly
   - Test language switching (IT/EN)

### 📋 Deployment Steps

1. **Initialize Git Repository**:
   ```bash
   git add .
   git commit -m "Initial commit: Kronos EAM with database alignment fixes"
   git remote add origin https://github.com/YOUR_USERNAME/kronos-eam.git
   git push -u origin main
   ```

2. **Set up GitHub Secrets**:
   - `GCP_PROJECT_ID`: Your GCP project ID
   - `GCP_SA_KEY`: Service account JSON key
   - `DB_PASSWORD`: KronosAdmin2024!

3. **Run GCP Setup**:
   ```bash
   cd deploy
   ./gcp-setup.sh
   ```

4. **Trigger Deployment**:
   - Push to main branch
   - GitHub Actions will deploy automatically

### 🔍 Post-Deployment Verification

1. **Check migration status**:
   ```bash
   gcloud run services logs read kronos-backend --limit=50 | grep "alembic"
   ```

2. **Verify database schema**:
   - Connect to Cloud SQL
   - Run: `SELECT * FROM alembic_version;`
   - Should show: `fix_enum_formats`

3. **Test application**:
   - Access frontend URL
   - Login as demo@kronos-eam.local
   - Create user with Plant Owner role
   - Create/edit plants
   - Switch languages

### ⚡ Rollback Plan

If issues occur:

1. **Revert to previous migration**:
   ```bash
   alembic downgrade f2d81f9341a6
   ```

2. **Redeploy previous version**:
   ```bash
   gcloud run services update-traffic kronos-backend --to-revisions=PREVIOUS_REVISION=100
   ```

### 📊 Expected Database State After Deployment

- **userroleenum**: Admin, Asset Manager, Plant Owner, Operator, Viewer
- **plantstatusenum**: In Operation, In Authorization, Under Construction, Decommissioned
- **planttypeenum**: Photovoltaic, Wind, Hydroelectric, Biomass, Geothermal
- All plant records updated to new enum formats
- Demo data created with correct formats

### 🚀 Ready for Production

Once all checks pass:
1. Database schema aligned ✓
2. Migrations tested locally ✓
3. Application functions correctly ✓
4. Language switching works ✓
5. Plant Owner role functional ✓

The platform is ready for deployment to Google Cloud Platform!