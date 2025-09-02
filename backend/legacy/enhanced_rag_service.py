# backend/enhanced_rag_service.py
"""
Enhanced VERSSAI RAG Service v3.0.0
3-Layer RAG Architecture with Smart Query Routing
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedRAGService:
    """3-Layer RAG Architecture for VERSSAI"""
    
    def __init__(self):
        self.layers = {
            "roof": {
                "name": "Global VERSSAI Intelligence",
                "description": "ML/DL models, academic datasets, industry trends",
                "databases": ["chromadb", "neo4j", "redis"],
                "query_types": ["research", "academic", "industry_trends", "ml_models"],
                "priority": 1
            },
            "vc": {
                "name": "VC Layer Intelligence", 
                "description": "Fund-specific intelligence, deal flow, portfolio analysis",
                "databases": ["postgresql", "chromadb", "neo4j"],
                "query_types": ["deal_flow", "portfolio", "market_analysis", "competitor_intel"],
                "priority": 2
            },
            "startup": {
                "name": "Startup Layer Intelligence",
                "description": "Founder profiles, startup metrics, pitch analysis",
                "databases": ["postgresql", "chromadb", "mongodb"],
                "query_types": ["founder_profiles", "startup_metrics", "pitch_decks", "due_diligence"],
                "priority": 3
            }
        }
        
        self.query_classifiers = {
            "founder": ["founder", "ceo", "entrepreneur", "leader", "background"],
            "company": ["company", "startup", "business", "organization", "enterprise"],
            "investment": ["investment", "funding", "capital", "venture", "portfolio"],
            "market": ["market", "industry", "sector", "trend", "analysis"],
            "research": ["research", "academic", "paper", "study", "analysis"]
        }
    
    def classify_query(self, query: str) -> Dict[str, Any]:
        """Intelligently classify query to determine optimal RAG layer"""
        query_lower = query.lower()
        
        # Count keyword matches for each category
        scores = {}
        for category, keywords in self.query_classifiers.items():
            scores[category] = sum(1 for keyword in keywords if keyword in query_lower)
        
        # Determine primary and secondary layers
        if scores["founder"] > 0 or scores["company"] > 0:
            primary_layer = "startup"
            secondary_layer = "vc"
        elif scores["investment"] > 0 or scores["market"] > 0:
            primary_layer = "vc"
            secondary_layer = "startup"
        elif scores["research"] > 0:
            primary_layer = "roof"
            secondary_layer = "vc"
        else:
            # Default to VC layer for general queries
            primary_layer = "vc"
            secondary_layer = "startup"
        
        return {
            "primary_layer": primary_layer,
            "secondary_layer": secondary_layer,
            "confidence": max(scores.values()) / len(max(scores, key=lambda x: len(x))),
            "query_analysis": scores
        }
    
    async def query_multi_layer(self, query: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Query across multiple RAG layers with intelligent routing"""
        start_time = datetime.now()
        
        # Classify the query
        classification = self.classify_query(query)
        primary_layer = classification["primary_layer"]
        secondary_layer = classification["secondary_layer"]
        
        logger.info(f"Query classified: {query[:50]}... -> Primary: {primary_layer}, Secondary: {secondary_layer}")
        
        # Execute primary layer query
        primary_results = await self._query_layer(primary_layer, query, user_context)
        
        # Execute secondary layer query if primary doesn't have sufficient results
        secondary_results = None
        if len(primary_results.get("results", [])) < 3:
            secondary_results = await self._query_layer(secondary_layer, query, user_context)
        
        # Combine and rank results
        combined_results = self._combine_results(primary_results, secondary_results, classification)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "query": query,
            "classification": classification,
            "results": combined_results,
            "total_results": len(combined_results),
            "processing_time": processing_time,
            "layers_queried": [primary_layer, secondary_layer] if secondary_results else [primary_layer],
            "timestamp": datetime.now().isoformat()
        }
    
    async def _query_layer(self, layer_name: str, query: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Query a specific RAG layer"""
        layer_config = self.layers[layer_name]
        
        try:
            # Simulate layer-specific querying (replace with actual database queries)
            if layer_name == "roof":
                results = await self._query_roof_layer(query, user_context)
            elif layer_name == "vc":
                results = await self._query_vc_layer(query, user_context)
            elif layer_name == "startup":
                results = await self._query_startup_layer(query, user_context)
            else:
                results = []
            
            return {
                "layer": layer_name,
                "layer_name": layer_config["name"],
                "results": results,
                "query_type": self._determine_query_type(query, layer_config["query_types"])
            }
            
        except Exception as e:
            logger.error(f"Error querying {layer_name} layer: {e}")
            return {
                "layer": layer_name,
                "layer_name": layer_config["name"],
                "results": [],
                "error": str(e)
            }
    
    async def _query_roof_layer(self, query: str, user_context: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Query the roof layer (global intelligence)"""
        # Simulate academic and research data
        return [
            {
                "id": "roof_001",
                "title": "AI in Venture Capital: A Comprehensive Review",
                "content": "Recent advances in machine learning for investment decision making...",
                "source": "academic_paper",
                "confidence": 0.92,
                "metadata": {"year": 2024, "journal": "VC Research Quarterly"}
            },
            {
                "id": "roof_002", 
                "title": "Market Trends in SaaS Investments",
                "content": "Analysis of software-as-a-service investment patterns...",
                "source": "industry_report",
                "confidence": 0.88,
                "metadata": {"quarter": "Q3 2024", "source": "CB Insights"}
            }
        ]
    
    async def _query_vc_layer(self, query: str, user_context: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Query the VC layer (fund-specific intelligence)"""
        # Simulate fund and portfolio data
        return [
            {
                "id": "vc_001",
                "title": "Portfolio Company Performance Analysis",
                "content": "Comprehensive analysis of current portfolio companies...",
                "source": "portfolio_data",
                "confidence": 0.95,
                "metadata": {"fund_id": "verssai_fund_2024", "last_updated": "2024-08-17"}
            },
            {
                "id": "vc_002",
                "title": "Competitive Landscape Analysis",
                "content": "Market positioning and competitive analysis...",
                "source": "market_research",
                "confidence": 0.87,
                "metadata": {"sector": "fintech", "region": "global"}
            }
        ]
    
    async def _query_startup_layer(self, query: str, user_context: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Query the startup layer (founder and company intelligence)"""
        # Simulate startup and founder data
        return [
            {
                "id": "startup_001",
                "title": "Founder Background Analysis",
                "content": "Comprehensive founder profile and background check...",
                "source": "founder_profile",
                "confidence": 0.93,
                "metadata": {"founder_id": "founder_123", "verification_status": "verified"}
            },
            {
                "id": "startup_002",
                "title": "Startup Metrics and KPIs",
                "content": "Key performance indicators and growth metrics...",
                "source": "startup_data",
                "confidence": 0.89,
                "metadata": {"company_id": "startup_456", "data_freshness": "24h"}
            }
        ]
    
    def _determine_query_type(self, query: str, allowed_types: List[str]) -> str:
        """Determine the specific query type within a layer"""
        query_lower = query.lower()
        
        for query_type in allowed_types:
            if query_type.replace("_", " ") in query_lower:
                return query_type
        
        return allowed_types[0] if allowed_types else "general"
    
    def _combine_results(self, primary_results: Dict[str, Any], secondary_results: Dict[str, Any] = None, classification: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Combine and rank results from multiple layers"""
        combined = []
        
        # Add primary results with high priority
        for result in primary_results.get("results", []):
            result["layer_priority"] = 1
            result["combined_score"] = result.get("confidence", 0.5) * 1.0
            combined.append(result)
        
        # Add secondary results with lower priority
        if secondary_results:
            for result in secondary_results.get("results", []):
                result["layer_priority"] = 2
                result["combined_score"] = result.get("confidence", 0.5) * 0.7
                combined.append(result)
        
        # Sort by combined score
        combined.sort(key=lambda x: x.get("combined_score", 0), reverse=True)
        
        return combined
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get the status of all RAG layers"""
        return {
            "rag_system": "operational",
            "layers": {
                name: {
                    "status": "operational",
                    "databases": config["databases"],
                    "query_types": config["query_types"],
                    "priority": config["priority"]
                }
                for name, config in self.layers.items()
            },
            "total_layers": len(self.layers),
            "last_updated": datetime.now().isoformat()
        }
    
    async def initialize_system(self):
        """Initialize the RAG system"""
        logger.info("Initializing Enhanced VERSSAI RAG System v3.0.0...")
        
        # Initialize each layer
        for layer_name, layer_config in self.layers.items():
            logger.info(f"Initializing {layer_name} layer: {layer_config['name']}")
        
        logger.info("Enhanced RAG System initialization complete!")

# Global instance
enhanced_rag_service = EnhancedRAGService()
