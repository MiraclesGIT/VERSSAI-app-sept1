"""
VERSSAI Due Diligence Data Room AI Agent
Framework #2: Comprehensive document analysis for investor due diligence
"""
import os
import json
import hashlib
import asyncio
from typing import Dict, List, Any, Optional, Tuple
import logging
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass
import uuid

from ai_agents import VERSSAIAIAgent
from rag_service import rag_service, add_company_document
from google_search_service import google_search_service
from twitter_search_service import twitter_search_service

logger = logging.getLogger(__name__)

@dataclass
class DocumentAnalysis:
    document_id: str
    filename: str
    document_type: str
    category: str
    key_insights: List[str]
    risk_factors: List[str]
    completeness_score: float
    credibility_score: float
    red_flags: List[str]
    summary: str
    extracted_data: Dict[str, Any]

@dataclass
class DueDiligenceReport:
    company_id: str
    company_name: str
    analysis_timestamp: str
    document_analyses: List[DocumentAnalysis]
    cross_document_insights: List[str]
    overall_risk_assessment: Dict[str, Any]
    completeness_assessment: Dict[str, Any]
    red_flags: List[str]
    recommendations: List[str]
    checklist_status: Dict[str, Any]
    overall_score: float

class DocumentProcessor:
    """Handles document processing and text extraction for various file formats"""
    
    SUPPORTED_FORMATS = {
        '.pdf': 'PDF Document',
        '.docx': 'Word Document', 
        '.doc': 'Word Document',
        '.xlsx': 'Excel Spreadsheet',
        '.xls': 'Excel Spreadsheet',
        '.pptx': 'PowerPoint Presentation',
        '.ppt': 'PowerPoint Presentation',
        '.txt': 'Text Document',
        '.csv': 'CSV File',
        '.json': 'JSON Data'
    }
    
    def __init__(self):
        self.processing_cache = {}
    
    async def extract_text_from_document(self, file_path: str, document_id: str) -> Dict[str, Any]:
        """Extract text content from various document formats"""
        try:
            # Check cache first
            cache_key = hashlib.md5(f"{file_path}_{document_id}".encode()).hexdigest()
            if cache_key in self.processing_cache:
                return self.processing_cache[cache_key]
            
            file_extension = Path(file_path).suffix.lower()
            file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
            
            extraction_result = {
                'document_id': document_id,
                'file_path': file_path,
                'file_extension': file_extension,
                'file_size': file_size,
                'extraction_status': 'success',
                'extracted_text': '',
                'metadata': {},
                'error': None
            }
            
            if file_extension not in self.SUPPORTED_FORMATS:
                extraction_result['extraction_status'] = 'unsupported_format'
                extraction_result['error'] = f"Unsupported file format: {file_extension}"
                return extraction_result
            
            # For demo purposes, create realistic mock extractions based on document types
            if file_extension == '.pdf':
                extraction_result['extracted_text'] = self._mock_pdf_extraction(file_path)
            elif file_extension in ['.docx', '.doc']:
                extraction_result['extracted_text'] = self._mock_word_extraction(file_path)
            elif file_extension in ['.xlsx', '.xls']:
                extraction_result['extracted_text'] = self._mock_excel_extraction(file_path)
            elif file_extension in ['.pptx', '.ppt']:
                extraction_result['extracted_text'] = self._mock_powerpoint_extraction(file_path)
            else:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    extraction_result['extracted_text'] = f.read()
            
            extraction_result['metadata'] = {
                'document_type': self.SUPPORTED_FORMATS[file_extension],
                'extraction_method': 'mock_extractor_v2',
                'text_length': len(extraction_result['extracted_text']),
                'processing_timestamp': datetime.utcnow().isoformat()
            }
            
            # Cache the result
            self.processing_cache[cache_key] = extraction_result
            
            logger.info(f"Successfully extracted text from {file_path} ({file_extension})")
            return extraction_result
            
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {e}")
            return {
                'document_id': document_id,
                'file_path': file_path,
                'extraction_status': 'failed',
                'extracted_text': '',
                'error': str(e),
                'metadata': {}
            }
    
    def _mock_pdf_extraction(self, file_path: str) -> str:
        """Mock PDF text extraction"""
        filename = Path(file_path).stem
        return f"""
        FINANCIAL STATEMENTS - {filename}
        
        Revenue Analysis:
        - Q4 2024: $2.5M ARR (Annual Recurring Revenue)
        - Q3 2024: $2.1M ARR 
        - Growth Rate: 19% QoQ
        - Customer Count: 150 enterprise customers
        - Average Contract Value: $16,667
        
        Cash Flow Statement:
        - Operating Cash Flow: $450K positive
        - Burn Rate: $180K/month
        - Runway: 18 months current cash
        - Last Funding Round: Series A $5M (Jan 2024)
        
        Key Metrics:
        - Customer Churn: 3.2% monthly
        - Net Revenue Retention: 112%
        - Gross Margin: 78%
        - Customer Acquisition Cost: $2,100
        - Lifetime Value: $65,000 (LTV:CAC = 31:1)
        
        Risk Factors:
        - High dependency on top 10 customers (65% of revenue)
        - Competitive market with new entrants
        - Regulatory compliance costs increasing
        """
    
    def _mock_word_extraction(self, file_path: str) -> str:
        """Mock Word document extraction"""
        filename = Path(file_path).stem
        if 'legal' in filename.lower() or 'contract' in filename.lower():
            return f"""
            LEGAL AGREEMENT - {filename}
            
            Key Terms:
            - Contract Duration: 24 months
            - Payment Terms: Net 30 days
            - Termination Clause: 90-day notice required
            - Intellectual Property: Company retains all IP rights
            - Liability Cap: $500,000 maximum
            - Force Majeure: Standard provisions included
            
            Compliance Requirements:
            - GDPR compliance mandatory
            - SOC 2 Type II certification required
            - Data residency in EU/US only
            - Regular security audits required
            
            Risk Considerations:
            - Penalty clauses for SLA breaches (5% monthly fee reduction)
            - Customer has right to audit on 30-day notice
            - Exclusive vendor requirement in certain territories
            """
        else:
            return f"""
            BUSINESS PLAN - {filename}
            
            Market Analysis:
            - Total Addressable Market: $12B
            - Serviceable Addressable Market: $2.8B
            - Market Growth Rate: 24% CAGR
            - Key Competitors: 5 major players
            
            Go-to-Market Strategy:
            - Direct sales for enterprise (>$100K ACV)
            - Partner channel for mid-market
            - Self-serve for SMB segment
            - Target: 3 new enterprise deals/month
            
            Product Roadmap:
            - Q1: AI automation features
            - Q2: Mobile app launch
            - Q3: API marketplace
            - Q4: International expansion
            """
    
    def _mock_excel_extraction(self, file_path: str) -> str:
        """Mock Excel spreadsheet extraction"""
        filename = Path(file_path).stem
        return f"""
        FINANCIAL MODEL - {filename}
        
        Revenue Projections (Monthly):
        Jan 2024: $210K | Feb 2024: $230K | Mar 2024: $248K
        Apr 2024: $267K | May 2024: $289K | Jun 2024: $312K
        Jul 2024: $338K | Aug 2024: $365K | Sep 2024: $394K
        Oct 2024: $426K | Nov 2024: $460K | Dec 2024: $497K
        
        Customer Metrics:
        - Monthly New Customers: 12-15 
        - Average Contract Value: $18,500
        - Customer Lifetime: 36 months average
        - Expansion Revenue: 25% of existing customers annually
        
        Cost Structure:
        - Sales & Marketing: 45% of revenue
        - Product Development: 25% of revenue  
        - General & Administrative: 15% of revenue
        - Customer Success: 10% of revenue
        - Other Operating Expenses: 5% of revenue
        
        Key Assumptions:
        - 15% monthly revenue growth rate
        - 4% monthly customer churn rate
        - 35% gross margin improvement over 24 months
        """
    
    def _mock_powerpoint_extraction(self, file_path: str) -> str:
        """Mock PowerPoint presentation extraction"""
        filename = Path(file_path).stem
        return f"""
        INVESTOR PRESENTATION - {filename}
        
        Company Overview:
        - Founded: 2022
        - Team Size: 45 employees
        - Offices: San Francisco, Austin, Remote
        - Mission: Transforming enterprise workflow automation
        
        Problem & Solution:
        - Problem: Manual processes cost enterprises $2.1M annually
        - Solution: AI-powered workflow automation platform
        - Market Validation: 89% of prospects confirm pain point
        
        Traction:
        - $2.5M ARR (250% YoY growth)
        - 150 enterprise customers
        - 98% customer satisfaction score
        - 15 Fortune 500 logos
        
        Competition:
        - Direct competitors: 3 established players
        - Competitive advantages: 40% faster implementation, 25% lower cost
        - Patents: 3 filed, 1 approved
        
        Funding Ask:
        - Raising: $10M Series B
        - Use of funds: 60% Sales/Marketing, 30% Product, 10% Operations
        - Runway: 36 months
        - Valuation: $80M pre-money
        """

