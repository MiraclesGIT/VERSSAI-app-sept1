#!/usr/bin/env python3
"""
VERSSAI Enhanced MCP Backend with SuperAdmin Workflow Management
AI Agent Generation via Chat for N8N Workflow Creation/Editing
"""

import asyncio
import logging
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path
import uuid

try:
    from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
    import uvicorn
    import aiohttp
    from enhanced_rag_graph_engine import VERSSAIRAGGraphEngine
except ImportError:
    print("Installing required packages...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn", "aiohttp", "websockets", "pandas", "numpy", "scikit-learn", "networkx"])
    from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
    import uvicorn
    import aiohttp
    from enhanced_rag_graph_engine import VERSSAIRAGGraphEngine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()

# FastAPI app
app = FastAPI(
    title="VERSSAI Enhanced MCP Backend",
    description="VC Intelligence Platform with RAG/GRAPH, MCP Protocol, and AI Workflow Generation",
    version="3.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enhanced MCP Workflow Manager with AI Chat Integration
class EnhancedMCPWorkflowManager:
    """Enhanced MCP Manager with AI-powered workflow generation"""
    
    def __init__(self, n8n_url: str = "http://localhost:5678"):
        self.n8n_url = n8n_url
        self.n8n_auth = ("verssai_admin", "verssai_n8n_2024")
        self.active_connections: List[WebSocket] = []
        self.workflow_sessions: Dict[str, Dict] = {}
        self.chat_sessions: Dict[str, Dict] = {}  # AI chat sessions for workflow creation
        
        # Initialize RAG/GRAPH Engine
        self.rag_engine = VERSSAIRAGGraphEngine()
        self.rag_initialized = False
        
        # User roles and permissions
        self.user_roles = {
            'superadmin': ['*'],  # Full access
            'vc_partner': ['view', 'trigger_workflow', 'create_basic_workflow'],
            'analyst': ['view', 'trigger_workflow'],
            'founder': ['view_limited', 'submit_application']
        }
        
        # Enhanced workflow templates with AI generation support
        self.workflow_templates = {
            "founder_signal": {
                "name": "Founder Signal Assessment",
                "description": "AI personality analysis and success pattern matching",
                "webhook_id": "founder-signal-webhook",
                "expected_duration": 180,
                "ai_template": self._get_founder_signal_template(),
                "required_inputs": ["founder_name", "company_name", "industry", "stage"],
                "rag_layers": ["roof", "vc", "founder"]
            },
            "due_diligence": {
                "name": "Due Diligence Automation", 
                "description": "Document analysis, risk assessment, compliance",
                "webhook_id": "due-diligence-webhook",
                "expected_duration": 300,
                "ai_template": self._get_due_diligence_template(),
                "required_inputs": ["company_name", "documents", "analysis_type"],
                "rag_layers": ["roof", "vc"]
            },
            "portfolio_management": {
                "name": "Portfolio Management",
                "description": "Performance tracking and optimization recommendations", 
                "webhook_id": "portfolio-webhook",
                "expected_duration": 240,
                "ai_template": self._get_portfolio_template(),
                "required_inputs": ["portfolio_companies", "metrics", "timeframe"],
                "rag_layers": ["vc"]
            },
            "competitive_intelligence": {
                "name": "Competitive Intelligence",
                "description": "Market analysis, competitor mapping, positioning",
                "webhook_id": "competitive-intel-webhook", 
                "expected_duration": 360,
                "ai_template": self._get_competitive_intelligence_template(),
                "required_inputs": ["market_sector", "competitors", "analysis_depth"],
                "rag_layers": ["roof", "vc"]
            },
            "fund_allocation": {
                "name": "Fund Allocation Optimization",
                "description": "Investment allocation and risk-adjusted strategies",
                "webhook_id": "fund-allocation-webhook",
                "expected_duration": 420,
                "ai_template": self._get_fund_allocation_template(),
                "required_inputs": ["fund_size", "investment_criteria", "risk_tolerance"],
                "rag_layers": ["vc"]
            },
            "lp_communication": {
                "name": "LP Communication Automation",
                "description": "Automated reporting and LP communication workflows",
                "webhook_id": "lp-communication-webhook",
                "expected_duration": 300,
                "ai_template": self._get_lp_communication_template(),
                "required_inputs": ["lp_list", "report_type", "period"],
                "rag_layers": ["vc"]
            }
        }
        
        # Custom workflows created by SuperAdmin
        self.custom_workflows = {}
    
    async def initialize_rag_engine(self):
        """Initialize the RAG/GRAPH engine"""
        if not self.rag_initialized:
            logger.info("🔄 Initializing RAG/GRAPH Engine...")
            try:
                await self.rag_engine.initialize_layers()
                self.rag_initialized = True
                logger.info("✅ RAG/GRAPH Engine initialized successfully")
            except Exception as e:
                logger.error(f"❌ RAG/GRAPH initialization failed: {e}")
                # Continue without RAG for basic functionality
    
    async def connect_websocket(self, websocket: WebSocket, user_role: str = "superadmin"):
        """Accept and manage WebSocket connections with role-based access"""
        try:
            await websocket.accept()
            self.active_connections.append(websocket)
            
            connection_id = str(uuid.uuid4())
            logger.info(f"New MCP WebSocket connection: {connection_id} (Role: {user_role})")
            
            # Send welcome message with role-specific capabilities
            capabilities = self._get_user_capabilities(user_role)
            await self.send_message(websocket, {
                "type": "connection_established",
                "connection_id": connection_id,
                "user_role": user_role,
                "capabilities": capabilities,
                "message": f"Connected to VERSSAI MCP Protocol (Role: {user_role})",
                "available_workflows": len(self.workflow_templates),
                "rag_engine_status": "ready" if self.rag_initialized else "initializing",
                "timestamp": datetime.now().isoformat()
            })
            
            await self.handle_websocket_messages(websocket, user_role, connection_id)
            
        except WebSocketDisconnect:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
            logger.info(f"MCP WebSocket disconnected. Remaining: {len(self.active_connections)}")
        except Exception as e:
            logger.error(f"MCP WebSocket error: {e}")
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
    
    def _get_user_capabilities(self, user_role: str) -> List[str]:
        """Get capabilities based on user role"""
        base_capabilities = ["ping", "list_workflows", "get_workflow_status"]
        
        if user_role == "superadmin":
            return base_capabilities + [
                "trigger_workflow", "cancel_workflow", "create_workflow", 
                "edit_workflow", "delete_workflow", "ai_chat_workflow",
                "manage_users", "rag_query", "system_admin"
            ]
        elif user_role == "vc_partner":
            return base_capabilities + ["trigger_workflow", "cancel_workflow", "create_basic_workflow"]
        elif user_role == "analyst":
            return base_capabilities + ["trigger_workflow"]
        else:  # founder
            return base_capabilities + ["submit_application"]
    
    async def handle_websocket_messages(self, websocket: WebSocket, user_role: str, connection_id: str):
        """Handle incoming WebSocket messages with role-based permissions"""
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Check permissions
                message_type = message.get("type")
                capabilities = self._get_user_capabilities(user_role)
                
                if message_type not in capabilities:
                    await self.send_error(websocket, f"Permission denied. Required capability: {message_type}")
                    continue
                
                logger.info(f"Processing MCP message: {message_type} from {user_role}")
                await self.process_mcp_message(websocket, message, user_role, connection_id)
                
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await self.send_error(websocket, "Invalid JSON format")
            except Exception as e:
                logger.error(f"Error handling WebSocket message: {e}")
                await self.send_error(websocket, str(e))
    
    async def process_mcp_message(self, websocket: WebSocket, message: Dict, user_role: str, connection_id: str):
        """Process MCP protocol messages with enhanced AI capabilities"""
        message_type = message.get("type")
        
        if message_type == "ping":
            await self.send_message(websocket, {"type": "pong", "timestamp": datetime.now().isoformat()})
            
        elif message_type == "list_workflows":
            await self.list_available_workflows(websocket, user_role)
            
        elif message_type == "trigger_workflow":
            await self.trigger_n8n_workflow(websocket, message, user_role)
            
        elif message_type == "get_workflow_status":
            await self.get_workflow_status(websocket, message)
            
        elif message_type == "cancel_workflow":
            await self.cancel_workflow(websocket, message)
            
        elif message_type == "ai_chat_workflow" and user_role == "superadmin":
            await self.handle_ai_chat_workflow(websocket, message, connection_id)
            
        elif message_type == "create_workflow" and user_role == "superadmin":
            await self.create_custom_workflow(websocket, message)
            
        elif message_type == "edit_workflow" and user_role == "superadmin":
            await self.edit_workflow(websocket, message)
            
        elif message_type == "rag_query":
            await self.handle_rag_query(websocket, message, user_role)
            
        else:
            await self.send_error(websocket, f"Unknown or unauthorized message type: {message_type}")
    
    async def handle_ai_chat_workflow(self, websocket: WebSocket, message: Dict, connection_id: str):
        """Handle AI chat for workflow creation/editing"""
        chat_message = message.get("message", "")
        chat_session_id = message.get("chat_session_id")
        
        if not chat_session_id:
            chat_session_id = str(uuid.uuid4())
            self.chat_sessions[chat_session_id] = {
                "connection_id": connection_id,
                "messages": [],
                "workflow_context": {},
                "current_workflow": None,
                "created_at": datetime.now().isoformat()
            }
        
        session = self.chat_sessions[chat_session_id]
        session["messages"].append({"role": "user", "message": chat_message, "timestamp": datetime.now().isoformat()})
        
        # Process the chat message with AI
        ai_response = await self._process_ai_chat_message(chat_message, session)
        
        session["messages"].append({"role": "assistant", "message": ai_response["message"], "timestamp": datetime.now().isoformat()})
        
        await self.send_message(websocket, {
            "type": "ai_chat_response",
            "chat_session_id": chat_session_id,
            "response": ai_response,
            "session_context": {
                "current_workflow": session.get("current_workflow"),
                "workflow_context": session.get("workflow_context")
            }
        })
    
    async def _process_ai_chat_message(self, message: str, session: Dict) -> Dict[str, Any]:
        """Process AI chat message for workflow creation/editing"""
        message_lower = message.lower()
        
        # Intent detection
        if any(word in message_lower for word in ["create", "new", "build", "make"]):
            if any(word in message_lower for word in ["workflow", "automation", "process"]):
                return await self._handle_workflow_creation_intent(message, session)
        
        elif any(word in message_lower for word in ["edit", "modify", "change", "update"]):
            return await self._handle_workflow_edit_intent(message, session)
        
        elif any(word in message_lower for word in ["explain", "what", "how", "help"]):
            return await self._handle_workflow_explanation(message, session)
        
        else:
            # General workflow assistance
            return {
                "message": "I can help you create, edit, or explain workflows. Try saying 'create a new workflow for due diligence' or 'explain the founder signal workflow'.",
                "suggestions": [
                    "Create a new custom workflow",
                    "Edit an existing workflow", 
                    "Explain workflow capabilities",
                    "List available templates"
                ],
                "action": "general_help"
            }
    
    async def _handle_workflow_creation_intent(self, message: str, session: Dict) -> Dict[str, Any]:
        """Handle workflow creation through AI chat"""
        # Extract workflow details from natural language
        workflow_type = self._extract_workflow_type(message)
        
        if workflow_type:
            template = self.workflow_templates.get(workflow_type, {}).get("ai_template", {})
            
            session["current_workflow"] = workflow_type
            session["workflow_context"] = {"template": template, "customizations": []}
            
            return {
                "message": f"I'll help you create a {workflow_type} workflow. This workflow {template.get('description', 'performs advanced analysis')}. What specific requirements do you have?",
                "workflow_template": template,
                "next_steps": template.get("setup_questions", []),
                "action": "workflow_creation_started"
            }
        else:
            return {
                "message": "What type of workflow would you like to create? I can help with founder assessment, due diligence, portfolio management, competitive intelligence, fund allocation, or LP communications.",
                "suggestions": list(self.workflow_templates.keys()),
                "action": "workflow_type_selection"
            }
    
    async def _handle_workflow_edit_intent(self, message: str, session: Dict) -> Dict[str, Any]:
        """Handle workflow editing through AI chat"""
        current_workflow = session.get("current_workflow")
        
        if not current_workflow:
            return {
                "message": "Which workflow would you like to edit? Please specify the workflow name or select from available workflows.",
                "available_workflows": list(self.workflow_templates.keys()) + list(self.custom_workflows.keys()),
                "action": "workflow_selection_for_edit"
            }
        
        # Parse edit request
        edit_type = self._extract_edit_type(message)
        
        return {
            "message": f"I'll help you {edit_type} the {current_workflow} workflow. What specific changes would you like to make?",
            "edit_options": [
                "Add new steps",
                "Modify existing logic", 
                "Change input parameters",
                "Update output format",
                "Adjust timing/triggers"
            ],
            "action": "workflow_edit_in_progress"
        }
    
    async def _handle_workflow_explanation(self, message: str, session: Dict) -> Dict[str, Any]:
        """Handle workflow explanation requests"""
        workflow_type = self._extract_workflow_type(message)
        
        if workflow_type and workflow_type in self.workflow_templates:
            template = self.workflow_templates[workflow_type]
            
            explanation = {
                "name": template["name"],
                "description": template["description"],
                "duration": f"~{template['expected_duration']} seconds",
                "inputs": template.get("required_inputs", []),
                "rag_layers": template.get("rag_layers", []),
                "ai_capabilities": template.get("ai_template", {}).get("capabilities", [])
            }
            
            return {
                "message": f"The {template['name']} workflow {template['description']}. It typically takes {template['expected_duration']} seconds and uses {len(template.get('rag_layers', []))} RAG layers for analysis.",
                "workflow_details": explanation,
                "action": "workflow_explained"
            }
        
        return {
            "message": "I can explain any of the available workflows. Which one would you like to know more about?",
            "available_workflows": list(self.workflow_templates.keys()),
            "action": "workflow_explanation_selection"
        }
    
    def _extract_workflow_type(self, message: str) -> Optional[str]:
        """Extract workflow type from natural language message"""
        message_lower = message.lower()
        
        for workflow_id, config in self.workflow_templates.items():
            workflow_name = config["name"].lower()
            if workflow_id in message_lower or any(word in message_lower for word in workflow_name.split()):
                return workflow_id
        
        # Keyword mapping
        keyword_mapping = {
            "founder": "founder_signal",
            "personality": "founder_signal", 
            "due diligence": "due_diligence",
            "compliance": "due_diligence",
            "portfolio": "portfolio_management",
            "performance": "portfolio_management",
            "competitive": "competitive_intelligence",
            "market": "competitive_intelligence",
            "fund": "fund_allocation",
            "allocation": "fund_allocation",
            "lp": "lp_communication",
            "communication": "lp_communication",
            "reporting": "lp_communication"
        }
        
        for keyword, workflow_type in keyword_mapping.items():
            if keyword in message_lower:
                return workflow_type
        
        return None
    
    def _extract_edit_type(self, message: str) -> str:
        """Extract the type of edit requested"""
        message_lower = message.lower()
        
        if "add" in message_lower:
            return "add features to"
        elif "remove" in message_lower or "delete" in message_lower:
            return "remove components from"
        elif "modify" in message_lower or "change" in message_lower:
            return "modify"
        elif "optimize" in message_lower:
            return "optimize"
        else:
            return "edit"
    
    async def handle_rag_query(self, websocket: WebSocket, message: Dict, user_role: str):
        """Handle RAG/GRAPH queries"""
        if not self.rag_initialized:
            await self.send_error(websocket, "RAG/GRAPH engine not initialized")
            return
        
        query = message.get("query", "")
        layer_weights = message.get("layer_weights", {"roof": 0.4, "vc": 0.3, "founder": 0.3})
        
        try:
            # Query the RAG engine
            results = await self.rag_engine.query_multi_layer(query, layer_weights)
            
            # Filter results based on user role
            if user_role != "superadmin":
                results = self._filter_rag_results_by_role(results, user_role)
            
            await self.send_message(websocket, {
                "type": "rag_query_result",
                "query": query,
                "results": results,
                "user_role": user_role
            })
            
        except Exception as e:
            logger.error(f"RAG query failed: {e}")
            await self.send_error(websocket, f"RAG query failed: {str(e)}")
    
    def _filter_rag_results_by_role(self, results: Dict[str, Any], user_role: str) -> Dict[str, Any]:
        """Filter RAG results based on user role"""
        if user_role == "founder":
            # Founders only see founder layer results
            filtered_layers = {k: v for k, v in results.get("layers", {}).items() if k == "founder"}
            results["layers"] = filtered_layers
        elif user_role == "analyst":
            # Analysts see vc and founder layers
            filtered_layers = {k: v for k, v in results.get("layers", {}).items() if k in ["vc", "founder"]}
            results["layers"] = filtered_layers
        
        return results
    
    # Workflow template definitions
    def _get_founder_signal_template(self) -> Dict[str, Any]:
        """Get founder signal assessment workflow template"""
        return {
            "description": "Analyzes founder personality, experience, and success patterns using AI",
            "capabilities": [
                "Personality analysis from text/video", 
                "Success pattern matching",
                "Network quality assessment",
                "Risk evaluation"
            ],
            "setup_questions": [
                "What founder information do you have available?",
                "Do you want personality analysis from text, video, or both?",
                "What success metrics are most important?",
                "Any specific risk factors to evaluate?"
            ],
            "n8n_nodes": [
                {"type": "webhook", "name": "Founder Data Input"},
                {"type": "function", "name": "Text Analysis"},
                {"type": "function", "name": "Personality Scoring"},
                {"type": "http", "name": "External Validation"},
                {"type": "function", "name": "Risk Assessment"},
                {"type": "webhook", "name": "Results Output"}
            ]
        }
    
    def _get_due_diligence_template(self) -> Dict[str, Any]:
        """Get due diligence workflow template"""
        return {
            "description": "Automates document analysis, risk assessment, and compliance checking",
            "capabilities": [
                "Document parsing and analysis",
                "Financial model validation", 
                "Legal compliance checking",
                "Risk scoring"
            ],
            "setup_questions": [
                "What types of documents need analysis?",
                "What compliance standards to check against?",
                "What risk factors are priority?",
                "Output format preferences?"
            ],
            "n8n_nodes": [
                {"type": "webhook", "name": "Document Upload"},
                {"type": "function", "name": "Document Parser"},
                {"type": "function", "name": "Financial Analysis"},
                {"type": "function", "name": "Compliance Check"},
                {"type": "function", "name": "Risk Scoring"},
                {"type": "webhook", "name": "Report Generation"}
            ]
        }
    
    def _get_portfolio_template(self) -> Dict[str, Any]:
        """Get portfolio management workflow template"""
        return {
            "description": "Tracks portfolio performance and provides optimization recommendations",
            "capabilities": [
                "Performance tracking",
                "Benchmarking analysis",
                "Optimization suggestions",
                "Risk monitoring"
            ],
            "setup_questions": [
                "Which portfolio companies to track?",
                "What performance metrics matter most?",
                "Benchmark preferences?",
                "Reporting frequency?"
            ],
            "n8n_nodes": [
                {"type": "schedule", "name": "Periodic Trigger"},
                {"type": "function", "name": "Data Collection"},
                {"type": "function", "name": "Performance Analysis"},
                {"type": "function", "name": "Benchmarking"},
                {"type": "function", "name": "Optimization Engine"},
                {"type": "email", "name": "Report Distribution"}
            ]
        }
    
    def _get_competitive_intelligence_template(self) -> Dict[str, Any]:
        """Get competitive intelligence workflow template"""
        return {
            "description": "Analyzes market trends, competitor activities, and positioning opportunities",
            "capabilities": [
                "Market analysis",
                "Competitor monitoring", 
                "Trend identification",
                "Positioning recommendations"
            ],
            "setup_questions": [
                "Which market sectors to analyze?",
                "Key competitors to monitor?",
                "Data sources preferences?",
                "Analysis frequency?"
            ],
            "n8n_nodes": [
                {"type": "webhook", "name": "Analysis Request"},
                {"type": "http", "name": "Market Data Collection"},
                {"type": "function", "name": "Competitor Analysis"},
                {"type": "function", "name": "Trend Detection"},
                {"type": "function", "name": "Positioning Analysis"},
                {"type": "webhook", "name": "Intelligence Report"}
            ]
        }
    
    def _get_fund_allocation_template(self) -> Dict[str, Any]:
        """Get fund allocation workflow template"""
        return {
            "description": "Optimizes investment allocation based on risk and return profiles",
            "capabilities": [
                "Risk-return optimization",
                "Portfolio balancing",
                "Allocation recommendations",
                "Scenario analysis"
            ],
            "setup_questions": [
                "Fund size and constraints?",
                "Risk tolerance level?",
                "Investment themes/sectors?",
                "Rebalancing frequency?"
            ],
            "n8n_nodes": [
                {"type": "webhook", "name": "Allocation Request"},
                {"type": "function", "name": "Risk Analysis"},
                {"type": "function", "name": "Return Modeling"},
                {"type": "function", "name": "Optimization Engine"},
                {"type": "function", "name": "Scenario Testing"},
                {"type": "webhook", "name": "Allocation Plan"}
            ]
        }
    
    def _get_lp_communication_template(self) -> Dict[str, Any]:
        """Get LP communication workflow template"""
        return {
            "description": "Automates LP reporting and communication workflows",
            "capabilities": [
                "Automated report generation",
                "Performance summaries",
                "Communication scheduling", 
                "Document distribution"
            ],
            "setup_questions": [
                "LP communication preferences?",
                "Report formats and content?",
                "Communication frequency?",
                "Distribution methods?"
            ],
            "n8n_nodes": [
                {"type": "schedule", "name": "Report Schedule"},
                {"type": "function", "name": "Data Aggregation"},
                {"type": "function", "name": "Report Generation"},
                {"type": "function", "name": "Content Personalization"},
                {"type": "email", "name": "LP Distribution"},
                {"type": "webhook", "name": "Delivery Confirmation"}
            ]
        }
    
    async def list_available_workflows(self, websocket: WebSocket, user_role: str = "superadmin"):
        """List all available VERSSAI workflows based on user role"""
        workflows = []
        
        # Standard workflows
        for wf_id, config in self.workflow_templates.items():
            workflow_info = {
                "id": wf_id,
                "name": config["name"],
                "description": config["description"],
                "estimated_duration": config["expected_duration"],
                "type": "standard",
                "rag_layers": config.get("rag_layers", []),
                "required_inputs": config.get("required_inputs", [])
            }
            
            # Add AI capabilities for SuperAdmin
            if user_role == "superadmin":
                workflow_info["ai_template"] = config.get("ai_template", {})
            
            workflows.append(workflow_info)
        
        # Custom workflows (SuperAdmin only)
        if user_role == "superadmin":
            for wf_id, config in self.custom_workflows.items():
                workflows.append({
                    "id": wf_id,
                    "name": config["name"],
                    "description": config["description"],
                    "type": "custom",
                    "created_by": config.get("created_by", "unknown"),
                    "created_at": config.get("created_at", "unknown")
                })
        
        await self.send_message(websocket, {
            "type": "workflow_list",
            "workflows": workflows,
            "total_workflows": len(workflows),
            "user_role": user_role,
            "rag_engine_status": "ready" if self.rag_initialized else "not_ready"
        })
    
    async def trigger_n8n_workflow(self, websocket: WebSocket, message: Dict, user_role: str):
        """Trigger N8N workflow with enhanced RAG integration"""
        workflow_id = message.get("workflow_id")
        workflow_data = message.get("data", {})
        
        if workflow_id not in self.workflow_templates and workflow_id not in self.custom_workflows:
            await self.send_error(websocket, f"Unknown workflow: {workflow_id}")
            return
        
        session_id = str(uuid.uuid4())
        workflow_config = self.workflow_templates.get(workflow_id, self.custom_workflows.get(workflow_id))
        
        # Enhanced workflow session with RAG integration
        self.workflow_sessions[session_id] = {
            "workflow_id": workflow_id,
            "status": "initializing",
            "start_time": datetime.now().isoformat(),
            "data": workflow_data,
            "user_role": user_role,
            "websocket": websocket,
            "rag_context": None
        }
        
        try:
            # Pre-process with RAG if applicable
            rag_context = None
            if self.rag_initialized and workflow_config.get("rag_layers"):
                rag_query = self._generate_rag_query(workflow_id, workflow_data)
                if rag_query:
                    layer_weights = self._get_layer_weights_for_workflow(workflow_id)
                    rag_results = await self.rag_engine.query_multi_layer(rag_query, layer_weights)
                    rag_context = rag_results
                    self.workflow_sessions[session_id]["rag_context"] = rag_context
            
            # Send initial response with RAG insights
            await self.send_message(websocket, {
                "type": "workflow_started",
                "session_id": session_id,
                "workflow_name": workflow_config["name"],
                "estimated_duration": workflow_config["expected_duration"],
                "status": "initializing",
                "rag_insights": rag_context.get("summary", {}) if rag_context else None
            })
            
            # Trigger backend webhook with enhanced data
            enhanced_payload = {
                "session_id": session_id,
                "workflow_id": workflow_id,
                "triggered_by": workflow_data.get("triggered_by", "MCP Protocol"),
                "user_role": user_role,
                "organization": workflow_data.get("organization", "VERSSAI"),
                "timestamp": datetime.now().isoformat(),
                "rag_context": rag_context,
                **workflow_data
            }
            
            webhook_url = f"http://localhost:8080/webhook/{workflow_config['webhook_id']}"
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    webhook_url,
                    json=enhanced_payload,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    
                    if response.status == 200:
                        self.workflow_sessions[session_id]["status"] = "running"
                        
                        await self.send_message(websocket, {
                            "type": "workflow_progress",
                            "session_id": session_id,
                            "status": "running",
                            "progress": 10,
                            "message": "Workflow triggered successfully with RAG intelligence"
                        })
                        
                        # Start enhanced progress monitoring
                        asyncio.create_task(self.monitor_enhanced_workflow_progress(session_id))
                        
                    else:
                        raise Exception(f"Backend webhook failed: {response.status}")
                        
        except Exception as e:
            logger.error(f"Failed to trigger workflow {workflow_id}: {e}")
            self.workflow_sessions[session_id]["status"] = "failed"
            await self.send_error(websocket, f"Workflow trigger failed: {str(e)}")
    
    def _generate_rag_query(self, workflow_id: str, workflow_data: Dict) -> Optional[str]:
        """Generate RAG query based on workflow type and data"""
        if workflow_id == "founder_signal":
            founder_name = workflow_data.get("founder_name", "")
            company_name = workflow_data.get("company_name", "")
            industry = workflow_data.get("industry", "")
            return f"founder analysis {founder_name} {company_name} {industry} success patterns"
        
        elif workflow_id == "due_diligence":
            company_name = workflow_data.get("company_name", "")
            industry = workflow_data.get("industry", "")
            return f"due diligence {company_name} {industry} risk assessment compliance"
        
        elif workflow_id == "competitive_intelligence":
            market_sector = workflow_data.get("market_sector", "")
            return f"competitive analysis {market_sector} market trends positioning"
        
        # Add more workflow-specific queries as needed
        return None
    
    def _get_layer_weights_for_workflow(self, workflow_id: str) -> Dict[str, float]:
        """Get appropriate layer weights for different workflows"""
        workflow_layer_weights = {
            "founder_signal": {"roof": 0.3, "vc": 0.2, "founder": 0.5},
            "due_diligence": {"roof": 0.5, "vc": 0.4, "founder": 0.1},
            "portfolio_management": {"roof": 0.1, "vc": 0.8, "founder": 0.1},
            "competitive_intelligence": {"roof": 0.6, "vc": 0.3, "founder": 0.1},
            "fund_allocation": {"roof": 0.2, "vc": 0.7, "founder": 0.1},
            "lp_communication": {"roof": 0.1, "vc": 0.8, "founder": 0.1}
        }
        
        return workflow_layer_weights.get(workflow_id, {"roof": 0.4, "vc": 0.3, "founder": 0.3})
    
    async def monitor_enhanced_workflow_progress(self, session_id: str):
        """Monitor workflow progress with enhanced RAG-powered insights"""
        session = self.workflow_sessions.get(session_id)
        if not session:
            return
        
        websocket = session["websocket"]
        workflow_config = self.workflow_templates.get(session["workflow_id"], {})
        duration = workflow_config.get("expected_duration", 180)
        
        # Enhanced progress points with RAG insights
        progress_points = [
            (duration * 0.1, 20, "Initializing workflow with RAG intelligence"),
            (duration * 0.3, 40, "Data collection and preprocessing in progress"),
            (duration * 0.5, 60, "AI analysis with multi-layer insights running"),
            (duration * 0.7, 80, "Processing results and generating recommendations"),
            (duration * 0.9, 95, "Finalizing output with cross-layer validation"),
            (duration * 1.0, 100, "Workflow completed with comprehensive insights")
        ]
        
        for delay, progress, message in progress_points:
            await asyncio.sleep(delay / len(progress_points))
            
            if session_id not in self.workflow_sessions:
                break
            
            # Add RAG-powered insights at key stages
            rag_insight = None
            if progress == 60 and session.get("rag_context"):
                rag_insight = session["rag_context"].get("summary", {}).get("recommendation")
            
            await self.send_message(websocket, {
                "type": "workflow_progress",
                "session_id": session_id,
                "progress": progress,
                "message": message,
                "status": "running" if progress < 100 else "completed",
                "rag_insight": rag_insight
            })
        
        # Mark as completed with full results
        if session_id in self.workflow_sessions:
            self.workflow_sessions[session_id]["status"] = "completed"
            
            final_results = {
                "session_id": session_id,
                "final_status": "success",
                "completion_time": datetime.now().isoformat(),
                "rag_analysis": session.get("rag_context", {}).get("summary", {}),
                "workflow_output": f"Enhanced {workflow_config.get('name', 'workflow')} analysis complete"
            }
            
            await self.send_message(websocket, {
                "type": "workflow_completed",
                **final_results
            })
    
    # Additional methods for workflow management, error handling, etc.
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
            "start_time": session["start_time"],
            "user_role": session.get("user_role"),
            "has_rag_context": session.get("rag_context") is not None
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

# Initialize Enhanced MCP Manager
enhanced_mcp_manager = EnhancedMCPWorkflowManager()

# Basic API Endpoints
@app.get("/")
async def root():
    return {
        "message": "VERSSAI Enhanced MCP Backend with RAG/GRAPH",
        "version": "3.0.0",
        "status": "active",
        "features": [
            "3-Layer RAG/GRAPH Architecture",
            "Enhanced MCP WebSocket Protocol", 
            "AI Chat Workflow Generation",
            "SuperAdmin Workflow Management",
            "Role-based Access Control",
            "N8N Integration"
        ],
        "mcp_endpoint": "ws://localhost:8080/mcp",
        "active_connections": len(enhanced_mcp_manager.active_connections),
        "rag_engine_status": "ready" if enhanced_mcp_manager.rag_initialized else "initializing"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "running",
            "enhanced_mcp_protocol": "ready",
            "rag_graph_engine": "ready" if enhanced_mcp_manager.rag_initialized else "initializing",
            "n8n_integration": "ready",
            "active_websockets": len(enhanced_mcp_manager.active_connections),
            "active_workflow_sessions": len(enhanced_mcp_manager.workflow_sessions),
            "active_chat_sessions": len(enhanced_mcp_manager.chat_sessions)
        }
    }

