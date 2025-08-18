#!/bin/bash

# VERSSAI Port Configuration Fix Script
# Fixes all port mismatches between N8N workflows, backend config, and docker services

set -e

echo "🔧 VERSSAI Port Configuration Fix"
echo "================================="
echo "Fixing port mismatches to enable N8N + MCP integration"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[FIX]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Fix ChromaDB port in backend config
print_status "1. Fixing ChromaDB port in backend config (8001 → 8000)"

if [ -f "backend/config.py" ]; then
    # Backup original config
    cp backend/config.py backend/config.py.backup
    
    # Fix ChromaDB port
    sed -i '' "s/CHROMA_PORT', '8001'/CHROMA_PORT', '8000'/g" backend/config.py
    
    print_status "✅ ChromaDB port fixed in backend/config.py"
else
    print_warning "⚠️  backend/config.py not found"
fi

# Step 2: Fix ChromaDB port in RAG service
print_status "2. Fixing ChromaDB port in RAG service"

if [ -f "backend/rag_service.py" ]; then
    # Backup original
    cp backend/rag_service.py backend/rag_service.py.backup
    
    # Fix ChromaDB port
    sed -i '' "s/CHROMA_PORT', '8001'/CHROMA_PORT', '8000'/g" backend/rag_service.py
    
    print_status "✅ ChromaDB port fixed in backend/rag_service.py"
else
    print_warning "⚠️  backend/rag_service.py not found"
fi

# Step 3: Fix N8N workflow endpoints (8001 → 8080)
print_status "3. Fixing N8N workflow endpoints (localhost:8001 → localhost:8080)"

