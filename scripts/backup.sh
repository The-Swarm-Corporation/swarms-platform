#!/bin/sh

# Variables
DB_USER="${DB_USER:-}"
DB_NAME="${DB_NAME:-}"
DB_HOST="${DB_HOST:-}"
DB_PORT="${DB_PORT:-}"
BACKUP_DIR=""${BACKUP_DIR:-}""
ARCHIVE_DIR="${ARCHIVE_DIR:-}"
LOG_FILE="${LOG_FILE:-}"

# Check if environment variables are set
if [[ -z "$DB_USER" || -z "$DB_NAME" || -z "$DB_HOST" || -z "$DB_PORT" || -z "$BACKUP_DIR" || -z "$ARCHIVE_DIR" || -z "$LOG_FILE" ]]; then
  echo "One or more environment variables are not set. Please check your configuration." | tee -a $LOG_FILE
  exit 1
fi

DATE=$(date +%Y%m%d%H%M)

# Create a backup
echo "Starting database backup..." | tee -a $LOG_FILE
pg_dump -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -F t -f $BACKUP_DIR/db_backup_$DATE.tar >> $LOG_FILE 2>&1
echo "Database backup completed." | tee -a $LOG_FILE

# Move backups older than 7 days to the archive directory
echo "Moving backups older than 7 days to the archive directory..." | tee -a $LOG_FILE
find $BACKUP_DIR -type f -name '*.tar' -mtime +7 -exec mv {} $ARCHIVE_DIR \; >> $LOG_FILE 2>&1
echo "Move completed." | tee -a $LOG_FILE

# # Add a cron job to run this script every day at midnight
# echo "Setting up cron job..." | tee -a $LOG_FILE
# (crontab -l 2>/dev/null; echo "0 0 * * * /path/to/your/script.sh") | crontab -
# echo "Cron job setup completed." | tee -a $LOG_FILE