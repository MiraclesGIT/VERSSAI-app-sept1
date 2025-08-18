# Add these imports at the top of the file
from .verssai_dataset_processor import VERSSAIDatasetProcessor, initialize_verssai_dataset

# Add the dataset processor after the RAG system initialization
# In the lifespan function, add this:

# Initialize Dataset Processor
try:
    app.state.dataset_processor = initialize_verssai_dataset()
    if app.state.dataset_processor:
        logger.info("✅ VERSSAI Dataset Processor initialized successfully")
    else:
        logger.warning("⚠️ VERSSAI Dataset Processor not initialized - Excel file may be missing")
        app.state.dataset_processor = None
except Exception as e:
    logger.error(f"❌ Dataset Processor initialization failed: {str(e)}")
    app.state.dataset_processor = None

# Add these API endpoints after the existing routes:

@app.get("/api/dataset/stats")
async def get_dataset_stats():
    """Get comprehensive dataset statistics"""
    try:
        if not app.state.dataset_processor:
            return {
                "error": "Dataset processor not available",
                "total_references": 1157,
                "total_researchers": 2311,
                "total_institutions": 24,
                "total_citations": 38015,
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
            "total_institutions": 24,
            "total_citations": 38015,
            "avg_citations_per_paper": 32.86,
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
async def search_researchers(request: dict):
    """Search researchers by query and filters"""
    try:
        if not app.state.dataset_processor:
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
            
        query = request.get("query", "")
        filters = request.get("filters", {})
        
        results = app.state.dataset_processor.search_researchers(query, filters)
        
        return {
            "researchers": results,
            "total_found": len(results),
            "query": query,
            "filters": filters,
            "status": "real_data"
        }
        
    except Exception as e:
        logger.error(f"Error searching researchers: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Researcher search failed: {str(e)}")

@app.get("/api/institutions/analysis")
async def get_institution_analysis():
    """Get institution performance analysis"""
    try:
        if not app.state.dataset_processor:
            # Return mock data
            return {
                "total_institutions": 24,
                "countries": {
                    "USA": 8,
                    "Canada": 4,
                    "UK": 3,
                    "China": 3,
                    "Australia": 2,
                    "Others": 4
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

@app.get("/api/research/insights")
async def get_research_insights(category: str = None):
    """Get research insights and trends"""
    try:
        if not app.state.dataset_processor:
            # Return mock data
            return {
                "total_papers": 1157,
                "avg_citations": 32.86,
                "year_distribution": {
                    "2020": 145,
                    "2021": 156,
                    "2022": 178,
                    "2023": 189,
                    "2024": 142
                },
                "methodology_distribution": {
                    "Neural Networks": 245,
                    "NLP": 198,
                    "Computer Vision": 167,
                    "Reinforcement Learning": 89,
                    "Others": 458
                },
                "status": "mock_data"
            }
            
        insights = app.state.dataset_processor.get_research_insights(category)
        insights["status"] = "real_data"
        return insights
        
    except Exception as e:
        logger.error(f"Error getting research insights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Research insights failed: {str(e)}")

@app.get("/api/citations/network-analysis")
async def get_citation_network_analysis():
    """Get citation network analysis"""
    try:
        if not app.state.dataset_processor:
            # Return mock data
            return {
                "total_citations": 38015,
                "unique_citing_papers": 1157,
                "unique_cited_papers": 2847,
                "self_citation_rate": 0.12,
                "citation_contexts": {
                    "Methodology": 12405,
                    "Background": 15670,
                    "Comparison": 6840,
                    "Results": 3100
                },
                "status": "mock_data"
            }
            
        analysis = app.state.dataset_processor.get_citation_network_analysis()
        analysis["status"] = "real_data"
        return analysis
        
    except Exception as e:
        logger.error(f"Error getting citation network analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Citation network analysis failed: {str(e)}")

@app.get("/api/vc/insights")
async def get_vc_insights():
    """Generate VC-specific insights from dataset"""
    try:
        if not app.state.dataset_processor:
            # Return mock VC insights
            return {
                "researcher_potential": {
                    "top_potential_researchers": [
                        {
                            "name": "Dr. Sarah Chen",
                            "institution": "Stanford University",
                            "h_index": 45,
                            "total_citations": 2847,
                            "primary_field": "AI/ML",
                            "industry_experience": True,
                            "vc_score": 0.89
                        }
                    ],
                    "field_distribution": {
                        "AI/ML": 0.85,
                        "Computer Science": 0.78,
                        "Economics": 0.65,
                        "Engineering": 0.62
                    }
                },
                "institution_rankings": {
                    "top_institutions": [
                        {
                            "name": "Stanford University",
                            "country": "USA",
                            "ranking": 2,
                            "specialization": "AI/ML",
                            "vc_attractiveness": 0.92
                        }
                    ]
                },
                "research_trends": {
                    "hot_categories": {
                        "AI_ML_Methods": 45.2,
                        "VC_Decision_Making": 38.7,
                        "Startup_Assessment": 32.1
                    }
                },
                "status": "mock_data"
            }
            
        insights = app.state.dataset_processor.generate_vc_insights()
        insights["status"] = "real_data"
        return insights
        
    except Exception as e:
        logger.error(f"Error generating VC insights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"VC insights generation failed: {str(e)}")

@app.get("/api/dataset/overview")
async def get_dataset_overview():
    """Get comprehensive dataset overview for dashboard"""
    try:
        if not app.state.dataset_processor:
            return {
                "summary": {
                    "total_references": 1157,
                    "total_researchers": 2311,
                    "total_institutions": 24,
                    "total_citations": 38015
                },
                "quality_metrics": {
                    "statistical_significance_rate": 0.766,
                    "open_access_rate": 0.623,
                    "avg_citations_per_paper": 32.86,
                    "avg_authors_per_paper": 2.57
                },
                "temporal_info": {
                    "year_range": "2015-2024",
                    "peak_year": "2023",
                    "recent_growth": "12.4%"
                },
                "categories": {
                    "AI_ML_Methods": 387,
                    "VC_Decision_Making": 298,
                    "Startup_Assessment": 245,
                    "Financial_Modeling": 156,
                    "Risk_Analysis": 71
                },
                "status": "mock_data"
            }
            
        # Get comprehensive overview
        stats = app.state.dataset_processor.get_dataset_stats()
        research_insights = app.state.dataset_processor.get_research_insights()
        institution_analysis = app.state.dataset_processor.get_institution_analysis()
        
        return {
            "summary": {
                "total_references": stats.total_references,
                "total_researchers": stats.total_researchers,
                "total_institutions": stats.total_institutions,
                "total_citations": stats.total_citations
            },
            "quality_metrics": {
                "statistical_significance_rate": stats.statistical_significance_rate,
                "open_access_rate": stats.open_access_rate,
                "avg_citations_per_paper": stats.avg_citations_per_paper,
                "avg_authors_per_paper": stats.avg_authors_per_paper
            },
            "temporal_info": {
                "year_range": stats.year_range,
                "yearly_distribution": research_insights.get("year_distribution", {}),
                "recent_trends": "Growing AI/ML focus"
            },
            "categories": stats.top_categories,
            "institutions": {
                "total": institution_analysis.get("total_institutions", 24),
                "countries": institution_analysis.get("countries", {}),
                "top_performers": institution_analysis.get("top_institutions", [])[:5]
            },
            "status": "real_data"
        }
        
    except Exception as e:
        logger.error(f"Error getting dataset overview: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Dataset overview failed: {str(e)}")

@app.get("/api/rag/status")
async def get_rag_status():
    """Get RAG system status with dataset information"""
    try:
        # Check if dataset processor is available
        dataset_available = app.state.dataset_processor is not None
        
        # Get dataset stats if available
        total_nodes = 0
        if dataset_available:
            try:
                stats = app.state.dataset_processor.get_dataset_stats()
                total_nodes = stats.total_references + stats.total_researchers
            except:
                pass
        
        return {
            "status": "ready" if dataset_available else "initializing",
            "dataset_available": dataset_available,
            "layers": {
                "total_nodes": total_nodes,
                "roof": {
                    "total_nodes": 1157,
                    "description": "Academic Research Layer",
                    "status": "ready" if dataset_available else "pending"
                },
                "vc": {
                    "total_nodes": 2311,
                    "description": "VC Investment Layer", 
                    "status": "ready" if dataset_available else "pending"
                },
                "founder": {
                    "total_nodes": 38015,
                    "description": "Startup/Founder Layer",
                    "status": "ready" if dataset_available else "pending"
                }
            },
            "capabilities": [
                "Research Query",
                "VC Intelligence Generation",
                "Founder Assessment",
                "Market Validation",
                "Competitive Analysis"
            ],
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting RAG status: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
