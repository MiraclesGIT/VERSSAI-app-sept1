#!/usr/bin/env python3
"""
Enhanced VERSSAI Backend API Server
Supports RAG layers, document upload, N8N integration, and MCP protocol
"""

import os
import uuid
import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Optional, Any
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import aiofiles
import httpx
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import chromadb
from chromadb.utils import embedding_functions

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://verssai_user:verssai_password@localhost:5432/verssai_db")
CHROMADB_URL = os.getenv("CHROMADB_URL", "http://localhost:8000")
N8N_URL = os.getenv("N8N_URL", "http://localhost:5678")
UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="VERSSAI Enhanced API",
    description="VC Intelligence Platform with RAG, N8N, and MCP Integration",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ChromaDB setup
chroma_client = chromadb.HttpClient(host="localhost", port=8000)
sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# Pydantic Models
class WorkflowTriggerRequest(BaseModel):
    workflow_type: str
    company_id: str
    rag_layer: str
    user_id: str
    parameters: Optional[Dict[str, Any]] = None

class DocumentUploadResponse(BaseModel):
    success: bool
    message: str
    document_ids: List[str]
    rag_layer: str
    processing_status: str

class RAGQueryRequest(BaseModel):
    query: str
    rag_layer: str
    company_id: Optional[str] = None
    limit: int = 10

class RAGQueryResponse(BaseModel):
    results: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    processing_time: float

class SystemStatus(BaseModel):
    postgresql: bool
    chromadb: bool
    n8n: bool
    mcp: bool
    timestamp: datetime

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# RAG Layer Management
class RAGManager:
    def __init__(self):
        self.layers = {
            'roof': {
                'name': 'Roof Layer',
                'description': 'Global Intelligence',
                'collections': ['academic_papers', 'industry_reports', 'market_data'],
                'collection_name': 'verssai_roof_layer'
            },
            'vc': {
                'name': 'VC Layer',
                'description': 'Investor Intelligence', 
                'collections': ['deal_flow', 'portfolio_data', 'market_analysis'],
                'collection_name': 'verssai_vc_layer'
            },
            'startup': {
                'name': 'Startup Layer',
                'description': 'Founder Intelligence',
                'collections': ['founder_profiles', 'startup_metrics', 'pitch_analysis'],
                'collection_name': 'verssai_startup_layer'
            }
        }
        self._ensure_collections()
    
    def _ensure_collections(self):
        """Ensure all RAG layer collections exist"""
        for layer_id, layer_info in self.layers.items():
            try:
                chroma_client.get_collection(
                    name=layer_info['collection_name'],
                    embedding_function=sentence_transformer_ef
                )
                logger.info(f"Collection {layer_info['collection_name']} already exists")
            except Exception:
                chroma_client.create_collection(
                    name=layer_info['collection_name'],
                    embedding_function=sentence_transformer_ef
                )
                logger.info(f"Created collection {layer_info['collection_name']}")
    
    async def add_documents(self, layer_id: str, documents: List[Dict], company_id: str = None):
        """Add documents to specified RAG layer"""
        if layer_id not in self.layers:
            raise ValueError(f"Invalid layer_id: {layer_id}")
        
        collection_name = self.layers[layer_id]['collection_name']
        collection = chroma_client.get_collection(
            name=collection_name,
            embedding_function=sentence_transformer_ef
        )
        
        doc_ids = []
        doc_texts = []
        doc_metadatas = []
        
        for doc in documents:
            doc_id = str(uuid.uuid4())
            doc_ids.append(doc_id)
            doc_texts.append(doc['content'])
            
            metadata = {
                'filename': doc.get('filename', ''),
                'document_type': doc.get('document_type', 'general'),
                'company_id': company_id or '',
                'upload_time': datetime.now().isoformat(),
                'layer_id': layer_id
            }
            doc_metadatas.append(metadata)
        
        collection.add(
            documents=doc_texts,
            metadatas=doc_metadatas,
            ids=doc_ids
        )
        
        return doc_ids
    
    async def query_layer(self, layer_id: str, query: str, company_id: str = None, limit: int = 10):
        """Query specific RAG layer"""
        if layer_id not in self.layers:
            raise ValueError(f"Invalid layer_id: {layer_id}")
        
        collection_name = self.layers[layer_id]['collection_name']
        collection = chroma_client.get_collection(
            name=collection_name,
            embedding_function=sentence_transformer_ef
        )
        
        # Build where clause for company filtering
        where_clause = {}
        if company_id:
            where_clause['company_id'] = company_id
        
        results = collection.query(
            query_texts=[query],
            n_results=limit,
            where=where_clause if where_clause else None
        )
        
        return results

# Initialize RAG Manager
rag_manager = RAGManager()

