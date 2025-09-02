# Enhanced VERSSAI Server with 3-Layer RAG and Advanced MCP Integration
# File: backend/enhanced_verssai_server.py

import os
import asyncio
import logging
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from contextlib import asynccontextmanager

# FastAPI and dependencies
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, BackgroundTasks, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field

# Database imports
import psycopg2
from psycopg2.extras import RealDictCursor
import chromadb
from chromadb.config import Settings

# Import our enhanced services
from enhanced_rag_service import enhanced_rag_service, RAGQuery, RAGResponse
from enhanced_mcp_n8n_service import enhanced_mcp_service, WorkflowType, UserRole

# Import existing services for backward compatibility
try:
    from ai_agents import VCIntelligenceOrchestrator
    from autonomous_agents import AutonomousVCAgent
except ImportError:
    # Fallback if old services aren't available
    class VCIntelligenceOrchestrator:
        def __init__(self): pass
    class AutonomousVCAgent:
        def __init__(self): pass

# Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models for enhanced API
class WorkflowTriggerRequest(BaseModel):
    workflow_type: str = Field(..., description="Type of workflow to trigger")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Workflow parameters")
    rag_layer: Optional[str] = Field("vc", description="RAG layer to use (roof, vc, startup)")
    priority: Optional[str] = Field("normal", description="Execution priority")

class RAGQueryRequest(BaseModel):
    query: str = Field(..., description="Query text")
    layer: Optional[str] = Field("vc", description="RAG layer (roof, vc, startup)")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional context")
    filters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Search filters")
    max_results: Optional[int] = Field(5, description="Maximum number of results")

class DocumentIngestionRequest(BaseModel):
    content: str = Field(..., description="Document content")
    metadata: Dict[str, Any] = Field(..., description="Document metadata")
    collection: str = Field(..., description="Target collection")
    layer: Optional[str] = Field(None, description="Target layer (auto-detected if None)")

class UserSessionRequest(BaseModel):
    user_id: str = Field(..., description="User identifier")
    organization_id: str = Field(..., description="Organization identifier")
    role: str = Field(..., description="User role")
    preferences: Optional[Dict[str, Any]] = Field(default_factory=dict)

# Enhanced FastAPI app with lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    logger.info("🚀 Starting Enhanced VERSSAI Server...")
    
    # Initialize services
    try:
        await enhanced_rag_service.initialize()
        logger.info("✅ Enhanced RAG Service initialized")
    except Exception as e:
        logger.error(f"❌ Failed to initialize RAG Service: {e}")
        raise
    
    # Additional initialization can go here
    logger.info("🎉 Enhanced VERSSAI Server started successfully")
    
    yield
    
    # Cleanup on shutdown
    logger.info("🛑 Shutting down Enhanced VERSSAI Server...")

