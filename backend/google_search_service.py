"""
Google Custom Search API Service for VERSSAI VC Intelligence Platform
Enhanced research capabilities for founder and company intelligence
"""
import os
import asyncio
import httpx
import json
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import hashlib
from urllib.parse import quote_plus

logger = logging.getLogger(__name__)

@dataclass
class SearchResult:
    title: str
    link: str
    snippet: str
    display_link: str
    formatted_url: str
    html_title: str = ""
    html_snippet: str = ""
    image_url: Optional[str] = None
    page_map: Optional[Dict[str, Any]] = None

@dataclass
class SearchResponse:
    query: str
    total_results: int
    search_time: float
    results: List[SearchResult]
    next_page_token: Optional[str] = None
    search_information: Optional[Dict[str, Any]] = None

class GoogleSearchService:
    """Google Custom Search API service for VC research"""
    
    def __init__(self):
        self.api_key = os.environ.get('GOOGLE_API_KEY')
        self.search_engine_id = os.environ.get('GOOGLE_SEARCH_ENGINE_ID')
        self.base_url = "https://www.googleapis.com/customsearch/v1"
        self.session = httpx.AsyncClient(timeout=30)
        self.cache = {}  # Simple in-memory cache
        self.cache_ttl = 3600  # 1 hour
        
        if not self.api_key:
            logger.warning("GOOGLE_API_KEY not configured - search functionality will be limited")
    
    async def search_founder_information(
        self,
        founder_name: str,
        company_name: Optional[str] = None,
        include_social_media: bool = True,
        include_news: bool = True
    ) -> Dict[str, Any]:
        """Search for comprehensive founder information"""
        
        if not self.api_key:
            return self._create_mock_founder_data(founder_name, company_name)
        
        try:
            # Build targeted search queries
            queries = []
            
            # Primary founder query
            base_query = f'"{founder_name}"'
            if company_name:
                base_query += f' "{company_name}"'
            queries.append(("primary", base_query))
            
            # Professional background query
            professional_query = f'"{founder_name}" CEO founder executive biography'
            if company_name:
                professional_query += f' "{company_name}"'
            queries.append(("professional", professional_query))
            
            # Social media queries if requested
            if include_social_media:
                social_query = f'"{founder_name}" LinkedIn Twitter site:linkedin.com OR site:twitter.com'
                queries.append(("social", social_query))
            
            if include_news:
                news_query = f'"{founder_name}" news interview article'
                if company_name:
                    news_query += f' "{company_name}"'
                queries.append(("news", news_query))
            
            # Execute searches concurrently
            search_tasks = [
                self._execute_search(query_type, query)
                for query_type, query in queries
            ]
            
            search_results = await asyncio.gather(*search_tasks, return_exceptions=True)
            
            # Compile results
            compiled_results = {
                "founder_name": founder_name,
                "company_name": company_name,
                "search_timestamp": datetime.now().isoformat(),
                "results_by_category": {},
                "consolidated_results": [],
                "key_insights": [],
                "social_profiles": [],
                "recent_news": []
            }
            
            for (query_type, _), result in zip(queries, search_results):
                if isinstance(result, Exception):
                    logger.error(f"Search failed for {query_type}: {str(result)}")
                    compiled_results["results_by_category"][query_type] = {"error": str(result)}
                else:
                    compiled_results["results_by_category"][query_type] = result
                    if result.get("results"):
                        compiled_results["consolidated_results"].extend(result["results"])
            
            # Extract insights and categorize results
            compiled_results = self._extract_founder_insights(compiled_results)
            
            return compiled_results
            
        except Exception as e:
            logger.error(f"Error in founder search: {e}")
            return self._create_mock_founder_data(founder_name, company_name)
    
    async def search_company_intelligence(
        self,
        company_name: str,
        industry: Optional[str] = None,
        include_financials: bool = True,
        include_news: bool = True,
        include_competitors: bool = True
    ) -> Dict[str, Any]:
        """Search for comprehensive company intelligence"""
        
        if not self.api_key:
            return self._create_mock_company_data(company_name, industry)
        
        try:
            queries = []
            
            # Primary company query
            base_query = f'"{company_name}"'
            if industry:
                base_query += f' {industry}'
            queries.append(("primary", base_query))
            
            # Funding and financial information
            if include_financials:
                funding_query = f'"{company_name}" funding investment Series A B C valuation revenue'
                queries.append(("financials", funding_query))
            
            # Recent news and developments
            if include_news:
                news_query = f'"{company_name}" news announcement launch product'
                queries.append(("news", news_query))
            
            # Competitor analysis
            if include_competitors:
                competitor_query = f'"{company_name}" competitors alternative vs comparison'
                queries.append(("competitors", competitor_query))
            
            # Industry analysis
            if industry:
                industry_query = f'{industry} market analysis trends "{company_name}"'
                queries.append(("industry", industry_query))
            
            # Execute searches concurrently
            search_tasks = [
                self._execute_search(query_type, query, date_restrict="y1")  # Last year
                for query_type, query in queries
            ]
            
            search_results = await asyncio.gather(*search_tasks, return_exceptions=True)
            
            # Compile comprehensive company intelligence
            intelligence_report = {
                "company_name": company_name,
                "industry": industry,
                "search_timestamp": datetime.now().isoformat(),
                "intelligence_categories": {},
                "key_insights": [],
                "all_sources": [],
                "funding_information": [],
                "recent_developments": [],
                "competitive_analysis": []
            }
            
            for (query_type, _), result in zip(queries, search_results):
                if isinstance(result, Exception):
                    logger.error(f"Company intelligence search failed for {query_type}: {str(result)}")
                    intelligence_report["intelligence_categories"][query_type] = {"error": str(result)}
                else:
                    intelligence_report["intelligence_categories"][query_type] = result
                    if result.get("results"):
                        intelligence_report["all_sources"].extend(result["results"])
            
            # Extract company-specific insights
            intelligence_report = self._extract_company_insights(intelligence_report)
            
            return intelligence_report
            
        except Exception as e:
            logger.error(f"Error in company intelligence search: {e}")
            return self._create_mock_company_data(company_name, industry)
    
    async def _execute_search(
        self,
        search_type: str,
        query: str,
        max_results: int = 10,
        **search_params
    ) -> Dict[str, Any]:
        """Execute search with caching support"""
        
        cache_key = hashlib.md5(f"{search_type}_{query}_{json.dumps(search_params, sort_keys=True)}".encode()).hexdigest()
        
        # Check cache first
        if cache_key in self.cache:
            cached_item = self.cache[cache_key]
            if datetime.now() < cached_item["expiry"]:
                logger.info(f"Cache hit for query: {query[:50]}...")
                return cached_item["data"]
        
        try:
            params = {
                "key": self.api_key,
                "cx": self.search_engine_id or "temp_engine_id",  # Will need to be created
                "q": query,
                "num": min(max_results, 10),  # Max 10 per request
                "lr": "lang_en",
                "safe": "medium"
            }
            
            # Add optional parameters
            for param, value in search_params.items():
                if value:
                    params[param] = value
            
            logger.info(f"Executing Google search: {query}")
            start_time = datetime.now()
            
            response = await self.session.get(self.base_url, params=params)
            response.raise_for_status()
            
            search_time = (datetime.now() - start_time).total_seconds()
            data = response.json()
            
            # Parse search results
            results = []
            if "items" in data:
                for item in data["items"]:
                    result = {
                        "title": item.get("title", ""),
                        "url": item.get("link", ""),
                        "snippet": item.get("snippet", ""),
                        "display_link": item.get("displayLink", ""),
                        "formatted_url": item.get("formattedUrl", ""),
                        "relevance_score": self._calculate_relevance_score(item, query)
                    }
                    results.append(result)
            
            # Extract search metadata
            search_info = data.get("searchInformation", {})
            total_results = int(search_info.get("totalResults", "0"))
            
            result_data = {
                "search_type": search_type,
                "query": query,
                "total_results": total_results,
                "search_time": search_time,
                "results": results
            }
            
            # Cache results
            self.cache[cache_key] = {
                "data": result_data,
                "expiry": datetime.now() + timedelta(seconds=self.cache_ttl)
            }
            
            return result_data
            
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 403:
                logger.error("Google API quota exceeded or invalid API key")
                return {"error": "API quota exceeded", "results": []}
            elif e.response.status_code == 400:
                logger.error(f"Invalid search parameters: {e.response.text}")
                return {"error": "Invalid parameters", "results": []}
            else:
                logger.error(f"Google API error: {e.response.status_code}")
                return {"error": f"Search API error: {e.response.status_code}", "results": []}
        except Exception as e:
            logger.error(f"Search execution failed: {str(e)}")
            return {"error": str(e), "results": []}
    
    def _calculate_relevance_score(self, result: Dict[str, Any], query: str) -> float:
        """Calculate relevance score for search result"""
        score = 0.0
        query_terms = query.lower().replace('"', '').split()
        
        title = result.get("title", "").lower()
        snippet = result.get("snippet", "").lower()
        
        # Title relevance (higher weight)
        for term in query_terms:
            if term in title:
                score += 2.0
        
        # Snippet relevance
        for term in query_terms:
            if term in snippet:
                score += 1.0
        
        # Domain authority (simple heuristic)
        display_link = result.get("displayLink", "").lower()
        if any(domain in display_link for domain in 
               ['crunchbase.com', 'linkedin.com', 'techcrunch.com', 'forbes.com', 'bloomberg.com']):
            score += 1.5
        
        return round(score, 2)
    
    def _extract_founder_insights(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Extract founder-specific insights from search results"""
        
        # Extract social profiles
        social_profiles = []
        if "social" in results["results_by_category"]:
            social_results = results["results_by_category"]["social"].get("results", [])
            for result in social_results:
                if "linkedin.com" in result.get("url", ""):
                    social_profiles.append({
                        "platform": "LinkedIn",
                        "url": result["url"],
                        "title": result["title"]
                    })
                elif "twitter.com" in result.get("url", ""):
                    social_profiles.append({
                        "platform": "Twitter",
                        "url": result["url"],
                        "title": result["title"]
                    })
        
        # Extract recent news
        recent_news = []
        if "news" in results["results_by_category"]:
            news_results = results["results_by_category"]["news"].get("results", [])
            for result in news_results[:3]:  # Top 3 news items
                recent_news.append({
                    "title": result["title"],
                    "url": result["url"],
                    "snippet": result["snippet"],
                    "source": result.get("display_link", "")
                })
        
        # Extract key insights
        key_insights = []
        for result in results["consolidated_results"][:5]:  # Top 5 overall results
            snippet = result.get("snippet", "")
            if any(keyword in snippet.lower() for keyword in 
                   ["founded", "ceo", "experience", "background", "education", "previously"]):
                key_insights.append(f"Professional Background: {snippet[:200]}...")
        
        results["social_profiles"] = social_profiles
        results["recent_news"] = recent_news
        results["key_insights"] = key_insights
        
        return results
    
    def _extract_company_insights(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Extract company-specific insights from search results"""
        
        # Extract funding information
        funding_info = []
        if "financials" in results["intelligence_categories"]:
            financial_results = results["intelligence_categories"]["financials"].get("results", [])
            for result in financial_results[:3]:  # Top 3 financial results
                snippet = result.get("snippet", "").lower()
                if any(term in snippet for term in ["raised", "funding", "investment", "series", "valuation"]):
                    funding_info.append({
                        "title": result["title"],
                        "url": result["url"],
                        "snippet": result["snippet"],
                        "source": result.get("display_link", "")
                    })
        
        # Extract recent developments
        recent_developments = []
        if "news" in results["intelligence_categories"]:
            news_results = results["intelligence_categories"]["news"].get("results", [])
            for result in news_results[:3]:  # Top 3 news results
                recent_developments.append({
                    "title": result["title"],
                    "url": result["url"],
                    "snippet": result["snippet"],
                    "source": result.get("display_link", "")
                })
        
        # Extract competitive analysis
        competitive_analysis = []
        if "competitors" in results["intelligence_categories"]:
            competitor_results = results["intelligence_categories"]["competitors"].get("results", [])
            for result in competitor_results[:3]:  # Top 3 competitor mentions
                competitive_analysis.append({
                    "title": result["title"],
                    "url": result["url"],
                    "snippet": result["snippet"],
                    "source": result.get("display_link", "")
                })
        
        results["funding_information"] = funding_info
        results["recent_developments"] = recent_developments
        results["competitive_analysis"] = competitive_analysis
        
        return results
    
    def _create_mock_founder_data(self, founder_name: str, company_name: str) -> Dict[str, Any]:
        """Create mock founder data when API is not available"""
        return {
            "founder_name": founder_name,
            "company_name": company_name,
            "search_timestamp": datetime.now().isoformat(),
            "results_by_category": {},
            "consolidated_results": [],
            "key_insights": [f"Google API key not configured - unable to research {founder_name}"],
            "social_profiles": [],
            "recent_news": [],
            "api_status": "not_configured"
        }
    
    def _create_mock_company_data(self, company_name: str, industry: str) -> Dict[str, Any]:
        """Create mock company data when API is not available"""
        return {
            "company_name": company_name,
            "industry": industry,
            "search_timestamp": datetime.now().isoformat(),
            "intelligence_categories": {},
            "key_insights": [f"Google API key not configured - unable to research {company_name}"],
            "all_sources": [],
            "funding_information": [],
            "recent_developments": [],
            "competitive_analysis": [],
            "api_status": "not_configured"
        }
    
    async def close(self):
        """Close the HTTP session"""
        await self.session.aclose()

# Global service instance
google_search_service = GoogleSearchService()

# Convenience functions
async def search_founder_intelligence(founder_name: str, company_name: str = None) -> Dict[str, Any]:
    """Search for founder intelligence using Google Custom Search"""
    return await google_search_service.search_founder_information(founder_name, company_name)

async def search_company_intelligence(company_name: str, industry: str = None) -> Dict[str, Any]:
    """Search for company intelligence using Google Custom Search"""
    return await google_search_service.search_company_intelligence(company_name, industry)