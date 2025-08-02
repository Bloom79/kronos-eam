# Kronos EAM - Enterprise Asset Management for Renewable Energy

[![Deploy to Google Cloud Run](https://github.com/YOUR_USERNAME/kronos-eam/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/kronos-eam/actions/workflows/deploy.yml)
[![CI](https://github.com/YOUR_USERNAME/kronos-eam/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/kronos-eam/actions/workflows/ci.yml)

Kronos EAM is a cloud-native SaaS platform for managing administrative and compliance workflows for renewable energy assets in Italy. The platform centralizes asset data, provides intelligent assistance for bureaucratic processes, and manages regulatory deadlines for photovoltaic and wind power plants.

## 🚀 Features

- **Centralized Asset Registry**: Complete digital twin of renewable energy plants
- **Smart Workflow Management**: Automated bureaucratic process tracking
- **Compliance Calendar**: Proactive deadline management system
- **Multi-Tenant Architecture**: Complete data isolation per organization
- **Real-time Monitoring**: Live status updates and notifications
- **Multi-Language Support**: Italian and English interfaces

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript, Material-UI v5, Redux Toolkit
- **Backend**: FastAPI (Python 3.11), SQLAlchemy, Pydantic
- **Database**: PostgreSQL 14 with multi-tenant schema
- **Infrastructure**: Google Cloud Run, Cloud SQL, Redis
- **CI/CD**: GitHub Actions with automated deployments

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Google Cloud SDK (for deployment)
- Git

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/kronos-eam.git
cd kronos-eam
```

2. **Start all services**
```bash
cd deploy
./manage-services.sh
# Select option 1: Start all services locally
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

4. **Login with demo credentials**
- Email: `demo@kronos-eam.local`
- Password: `demo123`

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down
```

## 🚀 Deployment

### GitHub Actions Deployment

1. **Fork this repository**

2. **Set up GitHub Secrets**
   
   Go to Settings > Secrets and add:
   - `GCP_PROJECT_ID`: Your Google Cloud project ID
   - `GCP_SA_KEY`: Service account JSON key with necessary permissions
   - `DB_PASSWORD`: Database password for Cloud SQL

3. **Create GCP Resources**
```bash
cd deploy
export GCP_PROJECT_ID="your-project-id"
./gcp-setup.sh
```

4. **Push to trigger deployment**
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

The GitHub Actions workflow will automatically:
- Run tests
- Build Docker images
- Deploy to Google Cloud Run
- Initialize the database
- Configure HTTPS endpoints

### Manual GCP Deployment

```bash
cd deploy
./manage-services.sh
# Select option 6: Deploy to GCP
```

## 📁 Project Structure

```
kronos-eam/
├── kronos-eam-backend/        # FastAPI backend application
│   ├── app/                   # Application code
│   │   ├── api/              # REST API endpoints
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   └── services/         # Business logic
│   ├── scripts/              # Utility scripts
│   └── tests/                # Test suite
├── kronos-eam-react/          # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   └── i18n/            # Translations
│   └── public/              # Static assets
├── deploy/                    # Deployment scripts
│   ├── gcp-setup.sh         # GCP infrastructure setup
│   ├── manage-services.sh   # Service management tool
│   └── init-database.sh     # Database initialization
└── .github/workflows/         # GitHub Actions workflows
    ├── deploy.yml           # Production deployment
    ├── ci.yml              # Continuous integration
    └── release.yml         # Release automation
```

## 🧪 Testing

### Backend Tests
```bash
cd kronos-eam-backend
python -m pytest
```

### Frontend Tests
```bash
cd kronos-eam-react
npm test
```

### Integration Tests
```bash
cd deploy
./manage-services.sh
# Select option 14: Run tests
```

## 📚 Documentation

- [API Documentation](http://localhost:8000/docs) - Interactive API docs
- [Architecture Guide](docs/architecture.md) - System design and patterns
- [Development Guide](docs/development.md) - Setup and coding standards
- [Deployment Guide](docs/deployment.md) - Production deployment steps

## 🔧 Configuration

### Environment Variables

Backend (`.env`):
```env
DATABASE_URL=postgresql://user:pass@localhost/kronos_eam
SECRET_KEY=your-secret-key
REDIS_URL=redis://localhost:6379/0
ENVIRONMENT=development
```

Frontend (`.env.local`):
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- Built for the Italian renewable energy market
- Compliant with Italian regulatory requirements
- Designed for enterprise-scale deployments

## 📞 Support

- GitHub Issues: [Create an issue](https://github.com/YOUR_USERNAME/kronos-eam/issues)
- Email: support@kronos-eam.com
- Documentation: [docs.kronos-eam.com](https://docs.kronos-eam.com)

---

**Demo Access**: https://demo.kronos-eam.com
- Email: `demo@kronos-eam.local`
- Password: `demo123`