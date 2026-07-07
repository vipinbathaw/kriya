# Database Backup & Restore

## Automated Daily Backup

Create a backup script and add it to cron:

```bash
#!/bin/bash
# /usr/local/bin/kriya-backup.sh

BACKUP_DIR=/var/backups/kriya
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

docker compose -f /path/to/docker-compose.prod.yml exec -T db \
  mysqldump --single-transaction --quick --lock-tables=false \
  -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  | gzip > "$BACKUP_DIR/kriya_$TIMESTAMP.sql.gz"

# Remove backups older than retention period
find "$BACKUP_DIR" -name "kriya_*.sql.gz" -mtime +$RETENTION_DAYS -delete
```

Add to crontab (runs daily at 2 AM):
```
0 2 * * * /usr/local/bin/kriya-backup.sh
```

## Manual Backup

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T db \
  mysqldump --single-transaction --quick \
  -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  > kriya_backup.sql
```

## Restore from Backup

### Restore to existing database (destructive)

```bash
# First, stop the server to prevent data corruption
docker compose -f docker-compose.prod.yml stop server

# Restore the database
docker compose -f docker-compose.prod.yml exec -T db \
  mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  < kriya_backup.sql

# Restart the server
docker compose -f docker-compose.prod.yml start server
```

### Restore to new database

```bash
# Create a new database
docker compose -f docker-compose.prod.yml exec db \
  mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE kriya_restore;"

# Import the backup
docker compose -f docker-compose.prod.yml exec -T db \
  mysql -u"$DB_USER" -p"$DB_PASSWORD" kriya_restore \
  < kriya_backup.sql
```

## Disaster Recovery

1. **Provision a new server** with Docker and Docker Compose
2. **Clone the repository** and configure `.env.prod`
3. **Start infrastructure services**:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.prod up -d db
   ```
4. **Restore the database** from the latest backup
5. **Start application services**:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
   ```
6. **Run any pending migrations**:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.prod exec server \
     npx tsx node_modules/.bin/knex migrate:latest --knexfile dist/config/database.js
   ```

## Verification

After restore, verify data integrity:

```bash
# Check user count
docker compose -f docker-compose.prod.yml exec db \
  mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT COUNT(*) FROM users;"

# Check API health
curl http://localhost:3000/api/health
```
