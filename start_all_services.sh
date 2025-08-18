#!/bin/bash

# VERSSAI Service Diagnostics and Startup
# Comprehensive script to get all services running properly

set -e

echo "🔍 VERSSAI Service Diagnostics & Startup"
echo "========================================"
echo "⏰ Started: $(date)"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Check current service status
print_status "1. Checking current service status..."

echo "Docker containers:"
if docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(verssai|postgres|chroma|n8n|redis)" 2>/dev/null; then
    echo "Found VERSSAI containers"
else
    print_warning "No VERSSAI containers found"
fi

echo ""
echo "Port usage:"
for port in 3000 8080 8000 5678 5432 6379; do
    if lsof -i :$port >/dev/null 2>&1; then
        process=$(lsof -i :$port | tail -n 1 | awk '{print $1}')
        echo "  Port $port: ✅ In use by $process"
    else
        echo "  Port $port: ❌ Available"
    fi
done

# Step 2: Stop all services cleanly
print_status "2. Stopping all services for clean restart..."

docker-compose down 2>/dev/null || echo "Docker-compose not running"

# Kill any remaining processes on our ports
for port in 8080 3000; do
    if lsof -i :$port >/dev/null 2>&1; then
        print_warning "Killing process on port $port"
        kill $(lsof -t -i:$port) 2>/dev/null || true
    fi
done

# Step 3: Check backend code exists
print_status "3. Checking backend code availability..."

backend_files=(
    "backend/enhanced_api_server.py"
    "backend/server.py" 
    "backend/mcp_n8n_service.py"
    "backend/langraph_orchestrator.py"
)

backend_available=false
for file in "${backend_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✅ Found $file"
        backend_available=true
    else
        print_warning "⚠️  Missing $file"
    fi
done

# Step 4: Start backend service directly if available
if [ "$backend_available" = true ]; then
    print_status "4. Starting backend service..."
    
    # Check if we have enhanced API server
    if [ -f "backend/enhanced_api_server.py" ]; then
        print_status "Starting enhanced API server on port 8080..."
        
        cd backend
        
        # Install requirements if needed
        if [ -f "requirements.txt" ]; then
            print_status "Installing backend dependencies..."
            pip3 install -r requirements.txt --quiet 2>/dev/null || print_warning "Some dependencies may have failed"
        fi
        
        # Start the backend server in background
        print_status "Launching backend server..."
        python3 enhanced_api_server.py &
        BACKEND_PID=$!
        
        cd ..
        
        # Wait a moment for startup
        sleep 5
        
        # Test if backend is responding
        if curl -s http://localhost:8080/health >/dev/null 2>&1; then
            print_success "✅ Backend API running on port 8080"
            echo $BACKEND_PID > backend_pid.txt
        else
            print_error "❌ Backend failed to start"
        fi
        
    elif [ -f "backend/server.py" ]; then
        print_status "Starting standard API server..."
        
        cd backend
        python3 server.py &
        BACKEND_PID=$!
        cd ..
        
        sleep 5
        echo $BACKEND_PID > backend_pid.txt
        
    else
        print_error "No backend server file found"
    fi
else
    print_warning "Backend code not available - will start with docker-compose only"
fi

# Step 5: Start docker services
print_status "5. Starting Docker services..."

# Start core services
docker-compose up -d postgres chromadb redis

print_status "Waiting for database services to initialize..."
sleep 10

# Start N8N
docker-compose up -d n8n

print_status "Waiting for N8N to initialize..."
sleep 15

# Step 6: Verify service status
print_status "6. Verifying all services..."

echo ""
echo "Service Status Check:"

# Backend API
if curl -s http://localhost:8080/health >/dev/null 2>&1; then
    print_success "✅ Backend API: Running on port 8080"
else
    print_error "❌ Backend API: Not responding on port 8080"
fi

# ChromaDB
if curl -s http://localhost:8000/api/v1/heartbeat >/dev/null 2>&1; then
    print_success "✅ ChromaDB: Running on port 8000"
else
    print_error "❌ ChromaDB: Not responding on port 8000"
fi

# N8N
if curl -s http://localhost:5678/healthz >/dev/null 2>&1; then
    print_success "✅ N8N: Running on port 5678"
else
    print_error "❌ N8N: Not responding on port 5678"
fi

# N8N Authentication test
if curl -s -u "verssai_admin:verssai_n8n_2024" http://localhost:5678/rest/workflows >/dev/null 2>&1; then
    print_success "✅ N8N Authentication: Working"
else
    print_warning "⚠️  N8N Authentication: May need more time to start"
fi

# PostgreSQL
if docker exec verssai_postgres pg_isready -U verssai_user >/dev/null 2>&1; then
    print_success "✅ PostgreSQL: Running"
else
    print_error "❌ PostgreSQL: Not ready"
fi

# Step 7: Create quick service manager
print_status "7. Creating service management scripts..."

cat > start_backend_only.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting VERSSAI Backend Only..."

cd backend
if [ -f "enhanced_api_server.py" ]; then
    echo "Starting enhanced API server..."
    python3 enhanced_api_server.py
elif [ -f "server.py" ]; then
    echo "Starting standard API server..."
    python3 server.py
else
    echo "❌ No backend server found"
    exit 1
fi
EOF

chmod +x start_backend_only.sh

cat > stop_all_services.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping all VERSSAI services..."

# Stop docker services
docker-compose down

# Stop backend if running
if [ -f "backend_pid.txt" ]; then
    PID=$(cat backend_pid.txt)
    kill $PID 2>/dev/null || true
    rm backend_pid.txt
fi

# Kill any remaining processes
for port in 8080 3000 5678; do
    if lsof -i :$port >/dev/null 2>&1; then
        echo "Killing process on port $port"
        kill $(lsof -t -i:$port) 2>/dev/null || true
    fi
done

echo "✅ All services stopped"
EOF

chmod +x stop_all_services.sh

# Step 8: Final status and instructions
echo ""
print_success "🎉 Service Startup Complete!"
echo "================================"
echo ""
echo "📊 Expected Service URLs:"
echo "   🔧 Backend API: http://localhost:8080"
echo "   🎨 Frontend: http://localhost:3000 (if running)"
echo "   ⚡ N8N Dashboard: http://localhost:5678"
echo "   📚 ChromaDB: http://localhost:8000"
echo ""
echo "🔐 N8N Credentials:"
echo "   Username: verssai_admin"
echo "   Password: verssai_n8n_2024"
echo ""
echo "🛠️  Service Management:"
echo "   Start backend only: ./start_backend_only.sh"
echo "   Stop all services: ./stop_all_services.sh"
echo "   Restart everything: docker-compose restart"
echo ""
echo "🧪 Next Steps:"
echo "   1. Wait 30 seconds for all services to fully start"
echo "   2. Test connectivity: python3 test_port_connectivity.py"
echo "   3. Test integration: python3 test_mcp_n8n_integration.py"
echo ""
echo "⏰ Startup completed: $(date)"
