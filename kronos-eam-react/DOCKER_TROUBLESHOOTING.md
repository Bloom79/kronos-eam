# Docker Build Troubleshooting Guide

## Common Issues and Solutions

### 1. Build Takes Too Long

The Docker build process includes:
- Installing 1385+ npm packages
- Building the React application
- Creating the nginx container

**Normal build time**: 5-10 minutes on first build

**Solutions**:
- Use Docker BuildKit for faster builds: `DOCKER_BUILDKIT=1 docker build -t kronos-eam-react:test .`
- Ensure good internet connection for package downloads
- Consider using a local npm registry mirror

### 2. Build Fails at npm install

**Error**: `npm ERR! network timeout`

**Solution**:
```bash
# Increase npm timeout
docker build --build-arg NPM_CONFIG_TIMEOUT=60000 -t kronos-eam-react:test .
```

### 3. Build Fails at npm run build

**Common causes**:
- TypeScript errors
- Out of memory

**Solutions**:
```bash
# Increase memory for build
docker build --build-arg NODE_OPTIONS="--max-old-space-size=4096" -t kronos-eam-react:test .

# Or fix TypeScript errors first
npm run build  # Test locally
```

### 4. Container Starts but App Doesn't Load

**Check nginx logs**:
```bash
docker logs kronos-test
```

**Common issues**:
- Port mismatch
- Missing build files
- Nginx configuration error

### 5. Permission Denied Errors

**Solution**:
```bash
# Run Docker commands with sudo (Linux)
sudo docker build -t kronos-eam-react:test .

# Or add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

### 6. Disk Space Issues

**Check available space**:
```bash
df -h
docker system df
```

**Clean up**:
```bash
# Remove unused images
docker system prune -a

# Remove build cache
docker builder prune
```

## Build Optimization Tips

### 1. Use Multi-Stage Build Cache

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
# Copy package files first (better caching)
COPY package*.json ./
RUN npm ci
# Then copy source
COPY . .
RUN npm run build
```

### 2. Use .dockerignore

Ensure `.dockerignore` excludes:
- node_modules/
- build/
- .git/
- .env files
- Large unnecessary files

### 3. Layer Caching

Order Dockerfile commands from least to most frequently changing:
1. Base image
2. System dependencies
3. Package files
4. Application code

## Debugging Commands

### Check Build Progress
```bash
# Verbose build output
docker build --progress=plain -t kronos-eam-react:test .
```

### Inspect Failed Build
```bash
# Keep intermediate containers
docker build --rm=false -t kronos-eam-react:test .

# List all containers (including stopped)
docker ps -a

# Inspect last failed container
docker logs [CONTAINER_ID]
```

### Test Build Stages
```bash
# Build only up to a specific stage
docker build --target build -t kronos-build-stage .

# Run the build stage interactively
docker run -it kronos-build-stage sh
```

## Quick Fixes

### Force Rebuild
```bash
docker build --no-cache -t kronos-eam-react:test .
```

### Use Different Node Version
Edit Dockerfile:
```dockerfile
FROM node:20-alpine AS build  # Try node 20
```

### Simplify Build
Create a minimal test:
```bash
# Create test Dockerfile
cat > Dockerfile.test << EOF
FROM nginx:alpine
COPY build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Build with existing build folder
docker build -f Dockerfile.test -t kronos-test .
```

## Getting Help

1. Check Docker logs: `docker logs [CONTAINER_NAME]`
2. Check system resources: `docker system info`
3. Verify Docker version: `docker --version`
4. Check Docker daemon status: `systemctl status docker` (Linux)