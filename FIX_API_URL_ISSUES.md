# Fix: Buyer Info, Supplier Info, and All API Data Not Loading

## Problem

All API calls are failing because the frontend cannot connect to the backend. This affects:
- ❌ Buyer Info (no data)
- ❌ Supplier Info (no data)  
- ❌ Merchandising Sample Development (no data)
- ❌ All other API endpoints

## Root Cause

The `BACKEND_URL` environment variable is not properly configured or accessible in the Next.js runtime, causing API proxy requests to fail.

## Solution

### Step 1: Verify Environment Variables

Check if `BACKEND_URL` is set in your `.env` file:

```bash
# On your server
cd /path/to/your/ERP/Southern-Final

# Check .env file
cat .env | grep BACKEND_URL
```

**Should see:**
```
BACKEND_URL=http://backend:8000
API_URL=http://backend:8000
```

### Step 2: Update Docker Compose (If Needed)

The `docker-compose.yml` should have these environment variables for the frontend service. Verify:

```yaml
frontend:
  environment:
    - BACKEND_URL=${BACKEND_URL:-http://backend:8000}
    - API_URL=${API_URL:-http://backend:8000}
    - NEXT_PUBLIC_API_MASK_URL=${NEXT_PUBLIC_API_MASK_URL:-/api/v1}
```

### Step 3: Pull Latest Code and Rebuild

```bash
# Pull latest fixes
cd /path/to/your/ERP/Southern-Final
git pull origin Ayman

# Rebuild frontend (important - environment variables are baked in at build time)
docker compose build frontend

# Restart services
docker compose up -d
```

### Step 4: Verify API Proxy is Working

```bash
# Check frontend logs for API proxy messages
docker compose logs frontend | grep -i "API Proxy\|BACKEND_URL" | tail -20

# Test API endpoint directly
curl http://localhost:2222/api/v1/buyers

# Should return JSON data or an error message (not connection refused)
```

### Step 5: Check Backend is Accessible

```bash
# Test backend directly
docker compose exec frontend wget -qO- http://backend:8000/api/v1/buyers

# Should return JSON data
```

---

## Alternative: Quick Fix Without Rebuild

If you can't rebuild right now, you can set the environment variable at runtime:

```bash
# Stop frontend
docker compose stop frontend

# Start with explicit environment variable
docker compose run --rm -e BACKEND_URL=http://backend:8000 -e API_URL=http://backend:8000 frontend

# Or update docker-compose.yml to hardcode (temporary):
# environment:
#   - BACKEND_URL=http://backend:8000
#   - API_URL=http://backend:8000
```

---

## Verification

After applying the fix:

1. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try loading Buyer Info page
   - Check if `/api/v1/buyers` request succeeds (status 200)

2. **Check Frontend Logs:**
   ```bash
   docker compose logs frontend | tail -50
   ```
   - Should see API proxy logs
   - No connection errors

3. **Test API Endpoint:**
   ```bash
   curl http://YOUR_SERVER_IP:2222/api/v1/buyers
   ```
   - Should return JSON data

---

## What Was Fixed

1. **`frontend/app/api/v1/[...path]/route.ts`**
   - Added better fallback for `BACKEND_URL`
   - Added error logging for debugging
   - Now checks multiple environment variable sources

2. **`frontend/lib/config.ts`**
   - Improved fallback logic
   - Better warning messages

3. **`frontend/next.config.ts`**
   - Enhanced rewrite configuration
   - Better environment variable handling

---

## Troubleshooting

### Issue: Still getting "Failed to load data"

**Check 1: Backend is running**
```bash
docker compose ps
# Should show backend container as "Up"
```

**Check 2: Backend is healthy**
```bash
docker compose exec backend curl http://localhost:8000/api/v1/health
# Should return {"status":"healthy"}
```

**Check 3: Network connectivity**
```bash
docker compose exec frontend ping backend
# Should work (or use wget instead)
docker compose exec frontend wget -qO- http://backend:8000/api/v1/health
```

**Check 4: Environment variables in container**
```bash
docker compose exec frontend env | grep BACKEND
# Should show BACKEND_URL=http://backend:8000
```

### Issue: "Connection refused" errors

This means the frontend can't reach the backend. Check:

1. **Both containers are on same network:**
   ```bash
   docker network inspect erp_erp
   # Should list both frontend and backend containers
   ```

2. **Backend service name is correct:**
   - In docker-compose.yml, backend service should be named `backend`
   - Frontend should use `http://backend:8000` (Docker service name)

### Issue: API returns 503 or 504

This means the proxy is working but backend is slow/unavailable:

```bash
# Check backend logs
docker compose logs backend | tail -50

# Check backend health
docker compose exec backend curl http://localhost:8000/api/v1/health
```

---

## Quick Diagnostic Script

Run this to check everything:

```bash
#!/bin/bash
echo "=== Checking Docker Containers ==="
docker compose ps

echo -e "\n=== Checking Backend Health ==="
docker compose exec backend curl -s http://localhost:8000/api/v1/health || echo "Backend not responding"

echo -e "\n=== Checking Frontend Environment ==="
docker compose exec frontend env | grep -E "BACKEND|API_URL" || echo "Environment variables not set"

echo -e "\n=== Testing API Proxy ==="
curl -s http://localhost:2222/api/v1/buyers | head -c 100 || echo "API proxy not working"

echo -e "\n=== Checking Network ==="
docker compose exec frontend wget -qO- http://backend:8000/api/v1/health || echo "Cannot reach backend from frontend"
```

---

## After Fix

Once fixed:
1. ✅ Buyer Info should load data
2. ✅ Supplier Info should load data
3. ✅ Merchandising Sample Development should work
4. ✅ All API endpoints should work

---

**Need More Help?** Check logs:
```bash
docker compose logs frontend --tail 100
docker compose logs backend --tail 100
```
