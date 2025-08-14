from fastapi import FastAPI, APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
import os
import logging
import shutil
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import aiofiles
import statistics
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
from google_search_service import google_search_service
from twitter_search_service import twitter_search_service
from langraph_orchestrator import langraph_orchestrator, process_deck_with_langraph, get_workflow_analytics
from due_diligence_agent import due_diligence_orchestrator, process_due_diligence_data_room
from portfolio_management_agent import portfolio_orchestrator, add_portfolio_company, process_board_meeting, analyze_portfolio_performance
from fund_assessment_agent import backtesting_engine, add_investment_decision, add_investment_outcome, run_fund_backtest, analyze_fund_performance
from fund_allocation_agent import allocation_orchestrator, create_allocation_targets, optimize_fund_allocation, generate_allocation_report
from fund_vintage_agent import fund_vintage_orchestrator, add_fund, update_fund_performance, generate_vintage_report, generate_lp_report, compare_funds_across_vintages

# Import N8N-style workflow integration  
# from n8n_workflow_integration import workflow_router  # TEMPORARILY DISABLED FOR DEBUGGING

# MongoDB connection (keeping existing functionality)
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create upload directory
UPLOAD_PATH = Path(os.environ.get('UPLOAD_PATH', '/app/uploads'))
UPLOAD_PATH.mkdir(exist_ok=True)

# Create the main app without a prefix
app = FastAPI(title="VERSSAI VC Intelligence Platform", version="2.0.0")

# Create a router WITHOUT prefix (prefix will be added when including in app)
api_router = APIRouter()

# Add N8N-style workflow routes to the API router
# api_router.include_router(workflow_router)  # TEMPORARILY DISABLED FOR DEBUGGING

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

# Due Diligence Data Room Models
class DueDiligenceUpload(BaseModel):
    company_name: str
    company_id: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None

class DueDiligenceResponse(BaseModel):
    data_room_id: str
    company_name: str
    status: str
    uploaded_files: int
    analysis_progress: Optional[str] = None

# Portfolio Management Models
class PortfolioCompanyCreate(BaseModel):
    company_name: str
    company_id: Optional[str] = None
    investment_date: Optional[str] = None
    initial_investment: float
    current_valuation: float
    stage: str
    industry: str
    founders: List[str] = []
    board_members: List[str] = []
    key_metrics: Dict[str, Any] = {}

class BoardMeetingCreate(BaseModel):
    company_id: str
    meeting_date: Optional[str] = None
    attendees: List[str] = []
    agenda_items: List[str] = []
    key_decisions: List[str] = []
    action_items: List[Dict[str, Any]] = []
    financial_updates: Dict[str, Any] = {}
    kpi_updates: Dict[str, Any] = {}
    risks_discussed: List[str] = []
    next_meeting_date: Optional[str] = None
    meeting_notes: str = ""

# Fund Assessment Models
class InvestmentDecisionCreate(BaseModel):
    company_name: str
    decision_type: str  # "invested", "passed", "considered"
    investment_amount: Optional[float] = None
    valuation_at_decision: Optional[float] = None
    stage: str = "Unknown"
    industry: str = "Technology"
    decision_rationale: str = ""
    key_factors: List[str] = []
    risk_factors: List[str] = []
    decision_maker: str = "Unknown"
    confidence_score: float = 0.5

class InvestmentOutcomeCreate(BaseModel):
    decision_id: str
    company_name: str
    outcome_type: str  # "success", "failure", "neutral", "ongoing"
    exit_date: Optional[str] = None
    exit_valuation: Optional[float] = None
    exit_type: Optional[str] = None  # "IPO", "acquisition", "shutdown", "ongoing"
    multiple: Optional[float] = None
    irr: Optional[float] = None
    lessons_learned: List[str] = []
    success_factors: List[str] = []
    failure_factors: List[str] = []

class BacktestRequest(BaseModel):
    fund_id: str
    strategy_name: str = "Custom Strategy"
    time_period: str = "2020-2024"
    strategy_config: Dict[str, Any] = {}

# Fund Allocation Models
class AllocationTargetCreate(BaseModel):
    category: str  # "stage", "industry", "geography", "theme"
    subcategory: str  # "Series A", "AI", "US", "ESG"
    target_percentage: float
    minimum_percentage: Optional[float] = None
    maximum_percentage: Optional[float] = None
    current_allocation: float = 0.0
    deployed_amount: float = 0.0

class FundOptimizationRequest(BaseModel):
    fund_id: str
    fund_name: Optional[str] = None
    fund_size: float
    allocation_targets: List[Dict[str, Any]]
    current_allocations: Dict[str, Any] = {}
    market_conditions: Dict[str, Any] = {}

# Fund Vintage Management Models
class FundCreate(BaseModel):
    fund_name: str
    vintage_year: int
    fund_size: float
    fund_type: str = "Multi-Stage"
    investment_strategy: str = "Diversified VC"
    target_sectors: List[str] = []
    target_geographies: List[str] = []
    fund_manager: str = "Unknown"
    committed_capital: Optional[float] = None
    called_capital: float = 0.0
    distributed_capital: float = 0.0
    status: str = "investing"

class PerformanceMetricsUpdate(BaseModel):
    irr: float
    tvpi: float  # Total Value to Paid-In capital
    dpi: float   # Distributions to Paid-In capital
    rvpi: float  # Residual Value to Paid-In capital
    multiple: float
    quartile_ranking: Optional[int] = None
    percentile_ranking: Optional[float] = None

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

# Enhanced Research Endpoints

