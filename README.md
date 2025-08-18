# 🚀 VERSSAI VC Intelligence Platform

**Version 3.0** - Enhanced MCP Backend with 3-Layer RAG/GRAPH Architecture

## 🎯 **System Overview**

VERSSAI is a cutting-edge venture capital intelligence platform with AI-powered workflow automation. The platform features:

- **🧠 3-Layer RAG/GRAPH Engine** - Roof, VC, and Founder intelligence layers
- **🔌 Enhanced MCP Protocol** - WebSocket-based workflow orchestration  
- **⚡ 6 Core VC Workflows** - From founder assessment to LP communication
- **🔐 Role-based Access Control** - SuperAdmin, VC_Partner, Analyst, Founder
- **💬 AI Chat Workflow Generation** - Natural language workflow creation
- **🏗️ Microservices Architecture** - Docker-based scalable infrastructure

## 🏗️ **Architecture**

### **Backend Services**
- **FastAPI Server** (Port 8080) - Main API with MCP protocol
- **PostgreSQL** (Port 5432) - Primary database  
- **ChromaDB** (Port 8000) - Vector storage for RAG
- **Redis** (Port 6379) - Caching and sessions
- **Neo4j** (Port 7474/7687) - Graph database
- **N8N** (Port 5678) - Workflow automation engine

### **Core Workflows**
1. **Founder Signal Assessment** - AI personality analysis and success patterns
2. **Due Diligence Automation** - Document analysis and risk assessment  
3. **Portfolio Management** - Performance tracking and optimization
4. **Competitive Intelligence** - Market analysis and positioning
5. **Fund Allocation Optimization** - Investment allocation strategies
6. **LP Communication Automation** - Automated reporting workflows

## 🚀 **Quick Start**

### **Prerequisites**
- Python 3.8+
- Docker & Docker Compose
- Node.js 16+ (for frontend)

### **1. Start Infrastructure Services**
```bash
# Start all infrastructure services
./start_infrastructure.sh

# Or manually with Docker Compose
docker-compose up -d postgres chromadb redis neo4j n8n
```

### **2. Start VERSSAI Backend**
```bash
# Comprehensive startup with health checks
python3 start_backend.py

# Or direct startup
cd backend && python3 enhanced_mcp_backend.py
```

### **3. Check System Status**
```bash
# Comprehensive health check
python3 check_status.py
```

### **4. Start Frontend (Optional)**
```bash
cd frontend
npm install
npm start
```

## 🔗 **Service URLs**

| Service | URL | Credentials |
|---------|-----|-------------|
| **Main API** | http://localhost:8080 | None |
| **API Health** | http://localhost:8080/health | None |
| **MCP WebSocket** | ws://localhost:8080/mcp | None |
| **RAG Status** | http://localhost:8080/api/rag/status | None |
| **N8N Workflows** | http://localhost:5678 | verssai_admin / verssai_n8n_2024 |
| **ChromaDB** | http://localhost:8000 | None |
| **Neo4j Browser** | http://localhost:7474 | neo4j / verssai_neo4j_2024 |
| **Frontend** | http://localhost:3000 | None |

## 🧠 **RAG/GRAPH Engine**

### **3-Layer Architecture**

**🏢 Roof Layer (Research Intelligence)**
- Complete academic dataset (1,157 papers, 2,311 researchers)
- Citation network analysis (38,016 citations)
- Institution and collaboration mapping

**💼 VC Layer (Investor Intelligence)**  
- Investment target identification
- Market trend analysis
- Risk assessment algorithms

**🚀 Founder Layer (Startup Intelligence)**
- Founder readiness scoring
- Success pattern matching
- Startup archetype classification

### **Query Examples**
```python
# Multi-layer query with weights
await rag_engine.query_multi_layer(
    "machine learning startup founder",
    layer_weights={'roof': 0.4, 'vc': 0.3, 'founder': 0.3}
)
```

## 🔌 **MCP Protocol Usage**

### **WebSocket Connection**
```javascript
const ws = new WebSocket('ws://localhost:8080/mcp?user_role=superadmin');

// List available workflows
ws.send(JSON.stringify({
    "type": "list_workflows"
}));

// Trigger a workflow
ws.send(JSON.stringify({
    "type": "trigger_workflow",
    "workflow_id": "founder_signal",
    "data": {
        "founder_name": "John Doe",
        "company_name": "AI Startup Inc",
        "industry": "Artificial Intelligence"
    }
}));
```

### **Available MCP Commands**
- `ping` - Health check
- `list_workflows` - Get available workflows
- `trigger_workflow` - Start a workflow
- `get_workflow_status` - Check workflow progress
- `cancel_workflow` - Cancel running workflow
- `ai_chat_workflow` - AI chat for workflow creation (SuperAdmin)
- `rag_query` - Query RAG engine directly

