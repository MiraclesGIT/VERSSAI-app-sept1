# VERSSAI Configuration Guide

## 🎯 Overview

This guide covers the complete setup and configuration of the VERSSAI VC Intelligence Platform after cleanup and optimization.

## 🚀 Quick Setup

For first-time setup, run the automated setup script:

```bash
./setup.sh
```

This script will:
- Check prerequisites (Docker, Python, Node.js)
- Create necessary directories
- Set up environment files
- Install all dependencies
- Start Docker services
- Run health checks

## 📁 Project Structure (After Cleanup)

```
VERSSAI-engineAug10/
├── 📦 Backend (Python FastAPI)
│   ├── server.py                 # Main FastAPI server
│   ├── enhanced_server.py        # Enhanced server (future migration)
│   ├── mcp_n8n_service.py       # N8N MCP integration
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # Backend configuration
│   ├── env.template            # Environment template
│   └── config.py               # Configuration management
│
├── 🌐 Frontend (React + TypeScript)
│   ├── package.json            # Node.js dependencies
│   ├── .env                    # Frontend configuration
│   ├── env.template           # Environment template
│   ├── craco.config.js        # CRACO configuration
│   └── src/components/VERSSAILinearApp.tsx  # Linear UI
│
├── 🐳 Infrastructure
│   ├── docker-compose.yml      # Service orchestration
│   ├── docker.env             # Docker environment template
│   └── database/init.sql      # Database initialization
│
└── 📋 Documentation
    ├── CONFIGURATION_GUIDE.md  # This file
    ├── setup.sh               # Automated setup script
    └── health_check.py        # System health validation
```

## 🔧 Environment Configuration

### Backend Environment (backend/.env)

Required configuration for the backend service:

```bash
# Database Configuration
POSTGRES_URL=postgresql://verssai_user:your_secure_password@localhost:5432/verssai_vc
MONGO_URL=mongodb://localhost:27017/verssai
DB_NAME=verssai

# AI Service API Keys
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# External API Keys
GOOGLE_API_KEY=your_google_search_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_google_search_engine_id_here

# ChromaDB Configuration
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_URL=http://localhost:8000

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=52428800

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:8080

# MCP N8N Integration
MCP_WEBSOCKET_PORT=3000
MCP_SERVER_HOST=localhost
MCP_SERVER_PORT=8080

# Multi-tenant Configuration
ENABLE_MULTI_TENANT=true
DEFAULT_ORGANIZATION=verssai_default
```

### Frontend Environment (frontend/.env)

Configuration for the React frontend:

```bash
# Backend API Configuration
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_API_VERSION=v1
REACT_APP_WEBSOCKET_URL=ws://localhost:8080/ws

# External Services
REACT_APP_CHROMA_DB_URL=http://localhost:8000
REACT_APP_N8N_URL=http://localhost:5678
REACT_APP_N8N_WEBHOOK_BASE=http://localhost:5678/webhook

# MCP Configuration
REACT_APP_MCP_WEBSOCKET_URL=ws://localhost:3000
```

### Docker Environment (.env)

Configuration for Docker Compose services:

```bash
# PostgreSQL Configuration
POSTGRES_DB=verssai_vc
POSTGRES_USER=verssai_user
POSTGRES_PASSWORD=verssai_secure_password_2024

# N8N Configuration
N8N_BASIC_AUTH_USER=verssai_admin
N8N_BASIC_AUTH_PASSWORD=verssai_n8n_2024
```

## 🔍 Manual Setup (Alternative)

If you prefer manual setup:

### 1. Prerequisites

- Docker & Docker Compose
- Python 3.8+
- Node.js 16+
- Yarn package manager

### 2. Environment Setup

```bash
# Copy environment templates
cp backend/env.template backend/.env
cp frontend/env.template frontend/.env
cp docker.env .env

# Edit the files with your actual configuration
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
yarn install
```

### 5. Start Services

```bash
# Start Docker services
docker-compose up -d

# Start backend (in separate terminal)
cd backend
source venv/bin/activate
python server.py

# Start frontend (in separate terminal)
cd frontend
yarn start
```

## 🏥 Health Checks

After setup, verify all services are running:

```bash
# Check Docker services
docker-compose ps

# Run health check script
python health_check.py

# Manual checks
curl http://localhost:8080/health        # Backend health
curl http://localhost:8000/api/v1/heartbeat  # ChromaDB health
curl http://localhost:5678              # N8N health
```

## 🎛️ Service URLs

After successful setup:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **N8N Workflows**: http://localhost:5678
- **ChromaDB**: http://localhost:8000
- **PostgreSQL**: localhost:5432

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 3000, 5432, 5678, 8000, 8080 are available
2. **Docker Issues**: Restart Docker service and run `docker-compose down && docker-compose up -d`
3. **Environment Variables**: Double-check all required API keys are set
4. **Dependencies**: Run `setup.sh` again to reinstall dependencies

### Debug Mode

Enable debug logging by setting:

```bash
# Backend
LOG_LEVEL=DEBUG

# Frontend
REACT_APP_LOG_LEVEL=debug
```

## 🔄 Updates & Maintenance

### Updating Dependencies

```bash
# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt --upgrade

# Frontend
cd frontend
yarn upgrade
```

### Database Migrations

```bash
# If schema changes are needed
cd backend
source venv/bin/activate
alembic upgrade head
```

## 🔐 Security Notes

1. **Change Default Passwords**: Update all default passwords in production
2. **API Keys**: Never commit real API keys to version control
3. **CORS**: Configure CORS_ORIGINS for production domains
4. **HTTPS**: Use HTTPS in production environments

## 📊 Architecture Overview

The cleaned-up VERSSAI architecture consists of:

1. **Frontend**: React app with Linear-inspired UI
2. **Backend**: FastAPI server with comprehensive VC intelligence endpoints
3. **Database**: PostgreSQL for structured data
4. **Vector Store**: ChromaDB for embeddings and RAG
5. **Workflow Engine**: N8N for automation
6. **MCP Integration**: WebSocket-based workflow triggering

All services are containerized and orchestrated through Docker Compose for easy deployment and scaling.