class DueDiligenceAgent(VERSSAIAIAgent):
    """
    AI Agent for comprehensive due diligence analysis across multiple documents
    Framework #2 of the VERSSAI VC Intelligence Platform
    """
    
    def __init__(self):
        super().__init__("DueDiligenceAgent")
        self.document_processor = DocumentProcessor()
        self.dd_categories = {
            'financial': ['revenue', 'cashflow', 'balance sheet', 'financial statements', 'budget', 'forecast'],
            'legal': ['contract', 'agreement', 'terms', 'compliance', 'intellectual property', 'legal'],
            'market': ['market analysis', 'competitive landscape', 'customer research', 'market size'],
            'technical': ['product specification', 'architecture', 'security', 'scalability', 'technical'],
            'team': ['organizational chart', 'team', 'employees', 'advisory board', 'management'],
            'operations': ['process', 'workflow', 'operations', 'logistics', 'supply chain'],
            'strategic': ['business plan', 'strategy', 'roadmap', 'vision', 'partnership']
        }
        
        self.system_prompt = """
        You are an expert VC due diligence analyst AI with access to comprehensive research on investment risks and success patterns.
        
        Analyze documents for due diligence with focus on:
        - Financial health and sustainability (cash flow, revenue quality, burn rate)
        - Legal risks and compliance issues
        - Market opportunity validation
        - Technical feasibility and scalability
        - Team capability and execution track record
        - Operational efficiency and processes
        - Strategic positioning and competitive advantages
        
        Risk factors to identify:
        - Revenue concentration risks (>30% from single customer)
        - Legal liabilities or pending litigation
        - Regulatory compliance gaps
        - Technical debt or security vulnerabilities
        - Key person dependencies
        - Market timing or competitive risks
        
        Return ONLY valid JSON in this exact format:
        {
            "document_category": "",
            "key_insights": [],
            "risk_factors": [],
            "red_flags": [],
            "completeness_score": 0,
            "credibility_score": 0,
            "extracted_data": {},
            "summary": "",
            "recommendations": []
        }
        
        Provide specific, actionable insights based on the document content.
        """
    
    async def analyze_document(self, file_path: str, document_id: str, 
                             company_context: Dict[str, Any] = None) -> DocumentAnalysis:
        """
        Analyze a single document for due diligence insights
        
        Args:
            file_path: Path to the document file
            document_id: Unique identifier for the document
            company_context: Optional company context for better analysis
            
        Returns:
            DocumentAnalysis with comprehensive insights
        """
        try:
            # Extract text from document
            extraction_result = await self.document_processor.extract_text_from_document(
                file_path, document_id
            )
            
            if extraction_result['extraction_status'] != 'success':
                return self._create_failed_analysis(document_id, Path(file_path).name, 
                                                  extraction_result.get('error', 'Unknown error'))
            
            # Categorize document
            document_category = self._categorize_document(
                Path(file_path).name, 
                extraction_result['extracted_text']
            )
            
            # Create cache key for deterministic results
            cache_key = hashlib.md5(
                f"dd_analysis_{extraction_result['extracted_text']}_{document_category}_{json.dumps(company_context or {}, sort_keys=True)}".encode()
            ).hexdigest()
            
            # AI analysis
            analysis_prompt = f"""Analyze this {document_category} document for due diligence:

Document: {Path(file_path).name}
Category: {document_category}
Content Length: {len(extraction_result['extracted_text'])} characters

Document Content:
{extraction_result['extracted_text'][:3000]}

Company Context:
{json.dumps(company_context or {}, indent=2)}

Please analyze and respond with valid JSON only."""
            
            response = self.call_ai(analysis_prompt, self.system_prompt, temperature=0.0)
            
            # Parse AI response
            analysis_data = self._parse_analysis_response(response)
            
            # Create DocumentAnalysis object
            document_analysis = DocumentAnalysis(
                document_id=document_id,
                filename=Path(file_path).name,
                document_type=extraction_result['metadata'].get('document_type', 'Unknown'),
                category=document_category,
                key_insights=analysis_data.get('key_insights', []),
                risk_factors=analysis_data.get('risk_factors', []),
                completeness_score=analysis_data.get('completeness_score', 50.0),
                credibility_score=analysis_data.get('credibility_score', 50.0),
                red_flags=analysis_data.get('red_flags', []),
                summary=analysis_data.get('summary', 'Analysis summary not available'),
                extracted_data=analysis_data.get('extracted_data', {})
            )
            
            # Add to company RAG knowledge
            if company_context and company_context.get('company_id'):
                await self._add_document_to_rag(
                    company_context['company_id'],
                    extraction_result['extracted_text'],
                    document_analysis,
                    document_id
                )
            
            logger.info(f"Successfully analyzed document {Path(file_path).name}")
            return document_analysis
            
        except Exception as e:
            logger.error(f"Error analyzing document {file_path}: {e}")
            return self._create_failed_analysis(document_id, Path(file_path).name, str(e))
    
    def _categorize_document(self, filename: str, content: str) -> str:
        """Categorize document based on filename and content"""
        filename_lower = filename.lower()
        content_lower = content.lower()[:1000]  # First 1000 chars for categorization
        
        # Check filename patterns first
        for category, keywords in self.dd_categories.items():
            for keyword in keywords:
                if keyword in filename_lower:
                    return category
        
        # Check content patterns
        category_scores = {}
        for category, keywords in self.dd_categories.items():
            score = sum(content_lower.count(keyword) for keyword in keywords)
            category_scores[category] = score
        
        # Return category with highest score, default to 'strategic'
        best_category = max(category_scores.items(), key=lambda x: x[1])
        return best_category[0] if best_category[1] > 0 else 'strategic'
    
    def _parse_analysis_response(self, response: str) -> Dict[str, Any]:
        """Parse AI analysis response into structured data"""
        try:
            # Clean response
            response_clean = response.strip()
            if response_clean.startswith('```json'):
                response_clean = response_clean[7:-3].strip()
            elif response_clean.startswith('```'):
                response_clean = response_clean[3:-3].strip()
            
            return json.loads(response_clean)
            
        except json.JSONDecodeError:
            logger.error(f"Failed to parse AI analysis response: {response}")
            return {
                'key_insights': ['AI analysis parsing failed'],
                'risk_factors': ['Unable to analyze document properly'],
                'red_flags': [],
                'completeness_score': 30.0,
                'credibility_score': 30.0,
                'extracted_data': {},
                'summary': 'Document analysis failed due to AI response parsing error'
            }
    
    async def _add_document_to_rag(self, company_id: str, content: str, 
                                 analysis: DocumentAnalysis, document_id: str):
        """Add analyzed document to company RAG knowledge"""
        try:
            # Create comprehensive document content for RAG
            rag_content = f"""
            Document: {analysis.filename}
            Type: {analysis.document_type}
            Category: {analysis.category}
            
            Summary: {analysis.summary}
            
            Key Insights:
            {chr(10).join(f"- {insight}" for insight in analysis.key_insights)}
            
            Risk Factors:
            {chr(10).join(f"- {risk}" for risk in analysis.risk_factors)}
            
            Content Sample:
            {content[:1500]}
            """
            
            # Add to company RAG
            add_company_document(
                company_id=company_id,
                content=rag_content,
                metadata={
                    'document_type': analysis.document_type,
                    'category': analysis.category,
                    'filename': analysis.filename,
                    'completeness_score': analysis.completeness_score,
                    'credibility_score': analysis.credibility_score,
                    'analysis_timestamp': datetime.utcnow().isoformat(),
                    'document_source': 'due_diligence_data_room'
                },
                document_id=f"dd_{document_id}"
            )
            
            logger.info(f"Added {analysis.filename} to company RAG knowledge")
            
        except Exception as e:
            logger.error(f"Error adding document to RAG: {e}")
    
    def _create_failed_analysis(self, document_id: str, filename: str, error: str) -> DocumentAnalysis:
        """Create a failed document analysis"""
        return DocumentAnalysis(
            document_id=document_id,
            filename=filename,
            document_type='Unknown',
            category='unknown',
            key_insights=[],
            risk_factors=[f"Document processing failed: {error}"],
            completeness_score=0.0,
            credibility_score=0.0,
            red_flags=['Document analysis failed'],
            summary=f"Failed to analyze document: {error}",
            extracted_data={}
        )