## 👥 **User Roles & Permissions**

| Role | Permissions |
|------|-------------|
| **SuperAdmin** | Full access, workflow creation, AI chat, system admin |
| **VC_Partner** | Trigger workflows, basic workflow creation, view results |
| **Analyst** | Trigger workflows, view results |
| **Founder** | Submit applications, view limited results |

## 🔧 **Configuration**

### **Environment Variables** (`.env`)
```env
# PostgreSQL
POSTGRES_DB=verssai_vc
POSTGRES_USER=verssai_user  
POSTGRES_PASSWORD=verssai_secure_password_2024

# N8N
N8N_BASIC_AUTH_USER=verssai_admin
N8N_BASIC_AUTH_PASSWORD=verssai_n8n_2024

# Environment
ENVIRONMENT=development
```

### **Backend Configuration**
The backend automatically detects and uses the mock dataset for development:
- **Dataset Location**: `./backend/uploads/VERSSAI_Massive_Dataset_Complete.xlsx`
- **RAG Engine**: Auto-initializes on startup
- **Workflow Templates**: 6 pre-configured VC workflows

## 🛠️ **Development**

### **Testing Backend Components**
```bash
# Run comprehensive component tests
python3 test_backend_fixed.py
```

### **Creating Custom Workflows**
SuperAdmin users can create workflows via AI chat:
```javascript
// Connect as SuperAdmin
const ws = new WebSocket('ws://localhost:8080/mcp?user_role=superadmin');

// Start AI chat for workflow creation
ws.send(JSON.stringify({
    "type": "ai_chat_workflow",
    "message": "Create a new workflow for market analysis",
    "chat_session_id": "session_123"
}));
```

### **Dataset Management**
```bash
# Create mock dataset for development
python3 create_mock_dataset.py

# Integrate with real dataset
python3 integrate_dataset.py
```

## 📊 **Monitoring & Logging**

### **Health Checks**
- **API Health**: `GET /health`
- **RAG Status**: `GET /api/rag/status`  
- **MCP Status**: `GET /api/mcp/status`

### **Optional Monitoring Stack**
```bash
# Start with monitoring (Prometheus + Grafana)
docker-compose --profile monitoring up -d

# Grafana: http://localhost:3001 (admin / verssai_grafana_2024)
# Prometheus: http://localhost:9090
```

## 🚨 **Troubleshooting**

### **Common Issues**

**❌ RAG Engine fails to initialize**
```bash
# Check dataset exists
ls -la ./backend/uploads/VERSSAI_Massive_Dataset_Complete.xlsx

# Regenerate mock dataset
python3 create_mock_dataset.py
```

**❌ N8N not accessible**
```bash
# Check N8N container
docker-compose logs n8n

# Restart N8N
docker-compose restart n8n
```

**❌ WebSocket connection fails**
```bash
# Check backend is running
curl http://localhost:8080/health

# Check firewall/port access
```

### **Logs & Debugging**
```bash
# Backend logs
cd backend && python3 enhanced_mcp_backend.py

# Docker service logs
docker-compose logs [service_name]

# System status check
python3 check_status.py
```

## 🔄 **Updates & Migration**

### **Version 3.0 Features** 
✅ Enhanced MCP Protocol with WebSocket support  
✅ 3-Layer RAG/GRAPH Architecture  
✅ AI Chat Workflow Generation  
✅ Role-based Access Control  
✅ Real-time progress monitoring  
✅ Cross-layer intelligence insights  

### **Previous Versions**
- **v2.0**: Basic MCP integration, standard workflows
- **v1.0**: Initial VC platform with basic automation

## 📝 **API Documentation**

### **Core Endpoints**
```
GET    /                    # Root endpoint with system info
GET    /health              # Health check with service status
GET    /api/rag/status      # RAG engine status and statistics
POST   /api/rag/query       # Direct RAG query endpoint
GET    /api/mcp/status      # MCP protocol status
WS     /mcp                 # MCP WebSocket endpoint
POST   /webhook/*           # N8N workflow webhooks
```

### **Webhook Endpoints**
- `/webhook/founder-signal-webhook`
- `/webhook/due-diligence-webhook`  
- `/webhook/portfolio-webhook`
- `/webhook/competitive-intel-webhook`
- `/webhook/fund-allocation-webhook`
- `/webhook/lp-communication-webhook`

## 📞 **Support**

For technical support or questions:
- Check system status: `python3 check_status.py`
- Review logs in `./backend/logs/`
- Test components: `python3 test_backend_fixed.py`

---

**🎉 VERSSAI VC Intelligence Platform - Empowering Venture Capital with AI**
