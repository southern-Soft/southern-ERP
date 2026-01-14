#!/bin/bash
# Quick diagnostic script to check backend errors for buyers endpoint

echo "=========================================="
echo "Backend Error Diagnostic for Buyers API"
echo "=========================================="
echo ""

echo "1. Checking if backend container is running..."
docker compose ps | grep backend
echo ""

echo "2. Testing buyers endpoint directly from backend..."
docker compose exec backend curl -s http://localhost:8000/api/v1/buyers?limit=1
echo ""
echo ""

echo "3. Checking backend logs for recent errors..."
docker compose logs backend --tail 50 | grep -i "error\|exception\|traceback" -A 5 | tail -30
echo ""

echo "4. Checking if buyers table exists..."
docker compose exec db-clients psql -U postgres -d rmg_erp_clients -c "\d buyers" 2>&1 | head -20
echo ""

echo "5. Checking if buyer_types table exists..."
docker compose exec db-clients psql -U postgres -d rmg_erp_clients -c "\d buyer_types" 2>&1 | head -20
echo ""

echo "6. Testing database connection from backend..."
docker compose exec backend python -c "
from core.database import SessionLocalClients
from modules.clients.models.client import Buyer
db = SessionLocalClients()
try:
    count = db.query(Buyer).count()
    print(f'✅ Database connection OK. Found {count} buyers in database.')
except Exception as e:
    print(f'❌ Database error: {e}')
finally:
    db.close()
"
echo ""

echo "7. Checking backend code version..."
docker compose exec backend python -c "
import sys
sys.path.insert(0, '/app')
try:
    from modules.clients.routes.buyers import get_buyers
    print('✅ Buyers route module loaded successfully')
    import inspect
    source = inspect.getsource(get_buyers)
    if 'joinedload' in source and 'try:' in source:
        print('✅ Error handling code is present')
    else:
        print('⚠️  Error handling may be missing')
except Exception as e:
    print(f'❌ Error loading module: {e}')
"
echo ""

echo "=========================================="
echo "Diagnostic complete. Check output above."
echo "=========================================="
