# Kronos EAM - Deployment Quick Reference

## 🚀 Current Deployment Status
- **GitHub Repository**: https://github.com/Bloom79/kronos-eam
- **GitHub Actions**: https://github.com/Bloom79/kronos-eam/actions
- **GCP Project**: `kronos-eam-prod-20250802`
- **Region**: `europe-west1`

## 📊 Architecture Overview

```mermaid
graph LR
    subgraph "Local Development"
        Dev[Your Machine<br/>localhost:3000/8000]
        LocalDB[(PostgreSQL<br/>localhost:5432)]
    end
    
    subgraph "GitHub"
        Repo[kronos-eam<br/>Repository]
        Actions[GitHub Actions<br/>CI/CD]
    end
    
    subgraph "Google Cloud Platform"
        CloudRun[Cloud Run<br/>2 Services]
        CloudSQL[(Cloud SQL<br/>PostgreSQL)]
        AR[Artifact Registry<br/>Docker Images]
    end
    
    Dev -->|git push| Repo
    Repo -->|trigger| Actions
    Actions -->|deploy| CloudRun
    CloudRun -->|connect| CloudSQL
    Actions -->|push images| AR
    
    style Dev fill:#f9f,stroke:#333
    style Actions fill:#fb0,stroke:#333
    style CloudRun fill:#4285f4,stroke:#333
    style CloudSQL fill:#ea4335,stroke:#333
```

## 🗄️ Database Configurations

### Local Development
```bash
Host: localhost
Port: 5432
Database: kronos_eam
User: kronos
Password: KronosAdmin2024!
URL: postgresql://kronos:KronosAdmin2024!@localhost:5432/kronos_eam
```

### Cloud Production (Auto-created)
```bash
Instance: kronos-db
Database: kronos_eam  
User: postgres
Password: KronosAdmin2024! (from secrets)
Type: Cloud SQL PostgreSQL 14
Size: db-f1-micro (0.6GB RAM)
Connection: Via Cloud SQL Proxy only
```

## 🔑 Key URLs & Commands

### Development URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Deployment Commands
```bash
# Check deployment status
https://github.com/Bloom79/kronos-eam/actions

# Verify cloud services
./verify-deployment.sh

# View backend logs
gcloud run services logs read kronos-backend \
  --project=kronos-eam-prod-20250802 --limit=50

# Connect to Cloud SQL
gcloud sql connect kronos-db --user=postgres \
  --project=kronos-eam-prod-20250802
```

## 🔐 Credentials

### Demo User (All Environments)
- **Email**: `demo@kronos-eam.local`
- **Password**: `Demo2024!`
- **Role**: Admin
- **Tenant**: demo

### Service Accounts
- **Deployment**: `kronos-deploy@kronos-eam-prod-20250802.iam.gserviceaccount.com`
- **Backend**: `kronos-backend@kronos-eam-prod-20250802.iam.gserviceaccount.com`
- **Frontend**: `kronos-frontend@kronos-eam-prod-20250802.iam.gserviceaccount.com`

## 💰 Cost Breakdown

| Service | Monthly Cost |
|---------|-------------|
| Cloud Run (Backend) | ~$15 |
| Cloud Run (Frontend) | ~$10 |
| Cloud SQL (db-f1-micro) | ~$15 |
| Load Balancer | ~$20 |
| Storage & Others | ~$10 |
| **Total Estimate** | **~$70/month** |

## 🚨 Troubleshooting

### Deployment Failed?
1. Check billing is enabled
2. Verify all APIs are enabled
3. Check GitHub secrets are set correctly
4. Re-run failed workflow from Actions page

### Can't Connect to Database?
1. Ensure Cloud SQL instance is running
2. Check Cloud SQL Proxy is active
3. Verify password in Secret Manager
4. Check service account permissions

### Application Not Loading?
1. Check Cloud Run service status
2. View application logs
3. Verify environment variables
4. Check database migrations completed

## 📝 Important Notes

1. **Database Independence**: Cloud database is completely separate from local
2. **Automatic Migrations**: Run on every deployment via entrypoint.sh
3. **No Public IPs**: All services use private networking
4. **Automatic Backups**: Daily at 3 AM CET with 7-day retention
5. **SSL Required**: All connections must use HTTPS/TLS

## 🔄 Next Deployment

To trigger a new deployment:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Monitor at: https://github.com/Bloom79/kronos-eam/actions