# Enhanced MCP N8N Service with 3-Layer RAG Integration
# File: backend/enhanced_mcp_n8n_service.py

import os
import asyncio
import logging
import json
import uuid
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import websockets
import httpx
from fastapi import WebSocket, WebSocketDisconnect
import redis

# Import our enhanced RAG service
from enhanced_rag_service import enhanced_rag_service, RAGQuery, RAGResponse

class UserRole(Enum):
    SUPER_ADMIN = "SuperAdmin"
    VC_PARTNER = "VC_Partner"
    ANALYST = "Analyst"
    FOUNDER = "Founder"

class WorkflowType(Enum):
    FOUNDER_SIGNAL = "founder_signal"
    DUE_DILIGENCE = "due_diligence"
    PORTFOLIO_MANAGEMENT = "portfolio_management"
    COMPETITIVE_INTELLIGENCE = "competitive_intelligence"
    FUND_ALLOCATION = "fund_allocation"
    LP_COMMUNICATION = "lp_communication"

class WorkflowStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class WorkflowExecution:
    execution_id: str
    workflow_type: WorkflowType
    status: WorkflowStatus
    user_id: str
    organization_id: str
    parameters: Dict[str, Any]
    rag_layer: str
    progress: float = 0.0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    results: Optional[Dict[str, Any]] = None
    n8n_execution_id: Optional[str] = None
    error_message: Optional[str] = None

@dataclass
class MCPMessage:
    id: str
    type: str
    data: Dict[str, Any]
    timestamp: datetime
    user_id: str
    organization_id: str

