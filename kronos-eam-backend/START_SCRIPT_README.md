# Kronos EAM Backend Start Script

The `start.sh` script provides flexible options for starting the backend with or without certain services.

## Basic Usage

```bash
# Start all services (PostgreSQL, Redis, Qdrant, and backend)
./start.sh

# Show help
./start.sh --help
```

## Options

### Service Control

- `--no-redis` - Start without Redis (background tasks will be disabled)
- `--no-qdrant` - Start without Qdrant (AI/vector search features will be disabled)
- `--no-redis-qdrant` - Start only PostgreSQL and the backend application

### Development Options

- `--skip-deps` - Skip pip install step (useful when dependencies haven't changed)

## Examples

```bash
# Minimal setup (only PostgreSQL and backend)
./start.sh --no-redis-qdrant

# Development mode without Redis
./start.sh --no-redis --skip-deps

# Production-like setup with all services
./start.sh
```

## Service Impact

### When Redis is Disabled
- Background task processing is disabled
- Session management falls back to in-memory storage
- Rate limiting uses in-memory storage instead of Redis
- Failed login tracking is disabled

### When Qdrant is Disabled
- Vector search features are disabled
- Document similarity search returns empty results
- AI-powered document retrieval is unavailable
- Smart Assistant features may be limited

## Stopping Services

```bash
# Stop all services
./stop.sh

# Stop only the backend, keep databases running
./stop.sh --keep-docker
```

## Health Check

The health endpoint at `http://localhost:8000/health` will show the status of all services:

```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "redis": "disabled",    // When using --no-redis
    "qdrant": "disabled"    // When using --no-qdrant
  }
}
```

## Environment Variables

The script sets these environment variables when services are disabled:
- `DISABLE_REDIS=true` - When Redis is disabled
- `DISABLE_QDRANT=true` - When Qdrant is disabled

The backend application checks these variables and gracefully handles the missing services.