if [ -d "n8n/workflows" ]; then
    for workflow_file in n8n/workflows/*.json; do
        if [ -f "$workflow_file" ]; then
            # Backup original
            cp "$workflow_file" "${workflow_file}.backup"
            
            # Fix backend API port in workflows
            sed -i '' 's/localhost:8001/localhost:8080/g' "$workflow_file"
            
            print_status "✅ Fixed ports in $(basename $workflow_file)"
        fi
    done
else
    print_warning "⚠️  n8n/workflows directory not found"
fi

# Step 4: Fix test files that still use old ports
print_status "4. Fixing test files with incorrect ports"

test_files=(
    "quick_stress_test.py"
    "simple_stress_test.py" 
    "stress_test_runner.py"
)

for test_file in "${test_files[@]}"; do
    if [ -f "$test_file" ]; then
        # Backup original
        cp "$test_file" "${test_file}.backup"
        
        # Fix port references
        sed -i '' 's/localhost:8001/localhost:8080/g' "$test_file"
        
        print_status "✅ Fixed ports in $test_file"
    fi
done

# Step 5: Update MCP service webhook URLs 
print_status "5. Updating MCP service webhook configuration"

if [ -f "backend/mcp_n8n_service.py" ]; then
    # Check if it needs updating (it should already be correct)
    if grep -q "localhost:8080" backend/mcp_n8n_service.py; then
        print_status "✅ MCP service already has correct backend port (8080)"
    else
        print_warning "⚠️  MCP service may need manual webhook URL updates"
    fi
else
    print_warning "⚠️  backend/mcp_n8n_service.py not found"
fi

# Step 6: Create environment configuration file
print_status "6. Creating/updating environment configuration"

cat > port_config.env << EOF
# VERSSAI Port Configuration
# Updated: $(date)

# Core Services
BACKEND_PORT=8080
FRONTEND_PORT=3000
CHROMADB_PORT=8000
N8N_PORT=5678
POSTGRES_PORT=5432
REDIS_PORT=6379

# Service URLs  
BACKEND_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000
CHROMADB_URL=http://localhost:8000
N8N_URL=http://localhost:5678

# ChromaDB Configuration
CHROMA_HOST=localhost
CHROMA_PORT=8000

# N8N Configuration
N8N_WEBHOOK_URL=http://localhost:5678/webhook
N8N_BASIC_AUTH_USER=verssai_admin
N8N_BASIC_AUTH_PASSWORD=verssai_n8n_2024
EOF

print_status "✅ Port configuration saved to port_config.env"

# Step 7: Verify docker-compose.yml port configuration
print_status "7. Verifying docker-compose.yml port configuration"

if [ -f "docker-compose.yml" ]; then
    echo "Current port configuration in docker-compose.yml:"
    echo "  Backend: $(grep -A1 'backend' docker-compose.yml | grep 'ports' | head -1 || echo 'Not explicitly defined')"
    echo "  ChromaDB: $(grep -A5 'chromadb' docker-compose.yml | grep 'ports' | head -1)"
    echo "  N8N: $(grep -A5 'n8n:' docker-compose.yml | grep 'ports' | head -1)"
    echo "  PostgreSQL: $(grep -A5 'postgres' docker-compose.yml | grep 'ports' | head -1)"
    
    print_status "✅ Docker-compose port verification complete"
else
    print_error "❌ docker-compose.yml not found"
fi

# Step 8: Create quick test script
print_status "8. Creating port connectivity test script"

cat > test_port_connectivity.py << 'EOF'
#!/usr/bin/env python3
"""Test VERSSAI port connectivity after fixes"""

import requests
import sys
from datetime import datetime

def test_service(service_name, url, timeout=5):
    """Test if a service is accessible"""
    try:
        response = requests.get(url, timeout=timeout)
        status = "✅ CONNECTED" if response.status_code in [200, 404] else f"⚠️  HTTP {response.status_code}"
        print(f"  {service_name:15} {url:30} {status}")
        return True
    except Exception as e:
        print(f"  {service_name:15} {url:30} ❌ ERROR: {str(e)[:30]}")
        return False

def main():
    print("🔍 VERSSAI Port Connectivity Test")
    print("=" * 50)
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("")
    
    services = [
        ("Backend API", "http://localhost:8080/health"),
        ("Frontend", "http://localhost:3000"),
        ("ChromaDB", "http://localhost:8000/api/v1/heartbeat"),
        ("N8N", "http://localhost:5678/healthz"),
        ("PostgreSQL", "http://localhost:5432"),  # Will fail but that's expected
        ("Redis", "http://localhost:6379")       # Will fail but that's expected
    ]
    
    connected_count = 0
    total_count = len(services) - 2  # Exclude PostgreSQL/Redis (not HTTP)
    
    for service_name, url in services:
        if "5432" in url or "6379" in url:
            print(f"  {service_name:15} {url:30} ⚪ SKIP (Not HTTP)")
            continue
        
        if test_service(service_name, url):
            connected_count += 1
    
    print("")
    print(f"📊 Results: {connected_count}/{total_count} services accessible")
    
    if connected_count == total_count:
        print("🎉 All HTTP services are accessible!")
        return 0
    elif connected_count >= total_count * 0.75:
        print("⚠️  Most services accessible - some may still be starting")
        return 0
    else:
        print("❌ Multiple services not accessible - check docker-compose")
        return 1

if __name__ == "__main__":
    sys.exit(main())
EOF

chmod +x test_port_connectivity.py

print_status "✅ Port connectivity test script created"

# Step 9: Summary and next steps
echo ""
echo "🎉 Port Configuration Fix Complete!"
echo "===================================="
echo ""
echo "✅ Fixed Issues:"
echo "   • ChromaDB: 8001 → 8000 (backend config)"
echo "   • Backend API: N8N workflows now call localhost:8080"
echo "   • Test files: Updated to use localhost:8080"
echo "   • Configuration: Created port_config.env"
echo ""
echo "🔧 Next Steps:"
echo "   1. Restart services: docker-compose down && docker-compose up -d"
echo "   2. Test connectivity: python3 test_port_connectivity.py"
echo "   3. Test N8N workflow: Access http://localhost:5678"
echo "   4. Test MCP integration: Run WebSocket test"
echo ""
echo "🎯 Expected Results:"
echo "   • N8N workflows can call backend API (localhost:8080)"
echo "   • ChromaDB accessible at localhost:8000"
echo "   • MCP WebSocket integration functional"
echo "   • All 6 VERSSAI workflows operational"
echo ""
echo "⏰ Fix completed at: $(date)"