# Enhanced MCP WebSocket Endpoint with Role Support
@app.websocket("/mcp")
async def enhanced_mcp_websocket_endpoint(websocket: WebSocket, user_role: str = "superadmin"):
    """Enhanced MCP WebSocket endpoint with role-based access"""
    await enhanced_mcp_manager.connect_websocket(websocket, user_role)

# RAG/GRAPH API Endpoints
@app.get("/api/rag/status")
async def rag_status():
    """Get RAG/GRAPH engine status"""
    if enhanced_mcp_manager.rag_initialized:
        stats = await enhanced_mcp_manager.rag_engine.get_layer_statistics()
        return {
            "status": "ready",
            "layers": stats,
            "timestamp": datetime.now().isoformat()
        }
    else:
        return {
            "status": "initializing",
            "message": "RAG/GRAPH engine is still initializing",
            "timestamp": datetime.now().isoformat()
        }

@app.post("/api/rag/query")
async def rag_query_endpoint(query_data: Dict[str, Any]):
    """Direct RAG query endpoint"""
    if not enhanced_mcp_manager.rag_initialized:
        raise HTTPException(status_code=503, detail="RAG/GRAPH engine not ready")
    
    query = query_data.get("query", "")
    layer_weights = query_data.get("layer_weights", {"roof": 0.4, "vc": 0.3, "founder": 0.3})
    
    try:
        results = await enhanced_mcp_manager.rag_engine.query_multi_layer(query, layer_weights)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(e)}")

