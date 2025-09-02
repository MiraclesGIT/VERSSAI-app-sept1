#!/usr/bin/env python3
"""
VERSSAI Enhanced Backend with Complete Excel Dataset Integration
NOW WITH FULL 1,157 PAPERS AND 2,311 RESEARCHERS!
"""

import sys
import os
import uvicorn
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json
from typing import List, Dict, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime

class VERSSAIFullAcademicAPI:
    """
    Complete Academic Intelligence API using full Excel dataset
    """
    
    def __init__(self, excel_file_path: str = "VERSSAI_Massive_Dataset_Complete.xlsx"):
        self.excel_file_path = excel_file_path
        self.datasets = {}
        self.search_indices = {}
        self.load_complete_datasets()
        self.setup_advanced_search()
    
    def load_complete_datasets(self):
        """Load complete Excel dataset with all sheets"""
        try:
            print("🚀 Loading Complete VERSSAI Academic Dataset...")
            
            # Load all sheets from Excel
            self.datasets['summary'] = pd.read_excel(self.excel_file_path, sheet_name='Summary_Statistics')
            self.datasets['references'] = pd.read_excel(self.excel_file_path, sheet_name='References_1157')
            self.datasets['researchers'] = pd.read_excel(self.excel_file_path, sheet_name='Researchers_2311')
            self.datasets['institutions'] = pd.read_excel(self.excel_file_path, sheet_name='Institutions')
            self.datasets['citations'] = pd.read_excel(self.excel_file_path, sheet_name='Citation_Network')
            self.datasets['verified_papers'] = pd.read_excel(self.excel_file_path, sheet_name='Verified_Papers_32')
            
            # Additional analysis sheets
            self.datasets['category_analysis'] = pd.read_excel(self.excel_file_path, sheet_name='Category_Analysis')
            self.datasets['researcher_analysis'] = pd.read_excel(self.excel_file_path, sheet_name='Researcher_Analysis')
            self.datasets['institutional_analysis'] = pd.read_excel(self.excel_file_path, sheet_name='Institutional_Analysis')
            
            print("✅ Complete Academic Dataset Loaded Successfully!")
            print(f"📊 {len(self.datasets['references']):,} academic papers")
            print(f"👨‍🔬 {len(self.datasets['researchers']):,} expert researchers")
            print(f"🏛️ {len(self.datasets['institutions'])} top institutions")
            print(f"🔗 {len(self.datasets['citations']):,} citation connections")
            print(f"📚 {len(self.datasets['verified_papers'])} verified core papers")
            
        except Exception as e:
            print(f"❌ Error loading complete dataset: {e}")
            raise
    
    def setup_advanced_search(self):
        """Setup advanced text search capabilities"""
        try:
            print("🔍 Setting up advanced search indices...")
            
            # Create paper search index with title, authors, and abstract
            papers_text = (
                self.datasets['references']['title'].fillna('') + ' ' +
                self.datasets['references']['authors'].fillna('') + ' ' +
                self.datasets['references']['venue'].fillna('') + ' ' +
                self.datasets['references']['category'].fillna('')
            )
            
            self.search_indices['papers_vectorizer'] = TfidfVectorizer(
                stop_words='english', 
                max_features=10000,
                ngram_range=(1, 2)
            )
            self.search_indices['papers_vectors'] = self.search_indices['papers_vectorizer'].fit_transform(papers_text)
            
            # Create researcher search index
            researchers_text = (
                self.datasets['researchers']['name'].fillna('') + ' ' +
                self.datasets['researchers']['institution'].fillna('') + ' ' +
                self.datasets['researchers']['primary_field'].fillna('')
            )
            
            self.search_indices['researchers_vectorizer'] = TfidfVectorizer(
                stop_words='english',
                max_features=5000
            )
            self.search_indices['researchers_vectors'] = self.search_indices['researchers_vectorizer'].fit_transform(researchers_text)
            
            print("✅ Advanced search indices ready!")
            
        except Exception as e:
            print(f"⚠️ Search indexing failed: {e}")
            self.search_indices = {}
    
    def get_summary_stats(self):
        """Get comprehensive platform statistics"""
        base_stats = self.datasets['summary'].iloc[0].to_dict()
        
        # Add computed statistics
        enhanced_stats = {
            **base_stats,
            'top_institutions': self.datasets['institutions'].nlargest(5, 'research_output')[['name', 'country', 'research_output']].to_dict('records'),
            'research_quality_metrics': {
                'avg_h_index': self.datasets['researchers']['h_index'].mean(),
                'top_h_index': self.datasets['researchers']['h_index'].max(),
                'avg_citations_per_researcher': self.datasets['researchers']['total_citations'].mean(),
                'industry_experience_rate': self.datasets['researchers']['industry_experience'].mean()
            },
            'temporal_distribution': self.datasets['references']['year'].value_counts().sort_index().tail(5).to_dict()
        }
        
        return enhanced_stats
    
    def advanced_founder_validation(self, founder_name: str, founder_institution: str = None, founder_field: str = None) -> Dict:
        """Advanced founder validation with comprehensive analysis"""
        results = {
            'found_in_database': False,
            'academic_credibility': 0,
            'researcher_profile': None,
            'similar_researchers': [],
            'institutional_validation': None,
            'field_expertise_ranking': None,
            'validation_confidence': 0,
            'recommendations': []
        }
        
        researchers = self.datasets['researchers']
        
        # Direct name match (exact and fuzzy)
        exact_matches = researchers[researchers['name'].str.contains(founder_name, case=False, na=False)]
        
        if not exact_matches.empty:
            # Found exact match
            researcher = exact_matches.iloc[0]
            results['found_in_database'] = True
            results['researcher_profile'] = {
                'name': researcher['name'],
                'institution': researcher['institution'],
                'h_index': researcher['h_index'],
                'total_citations': researcher['total_citations'],
                'years_active': researcher['years_active'],
                'primary_field': researcher['primary_field'],
                'industry_experience': researcher['industry_experience'],
                'collaboration_count': researcher['collaboration_count'],
                'recent_papers': researcher['recent_papers'],
                'funding_received': researcher['funding_received']
            }
            
            # Calculate academic credibility score (0-100)
            h_index_score = min(50, researcher['h_index'] * 0.5)
            citations_score = min(30, researcher['total_citations'] / 1000 * 30)
            experience_score = 10 if researcher['industry_experience'] else 0
            collaboration_score = min(10, researcher['collaboration_count'] * 0.3)
            
            results['academic_credibility'] = h_index_score + citations_score + experience_score + collaboration_score
            results['validation_confidence'] = 95
            
            # Find similar researchers in the field
            field_researchers = researchers[
                (researchers['primary_field'] == researcher['primary_field']) &
                (researchers['name'] != researcher['name'])
            ].nlargest(5, 'h_index')
            
            results['similar_researchers'] = [
                {
                    'name': row['name'],
                    'institution': row['institution'],
                    'h_index': row['h_index'],
                    'citations': row['total_citations']
                }
                for _, row in field_researchers.iterrows()
            ]
            
            # Get field ranking
            field_ranking = researchers[researchers['primary_field'] == researcher['primary_field']]['h_index'].rank(ascending=False)
            researcher_rank = field_ranking[exact_matches.index[0]]
            total_in_field = len(researchers[researchers['primary_field'] == researcher['primary_field']])
            
            results['field_expertise_ranking'] = {
                'rank': int(researcher_rank),
                'total_in_field': int(total_in_field),
                'percentile': round((1 - researcher_rank / total_in_field) * 100, 1)
            }
            
        # Institution validation (even if founder not found)
        if founder_institution:
            institutions = self.datasets['institutions']
            institution_match = institutions[institutions['name'].str.contains(founder_institution, case=False, na=False)]
            
            if not institution_match.empty:
                inst = institution_match.iloc[0]
                results['institutional_validation'] = {
                    'institution_name': inst['name'],
                    'country': inst['country'],
                    'ranking': inst['ranking'],
                    'research_output': inst['research_output'],
                    'specialization': inst['specialization'],
                    'researcher_count': inst['researcher_count']
                }
        
        # Generate recommendations
        if results['found_in_database']:
            if results['academic_credibility'] > 70:
                results['recommendations'].append("✅ Strong academic credentials - high confidence in technical expertise")
            if results['researcher_profile']['industry_experience']:
                results['recommendations'].append("✅ Proven industry experience - good bridge between academia and business")
            if results['researcher_profile']['collaboration_count'] > 10:
                results['recommendations'].append("✅ Strong collaboration network - potential for advisor connections")
        else:
            results['recommendations'].append("⚠️ No academic profile found - consider validating technical claims through other channels")
            if founder_institution:
                results['recommendations'].append("💡 Consider reaching out to researchers at their institution for validation")
        
        return results
    
    def comprehensive_market_research(self, industry: str, technology: str = None, stage: str = None) -> Dict:
        """Comprehensive market research with advanced analysis"""
        search_terms = industry
        if technology:
            search_terms += f" {technology}"
        
        # Advanced search across papers
        if self.search_indices:
            query_vector = self.search_indices['papers_vectorizer'].transform([search_terms])
            similarities = cosine_similarity(query_vector, self.search_indices['papers_vectors']).flatten()
            
            # Get top relevant papers
            top_indices = similarities.argsort()[-20:][::-1]
            relevant_papers = self.datasets['references'].iloc[top_indices]
        else:
            # Fallback to simple text search
            relevant_papers = self.datasets['references'][
                (self.datasets['references']['title'].str.contains(industry, case=False, na=False)) |
                (self.datasets['references']['category'].str.contains(industry, case=False, na=False))
            ].head(20)
        
        # Calculate comprehensive insights
        if len(relevant_papers) > 0:
            # Research momentum analysis
            recent_papers = relevant_papers[relevant_papers['year'] >= 2020]
            momentum_score = len(recent_papers) / len(relevant_papers) * 100
            
            # Citation analysis
            avg_citations = relevant_papers['citation_count'].mean()
            max_citations = relevant_papers['citation_count'].max()
            citation_strength = min(100, avg_citations * 2)
            
            # Statistical significance analysis
            significant_papers = relevant_papers[relevant_papers['statistical_significance'] == True]
            rigor_score = len(significant_papers) / len(relevant_papers) * 100 if len(relevant_papers) > 0 else 0
            
            # Temporal trend analysis
            yearly_counts = relevant_papers.groupby('year').size()
            if len(yearly_counts) > 1:
                trend_slope = np.polyfit(yearly_counts.index, yearly_counts.values, 1)[0]
                trend_direction = "Growing" if trend_slope > 0.5 else "Stable" if trend_slope > -0.5 else "Declining"
            else:
                trend_direction = "Insufficient data"
            
            # Venue analysis (journal quality)
            venue_diversity = relevant_papers['venue'].nunique()
            top_venues = relevant_papers['venue'].value_counts().head(3).to_dict()
            
            insights = {
                'market_validation_score': min(100, int(citation_strength)),
                'research_momentum': momentum_score,
                'academic_interest_level': min(100, len(relevant_papers) * 5),
                'research_rigor_score': rigor_score,
                'trend_analysis': {
                    'direction': trend_direction,
                    'recent_growth': momentum_score,
                    'research_maturity': 'High' if avg_citations > 20 else 'Medium' if avg_citations > 10 else 'Early'
                },
                'key_papers': [
                    {
                        'title': row['title'],
                        'authors': row['authors'],
                        'year': row['year'],
                        'citations': row['citation_count'],
                        'venue': row['venue'],
                        'h_index_lead_author': row['h_index_lead_author'],
                        'statistical_significance': row['statistical_significance']
                    }
                    for _, row in relevant_papers.head(8).iterrows()
                ],
                'research_landscape': {
                    'total_papers_found': len(relevant_papers),
                    'venue_diversity': venue_diversity,
                    'top_venues': top_venues,
                    'average_citations': round(avg_citations, 1),
                    'max_citations': int(max_citations)
                },
                'confidence_level': min(100, len(relevant_papers) * 8),
                'investment_implications': self._generate_investment_implications(relevant_papers, momentum_score, rigor_score)
            }
        else:
            insights = {
                'market_validation_score': 0,
                'research_momentum': 0,
                'academic_interest_level': 0,
                'research_rigor_score': 0,
                'key_papers': [],
                'confidence_level': 0,
                'message': 'Limited academic research found for this market'
            }
        
        return insights
    
    def find_expert_advisors(self, industry: str, required_expertise: List[str], min_h_index: int = 30) -> List[Dict]:
        """Find expert academic advisors with comprehensive scoring"""
        candidates = []
        
        researchers = self.datasets['researchers']
        
        # Search for researchers with relevant expertise
        for expertise in required_expertise:
            relevant_researchers = researchers[
                (researchers['primary_field'].str.contains(expertise, case=False, na=False)) |
                (researchers['primary_field'].str.contains(industry, case=False, na=False))
            ]
            
            # Filter for quality candidates
            quality_candidates = relevant_researchers[
                (relevant_researchers['h_index'] >= min_h_index) &
                (relevant_researchers['years_active'] >= 3)
            ]
            
            for _, researcher in quality_candidates.iterrows():
                advisor_score = self._calculate_comprehensive_advisor_score(researcher)
                
                candidate = {
                    'name': researcher['name'],
                    'institution': researcher['institution'],
                    'expertise': researcher['primary_field'],
                    'h_index': researcher['h_index'],
                    'citations': researcher['total_citations'],
                    'years_active': researcher['years_active'],
                    'industry_experience': researcher['industry_experience'],
                    'collaboration_count': researcher['collaboration_count'],
                    'recent_papers': researcher['recent_papers'],
                    'funding_received': researcher['funding_received'],
                    'advisor_score': advisor_score,
                    'match_reason': f"Expert in {expertise}",
                    'availability_indicator': 'High' if researcher['collaboration_count'] > 15 else 'Medium',
                    'linkedin_url': researcher.get('linkedin_url', None),
                    'google_scholar_url': researcher.get('google_scholar_url', None)
                }
                candidates.append(candidate)
        
        # Remove duplicates and sort by comprehensive score
        unique_candidates = {c['name']: c for c in candidates}.values()
        return sorted(unique_candidates, key=lambda x: x['advisor_score'], reverse=True)[:15]
    
    def _calculate_comprehensive_advisor_score(self, researcher):
        """Calculate comprehensive advisor suitability score"""
        base_score = 0
        
        # H-index contribution (0-40 points)
        base_score += min(40, researcher['h_index'] * 0.8)
        
        # Industry experience bonus (20 points)
        if researcher['industry_experience']:
            base_score += 20
        
        # Years active (0-15 points)
        base_score += min(15, researcher['years_active'] * 1.5)
        
        # Citations contribution (0-15 points)
        base_score += min(15, researcher['total_citations'] / 500)
        
        # Collaboration score (0-10 points)
        base_score += min(10, researcher['collaboration_count'] * 0.5)
        
        return min(100, base_score)
    
    def _generate_investment_implications(self, papers, momentum_score, rigor_score):
        """Generate investment implications from research analysis"""
        implications = []
        
        if momentum_score > 70:
            implications.append("🚀 High research momentum suggests growing market opportunity")
        elif momentum_score < 30:
            implications.append("⚠️ Low research momentum may indicate mature or declining field")
        
        if rigor_score > 70:
            implications.append("✅ High statistical rigor provides confidence in research claims")
        elif rigor_score < 40:
            implications.append("⚠️ Limited statistical rigor - validate claims independently")
        
        if len(papers) > 50:
            implications.append("📚 Large research base indicates established field with multiple approaches")
        elif len(papers) < 10:
            implications.append("🔬 Limited research suggests early-stage or niche opportunity")
        
        return implications

