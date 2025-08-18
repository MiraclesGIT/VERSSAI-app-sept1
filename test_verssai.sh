#!/bin/bash

# Enhanced VERSSAI System Test Script
# Tests all major components and integrations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

# Helper functions
log_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    FAILED_TESTS+=("$1")
}

log_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Test individual service
test_service() {
    local service_name=$1
    local test_url=$2
    local expected_status=${3:-200}
    
    log_test "Testing $service_name at $test_url"
    
    if curl -f -s -o /dev/null -w "%{http_code}" "$test_url" | grep -q "$expected_status"; then
        log_pass "$service_name is responding correctly"
        return 0
    else
        log_fail "$service_name is not responding or returning wrong status"
        return 1
    fi
}

# Test WebSocket connection
test_websocket() {
    local ws_url=$1
    local service_name=$2
    
    log_test "Testing WebSocket connection to $service_name"
    
    # Use websocat if available, otherwise skip
    if command -v websocat &> /dev/null; then
        if timeout 5 websocat --ping-interval 1 --ping-timeout 3 "$ws_url" < /dev/null &> /dev/null; then
            log_pass "$service_name WebSocket is accepting connections"
            return 0
        else
            log_fail "$service_name WebSocket is not accepting connections"
            return 1
        fi
    else
        log_info "websocat not available, skipping WebSocket test for $service_name"
        return 0
    fi
}

# Test API endpoint with JSON response
test_api_endpoint() {
    local endpoint=$1
    local description=$2
    local method=${3:-GET}
    local data=${4:-}
    
    log_test "Testing API: $description"
    
    local curl_cmd="curl -s -X $method"
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    curl_cmd="$curl_cmd $endpoint"
    
    if response=$(eval $curl_cmd 2>/dev/null) && echo "$response" | jq . &> /dev/null; then
        log_pass "$description - valid JSON response received"
        return 0
    else
        log_fail "$description - no response or invalid JSON"
        return 1
    fi
}

# Display banner
clear
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                 ENHANCED VERSSAI SYSTEM TEST                ║${NC}"
echo -e "${PURPLE}║                     Comprehensive Testing                   ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo

log_info "Starting comprehensive system tests..."
echo

# Phase 1: Docker Services Tests
echo -e "${PURPLE}=== PHASE 1: Docker Services Health ===\n${NC}"

log_test "Checking Docker services status"
if docker-compose ps | grep -q "Up"; then
    log_pass "Docker Compose services are running"
else
    log_fail "Some Docker Compose services are not running"
fi

# PostgreSQL
test_service "PostgreSQL" "http://localhost:5432" "000"  # Connection refused is expected for HTTP
if docker-compose exec -T postgres pg_isready -U verssai_user &> /dev/null; then
    log_pass "PostgreSQL is accepting connections"
else
    log_fail "PostgreSQL is not accepting connections"
fi

# ChromaDB
test_service "ChromaDB" "http://localhost:8000/api/v1/heartbeat"

# Redis
if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
    log_pass "Redis is responding to ping"
else
    log_fail "Redis is not responding to ping"
fi

# Neo4j
test_service "Neo4j Browser" "http://localhost:7474"

# N8N
test_service "N8N" "http://localhost:5678/healthz"

echo

# Phase 2: Backend API Tests
echo -e "${PURPLE}=== PHASE 2: Backend API Testing ===\n${NC}"

# Health check
test_api_endpoint "http://localhost:8080/health" "Backend health check"

# Legacy health check
test_api_endpoint "http://localhost:8080/api/legacy/health" "Legacy health check"

# RAG endpoints
test_api_endpoint "http://localhost:8080/api/v1/rag/stats" "RAG global statistics"

# Test RAG query (if API is running)
rag_query_data='{
  "query": "What are the key factors in venture capital success?",
  "layer": "vc",
  "max_results": 3
}'
test_api_endpoint "http://localhost:8080/api/v1/rag/query" "RAG query endpoint" "POST" "$rag_query_data"

echo

# Phase 3: WebSocket Tests
echo -e "${PURPLE}=== PHASE 3: WebSocket Connections ===\n${NC}"

test_websocket "ws://localhost:8080/ws/mcp" "MCP WebSocket"
test_websocket "ws://localhost:8080/ws/rag" "RAG WebSocket"

echo

# Phase 4: Frontend Tests
echo -e "${PURPLE}=== PHASE 4: Frontend Application ===\n${NC}"

# Check if frontend is running
if curl -f -s http://localhost:3000 > /dev/null; then
    log_pass "Frontend is accessible at http://localhost:3000"
else
    log_fail "Frontend is not accessible at http://localhost:3000"
fi

