# Proxmox Docker Compose Setup Guide

## 🚀 Quick Setup for Proxmox Server

### Step 1: Create .env File

On your Proxmox server, in the project root directory:

```bash
cd /path/to/your/project
cp .env.example .env
nano .env
```

### Step 2: Configure Critical Settings

**MOST IMPORTANT - Set CORS_ORIGINS:**

```bash
# Find your server IP
hostname -I

# Edit .env and set CORS_ORIGINS to your frontend URL
# If accessing via IP:
CORS_ORIGINS=http://YOUR_SERVER_IP:3000

# Example:
CORS_ORIGINS=http://192.168.1.100:3000
```

**Other Required Settings:**

```bash
# Environment
ENVIRONMENT=production

# Database Password (use a strong password!)
POSTGRES_PASSWORD=your_secure_password_here

# Secret Key (generate a secure one!)
SECRET_KEY=your-generated-secret-key-here

# CORS (set to your frontend URL!)
CORS_ORIGINS=http://YOUR_SERVER_IP:3000
```

### Step 3: Start Services

```bash
docker compose up -d --build
```

### Step 4: Check Status

```bash
# Check all containers are running
docker compose ps

# Check backend logs
docker compose logs backend --tail 50

# Check frontend logs
docker compose logs frontend --tail 50

# Test backend health
curl http://localhost:8000/api/v1/health
```

---

## 🔍 Troubleshooting "Failed to Load Data"

### Issue: CORS Errors (90% of cases)

**Symptoms:**
- Works on localhost
- Fails on Proxmox server
- Browser console shows CORS errors

**Fix:**

1. **Find your server IP:**
   ```bash
   hostname -I
   ```

2. **Find your frontend port:**
   ```bash
   # Check docker-compose.yml or .env
   # Default is 3000 (FRONTEND_PORT)
   ```

3. **Update .env file:**
   ```bash
   nano .env
   # Set:
   CORS_ORIGINS=http://YOUR_IP:3000
   # Example: CORS_ORIGINS=http://192.168.1.100:3000
   ```

4. **Restart backend:**
   ```bash
   docker compose restart backend
   ```

5. **Verify:**
   ```bash
   docker compose exec backend env | grep CORS_ORIGINS
   # Should show your URL
   ```

### Issue: Environment Variables Not Loading

**Fix:**

1. **Verify .env file exists:**
   ```bash
   ls -la .env
   ```

2. **Check file permissions:**
   ```bash
   chmod 600 .env
   ```

3. **Verify docker-compose reads .env:**
   ```bash
   # .env should be in same directory as docker-compose.yml
   pwd
   ls -la docker-compose.yml .env
   ```

4. **Restart all services:**
   ```bash
   docker compose down
   docker compose up -d
   ```

### Issue: Database Connection Errors

**Fix:**

1. **Check database containers:**
   ```bash
   docker compose ps | grep db-
   # All should show "Up"
   ```

2. **Verify POSTGRES_PASSWORD:**
   ```bash
   # In .env file, make sure password matches
   # Check logs:
   docker compose logs db-samples
   ```

3. **Test database connection:**
   ```bash
   docker compose exec backend python -c "from core.database import engines; print('OK')"
   ```

---

## 📋 Complete .env Example for Proxmox

```bash
# Project Name
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
CORS_ORIGINS=http://YOUR_SERVER_IP:3000

# Ports
BACKEND_PORT=8000
FRONTEND_PORT=3000

# Environment
ENVIRONMENT=production

# Pool Settings
POOL_SIZE=10
MAX_OVERFLOW=10
```

**Replace:**
- `YOUR_SERVER_IP` with your actual server IP (from `hostname -I`)
- `your_secure_password_here` with a strong password
- `your-generated-secret-key-here` with a generated secret key

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `.env` file exists in project root
- [ ] `CORS_ORIGINS` is set to your frontend URL
- [ ] `POSTGRES_PASSWORD` is set and strong
- [ ] `SECRET_KEY` is set and unique
- [ ] `ENVIRONMENT=production` is set
- [ ] All containers are running: `docker compose ps`
- [ ] Backend health check passes: `curl http://localhost:8000/api/v1/health`
- [ ] Frontend is accessible: `curl http://localhost:3000`

---

## 🐛 Common Errors & Quick Fixes

### "CORS policy: No 'Access-Control-Allow-Origin' header"
→ Set `CORS_ORIGINS` in `.env` to your frontend URL

### "Failed to fetch"
→ Check backend is running: `docker compose ps`
→ Check CORS_ORIGINS is set correctly

### "Connection refused"
→ Check all containers are running: `docker compose ps`
→ Check database containers are healthy

### "Invalid token" or "Unauthorized"
→ Check `SECRET_KEY` is set correctly
→ Verify token hasn't expired

---

## 🔄 Updating Configuration

After changing `.env`:

```bash
# Restart affected services
docker compose restart backend

# Or restart all
docker compose restart

# Or full restart
docker compose down
docker compose up -d
```

---

## 📞 Quick Diagnostic Commands

```bash
# Check container status
docker compose ps

# Check backend logs
docker compose logs backend --tail 50

# Check environment variables
docker compose exec backend env | grep -E "CORS|POSTGRES|SECRET|ENVIRONMENT"

# Test backend
curl http://localhost:8000/api/v1/health

# Test database
docker compose exec backend python -c "from core.database import engines; print('OK')"
```

---

**Remember:** The most common issue is `CORS_ORIGINS` not being set correctly! 🔍
