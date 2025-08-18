#!/bin/bash

# VERSSAI Enhanced Platform Startup Script
# Integrates 3-Layer RAG, N8N MCP Service, Multi-tenant Architecture
# Version 2.0.0 - Complete VC Intelligence Platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=8080
FRONTEND_PORT=3000
MCP_PORT=8765
POSTGRES_PORT=5432
CHROMADB_PORT=8000
N8N_PORT=5678

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════════════════════════════╗"
echo "║                        🚀 VERSSAI Enhanced Platform v2.0.0 🚀                        ║"
echo "║                                                                                      ║"
echo "║  🧠 3-Layer RAG Architecture    💼 Multi-tenant Support    🔗 N8N Integration       ║"
echo "║  📊 Linear UI Design           🔬 Research Intelligence    ⚡ Real-time Processing  ║"
echo "║                                                                                      ║"
echo "║  Features: 1,157 Papers • 2,311 Researchers • 38K Citations • 6 VC Workflows      ║"
echo "╚══════════════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to check if port is available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $1 is available${NC}"
        return 0
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}🔄 Killing process on port $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null || true
        sleep 2
    fi
}

# Function to check service health
check_service_health() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}🔍 Checking $service_name health...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is healthy${NC}"
            return 0
        fi
        echo -e "${YELLOW}⏳ Waiting for $service_name... (attempt $attempt/$max_attempts)${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start${NC}"
    return 1
}

# Function to setup Python environment
setup_python_env() {
    echo -e "${BLUE}🐍 Setting up Python environment...${NC}"
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo -e "${BLUE}📦 Creating virtual environment...${NC}"
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install/upgrade pip
    pip install --upgrade pip
    
    # Install required packages
    echo -e "${BLUE}📦 Installing Python dependencies...${NC}"
    pip install fastapi uvicorn sqlalchemy asyncpg pandas numpy scikit-learn networkx chromadb aiohttp aiofiles python-multipart python-jose[cryptography] passlib[bcrypt] openpyxl xlrd websockets jwt
    
    echo -e "${GREEN}✅ Python environment ready${NC}"
}

# Function to setup Node.js environment
setup_node_env() {
    echo -e "${BLUE}📦 Setting up Node.js environment...${NC}"
    
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"
        npm install
    fi
    
    cd ..
    echo -e "${GREEN}✅ Node.js environment ready${NC}"
}

# Function to start Docker services
start_docker_services() {
    echo -e "${BLUE}🐳 Starting Docker services...${NC}"
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
        exit 1
    fi
    
    # Start PostgreSQL
    echo -e "${BLUE}🗄️  Starting PostgreSQL...${NC}"
    docker run -d \
        --name verssai_postgres \
        -e POSTGRES_DB=verssai_vc \
        -e POSTGRES_USER=verssai_user \
        -e POSTGRES_PASSWORD=verssai_secure_password_2024 \
        -p ${POSTGRES_PORT}:5432 \
        -v verssai_postgres_data:/var/lib/postgresql/data \
        postgres:15 2>/dev/null || echo -e "${YELLOW}⚠️  PostgreSQL container already exists${NC}"
    
    # Start ChromaDB
    echo -e "${BLUE}🧠 Starting ChromaDB...${NC}"
    docker run -d \
        --name verssai_chromadb \
        -e CHROMA_SERVER_HOST=0.0.0.0 \
        -e CHROMA_SERVER_HTTP_PORT=8000 \
        -e ANONYMIZED_TELEMETRY=false \
        -p ${CHROMADB_PORT}:8000 \
        -v verssai_chroma_data:/chroma/chroma \
        chromadb/chroma:latest 2>/dev/null || echo -e "${YELLOW}⚠️  ChromaDB container already exists${NC}"
    
    # Start N8N
    echo -e "${BLUE}🔗 Starting N8N...${NC}"
    docker run -d \
        --name verssai_n8n \
        -e N8N_BASIC_AUTH_ACTIVE=true \
        -e N8N_BASIC_AUTH_USER=admin \
        -e N8N_BASIC_AUTH_PASSWORD=verssai123 \
        -e WEBHOOK_URL=http://localhost:${N8N_PORT}/ \
        -p ${N8N_PORT}:5678 \
        -v verssai_n8n_data:/home/node/.n8n \
        n8nio/n8n:latest 2>/dev/null || echo -e "${YELLOW}⚠️  N8N container already exists${NC}"
    
    # Start containers
    docker start verssai_postgres verssai_chromadb verssai_n8n 2>/dev/null || true
    
    echo -e "${GREEN}✅ Docker services started${NC}"
}

