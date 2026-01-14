#!/bin/bash
# Test buyers endpoint and capture the actual error

echo "=========================================="
echo "Testing Buyers Endpoint"
echo "=========================================="
echo ""

echo "1. Testing buyers endpoint (this should show the error)..."
echo ""
docker compose exec backend curl -v http://localhost:8000/api/v1/buyers?limit=1 2>&1
echo ""
echo ""

echo "2. Checking backend logs immediately after request..."
echo ""
docker compose logs backend --tail 20 | grep -i "buyers\|error\|exception" -A 5
echo ""

echo "3. Checking if buyers table exists..."
docker compose exec db-clients psql -U postgres -d rmg_erp_clients -c "\d buyers" 2>&1
echo ""

echo "4. Checking if buyer_types table exists..."
docker compose exec db-clients psql -U postgres -d rmg_erp_clients -c "\d buyer_types" 2>&1
echo ""

echo "5. Testing database query directly..."
docker compose exec backend python -c "
from core.database import SessionLocalClients
from modules.clients.models.client import Buyer
db = SessionLocalClients()
try:
    buyers = db.query(Buyer).limit(1).all()
    print(f'✅ Query successful. Found {len(buyers)} buyers.')
    if buyers:
        print(f'   First buyer: {buyers[0].buyer_name}')
except Exception as e:
    print(f'❌ Query failed: {e}')
    import traceback
    traceback.print_exc()
finally:
    db.close()
"
echo ""

echo "=========================================="
echo "Test complete. Check output above."
echo "=========================================="
