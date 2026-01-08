#!/bin/bash
# Southern Apparels ERP - Docker Debug Script
# Run this on your server to diagnose deployment issues
# Usage: chmod +x debug-docker.sh && ./debug-docker.sh

echo "========================================"
echo "Southern Apparels ERP - Docker Debug"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "1. CHECKING DOCKER STATUS"
echo "----------------------------------------"
docker --version
docker-compose --version
echo ""

echo "2. CHECKING RUNNING CONTAINERS"
echo "----------------------------------------"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "3. CHECKING CONTAINER HEALTH"
echo "----------------------------------------"
for container in erp_db_clients erp_db_samples erp_db_users erp_db_orders erp_db_merchandiser erp_db_settings erp_redis erp_backend erp_frontend; do
    status=$(docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null || echo "not found")
    if [ "$status" = "healthy" ]; then
        echo -e "${GREEN}[HEALTHY]${NC} $container"
    elif [ "$status" = "not found" ]; then
        echo -e "${RED}[NOT FOUND]${NC} $container"
    else
        echo -e "${YELLOW}[$status]${NC} $container"
    fi
done
echo ""

echo "4. CHECKING DOCKER NETWORK"
echo "----------------------------------------"
docker network ls | grep erp
echo ""
echo "Containers on erp network:"
docker network inspect erp --format='{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null || echo "Network 'erp' not found"
echo ""

echo "5. BACKEND LOGS (last 50 lines)"
echo "----------------------------------------"
docker logs erp_backend --tail 50 2>&1 || echo "Could not get backend logs"
echo ""

echo "6. FRONTEND LOGS (last 50 lines)"
echo "----------------------------------------"
docker logs erp_frontend --tail 50 2>&1 || echo "Could not get frontend logs"
echo ""

echo "7. TESTING BACKEND HEALTH ENDPOINT"
echo "----------------------------------------"
echo "From host:"
curl -s http://localhost:8000/api/v1/health | head -c 500 || echo "Could not reach backend from host"
echo ""
echo ""
echo "From inside frontend container:"
docker exec erp_frontend wget -qO- http://backend:8000/api/v1/health 2>&1 | head -c 500 || echo "Could not reach backend from frontend container"
echo ""

echo "8. TESTING FRONTEND"
echo "----------------------------------------"
echo "From host:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000 || echo "Could not reach frontend from host"
echo ""

echo "9. CHECKING DATABASE CONNECTIONS"
echo "----------------------------------------"
for db in erp_db_clients erp_db_samples erp_db_users erp_db_orders erp_db_merchandiser erp_db_settings; do
    result=$(docker exec $db psql -U postgres -c "SELECT 1" 2>&1)
    if echo "$result" | grep -q "1 row"; then
        echo -e "${GREEN}[OK]${NC} $db - PostgreSQL responding"
    else
        echo -e "${RED}[FAIL]${NC} $db - $result"
    fi
done
echo ""

echo "10. DISK SPACE"
echo "----------------------------------------"
df -h | head -5
echo ""

echo "11. MEMORY USAGE"
echo "----------------------------------------"
free -h 2>/dev/null || cat /proc/meminfo | head -3
echo ""

echo "12. DOCKER RESOURCE USAGE"
echo "----------------------------------------"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || echo "Could not get docker stats"
echo ""

echo "========================================"
echo "DEBUG COMPLETE"
echo "========================================"
echo ""
echo "If you see issues above, check:"
echo "1. RED [NOT FOUND] - Container didn't start, check: docker-compose logs"
echo "2. YELLOW [unhealthy] - Container started but health check failing"
echo "3. Backend can't reach databases - Check POSTGRES_HOST_* env vars"
echo "4. Frontend can't reach backend - Check network connectivity"
echo ""
echo "To see full logs:"
echo "  docker logs erp_backend"
echo "  docker logs erp_frontend"
echo ""
echo "To restart everything:"
echo "  docker-compose down && docker-compose up -d --build"