# Create FastAPI app
app = FastAPI(
    title="Enhanced VERSSAI VC Intelligence Platform",
    description="Advanced venture capital intelligence with 3-layer RAG and MCP integration",
    version="3.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Global state for user sessions
active_user_sessions: Dict[str, Dict[str, Any]] = {}

# === AUTHENTICATION & MIDDLEWARE ===

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract user information from JWT token"""
    # For demo purposes, return mock user
    # In production, implement proper JWT validation
    return {
        "user_id": "user_123",
        "organization_id": "org_1", 
        "role": "SuperAdmin",
        "permissions": ["*"]
    }

# === ENHANCED API ENDPOINTS ===

@app.get("/health")
async def health_check():
    """Enhanced health check with service status"""
    try:
        # Check RAG service
        rag_stats = await enhanced_rag_service.get_global_stats()
        
        # Check MCP service
        mcp_connections = await enhanced_mcp_service.get_active_connections_count()
        mcp_executions = await enhanced_mcp_service.get_active_executions_count()
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "3.0.0",
            "services": {
                "rag_service": {
                    "status": "active",
                    "layers": len(enhanced_rag_service.layers),
                    "total_queries": rag_stats.get("total_queries", 0)
                },
                "mcp_service": {
                    "status": "active",
                    "active_connections": mcp_connections,
                    "active_executions": mcp_executions
                }
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )

@app.post("/api/v1/workflows/trigger")
async def trigger_workflow(
    request: WorkflowTriggerRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Trigger enhanced workflow with 3-layer RAG integration"""
    try:
        # Validate workflow type
        try:
            workflow_type = WorkflowType(request.workflow_type)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid workflow type: {request.workflow_type}"
            )
        
        # Create execution via MCP service
        # Note: This would normally be done via WebSocket, but we'll simulate for HTTP API
        execution_id = str(uuid.uuid4())
        
        # Prepare enhanced parameters
        enhanced_parameters = {
            **request.parameters,
            "api_trigger": True,
            "rag_layer": request.rag_layer,
            "priority": request.priority,
            "triggered_by": current_user["user_id"]
        }
        
        # Start background task for workflow execution
        background_task = BackgroundTasks()
        background_task.add_task(
            _execute_workflow_background,
            execution_id,
            workflow_type,
            enhanced_parameters,
            current_user
        )
        
        return {
            "execution_id": execution_id,
            "workflow_type": request.workflow_type,
            "status": "pending",
            "estimated_completion": datetime.now() + timedelta(minutes=10),
            "rag_layer": request.rag_layer,
            "message": "Workflow triggered successfully. Use WebSocket or polling to track progress."
        }
        
    except Exception as e:
        logger.error(f"Error triggering workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/rag/query")
