# Diagnose: Only Supplier Info Loading, Others Not Working

## Quick Check

Run these commands on your server to see what's happening:

### Step 1: Check if Backend is Running

```bash
docker compose ps
# Should show backend container as "Up"
```

### Step 2: Check Backend Logs for Errors

```bash
# Check recent errors
docker compose logs backend --tail 100 | grep -i "error\|exception\|traceback" -A 5

# Check for specific endpoint errors
docker compose logs backend --tail 200 | grep -E "buyers|contacts|shipping|banking" -i
```

### Step 3: Test API Endpoints Directly

```bash
# Test Buyers endpoint
curl -v https://erp.southerneleven.com/api/v1/buyers?limit=1

# Test Contacts endpoint  
curl -v https://erp.southerneleven.com/api/v1/contacts?limit=1

# Test Shipping endpoint
curl -v https://erp.southerneleven.com/api/v1/shipping?limit=1

# Test Banking endpoint
curl -v https://erp.southerneleven.com/api/v1/banking?limit=1

# Test Suppliers (working one)
curl -v https://erp.southerneleven.com/api/v1/suppliers?limit=1
```

**Look for:**
- HTTP status code (200 = OK, 500 = Server Error, 404 = Not Found)
- Response body (JSON data or error message)

### Step 4: Check Database Tables Exist

```bash
# Connect to clients database
docker compose exec db-clients psql -U postgres -d rmg_erp_clients -c "\dt"

# Should show:
# - buyers
# - suppliers  
# - buyer_types
# - contact_persons
# - shipping_info
# - banking_info
```

### Step 5: Check if Tables Have Data

```bash
# Count records in each table
docker compose exec db-clients psql -U postgres -d rmg_erp_clients -c "
SELECT 
    'buyers' as table_name, COUNT(*) as count FROM buyers
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'contact_persons', COUNT(*) FROM contact_persons
UNION ALL
SELECT 'shipping_info', COUNT(*) FROM shipping_info
UNION ALL
SELECT 'banking_info', COUNT(*) FROM banking_info;
"
```

---

## Common Issues & Solutions

### Issue 1: Code Not Deployed

**Symptom:** Still getting 500 errors after fixes

**Solution:**
```bash
# Pull latest code
cd /path/to/your/ERP/Southern-Final
git pull origin Ayman

# Rebuild and restart backend
docker compose build backend
docker compose restart backend

# Wait for backend to start (check logs)
docker compose logs backend -f
# Press Ctrl+C when you see "Application startup complete"
```

### Issue 2: Missing `buyer_types` Table

**Symptom:** Error about `buyer_types` table not existing

**Solution:**
```bash
docker compose exec db-clients psql -U postgres -d rmg_erp_clients -c "
CREATE TABLE IF NOT EXISTS buyer_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_buyer_types_name ON buyer_types(name);
"
```

### Issue 3: Foreign Key Constraint Errors

**Symptom:** Error about foreign key violations

**Solution:**
```bash
# Check for invalid buyer_type_id references
docker compose exec db-clients psql -U postgres -d rmg_erp_clients -c "
SELECT id, buyer_name, buyer_type_id 
FROM buyers 
WHERE buyer_type_id IS NOT NULL 
AND buyer_type_id NOT IN (SELECT id FROM buyer_types);
"

# If any results, fix them:
docker compose exec db-clients psql -U postgres -d rmg_erp_clients -c "
UPDATE buyers 
SET buyer_type_id = NULL 
WHERE buyer_type_id IS NOT NULL 
AND buyer_type_id NOT IN (SELECT id FROM buyer_types);
"
```

### Issue 4: Database Connection Issues

**Symptom:** Connection refused or timeout errors

**Solution:**
```bash
# Test database connection from backend
docker compose exec backend python -c "
from core.database import SessionLocalClients
db = SessionLocalClients()
try:
    result = db.execute('SELECT 1')
    print('✅ Database connection OK')
finally:
    db.close()
"
```

### Issue 5: Empty Response (No Data)

**Symptom:** API returns 200 but empty array `[]`

**Solution:**
- This is normal if tables are empty
- Check if you have data:
  ```bash
  docker compose exec db-clients psql -U postgres -d rmg_erp_clients -c "SELECT COUNT(*) FROM buyers;"
  ```

---

## Full Diagnostic Script

Run this complete diagnostic:

```bash
#!/bin/bash

echo "=== 1. Checking Docker Containers ==="
docker compose ps

echo -e "\n=== 2. Testing API Endpoints ==="
echo "Buyers:"
curl -s -o /dev/null -w "Status: %{http_code}\n" https://erp.southerneleven.com/api/v1/buyers?limit=1

echo "Contacts:"
curl -s -o /dev/null -w "Status: %{http_code}\n" https://erp.southerneleven.com/api/v1/contacts?limit=1

echo "Shipping:"
curl -s -o /dev/null -w "Status: %{http_code}\n" https://erp.southerneleven.com/api/v1/shipping?limit=1

echo "Banking:"
curl -s -o /dev/null -w "Status: %{http_code}\n" https://erp.southerneleven.com/api/v1/banking?limit=1

echo "Suppliers (should work):"
curl -s -o /dev/null -w "Status: %{http_code}\n" https://erp.southerneleven.com/api/v1/suppliers?limit=1

echo -e "\n=== 3. Checking Database Tables ==="
docker compose exec db-clients psql -U postgres -d rmg_erp_clients -c "\dt" | grep -E "buyers|suppliers|buyer_types|contact_persons|shipping_info|banking_info"

echo -e "\n=== 4. Checking Recent Backend Errors ==="
docker compose logs backend --tail 50 | grep -i "error\|exception" | tail -10

echo -e "\n=== 5. Checking Backend Health ==="
curl -s https://erp.southerneleven.com/api/v1/health | head -c 200
echo ""
```

---

## What to Share for Help

If issues persist, share:

1. **Backend logs:**
   ```bash
   docker compose logs backend --tail 200 > backend_logs.txt
   ```

2. **API response:**
   ```bash
   curl -v https://erp.southerneleven.com/api/v1/buyers?limit=1 > buyers_response.txt 2>&1
   ```

3. **Database table list:**
   ```bash
   docker compose exec db-clients psql -U postgres -d rmg_erp_clients -c "\dt" > tables.txt
   ```

4. **Git status:**
   ```bash
   cd /path/to/your/ERP/Southern-Final
   git status
   git log --oneline -5
   ```

---

## Expected Behavior After Fix

Once fixed, you should see:

1. ✅ **Buyers:** `GET /api/v1/buyers` returns 200 with JSON array
2. ✅ **Contacts:** `GET /api/v1/contacts` returns 200 with JSON array
3. ✅ **Shipping:** `GET /api/v1/shipping` returns 200 with JSON array
4. ✅ **Banking:** `GET /api/v1/banking` returns 200 with JSON array
5. ✅ **Suppliers:** `GET /api/v1/suppliers` returns 200 with JSON array (already working)

All endpoints should return either:
- JSON array with data: `[{...}, {...}]`
- Empty array if no data: `[]`
- **NOT** 500 error or connection refused
