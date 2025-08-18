"""
VERSSAI Simplified Backend - Working without Database Dependencies
Provides core API functionality with dataset integration
"""

import asyncio
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union
from datetime import datetime
import json
import logging
import os
from pathlib import Path
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Pydantic Models
class RAGQueryRequest(BaseModel):
    query: str
    layer: str = "vc"  # roof, vc, founder
    limit: int = 10
    filters: Optional[Dict[str, Any]] = None

class ResearcherSearchRequest(BaseModel):
    query: str = ""
    filters: Optional[Dict[str, Any]] = {}

# Application startup/shutdown handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting VERSSAI Simplified Backend...")
    
    # Initialize Dataset Processor (optional)
    try:
        logger.info("📊 Initializing VERSSAI Dataset Processor...")
        # Import here to avoid startup issues
        from verssai_dataset_processor_corrected import initialize_verssai_dataset
        
        # Try to find the Excel file
        excel_paths = [
            "uploads/VERSSAI_Massive_Dataset_Complete.xlsx",
            "../uploads/VERSSAI_Massive_Dataset_Complete.xlsx",
            "VERSSAI_Massive_Dataset_Complete.xlsx"
        ]
        
        excel_path = None
        for path in excel_paths:
            if Path(path).exists():
                excel_path = path
                break
                
        if excel_path:
            app.state.dataset_processor = initialize_verssai_dataset(excel_path)
            if app.state.dataset_processor:
                logger.info("✅ Dataset processor initialized successfully")
                stats = app.state.dataset_processor.get_dataset_stats()
                if stats:
                    logger.info(f"📈 Dataset: {stats.total_references} papers, {stats.total_researchers} researchers")
            else:
                logger.warning("⚠️ Dataset processor initialization failed")
                app.state.dataset_processor = None
        else:
            logger.warning("⚠️ Excel dataset file not found")
            app.state.dataset_processor = None
            
    except Exception as e:
        logger.error(f"❌ Dataset processor error: {str(e)}")
        app.state.dataset_processor = None
    
    logger.info("✅ VERSSAI Simplified Backend started successfully")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down VERSSAI Simplified Backend...")