# Initialize the enhanced academic API
try:
    # Check if Excel file exists
    excel_path = os.path.join(os.path.dirname(__file__), "..", "VERSSAI_Massive_Dataset_Complete.xlsx")
    if not os.path.exists(excel_path):
        excel_path = "VERSSAI_Massive_Dataset_Complete.xlsx"
    
    if os.path.exists(excel_path):
        academic_api = VERSSAIFullAcademicAPI(excel_path)
        print("🎉 Complete Academic Intelligence API loaded with full dataset!")
    else:
        print("⚠️ Excel dataset not found, falling back to CSV data")
        from verssai_academic_csv_api import VERSSAIAcademicCSVAPI
        academic_api = VERSSAIAcademicCSVAPI()
except Exception as e:
    print(f"⚠️ Academic API initialization failed: {e}")
    academic_api = None

# Create enhanced FastAPI app
app = FastAPI(
    title="VERSSAI Complete VC Intelligence Platform",
    description="AI-Powered VC Intelligence with Complete Academic Research Integration",
    version="3.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== ENHANCED ENDPOINTS ====================

@app.get("/")
async def root():
    return {
        "message": "VERSSAI Complete VC Intelligence Platform", 
        "version": "3.0.0",
        "features": ["Deal Pipeline", "Complete Academic Intelligence", "Advanced Research Insights", "Expert Network"],
        "dataset_status": "Complete" if academic_api and hasattr(academic_api, 'datasets') else "Limited",
        "academic_papers": len(academic_api.datasets['references']) if academic_api and hasattr(academic_api, 'datasets') else "Unknown",
        "status": "active"
    }

@app.get("/health")
async def health_check():
    dataset_info = {}
    if academic_api and hasattr(academic_api, 'datasets'):
        dataset_info = {
            "papers": len(academic_api.datasets['references']),
            "researchers": len(academic_api.datasets['researchers']),
            "institutions": len(academic_api.datasets['institutions']),
            "citations": len(academic_api.datasets['citations'])
        }
    
    return {
        "status": "healthy",
        "services": {
            "vc_platform": "active",
            "academic_intelligence": "complete" if academic_api and hasattr(academic_api, 'datasets') else "limited"
        },
        "dataset_info": dataset_info
    }

# Mock VC deal endpoints (replace with your existing ones)
@app.get("/api/deals")
async def get_deals():
    """Get all deals from VC pipeline"""
    mock_deals = [
        {
            "id": "deal-001",
            "company_name": "Neural Dynamics AI",
            "founders": [
                {"name": "Dr. Sarah Chen", "role": "CEO", "institution": "Stanford University"},
                {"name": "Mike Rodriguez", "role": "CTO", "institution": "MIT"}
            ],
            "stage": "Series A",
            "valuation": 12000000,
            "industry": "Artificial Intelligence",
            "technology": "Computer Vision",
            "status": "Due Diligence",
            "description": "AI-powered autonomous vehicle navigation system with breakthrough computer vision technology",
            "assigned_partner": "Jessica Williams"
        },
        {
            "id": "deal-002", 
            "company_name": "EcoLogistics Inc",
            "founders": [
                {"name": "Amanda Park", "role": "CEO", "institution": "UC Berkeley"}
            ],
            "stage": "Seed",
            "valuation": 8000000,
            "industry": "Supply Chain",
            "technology": "Optimization Algorithms",
            "status": "Qualified",
            "description": "Sustainable supply chain optimization platform reducing carbon footprint by 40%",
            "assigned_partner": "David Kim"
        }
    ]
    return {"status": "success", "data": mock_deals}

# ==================== COMPLETE ACADEMIC INTELLIGENCE ENDPOINTS ====================

@app.get("/api/academic/stats")
async def get_comprehensive_academic_stats():
    """Get comprehensive academic platform statistics"""
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic Intelligence not available")
    
    try:
        stats = academic_api.get_summary_stats()
        return {"status": "success", "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/academic/validate-founder")
async def advanced_founder_validation(founder_name: str, founder_institution: str = None, founder_field: str = None):
    """Advanced founder validation with comprehensive analysis"""
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic Intelligence not available")
    
    try:
        if hasattr(academic_api, 'advanced_founder_validation'):
            result = academic_api.advanced_founder_validation(founder_name, founder_institution, founder_field)
        else:
            result = academic_api.validate_founder_background(founder_name)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/academic/market-research")
async def comprehensive_market_research(industry: str, technology: str = None, stage: str = None):
    """Comprehensive market research with advanced analysis"""
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic Intelligence not available")
    
    try:
        if hasattr(academic_api, 'comprehensive_market_research'):
            result = academic_api.comprehensive_market_research(industry, technology, stage)
        else:
            result = academic_api.get_research_insights(industry)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/academic/find-advisors")
async def find_expert_advisors(industry: str, expertise: str, min_h_index: int = 30):
    """Find expert academic advisors with comprehensive scoring"""
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic Intelligence not available")
    
    try:
        expertise_list = [e.strip() for e in expertise.split(',')]
        if hasattr(academic_api, 'find_expert_advisors'):
            result = academic_api.find_expert_advisors(industry, expertise_list, min_h_index)
        else:
            result = academic_api.find_expert_researchers(industry, min_h_index)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ENHANCED DEAL ANALYSIS ====================

@app.get("/api/deals/{deal_id}/complete-academic-analysis")
async def get_complete_deal_analysis(deal_id: str):
    """Get complete academic analysis for a specific deal"""
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic Intelligence not available")
    
    try:
        # Get deal info
        deals_response = await get_deals()
        deals = deals_response["data"]
        deal = next((d for d in deals if d["id"] == deal_id), None)
        
        if not deal:
            raise HTTPException(status_code=404, detail="Deal not found")
        
        # Comprehensive academic analysis
        founder_validations = []
        market_analysis = None
        technology_analysis = None
        expert_recommendations = []
        
        # Validate all founders
        for founder in deal["founders"]:
            if hasattr(academic_api, 'advanced_founder_validation'):
                validation = academic_api.advanced_founder_validation(
                    founder["name"], 
                    founder.get("institution"),
                    deal.get("industry")
                )
            else:
                validation = academic_api.validate_founder_background(founder["name"])
            founder_validations.append({
                "founder": founder,
                "validation": validation
            })
        
        # Comprehensive market research
        if hasattr(academic_api, 'comprehensive_market_research'):
            market_analysis = academic_api.comprehensive_market_research(
                deal["industry"], 
                deal.get("technology"),
                deal.get("stage")
            )
        else:
            market_analysis = academic_api.get_research_insights(deal["industry"])
        
        # Technology-specific analysis
        if deal.get("technology") and hasattr(academic_api, 'comprehensive_market_research'):
            technology_analysis = academic_api.comprehensive_market_research(deal["technology"])
        
        # Find expert advisors
        expertise_areas = [deal["industry"]]
        if deal.get("technology"):
            expertise_areas.append(deal["technology"])
        
        if hasattr(academic_api, 'find_expert_advisors'):
            expert_recommendations = academic_api.find_expert_advisors(
                deal["industry"], 
                expertise_areas,
                min_h_index=40
            )
        
        # Calculate comprehensive scores
        overall_academic_score = calculate_comprehensive_academic_score(
            founder_validations, market_analysis, technology_analysis
        )
        
        analysis = {
            "deal_id": deal_id,
            "company_name": deal["company_name"],
            "analysis_timestamp": datetime.now().isoformat(),
            "comprehensive_academic_intelligence": {
                "founder_validations": founder_validations,
                "market_analysis": market_analysis,
                "technology_analysis": technology_analysis,
                "expert_recommendations": expert_recommendations[:10],
                "overall_academic_score": overall_academic_score,
                "investment_confidence": calculate_investment_confidence(overall_academic_score),
                "risk_assessment": generate_academic_risk_assessment(founder_validations, market_analysis),
                "strategic_recommendations": generate_strategic_recommendations(
                    founder_validations, market_analysis, expert_recommendations
                )
            }
        }
        
        return {"status": "success", "data": analysis}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_comprehensive_academic_score(founder_validations, market_analysis, technology_analysis):
    """Calculate comprehensive academic confidence score"""
    score = 0
    
    # Founder credibility (40% weight)
    if founder_validations:
        founder_scores = [fv['validation'].get('academic_credibility', 0) for fv in founder_validations]
        avg_founder_score = sum(founder_scores) / len(founder_scores)
        score += avg_founder_score * 0.4
    
    # Market validation (35% weight)
    if market_analysis:
        market_score = market_analysis.get('market_validation_score', 0)
        score += market_score * 0.35
    
    # Technology validation (25% weight)
    if technology_analysis:
        tech_score = technology_analysis.get('market_validation_score', 0)
        score += tech_score * 0.25
    
    return min(100, score)

def calculate_investment_confidence(academic_score):
    """Calculate investment confidence level"""
    if academic_score >= 80:
        return "Very High"
    elif academic_score >= 65:
        return "High"
    elif academic_score >= 50:
        return "Medium"
    elif academic_score >= 30:
        return "Low"
    else:
        return "Very Low"

def generate_academic_risk_assessment(founder_validations, market_analysis):
    """Generate comprehensive risk assessment"""
    risks = []
    
    # Founder risks
    unvalidated_founders = [fv for fv in founder_validations if not fv['validation'].get('found_in_database')]
    if unvalidated_founders:
        risks.append({
            "type": "Founder Validation Risk",
            "level": "Medium",
            "description": f"{len(unvalidated_founders)} founder(s) not found in academic database"
        })
    
    # Market risks
    if market_analysis and market_analysis.get('research_momentum', 0) < 30:
        risks.append({
            "type": "Market Research Risk",
            "level": "Medium",
            "description": "Limited recent research momentum in this market"
        })
    
    if market_analysis and market_analysis.get('confidence_level', 0) < 50:
        risks.append({
            "type": "Market Validation Risk",
            "level": "High",
            "description": "Limited academic research supporting market opportunity"
        })
    
    return risks

def generate_strategic_recommendations(founder_validations, market_analysis, expert_recommendations):
    """Generate strategic recommendations based on academic intelligence"""
    recommendations = []
    
    # Founder-based recommendations
    high_credibility_founders = [fv for fv in founder_validations if fv['validation'].get('academic_credibility', 0) > 70]
    if high_credibility_founders:
        recommendations.append({
            "category": "Team Strength",
            "priority": "High",
            "action": "Leverage founder academic credentials in marketing and fundraising materials"
        })
    
    # Expert advisor recommendations
    if expert_recommendations:
        recommendations.append({
            "category": "Advisory Board",
            "priority": "Medium",
            "action": f"Consider approaching {expert_recommendations[0]['name']} from {expert_recommendations[0]['institution']} as technical advisor"
        })
    
    # Market-based recommendations
    if market_analysis and market_analysis.get('research_momentum', 0) > 70:
        recommendations.append({
            "category": "Market Timing",
            "priority": "High", 
            "action": "Strong research momentum supports investment timing"
        })
    
    return recommendations

if __name__ == "__main__":
    print("🚀 Starting VERSSAI Complete VC Intelligence Platform...")
    print("Enhanced Features:")
    print("• Complete Academic Dataset (1,157 papers)")
    print("• Advanced Founder Validation")
    print("• Comprehensive Market Research")
    print("• Expert Advisor Network (2,311 researchers)")
    print("• AI-Powered Investment Analysis")
    print("• Risk Assessment & Strategic Recommendations")
    print("\nStarting server on http://localhost:8080")
    
    uvicorn.run(app, host="0.0.0.0", port=8080, reload=True)