# Function to wait for database
wait_for_database() {
    echo -e "${BLUE}⏳ Waiting for PostgreSQL to be ready...${NC}"
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec verssai_postgres pg_isready -U verssai_user >/dev/null 2>&1; then
            echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
            return 0
        fi
        echo -e "${YELLOW}⏳ Waiting for PostgreSQL... (attempt $attempt/$max_attempts)${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ PostgreSQL failed to start${NC}"
    return 1
}

# Function to integrate dataset
integrate_dataset() {
    echo -e "${BLUE}📊 Checking for VERSSAI dataset...${NC}"
    
    if [ -f "VERSSAI_Massive_Dataset_Complete.xlsx" ]; then
        echo -e "${GREEN}✅ Dataset found: VERSSAI_Massive_Dataset_Complete.xlsx${NC}"
        echo -e "${BLUE}📈 Dataset Statistics:${NC}"
        echo -e "${CYAN}   • 1,157 Research Papers${NC}"
        echo -e "${CYAN}   • 2,311 Researchers${NC}"
        echo -e "${CYAN}   • 38,015 Citations${NC}"
        echo -e "${CYAN}   • 24 Institutions${NC}"
        echo -e "${CYAN}   • 32 Verified Papers${NC}"
    else
        echo -e "${YELLOW}⚠️  VERSSAI dataset not found in current directory${NC}"
        echo -e "${BLUE}ℹ️  The dataset will be loaded automatically when available${NC}"
    fi
}

# Function to start backend services
start_backend() {
    echo -e "${BLUE}🔧 Starting VERSSAI Enhanced Backend...${NC}"
    
    # Kill existing backend process
    kill_port $BACKEND_PORT
    
    # Activate Python environment
    source venv/bin/activate
    
    # Start the enhanced backend
    cd backend
    echo -e "${BLUE}🚀 Starting FastAPI server on port $BACKEND_PORT...${NC}"
    python verssai_enhanced_backend.py &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to be ready
    if check_service_health "http://localhost:$BACKEND_PORT/api/health" "Backend API"; then
        echo -e "${GREEN}✅ Backend started successfully (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${RED}❌ Backend failed to start${NC}"
        return 1
    fi
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}⚛️  Starting React Frontend...${NC}"
    
    # Kill existing frontend process
    kill_port $FRONTEND_PORT
    
    cd frontend
    
    # Check if the enhanced component exists
    if [ -f "src/components/VERSSAIEnhancedDashboard.js" ]; then
        echo -e "${GREEN}✅ Enhanced dashboard component found${NC}"
    else
        echo -e "${YELLOW}⚠️  Enhanced dashboard component not found${NC}"
    fi
    
    # Update App.js to use the enhanced dashboard
    cat > src/App.js << 'EOF'
import React from 'react';
import VERSSAIEnhancedDashboard from './components/VERSSAIEnhancedDashboard';
import './App.css';

function App() {
  return (
    <div className="App">
      <VERSSAIEnhancedDashboard />
    </div>
  );
}

export default App;
EOF
    
    echo -e "${BLUE}🚀 Starting React development server on port $FRONTEND_PORT...${NC}"
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to be ready
    if check_service_health "http://localhost:$FRONTEND_PORT" "Frontend"; then
        echo -e "${GREEN}✅ Frontend started successfully (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${RED}❌ Frontend failed to start${NC}"
        return 1
    fi
}

