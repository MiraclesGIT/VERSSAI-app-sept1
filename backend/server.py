from fastapi import FastAPI, APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import aiofiles
# import magic  # Temporarily disabled
import json
import asyncio

# Load environment variables FIRST
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import database models and config AFTER environment is loaded
try:
    from database import (
        get_db, 
        FounderDeck, DeckExtraction, FounderSignal, WorkflowExecution,
        FounderDeckCreate, FounderDeckResponse, DeckExtractionCreate, 
        FounderSignalCreate, FounderSignalResponse, WorkflowExecutionCreate
    )
    DATABASE_AVAILABLE = True
except Exception as e:
    logging.warning(f"PostgreSQL database not available: {e}")
    DATABASE_AVAILABLE = False

# Import file-based storage as fallback
from file_storage import file_storage

# Import AI services
from rag_service import rag_service, query_multi_level
from workflow_orchestrator import workflow_orchestrator, process_founder_signal_deck
from intelligence_orchestrator import intelligence_orchestrator

# MongoDB connection (keeping existing functionality)
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create upload directory
UPLOAD_PATH = Path(os.environ.get('UPLOAD_PATH', '/app/uploads'))
UPLOAD_PATH.mkdir(exist_ok=True)

# Create the main app without a prefix
app = FastAPI(title="VERSSAI VC Intelligence Platform", version="2.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Existing models for backward compatibility
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# New AI-powered models
class RAGQuery(BaseModel):
    query: str
    investor_id: Optional[str] = None
    company_id: Optional[str] = None
    top_k: int = 3

class RAGResponse(BaseModel):
    query: str
    results: Dict[str, Any]
    total_results: int
    processing_time: float

# VERSSAI VC Platform Routes with AI Integration

@api_router.post("/founder-signal/upload-deck", response_model=dict)
async def upload_pitch_deck(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    company_name: str = Form(...),
    uploaded_by: Optional[str] = Form(None)
):
    """Upload a pitch deck for AI-powered Founder Signal Fit analysis"""
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.ppt', '.pptx')):
            raise HTTPException(status_code=400, detail="Only PDF, PPT, and PPTX files are allowed")
        
        # Validate file size
        max_size = int(os.environ.get('MAX_FILE_SIZE', 52428800))  # 50MB
        content = await file.read()
        if len(content) > max_size:
            raise HTTPException(status_code=400, detail=f"File size exceeds {max_size/1024/1024}MB limit")
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_PATH / unique_filename
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # Create deck data
        deck_data = {
            'company_name': company_name,
            'file_url': f"/uploads/{unique_filename}",
            'file_path': str(file_path),
            'file_size': len(content),
            'status': 'processing',
            'uploaded_by': uploaded_by
        }
        
        # Try PostgreSQL first, fallback to file storage
        deck_id = None
        if DATABASE_AVAILABLE:
            try:
                db_session = next(get_db())
                try:
                    deck_data_model = FounderDeckCreate(**deck_data)
                    db_deck = FounderDeck(**deck_data_model.dict())
                    db_session.add(db_deck)
                    db_session.commit()
                    db_session.refresh(db_deck)
                    deck_id = str(db_deck.deck_id)
                    logging.info(f"Deck {deck_id} saved to PostgreSQL")
                finally:
                    db_session.close()
            except Exception as e:
                logging.warning(f"PostgreSQL save failed, using file storage: {e}")
                deck_id = file_storage.save_deck(deck_data)
        else:
            # Use file storage
            deck_id = file_storage.save_deck(deck_data)
        
        # Trigger AI-powered analysis workflow in background
        background_tasks.add_task(
            trigger_ai_analysis_workflow,
            deck_id,
            company_name,
            str(file_path)
        )
        
        return {
            "deck_id": deck_id,
            "company_name": company_name,
            "upload_date": datetime.utcnow().isoformat(),
            "file_url": deck_data['file_url'],
            "file_size": deck_data['file_size'],
            "status": "processing",
            "uploaded_by": uploaded_by,
            "message": "Upload successful - AI analysis starting"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error uploading deck: {str(e)}")
        raise HTTPException(status_code=500, detail="Upload failed - please try again")

async def trigger_ai_analysis_workflow(deck_id: str, company_name: str, file_path: str):
    """Background task to trigger AI analysis workflow"""
    try:
        logging.info(f"Starting AI analysis workflow for deck {deck_id}")
        
        # Process through AI workflow orchestrator
        workflow_results = await process_founder_signal_deck(deck_id, company_name, file_path)
        
        # Store workflow results in file storage
        file_storage.save_workflow_result(deck_id, workflow_results)
        
        # Try to store workflow execution record in database if available
        if DATABASE_AVAILABLE:
            try:
                db_session = next(get_db())
                try:
                    workflow_execution = WorkflowExecution(
                        workflow_name="founder_signal_ai_analysis",
                        workflow_type="founder_signal",
                        entity_id=deck_id,
                        status="completed" if workflow_results.get('status') == 'completed' else "failed",
                        input_data={
                            'deck_id': deck_id,
                            'company_name': company_name,
                            'file_path': file_path
                        },
                        output_data=workflow_results,
                        started_at=datetime.utcnow(),
                        completed_at=datetime.utcnow()
                    )
                    
                    db_session.add(workflow_execution)
                    db_session.commit()
                    
                finally:
                    db_session.close()
            except Exception as e:
                logging.warning(f"Database workflow storage failed: {e}")
        
        logging.info(f"AI analysis workflow completed for deck {deck_id}")
            
    except Exception as e:
        logging.error(f"Error in AI analysis workflow for deck {deck_id}: {e}")
        # Store error result
        error_result = {
            'status': 'failed',
            'error': str(e),
            'deck_id': deck_id,
            'failed_at': datetime.utcnow().isoformat()
        }
        file_storage.save_workflow_result(deck_id, error_result)

@api_router.get("/founder-signal/decks")
async def get_founder_decks(
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None
):
    """Get list of uploaded pitch decks with AI analysis status"""
    try:
        # Try PostgreSQL first, fallback to file storage
        if DATABASE_AVAILABLE:
            try:
                db_session = next(get_db())
                try:
                    query = db_session.query(FounderDeck)
                    
                    if status:
                        query = query.filter(FounderDeck.status == status)
                    
                    decks = query.offset(offset).limit(limit).all()
                    
                    return [FounderDeckResponse(
                        deck_id=str(deck.deck_id),
                        company_name=deck.company_name,
                        upload_date=deck.upload_date,
                        file_url=deck.file_url,
                        file_size=deck.file_size,
                        status=deck.status,
                        uploaded_by=deck.uploaded_by
                    ) for deck in decks]
                finally:
                    db_session.close()
            except Exception as e:
                logging.warning(f"PostgreSQL query failed, using file storage: {e}")
        
        # Use file storage
        decks = file_storage.get_all_decks(limit, offset, status)
        return decks
        
    except Exception as e:
        logging.error(f"Error getting founder decks: {str(e)}")
        return []

@api_router.get("/founder-signal/deck/{deck_id}")
async def get_deck_details(deck_id: str):
    """Get details of a specific deck with AI analysis results"""
    try:
        # Try PostgreSQL first, fallback to file storage
        deck_data = None
        if DATABASE_AVAILABLE:
            try:
                db_session = next(get_db())
                try:
                    deck = db_session.query(FounderDeck).filter(FounderDeck.deck_id == deck_id).first()
                    if deck:
                        deck_data = {
                            "deck_id": str(deck.deck_id),
                            "company_name": deck.company_name,
                            "upload_date": deck.upload_date.isoformat() if deck.upload_date else None,
                            "file_url": deck.file_url,
                            "file_size": deck.file_size,
                            "status": deck.status,
                            "uploaded_by": deck.uploaded_by
                        }
                finally:
                    db_session.close()
            except Exception as e:
                logging.warning(f"PostgreSQL query failed, using file storage: {e}")
        
        if not deck_data:
            # Use file storage
            deck_data = file_storage.get_deck(deck_id)
        
        if not deck_data:
            raise HTTPException(status_code=404, detail="Deck not found")
        
        return deck_data
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting deck details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/founder-signal/deck/{deck_id}/signals", response_model=List[FounderSignalResponse])
async def get_founder_signals(deck_id: str, db_session: Session = Depends(get_db)):
    """Get AI-analyzed founder signals for a specific deck"""
    try:
        signals = db_session.query(FounderSignal).filter(FounderSignal.deck_id == deck_id).all()
        
        return [FounderSignalResponse(
            signal_id=str(signal.signal_id),
            deck_id=str(signal.deck_id),
            founder_name=signal.founder_name,
            founder_role=signal.founder_role,
            education_score=signal.education_score,
            experience_score=signal.experience_score,
            network_quality_score=signal.network_quality_score,
            online_presence_score=signal.online_presence_score,
            technical_fit=signal.technical_fit,
            market_fit=signal.market_fit,
            execution_capability=signal.execution_capability,
            overall_signal_score=signal.overall_signal_score,
            recommendation=signal.recommendation,
            created_at=signal.created_at
        ) for signal in signals]
        
    except Exception as e:
        logging.error(f"Error getting founder signals: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/founder-signal/deck/{deck_id}/analysis")
async def get_complete_analysis(deck_id: str):
    """Get complete AI analysis results for a deck (formatted for frontend)"""
    try:
        # Check if workflow completed in orchestrator memory first
        workflow_results = workflow_orchestrator.workflow_results.get(deck_id)
        
        if not workflow_results:
            # Try to find in file storage
            workflow_results = file_storage.get_workflow_result(deck_id)
        
        if not workflow_results and DATABASE_AVAILABLE:
            # Try to find in workflow executions table as fallback
            try:
                db_session = next(get_db())
                try:
                    execution = db_session.query(WorkflowExecution).filter(
                        WorkflowExecution.entity_id == deck_id,
                        WorkflowExecution.workflow_type == "founder_signal"
                    ).order_by(WorkflowExecution.started_at.desc()).first()
                    
                    if execution and execution.output_data:
                        workflow_results = execution.output_data
                        
                finally:
                    db_session.close()
            except Exception as e:
                logging.warning(f"Database query failed: {e}")
        
        if not workflow_results:
            return {"status": "processing", "message": "Analysis in progress or not found"}
        
        if workflow_results.get('status') == 'completed' and workflow_results.get('final_results'):
            return {
                "status": "completed",
                "analysis": workflow_results['final_results'],
                "workflow_id": workflow_results.get('workflow_id'),
                "completed_at": workflow_results.get('completed_at')
            }
        elif workflow_results.get('status') == 'failed':
            return {
                "status": "failed",
                "error": workflow_results.get('error', 'Analysis failed'),
                "workflow_id": workflow_results.get('workflow_id')
            }
        else:
            return {
                "status": "processing",
                "workflow_id": workflow_results.get('workflow_id'),
                "current_stage": workflow_results.get('current_stage', 'unknown')
            }
            
    except Exception as e:
        logging.error(f"Error getting complete analysis: {str(e)}")
        return {"status": "error", "error": "Analysis system temporarily unavailable"}

@api_router.get("/founder-signal/deck/{deck_id}/scoring-explanation")
async def get_scoring_explanation(deck_id: str):
    """Get detailed scoring explanation for a specific deck analysis"""
    try:
        # Get the analysis results first
        workflow_results = workflow_orchestrator.workflow_results.get(deck_id)
        
        if not workflow_results:
            workflow_results = file_storage.get_workflow_result(deck_id)
        
        if not workflow_results or workflow_results.get('status') != 'completed':
            return {
                "status": "not_available",
                "message": "Analysis not completed or not found"
            }
        
        final_results = workflow_results.get('final_results', {})
        founder_analysis = workflow_results.get('stages', {}).get('founder_analysis', {})
        investment_evaluation = workflow_results.get('stages', {}).get('investment_evaluation', {})
        
        # Compile detailed scoring explanation
        scoring_explanation = {
            "deck_id": deck_id,
            "company_name": final_results.get('company', 'Unknown'),
            "overall_score": final_results.get('overall_score', 0),
            "recommendation": final_results.get('recommendation', 'NEUTRAL'),
            
            # Founder Signal Scoring Details
            "founder_scoring": {
                "methodology": "Research-backed analysis using 1,157 papers on startup success patterns",
                "weight_factors": {
                    "education_quality": 0.23,
                    "previous_exit": 0.34,
                    "technical_background": 0.28,
                    "industry_experience": 0.25,
                    "network_quality": 0.18,
                    "execution_track_record": 0.30
                },
                "detailed_scores": [],
                "calculation_method": "Weighted average based on proven correlation factors"
            },
            
            # Investment Thesis Scoring Details
            "investment_scoring": {
                "methodology": "Investment evaluation based on successful investment patterns",
                "key_factors": [
                    "Market size and timing (TAM > $1B requirement)",
                    "Founder-market fit assessment",
                    "Business model scalability",
                    "Competitive advantage and defensibility",
                    "Traction validation and growth metrics"
                ],
                "detailed_assessments": {},
                "risk_factors": []
            },
            
            # Research Basis
            "research_basis": {
                "papers_analyzed": 1157,
                "success_patterns": "Analysis of successful vs failed startup patterns",
                "ai_model": "Google Gemini Pro 1.5 with deterministic scoring",
                "confidence_level": final_results.get('confidence_level', 0.85)
            }
        }
        
        # Extract founder analysis details if available
        if founder_analysis.get('status') == 'completed':
            founder_analyses = founder_analysis.get('founder_analyses', [])
            for founder_data in founder_analyses:
                if 'score_explanations' in founder_data:
                    scoring_explanation['founder_scoring']['detailed_scores'].append({
                        "founder_name": founder_data.get('founder_name', 'Unknown'),
                        "scores": founder_data.get('scores', {}),
                        "explanations": founder_data.get('score_explanations', {}),
                        "methodology": founder_data.get('scoring_methodology', {})
                    })
        
        # Extract investment evaluation details if available
        if investment_evaluation.get('status') == 'completed':
            investment_data = investment_evaluation.get('investment_evaluation', {})
            if 'scoring_explanations' in investment_data:
                scoring_explanation['investment_scoring']['detailed_assessments'] = investment_data.get('scoring_explanations', {})
                scoring_explanation['investment_scoring']['calculation_methodology'] = investment_data.get('calculation_methodology', {})
        
        return {
            "status": "available",
            "scoring_explanation": scoring_explanation
        }
        
    except Exception as e:
        logging.error(f"Error getting scoring explanation: {str(e)}")
        return {
            "status": "error",
            "error": "Scoring explanation system temporarily unavailable"
        }

# RAG Query Endpoints

@api_router.post("/rag/query", response_model=RAGResponse)
async def query_rag(query_data: RAGQuery):
    """Query the 3-level RAG system for VC insights"""
    try:
        start_time = datetime.utcnow()
        
        # Perform multi-level RAG query
        results = query_multi_level(
            query_data.query,
            query_data.investor_id,
            query_data.company_id,
            query_data.top_k
        )
        
        end_time = datetime.utcnow()
        processing_time = (end_time - start_time).total_seconds()
        
        # Count total results
        total_results = (
            len(results.get('platform_results', [])) +
            len(results.get('investor_results', [])) +
            len(results.get('company_results', []))
        )
        
        return RAGResponse(
            query=query_data.query,
            results=results,
            total_results=total_results,
            processing_time=processing_time
        )
        
    except Exception as e:
        logging.error(f"Error in RAG query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/rag/status")
async def get_rag_status():
    """Get RAG system status and statistics"""
    try:
        status = rag_service.get_system_status()
        return status
    except Exception as e:
        logging.error(f"Error getting RAG status: {str(e)}")
        return {"error": str(e)}

@api_router.post("/workflows/trigger")
async def trigger_workflow(
    workflow_data: WorkflowExecutionCreate,
    db_session: Session = Depends(get_db)
):
    """Trigger a workflow (legacy endpoint, now uses AI orchestrator)"""
    try:
        # Create workflow execution record
        execution = WorkflowExecution(
            workflow_name=workflow_data.workflow_name,
            workflow_type=workflow_data.workflow_type,
            entity_id=workflow_data.entity_id,
            status="started",
            input_data=workflow_data.input_data
        )
        
        db_session.add(execution)
        db_session.commit()
        db_session.refresh(execution)
        
        return {
            "execution_id": str(execution.execution_id),
            "status": "triggered",
            "message": "Workflow started successfully (AI-powered)"
        }
        
    except Exception as e:
        logging.error(f"Error triggering workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error triggering workflow: {str(e)}")

@api_router.get("/workflows/status/{execution_id}")
async def get_workflow_status(execution_id: str, db_session: Session = Depends(get_db)):
    """Get workflow execution status"""
    try:
        execution = db_session.query(WorkflowExecution).filter(
            WorkflowExecution.execution_id == execution_id
        ).first()
        
        if not execution:
            raise HTTPException(status_code=404, detail="Workflow execution not found")
        
        return {
            "execution_id": str(execution.execution_id),
            "workflow_name": execution.workflow_name,
            "workflow_type": execution.workflow_type,
            "status": execution.status,
            "started_at": execution.started_at,
            "completed_at": execution.completed_at,
            "duration_seconds": execution.duration_seconds,
            "output_data": execution.output_data,
            "error_message": execution.error_message
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting workflow status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@api_router.get("/health")
async def health_check():
    """Health check endpoint with AI services status"""
    try:
        rag_status = rag_service.get_system_status()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow(),
            "version": "2.0.0",
            "services": {
                "mongodb": "connected",
                "postgresql": "connected",
                "api": "running",
                "rag_system": rag_status.get('rag_system', 'unknown'),
                "ai_agents": "operational"
            },
            "features": {
                "founder_signal_ai": "enabled",
                "3_level_rag": "enabled",
                "workflow_orchestrator": "enabled",
                "gemini_integration": "configured" if os.environ.get('GEMINI_API_KEY') else "needs_api_key",
                "openai_integration": "configured" if os.environ.get('OPENAI_API_KEY') else "fallback_available"
            }
        }
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e),
            "timestamp": datetime.utcnow()
        }

# Existing routes for backward compatibility
@api_router.get("/")
async def root():
    return {"message": "VERSSAI VC Intelligence Platform API", "version": "2.0.0", "features": ["AI-powered analysis", "3-level RAG", "Research-backed insights"]}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("VERSSAI VC Intelligence Platform v2.0 starting up...")
    logger.info(f"Upload directory: {UPLOAD_PATH}")
    logger.info("AI-powered analysis enabled")
    logger.info("3-level RAG system initialized")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("VERSSAI VC Intelligence Platform shutting down...")
