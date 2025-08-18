#!/usr/bin/env python3
"""
Enhanced VERSSAI Backend with Academic Intelligence Integration
Combines existing VC platform with Academic Intelligence API
"""

import sys
import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json

# Add backend to path
sys.path.append(os.path.dirname(__file__))

# Import the academic API
try:
    from verssai_academic_csv_api import VERSSAIAcademicCSVAPI
    academic_api = VERSSAIAcademicCSVAPI()
    print("✅ Academic Intelligence API loaded successfully")
except Exception as e:
    print(f"⚠️  Academic API not available: {e}")
    academic_api = None

# Create enhanced FastAPI app
app = FastAPI(
    title="VERSSAI Enhanced VC Platform",
    description="AI-Powered VC Intelligence with Academic Research Integration",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== EXISTING VC ENDPOINTS ====================

@app.get("/")
async def root():
    return {
        "message": "VERSSAI Enhanced VC Platform", 
        "version": "2.0.0",
        "features": ["Deal Pipeline", "Academic Intelligence", "Research Insights"],
        "status": "active"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "vc_platform": "active",
            "academic_intelligence": "active" if academic_api else "unavailable"
        }
    }

# Mock VC deal endpoints (replace with your existing ones)
@app.get("/api/deals")
async def get_deals():
    """Get all deals from VC pipeline"""
    # This is a mock - replace with your actual deal logic
    mock_deals = [
        {
            "id": "deal-001",
            "company_name": "Neural Dynamics AI",
            "founders": [
                {"name": "Dr. Sarah Chen", "role": "CEO"},
                {"name": "Mike Rodriguez", "role": "CTO"}
            ],
            "stage": "Series A",
            "valuation": 12000000,
            "industry": "Artificial Intelligence",
            "status": "Due Diligence",
            "description": "AI-powered autonomous vehicle navigation system",
            "assigned_partner": "Jessica Williams"
        },
        {
            "id": "deal-002", 
            "company_name": "EcoLogistics Inc",
            "founders": [
                {"name": "Amanda Park", "role": "CEO"}
            ],
            "stage": "Seed",
            "valuation": 8000000,
            "industry": "Supply Chain",
            "status": "Qualified",
            "description": "Sustainable supply chain optimization platform",
            "assigned_partner": "David Kim"
        }
    ]
    return {"status": "success", "data": mock_deals}

# ==================== ACADEMIC INTELLIGENCE ENDPOINTS ====================

@app.get("/api/academic/stats")
async def get_academic_stats():
    """Get academic platform statistics"""
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic Intelligence not available")
    
    try:
        stats = academic_api.get_summary_stats()
        return {"status": "success", "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/academic/validate-founder")
async def validate_founder(founder_name: str):
    """Validate founder academic credentials"""
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic Intelligence not available")
    
    try:
        result = academic_api.validate_founder_background(founder_name)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/academic/research-insights")
async def get_research_insights(topic: str):
    """Get research insights for investment topic"""
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic Intelligence not available")
    
    try:
        result = academic_api.get_research_insights(topic)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/academic/find-experts")
async def find_academic_experts(field: str = None, min_h_index: int = 50):
    """Find academic experts for advisor recommendations"""
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic Intelligence not available")
    
    try:
        result = academic_api.find_expert_researchers(field, min_h_index)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ENHANCED DEAL ENDPOINTS ====================

