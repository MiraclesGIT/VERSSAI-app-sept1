#!/bin/bash

# Enhanced VERSSAI Startup Script
# Supports both original and enhanced server modes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Configuration
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$BACKEND_DIR")"
VENV_PATH="$BACKEND_DIR/venv"

# Default values
SERVER_MODE="enhanced"  # or "original"
HOST="0.0.0.0"
PORT="8080"
DEBUG="false"
RELOAD="false"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --mode)
            SERVER_MODE="$2"
            shift 2
            ;;
        --host)
            HOST="$2"
            shift 2
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --debug)
            DEBUG="true"
            RELOAD="true"
            shift
            ;;
        --reload)
            RELOAD="true"
            shift
            ;;
        -h|--help)
            echo "Enhanced VERSSAI Startup Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --mode MODE       Server mode: 'enhanced' or 'original' (default: enhanced)"
            echo "  --host HOST       Host to bind to (default: 0.0.0.0)"
            echo "  --port PORT       Port to bind to (default: 8080)"
            echo "  --debug           Enable debug mode with auto-reload"
            echo "  --reload          Enable auto-reload for development"
            echo "  -h, --help        Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Start enhanced server"
            echo "  $0 --mode original                   # Start original server"
            echo "  $0 --debug --port 8081              # Debug mode on port 8081"
            echo "  $0 --mode enhanced --reload          # Enhanced server with reload"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Display startup banner
clear
log_header "╔══════════════════════════════════════════════════════════════╗"
log_header "║                    ENHANCED VERSSAI SERVER                  ║"
log_header "║              VC Intelligence Platform v3.0.0                ║"
log_header "╚══════════════════════════════════════════════════════════════╝"
echo

log_info "Configuration:"
log_info "  Mode: $SERVER_MODE"
log_info "  Host: $HOST"
log_info "  Port: $PORT"
log_info "  Debug: $DEBUG"
log_info "  Reload: $RELOAD"
echo

# Check if we're in the correct directory
if [ ! -f "$BACKEND_DIR/requirements.txt" ]; then
    log_error "requirements.txt not found. Are you in the correct directory?"
    exit 1
fi

# Check virtual environment
check_virtual_environment() {
    log_info "Checking Python virtual environment..."
    
    if [ ! -d "$VENV_PATH" ]; then
        log_warning "Virtual environment not found. Creating..."
        python3 -m venv "$VENV_PATH"
        log_success "Virtual environment created"
    fi
    
    # Activate virtual environment
    source "$VENV_PATH/bin/activate"
    
    # Upgrade pip
    python -m pip install --upgrade pip
    
    # Install/update requirements
    log_info "Installing/updating Python dependencies..."
    pip install -r requirements.txt
    
    log_success "Virtual environment ready"
}

# Check environment file
check_environment_file() {
    log_info "Checking environment configuration..."
    
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        log_warning ".env file not found. Creating from template..."
        if [ -f "$BACKEND_DIR/env.template" ]; then
            cp "$BACKEND_DIR/env.template" "$BACKEND_DIR/.env"
            log_warning "Please edit .env file with your actual API keys and configuration"
        else
            log_error "env.template not found. Cannot create .env file."
            exit 1
        fi
    fi
    
    log_success "Environment configuration ready"
}

# Check Docker services
check_docker_services() {
    log_info "Checking Docker services..."
    
    # Check if Docker is running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check if docker-compose.yml exists
    if [ ! -f "$PROJECT_ROOT/docker-compose.yml" ]; then
        log_error "docker-compose.yml not found in project root"
        exit 1
    fi
    
    # Start Docker services
    log_info "Starting Docker services..."
    cd "$PROJECT_ROOT"
    docker-compose up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to start..."
    sleep 10
    
    # Check service health
    local services_healthy=true
    
    # Check PostgreSQL
    if docker-compose exec -T postgres pg_isready -U verssai_user &> /dev/null; then
        log_success "PostgreSQL is ready"
    else
        log_warning "PostgreSQL is not ready"
        services_healthy=false
    fi
    
    # Check ChromaDB
    if curl -f http://localhost:8000/api/v1/heartbeat &> /dev/null; then
        log_success "ChromaDB is ready"
    else
        log_warning "ChromaDB is not ready"
    fi
    
    # Check N8N
    if curl -f http://localhost:5678/healthz &> /dev/null; then
        log_success "N8N is ready"
    else
        log_warning "N8N is not ready"
    fi
    
    if [ "$services_healthy" = false ]; then
        log_warning "Some services are not ready. The server may have limited functionality."
    else
        log_success "All Docker services are ready"
    fi
    
    cd "$BACKEND_DIR"
}

# Start server based on mode
start_server() {
    log_info "Starting VERSSAI server in $SERVER_MODE mode..."
    
    # Set environment variables
    export HOST="$HOST"
    export PORT="$PORT"
    export DEBUG="$DEBUG"
    
    # Activate virtual environment
    source "$VENV_PATH/bin/activate"
    
    if [ "$SERVER_MODE" = "enhanced" ]; then
        # Start enhanced server
        if [ "$RELOAD" = "true" ]; then
            log_info "Starting enhanced server with auto-reload..."
            uvicorn enhanced_verssai_server:app \
                --host "$HOST" \
                --port "$PORT" \
                --reload \
                --log-level info
        else
            log_info "Starting enhanced server..."
            python enhanced_verssai_server.py
        fi
    elif [ "$SERVER_MODE" = "original" ]; then
        # Start original server
        if [ "$RELOAD" = "true" ]; then
            log_info "Starting original server with auto-reload..."
            uvicorn server:app \
                --host "$HOST" \
                --port "$PORT" \
                --reload \
                --log-level info
        else
            log_info "Starting original server..."
            python server.py
        fi
    else
        log_error "Invalid server mode: $SERVER_MODE"
        exit 1
    fi
}

# Main execution
main() {
    log_info "Initializing Enhanced VERSSAI..."
    echo
    
    # Run checks and setup
    check_virtual_environment
    echo
    
    check_environment_file
    echo
    
    check_docker_services
    echo
    
    # Start the server
    log_success "🚀 All checks passed! Starting server..."
    echo
    
    start_server
}

# Handle interruption
trap 'log_warning "Server interrupted. Cleaning up..."; exit 130' INT TERM

# Run main function
main "$@"
