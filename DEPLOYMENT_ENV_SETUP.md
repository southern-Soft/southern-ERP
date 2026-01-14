# Environment Variables Setup for Deployment

## ⚠️ Important Security Note

**NEVER commit `.env` files to Git!** They contain secrets like passwords and API keys.

**DO commit `.env.example` files!** They are templates without real secrets.

---

## 🚀 Quick Setup for Server Deployment

### Step 1: Copy the Template

On your server, copy the example file to create your actual `.env` file:

```bash
# In the backend directory
cd backend
cp .env.example .env

# In the frontend directory (if needed)
cd ../frontend
cp .env.example .env.local
```

### Step 2: Edit the .env File

Open `.env` and fill in your actual values:

```bash
# Edit with your preferred editor
nano .env
# or
vim .env
```

### Step 3: Set Required Values

**CRITICAL - Must Set These:**

1. **POSTGRES_PASSWORD** - Your database password
   ```bash
   POSTGRES_PASSWORD=your_strong_password_here
   ```

2. **SECRET_KEY** - JWT secret key (generate a secure one!)
   ```bash
   # Generate a secure key:
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   
   # Then set it in .env:
   SECRET_KEY=the_generated_key_here
   ```

3. **CORS_ORIGINS** - Your frontend domain(s)
   ```bash
   CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
   ```

4. **ENVIRONMENT** - Set to production
   ```bash
   ENVIRONMENT=production
   ```

### Step 4: Verify

Check that your `.env` file is NOT tracked by git:

```bash
git status
# .env should NOT appear in the list
```

If `.env` appears, it means it's being tracked. Remove it:

```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
```

---

## 📋 Required Environment Variables

### Backend (backend/.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ENVIRONMENT` | ✅ | Environment mode | `production` |
| `POSTGRES_PASSWORD` | ✅ | Database password | `your_secure_password` |
| `SECRET_KEY` | ✅ | JWT secret key | `generated_key_here` |
| `CORS_ORIGINS` | ✅ | Allowed frontend domains | `https://app.example.com` |
| `POSTGRES_USER` | ⚪ | Database user (default: postgres) | `postgres` |
| `POSTGRES_PORT` | ⚪ | Database port (default: 5432) | `5432` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ⚪ | Token expiration (default: 10080) | `10080` |

### Frontend (frontend/.env.local)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API URL | `https://api.example.com` |
| `NODE_ENV` | ⚪ | Environment mode | `production` |

---

## 🔐 Security Best Practices

### 1. Generate Strong Secrets

**Database Password:**
```bash
openssl rand -base64 32
```

**JWT Secret Key:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
# or
openssl rand -hex 32
```

### 2. File Permissions

On Linux/Unix servers, restrict access to `.env` files:

```bash
chmod 600 .env          # Only owner can read/write
chmod 600 .env.local   # Only owner can read/write
```

### 3. Never Commit Secrets

- ✅ `.env.example` → Safe to commit (no secrets)
- ❌ `.env` → Never commit (contains secrets)
- ❌ `.env.local` → Never commit (contains secrets)
- ❌ `.env.production` → Never commit (contains secrets)

### 4. Use Different Secrets for Each Environment

- Development: Use simple passwords (not in production!)
- Production: Use strong, unique passwords
- Staging: Use different secrets than production

---

## 🐳 Docker Deployment

If using Docker Compose, you can also set environment variables in `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - SECRET_KEY=${SECRET_KEY}
      - CORS_ORIGINS=${CORS_ORIGINS}
    env_file:
      - .env
```

Or use a `.env` file in the same directory as `docker-compose.yml`.

---

## 🔄 Updating Environment Variables

### Adding New Variables

1. Add to `.env.example` (with example/placeholder value)
2. Document in this file
3. Update `backend/core/config.py` if needed
4. Update your server's `.env` file with actual values

### Changing Existing Variables

1. Update `.env.example` with new format/description
2. Update your server's `.env` file
3. Restart the application

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] `.env` file exists on server
- [ ] `POSTGRES_PASSWORD` is set and strong
- [ ] `SECRET_KEY` is set and unique
- [ ] `CORS_ORIGINS` matches your frontend domain(s)
- [ ] `ENVIRONMENT=production` is set
- [ ] `.env` is NOT tracked by git (`git status` shows nothing)
- [ ] File permissions are secure (600)
- [ ] All required variables are filled in

---

## 🆘 Troubleshooting

### "Module not found" or "Configuration error"

- Check that `.env` file exists in the correct location
- Verify file permissions (should be readable)
- Check for typos in variable names
- Ensure no extra spaces around `=` sign

### "Database connection failed"

- Verify `POSTGRES_PASSWORD` matches database password
- Check `POSTGRES_HOST_*` values (for Docker, use service names)
- Verify database containers are running

### "CORS error" in browser

- Check `CORS_ORIGINS` includes your frontend URL
- Ensure no trailing slashes in URLs
- Verify HTTPS/HTTP matches your setup

### "Invalid token" or "Unauthorized"

- Verify `SECRET_KEY` is set correctly
- Check that `SECRET_KEY` hasn't changed (invalidates existing tokens)
- Ensure token hasn't expired

---

## 📞 Support

If you encounter issues:

1. Check application logs: `docker compose logs backend`
2. Verify environment variables are loaded: Check logs for config values
3. Test database connection: `docker compose exec backend python -c "from core.config import settings; print(settings.POSTGRES_HOST_SAMPLES)"`
4. Review this documentation again

---

**Remember: Keep your `.env` files secure and never commit them to Git!** 🔒
