# Deployment Guide - Southern Apparels ERP

## Quick Start

### 1. Create Environment File

Create a `.env` file in the project root:

```bash
# Copy from template (if exists) or create new
cat > .env << 'EOF'
# Project Name
COMPOSE_PROJECT_NAME=erp

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_PORT=5432

# Database Hosts (Docker service names)
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

# Application Ports
FRONTEND_PORT=2222
BACKEND_PORT=8000

# Security (CHANGE IN PRODUCTION!)
SECRET_KEY=your-secret-key-change-this-in-production-please-make-it-secure
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS
CORS_ORIGINS=*

# Backend URL (for Docker internal communication)
BACKEND_URL=http://backend:8000
API_URL=http://backend:8000

# Environment
ENVIRONMENT=production
EOF
```

### 2. Generate Secure Secret Key

```bash
# Generate a secure random key
openssl rand -hex 32
```

Update `SECRET_KEY` in `.env` with the generated value.

### 3. Start Services

```bash
docker-compose up -d --build
```

### 4. Access Application

- **Frontend:** http://your-server-ip:2222
- **Backend API:** http://your-server-ip:8000
- **API Documentation:** http://your-server-ip:8000/docs

## Configuration Details

### Port Configuration

**Frontend Port (2222):**
- Host port: `2222` (configurable via `FRONTEND_PORT`)
- Container port: `3000` (fixed, internal)

**Backend Port (8000):**
- Host port: `8000` (configurable via `BACKEND_PORT`)
- Container port: `8000` (fixed, internal)

**Database Ports:**
- Internal: `5432` (all databases)
- External: Only `db-samples` exposed on `5433` (configurable via `DB_SAMPLES_PORT`)

### Environment Variables

#### Required Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `POSTGRES_USER` | PostgreSQL username | `postgres` | Yes |
| `POSTGRES_PASSWORD` | PostgreSQL password | - | **Yes** |
| `SECRET_KEY` | JWT secret key | - | **Yes** (change in production!) |
| `FRONTEND_PORT` | Frontend host port | `2222` | No |
| `BACKEND_PORT` | Backend host port | `8000` | No |

#### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGINS` | Allowed CORS origins | `*` |
| `NEXT_PUBLIC_SITE_URL` | Frontend public URL | - |
| `NEXT_PUBLIC_IMAGE_HOSTNAMES` | Image optimization hosts | - |
| `ENVIRONMENT` | Environment type | `production` |

### Production Deployment

#### 1. Update Security Settings

```env
# Generate secure secret key
SECRET_KEY=<generated-secure-key>

# Restrict CORS to your domain
CORS_ORIGINS=https://yourdomain.com

# Set environment
ENVIRONMENT=production
```

#### 2. Configure Frontend URLs

```env
# Your frontend domain
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Image optimization (if using CDN)
NEXT_PUBLIC_IMAGE_HOSTNAMES=yourdomain.com,cdn.yourdomain.com
```

#### 3. Database Configuration

If using external databases (not Docker):

```env
POSTGRES_HOST_CLIENTS=your-db-host.com
POSTGRES_HOST_SAMPLES=your-db-host.com
# ... etc
```

#### 4. Backend URL (if different from Docker service)

If backend is on a different server:

```env
BACKEND_URL=https://api.yourdomain.com
API_URL=https://api.yourdomain.com
```

## Verification

### Check Services Status

```bash
docker-compose ps
```

### Check Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Test API

```bash
# Health check
curl http://localhost:8000/api/v1/health

# API docs
curl http://localhost:8000/docs
```

### Test Frontend

```bash
curl http://localhost:2222
```

## Troubleshooting

### Port Already in Use

If port 2222 or 8000 is already in use:

```env
# Change in .env
FRONTEND_PORT=2223
BACKEND_PORT=8001
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

### Database Connection Issues

Check database hosts are correct:
```bash
docker-compose exec backend env | grep POSTGRES_HOST
```

### Backend Not Accessible

1. Check backend logs:
```bash
docker-compose logs backend
```

2. Check health endpoint:
```bash
docker-compose exec backend curl http://localhost:8000/api/v1/health
```

### Frontend Not Loading

1. Check frontend logs:
```bash
docker-compose logs frontend
```

2. Check if backend URL is correct:
```bash
docker-compose exec frontend env | grep BACKEND_URL
```

## No Hardcoded Values

✅ All URLs are configurable via environment variables
✅ All ports are configurable via environment variables
✅ No hardcoded localhost URLs
✅ No hardcoded IP addresses
✅ Docker service names used for internal communication only

## Files Modified

- `frontend/lib/config.ts` - Removed hardcoded URLs and ports
- `docker-compose.yml` - Made ports and URLs configurable
- `frontend/package.json` - Made dev/start ports configurable
- `frontend/Dockerfile` - Made port configurable

## Support

For issues or questions, check:
- `HARDCODED_VALUES_FIX.md` - Detailed fix documentation
- `CODEBASE_ANALYSIS.md` - Architecture overview