class DueDiligenceOrchestrator:
    """
    Orchestrates comprehensive due diligence analysis across multiple documents
    """
    
    def __init__(self):
        self.dd_agent = DueDiligenceAgent()
        self.dd_checklist = {
            'financial_documents': ['Financial statements', 'Cash flow', 'Revenue analysis', 'Budget/Forecast'],
            'legal_documents': ['Corporate structure', 'Key contracts', 'IP portfolio', 'Compliance status'],
            'market_analysis': ['Market research', 'Competitive analysis', 'Customer validation'],
            'technical_assets': ['Product specs', 'Technical architecture', 'Security assessment'],
            'team_information': ['Management bios', 'Organizational chart', 'Key employee contracts'],
            'operational_details': ['Business processes', 'Operational metrics', 'Vendor relationships']
        }
    
    async def process_data_room(self, company_id: str, company_name: str, 
                              file_paths: List[str], 
                              company_context: Dict[str, Any] = None) -> DueDiligenceReport:
        """
        Process complete due diligence data room
        
        Args:
            company_id: Unique company identifier
            company_name: Company name
            file_paths: List of document file paths
            company_context: Additional company context
            
        Returns:
            Comprehensive due diligence report
        """
        try:
            logger.info(f"Starting due diligence analysis for {company_name} ({len(file_paths)} documents)")
            
            # Enhance company context with web research
            if company_context:
                enhanced_context = await self._enhance_company_context(company_name, company_context)
            else:
                enhanced_context = {'company_name': company_name}
                enhanced_context = await self._enhance_company_context(company_name, enhanced_context)
            
            # Process each document
            document_analyses = []
            analysis_tasks = []
            
            for i, file_path in enumerate(file_paths):
                document_id = f"{company_id}_dd_doc_{i+1}"
                task = self.dd_agent.analyze_document(file_path, document_id, enhanced_context)
                analysis_tasks.append(task)
            
            # Execute document analyses concurrently
            document_analyses = await asyncio.gather(*analysis_tasks, return_exceptions=True)
            
            # Filter successful analyses
            successful_analyses = [
                analysis for analysis in document_analyses 
                if isinstance(analysis, DocumentAnalysis)
            ]
            
            # Generate cross-document insights
            cross_document_insights = await self._generate_cross_document_insights(
                successful_analyses, enhanced_context
            )
            
            # Assess overall risk and completeness
            risk_assessment = self._assess_overall_risk(successful_analyses)
            completeness_assessment = self._assess_completeness(successful_analyses)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                successful_analyses, risk_assessment, completeness_assessment
            )
            
            # Calculate overall score
            overall_score = self._calculate_overall_score(
                successful_analyses, risk_assessment, completeness_assessment
            )
            
            # Create comprehensive report
            dd_report = DueDiligenceReport(
                company_id=company_id,
                company_name=company_name,
                analysis_timestamp=datetime.utcnow().isoformat(),
                document_analyses=successful_analyses,
                cross_document_insights=cross_document_insights,
                overall_risk_assessment=risk_assessment,
                completeness_assessment=completeness_assessment,
                red_flags=self._aggregate_red_flags(successful_analyses),
                recommendations=recommendations,
                checklist_status=completeness_assessment,
                overall_score=overall_score
            )
            
            logger.info(f"Completed due diligence analysis for {company_name} - Overall Score: {overall_score}")
            return dd_report
            
        except Exception as e:
            logger.error(f"Error in due diligence processing: {e}")
            # Return failed report
            return DueDiligenceReport(
                company_id=company_id,
                company_name=company_name,
                analysis_timestamp=datetime.utcnow().isoformat(),
                document_analyses=[],
                cross_document_insights=[f"Due diligence processing failed: {str(e)}"],
                overall_risk_assessment={'overall_risk': 'high', 'error': str(e)},
                completeness_assessment={'completeness_score': 0, 'error': str(e)},
                red_flags=[f"Processing error: {str(e)}"],
                recommendations=['Manual review required due to processing failure'],
                checklist_status={},
                overall_score=0.0
            )
    
    async def _enhance_company_context(self, company_name: str, 
                                     base_context: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance company context with web and social research"""
        try:
            # Get company research from Google Search and Twitter
            web_research_task = google_search_service.search_company_intelligence(company_name)
            social_research_task = twitter_search_service.search_company_social_signals(company_name)
            
            web_research, social_research = await asyncio.gather(
                web_research_task, social_research_task, return_exceptions=True
            )
            
            enhanced_context = base_context.copy()
            enhanced_context.update({
                'web_research_summary': web_research.get('key_insights', [])[:3] if not isinstance(web_research, Exception) else [],
                'social_sentiment': social_research.get('sentiment_analysis', {}).get('overall_sentiment', 'neutral') if not isinstance(social_research, Exception) else 'neutral',
                'market_presence': 'researched' if not isinstance(web_research, Exception) else 'limited'
            })
            
            return enhanced_context
            
        except Exception as e:
            logger.warning(f"Could not enhance company context: {e}")
            return base_context
    
    async def _generate_cross_document_insights(self, analyses: List[DocumentAnalysis], 
                                              context: Dict[str, Any]) -> List[str]:
        """Generate insights that span across multiple documents"""
        try:
            # Prepare cross-document analysis prompt
            document_summaries = []
            for analysis in analyses:
                doc_summary = f"Document: {analysis.filename} ({analysis.category})\n"
                doc_summary += f"Key Insights: {', '.join(analysis.key_insights[:3])}\n"
                doc_summary += f"Risk Factors: {', '.join(analysis.risk_factors[:2])}"
                document_summaries.append(doc_summary)
            
            cross_analysis_prompt = f"""Analyze these due diligence documents for cross-document insights:

Company: {context.get('company_name', 'Unknown')}

Documents Analyzed:
{chr(10).join(document_summaries)}

Identify:
1. Consistency patterns across documents
2. Conflicting information or red flags
3. Missing critical information
4. Overall investment thesis validation
5. Key risks that appear across multiple documents

Return insights as a JSON array of strings."""
            
            system_prompt = """You are a senior VC due diligence analyst. Analyze multiple documents to identify patterns, inconsistencies, and comprehensive insights that individual document analysis might miss."""
            
            response = self.dd_agent.call_ai(cross_analysis_prompt, system_prompt, temperature=0.0)
            
            # Parse response
            try:
                insights = json.loads(response.strip())
                return insights if isinstance(insights, list) else [str(insights)]
            except json.JSONDecodeError:
                return [f"Cross-document analysis: {response[:200]}..."]
                
        except Exception as e:
            logger.error(f"Error generating cross-document insights: {e}")
            return ["Cross-document analysis could not be completed"]
    
    def _assess_overall_risk(self, analyses: List[DocumentAnalysis]) -> Dict[str, Any]:
        """Assess overall investment risk based on all documents"""
        if not analyses:
            return {'overall_risk': 'unknown', 'risk_score': 50}
        
        # Count red flags and risk factors
        total_red_flags = sum(len(analysis.red_flags) for analysis in analyses)
        total_risk_factors = sum(len(analysis.risk_factors) for analysis in analyses)
        avg_credibility = sum(analysis.credibility_score for analysis in analyses) / len(analyses)
        
        # Calculate risk score (0-100, lower is better)
        risk_score = min(100, (total_red_flags * 15) + (total_risk_factors * 5) + (100 - avg_credibility))
        
        # Determine risk level
        if risk_score > 75:
            risk_level = 'high'
        elif risk_score > 50:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return {
            'overall_risk': risk_level,
            'risk_score': risk_score,
            'total_red_flags': total_red_flags,
            'total_risk_factors': total_risk_factors,
            'average_credibility': avg_credibility
        }
    
    def _assess_completeness(self, analyses: List[DocumentAnalysis]) -> Dict[str, Any]:
        """Assess completeness of due diligence documentation"""
        # Check which categories are covered
        categories_found = set(analysis.category for analysis in analyses)
        total_categories = len(self.dd_checklist)
        covered_categories = len(categories_found & set(self.dd_checklist.keys()))
        
        completeness_score = (covered_categories / total_categories) * 100
        
        # Calculate average document completeness
        if analyses:
            avg_doc_completeness = sum(analysis.completeness_score for analysis in analyses) / len(analyses)
        else:
            avg_doc_completeness = 0
        
        # Overall completeness (weighted)
        overall_completeness = (completeness_score * 0.6) + (avg_doc_completeness * 0.4)
        
        missing_categories = set(self.dd_checklist.keys()) - categories_found
        
        return {
            'completeness_score': overall_completeness,
            'categories_covered': len(categories_found),
            'total_categories': total_categories,
            'missing_categories': list(missing_categories),
            'average_document_completeness': avg_doc_completeness
        }
    
    def _generate_recommendations(self, analyses: List[DocumentAnalysis],
                                risk_assessment: Dict[str, Any],
                                completeness_assessment: Dict[str, Any]) -> List[str]:
        """Generate actionable due diligence recommendations"""
        recommendations = []
        
        # Risk-based recommendations
        if risk_assessment['overall_risk'] == 'high':
            recommendations.append("CRITICAL: High-risk investment - detailed manual review required")
            recommendations.append("Consider engaging external advisors for risk validation")
        elif risk_assessment['overall_risk'] == 'medium':
            recommendations.append("Moderate risk identified - additional due diligence recommended")
        
        # Completeness-based recommendations  
        if completeness_assessment['completeness_score'] < 70:
            recommendations.append(f"Request additional documentation - only {completeness_assessment['categories_covered']}/{completeness_assessment['total_categories']} categories covered")
            
            for missing_category in completeness_assessment['missing_categories']:
                required_docs = ', '.join(self.dd_checklist[missing_category])
                recommendations.append(f"Missing {missing_category}: Request {required_docs}")
        
        # Document-specific recommendations
        for analysis in analyses:
            if analysis.red_flags:
                recommendations.append(f"Address red flags in {analysis.filename}: {', '.join(analysis.red_flags[:2])}")
        
        return recommendations[:10]  # Limit to top 10 recommendations
    
    def _aggregate_red_flags(self, analyses: List[DocumentAnalysis]) -> List[str]:
        """Aggregate red flags across all documents"""
        all_red_flags = []
        for analysis in analyses:
            for flag in analysis.red_flags:
                flag_with_source = f"{flag} (Source: {analysis.filename})"
                all_red_flags.append(flag_with_source)
        
        return all_red_flags[:15]  # Limit to most critical 15 red flags
    
    def _calculate_overall_score(self, analyses: List[DocumentAnalysis],
                               risk_assessment: Dict[str, Any],
                               completeness_assessment: Dict[str, Any]) -> float:
        """Calculate overall due diligence score (0-100)"""
        if not analyses:
            return 0.0
        
        # Component scores
        risk_score = 100 - risk_assessment['risk_score']  # Invert risk (higher risk = lower score)
        completeness_score = completeness_assessment['completeness_score']
        avg_credibility_score = sum(analysis.credibility_score for analysis in analyses) / len(analyses)
        
        # Weighted overall score
        overall_score = (risk_score * 0.4) + (completeness_score * 0.3) + (avg_credibility_score * 0.3)
        
        return round(overall_score, 1)

# Global instances
due_diligence_orchestrator = DueDiligenceOrchestrator()

# Convenience functions
async def process_due_diligence_data_room(company_id: str, company_name: str, 
                                        file_paths: List[str], 
                                        company_context: Dict[str, Any] = None) -> DueDiligenceReport:
    """Process complete due diligence data room"""
    return await due_diligence_orchestrator.process_data_room(
        company_id, company_name, file_paths, company_context
    )

async def analyze_single_document(file_path: str, document_id: str,
                                company_context: Dict[str, Any] = None) -> DocumentAnalysis:
    """Analyze single document for due diligence"""
    agent = DueDiligenceAgent()
    return await agent.analyze_document(file_path, document_id, company_context)