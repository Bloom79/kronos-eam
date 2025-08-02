# Frontend Dockerfile for Kronos EAM
# Multi-stage build for optimized production image

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build argument for API URL
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Create non-root user
RUN adduser -D -g 'nginx' nginx

# Change ownership of nginx directories
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]