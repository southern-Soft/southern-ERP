# Fix Database Schema Errors

## Issues Found

1. **Missing `techpack_files` column** in `sample_primary_info` table
   - Error: `column sample_primary_info.techpack_files does not exist`
   - Location: Merchandising > Sample Development

2. **Failed to load client info data** (likely related to buyers API)

---

## Solution: Run Database Migration

### Option 1: Automatic Migration (Recommended)

The migration will run automatically when you restart the backend. The updated `database.py` will:
1. Check for missing `techpack_files` column
2. Add it if missing
3. Run other schema migrations

**Steps:**
```bash
# On your server
cd /path/to/your/ERP/Southern-Final

# Pull latest code
git pull origin Ayman

# Restart backend to trigger migration
docker compose restart backend

# Check logs to verify migration
docker compose logs backend | grep -i migration
```

### Option 2: Manual Migration Script

If automatic migration doesn't work, run the standalone script:

```bash
# On your server
cd /path/to/your/ERP/Southern-Final

# Enter backend container
docker compose exec backend bash

# Run migration script
python migrations/add_techpack_files_column.py

# Exit container
exit
```

### Option 3: Direct SQL (If scripts don't work)

Connect to your database and run:

```sql
-- Connect to merchandiser database
\c rmg_erp_merchandiser

-- Check if column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name='sample_primary_info' 
AND column_name='techpack_files';

-- If no results, add the column
ALTER TABLE sample_primary_info 
ADD COLUMN techpack_files jsonb;
```

---

## Verification

After running the migration, verify the column exists:

```bash
# Connect to database
docker compose exec db-merchandiser psql -U postgres -d rmg_erp_merchandiser

# Check columns
\d sample_primary_info

# Should see techpack_files in the list
# Exit with \q
```

Or via SQL:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name='sample_primary_info' 
AND column_name='techpack_files';
```

---

## What Was Fixed

### Files Changed:

1. **`backend/core/database.py`**
   - Updated `_run_merchandiser_migrations()` function
   - Now checks for and adds `techpack_files` column
   - Calls comprehensive schema migration

2. **`backend/migrations/add_techpack_files_column.py`** (NEW)
   - Standalone migration script
   - Can be run manually if needed

---

## Troubleshooting

### If migration fails:

1. **Check database connection:**
   ```bash
   docker compose exec backend python -c "from core.database import engines, DatabaseType; print('DB OK' if engines[DatabaseType.MERCHANDISER] else 'DB FAILED')"
   ```

2. **Check table exists:**
   ```bash
   docker compose exec db-merchandiser psql -U postgres -d rmg_erp_merchandiser -c "\dt sample_primary_info"
   ```

3. **Check logs:**
   ```bash
   docker compose logs backend | tail -50
   ```

### If "client info data" error persists:

1. **Check buyers API:**
   ```bash
   curl http://localhost:8000/api/v1/buyers
   ```

2. **Check backend logs:**
   ```bash
   docker compose logs backend | grep -i buyer
   ```

3. **Verify database connection:**
   ```bash
   docker compose exec backend python -c "from core.database import SessionLocalClients; db = SessionLocalClients(); print('Clients DB OK'); db.close()"
   ```

---

## After Fix

Once the migration is complete:
1. Refresh your browser
2. Navigate to Merchandising > Sample Development
3. The error should be gone
4. You should be able to load samples without errors

---

## Need Help?

If issues persist:
1. Check backend logs: `docker compose logs backend`
2. Check database logs: `docker compose logs db-merchandiser`
3. Verify all containers are running: `docker compose ps`
