#!/bin/bash

# Real VC Platform Startup Script
# Launches complete venture capital operations platform

echo "🚀 Starting Real VC Platform..."
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PLATFORM_MODE=${1:-"vc"}  # vc, verssai, or both

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

# Display platform selection
echo -e "${CYAN}📋 Platform Selection:${NC}"
case $PLATFORM_MODE in
    "vc")
        echo -e "  🎯 ${GREEN}Real VC Platform${NC} - Complete venture capital operations"
        ;;
    "verssai")
        echo -e "  🤖 ${PURPLE}Enhanced VERSSAI${NC} - AI-powered VC intelligence"
        ;;
    "both")
        echo -e "  🚀 ${BLUE}Both Platforms${NC} - Complete solution suite"
        ;;
    *)
        echo -e "${RED}❌ Invalid platform mode. Use: vc, verssai, or both${NC}"
        exit 1
        ;;
esac

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
mkdir -p data/redis

# Start Docker services
echo -e "${PURPLE}🐳 Starting Docker services...${NC}"
docker-compose up -d

# Wait for database services
echo -e "${BLUE}⏳ Waiting for infrastructure services...${NC}"
wait_for_service "http://localhost:5432" "PostgreSQL" &
wait_for_service "http://localhost:8000/api/v1/heartbeat" "ChromaDB" &
wait_for_service "http://localhost:5678/healthz" "N8N" &
wait_for_service "http://localhost:6379" "Redis" &

# Wait for all background jobs
wait

# Setup backend based on platform mode
echo -e "${BLUE}🐍 Setting up Python backend...${NC}"
cd backend

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

echo -e "${YELLOW}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

# Install appropriate requirements
case $PLATFORM_MODE in
    "vc")
        echo -e "${CYAN}📦 Installing Real VC Platform dependencies...${NC}"
        pip install --upgrade pip
        pip install -r requirements_vc_platform.txt
        
        echo -e "${PURPLE}🚀 Starting Real VC Platform API...${NC}"
        python real_vc_platform_api.py &
        BACKEND_PID=$!
        
        # Wait for backend to be ready
        sleep 8
        wait_for_service "http://localhost:8080/api/v1/health" "Real VC Platform API"
        ;;
    "verssai")
        echo -e "${CYAN}📦 Installing Enhanced VERSSAI dependencies...${NC}"
        pip install --upgrade pip
        pip install -r requirements.txt
        
        echo -e "${PURPLE}🚀 Starting Enhanced VERSSAI API...${NC}"
        python enhanced_api_server.py &
        BACKEND_PID=$!
        
        # Wait for backend to be ready
        sleep 8
        wait_for_service "http://localhost:8080/api/v1/health" "Enhanced VERSSAI API"
        ;;
    "both")
        echo -e "${CYAN}📦 Installing all dependencies...${NC}"
        pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements_vc_platform.txt
        
        echo -e "${PURPLE}🚀 Starting Real VC Platform API (primary)...${NC}"
        python real_vc_platform_api.py &
        BACKEND_PID=$!
        
        # Wait for primary backend
        sleep 8
        wait_for_service "http://localhost:8080/api/v1/health" "Real VC Platform API"
        ;;
esac

# Install frontend dependencies and start
echo -e "${BLUE}⚛️  Setting up React frontend...${NC}"
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
    npm install
fi

# Set environment variables based on platform
case $PLATFORM_MODE in
    "vc")
        echo "REACT_APP_PLATFORM_MODE=vc" > .env.local
        echo "REACT_APP_BACKEND_URL=http://localhost:8080" >> .env.local
        echo "REACT_APP_DEFAULT_ROUTE=/" >> .env.local
        ;;
    "verssai")
        echo "REACT_APP_PLATFORM_MODE=verssai" > .env.local
        echo "REACT_APP_BACKEND_URL=http://localhost:8080" >> .env.local
        echo "REACT_APP_DEFAULT_ROUTE=/verssai" >> .env.local
        ;;
    "both")
        echo "REACT_APP_PLATFORM_MODE=both" > .env.local
        echo "REACT_APP_BACKEND_URL=http://localhost:8080" >> .env.local
        echo "REACT_APP_DEFAULT_ROUTE=/" >> .env.local
        ;;
esac

# Start frontend development server
echo -e "${PURPLE}🚀 Starting React Development Server...${NC}"
npm start &
FRONTEND_PID=$!

# Wait for frontend to be ready
sleep 12
wait_for_service "http://localhost:3000" "React Frontend"

# Final status check
echo ""
echo -e "${GREEN}🎉 Real VC Platform is now running!${NC}"
echo "=================================="