@app.get("/api/deals/{deal_id}/academic-analysis")
async def get_deal_academic_analysis(deal_id: str):
    """Get academic analysis for a specific deal"""
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic Intelligence not available")
    
    try:
        # Get deal info (mock - replace with your actual deal lookup)
        deals_response = await get_deals()
        deals = deals_response["data"]
        deal = next((d for d in deals if d["id"] == deal_id), None)
        
        if not deal:
            raise HTTPException(status_code=404, detail="Deal not found")
        
        # Get academic insights for the deal
        founder_validation = None
        market_insights = None
        expert_recommendations = None
        
        # Validate founders
        if deal["founders"]:
            founder_name = deal["founders"][0]["name"]
            founder_validation = academic_api.validate_founder_background(founder_name)
        
        # Get market research insights
        if deal["industry"]:
            market_insights = academic_api.get_research_insights(deal["industry"])
        
        # Find potential academic advisors
        if deal["industry"]:
            expert_recommendations = academic_api.find_expert_researchers(deal["industry"], min_h_index=50)
        
        analysis = {
            "deal_id": deal_id,
            "company_name": deal["company_name"],
            "academic_intelligence": {
                "founder_validation": founder_validation,
                "market_insights": market_insights,
                "expert_recommendations": expert_recommendations[:5] if expert_recommendations else [],
                "overall_academic_score": calculate_academic_score(founder_validation, market_insights),
                "recommendations": generate_academic_recommendations(founder_validation, market_insights)
            }
        }
        
        return {"status": "success", "data": analysis}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_academic_score(founder_validation, market_insights):
    """Calculate overall academic credibility score for a deal"""
    score = 0
    
    if founder_validation and founder_validation.get('found_in_database'):
        score += founder_validation.get('academic_credibility', 0) * 0.4
    
    if market_insights:
        score += market_insights.get('confidence', 0) * 0.6
    
    return min(100, score)

def generate_academic_recommendations(founder_validation, market_insights):
    """Generate academic-based recommendations for the deal"""
    recommendations = []
    
    if founder_validation and founder_validation.get('found_in_database'):
        recommendations.append("✅ Founder has strong academic credentials - proceed with confidence")
    else:
        recommendations.append("⚠️ Consider validating founder's technical expertise through academic network")
    
    if market_insights and market_insights.get('confidence', 0) > 50:
        recommendations.append("✅ Strong academic research supports market opportunity")
    else:
        recommendations.append("⚠️ Limited academic research in this area - conduct additional market validation")
    
    return recommendations

# ==================== ENHANCED DASHBOARD ENDPOINT ====================

@app.get("/api/dashboard/enhanced")
async def get_enhanced_dashboard():
    """Get enhanced dashboard with academic intelligence"""
    try:
        # Get VC metrics
        deals_response = await get_deals()
        deals = deals_response["data"]
        
        vc_metrics = {
            "total_deals": len(deals),
            "deal_stages": {},
            "industries": {},
            "total_valuation": sum(deal["valuation"] for deal in deals)
        }
        
        # Count by stage and industry
        for deal in deals:
            stage = deal.get("stage", "Unknown")
            industry = deal.get("industry", "Unknown")
            vc_metrics["deal_stages"][stage] = vc_metrics["deal_stages"].get(stage, 0) + 1
            vc_metrics["industries"][industry] = vc_metrics["industries"].get(industry, 0) + 1
        
        # Get academic metrics
        academic_metrics = {}
        if academic_api:
            try:
                academic_stats = academic_api.get_summary_stats()
                academic_metrics = {
                    "total_papers": academic_stats.get("Total_References", 0),
                    "total_researchers": academic_stats.get("Total_Researchers", 0),
                    "total_citations": academic_stats.get("Total_Citations", 0),
                    "research_quality": academic_stats.get("Statistical_Significance_Rate", 0) * 100
                }
            except:
                academic_metrics = {"status": "unavailable"}
        
        dashboard = {
            "vc_platform": vc_metrics,
            "academic_intelligence": academic_metrics,
            "integration_status": "active" if academic_api else "limited",
            "enhanced_features": [
                "Founder Academic Validation",
                "Market Research Insights", 
                "Expert Advisor Recommendations",
                "Research-Backed Investment Decisions"
            ]
        }
        
        return {"status": "success", "data": dashboard}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Starting VERSSAI Enhanced VC Platform...")
    print("Features:")
    print("• VC Deal Pipeline Management")
    print("• Academic Intelligence Integration")
    print("• Founder Validation")
    print("• Research-Backed Market Insights")
    print("• Expert Advisor Recommendations")
    print("\nStarting server on http://localhost:8080")
    
    uvicorn.run(app, host="0.0.0.0", port=8080, reload=True)
