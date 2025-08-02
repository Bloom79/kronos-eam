#!/bin/bash
echo "🚀 Starting all Kronos EAM PoC resources..."

# Activate the Cloud SQL database instance
echo "   -> Starting Cloud SQL (PostgreSQL) instance..."
gcloud sql instances patch kronos-db --activation-policy ALWAYS --quiet

# Start the RPA Virtual Machine
echo "   -> Starting Compute Engine VM for RPA..."
gcloud compute instances start kronos-rpa-vm --zone=us-central1-a --quiet

# Recreate the Redis instance
# Note: This assumes you don't need to persist Redis data between sessions.
echo "   -> Recreating Memorystore (Redis) instance..."
gcloud redis instances create kronos-cache --size=1 --region=us-central1 --tier=BASIC --quiet

# Restore 100% traffic to Cloud Run services
echo "   -> Scaling up Cloud Run services..."
gcloud run services update kronos-frontend --region=us-central1 --to-latest --quiet
gcloud run services update kronos-backend --region=us-central1 --to-latest --quiet

echo "✅ PoC environment is now running."
