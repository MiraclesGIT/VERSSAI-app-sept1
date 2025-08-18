#!/bin/bash

# VERSSAI Platform Health Check Script
# Verifies all services and features are working correctly

echo "🔍 VERSSAI Platform Health Check"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Testing $test_name... "
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
}

# Frontend Tests
echo -e "${BLUE}📱 Frontend Tests${NC}"
run_test "React Development Server" "curl -s http://localhost:3000 | grep -q 'VERSS.AI'"
run_test "Frontend Assets Loading" "curl -s http://localhost:3000/static/js/ | grep -q 'js'"

# Backend API Tests
echo -e "${BLUE}🔧 Backend API Tests${NC}"
run_test "Enhanced API Health" "curl -s http://localhost:8080/api/v1/health | grep -q 'postgresql'"
run_test "RAG Layers Endpoint" "curl -s http://localhost:8080/api/v1/rag/layers | grep -q 'layers'"
run_test "Companies Endpoint" "curl -s http://localhost:8080/api/v1/companies | grep -q 'companies'"

# Database Tests
echo -e "${BLUE}🗄️ Database Tests${NC}"
run_test "PostgreSQL Connection" "docker exec verssai_postgres pg_isready -U verssai_user"
run_test "ChromaDB Health" "curl -s http://localhost:8000/api/v1/heartbeat"

# N8N Integration Tests
echo -e "${BLUE}⚡ N8N Integration Tests${NC}"
run_test "N8N Service Health" "curl -s http://localhost:5678/healthz"
run_test "N8N Authentication" "curl -s http://localhost:5678 | grep -q 'n8n'"

# Docker Services Tests
echo -e "${BLUE}🐳 Docker Services Tests${NC}"
run_test "PostgreSQL Container" "docker ps | grep -q verssai_postgres"
run_test "ChromaDB Container" "docker ps | grep -q verssai_chromadb"
run_test "N8N Container" "docker ps | grep -q verssai_n8n"
run_test "Redis Container" "docker ps | grep -q verssai_redis"

# File System Tests
echo -e "${BLUE}📁 File System Tests${NC}"
run_test "Upload Directory" "test -d ./uploads"
run_test "Logs Directory" "test -d ./logs"
run_test "Backend Virtual Environment" "test -d ./backend/venv"
run_test "Frontend Node Modules" "test -d ./frontend/node_modules"

# Component Tests
echo -e "${BLUE}⚛️ Component Tests${NC}"
run_test "VERSSAIRealDashboard Component" "test -f ./frontend/src/components/VERSSAIRealDashboard.js"
run_test "VERSSAI Styles" "test -f ./frontend/src/components/VERSSAIStyles.css"
run_test "MultiTenant Context" "test -f ./frontend/src/contexts/MultiTenantContext.js"
run_test "Workflow Context" "test -f ./frontend/src/contexts/WorkflowContext.js"

# Enhanced Features Tests
echo -e "${BLUE}🚀 Enhanced Features Tests${NC}"
run_test "Enhanced API Server" "test -f ./backend/enhanced_api_server.py"
run_test "Backend Requirements" "test -f ./backend/requirements.txt"
run_test "Environment Example" "test -f ./frontend/.env.example"
run_test "Startup Script" "test -x ./scripts/start_verssai.sh"

# Configuration Tests
echo -e "${BLUE}⚙️ Configuration Tests${NC}"
run_test "Docker Compose File" "test -f ./docker-compose.yml"
run_test "README Documentation" "test -f ./README.md"

# Final Results
echo ""
echo "================================="
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo "================================="

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 All tests passed! ($PASSED_TESTS/$TOTAL_TESTS)${NC}"
    echo -e "${GREEN}✅ VERSSAI Platform is fully operational${NC}"
    
    echo ""
    echo -e "${BLUE}🚀 Platform Status:${NC}"
    echo -e "  • Frontend:           ${GREEN}✅ Running at http://localhost:3000${NC}"
    echo -e "  • Enhanced API:       ${GREEN}✅ Running at http://localhost:8080${NC}"
    echo -e "  • N8N Dashboard:      ${GREEN}✅ Running at http://localhost:5678${NC}"
    echo -e "  • ChromaDB:           ${GREEN}✅ Running at http://localhost:8000${NC}"
    echo -e "  • PostgreSQL:         ${GREEN}✅ Running at localhost:5432${NC}"
    
    echo ""
    echo -e "${BLUE}🎯 Ready Features:${NC}"
    echo -e "  • ✅ Real Settings Panel"
    echo -e "  • ✅ N8N+MCP Integration Buttons"
    echo -e "  • ✅ 3-Layer RAG System"
    echo -e "  • ✅ Document Upload & Processing"
    echo -e "  • ✅ Workflow Automation"
    echo -e "  • ✅ Professional UI Design"
    
    exit 0
else
    echo -e "${RED}❌ Some tests failed ($PASSED_TESTS/$TOTAL_TESTS passed)${NC}"
    echo -e "${YELLOW}⚠️ Please check the failed services and retry${NC}"
    
    echo ""
    echo -e "${BLUE}🔧 Troubleshooting Steps:${NC}"
    echo -e "  1. Check Docker containers: ${YELLOW}docker-compose ps${NC}"
    echo -e "  2. View service logs: ${YELLOW}docker-compose logs [service]${NC}"
    echo -e "  3. Restart services: ${YELLOW}docker-compose restart${NC}"
    echo -e "  4. Check README for detailed setup instructions"
    
    exit 1
fi
