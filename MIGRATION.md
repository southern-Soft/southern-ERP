# Data Migration Guide

## Overview

This guide explains how to migrate your existing data from the local development environment to the server.

## Prerequisites

- Docker and Docker Compose installed on both local machine and server
- SSH access to the server
- Git repository access

## Migration Steps

### Step 1: Export Data from Local Machine

Run this script on your local machine to export all database data:

```bash
# Create backup directory
mkdir -p backups

# Export each database
docker exec southern-erp_db_clients pg_dump -U postgres -d rmg_erp_clients > backups/db_clients.sql
docker exec southern-erp_db_samples pg_dump -U postgres -d rmg_erp_samples > backups/db_samples.sql
docker exec southern-erp_db_users pg_dump -U postgres -d rmg_erp_users > backups/db_users.sql
docker exec southern-erp_db_orders pg_dump -U postgres -d rmg_erp_orders > backups/db_orders.sql
docker exec southern-erp_db_merchandiser pg_dump -U postgres -d rmg_erp_merchandiser > backups/db_merchandiser.sql
docker exec southern-erp_db_settings pg_dump -U postgres -d rmg_erp_settings > backups/db_settings.sql

echo "Backup completed! Files saved in ./backups/"
```

### Step 2: Transfer Backup Files to Server

Option A: Using SCP
```bash
scp -r backups/ user@your-server:/path/to/new_erp/backups/
```

Option B: Using Git (add backups to repo temporarily)
```bash
git add backups/
git commit -m "Add database backups for migration"
git push
# After migration, remove from git:
# git rm -r backups/
# git commit -m "Remove backups after migration"
# git push
```

### Step 3: Deploy on Server

SSH into your server and run:

```bash
# Clone the repo (or pull latest)
git clone https://github.com/Ayman-ilias/new_erp.git
cd new_erp

# Or if already cloned:
cd new_erp
git pull origin master

# Start all containers (this creates empty databases)
docker-compose up -d --build

# Wait for all containers to be healthy
docker-compose ps
```

### Step 4: Import Data on Server

After containers are running, import the data:

```bash
# Import each database
cat backups/db_clients.sql | docker exec -i southern-erp_db_clients psql -U postgres -d rmg_erp_clients
cat backups/db_samples.sql | docker exec -i southern-erp_db_samples psql -U postgres -d rmg_erp_samples
cat backups/db_users.sql | docker exec -i southern-erp_db_users psql -U postgres -d rmg_erp_users
cat backups/db_orders.sql | docker exec -i southern-erp_db_orders psql -U postgres -d rmg_erp_orders
cat backups/db_merchandiser.sql | docker exec -i southern-erp_db_merchandiser psql -U postgres -d rmg_erp_merchandiser
cat backups/db_settings.sql | docker exec -i southern-erp_db_settings psql -U postgres -d rmg_erp_settings

echo "Import completed!"
```

### Step 5: Verify Migration

```bash
# Check container status
docker-compose ps

# Test health endpoint
curl http://localhost:8000/api/v1/health

# Access the frontend
# Open browser: http://your-server-ip:2222
```

## Quick One-Line Export (Local)

```bash
mkdir -p backups && for db in clients samples users orders merchandiser settings; do docker exec southern-erp_db_$db pg_dump -U postgres -d rmg_erp_$db > backups/db_$db.sql; done
```

## Quick One-Line Import (Server)

```bash
for db in clients samples users orders merchandiser settings; do cat backups/db_$db.sql | docker exec -i southern-erp_db_$db psql -U postgres -d rmg_erp_$db; done
```

## Troubleshooting

### If import fails with "relation already exists"

The database already has tables. Either:
1. Drop and recreate the database first
2. Or use `--clean` flag with pg_dump

To recreate databases:
```bash
# Stop backend first
docker-compose stop backend frontend

# Recreate specific database
docker exec southern-erp_db_clients psql -U postgres -c "DROP DATABASE rmg_erp_clients; CREATE DATABASE rmg_erp_clients;"

# Restart and import
docker-compose up -d
cat backups/db_clients.sql | docker exec -i southern-erp_db_clients psql -U postgres -d rmg_erp_clients
```

### If containers are named differently

Check your container names with:
```bash
docker ps --format "table {{.Names}}"
```

And adjust the commands accordingly.

## Access Points

After successful deployment:

- **Frontend**: http://your-server-ip:2222
- **Backend API**: http://your-server-ip:8000
- **API Docs**: http://your-server-ip:8000/docs
- **Login**: username: `admin`, password: `admin`

## Notes

- The frontend port is 2222 (configurable in `.env` file)
- The backend port is 8000 (configurable in `.env` file)
- Data is persisted in Docker volumes, so it survives container restarts
- To backup regularly, you can add the export commands to a cron job
