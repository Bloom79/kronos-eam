#!/bin/bash

# Test script to verify Docker build completed successfully

echo "🔍 Checking Docker build status..."
echo ""

# Check if image exists
if docker images | grep -q "kronos-eam-react.*test"; then
    echo "✅ Docker image 'kronos-eam-react:test' found!"
    echo ""
    echo "📊 Image details:"
    docker images kronos-eam-react:test
    echo ""
    
    # Get image size
    SIZE=$(docker images kronos-eam-react:test --format "{{.Size}}")
    echo "📦 Image size: $SIZE"
    echo ""
    
    # Test run the container
    echo "🧪 Testing container..."
    echo "Starting container on port 8080..."
    
    # Stop any existing container
    docker stop kronos-test 2>/dev/null || true
    docker rm kronos-test 2>/dev/null || true
    
    # Run container
    docker run -d --name kronos-test -p 8080:80 kronos-eam-react:test
    
    if [ $? -eq 0 ]; then
        echo "✅ Container started successfully!"
        echo ""
        
        # Wait for container to be ready
        echo "⏳ Waiting for container to be ready..."
        sleep 5
        
        # Check if container is still running
        if docker ps | grep -q kronos-test; then
            echo "✅ Container is running"
            echo ""
            
            # Test health endpoint
            echo "🏥 Testing health endpoint..."
            if curl -f -s http://localhost:8080/health > /dev/null 2>&1; then
                echo "✅ Health check passed!"
            else
                echo "⚠️  Health check failed (this is normal if no health endpoint exists)"
            fi
            
            echo ""
            echo "🌐 Application is running at: http://localhost:8080"
            echo ""
            echo "📋 Container logs:"
            docker logs kronos-test | tail -20
            echo ""
            echo "🛑 To stop the container: docker stop kronos-test && docker rm kronos-test"
        else
            echo "❌ Container stopped unexpectedly!"
            echo "📋 Container logs:"
            docker logs kronos-test
            docker rm kronos-test
            exit 1
        fi
    else
        echo "❌ Failed to start container!"
        exit 1
    fi
else
    echo "❌ Docker image 'kronos-eam-react:test' not found!"
    echo ""
    echo "The build might still be in progress. Check your build terminal."
    echo ""
    echo "To build manually, run:"
    echo "  docker build -t kronos-eam-react:test ."
    exit 1
fi