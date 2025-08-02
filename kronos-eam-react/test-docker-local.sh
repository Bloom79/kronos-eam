#!/bin/bash

# Local Docker test script for Kronos EAM React

set -e

echo "🐳 Building Docker image locally..."
docker build -t kronos-eam-react:test .

echo "🚀 Running container on port 8080..."
docker run -d --name kronos-test -p 8080:80 kronos-eam-react:test

echo "⏳ Waiting for container to start..."
sleep 5

echo "🧪 Testing health endpoint..."
curl -f http://localhost:8080/health || echo "Health check failed"

echo "📋 Container logs:"
docker logs kronos-test

echo ""
echo "✅ Container is running at http://localhost:8080"
echo "🛑 To stop: docker stop kronos-test && docker rm kronos-test"