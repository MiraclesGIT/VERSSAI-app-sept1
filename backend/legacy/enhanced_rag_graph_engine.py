#!/usr/bin/env python3
"""
VERSSAI Enhanced 3-Layer RAG/GRAPH Architecture
Integration with the VERSSAI massive dataset for multi-layer intelligence
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import networkx as nx

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class VERSSAIDataPoint:
    """Structured data point for VERSSAI intelligence"""
    id: str
    title: str
    content: str
    metadata: Dict[str, Any]
    layer: str  # 'roof', 'vc', 'founder'
    embeddings: Optional[List[float]] = None
    relevance_score: Optional[float] = None

class VERSSAIRAGGraphEngine:
    """
    3-Layer RAG/GRAPH Architecture for VERSSAI Intelligence Platform
    
    Layer 1 (Roof): Complete dataset for ML/DL research intelligence  
    Layer 2 (VC): Customized investor experience layer
    Layer 3 (Founder/Startup): Founder-level intelligence
    """
    
    def __init__(self, dataset_path: str = "./uploads/VERSSAI_Massive_Dataset_Complete.xlsx"):
        self.dataset_path = dataset_path
        self.layers = {
            'roof': {
                'name': 'Research Intelligence Layer',
                'description': 'Complete academic dataset for ML/DL research',
                'data_sources': ['references', 'researchers', 'institutions', 'citations'],
                'knowledge_graph': nx.MultiDiGraph(),
                'vector_store': {},
                'metadata': {}
            },
            'vc': {
                'name': 'VC Intelligence Layer', 
                'description': 'Customized investor experience and insights',
                'data_sources': ['portfolio_analysis', 'market_trends', 'investment_patterns'],
                'knowledge_graph': nx.MultiDiGraph(),
                'vector_store': {},
                'metadata': {}
            },
            'founder': {
                'name': 'Founder Intelligence Layer',
                'description': 'Founder and startup-level intelligence',
                'data_sources': ['founder_profiles', 'startup_metrics', 'success_patterns'],
                'knowledge_graph': nx.MultiDiGraph(),
                'vector_store': {},
                'metadata': {}
            }
        }
        
        # Initialize vectorizers for each layer
        self.vectorizers = {
            'roof': TfidfVectorizer(max_features=5000, stop_words='english'),
            'vc': TfidfVectorizer(max_features=3000, stop_words='english'),
            'founder': TfidfVectorizer(max_features=2000, stop_words='english')
        }
        
        # Graph analysis cache
        self.graph_cache = {}
        self.last_updated = None
        
    async def initialize_layers(self):
        """Initialize all three RAG/GRAPH layers with VERSSAI dataset"""
        logger.info("🔄 Initializing VERSSAI 3-Layer RAG/GRAPH Architecture...")
        
        try:
            # Load and process dataset
            dataset = await self._load_verssai_dataset()
            
            # Initialize each layer
            await self._initialize_roof_layer(dataset)
            await self._initialize_vc_layer(dataset)
            await self._initialize_founder_layer(dataset)
            
            # Build cross-layer connections
            await self._build_cross_layer_connections()
            
            self.last_updated = datetime.now()
            logger.info("✅ All 3 layers initialized successfully")
            
            return {
                "status": "success",
                "layers_initialized": len(self.layers),
                "timestamp": self.last_updated.isoformat(),
                "layer_stats": {
                    layer_name: {
                        "nodes": len(layer_data['knowledge_graph'].nodes()),
                        "edges": len(layer_data['knowledge_graph'].edges()),
                        "vector_entries": len(layer_data['vector_store'])
                    }
                    for layer_name, layer_data in self.layers.items()
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize layers: {e}")
            raise Exception(f"Layer initialization failed: {str(e)}")
    
    async def _load_verssai_dataset(self) -> Dict[str, pd.DataFrame]:
        """Load the VERSSAI massive dataset"""
        logger.info(f"📊 Loading VERSSAI dataset from {self.dataset_path}")
        
        if not Path(self.dataset_path).exists():
            raise FileNotFoundError(f"Dataset not found: {self.dataset_path}")
        
        # Load all sheets from the Excel file
        dataset = {}
        try:
            with pd.ExcelFile(self.dataset_path) as xls:
                for sheet_name in xls.sheet_names:
                    dataset[sheet_name] = pd.read_excel(xls, sheet_name=sheet_name)
                    logger.info(f"   ✓ Loaded {sheet_name}: {len(dataset[sheet_name])} rows")
            
            return dataset
            
        except Exception as e:
            logger.error(f"Failed to load dataset: {e}")
            raise
    
    async def _initialize_roof_layer(self, dataset: Dict[str, pd.DataFrame]):
        """Initialize Roof Layer - Complete Research Intelligence"""
        logger.info("🏗️ Building Roof Layer (Research Intelligence)...")
        
        roof_layer = self.layers['roof']
        
        # Process References (1,157 research papers)
        if 'References_1157' in dataset:
            refs_df = dataset['References_1157']
            for _, row in refs_df.iterrows():
                node_id = f"paper_{row.get('ref_id', '')}"
                roof_layer['knowledge_graph'].add_node(
                    node_id,
                    type='research_paper',
                    title=row.get('title', ''),
                    authors=row.get('authors', ''),
                    year=row.get('year', ''),
                    venue=row.get('venue', ''),
                    citation_count=row.get('citation_count', 0),
                    methodology=row.get('methodology', ''),
                    category=row.get('category', '')
                )
        
        # Process Researchers (2,311 researchers)
        if 'Researchers_2311' in dataset:
            researchers_df = dataset['Researchers_2311'] 
            for _, row in researchers_df.iterrows():
                node_id = f"researcher_{row.get('researcher_id', '')}"
                roof_layer['knowledge_graph'].add_node(
                    node_id,
                    type='researcher',
                    name=row.get('name', ''),
                    institution=row.get('institution', ''),
                    h_index=row.get('h_index', 0),
                    total_citations=row.get('total_citations', 0),
                    primary_field=row.get('primary_field', ''),
                    years_active=row.get('years_active', 0)
                )
        
        # Process Institutions
        if 'Institutions' in dataset:
            institutions_df = dataset['Institutions']
            for _, row in institutions_df.iterrows():
                node_id = f"institution_{row.get('institution_id', '')}"
                roof_layer['knowledge_graph'].add_node(
                    node_id,
                    type='institution',
                    name=row.get('name', ''),
                    country=row.get('country', ''),
                    ranking=row.get('ranking', 0),
                    research_output=row.get('research_output', 0)
                )
        
        # Process Citation Network (38,016 citations)
        if 'Citation_Network' in dataset:
            citations_df = dataset['Citation_Network']
            for _, row in citations_df.iterrows():
                citing_id = f"paper_{row.get('citing_paper_id', '')}"
                cited_id = f"paper_{row.get('cited_paper_id', '')}"
                
                if (roof_layer['knowledge_graph'].has_node(citing_id) and 
                    roof_layer['knowledge_graph'].has_node(cited_id)):
                    roof_layer['knowledge_graph'].add_edge(
                        citing_id, cited_id,
                        type='citation',
                        context=row.get('citation_context', ''),
                        sentiment=row.get('citation_sentiment', ''),
                        self_citation=row.get('self_citation', False)
                    )
        
        # Build vector store for semantic search
        roof_texts = []
        roof_ids = []
        for node_id, node_data in roof_layer['knowledge_graph'].nodes(data=True):
            if node_data.get('type') == 'research_paper':
                text = f"{node_data.get('title', '')} {node_data.get('authors', '')} {node_data.get('methodology', '')}"
                roof_texts.append(text)
                roof_ids.append(node_id)
        
        if roof_texts:
            roof_vectors = self.vectorizers['roof'].fit_transform(roof_texts)
            roof_layer['vector_store'] = {
                'texts': roof_texts,
                'ids': roof_ids,
                'vectors': roof_vectors
            }
        
        logger.info(f"   ✓ Roof Layer: {len(roof_layer['knowledge_graph'].nodes())} nodes, {len(roof_layer['knowledge_graph'].edges())} edges")
    
    async def _initialize_vc_layer(self, dataset: Dict[str, pd.DataFrame]):
        """Initialize VC Layer - Investor Intelligence"""
        logger.info("💼 Building VC Layer (Investor Intelligence)...")
        
        vc_layer = self.layers['vc']
        
        # Create VC-specific insights from research data
        # Map researchers to potential VC investment targets
        if 'Researchers_2311' in dataset:
            researchers_df = dataset['Researchers_2311']
            
            # Identify high-potential researchers who could be founders
            high_potential = researchers_df[
                (researchers_df.get('h_index', 0) > 10) &
                (researchers_df.get('total_citations', 0) > 500)
            ]
            
            for _, researcher in high_potential.iterrows():
                node_id = f"vc_target_{researcher.get('researcher_id', '')}"
                vc_layer['knowledge_graph'].add_node(
                    node_id,
                    type='investment_target',
                    researcher_name=researcher.get('name', ''),
                    institution=researcher.get('institution', ''),
                    field=researcher.get('primary_field', ''),
                    investment_score=self._calculate_investment_score(researcher),
                    risk_level=self._assess_risk_level(researcher),
                    market_potential=self._evaluate_market_potential(researcher.get('primary_field', ''))
                )
        
        # Create market trend analysis nodes
        if 'Category_Analysis' in dataset:
            category_df = dataset['Category_Analysis']
            for category in category_df.get('category', []):
                if pd.notna(category):
                    node_id = f"market_{category.replace(' ', '_').lower()}"
                    vc_layer['knowledge_graph'].add_node(
                        node_id,
                        type='market_trend',
                        category=category,
                        trend_strength=np.random.uniform(0.3, 0.9),  # Placeholder
                        investment_appeal=np.random.uniform(0.4, 0.8)
                    )
        
        # Build VC vector store
        vc_texts = []
        vc_ids = []
        for node_id, node_data in vc_layer['knowledge_graph'].nodes(data=True):
            if node_data.get('type') in ['investment_target', 'market_trend']:
                text = f"{node_data.get('researcher_name', '')} {node_data.get('field', '')} {node_data.get('category', '')}"
                vc_texts.append(text)
                vc_ids.append(node_id)
        
        if vc_texts:
            vc_vectors = self.vectorizers['vc'].fit_transform(vc_texts)
            vc_layer['vector_store'] = {
                'texts': vc_texts,
                'ids': vc_ids,
                'vectors': vc_vectors
            }
        
        logger.info(f"   ✓ VC Layer: {len(vc_layer['knowledge_graph'].nodes())} nodes, {len(vc_layer['knowledge_graph'].edges())} edges")
    
    async def _initialize_founder_layer(self, dataset: Dict[str, pd.DataFrame]):
        """Initialize Founder Layer - Startup Intelligence"""
        logger.info("🚀 Building Founder Layer (Startup Intelligence)...")
        
        founder_layer = self.layers['founder']
        
        # Create founder profiles from researcher data
        if 'Researchers_2311' in dataset:
            researchers_df = dataset['Researchers_2311']
            
            for _, researcher in researchers_df.iterrows():
                node_id = f"founder_{researcher.get('researcher_id', '')}"
                founder_layer['knowledge_graph'].add_node(
                    node_id,
                    type='potential_founder',
                    name=researcher.get('name', ''),
                    expertise=researcher.get('primary_field', ''),
                    experience_years=researcher.get('years_active', 0),
                    research_impact=researcher.get('h_index', 0),
                    collaboration_network=researcher.get('collaboration_count', 0),
                    founder_readiness_score=self._calculate_founder_readiness(researcher),
                    success_probability=self._predict_startup_success(researcher)
                )
        
        # Create startup archetypes based on research patterns
        startup_archetypes = [
            'AI/ML Research Commercialization',
            'Academic Spinout',
            'Deep Tech Innovation',
            'Research Platform',
            'Data Science Consulting'
        ]
        
        for archetype in startup_archetypes:
            node_id = f"archetype_{archetype.replace(' ', '_').lower()}"
            founder_layer['knowledge_graph'].add_node(
                node_id,
                type='startup_archetype',
                name=archetype,
                market_size=np.random.uniform(100, 10000),  # Million USD
                success_rate=np.random.uniform(0.1, 0.4),
                time_to_market=np.random.uniform(12, 36),  # Months
                capital_requirements=np.random.uniform(0.5, 5.0)  # Million USD
            )
        
        # Build founder vector store
        founder_texts = []
        founder_ids = []
        for node_id, node_data in founder_layer['knowledge_graph'].nodes(data=True):
            if node_data.get('type') in ['potential_founder', 'startup_archetype']:
                text = f"{node_data.get('name', '')} {node_data.get('expertise', '')} {node_data.get('name', '')}"
                founder_texts.append(text)
                founder_ids.append(node_id)
        
        if founder_texts:
            founder_vectors = self.vectorizers['founder'].fit_transform(founder_texts)
            founder_layer['vector_store'] = {
                'texts': founder_texts,
                'ids': founder_ids,
                'vectors': founder_vectors
            }
        
        logger.info(f"   ✓ Founder Layer: {len(founder_layer['knowledge_graph'].nodes())} nodes, {len(founder_layer['knowledge_graph'].edges())} edges")
    
    async def _build_cross_layer_connections(self):
        """Build connections between the three layers"""
        logger.info("🔗 Building cross-layer connections...")
        
        # Connect researchers (roof) to investment targets (vc) to founders (founder)
        for roof_node in self.layers['roof']['knowledge_graph'].nodes():
            if roof_node.startswith('researcher_'):
                researcher_id = roof_node.replace('researcher_', '')
                
                # Check if there's a corresponding VC target
                vc_target = f"vc_target_{researcher_id}"
                if vc_target in self.layers['vc']['knowledge_graph'].nodes():
                    
                    # Check if there's a corresponding founder profile
                    founder_profile = f"founder_{researcher_id}"
                    if founder_profile in self.layers['founder']['knowledge_graph'].nodes():
                        
                        # Create cross-layer connection metadata
                        self.layers['roof']['metadata'][roof_node] = {
                            'vc_layer_connection': vc_target,
                            'founder_layer_connection': founder_profile
                        }
                        self.layers['vc']['metadata'][vc_target] = {
                            'roof_layer_connection': roof_node,
                            'founder_layer_connection': founder_profile
                        }
                        self.layers['founder']['metadata'][founder_profile] = {
                            'roof_layer_connection': roof_node,
                            'vc_layer_connection': vc_target
                        }
    
    async def query_multi_layer(self, query: str, layer_weights: Dict[str, float] = None) -> Dict[str, Any]:
        """
        Query across all three layers with weighted results
        
        Args:
            query: Search query string
            layer_weights: Weights for each layer (roof, vc, founder)
        """
        if layer_weights is None:
            layer_weights = {'roof': 0.4, 'vc': 0.3, 'founder': 0.3}
        
        logger.info(f"🔍 Multi-layer query: '{query}' with weights {layer_weights}")
        
        results = {
            'query': query,
            'timestamp': datetime.now().isoformat(),
            'layers': {},
            'cross_layer_insights': [],
            'summary': {}
        }
        
        # Query each layer
        for layer_name, weight in layer_weights.items():
            if weight > 0 and layer_name in self.layers:
                layer_results = await self._query_single_layer(layer_name, query)
                layer_results['weight'] = weight
                results['layers'][layer_name] = layer_results
        
        # Generate cross-layer insights
        results['cross_layer_insights'] = await self._generate_cross_layer_insights(query, results['layers'])
        
        # Create summary
        results['summary'] = await self._create_query_summary(results)
        
        return results
    
    async def _query_single_layer(self, layer_name: str, query: str) -> Dict[str, Any]:
        """Query a single layer using vector similarity and graph analysis"""
        layer = self.layers[layer_name]
        
        if not layer['vector_store']:
            return {'matches': [], 'graph_insights': [], 'status': 'no_data'}
        
        # Vector similarity search
        query_vector = self.vectorizers[layer_name].transform([query])
        similarities = cosine_similarity(query_vector, layer['vector_store']['vectors']).flatten()
        
        # Get top matches
        top_indices = np.argsort(similarities)[::-1][:5]
        matches = []
        
        for idx in top_indices:
            if similarities[idx] > 0.1:  # Minimum threshold
                node_id = layer['vector_store']['ids'][idx]
                node_data = layer['knowledge_graph'].nodes[node_id]
                matches.append({
                    'id': node_id,
                    'similarity': float(similarities[idx]),
                    'data': dict(node_data),
                    'layer': layer_name
                })
        
        # Graph-based insights
        graph_insights = await self._analyze_graph_patterns(layer_name, [m['id'] for m in matches])
        
        return {
            'matches': matches,
            'graph_insights': graph_insights,
            'status': 'success'
        }
    
    async def _analyze_graph_patterns(self, layer_name: str, node_ids: List[str]) -> List[Dict[str, Any]]:
        """Analyze graph patterns for given nodes"""
        graph = self.layers[layer_name]['knowledge_graph']
        insights = []
        
        for node_id in node_ids:
            if node_id in graph:
                # Get node centrality measures
                try:
                    degree_centrality = nx.degree_centrality(graph)[node_id]
                    neighbors = list(graph.neighbors(node_id))
                    
                    insights.append({
                        'node_id': node_id,
                        'degree_centrality': degree_centrality,
                        'neighbor_count': len(neighbors),
                        'connection_types': list(set([
                            graph.edges[node_id, neighbor].get('type', 'unknown') 
                            for neighbor in neighbors if graph.has_edge(node_id, neighbor)
                        ]))
                    })
                except:
                    # Handle disconnected graphs
                    insights.append({
                        'node_id': node_id,
                        'degree_centrality': 0,
                        'neighbor_count': 0,
                        'connection_types': []
                    })
        
        return insights
    
    async def _generate_cross_layer_insights(self, query: str, layer_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate insights by connecting information across layers"""
        insights = []
        
        # Find cross-layer connections
        for layer_name, results in layer_results.items():
            for match in results.get('matches', []):
                node_id = match['id']
                
                # Check for cross-layer metadata
                if node_id in self.layers[layer_name]['metadata']:
                    metadata = self.layers[layer_name]['metadata'][node_id]
                    
                    cross_layer_data = {}
                    for connected_layer, connected_node in metadata.items():
                        if connected_layer.endswith('_connection'):
                            target_layer = connected_layer.replace('_layer_connection', '')
                            if (target_layer in self.layers and 
                                connected_node in self.layers[target_layer]['knowledge_graph']):
                                cross_layer_data[target_layer] = dict(
                                    self.layers[target_layer]['knowledge_graph'].nodes[connected_node]
                                )
                    
                    if cross_layer_data:
                        insights.append({
                            'primary_node': {'layer': layer_name, 'id': node_id, 'data': match['data']},
                            'connected_layers': cross_layer_data,
                            'insight_type': 'cross_layer_correlation',
                            'relevance': match['similarity']
                        })
        
        return insights
    
    async def _create_query_summary(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Create a summary of the multi-layer query results"""
        total_matches = sum(len(layer_data.get('matches', [])) for layer_data in results['layers'].values())
        cross_layer_connections = len(results['cross_layer_insights'])
        
        # Identify most relevant layer
        best_layer = None
        best_score = 0
        for layer_name, layer_data in results['layers'].items():
            if layer_data.get('matches'):
                avg_score = np.mean([m['similarity'] for m in layer_data['matches']])
                if avg_score > best_score:
                    best_score = avg_score
                    best_layer = layer_name
        
        # Create summary data first
        summary_data = {
            'total_matches': total_matches,
            'cross_layer_connections': cross_layer_connections,
            'primary_layer': best_layer,
            'confidence_score': float(best_score) if best_score > 0 else 0,
        }
        
        # Generate recommendation using the summary data
        if cross_layer_connections > 0:
            recommendation = f"Found {cross_layer_connections} cross-layer insights. Primary expertise in {best_layer} layer with {total_matches} total matches. Consider multi-layer analysis for comprehensive understanding."
        elif total_matches > 0:
            recommendation = f"Found {total_matches} relevant matches primarily in {best_layer} layer. Consider expanding search to other layers for broader perspective."
        else:
            recommendation = "No significant matches found. Consider refining search terms or exploring different aspects of the query."
        
        summary_data['recommendation'] = recommendation
        return summary_data
    
    def _generate_recommendation(self, results: Dict[str, Any]) -> str:
        """Generate a recommendation based on query results - legacy method"""
        # Calculate values directly from results instead of relying on summary
        total_matches = sum(len(layer_data.get('matches', [])) for layer_data in results.get('layers', {}).values())
        cross_connections = len(results.get('cross_layer_insights', []))
        
        # Find primary layer
        best_layer = None
        best_score = 0
        for layer_name, layer_data in results.get('layers', {}).items():
            if layer_data.get('matches'):
                avg_score = np.mean([m['similarity'] for m in layer_data['matches']])
                if avg_score > best_score:
                    best_score = avg_score
                    best_layer = layer_name
        
        if cross_connections > 0:
            return f"Found {cross_connections} cross-layer insights. Primary expertise in {best_layer} layer with {total_matches} total matches. Consider multi-layer analysis for comprehensive understanding."
        elif total_matches > 0:
            return f"Found {total_matches} relevant matches primarily in {best_layer} layer. Consider expanding search to other layers for broader perspective."
        else:
            return "No significant matches found. Consider refining search terms or exploring different aspects of the query."
    
    # Helper methods for scoring and analysis
    def _calculate_investment_score(self, researcher_data: pd.Series) -> float:
        """Calculate investment potential score for a researcher"""
        h_index = researcher_data.get('h_index', 0)
        citations = researcher_data.get('total_citations', 0)
        collaborations = researcher_data.get('collaboration_count', 0)
        
        # Weighted scoring
        score = (h_index * 0.4 + np.log(citations + 1) * 0.4 + collaborations * 0.2) / 100
        return min(max(score, 0), 1)  # Normalize to 0-1
    
    def _assess_risk_level(self, researcher_data: pd.Series) -> str:
        """Assess investment risk level"""
        years_active = researcher_data.get('years_active', 0)
        h_index = researcher_data.get('h_index', 0)
        
        if years_active > 10 and h_index > 20:
            return 'low'
        elif years_active > 5 and h_index > 10:
            return 'medium'
        else:
            return 'high'
    
    def _evaluate_market_potential(self, field: str) -> float:
        """Evaluate market potential for a research field"""
        high_potential_fields = ['artificial intelligence', 'machine learning', 'biotechnology', 'quantum computing']
        medium_potential_fields = ['computer science', 'data science', 'robotics', 'materials science']
        
        field_lower = str(field).lower()
        
        if any(hp_field in field_lower for hp_field in high_potential_fields):
            return np.random.uniform(0.7, 0.9)
        elif any(mp_field in field_lower for mp_field in medium_potential_fields):
            return np.random.uniform(0.5, 0.7)
        else:
            return np.random.uniform(0.3, 0.6)
    
    def _calculate_founder_readiness(self, researcher_data: pd.Series) -> float:
        """Calculate founder readiness score"""
        industry_exp = researcher_data.get('industry_experience', 0)
        collaborations = researcher_data.get('collaboration_count', 0)
        h_index = researcher_data.get('h_index', 0)
        
        # Weighted scoring for founder readiness
        score = (industry_exp * 0.5 + collaborations * 0.3 + h_index * 0.2) / 50
        return min(max(score, 0), 1)
    
    def _predict_startup_success(self, researcher_data: pd.Series) -> float:
        """Predict startup success probability"""
        funding = researcher_data.get('funding_received', 0)
        years_active = researcher_data.get('years_active', 0)
        h_index = researcher_data.get('h_index', 0)
        
        # Success prediction model (simplified)
        if funding > 0:  # Has received funding
            base_score = 0.6
        else:
            base_score = 0.3
        
        experience_bonus = min(years_active * 0.02, 0.2)
        impact_bonus = min(h_index * 0.01, 0.2)
        
        return min(base_score + experience_bonus + impact_bonus, 0.9)
    
    async def get_layer_statistics(self) -> Dict[str, Any]:
        """Get comprehensive statistics for all layers"""
        stats = {}
        
        for layer_name, layer_data in self.layers.items():
            graph = layer_data['knowledge_graph']
            
            node_types = {}
            for node, data in graph.nodes(data=True):
                node_type = data.get('type', 'unknown')
                node_types[node_type] = node_types.get(node_type, 0) + 1
            
            edge_types = {}
            for u, v, data in graph.edges(data=True):
                edge_type = data.get('type', 'unknown')
                edge_types[edge_type] = edge_types.get(edge_type, 0) + 1
            
            stats[layer_name] = {
                'name': layer_data['name'],
                'description': layer_data['description'],
                'total_nodes': len(graph.nodes()),
                'total_edges': len(graph.edges()),
                'node_types': node_types,
                'edge_types': edge_types,
                'vector_store_size': len(layer_data['vector_store'].get('texts', [])),
                'has_connections': len(layer_data['metadata']) > 0
            }
        
        return {
            'layers': stats,
            'total_nodes': sum(s['total_nodes'] for s in stats.values()),
            'total_edges': sum(s['total_edges'] for s in stats.values()),
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }

# Example usage and testing
async def main():
    """Test the RAG/GRAPH engine"""
    engine = VERSSAIRAGGraphEngine()
    
    # Initialize all layers
    init_result = await engine.initialize_layers()
    print("🎯 Initialization Result:")
    print(json.dumps(init_result, indent=2))
    
    # Test multi-layer query
    query_result = await engine.query_multi_layer(
        "machine learning startup founding",
        layer_weights={'roof': 0.5, 'vc': 0.3, 'founder': 0.2}
    )
    
    print("\n🔍 Query Result:")
    print(json.dumps(query_result['summary'], indent=2))
    
    # Get layer statistics
    stats = await engine.get_layer_statistics()
    print("\n📊 Layer Statistics:")
    print(json.dumps(stats, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