# N8N Integration
class N8NManager:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.workflow_mappings = {
            'due_diligence_automation': 'due-diligence-workflow',
            'founder_signal_assessment': 'founder-signal-workflow',
            'market_intelligence': 'market-intelligence-workflow',
            'portfolio_management': 'portfolio-management-workflow',
            'fund_allocation_optimization': 'fund-allocation-workflow',
            'lp_communication_automation': 'lp-communication-workflow'
        }
    
    async def trigger_workflow(self, workflow_type: str, payload: Dict):
        """Trigger N8N workflow via webhook"""
        if workflow_type not in self.workflow_mappings:
            raise ValueError(f"Unknown workflow type: {workflow_type}")
        
        webhook_name = self.workflow_mappings[workflow_type]
        webhook_url = f"{self.base_url}/webhook/{webhook_name}"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    webhook_url,
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
            except httpx.RequestError as e:
                logger.error(f"N8N workflow trigger failed: {e}")
                raise HTTPException(status_code=503, detail=f"N8N service unavailable: {e}")
            except httpx.HTTPStatusError as e:
                logger.error(f"N8N workflow error: {e}")
                raise HTTPException(status_code=400, detail=f"Workflow execution failed: {e}")
    
    async def get_workflow_status(self, execution_id: str):
        """Get N8N workflow execution status"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/api/v1/executions/{execution_id}",
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                logger.error(f"Failed to get workflow status: {e}")
                return None

# Initialize N8N Manager
n8n_manager = N8NManager(N8N_URL)

# MCP Integration
class MCPManager:
    def __init__(self):
        self.connected = True
        self.last_ping = datetime.now()
    
    async def ping(self):
        """Check MCP service health"""
        try:
            # Simulate MCP ping
            self.last_ping = datetime.now()
            self.connected = True
            return True
        except Exception as e:
            logger.error(f"MCP ping failed: {e}")
            self.connected = False
            return False
    
    async def send_message(self, message_type: str, payload: Dict):
        """Send message via MCP protocol"""
        # Simulate MCP message sending
        logger.info(f"MCP message sent: {message_type}")
        return {"status": "sent", "message_id": str(uuid.uuid4())}

# Initialize MCP Manager
mcp_manager = MCPManager()

# API Endpoints

@app.get("/")
async def root():
    return {"message": "VERSSAI Enhanced API", "version": "2.0.0", "status": "active"}

@app.get("/api/v1/health")
async def health_check():
    """System health check"""
    # Check PostgreSQL
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        postgres_status = True
    except Exception:
        postgres_status = False
    
    # Check ChromaDB
    try:
        chroma_client.heartbeat()
        chromadb_status = True
    except Exception:
        chromadb_status = False
    
    # Check N8N
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{N8N_URL}/healthz", timeout=5.0)
            n8n_status = response.status_code == 200
    except Exception:
        n8n_status = False
    
    # Check MCP
    mcp_status = await mcp_manager.ping()
    
    return SystemStatus(
        postgresql=postgres_status,
        chromadb=chromadb_status,
        n8n=n8n_status,
        mcp=mcp_status,
        timestamp=datetime.now()
    )

@app.post("/api/v1/workflows/trigger")
async def trigger_workflow(request: WorkflowTriggerRequest, background_tasks: BackgroundTasks):
    """Trigger N8N workflow with RAG integration"""
    try:
        # Prepare payload for N8N
        payload = {
            "workflow_type": request.workflow_type,
            "company_id": request.company_id,
            "rag_layer": request.rag_layer,
            "user_id": request.user_id,
            "timestamp": datetime.now().isoformat(),
            "parameters": request.parameters or {}
        }
        
        # Add RAG context if needed
        if request.rag_layer and request.company_id:
            rag_context = await rag_manager.query_layer(
                request.rag_layer, 
                f"company_analysis {request.company_id}",
                company_id=request.company_id,
                limit=5
            )
            payload["rag_context"] = rag_context
        
        # Trigger N8N workflow
        result = await n8n_manager.trigger_workflow(request.workflow_type, payload)
        
        # Send MCP notification
        background_tasks.add_task(
            mcp_manager.send_message,
            "workflow_triggered",
            {"workflow_type": request.workflow_type, "company_id": request.company_id}
        )
        
        return {
            "success": True,
            "execution_id": result.get("execution_id"),
            "workflow_type": request.workflow_type,
            "status": "triggered",
            "message": "Workflow triggered successfully"
        }
        
    except Exception as e:
        logger.error(f"Workflow trigger failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/documents/upload")
async def upload_documents(
    files: List[UploadFile] = File(...),
    company_id: str = Form(...),
    document_type: str = Form(default="general"),
    rag_layer: str = Form(default="vc"),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Upload documents to specific RAG layer"""
    try:
        uploaded_files = []
        document_contents = []
        
        # Save files and extract content
        for file in files:
            file_id = str(uuid.uuid4())
            file_path = UPLOAD_DIR / f"{file_id}_{file.filename}"
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Extract text content (simplified - in production use proper parsers)
            if file.filename.endswith('.txt'):
                text_content = content.decode('utf-8')
            else:
                # For PDF, DOCX etc., you'd use proper parsers here
                text_content = f"Document: {file.filename}"
            
            document_contents.append({
                'content': text_content,
                'filename': file.filename,
                'document_type': document_type,
                'file_path': str(file_path)
            })
            
            uploaded_files.append({
                'file_id': file_id,
                'filename': file.filename,
                'path': str(file_path)
            })
        
        # Add to RAG layer
        document_ids = await rag_manager.add_documents(
            rag_layer, 
            document_contents, 
            company_id
        )
        
        # Background processing notification
        background_tasks.add_task(
            mcp_manager.send_message,
            "documents_uploaded",
            {
                "company_id": company_id,
                "document_count": len(files),
                "rag_layer": rag_layer
            }
        )
        
        return DocumentUploadResponse(
            success=True,
            message=f"Successfully uploaded {len(files)} documents to {rag_layer} layer",
            document_ids=document_ids,
            rag_layer=rag_layer,
            processing_status="completed"
        )
        
    except Exception as e:
        logger.error(f"Document upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/rag/query")