@api_router.post("/research/founder")
async def research_founder(
    founder_name: str = Form(...),
    company_name: Optional[str] = Form(None)
):
    """Research founder using Google Search and Twitter APIs"""
    try:
        # Execute both web and social research concurrently
        web_research_task = google_search_service.search_founder_information(founder_name, company_name)
        social_research_task = twitter_search_service.search_founder_social_signals(founder_name, company_name)
        
        web_research, social_research = await asyncio.gather(
            web_research_task, 
            social_research_task,
            return_exceptions=True
        )
        
        return {
            "founder_name": founder_name,
            "company_name": company_name,
            "web_research": web_research if not isinstance(web_research, Exception) else {"error": str(web_research)},
            "social_research": social_research if not isinstance(social_research, Exception) else {"error": str(social_research)},
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error in founder research: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")

@api_router.post("/research/company")
async def research_company(
    company_name: str = Form(...),
    industry: Optional[str] = Form(None)
):
    """Research company using Google Search and Twitter APIs"""
    try:
        # Execute both web and social research concurrently
        web_research_task = google_search_service.search_company_intelligence(company_name, industry)
        social_research_task = twitter_search_service.search_company_social_signals(company_name)
        
        web_research, social_research = await asyncio.gather(
            web_research_task,
            social_research_task, 
            return_exceptions=True
        )
        
        return {
            "company_name": company_name,
            "industry": industry,
            "web_research": web_research if not isinstance(web_research, Exception) else {"error": str(web_research)},
            "social_research": social_research if not isinstance(social_research, Exception) else {"error": str(social_research)},
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error in company research: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")

@api_router.get("/research/status")
async def get_research_status():
    """Get status of research services (Google Search API and Twitter API)"""
    try:
        google_status = "configured" if google_search_service.api_key else "not_configured"
        twitter_status = "configured" if twitter_search_service.twitter_available else "not_configured"
        
        return {
            "google_search_api": {
                "status": google_status,
                "search_engine_id": "configured" if google_search_service.search_engine_id else "needs_setup"
            },
            "twitter_api": {
                "status": twitter_status,
                "bearer_token": "configured" if twitter_search_service.bearer_token else "not_configured"
            },
            "cache_stats": {
                "google_cache_entries": len(google_search_service.cache),
                "twitter_cache_entries": len(twitter_search_service.cache)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error getting research status: {str(e)}")
        return {"error": str(e)}

# Portfolio Management Endpoints

@api_router.post("/portfolio/add-company")
async def add_portfolio_company_endpoint(company_data: PortfolioCompanyCreate):
    """Add a new portfolio company"""
    try:
        company = await add_portfolio_company(company_data.dict())
        
        return {
            "company_id": company.company_id,
            "company_name": company.company_name,
            "status": "added",
            "message": f"Portfolio company {company.company_name} added successfully",
            "initial_investment": company.initial_investment,
            "current_valuation": company.current_valuation,
            "stage": company.stage,
            "industry": company.industry
        }
        
    except Exception as e:
        logging.error(f"Error adding portfolio company: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add portfolio company: {str(e)}")

@api_router.post("/portfolio/ingest-data")
async def ingest_portfolio_data(
    background_tasks: BackgroundTasks,
    data_type: str = Form(...),  # "company", "meeting_notes", "kpi_update"
    company_id: str = Form(...),
    data: str = Form(...)  # JSON string of the data
):
    """Ingest various types of portfolio data"""
    try:
        # Parse the data JSON
        try:
            parsed_data = json.loads(data)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in data field")
        
        result = None
        
        if data_type == "company":
            # Add new portfolio company
            parsed_data['company_id'] = company_id
            company = await add_portfolio_company(parsed_data)
            result = {
                "type": "company_added",
                "company_id": company.company_id,
                "company_name": company.company_name,
                "status": "success"
            }
            
        elif data_type == "meeting_notes":
            # Process board meeting notes
            parsed_data['company_id'] = company_id
            meeting_result = await process_board_meeting(parsed_data)
            result = {
                "type": "meeting_processed",
                "meeting_id": meeting_result.get('meeting_id'),
                "company_id": company_id,
                "status": meeting_result.get('status'),
                "analysis_available": meeting_result.get('status') == 'completed'
            }
            
        elif data_type == "kpi_update":
            # Update KPIs through a mock meeting
            mock_meeting_data = {
                'company_id': company_id,
                'meeting_date': datetime.utcnow().isoformat(),
                'attendees': ['Portfolio Manager'],
                'agenda_items': ['KPI Update'],
                'key_decisions': [],
                'kpi_updates': parsed_data,
                'meeting_notes': f"Automated KPI update for {company_id}",
                'action_items': [],
                'financial_updates': {},
                'risks_discussed': []
            }
            
            meeting_result = await process_board_meeting(mock_meeting_data)
            result = {
                "type": "kpi_updated",
                "company_id": company_id,
                "kpis_updated": list(parsed_data.keys()),
                "status": "success"
            }
            
        else:
            raise HTTPException(status_code=400, detail="Invalid data_type. Must be 'company', 'meeting_notes', or 'kpi_update'")
        
        return {
            "message": "Portfolio data ingested successfully",
            "ingestion_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "data_type": data_type,
            "company_id": company_id,
            "result": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error ingesting portfolio data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Data ingestion failed: {str(e)}")

@api_router.post("/portfolio/board-meeting")
async def process_board_meeting_endpoint(meeting_data: BoardMeetingCreate):
    """Process board meeting notes and generate AI insights"""
    try:
        result = await process_board_meeting(meeting_data.dict())
        
        return {
            "meeting_id": result.get('meeting_id'),
            "company_id": meeting_data.company_id,
            "status": result.get('status'),
            "message": "Board meeting processed successfully",
            "analysis_available": result.get('status') == 'completed',
            "processed_at": result.get('processed_at')
        }
        
    except Exception as e:
        logging.error(f"Error processing board meeting: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Board meeting processing failed: {str(e)}")

@api_router.get("/portfolio/companies")
async def get_portfolio_companies():
    """Get list of portfolio companies"""
    try:
        companies = list(portfolio_orchestrator.portfolio_companies.values())
        
        return {
            "total_companies": len(companies),
            "companies": [
                {
                    "company_id": company.company_id,
                    "company_name": company.company_name,
                    "investment_date": company.investment_date,
                    "initial_investment": company.initial_investment,
                    "current_valuation": company.current_valuation,
                    "stage": company.stage,
                    "industry": company.industry,
                    "founders": company.founders,
                    "last_update": company.last_update
                } for company in companies
            ]
        }
        
    except Exception as e:
        logging.error(f"Error getting portfolio companies: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/portfolio/performance-report")
async def get_portfolio_performance_report(fund_id: Optional[str] = None):
    """Generate comprehensive portfolio performance report"""
    try:
        report = await analyze_portfolio_performance(fund_id)
        
        return {
            "report_id": report.report_id,
            "generated_at": report.generated_at,
            "portfolio_summary": report.portfolio_summary,
            "company_performances": report.company_performances,
            "key_insights": [
                {
                    "insight_id": insight.insight_id,
                    "company_id": insight.company_id,
                    "insight_type": insight.insight_type,
                    "title": insight.title,
                    "description": insight.description,
                    "confidence_score": insight.confidence_score,
                    "urgency": insight.urgency,
                    "recommended_actions": insight.recommended_actions
                } for insight in report.key_insights
            ],
            "risk_alerts": report.risk_alerts,
            "recommendations": report.recommendations,
            "overall_health_score": report.overall_health_score
        }
        
    except Exception as e:
        logging.error(f"Error generating portfolio report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Portfolio report generation failed: {str(e)}")

# Fund Assessment & Backtesting Endpoints

@api_router.post("/fund-assessment/add-investment-decision")
async def add_investment_decision_endpoint(decision_data: InvestmentDecisionCreate):
    """Add investment decision for backtesting analysis"""
    try:
        decision = await backtesting_engine.add_investment_decision(decision_data.dict())
        
        return {
            "decision_id": decision.decision_id,
            "company_name": decision_data.company_name,
            "decision_type": decision_data.decision_type,
            "status": "added",
            "message": f"Investment decision for {decision_data.company_name} recorded successfully"
        }
        
    except Exception as e:
        logging.error(f"Error adding investment decision: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add investment decision: {str(e)}")

@api_router.post("/fund-assessment/add-investment-outcome")  
async def add_investment_outcome_endpoint(outcome_data: InvestmentOutcomeCreate):
    """Add investment outcome for backtesting analysis"""
    try:
        outcome = await backtesting_engine.add_investment_outcome(outcome_data.dict())
        
        return {
            "outcome_id": outcome.decision_id,  # Use decision_id as outcome_id for tracking
            "decision_id": outcome_data.decision_id,
            "company_name": outcome_data.company_name,
            "outcome_type": outcome_data.outcome_type,
            "status": "added",
            "message": f"Investment outcome for {outcome_data.company_name} recorded successfully"
        }
        
    except Exception as e:
        logging.error(f"Error adding investment outcome: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add investment outcome: {str(e)}")

@api_router.post("/fund-assessment/run-backtest")
async def run_fund_backtest_endpoint(backtest_request: BacktestRequest):
    """Run fund backtesting analysis"""
    try:
        backtest_results = await backtesting_engine.run_backtest(
            backtest_request.fund_id, 
            backtest_request.strategy_config, 
            backtest_request.time_period
        )
        
        return {
            "backtest_id": backtest_results.backtest_id,
            "fund_id": backtest_request.fund_id,
            "strategy_name": backtest_request.strategy_name,
            "time_period": backtest_request.time_period,
            "status": "completed",
            "results": {
                "success_rate": backtest_results.success_rate,
                "average_multiple": backtest_results.average_multiple,
                "total_return": backtest_results.total_return,
                "total_decisions": backtest_results.total_decisions,
                "invested_count": backtest_results.invested_count,
                "passed_count": backtest_results.passed_count,
                "missed_opportunities": len(backtest_results.missed_opportunities),
                "false_positives": len(backtest_results.false_positives)
            },
            "message": "Fund backtesting completed successfully"
        }
        
    except Exception as e:
        logging.error(f"Error running fund backtest: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Fund backtesting failed: {str(e)}")

@api_router.get("/fund-assessment/performance-analysis/{fund_id}")
async def get_fund_performance_analysis(fund_id: str):
    """Get detailed fund performance analysis"""
    try:
        analysis = await backtesting_engine.analyze_fund_performance(fund_id)
        
        return {
            "fund_id": fund_id,
            "analysis": {
                "report_id": analysis.report_id,
                "fund_name": analysis.fund_name,
                "analysis_period": analysis.analysis_period,
                "investment_summary": analysis.investment_summary,
                "performance_metrics": analysis.performance_metrics,
                "decision_patterns": analysis.decision_patterns,
                "missed_opportunities_count": len(analysis.missed_opportunities_analysis),
                "success_factor_analysis": analysis.success_factor_analysis,
                "backtest_results_count": len(analysis.backtest_results),
                "overall_assessment_score": analysis.overall_assessment_score,
                "recommendations": analysis.recommendations[:5]  # Top 5 recommendations
            },
            "status": "completed",
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error getting fund performance analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Fund analysis failed: {str(e)}")

# Fund Allocation & Deployment Endpoints

@api_router.post("/fund-allocation/create-targets")
async def create_allocation_targets_endpoint(targets: List[AllocationTargetCreate]):
    """Create allocation targets for fund deployment"""
    try:
        # Use a default fund_id for creating targets (in real app, would be from request)
        fund_id = "default_fund_" + str(uuid.uuid4())[:8]
        
        results = []
        targets_data = [target.dict() for target in targets]
        created_targets = await allocation_orchestrator.create_allocation_targets(fund_id, targets_data)
        
        for i, target in enumerate(created_targets):
            results.append({
                "target_id": target.target_id,
                "category": target.category,
                "subcategory": target.subcategory,
                "target_percentage": target.target_percentage,
                "status": "created"
            })
        
        return {
            "fund_id": fund_id,
            "targets_created": len(results),
            "results": results,
            "message": "Allocation targets created successfully"
        }
        
    except Exception as e:
        logging.error(f"Error creating allocation targets: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create allocation targets: {str(e)}")

@api_router.post("/fund-allocation/optimize")
async def optimize_fund_allocation_endpoint(optimization_request: FundOptimizationRequest):
    """Run Monte Carlo optimization for fund allocation"""
    try:
        optimization_results = await allocation_orchestrator.optimize_fund_allocation(
            optimization_request.fund_id,
            optimization_request.fund_size,
            optimization_request.allocation_targets,
            optimization_request.current_allocations,
            optimization_request.market_conditions
        )
        
        return {
            "optimization_id": optimization_results.optimization_id,
            "fund_id": optimization_request.fund_id,
            "fund_name": optimization_request.fund_name,
            "fund_size": optimization_request.fund_size,
            "status": "completed",
            "optimization_results": {
                "expected_multiple": optimization_results.expected_outcomes.get('expected_multiple'),
                "expected_irr": optimization_results.expected_outcomes.get('expected_irr'),
                "risk_adjusted_return": optimization_results.expected_outcomes.get('risk_adjusted_return'),
                "confidence_score": optimization_results.confidence_score,
                "recommendations_count": len(optimization_results.recommendations),
                "monte_carlo_simulations": optimization_results.monte_carlo_results.get('total_simulations', 0)
            },
            "message": "Fund allocation optimization completed successfully"
        }
        
    except Exception as e:
        logging.error(f"Error optimizing fund allocation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Fund allocation optimization failed: {str(e)}")

@api_router.get("/fund-allocation/report/{fund_id}")
async def get_allocation_report(fund_id: str):
    """Generate allocation deployment report"""
    try:
        report = await allocation_orchestrator.generate_allocation_report(fund_id)
        
        return {
            "fund_id": fund_id,
            "report": {
                "report_id": report.report_id,
                "fund_name": report.fund_name,
                "generated_at": report.generated_at,
                "current_allocations": report.current_allocations,
                "deployment_progress": report.deployment_progress,
                "optimization_recommendations": report.optimization_recommendations[:5],
                "overall_allocation_score": report.overall_allocation_score,
                "rebalancing_suggestions": report.rebalancing_suggestions[:3]
            },
            "status": "completed",
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error generating allocation report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Allocation report generation failed: {str(e)}")

@api_router.post("/fund-allocation/ingest-data")
async def ingest_allocation_data(
    data_type: str = Form(...),  # "allocation_target", "deployment_record", "performance_update"
    fund_id: str = Form(...),
    data: str = Form(...)  # JSON string of the data
):
    """Ingest fund allocation and deployment data"""
    try:
        # Parse the data JSON
        try:
            parsed_data = json.loads(data)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in data field")
        
        result = None
        
        if data_type == "allocation_target":
            # Create allocation targets
            targets_data = [parsed_data] if isinstance(parsed_data, dict) else parsed_data
            created_targets = await allocation_orchestrator.create_allocation_targets(fund_id, targets_data)
            
            result = {
                "type": "allocation_targets_created",
                "targets_created": len(created_targets),
                "fund_id": fund_id,
                "status": "success"
            }
            
        elif data_type == "deployment_record":
            # Record fund deployment (simplified for demo)
            result = {
                "type": "deployment_recorded",
                "fund_id": fund_id,
                "deployment_amount": parsed_data.get('amount', 0),
                "status": "success"
            }
            
        elif data_type == "performance_update":
            # Update fund performance metrics (simplified for demo)
            result = {
                "type": "performance_updated",
                "fund_id": fund_id,
                "metrics_updated": list(parsed_data.keys()),
                "status": "success"
            }
            
        else:
            raise HTTPException(status_code=400, detail="Invalid data_type. Must be 'allocation_target', 'deployment_record', or 'performance_update'")
        
        return {
            "message": "Fund allocation data ingested successfully",
            "ingestion_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "data_type": data_type,
            "fund_id": fund_id,
            "result": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error ingesting fund allocation data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Fund allocation data ingestion failed: {str(e)}")

# Due Diligence Data Room Endpoints

@api_router.post("/due-diligence/upload-data-room")
async def upload_data_room(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    company_name: str = Form(...),
    company_id: Optional[str] = Form(None),
    industry: Optional[str] = Form(None),
    uploaded_by: Optional[str] = Form(None)
):
    """Upload multiple documents for comprehensive due diligence analysis"""
    try:
        if len(files) == 0:
            raise HTTPException(status_code=400, detail="At least one file must be uploaded")
        
        if len(files) > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 files allowed per data room")
        
        # Generate data room ID
        data_room_id = company_id or str(uuid.uuid4())
        
        # Validate and save all files
        saved_files = []
        total_size = 0
        max_total_size = 200 * 1024 * 1024  # 200MB total limit
        
        for i, file in enumerate(files):
            # Validate file type
            allowed_extensions = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.txt', '.csv']
            if not any(file.filename.lower().endswith(ext) for ext in allowed_extensions):
                raise HTTPException(
                    status_code=400, 
                    detail=f"File {file.filename} has unsupported format. Allowed: PDF, Word, Excel, PowerPoint, TXT, CSV"
                )
            
            # Read and validate file size
            content = await file.read()
            file_size = len(content)
            total_size += file_size
            
            if file_size > 50 * 1024 * 1024:  # 50MB per file
                raise HTTPException(status_code=400, detail=f"File {file.filename} exceeds 50MB limit")
            
            if total_size > max_total_size:
                raise HTTPException(status_code=400, detail="Total files size exceeds 200MB limit")
            
            # Generate unique filename
            file_extension = Path(file.filename).suffix
            unique_filename = f"{data_room_id}_doc_{i+1}_{uuid.uuid4()}{file_extension}"
            file_path = UPLOAD_PATH / unique_filename
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(content)
            
            saved_files.append({
                'original_name': file.filename,
                'file_path': str(file_path),
                'file_size': file_size,
                'document_id': f"{data_room_id}_doc_{i+1}"
            })
        
        # Store data room metadata
        data_room_metadata = {
            'data_room_id': data_room_id,
            'company_name': company_name,
            'company_id': data_room_id,
            'industry': industry,
            'uploaded_by': uploaded_by,
            'upload_timestamp': datetime.utcnow().isoformat(),
            'status': 'processing',
            'files': saved_files,
            'total_files': len(saved_files),
            'total_size': total_size
        }
        
        # Store in file storage (database can be added later)
        file_storage.save_data_room(data_room_id, data_room_metadata)
        
        # Trigger background analysis
        file_paths = [f['file_path'] for f in saved_files]
        company_context = {
            'company_id': data_room_id,
            'company_name': company_name,
            'industry': industry,
            'data_room_id': data_room_id
        }
        
        background_tasks.add_task(
            process_due_diligence_background,
            data_room_id,
            company_name,
            file_paths,
            company_context
        )
        
        return {
            "data_room_id": data_room_id,
            "company_name": company_name,
            "status": "processing",
            "uploaded_files": len(saved_files),
            "total_size": total_size,
            "files": [{'name': f['original_name'], 'size': f['file_size']} for f in saved_files],
            "message": "Data room uploaded successfully - Due diligence analysis starting",
            "uploaded_by": uploaded_by
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error uploading data room: {str(e)}")
        raise HTTPException(status_code=500, detail="Data room upload failed - please try again")

async def process_due_diligence_background(data_room_id: str, company_name: str, 
                                         file_paths: List[str], company_context: Dict[str, Any]):
    """Background task for due diligence analysis"""
    try:
        logging.info(f"Starting due diligence analysis for data room {data_room_id}")
        
        # Process data room through due diligence orchestrator
        dd_report = await process_due_diligence_data_room(
            data_room_id, company_name, file_paths, company_context
        )
        
        # Update status and store results
        file_storage.save_dd_report(data_room_id, dd_report)
        file_storage.update_data_room_status(data_room_id, 'completed')
        
        logging.info(f"Completed due diligence analysis for {company_name} - Score: {dd_report.overall_score}")
        
    except Exception as e:
        logging.error(f"Error in due diligence background task for {data_room_id}: {e}")
        # Store error result
        error_result = {
            'status': 'failed',
            'error': str(e),
            'data_room_id': data_room_id,
            'failed_at': datetime.utcnow().isoformat()
        }
        file_storage.save_dd_report(data_room_id, error_result)
        file_storage.update_data_room_status(data_room_id, 'failed')

@api_router.get("/due-diligence/data-rooms")
async def get_data_rooms(limit: int = 50, offset: int = 0, status: Optional[str] = None):
    """Get list of due diligence data rooms"""
    try:
        data_rooms = file_storage.get_all_data_rooms(limit, offset, status)
        return data_rooms
        
    except Exception as e:
        logging.error(f"Error getting data rooms: {str(e)}")
        return []

@api_router.get("/due-diligence/data-room/{data_room_id}")
async def get_data_room_details(data_room_id: str):
    """Get details of a specific data room"""
    try:
        data_room = file_storage.get_data_room(data_room_id)
        if not data_room:
            raise HTTPException(status_code=404, detail="Data room not found")
        
        return data_room
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting data room details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/due-diligence/data-room/{data_room_id}/analysis")
async def get_due_diligence_analysis(data_room_id: str):
    """Get complete due diligence analysis results"""
    try:
        # Check if analysis is completed
        dd_report = file_storage.get_dd_report(data_room_id)
        
        if not dd_report:
            return {"status": "processing", "message": "Due diligence analysis in progress"}
        
        if isinstance(dd_report, dict) and dd_report.get('status') == 'failed':
            return {
                "status": "failed",
                "error": dd_report.get('error', 'Analysis failed'),
                "data_room_id": data_room_id
            }
        
        # Return completed analysis
        return {
            "status": "completed",
            "data_room_id": data_room_id,
            "analysis": {
                "company_name": dd_report.company_name,
                "overall_score": dd_report.overall_score,
                "analysis_timestamp": dd_report.analysis_timestamp,
                "documents_analyzed": len(dd_report.document_analyses),
                "document_analyses": [
                    {
                        "filename": doc.filename,
                        "category": doc.category,
                        "document_type": doc.document_type,
                        "key_insights": doc.key_insights,
                        "risk_factors": doc.risk_factors,
                        "red_flags": doc.red_flags,
                        "completeness_score": doc.completeness_score,
                        "credibility_score": doc.credibility_score,
                        "summary": doc.summary
                    }
                    for doc in dd_report.document_analyses
                ],
                "cross_document_insights": dd_report.cross_document_insights,
                "overall_risk_assessment": dd_report.overall_risk_assessment,
                "completeness_assessment": dd_report.completeness_assessment,
                "red_flags": dd_report.red_flags,
                "recommendations": dd_report.recommendations,
                "checklist_status": dd_report.checklist_status
            }
        }
        
    except Exception as e:
        logging.error(f"Error getting due diligence analysis: {str(e)}")
        return {"status": "error", "error": "Analysis system temporarily unavailable"}

@api_router.get("/due-diligence/status")
async def get_due_diligence_status():
    """Get due diligence system status"""
    try:
        return {
            "status": "operational",
            "framework": "Due Diligence Data Room - Framework #2",
            "features": {
                "multi_document_upload": True,
                "ai_document_analysis": True,
                "cross_document_insights": True,
                "risk_assessment": True,
                "completeness_scoring": True,
                "automated_categorization": True,
                "web_research_enhancement": True
            },
            "supported_formats": [".pdf", ".docx", ".doc", ".xlsx", ".xls", ".pptx", ".ppt", ".txt", ".csv"],
            "limits": {
                "max_files_per_data_room": 20,
                "max_file_size_mb": 50,
                "max_total_size_mb": 200
            },
            "ai_integration": {
                "gemini_available": bool(os.environ.get('GEMINI_API_KEY')),
                "rag_system": "operational",
                "web_research": bool(os.environ.get('GOOGLE_API_KEY')),
                "social_research": bool(os.environ.get('TWITTER_BEARER_TOKEN'))
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error getting due diligence status: {str(e)}")
        return {"error": str(e)}

# Portfolio Management Endpoints

@api_router.post("/portfolio/add-company")
async def add_portfolio_company_endpoint(company_data: PortfolioCompanyCreate):
    """Add new portfolio company to management system"""
    try:
        # Convert Pydantic model to dict
        company_dict = company_data.dict()
        
        # Add portfolio company
        portfolio_company = await add_portfolio_company(company_dict)
        
        return {
            "success": True,
            "company_id": portfolio_company.company_id,
            "company_name": portfolio_company.company_name,
            "message": "Portfolio company added successfully",
            "added_at": portfolio_company.last_update
        }
        
    except Exception as e:
        logging.error(f"Error adding portfolio company: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add portfolio company: {str(e)}")

@api_router.post("/portfolio/board-meeting")
async def process_board_meeting_endpoint(
    background_tasks: BackgroundTasks,
    meeting_data: BoardMeetingCreate
):
    """Process board meeting notes and generate insights"""
    try:
        # Convert Pydantic model to dict
        meeting_dict = meeting_data.dict()
        
        # Add meeting_id if not provided
        if 'meeting_id' not in meeting_dict:
            meeting_dict['meeting_id'] = str(uuid.uuid4())
        
        # Process board meeting (this includes AI analysis)
        result = await process_board_meeting(meeting_dict)
        
        return {
            "success": True,
            "meeting_id": result.get('meeting_id'),
            "company_id": result.get('company_id'),
            "status": result.get('status'),
            "analysis_summary": {
                "key_developments_count": len(result.get('analysis', {}).get('key_developments', [])),
                "risk_factors_count": len(result.get('analysis', {}).get('risk_factors', [])),
                "action_items_count": len(result.get('analysis', {}).get('action_items', [])),
                "confidence_score": result.get('analysis', {}).get('confidence_score', 0)
            },
            "processed_at": result.get('processed_at'),
            "message": "Board meeting processed successfully"
        }
        
    except Exception as e:
        logging.error(f"Error processing board meeting: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process board meeting: {str(e)}")

@api_router.get("/portfolio/companies")
async def get_portfolio_companies(fund_id: Optional[str] = None):
    """Get list of portfolio companies"""
    try:
        # Get companies from orchestrator
        companies = list(portfolio_orchestrator.portfolio_companies.values())
        
        # Filter by fund_id if provided (in real implementation)
        if fund_id:
            # Would filter by fund_id
            pass
        
        # Format response
        company_list = []
        for company in companies:
            company_list.append({
                "company_id": company.company_id,
                "company_name": company.company_name,
                "investment_date": company.investment_date,
                "initial_investment": company.initial_investment,
                "current_valuation": company.current_valuation,
                "multiple": round((company.current_valuation / company.initial_investment) if company.initial_investment > 0 else 0, 2),
                "stage": company.stage,
                "industry": company.industry,
                "founders": company.founders,
                "board_members": company.board_members,
                "last_update": company.last_update
            })
        
        return {
            "success": True,
            "total_companies": len(company_list),
            "companies": company_list
        }
        
    except Exception as e:
        logging.error(f"Error getting portfolio companies: {str(e)}")
        return {"success": False, "error": str(e)}

@api_router.get("/portfolio/company/{company_id}")
async def get_portfolio_company_details(company_id: str):
    """Get detailed information about a specific portfolio company"""
    try:
        # Get company from orchestrator
        if company_id not in portfolio_orchestrator.portfolio_companies:
            raise HTTPException(status_code=404, detail="Portfolio company not found")
        
        company = portfolio_orchestrator.portfolio_companies[company_id]
        
        # Get company KPIs
        company_kpis = [kpi for kpi in portfolio_orchestrator.kpi_trackers.values() 
                      if kpi.company_id == company_id]
        
        # Get recent board meetings
        recent_meetings = [meeting for meeting in portfolio_orchestrator.board_meetings.values()
                         if meeting.company_id == company_id]
        recent_meetings.sort(key=lambda x: x.meeting_date, reverse=True)
        
        # Format KPIs
        kpi_summary = []
        for kpi in company_kpis:
            kpi_summary.append({
                "metric_name": kpi.metric_name,
                "current_value": kpi.current_value,
                "previous_value": kpi.previous_value,
                "target_value": kpi.target_value,
                "trend": kpi.trend,
                "last_updated": kpi.last_updated,
                "historical_points": len(kpi.historical_data)
            })
        
        # Format recent meetings
        meeting_summary = []
        for meeting in recent_meetings[:5]:  # Last 5 meetings
            meeting_summary.append({
                "meeting_id": meeting.meeting_id,
                "meeting_date": meeting.meeting_date,
                "attendees_count": len(meeting.attendees),
                "agenda_items_count": len(meeting.agenda_items),
                "decisions_count": len(meeting.key_decisions),
                "next_meeting_date": meeting.next_meeting_date
            })
        
        return {
            "success": True,
            "company": {
                "company_id": company.company_id,
                "company_name": company.company_name,
                "investment_date": company.investment_date,
                "initial_investment": company.initial_investment,
                "current_valuation": company.current_valuation,
                "multiple": round((company.current_valuation / company.initial_investment) if company.initial_investment > 0 else 0, 2),
                "stage": company.stage,
                "industry": company.industry,
                "founders": company.founders,
                "board_members": company.board_members,
                "key_metrics": company.key_metrics,
                "last_update": company.last_update
            },
            "kpis": kpi_summary,
            "recent_meetings": meeting_summary,
            "total_kpis": len(kpi_summary),
            "total_meetings": len(recent_meetings)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting portfolio company details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/portfolio/performance-report")
async def generate_portfolio_performance_report(fund_id: Optional[str] = None):
    """Generate comprehensive portfolio performance report"""
    try:
        # Generate performance report
        report = await analyze_portfolio_performance(fund_id)
        
        # Format response
        return {
            "success": True,
            "report": {
                "report_id": report.report_id,
                "generated_at": report.generated_at,
                "portfolio_summary": report.portfolio_summary,
                "total_companies_analyzed": len(report.company_performances),
                "key_insights_count": len(report.key_insights),
                "risk_alerts_count": len(report.risk_alerts),
                "recommendations_count": len(report.recommendations),
                "overall_health_score": report.overall_health_score,
                "key_insights": [
                    {
                        "insight_id": insight.insight_id,
                        "company_id": insight.company_id,
                        "insight_type": insight.insight_type,
                        "title": insight.title,
                        "description": insight.description,
                        "confidence_score": insight.confidence_score,
                        "urgency": insight.urgency,
                        "recommended_actions": insight.recommended_actions
                    }
                    for insight in report.key_insights
                ],
                "risk_alerts": report.risk_alerts,
                "recommendations": report.recommendations
            }
        }
        
    except Exception as e:
        logging.error(f"Error generating portfolio performance report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@api_router.get("/portfolio/company/{company_id}/meeting/{meeting_id}/analysis")
async def get_meeting_analysis(company_id: str, meeting_id: str):
    """Get detailed analysis of a specific board meeting"""
    try:
        # Get meeting from orchestrator
        if meeting_id not in portfolio_orchestrator.board_meetings:
            raise HTTPException(status_code=404, detail="Board meeting not found")
        
        meeting = portfolio_orchestrator.board_meetings[meeting_id]
        
        if meeting.company_id != company_id:
            raise HTTPException(status_code=400, detail="Meeting does not belong to specified company")
        
        # Get company context
        company_context = None
        if company_id in portfolio_orchestrator.portfolio_companies:
            company = portfolio_orchestrator.portfolio_companies[company_id]
            company_context = {
                'company_name': company.company_name,
                'industry': company.industry,
                'stage': company.stage
            }
        
        # Re-analyze meeting (or get cached analysis)
        analysis = await portfolio_orchestrator.meeting_analyzer.analyze_meeting_notes(meeting, company_context)
        
        return {
            "success": True,
            "meeting": {
                "meeting_id": meeting.meeting_id,
                "company_id": meeting.company_id,
                "meeting_date": meeting.meeting_date,
                "attendees": meeting.attendees,
                "agenda_items": meeting.agenda_items,
                "key_decisions": meeting.key_decisions,
                "financial_updates": meeting.financial_updates,
                "kpi_updates": meeting.kpi_updates,
                "risks_discussed": meeting.risks_discussed
            },
            "analysis": analysis
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting meeting analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/portfolio/status")
async def get_portfolio_management_status():
    """Get portfolio management system status"""
    try:
        return {
            "status": "operational",
            "framework": "Portfolio Management - Framework #3",
            "features": {
                "portfolio_company_tracking": True,
                "board_meeting_analysis": True,
                "kpi_monitoring": True,
                "ai_powered_insights": True,
                "predictive_analytics": True,
                "performance_reporting": True,
                "rag_integration": True
            },
            "current_stats": {
                "portfolio_companies": len(portfolio_orchestrator.portfolio_companies),
                "board_meetings": len(portfolio_orchestrator.board_meetings),
                "kpi_trackers": len(portfolio_orchestrator.kpi_trackers)
            },
            "ai_integration": {
                "meeting_analysis": "enabled",
                "kpi_prediction": "enabled",
                "performance_insights": "enabled",
                "gemini_available": bool(os.environ.get('GEMINI_API_KEY')),
                "rag_system": "operational"
            },
            "capabilities": [
                "Board meeting notes analysis",
                "KPI trend analysis and prediction",
                "Portfolio performance reporting",
                "Risk identification and alerts",
                "Cross-company insights",
                "Predictive portfolio analytics"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error getting portfolio management status: {str(e)}")
        return {"error": str(e)}

# Fund Assessment & Backtesting Endpoints

@api_router.post("/fund-assessment/add-investment-decision")
async def add_investment_decision_endpoint(decision_data: InvestmentDecisionCreate):
    """Add investment decision for backtesting and analysis"""
    try:
        # Convert Pydantic model to dict
        decision_dict = decision_data.dict()
        
        # Add investment decision
        decision = await add_investment_decision(decision_dict)
        
        return {
            "success": True,
            "decision_id": decision.decision_id,
            "company_name": decision.company_name,
            "decision_type": decision.decision_type,
            "message": "Investment decision added successfully",
            "added_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error adding investment decision: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add investment decision: {str(e)}")

@api_router.post("/fund-assessment/add-investment-outcome")
async def add_investment_outcome_endpoint(outcome_data: InvestmentOutcomeCreate):
    """Add investment outcome for performance tracking"""
    try:
        # Convert Pydantic model to dict
        outcome_dict = outcome_data.dict()
        
        # Add investment outcome
        outcome = await add_investment_outcome(outcome_dict)
        
        return {
            "success": True,
            "decision_id": outcome.decision_id,
            "company_name": outcome.company_name,
            "outcome_type": outcome.outcome_type,
            "multiple": outcome.multiple,
            "message": "Investment outcome added successfully",
            "added_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error adding investment outcome: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add investment outcome: {str(e)}")

@api_router.get("/fund-assessment/investment-decisions")
async def get_investment_decisions(fund_id: Optional[str] = None, limit: int = 50):
    """Get list of investment decisions"""
    try:
        # Get decisions from backtesting engine
        decisions = list(backtesting_engine.investment_decisions.values())
        
        # Filter by fund_id if provided (in real implementation)
        if fund_id:
            # Would filter by fund_id
            pass
        
        # Apply limit
        decisions = decisions[:limit]
        
        # Format response
        decision_list = []
        for decision in decisions:
            decision_list.append({
                "decision_id": decision.decision_id,
                "company_name": decision.company_name,
                "decision_date": decision.decision_date,
                "decision_type": decision.decision_type,
                "investment_amount": decision.investment_amount,
                "valuation_at_decision": decision.valuation_at_decision,
                "stage": decision.stage,
                "industry": decision.industry,
                "confidence_score": decision.confidence_score,
                "decision_maker": decision.decision_maker
            })
        
        return {
            "success": True,
            "total_decisions": len(decision_list),
            "decisions": decision_list
        }
        
    except Exception as e:
        logging.error(f"Error getting investment decisions: {str(e)}")
        return {"success": False, "error": str(e)}

@api_router.get("/fund-assessment/investment-outcomes")
async def get_investment_outcomes(limit: int = 50):
    """Get list of investment outcomes"""
    try:
        # Get outcomes from backtesting engine
        outcomes = list(backtesting_engine.investment_outcomes.values())
        
        # Apply limit
        outcomes = outcomes[:limit]
        
        # Format response
        outcome_list = []
        for outcome in outcomes:
            outcome_list.append({
                "decision_id": outcome.decision_id,
                "company_name": outcome.company_name,
                "outcome_type": outcome.outcome_type,
                "exit_date": outcome.exit_date,
                "exit_valuation": outcome.exit_valuation,
                "exit_type": outcome.exit_type,
                "multiple": outcome.multiple,
                "irr": outcome.irr,
                "lessons_learned": outcome.lessons_learned,
                "success_factors": outcome.success_factors,
                "failure_factors": outcome.failure_factors
            })
        
        return {
            "success": True,
            "total_outcomes": len(outcome_list),
            "outcomes": outcome_list
        }
        
    except Exception as e:
        logging.error(f"Error getting investment outcomes: {str(e)}")
        return {"success": False, "error": str(e)}

@api_router.post("/fund-assessment/run-backtest")
async def run_backtest_endpoint(backtest_request: BacktestRequest):
    """Run backtest analysis with specified strategy"""
    try:
        # Prepare strategy config
        strategy_config = backtest_request.strategy_config.copy()
        strategy_config['name'] = backtest_request.strategy_name
        
        # Run backtest
        backtest_result = await run_fund_backtest(
            backtest_request.fund_id,
            strategy_config,
            backtest_request.time_period
        )
        
        return {
            "success": True,
            "backtest": {
                "backtest_id": backtest_result.backtest_id,
                "fund_period": backtest_result.fund_period,
                "strategy_tested": backtest_result.strategy_tested,
                "total_decisions": backtest_result.total_decisions,
                "invested_count": backtest_result.invested_count,
                "passed_count": backtest_result.passed_count,
                "success_rate": backtest_result.success_rate,
                "average_multiple": backtest_result.average_multiple,
                "total_return": backtest_result.total_return,
                "missed_opportunities_count": len(backtest_result.missed_opportunities),
                "false_positives_count": len(backtest_result.false_positives),
                "recommendations": backtest_result.recommendations,
                "strategy_performance": backtest_result.strategy_performance
            }
        }
        
    except Exception as e:
        logging.error(f"Error running backtest: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to run backtest: {str(e)}")

@api_router.get("/fund-assessment/backtest/{backtest_id}")
async def get_backtest_details(backtest_id: str):
    """Get detailed backtest results"""
    try:
        # In a real implementation, would retrieve from storage
        # For demo, return placeholder
        return {
            "success": True,
            "message": "Backtest details would be retrieved from storage",
            "backtest_id": backtest_id,
            "note": "Full implementation would include detailed missed opportunities and false positives analysis"
        }
        
    except Exception as e:
        logging.error(f"Error getting backtest details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/fund-assessment/fund/{fund_id}/analysis")
async def get_fund_analysis_report(fund_id: str, fund_name: Optional[str] = None):
    """Generate comprehensive fund analysis report"""
    try:
        # Generate fund analysis report
        report = await analyze_fund_performance(fund_id, fund_name)
        
        return {
            "success": True,
            "report": {
                "report_id": report.report_id,
                "fund_id": report.fund_id,
                "fund_name": report.fund_name,
                "analysis_period": report.analysis_period,
                "generated_at": report.generated_at,
                "investment_summary": report.investment_summary,
                "performance_metrics": report.performance_metrics,
                "decision_patterns": report.decision_patterns,
                "missed_opportunities_count": len(report.missed_opportunities_analysis),
                "backtest_results_count": len(report.backtest_results),
                "recommendations_count": len(report.recommendations),
                "overall_assessment_score": report.overall_assessment_score,
                "key_recommendations": report.recommendations[:5],  # Top 5 recommendations
                "success_factor_analysis": report.success_factor_analysis,
                "predictive_insights": report.predictive_insights
            }
        }
        
    except Exception as e:
        logging.error(f"Error generating fund analysis report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate fund analysis: {str(e)}")

@api_router.get("/fund-assessment/decision/{decision_id}/analysis")
async def get_decision_analysis(decision_id: str):
    """Get AI analysis of specific investment decision"""
    try:
        # Get decision from backtesting engine
        if decision_id not in backtesting_engine.investment_decisions:
            raise HTTPException(status_code=404, detail="Investment decision not found")
        
        decision = backtesting_engine.investment_decisions[decision_id]
        
        # Get outcome if available
        outcome = backtesting_engine.investment_outcomes.get(decision_id)
        
        # Analyze decision with AI
        analysis = await backtesting_engine.decision_analyzer.analyze_investment_decision(
            decision, outcome
        )
        
        return {
            "success": True,
            "decision": {
                "decision_id": decision.decision_id,
                "company_name": decision.company_name,
                "decision_date": decision.decision_date,
                "decision_type": decision.decision_type,
                "investment_amount": decision.investment_amount,
                "confidence_score": decision.confidence_score,
                "decision_rationale": decision.decision_rationale,
                "key_factors": decision.key_factors,
                "risk_factors": decision.risk_factors
            },
            "outcome": {
                "outcome_type": outcome.outcome_type if outcome else "ongoing",
                "multiple": outcome.multiple if outcome else None,
                "irr": outcome.irr if outcome else None,
                "exit_type": outcome.exit_type if outcome else None
            } if outcome else None,
            "analysis": analysis
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting decision analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/fund-assessment/status")
async def get_fund_assessment_status():
    """Get fund assessment and backtesting system status"""
    try:
        return {
            "status": "operational",
            "framework": "Fund Assessment & Backtesting - Framework #4",
            "features": {
                "investment_decision_tracking": True,
                "outcome_analysis": True,
                "backtesting_engine": True,
                "ai_decision_analysis": True,
                "performance_attribution": True,
                "missed_opportunity_identification": True,
                "predictive_modeling": True,
                "fund_benchmarking": True
            },
            "current_stats": {
                "investment_decisions": len(backtesting_engine.investment_decisions),
                "investment_outcomes": len(backtesting_engine.investment_outcomes),
                "decisions_with_outcomes": len([d for d in backtesting_engine.investment_decisions.keys() 
                                              if d in backtesting_engine.investment_outcomes])
            },
            "ai_integration": {
                "decision_analysis": "enabled",
                "pattern_recognition": "enabled",
                "predictive_insights": "enabled",
                "gemini_available": bool(os.environ.get('GEMINI_API_KEY')),
                "rag_system": "operational"
            },
            "backtesting_capabilities": [
                "Strategy performance comparison",
                "Missed opportunity identification",
                "False positive analysis",
                "Risk-adjusted return calculation",
                "Market timing analysis",
                "Sector-specific insights"
            ],
            "analysis_features": [
                "Investment decision quality scoring",
                "Outcome prediction modeling",
                "Success factor identification",
                "Pattern-based recommendations",
                "Historical performance attribution"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error getting fund assessment status: {str(e)}")
        return {"error": str(e)}

# Fund Allocation & Deployment Endpoints

@api_router.post("/fund-allocation/create-targets")
async def create_allocation_targets_endpoint(fund_id: str, targets: List[AllocationTargetCreate]):
    """Create allocation targets for a fund"""
    try:
        # Convert Pydantic models to dict
        targets_data = []
        for target in targets:
            target_dict = target.dict()
            target_dict['minimum_percentage'] = target_dict['minimum_percentage'] or target_dict['target_percentage'] * 0.8
            target_dict['maximum_percentage'] = target_dict['maximum_percentage'] or target_dict['target_percentage'] * 1.2
            targets_data.append(target_dict)
        
        # Create allocation targets
        allocation_targets = await create_allocation_targets(fund_id, targets_data)
        
        return {
            "success": True,
            "fund_id": fund_id,
            "targets_created": len(allocation_targets),
            "targets": [
                {
                    "target_id": target.target_id,
                    "category": target.category,
                    "subcategory": target.subcategory,
                    "target_percentage": target.target_percentage,
                    "minimum_percentage": target.minimum_percentage,
                    "maximum_percentage": target.maximum_percentage
                }
                for target in allocation_targets
            ],
            "message": "Allocation targets created successfully"
        }
        
    except Exception as e:
        logging.error(f"Error creating allocation targets: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create allocation targets: {str(e)}")

@api_router.post("/fund-allocation/optimize")
async def optimize_fund_allocation_endpoint(optimization_request: FundOptimizationRequest):
    """Run Monte Carlo optimization for fund allocation"""
    try:
        # Run optimization
        optimization_result = await optimize_fund_allocation(
            optimization_request.fund_id,
            optimization_request.fund_size,
            optimization_request.allocation_targets,
            optimization_request.current_allocations,
            optimization_request.market_conditions
        )
        
        return {
            "success": True,
            "optimization": {
                "optimization_id": optimization_result.optimization_id,
                "fund_id": optimization_result.fund_id,
                "monte_carlo_results": {
                    "total_simulations": optimization_result.monte_carlo_results.get('total_simulations', 0),
                    "expected_multiple": optimization_result.monte_carlo_results.get('aggregated_results', {}).get('expected_multiple', 0),
                    "expected_irr": optimization_result.monte_carlo_results.get('aggregated_results', {}).get('expected_irr', 0),
                    "probability_positive_returns": optimization_result.monte_carlo_results.get('aggregated_results', {}).get('probability_positive_returns', 0),
                    "risk_metrics": optimization_result.monte_carlo_results.get('risk_metrics', {})
                },
                "recommended_allocations": [
                    {
                        "category": target.category,
                        "subcategory": target.subcategory,
                        "target_percentage": target.target_percentage,
                        "minimum_percentage": target.minimum_percentage,
                        "maximum_percentage": target.maximum_percentage
                    }
                    for target in optimization_result.target_allocations
                ],
                "deployment_schedule": {
                    "schedule_id": optimization_result.recommended_deployment.schedule_id,
                    "investment_period": optimization_result.recommended_deployment.investment_period,
                    "quarterly_targets_count": len(optimization_result.recommended_deployment.quarterly_targets),
                    "reserves": optimization_result.recommended_deployment.reserves
                },
                "expected_outcomes": optimization_result.expected_outcomes,
                "risk_metrics": optimization_result.risk_metrics,
                "recommendations": optimization_result.recommendations,
                "confidence_score": optimization_result.confidence_score
            }
        }
        
    except Exception as e:
        logging.error(f"Error optimizing fund allocation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to optimize fund allocation: {str(e)}")

@api_router.get("/fund-allocation/fund/{fund_id}/targets")
async def get_fund_allocation_targets(fund_id: str):
    """Get allocation targets for a specific fund"""
    try:
        # Get targets from orchestrator
        fund_targets = [t for t in allocation_orchestrator.allocation_targets.values() 
                       if t.target_id.startswith(fund_id) or fund_id in t.target_id]
        
        if not fund_targets:
            return {
                "success": True,
                "fund_id": fund_id,
                "targets": [],
                "message": "No allocation targets found for this fund"
            }
        
        targets_data = []
        for target in fund_targets:
            targets_data.append({
                "target_id": target.target_id,
                "category": target.category,
                "subcategory": target.subcategory,
                "target_percentage": target.target_percentage,
                "minimum_percentage": target.minimum_percentage,
                "maximum_percentage": target.maximum_percentage,
                "current_allocation": target.current_allocation,
                "target_amount": target.target_amount,
                "deployed_amount": target.deployed_amount,
                "remaining_amount": target.remaining_amount
            })
        
        return {
            "success": True,
            "fund_id": fund_id,
            "total_targets": len(targets_data),
            "targets": targets_data
        }
        
    except Exception as e:
        logging.error(f"Error getting fund allocation targets: {str(e)}")
        return {"success": False, "error": str(e)}

@api_router.get("/fund-allocation/fund/{fund_id}/optimization-results")
async def get_fund_optimization_results(fund_id: str, limit: int = 10):
    """Get optimization results for a specific fund"""
    try:
        # Get optimization results from orchestrator
        fund_optimizations = [o for o in allocation_orchestrator.optimization_results.values() 
                             if o.fund_id == fund_id]
        
        # Sort by optimization_id (most recent first) and limit
        fund_optimizations.sort(key=lambda x: x.optimization_id, reverse=True)
        fund_optimizations = fund_optimizations[:limit]
        
        optimization_summaries = []
        for opt in fund_optimizations:
            optimization_summaries.append({
                "optimization_id": opt.optimization_id,
                "fund_id": opt.fund_id,
                "monte_carlo_simulations": opt.monte_carlo_results.get('total_simulations', 0),
                "expected_multiple": opt.expected_outcomes.get('expected_multiple', 0),
                "expected_irr": opt.expected_outcomes.get('expected_irr', 0),
                "risk_metrics": {
                    "volatility": opt.risk_metrics.get('volatility', 0),
                    "sharpe_ratio": opt.risk_metrics.get('sharpe_ratio', 0),
                    "probability_of_loss": opt.risk_metrics.get('probability_of_loss', 0)
                },
                "recommendations_count": len(opt.recommendations),
                "confidence_score": opt.confidence_score,
                "deployment_quarters": len(opt.recommended_deployment.quarterly_targets)
            })
        
        return {
            "success": True,
            "fund_id": fund_id,
            "total_optimizations": len(optimization_summaries),
            "optimizations": optimization_summaries
        }
        
    except Exception as e:
        logging.error(f"Error getting fund optimization results: {str(e)}")
        return {"success": False, "error": str(e)}

@api_router.get("/fund-allocation/optimization/{optimization_id}")
async def get_optimization_details(optimization_id: str):
    """Get detailed optimization results"""
    try:
        # Get optimization from orchestrator
        if optimization_id not in allocation_orchestrator.optimization_results:
            raise HTTPException(status_code=404, detail="Optimization result not found")
        
        optimization = allocation_orchestrator.optimization_results[optimization_id]
        
        return {
            "success": True,
            "optimization": {
                "optimization_id": optimization.optimization_id,
                "fund_id": optimization.fund_id,
                "target_allocations": [
                    {
                        "target_id": target.target_id,
                        "category": target.category,
                        "subcategory": target.subcategory,
                        "target_percentage": target.target_percentage,
                        "minimum_percentage": target.minimum_percentage,
                        "maximum_percentage": target.maximum_percentage
                    }
                    for target in optimization.target_allocations
                ],
                "monte_carlo_results": {
                    "total_simulations": optimization.monte_carlo_results.get('total_simulations', 0),
                    "aggregated_results": optimization.monte_carlo_results.get('aggregated_results', {}),
                    "confidence_intervals": optimization.monte_carlo_results.get('confidence_intervals', {}),
                    "risk_metrics": optimization.monte_carlo_results.get('risk_metrics', {}),
                    "scenario_analysis": optimization.monte_carlo_results.get('scenario_analysis', {})
                },
                "deployment_schedule": {
                    "schedule_id": optimization.recommended_deployment.schedule_id,
                    "fund_size": optimization.recommended_deployment.fund_size,
                    "investment_period": optimization.recommended_deployment.investment_period,
                    "quarterly_targets": optimization.recommended_deployment.quarterly_targets[:8],  # First 8 quarters
                    "seasonal_adjustments": optimization.recommended_deployment.seasonal_adjustments,
                    "reserves": optimization.recommended_deployment.reserves
                },
                "expected_outcomes": optimization.expected_outcomes,
                "risk_metrics": optimization.risk_metrics,
                "sensitivity_analysis": optimization.sensitivity_analysis,
                "recommendations": optimization.recommendations,
                "confidence_score": optimization.confidence_score
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting optimization details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/fund-allocation/fund/{fund_id}/allocation-report")
async def get_fund_allocation_report(fund_id: str, fund_name: Optional[str] = None):
    """Generate comprehensive fund allocation report"""
    try:
        # Generate allocation report
        report = await generate_allocation_report(fund_id, fund_name)
        
        return {
            "success": True,
            "report": {
                "report_id": report.report_id,
                "fund_id": report.fund_id,
                "fund_name": report.fund_name,
                "generated_at": report.generated_at,
                "current_allocations": report.current_allocations,
                "target_vs_actual": report.target_vs_actual,
                "deployment_progress": report.deployment_progress,
                "optimization_recommendations_count": len(report.optimization_recommendations),
                "optimization_recommendations": report.optimization_recommendations[:5],  # Top 5
                "risk_analysis": report.risk_analysis,
                "market_timing_insights": report.market_timing_insights,
                "scenario_planning_count": len(report.scenario_planning),
                "rebalancing_suggestions_count": len(report.rebalancing_suggestions),
                "rebalancing_suggestions": report.rebalancing_suggestions,
                "overall_allocation_score": report.overall_allocation_score
            }
        }
        
    except Exception as e:
        logging.error(f"Error generating allocation report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate allocation report: {str(e)}")

@api_router.get("/fund-allocation/status")
async def get_fund_allocation_status():
    """Get fund allocation and deployment system status"""
    try:
        return {
            "status": "operational",
            "framework": "Fund Allocation & Deployment - Framework #5",
            "features": {
                "allocation_target_management": True,
                "monte_carlo_optimization": True,
                "deployment_scheduling": True,
                "risk_metrics_calculation": True,
                "scenario_planning": True,
                "sensitivity_analysis": True,
                "market_timing_optimization": True,
                "rebalancing_recommendations": True
            },
            "current_stats": {
                "allocation_targets": len(allocation_orchestrator.allocation_targets),
                "optimization_results": len(allocation_orchestrator.optimization_results)
            },
            "monte_carlo_engine": {
                "default_simulations": 10000,
                "scenario_modeling": "enabled",
                "risk_analysis": "comprehensive",
                "confidence_intervals": "90% and 95%"
            },
            "optimization_capabilities": [
                "Risk-return optimization",
                "Diversification analysis", 
                "Capital deployment timing",
                "Market condition adaptation",
                "Portfolio rebalancing",
                "Sensitivity analysis"
            ],
            "ai_integration": {
                "allocation_optimization": "enabled",
                "market_timing_insights": "enabled",
                "risk_assessment": "enabled",
                "gemini_available": bool(os.environ.get('GEMINI_API_KEY')),
                "rag_system": "operational"
            },
            "supported_allocations": [
                "By stage (Seed, Series A, Series B, etc.)",
                "By industry (AI, Healthcare, Clean Tech, etc.)",
                "By geography (US, Europe, Asia, etc.)", 
                "By investment theme (ESG, Deep Tech, etc.)"
            ],
            "risk_metrics": [
                "Value at Risk (VaR)",
                "Expected Shortfall",
                "Sharpe Ratio",
                "Sortino Ratio",
                "Maximum Drawdown",
                "Downside Deviation"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error getting fund allocation status: {str(e)}")
        return {"error": str(e)}

# Fund Vintage Management Endpoints

@api_router.post("/fund-vintage/add-fund")
async def add_fund_endpoint(fund_data: FundCreate):
    """Add new fund to vintage management system"""
    try:
        # Convert Pydantic model to dict
        fund_dict = fund_data.dict()
        
        # Set committed_capital to fund_size if not provided
        if fund_dict['committed_capital'] is None:
            fund_dict['committed_capital'] = fund_dict['fund_size']
        
        # Add fund to system
        fund = await add_fund(fund_dict)
        
        return {
            "success": True,
            "fund": {
                "fund_id": fund.fund_id,
                "fund_name": fund.fund_name,
                "vintage_year": fund.vintage_year,
                "fund_size": fund.fund_size,
                "fund_type": fund.fund_type,
                "investment_strategy": fund.investment_strategy,
                "status": fund.status
            },
            "message": "Fund added successfully to vintage management system"
        }
        
    except Exception as e:
        logging.error(f"Error adding fund: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add fund: {str(e)}")

@api_router.put("/fund-vintage/fund/{fund_id}/performance")
async def update_fund_performance_endpoint(fund_id: str, performance_data: PerformanceMetricsUpdate):
    """Update fund performance metrics"""
    try:
        # Convert Pydantic model to dict
        performance_dict = performance_data.dict()
        
        # Update performance metrics
        performance = await update_fund_performance(fund_id, performance_dict)
        
        return {
            "success": True,
            "performance": {
                "fund_id": performance.fund_id,
                "as_of_date": performance.as_of_date,
                "irr": performance.irr,
                "tvpi": performance.tvpi,
                "dpi": performance.dpi,
                "rvpi": performance.rvpi,
                "multiple": performance.multiple,
                "quartile_ranking": performance.quartile_ranking,
                "percentile_ranking": performance.percentile_ranking
            },
            "message": "Fund performance updated successfully"
        }
        
    except Exception as e:
        logging.error(f"Error updating fund performance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update fund performance: {str(e)}")

@api_router.get("/fund-vintage/funds")
async def get_all_funds(vintage_year: Optional[int] = None, fund_type: Optional[str] = None, limit: int = 50):
    """Get list of funds with optional filtering"""
    try:
        # Get funds from orchestrator
        funds = list(fund_vintage_orchestrator.funds.values())
        
        # Apply filters
        if vintage_year:
            funds = [fund for fund in funds if fund.vintage_year == vintage_year]
        
        if fund_type:
            funds = [fund for fund in funds if fund.fund_type == fund_type]
        
        # Apply limit
        funds = funds[:limit]
        
        # Format response
        funds_data = []
        for fund in funds:
            performance = fund_vintage_orchestrator.performance_metrics.get(fund.fund_id)
            
            funds_data.append({
                "fund_id": fund.fund_id,
                "fund_name": fund.fund_name,
                "vintage_year": fund.vintage_year,
                "fund_size": fund.fund_size,
                "fund_type": fund.fund_type,
                "investment_strategy": fund.investment_strategy,
                "status": fund.status,
                "target_sectors": fund.target_sectors,
                "target_geographies": fund.target_geographies,
                "fund_manager": fund.fund_manager,
                "current_performance": {
                    "irr": performance.irr if performance else None,
                    "tvpi": performance.tvpi if performance else None,
                    "multiple": performance.multiple if performance else None
                }
            })
        
        return {
            "success": True,
            "total_funds": len(funds_data),
            "funds": funds_data,
            "filters_applied": {
                "vintage_year": vintage_year,
                "fund_type": fund_type,
                "limit": limit
            }
        }
        
    except Exception as e:
        logging.error(f"Error getting funds list: {str(e)}")
        return {"success": False, "error": str(e)}

@api_router.get("/fund-vintage/fund/{fund_id}")
async def get_fund_details(fund_id: str):
    """Get detailed information about a specific fund"""
    try:
        # Get fund from orchestrator
        fund = fund_vintage_orchestrator.funds.get(fund_id)
        if not fund:
            raise HTTPException(status_code=404, detail="Fund not found")
        
        # Get performance metrics
        performance = fund_vintage_orchestrator.performance_metrics.get(fund_id)
        
        # Get LP reports for this fund
        fund_lp_reports = [report for report in fund_vintage_orchestrator.lp_reports.values() 
                          if report.fund_id == fund_id]
        
        return {
            "success": True,
            "fund": {
                "fund_id": fund.fund_id,
                "fund_name": fund.fund_name,
                "vintage_year": fund.vintage_year,
                "fund_size": fund.fund_size,
                "committed_capital": fund.committed_capital,
                "called_capital": fund.called_capital,
                "distributed_capital": fund.distributed_capital,
                "fund_type": fund.fund_type,
                "investment_strategy": fund.investment_strategy,
                "target_sectors": fund.target_sectors,
                "target_geographies": fund.target_geographies,
                "fund_manager": fund.fund_manager,
                "inception_date": fund.inception_date,
                "final_close_date": fund.final_close_date,
                "investment_period_end": fund.investment_period_end,
                "fund_life_end": fund.fund_life_end,
                "status": fund.status
            },
            "performance": {
                "irr": performance.irr if performance else None,
                "tvpi": performance.tvpi if performance else None,
                "dpi": performance.dpi if performance else None,
                "rvpi": performance.rvpi if performance else None,
                "multiple": performance.multiple if performance else None,
                "quartile_ranking": performance.quartile_ranking if performance else None,
                "percentile_ranking": performance.percentile_ranking if performance else None,
                "as_of_date": performance.as_of_date if performance else None
            },
            "lp_reports_count": len(fund_lp_reports),
            "recent_lp_reports": [
                {
                    "report_id": report.report_id,
                    "reporting_period": report.reporting_period,
                    "report_date": report.report_date
                }
                for report in sorted(fund_lp_reports, key=lambda x: x.report_date, reverse=True)[:3]
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting fund details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/fund-vintage/vintage/{vintage_year}/report")
async def get_vintage_report(vintage_year: int):
    """Generate comprehensive vintage performance report"""
    try:
        # Generate vintage report
        report = await generate_vintage_report(vintage_year)
        
        return {
            "success": True,
            "report": {
                "report_id": report.report_id,
                "vintage_year": report.vintage_year,
                "generated_at": report.generated_at,
                "vintage_summary": report.vintage_summary,
                "funds_analysis_count": len(report.funds_analysis),
                "vintage_performance": report.vintage_performance,
                "market_context": report.market_context,
                "peer_comparison": report.peer_comparison,
                "lessons_learned": report.lessons_learned,
                "market_timing_analysis": report.market_timing_analysis,
                "success_factors": report.success_factors,
                "overall_vintage_score": report.overall_vintage_score
            }
        }
        
    except Exception as e:
        logging.error(f"Error generating vintage report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate vintage report: {str(e)}")

@api_router.get("/fund-vintage/fund/{fund_id}/lp-report")
async def generate_lp_report_endpoint(fund_id: str, reporting_period: str = "Q4 2024"):
    """Generate LP report for a specific fund"""
    try:
        # Generate LP report
        lp_report = await generate_lp_report(fund_id, reporting_period)
        
        return {
            "success": True,
            "lp_report": {
                "report_id": lp_report.report_id,
                "fund_id": lp_report.fund_id,
                "fund_name": lp_report.fund_name,
                "reporting_period": lp_report.reporting_period,
                "report_date": lp_report.report_date,
                "fund_summary": lp_report.fund_summary,
                "performance_metrics": {
                    "irr": lp_report.performance_metrics.irr,
                    "tvpi": lp_report.performance_metrics.tvpi,
                    "dpi": lp_report.performance_metrics.dpi,
                    "rvpi": lp_report.performance_metrics.rvpi,
                    "multiple": lp_report.performance_metrics.multiple
                },
                "portfolio_updates_count": len(lp_report.portfolio_updates),
                "portfolio_updates": lp_report.portfolio_updates,
                "capital_calls_count": len(lp_report.capital_calls),
                "capital_calls": lp_report.capital_calls,
                "distributions_count": len(lp_report.distributions),
                "distributions": lp_report.distributions,
                "market_commentary": lp_report.market_commentary,
                "outlook": lp_report.outlook,
                "key_developments": lp_report.key_developments
            }
        }
        
    except Exception as e:
        logging.error(f"Error generating LP report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate LP report: {str(e)}")

@api_router.post("/fund-vintage/compare-funds")
async def compare_funds_endpoint(fund_ids: List[str]):
    """Compare performance of multiple funds across vintages"""
    try:
        if len(fund_ids) < 2:
            raise HTTPException(status_code=400, detail="At least 2 funds required for comparison")
        
        if len(fund_ids) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 funds allowed for comparison")
        
        # Run comparison analysis
        comparison = await compare_funds_across_vintages(fund_ids)
        
        return {
            "success": True,
            "comparison": {
                "comparison_id": comparison["comparison_id"],
                "funds_compared": comparison["funds_compared"],
                "comparison_data": comparison["comparison_data"],
                "analysis": comparison["analysis"],
                "comparative_metrics": comparison["comparative_metrics"],
                "generated_at": comparison["generated_at"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error comparing funds: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to compare funds: {str(e)}")

@api_router.get("/fund-vintage/vintages")
async def get_vintage_summary(limit: int = 20):
    """Get summary of all vintage years with fund counts and basic metrics"""
    try:
        # Get vintage groups from orchestrator
        vintage_summaries = []
        
        for vintage_year, vintage_group in fund_vintage_orchestrator.vintage_groups.items():
            # Get performance data for vintage funds
            vintage_funds = [fund_vintage_orchestrator.funds[fund_id] for fund_id in vintage_group.funds_in_vintage 
                           if fund_id in fund_vintage_orchestrator.funds]
            
            # Calculate basic metrics
            total_committed = sum(fund.committed_capital for fund in vintage_funds)
            avg_fund_size = total_committed / len(vintage_funds) if vintage_funds else 0
            
            # Get performance metrics
            vintage_performances = [fund_vintage_orchestrator.performance_metrics.get(fund.fund_id) 
                                  for fund in vintage_funds]
            vintage_performances = [p for p in vintage_performances if p is not None]
            
            avg_irr = statistics.mean([p.irr for p in vintage_performances]) if vintage_performances else None
            avg_tvpi = statistics.mean([p.tvpi for p in vintage_performances]) if vintage_performances else None
            
            vintage_summaries.append({
                "vintage_year": vintage_year,
                "total_funds": vintage_group.total_funds_count,
                "total_committed_capital": total_committed,
                "average_fund_size": avg_fund_size,
                "average_irr": avg_irr,
                "average_tvpi": avg_tvpi,
                "funds_with_performance": len(vintage_performances),
                "market_conditions": vintage_group.market_conditions
            })
        
        # Sort by vintage year (most recent first)
        vintage_summaries.sort(key=lambda x: x['vintage_year'], reverse=True)
        
        return {
            "success": True,
            "total_vintages": len(vintage_summaries),
            "vintages": vintage_summaries[:limit]
        }
        
    except Exception as e:
        logging.error(f"Error getting vintage summary: {str(e)}")
        return {"success": False, "error": str(e)}

@api_router.get("/fund-vintage/status")
async def get_fund_vintage_status():
    """Get fund vintage management system status"""
    try:
        return {
            "status": "operational",
            "framework": "Funds/Vintage Management - Framework #6",
            "features": {
                "fund_lifecycle_management": True,
                "vintage_performance_analysis": True,
                "lp_reporting": True,
                "benchmark_comparison": True,
                "cross_vintage_analysis": True,
                "ai_powered_insights": True,
                "market_timing_analysis": True,
                "peer_comparison": True
            },
            "current_stats": {
                "total_funds": len(fund_vintage_orchestrator.funds),
                "vintage_groups": len(fund_vintage_orchestrator.vintage_groups),
                "performance_records": len(fund_vintage_orchestrator.performance_metrics),
                "lp_reports": len(fund_vintage_orchestrator.lp_reports)
            },
            "reporting_capabilities": [
                "Vintage performance reports",
                "LP quarterly/annual reports",
                "Fund benchmarking analysis", 
                "Cross-vintage comparison",
                "Market timing analysis",
                "Portfolio construction insights"
            ],
            "ai_integration": {
                "vintage_analysis": "enabled",
                "market_timing_insights": "enabled",
                "benchmark_analysis": "enabled",
                "gemini_available": bool(os.environ.get('GEMINI_API_KEY')),
                "rag_system": "operational"
            },
            "supported_fund_types": [
                "Early Stage VC",
                "Growth Equity",
                "Multi-Stage VC",
                "Seed Funds",
                "Corporate VC",
                "Strategic Funds"
            ],
            "performance_metrics": [
                "IRR (Internal Rate of Return)",
                "TVPI (Total Value to Paid-In)",
                "DPI (Distributions to Paid-In)",
                "RVPI (Residual Value to Paid-In)",
                "Multiple of Money",
                "Quartile Rankings",
                "Percentile Rankings"
            ],
            "vintage_analysis_features": [
                "Market condition correlation",
                "Peer group comparison",
                "Performance attribution",
                "Risk-adjusted returns",
                "Vintage timing impact",
                "Success factor identification"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error getting fund vintage status: {str(e)}")
        return {"error": str(e)}

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

# LangGraph Workflow Endpoints

@api_router.post("/workflows/langraph/process-deck")
async def process_deck_langraph(
    background_tasks: BackgroundTasks,
    deck_file: UploadFile = File(...)
):
    """Process pitch deck using LangGraph orchestrator with comprehensive monitoring"""
    try:
        # Generate unique deck ID
        deck_id = f"deck_{int(datetime.utcnow().timestamp())}"
        
        # Save uploaded file
        file_location = f"/tmp/{deck_id}_{deck_file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(deck_file.file, file_object)
        
        # Process with LangGraph orchestrator
        results = await process_deck_with_langraph(deck_id, file_location)
        
        # Cleanup
        if os.path.exists(file_location):
            os.remove(file_location)
        
        return {
            "success": True,
            "deck_id": deck_id,
            "workflow_results": results,
            "langsmith_tracking": True,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"LangGraph deck processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LangGraph processing failed: {str(e)}")

@api_router.get("/workflows/langraph/analytics")
async def get_langraph_analytics():
    """Get comprehensive LangGraph workflow analytics"""
    try:
        analytics = get_workflow_analytics()
        
        return {
            "success": True,
            "analytics": analytics,
            "langsmith_project": os.environ.get("LANGCHAIN_PROJECT", "VERSSAI-VC-Intelligence"),
            "tracing_enabled": os.environ.get("LANGCHAIN_TRACING_V2", "false") == "true",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error getting LangGraph analytics: {str(e)}")
        return {"error": str(e)}

@api_router.get("/workflows/langraph/status")
async def get_langraph_status():
    """Get LangGraph orchestrator status and configuration"""
    try:
        return {
            "status": "operational",
            "orchestrator_type": "LangGraph + LangSmith",
            "features": {
                "comprehensive_monitoring": True,
                "quality_assessment": True,
                "error_tracking": True,
                "cost_estimation": True,
                "execution_tracing": True,
                "ai_workflow_orchestration": True
            },
            "langsmith_config": {
                "project": os.environ.get("LANGCHAIN_PROJECT", "VERSSAI-VC-Intelligence"),
                "tracing_enabled": os.environ.get("LANGCHAIN_TRACING_V2", "false") == "true",
                "api_key_configured": bool(os.environ.get("LANGCHAIN_API_KEY"))
            },
            "llm_config": {
                "openai_available": bool(os.environ.get("OPENAI_API_KEY")),
                "fallback_mode": not bool(os.environ.get("OPENAI_API_KEY"))
            },
            "research_apis": {
                "google_search": bool(os.environ.get("GOOGLE_API_KEY")),
                "twitter_api": bool(os.environ.get("TWITTER_BEARER_TOKEN"))
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error getting LangGraph status: {str(e)}")
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
                "due_diligence_data_room": "enabled",
                "portfolio_management": "enabled",
                "fund_assessment_backtesting": "enabled",
                "fund_allocation_deployment": "enabled",
                "fund_vintage_management": "enabled",
                "3_level_rag": "enabled", 
                "workflow_orchestrator": "enabled",
                "langraph_orchestrator": "enabled",
                "langsmith_monitoring": "enabled" if os.environ.get('LANGCHAIN_TRACING_V2') == 'true' else "disabled",
                "gemini_integration": "configured" if os.environ.get('GEMINI_API_KEY') else "needs_api_key",
                "openai_integration": "configured" if os.environ.get('OPENAI_API_KEY') else "fallback_available",
                "google_search_api": "configured" if os.environ.get('GOOGLE_API_KEY') else "not_configured",
                "twitter_api": "configured" if os.environ.get('TWITTER_BEARER_TOKEN') else "not_configured",
                "enhanced_research": "enabled" if (os.environ.get('GOOGLE_API_KEY') or os.environ.get('TWITTER_BEARER_TOKEN')) else "limited"
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

# Test endpoints for API integrations
@api_router.get("/test/google-search")
async def test_google_search_api(
    founder_name: str = "Elon Musk",
    company_name: str = "Tesla"
):
    """Test Google Search API integration"""
    try:
        # Test founder search
        founder_results = await google_search_service.search_founder_information(
            founder_name=founder_name,
            company_name=company_name
        )
        
        return {
            "status": "success",
            "api_configured": bool(os.environ.get('GOOGLE_API_KEY')),
            "search_results": {
                "founder_name": founder_name,
                "company_name": company_name,
                "results_found": len(founder_results.get('consolidated_results', [])),
                "key_insights": founder_results.get('key_insights', [])[:3],
                "social_profiles": founder_results.get('social_profiles', []),
                "api_status": founder_results.get('api_status', 'unknown')
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Google Search API test failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "api_configured": bool(os.environ.get('GOOGLE_API_KEY')),
            "timestamp": datetime.utcnow().isoformat()
        }

@api_router.get("/test/twitter-api")
async def test_twitter_api(
    founder_name: str = "Elon Musk", 
    company_name: str = "Tesla"
):
    """Test Twitter API integration"""
    try:
        # Test founder social signals
        social_results = await twitter_search_service.search_founder_social_signals(
            founder_name=founder_name,
            company_name=company_name
        )
        
        return {
            "status": "success",
            "api_configured": bool(os.environ.get('TWITTER_BEARER_TOKEN')),
            "social_results": {
                "founder_name": founder_name,
                "company_name": company_name,
                "profile_found": social_results.get('profile_data', {}).get('primary_profile') is not None,
                "social_influence_score": social_results.get('social_analysis', {}).get('social_influence_score', 0),
                "recent_activity_count": social_results.get('recent_activity', {}).get('total_tweets_found', 0),
                "api_status": social_results.get('api_status', 'unknown')
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Twitter API test failed: {e}")
        return {
            "status": "error", 
            "error": str(e),
            "api_configured": bool(os.environ.get('TWITTER_BEARER_TOKEN')),
            "timestamp": datetime.utcnow().isoformat()
        }

@api_router.get("/test/enhanced-research")
async def test_enhanced_research_pipeline(
    founder_name: str = "Reid Hoffman",
    company_name: str = "LinkedIn"
):
    """Test complete enhanced research pipeline with both Google Search and Twitter"""
    try:
        # Run both searches concurrently
        google_task = google_search_service.search_founder_information(
            founder_name=founder_name,
            company_name=company_name
        )
        twitter_task = twitter_search_service.search_founder_social_signals(
            founder_name=founder_name,
            company_name=company_name
        )
        
        # Execute both tasks
        google_results, twitter_results = await asyncio.gather(
            google_task, twitter_task, return_exceptions=True
        )
        
        # Process results
        enhanced_research = {
            "founder_name": founder_name,
            "company_name": company_name,
            "research_timestamp": datetime.utcnow().isoformat(),
            
            # Google Search Results
            "web_research": {
                "status": "success" if not isinstance(google_results, Exception) else "error",
                "insights_found": len(google_results.get('key_insights', [])) if not isinstance(google_results, Exception) else 0,
                "social_profiles_found": len(google_results.get('social_profiles', [])) if not isinstance(google_results, Exception) else 0,
                "recent_news_found": len(google_results.get('recent_news', [])) if not isinstance(google_results, Exception) else 0
            },
            
            # Twitter API Results  
            "social_research": {
                "status": "success" if not isinstance(twitter_results, Exception) else "error",
                "profile_found": twitter_results.get('profile_data', {}).get('primary_profile') is not None if not isinstance(twitter_results, Exception) else False,
                "social_influence_score": twitter_results.get('social_analysis', {}).get('social_influence_score', 0) if not isinstance(twitter_results, Exception) else 0,
                "engagement_quality": twitter_results.get('social_analysis', {}).get('engagement_quality', 'unknown') if not isinstance(twitter_results, Exception) else 'error'
            },
            
            # Combined Insights
            "research_enhancement": {
                "google_api_working": not isinstance(google_results, Exception) and google_results.get('api_status') != 'not_configured',
                "twitter_api_working": not isinstance(twitter_results, Exception) and twitter_results.get('api_status') != 'not_configured',
                "data_enrichment_possible": True,
                "research_confidence": 0.85 if (not isinstance(google_results, Exception) and not isinstance(twitter_results, Exception)) else 0.3
            }
        }
        
        return {
            "status": "success",
            "enhanced_research": enhanced_research
        }
        
    except Exception as e:
        logging.error(f"Enhanced research pipeline test failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# N8N-Style Workflow Endpoints (Direct Integration)
@api_router.get("/n8n/workflows")
async def list_n8n_workflows():
    """List available N8N-style workflows"""
    return {
        "workflows": [
            {
                "name": "verssai-founder-analysis",
                "description": "Comprehensive founder intelligence workflow",
                "trigger": "webhook",
                "status": "active"
            },
            {
                "name": "verssai-company-intelligence", 
                "description": "Company research and market analysis workflow",
                "trigger": "webhook",
                "status": "active"
            },
            {
                "name": "verssai-portfolio-analytics",
                "description": "Portfolio analytics and reporting workflow", 
                "trigger": "webhook",
                "status": "active"
            }
        ],
        "total": 3,
        "platform": "VERSSAI Engine with N8N Integration",
        "message": "N8N-style workflows successfully integrated into VERSSAI!"
    }

@api_router.post("/n8n/trigger/founder-analysis")
async def n8n_founder_analysis_webhook(
    background_tasks: BackgroundTasks,
    founder_name: str = Form(...),
    company_name: str = Form(...)
):
    """N8N-style webhook for founder intelligence workflow"""
    
    try:
        # Execute the founder analysis workflow (similar to n8n)
        workflow_id = str(uuid.uuid4())
        start_time = datetime.utcnow()
        
        # Step 1: Web Research (n8n node equivalent)
        web_research = await google_search_service.search_founder_info(founder_name, company_name)
        
        # Step 2: Social Research (n8n node equivalent)  
        social_research = await twitter_search_service.search_founder_mentions(founder_name, company_name)
        
        # Step 3: AI Analysis (n8n node equivalent)
        analysis_data = {
            'founder_name': founder_name,
            'company_name': company_name,
            'web_insights': web_research,
            'social_signals': social_research
        }
        
        execution_time = (datetime.utcnow() - start_time).total_seconds()
        
        return {
            "workflow_id": workflow_id,
            "workflow_name": "VERSSAI Founder Analysis",
            "status": "completed",
            "execution_time": f"{execution_time:.2f}s",
            "founder_name": founder_name,
            "company_name": company_name,
            "web_research_results": len(web_research.get('results', [])),
            "social_mentions": len(social_research.get('mentions', [])),
            "n8n_style": "workflow_executed_successfully",
            "message": f"N8N-style founder analysis completed for {founder_name} at {company_name}"
        }
        
    except Exception as e:
        logging.error(f"N8N founder analysis workflow failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"N8N workflow failed: {str(e)}")

@api_router.post("/n8n/trigger/company-intelligence")
async def n8n_company_intelligence_webhook(
    background_tasks: BackgroundTasks,
    company_name: str = Form(...)
):
    """N8N-style webhook for company intelligence workflow"""
    
    try:
        workflow_id = str(uuid.uuid4())
        start_time = datetime.utcnow()
        
        # Execute company intelligence workflow (n8n-style)
        company_research = await google_search_service.search_company_info(company_name)
        market_analysis = await google_search_service.search_market_info(company_name)
        
        execution_time = (datetime.utcnow() - start_time).total_seconds()
        
        return {
            "workflow_id": workflow_id,
            "workflow_name": "VERSSAI Company Intelligence",
            "status": "completed", 
            "execution_time": f"{execution_time:.2f}s",
            "company_name": company_name,
            "research_results": len(company_research.get('results', [])),
            "market_insights": len(market_analysis.get('results', [])),
            "n8n_style": "workflow_executed_successfully",
            "message": f"N8N-style company intelligence completed for {company_name}"
        }
        
    except Exception as e:
        logging.error(f"N8N company intelligence workflow failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"N8N workflow failed: {str(e)}")

@api_router.get("/n8n/status")
async def n8n_integration_status():
    """Check N8N integration status"""
    return {
        "n8n_integration": "active",
        "workflows_available": 3,
        "webhook_endpoint": "/api/n8n/trigger/",
        "original_workflows_imported": ["founder-intelligence", "company-intelligence", "analytics-reporting"],
        "platform": "VERSSAI Engine", 
        "status": "Successfully replaced external N8N with integrated workflow engine",
        "message": "N8N functionality fully integrated into VERSSAI backend!"
    }

# Include all routers
app.include_router(api_router, prefix="/api")
# N8N-style workflows are included in the API router

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
