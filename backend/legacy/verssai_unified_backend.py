#!/usr/bin/env python3
"""
VERSSAI Unified Backend - Production Ready
Consolidated backend combining all functionality from multiple implementations
"""

import asyncio
import logging
import json
import os
import sqlite3
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
import aiohttp
import websockets
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks, Depends, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
import uvicorn
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import configurations
try:
    from config import Config
    config = Config()
except ImportError:
    print("⚠️ Config module not found, using environment variables directly")
    class Config:
        POSTGRES_URL = os.getenv('POSTGRES_URL', 'postgresql://verssai_user:verssai_password@localhost:5432/verssai_db')
        N8N_BASE_URL = os.getenv('N8N_BASE_URL', 'http://localhost:5678')
        CHROMA_URL = os.getenv('CHROMA_URL', 'http://localhost:8000')
        UPLOAD_PATH = Path(os.getenv('UPLOAD_PATH', './uploads'))
        MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', '52428800'))
        # Secure CORS configuration
        ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
        if ENVIRONMENT == 'production':
            CORS_ORIGINS = [
                "https://verssai.company.com",
                "https://app.verssai.com"
            ]
        else:
            CORS_ORIGINS = [
                "http://localhost:3000", 
                "http://localhost:3001",
                "http://localhost:3004"
            ]
    config = Config()

# Import optional services (with graceful degradation)
try:
    from enhanced_rag_graph_engine import VERSSAIRAGGraphEngine
    RAG_ENGINE_AVAILABLE = True
except ImportError:
    print("⚠️ RAG Graph Engine not available")
    RAG_ENGINE_AVAILABLE = False

try:
    from database import get_db, DATABASE_AVAILABLE
except ImportError:
    print("⚠️ Database module not available, using file storage")
    DATABASE_AVAILABLE = False

try:
    from file_storage import file_storage
    FILE_STORAGE_AVAILABLE = True
except ImportError:
    print("⚠️ File storage not available")
    FILE_STORAGE_AVAILABLE = False

# Import AI services (optional)
AI_SERVICES_AVAILABLE = {}
try:
    from rag_service import rag_service, query_multi_level
    AI_SERVICES_AVAILABLE['rag'] = True
except ImportError:
    AI_SERVICES_AVAILABLE['rag'] = False

try:
    from workflow_orchestrator import workflow_orchestrator, process_founder_signal_deck
    AI_SERVICES_AVAILABLE['workflow'] = True
except ImportError:
    AI_SERVICES_AVAILABLE['workflow'] = False

try:
    from intelligence_orchestrator import intelligence_orchestrator
    AI_SERVICES_AVAILABLE['intelligence'] = True
except ImportError:
    AI_SERVICES_AVAILABLE['intelligence'] = False

try:
    from due_diligence_agent import due_diligence_orchestrator, process_due_diligence_data_room
    AI_SERVICES_AVAILABLE['due_diligence'] = True