case $PLATFORM_MODE in
    "vc")
        echo -e "${CYAN}🎯 Real VC Platform Active:${NC}"
        echo -e "  • Main Platform:      ${GREEN}http://localhost:3000${NC}"
        echo -e "  • API Backend:        ${GREEN}http://localhost:8080${NC}"
        echo -e "  • Deal Flow:          ${GREEN}✅ Active${NC}"
        echo -e "  • Portfolio Mgmt:     ${GREEN}✅ Active${NC}"
        echo -e "  • Fund Analytics:     ${GREEN}✅ Active${NC}"
        echo -e "  • AI Deal Scoring:    ${GREEN}✅ Active${NC}"
        ;;
    "verssai")
        echo -e "${PURPLE}🤖 Enhanced VERSSAI Active:${NC}"
        echo -e "  • VERSSAI Dashboard:  ${GREEN}http://localhost:3000/verssai${NC}"
        echo -e "  • Enhanced API:       ${GREEN}http://localhost:8080${NC}"
        echo -e "  • 3-Layer RAG:        ${GREEN}✅ Active${NC}"
        echo -e "  • N8N Integration:    ${GREEN}✅ Active${NC}"
        echo -e "  • MCP Console:        ${GREEN}✅ Active${NC}"
        ;;
    "both")
        echo -e "${BLUE}🚀 Complete Platform Suite:${NC}"
        echo -e "  • Real VC Platform:   ${GREEN}http://localhost:3000${NC}"
        echo -e "  • VERSSAI Dashboard:  ${GREEN}http://localhost:3000/verssai${NC}"
        echo -e "  • Combined API:       ${GREEN}http://localhost:8080${NC}"
        echo -e "  • All Features:       ${GREEN}✅ Active${NC}"
        ;;
esac

echo ""
echo -e "${BLUE}📊 Infrastructure Status:${NC}"
echo -e "  • PostgreSQL:         ${GREEN}localhost:5432${NC}"
echo -e "  • ChromaDB:           ${GREEN}http://localhost:8000${NC}"
echo -e "  • N8N Dashboard:      ${GREEN}http://localhost:5678${NC}"
echo -e "  • Redis:              ${GREEN}localhost:6379${NC}"

echo ""
echo -e "${CYAN}🎯 Available Features:${NC}"
case $PLATFORM_MODE in
    "vc"|"both")
        echo -e "  • ✅ Deal Flow Management"
        echo -e "  • ✅ Portfolio Tracking"
        echo -e "  • ✅ Fund Performance Analytics"
        echo -e "  • ✅ AI-Powered Deal Scoring"
        echo -e "  • ✅ Investment Management"
        echo -e "  • ✅ Financial Metrics Tracking"
        ;;
esac

case $PLATFORM_MODE in
    "verssai"|"both")
        echo -e "  • ✅ 3-Layer RAG System"
        echo -e "  • ✅ N8N Workflow Automation"
        echo -e "  • ✅ MCP Console"
        echo -e "  • ✅ Document Upload & Processing"
        echo -e "  • ✅ Real-time Updates"
        ;;
esac

echo ""
echo -e "${YELLOW}💡 Quick Start Guide:${NC}"
case $PLATFORM_MODE in
    "vc")
        echo -e "  1. Open ${GREEN}http://localhost:3000${NC}"
        echo -e "  2. Navigate to 'Deal Flow' to manage deals"
        echo -e "  3. Use 'Portfolio' to track investments"
        echo -e "  4. Check 'Analytics' for fund performance"
        ;;
    "verssai")
        echo -e "  1. Open ${GREEN}http://localhost:3000/verssai${NC}"
        echo -e "  2. Click Settings for RAG configuration"
        echo -e "  3. Use N8N Dashboard for workflows"
        echo -e "  4. Upload documents for processing"
        ;;
    "both")
        echo -e "  1. Real VC Platform: ${GREEN}http://localhost:3000${NC}"
        echo -e "  2. VERSSAI Dashboard: ${GREEN}http://localhost:3000/verssai${NC}"
        echo -e "  3. Full feature access across both platforms"
        ;;
esac

echo ""
echo -e "${RED}🛑 To stop the platform:${NC}"
echo -e "  Press Ctrl+C or run: ${YELLOW}./scripts/stop_vc_platform.sh${NC}"

# Create stop script
mkdir -p scripts
cat > scripts/stop_vc_platform.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping Real VC Platform..."

# Kill frontend and backend processes
pkill -f "npm start"
pkill -f "real_vc_platform_api.py"
pkill -f "enhanced_api_server.py"

# Stop Docker services
docker-compose down

echo "✅ Real VC Platform stopped successfully"
EOF

chmod +x scripts/stop_vc_platform.sh

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down Real VC Platform...${NC}"
    
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    # Stop Docker services
    docker-compose down
    
    echo -e "${GREEN}✅ Real VC Platform stopped successfully${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
echo -e "${BLUE}🔄 Platform is running. Press Ctrl+C to stop...${NC}"
echo ""
echo -e "${CYAN}📖 Documentation:${NC}"
echo -e "  • README: ./README.md"
echo -e "  • API Docs: http://localhost:8080/docs"
echo -e "  • Platform Guide: ./REAL_VC_PLATFORM_PROPOSAL.md"

wait