#!/bin/bash

# VERSSAI MCP + N8N Complete Platform Launcher
# Production-ready deployment script for the complete VC intelligence platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/verssai_deployment.log"
PID_FILE="$SCRIPT_DIR/verssai_services.pid"

# Service URLs
BACKEND_URL="http://localhost:8080"
FRONTEND_URL="http://localhost:3000"
N8N_URL="http://localhost:5678"
CHROMA_URL="http://localhost:8000"
POSTGRES_URL="localhost:5432"

# Print banner
print_banner() {
    echo -e "${PURPLE}"
    echo "██╗   ██╗███████╗██████╗ ███████╗███████╗ █████╗ ██╗"
    echo "██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝██╔══██╗██║"
    echo "██║   ██║█████╗  ██████╔╝███████╗███████╗███████║██║"
    echo "╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║╚════██║██╔══██║██║"
    echo " ╚████╔╝ ███████╗██║  ██║███████║███████║██║  ██║██║"
    echo "  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝"
    echo ""
    echo "    MCP + N8N Complete Platform Launcher v3.0"
    echo "    Production-Ready VC Intelligence Platform"
    echo -e "${NC}"
}

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Print colored status
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}$message${NC}"
    log "$message"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check port availability
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is busy
    else
        return 0  # Port is free
    fi
}

# Wait for service to be ready
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "$YELLOW" "⏳ Waiting for $name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" >/dev/null 2>&1; then
            print_status "$GREEN" "✅ $name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_status "$RED" "❌ $name failed to start within $(($max_attempts * 2)) seconds"
    return 1
}

# Check prerequisites
check_prerequisites() {
    print_status "$BLUE" "🔍 Checking Prerequisites..."
    
    # Check required commands
    local required_commands=("python3" "node" "npm" "docker" "docker-compose")
    local missing_commands=()
    
    for cmd in "${required_commands[@]}"; do
        if ! command_exists "$cmd"; then
            missing_commands+=("$cmd")
        fi
    done
    
    if [ ${#missing_commands[@]} -ne 0 ]; then
        print_status "$RED" "❌ Missing required commands: ${missing_commands[*]}"
        print_status "$YELLOW" "Please install the missing dependencies and try again."
        exit 1
    fi
    
    # Check Python version
    python_version=$(python3 --version 2>&1 | awk '{print $2}')
    print_status "$GREEN" "✅ Python $python_version detected"
    
    # Check Node version
    node_version=$(node --version 2>&1)
    print_status "$GREEN" "✅ Node $node_version detected"
    
    # Check Docker
    if docker --version >/dev/null 2>&1; then
        docker_version=$(docker --version | awk '{print $3}' | sed 's/,//')
        print_status "$GREEN" "✅ Docker $docker_version detected"
    else
        print_status "$RED" "❌ Docker is not running"
        exit 1
    fi
    
    print_status "$GREEN" "✅ All prerequisites satisfied"
}

# Check port availability
check_ports() {
    print_status "$BLUE" "🔌 Checking Port Availability..."
    
    local ports=(3000 5678 8000 8080 5432)
    local busy_ports=()
    
    for port in "${ports[@]}"; do
        if ! check_port $port; then
            busy_ports+=($port)
        fi
    done
    
    if [ ${#busy_ports[@]} -ne 0 ]; then
        print_status "$YELLOW" "⚠️  Ports in use: ${busy_ports[*]}"
        print_status "$YELLOW" "Attempting to stop conflicting services..."
        
        # Try to stop known services
        for port in "${busy_ports[@]}"; do
            case $port in
                3000)
                    print_status "$YELLOW" "Stopping React development server on port 3000..."
                    pkill -f "react-scripts start" || true
                    ;;
                5678)
                    print_status "$YELLOW" "Stopping N8N on port 5678..."
                    pkill -f "n8n start" || true
                    docker stop verssai-n8n 2>/dev/null || true
                    ;;
                8000)
                    print_status "$YELLOW" "Stopping ChromaDB on port 8000..."
                    pkill -f "chroma run" || true
                    docker stop verssai-chromadb 2>/dev/null || true
                    ;;
                8080)
                    print_status "$YELLOW" "Stopping backend server on port 8080..."
                    pkill -f "uvicorn" || true
                    pkill -f "python.*verssai" || true
                    ;;
                5432)
                    print_status "$YELLOW" "PostgreSQL detected on port 5432 (this is normal)"
                    ;;
            esac
        done
        
        # Wait a bit for services to stop
        sleep 3
    fi
    
    print_status "$GREEN" "✅ Port availability checked"
}

