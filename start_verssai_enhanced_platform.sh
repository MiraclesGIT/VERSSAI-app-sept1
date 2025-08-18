#!/bin/bash

# VERSSAI Enhanced Platform Startup Script
# Starts the complete VC Intelligence Platform with Dataset Integration

echo "🚀 Starting VERSSAI Enhanced VC Intelligence Platform v3.0"
echo "================================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Check if dataset file exists
check_dataset() {
    print_header "📊 Checking VERSSAI Dataset..."
    
    dataset_files=(
        "VERSSAI_Massive_Dataset_Complete.xlsx"
        "../VERSSAI_Massive_Dataset_Complete.xlsx"
        "data/VERSSAI_Massive_Dataset_Complete.xlsx"
        "uploads/VERSSAI_Massive_Dataset_Complete.xlsx"
    )
    
    dataset_found=false
    for file in "${dataset_files[@]}"; do
        if [[ -f "$file" ]]; then
            print_success "Found VERSSAI dataset at: $file"
            dataset_found=true
            break
        fi
    done
    
    if [[ "$dataset_found" = false ]]; then
        print_warning "VERSSAI dataset not found - platform will run with simulated data"
        print_status "Expected file: VERSSAI_Massive_Dataset_Complete.xlsx"
        print_status "The platform will still work with mock data for demonstration"
    fi
}

# Check Python dependencies
check_python_deps() {
    print_header "🐍 Checking Python Dependencies..."
    
    cd backend
    
    # Check if virtual environment exists
    if [[ ! -d "venv" ]]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install/upgrade dependencies
    print_status "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Install additional dependencies for dataset processing
    pip install pandas openpyxl xlrd
    pip install sqlalchemy asyncpg
    pip install scikit-learn networkx
    pip install fastapi uvicorn websockets
    
    print_success "Python dependencies installed"
    cd ..
}

# Check Node.js dependencies
check_node_deps() {
    print_header "📦 Checking Node.js Dependencies..."
    
    cd frontend
    
    if [[ ! -d "node_modules" ]]; then
        print_status "Installing Node.js dependencies..."
        npm install
    else
        print_status "Node.js dependencies already installed"
    fi
    
    print_success "Node.js dependencies ready"
    cd ..
}

# Start services
start_backend() {
    print_header "🔧 Starting Enhanced Backend with Dataset Integration..."
    
    cd backend
    source venv/bin/activate
    
    # Start the enhanced backend with dataset integration
    print_status "Starting VERSSAI Enhanced Backend on port 8080..."
    python verssai_enhanced_backend_with_dataset.py &
    BACKEND_PID=$!
    
    # Wait for backend to start
    print_status "Waiting for backend to initialize..."
    sleep 5
    
    # Check if backend is running
    if ps -p $BACKEND_PID > /dev/null; then
        print_success "Backend started successfully (PID: $BACKEND_PID)"
    else
        print_error "Backend failed to start"
        exit 1
    fi
    
    cd ..
}

start_frontend() {
    print_header "⚛️ Starting Enhanced React Frontend..."
    
    cd frontend
    
    # Start React development server
    print_status "Starting React frontend on port 3000..."
    npm start &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    print_status "Waiting for frontend to initialize..."
    sleep 10
    
    # Check if frontend is running
    if ps -p $FRONTEND_PID > /dev/null; then
        print_success "Frontend started successfully (PID: $FRONTEND_PID)"
    else
        print_error "Frontend failed to start"
        exit 1
    fi
    
    cd ..
}

# Test the integration
test_integration() {
    print_header "🧪 Testing Platform Integration..."
    
    # Test backend health
    print_status "Testing backend health endpoint..."
    response=$(curl -s http://localhost:8080/health || echo "failed")
    
    if [[ "$response" == "failed" ]]; then
        print_error "Backend health check failed"
    else
        print_success "Backend health check passed"
        
        # Test dataset endpoint
        print_status "Testing dataset integration..."
        dataset_response=$(curl -s http://localhost:8080/api/dataset/stats || echo "failed")
        
        if [[ "$dataset_response" == "failed" ]]; then
            print_warning "Dataset endpoint test failed - using simulated data"
        else
            print_success "Dataset integration working"
        fi
    fi
    
    # Test frontend
    print_status "Testing frontend accessibility..."
    frontend_response=$(curl -s http://localhost:3000 || echo "failed")
    
    if [[ "$frontend_response" == "failed" ]]; then
        print_error "Frontend accessibility test failed"
    else
        print_success "Frontend is accessible"
    fi
}

# Show platform information
show_platform_info() {
    print_header "📋 VERSSAI Platform Information"
    echo ""
    echo "🌐 Frontend (React): http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8080"
    echo "📊 Health Check: http://localhost:8080/health"
    echo "📈 Dataset Stats: http://localhost:8080/api/dataset/stats"
    echo "🔍 RAG Status: http://localhost:8080/api/rag/status"
    echo ""
    print_header "🎯 Available Features:"
    echo "• 6 VC Intelligence Workflows"
    echo "• Real Dataset Integration (1,157 papers, 2,311 researchers)"
    echo "• 3-Layer RAG System (ROOF/VC/FOUNDER)"
    echo "• Linear-style UI with Real-time Updates"
    echo "• WebSocket-based MCP Protocol"
    echo "• Multi-tenant Architecture"
    echo "• Portfolio Management"
    echo "• Researcher Search & Analysis"
    echo "• Institution Performance Metrics"
    echo "• Citation Network Analysis"
    echo ""
    print_header "🛠️ Development Tools:"
    echo "• Backend logs: tail -f backend/verssai_backend.log"
    echo "• Dataset processor test: cd backend && python verssai_dataset_processor.py"
    echo "• API documentation: http://localhost:8080/docs"
    echo ""
}

# Cleanup function
cleanup() {
    print_header "🧹 Cleaning up processes..."
    
    if [[ ! -z "$BACKEND_PID" ]] && ps -p $BACKEND_PID > /dev/null; then
        print_status "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
    fi
    
    if [[ ! -z "$FRONTEND_PID" ]] && ps -p $FRONTEND_PID > /dev/null; then
        print_status "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
    fi
    
    # Kill any remaining processes
    pkill -f "verssai_enhanced_backend"
    pkill -f "react-scripts start"
    
    print_success "Cleanup completed"
    exit 0
}

# Trap signals for cleanup
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    print_header "🚀 VERSSAI Enhanced Platform Startup"
    echo "Starting comprehensive VC Intelligence Platform with:"
    echo "• Real Dataset Integration"
    echo "• 3-Layer RAG System" 
    echo "• N8N Workflow Automation"
    echo "• Linear-style UI"
    echo "• WebSocket Real-time Updates"
    echo ""
    
    # Run checks and setup
    check_dataset
    check_python_deps
    check_node_deps
    
    # Start services
    start_backend
    start_frontend
    
    # Test integration
    sleep 5
    test_integration
    
    # Show information
    show_platform_info
    
    print_success "🎉 VERSSAI Enhanced Platform is now running!"
    print_status "Press Ctrl+C to stop all services"
    
    # Keep script running
    while true; do
        sleep 30
        
        # Check if services are still running
        if ! ps -p $BACKEND_PID > /dev/null; then
            print_error "Backend process stopped unexpectedly"
            break
        fi
        
        if ! ps -p $FRONTEND_PID > /dev/null; then
            print_error "Frontend process stopped unexpectedly"
            break
        fi
    done
}

# Execute main function
main

