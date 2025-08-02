# Kronos EAM - Startup Commands Guide

## 🚀 Complete Startup Sequence

Follow these steps in order to start the entire Kronos EAM platform locally.

### 1. Ensure Docker Services Are Running

```bash
cd /home/bloom/sentrics/kronos-eam-backend

# Check if services are already running
docker-compose ps

# If not running, start them
docker-compose up -d

# Verify all services are healthy
docker-compose ps
```

You should see:
- PostgreSQL on port 5432
- Redis on port 6379  
- Qdrant on port 6333

### 2. Start Backend Server

Open a new terminal for the backend:

```bash
# Navigate to backend directory
cd /home/bloom/sentrics/kronos-eam-backend

# Activate Python virtual environment
source venv/bin/activate

# Set required environment variable (important!)
export PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Alternative: Use the run script
./run_api.sh
```

✅ Backend will be available at: **http://localhost:8000**
📚 API Documentation: **http://localhost:8000/docs**

### 3. Start Frontend Server

Open a new terminal for the frontend:

```bash
# Navigate to frontend directory
cd /home/bloom/sentrics/kronos-eam-react

# Install dependencies (if not already done)
npm install

# Start the development server
npm start
```

✅ Frontend will be available at: **http://localhost:3000**

## 🔐 Login Credentials

Use these credentials to access the system:

- **Email**: `admin@demo.com`
- **Password**: `admin123`

## 🛑 Stopping Services

To stop all services cleanly:

### Stop Frontend
Press `Ctrl+C` in the frontend terminal

### Stop Backend  
Press `Ctrl+C` in the backend terminal

### Stop Docker Services (Optional)
```bash
cd /home/bloom/sentrics/kronos-eam-backend
docker-compose stop
```

## 🔄 Quick Restart Commands

If you need to restart quickly:

```bash
# Terminal 1 - Backend
cd /home/bloom/sentrics/kronos-eam-backend && \
source venv/bin/activate && \
export PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python && \
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd /home/bloom/sentrics/kronos-eam-react && \
npm start
```

## ⚡ One-Line Commands

For experienced users, here are one-line commands:

### Backend (with venv activation)
```bash
cd /home/bloom/sentrics/kronos-eam-backend && source venv/bin/activate && export PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd /home/bloom/sentrics/kronos-eam-react && npm start
```

## 🔍 Verify Everything is Running

1. **Check Backend Health**: http://localhost:8000/health
2. **Check API Docs**: http://localhost:8000/docs
3. **Check Frontend**: http://localhost:3000
4. **Check Docker Services**: `docker-compose ps`

## 🚨 Common Issues

### Port Already in Use
```bash
# Check what's using port 8000
lsof -i :8000

# Check what's using port 3000
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

### Virtual Environment Not Found
```bash
cd /home/bloom/sentrics/kronos-eam-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Database Connection Issues
```bash
# Restart Docker services
cd /home/bloom/sentrics/kronos-eam-backend
docker-compose restart

# Check logs
docker-compose logs postgres
```

## 📋 Environment Variables Checklist

Ensure these are set in `/home/bloom/sentrics/kronos-eam-backend/.env`:
- ✅ DATABASE_URL
- ✅ SECRET_KEY
- ✅ OPENAI_API_KEY (or ANTHROPIC_API_KEY or GOOGLE_API_KEY)
- ✅ REDIS_URL
- ✅ QDRANT_URL

---

💡 **Pro Tip**: Keep 3 terminal windows open:
1. One for Docker services monitoring (`docker-compose logs -f`)
2. One for backend server
3. One for frontend server