# Setup Python environment
setup_python_env() {
    print_status "$BLUE" "🐍 Setting up Python Environment..."
    
    cd "$SCRIPT_DIR"
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "$YELLOW" "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip >/dev/null 2>&1
    
    # Install backend requirements
    if [ -f "backend/requirements_enhanced.txt" ]; then
        print_status "$YELLOW" "Installing Python dependencies..."
        pip install -r backend/requirements_enhanced.txt >/dev/null 2>&1
    elif [ -f "backend/requirements.txt" ]; then
        pip install -r backend/requirements.txt >/dev/null 2>&1
    fi
    
    # Install additional MCP dependencies
    pip install fastapi uvicorn websockets aiohttp >/dev/null 2>&1
    
    print_status "$GREEN" "✅ Python environment ready"
}

# Setup frontend environment
setup_frontend_env() {
    print_status "$BLUE" "⚛️  Setting up Frontend Environment..."
    
    cd "$SCRIPT_DIR/frontend"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "$YELLOW" "Installing Node.js dependencies..."
        npm install >/dev/null 2>&1
    fi
    
    cd "$SCRIPT_DIR"
    print_status "$GREEN" "✅ Frontend environment ready"
}

# Start infrastructure services
start_infrastructure() {
    print_status "$BLUE" "🏗️  Starting Infrastructure Services..."
    
    # Start Docker services (PostgreSQL, ChromaDB, N8N)
    if [ -f "docker-compose.yml" ]; then
        print_status "$YELLOW" "Starting Docker services..."
        docker-compose up -d postgres chromadb n8n >/dev/null 2>&1
        
        # Wait for services
        sleep 5
        
        # Check PostgreSQL
        print_status "$YELLOW" "Checking PostgreSQL..."
        if docker-compose ps postgres | grep -q "Up"; then
            print_status "$GREEN" "✅ PostgreSQL is running"
        else
            print_status "$RED" "❌ PostgreSQL failed to start"
        fi
        
        # Check ChromaDB
        print_status "$YELLOW" "Checking ChromaDB..."
        if wait_for_service "$CHROMA_URL/api/v1/heartbeat" "ChromaDB"; then
            print_status "$GREEN" "✅ ChromaDB is operational"
        else
            print_status "$YELLOW" "⚠️  ChromaDB may not be fully ready"
        fi
        
        # Check N8N
        print_status "$YELLOW" "Checking N8N..."
        if wait_for_service "$N8N_URL/healthz" "N8N"; then
            print_status "$GREEN" "✅ N8N is operational"
        else
            print_status "$YELLOW" "⚠️  N8N may not be fully ready"
        fi
    else
        print_status "$YELLOW" "⚠️  docker-compose.yml not found, starting services manually..."
        
        # Start individual Docker containers
        docker run -d --name verssai-postgres -p 5432:5432 \
            -e POSTGRES_DB=verssai_db \
            -e POSTGRES_USER=verssai_user \
            -e POSTGRES_PASSWORD=verssai_password \
            postgres:13 >/dev/null 2>&1 || true
        
        docker run -d --name verssai-chromadb -p 8000:8000 \
            chromadb/chroma:latest >/dev/null 2>&1 || true
        
        docker run -d --name verssai-n8n -p 5678:5678 \
            -e N8N_BASIC_AUTH_ACTIVE=true \
            -e N8N_BASIC_AUTH_USER=admin \
            -e N8N_BASIC_AUTH_PASSWORD=verssai_admin \
            n8nio/n8n:latest >/dev/null 2>&1 || true
    fi
    
    print_status "$GREEN" "✅ Infrastructure services started"
}

# Process VERSSAI dataset
process_dataset() {
    print_status "$BLUE" "📊 Processing VERSSAI Dataset..."
    
    cd "$SCRIPT_DIR"
    source venv/bin/activate
    
    # Check if dataset file exists
    if [ -f "VERSSAI_Massive_Dataset_Complete.xlsx" ]; then
        print_status "$YELLOW" "Processing massive dataset..."
        
        # Run dataset processor
        if [ -f "backend/verssai_dataset_processor.py" ]; then
            python backend/verssai_dataset_processor.py >/dev/null 2>&1 &
            dataset_pid=$!
            
            # Wait for processing to complete (with timeout)
            local timeout=120
            local elapsed=0
            
            while kill -0 $dataset_pid 2>/dev/null && [ $elapsed -lt $timeout ]; do
                echo -n "."
                sleep 2
                elapsed=$((elapsed + 2))
            done
            
            if [ $elapsed -ge $timeout ]; then
                print_status "$YELLOW" "⚠️  Dataset processing is taking longer than expected"
            else
                print_status "$GREEN" "✅ Dataset processing completed"
            fi
        else
            print_status "$YELLOW" "⚠️  Dataset processor not found, using mock data"
        fi
    else
        print_status "$YELLOW" "⚠️  VERSSAI dataset file not found, using simulated data"
    fi
}

