#!/bin/bash
# Database Restore Script for Kronos EAM

# Check arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 /backups/kronos_eam_backup_20250718_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "WARNING: This will restore the database from backup."
echo "Backup file: $BACKUP_FILE"
echo "Target database: $DATABASE_URL"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo "Starting database restore at $(date)"

# Extract database name from URL
DB_NAME=$(echo $DATABASE_URL | sed -E 's/.*\/([^?]+).*/\1/')

# Create temporary file for uncompressed backup
TEMP_FILE="/tmp/restore_${TIMESTAMP}.sql"

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Decompressing backup file..."
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
else
    cp "$BACKUP_FILE" "$TEMP_FILE"
fi

# Drop existing connections
echo "Closing existing database connections..."
psql "$DATABASE_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" 2>/dev/null || true

# Restore the backup
echo "Restoring database..."
if psql "$DATABASE_URL" < "$TEMP_FILE"; then
    echo "Database restored successfully"
    
    # Clean up
    rm -f "$TEMP_FILE"
    
    # Run any post-restore migrations
    if command -v alembic &> /dev/null; then
        echo "Running database migrations..."
        alembic upgrade head
    fi
    
    echo "Restore completed successfully at $(date)"
    exit 0
else
    echo "ERROR: Restore failed"
    rm -f "$TEMP_FILE"
    exit 1
fi