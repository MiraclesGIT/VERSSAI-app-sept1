"""
VERSSAI Portfolio Management AI Agent
Framework #3: RAG-based portfolio company management with predictive analytics
"""
import os
import json
import hashlib
import asyncio
from typing import Dict, List, Any, Optional, Tuple
import logging
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, asdict
import uuid
import statistics

from ai_agents import VERSSAIAIAgent
from rag_service import rag_service, add_company_document
from google_search_service import google_search_service
from twitter_search_service import twitter_search_service

logger = logging.getLogger(__name__)

@dataclass
class PortfolioCompany:
    company_id: str
    company_name: str
    investment_date: str
    initial_investment: float
    current_valuation: float
    stage: str
    industry: str
    founders: List[str]
    board_members: List[str]
    key_metrics: Dict[str, Any]
    last_update: str

@dataclass
class BoardMeeting:
    meeting_id: str
    company_id: str
    meeting_date: str
    attendees: List[str]
    agenda_items: List[str]
    key_decisions: List[str]
    action_items: List[Dict[str, Any]]
    financial_updates: Dict[str, Any]
    kpi_updates: Dict[str, Any]
    risks_discussed: List[str]
    next_meeting_date: str
    meeting_notes: str

@dataclass
class KPITracker:
    company_id: str
    metric_name: str
    current_value: float
    previous_value: float
    target_value: float
    trend: str  # "improving", "declining", "stable"
    period: str  # "monthly", "quarterly", "annual"
    last_updated: str
    historical_data: List[Dict[str, Any]]

@dataclass
class PortfolioInsight:
    insight_id: str
    company_id: str
    insight_type: str  # "opportunity", "risk", "milestone", "alert"
    title: str
    description: str
    confidence_score: float
    urgency: str  # "high", "medium", "low"
    recommended_actions: List[str]
    created_at: str

@dataclass
class PortfolioReport:
    report_id: str
    generated_at: str
    portfolio_summary: Dict[str, Any]
    company_performances: List[Dict[str, Any]]
    key_insights: List[PortfolioInsight]
    risk_alerts: List[str]
    recommendations: List[str]
    predicted_outcomes: Dict[str, Any]
    overall_health_score: float