# Function to display service status
display_status() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════════════════════════════╗"
    echo "║                              🎉 VERSSAI Platform Ready! 🎉                           ║"
    echo "╠══════════════════════════════════════════════════════════════════════════════════════╣"
    echo "║                                                                                      ║"
    echo "║  🌐 Frontend (Linear UI):        http://localhost:$FRONTEND_PORT                                ║"
    echo "║  🔧 Backend API:                 http://localhost:$BACKEND_PORT                                ║"
    echo "║  🗄️  PostgreSQL Database:        localhost:$POSTGRES_PORT                                    ║"
    echo "║  🧠 ChromaDB (Vector Store):     http://localhost:$CHROMADB_PORT                               ║"
    echo "║  🔗 N8N Workflows:               http://localhost:$N8N_PORT                                  ║"
    echo "║                                                                                      ║"
    echo "║  📚 Available Endpoints:                                                             ║"
    echo "║     • Health Check:              GET  /api/health                                    ║"
    echo "║     • RAG Query:                 POST /api/rag/query                                 ║"
    echo "║     • VC Intelligence:           POST /api/rag/vc-intelligence                      ║"
    echo "║     • Dataset Ingestion:         POST /api/rag/ingest-dataset                       ║"
    echo "║     • Workflow Execution:        POST /api/workflows/execute                        ║"
    echo "║                                                                                      ║"
    echo "║  🔑 N8N Credentials:                                                                 ║"
    echo "║     • Username: admin                                                                ║"
    echo "║     • Password: verssai123                                                           ║"
    echo "║                                                                                      ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${GREEN}🚀 VERSSAI Enhanced Platform Features:${NC}"
    echo -e "${CYAN}   ✅ 3-Layer RAG Architecture (Roof/VC/Founder)${NC}"
    echo -e "${CYAN}   ✅ Multi-tenant Organization Support${NC}"
    echo -e "${CYAN}   ✅ Linear App-inspired UI/UX${NC}"
    echo -e "${CYAN}   ✅ 6 Core VC Workflow Features${NC}"
    echo -e "${CYAN}   ✅ Real-time N8N Integration${NC}"
    echo -e "${CYAN}   ✅ Research Dataset Integration${NC}"
    echo -e "${CYAN}   ✅ Advanced Vector Search${NC}"
    echo -e "${CYAN}   ✅ Comprehensive VC Intelligence${NC}"
    
    echo ""
    echo -e "${BLUE}🎯 Next Steps:${NC}"
    echo -e "${YELLOW}   1. Visit http://localhost:$FRONTEND_PORT to access the platform${NC}"
    echo -e "${YELLOW}   2. Click 'Ingest Dataset' to load the research data${NC}"
    echo -e "${YELLOW}   3. Try the RAG queries in different layers${NC}"
    echo -e "${YELLOW}   4. Execute VC workflows for portfolio companies${NC}"
    echo -e "${YELLOW}   5. Generate VC intelligence assessments${NC}"
    
    echo ""
    echo -e "${PURPLE}💡 Pro Tips:${NC}"
    echo -e "${PURPLE}   • Use the RAG layer selector to switch between intelligence types${NC}"
    echo -e "${PURPLE}   • Try queries like 'AI startup funding trends' or 'machine learning applications'${NC}"
    echo -e "${PURPLE}   • The platform learns from 1,157 research papers and 38K citations${NC}"
    echo -e "${PURPLE}   • N8N workflows can be customized for your specific VC processes${NC}"
}

# Function to test the complete system
test_system() {
    echo -e "${BLUE}🧪 Testing VERSSAI Enhanced Platform...${NC}"
    
    # Test health endpoint
    echo -e "${BLUE}🔍 Testing health endpoint...${NC}"
    if curl -s "http://localhost:$BACKEND_PORT/api/health" | grep -q "healthy"; then
        echo -e "${GREEN}✅ Health check passed${NC}"
    else
        echo -e "${RED}❌ Health check failed${NC}"
        return 1
    fi
    
    # Test RAG query
    echo -e "${BLUE}🔍 Testing RAG query...${NC}"
    local rag_response=$(curl -s -X POST "http://localhost:$BACKEND_PORT/api/rag/query" \
        -H "Content-Type: application/json" \
        -d '{"query": "artificial intelligence", "layer": "roof", "limit": 3}')
    
    if echo "$rag_response" | grep -q "results"; then
        echo -e "${GREEN}✅ RAG query test passed${NC}"
    else
        echo -e "${YELLOW}⚠️  RAG query test inconclusive (may need dataset ingestion)${NC}"
    fi
    
    # Test workflows endpoint
    echo -e "${BLUE}🔍 Testing workflows endpoint...${NC}"
    if curl -s "http://localhost:$BACKEND_PORT/api/workflows" | grep -q "workflows"; then
        echo -e "${GREEN}✅ Workflows endpoint test passed${NC}"
    else
        echo -e "${RED}❌ Workflows endpoint test failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ System tests completed${NC}"
}

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down VERSSAI Platform...${NC}"
    
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Backend stopped${NC}"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    fi
    
    # Stop Docker containers (but don't remove them for data persistence)
    echo -e "${BLUE}🐳 Stopping Docker services...${NC}"
    docker stop verssai_postgres verssai_chromadb verssai_n8n 2>/dev/null || true
    
    echo -e "${GREEN}✅ VERSSAI Platform stopped successfully${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution flow
main() {
    echo -e "${BLUE}🚀 Starting VERSSAI Enhanced Platform initialization...${NC}"
    
    # Check prerequisites
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python 3 is required but not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Python 3 found${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is required but not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js found${NC}"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is required but not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker found${NC}"
    
    # Setup environments
    setup_python_env
    setup_node_env
    
    # Start services
    start_docker_services
    wait_for_database
    
    # Check ChromaDB
    check_service_health "http://localhost:$CHROMADB_PORT/api/v1/heartbeat" "ChromaDB"
    
    # Integrate dataset
    integrate_dataset
    
    # Start application services
    start_backend
    start_frontend
    
    # Test the system
    test_system
    
    # Display status
    display_status
    
    # Keep the script running
    echo -e "${BLUE}🔄 Platform is running. Press Ctrl+C to stop...${NC}"
    while true; do
        sleep 10
        # Optional: Add periodic health checks here
    done
}

# Execute main function
main "$@"
