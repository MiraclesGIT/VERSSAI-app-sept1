"""
VERSSAI Gemini AI Service
Google Gemini integration for AI-powered VC intelligence
"""
import os
import logging
import json
from typing import Dict, List, Any, Optional, AsyncGenerator
import asyncio
from datetime import datetime

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️ Google Generative AI not available - install with: pip install google-generativeai")

logger = logging.getLogger(__name__)

class GeminiAIService:
    """Google Gemini AI service for VERSSAI platform"""
    
    def __init__(self):
        self.api_key = os.environ.get('GEMINI_API_KEY', 'your_gemini_api_key_here')
        self.model_name = os.environ.get('GEMINI_MODEL', 'gemini-1.5-pro')
        self.is_available = GEMINI_AVAILABLE and self.api_key != 'your_gemini_api_key_here'
        
        if self.is_available:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
            logger.info(f"✅ Gemini AI Service initialized with model: {self.model_name}")
        else:
            logger.warning("⚠️ Gemini AI Service not available - check API key configuration")
    
    def get_status(self) -> Dict[str, Any]:
        """Get service status"""
        return {
            'available': self.is_available,
            'model': self.model_name if self.is_available else None,
            'provider': 'Google Gemini',
            'api_key_configured': self.api_key != 'your_gemini_api_key_here'
        }
    
    async def generate_text(self, 
                          prompt: str, 
                          system_prompt: Optional[str] = None,
                          max_tokens: int = 4000,
                          temperature: float = 0.7) -> str:
        """Generate text using Gemini"""
        if not self.is_available:
            raise RuntimeError("Gemini AI service not available")
        
        try:
            # Combine system and user prompts
            full_prompt = prompt
            if system_prompt:
                full_prompt = f"System: {system_prompt}\n\nUser: {prompt}"
            
            # Generate content
            response = await asyncio.to_thread(
                self.model.generate_content,
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=max_tokens,
                    temperature=temperature
                )
            )
            
            return response.text
        
        except Exception as e:
            logger.error(f"Gemini text generation failed: {e}")
            raise

    async def analyze_pitch_deck(self, text_content: str, company_name: str = "Unknown") -> Dict[str, Any]:
        """Analyze pitch deck content using Gemini"""
        system_prompt = """You are a senior VC analyst specializing in startup evaluation. 
        Analyze the following pitch deck content and provide structured insights."""
        
        user_prompt = f"""
        Analyze this pitch deck for company "{company_name}":
        
        {text_content}
        
        Provide analysis in JSON format with these sections:
        1. executive_summary: Brief overview (2-3 sentences)
        2. strengths: List of key strengths
        3. concerns: List of potential concerns or risks
        4. market_opportunity: Market size and opportunity assessment
        5. business_model: Revenue model and scalability assessment
        6. team_assessment: Founding team evaluation
        7. financial_projections: Financial outlook and assumptions
        8. investment_readiness: Overall readiness score (1-100) and reasoning
        9. recommended_actions: Next steps for due diligence
        10. valuation_thoughts: Initial valuation considerations
        """
        
        try:
            response = await self.generate_text(
                user_prompt, 
                system_prompt=system_prompt,
                max_tokens=3000,
                temperature=0.3
            )
            
            # Try to parse JSON response
            try:
                analysis = json.loads(response)
            except json.JSONDecodeError:
                # If not valid JSON, create structured response
                analysis = {
                    "executive_summary": "Analysis completed using Gemini AI",
                    "raw_analysis": response,
                    "strengths": ["Comprehensive analysis provided"],
                    "concerns": ["Requires manual review"],
                    "investment_readiness": 70,
                    "timestamp": datetime.now().isoformat()
                }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Pitch deck analysis failed: {e}")
            return {
                "error": str(e),
                "executive_summary": "Analysis failed",
                "investment_readiness": 0,
                "timestamp": datetime.now().isoformat()
            }

    async def generate_due_diligence_questions(self, 
                                             company_profile: Dict[str, Any],
                                             focus_areas: List[str] = None) -> List[Dict[str, str]]:
        """Generate due diligence questions using Gemini"""
        focus_areas = focus_areas or ["financial", "legal", "technical", "market", "team"]
        
        system_prompt = """You are an expert VC due diligence specialist. 
        Generate comprehensive due diligence questions based on company information."""
        
        user_prompt = f"""
        Company Profile: {json.dumps(company_profile, indent=2)}
        Focus Areas: {', '.join(focus_areas)}
        
        Generate 5-7 specific, actionable due diligence questions for each focus area.
        Return as JSON array with format: [{{"category": "financial", "question": "...", "priority": "high|medium|low", "rationale": "why this question is important"}}]
        """
        
        try:
            response = await self.generate_text(
                user_prompt,
                system_prompt=system_prompt,
                max_tokens=2000,
                temperature=0.4
            )
            
            try:
                questions = json.loads(response)
                if isinstance(questions, list):
                    return questions
            except json.JSONDecodeError:
                pass
                
            # Fallback if JSON parsing fails
            return [
                {
                    "category": "general",
                    "question": "Please provide detailed financial statements for the last 3 years",
                    "priority": "high",
                    "rationale": "Essential for financial analysis"
                }
            ]
            
        except Exception as e:
            logger.error(f"Due diligence question generation failed: {e}")
            return []

    async def generate_market_analysis(self, company_sector: str, company_description: str) -> Dict[str, Any]:
        """Generate market analysis using Gemini"""
        system_prompt = """You are a market research analyst with deep expertise in startup ecosystems. 
        Provide comprehensive market analysis for investment decisions."""
        
        user_prompt = f"""
        Analyze the market opportunity for a company in the {company_sector} sector:
        
        Company Description: {company_description}
        
        Provide analysis in JSON format:
        {{
            "market_size": "TAM/SAM/SOM estimates",
            "growth_rate": "Expected market growth rate",
            "key_trends": ["list of relevant market trends"],
            "competitive_landscape": "Overview of competition", 
            "barriers_to_entry": ["list of entry barriers"],
            "opportunities": ["market opportunities"],
            "threats": ["potential threats"],
            "market_score": "1-100 score",
            "investment_thesis": "Market-based investment rationale"
        }}
        """
        
        try:
            response = await self.generate_text(
                user_prompt,
                system_prompt=system_prompt,
                max_tokens=2500,
                temperature=0.3
            )
            
            try:
                analysis = json.loads(response)
                return analysis
            except json.JSONDecodeError:
                return {
                    "market_size": "Analysis in progress",
                    "raw_analysis": response,
                    "market_score": 70,
                    "timestamp": datetime.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Market analysis failed: {e}")
            return {
                "error": str(e),
                "market_score": 0,
                "timestamp": datetime.now().isoformat()
            }

    async def generate_investment_memo(self, 
                                     analysis_data: Dict[str, Any],
                                     company_name: str) -> str:
        """Generate investment memo using Gemini"""
        system_prompt = """You are a senior VC partner writing an investment committee memo. 
        Write a professional, comprehensive investment recommendation."""
        
        user_prompt = f"""
        Create an investment memo for {company_name} based on this analysis data:
        
        {json.dumps(analysis_data, indent=2)}
        
        Structure the memo with:
        1. Executive Summary
        2. Investment Thesis
        3. Market Opportunity
        4. Business Model & Traction
        5. Team Assessment
        6. Financial Analysis
        7. Risk Assessment
        8. Recommendation & Terms
        
        Write in professional VC memo format, 2-3 pages length.
        """
        
        try:
            memo = await self.generate_text(
                user_prompt,
                system_prompt=system_prompt,
                max_tokens=4000,
                temperature=0.2
            )
            return memo
            
        except Exception as e:
            logger.error(f"Investment memo generation failed: {e}")
            return f"Investment memo generation failed: {str(e)}"

    async def analyze_founder_profile(self, founder_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze founder profile using Gemini"""
        system_prompt = """You are an executive assessment specialist focusing on startup founder evaluation. 
        Analyze founder profiles for investment decisions."""
        
        user_prompt = f"""
        Analyze this founder profile:
        
        {json.dumps(founder_data, indent=2)}
        
        Provide assessment in JSON format:
        {{
            "leadership_score": "1-100 score",
            "experience_relevance": "How relevant is their experience",
            "execution_ability": "Assessment of execution capability", 
            "vision_clarity": "Clarity of vision assessment",
            "team_building": "Team building capabilities",
            "fundraising_readiness": "Readiness for fundraising",
            "strengths": ["key strengths"],
            "development_areas": ["areas for improvement"],
            "overall_assessment": "Summary assessment",
            "founder_market_fit": "1-100 score for founder-market fit"
        }}
        """
        
        try:
            response = await self.generate_text(
                user_prompt,
                system_prompt=system_prompt,
                max_tokens=2000,
                temperature=0.3
            )
            
            try:
                assessment = json.loads(response)
                return assessment
            except json.JSONDecodeError:
                return {
                    "leadership_score": 70,
                    "raw_analysis": response,
                    "overall_assessment": "Analysis completed",
                    "founder_market_fit": 70,
                    "timestamp": datetime.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Founder analysis failed: {e}")
            return {
                "error": str(e),
                "leadership_score": 0,
                "founder_market_fit": 0,
                "timestamp": datetime.now().isoformat()
            }

    async def stream_analysis(self, prompt: str, system_prompt: str = None) -> AsyncGenerator[str, None]:
        """Stream analysis results using Gemini"""
        if not self.is_available:
            yield "Gemini AI service not available"
            return
            
        try:
            # Note: Gemini streaming might need different implementation
            # For now, we'll simulate streaming by chunking the response
            full_response = await self.generate_text(prompt, system_prompt)
            
            # Simulate streaming by yielding chunks
            words = full_response.split()
            chunk_size = 10
            
            for i in range(0, len(words), chunk_size):
                chunk = ' '.join(words[i:i+chunk_size])
                yield chunk + ' '
                await asyncio.sleep(0.1)  # Small delay for streaming effect
                
        except Exception as e:
            yield f"Error in streaming analysis: {str(e)}"

# Global service instance
gemini_service = GeminiAIService()