class EnhancedMCPService:
    """Enhanced MCP Service with 3-Layer RAG and Advanced N8N Integration"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Connection management
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_sessions: Dict[str, Dict[str, Any]] = {}
        
        # Execution tracking
        self.active_executions: Dict[str, WorkflowExecution] = {}
        self.execution_callbacks: Dict[str, List[Callable]] = {}
        
        # N8N configuration
        self.n8n_base_url = os.getenv("N8N_URL", "http://localhost:5678")
        self.n8n_auth = {
            "user": os.getenv("N8N_BASIC_AUTH_USER", "verssai_admin"),
            "password": os.getenv("N8N_BASIC_AUTH_PASSWORD", "verssai_n8n_2024")
        }
        
        # Redis for execution persistence
        self.redis_client = None
        self._init_redis()
        
        # N8N workflow mapping
        self.workflow_mappings = {
            WorkflowType.FOUNDER_SIGNAL: {
                "webhook_id": "founder-signal-assessment",
                "workflow_name": "Founder Signal Assessment",
                "estimated_duration": 300,  # 5 minutes
                "rag_layer": "startup"
            },
            WorkflowType.DUE_DILIGENCE: {
                "webhook_id": "due-diligence-automation",
                "workflow_name": "Due Diligence Automation",
                "estimated_duration": 900,  # 15 minutes
                "rag_layer": "vc"
            },
            WorkflowType.PORTFOLIO_MANAGEMENT: {
                "webhook_id": "portfolio-analysis",
                "workflow_name": "Portfolio Management",
                "estimated_duration": 600,  # 10 minutes
                "rag_layer": "vc"
            },
            WorkflowType.COMPETITIVE_INTELLIGENCE: {
                "webhook_id": "competitive-intelligence",
                "workflow_name": "Competitive Intelligence",
                "estimated_duration": 480,  # 8 minutes
                "rag_layer": "roof"
            },
            WorkflowType.FUND_ALLOCATION: {
                "webhook_id": "fund-allocation-optimization",
                "workflow_name": "Fund Allocation Optimization",
                "estimated_duration": 720,  # 12 minutes
                "rag_layer": "vc"
            },
            WorkflowType.LP_COMMUNICATION: {
                "webhook_id": "lp-communication-automation",
                "workflow_name": "LP Communication Automation",
                "estimated_duration": 360,  # 6 minutes
                "rag_layer": "vc"
            }
        }

    def _init_redis(self):
        """Initialize Redis connection for execution persistence"""
        try:
            redis_host = os.getenv("REDIS_HOST", "localhost")
            redis_port = int(os.getenv("REDIS_PORT", "6379"))
            
            self.redis_client = redis.Redis(
                host=redis_host,
                port=redis_port,
                decode_responses=True
            )
            
            # Test connection
            self.redis_client.ping()
            self.logger.info(f"MCP Redis connected at {redis_host}:{redis_port}")
            
        except Exception as e:
            self.logger.warning(f"MCP Redis connection failed: {e}")
            self.redis_client = None

    async def connect_websocket(self, websocket: WebSocket, user_id: str, organization_id: str):
        """Handle new WebSocket connection"""
        await websocket.accept()
        
        connection_id = f"{user_id}_{organization_id}_{uuid.uuid4().hex[:8]}"
        self.active_connections[connection_id] = websocket
        
        # Initialize user session
        self.user_sessions[connection_id] = {
            "user_id": user_id,
            "organization_id": organization_id,
            "connected_at": datetime.now(),
            "last_activity": datetime.now()
        }
        
        self.logger.info(f"MCP WebSocket connected: {connection_id}")
        
        try:
            # Send welcome message
            await self._send_message(connection_id, {
                "type": "connection_established",
                "data": {
                    "connection_id": connection_id,
                    "server_time": datetime.now().isoformat(),
                    "available_workflows": [wf.value for wf in WorkflowType],
                    "rag_layers": ["roof", "vc", "startup"]
                }
            })
            
            # Listen for messages
            await self._handle_connection(connection_id, websocket)
            
        except WebSocketDisconnect:
            self.logger.info(f"MCP WebSocket disconnected: {connection_id}")
        except Exception as e:
            self.logger.error(f"MCP WebSocket error for {connection_id}: {e}")
        finally:
            await self._cleanup_connection(connection_id)

    async def _handle_connection(self, connection_id: str, websocket: WebSocket):
        """Handle incoming WebSocket messages"""
        while True:
            try:
                # Receive message
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                # Update last activity
                if connection_id in self.user_sessions:
                    self.user_sessions[connection_id]["last_activity"] = datetime.now()
                
                # Create MCP message
                mcp_message = MCPMessage(
                    id=message_data.get("id", str(uuid.uuid4())),
                    type=message_data.get("type", "unknown"),
                    data=message_data.get("data", {}),
                    timestamp=datetime.now(),
                    user_id=self.user_sessions[connection_id]["user_id"],
                    organization_id=self.user_sessions[connection_id]["organization_id"]
                )
                
                # Route message
                await self._route_message(connection_id, mcp_message)
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                self.logger.error(f"Error handling message for {connection_id}: {e}")
                await self._send_error(connection_id, str(e))

    async def _route_message(self, connection_id: str, message: MCPMessage):
        """Route incoming messages to appropriate handlers"""
        
        handlers = {
            "trigger_workflow": self._handle_trigger_workflow,
            "query_rag": self._handle_rag_query,
            "get_execution_status": self._handle_get_execution_status,
            "cancel_execution": self._handle_cancel_execution,
            "list_executions": self._handle_list_executions,
            "subscribe_execution": self._handle_subscribe_execution,
            "n8n_health_check": self._handle_n8n_health_check,
            "get_rag_layer_stats": self._handle_get_rag_layer_stats,
            "set_active_rag_layer": self._handle_set_active_rag_layer
        }
        
        handler = handlers.get(message.type)
        if handler:
            try:
                await handler(connection_id, message)
            except Exception as e:
                self.logger.error(f"Handler error for {message.type}: {e}")
                await self._send_error(connection_id, f"Handler error: {str(e)}")
        else:
            await self._send_error(connection_id, f"Unknown message type: {message.type}")

    async def _handle_trigger_workflow(self, connection_id: str, message: MCPMessage):
        """Handle workflow trigger requests"""
        try:
            workflow_type_str = message.data.get("workflow_type")
            parameters = message.data.get("parameters", {})
            
            # Validate workflow type
            try:
                workflow_type = WorkflowType(workflow_type_str)
            except ValueError:
                await self._send_error(connection_id, f"Invalid workflow type: {workflow_type_str}")
                return
            
            # Get workflow configuration
            workflow_config = self.workflow_mappings[workflow_type]
            
            # Create execution
            execution = WorkflowExecution(
                execution_id=str(uuid.uuid4()),
                workflow_type=workflow_type,
                status=WorkflowStatus.PENDING,
                user_id=message.user_id,
                organization_id=message.organization_id,
                parameters=parameters,
                rag_layer=workflow_config["rag_layer"],
                started_at=datetime.now()
            )
            
            # Store execution
            self.active_executions[execution.execution_id] = execution
            
            # Persist to Redis
            if self.redis_client:
                self.redis_client.setex(
                    f"execution:{execution.execution_id}",
                    3600,  # 1 hour TTL
                    json.dumps(asdict(execution), default=str)
                )
            
            # Send immediate response
            await self._send_message(connection_id, {
                "type": "workflow_triggered",
                "data": {
                    "execution_id": execution.execution_id,
                    "workflow_type": workflow_type.value,
                    "status": execution.status.value,
                    "estimated_duration": workflow_config["estimated_duration"]
                }
            })
            
            # Start workflow execution
            asyncio.create_task(self._execute_workflow(execution))
            
        except Exception as e:
            self.logger.error(f"Error triggering workflow: {e}")
            await self._send_error(connection_id, f"Failed to trigger workflow: {str(e)}")

    async def _execute_workflow(self, execution: WorkflowExecution):
        """Execute workflow with N8N and RAG integration"""
        try:
            # Update status to running
            execution.status = WorkflowStatus.RUNNING
            execution.progress = 0.1
            await self._broadcast_execution_update(execution)
            
            # Get workflow configuration
            workflow_config = self.workflow_mappings[execution.workflow_type]
            
            # Prepare N8N webhook payload
            n8n_payload = {
                "execution_id": execution.execution_id,
                "workflow_type": execution.workflow_type.value,
                "user_id": execution.user_id,
                "organization_id": execution.organization_id,
                "parameters": execution.parameters,
                "rag_layer": execution.rag_layer,
                "timestamp": datetime.now().isoformat()
            }
            
            # Trigger N8N workflow
            execution.progress = 0.2
            await self._broadcast_execution_update(execution)
            
            n8n_response = await self._trigger_n8n_workflow(
                workflow_config["webhook_id"],
                n8n_payload
            )
            
            execution.n8n_execution_id = n8n_response.get("execution_id")
            execution.progress = 0.3
            await self._broadcast_execution_update(execution)
            
            # Enhanced RAG processing
            if execution.parameters.get("use_rag", True):
                execution.progress = 0.4
                await self._broadcast_execution_update(execution)
                
                rag_results = await self._process_rag_queries(execution)
                if not execution.results:
                    execution.results = {}
                execution.results["rag_insights"] = rag_results
                
                execution.progress = 0.7
                await self._broadcast_execution_update(execution)
            
            # Wait for N8N completion (with timeout)
            n8n_results = await self._wait_for_n8n_completion(
                execution.n8n_execution_id,
                timeout=workflow_config["estimated_duration"]
            )
            
            # Combine results
            if not execution.results:
                execution.results = {}
            execution.results["n8n_output"] = n8n_results
            
            # Final processing and insights generation
            execution.progress = 0.9
            await self._broadcast_execution_update(execution)
            
            final_insights = await self._generate_final_insights(execution)
            execution.results["final_insights"] = final_insights
            
            # Mark as completed
            execution.status = WorkflowStatus.COMPLETED
            execution.progress = 1.0
            execution.completed_at = datetime.now()
            
            await self._broadcast_execution_update(execution)
            
            self.logger.info(f"Workflow {execution.execution_id} completed successfully")
            
        except Exception as e:
            # Mark as failed
            execution.status = WorkflowStatus.FAILED
            execution.error_message = str(e)
            execution.completed_at = datetime.now()
            
            await self._broadcast_execution_update(execution)
            
            self.logger.error(f"Workflow {execution.execution_id} failed: {e}")

    async def _process_rag_queries(self, execution: WorkflowExecution) -> Dict[str, Any]:
        """Process RAG queries based on workflow type and parameters"""
        
        # Define workflow-specific RAG queries
        rag_queries_map = {
            WorkflowType.FOUNDER_SIGNAL: [
                "founder personality assessment patterns",
                "successful founder characteristics",
                "leadership evaluation criteria"
            ],
            WorkflowType.DUE_DILIGENCE: [
                "due diligence best practices",
                "risk assessment frameworks",
                "document analysis methodologies"
            ],
            WorkflowType.PORTFOLIO_MANAGEMENT: [
                "portfolio optimization strategies",
                "performance tracking metrics",
                "risk management approaches"
            ],
            WorkflowType.COMPETITIVE_INTELLIGENCE: [
                "market analysis frameworks",
                "competitive positioning strategies",
                "industry trend analysis"
            ],
            WorkflowType.FUND_ALLOCATION: [
                "investment allocation strategies",
                "diversification principles",
                "risk-adjusted returns"
            ],
            WorkflowType.LP_COMMUNICATION: [
                "LP reporting best practices",
                "investor communication strategies",
                "performance presentation methods"
            ]
        }
        
        queries = rag_queries_map.get(execution.workflow_type, [])
        rag_results = {}
        
        for i, query_text in enumerate(queries):
            try:
                # Create RAG query
                rag_query = RAGQuery(
                    query=query_text,
                    layer=execution.rag_layer,
                    user_id=execution.user_id,
                    organization_id=execution.organization_id,
                    context=execution.parameters
                )
                
                # Execute RAG query
                rag_response = await enhanced_rag_service.query(rag_query)
                
                rag_results[f"query_{i+1}"] = {
                    "query": query_text,
                    "answer": rag_response.answer,
                    "confidence": rag_response.confidence,
                    "sources": [
                        {
                            "content": source["content"][:200] + "...",
                            "score": source["score"],
                            "collection": source["collection"]
                        }
                        for source in rag_response.sources[:3]
                    ]
                }
                
            except Exception as e:
                self.logger.error(f"RAG query failed for {query_text}: {e}")
                rag_results[f"query_{i+1}"] = {
                    "query": query_text,
                    "error": str(e)
                }
        
        return rag_results

    async def _trigger_n8n_workflow(self, webhook_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Trigger N8N workflow via webhook"""
        webhook_url = f"{self.n8n_base_url}/webhook/{webhook_id}"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                webhook_url,
                json=payload,
                auth=(self.n8n_auth["user"], self.n8n_auth["password"]),
                timeout=30.0
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"N8N webhook failed: {response.status_code} - {response.text}")

    async def _wait_for_n8n_completion(self, n8n_execution_id: str, timeout: int = 600) -> Dict[str, Any]:
        """Wait for N8N workflow completion with polling"""
        start_time = datetime.now()
        
        while (datetime.now() - start_time).total_seconds() < timeout:
            try:
                # Check execution status via N8N API
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        f"{self.n8n_base_url}/api/v1/executions/{n8n_execution_id}",
                        auth=(self.n8n_auth["user"], self.n8n_auth["password"])
                    )
                    
                    if response.status_code == 200:
                        execution_data = response.json()
                        
                        if execution_data.get("finished"):
                            return execution_data
                        elif execution_data.get("stoppedAt"):
                            raise Exception(f"N8N execution stopped: {execution_data.get('error', 'Unknown error')}")
                
                # Wait before next poll
                await asyncio.sleep(5)
                
            except Exception as e:
                self.logger.error(f"Error polling N8N execution {n8n_execution_id}: {e}")
                await asyncio.sleep(5)
        
        raise Exception(f"N8N execution {n8n_execution_id} timed out after {timeout} seconds")

    async def _generate_final_insights(self, execution: WorkflowExecution) -> Dict[str, Any]:
        """Generate final insights combining N8N and RAG results"""
        
        # Create a comprehensive query for final insights
        final_query_text = f"""
        Based on the {execution.workflow_type.value} analysis, provide strategic insights and recommendations.
        Consider the workflow results and provide actionable conclusions.
        """
        
        try:
            rag_query = RAGQuery(
                query=final_query_text,
                layer=execution.rag_layer,
                user_id=execution.user_id,
                organization_id=execution.organization_id,
                context={
                    "workflow_type": execution.workflow_type.value,
                    "n8n_results": execution.results.get("n8n_output", {}),
                    "rag_insights": execution.results.get("rag_insights", {}),
                    "parameters": execution.parameters
                }
            )
            
            rag_response = await enhanced_rag_service.query(rag_query)
            
            return {
                "summary": rag_response.answer,
                "confidence": rag_response.confidence,
                "key_findings": [
                    "Workflow executed successfully",
                    "RAG analysis completed",
                    "N8N automation processed"
                ],
                "recommendations": [
                    "Review detailed results",
                    "Consider next steps",
                    "Share insights with team"
                ],
                "processing_metrics": {
                    "total_duration": (execution.completed_at - execution.started_at).total_seconds() if execution.completed_at else None,
                    "rag_layer_used": execution.rag_layer,
                    "n8n_execution_id": execution.n8n_execution_id
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error generating final insights: {e}")
            return {
                "summary": "Analysis completed with partial results due to processing constraints.",
                "confidence": 0.5,
                "error": str(e)
            }

    async def _handle_rag_query(self, connection_id: str, message: MCPMessage):
        """Handle direct RAG queries"""
        try:
            query_text = message.data.get("query")
            layer = message.data.get("layer", "vc")
            
            if not query_text:
                await self._send_error(connection_id, "Query text is required")
                return
            
            # Create RAG query
            rag_query = RAGQuery(
                query=query_text,
                layer=layer,
                user_id=message.user_id,
                organization_id=message.organization_id,
                context=message.data.get("context", {}),
                filters=message.data.get("filters", {})
            )
            
            # Execute query
            rag_response = await enhanced_rag_service.query(rag_query)
            
            # Send response
            await self._send_message(connection_id, {
                "type": "rag_query_response",
                "data": asdict(rag_response)
            })
            
        except Exception as e:
            self.logger.error(f"Error handling RAG query: {e}")
            await self._send_error(connection_id, f"RAG query failed: {str(e)}")

    async def _handle_get_execution_status(self, connection_id: str, message: MCPMessage):
        """Handle execution status requests"""
        execution_id = message.data.get("execution_id")
        
        if not execution_id:
            await self._send_error(connection_id, "Execution ID is required")
            return
        
        execution = self.active_executions.get(execution_id)
        
        if not execution:
            # Try to load from Redis
            if self.redis_client:
                execution_data = self.redis_client.get(f"execution:{execution_id}")
                if execution_data:
                    execution_dict = json.loads(execution_data)
                    execution = WorkflowExecution(**execution_dict)
        
        if execution:
            await self._send_message(connection_id, {
                "type": "execution_status",
                "data": asdict(execution)
            })
        else:
            await self._send_error(connection_id, f"Execution {execution_id} not found")

    async def _handle_n8n_health_check(self, connection_id: str, message: MCPMessage):
        """Handle N8N health check requests"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.n8n_base_url}/healthz",
                    timeout=10.0
                )
                
                is_healthy = response.status_code == 200
                
                await self._send_message(connection_id, {
                    "type": "n8n_health_status",
                    "data": {
                        "healthy": is_healthy,
                        "status_code": response.status_code,
                        "url": self.n8n_base_url,
                        "timestamp": datetime.now().isoformat()
                    }
                })
                
        except Exception as e:
            await self._send_message(connection_id, {
                "type": "n8n_health_status",
                "data": {
                    "healthy": False,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
            })

    async def _handle_get_rag_layer_stats(self, connection_id: str, message: MCPMessage):
        """Handle RAG layer statistics requests"""
        try:
            layer_id = message.data.get("layer_id")
            
            if layer_id:
                stats = await enhanced_rag_service.get_layer_stats(layer_id)
            else:
                stats = await enhanced_rag_service.get_global_stats()
            
            await self._send_message(connection_id, {
                "type": "rag_layer_stats",
                "data": stats
            })
            
        except Exception as e:
            await self._send_error(connection_id, f"Failed to get RAG stats: {str(e)}")

    async def _broadcast_execution_update(self, execution: WorkflowExecution):
        """Broadcast execution updates to all interested connections"""
        update_message = {
            "type": "execution_update",
            "data": asdict(execution)
        }
        
        # Send to all connections for the same organization
        for connection_id, session in self.user_sessions.items():
            if session["organization_id"] == execution.organization_id:
                await self._send_message(connection_id, update_message)

    async def _send_message(self, connection_id: str, message: Dict[str, Any]):
        """Send message to specific connection"""
        if connection_id in self.active_connections:
            try:
                websocket = self.active_connections[connection_id]
                await websocket.send_text(json.dumps(message, default=str))
            except Exception as e:
                self.logger.error(f"Failed to send message to {connection_id}: {e}")
                await self._cleanup_connection(connection_id)

    async def _send_error(self, connection_id: str, error_message: str):
        """Send error message to connection"""
        await self._send_message(connection_id, {
            "type": "error",
            "data": {
                "message": error_message,
                "timestamp": datetime.now().isoformat()
            }
        })

    async def _cleanup_connection(self, connection_id: str):
        """Clean up connection and session data"""
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
        
        if connection_id in self.user_sessions:
            del self.user_sessions[connection_id]
        
        self.logger.info(f"Cleaned up connection: {connection_id}")

    async def get_active_connections_count(self) -> int:
        """Get number of active connections"""
        return len(self.active_connections)

    async def get_active_executions_count(self) -> int:
        """Get number of active executions"""
        return len([exec for exec in self.active_executions.values() 
                   if exec.status in [WorkflowStatus.PENDING, WorkflowStatus.RUNNING]])

# Singleton instance
enhanced_mcp_service = EnhancedMCPService()
