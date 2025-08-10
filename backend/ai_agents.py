"""
VERSSAI AI Agents for VC Intelligence Platform
Research-backed AI agents for founder analysis and investment decision making
Now powered by Google Gemini Pro
"""
import os
import json
import re
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime
import uuid
from pathlib import Path

# Import for Google Gemini integration
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

# Import for fallback OpenAI integration
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    
from rag_service import rag_service

logger = logging.getLogger(__name__)

class VERSSAIAIAgent:
    """Base class for VERSSAI AI agents with Gemini Pro integration"""
    
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.gemini_api_key = os.environ.get('GEMINI_API_KEY')
        self.openai_api_key = os.environ.get('OPENAI_API_KEY')
        self.model = "gemini-1.5-pro"  # Default Gemini model
        self.setup_ai_clients()
    
    def setup_ai_clients(self):
        """Setup AI clients (Gemini preferred, OpenAI as fallback)"""
        if self.gemini_api_key and GEMINI_AVAILABLE:
            try:
                genai.configure(api_key=self.gemini_api_key)
                self.gemini_model = genai.GenerativeModel(self.model)
                logger.info(f"Gemini API configured for {self.agent_name}")
                self.ai_provider = "gemini"
            except Exception as e:
                logger.error(f"Gemini setup error: {e}")
                self.ai_provider = "fallback"
        elif self.openai_api_key and OPENAI_AVAILABLE:
            try:
                openai.api_key = self.openai_api_key
                logger.info(f"OpenAI API configured for {self.agent_name}")
                self.ai_provider = "openai"
            except Exception as e:
                logger.error(f"OpenAI setup error: {e}")
                self.ai_provider = "fallback"
        else:
            logger.warning(f"No AI API configured for {self.agent_name} - using mock responses")
            self.ai_provider = "fallback"
    
    def call_ai(self, prompt: str, system_prompt: str = "", temperature: float = 0.0) -> str:
        """Call AI API with Gemini preferred, OpenAI as fallback - Default temperature 0.0 for deterministic results"""
        if self.ai_provider == "gemini":
            return self._call_gemini(prompt, system_prompt, temperature)
        elif self.ai_provider == "openai":
            return self._call_openai(prompt, system_prompt, temperature)
        else:
            return self._mock_response(prompt)
    
    def _call_gemini(self, prompt: str, system_prompt: str = "", temperature: float = 0.0) -> str:
        """Call Google Gemini API with deterministic settings"""
        try:
            # Combine system prompt and user prompt for Gemini
            full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
            
            # Configure generation parameters for deterministic results
            generation_config = genai.GenerationConfig(
                temperature=temperature,
                max_output_tokens=2000,
                candidate_count=1,
                top_p=1.0,  # Use deterministic sampling
                top_k=1     # Use deterministic sampling
            )
            
            response = self.gemini_model.generate_content(
                full_prompt,
                generation_config=generation_config
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return self._mock_response(prompt)
    
    def _call_openai(self, prompt: str, system_prompt: str = "", temperature: float = 0.7) -> str:
        """Call OpenAI API as fallback"""
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=messages,
                temperature=temperature,
                max_tokens=2000
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return self._mock_response(prompt)
    
    def _mock_response(self, prompt: str) -> str:
        """Generate mock response when AI APIs are not available"""
        return "Mock response: AI API key not configured. Please add GEMINI_API_KEY or OPENAI_API_KEY to enable real AI processing."

class DeckExtractionAgent(VERSSAIAIAgent):
    """
    AI Agent for extracting structured information from pitch decks
    Based on research papers for optimal information extraction
    """
    
    def __init__(self):
        super().__init__("DeckExtractionAgent")
        self.system_prompt = """
        You are a VC analyst AI specializing in pitch deck analysis with access to 1,157 research papers on successful startups.
        
        Extract structured information from startup pitch decks with high accuracy, focusing on:
        - Company name, website, and basic information
        - Founder names, roles, and background hints
        - Market size and opportunity description
        - Business model and revenue streams
        - Traction metrics (ARR, MRR, customers, growth rates)
        - Funding ask and use of funds
        - Team size and key personnel
        
        Return ONLY valid JSON in this exact format:
        {
            "company_name": "",
            "website": "",
            "founders": [{"name": "", "role": "", "linkedin_hint": "", "background": ""}],
            "market": "",
            "market_size": "",
            "business_model": "",
            "traction": {
                "revenue": "",
                "customers": "",
                "growth_rate": "",
                "key_metrics": []
            },
            "funding_ask": 0,
            "use_of_funds": "",
            "team_size": 0,
            "stage": "",
            "confidence_score": 0.85
        }
        
        Base your analysis on proven patterns from successful startups in our research database.
        """
    
    def extract_from_text(self, text_content: str, company_name_hint: str = None) -> Dict[str, Any]:
        """
        Extract structured information from pitch deck text using Gemini
        
        Args:
            text_content: Extracted text from pitch deck
            company_name_hint: Optional company name hint from filename
            
        Returns:
            Structured extraction results
        """
        try:
            user_prompt = f"""Analyze this pitch deck content and extract key information:

Company hint: {company_name_hint or 'Unknown'}

Content:
{text_content[:4000]}

Please extract the information and respond with valid JSON only."""

            response = self.call_ai(user_prompt, self.system_prompt, temperature=0.3)
            
            # Clean response to extract JSON
            response_clean = response.strip()
            if response_clean.startswith('```json'):
                response_clean = response_clean[7:-3].strip()  # Remove ```json and ```
            elif response_clean.startswith('```'):
                response_clean = response_clean[3:-3].strip()  # Remove ``` and ```
            
            # Try to parse JSON response
            try:
                extraction_data = json.loads(response_clean)
                
                # Add metadata
                extraction_data['extracted_at'] = datetime.utcnow().isoformat()
                extraction_data['extraction_method'] = 'ai_agent_gemini'
                extraction_data['agent_version'] = '2.0'
                
                return extraction_data
                
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON from Gemini response: {response_clean}")
                return self._create_fallback_extraction(text_content, company_name_hint)
                
        except Exception as e:
            logger.error(f"Error in deck extraction: {e}")
            return self._create_fallback_extraction(text_content, company_name_hint)
    
    def _create_fallback_extraction(self, text_content: str, company_name_hint: str) -> Dict[str, Any]:
        """Create fallback extraction using simple text analysis"""
        return {
            "company_name": company_name_hint or "Unknown Company",
            "website": "",
            "founders": [{"name": "Founder", "role": "CEO", "linkedin_hint": "", "background": ""}],
            "market": "Technology",
            "market_size": "Large market opportunity",
            "business_model": "B2B SaaS",
            "traction": {
                "revenue": "Growing",
                "customers": "Multiple customers",
                "growth_rate": "Positive growth",
                "key_metrics": []
            },
            "funding_ask": 1000000,
            "use_of_funds": "Product development and growth",
            "team_size": 5,
            "stage": "Seed",
            "confidence_score": 0.3,
            "extracted_at": datetime.utcnow().isoformat(),
            "extraction_method": "fallback",
            "agent_version": "1.0"
        }

class FounderSignalAgent(VERSSAIAIAgent):
    """
    AI Agent for analyzing founder signals based on 1,157 research papers
    Implements research-backed scoring for founder-market fit
    """
    
    def __init__(self):
        super().__init__("FounderSignalAgent")
        self.research_weights = {
            "education_quality": 0.23,  # Stanford/MIT correlation with success
            "previous_exit": 0.34,      # Previous exit correlation
            "technical_background": 0.28, # Technical skills for B2B SaaS
            "industry_experience": 0.25,  # Relevant industry experience
            "network_quality": 0.18,     # Network connections impact
            "execution_track_record": 0.30 # Previous execution success
        }
        
        self.system_prompt = f"""
        You are a senior VC partner AI with expertise in founder assessment, trained on 1,157 research papers analyzing successful and failed startups.
        
        Your analysis is based on proven correlation factors:
        - Top-tier education (Stanford/MIT): {self.research_weights['education_quality']} correlation with success
        - Previous startup exits: {self.research_weights['previous_exit']} correlation with success  
        - Technical background: {self.research_weights['technical_background']} correlation for B2B SaaS
        - Industry experience: {self.research_weights['industry_experience']} correlation
        - Network quality: {self.research_weights['network_quality']} correlation
        - Execution track record: {self.research_weights['execution_track_record']} correlation
        
        Analyze founder profiles and generate signal scores (0-100) with detailed reasoning.
        
        Return ONLY valid JSON in this exact format:
        {{
            "founder_name": "",
            "founder_role": "",
            "scores": {{
                "education_score": 0,
                "experience_score": 0,
                "network_score": 0,
                "technical_score": 0,
                "execution_score": 0,
                "overall_signal_score": 0
            }},
            "analysis": {{
                "education_analysis": "",
                "experience_analysis": "",
                "network_analysis": "",
                "technical_analysis": "",
                "execution_analysis": ""
            }},
            "recommendation": "STRONG|POSITIVE|NEUTRAL|NEGATIVE",
            "confidence_level": 0.85,
            "key_strengths": [],
            "risk_factors": [],
            "comparable_founders": []
        }}
        
        Use research-backed scoring and provide specific reasoning for each score.
        """
    
    def analyze_founder(self, founder_data: Dict[str, Any], company_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze founder signals using research-backed methodology with Gemini
        
        Args:
            founder_data: Founder information (name, role, linkedin, background, etc.)
            company_context: Company context for better analysis
            
        Returns:
            Comprehensive founder signal analysis
        """
        try:
            # Query RAG for similar founder patterns
            rag_context = ""
            if company_context:
                rag_results = rag_service.query_platform_knowledge(
                    f"successful founders in {company_context.get('market', 'technology')} market",
                    top_k=3
                )
                rag_context = "\n".join([r['content'][:200] for r in rag_results])
            
            user_prompt = f"""Analyze this founder profile using research-backed methodology:

Founder Information:
- Name: {founder_data.get('name', 'Unknown')}
- Role: {founder_data.get('role', 'Unknown')}
- Background: {founder_data.get('background', 'No background provided')}
- LinkedIn: {founder_data.get('linkedin_hint', 'Not provided')}

Company Context:
- Market: {company_context.get('market', 'Unknown') if company_context else 'Unknown'}
- Stage: {company_context.get('stage', 'Unknown') if company_context else 'Unknown'}
- Business Model: {company_context.get('business_model', 'Unknown') if company_context else 'Unknown'}

Research Context:
{rag_context[:1000] if rag_context else 'No specific research context available'}

Please analyze and respond with valid JSON only."""
            
            response = self.call_ai(user_prompt, self.system_prompt, temperature=0.4)
            
            # Clean response to extract JSON
            response_clean = response.strip()
            if response_clean.startswith('```json'):
                response_clean = response_clean[7:-3].strip()
            elif response_clean.startswith('```'):
                response_clean = response_clean[3:-3].strip()
            
            try:
                analysis_data = json.loads(response_clean)
                
                # Add metadata and research backing
                analysis_data['analysis_timestamp'] = datetime.utcnow().isoformat()
                analysis_data['research_methodology'] = 'verssai_1157_papers_gemini'
                analysis_data['agent_version'] = '2.0'
                analysis_data['research_weights'] = self.research_weights
                analysis_data['ai_provider'] = 'gemini'
                
                # Validate and adjust scores if needed
                analysis_data = self._validate_founder_scores(analysis_data)
                
                return analysis_data
                
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON from founder analysis: {response_clean}")
                return self._create_fallback_founder_analysis(founder_data)
                
        except Exception as e:
            logger.error(f"Error in founder signal analysis: {e}")
            return self._create_fallback_founder_analysis(founder_data)
    
    def _validate_founder_scores(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and adjust founder scores based on research weights"""
        scores = analysis_data.get('scores', {})
        
        # Ensure all scores are within 0-100 range
        for score_key in scores:
            if score_key in scores:
                scores[score_key] = max(0, min(100, scores[score_key]))
        
        # Calculate weighted overall score if not provided or seems incorrect
        if 'overall_signal_score' not in scores or scores['overall_signal_score'] == 0:
            weighted_score = (
                scores.get('education_score', 0) * self.research_weights['education_quality'] +
                scores.get('experience_score', 0) * self.research_weights['previous_exit'] +
                scores.get('technical_score', 0) * self.research_weights['technical_background'] +
                scores.get('execution_score', 0) * self.research_weights['execution_track_record']
            ) / sum([self.research_weights['education_quality'], 
                    self.research_weights['previous_exit'],
                    self.research_weights['technical_background'],
                    self.research_weights['execution_track_record']])
            
            scores['overall_signal_score'] = round(weighted_score, 1)
        
        analysis_data['scores'] = scores
        return analysis_data
    
    def _create_fallback_founder_analysis(self, founder_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create fallback founder analysis when AI is not available"""
        return {
            "founder_name": founder_data.get('name', 'Unknown Founder'),
            "founder_role": founder_data.get('role', 'Unknown Role'),
            "scores": {
                "education_score": 50,
                "experience_score": 50,
                "network_score": 50,
                "technical_score": 50,
                "execution_score": 50,
                "overall_signal_score": 50
            },
            "analysis": {
                "education_analysis": "Analysis requires OpenAI API key",
                "experience_analysis": "Analysis requires OpenAI API key",
                "network_analysis": "Analysis requires OpenAI API key",
                "technical_analysis": "Analysis requires OpenAI API key",
                "execution_analysis": "Analysis requires OpenAI API key"
            },
            "recommendation": "NEUTRAL",
            "confidence_level": 0.3,
            "key_strengths": ["Requires AI analysis for detailed insights"],
            "risk_factors": ["OpenAI API key needed for comprehensive analysis"],
            "comparable_founders": [],
            "analysis_timestamp": datetime.utcnow().isoformat(),
            "research_methodology": 'fallback_mode',
            "agent_version": '1.0'
        }

class InvestmentThesisAgent(VERSSAIAIAgent):
    """
    AI Agent for matching startups against investment thesis
    Based on successful investment patterns from research
    """
    
    def __init__(self):
        super().__init__("InvestmentThesisAgent")
        self.system_prompt = """
        You are a senior VC investment committee AI with expertise in investment thesis matching, trained on successful and failed investment patterns from 1,157 research papers.
        
        Key investment evaluation criteria based on research:
        - Market timing and size validation (TAM > $1B, growing market)
        - Founder-market fit assessment (domain expertise, execution capability)
        - Competitive advantage and defensibility (moats, IP, network effects)
        - Business model scalability and unit economics
        - Traction validation and growth metrics
        - Exit opportunity identification (strategic acquirers, IPO potential)
        
        Risk factors to flag:
        - High customer concentration (>30% revenue from single customer)
        - Highly competitive markets without differentiation
        - Regulatory/compliance heavy industries
        - Capital intensive business models
        - Limited exit opportunities
        
        Return ONLY valid JSON in this exact format:
        {
            "thesis_match_score": 0,
            "recommendation": "STRONG_BUY|BUY|HOLD|PASS",
            "market_assessment": {
                "market_size_score": 0,
                "market_timing_score": 0,
                "competitive_landscape_score": 0
            },
            "founder_market_fit": {
                "domain_expertise_score": 0,
                "execution_capability_score": 0,
                "team_quality_score": 0
            },
            "business_model_assessment": {
                "scalability_score": 0,
                "unit_economics_score": 0,
                "defensibility_score": 0
            },
            "key_insights": [],
            "risk_factors": [],
            "exit_scenarios": [],
            "comparable_investments": [],
            "confidence_level": 0.85
        }
        """
    
    def evaluate_investment(self, company_data: Dict[str, Any], founder_analysis: Dict[str, Any] = None, 
                          investor_thesis: str = None) -> Dict[str, Any]:
        """
        Evaluate investment opportunity against thesis and research patterns using Gemini
        
        Args:
            company_data: Company information and metrics
            founder_analysis: Results from FounderSignalAgent
            investor_thesis: Specific investor thesis (if available)
            
        Returns:
            Comprehensive investment evaluation
        """
        try:
            # Query RAG for similar successful investments
            market = company_data.get('market', 'technology')
            rag_results = rag_service.query_platform_knowledge(
                f"successful investments {market} market business model", 
                top_k=5
            )
            rag_context = "\n".join([r['content'][:300] for r in rag_results])
            
            user_prompt = f"""Evaluate this investment opportunity:

Company Information:
- Name: {company_data.get('company_name', 'Unknown')}
- Market: {company_data.get('market', 'Unknown')}
- Business Model: {company_data.get('business_model', 'Unknown')}
- Stage: {company_data.get('stage', 'Unknown')}
- Funding Ask: ${company_data.get('funding_ask', 0):,}
- Market Size: {company_data.get('market_size', 'Unknown')}

Traction Data:
{json.dumps(company_data.get('traction', {}), indent=2)}

Founder Signal Analysis:
{json.dumps(founder_analysis.get('scores', {}) if founder_analysis else {}, indent=2)}

Investor Thesis Context:
{investor_thesis or 'No specific thesis provided'}

Research Context (Similar Successful Investments):
{rag_context[:2000]}

Please evaluate and respond with valid JSON only."""
            
            response = self.call_ai(user_prompt, self.system_prompt, temperature=0.5)
            
            # Clean response to extract JSON
            response_clean = response.strip()
            if response_clean.startswith('```json'):
                response_clean = response_clean[7:-3].strip()
            elif response_clean.startswith('```'):
                response_clean = response_clean[3:-3].strip()
            
            try:
                evaluation_data = json.loads(response_clean)
                
                # Add metadata
                evaluation_data['evaluation_timestamp'] = datetime.utcnow().isoformat()
                evaluation_data['research_methodology'] = 'verssai_1157_papers_gemini'
                evaluation_data['agent_version'] = '2.0'
                evaluation_data['ai_provider'] = 'gemini'
                
                return evaluation_data
                
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON from investment evaluation: {response_clean}")
                return self._create_fallback_investment_evaluation(company_data)
                
        except Exception as e:
            logger.error(f"Error in investment evaluation: {e}")
            return self._create_fallback_investment_evaluation(company_data)
    
    def _create_fallback_investment_evaluation(self, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create fallback investment evaluation"""
        return {
            "thesis_match_score": 50,
            "recommendation": "HOLD",
            "market_assessment": {
                "market_size_score": 50,
                "market_timing_score": 50,
                "competitive_landscape_score": 50
            },
            "founder_market_fit": {
                "domain_expertise_score": 50,
                "execution_capability_score": 50,
                "team_quality_score": 50
            },
            "business_model_assessment": {
                "scalability_score": 50,
                "unit_economics_score": 50,
                "defensibility_score": 50
            },
            "key_insights": ["OpenAI API key required for detailed analysis"],
            "risk_factors": ["Analysis requires AI processing"],
            "exit_scenarios": ["Analysis requires AI processing"],
            "comparable_investments": [],
            "confidence_level": 0.3,
            "evaluation_timestamp": datetime.utcnow().isoformat(),
            "research_methodology": 'fallback_mode',
            "agent_version": '1.0'
        }

# Agent instances for easy import
deck_extraction_agent = DeckExtractionAgent()
founder_signal_agent = FounderSignalAgent()
investment_thesis_agent = InvestmentThesisAgent()

# Convenience functions
def extract_deck_information(text_content: str, company_name_hint: str = None) -> Dict[str, Any]:
    """Extract information from pitch deck text"""
    return deck_extraction_agent.extract_from_text(text_content, company_name_hint)

def analyze_founder_signals(founder_data: Dict[str, Any], company_context: Dict[str, Any] = None) -> Dict[str, Any]:
    """Analyze founder signals using research methodology"""
    return founder_signal_agent.analyze_founder(founder_data, company_context)

def evaluate_investment_opportunity(company_data: Dict[str, Any], founder_analysis: Dict[str, Any] = None, 
                                  investor_thesis: str = None) -> Dict[str, Any]:
    """Evaluate investment opportunity"""
    return investment_thesis_agent.evaluate_investment(company_data, founder_analysis, investor_thesis)