# Create FastAPI app
app = FastAPI(
    title="VERSSAI Simplified VC Intelligence Platform",
    description="Simplified VC platform with dataset integration (no database required)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# API Routes
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "VERSSAI Simplified VC Intelligence Platform",
        "version": "1.0.0",
        "status": "operational",
        "features": [
            "Dataset Integration", 
            "Researcher Search",
            "VC Insights",
            "Linear-Style UI Support"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    dataset_status = "available" if hasattr(app.state, 'dataset_processor') and app.state.dataset_processor else "unavailable"
    dataset_papers = 0
    dataset_researchers = 0
    
    if hasattr(app.state, 'dataset_processor') and app.state.dataset_processor:
        try:
            stats = app.state.dataset_processor.get_dataset_stats()
            if stats:
                dataset_papers = stats.total_references
                dataset_researchers = stats.total_researchers
        except:
            pass
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "services": {
            "api": "running",
            "dataset_processor": dataset_status,
            "linear_ui": "active"
        },
        "dataset": {
            "papers": dataset_papers,
            "researchers": dataset_researchers,
            "status": dataset_status
        }
    }

# Dataset API Endpoints
@app.get("/api/dataset/stats")
async def get_dataset_stats():
    """Get comprehensive dataset statistics"""
    try:
        if not hasattr(app.state, 'dataset_processor') or not app.state.dataset_processor:
            return {
                "error": "Dataset processor not available",
                "total_references": 1157,
                "total_researchers": 2311,
                "total_institutions": 25,
                "total_citations": 38016,
                "status": "simulated"
            }
            
        stats = app.state.dataset_processor.get_dataset_stats()
        if stats:
            return {
                "total_references": stats.total_references,
                "total_researchers": stats.total_researchers,
                "total_institutions": stats.total_institutions,
                "total_citations": stats.total_citations,
                "avg_citations_per_paper": stats.avg_citations_per_paper,
                "statistical_significance_rate": stats.statistical_significance_rate,
                "open_access_rate": stats.open_access_rate,
                "year_range": stats.year_range,
                "top_categories": stats.top_categories,
                "avg_authors_per_paper": stats.avg_authors_per_paper,
                "status": "real_data"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to get dataset stats")
            
    except Exception as e:
        logger.error(f"Error getting dataset stats: {str(e)}")
        # Return fallback data
        return {
            "total_references": 1157,
            "total_researchers": 2311,
            "total_institutions": 25,
            "total_citations": 38016,
            "avg_citations_per_paper": 32.8,
            "statistical_significance_rate": 0.766,
            "open_access_rate": 0.623,
            "year_range": "2015-2024",
            "top_categories": {
                "AI_ML_Methods": 387,
                "VC_Decision_Making": 298,
                "Startup_Assessment": 245,
                "Financial_Modeling": 156,
                "Risk_Analysis": 71
            },
            "avg_authors_per_paper": 2.57,
            "status": "fallback"
        }

@app.post("/api/researchers/search")
async def search_researchers(request: ResearcherSearchRequest):
    """Search researchers by query and filters"""
    try:
        if not hasattr(app.state, 'dataset_processor') or not app.state.dataset_processor:
            # Return mock data
            return {
                "researchers": [
                    {
                        "name": "Dr. Sarah Chen",
                        "institution": "Stanford University",
                        "h_index": 45,
                        "total_citations": 2847,
                        "primary_field": "AI/ML",
                        "industry_experience": True,
                        "funding_received": 2500000
                    },
                    {
                        "name": "Prof. Michael Rodriguez",
                        "institution": "MIT",
                        "h_index": 62,
                        "total_citations": 4238,
                        "primary_field": "Computer Science",
                        "industry_experience": True,
                        "funding_received": 3800000
                    }
                ],
                "total_found": 2,
                "status": "mock_data"
            }
            
        results = app.state.dataset_processor.search_researchers(request.query, request.filters)
        
        return {
            "researchers": results,
            "total_found": len(results),
            "query": request.query,
            "filters": request.filters,
            "status": "real_data"
        }
        
    except Exception as e:
        logger.error(f"Error searching researchers: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Researcher search failed: {str(e)}")

@app.get("/api/institutions/analysis")
async def get_institution_analysis():
    """Get institution performance analysis"""
    try:
        if not hasattr(app.state, 'dataset_processor') or not app.state.dataset_processor:
            # Return mock data
            return {
                "total_institutions": 25,
                "countries": {
                    "USA": 8,
                    "Canada": 4,
                    "UK": 3,
                    "China": 3,
                    "Australia": 2,
                    "Others": 5
                },
                "top_institutions": [
                    {
                        "name": "Stanford University",
                        "country": "USA",
                        "ranking": 2,
                        "research_output": 15420,
                        "collaboration_score": 0.89
                    },
                    {
                        "name": "MIT",
                        "country": "USA",
                        "ranking": 1,
                        "research_output": 18750,
                        "collaboration_score": 0.94
                    }
                ],
                "status": "mock_data"
            }
            
        analysis = app.state.dataset_processor.get_institution_analysis()
        analysis["status"] = "real_data"
        return analysis
        
    except Exception as e:
        logger.error(f"Error getting institution analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Institution analysis failed: {str(e)}")

@app.post("/api/rag/query")
async def query_rag_system(query_data: RAGQueryRequest):
    """Query the RAG system (simplified version)"""
    try:
        # Simplified RAG response
        return {
            'layer': query_data.layer,
            'query': query_data.query,
            'results': {
                'documents': [["Sample research paper about " + query_data.query]],
                'metadatas': [[{'source': 'verssai_dataset', 'layer': query_data.layer}]],
                'distances': [[0.2]]
            },
            'total_found': 1,
            'timestamp': datetime.utcnow().isoformat(),
            "summary": {
                "total_matches": 1,
                "confidence_score": 0.85,
                "recommendation": f"Found relevant research data for your query about {query_data.query}."
            }
        }
        
    except Exception as e:
        logger.error(f"RAG query failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(e)}")

# Workflow Management
@app.get("/api/workflows")
async def list_workflows():
    """List available VC workflows"""
    workflows = [
        {
            "id": "founder_signal",
            "name": "Founder Signal Assessment",
            "description": "AI personality analysis and success pattern matching",
            "category": "Assessment",
            "estimated_duration": 45,
            "required_inputs": ["founder_name", "company_name", "industry"],
            "rag_layers": ["vc", "founder"],
            "features": ["Personality Analysis", "Track Record", "Network Analysis", "Leadership Score"],
            "enabled": True
        },
        {
            "id": "due_diligence",
            "name": "Due Diligence Automation", 
            "description": "Document analysis, risk assessment, compliance checks",
            "category": "Research",
            "estimated_duration": 75,
            "required_inputs": ["company_name", "documents", "analysis_type"],
            "rag_layers": ["roof", "vc"],
            "features": ["Document Analysis", "Risk Assessment", "Compliance Check", "Red Flags"],
            "enabled": True
        },
        {
            "id": "portfolio_management",
            "name": "Portfolio Management",
            "description": "Performance tracking and optimization recommendations",
            "category": "Management", 
            "estimated_duration": 60,
            "required_inputs": ["portfolio_companies", "metrics", "timeframe"],
            "rag_layers": ["vc", "founder"],
            "features": ["Performance Tracking", "Optimization", "Benchmarking", "Alerts"],
            "enabled": True
        },
        {
            "id": "competitive_intelligence",
            "name": "Competitive Intelligence",
            "description": "Market analysis, competitor mapping, positioning",
            "category": "Intelligence",
            "estimated_duration": 90,
            "required_inputs": ["market_segment", "competitors", "focus_areas"],
            "rag_layers": ["roof", "vc", "founder"],
            "features": ["Market Mapping", "Competitor Analysis", "Positioning", "Opportunities"],
            "enabled": True
        },
        {
            "id": "fund_allocation",
            "name": "Fund Allocation Optimization",
            "description": "Investment allocation and risk-adjusted strategies",
            "category": "Strategy",
            "estimated_duration": 80,
            "required_inputs": ["fund_size", "investment_criteria", "risk_tolerance"],
            "rag_layers": ["vc", "founder"],
            "features": ["Portfolio Allocation", "Risk Adjustment", "Strategy Planning", "Scenarios"],
            "enabled": True
        },
        {
            "id": "lp_communication",
            "name": "LP Communication Automation",
            "description": "Automated reporting and LP communication workflows",
            "category": "Communication",
            "estimated_duration": 50,
            "required_inputs": ["lp_list", "performance_data", "communication_type"],
            "rag_layers": ["vc"],
            "features": ["Report Generation", "Communication Templates", "Updates", "Analytics"],
            "enabled": True
        }
    ]
    
    return {"workflows": workflows, "total_available": len(workflows)}

@app.get("/api/portfolios/companies")
async def get_portfolio_companies():
    """Get portfolio companies with enhanced intelligence"""
    companies = [
        {
            "id": "neural_dynamics_ai",
            "name": "Neural Dynamics AI",
            "stage": "Series A",
            "valuation": "$12M",
            "lastUpdate": "2 hours ago",
            "status": "performing",
            "signal": 89,
            "industry": "AI/ML",
            "description": "AI-powered neural network optimization for autonomous systems",
            "founder_signal_score": 0.89,
            "market_validation": "High",
            "risk_score": 0.25,
            "growth_potential": 0.91,
            "research_backing": 15
        },
        {
            "id": "quantum_health",
            "name": "Quantum Health Diagnostics", 
            "stage": "Series B",
            "valuation": "$28M",
            "lastUpdate": "1 day ago",
            "status": "growth",
            "signal": 92,
            "industry": "HealthTech",
            "description": "Quantum computing for early disease detection and personalized medicine",
            "founder_signal_score": 0.94,
            "market_validation": "Very High",
            "risk_score": 0.18,
            "growth_potential": 0.95,
            "research_backing": 23
        },
        {
            "id": "sustainable_materials",
            "name": "Sustainable Materials Corp",
            "stage": "Seed",
            "valuation": "$4M", 
            "lastUpdate": "3 days ago",
            "status": "watch",
            "signal": 76,
            "industry": "CleanTech",
            "description": "Bio-engineered materials for sustainable manufacturing",
            "founder_signal_score": 0.78,
            "market_validation": "Medium",
            "risk_score": 0.42,
            "growth_potential": 0.73,
            "research_backing": 8
        }
    ]
    
    return {"companies": companies, "total_count": len(companies)}

if __name__ == "__main__":
    uvicorn.run(
        "simple_verssai_backend:app",
        host="0.0.0.0",
        port=8080,
        reload=True,
        log_level="info"
    )
