#!/bin/bash

# VERSSAI Setup Script
# This script sets up the complete VERSSAI VC Intelligence Platform

set -e  # Exit on any error

echo "🚀 VERSSAI VC Intelligence Platform Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is not installed. Please install Python 3.8+ first."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    
    # Check Yarn
    if ! command -v yarn &> /dev/null; then
        log_warning "Yarn is not installed. Installing Yarn..."
        npm install -g yarn
    fi
    
    log_success "All prerequisites are satisfied"
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    
    mkdir -p backend/uploads
    mkdir -p backend/logs
    mkdir -p backend/data
    mkdir -p chroma_db
    mkdir -p n8n-data
    mkdir -p database
    
    log_success "Directories created"
}

# Setup environment files
setup_environment() {
    log_info "Setting up environment files..."
    
    # Backend environment
    if [ ! -f backend/.env ]; then
        log_warning "Backend .env not found. Creating from template..."
        cp backend/env.template backend/.env
        log_warning "Please edit backend/.env with your actual API keys and configuration"
    else
        log_success "Backend .env already exists"
    fi
    
    # Frontend environment  
    if [ ! -f frontend/.env ]; then
        log_warning "Frontend .env not found. Creating from template..."
        cp frontend/env.template frontend/.env
        log_success "Frontend .env created from template"
    else
        log_success "Frontend .env already exists"
    fi
    
    # Docker environment
    if [ ! -f .env ]; then
        log_warning "Docker .env not found. Creating from docker.env template..."
        cp docker.env .env
        log_success "Docker .env created from template"
    else
        log_success "Docker .env already exists"
    fi
}

# Install Python dependencies
install_backend_deps() {
    log_info "Installing backend dependencies..."
    
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        log_info "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install requirements
    log_info "Installing Python packages..."
    pip install -r requirements.txt
    
    log_success "Backend dependencies installed"
    cd ..
}

# Install frontend dependencies
install_frontend_deps() {
    log_info "Installing frontend dependencies..."
    
    cd frontend
    
    # Install with Yarn
    yarn install
    
    log_success "Frontend dependencies installed"
    cd ..
}

# Setup database initialization
setup_database() {
    log_info "Setting up database initialization..."
    
    # Create database init script if it doesn't exist
    if [ ! -f database/init.sql ]; then
        cat > database/init.sql << 'EOF'
-- VERSSAI Database Initialization Script

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables for VC intelligence
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    industry VARCHAR(100),
    stage VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pitch_decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    analysis_status VARCHAR(50) DEFAULT 'pending',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_pitch_decks_company ON pitch_decks(company_id);
CREATE INDEX IF NOT EXISTS idx_pitch_decks_status ON pitch_decks(analysis_status);

-- Insert default data
INSERT INTO companies (name, website, industry, stage) VALUES 
('VERSSAI', 'https://verss.ai', 'AI/ML', 'Series A')
ON CONFLICT DO NOTHING;
EOF
        log_success "Database initialization script created"
    else
        log_success "Database initialization script already exists"
    fi
}

# Start Docker services
start_services() {
    log_info "Starting Docker services..."
    
    # Stop any existing services
    docker-compose down
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to start..."
    sleep 30
    
    # Check service health
    log_info "Checking service health..."
    
    # Check PostgreSQL
    if docker-compose exec -T postgres pg_isready -U verssai_user; then
        log_success "PostgreSQL is ready"
    else
        log_error "PostgreSQL is not responding"
        exit 1
    fi
    
    # Check ChromaDB
    if curl -f http://localhost:8000/api/v1/heartbeat &> /dev/null; then
        log_success "ChromaDB is ready"
    else
        log_warning "ChromaDB may not be ready yet"
    fi
    
    log_success "Docker services started"
}

# Run health checks
run_health_checks() {
    log_info "Running health checks..."
    
    # Check if Python dependencies are working
    cd backend
    source venv/bin/activate
    
    if python -c "import fastapi, sqlalchemy, chromadb, openai" 2>/dev/null; then
        log_success "Backend dependencies are working"
    else
        log_error "Some backend dependencies are missing or broken"
        exit 1
    fi
    
    cd ..
    
    # Check frontend build
    cd frontend
    if yarn build --dry-run &> /dev/null; then
        log_success "Frontend can build successfully"
    else
        log_warning "Frontend build may have issues"
    fi
    cd ..
    
    log_success "Health checks completed"
}

# Main setup function
main() {
    echo
    log_info "Starting VERSSAI setup process..."
    echo
    
    check_prerequisites
    echo
    
    create_directories
    echo
    
    setup_environment
    echo
    
    setup_database
    echo
    
    install_backend_deps
    echo
    
    install_frontend_deps
    echo
    
    start_services
    echo
    
    run_health_checks
    echo
    
    log_success "🎉 VERSSAI setup completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Edit backend/.env with your API keys"
    echo "2. Run 'cd backend && source venv/bin/activate && python server.py' to start the backend"
    echo "3. Run 'cd frontend && yarn start' to start the frontend"
    echo "4. Access the platform at http://localhost:3000"
    echo
    echo "Services:"
    echo "- Backend API: http://localhost:8080"
    echo "- Frontend: http://localhost:3000"
    echo "- N8N Workflows: http://localhost:5678"
    echo "- ChromaDB: http://localhost:8000"
    echo "- PostgreSQL: localhost:5432"
    echo
}

# Run main function
main "$@"
