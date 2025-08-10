"""
VERSSAI Intelligence Orchestrator
Manual triggers for AI, RAG, Graph, and Contextual Intelligence
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid
import asyncio

from ai_agents import (
    deck_extraction_agent, 
    founder_signal_agent, 
    investment_thesis_agent
)
from rag_service import rag_service
from file_storage import file_storage

logger = logging.getLogger(__name__)

class IntelligenceOrchestrator:
    """
    Advanced orchestrator for manual control of all AI systems
    """
    
    def __init__(self):
        self.active_sessions = {}
        self.intelligence_cache = {}
    
    # ===========================================
    # 1. MANUAL AI TRIGGERS
    # ===========================================
    
    async def trigger_founder_analysis(self, founder_data: Dict[str, Any], 
                                     company_context: Dict[str, Any] = None,
                                     analysis_depth: str = "deep") -> Dict[str, Any]:
        """
        Manually trigger founder signal analysis with custom parameters
        
        Args:
            founder_data: Founder information
            company_context: Company context for better analysis
            analysis_depth: "quick", "standard", or "deep"
        """
        try:
            logger.info(f"Manual founder analysis triggered - depth: {analysis_depth}")
            
            # Adjust analysis based on depth
            if analysis_depth == "deep":
                # Include RAG context for deeper analysis
                rag_context = await self._get_founder_rag_context(founder_data, company_context)
                company_context = {**(company_context or {}), "rag_insights": rag_context}
            
            # Run analysis
            analysis_result = founder_signal_agent.analyze_founder(founder_data, company_context)
            
            # Add contextual intelligence
            if analysis_depth in ["standard", "deep"]:
                analysis_result["contextual_insights"] = await self._add_contextual_intelligence(
                    analysis_result, company_context
                )
            
            return {
                "status": "completed",
                "analysis": analysis_result,
                "depth": analysis_depth,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in manual founder analysis: {e}")
            return {"status": "failed", "error": str(e)}
    
    async def trigger_investment_evaluation(self, company_data: Dict[str, Any],
                                          evaluation_criteria: Dict[str, Any] = None,
                                          include_comparables: bool = True) -> Dict[str, Any]:
        """
        Manually trigger investment thesis evaluation
        
        Args:
            company_data: Company information
            evaluation_criteria: Custom evaluation parameters
            include_comparables: Whether to include comparable analysis
        """
        try:
            logger.info("Manual investment evaluation triggered")
            
            # Enhanced evaluation with RAG insights
            if include_comparables:
                comparable_insights = await self._get_comparable_companies(company_data)
                company_data["comparable_analysis"] = comparable_insights
            
            # Custom thesis if provided
            custom_thesis = evaluation_criteria.get("investment_thesis") if evaluation_criteria else None
            
            # Run evaluation
            evaluation_result = investment_thesis_agent.evaluate_investment(
                company_data, 
                founder_analysis=evaluation_criteria.get("founder_analysis") if evaluation_criteria else None,
                investor_thesis=custom_thesis
            )
            
            return {
                "status": "completed",
                "evaluation": evaluation_result,
                "included_comparables": include_comparables,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in manual investment evaluation: {e}")
            return {"status": "failed", "error": str(e)}
    
    # ===========================================
    # 2. ADVANCED RAG TRIGGERS
    # ===========================================
    
    async def trigger_multi_level_rag(self, query: str, 
                                    intelligence_sources: List[str] = None,
                                    synthesis_mode: str = "comprehensive") -> Dict[str, Any]:
        """
        Advanced RAG query with custom source selection and synthesis
        
        Args:
            query: Search query
            intelligence_sources: ["platform", "investor", "company", "graph"]
            synthesis_mode: "quick", "comprehensive", or "analytical"
        """
        try:
            logger.info(f"Advanced RAG query triggered: {query}")
            
            # Default to all sources if none specified
            if not intelligence_sources:
                intelligence_sources = ["platform", "investor", "company"]
            
            results = {
                "query": query,
                "sources_queried": intelligence_sources,
                "results": {},
                "synthesis": None
            }
            
            # Query each specified source
            if "platform" in intelligence_sources:
                results["results"]["platform"] = rag_service.query_platform_knowledge(query, top_k=10)
            
            if "investor" in intelligence_sources:
                # Would need investor_id in real implementation
                results["results"]["investor"] = []
            
            if "company" in intelligence_sources:
                # Would need company_id in real implementation  
                results["results"]["company"] = []
            
            if "graph" in intelligence_sources:
                results["results"]["graph"] = await self._query_graph_intelligence(query)
            
            # Advanced synthesis based on mode
            if synthesis_mode == "comprehensive":
                results["synthesis"] = await self._comprehensive_synthesis(results["results"], query)
            elif synthesis_mode == "analytical":
                results["synthesis"] = await self._analytical_synthesis(results["results"], query)
            else:
                results["synthesis"] = await self._quick_synthesis(results["results"])
            
            return results
            
        except Exception as e:
            logger.error(f"Error in advanced RAG query: {e}")
            return {"status": "failed", "error": str(e)}
    
    async def trigger_contextual_intelligence(self, context_type: str, 
                                            entity_data: Dict[str, Any],
                                            intelligence_depth: str = "standard") -> Dict[str, Any]:
        """
        Trigger contextual intelligence analysis
        
        Args:
            context_type: "founder", "company", "market", "competitive"
            entity_data: Data for the entity being analyzed
            intelligence_depth: "surface", "standard", or "deep"
        """
        try:
            logger.info(f"Contextual intelligence triggered: {context_type}")
            
            intelligence_result = {
                "context_type": context_type,
                "entity": entity_data.get("name", "Unknown"),
                "insights": [],
                "relationships": [],
                "risk_factors": [],
                "opportunities": []
            }
            
            if context_type == "founder":
                intelligence_result = await self._analyze_founder_context(entity_data, intelligence_depth)
            elif context_type == "company":
                intelligence_result = await self._analyze_company_context(entity_data, intelligence_depth)
            elif context_type == "market":
                intelligence_result = await self._analyze_market_context(entity_data, intelligence_depth)
            elif context_type == "competitive":
                intelligence_result = await self._analyze_competitive_context(entity_data, intelligence_depth)
            
            return intelligence_result
            
        except Exception as e:
            logger.error(f"Error in contextual intelligence: {e}")
            return {"status": "failed", "error": str(e)}
    
    # ===========================================
    # 3. GRAPH INTELLIGENCE TRIGGERS
    # ===========================================
    
    async def trigger_graph_analysis(self, entity_type: str, entity_id: str,
                                   analysis_type: str = "network",
                                   depth: int = 2) -> Dict[str, Any]:
        """
        Trigger graph-based intelligence analysis
        
        Args:
            entity_type: "founder", "company", "investor", "market"
            entity_id: Unique identifier for the entity
            analysis_type: "network", "influence", "patterns", "recommendations"
            depth: How many relationship hops to analyze (1-3)
        """
        try:
            logger.info(f"Graph analysis triggered: {entity_type} - {analysis_type}")
            
            # Mock implementation - in real system would query Neo4j
            graph_result = {
                "entity_type": entity_type,
                "entity_id": entity_id,
                "analysis_type": analysis_type,
                "depth": depth,
                "relationships": await self._find_entity_relationships(entity_type, entity_id, depth),
                "influence_score": await self._calculate_influence_score(entity_type, entity_id),
                "network_effects": await self._analyze_network_effects(entity_type, entity_id),
                "recommendations": await self._generate_graph_recommendations(entity_type, entity_id)
            }
            
            return graph_result
            
        except Exception as e:
            logger.error(f"Error in graph analysis: {e}")
            return {"status": "failed", "error": str(e)}
    
    # ===========================================
    # 4. WORKFLOW SESSION MANAGEMENT
    # ===========================================
    
    async def create_intelligence_session(self, session_name: str,
                                        session_config: Dict[str, Any] = None) -> str:
        """
        Create an intelligence analysis session for complex multi-step analysis
        """
        session_id = str(uuid.uuid4())
        
        self.active_sessions[session_id] = {
            "name": session_name,
            "created_at": datetime.utcnow().isoformat(),
            "config": session_config or {},
            "steps": [],
            "results": {},
            "status": "active"
        }
        
        logger.info(f"Intelligence session created: {session_id}")
        return session_id
    
    async def execute_session_workflow(self, session_id: str, 
                                     workflow_steps: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Execute a custom intelligence workflow within a session
        
        Args:
            session_id: Session identifier
            workflow_steps: List of steps to execute
                Example: [
                    {"type": "founder_analysis", "data": {...}},
                    {"type": "rag_query", "query": "..."},
                    {"type": "graph_analysis", "entity": "..."}
                ]
        """
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")
            
            session = self.active_sessions[session_id]
            results = {}
            
            for i, step in enumerate(workflow_steps):
                step_id = f"step_{i+1}"
                logger.info(f"Executing workflow step {step_id}: {step['type']}")
                
                if step["type"] == "founder_analysis":
                    results[step_id] = await self.trigger_founder_analysis(
                        step["data"], 
                        step.get("context"),
                        step.get("depth", "standard")
                    )
                elif step["type"] == "rag_query":
                    results[step_id] = await self.trigger_multi_level_rag(
                        step["query"],
                        step.get("sources"),
                        step.get("synthesis_mode", "comprehensive")
                    )
                elif step["type"] == "graph_analysis":
                    results[step_id] = await self.trigger_graph_analysis(
                        step["entity_type"],
                        step["entity_id"],
                        step.get("analysis_type", "network")
                    )
                elif step["type"] == "investment_evaluation":
                    results[step_id] = await self.trigger_investment_evaluation(
                        step["data"],
                        step.get("criteria"),
                        step.get("include_comparables", True)
                    )
                
                session["steps"].append({"step_id": step_id, "type": step["type"], "completed_at": datetime.utcnow().isoformat()})
            
            session["results"] = results
            session["status"] = "completed"
            session["completed_at"] = datetime.utcnow().isoformat()
            
            return {
                "session_id": session_id,
                "status": "completed",
                "results": results,
                "steps_executed": len(workflow_steps)
            }
            
        except Exception as e:
            logger.error(f"Error executing session workflow: {e}")
            return {"status": "failed", "error": str(e)}
    
    # ===========================================
    # HELPER METHODS (Implementation stubs)
    # ===========================================
    
    async def _get_founder_rag_context(self, founder_data: Dict[str, Any], 
                                     company_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get RAG context for founder analysis"""
        market = company_context.get("market", "technology") if company_context else "technology" 
        return rag_service.query_platform_knowledge(f"successful founders {market}", top_k=5)
    
    async def _add_contextual_intelligence(self, analysis_result: Dict[str, Any],
                                         company_context: Dict[str, Any]) -> Dict[str, Any]:
        """Add contextual intelligence to analysis"""
        return {
            "market_context": "Added contextual market intelligence",
            "competitive_landscape": "Competitive analysis",
            "timing_factors": "Market timing considerations"
        }
    
    async def _get_comparable_companies(self, company_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get comparable companies for investment evaluation"""
        market = company_data.get("market", "technology")
        return [{"name": f"Comparable in {market}", "metrics": {}}]
    
    async def _query_graph_intelligence(self, query: str) -> List[Dict[str, Any]]:
        """Query graph database for relationship intelligence"""
        return [{"relationship": "mock graph relationship", "strength": 0.8}]
    
    async def _comprehensive_synthesis(self, results: Dict[str, Any], query: str) -> str:
        """Generate comprehensive synthesis of multi-source results"""
        return f"Comprehensive analysis synthesis for: {query}"
    
    async def _analytical_synthesis(self, results: Dict[str, Any], query: str) -> str:
        """Generate analytical synthesis with deeper insights"""
        return f"Analytical synthesis with deeper insights for: {query}"
    
    async def _quick_synthesis(self, results: Dict[str, Any]) -> str:
        """Generate quick synthesis summary"""
        return "Quick synthesis of available intelligence"
    
    async def _analyze_founder_context(self, founder_data: Dict[str, Any], depth: str) -> Dict[str, Any]:
        """Analyze founder contextual intelligence"""
        return {"context_type": "founder", "insights": [], "depth": depth}
    
    async def _analyze_company_context(self, company_data: Dict[str, Any], depth: str) -> Dict[str, Any]:
        """Analyze company contextual intelligence"""  
        return {"context_type": "company", "insights": [], "depth": depth}
    
    async def _analyze_market_context(self, market_data: Dict[str, Any], depth: str) -> Dict[str, Any]:
        """Analyze market contextual intelligence"""
        return {"context_type": "market", "insights": [], "depth": depth}
    
    async def _analyze_competitive_context(self, competitive_data: Dict[str, Any], depth: str) -> Dict[str, Any]:
        """Analyze competitive landscape intelligence"""
        return {"context_type": "competitive", "insights": [], "depth": depth}
    
    async def _find_entity_relationships(self, entity_type: str, entity_id: str, depth: int) -> List[Dict[str, Any]]:
        """Find entity relationships in graph"""
        return [{"related_entity": f"Related {entity_type}", "relationship": "connected", "strength": 0.7}]
    
    async def _calculate_influence_score(self, entity_type: str, entity_id: str) -> float:
        """Calculate influence score for entity"""
        return 0.75
    
    async def _analyze_network_effects(self, entity_type: str, entity_id: str) -> Dict[str, Any]:
        """Analyze network effects for entity"""
        return {"network_size": 100, "influence_radius": 2, "key_connections": []}
    
    async def _generate_graph_recommendations(self, entity_type: str, entity_id: str) -> List[str]:
        """Generate recommendations based on graph analysis"""
        return [f"Consider connections in {entity_type} network", "Explore indirect relationships"]

# Global intelligence orchestrator instance
intelligence_orchestrator = IntelligenceOrchestrator()

# Convenience functions for easy access
async def trigger_founder_analysis(founder_data: Dict[str, Any], **kwargs):
    return await intelligence_orchestrator.trigger_founder_analysis(founder_data, **kwargs)

async def trigger_advanced_rag(query: str, **kwargs):
    return await intelligence_orchestrator.trigger_multi_level_rag(query, **kwargs)

async def trigger_graph_analysis(entity_type: str, entity_id: str, **kwargs):
    return await intelligence_orchestrator.trigger_graph_analysis(entity_type, entity_id, **kwargs)