async def rag_query(
    request: RAGQueryRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Enhanced RAG query with layer routing"""
    try:
        # Create RAG query
        rag_query = RAGQuery(
            query=request.query,
            layer=request.layer,
            user_id=current_user["user_id"],
            organization_id=current_user["organization_id"],
            context=request.context,
            filters=request.filters
        )
        
        # Execute query
        response = await enhanced_rag_service.query(rag_query)
        
        return {
            "answer": response.answer,
            "confidence": response.confidence,
            "layer_used": response.layer_used,
            "processing_time": response.processing_time,
            "sources": [
                {
                    "content": source["content"][:200] + "..." if len(source["content"]) > 200 else source["content"],
                    "score": source["score"],
                    "collection": source["collection"],
                    "metadata": source.get("metadata", {})
                }
                for source in response.sources[:request.max_results]
            ],
            "tokens_used": response.tokens_used,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in RAG query: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/documents/ingest")
async def ingest_document(
    request: DocumentIngestionRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Ingest document into appropriate RAG layer"""
    try:
        # Add user and organization metadata
        enhanced_metadata = {
            **request.metadata,
            "ingested_by": current_user["user_id"],
            "organization_id": current_user["organization_id"],
            "ingested_at": datetime.now().isoformat()
        }
        
        # Ingest document
        document_id = await enhanced_rag_service.add_document(
            content=request.content,
            metadata=enhanced_metadata,
            collection=request.collection,
            layer=request.layer
        )
        
        return {
            "document_id": document_id,
            "collection": request.collection,
            "layer": request.layer or "auto-detected",
            "status": "ingested",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error ingesting document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/rag/layers/{layer_id}/stats")
async def get_rag_layer_stats(
    layer_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get statistics for a specific RAG layer"""
    try:
        if layer_id not in ["roof", "vc", "startup"]:
            raise HTTPException(status_code=400, detail="Invalid layer ID")
        
        stats = await enhanced_rag_service.get_layer_stats(layer_id)
        return stats
        
    except Exception as e:
        logger.error(f"Error getting layer stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/rag/stats")
async def get_global_rag_stats(current_user: Dict = Depends(get_current_user)):
    """Get global RAG service statistics"""
    try:
        stats = await enhanced_rag_service.get_global_stats()
        return stats
    except Exception as e:
        logger.error(f"Error getting global stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# === WEBSOCKET ENDPOINTS ===

@app.websocket("/ws/mcp")
async def websocket_mcp_endpoint(websocket: WebSocket):
    """Enhanced MCP WebSocket endpoint"""
    try:
        # Extract user info from query parameters or headers
        # In production, implement proper authentication
        user_id = websocket.query_params.get("user_id", "anonymous")
        organization_id = websocket.query_params.get("organization_id", "default")
        
        await enhanced_mcp_service.connect_websocket(websocket, user_id, organization_id)
        
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")

@app.websocket("/ws/rag")
async def websocket_rag_endpoint(websocket: WebSocket):
    """Real-time RAG query WebSocket"""
    await websocket.accept()
    try:
        while True:
            # Receive query
            data = await websocket.receive_text()
            query_data = json.loads(data)
            
            # Create RAG query
            rag_query = RAGQuery(
                query=query_data["query"],
                layer=query_data.get("layer", "vc"),
                user_id=query_data.get("user_id", "anonymous"),
                organization_id=query_data.get("organization_id", "default"),
                context=query_data.get("context", {}),
                filters=query_data.get("filters", {})
            )
            
            # Execute and send response
            response = await enhanced_rag_service.query(rag_query)
            
            await websocket.send_text(json.dumps({
                "type": "rag_response",
                "data": {
                    "answer": response.answer,
                    "confidence": response.confidence,
                    "layer_used": response.layer_used,
                    "processing_time": response.processing_time
                }
            }))
            
    except WebSocketDisconnect:
        logger.info("RAG WebSocket disconnected")

# === MULTI-TENANT ENDPOINTS ===

@app.post("/api/v1/sessions")
async def create_user_session(request: UserSessionRequest):
    """Create or update user session"""
    try:
        session_id = f"{request.user_id}_{request.organization_id}_{uuid.uuid4().hex[:8]}"
        
        active_user_sessions[session_id] = {
            "user_id": request.user_id,
            "organization_id": request.organization_id,
            "role": request.role,
            "preferences": request.preferences,
            "created_at": datetime.now(),
            "last_activity": datetime.now()
        }
        
        return {
            "session_id": session_id,
            "status": "created",
            "expires_at": datetime.now() + timedelta(hours=24)
        }
        
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/organizations/{org_id}/stats")
async def get_organization_stats(
    org_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get organization-specific statistics"""
    try:
        # In production, verify user has access to this organization
        
        # Mock organization stats
        return {
            "organization_id": org_id,
            "users_count": 15,
            "workflows_executed": 145,
            "rag_queries": 2340,
            "storage_used": "2.4 GB",
            "last_activity": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting organization stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# === BACKGROUND TASKS ===

async def _execute_workflow_background(
    execution_id: str,
    workflow_type: WorkflowType,
    parameters: Dict[str, Any],
    user: Dict[str, Any]
):
    """Background task for workflow execution"""
    try:
        logger.info(f"Executing workflow {execution_id} of type {workflow_type.value}")
        
        # This would integrate with the MCP service for actual execution
        # For now, we'll simulate the workflow
        
        await asyncio.sleep(5)  # Simulate processing time
        
        logger.info(f"Workflow {execution_id} completed successfully")
        
    except Exception as e:
        logger.error(f"Background workflow {execution_id} failed: {e}")

# === LEGACY COMPATIBILITY ENDPOINTS ===

@app.get("/api/legacy/health")
async def legacy_health_check():
    """Legacy health check for backward compatibility"""
    return {"status": "healthy", "version": "2.0.0", "legacy": True}

# === STARTUP EVENT ===

@app.on_event("startup")
async def startup_event():
    """Additional startup tasks"""
    logger.info("Enhanced VERSSAI server startup complete")

if __name__ == "__main__":
    import uvicorn
    
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8080"))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    logger.info(f"Starting Enhanced VERSSAI Server on {host}:{port}")
    
    uvicorn.run(
        "enhanced_verssai_server:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )
