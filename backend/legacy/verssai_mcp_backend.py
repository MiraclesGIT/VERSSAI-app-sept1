#!/usr/bin/env python3
"""
VERSSAI Backend with MCP WebSocket Integration
Full backend including MCP protocol for N8N workflow automation
"""

import asyncio
import logging
import json
from datetime import datetime
from typing import Dict, Any, List
from pathlib import Path
import uuid

try:
    from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    import uvicorn
    import aiohttp
except ImportError:
    print("Installing required packages...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn", "aiohttp", "websockets"])
    from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    import uvicorn
    import aiohttp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="VERSSAI Backend with MCP",
    description="VC Intelligence Platform with MCP Protocol and N8N Integration",
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

# MCP Workflow Manager (from your existing code)
class MCPWorkflowManager:
    """MCP-like protocol for N8N workflow management"""
    
    def __init__(self, n8n_url: str = "http://localhost:5678"):
        self.n8n_url = n8n_url
        self.n8n_auth = ("verssai_admin", "verssai_n8n_2024")
        self.active_connections: List[WebSocket] = []
        self.workflow_sessions: Dict[str, Dict] = {}
        
        # VERSSAI 6 Core Workflows
        self.workflow_templates = {
            "founder_signal": {
                "name": "Founder Signal Assessment",
                "description": "AI personality analysis and success pattern matching",
                "webhook_id": "founder-signal-webhook",
                "expected_duration": 180
            },
            "due_diligence": {
                "name": "Due Diligence Automation", 
                "description": "Document analysis, risk assessment, compliance",
                "webhook_id": "due-diligence-webhook",
                "expected_duration": 300
            },
            "portfolio_management": {
                "name": "Portfolio Management",
                "description": "Performance tracking and optimization recommendations", 
                "webhook_id": "portfolio-webhook",
                "expected_duration": 240
            },
            "competitive_intelligence": {
                "name": "Competitive Intelligence",
                "description": "Market analysis, competitor mapping, positioning",
                "webhook_id": "competitive-intel-webhook", 
                "expected_duration": 360
            },
            "fund_allocation": {
                "name": "Fund Allocation Optimization",
                "description": "Investment allocation and risk-adjusted strategies",
                "webhook_id": "fund-allocation-webhook",
                "expected_duration": 420
            },
            "lp_communication": {
                "name": "LP Communication Automation",
                "description": "Automated reporting and LP communication workflows",
                "webhook_id": "lp-communication-webhook",
                "expected_duration": 300
            }
        }
    
    async def connect_websocket(self, websocket: WebSocket):
        """Accept and manage WebSocket connections"""
        try:
            await websocket.accept()
            self.active_connections.append(websocket)
            logger.info(f"New MCP WebSocket connection established. Total connections: {len(self.active_connections)}")
            
            # Send welcome message
            await self.send_message(websocket, {
                "type": "connection_established",
                "message": "Connected to VERSSAI MCP Protocol",
                "available_workflows": len(self.workflow_templates),
                "timestamp": datetime.now().isoformat()
            })
            
            await self.handle_websocket_messages(websocket)
            
        except WebSocketDisconnect:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
            logger.info(f"MCP WebSocket disconnected. Remaining connections: {len(self.active_connections)}")
        except Exception as e:
            logger.error(f"MCP WebSocket error: {e}")
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
    
    async def handle_websocket_messages(self, websocket: WebSocket):
        """Handle incoming WebSocket messages"""
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                logger.info(f"Received MCP message: {message.get('type', 'unknown')}")
                await self.process_mcp_message(websocket, message)
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await self.send_error(websocket, "Invalid JSON format")
            except Exception as e:
                logger.error(f"Error handling WebSocket message: {e}")
                await self.send_error(websocket, str(e))
    
    async def process_mcp_message(self, websocket: WebSocket, message: Dict):
        """Process MCP protocol messages"""
        message_type = message.get("type")
        
        if message_type == "ping":
            await self.send_message(websocket, {"type": "pong", "timestamp": datetime.now().isoformat()})
        elif message_type == "list_workflows":
            await self.list_available_workflows(websocket)
        elif message_type == "trigger_workflow":
            await self.trigger_n8n_workflow(websocket, message)
        elif message_type == "get_workflow_status":
            await self.get_workflow_status(websocket, message)
        elif message_type == "cancel_workflow":
            await self.cancel_workflow(websocket, message)
        else:
            await self.send_error(websocket, f"Unknown message type: {message_type}")
    
    async def list_available_workflows(self, websocket: WebSocket):
        """List all available VERSSAI workflows"""
        workflows = []
        for wf_id, config in self.workflow_templates.items():
            workflows.append({
                "id": wf_id,
                "name": config["name"],
                "description": config["description"],
                "estimated_duration": config["expected_duration"]
            })
        
        await self.send_message(websocket, {
            "type": "workflow_list",
            "workflows": workflows,
            "total_workflows": len(workflows)
        })
    
    async def trigger_n8n_workflow(self, websocket: WebSocket, message: Dict):
        """Trigger N8N workflow via backend webhooks"""
        workflow_id = message.get("workflow_id")
        workflow_data = message.get("data", {})
        user_role = message.get("user_role", "superadmin")  # Default to superadmin for testing
        
        if workflow_id not in self.workflow_templates:
            await self.send_error(websocket, f"Unknown workflow: {workflow_id}")
            return
        
        session_id = str(uuid.uuid4())
        workflow_config = self.workflow_templates[workflow_id]
        
        # Create workflow session
        self.workflow_sessions[session_id] = {
            "workflow_id": workflow_id,
            "status": "initializing",
            "start_time": datetime.now().isoformat(),
            "data": workflow_data,
            "websocket": websocket
        }
        
        try:
            # Send initial response
            await self.send_message(websocket, {
                "type": "workflow_started",
                "session_id": session_id,
                "workflow_name": workflow_config["name"],
                "estimated_duration": workflow_config["expected_duration"],
                "status": "initializing"
            })
            
            # Call backend webhook
            webhook_url = f"http://localhost:8080/webhook/{workflow_config['webhook_id']}"
            
            payload = {
                "session_id": session_id,
                "workflow_id": workflow_id,
                "triggered_by": workflow_data.get("triggered_by", "MCP Protocol"),
                "organization": workflow_data.get("organization", "VERSSAI"),
                "timestamp": datetime.now().isoformat(),
                **workflow_data
            }
            
            # Trigger backend webhook
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    webhook_url,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    
                    if response.status == 200:
                        self.workflow_sessions[session_id]["status"] = "running"
                        
                        await self.send_message(websocket, {
                            "type": "workflow_progress", 
                            "session_id": session_id,
                            "status": "running",
                            "progress": 10,
                            "message": "Workflow triggered successfully"
                        })
                        
                        # Start progress monitoring
                        asyncio.create_task(self.monitor_workflow_progress(session_id))
                        
                    else:
                        raise Exception(f"Backend webhook failed: {response.status}")
                        
        except Exception as e:
            logger.error(f"Failed to trigger workflow {workflow_id}: {e}")
            self.workflow_sessions[session_id]["status"] = "failed"
            await self.send_error(websocket, f"Workflow trigger failed: {str(e)}")
    
    async def monitor_workflow_progress(self, session_id: str):
        """Monitor workflow progress and send updates"""
        session = self.workflow_sessions.get(session_id)
        if not session:
            return
            
        websocket = session["websocket"]
        workflow_config = self.workflow_templates[session["workflow_id"]]
        duration = workflow_config["expected_duration"]
        
        # Simulate realistic progress updates
        progress_points = [
            (duration * 0.1, 20, "Initializing workflow"),
            (duration * 0.3, 40, "Data collection in progress"),
            (duration * 0.5, 60, "AI analysis running"), 
            (duration * 0.7, 80, "Processing results"),
            (duration * 0.9, 95, "Finalizing output"),
            (duration * 1.0, 100, "Workflow completed successfully")
        ]
        
        for delay, progress, message in progress_points:
            await asyncio.sleep(delay / len(progress_points))
            
            if session_id not in self.workflow_sessions:
                break  # Session was cancelled
            
            await self.send_message(websocket, {
                "type": "workflow_progress",
                "session_id": session_id, 
                "progress": progress,
                "message": message,
                "status": "running" if progress < 100 else "completed"
            })
        
        # Mark as completed
        if session_id in self.workflow_sessions:
            self.workflow_sessions[session_id]["status"] = "completed"
            await self.send_message(websocket, {
                "type": "workflow_completed",
                "session_id": session_id,
                "final_status": "success",
                "completion_time": datetime.now().isoformat()
            })
    
    async def get_workflow_status(self, websocket: WebSocket, message: Dict):
        """Get status of a running workflow"""
        session_id = message.get("session_id")
        
        if session_id not in self.workflow_sessions:
            await self.send_error(websocket, f"Session not found: {session_id}")
            return
            
        session = self.workflow_sessions[session_id]
        await self.send_message(websocket, {
            "type": "workflow_status",
            "session_id": session_id,
            "status": session["status"],
            "workflow_id": session["workflow_id"],
            "start_time": session["start_time"]
        })
    
    async def cancel_workflow(self, websocket: WebSocket, message: Dict):
        """Cancel a running workflow"""
        session_id = message.get("session_id")
        
        if session_id in self.workflow_sessions:
            del self.workflow_sessions[session_id]
            await self.send_message(websocket, {
                "type": "workflow_cancelled",
                "session_id": session_id
            })
        else:
            await self.send_error(websocket, f"Session not found: {session_id}")
    
    async def send_message(self, websocket: WebSocket, message: Dict):
        """Send message to WebSocket client"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Failed to send WebSocket message: {e}")
    
    async def send_error(self, websocket: WebSocket, error_message: str):
        """Send error message to WebSocket client"""
        await self.send_message(websocket, {
            "type": "error",
            "message": error_message,
            "timestamp": datetime.now().isoformat()
        })

# Initialize MCP Manager
mcp_manager = MCPWorkflowManager()

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
    ]
}

# Basic API Endpoints
@app.get("/")
async def root():
    return {
        "message": "VERSSAI Backend with MCP Protocol",
        "version": "2.0.0", 
        "status": "active",
        "features": ["MCP WebSocket Protocol", "N8N Integration", "Workflow Automation"],
        "mcp_endpoint": "ws://localhost:8080/mcp",
        "active_connections": len(mcp_manager.active_connections)
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "running",
            "mcp_protocol": "ready",
            "n8n_integration": "ready",
            "active_websockets": len(mcp_manager.active_connections)
        }
    }

# MCP WebSocket Endpoint
@app.websocket("/mcp")
async def mcp_websocket_endpoint(websocket: WebSocket):
    """MCP WebSocket endpoint for workflow management"""
    await mcp_manager.connect_websocket(websocket)

# N8N Webhook endpoints (same as before)
@app.post("/webhook/founder-signal-webhook")
async def founder_signal_webhook(payload: Dict[str, Any] = None):
    logger.info(f"Founder Signal workflow triggered via webhook: {payload}")
    return {
        "status": "success",
        "workflow": "founder_signal_assessment",
        "message": "Founder signal analysis initiated",
        "execution_id": f"fs_{datetime.now().timestamp()}",
        "estimated_duration": 180
    }

@app.post("/webhook/due-diligence-webhook") 
async def due_diligence_webhook(payload: Dict[str, Any] = None):
    logger.info(f"Due Diligence workflow triggered via webhook: {payload}")
    return {
        "status": "success",
        "workflow": "due_diligence_automation",
        "message": "Due diligence process initiated",
        "execution_id": f"dd_{datetime.now().timestamp()}",
        "estimated_duration": 300
    }

@app.post("/webhook/competitive-intel-webhook")
async def competitive_intel_webhook(payload: Dict[str, Any] = None):
    logger.info(f"Competitive Intelligence workflow triggered via webhook: {payload}")
    return {
        "status": "success",
        "workflow": "competitive_intelligence",
        "message": "Competitive analysis initiated",
        "execution_id": f"ci_{datetime.now().timestamp()}",
        "estimated_duration": 360
    }

@app.post("/webhook/portfolio-webhook")
async def portfolio_webhook(payload: Dict[str, Any] = None):
    logger.info(f"Portfolio Management workflow triggered via webhook: {payload}")
    return {
        "status": "success",
        "workflow": "portfolio_management",
        "message": "Portfolio analysis initiated",
        "execution_id": f"pm_{datetime.now().timestamp()}",
        "estimated_duration": 240
    }

@app.post("/webhook/fund-allocation-webhook")
async def fund_allocation_webhook(payload: Dict[str, Any] = None):
    logger.info(f"Fund Allocation workflow triggered via webhook: {payload}")
    return {
        "status": "success",
        "workflow": "fund_allocation_optimization", 
        "message": "Fund allocation analysis initiated",
        "execution_id": f"fa_{datetime.now().timestamp()}",
        "estimated_duration": 420
    }

@app.post("/webhook/lp-communication-webhook")
async def lp_communication_webhook(payload: Dict[str, Any] = None):
    logger.info(f"LP Communication workflow triggered via webhook: {payload}")
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
    return {"companies": mock_data["companies"], "total": len(mock_data["companies"])}

# MCP Status endpoint
@app.get("/api/mcp/status")
async def mcp_status():
    return {
        "status": "active",
        "protocol": "MCP v1.0",
        "active_connections": len(mcp_manager.active_connections),
        "workflow_sessions": len(mcp_manager.workflow_sessions),
        "available_workflows": len(mcp_manager.workflow_templates),
        "websocket_endpoint": "ws://localhost:8080/mcp"
    }

# Run the server
if __name__ == "__main__":
    print("🚀 Starting VERSSAI Backend with MCP Protocol...")
    print("=" * 60)
    print("📡 API Server: http://localhost:8080")
    print("🔌 MCP WebSocket: ws://localhost:8080/mcp")
    print("📊 Health Check: http://localhost:8080/health")
    print("⚡ Features: MCP Protocol + N8N Integration")
    print("🎯 Workflows: 6 VERSSAI automation workflows")
    print("")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8080,
        log_level="info"
    )
