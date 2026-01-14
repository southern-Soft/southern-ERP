# Proxmox Server Deployment Troubleshooting Guide

## 🔍 Common Issues & Solutions

### Issue 1: "Failed to load data" - CORS Errors

**Symptoms:**
- Works on localhost but fails on server
- Browser console shows CORS errors
- Network tab shows OPTIONS requests failing

**Solution:**

1. **Set CORS_ORIGINS in backend/.env:**
   ```bash
   # On your Proxmox server
   cd /path/to/backend
   nano .env
   
   # Add or update:
   CORS_ORIGINS=http://your-server-ip:2222,https://your-domain.com
   # Replace with your actual frontend URL
   ```

2. **Restart backend:**
   ```bash
   docker compose restart app
   # or
   docker compose restart backend
   ```

### Issue 2: API Connection Failed

**Symptoms:**
- Frontend can't reach backend
- "Failed to fetch" errors
- Network timeout

**Solution:**

1. **Check backend is running:**
   ```bash
   docker compose ps
   # Should show backend/app container as "Up"
   ```

2. **Check backend logs:**
   ```bash
   docker compose logs backend --tail 50
   # or
   docker compose logs app --tail 50
   ```

3. **Test backend directly:**
   ```bash
   curl http://localhost:8000/api/v1/health
   # Should return JSON response
   ```

4. **Check frontend API configuration:**
   - Verify `NEXT_PUBLIC_API_URL` or `BACKEND_URL` is set correctly
   - Should point to your backend URL (not localhost!)

### Issue 3: Database Connection Errors

**Symptoms:**
- Backend logs show database connection errors
- "Connection refused" or "Authentication failed"

**Solution:**

1. **Verify database containers are running:**
   ```bash
   docker compose ps
   # All db-* containers should be "Up"
   ```

2. **Check database environment variables:**
   ```bash
   # In backend/.env
   POSTGRES_PASSWORD=your_actual_password
   POSTGRES_USER=postgres
   POSTGRES_HOST_CLIENTS=db-clients
   POSTGRES_HOST_SAMPLES=db-samples
   # etc...
   ```

3. **Test database connection:**
   ```bash
   docker compose exec backend python -c "from core.database import engines; print('DB OK')"
   ```

### Issue 4: Environment Variables Not Loading

**Symptoms:**
- Configuration using default values
- Wrong database connections
- Missing secrets

**Solution:**

1. **Verify .env file exists:**
   ```bash
   ls -la backend/.env
   # Should show the file
   ```

2. **Check .env file permissions:**
   ```bash
   chmod 600 backend/.env
   ```

3. **Verify docker-compose.yml uses env_file:**
   ```yaml
   services:
     backend:
       env_file:
         - .env
   ```

### Issue 5: Port Conflicts

**Symptoms:**
- Containers won't start
- "Port already in use" errors

**Solution:**

1. **Check what's using the ports:**
   ```bash
   # Check port 8000 (backend)
   netstat -tulpn | grep 8000
   # or
   ss -tulpn | grep 8000
   
   # Check port 2222 (frontend)
   netstat -tulpn | grep 2222
   ```

2. **Change ports in docker-compose.yml if needed:**
   ```yaml
   ports:
     - "8001:8000"  # Change external port
   ```

---

## 🔧 Step-by-Step Deployment Checklist

### On Your Proxmox Server:

#### 1. Clone/Pull Latest Code
```bash
cd /path/to/your/project
git pull origin Ayman
```

#### 2. Set Up Backend Environment
```bash
cd backend
cp .env.example .env
nano .env
```

**Required settings:**
```bash
ENVIRONMENT=production
POSTGRES_PASSWORD=your_secure_password
SECRET_KEY=your_generated_secret_key
CORS_ORIGINS=http://your-server-ip:2222,https://your-domain.com
```

#### 3. Set Up Frontend Environment (if needed)
```bash
cd ../frontend
cp .env.example .env.local
nano .env.local
```

**Required settings:**
```bash
NEXT_PUBLIC_API_URL=http://your-server-ip:8000
# or if using domain:
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

#### 4. Start Services
```bash
cd /path/to/project/backend
docker compose up -d
```

#### 5. Check Logs
```bash
# Backend logs
docker compose logs backend -f

