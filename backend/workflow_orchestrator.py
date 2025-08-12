"""
VERSSAI Workflow Orchestrator
Orchestrates AI agents and RAG queries for comprehensive VC analysis
This replaces n8n for Phase 2 until we have n8n fully integrated
"""
import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid
import json
from pathlib import Path
import re

from database import get_db, FounderDeck, DeckExtraction, FounderSignal, WorkflowExecution
from file_storage import file_storage
from rag_service import rag_service, add_company_document
from ai_agents import (
    deck_extraction_agent, 
    founder_signal_agent, 
    investment_thesis_agent,
    extract_deck_information,
    analyze_founder_signals,
    evaluate_investment_opportunity
)
from google_search_service import google_search_service
from twitter_search_service import twitter_search_service
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class VERSSAIWorkflowOrchestrator:
    """
    Orchestrates complex VC analysis workflows using AI agents and RAG
    """
    
    def __init__(self):
        self.active_workflows = {}
        self.workflow_results = {}
    
    async def process_founder_signal_workflow(self, deck_id: str, company_name: str, 
                                            file_path: str) -> Dict[str, Any]:
        """
        Complete Founder Signal Fit workflow:
        1. Extract text from uploaded deck
        2. AI-powered information extraction  
        3. Founder signal analysis with RAG context
        4. Investment thesis evaluation
        5. Store results in database
        
        Args:
            deck_id: UUID of uploaded deck
            company_name: Company name
            file_path: Path to uploaded file
            
        Returns:
            Complete analysis results
        """
        workflow_id = str(uuid.uuid4())
        workflow_results = {
            'workflow_id': workflow_id,
            'deck_id': deck_id,
            'company_name': company_name,
            'status': 'started',
            'stages': {},
            'final_results': None,
            'started_at': datetime.utcnow().isoformat()
        }
        
        try:
            logger.info(f"Starting Founder Signal workflow for {company_name} (deck_id: {deck_id})")
            
            # Stage 1: Document Text Extraction
            workflow_results['stages']['extraction'] = await self._extract_document_text(
                file_path, company_name
            )
            
            # Stage 2: AI Information Extraction
            workflow_results['stages']['ai_extraction'] = await self._ai_extract_information(
                workflow_results['stages']['extraction'], company_name
            )
            
            # Stage 3: Web Research Enhancement
            workflow_results['stages']['web_research'] = await self._enhance_with_web_research(
                workflow_results['stages']['ai_extraction'], deck_id
            )
            
            # Stage 4: Social Media Research Enhancement
            workflow_results['stages']['social_research'] = await self._enhance_with_social_research(
                workflow_results['stages']['ai_extraction'], deck_id
            )
            
            # Stage 5: Founder Enrichment and Analysis (now enhanced with web/social data)
            workflow_results['stages']['founder_analysis'] = await self._analyze_founders(
                workflow_results['stages']['ai_extraction'], 
                workflow_results['stages']['web_research'],
                workflow_results['stages']['social_research'],
                deck_id
            )
            
            # Stage 6: Investment Thesis Evaluation (enhanced with research data)
            workflow_results['stages']['investment_evaluation'] = await self._evaluate_investment(
                workflow_results['stages']['ai_extraction'],
                workflow_results['stages']['founder_analysis'],
                workflow_results['stages']['web_research'],
                workflow_results['stages']['social_research']
            )
            
            # Stage 7: RAG Integration - Add to company knowledge
            workflow_results['stages']['rag_integration'] = await self._integrate_with_rag(
                deck_id, workflow_results['stages']['ai_extraction']
            )
            
            # Stage 8: Database Storage
            workflow_results['stages']['database_storage'] = await self._store_analysis_results(
                deck_id, workflow_results
            )
            
            # Compile final results
            workflow_results['final_results'] = self._compile_final_results(workflow_results)
            workflow_results['status'] = 'completed'
            workflow_results['completed_at'] = datetime.utcnow().isoformat()
            
            logger.info(f"Completed Founder Signal workflow for {company_name}")
            
        except Exception as e:
            logger.error(f"Error in Founder Signal workflow: {e}")
            workflow_results['status'] = 'failed'
            workflow_results['error'] = str(e)
            workflow_results['failed_at'] = datetime.utcnow().isoformat()
        
        self.workflow_results[workflow_id] = workflow_results
        return workflow_results
    
    async def _extract_document_text(self, file_path: str, company_name: str) -> Dict[str, Any]:
        """Stage 1: Extract text from uploaded document"""
        try:
            logger.info(f"Extracting text from {file_path}")
            
            # For now, create mock extraction - in real implementation, we'd use:
            # - PyPDF2/pdfplumber for PDFs
            # - python-pptx for PowerPoint files
            # - OCR for scanned documents
            
            file_extension = Path(file_path).suffix.lower()
            
            if file_extension == '.pdf':
                # Mock PDF text extraction
                extracted_text = f"""
                {company_name} - Pitch Deck
                
                Problem: Large market opportunity in AI/ML space
                Solution: Revolutionary AI platform for enterprises
                Market: $50B+ market growing at 25% CAGR
                Business Model: B2B SaaS with enterprise contracts
                Traction: $500K ARR, 50+ customers, 200% YoY growth
                Team: Experienced founders with Stanford/MIT backgrounds
                Funding: Raising $5M Series A for product development and sales
                
                Founders:
                - Sarah Chen, CEO: Former Google product manager, Stanford CS
                - Michael Torres, CTO: Ex-Facebook engineer, MIT PhD
                """
            else:
                extracted_text = f"Mock text extraction for {company_name} - PowerPoint format detected"
            
            return {
                'status': 'completed',
                'extracted_text': extracted_text,
                'file_type': file_extension,
                'extraction_method': 'mock_extractor',
                'text_length': len(extracted_text),
                'confidence': 0.8
            }
            
        except Exception as e:
            logger.error(f"Error extracting text: {e}")
            return {
                'status': 'failed',
                'error': str(e),
                'extracted_text': '',
                'confidence': 0.0
            }
    
    async def _ai_extract_information(self, extraction_result: Dict[str, Any], 
                                    company_name: str) -> Dict[str, Any]:
        """Stage 2: AI-powered information extraction"""
        try:
            logger.info(f"AI extracting information for {company_name}")
            
            if extraction_result['status'] != 'completed':
                raise Exception("Text extraction failed")
            
            # Use AI agent to extract structured information
            extraction_data = extract_deck_information(
                extraction_result['extracted_text'], 
                company_name
            )
            
            return {
                'status': 'completed',
                'extraction_data': extraction_data,
                'ai_model': 'deck_extraction_agent',
                'confidence': extraction_data.get('confidence_score', 0.5)
            }
            
        except Exception as e:
            logger.error(f"Error in AI extraction: {e}")
            return {
                'status': 'failed',
                'error': str(e),
                'extraction_data': {},
                'confidence': 0.0
            }
    
    async def _enhance_with_web_research(self, ai_extraction: Dict[str, Any], deck_id: str) -> Dict[str, Any]:
        """Stage 3: Enhance analysis with Google Search research"""
        try:
            logger.info(f"Enhancing analysis with web research for deck {deck_id}")
            
            if ai_extraction['status'] != 'completed':
                raise Exception("AI extraction failed")
            
            extraction_data = ai_extraction['extraction_data']
            founders = extraction_data.get('founders', [])
            company_name = extraction_data.get('company_name', 'Unknown')
            
            web_research_results = {
                'company_research': {},
                'founder_research': [],
                'status': 'completed'
            }
            
            # Research company
            company_research = await google_search_service.search_company_intelligence(
                company_name=company_name,
                industry=extraction_data.get('market', None)
            )
            web_research_results['company_research'] = company_research
            
            # Research each founder
            for founder in founders:
                founder_name = founder.get('name', 'Unknown')
                if founder_name != 'Unknown':
                    founder_research = await google_search_service.search_founder_information(
                        founder_name=founder_name,
                        company_name=company_name
                    )
                    web_research_results['founder_research'].append(founder_research)
            
            logger.info(f"Web research completed for {company_name}")
            return web_research_results
            
        except Exception as e:
            logger.error(f"Error in web research enhancement: {e}")
            return {
                'status': 'failed',
                'error': str(e),
                'company_research': {},
                'founder_research': []
            }
    
    async def _enhance_with_social_research(self, ai_extraction: Dict[str, Any], deck_id: str) -> Dict[str, Any]:
        """Stage 4: Enhance analysis with social media research"""
        try:
            logger.info(f"Enhancing analysis with social research for deck {deck_id}")
            
            if ai_extraction['status'] != 'completed':
                raise Exception("AI extraction failed")
            
            extraction_data = ai_extraction['extraction_data']
            founders = extraction_data.get('founders', [])
            company_name = extraction_data.get('company_name', 'Unknown')
            
            social_research_results = {
                'company_social': {},
                'founder_social': [],
                'status': 'completed'
            }
            
            # Research company social presence
            company_social = await twitter_search_service.search_company_social_signals(company_name)
            social_research_results['company_social'] = company_social
            
            # Research each founder's social presence
            for founder in founders:
                founder_name = founder.get('name', 'Unknown')
                if founder_name != 'Unknown':
                    founder_social = await twitter_search_service.search_founder_social_signals(
                        founder_name=founder_name,
                        company_name=company_name
                    )
                    social_research_results['founder_social'].append(founder_social)
            
            logger.info(f"Social research completed for {company_name}")
            return social_research_results
            
        except Exception as e:
            logger.error(f"Error in social research enhancement: {e}")
            return {
                'status': 'failed',
                'error': str(e),
                'company_social': {},
                'founder_social': []
            }

    async def _analyze_founders(self, ai_extraction: Dict[str, Any], 
                              web_research: Dict[str, Any],
                              social_research: Dict[str, Any],
                              deck_id: str) -> Dict[str, Any]:
        """Stage 5: Founder signal analysis enhanced with web and social data"""
        try:
            logger.info(f"Analyzing founders for deck {deck_id}")
            
            if ai_extraction['status'] != 'completed':
                raise Exception("AI extraction failed")
            
            extraction_data = ai_extraction['extraction_data']
            founders = extraction_data.get('founders', [])
            
            if not founders:
                raise Exception("No founders found in extraction data")
            
            founder_analyses = []
            
            for i, founder in enumerate(founders):
                # Get corresponding web and social research data
                web_data = {}
                social_data = {}
                
                if web_research.get('status') == 'completed' and i < len(web_research.get('founder_research', [])):
                    web_data = web_research['founder_research'][i]
                
                if social_research.get('status') == 'completed' and i < len(social_research.get('founder_social', [])):
                    social_data = social_research['founder_social'][i]
                
                # Enhanced company context with research data
                company_context = {
                    'market': extraction_data.get('market', ''),
                    'stage': extraction_data.get('stage', ''),
                    'business_model': extraction_data.get('business_model', ''),
                    'web_research': web_data.get('key_insights', []),
                    'social_signals': social_data.get('social_analysis', {})
                }
                
                # Analyze founder with enhanced context
                founder_analysis = analyze_founder_signals(founder, company_context)
                
                # Enrich analysis with web and social insights
                founder_analysis['web_research_insights'] = web_data.get('key_insights', [])
                founder_analysis['social_media_analysis'] = social_data.get('social_analysis', {})
                founder_analysis['recent_news'] = web_data.get('recent_news', [])
                founder_analysis['social_profiles'] = web_data.get('social_profiles', [])
                
                founder_analyses.append(founder_analysis)
            
            # Calculate overall founder team score
            if founder_analyses:
                overall_scores = [fa.get('scores', {}).get('overall_signal_score', 0) for fa in founder_analyses]
                team_overall_score = sum(overall_scores) / len(overall_scores)
            else:
                team_overall_score = 0
            
            return {
                'status': 'completed',
                'founder_analyses': founder_analyses,
                'team_overall_score': team_overall_score,
                'founder_count': len(founder_analyses)
            }
            
        except Exception as e:
            logger.error(f"Error in founder analysis: {e}")
            return {
                'status': 'failed',
                'error': str(e),
                'founder_analyses': [],
                'team_overall_score': 0
            }
    
    async def _evaluate_investment(self, ai_extraction: Dict[str, Any], 
                                 founder_analysis: Dict[str, Any],
                                 web_research: Dict[str, Any],
                                 social_research: Dict[str, Any]) -> Dict[str, Any]:
        """Stage 6: Investment thesis evaluation enhanced with research data"""
        try:
            logger.info("Evaluating investment opportunity with enhanced research data")
            
            if ai_extraction['status'] != 'completed':
                raise Exception("AI extraction failed")
            
            extraction_data = ai_extraction['extraction_data']
            
            # Enhanced context with web and social research
            enhanced_context = {
                'company_web_research': web_research.get('company_research', {}) if web_research.get('status') == 'completed' else {},
                'company_social_signals': social_research.get('company_social', {}) if social_research.get('status') == 'completed' else {},
                'founder_web_insights': [],
                'founder_social_insights': []
            }
            
            # Collect founder research insights
            if founder_analysis.get('status') == 'completed':
                for founder_data in founder_analysis.get('founder_analyses', []):
                    enhanced_context['founder_web_insights'].extend(founder_data.get('web_research_insights', []))
                    if founder_data.get('social_media_analysis'):
                        enhanced_context['founder_social_insights'].append(founder_data['social_media_analysis'])
            
            # Use investment thesis agent with enhanced data
            investment_evaluation = evaluate_investment_opportunity(
                extraction_data,
                founder_analysis if founder_analysis['status'] == 'completed' else None,
                investor_thesis="Focus on B2B SaaS companies with strong technical founders, proven traction, and positive market signals"
            )
            
            # Enhance evaluation with web/social insights
            investment_evaluation['enhanced_insights'] = {
                'web_research_summary': self._summarize_web_research(web_research),
                'social_signals_summary': self._summarize_social_research(social_research),
                'market_validation': self._assess_market_validation(web_research, social_research)
            }
            
            return {
                'status': 'completed',
                'investment_evaluation': investment_evaluation,
                'recommendation': investment_evaluation.get('recommendation', 'HOLD'),
                'thesis_match_score': investment_evaluation.get('thesis_match_score', 50),
                'enhanced_research_applied': True
            }
            
        except Exception as e:
            logger.error(f"Error in investment evaluation: {e}")
            return {
                'status': 'failed',
                'error': str(e),
                'investment_evaluation': {},
                'recommendation': 'ERROR',
                'enhanced_research_applied': False
            }
    
    def _summarize_web_research(self, web_research: Dict[str, Any]) -> Dict[str, Any]:
        """Summarize web research findings"""
        if web_research.get('status') != 'completed':
            return {"summary": "Web research not completed", "insights": []}
        
        company_research = web_research.get('company_research', {})
        founder_research = web_research.get('founder_research', [])
        
        summary = {
            "company_insights": company_research.get('key_insights', [])[:3],  # Top 3
            "funding_information": len(company_research.get('funding_information', [])),
            "recent_developments": len(company_research.get('recent_developments', [])),
            "founder_insights": []
        }
        
        for founder_data in founder_research:
            if founder_data.get('key_insights'):
                summary['founder_insights'].extend(founder_data['key_insights'][:2])  # Top 2 per founder
        
        return summary
    
    def _summarize_social_research(self, social_research: Dict[str, Any]) -> Dict[str, Any]:
        """Summarize social media research findings"""
        if social_research.get('status') != 'completed':
            return {"summary": "Social research not completed", "signals": {}}
        
        company_social = social_research.get('company_social', {})
        founder_social = social_research.get('founder_social', [])
        
        # Aggregate founder social influence scores
        total_influence = 0
        founder_count = 0
        
        for founder_data in founder_social:
            social_analysis = founder_data.get('social_analysis', {})
            influence_score = social_analysis.get('social_influence_score', 0)
            if influence_score > 0:
                total_influence += influence_score
                founder_count += 1
        
        avg_founder_influence = total_influence / founder_count if founder_count > 0 else 0
        
        return {
            "company_sentiment": company_social.get('sentiment_analysis', {}).get('overall_sentiment', 'neutral'),
            "company_mentions": company_social.get('mentions', {}).get('total_mentions', 0),
            "founder_social_influence": avg_founder_influence,
            "founder_count_analyzed": founder_count
        }
    
    def _assess_market_validation(self, web_research: Dict[str, Any], social_research: Dict[str, Any]) -> Dict[str, Any]:
        """Assess market validation based on web and social signals"""
        validation_score = 5  # Start with neutral
        validation_factors = []
        
        # Web research factors
        if web_research.get('status') == 'completed':
            company_research = web_research.get('company_research', {})
            
            # Funding information
            funding_count = len(company_research.get('funding_information', []))
            if funding_count > 0:
                validation_score += 2
                validation_factors.append(f"Recent funding activity ({funding_count} sources)")
            
            # Recent developments
            development_count = len(company_research.get('recent_developments', []))
            if development_count > 2:
                validation_score += 1
                validation_factors.append(f"Active development ({development_count} recent news items)")
        
        # Social research factors
        if social_research.get('status') == 'completed':
            company_social = social_research.get('company_social', {})
            
            sentiment = company_social.get('sentiment_analysis', {}).get('overall_sentiment', 'neutral')
            if sentiment == 'positive':
                validation_score += 2
                validation_factors.append("Positive social sentiment")
            elif sentiment == 'negative':
                validation_score -= 1
                validation_factors.append("Negative social sentiment detected")
            
            mentions = company_social.get('mentions', {}).get('total_mentions', 0)
            if mentions > 10:
                validation_score += 1
                validation_factors.append(f"Good social visibility ({mentions} mentions)")
        
        # Determine validation level
        if validation_score >= 8:
            validation_level = "strong"
        elif validation_score >= 6:
            validation_level = "moderate"
        else:
            validation_level = "weak"
        
        return {
            "validation_score": validation_score,
            "validation_level": validation_level,
            "key_factors": validation_factors
        }
    
    async def _integrate_with_rag(self, deck_id: str, ai_extraction: Dict[str, Any]) -> Dict[str, Any]:
        """Stage 5: Integrate with RAG knowledge base"""
        try:
            logger.info(f"Integrating deck {deck_id} with RAG")
            
            if ai_extraction['status'] != 'completed':
                raise Exception("AI extraction failed")
            
            extraction_data = ai_extraction['extraction_data']
            
            # Create document content for RAG
            company_name = extraction_data.get('company_name', 'Unknown')
            document_content = f"""
            Company: {company_name}
            Market: {extraction_data.get('market', 'Unknown')}
            Business Model: {extraction_data.get('business_model', 'Unknown')}
            Stage: {extraction_data.get('stage', 'Unknown')}
            Founders: {', '.join([f"{f.get('name', 'Unknown')} ({f.get('role', 'Unknown')})" for f in extraction_data.get('founders', [])])}
            Traction: {json.dumps(extraction_data.get('traction', {}), separators=(',', ':'))}
            Funding Ask: ${extraction_data.get('funding_ask', 0):,}
            """
            
            # Add to company knowledge (Level 3 RAG)
            add_company_document(
                company_id=deck_id,  # Using deck_id as company_id for now
                content=document_content,
                metadata={
                    'document_type': 'pitch_deck',
                    'company_name': company_name,
                    'market': extraction_data.get('market', 'Unknown'),
                    'stage': extraction_data.get('stage', 'Unknown'),
                    'created_at': datetime.utcnow().isoformat()
                },
                document_id=f"deck_{deck_id}"
            )
            
            return {
                'status': 'completed',
                'rag_document_id': f"deck_{deck_id}",
                'content_length': len(document_content)
            }
            
        except Exception as e:
            logger.error(f"Error integrating with RAG: {e}")
            return {
                'status': 'failed',
                'error': str(e)
            }
    
    async def _store_analysis_results(self, deck_id: str, workflow_results: Dict[str, Any]) -> Dict[str, Any]:
        """Stage 6: Store results in database (with file storage fallback)"""
        try:
            logger.info(f"Storing analysis results for deck {deck_id}")
            
            # Try PostgreSQL first, fallback to file storage
            try:
                db_session = next(get_db())
                
                try:
                    # Store deck extraction results
                    ai_extraction = workflow_results['stages']['ai_extraction']
                    if ai_extraction['status'] == 'completed':
                        extraction_data = ai_extraction['extraction_data']
                        
                        deck_extraction = DeckExtraction(
                            deck_id=deck_id,
                            founders=extraction_data.get('founders', []),
                            company_website=extraction_data.get('website', ''),
                            problem_statement="Extracted via AI",
                            solution_description="Extracted via AI",
                            market_size=extraction_data.get('market_size', {}),
                            business_model=extraction_data.get('business_model', ''),
                            traction_metrics=extraction_data.get('traction', {}),
                            team_size=extraction_data.get('team_size', 0),
                            funding_ask=extraction_data.get('funding_ask', 0),
                            funding_stage=extraction_data.get('stage', ''),
                            extraction_confidence=extraction_data.get('confidence_score', 0.5),
                            extraction_method='ai_agent_workflow'
                        )
                        
                        db_session.add(deck_extraction)
                    
                    # Store founder signal results
                    founder_analysis = workflow_results['stages']['founder_analysis']
                    if founder_analysis['status'] == 'completed':
                        for founder_data in founder_analysis.get('founder_analyses', []):
                            founder_signal = FounderSignal(
                                deck_id=deck_id,
                                founder_name=founder_data.get('founder_name', 'Unknown'),
                                founder_role=founder_data.get('founder_role', 'Unknown'),
                                linkedin_data=founder_data.get('linkedin_data', {}),
                                education_score=founder_data.get('scores', {}).get('education_score', 0),
                                experience_score=founder_data.get('scores', {}).get('experience_score', 0),
                                network_quality_score=founder_data.get('scores', {}).get('network_score', 0),
                                technical_fit=founder_data.get('scores', {}).get('technical_score', 0),
                                execution_capability=founder_data.get('scores', {}).get('execution_score', 0),
                                overall_signal_score=founder_data.get('scores', {}).get('overall_signal_score', 0),
                                confidence_level=founder_data.get('confidence_level', 0.5),
                                risk_factors=founder_data.get('risk_factors', []),
                                positive_signals=founder_data.get('key_strengths', []),
                                recommendation=founder_data.get('recommendation', 'NEUTRAL')
                            )
                            
                            db_session.add(founder_signal)
                    
                    # Update deck status
                    deck = db_session.query(FounderDeck).filter(FounderDeck.deck_id == deck_id).first()
                    if deck:
                        deck.status = 'completed'
                    
                    db_session.commit()
                    logger.info(f"Results stored in PostgreSQL for deck {deck_id}")
                    
                    return {
                        'status': 'completed',
                        'storage': 'postgresql',
                        'records_stored': 'extraction + founder_signals',
                        'deck_status': 'completed'
                    }
                    
                finally:
                    db_session.close()
                    
            except Exception as db_error:
                logger.warning(f"PostgreSQL storage failed, using file storage: {db_error}")
                
                # Fallback to file storage
                ai_extraction = workflow_results['stages']['ai_extraction']
                if ai_extraction['status'] == 'completed':
                    file_storage.save_extraction(deck_id, ai_extraction['extraction_data'])
                
                founder_analysis = workflow_results['stages']['founder_analysis']
                if founder_analysis['status'] == 'completed':
                    for founder_data in founder_analysis.get('founder_analyses', []):
                        file_storage.save_founder_signal(deck_id, founder_data)
                
                # Update deck status in file storage
                file_storage.update_deck_status(deck_id, 'completed')
                
                return {
                    'status': 'completed',
                    'storage': 'file_system',
                    'records_stored': 'extraction + founder_signals',
                    'deck_status': 'completed'
                }
                
        except Exception as e:
            logger.error(f"Error storing analysis results: {e}")
            return {
                'status': 'failed',
                'error': str(e)
            }
    
    def _compile_final_results(self, workflow_results: Dict[str, Any]) -> Dict[str, Any]:
        """Compile final results for frontend consumption with enhanced research data"""
        try:
            ai_extraction = workflow_results['stages']['ai_extraction']
            web_research = workflow_results['stages'].get('web_research', {})
            social_research = workflow_results['stages'].get('social_research', {})
            founder_analysis = workflow_results['stages']['founder_analysis']
            investment_evaluation = workflow_results['stages']['investment_evaluation']
            
            if ai_extraction['status'] != 'completed':
                return {'error': 'AI extraction failed', 'status': 'failed'}
            
            extraction_data = ai_extraction['extraction_data']
            
            # Enhanced final results with research data
            final_results = {
                'company': extraction_data.get('company_name', 'Unknown Company'),
                'website': extraction_data.get('website', ''),
                'market': extraction_data.get('market', ''),
                'stage': extraction_data.get('stage', ''),
                'fundingAsk': extraction_data.get('funding_ask', 0),
                'traction': extraction_data.get('traction', {}),
                'teamSize': extraction_data.get('team_size', 0),
                'founders': extraction_data.get('founders', []),
                
                # AI-generated scores
                'overall_score': 0,
                'components': {
                    'technical': {'score': 0, 'confidence': 0.5},
                    'market': {'score': 0, 'confidence': 0.5},
                    'execution': {'score': 0, 'confidence': 0.5},
                    'team': {'score': 0, 'confidence': 0.5}
                },
                'recommendation': 'NEUTRAL',
                'insights': [],
                'risks': [],
                
                # Enhanced with research data
                'research_enhancement': {
                    'web_research_applied': web_research.get('status') == 'completed',
                    'social_research_applied': social_research.get('status') == 'completed',
                    'company_web_insights': web_research.get('company_research', {}).get('key_insights', [])[:3] if web_research.get('status') == 'completed' else [],
                    'founder_web_insights': [],
                    'social_signals': social_research.get('company_social', {}).get('sentiment_analysis', {}) if social_research.get('status') == 'completed' else {},
                    'market_validation': investment_evaluation.get('investment_evaluation', {}).get('enhanced_insights', {}).get('market_validation', {})
                }
            }
            
            # Check if we have real analysis data or fallback
            if founder_analysis['status'] == 'completed':
                logger.info(f"Founder analysis completed - found {len(founder_analysis.get('founder_analyses', []))} founder analyses")
                
                # Debug: Print what data we're getting from founder analysis
                for i, founder_data in enumerate(founder_analysis.get('founder_analyses', [])):
                    logger.info(f"Founder {i} data keys: {list(founder_data.keys())}")
                    if 'executive_summary' in founder_data:
                        logger.info(f"Founder {i} has executive_summary")
                    if 'founder_capability_assessment' in founder_data:
                        logger.info(f"Founder {i} has founder_capability_assessment")
                
                final_results['overall_score'] = founder_analysis.get('team_overall_score', 0)
                
                # Extract insights and risks from founder analyses (now enhanced)
                all_insights = []
                all_risks = []
                founder_web_insights = []
                
                # Professional analysis aggregation for Top Decile VC level
                professional_analysis = {
                    'executive_summary': '',
                    'founder_capability_assessment': {},
                    'technical_capability_assessment': {},
                    'market_position_assessment': {}, 
                    'network_influence_assessment': {},
                    'final_recommendation': {
                        'investment_green_flags': [],
                        'investment_red_flags': [],
                        'critical_questions_for_founders': [],
                        'overall_investment_risk_level': 'Medium',
                        'recommendation': 'HOLD',
                        'confidence_level': 70
                    },
                    'information_gaps': []
                }
                
                for founder_data in founder_analysis.get('founder_analyses', []):
                    all_insights.extend(founder_data.get('key_strengths', []))
                    all_risks.extend(founder_data.get('risk_factors', []))
                    
                    # Add web research insights
                    founder_web_insights.extend(founder_data.get('web_research_insights', []))
                    
                    # Add social media insights
                    social_analysis = founder_data.get('social_media_analysis', {})
                    if social_analysis.get('key_insights'):
                        all_insights.extend(social_analysis['key_insights'])
                    
                    # Aggregate professional analysis from individual founders
                    if 'executive_summary' in founder_data:
                        professional_analysis['executive_summary'] = founder_data.get('executive_summary', '')
                    
                    if 'founder_capability_assessment' in founder_data:
                        professional_analysis['founder_capability_assessment'] = founder_data.get('founder_capability_assessment', {})
                    
                    if 'technical_capability_assessment' in founder_data:
                        professional_analysis['technical_capability_assessment'] = founder_data.get('technical_capability_assessment', {})
                    
                    if 'market_position_assessment' in founder_data:
                        professional_analysis['market_position_assessment'] = founder_data.get('market_position_assessment', {})
                    
                    if 'network_influence_assessment' in founder_data:
                        professional_analysis['network_influence_assessment'] = founder_data.get('network_influence_assessment', {})
                    
                    if 'final_recommendation' in founder_data:
                        final_rec = founder_data.get('final_recommendation', {})
                        professional_analysis['final_recommendation']['investment_green_flags'].extend(final_rec.get('investment_green_flags', []))
                        professional_analysis['final_recommendation']['investment_red_flags'].extend(final_rec.get('investment_red_flags', []))
                        professional_analysis['final_recommendation']['critical_questions_for_founders'].extend(final_rec.get('critical_questions_for_founders', []))
                        
                        if final_rec.get('overall_investment_risk_level'):
                            professional_analysis['final_recommendation']['overall_investment_risk_level'] = final_rec['overall_investment_risk_level']
                        if final_rec.get('recommendation'):
                            professional_analysis['final_recommendation']['recommendation'] = final_rec['recommendation']
                        if final_rec.get('confidence_level'):
                            professional_analysis['final_recommendation']['confidence_level'] = final_rec['confidence_level']
                    
                    if 'information_gaps' in founder_data:
                        professional_analysis['information_gaps'].extend(founder_data.get('information_gaps', []))

                final_results['insights'] = all_insights[:7]  # Top 7 insights (expanded)
                final_results['risks'] = all_risks[:3]  # Top 3 risks
                final_results['research_enhancement']['founder_web_insights'] = founder_web_insights[:5]  # Top 5
                
                # Add the professional analysis to final results
                final_results['professional_analysis'] = professional_analysis
            
            # Add investment evaluation results with enhanced insights
            if investment_evaluation['status'] == 'completed':
                invest_eval = investment_evaluation.get('investment_evaluation', {})
                final_results['recommendation'] = invest_eval.get('recommendation', 'HOLD')
                
                # Update component scores
                market_assess = invest_eval.get('market_assessment', {})
                founder_fit = invest_eval.get('founder_market_fit', {})
                business_assess = invest_eval.get('business_model_assessment', {})
                
                final_results['components'] = {
                    'technical': {
                        'score': founder_fit.get('domain_expertise_score', 50),
                        'confidence': invest_eval.get('confidence_level', 0.5)
                    },
                    'market': {
                        'score': market_assess.get('market_size_score', 50),
                        'confidence': invest_eval.get('confidence_level', 0.5)
                    },
                    'execution': {
                        'score': founder_fit.get('execution_capability_score', 50),
                        'confidence': invest_eval.get('confidence_level', 0.5)
                    },
                    'team': {
                        'score': founder_fit.get('team_quality_score', 50),
                        'confidence': invest_eval.get('confidence_level', 0.5)
                    }
                }
                
                # Add enhanced insights from research
                enhanced_insights = invest_eval.get('enhanced_insights', {})
                if enhanced_insights:
                    final_results['research_enhancement']['enhanced_analysis_applied'] = True
                    web_summary = enhanced_insights.get('web_research_summary', {})
                    social_summary = enhanced_insights.get('social_signals_summary', {})
                    
                    # Add to insights
                    if web_summary.get('company_insights'):
                        final_results['insights'].extend([f"Web Research: {insight}" for insight in web_summary['company_insights'][:2]])
                    
                    if social_summary.get('company_sentiment') and social_summary['company_sentiment'] != 'neutral':
                        final_results['insights'].append(f"Social Signal: {social_summary['company_sentiment'].title()} market sentiment detected")
            
            return final_results
            
        except Exception as e:
            logger.error(f"Error compiling final results: {e}")
            return {'error': str(e), 'status': 'failed'}
    
    def get_workflow_status(self, workflow_id: str) -> Dict[str, Any]:
        """Get workflow execution status"""
        return self.workflow_results.get(workflow_id, {'error': 'Workflow not found'})

# Global orchestrator instance
workflow_orchestrator = VERSSAIWorkflowOrchestrator()

# Convenience function
async def process_founder_signal_deck(deck_id: str, company_name: str, file_path: str) -> Dict[str, Any]:
    """Process a founder signal deck through the complete workflow"""
    return await workflow_orchestrator.process_founder_signal_workflow(deck_id, company_name, file_path)