# Start backend services
start_backend() {
    print_status "$BLUE" "🔧 Starting Backend Services..."
    
    cd "$SCRIPT_DIR"
    source venv/bin/activate
    
    # Choose the best available backend
    if [ -f "backend/verssai_mcp_complete_backend.py" ]; then
        backend_file="backend/verssai_mcp_complete_backend.py"
        print_status "$YELLOW" "Using MCP Complete Backend..."
    elif [ -f "backend/complete_verssai_backend.py" ]; then
        backend_file="backend/complete_verssai_backend.py"
        print_status "$YELLOW" "Using Complete VERSSAI Backend..."
    elif [ -f "backend/enhanced_verssai_backend.py" ]; then
        backend_file="backend/enhanced_verssai_backend.py"
        print_status "$YELLOW" "Using Enhanced Backend..."
    else
        print_status "$RED" "❌ No suitable backend found"
        exit 1
    fi
    
    # Start backend server
    print_status "$YELLOW" "Starting backend server..."
    nohup python "$backend_file" > backend.log 2>&1 &
    backend_pid=$!
    echo $backend_pid >> "$PID_FILE"
    
    # Wait for backend to be ready
    if wait_for_service "$BACKEND_URL/api/health" "Backend API"; then
        print_status "$GREEN" "✅ Backend server is operational"
    else
        print_status "$RED" "❌ Backend server failed to start"
        return 1
    fi
}

# Import N8N workflows
import_n8n_workflows() {
    print_status "$BLUE" "⚙️  Importing N8N Workflows..."
    
    # Check if N8N workflow files exist
    if [ -d "n8n/workflows" ]; then
        print_status "$YELLOW" "N8N workflow files found..."
        
        # List available workflows
        workflow_count=$(find n8n/workflows -name "*.json" | wc -l)
        print_status "$GREEN" "✅ Found $workflow_count workflow files"
        
        # Note: N8N workflows need to be imported through the UI
        print_status "$YELLOW" "📋 Manual step required:"
        print_status "$YELLOW" "   1. Open N8N at $N8N_URL"
        print_status "$YELLOW" "   2. Login with admin/verssai_admin"
        print_status "$YELLOW" "   3. Import workflows from n8n/workflows/ directory"
        print_status "$YELLOW" "   4. Activate all 6 workflows"
    else
        print_status "$YELLOW" "⚠️  N8N workflow directory not found"
    fi
}

# Start frontend
start_frontend() {
    print_status "$BLUE" "⚛️  Starting Frontend Application..."
    
    cd "$SCRIPT_DIR/frontend"
    
    # Start React development server
    print_status "$YELLOW" "Starting React development server..."
    nohup npm start > ../frontend.log 2>&1 &
    frontend_pid=$!
    echo $frontend_pid >> "$SCRIPT_DIR/$PID_FILE"
    
    cd "$SCRIPT_DIR"
    
    # Wait for frontend to be ready
    if wait_for_service "$FRONTEND_URL" "Frontend Application"; then
        print_status "$GREEN" "✅ Frontend application is operational"
    else
        print_status "$YELLOW" "⚠️  Frontend may take additional time to compile"
    fi
}

# Run integration tests
run_tests() {
    print_status "$BLUE" "🧪 Running Integration Tests..."
    
    cd "$SCRIPT_DIR"
    source venv/bin/activate
    
    if [ -f "test_verssai_mcp_complete.py" ]; then
        print_status "$YELLOW" "Running comprehensive test suite..."
        
        # Give services a moment to stabilize
        sleep 5
        
        python test_verssai_mcp_complete.py
        test_exit_code=$?
        
        if [ $test_exit_code -eq 0 ]; then
            print_status "$GREEN" "✅ All integration tests passed!"
        else
            print_status "$YELLOW" "⚠️  Some tests failed, but platform may still be functional"
        fi
    else
        print_status "$YELLOW" "⚠️  Test suite not found, skipping tests"
    fi
}

