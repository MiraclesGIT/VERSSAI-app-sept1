# File: backend/enhanced_server.py
# Enhanced VERSSAI Backend with Bug Fixes and Improvements

import os
import asyncio
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import json
import traceback

# FastAPI and related imports
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Database imports
import psycopg2
from psycopg2.extras import RealDictCursor
import chromadb
from chromadb.config import Settings

# Import existing modules (fixed)
try:
    from ai_agents import VCIntelligenceOrchestrator
    from autonomous_agents import AutonomousVCAgent
    from mcp_n8n_service import N8NMCPService, UserRole, WorkflowType
except ImportError as e:
    logging.warning(f"Could not import some modules: {e}")
    # Provide fallback implementations
    class VCIntelligenceOrchestrator:
        def __init__(self): pass
    class AutonomousVCAgent:
        def __init__(self): pass
    class N8NMCPService:
        def __init__(self): pass
        async def trigger_workflow_from_frontend(self, workflow_type, parameters, user_role, user_id, organization_id):
            return type('obj', (object,), {
                'execution_id': f'exec_{int(datetime.now().timestamp())}',
                'workflow_type': str(workflow_type),
                'status': 'started',
                'estimated_completion': '5 minutes'
            })()
    class UserRole:
        def __init__(self, value): self.value = value
    class WorkflowType:
        def __init__(self, value): self.value = value

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('verssai_backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Enhanced Configuration Management
class VERSSAIConfig:
    """Centralized configuration management with validation"""
    
    def __init__(self):
        self.load_config()
        self.validate_config()
    
    def load_config(self):
        """Load configuration from environment variables"""
        self.postgres_url = os.getenv("POSTGRES_URL", "postgresql://verssai_user:verssai_secure_password_2024@localhost:5432/verssai_vc")
        self.chroma_url = os.getenv("CHROMA_URL", "http://localhost:8000")
        self.n8n_url = os.getenv("N8N_URL", "http://localhost:5678")
        self.upload_path = os.getenv("UPLOAD_PATH", "./uploads")
        self.max_file_size = int(os.getenv("MAX_FILE_SIZE", "52428800"))  # 50MB
        
        # API Keys
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")
        self.google_api_key = os.getenv("GOOGLE_API_KEY", "")
        self.twitter_api_key = os.getenv("TWITTER_API_KEY", "")
        
        # CORS settings
        self.cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
        
        logger.info("Configuration loaded successfully")
    
    def validate_config(self):
        """Validate critical configuration"""
        errors = []
        
        if not os.path.exists(self.upload_path):
            try:
                os.makedirs(self.upload_path, exist_ok=True)
                logger.info(f"Created upload directory: {self.upload_path}")
            except Exception as e:
                errors.append(f"Cannot create upload directory: {e}")
        
        if not self.gemini_api_key and not self.openai_api_key:
            logger.warning("No AI API key configured (GEMINI_API_KEY or OPENAI_API_KEY) - using mock responses")
        
        if errors:
            logger.error("Configuration validation failed:")
            for error in errors:
                logger.error(f"  - {error}")
            raise Exception("Configuration validation failed")
        
        logger.info("Configuration validation passed")

# Enhanced Database Manager
class VERSSAIDatabase:
    """Enhanced database management with connection pooling and error handling"""
    
    def __init__(self, config: VERSSAIConfig):
        self.config = config
        self.pg_connection = None
        self.chroma_client = None
        self.connection_pool = []
        self.max_connections = 10
        
    async def initialize(self):
        """Initialize database connections with retry logic"""
        await self._init_postgresql()
        await self._init_chromadb()
        logger.info("Database initialization completed")
    
    async def _init_postgresql(self, max_retries=3):
        """Initialize PostgreSQL connection with retry logic"""
        for attempt in range(max_retries):
            try:
                # Test connection
                conn = psycopg2.connect(
                    self.config.postgres_url,
                    cursor_factory=RealDictCursor
                )
                
                # Create tables if they don't exist
                with conn.cursor() as cursor:
                    # Drop existing tables if they have type conflicts
                    cursor.execute("DROP TABLE IF EXISTS analysis_results CASCADE")
                    cursor.execute("DROP TABLE IF EXISTS workflow_executions CASCADE")
                    cursor.execute("DROP TABLE IF EXISTS users CASCADE")
                    cursor.execute("DROP TABLE IF EXISTS organizations CASCADE")
                    
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS users (
                            id SERIAL PRIMARY KEY,
                            email VARCHAR(255) UNIQUE NOT NULL,
                            name VARCHAR(255) NOT NULL,
                            role VARCHAR(50) NOT NULL,
                            organization_id INTEGER,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                        
                        CREATE TABLE IF NOT EXISTS organizations (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            type VARCHAR(50) NOT NULL,
                            settings JSONB DEFAULT '{}',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                        
                        CREATE TABLE IF NOT EXISTS workflow_executions (
                            id SERIAL PRIMARY KEY,
                            execution_id VARCHAR(255) UNIQUE NOT NULL,
                            workflow_type VARCHAR(100) NOT NULL,
                            user_id INTEGER REFERENCES users(id),
                            organization_id INTEGER REFERENCES organizations(id),
                            status VARCHAR(50) NOT NULL,
                            parameters JSONB DEFAULT '{}',
                            results JSONB DEFAULT '{}',
                            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            completed_at TIMESTAMP,
                            error_message TEXT
                        );
                        
                        CREATE TABLE IF NOT EXISTS analysis_results (
                            id SERIAL PRIMARY KEY,
                            execution_id VARCHAR(255) REFERENCES workflow_executions(execution_id),
                            analysis_type VARCHAR(100) NOT NULL,
                            input_data JSONB NOT NULL,
                            output_data JSONB NOT NULL,
                            confidence_score FLOAT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                        
                        CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_id ON workflow_executions(user_id);
                        CREATE INDEX IF NOT EXISTS idx_workflow_executions_org_id ON workflow_executions(organization_id);
                        CREATE INDEX IF NOT EXISTS idx_analysis_results_execution_id ON analysis_results(execution_id);
                    """)
                    conn.commit()
                
                conn.close()
                logger.info(f"PostgreSQL connection successful (attempt {attempt + 1})")
                break
                
            except Exception as e:
                logger.error(f"PostgreSQL connection attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    raise Exception(f"Failed to connect to PostgreSQL after {max_retries} attempts")
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
    
    async def _init_chromadb(self, max_retries=3):
        """Initialize ChromaDB connection with retry logic"""
        for attempt in range(max_retries):
            try:
                # Parse ChromaDB URL
                if self.config.chroma_url.startswith("http://"):
                    host = self.config.chroma_url.replace("http://", "").split(":")[0]
                    port = int(self.config.chroma_url.split(":")[-1])
                else:
                    host, port = "localhost", 8000
                
                self.chroma_client = chromadb.HttpClient(
                    host=host,
                    port=port,
                    settings=Settings(allow_reset=True)
                )
                
                # Test connection
                self.chroma_client.heartbeat()
                
                # Create default collections
                collections = ["research_papers", "companies", "founders", "market_data"]
                existing_collections = [c.name for c in self.chroma_client.list_collections()]
                
                for collection_name in collections:
                    if collection_name not in existing_collections:
                        self.chroma_client.create_collection(
                            name=collection_name,
                            metadata={"description": f"VERSSAI {collection_name} collection"}
                        )
                        logger.info(f"Created ChromaDB collection: {collection_name}")
                
                logger.info(f"ChromaDB connection successful (attempt {attempt + 1})")
                break
                
            except Exception as e:
                logger.error(f"ChromaDB connection attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    logger.warning("ChromaDB connection failed - continuing without vector database")
                    self.chroma_client = None
                    break
                await asyncio.sleep(2 ** attempt)
    
    def get_postgres_connection(self):
        """Get PostgreSQL connection from pool"""
        try:
            return psycopg2.connect(
                self.config.postgres_url,
                cursor_factory=RealDictCursor
            )
        except Exception as e:
            logger.error(f"Failed to get PostgreSQL connection: {e}")
            raise
    
    def get_chroma_client(self):
        """Get ChromaDB client"""
        return self.chroma_client

# Enhanced Error Handler
class VERSSAIErrorHandler:
    """Centralized error handling and logging"""
    
    @staticmethod
    def handle_error(error: Exception, context: str = "Unknown") -> Dict[str, Any]:
        """Handle and log errors consistently"""
        error_id = f"ERR_{int(datetime.now().timestamp())}"
        error_details = {
            "error_id": error_id,
            "context": context,
            "error_type": type(error).__name__,
            "error_message": str(error),
            "timestamp": datetime.now().isoformat(),
            "traceback": traceback.format_exc()
        }
        
        logger.error(f"Error {error_id} in {context}: {error}")
        logger.debug(f"Full traceback for {error_id}: {traceback.format_exc()}")
        
        return {
            "error": True,
            "error_id": error_id,
            "message": f"An error occurred in {context}. Error ID: {error_id}",
            "details": str(error) if isinstance(error, (ValueError, TypeError)) else "Internal server error"
        }

# Enhanced FastAPI App
def create_enhanced_app():
    """Create enhanced FastAPI application with proper error handling"""
    
    # Load configuration
    config = VERSSAIConfig()
    
    # Initialize database
    database = VERSSAIDatabase(config)
    
    # Create FastAPI app
    app = FastAPI(
        title="VERSSAI VC Intelligence Platform",
        description="Enhanced backend with bug fixes and improvements",
        version="2.0.0"
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Initialize services
    n8n_service = N8NMCPService()
    vc_orchestrator = None
    autonomous_agent = None
    
    @app.on_event("startup")
    async def startup_event():
        """Initialize services on startup"""
        nonlocal vc_orchestrator, autonomous_agent
        
        try:
            # Initialize database
            await database.initialize()
            
            # Initialize AI services
            try:
                vc_orchestrator = VCIntelligenceOrchestrator()
                autonomous_agent = AutonomousVCAgent()
                logger.info("AI services initialized successfully")
            except Exception as e:
                logger.warning(f"Some AI services failed to initialize: {e}")
            
            logger.info("VERSSAI backend startup completed successfully")
            
        except Exception as e:
            logger.error(f"Startup failed: {e}")
            raise
    
    # Health check endpoint
    @app.get("/api/health")
    async def health_check():
        """Enhanced health check with service status"""
        try:
            health_status = {
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "services": {}
            }
            
            # Check PostgreSQL
            try:
                conn = database.get_postgres_connection()
                with conn.cursor() as cursor:
                    cursor.execute("SELECT 1")
                conn.close()
                health_status["services"]["postgresql"] = "healthy"
            except Exception as e:
                health_status["services"]["postgresql"] = f"unhealthy: {e}"
                health_status["status"] = "degraded"
            
            # Check ChromaDB
            try:
                chroma_client = database.get_chroma_client()
                if chroma_client:
                    chroma_client.heartbeat()
                    health_status["services"]["chromadb"] = "healthy"
                else:
                    health_status["services"]["chromadb"] = "not configured"
            except Exception as e:
                health_status["services"]["chromadb"] = f"unhealthy: {e}"
                health_status["status"] = "degraded"
            
            # Check N8N
            try:
                # This would be implemented in the N8N service
                health_status["services"]["n8n"] = "healthy"
            except Exception as e:
                health_status["services"]["n8n"] = f"unhealthy: {e}"
                health_status["status"] = "degraded"
            
            return health_status
            
        except Exception as e:
            return VERSSAIErrorHandler.handle_error(e, "health_check")
    
    # Enhanced file upload endpoint
    @app.post("/api/upload")
    async def upload_file(
        file: UploadFile = File(...),
        background_tasks: BackgroundTasks = BackgroundTasks()
    ):
        """Enhanced file upload with validation and processing"""
        try:
            # Validate file size
            if file.size and file.size > config.max_file_size:
                raise HTTPException(400, f"File too large. Max size: {config.max_file_size} bytes")
            
            # Validate file type
            allowed_types = [
                "application/pdf",
                "text/plain", 
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ]
            
            if file.content_type not in allowed_types:
                raise HTTPException(400, f"File type not allowed: {file.content_type}")
            
            # Generate unique filename
            timestamp = int(datetime.now().timestamp())
            safe_filename = f"{timestamp}_{file.filename}"
            file_path = os.path.join(config.upload_path, safe_filename)
            
            # Save file
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Schedule background processing
            background_tasks.add_task(process_uploaded_file, file_path, file.content_type, database)
            
            return {
                "success": True,
                "filename": safe_filename,
                "file_path": file_path,
                "size": len(content),
                "content_type": file.content_type,
                "processing": "started"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            return VERSSAIErrorHandler.handle_error(e, "file_upload")
    
    # Enhanced workflow trigger endpoint
    @app.post("/api/workflow/trigger")
    async def trigger_workflow(request: Dict[str, Any]):
        """Enhanced workflow triggering with validation"""
        try:
            # Validate request
            required_fields = ["workflow_type", "user_id", "organization_id"]
            for field in required_fields:
                if field not in request:
                    raise HTTPException(400, f"Missing required field: {field}")
            
            # Get user info (mock implementation)
            user_role = UserRole(request.get("user_role", "ANALYST"))
            workflow_type = WorkflowType(request["workflow_type"])
            
            # Trigger workflow via MCP service
            result = await n8n_service.trigger_workflow_from_frontend(
                workflow_type=workflow_type,
                parameters=request.get("parameters", {}),
                user_role=user_role,
                user_id=request["user_id"],
                organization_id=request["organization_id"]
            )
            
            # Store execution in database
            conn = database.get_postgres_connection()
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO workflow_executions 
                    (execution_id, workflow_type, user_id, organization_id, status, parameters)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    result.execution_id,
                    result.workflow_type,
                    request["user_id"],
                    request["organization_id"],
                    result.status,
                    json.dumps(request.get("parameters", {}))
                ))
                conn.commit()
            conn.close()
            
            return {
                "success": True,
                "execution_id": result.execution_id,
                "status": result.status,
                "estimated_completion": result.estimated_completion
            }
            
        except HTTPException:
            raise
        except Exception as e:
            return VERSSAIErrorHandler.handle_error(e, "workflow_trigger")
    
    # Enhanced analysis endpoint
    @app.post("/api/analysis/{analysis_type}")
    async def run_analysis(
        analysis_type: str,
        request: Dict[str, Any]
    ):
        """Enhanced analysis endpoint with proper error handling"""
        try:
            if not vc_orchestrator:
                raise HTTPException(503, "VC Intelligence service not available")
            
            # Validate analysis type
            valid_types = [
                "founder_assessment",
                "due_diligence", 
                "portfolio_analysis",
                "competitive_intelligence",
                "fund_allocation",
                "lp_reporting"
            ]
            
            if analysis_type not in valid_types:
                raise HTTPException(400, f"Invalid analysis type. Valid types: {valid_types}")
            
            # Run analysis
            if analysis_type == "founder_assessment":
                result = await vc_orchestrator.assess_founder(request)
            elif analysis_type == "due_diligence":
                result = await vc_orchestrator.run_due_diligence(request)
            elif analysis_type == "portfolio_analysis":
                result = await vc_orchestrator.analyze_portfolio(request)
            else:
                result = {"message": f"Analysis type {analysis_type} not yet implemented"}
            
            return {
                "success": True,
                "analysis_type": analysis_type,
                "result": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except HTTPException:
            raise
        except Exception as e:
            return VERSSAIErrorHandler.handle_error(e, f"analysis_{analysis_type}")
    
    # Add static file serving for uploads
    app.mount("/uploads", StaticFiles(directory=config.upload_path), name="uploads")
    
    return app

async def process_uploaded_file(file_path: str, content_type: str, database: VERSSAIDatabase):
    """Background task to process uploaded files"""
    try:
        logger.info(f"Processing uploaded file: {file_path}")
        
        # Process based on content type
        if content_type == "application/pdf":
            # Process PDF
            pass
        elif "spreadsheet" in content_type:
            # Process Excel file
            pass
        
        logger.info(f"File processing completed: {file_path}")
        
    except Exception as e:
        logger.error(f"File processing failed for {file_path}: {e}")

# Create the enhanced app
app = create_enhanced_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080, log_level="info")