async def query_rag_layer(request: RAGQueryRequest):
    """Query specific RAG layer"""
    try:
        start_time = datetime.now()
        
        results = await rag_manager.query_layer(
            request.rag_layer,
            request.query,
            request.company_id,
            request.limit
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Format results
        formatted_results = []
        if results and results['documents']:
            for i, doc in enumerate(results['documents'][0]):
                formatted_results.append({
                    'content': doc,
                    'metadata': results['metadatas'][0][i],
                    'distance': results['distances'][0][i] if results['distances'] else None
                })
        
        return RAGQueryResponse(
            results=formatted_results,
            metadata={
                'layer': request.rag_layer,
                'query': request.query,
                'total_results': len(formatted_results)
            },
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"RAG query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/rag/layers")
async def get_rag_layers():
    """Get information about all RAG layers"""
    layers_info = []
    
    for layer_id, layer_info in rag_manager.layers.items():
        try:
            collection = chroma_client.get_collection(
                name=layer_info['collection_name'],
                embedding_function=sentence_transformer_ef
            )
            doc_count = collection.count()
            status = "active"
        except Exception:
            doc_count = 0
            status = "inactive"
        
        layers_info.append({
            'id': layer_id,
            'name': layer_info['name'],
            'description': layer_info['description'],
            'collections': layer_info['collections'],
            'document_count': doc_count,
            'status': status,
            'performance': {
                'accuracy': 94 + (hash(layer_id) % 5),  # Mock data
                'latency': 150 + (hash(layer_id) % 100),
                'documents': doc_count
            }
        })
    
    return {"layers": layers_info}

@app.get("/api/v1/workflows/status/{execution_id}")
async def get_workflow_status(execution_id: str):
    """Get N8N workflow execution status"""
    try:
        status = await n8n_manager.get_workflow_status(execution_id)
        return {"execution_id": execution_id, "status": status}
    except Exception as e:
        logger.error(f"Failed to get workflow status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/companies")
async def get_companies(skip: int = 0, limit: int = 100):
    """Get companies from database"""
    # Mock data - replace with actual database queries
    mock_companies = [
        {
            "id": "vistim_labs",
            "name": "Vistim Labs",
            "founder": "John Doe",
            "stage": "Series C",
            "location": "Salt Lake City, UT",
            "industry": ["AI", "Fintech"],
            "founded_date": "2021-09-01",
            "readiness_score": 81,
            "description": "MedTech diagnostic company for neurological disorders"
        },
        {
            "id": "data_harvest",
            "name": "DataHarvest", 
            "founder": "Jane Smith",
            "stage": "Seed",
            "location": "New York, NY",
            "industry": ["Finance"],
            "founded_date": "2023-10-01",
            "readiness_score": 75,
            "description": "Advanced data analytics platform for financial institutions"
        }
    ]
    
    return {"companies": mock_companies[skip:skip+limit], "total": len(mock_companies)}

@app.post("/api/v1/mcp/send")
async def send_mcp_message(message_type: str, payload: Dict):
    """Send message via MCP protocol"""
    try:
        result = await mcp_manager.send_message(message_type, payload)
        return {"success": True, "result": result}
    except Exception as e:
        logger.error(f"MCP message failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "enhanced_api_server:app",
        host="0.0.0.0", 
        port=8080,
        reload=True,
        log_level="info"
    )
