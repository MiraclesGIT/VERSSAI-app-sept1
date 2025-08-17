# backend/n8n_webhook_endpoints.py
"""
N8N Webhook Endpoints for VERSSAI
Connects Linear UI to N8N Workflows
"""

import httpx
import logging
import json
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import Request, HTTPException

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# N8N Configuration
N8N_URL = "http://localhost:5678"
N8N_AUTH = ("verssai_admin", "verssai_n8n_2024")

class N8NTrigger:
    """N8N Workflow Trigger Manager"""
    
    def __init__(self):
        self.workflow_mapping = {
            "founder_signal": {
                "id": "founder-signal-assessment-v1",
                "name": "Founder Signal Assessment",
                "description": "AI-powered founder background analysis",
                "webhook_id": "founder-signal-webhook",
                "estimated_time": "3-5 minutes"
            },
            "due_diligence": {
                "id": "due-diligence-automation-v1",
                "name": "Due Diligence Automation",
                "description": "Document analysis and risk assessment",
                "webhook_id": "due-diligence-webhook",
                "estimated_time": "5-10 minutes"
            },
            "portfolio_management": {
                "id": "portfolio-management-v1",
                "name": "Portfolio Management",
                "description": "Performance tracking and optimization",
                "webhook_id": "portfolio-webhook",
                "estimated_time": "4-8 minutes"
            },
            "competitive_intelligence": {
                "id": "competitive-intelligence-v1",
                "name": "Competitive Intelligence",
                "description": "Market analysis and competitor mapping",
                "webhook_id": "competitive-intel-webhook",
                "estimated_time": "6-12 minutes"
            },
            "fund_allocation": {
                "id": "fund-allocation-optimization-v1",
                "name": "Fund Allocation Optimization",
                "description": "Investment allocation strategies",
                "webhook_id": "fund-allocation-webhook",
                "estimated_time": "7-15 minutes"
            },
            "lp_communication": {
                "id": "lp-communication-automation-v1",
                "name": "LP Communication Automation",
                "description": "Automated LP reporting",
                "webhook_id": "lp-communication-webhook",
                "estimated_time": "5-10 minutes"
            }
        }
    
    async def trigger_workflow(self, workflow_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Trigger N8N workflow via API"""
        try:
            workflow_config = self.workflow_mapping.get(workflow_id)
            if not workflow_config:
                raise ValueError(f"Unknown workflow: {workflow_id}")
            
            # Prepare execution payload
            execution_payload = {
                "workflowId": workflow_config["id"],
                "input": {
                    **payload,
                    "workflow_name": workflow_config["name"],
                    "triggered_at": datetime.now().isoformat(),
                    "verssai_session": True
                }
            }
            
            # Execute via N8N API
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{N8N_URL}/api/v1/workflows/{workflow_config['id']}/execute",
                    json=execution_payload,
                    auth=httpx.BasicAuth(*N8N_AUTH)
                )
                
                if response.status_code in [200, 201]:
                    result = response.json()
                    return {
                        "success": True,
                        "execution_id": result.get("data", {}).get("id", "unknown"),
                        "workflow_name": workflow_config["name"],
                        "status": "triggered",
                        "estimated_time": workflow_config["estimated_time"]
                    }
                else:
                    raise HTTPException(status_code=response.status_code, detail=f"N8N execution failed: {response.text}")
                    
        except Exception as e:
            logger.error(f"Failed to trigger workflow {workflow_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Workflow trigger failed: {str(e)}")

# Global N8N trigger instance
n8n_trigger = N8NTrigger()

async def founder_signal_webhook(request: Request) -> Dict[str, Any]:
    """Founder Signal Assessment Webhook"""
    try:
        payload = await request.json()
        logger.info(f"Founder Signal webhook triggered: {payload}")
        
        # Trigger N8N workflow
        result = await n8n_trigger.trigger_workflow("founder_signal", payload)
        
        return {
            "webhook": "founder-signal-webhook",
            "status": "success",
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Founder Signal webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def due_diligence_webhook(request: Request) -> Dict[str, Any]:
    """Due Diligence Automation Webhook"""
    try:
        payload = await request.json()
        logger.info(f"Due Diligence webhook triggered: {payload}")
        
        result = await n8n_trigger.trigger_workflow("due_diligence", payload)
        
        return {
            "webhook": "due-diligence-webhook",
            "status": "success",
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Due Diligence webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def portfolio_webhook(request: Request) -> Dict[str, Any]:
    """Portfolio Management Webhook"""
    try:
        payload = await request.json()
        logger.info(f"Portfolio Management webhook triggered: {payload}")
        
        result = await n8n_trigger.trigger_workflow("portfolio_management", payload)
        
        return {
            "webhook": "portfolio-webhook",
            "status": "success",
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Portfolio Management webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def competitive_intel_webhook(request: Request) -> Dict[str, Any]:
    """Competitive Intelligence Webhook"""
    try:
        payload = await request.json()
        logger.info(f"Competitive Intelligence webhook triggered: {payload}")
        
        result = await n8n_trigger.trigger_workflow("competitive_intelligence", payload)
        
        return {
            "webhook": "competitive-intel-webhook",
            "status": "success",
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Competitive Intelligence webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def fund_allocation_webhook(request: Request) -> Dict[str, Any]:
    """Fund Allocation Optimization Webhook"""
    try:
        payload = await request.json()
        logger.info(f"Fund Allocation webhook triggered: {payload}")
        
        result = await n8n_trigger.trigger_workflow("fund_allocation", payload)
        
        return {
            "webhook": "fund-allocation-webhook",
            "status": "success",
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fund Allocation webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def lp_communication_webhook(request: Request) -> Dict[str, Any]:
    """LP Communication Automation Webhook"""
    try:
        payload = await request.json()
        logger.info(f"LP Communication webhook triggered: {payload}")
        
        result = await n8n_trigger.trigger_workflow("lp_communication", payload)
        
        return {
            "webhook": "lp-communication-webhook",
            "status": "success",
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"LP Communication webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def test_n8n_connection() -> Dict[str, Any]:
    """Test N8N connectivity and return status"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{N8N_URL}/api/v1/health",
                auth=httpx.BasicAuth(*N8N_AUTH)
            )
            
            if response.status_code == 200:
                return {
                    "status": "connected",
                    "n8n_url": N8N_URL,
                    "response_time": response.elapsed.total_seconds(),
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {
                    "status": "error",
                    "n8n_url": N8N_URL,
                    "error": f"HTTP {response.status_code}",
                    "timestamp": datetime.now().isoformat()
                }
                
    except Exception as e:
        return {
            "status": "error",
            "n8n_url": N8N_URL,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
