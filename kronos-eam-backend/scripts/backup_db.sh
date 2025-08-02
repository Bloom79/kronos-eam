#!/bin/bash
# Database Backup Script for Kronos EAM

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups/kronos-eam}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "Starting database backup at $(date)"

# Perform backup
BACKUP_FILE="$BACKUP_DIR/kronos_eam_backup_$TIMESTAMP.sql"
echo "Creating backup: $BACKUP_FILE"

if pg_dump "$DATABASE_URL" > "$BACKUP_FILE"; then
    # Compress the backup
    gzip "$BACKUP_FILE"
    echo "Backup completed: ${BACKUP_FILE}.gz"
    
    # Calculate size
    SIZE=$(ls -lh "${BACKUP_FILE}.gz" | awk '{print $5}')
    echo "Backup size: $SIZE"
    
    # Remove old backups
    echo "Removing backups older than $RETENTION_DAYS days..."
    find "$BACKUP_DIR" -name "kronos_eam_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    # List current backups
    echo "Current backups:"
    ls -lh "$BACKUP_DIR"/kronos_eam_backup_*.sql.gz 2>/dev/null | tail -5
    
    echo "Backup completed successfully at $(date)"
    exit 0
else
    echo "ERROR: Backup failed"
    exit 1
fi