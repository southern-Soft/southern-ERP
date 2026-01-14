# Quick Fix for Proxmox Server Issues

## 🚨 Most Common Issue: CORS Configuration

**90% of "failed to load data" errors are CORS issues!**

### Quick Fix Steps:

1. **SSH into your Proxmox server**

2. **Navigate to backend directory:**
   ```bash
   cd /path/to/your/project/backend
   ```

3. **Edit .env file:**
   ```bash
   nano .env
   # or
   vim .env
   ```

4. **Add/Update CORS_ORIGINS:**
   ```bash
   # If accessing via IP:
   CORS_ORIGINS=http://YOUR_SERVER_IP:2222
   
   # If accessing via domain:
   CORS_ORIGINS=https://your-domain.com,http://your-domain.com
   
   # For development/testing (less secure):
   CORS_ORIGINS=*
   ```

5. **Restart backend:**
   ```bash
   docker compose restart app
   # or
   docker compose restart backend
   ```

6. **Check logs:**
   ```bash
   docker compose logs backend --tail 20
   ```

---

## 🔍 Find Your Server IP/Domain

**If you don't know your frontend URL:**

1. **Check what IP your server is using:**
   ```bash
   hostname -I
   # or
   ip addr show
   ```

2. **Check what port frontend is running on:**
   ```bash
   docker compose ps
   # Look for frontend service and its port mapping
   ```

3. **Your frontend URL will be:**
   - `http://YOUR_IP:FRONTEND_PORT` (usually 2222)
   - Or your domain if you have one configured

---

## ✅ Verify It's Fixed

1. **Test backend health:**
   ```bash
   curl http://localhost:8000/api/v1/health
   ```

2. **Check CORS in browser:**
   - Open your frontend in browser
   - Press F12 (Developer Tools)
   - Go to Network tab
   - Try loading data
   - Check if you see CORS errors

3. **Check backend logs:**
   ```bash
   docker compose logs backend -f
   # Watch for CORS-related errors
   ```

---

## 🐛 Still Not Working?

### Check These:

1. **Backend is running:**
   ```bash
   docker compose ps
   # Should show backend/app as "Up"
   ```

2. **Backend is accessible:**
   ```bash
   curl http://localhost:8000/api/v1/health
   # Should return JSON
   ```

3. **Environment variables are loaded:**
   ```bash
   docker compose exec backend env | grep CORS_ORIGINS
   # Should show your CORS_ORIGINS value
   ```

4. **Frontend can reach backend:**
   - Check browser console (F12)
   - Look for network errors
   - Check if API calls are being made

---

## 📋 Complete .env Example for Proxmox

```bash
# Environment
ENVIRONMENT=production

# Database (use your actual password!)
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_USER=postgres
POSTGRES_PORT=5432

# Security (generate a secure key!)
SECRET_KEY=your-generated-secret-key-here

# CORS - CRITICAL! Set this to your frontend URL
CORS_ORIGINS=http://YOUR_SERVER_IP:2222

# Token expiration
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

**Replace:**
- `YOUR_SERVER_IP` with your actual server IP
- `your_secure_password_here` with a strong password
- `your-generated-secret-key-here` with a generated secret key

---

## 🚀 One-Command Fix (if using IP)

```bash
# Replace YOUR_IP with your actual server IP
echo "CORS_ORIGINS=http://YOUR_IP:2222" >> backend/.env && docker compose restart app
```

---

**After making changes, always restart the backend container!**

```bash
docker compose restart app
# or
docker compose restart backend
```
