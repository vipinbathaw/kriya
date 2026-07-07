# Monitoring & Logging

## Health Checks

Docker Compose is configured with health checks for all services:

| Service | Check | Interval |
|---------|-------|----------|
| db | `mysqladmin ping` | 10s |
| server | HTTP GET `/api/health` | 30s |
| client | (n/a — nginx handles this) | — |

View health status:

```bash
docker compose -f docker-compose.prod.yml ps
```

## Logging

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs

# Specific service
docker compose -f docker-compose.prod.yml logs server
docker compose -f docker-compose.prod.yml logs client
docker compose -f docker-compose.prod.yml logs db

# Follow logs
docker compose -f docker-compose.prod.yml logs -f server

# Last N lines
docker compose -f docker-compose.prod.yml logs --tail=100 server
```

### Log Format

Server logs use Pino structured JSON logging:

```json
{"level":30,"time":"2024-01-01T00:00:00.000Z","pid":1,"hostname":"...","method":"GET","url":"/api/notes","status":200,"duration":"42ms","userId":"...","ip":"..."}
```

Sensitive fields (passwords, tokens, API keys) are automatically redacted as `[REDACTED]`.

### Log Aggregation (Production)

For production, consider sending logs to a centralized service:

**Option 1: Docker logging driver**
```yaml
# In docker-compose.prod.yml
services:
  server:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**Option 2: External logging service**
Use Docker's logging plugins to forward to services like:
- Grafana Loki
- Datadog
- AWS CloudWatch
- Papertrail

## Performance Monitoring

### Resource Usage

```bash
# Container resource usage
docker stats

# Specific service
docker stats kriya-server
```

### Database Monitoring

```bash
# Check active connections
docker compose -f docker-compose.prod.yml exec db \
  mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW PROCESSLIST;"

# Check table sizes
docker compose -f docker-compose.prod.yml exec db \
  mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
    SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
    FROM information_schema.tables
    WHERE table_schema = '$DB_NAME'
    ORDER BY (data_length + index_length) DESC;"
```

## Alerts

Set up alerting for the following conditions:

1. **Container down** — any service not running for > 1 minute
2. **Health check failure** — server health check fails 3+ consecutive times
3. **High error rate** — 5xx responses > 1% of total requests
4. **High response time** — p95 response time > 1 second
5. **Low disk space** — database volume < 20% free

### Container Restart Policy

All services use `restart: unless-stopped` which means they will automatically restart unless explicitly stopped by an administrator.

## Security Monitoring

1. **Failed login attempts** — monitor auth logs for brute force attempts
2. **API key operations** — monitor for unusual key creation/deletion patterns
3. **Rate limit hits** — frequent 429 responses indicate potential abuse
