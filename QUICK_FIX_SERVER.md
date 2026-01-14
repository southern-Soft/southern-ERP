# Quick Fix: Failed to Load Data Error

## Immediate Solution

The error is caused by a missing `techpack_files` column in the database. Here are **3 ways to fix it**:

---

## Option 1: Direct SQL (Fastest - 30 seconds)

**SSH into your server and run:**

```bash
# Connect to the database
docker compose exec db-merchandiser psql -U postgres -d rmg_erp_merchandiser

# Run this SQL command:
ALTER TABLE sample_primary_info ADD COLUMN IF NOT EXISTS techpack_files jsonb;

# Exit
\q
```

**Then restart backend:**
```bash
docker compose restart backend
```

---

## Option 2: Run Fix Script (Recommended)

```bash
# On your server
cd /path/to/your/ERP/Southern-Final

# Pull latest code (if you haven't)
git pull origin Ayman

# Run the fix script
docker compose exec backend python migrations/fix_techpack_files_immediate.py

# Restart backend
docker compose restart backend
```

---

## Option 3: Automatic Migration (After Pull)

```bash
# On your server
cd /path/to/your/ERP/Southern-Final

# Pull latest code
git pull origin Ayman

# Restart backend (migration runs automatically)
docker compose restart backend

# Check if migration ran successfully
docker compose logs backend | grep -i "techpack_files\|migration"
```

---

## Verify the Fix

After running any of the above, verify the column exists:

```bash
# Check column exists
docker compose exec db-merchandiser psql -U postgres -d rmg_erp_merchandiser -c "\d sample_primary_info" | grep techpack_files
```

You should see: `techpack_files | jsonb |`

---

## If Still Not Working

### Check Backend Logs
```bash
docker compose logs backend --tail 50
```

### Check Database Connection
```bash
docker compose exec backend python -c "from core.database import engines, DatabaseType; print('OK' if engines[DatabaseType.MERCHANDISER] else 'FAILED')"
```

### Manual Verification
```bash
# Connect to database
docker compose exec db-merchandiser psql -U postgres -d rmg_erp_merchandiser

# Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sample_primary_info' 
AND column_name = 'techpack_files';

# If no results, add it:
ALTER TABLE sample_primary_info ADD COLUMN techpack_files jsonb;

# Exit
\q
```

---

## What This Fixes

- ✅ `column sample_primary_info.techpack_files does not exist` error
- ✅ "Failed to load samples" error in Merchandising > Sample Development
- ✅ Internal server error in sample requests

---

## After Fix

1. Refresh your browser
2. Navigate to Merchandising > Sample Development
3. Data should load successfully

---

**Need Help?** Check the logs:
```bash
docker compose logs backend | tail -100
```
