#!/usr/bin/env python3
"""
Minimal VERSSAI Backend Starter
Quick server to get N8N + MCP integration working
"""

import asyncio
import logging
import json
from datetime import datetime
from typing import Dict, Any
from pathlib import Path

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    import uvicorn
except ImportError:
    print("Installing FastAPI...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn"])
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="VERSSAI Backend API",
    description="Minimal VC Intelligence Platform Backend",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data storage
mock_data = {
    "companies": [
        {
            "id": "vistim_labs",
            "name": "Vistim Labs", 
            "founder": "John Doe",
            "stage": "Series C",
            "location": "Salt Lake City, UT",
            "industry": ["AI", "MedTech"],
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
            "industry": ["Finance", "AI"],
            "founded_date": "2023-10-01",
            "readiness_score": 75,
            "description": "Advanced data analytics platform for financial institutions"
        }
    ],
    "workflows": [
        {"id": "founder_signal", "name": "Founder Signal Assessment", "status": "active"},
        {"id": "due_diligence", "name": "Due Diligence Automation", "status": "active"},
        {"id": "competitive_intel", "name": "Competitive Intelligence", "status": "active"},
        {"id": "portfolio_mgmt", "name": "Portfolio Management", "status": "active"},
        {"id": "fund_allocation", "name": "Fund Allocation Optimization", "status": "active"},
        {"id": "lp_communication", "name": "LP Communication", "status": "active"}
    ]
}

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "VERSSAI Backend API",
        "version": "1.0.0", 
        "status": "active",
        "timestamp": datetime.now().isoformat(),
        "features": ["N8N Integration", "MCP Protocol", "Workflow Automation"]
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "running",
            "n8n_integration": "ready",
            "mcp_protocol": "ready"
        }
    }

@app.get("/api/health")
async def api_health():
    """API health check"""
    return await health()

# N8N Webhook endpoints for workflow integration
@app.post("/webhook/founder-signal-webhook")
async def founder_signal_webhook(payload: Dict[str, Any] = None):
    """Founder Signal Assessment webhook"""
    logger.info(f"Founder Signal workflow triggered: {payload}")
    
    return {
        "status": "success",
        "workflow": "founder_signal_assessment",
        "message": "Founder signal analysis initiated",
        "execution_id": f"fs_{datetime.now().timestamp()}",
        "estimated_duration": 180
    }

@app.post("/webhook/due-diligence-webhook") 
async def due_diligence_webhook(payload: Dict[str, Any] = None):
    """Due Diligence Automation webhook"""
    logger.info(f"Due Diligence workflow triggered: {payload}")
    
    return {
        "status": "success",
        "workflow": "due_diligence_automation",
        "message": "Due diligence process initiated",
        "execution_id": f"dd_{datetime.now().timestamp()}",
        "estimated_duration": 300
    }

@app.post("/webhook/competitive-intel-webhook")
async def competitive_intel_webhook(payload: Dict[str, Any] = None):
    """Competitive Intelligence webhook"""
    logger.info(f"Competitive Intelligence workflow triggered: {payload}")
    
    return {
        "status": "success",
        "workflow": "competitive_intelligence",
        "message": "Competitive analysis initiated",
        "execution_id": f"ci_{datetime.now().timestamp()}",
        "estimated_duration": 360
    }

@app.post("/webhook/portfolio-webhook")
async def portfolio_webhook(payload: Dict[str, Any] = None):
    """Portfolio Management webhook"""
    logger.info(f"Portfolio Management workflow triggered: {payload}")
    
    return {
        "status": "success",
        "workflow": "portfolio_management",
        "message": "Portfolio analysis initiated",
        "execution_id": f"pm_{datetime.now().timestamp()}",
        "estimated_duration": 240
    }

@app.post("/webhook/fund-allocation-webhook")
async def fund_allocation_webhook(payload: Dict[str, Any] = None):
    """Fund Allocation Optimization webhook"""
    logger.info(f"Fund Allocation workflow triggered: {payload}")
    
    return {
        "status": "success",
        "workflow": "fund_allocation_optimization", 
        "message": "Fund allocation analysis initiated",
        "execution_id": f"fa_{datetime.now().timestamp()}",
        "estimated_duration": 420
    }

@app.post("/webhook/lp-communication-webhook")
async def lp_communication_webhook(payload: Dict[str, Any] = None):
    """LP Communication Automation webhook"""
    logger.info(f"LP Communication workflow triggered: {payload}")
    
    return {
        "status": "success",
        "workflow": "lp_communication_automation",
        "message": "LP communication process initiated",
        "execution_id": f"lp_{datetime.now().timestamp()}",
        "estimated_duration": 300
    }

# Company endpoints
@app.get("/api/companies")
async def get_companies():
    """Get all companies"""
    return {"companies": mock_data["companies"], "total": len(mock_data["companies"])}

@app.get("/api/companies/{company_id}")
async def get_company(company_id: str):
    """Get specific company"""
    company = next((c for c in mock_data["companies"] if c["id"] == company_id), None)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

# Workflow endpoints
@app.get("/api/workflows")
async def get_workflows():
    """Get all available workflows"""
    return {"workflows": mock_data["workflows"], "total": len(mock_data["workflows"])}

@app.post("/api/workflows/trigger")
async def trigger_workflow(workflow_data: Dict[str, Any]):
    """Trigger a workflow"""
    workflow_id = workflow_data.get("workflow_id")
    company_id = workflow_data.get("company_id")
    
    if not workflow_id:
        raise HTTPException(status_code=400, detail="workflow_id required")
    
    return {
        "status": "triggered",
        "workflow_id": workflow_id,
        "company_id": company_id,
        "execution_id": f"{workflow_id}_{datetime.now().timestamp()}",
        "message": f"Workflow {workflow_id} triggered successfully"
    }

# MCP WebSocket simulation (since we can't do real WebSocket easily here)
@app.get("/api/mcp/status")
async def mcp_status():
    """MCP service status"""
    return {
        "status": "active",
        "protocol": "MCP v1.0",
        "connected_clients": 0,
        "available_workflows": len(mock_data["workflows"])
    }

@app.post("/api/mcp/message")
async def mcp_message(message: Dict[str, Any]):
    """Send MCP message"""
    return {
        "status": "sent",
        "message_id": f"mcp_{datetime.now().timestamp()}",
        "response": "Message processed successfully"
    }

# Status endpoint for integration testing
@app.get("/api/status")
async def system_status():
    """Complete system status"""
    return {
        "api": "running",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "webhooks": 6,
            "companies": len(mock_data["companies"]),
            "workflows": len(mock_data["workflows"])
        },
        "integrations": {
            "n8n": "ready",
            "mcp": "ready",
            "frontend": "ready"
        }
    }

# Run the server
if __name__ == "__main__":
    print("🚀 Starting VERSSAI Backend API...")
    print("=" * 50)
    print("📡 Server: http://localhost:8080")
    print("📊 Health: http://localhost:8080/health")
    print("🔗 Webhooks: 6 N8N integration endpoints")
    print("⚡ Features: MCP protocol, workflow automation")
    print("")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8080,
        log_level="info"
    )