class MeetingNotesAnalyzer(VERSSAIAIAgent):
    """AI Agent for analyzing board meeting notes and extracting insights"""
    
    def __init__(self):
        super().__init__("MeetingNotesAnalyzer")
        self.system_prompt = """
        You are an expert VC portfolio management analyst AI specializing in board meeting analysis and portfolio company insights.
        
        Your role is to analyze board meeting notes, financial updates, and KPI data to extract:
        - Key business developments and milestones
        - Financial performance trends and insights
        - Risk factors and early warning signals
        - Action items and follow-ups
        - Strategic opportunities and recommendations
        - Team and operational updates
        
        Focus on identifying:
        - Revenue trends and growth patterns
        - Customer acquisition and retention metrics
        - Product development milestones
        - Competitive positioning changes
        - Operational challenges and solutions
        - Leadership and team changes
        - Funding needs and cash runway
        
        Return ONLY valid JSON in this exact format:
        {
            "key_developments": [],
            "financial_insights": {
                "revenue_trend": "",
                "burn_rate_analysis": "",
                "cash_runway": "",
                "key_metrics": {}
            },
            "risk_factors": [],
            "opportunities": [],
            "action_items": [],
            "strategic_recommendations": [],
            "urgency_alerts": [],
            "confidence_score": 0.85
        }
        
        Provide specific, actionable insights based on the meeting content.
        """
    
    async def analyze_meeting_notes(self, meeting_data: BoardMeeting, 
                                  company_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze board meeting notes for insights and action items
        
        Args:
            meeting_data: BoardMeeting object with notes and updates
            company_context: Additional company context for better analysis
            
        Returns:
            Comprehensive meeting analysis with insights
        """
        try:
            # Create cache key for deterministic results
            cache_key = hashlib.md5(
                f"meeting_analysis_{meeting_data.meeting_id}_{meeting_data.meeting_notes}_{json.dumps(company_context or {}, sort_keys=True)}".encode()
            ).hexdigest()
            
            # Query RAG for similar meeting patterns
            if company_context:
                company_id = company_context.get('company_id', meeting_data.company_id)
                rag_results = rag_service.query_company_knowledge(
                    company_id, 
                    "board meeting financial performance metrics trends", 
                    top_k=3
                )
                rag_context = "\n".join([r['content'][:300] for r in rag_results])
            else:
                rag_context = ""
            
            analysis_prompt = f"""Analyze this board meeting for portfolio management insights:

Meeting Information:
- Company: {meeting_data.company_id}
- Date: {meeting_data.meeting_date}
- Attendees: {', '.join(meeting_data.attendees)}

Agenda Items:
{chr(10).join(f"- {item}" for item in meeting_data.agenda_items)}

Key Decisions Made:
{chr(10).join(f"- {decision}" for decision in meeting_data.key_decisions)}

Financial Updates:
{json.dumps(meeting_data.financial_updates, indent=2)}

KPI Updates:
{json.dumps(meeting_data.kpi_updates, indent=2)}

Risks Discussed:
{chr(10).join(f"- {risk}" for risk in meeting_data.risks_discussed)}

Meeting Notes:
{meeting_data.meeting_notes}

Company Context:
{json.dumps(company_context or {}, indent=2)}

Historical Context:
{rag_context[:1000] if rag_context else 'No historical context available'}

Please analyze and respond with valid JSON only."""
            
            response = self.call_ai(analysis_prompt, self.system_prompt, temperature=0.0)
            
            # Parse AI response
            analysis_data = self._parse_analysis_response(response)
            
            # Add metadata
            analysis_data['meeting_id'] = meeting_data.meeting_id
            analysis_data['company_id'] = meeting_data.company_id
            analysis_data['analysis_timestamp'] = datetime.utcnow().isoformat()
            analysis_data['ai_provider'] = 'gemini'
            
            return analysis_data
            
        except Exception as e:
            logger.error(f"Error analyzing meeting notes: {e}")
            return self._create_fallback_meeting_analysis(meeting_data)
    
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
            logger.error(f"Failed to parse meeting analysis response: {response}")
            return {
                'key_developments': ['AI analysis parsing failed'],
                'financial_insights': {
                    'revenue_trend': 'Unable to analyze',
                    'burn_rate_analysis': 'Analysis failed',
                    'cash_runway': 'Unknown',
                    'key_metrics': {}
                },
                'risk_factors': ['Unable to analyze meeting properly'],
                'opportunities': [],
                'action_items': ['Manual review required'],
                'strategic_recommendations': ['Review meeting notes manually'],
                'urgency_alerts': [],
                'confidence_score': 0.3
            }
    
    def _create_fallback_meeting_analysis(self, meeting_data: BoardMeeting) -> Dict[str, Any]:
        """Create fallback meeting analysis when AI is not available"""
        return {
            'key_developments': ['AI analysis not available - manual review needed'],
            'financial_insights': {
                'revenue_trend': 'Analysis requires AI processing',
                'burn_rate_analysis': 'Analysis requires AI processing',
                'cash_runway': 'Analysis requires AI processing',
                'key_metrics': meeting_data.financial_updates
            },
            'risk_factors': meeting_data.risks_discussed or ['Manual review needed'],
            'opportunities': ['AI analysis required for opportunity identification'],
            'action_items': [{'task': item.get('task', 'Unknown'), 'owner': item.get('owner', 'TBD')} for item in meeting_data.action_items],
            'strategic_recommendations': ['Enable AI analysis for strategic insights'],
            'urgency_alerts': [],
            'confidence_score': 0.3,
            'meeting_id': meeting_data.meeting_id,
            'company_id': meeting_data.company_id,
            'analysis_timestamp': datetime.utcnow().isoformat(),
            'ai_provider': 'fallback'
        }

class KPIAnalyzer(VERSSAIAIAgent):
    """AI Agent for analyzing KPI trends and predicting performance"""
    
    def __init__(self):
        super().__init__("KPIAnalyzer")
        self.system_prompt = """
        You are an expert VC portfolio analyst AI specializing in KPI analysis and performance prediction for portfolio companies.
        
        Your role is to analyze KPI trends, identify patterns, and predict future performance:
        - Analyze historical KPI data and trends
        - Identify early warning signals and risk indicators
        - Predict future performance trajectories
        - Recommend optimization strategies
        - Compare performance against industry benchmarks
        - Generate actionable insights for portfolio managers
        
        Key metrics to focus on:
        - Revenue metrics (MRR, ARR, growth rate)
        - Customer metrics (CAC, LTV, churn, retention)
        - Product metrics (engagement, adoption, usage)
        - Financial metrics (burn rate, runway, gross margin)
        - Operational metrics (team size, productivity)
        
        Return ONLY valid JSON in this exact format:
        {
            "kpi_analysis": {
                "trend_analysis": {},
                "performance_score": 0,
                "benchmark_comparison": {},
                "risk_indicators": []
            },
            "predictions": {
                "next_quarter_forecast": {},
                "annual_projection": {},
                "confidence_intervals": {},
                "scenario_analysis": {}
            },
            "recommendations": [],
            "alerts": [],
            "optimization_opportunities": [],
            "confidence_score": 0.85
        }
        
        Provide data-driven insights with specific recommendations.
        """
    
    async def analyze_kpi_trends(self, company_id: str, kpi_data: List[KPITracker], 
                               company_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze KPI trends and generate performance insights
        
        Args:
            company_id: Company identifier
            kpi_data: List of KPITracker objects
            company_context: Additional company context
            
        Returns:
            Comprehensive KPI analysis with predictions
        """
        try:
            if not kpi_data:
                return self._create_fallback_kpi_analysis(company_id)
            
            # Create cache key for deterministic results
            kpi_summary = json.dumps([asdict(kpi) for kpi in kpi_data], sort_keys=True)
            cache_key = hashlib.md5(f"kpi_analysis_{company_id}_{kpi_summary}".encode()).hexdigest()
            
            # Query RAG for industry benchmarks and similar companies
            rag_results = rag_service.query_platform_knowledge(
                f"startup_kpi_benchmarks_{company_context.get('industry', 'technology') if company_context else 'technology'}", 
                top_k=3
            )
            benchmark_context = "\n".join([r['content'][:300] for r in rag_results])
            
            # Prepare KPI summary for analysis
            kpi_summary_text = []
            for kpi in kpi_data:
                trend_direction = "📈" if kpi.trend == "improving" else "📉" if kpi.trend == "declining" else "➡️"
                kpi_summary_text.append(
                    f"- {kpi.metric_name}: {kpi.current_value} (prev: {kpi.previous_value}, target: {kpi.target_value}) {trend_direction} {kpi.trend}"
                )
            
            analysis_prompt = f"""Analyze these KPI trends for portfolio company {company_id}:

Company Context:
{json.dumps(company_context or {}, indent=2)}

Current KPI Status:
{chr(10).join(kpi_summary_text)}

Historical Data Summary:
{chr(10).join([f"- {kpi.metric_name}: {len(kpi.historical_data)} data points, Period: {kpi.period}" for kpi in kpi_data])}

Industry Benchmarks:
{benchmark_context[:1500] if benchmark_context else 'No benchmark data available'}

Please analyze trends, predict performance, and provide recommendations with valid JSON only."""
            
            response = self.call_ai(analysis_prompt, self.system_prompt, temperature=0.0)
            
            # Parse AI response
            analysis_data = self._parse_kpi_response(response)
            
            # Add metadata and statistical analysis
            analysis_data['company_id'] = company_id
            analysis_data['analysis_timestamp'] = datetime.utcnow().isoformat()
            analysis_data['kpis_analyzed'] = len(kpi_data)
            analysis_data['statistical_summary'] = self._calculate_statistical_summary(kpi_data)
            
            return analysis_data
            
        except Exception as e:
            logger.error(f"Error analyzing KPI trends: {e}")
            return self._create_fallback_kpi_analysis(company_id)
    
    def _calculate_statistical_summary(self, kpi_data: List[KPITracker]) -> Dict[str, Any]:
        """Calculate statistical summary of KPI performance"""
        try:
            improving_count = sum(1 for kpi in kpi_data if kpi.trend == "improving")
            declining_count = sum(1 for kpi in kpi_data if kpi.trend == "declining")
            stable_count = sum(1 for kpi in kpi_data if kpi.trend == "stable")
            
            # Calculate target achievement rates
            target_achievements = []
            for kpi in kpi_data:
                if kpi.target_value != 0:
                    achievement_rate = (kpi.current_value / kpi.target_value) * 100
                    target_achievements.append(achievement_rate)
            
            avg_target_achievement = statistics.mean(target_achievements) if target_achievements else 0
            
            return {
                'total_kpis': len(kpi_data),
                'improving_kpis': improving_count,
                'declining_kpis': declining_count,
                'stable_kpis': stable_count,
                'average_target_achievement': round(avg_target_achievement, 1),
                'performance_distribution': {
                    'improving_pct': round((improving_count / len(kpi_data)) * 100, 1),
                    'declining_pct': round((declining_count / len(kpi_data)) * 100, 1),
                    'stable_pct': round((stable_count / len(kpi_data)) * 100, 1)
                }
            }
            
        except Exception as e:
            logger.error(f"Error calculating statistical summary: {e}")
            return {}
    
    def _parse_kpi_response(self, response: str) -> Dict[str, Any]:
        """Parse KPI analysis response"""
        try:
            response_clean = response.strip()
            if response_clean.startswith('```json'):
                response_clean = response_clean[7:-3].strip()
            elif response_clean.startswith('```'):
                response_clean = response_clean[3:-3].strip()
            
            return json.loads(response_clean)
            
        except json.JSONDecodeError:
            logger.error(f"Failed to parse KPI analysis response: {response}")
            return {
                'kpi_analysis': {
                    'trend_analysis': {'error': 'Analysis parsing failed'},
                    'performance_score': 50,
                    'benchmark_comparison': {},
                    'risk_indicators': ['Unable to analyze trends properly']
                },
                'predictions': {
                    'next_quarter_forecast': {'error': 'Prediction failed'},
                    'annual_projection': {'error': 'Projection failed'},
                    'confidence_intervals': {},
                    'scenario_analysis': {}
                },
                'recommendations': ['Manual KPI review required'],
                'alerts': ['AI analysis failed - manual review needed'],
                'optimization_opportunities': [],
                'confidence_score': 0.3
            }
    
    def _create_fallback_kpi_analysis(self, company_id: str) -> Dict[str, Any]:
        """Create fallback KPI analysis"""
        return {
            'company_id': company_id,
            'kpi_analysis': {
                'trend_analysis': {'status': 'AI analysis not available'},
                'performance_score': 50,
                'benchmark_comparison': {'status': 'Requires AI processing'},
                'risk_indicators': ['Manual KPI review needed']
            },
            'predictions': {
                'next_quarter_forecast': {'status': 'AI prediction not available'},
                'annual_projection': {'status': 'Requires predictive modeling'},
                'confidence_intervals': {},
                'scenario_analysis': {}
            },
            'recommendations': ['Enable AI analysis for KPI insights'],
            'alerts': ['KPI tracking requires AI processing'],
            'optimization_opportunities': ['Setup AI analysis for optimization recommendations'],
            'confidence_score': 0.3,
            'analysis_timestamp': datetime.utcnow().isoformat(),
            'ai_provider': 'fallback'
        }

class PortfolioOrchestrator:
    """
    Orchestrates comprehensive portfolio management activities
    """
    
    def __init__(self):
        self.meeting_analyzer = MeetingNotesAnalyzer()
        self.kpi_analyzer = KPIAnalyzer()
        self.portfolio_companies = {}  # In-memory storage for demo
        self.board_meetings = {}
        self.kpi_trackers = {}
        
    async def add_portfolio_company(self, company_data: Dict[str, Any]) -> PortfolioCompany:
        """Add new portfolio company"""
        try:
            company = PortfolioCompany(
                company_id=company_data.get('company_id', str(uuid.uuid4())),
                company_name=company_data['company_name'],
                investment_date=company_data.get('investment_date', datetime.utcnow().isoformat()),
                initial_investment=company_data.get('initial_investment', 0),
                current_valuation=company_data.get('current_valuation', 0),
                stage=company_data.get('stage', 'Unknown'),
                industry=company_data.get('industry', 'Technology'),
                founders=company_data.get('founders', []),
                board_members=company_data.get('board_members', []),
                key_metrics=company_data.get('key_metrics', {}),
                last_update=datetime.utcnow().isoformat()
            )
            
            self.portfolio_companies[company.company_id] = company
            
            # Add to RAG knowledge base
            await self._add_company_to_portfolio_rag(company)
            
            logger.info(f"Added portfolio company: {company.company_name}")
            return company
            
        except Exception as e:
            logger.error(f"Error adding portfolio company: {e}")
            raise
    
    async def process_board_meeting(self, meeting_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process board meeting notes and generate insights"""
        try:
            # Create BoardMeeting object
            meeting = BoardMeeting(
                meeting_id=meeting_data.get('meeting_id', str(uuid.uuid4())),
                company_id=meeting_data['company_id'],
                meeting_date=meeting_data.get('meeting_date', datetime.utcnow().isoformat()),
                attendees=meeting_data.get('attendees', []),
                agenda_items=meeting_data.get('agenda_items', []),
                key_decisions=meeting_data.get('key_decisions', []),
                action_items=meeting_data.get('action_items', []),
                financial_updates=meeting_data.get('financial_updates', {}),
                kpi_updates=meeting_data.get('kpi_updates', {}),
                risks_discussed=meeting_data.get('risks_discussed', []),
                next_meeting_date=meeting_data.get('next_meeting_date', ''),
                meeting_notes=meeting_data.get('meeting_notes', '')
            )
            
            # Get company context
            company_context = None
            if meeting.company_id in self.portfolio_companies:
                company = self.portfolio_companies[meeting.company_id]
                company_context = {
                    'company_id': company.company_id,
                    'company_name': company.company_name,
                    'industry': company.industry,
                    'stage': company.stage,
                    'key_metrics': company.key_metrics
                }
            
            # Analyze meeting with AI
            meeting_analysis = await self.meeting_analyzer.analyze_meeting_notes(
                meeting, company_context
            )
            
            # Store meeting
            self.board_meetings[meeting.meeting_id] = meeting
            
            # Add meeting to RAG knowledge
            await self._add_meeting_to_rag(meeting, meeting_analysis)
            
            # Update company KPIs if provided
            if meeting.kpi_updates:
                await self._update_company_kpis(meeting.company_id, meeting.kpi_updates, meeting.meeting_date)
            
            result = {
                'meeting_id': meeting.meeting_id,
                'company_id': meeting.company_id,
                'analysis': meeting_analysis,
                'status': 'completed',
                'processed_at': datetime.utcnow().isoformat()
            }
            
            logger.info(f"Processed board meeting for {meeting.company_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error processing board meeting: {e}")
            return {
                'status': 'failed',
                'error': str(e),
                'processed_at': datetime.utcnow().isoformat()
            }
    
    async def analyze_portfolio_performance(self, fund_id: str = None) -> PortfolioReport:
        """Generate comprehensive portfolio performance report"""
        try:
            # Get portfolio companies (filter by fund if specified)
            companies = list(self.portfolio_companies.values())
            if fund_id:
                # In a real implementation, filter by fund_id
                pass
            
            # Analyze each company's performance
            company_performances = []
            total_value = 0
            total_investment = 0
            
            for company in companies:
                # Get latest KPIs
                company_kpis = [kpi for kpi in self.kpi_trackers.values() 
                             if kpi.company_id == company.company_id]
                
                # Analyze KPI trends
                if company_kpis:
                    company_context = {
                        'company_id': company.company_id,
                        'company_name': company.company_name,
                        'industry': company.industry,
                        'stage': company.stage
                    }
                    kpi_analysis = await self.kpi_analyzer.analyze_kpi_trends(
                        company.company_id, company_kpis, company_context
                    )
                else:
                    kpi_analysis = {'status': 'no_kpis_available'}
                
                # Calculate performance metrics
                multiple = (company.current_valuation / company.initial_investment) if company.initial_investment > 0 else 0
                total_value += company.current_valuation
                total_investment += company.initial_investment
                
                company_performance = {
                    'company_id': company.company_id,
                    'company_name': company.company_name,
                    'investment_date': company.investment_date,
                    'initial_investment': company.initial_investment,
                    'current_valuation': company.current_valuation,
                    'multiple': round(multiple, 2),
                    'stage': company.stage,
                    'industry': company.industry,
                    'kpi_analysis': kpi_analysis,
                    'last_update': company.last_update
                }
                
                company_performances.append(company_performance)
            
            # Calculate portfolio-level metrics
            portfolio_multiple = (total_value / total_investment) if total_investment > 0 else 0
            
            portfolio_summary = {
                'total_companies': len(companies),
                'total_investment': total_investment,
                'current_portfolio_value': total_value,
                'portfolio_multiple': round(portfolio_multiple, 2),
                'unrealized_gain_loss': total_value - total_investment,
                'industries_distribution': self._calculate_industry_distribution(companies),
                'stage_distribution': self._calculate_stage_distribution(companies)
            }
            
            # Generate insights and recommendations
            key_insights = await self._generate_portfolio_insights(companies, company_performances)
            risk_alerts = self._identify_risk_alerts(company_performances)
            recommendations = self._generate_portfolio_recommendations(portfolio_summary, company_performances)
            
            # Calculate overall health score
            health_score = self._calculate_portfolio_health_score(company_performances)
            
            # Create comprehensive report
            report = PortfolioReport(
                report_id=str(uuid.uuid4()),
                generated_at=datetime.utcnow().isoformat(),
                portfolio_summary=portfolio_summary,
                company_performances=company_performances,
                key_insights=key_insights,
                risk_alerts=risk_alerts,
                recommendations=recommendations,
                predicted_outcomes={},  # Would include ML predictions in full implementation
                overall_health_score=health_score
            )
            
            logger.info(f"Generated portfolio report with {len(companies)} companies")
            return report
            
        except Exception as e:
            logger.error(f"Error analyzing portfolio performance: {e}")
            raise
    
    async def _add_company_to_portfolio_rag(self, company: PortfolioCompany):
        """Add portfolio company to RAG knowledge base"""
        try:
            company_content = f"""
            Portfolio Company: {company.company_name}
            Investment Date: {company.investment_date}
            Industry: {company.industry}
            Stage: {company.stage}
            Founders: {', '.join(company.founders)}
            Board Members: {', '.join(company.board_members)}
            Initial Investment: ${company.initial_investment:,.0f}
            Current Valuation: ${company.current_valuation:,.0f}
            Key Metrics: {json.dumps(company.key_metrics, indent=2)}
            """
            
            add_company_document(
                company_id=company.company_id,
                content=company_content,
                metadata={
                    'document_type': 'portfolio_company_profile',
                    'company_name': company.company_name,
                    'industry': company.industry,
                    'stage': company.stage,
                    'investment_date': company.investment_date,
                    'document_source': 'portfolio_management'
                },
                document_id=f"portfolio_{company.company_id}"
            )
            
        except Exception as e:
            logger.error(f"Error adding company to portfolio RAG: {e}")
    
    async def _add_meeting_to_rag(self, meeting: BoardMeeting, analysis: Dict[str, Any]):
        """Add board meeting to RAG knowledge base"""
        try:
            meeting_content = f"""
            Board Meeting: {meeting.company_id}
            Date: {meeting.meeting_date}
            Attendees: {', '.join(meeting.attendees)}
            
            Key Decisions:
            {chr(10).join(f"- {decision}" for decision in meeting.key_decisions)}
            
            Financial Updates:
            {json.dumps(meeting.financial_updates, indent=2)}
            
            KPI Updates:
            {json.dumps(meeting.kpi_updates, indent=2)}
            
            AI Analysis Summary:
            Key Developments: {', '.join(analysis.get('key_developments', [])[:3])}
            Risk Factors: {', '.join(analysis.get('risk_factors', [])[:3])}
            
            Meeting Notes:
            {meeting.meeting_notes}
            """
            
            add_company_document(
                company_id=meeting.company_id,
                content=meeting_content,
                metadata={
                    'document_type': 'board_meeting',
                    'meeting_date': meeting.meeting_date,
                    'meeting_id': meeting.meeting_id,
                    'analysis_confidence': analysis.get('confidence_score', 0.5),
                    'document_source': 'portfolio_management'
                },
                document_id=f"meeting_{meeting.meeting_id}"
            )
            
        except Exception as e:
            logger.error(f"Error adding meeting to RAG: {e}")
    
    async def _update_company_kpis(self, company_id: str, kpi_updates: Dict[str, Any], date: str):
        """Update company KPIs from meeting data"""
        try:
            for metric_name, value in kpi_updates.items():
                kpi_id = f"{company_id}_{metric_name}"
                
                if kpi_id in self.kpi_trackers:
                    # Update existing KPI
                    kpi = self.kpi_trackers[kpi_id]
                    kpi.previous_value = kpi.current_value
                    kpi.current_value = float(value)
                    kpi.last_updated = date
                    
                    # Add to historical data
                    kpi.historical_data.append({
                        'date': date,
                        'value': float(value)
                    })
                    
                    # Determine trend
                    if kpi.current_value > kpi.previous_value:
                        kpi.trend = "improving"
                    elif kpi.current_value < kpi.previous_value:
                        kpi.trend = "declining"
                    else:
                        kpi.trend = "stable"
                else:
                    # Create new KPI tracker
                    kpi = KPITracker(
                        company_id=company_id,
                        metric_name=metric_name,
                        current_value=float(value),
                        previous_value=0,
                        target_value=0,  # Would be set based on company plans
                        trend="stable",
                        period="monthly",
                        last_updated=date,
                        historical_data=[{'date': date, 'value': float(value)}]
                    )
                    self.kpi_trackers[kpi_id] = kpi
                
        except Exception as e:
            logger.error(f"Error updating KPIs: {e}")
    
    def _calculate_industry_distribution(self, companies: List[PortfolioCompany]) -> Dict[str, int]:
        """Calculate distribution of companies by industry"""
        distribution = {}
        for company in companies:
            industry = company.industry
            distribution[industry] = distribution.get(industry, 0) + 1
        return distribution
    
    def _calculate_stage_distribution(self, companies: List[PortfolioCompany]) -> Dict[str, int]:
        """Calculate distribution of companies by stage"""
        distribution = {}
        for company in companies:
            stage = company.stage
            distribution[stage] = distribution.get(stage, 0) + 1
        return distribution
    
    async def _generate_portfolio_insights(self, companies: List[PortfolioCompany], 
                                         performances: List[Dict[str, Any]]) -> List[PortfolioInsight]:
        """Generate AI-powered portfolio insights"""
        insights = []
        
        try:
            # Top performers
            top_performers = sorted(performances, key=lambda x: x.get('multiple', 0), reverse=True)[:3]
            for i, performer in enumerate(top_performers):
                insight = PortfolioInsight(
                    insight_id=str(uuid.uuid4()),
                    company_id=performer['company_id'],
                    insight_type='opportunity',
                    title=f"Top Performer #{i+1}",
                    description=f"{performer['company_name']} showing {performer['multiple']}x multiple",
                    confidence_score=0.9,
                    urgency='medium',
                    recommended_actions=[f"Consider follow-on investment in {performer['company_name']}"],
                    created_at=datetime.utcnow().isoformat()
                )
                insights.append(insight)
            
            # Underperformers
            underperformers = [p for p in performances if p.get('multiple', 0) < 1.0]
            if underperformers:
                for underperformer in underperformers[:2]:  # Top 2 concerns
                    insight = PortfolioInsight(
                        insight_id=str(uuid.uuid4()),
                        company_id=underperformer['company_id'],
                        insight_type='risk',
                        title='Performance Concern',
                        description=f"{underperformer['company_name']} below 1x multiple at {underperformer['multiple']}x",
                        confidence_score=0.8,
                        urgency='high',
                        recommended_actions=[
                            'Schedule strategy review meeting',
                            'Assess management team performance',
                            'Consider additional support or restructuring'
                        ],
                        created_at=datetime.utcnow().isoformat()
                    )
                    insights.append(insight)
            
        except Exception as e:
            logger.error(f"Error generating portfolio insights: {e}")
        
        return insights
    
    def _identify_risk_alerts(self, performances: List[Dict[str, Any]]) -> List[str]:
        """Identify portfolio-level risk alerts"""
        alerts = []
        
        # Check for companies with declining multiples
        declining = [p for p in performances if p.get('multiple', 0) < 0.5]
        if declining:
            alerts.append(f"{len(declining)} companies showing significant value decline")
        
        # Check for concentration risk
        total_value = sum(p.get('current_valuation', 0) for p in performances)
        if performances:
            top_investment = max(performances, key=lambda x: x.get('current_valuation', 0))
            concentration = (top_investment.get('current_valuation', 0) / total_value) * 100
            if concentration > 40:
                alerts.append(f"High concentration risk: {top_investment['company_name']} represents {concentration:.1f}% of portfolio")
        
        return alerts
    
    def _generate_portfolio_recommendations(self, summary: Dict[str, Any], 
                                          performances: List[Dict[str, Any]]) -> List[str]:
        """Generate portfolio-level recommendations"""
        recommendations = []
        
        # Portfolio performance recommendations
        if summary.get('portfolio_multiple', 0) > 2.0:
            recommendations.append("Strong portfolio performance - consider preparing top performers for exit")
        elif summary.get('portfolio_multiple', 0) < 1.0:
            recommendations.append("Portfolio underperforming - review investment strategies and provide additional support")
        
        # Diversification recommendations
        industries = summary.get('industries_distribution', {})
        if len(industries) < 3:
            recommendations.append("Consider diversifying across more industries to reduce risk")
        
        # Stage distribution recommendations
        stages = summary.get('stage_distribution', {})
        early_stage = stages.get('Seed', 0) + stages.get('Series A', 0)
        total = summary.get('total_companies', 1)
        if (early_stage / total) > 0.8:
            recommendations.append("High concentration in early-stage - consider later-stage investments for balance")
        
        return recommendations
    
    def _calculate_portfolio_health_score(self, performances: List[Dict[str, Any]]) -> float:
        """Calculate overall portfolio health score (0-100)"""
        if not performances:
            return 0.0
        
        try:
            # Calculate based on multiple metrics
            multiples = [p.get('multiple', 0) for p in performances]
            avg_multiple = statistics.mean(multiples)
            
            # Base score from average multiple
            if avg_multiple >= 3.0:
                base_score = 90
            elif avg_multiple >= 2.0:
                base_score = 75
            elif avg_multiple >= 1.5:
                base_score = 60
            elif avg_multiple >= 1.0:
                base_score = 45
            else:
                base_score = 25
            
            # Adjust for diversity (industry and stage spread)
            # Would be more sophisticated in full implementation
            
            # Adjust for risk factors
            underperformers = len([p for p in performances if p.get('multiple', 0) < 0.8])
            risk_penalty = min(20, underperformers * 5)
            
            final_score = max(0, min(100, base_score - risk_penalty))
            return round(final_score, 1)
            
        except Exception as e:
            logger.error(f"Error calculating health score: {e}")
            return 50.0

# Global orchestrator instance
portfolio_orchestrator = PortfolioOrchestrator()

# Convenience functions
async def add_portfolio_company(company_data: Dict[str, Any]) -> PortfolioCompany:
    """Add new portfolio company"""
    return await portfolio_orchestrator.add_portfolio_company(company_data)

async def process_board_meeting(meeting_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process board meeting notes"""
    return await portfolio_orchestrator.process_board_meeting(meeting_data)

async def analyze_portfolio_performance(fund_id: str = None) -> PortfolioReport:
    """Generate portfolio performance report"""
    return await portfolio_orchestrator.analyze_portfolio_performance(fund_id)