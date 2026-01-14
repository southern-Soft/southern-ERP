# Fix: 500 Internal Server Error - Buyer Info, Shipping, Banking, Contacts

## Problem

All client info endpoints are returning **500 Internal Server Error**:
- ❌ Buyer Info - `GET /api/v1/buyers` returns 500
- ❌ Shipping Info - `GET /api/v1/shipping` returns 500
- ❌ Banking Info - `GET /api/v1/banking` returns 500
- ❌ Contact Info - `GET /api/v1/contacts` returns 500
- ✅ Supplier Info - **Working** (no relationships)

## Root Causes Found

1. **Missing `buyer_types` table** - The `joinedload(Buyer.buyer_type)` relationship fails if table doesn't exist
2. **Wrong model imports** - `init_db()` was importing wrong model names, preventing tables from being created
3. **Banking route bug** - Trying to filter by fields that don't exist in the model
4. **No error handling** - Relationship loading failures caused unhandled exceptions

## Solution

### Step 1: Pull Latest Code

```bash
cd /path/to/your/ERP/Southern-Final
git pull origin Ayman
```

### Step 2: Restart Backend (Tables will be created/verified)

```bash
docker compose restart backend
```

### Step 3: Verify Tables Were Created

```bash
# Check if buyer_types table exists
docker compose exec db-clients psql -U postgres -d rmg_erp_clients -c "\dt buyer_types"

# Should show the table, or you'll see an error if it doesn't exist
```

### Step 4: If Tables Are Missing, Create Them Manually

If the tables still don't exist after restart, create them:

```bash
# Connect to clients database
docker compose exec db-clients psql -U postgres -d rmg_erp_clients

# Create buyer_types table if missing
CREATE TABLE IF NOT EXISTS buyer_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

# Create index
CREATE INDEX IF NOT EXISTS idx_buyer_types_name ON buyer_types(name);

# Exit
\q
```

### Step 5: Check Backend Logs

```bash
docker compose logs backend | tail -100 | grep -i "error\|exception\|buyer\|shipping\|banking"
```

Look for specific error messages that will tell us what's wrong.

---

## What Was Fixed

### 1. **`backend/core/database.py`**
   - Fixed model imports: `Contact, ShippingAddress` → `ContactPerson, ShippingInfo, BuyerType`
   - Now properly imports all client models so tables get created

### 2. **`backend/modules/clients/routes/buyers.py`**
   - Added error handling for `joinedload(Buyer.buyer_type)` relationship
   - Falls back to simple query if relationship fails
   - Better error messages

### 3. **`backend/modules/clients/routes/shipping.py`**
   - Added error handling for `joinedload(ShippingInfo.buyer)` relationship
   - Falls back to simple query if relationship fails

### 4. **`backend/modules/clients/routes/banking.py`**
   - Removed filters for non-existent `client_type` and `client_id` fields
   - Changed to filter by `client_name` (which exists in the model)
   - Added proper error handling

---

## Verification

After applying the fix:

1. **Test Buyer Info:**
   ```bash
   curl https://erp.southerneleven.com/api/v1/buyers?limit=10
   ```
   Should return JSON array (not 500 error)

2. **Test Shipping Info:**
   ```bash
   curl https://erp.southerneleven.com/api/v1/shipping?limit=10
   ```

3. **Test Banking Info:**
   ```bash
   curl https://erp.southerneleven.com/api/v1/banking?limit=10
   ```

4. **Test Contact Info:**
   ```bash
   curl https://erp.southerneleven.com/api/v1/contacts?limit=10
   ```

---

## If Still Getting 500 Errors

### Check Backend Logs for Specific Error

```bash
docker compose logs backend --tail 200 | grep -A 10 -i "error\|exception"
```

### Common Issues:

**Issue 1: `buyer_types` table doesn't exist**
```bash
# Solution: Create it manually (see Step 4 above)
```

**Issue 2: Foreign key constraint error**
```bash
# Check if buyers have invalid buyer_type_id references
docker compose exec db-clients psql -U postgres -d rmg_erp_clients -c "
SELECT id, buyer_name, buyer_type_id 
FROM buyers 
WHERE buyer_type_id IS NOT NULL 
AND buyer_type_id NOT IN (SELECT id FROM buyer_types);
"

# If any results, set them to NULL:
UPDATE buyers SET buyer_type_id = NULL WHERE buyer_type_id NOT IN (SELECT id FROM buyer_types);
```

**Issue 3: Database connection issue**
```bash
# Test connection
docker compose exec backend python -c "from core.database import SessionLocalClients; db = SessionLocalClients(); print('OK'); db.close()"
```

---

## Quick Diagnostic

Run this to check everything:

```bash
#!/bin/bash
echo "=== Checking Tables ==="
docker compose exec db-clients psql -U postgres -d rmg_erp_clients -c "\dt" | grep -E "buyers|suppliers|buyer_types|shipping_info|banking_info|contact_persons"

echo -e "\n=== Testing Endpoints ==="
echo "Buyers:"
curl -s https://erp.southerneleven.com/api/v1/buyers?limit=1 | head -c 200

echo -e "\n\nShipping:"
curl -s https://erp.southerneleven.com/api/v1/shipping?limit=1 | head -c 200

echo -e "\n\nBanking:"
curl -s https://erp.southerneleven.com/api/v1/banking?limit=1 | head -c 200

echo -e "\n\nContacts:"
curl -s https://erp.southerneleven.com/api/v1/contacts?limit=1 | head -c 200
```

---

## After Fix

Once fixed:
1. ✅ Buyer Info should load data
2. ✅ Shipping Info should load data
3. ✅ Banking Info should load data
4. ✅ Contact Info should load data
5. ✅ Supplier Info continues to work

---

**Need More Help?** Check detailed logs:
```bash
docker compose logs backend --tail 200
```
