#!/bin/bash
echo "🛑 Stopping all Kronos EAM PoC resources..."

# Stop the RPA Virtual Machine
echo "   -> Stopping Compute Engine VM for RPA..."
gcloud compute instances stop kronos-rpa-vm --zone=us-central1-a --quiet

# Stop the Cloud SQL database instance
echo "   -> Stopping Cloud SQL (PostgreSQL) instance..."
gcloud sql instances patch kronos-db --activation-policy NEVER --quiet

# Delete the Redis instance to eliminate all costs
echo "   -> Deleting Memorystore (Redis) instance..."
gcloud redis instances delete kronos-cache --region=us-central1 --quiet

# Set Cloud Run services to have zero instances by removing traffic
# This is a more direct way to ensure they scale to zero.
echo "   -> Scaling down Cloud Run services to zero..."
gcloud run services update kronos-frontend --region=us-central1 --clear-traffic --quiet
gcloud run services update kronos-backend --region=us-central1 --clear-traffic --quiet

echo "✅ PoC environment stopped. Costs are now minimal."
