#!/bin/bash

# Script to kill Kronos EAM application services
# Kills both backend (uvicorn on port 8000) and frontend (npm on port 3000)

echo "🔍 Searching for running application services..."

# Kill backend service (uvicorn on port 8000)
echo "🛑 Stopping backend service (uvicorn)..."
BACKEND_PID=$(lsof -ti :8000)
if [ ! -z "$BACKEND_PID" ]; then
    kill -9 $BACKEND_PID
    echo "✅ Backend service (PID: $BACKEND_PID) terminated"
else
    echo "ℹ️  No backend service found running on port 8000"
fi

# Kill frontend service (npm/node on port 3000)
echo "🛑 Stopping frontend service (npm)..."
FRONTEND_PID=$(lsof -ti :3000)
if [ ! -z "$FRONTEND_PID" ]; then
    kill -9 $FRONTEND_PID
    echo "✅ Frontend service (PID: $FRONTEND_PID) terminated"
else
    echo "ℹ️  No frontend service found running on port 3000"
fi

# Kill any remaining Python processes related to the project
echo "🔍 Checking for remaining Python processes..."
PYTHON_PIDS=$(pgrep -f "kronos-eam-backend|uvicorn.*main:app")
if [ ! -z "$PYTHON_PIDS" ]; then
    echo "🛑 Killing remaining Python processes: $PYTHON_PIDS"
    kill -9 $PYTHON_PIDS
    echo "✅ Additional Python processes terminated"
fi

# Kill any remaining Node processes related to the project
echo "🔍 Checking for remaining Node processes..."
NODE_PIDS=$(pgrep -f "kronos-eam-react|react-scripts")
if [ ! -z "$NODE_PIDS" ]; then
    echo "🛑 Killing remaining Node processes: $NODE_PIDS"
    kill -9 $NODE_PIDS
    echo "✅ Additional Node processes terminated"
fi

echo "🎉 All application services have been stopped"
echo ""
echo "To restart services:"
echo "  Backend:  cd /home/bloom/sentrics/kronos-eam-backend && ./run_api.sh"
echo "  Frontend: cd /home/bloom/sentrics/kronos-eam-react && npm start"