except ImportError:
    AI_SERVICES_AVAILABLE['due_diligence'] = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('verssai_unified_backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Import Gemini service after logger is configured
try:
    from gemini_ai_service import gemini_service
    AI_SERVICES_AVAILABLE['gemini'] = True
    logger.info("✅ Gemini AI Service loaded successfully")
except ImportError as e:
    logger.warning(f"⚠️ Gemini AI Service not available: {e}")
    AI_SERVICES_AVAILABLE['gemini'] = False

# Security
security = HTTPBearer()

# FastAPI app
app = FastAPI(
    title="VERSSAI Unified Backend",
    description="Consolidated VC Intelligence Platform with RAG/GRAPH, MCP Protocol, and AI Workflow Generation",
    version="4.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
if config.UPLOAD_PATH.exists():
    app.mount("/uploads", StaticFiles(directory=str(config.UPLOAD_PATH)), name="uploads")

# ==================== DATA MODELS ====================

class BackendStatus(BaseModel):
    service: str
    version: str
    status: str
    timestamp: datetime
    available_services: Dict[str, bool]
    database_status: str
    rag_engine_status: str

class WorkflowRequest(BaseModel):
    workflow_type: str
    company_id: Optional[str] = None
    user_id: str
    parameters: Optional[Dict[str, Any]] = {}
    verssai_data: Optional[Dict[str, Any]] = {}

class WorkflowResult(BaseModel):
    execution_id: str
    workflow_type: str
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime

class MCPMessage(BaseModel):
    id: str
    method: str
    params: Dict[str, Any]

class QueryRequest(BaseModel):
    query: str
    query_type: Optional[str] = "general"
    filters: Optional[Dict[str, Any]] = {}
    limit: Optional[int] = 10

class CompanyProfile(BaseModel):
    company_name: str
    industry: Optional[str] = None
    stage: Optional[str] = None
    description: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = {}

# ==================== UNIFIED BACKEND MANAGER ====================

class UnifiedBackendManager:
    """Unified manager combining all backend functionality"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.workflow_sessions: Dict[str, Dict] = {}
        self.chat_sessions: Dict[str, Dict] = {}
        self.workflow_results: Dict[str, WorkflowResult] = {}
        self.workflow_status: Dict[str, str] = {}
        
        # Initialize services
        self.rag_engine = None
        self.database = None
        self.file_storage = None
        
        # User roles and permissions
        self.user_roles = {
            'superadmin': ['*'],  # Full access
            'vc_partner': ['view', 'trigger_workflow', 'create_basic_workflow'],
            'analyst': ['view', 'trigger_workflow'],
            'founder': ['view_limited', 'submit_application']
        }
        
        # Workflow templates
        self.workflow_templates = {
            "founder_signal": {
                "name": "Founder Signal Assessment",
                "description": "AI personality analysis and success pattern matching",
                "webhook_id": "founder-signal-webhook",
                "expected_duration": 180,
                "required_inputs": ["founder_name", "company_name", "industry", "stage"],
                "rag_layers": ["roof", "vc", "founder"]
            },
            "due_diligence": {
                "name": "Due Diligence Automation", 
                "description": "Document analysis, risk assessment, compliance",
                "webhook_id": "due-diligence-webhook",
                "expected_duration": 300,
                "required_inputs": ["company_name", "documents", "analysis_type"],
                "rag_layers": ["roof", "vc"]
            },
            "competitive_intelligence": {
                "name": "Competitive Intelligence",
                "description": "Market analysis and competitive positioning",
                "webhook_id": "competitive-intel-webhook",
                "expected_duration": 240,
                "required_inputs": ["company_name", "industry", "competitors"],
                "rag_layers": ["roof", "vc"]
            },
            "fund_allocation": {
                "name": "Fund Allocation Optimization",
                "description": "Investment allocation strategy optimization",
                "webhook_id": "fund-allocation-webhook",
                "expected_duration": 200,
                "required_inputs": ["portfolio", "allocation_criteria"],
                "rag_layers": ["vc"]
            },
            "portfolio_management": {
                "name": "Portfolio Management",
                "description": "Portfolio performance tracking and optimization",
                "webhook_id": "portfolio-mgmt-webhook",
                "expected_duration": 180,
                "required_inputs": ["portfolio_id", "metrics"],
                "rag_layers": ["vc"]
            },
            "lp_communication": {
                "name": "LP Communication Automation",
                "description": "Automated LP reporting and communication",
                "webhook_id": "lp-communication-webhook",
                "expected_duration": 150,
                "required_inputs": ["report_type", "period"],
                "rag_layers": ["vc"]
            }
        }
        
        self._initialize_services()
    
    def _initialize_services(self):
        """Initialize all available services"""
        logger.info("Initializing VERSSAI Unified Backend services...")
        
        # Initialize RAG Engine
        if RAG_ENGINE_AVAILABLE:
            try:
                self.rag_engine = VERSSAIRAGGraphEngine()
                logger.info("✅ RAG/Graph Engine initialized")
            except Exception as e:
                logger.warning(f"⚠️ RAG Engine initialization failed: {e}")
        
        # Initialize File Storage
        if FILE_STORAGE_AVAILABLE:
            try:
                self.file_storage = file_storage
                logger.info("✅ File Storage initialized")
            except Exception as e:
                logger.warning(f"⚠️ File Storage initialization failed: {e}")
        
        logger.info("🚀 VERSSAI Unified Backend ready!")
    
    async def connect_websocket(self, websocket: WebSocket, client_id: str):
        """Handle WebSocket connections"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected via WebSocket")
        
        try:
            await websocket.send_json({
                "type": "connection_established",
                "client_id": client_id,
                "timestamp": datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"Error sending connection confirmation: {e}")
    
    async def disconnect_websocket(self, client_id: str):
        """Handle WebSocket disconnections"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"Client {client_id} disconnected")
    
    async def broadcast_message(self, message: Dict[str, Any], exclude_client: Optional[str] = None):
        """Broadcast message to all connected WebSocket clients"""
        disconnected_clients = []
        
        for client_id, websocket in self.active_connections.items():
            if exclude_client and client_id == exclude_client:
                continue
                
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send message to client {client_id}: {e}")
                disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            del self.active_connections[client_id]
    
    async def execute_workflow(self, workflow_request: WorkflowRequest) -> WorkflowResult:
        """Execute a workflow with the available services"""
        execution_id = str(uuid.uuid4())
        timestamp = datetime.now()
        
        try:
            # Validate workflow type
            if workflow_request.workflow_type not in self.workflow_templates:
                raise HTTPException(status_code=400, detail=f"Unknown workflow type: {workflow_request.workflow_type}")
            
            template = self.workflow_templates[workflow_request.workflow_type]
            
            # Update workflow status
            self.workflow_status[execution_id] = "running"
            
            # Broadcast status update
            await self.broadcast_message({
                "type": "workflow_status",
                "execution_id": execution_id,
                "status": "running",
                "workflow_type": workflow_request.workflow_type
            })
            
            # Execute workflow based on type and available services
            result = None
            if workflow_request.workflow_type == "founder_signal" and AI_SERVICES_AVAILABLE.get('workflow'):
                result = await self._execute_founder_signal(workflow_request)
            elif workflow_request.workflow_type == "due_diligence" and AI_SERVICES_AVAILABLE.get('due_diligence'):
                result = await self._execute_due_diligence(workflow_request)
            elif self.rag_engine:
                result = await self._execute_rag_workflow(workflow_request)
            else:
                result = {"message": "Workflow executed (mock)", "parameters": workflow_request.parameters}
            
            # Create workflow result
            workflow_result = WorkflowResult(
                execution_id=execution_id,
                workflow_type=workflow_request.workflow_type,
                status="completed",
                result=result,
                timestamp=timestamp
            )
            
            self.workflow_results[execution_id] = workflow_result
            self.workflow_status[execution_id] = "completed"
            
            # Broadcast completion
            await self.broadcast_message({
                "type": "workflow_completed",
                "execution_id": execution_id,
                "result": result
            })
            
            return workflow_result
            
        except Exception as e:
            error_message = str(e)
            logger.error(f"Workflow execution failed: {error_message}")
            
            workflow_result = WorkflowResult(
                execution_id=execution_id,
                workflow_type=workflow_request.workflow_type,
                status="failed",
                error=error_message,
                timestamp=timestamp
            )
            
            self.workflow_results[execution_id] = workflow_result
            self.workflow_status[execution_id] = "failed"
            
            # Broadcast failure
            await self.broadcast_message({
                "type": "workflow_failed",
                "execution_id": execution_id,
                "error": error_message
            })
            
            return workflow_result
    
    async def _execute_founder_signal(self, request: WorkflowRequest) -> Dict[str, Any]:
        """Execute founder signal workflow"""
        try:
            result = await process_founder_signal_deck(request.parameters)
            return result
        except Exception as e:
            logger.error(f"Founder signal execution failed: {e}")
            return {"error": str(e)}
    
    async def _execute_due_diligence(self, request: WorkflowRequest) -> Dict[str, Any]:
        """Execute due diligence workflow"""
        try:
            result = await process_due_diligence_data_room(request.parameters)
            return result
        except Exception as e:
            logger.error(f"Due diligence execution failed: {e}")
            return {"error": str(e)}
    
    async def _execute_rag_workflow(self, request: WorkflowRequest) -> Dict[str, Any]:
        """Execute RAG-based workflow"""
        try:
            if not self.rag_engine:
                return {"error": "RAG Engine not available"}
            
            # Use RAG engine to process the workflow
            query = request.parameters.get('query', f"Process {request.workflow_type} workflow")
            result = await self.rag_engine.query(query, request.parameters)
            return {"rag_result": result, "parameters": request.parameters}
        except Exception as e:
            logger.error(f"RAG workflow execution failed: {e}")
            return {"error": str(e)}
    
    def get_status(self) -> BackendStatus:
        """Get current backend status"""
        return BackendStatus(
            service="VERSSAI Unified Backend",
            version="4.0.0",
            status="running",
            timestamp=datetime.now(),
            available_services=AI_SERVICES_AVAILABLE,
            database_status="available" if DATABASE_AVAILABLE else "not_available",
            rag_engine_status="available" if RAG_ENGINE_AVAILABLE else "not_available"
        )

# Initialize the unified backend manager
backend_manager = UnifiedBackendManager()

# ==================== API ENDPOINTS ====================

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "VERSSAI Unified Backend",
        "version": "4.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "available_services": AI_SERVICES_AVAILABLE,
        "endpoints": {
            "health": "/health",
            "status": "/status",
            "workflows": "/api/workflows",
            "websocket": "/ws/{client_id}"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/status", response_model=BackendStatus)
async def get_status():
    """Get detailed backend status"""
    return backend_manager.get_status()

@app.post("/api/workflows/execute", response_model=WorkflowResult)
async def execute_workflow(workflow_request: WorkflowRequest, background_tasks: BackgroundTasks):
    """Execute a workflow"""
    return await backend_manager.execute_workflow(workflow_request)

@app.get("/api/workflows/templates")
async def get_workflow_templates():
    """Get available workflow templates"""
    return {"templates": backend_manager.workflow_templates}

@app.get("/api/workflows/{execution_id}/status")
async def get_workflow_status(execution_id: str):
    """Get workflow execution status"""
    if execution_id in backend_manager.workflow_status:
        return {
            "execution_id": execution_id,
            "status": backend_manager.workflow_status[execution_id]
        }
    else:
        raise HTTPException(status_code=404, detail="Workflow not found")

@app.get("/api/workflows/{execution_id}/result", response_model=WorkflowResult)
async def get_workflow_result(execution_id: str):
    """Get workflow execution result"""
    if execution_id in backend_manager.workflow_results:
        return backend_manager.workflow_results[execution_id]
    else:
        raise HTTPException(status_code=404, detail="Workflow result not found")

# RAG/Query endpoints
@app.post("/api/query")
async def query_rag(query_request: QueryRequest):
    """Query the RAG engine"""
    if not backend_manager.rag_engine:
        raise HTTPException(status_code=503, detail="RAG engine not available")
    
    try:
        if AI_SERVICES_AVAILABLE.get('rag'):
            result = await query_multi_level(
                query_request.query,
                query_request.query_type,
                query_request.filters,
                query_request.limit
            )
        else:
            result = await backend_manager.rag_engine.query(
                query_request.query,
                query_request.filters
            )
        
        return {"query": query_request.query, "result": result}
    except Exception as e:
        logger.error(f"RAG query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# File upload endpoints
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file"""
    if not config.UPLOAD_PATH.exists():
        config.UPLOAD_PATH.mkdir(parents=True, exist_ok=True)
    
    if file.size > config.MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large")
    
    file_id = str(uuid.uuid4())
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
    stored_filename = f"{file_id}.{file_extension}" if file_extension else file_id
    file_path = config.UPLOAD_PATH / stored_filename
    
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return {
            "file_id": file_id,
            "filename": file.filename,
            "stored_filename": stored_filename,
            "size": len(content),
            "upload_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"File upload failed: {e}")
        raise HTTPException(status_code=500, detail="File upload failed")

# ==================== GEMINI AI ENDPOINTS ====================

class GeminiAnalysisRequest(BaseModel):
    prompt: str
    system_prompt: Optional[str] = None
    max_tokens: int = 4000
    temperature: float = 0.7

class PitchDeckAnalysisRequest(BaseModel):
    text_content: str
    company_name: str = "Unknown"

class FounderAnalysisRequest(BaseModel):
    founder_data: Dict[str, Any]

class MarketAnalysisRequest(BaseModel):
    company_sector: str
    company_description: str

@app.get("/api/gemini/status")
async def get_gemini_status():
    """Get Gemini AI service status"""
    if not AI_SERVICES_AVAILABLE.get('gemini'):
        raise HTTPException(status_code=503, detail="Gemini AI service not available")
    
    return gemini_service.get_status()

@app.post("/api/gemini/analyze")
async def gemini_analysis(request: GeminiAnalysisRequest):
    """General Gemini AI analysis"""
    if not AI_SERVICES_AVAILABLE.get('gemini'):
        raise HTTPException(status_code=503, detail="Gemini AI service not available")
    
    try:
        result = await gemini_service.generate_text(
            request.prompt,
            system_prompt=request.system_prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        return {
            "status": "success",
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Gemini analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/gemini/analyze-pitch-deck")
async def analyze_pitch_deck_gemini(request: PitchDeckAnalysisRequest):
    """Analyze pitch deck using Gemini"""
    if not AI_SERVICES_AVAILABLE.get('gemini'):
        raise HTTPException(status_code=503, detail="Gemini AI service not available")
    
    try:
        analysis = await gemini_service.analyze_pitch_deck(
            request.text_content, 
            request.company_name
        )
        return {
            "status": "success",
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Gemini pitch deck analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/gemini/analyze-founder")
async def analyze_founder_gemini(request: FounderAnalysisRequest):
    """Analyze founder profile using Gemini"""
    if not AI_SERVICES_AVAILABLE.get('gemini'):
        raise HTTPException(status_code=503, detail="Gemini AI service not available")
    
    try:
        analysis = await gemini_service.analyze_founder_profile(request.founder_data)
        return {
            "status": "success",
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Gemini founder analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/gemini/analyze-market")
async def analyze_market_gemini(request: MarketAnalysisRequest):
    """Analyze market using Gemini"""
    if not AI_SERVICES_AVAILABLE.get('gemini'):
        raise HTTPException(status_code=503, detail="Gemini AI service not available")
    
    try:
        analysis = await gemini_service.generate_market_analysis(
            request.company_sector,
            request.company_description
        )
        return {
            "status": "success",
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Gemini market analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/gemini/generate-memo")
async def generate_investment_memo_gemini(analysis_data: Dict[str, Any], company_name: str):
    """Generate investment memo using Gemini"""
    if not AI_SERVICES_AVAILABLE.get('gemini'):
        raise HTTPException(status_code=503, detail="Gemini AI service not available")
    
    try:
        memo = await gemini_service.generate_investment_memo(analysis_data, company_name)
        return {
            "status": "success",
            "memo": memo,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Gemini investment memo generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket endpoint
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time communication"""
    await backend_manager.connect_websocket(websocket, client_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                logger.info(f"Received message from {client_id}: {message}")
                
                # Handle different message types
                if message.get("type") == "ping":
                    await websocket.send_json({"type": "pong", "timestamp": datetime.now().isoformat()})
                elif message.get("type") == "workflow_request":
                    # Handle workflow request via WebSocket
                    workflow_request = WorkflowRequest(**message.get("data", {}))
                    result = await backend_manager.execute_workflow(workflow_request)
                    await websocket.send_json({
                        "type": "workflow_result",
                        "data": result.dict()
                    })
                else:
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Unknown message type: {message.get('type')}"
                    })
                    
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON format"
                })
            except Exception as e:
                await websocket.send_json({
                    "type": "error",
                    "message": str(e)
                })
                
    except WebSocketDisconnect:
        await backend_manager.disconnect_websocket(client_id)
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {e}")
        await backend_manager.disconnect_websocket(client_id)

# ==================== STARTUP EVENT ====================

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("🚀 Starting VERSSAI Unified Backend...")
    logger.info(f"Available AI services: {AI_SERVICES_AVAILABLE}")
    logger.info(f"Database available: {DATABASE_AVAILABLE}")
    logger.info(f"RAG Engine available: {RAG_ENGINE_AVAILABLE}")
    logger.info(f"File Storage available: {FILE_STORAGE_AVAILABLE}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🔄 Shutting down VERSSAI Unified Backend...")
    # Close WebSocket connections
    for client_id, websocket in backend_manager.active_connections.items():
        try:
            await websocket.close()
        except:
            pass

# ==================== MAIN ====================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="VERSSAI Unified Backend")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind to")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload")
    parser.add_argument("--log-level", default="info", choices=["debug", "info", "warning", "error"])
    
    args = parser.parse_args()
    
    print("🚀 Starting VERSSAI Unified Backend...")
    print(f"🌐 Server will run on http://{args.host}:{args.port}")
    print(f"📁 Upload path: {config.UPLOAD_PATH}")
    print(f"🔧 Available services: {AI_SERVICES_AVAILABLE}")
    
    uvicorn.run(
        "verssai_unified_backend:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level=args.log_level
    )