# Frontend logs (if separate)
docker compose logs frontend -f
```

#### 6. Verify Services
```bash
# Check all containers are running
docker compose ps

# Test backend health
curl http://localhost:8000/api/v1/health

# Test frontend (if accessible)
curl http://localhost:2222
```

---

## 🐛 Diagnostic Commands

Run these on your Proxmox server to diagnose issues:

### Check Container Status
```bash
docker compose ps
```

### Check Backend Logs
```bash
docker compose logs backend --tail 100
```

### Check Database Connections
```bash
docker compose exec backend python -c "
from core.config import settings
print(f'DB Host: {settings.POSTGRES_HOST_SAMPLES}')
print(f'DB Name: {settings.POSTGRES_DB_SAMPLES}')
print(f'CORS Origins: {settings.CORS_ORIGINS}')
print(f'Environment: {settings.ENVIRONMENT}')
"
```

### Test API Endpoint
```bash
curl -v http://localhost:8000/api/v1/health
```

### Check Network Connectivity
```bash
# From frontend container to backend
docker compose exec frontend ping backend
# or
docker compose exec frontend curl http://backend:8000/api/v1/health
```

### Check Environment Variables
```bash
docker compose exec backend env | grep -E "POSTGRES|SECRET|CORS|ENVIRONMENT"
```

---

## 📋 Common Error Messages & Fixes

### "CORS policy: No 'Access-Control-Allow-Origin' header"
**Fix:** Set `CORS_ORIGINS` in backend/.env to include your frontend URL

### "Failed to fetch"
**Fix:** 
- Check backend is running
- Verify API URL in frontend config
- Check firewall rules

### "Connection refused"
**Fix:**
- Verify database containers are running
- Check database hostnames in .env
- Verify network connectivity between containers

### "Invalid token" or "Unauthorized"
**Fix:**
- Check SECRET_KEY is set correctly
- Verify token hasn't expired
- Check JWT configuration

### "Module not found" or "Import error"
**Fix:**
- Rebuild Docker images: `docker compose build`
- Check requirements.txt is up to date
- Verify Python dependencies

---

## 🔐 Security Checklist for Production

- [ ] `ENVIRONMENT=production` is set
- [ ] `POSTGRES_PASSWORD` is strong and unique
- [ ] `SECRET_KEY` is generated securely (not default)
- [ ] `CORS_ORIGINS` is set to specific domains (not "*")
- [ ] `.env` file has correct permissions (600)
- [ ] Firewall rules are configured
- [ ] SSL/HTTPS is configured (if using domain)
- [ ] Database passwords are secure
- [ ] No default credentials in use

---

## 📞 Getting More Help

If issues persist:

1. **Collect logs:**
   ```bash
   docker compose logs > deployment-logs.txt
   ```

2. **Check browser console:**
   - Open Developer Tools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Verify network:**
   ```bash
   # Can frontend reach backend?
   curl http://your-backend-url:8000/api/v1/health
   ```

4. **Check docker-compose.yml:**
   - Verify all services are defined
   - Check network configuration
   - Verify volume mounts

---

## 🚀 Quick Fix Script

Save this as `check-deployment.sh` and run it:

```bash
#!/bin/bash
echo "=== Deployment Health Check ==="

echo "1. Checking containers..."
docker compose ps

echo -e "\n2. Checking backend health..."
curl -s http://localhost:8000/api/v1/health | head -20

echo -e "\n3. Checking environment variables..."
docker compose exec backend env | grep -E "POSTGRES|SECRET|CORS|ENVIRONMENT" | head -10

echo -e "\n4. Checking recent logs..."
docker compose logs backend --tail 20

echo -e "\n=== Check Complete ==="
```

Make it executable:
```bash
chmod +x check-deployment.sh
./check-deployment.sh
```

---

**Remember:** Most issues are caused by:
1. Missing or incorrect CORS_ORIGINS
2. Wrong API URL in frontend
3. Database connection issues
4. Missing environment variables

Start with these checks first! 🔍
