# Kriya Deployment

This directory contains deployment documentation and configuration for running Kriya in production.

## Quick Start

```bash
# 1. Copy and edit environment variables
cp .env.prod.example .env.prod

# 2. Generate required secrets
openssl rand -hex 32  # for ENCRYPTION_KEY

# 3. Start all services
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# 4. Run database migrations
docker compose -f docker-compose.prod.yml --env-file .env.prod exec server \
  npx tsx node_modules/.bin/knex migrate:latest --knexfile dist/config/database.js
```

## Architecture

```
┌─────────┐     ┌──────────┐     ┌─────────┐
│  Client │────►│  Server  │────►│    DB   │
│  nginx  │     │  Node.js │     │  MySQL  │
│  :80    │     │  :3000   │     │  :3306  │
└─────────┘     └──────────┘     └─────────┘
```

## Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| Client | kriya-client | 80 | SPA served by nginx, proxies `/api` to server |
| Server | kriya-server | 3000 | Express API server |
| Database | kriya-db | 3306 | MySQL 8 database |

## Documentation

- [Production Deployment](production.md) — step-by-step deployment guide
- [Backup & Restore](backup.md) — database backup procedures
- [Monitoring & Logging](monitoring.md) — health checks, logging, alerts