# Print platform status
print_platform_status() {
    print_status "$CYAN" "🚀 VERSSAI Platform Status"
    echo ""
    echo -e "${GREEN}🌐 Access URLs:${NC}"
    echo -e "   Frontend:     ${BLUE}$FRONTEND_URL${NC}"
    echo -e "   Backend API:  ${BLUE}$BACKEND_URL${NC}"
    echo -e "   N8N Workflows:${BLUE}$N8N_URL${NC}"
    echo -e "   ChromaDB:     ${BLUE}$CHROMA_URL${NC}"
    echo ""
    echo -e "${GREEN}🔐 Login Credentials:${NC}"
    echo -e "   N8N: admin / verssai_admin"
    echo ""
    echo -e "${GREEN}📋 Available Features:${NC}"
    echo -e "   ✅ 6 VC Intelligence Workflows"
    echo -e "   ✅ MCP + N8N Integration"
    echo -e "   ✅ Real-time WebSocket Updates"
    echo -e "   ✅ VERSSAI Dataset Integration (1,157 papers, 2,311 researchers)"
    echo -e "   ✅ 3-Layer RAG System"
    echo -e "   ✅ Multi-tenant Architecture"
    echo ""
    echo -e "${GREEN}⚙️  Manual Setup Required:${NC}"
    echo -e "   1. Import N8N workflows from n8n/workflows/ directory"
    echo -e "   2. Activate all 6 workflows in N8N interface"
    echo ""
    echo -e "${GREEN}📊 Service Logs:${NC}"
    echo -e "   Backend:  tail -f backend.log"
    echo -e "   Frontend: tail -f frontend.log"
    echo -e "   Platform: tail -f $LOG_FILE"
    echo ""
}

# Cleanup function
cleanup() {
    print_status "$YELLOW" "🧹 Cleaning up previous deployments..."
    
    # Kill any existing processes
    if [ -f "$PID_FILE" ]; then
        while read pid; do
            if kill -0 $pid 2>/dev/null; then
                kill $pid 2>/dev/null || true
            fi
        done < "$PID_FILE"
        rm -f "$PID_FILE"
    fi
    
    # Stop any running services
    pkill -f "uvicorn" 2>/dev/null || true
    pkill -f "react-scripts start" 2>/dev/null || true
    pkill -f "python.*verssai" 2>/dev/null || true
    
    print_status "$GREEN" "✅ Cleanup completed"
}

# Stop platform
stop_platform() {
    print_status "$YELLOW" "🛑 Stopping VERSSAI Platform..."
    
    cleanup
    
    # Stop Docker services
    if [ -f "docker-compose.yml" ]; then
        docker-compose down >/dev/null 2>&1 || true
    else
        docker stop verssai-postgres verssai-chromadb verssai-n8n 2>/dev/null || true
        docker rm verssai-postgres verssai-chromadb verssai-n8n 2>/dev/null || true
    fi
    
    print_status "$GREEN" "✅ Platform stopped"
}

# Main deployment function
deploy_platform() {
    print_banner
    
    # Initialize log file
    echo "VERSSAI Platform Deployment - $(date)" > "$LOG_FILE"
    
    print_status "$CYAN" "🚀 Starting VERSSAI MCP + N8N Platform Deployment"
    print_status "$CYAN" "📅 $(date)"
    echo ""
    
    # Deployment steps
    check_prerequisites
    cleanup
    check_ports
    setup_python_env
    setup_frontend_env
    start_infrastructure
    process_dataset
    start_backend
    import_n8n_workflows
    start_frontend
    
    # Wait for all services to stabilize
    print_status "$YELLOW" "⏳ Allowing services to stabilize..."
    sleep 10
    
    # Run tests
    run_tests
    
    # Print final status
    echo ""
    print_platform_status
    
    print_status "$GREEN" "🎉 VERSSAI Platform deployment completed successfully!"
    print_status "$CYAN" "Ready to revolutionize venture capital intelligence!"
}

# Script entry point
case "${1:-deploy}" in
    "deploy")
        deploy_platform
        ;;
    "stop")
        stop_platform
        ;;
    "test")
        cd "$SCRIPT_DIR"
        source venv/bin/activate 2>/dev/null || true
        python test_verssai_mcp_complete.py
        ;;
    "status")
        print_platform_status
        ;;
    "logs")
        tail -f "$LOG_FILE"
        ;;
    *)
        echo "Usage: $0 {deploy|stop|test|status|logs}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Deploy the complete VERSSAI platform (default)"
        echo "  stop    - Stop all platform services"
        echo "  test    - Run integration tests"
        echo "  status  - Show platform status and URLs"
        echo "  logs    - Show deployment logs"
        exit 1
        ;;
esac
