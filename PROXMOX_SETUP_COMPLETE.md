# Complete Proxmox Setup Guide - Fix "Failed to Load Data"

## 🎯 Quick Fix (Most Common Issue)

**90% of "failed to load data" errors are CORS configuration!**

### Step 1: Create .env File

```bash
cd /path/to/your/project
cp env.example .env
nano .env
```

### Step 2: Set CORS_ORIGINS (CRITICAL!)

```bash
# Find your server IP
hostname -I

# Edit .env and set (replace YOUR_IP with actual IP):
CORS_ORIGINS=http://YOUR_IP:2222

# Example:
CORS_ORIGINS=http://192.168.1.100:2222
```

### Step 3: Set Other Required Values

```bash
ENVIRONMENT=production
POSTGRES_PASSWORD=your_secure_password
SECRET_KEY=your_generated_secret_key
CORS_ORIGINS=http://YOUR_IP:2222
```

### Step 4: Start Services

```bash
docker compose up -d --build
```

### Step 5: Verify

```bash
# Check containers
docker compose ps

# Check CORS is set
docker compose exec backend env | grep CORS_ORIGINS

# Test backend
curl http://localhost:8000/api/v1/health
```

---

## 📋 Complete .env File Template

Copy this to `.env` and fill in your values:

```bash
# Project
COMPOSE_PROJECT_NAME=erp

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_PORT=5432

# Database Hosts (Docker service names - don't change)
POSTGRES_HOST_CLIENTS=db-clients
POSTGRES_HOST_SAMPLES=db-samples
POSTGRES_HOST_USERS=db-users
POSTGRES_HOST_ORDERS=db-orders
POSTGRES_HOST_MERCHANDISER=db-merchandiser
POSTGRES_HOST_SETTINGS=db-settings

# Database Names
POSTGRES_DB_CLIENTS=rmg_erp_clients
POSTGRES_DB_SAMPLES=rmg_erp_samples
POSTGRES_DB_USERS=rmg_erp_users
POSTGRES_DB_ORDERS=rmg_erp_orders
POSTGRES_DB_MERCHANDISER=rmg_erp_merchandiser
POSTGRES_DB_SETTINGS=rmg_erp_settings

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0

# Security
SECRET_KEY=your-generated-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS - CRITICAL! Set to your frontend URL
CORS_ORIGINS=http://YOUR_SERVER_IP:2222

# Ports
BACKEND_PORT=8000
FRONTEND_PORT=2222
DB_SAMPLES_PORT=5433

# Environment
ENVIRONMENT=production

# Pool Settings
POOL_SIZE=10
MAX_OVERFLOW=10

# Frontend (don't change unless needed)
BACKEND_URL=http://backend:8000
API_URL=http://backend:8000
NEXT_PUBLIC_API_MASK_URL=/api/v1
```

**Replace:**
- `YOUR_SERVER_IP` with your actual server IP (from `hostname -I`)
- `your_secure_password_here` with a strong password
- `your-generated-secret-key-here` with a generated secret key

---

## 🔍 Why This Fixes "Failed to Load Data"

1. **CORS Issue**: When `CORS_ORIGINS` is `*` and `ENVIRONMENT=production`, the backend denies all requests for security
2. **Solution**: Set `CORS_ORIGINS` to your actual frontend URL
3. **Result**: Backend allows requests from your frontend

---

## ✅ Verification Checklist

After setup:

- [ ] `.env` file exists in project root
- [ ] `CORS_ORIGINS=http://YOUR_IP:2222` is set
- [ ] `POSTGRES_PASSWORD` is set
- [ ] `SECRET_KEY` is set
- [ ] `ENVIRONMENT=production` is set
- [ ] All containers running: `docker compose ps`
- [ ] Backend health check: `curl http://localhost:8000/api/v1/health`
- [ ] CORS verified: `docker compose exec backend env | grep CORS_ORIGINS`

---

## 🐛 Still Not Working?

### Check Backend Logs
```bash
docker compose logs backend --tail 50
```

### Check CORS Configuration
```bash
docker compose exec backend python -c "
from core.config import settings
print(f'CORS Origins: {settings.CORS_ORIGINS}')
print(f'Parsed: {settings.BACKEND_CORS_ORIGINS}')
print(f'Environment: {settings.ENVIRONMENT}')
"
```

### Check Browser Console
- Open Developer Tools (F12)
- Check Console tab for CORS errors
- Check Network tab for failed requests

### Restart Services
```bash
docker compose restart backend
docker compose restart frontend
```

---

## 🚀 One-Command Setup (After Finding IP)

```bash
# Replace YOUR_IP with your actual server IP
echo "CORS_ORIGINS=http://YOUR_IP:2222" >> .env && docker compose restart backend
```

---

**After making changes, always restart the backend!**

```bash
docker compose restart backend
```
