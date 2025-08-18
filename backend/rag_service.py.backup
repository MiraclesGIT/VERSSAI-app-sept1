"""
VERSSAI 3-Level RAG Service
Implements Platform, Investor, and Company-specific knowledge retrieval
"""
import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import uuid
from typing import List, Dict, Any, Optional
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class VERSSAIRAGService:
    """
    3-Level RAG Architecture for VERSSAI VC Intelligence Platform
    
    Level 1: Platform RAG - Research papers, industry benchmarks, VC best practices
    Level 2: Investor RAG - Investment thesis, portfolio companies, personal preferences  
    Level 3: Company RAG - Company documents, financials, due diligence materials
    """
    
    def __init__(self):
        self.chroma_client = None
        self.embedding_model = None
        self.collections = {}
        self.initialize_rag_system()
    
    def initialize_rag_system(self):
        """Initialize ChromaDB and embedding model"""
        try:
            # Initialize ChromaDB
            chroma_host = os.environ.get('CHROMA_HOST', 'localhost')
            chroma_port = int(os.environ.get('CHROMA_PORT', '8001'))
            
            # Try to connect to ChromaDB server, fallback to persistent client
            try:
                self.chroma_client = chromadb.HttpClient(
                    host=chroma_host,
                    port=chroma_port
                )
                # Test connection
                self.chroma_client.heartbeat()
                logger.info("Connected to ChromaDB server")
            except Exception as e:
                logger.warning(f"ChromaDB server not available, using persistent client: {e}")
                # Use persistent client as fallback
                chroma_path = Path("./chroma_db")
                chroma_path.mkdir(exist_ok=True)
                self.chroma_client = chromadb.PersistentClient(path=str(chroma_path))
            
            # Initialize sentence transformer for embeddings
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Initialized sentence transformer model")
            
            # Create collections for each RAG level
            self.setup_collections()
            
        except Exception as e:
            logger.error(f"Error initializing RAG system: {e}")
            raise
    
    def setup_collections(self):
        """Create ChromaDB collections for each RAG level"""
        try:
            # Level 1: Platform Knowledge
            self.collections['platform'] = self.chroma_client.get_or_create_collection(
                name="verssai_platform_knowledge",
                metadata={"description": "Research papers, industry benchmarks, VC best practices"}
            )
            
            # Level 2: Investor Knowledge
            self.collections['investor'] = self.chroma_client.get_or_create_collection(
                name="verssai_investor_knowledge", 
                metadata={"description": "Investment thesis, portfolio companies, investor preferences"}
            )
            
            # Level 3: Company Knowledge
            self.collections['company'] = self.chroma_client.get_or_create_collection(
                name="verssai_company_knowledge",
                metadata={"description": "Company documents, financials, due diligence materials"}
            )
            
            logger.info("RAG collections initialized successfully")
            
        except Exception as e:
            logger.error(f"Error setting up collections: {e}")
            raise
    
    def add_to_platform_knowledge(self, documents: List[Dict[str, Any]]):
        """
        Add documents to Level 1 Platform RAG
        
        Args:
            documents: List of dicts with 'content', 'metadata', 'document_id' keys
        """
        try:
            texts = [doc['content'] for doc in documents]
            embeddings = self.embedding_model.encode(texts).tolist()
            
            self.collections['platform'].add(
                embeddings=embeddings,
                documents=texts,
                metadatas=[doc['metadata'] for doc in documents],
                ids=[doc['document_id'] for doc in documents]
            )
            
            logger.info(f"Added {len(documents)} documents to platform knowledge")
            
        except Exception as e:
            logger.error(f"Error adding to platform knowledge: {e}")
            raise
    
    def add_to_investor_knowledge(self, investor_id: str, documents: List[Dict[str, Any]]):
        """
        Add documents to Level 2 Investor RAG
        
        Args:
            investor_id: Unique identifier for the investor
            documents: List of investor-specific documents
        """
        try:
            texts = [doc['content'] for doc in documents]
            embeddings = self.embedding_model.encode(texts).tolist()
            
            # Add investor_id to metadata for filtering
            metadatas = []
            for doc in documents:
                metadata = doc['metadata'].copy()
                metadata['investor_id'] = investor_id
                metadatas.append(metadata)
            
            self.collections['investor'].add(
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas,
                ids=[f"{investor_id}_{doc['document_id']}" for doc in documents]
            )
            
            logger.info(f"Added {len(documents)} documents for investor {investor_id}")
            
        except Exception as e:
            logger.error(f"Error adding to investor knowledge: {e}")
            raise
    
    def add_to_company_knowledge(self, company_id: str, documents: List[Dict[str, Any]]):
        """
        Add documents to Level 3 Company RAG
        
        Args:
            company_id: Unique identifier for the company
            documents: List of company-specific documents
        """
        try:
            texts = [doc['content'] for doc in documents]
            embeddings = self.embedding_model.encode(texts).tolist()
            
            # Add company_id to metadata for filtering
            metadatas = []
            for doc in documents:
                metadata = doc['metadata'].copy()
                metadata['company_id'] = company_id
                metadatas.append(metadata)
            
            self.collections['company'].add(
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas,
                ids=[f"{company_id}_{doc['document_id']}" for doc in documents]
            )
            
            logger.info(f"Added {len(documents)} documents for company {company_id}")
            
        except Exception as e:
            logger.error(f"Error adding to company knowledge: {e}")
            raise
    
    def query_platform_knowledge(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Query Level 1 Platform RAG for research papers and industry insights
        
        Args:
            query: Search query
            top_k: Number of results to return
            
        Returns:
            List of relevant documents with metadata and scores
        """
        try:
            query_embedding = self.embedding_model.encode([query]).tolist()
            
            results = self.collections['platform'].query(
                query_embeddings=query_embedding,
                n_results=top_k
            )
            
            formatted_results = []
            for i in range(len(results['documents'][0])):
                formatted_results.append({
                    'content': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i],
                    'score': results['distances'][0][i],
                    'level': 'platform'
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error querying platform knowledge: {e}")
            return []
    
    def query_investor_knowledge(self, investor_id: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Query Level 2 Investor RAG for investor-specific insights
        
        Args:
            investor_id: Investor to query for
            query: Search query
            top_k: Number of results to return
            
        Returns:
            List of relevant investor documents
        """
        try:
            query_embedding = self.embedding_model.encode([query]).tolist()
            
            results = self.collections['investor'].query(
                query_embeddings=query_embedding,
                n_results=top_k,
                where={"investor_id": {"$eq": investor_id}}
            )
            
            formatted_results = []
            for i in range(len(results['documents'][0])):
                formatted_results.append({
                    'content': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i],
                    'score': results['distances'][0][i],
                    'level': 'investor'
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error querying investor knowledge: {e}")
            return []
    
    def query_company_knowledge(self, company_id: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Query Level 3 Company RAG for company-specific documents
        
        Args:
            company_id: Company to query for
            query: Search query
            top_k: Number of results to return
            
        Returns:
            List of relevant company documents
        """
        try:
            query_embedding = self.embedding_model.encode([query]).tolist()
            
            results = self.collections['company'].query(
                query_embeddings=query_embedding,
                n_results=top_k,
                where={"company_id": {"$eq": company_id}}
            )
            
            formatted_results = []
            for i in range(len(results['documents'][0])):
                formatted_results.append({
                    'content': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i],
                    'score': results['distances'][0][i],
                    'level': 'company'
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error querying company knowledge: {e}")
            return []
    
    def multi_level_query(self, query: str, investor_id: Optional[str] = None, 
                         company_id: Optional[str] = None, top_k: int = 3) -> Dict[str, Any]:
        """
        Perform intelligent multi-level RAG query across all relevant levels
        
        Args:
            query: Search query
            investor_id: Optional investor context
            company_id: Optional company context
            top_k: Results per level
            
        Returns:
            Comprehensive results from all relevant levels
        """
        try:
            results = {
                'query': query,
                'platform_results': self.query_platform_knowledge(query, top_k),
                'investor_results': [],
                'company_results': [],
                'synthesis': None
            }
            
            # Query investor level if investor_id provided
            if investor_id:
                results['investor_results'] = self.query_investor_knowledge(
                    investor_id, query, top_k
                )
            
            # Query company level if company_id provided
            if company_id:
                results['company_results'] = self.query_company_knowledge(
                    company_id, query, top_k
                )
            
            # TODO: Add AI synthesis of multi-level results
            results['synthesis'] = self._synthesize_multi_level_results(results)
            
            return results
            
        except Exception as e:
            logger.error(f"Error in multi-level query: {e}")
            return {'error': str(e)}
    
    def _synthesize_multi_level_results(self, results: Dict[str, Any]) -> str:
        """
        Synthesize insights from multiple RAG levels (placeholder for AI synthesis)
        
        Args:
            results: Multi-level query results
            
        Returns:
            Synthesized insights string
        """
        # Placeholder - in Phase 2B we'll add AI synthesis here
        synthesis_parts = []
        
        if results['platform_results']:
            synthesis_parts.append(f"Platform insights: {len(results['platform_results'])} relevant research findings")
        
        if results['investor_results']:
            synthesis_parts.append(f"Investor context: {len(results['investor_results'])} relevant thesis/portfolio insights")
        
        if results['company_results']:
            synthesis_parts.append(f"Company specifics: {len(results['company_results'])} relevant documents")
        
        return " | ".join(synthesis_parts) if synthesis_parts else "No relevant insights found"
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get RAG system status and statistics"""
        try:
            status = {
                'rag_system': 'operational',
                'embedding_model': 'all-MiniLM-L6-v2',
                'collections': {}
            }
            
            for level, collection in self.collections.items():
                try:
                    count = collection.count()
                    status['collections'][level] = {
                        'name': collection.name,
                        'document_count': count,
                        'status': 'active'
                    }
                except Exception as e:
                    status['collections'][level] = {
                        'status': 'error',
                        'error': str(e)
                    }
            
            return status
            
        except Exception as e:
            return {'rag_system': 'error', 'error': str(e)}

# Global RAG service instance
rag_service = VERSSAIRAGService()

# Utility functions for easy import
def query_multi_level(query: str, investor_id: str = None, company_id: str = None, top_k: int = 3):
    """Convenience function for multi-level RAG queries"""
    return rag_service.multi_level_query(query, investor_id, company_id, top_k)

def add_platform_document(content: str, metadata: Dict[str, Any], document_id: str = None):
    """Convenience function to add platform documents"""
    if not document_id:
        document_id = str(uuid.uuid4())
    
    documents = [{
        'content': content,
        'metadata': metadata,
        'document_id': document_id
    }]
    
    return rag_service.add_to_platform_knowledge(documents)

def add_company_document(company_id: str, content: str, metadata: Dict[str, Any], document_id: str = None):
    """Convenience function to add company documents"""
    if not document_id:
        document_id = str(uuid.uuid4())
    
    documents = [{
        'content': content,
        'metadata': metadata,
        'document_id': document_id
    }]
    
    return rag_service.add_to_company_knowledge(company_id, documents)