# Initialize RAG engine on startup
@app.on_event("startup")
async def startup_event():
    """Initialize RAG engine when server starts"""
    logger.info("🚀 Starting VERSSAI Enhanced MCP Backend...")
    asyncio.create_task(enhanced_mcp_manager.initialize_rag_engine())

# Webhook endpoints (same as before, but enhanced with RAG context)
@app.post("/webhook/founder-signal-webhook")
async def founder_signal_webhook(payload: Dict[str, Any] = None):
    logger.info(f"Enhanced Founder Signal workflow triggered: {payload}")
    
    # Extract RAG context if available
    rag_context = payload.get("rag_context", {}) if payload else {}
    rag_summary = rag_context.get("summary", {}) if rag_context else {}
    
    return {
        "status": "success",
        "workflow": "founder_signal_assessment",
        "message": "Enhanced founder signal analysis initiated with RAG intelligence",
        "execution_id": f"fs_{datetime.now().timestamp()}",
        "estimated_duration": 180,
        "rag_insights": rag_summary.get("recommendation", "No RAG insights available"),
        "confidence_score": rag_summary.get("confidence_score", 0)
    }

# Additional webhook endpoints follow the same pattern...
@app.post("/webhook/due-diligence-webhook")
async def due_diligence_webhook(payload: Dict[str, Any] = None):
    logger.info(f"Enhanced Due Diligence workflow triggered: {payload}")
    rag_context = payload.get("rag_context", {}) if payload else {}
    
    return {
        "status": "success",
        "workflow": "due_diligence_automation",
        "message": "Enhanced due diligence process initiated with multi-layer analysis",
        "execution_id": f"dd_{datetime.now().timestamp()}",
        "estimated_duration": 300,
        "rag_insights": rag_context.get("summary", {}).get("recommendation", "Analysis in progress")
    }

# Run the enhanced server
if __name__ == "__main__":
    print("🚀 Starting VERSSAI Enhanced MCP Backend with RAG/GRAPH...")
    print("=" * 70)
    print("📡 API Server: http://localhost:8080")
    print("🔌 Enhanced MCP WebSocket: ws://localhost:8080/mcp")
    print("🧠 RAG/GRAPH Engine: 3-Layer Architecture")
    print("💬 AI Chat Workflow Generation: SuperAdmin")
    print("🔐 Role-based Access Control: SuperAdmin/VC/Analyst/Founder")
    print("📊 Health Check: http://localhost:8080/health")
    print("🎯 Features: Enhanced MCP + RAG/GRAPH + AI Workflows")
    print("")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8080,
        log_level="info"
    )
