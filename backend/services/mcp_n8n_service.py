# backend/mcp_n8n_service.py
"""
MCP-like N8N Integration Service for VERSSAI
Provides WebSocket-based workflow triggering with SuperAdmin capabilities
"""

import asyncio
import json
import logging
import aiohttp
import websockets
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MCPWorkflowManager:
    """MCP-like protocol for N8N workflow management"""
    
    def __init__(self, n8n_url: str = "http://localhost:5678"):
        self.n8n_url = n8n_url
        self.n8n_auth = ("verssai_admin", "verssai_n8n_2024")  # From docker-compose
        self.active_connections: List[WebSocket] = []
        self.workflow_sessions: Dict[str, Dict] = {}
        
        # VERSSAI 6 Core Workflows
        self.workflow_templates = {
            "founder_signal": {
                "name": "Founder Signal Assessment",
                "description": "AI personality analysis and success pattern matching",
                "webhook_id": "founder-signal-webhook",
                "expected_duration": 180  # 3 minutes
            },
            "due_diligence": {
                "name": "Due Diligence Automation", 
                "description": "Document analysis, risk assessment, compliance",
                "webhook_id": "due-diligence-webhook",
                "expected_duration": 300  # 5 minutes
            },
            "portfolio_management": {
                "name": "Portfolio Management",
                "description": "Performance tracking and optimization recommendations", 
                "webhook_id": "portfolio-webhook",
                "expected_duration": 240  # 4 minutes
            },
            "competitive_intelligence": {
                "name": "Competitive Intelligence",
                "description": "Market analysis, competitor mapping, positioning",
                "webhook_id": "competitive-intel-webhook", 
                "expected_duration": 360  # 6 minutes
            },
            "fund_allocation": {
                "name": "Fund Allocation Optimization",
                "description": "Investment allocation and risk-adjusted strategies",
                "webhook_id": "fund-allocation-webhook",
                "expected_duration": 420  # 7 minutes
            },
            "lp_communication": {
                "name": "LP Communication Automation",
                "description": "Automated reporting and LP communication workflows",
                "webhook_id": "lp-communication-webhook",
                "expected_duration": 300  # 5 minutes
            }
        }
    
    async def connect_websocket(self, websocket: WebSocket):
        """Accept and manage WebSocket connections"""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket connection established. Total connections: {len(self.active_connections)}")
        
        try:
            await self.handle_websocket_messages(websocket)
        except WebSocketDisconnect:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket disconnected. Remaining connections: {len(self.active_connections)}")
    
    async def handle_websocket_messages(self, websocket: WebSocket):
        """Handle incoming WebSocket messages"""
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
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
        
        if message_type == "trigger_workflow":
            await self.trigger_n8n_workflow(websocket, message)
        elif message_type == "get_workflow_status":
            await self.get_workflow_status(websocket, message)
        elif message_type == "list_workflows":
            await self.list_available_workflows(websocket)
        elif message_type == "cancel_workflow":
            await self.cancel_workflow(websocket, message)
        else:
            await self.send_error(websocket, f"Unknown message type: {message_type}")
    
    async def trigger_n8n_workflow(self, websocket: WebSocket, message: Dict):
        """
        Updated MCP trigger method that uses backend webhooks instead of direct N8N calls
        """
        workflow_id = message.get("workflow_id")
        workflow_data = message.get("data", {})
        user_role = message.get("user_role", "analyst")
        
        # SuperAdmin permission check
        if user_role != "superadmin":
            await self.send_error(websocket, "Only SuperAdmin can trigger workflows")
            return
            
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
            
            # Call backend webhook instead of N8N directly
            webhook_url = f"http://localhost:8080/webhook/{workflow_config['webhook_id']}"
            
            # Prepare payload for backend webhook
            payload = {
                "session_id": session_id,
                "workflow_id": workflow_id,
                "triggered_by": message.get("data", {}).get("triggered_by", "Unknown"),
                "organization": message.get("data", {}).get("organization", "Unknown"),
                "timestamp": datetime.now().isoformat(),
                **workflow_data  # Include any additional workflow data
            }
            
            # Trigger backend webhook (which then triggers N8N)
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
                            "message": "Workflow triggered successfully in N8N"
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
        
        # Simulate progress updates (in real implementation, this would poll N8N API)
        progress_points = [
            (duration * 0.2, "Data ingestion started"),
            (duration * 0.4, "AI analysis in progress"), 
            (duration * 0.6, "Processing results"),
            (duration * 0.8, "Generating insights"),
            (duration * 1.0, "Workflow completed")
        ]
        
        for delay, message in progress_points:
            await asyncio.sleep(delay / len(progress_points))
            
            if session_id not in self.workflow_sessions:
                break  # Session was cancelled
                
            progress = int((delay / duration) * 100)
            
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
            "workflows": workflows
        })
    
    async def cancel_workflow(self, websocket: WebSocket, message: Dict):
        """Cancel a running workflow"""
        session_id = message.get("session_id")
        user_role = message.get("user_role", "analyst")
        
        # SuperAdmin permission check
        if user_role != "superadmin":
            await self.send_error(websocket, "Only SuperAdmin can cancel workflows")
            return
        
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
    
    async def broadcast_to_all(self, message: Dict):
        """Broadcast message to all connected clients"""
        if self.active_connections:
            tasks = [self.send_message(ws, message) for ws in self.active_connections]
            await asyncio.gather(*tasks, return_exceptions=True)

# Global MCP manager instance
mcp_manager = MCPWorkflowManager()

# FastAPI WebSocket endpoint (add to main server.py)
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for MCP N8N integration"""
    await mcp_manager.connect_websocket(websocket)
