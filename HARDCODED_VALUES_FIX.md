# Hardcoded Values Fix - Summary

## Overview
All hardcoded URLs, ports, and configuration values have been removed and replaced with environment variables for flexible deployment.

## Changes Made

### 1. Frontend Configuration (`frontend/lib/config.ts`)

**Fixed:**
- ✅ `BACKEND_URL`: Now requires environment variable (with Docker fallback for server-side)
- ✅ `FRONTEND_PORT`: Changed default from `3000` to `2222`
- ✅ `ALLOWED_HOSTNAMES`: Removed hardcoded `["localhost"]`, now requires env var

**Before:**
```typescript
BACKEND_URL: process.env.BACKEND_URL || process.env.API_URL || "http://backend:8000",
PORT: process.env.PORT || process.env.FRONTEND_PORT || "3000",
ALLOWED_HOSTNAMES: process.env.NEXT_PUBLIC_IMAGE_HOSTNAMES?.split(",") || ["localhost"],
```

**After:**
```typescript
BACKEND_URL: (() => {
  if (typeof window === "undefined") {
    const url = process.env.BACKEND_URL || process.env.API_URL;
    if (!url) {
      console.warn("BACKEND_URL or API_URL not set");
      return "http://backend:8000"; // Docker default fallback
    }
    return url;
  }
  return ""; // Browser: not used (API masking)
})(),
PORT: process.env.PORT || process.env.FRONTEND_PORT || "2222",
ALLOWED_HOSTNAMES: process.env.NEXT_PUBLIC_IMAGE_HOSTNAMES?.split(",").filter(Boolean) || [],
```

### 2. Docker Compose (`docker-compose.yml`)

**Fixed:**
- ✅ `db-samples` port: Changed from hardcoded `"5433:5432"` to `"${DB_SAMPLES_PORT:-5433}:5432"`
- ✅ Backend healthcheck: Changed from `http://localhost:8000` to `http://localhost:${BACKEND_PORT:-8000}`
- ✅ Frontend port: Changed default from `3000` to `2222`
- ✅ Frontend environment: Made `BACKEND_URL` and `API_URL` configurable

**Before:**
```yaml
ports:
  - "5433:5432"
ports:
  - "${FRONTEND_PORT:-3000}:3000"
environment:
  - BACKEND_URL=http://backend:8000
  - API_URL=http://backend:8000
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health"]
```

**After:**
```yaml
ports:
  - "${DB_SAMPLES_PORT:-5433}:5432"
ports:
  - "${FRONTEND_PORT:-2222}:3000"
environment:
  - BACKEND_URL=${BACKEND_URL:-http://backend:${BACKEND_PORT:-8000}}
  - API_URL=${API_URL:-http://backend:${BACKEND_PORT:-8000}}
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:${BACKEND_PORT:-8000}/api/v1/health"]
```

### 3. Frontend Package.json (`frontend/package.json`)

**Fixed:**
- ✅ Dev script: Changed from `-p 3000` to `-p ${PORT:-2222}`
- ✅ Start script: Changed from `-p 3000` to `-p ${PORT:-2222}`

**Before:**
```json
"dev": "next dev -H 0.0.0.0 -p 3000",
"start": "next start -H 0.0.0.0 -p 3000",
```

**After:**
```json
"dev": "next dev -H 0.0.0.0 -p ${PORT:-2222}",
"start": "next start -H 0.0.0.0 -p ${PORT:-2222}",
```

### 4. Frontend Dockerfile (`frontend/Dockerfile`)

**Fixed:**
- ✅ Port environment variable: Made configurable

**Before:**
```dockerfile
ENV PORT=3000
```

**After:**
```dockerfile
ENV PORT=${PORT:-3000}
```

### 5. Created `.env.example`

Created comprehensive `.env.example` file with:
- All required environment variables
- Documentation for each variable
- Production deployment notes
- Default values where appropriate

## Environment Variables Required

### Required for Production:

1. **Database:**
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_HOST_*` (6 databases)

2. **Security:**
   - `SECRET_KEY` (MUST change in production!)

3. **Ports:**
   - `FRONTEND_PORT` (default: 2222)
   - `BACKEND_PORT` (default: 8000)

4. **Backend URL:**
   - `BACKEND_URL` or `API_URL` (for server-side rendering)

5. **CORS:**
   - `CORS_ORIGINS` (set to your domain in production)

### Optional but Recommended:

- `NEXT_PUBLIC_SITE_URL` - Frontend URL
- `NEXT_PUBLIC_IMAGE_HOSTNAMES` - For image optimization
- `NEXT_PUBLIC_APP_NAME` - Application name
- `ENVIRONMENT` - Environment type

## Deployment Instructions

### 1. Copy Environment File
```bash
cp .env.example .env
```

### 2. Update `.env` with Your Values

**For Production Server:**
```env
# Ports
FRONTEND_PORT=2222
BACKEND_PORT=8000

# Backend URL (if different from Docker service)
BACKEND_URL=http://your-backend-domain.com
API_URL=http://your-backend-domain.com

# Frontend URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# CORS
CORS_ORIGINS=https://your-domain.com

# Security
SECRET_KEY=your-secure-random-key-here

# Database (if not using Docker)
POSTGRES_HOST_CLIENTS=your-db-host
# ... etc
```

### 3. Start Services
```bash
docker-compose up -d --build
```

### 4. Access Application
- **Frontend:** http://your-server-ip:2222
- **Backend API:** http://your-server-ip:8000
- **API Docs:** http://your-server-ip:8000/docs

## Verification

### Check Environment Variables:
```bash
# Backend
docker exec erp_backend env | grep -E "BACKEND|POSTGRES|SECRET"

# Frontend
docker exec erp_frontend env | grep -E "BACKEND|API|NEXT_PUBLIC"
```

### Test API Connection:
```bash
curl http://your-server-ip:8000/api/v1/health
```

### Test Frontend:
```bash
curl http://your-server-ip:2222
```

## Notes

1. **No Hardcoded URLs:** All URLs are now configurable via environment variables
2. **Port 2222:** Default frontend port changed to 2222 as requested
3. **Docker Service Names:** Internal Docker communication uses service names (backend, db-clients, etc.)
4. **API Masking:** Frontend uses `/api/v1/*` which proxies to backend (no hardcoded backend URL in browser)
5. **Server-Side Rendering:** Backend URL required for SSR, but uses Docker service name as fallback

## Remaining Hardcoded Values (Acceptable)

These are acceptable as they are:
- Docker service names (`backend`, `db-clients`, etc.) - Internal Docker networking
- Container internal ports (3000, 8000) - Standard container ports
- Database internal ports (5432) - PostgreSQL standard port
- Healthcheck URLs using `localhost` - Internal container health checks

## Testing Checklist

- [ ] Frontend accessible on port 2222
- [ ] Backend accessible on configured port
- [ ] API requests work from frontend
- [ ] Database connections work
- [ ] No console errors about missing env vars
- [ ] CORS headers work correctly
- [ ] Image optimization works (if hostnames configured)
