#!/bin/bash

# VERSSAI Enhanced Platform Startup Script
# This script starts all services for the VERSSAI VC Intelligence Platform

echo "🚀 Starting VERSSAI Enhanced VC Intelligence Platform..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    echo -e "${YELLOW}⏳ Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}   Attempt $attempt/$max_attempts - $service_name not ready yet...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start within expected time${NC}"
    return 1
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.8+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites are installed${NC}"

# Create necessary directories
echo -e "${BLUE}📁 Creating necessary directories...${NC}"
mkdir -p uploads
mkdir -p logs
mkdir -p data/postgres
mkdir -p data/chromadb
mkdir -p data/n8n

# Start Docker services
echo -e "${PURPLE}🐳 Starting Docker services...${NC}"
docker-compose up -d

# Wait for database services
wait_for_service "http://localhost:5432" "PostgreSQL" &
wait_for_service "http://localhost:8000/api/v1/heartbeat" "ChromaDB" &
wait_for_service "http://localhost:5678/healthz" "N8N" &

# Wait for all background jobs
wait

# Install backend dependencies
echo -e "${BLUE}🐍 Setting up Python backend...${NC}"
cd backend

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

echo -e "${YELLOW}🔧 Activating virtual environment and installing dependencies...${NC}"
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Start enhanced backend API
echo -e "${PURPLE}🚀 Starting Enhanced VERSSAI API Server...${NC}"
python enhanced_api_server.py &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 5
wait_for_service "http://localhost:8080/api/v1/health" "Enhanced API Server"

# Install frontend dependencies and start
echo -e "${BLUE}⚛️  Setting up React frontend...${NC}"
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
    npm install
fi

# Start frontend development server
echo -e "${PURPLE}🚀 Starting React Development Server...${NC}"
npm start &
FRONTEND_PID=$!

# Wait for frontend to be ready
sleep 10
wait_for_service "http://localhost:3000" "React Frontend"

# Final status check
echo ""
echo -e "${GREEN}🎉 VERSSAI Enhanced Platform is now running!${NC}"
echo "=============================================="
echo -e "${BLUE}📊 Service Status:${NC}"
echo -e "  • Frontend:           ${GREEN}http://localhost:3000${NC}"
echo -e "  • Enhanced API:       ${GREEN}http://localhost:8080${NC}"
echo -e "  • N8N Dashboard:      ${GREEN}http://localhost:5678${NC}"
echo -e "  • ChromaDB:           ${GREEN}http://localhost:8000${NC}"
echo -e "  • PostgreSQL:         ${GREEN}localhost:5432${NC}"
echo ""
echo -e "${BLUE}🔐 SuperAdmin Access:${NC}"
echo -e "  • Role: SuperAdmin"
echo -e "  • N8N Console: ✅ Enabled"
echo -e "  • MCP Console: ✅ Enabled"
echo -e "  • RAG Management: ✅ Enabled"
echo ""
echo -e "${BLUE}🎯 Key Features Available:${NC}"
echo -e "  • ✅ Real Settings Panel"
echo -e "  • ✅ N8N+MCP Integration Buttons"
echo -e "  • ✅ 3-Layer RAG System (Roof/VC/Startup)"
echo -e "  • ✅ Document Upload & Processing"
echo -e "  • ✅ Workflow Automation"
echo -e "  • ✅ Company Management"
echo -e "  • ✅ Performance Monitoring"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "  • Access N8N Dashboard for workflow management"
echo -e "  • Use MCP Console for system monitoring"
echo -e "  • Upload documents to different RAG layers"
echo -e "  • Trigger AI workflows on selected companies"
echo ""
echo -e "${RED}🛑 To stop all services:${NC}"
echo -e "  Press Ctrl+C or run: ${YELLOW}./scripts/stop_verssai.sh${NC}"

# Create stop script
mkdir -p scripts
cat > scripts/stop_verssai.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping VERSSAI Platform..."

# Kill frontend and backend processes
pkill -f "npm start"
pkill -f "enhanced_api_server.py"

# Stop Docker services
docker-compose down

echo "✅ VERSSAI Platform stopped successfully"
EOF

chmod +x scripts/stop_verssai.sh

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down VERSSAI Platform...${NC}"
    
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    # Stop Docker services
    docker-compose down
    
    echo -e "${GREEN}✅ VERSSAI Platform stopped successfully${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
echo -e "${BLUE}🔄 Platform is running. Press Ctrl+C to stop...${NC}"
wait