# Test specific frontend routes
frontend_routes=(
    "/"
    "/enhanced"
    "/legacy"
)

for route in "${frontend_routes[@]}"; do
    if curl -f -s "http://localhost:3000$route" > /dev/null; then
        log_pass "Frontend route '$route' is accessible"
    else
        log_fail "Frontend route '$route' is not accessible"
    fi
done

echo

# Phase 5: N8N Workflow Tests
echo -e "${PURPLE}=== PHASE 5: N8N Workflow Testing ===\n${NC}"

# Test N8N API access
if curl -u "verssai_admin:verssai_n8n_2024" -f -s "http://localhost:5678/api/v1/workflows" > /dev/null; then
    log_pass "N8N API is accessible with credentials"
else
    log_fail "N8N API is not accessible or credentials are wrong"
fi

# Test webhook endpoints (these might not exist yet, so we'll just check if N8N responds)
webhook_endpoints=(
    "founder-signal-assessment"
    "due-diligence-automation"
    "portfolio-analysis"
    "competitive-intelligence"
    "fund-allocation-optimization"
    "lp-communication-automation"
)

for endpoint in "${webhook_endpoints[@]}"; do
    # We expect these to return 404 or 405 if no workflow is configured, but not connection errors
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5678/webhook/$endpoint" 2>/dev/null || echo "000")
    if [[ "$status_code" =~ ^[45][0-9][0-9]$ ]]; then
        log_pass "N8N webhook endpoint '$endpoint' is reachable (returned $status_code)"
    elif [ "$status_code" = "200" ]; then
        log_pass "N8N webhook endpoint '$endpoint' is configured and active"
    else
        log_fail "N8N webhook endpoint '$endpoint' is not reachable (returned $status_code)"
    fi
done

echo

# Phase 6: Integration Tests
echo -e "${PURPLE}=== PHASE 6: Integration Testing ===\n${NC}"

# Test workflow trigger (this will likely fail if no workflows are configured, but tests the endpoint)
workflow_data='{
  "workflow_type": "founder_signal",
  "parameters": {"test": true},
  "rag_layer": "startup"
}'

log_test "Testing workflow trigger endpoint"
response=$(curl -s -X POST -H "Content-Type: application/json" -d "$workflow_data" "http://localhost:8080/api/v1/workflows/trigger" 2>/dev/null || echo "")
if echo "$response" | jq . &> /dev/null; then
    log_pass "Workflow trigger endpoint accepts requests and returns JSON"
else
    log_fail "Workflow trigger endpoint is not working properly"
fi

# Test session creation
session_data='{
  "user_id": "test_user",
  "organization_id": "test_org",
  "role": "VC_Partner"
}'

test_api_endpoint "http://localhost:8080/api/v1/sessions" "Session creation" "POST" "$session_data"

echo

# Phase 7: Data Persistence Tests
echo -e "${PURPLE}=== PHASE 7: Data Persistence ===\n${NC}"

# Test PostgreSQL data persistence
log_test "Testing PostgreSQL data persistence"
if docker-compose exec -T postgres psql -U verssai_user -d verssai_vc -c "SELECT 1;" &> /dev/null; then
    log_pass "PostgreSQL database is accessible and can execute queries"
else
    log_fail "PostgreSQL database is not accessible or cannot execute queries"
fi

# Test ChromaDB collections
log_test "Testing ChromaDB collections"
if curl -s "http://localhost:8000/api/v1/collections" | jq . &> /dev/null; then
    log_pass "ChromaDB collections endpoint is working"
else
    log_fail "ChromaDB collections endpoint is not working"
fi

echo

# Final Results
echo -e "${PURPLE}=== TEST RESULTS SUMMARY ===\n${NC}"

echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "\n${RED}Failed Tests:${NC}"
    for test in "${FAILED_TESTS[@]}"; do
        echo -e "  ${RED}✗${NC} $test"
    done
    echo
    echo -e "${YELLOW}Recommendations:${NC}"
    echo "1. Check that all Docker services are running: docker-compose ps"
    echo "2. Review service logs: docker-compose logs [service_name]"
    echo "3. Verify environment configuration files (.env)"
    echo "4. Ensure all required API keys are configured"
    echo "5. Check system resources (CPU, memory, disk space)"
else
    echo -e "\n${GREEN}🎉 All tests passed! Enhanced VERSSAI is working correctly.${NC}"
fi

total_tests=$((TESTS_PASSED + TESTS_FAILED))
success_rate=$((TESTS_PASSED * 100 / total_tests))

echo -e "\nSuccess Rate: ${success_rate}% ($TESTS_PASSED/$total_tests)"

if [ $TESTS_FAILED -gt 0 ]; then
    exit 1
else
    exit 0
fi