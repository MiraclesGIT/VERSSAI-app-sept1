"""
VERSSAI Funds/Vintage Management AI Agent
Framework #6: Performance comparison across funds/vintages with benchmarking and LP reporting
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
import random

from ai_agents import VERSSAIAIAgent
from rag_service import rag_service, add_company_document

logger = logging.getLogger(__name__)

@dataclass
class Fund:
    fund_id: str
    fund_name: str
    vintage_year: int
    fund_size: float
    committed_capital: float
    called_capital: float
    distributed_capital: float
    fund_type: str  # "Early Stage", "Growth", "Multi-Stage"
    investment_strategy: str
    target_sectors: List[str]
    target_geographies: List[str]
    fund_manager: str
    inception_date: str
    final_close_date: str
    investment_period_end: str
    fund_life_end: str
    status: str  # "fundraising", "investing", "harvesting", "liquidated"

@dataclass
class VintageGroup:
    vintage_year: int
    funds_in_vintage: List[str]
    total_funds_count: int
    total_committed_capital: float
    average_fund_size: float
    market_conditions: Dict[str, Any]
    benchmark_metrics: Dict[str, float]

@dataclass
class PerformanceMetrics:
    fund_id: str
    as_of_date: str
    irr: float
    tvpi: float  # Total Value to Paid-In capital
    dpi: float   # Distributions to Paid-In capital
    rvpi: float  # Residual Value to Paid-In capital
    multiple: float
    quartile_ranking: Optional[int]
    percentile_ranking: Optional[float]
    benchmark_comparison: Dict[str, Any]

@dataclass
class LPReportData:
    report_id: str
    fund_id: str
    fund_name: str
    reporting_period: str
    report_date: str
    fund_summary: Dict[str, Any]
    performance_metrics: PerformanceMetrics
    portfolio_updates: List[Dict[str, Any]]
    capital_calls: List[Dict[str, Any]]
    distributions: List[Dict[str, Any]]
    market_commentary: str
    outlook: str
    key_developments: List[str]

@dataclass
class BenchmarkAnalysis:
    analysis_id: str
    fund_id: str
    benchmark_universe: str  # "Industry", "Vintage", "Strategy"
    comparison_metrics: Dict[str, Any]
    percentile_rankings: Dict[str, float]
    peer_analysis: Dict[str, Any]
    outperformance_factors: List[str]
    underperformance_factors: List[str]
    recommendations: List[str]

@dataclass
class VintageReport:
    report_id: str
    vintage_year: int
    generated_at: str
    vintage_summary: Dict[str, Any]
    funds_analysis: List[Dict[str, Any]]
    vintage_performance: Dict[str, Any]
    market_context: Dict[str, Any]
    peer_comparison: Dict[str, Any]
    lessons_learned: List[str]
    market_timing_analysis: Dict[str, Any]
    success_factors: List[str]
    overall_vintage_score: float

class VintageAnalyzer(VERSSAIAIAgent):
    """AI Agent for vintage and fund performance analysis"""
    
    def __init__(self):
        super().__init__("VintageAnalyzer")
        self.system_prompt = """
        You are an expert VC fund performance analyst AI specializing in vintage analysis and benchmarking.
        
        Your role is to analyze fund performance across vintages and provide comparative insights:
        - Analyze vintage year performance patterns and market timing effects
        - Compare fund performance within and across vintage years
        - Identify macro factors affecting vintage performance
        - Benchmark funds against industry standards and peer groups
        - Generate insights on optimal fund formation timing
        - Assess LP portfolio construction and diversification
        
        Key analysis areas:
        - Market cycle timing and entry/exit conditions
        - Vintage concentration risks and portfolio balance
        - Performance attribution across market conditions
        - Fund manager performance consistency across vintages
        - LP portfolio optimization across vintage years
        - Risk-adjusted return analysis by vintage cohort
        
        Return ONLY valid JSON in this exact format:
        {
            "vintage_analysis": {
                "performance_trends": {},
                "market_timing_impact": {},
                "comparative_metrics": {},
                "risk_assessment": {}
            },
            "fund_comparison": {
                "peer_rankings": {},
                "performance_drivers": [],
                "competitive_positioning": {}
            },
            "market_context": {
                "vintage_conditions": {},
                "macro_factors": [],
                "timing_analysis": {}
            },
            "recommendations": [],
            "insights": [],
            "confidence_score": 0.85
        }
        
        Provide data-driven insights with specific vintage-level recommendations.
        """
    
    async def analyze_vintage_performance(self, vintage_year: int, 
                                        funds_data: List[Dict[str, Any]],
                                        benchmark_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze performance of funds within a vintage year
        
        Args:
            vintage_year: The vintage year to analyze
            funds_data: List of fund performance data
            benchmark_data: Industry benchmarks and market data
            
        Returns:
            Comprehensive vintage analysis
        """
        try:
            # Create cache key for deterministic results
            cache_key = hashlib.md5(
                f"vintage_analysis_{vintage_year}_{json.dumps(funds_data, sort_keys=True)}_{json.dumps(benchmark_data or {}, sort_keys=True)}".encode()
            ).hexdigest()
            
            # Query RAG for vintage performance patterns
            rag_results = rag_service.query_platform_knowledge(
                f"vintage_{vintage_year}_vc_performance_market_conditions", top_k=3
            )
            historical_context = "\n".join([r['content'][:300] for r in rag_results])
            
            # Prepare analysis prompt
            analysis_prompt = f"""Analyze {vintage_year} vintage fund performance:

Vintage Year: {vintage_year}
Number of Funds: {len(funds_data)}

Fund Performance Data:
{chr(10).join([f"- {fund['fund_name']}: IRR {fund.get('irr', 0):.1%}, TVPI {fund.get('tvpi', 0):.1f}x, Fund Size ${fund.get('fund_size', 0)/1e6:.0f}M" for fund in funds_data[:10]])}

Market Context ({vintage_year}):
{json.dumps(benchmark_data or {}, indent=2)}

Historical Vintage Context:
{historical_context[:1000] if historical_context else f'Limited historical data for {vintage_year} vintage'}

Please analyze vintage performance patterns, market timing impact, and provide insights with valid JSON only."""
            
            response = self.call_ai(analysis_prompt, self.system_prompt, temperature=0.0)
            
            # Parse AI response
            analysis_data = self._parse_vintage_analysis(response)
            
            # Add calculated metrics
            analysis_data['calculated_metrics'] = self._calculate_vintage_metrics(funds_data)
            analysis_data['vintage_year'] = vintage_year
            analysis_data['funds_analyzed'] = len(funds_data)
            analysis_data['analysis_timestamp'] = datetime.utcnow().isoformat()
            
            return analysis_data
            
        except Exception as e:
            logger.error(f"Error analyzing vintage performance: {e}")
            return self._create_fallback_vintage_analysis(vintage_year, len(funds_data))
    
    def _parse_vintage_analysis(self, response: str) -> Dict[str, Any]:
        """Parse AI vintage analysis response"""
        try:
            response_clean = response.strip()
            if response_clean.startswith('```json'):
                response_clean = response_clean[7:-3].strip()
            elif response_clean.startswith('```'):
                response_clean = response_clean[3:-3].strip()
            
            return json.loads(response_clean)
            
        except json.JSONDecodeError:
            logger.error(f"Failed to parse vintage analysis response: {response}")
            return {
                'vintage_analysis': {
                    'performance_trends': {'error': 'AI analysis parsing failed'},
                    'market_timing_impact': {'error': 'Market analysis failed'},
                    'comparative_metrics': {'error': 'Comparison failed'},
                    'risk_assessment': {'error': 'Risk analysis failed'}
                },
                'fund_comparison': {
                    'peer_rankings': {'error': 'Ranking analysis failed'},
                    'performance_drivers': ['AI analysis not available'],
                    'competitive_positioning': {'error': 'Positioning analysis failed'}
                },
                'market_context': {
                    'vintage_conditions': {'error': 'Market context failed'},
                    'macro_factors': ['Manual analysis required'],
                    'timing_analysis': {'error': 'Timing analysis failed'}
                },
                'recommendations': ['Enable AI analysis for vintage insights'],
                'insights': ['Manual vintage analysis needed'],
                'confidence_score': 0.3
            }
    
    def _calculate_vintage_metrics(self, funds_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate statistical metrics for vintage performance"""
        try:
            if not funds_data:
                return {}
            
            # Extract performance metrics
            irrs = [fund.get('irr', 0) for fund in funds_data if fund.get('irr') is not None]
            tvpis = [fund.get('tvpi', 0) for fund in funds_data if fund.get('tvpi') is not None]
            fund_sizes = [fund.get('fund_size', 0) for fund in funds_data if fund.get('fund_size') is not None]
            
            metrics = {
                'fund_count': len(funds_data),
                'average_irr': statistics.mean(irrs) if irrs else 0,
                'median_irr': statistics.median(irrs) if irrs else 0,
                'irr_std': statistics.stdev(irrs) if len(irrs) > 1 else 0,
                'average_tvpi': statistics.mean(tvpis) if tvpis else 0,
                'median_tvpi': statistics.median(tvpis) if tvpis else 0,
                'tvpi_std': statistics.stdev(tvpis) if len(tvpis) > 1 else 0,
                'total_committed_capital': sum(fund_sizes),
                'average_fund_size': statistics.mean(fund_sizes) if fund_sizes else 0,
                'top_quartile_irr': sorted(irrs, reverse=True)[len(irrs)//4] if len(irrs) >= 4 else 0,
                'bottom_quartile_irr': sorted(irrs)[len(irrs)//4] if len(irrs) >= 4 else 0
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error calculating vintage metrics: {e}")
            return {}
    
    def _create_fallback_vintage_analysis(self, vintage_year: int, funds_count: int) -> Dict[str, Any]:
        """Create fallback vintage analysis"""
        return {
            'vintage_year': vintage_year,
            'funds_analyzed': funds_count,
            'vintage_analysis': {
                'performance_trends': {'status': 'AI analysis not available'},
                'market_timing_impact': {'status': 'Requires AI processing'},
                'comparative_metrics': {'status': 'Analysis failed'},
                'risk_assessment': {'status': 'Risk analysis not available'}
            },
            'fund_comparison': {
                'peer_rankings': {'status': 'Ranking requires AI analysis'},
                'performance_drivers': ['Enable AI analysis for insights'],
                'competitive_positioning': {'status': 'Position analysis failed'}
            },
            'market_context': {
                'vintage_conditions': {'status': 'Market context not available'},
                'macro_factors': ['AI analysis required for market factors'],
                'timing_analysis': {'status': 'Timing analysis failed'}
            },
            'recommendations': [f'Enable AI analysis for {vintage_year} vintage insights'],
            'insights': ['Manual vintage analysis needed'],
            'confidence_score': 0.3,
            'analysis_timestamp': datetime.utcnow().isoformat(),
            'ai_provider': 'fallback'
        }

class FundVintageOrchestrator:
    """Orchestrates fund and vintage management operations"""
    
    def __init__(self):
        self.vintage_analyzer = VintageAnalyzer()
        self.funds = {}  # In-memory storage for demo
        self.vintage_groups = {}
        self.performance_metrics = {}
        self.lp_reports = {}
        
    async def add_fund(self, fund_data: Dict[str, Any]) -> Fund:
        """Add fund to the system"""
        try:
            fund = Fund(
                fund_id=fund_data.get('fund_id', str(uuid.uuid4())),
                fund_name=fund_data['fund_name'],
                vintage_year=fund_data['vintage_year'],
                fund_size=fund_data['fund_size'],
                committed_capital=fund_data.get('committed_capital', fund_data['fund_size']),
                called_capital=fund_data.get('called_capital', 0),
                distributed_capital=fund_data.get('distributed_capital', 0),
                fund_type=fund_data.get('fund_type', 'Multi-Stage'),
                investment_strategy=fund_data.get('investment_strategy', 'Diversified VC'),
                target_sectors=fund_data.get('target_sectors', []),
                target_geographies=fund_data.get('target_geographies', []),
                fund_manager=fund_data.get('fund_manager', 'Unknown'),
                inception_date=fund_data.get('inception_date', datetime.utcnow().isoformat()),
                final_close_date=fund_data.get('final_close_date', ''),
                investment_period_end=fund_data.get('investment_period_end', ''),
                fund_life_end=fund_data.get('fund_life_end', ''),
                status=fund_data.get('status', 'investing')
            )
            
            self.funds[fund.fund_id] = fund
            
            # Update vintage group
            await self._update_vintage_group(fund.vintage_year, fund.fund_id)
            
            # Add to RAG knowledge base
            await self._add_fund_to_rag(fund)
            
            logger.info(f"Added fund: {fund.fund_name} (Vintage {fund.vintage_year})")
            return fund
            
        except Exception as e:
            logger.error(f"Error adding fund: {e}")
            raise
    
    async def update_fund_performance(self, fund_id: str, performance_data: Dict[str, Any]) -> PerformanceMetrics:
        """Update fund performance metrics"""
        try:
            performance = PerformanceMetrics(
                fund_id=fund_id,
                as_of_date=performance_data.get('as_of_date', datetime.utcnow().isoformat()),
                irr=performance_data.get('irr', 0),
                tvpi=performance_data.get('tvpi', 0),
                dpi=performance_data.get('dpi', 0),
                rvpi=performance_data.get('rvpi', 0),
                multiple=performance_data.get('multiple', 0),
                quartile_ranking=performance_data.get('quartile_ranking'),
                percentile_ranking=performance_data.get('percentile_ranking'),
                benchmark_comparison=performance_data.get('benchmark_comparison', {})
            )
            
            self.performance_metrics[fund_id] = performance
            
            logger.info(f"Updated performance for fund {fund_id}: IRR {performance.irr:.1%}, TVPI {performance.tvpi:.1f}x")
            return performance
            
        except Exception as e:
            logger.error(f"Error updating fund performance: {e}")
            raise
    
    async def generate_vintage_report(self, vintage_year: int) -> VintageReport:
        """Generate comprehensive vintage performance report"""
        try:
            # Get funds for vintage year
            vintage_funds = [fund for fund in self.funds.values() if fund.vintage_year == vintage_year]
            
            if not vintage_funds:
                return self._create_empty_vintage_report(vintage_year)
            
            # Get performance data for vintage funds
            funds_performance = []
            for fund in vintage_funds:
                performance = self.performance_metrics.get(fund.fund_id)
                fund_data = {
                    'fund_id': fund.fund_id,
                    'fund_name': fund.fund_name,
                    'fund_size': fund.fund_size,
                    'fund_type': fund.fund_type,
                    'investment_strategy': fund.investment_strategy,
                    'irr': performance.irr if performance else random.uniform(0.05, 0.30),  # Mock data for demo
                    'tvpi': performance.tvpi if performance else random.uniform(1.0, 3.5),
                    'dpi': performance.dpi if performance else random.uniform(0.2, 1.5),
                    'rvpi': performance.rvpi if performance else random.uniform(0.8, 2.0)
                }
                funds_performance.append(fund_data)
            
            # Analyze vintage performance with AI
            vintage_analysis = await self.vintage_analyzer.analyze_vintage_performance(
                vintage_year, funds_performance
            )
            
            # Calculate vintage-level metrics
            vintage_performance = self._calculate_vintage_performance(funds_performance)
            
            # Generate market context
            market_context = self._generate_market_context(vintage_year)
            
            # Generate peer comparison
            peer_comparison = await self._generate_peer_comparison(vintage_year, funds_performance)
            
            # Extract lessons learned and success factors
            lessons_learned = vintage_analysis.get('insights', [])[:5]
            success_factors = vintage_analysis.get('fund_comparison', {}).get('performance_drivers', [])[:5]
            
            # Calculate overall vintage score
            vintage_score = self._calculate_vintage_score(vintage_performance, vintage_analysis)
            
            report = VintageReport(
                report_id=str(uuid.uuid4()),
                vintage_year=vintage_year,
                generated_at=datetime.utcnow().isoformat(),
                vintage_summary={
                    'total_funds': len(vintage_funds),
                    'total_committed_capital': sum(f['fund_size'] for f in funds_performance),
                    'average_fund_size': statistics.mean([f['fund_size'] for f in funds_performance]),
                    'fund_types': list(set(fund.fund_type for fund in vintage_funds))
                },
                funds_analysis=funds_performance,
                vintage_performance=vintage_performance,
                market_context=market_context,
                peer_comparison=peer_comparison,
                lessons_learned=lessons_learned,
                market_timing_analysis=vintage_analysis.get('vintage_analysis', {}).get('market_timing_impact', {}),
                success_factors=success_factors,
                overall_vintage_score=vintage_score
            )
            
            logger.info(f"Generated vintage report for {vintage_year} - Score: {vintage_score}")
            return report
            
        except Exception as e:
            logger.error(f"Error generating vintage report: {e}")
            raise
    
    async def generate_lp_report(self, fund_id: str, reporting_period: str) -> LPReportData:
        """Generate LP report for a specific fund"""
        try:
            fund = self.funds.get(fund_id)
            if not fund:
                raise ValueError(f"Fund {fund_id} not found")
            
            performance = self.performance_metrics.get(fund_id)
            
            # Create fund summary
            fund_summary = {
                'fund_name': fund.fund_name,
                'vintage_year': fund.vintage_year,
                'fund_size': fund.fund_size,
                'committed_capital': fund.committed_capital,
                'called_capital': fund.called_capital,
                'distributed_capital': fund.distributed_capital,
                'investment_strategy': fund.investment_strategy,
                'target_sectors': fund.target_sectors,
                'status': fund.status,
                'fund_manager': fund.fund_manager
            }
            
            # Mock portfolio updates (in real implementation, would come from portfolio data)
            portfolio_updates = [
                {
                    'company_name': 'TechVenture AI',
                    'investment_date': '2023-03-15',
                    'current_valuation': 12000000,
                    'initial_investment': 2000000,
                    'status': 'Growing',
                    'key_developments': ['Closed Series B', 'Expanded to Europe']
                },
                {
                    'company_name': 'HealthTech Innovations',
                    'investment_date': '2023-06-20',
                    'current_valuation': 8000000,
                    'initial_investment': 3000000,
                    'status': 'Scaling',
                    'key_developments': ['FDA approval received', 'Key partnership signed']
                }
            ]
            
            # Mock capital activity
            capital_calls = [
                {
                    'date': '2024-01-15',
                    'amount': 5000000,
                    'purpose': 'New investments and follow-ons',
                    'cumulative_called': fund.called_capital + 5000000
                }
            ]
            
            distributions = [
                {
                    'date': '2024-02-28',
                    'amount': 2500000,
                    'source': 'TechVenture AI partial exit',
                    'cumulative_distributed': fund.distributed_capital + 2500000
                }
            ]
            
            # Generate market commentary and outlook
            market_commentary = f"""
            The {fund.vintage_year} vintage continues to benefit from favorable market conditions for venture capital. 
            Despite some headwinds in the broader economy, innovation sectors remain resilient with strong fundamentals.
            """
            
            outlook = f"""
            We remain optimistic about the {reporting_period} period outlook, with several portfolio companies 
            approaching significant milestones and potential liquidity events.
            """
            
            key_developments = [
                f'Portfolio company TechVenture AI raised Series B round',
                f'Completed follow-on investments in 3 portfolio companies',
                f'One partial exit generating {performance.dpi:.1f}x DPI' if performance else 'Portfolio performance tracking ahead of vintage benchmark'
            ]
            
            lp_report = LPReportData(
                report_id=str(uuid.uuid4()),
                fund_id=fund_id,
                fund_name=fund.fund_name,
                reporting_period=reporting_period,
                report_date=datetime.utcnow().isoformat(),
                fund_summary=fund_summary,
                performance_metrics=performance or self._create_mock_performance(fund_id),
                portfolio_updates=portfolio_updates,
                capital_calls=capital_calls,
                distributions=distributions,
                market_commentary=market_commentary,
                outlook=outlook,
                key_developments=key_developments
            )
            
            self.lp_reports[lp_report.report_id] = lp_report
            
            logger.info(f"Generated LP report for {fund.fund_name} - {reporting_period}")
            return lp_report
            
        except Exception as e:
            logger.error(f"Error generating LP report: {e}")
            raise
    
    async def compare_funds_across_vintages(self, fund_ids: List[str]) -> Dict[str, Any]:
        """Compare performance of funds across different vintages"""
        try:
            comparison_data = []
            
            for fund_id in fund_ids:
                fund = self.funds.get(fund_id)
                performance = self.performance_metrics.get(fund_id)
                
                if fund:
                    fund_comparison = {
                        'fund_id': fund_id,
                        'fund_name': fund.fund_name,
                        'vintage_year': fund.vintage_year,
                        'fund_size': fund.fund_size,
                        'fund_type': fund.fund_type,
                        'investment_strategy': fund.investment_strategy,
                        'irr': performance.irr if performance else random.uniform(0.05, 0.25),
                        'tvpi': performance.tvpi if performance else random.uniform(1.2, 2.8),
                        'dpi': performance.dpi if performance else random.uniform(0.3, 1.2),
                        'age_years': datetime.now().year - fund.vintage_year
                    }
                    comparison_data.append(fund_comparison)
            
            # Analyze comparison with AI
            comparison_analysis = await self._analyze_cross_vintage_performance(comparison_data)
            
            # Calculate comparative metrics
            comparative_metrics = self._calculate_comparative_metrics(comparison_data)
            
            return {
                'comparison_id': str(uuid.uuid4()),
                'funds_compared': len(comparison_data),
                'comparison_data': comparison_data,
                'analysis': comparison_analysis,
                'comparative_metrics': comparative_metrics,
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error comparing funds across vintages: {e}")
            raise
    
    async def _update_vintage_group(self, vintage_year: int, fund_id: str):
        """Update vintage group with new fund"""
        try:
            if vintage_year not in self.vintage_groups:
                self.vintage_groups[vintage_year] = VintageGroup(
                    vintage_year=vintage_year,
                    funds_in_vintage=[],
                    total_funds_count=0,
                    total_committed_capital=0,
                    average_fund_size=0,
                    market_conditions={},
                    benchmark_metrics={}
                )
            
            vintage_group = self.vintage_groups[vintage_year]
            if fund_id not in vintage_group.funds_in_vintage:
                vintage_group.funds_in_vintage.append(fund_id)
                vintage_group.total_funds_count += 1
                
                # Recalculate metrics
                vintage_funds = [self.funds[fid] for fid in vintage_group.funds_in_vintage if fid in self.funds]
                vintage_group.total_committed_capital = sum(fund.committed_capital for fund in vintage_funds)
                vintage_group.average_fund_size = vintage_group.total_committed_capital / len(vintage_funds) if vintage_funds else 0
            
        except Exception as e:
            logger.error(f"Error updating vintage group: {e}")
    
    async def _add_fund_to_rag(self, fund: Fund):
        """Add fund information to RAG knowledge base"""
        try:
            fund_content = f"""
            Fund: {fund.fund_name}
            Vintage Year: {fund.vintage_year}
            Fund Size: ${fund.fund_size:,.0f}
            Fund Type: {fund.fund_type}
            Investment Strategy: {fund.investment_strategy}
            Target Sectors: {', '.join(fund.target_sectors)}
            Target Geographies: {', '.join(fund.target_geographies)}
            Fund Manager: {fund.fund_manager}
            Status: {fund.status}
            Inception Date: {fund.inception_date}
            """
            
            add_company_document(
                company_id=fund.fund_id,
                content=fund_content,
                metadata={
                    'document_type': 'fund_profile',
                    'fund_name': fund.fund_name,
                    'vintage_year': fund.vintage_year,
                    'fund_type': fund.fund_type,
                    'fund_size': fund.fund_size,
                    'document_source': 'funds_vintage_management'
                },
                document_id=f"fund_{fund.fund_id}"
            )
            
        except Exception as e:
            logger.error(f"Error adding fund to RAG: {e}")
    
    def _calculate_vintage_performance(self, funds_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate vintage-level performance metrics"""
        try:
            if not funds_data:
                return {}
            
            irrs = [fund['irr'] for fund in funds_data]
            tvpis = [fund['tvpi'] for fund in funds_data]
            dpis = [fund['dpi'] for fund in funds_data]
            
            return {
                'vintage_irr': {
                    'average': statistics.mean(irrs),
                    'median': statistics.median(irrs),
                    'std': statistics.stdev(irrs) if len(irrs) > 1 else 0,
                    'min': min(irrs),
                    'max': max(irrs),
                    'top_quartile': sorted(irrs, reverse=True)[len(irrs)//4] if len(irrs) >= 4 else max(irrs),
                    'bottom_quartile': sorted(irrs)[len(irrs)//4] if len(irrs) >= 4 else min(irrs)
                },
                'vintage_tvpi': {
                    'average': statistics.mean(tvpis),
                    'median': statistics.median(tvpis),
                    'std': statistics.stdev(tvpis) if len(tvpis) > 1 else 0,
                    'min': min(tvpis),
                    'max': max(tvpis)
                },
                'vintage_dpi': {
                    'average': statistics.mean(dpis),
                    'median': statistics.median(dpis),
                    'total_distributions': sum(dpis)
                },
                'fund_count': len(funds_data),
                'outperformers': len([irr for irr in irrs if irr > 0.2]),  # Above 20% IRR
                'underperformers': len([irr for irr in irrs if irr < 0.1])   # Below 10% IRR
            }
            
        except Exception as e:
            logger.error(f"Error calculating vintage performance: {e}")
            return {}
    
    def _generate_market_context(self, vintage_year: int) -> Dict[str, Any]:
        """Generate market context for vintage year"""
        # This would typically pull from external market data sources
        market_context = {
            'economic_environment': 'favorable' if vintage_year >= 2020 else 'challenging',
            'interest_rates': 'low' if vintage_year <= 2022 else 'rising',
            'vc_market_activity': 'high' if 2019 <= vintage_year <= 2021 else 'moderate',
            'ipo_market': 'strong' if vintage_year in [2020, 2021] else 'weak',
            'm_a_activity': 'robust',
            'technology_trends': ['AI/ML', 'SaaS', 'Healthcare Tech', 'Clean Tech'],
            'regulatory_environment': 'stable',
            'geopolitical_factors': ['Trade tensions', 'COVID-19 impact'] if vintage_year in [2020, 2021] else []
        }
        
        return market_context
    
    async def _generate_peer_comparison(self, vintage_year: int, funds_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate peer comparison analysis"""
        try:
            # Mock peer comparison data (in real implementation, would query industry databases)
            peer_data = {
                'industry_benchmarks': {
                    'average_irr': 0.18,
                    'median_irr': 0.16,
                    'top_quartile_irr': 0.25,
                    'average_tvpi': 2.3,
                    'median_tvpi': 2.1
                },
                'vintage_ranking': {
                    'vs_all_vintages': 'Above Median',
                    'vs_peer_vintages': 'Top Quartile',
                    'performance_percentile': 75.0
                },
                'competitive_position': {
                    'outperforming_peers': len([f for f in funds_data if f['irr'] > 0.18]),
                    'underperforming_peers': len([f for f in funds_data if f['irr'] < 0.15]),
                    'market_leaders': [f['fund_name'] for f in sorted(funds_data, key=lambda x: x['irr'], reverse=True)[:3]]
                }
            }
            
            return peer_data
            
        except Exception as e:
            logger.error(f"Error generating peer comparison: {e}")
            return {}
    
    def _calculate_vintage_score(self, vintage_performance: Dict[str, Any], 
                                vintage_analysis: Dict[str, Any]) -> float:
        """Calculate overall vintage score (0-100)"""
        try:
            if not vintage_performance:
                return 50.0
            
            # Performance-based scoring
            avg_irr = vintage_performance.get('vintage_irr', {}).get('average', 0.15)
            avg_tvpi = vintage_performance.get('vintage_tvpi', {}).get('average', 2.0)
            
            irr_score = min(40, (avg_irr / 0.25) * 40)  # 40 points max, 25% IRR = full points
            tvpi_score = min(30, ((avg_tvpi - 1) / 2) * 30)  # 30 points max, 3x TVPI = full points
            
            # Market timing score (simplified)
            timing_score = 20  # Base timing score
            
            # AI analysis confidence
            ai_score = vintage_analysis.get('confidence_score', 0.7) * 10  # 10 points max
            
            total_score = irr_score + tvpi_score + timing_score + ai_score
            return round(min(100, max(0, total_score)), 1)
            
        except Exception as e:
            logger.error(f"Error calculating vintage score: {e}")
            return 50.0
    
    async def _analyze_cross_vintage_performance(self, comparison_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze performance across different vintages"""
        try:
            # Group by vintage year
            vintage_groups = {}
            for fund in comparison_data:
                vintage = fund['vintage_year']
                if vintage not in vintage_groups:
                    vintage_groups[vintage] = []
                vintage_groups[vintage].append(fund)
            
            # Calculate vintage-level metrics
            vintage_metrics = {}
            for vintage, funds in vintage_groups.items():
                irrs = [fund['irr'] for fund in funds]
                vintage_metrics[vintage] = {
                    'fund_count': len(funds),
                    'average_irr': statistics.mean(irrs),
                    'fund_ages': [fund['age_years'] for fund in funds],
                    'average_age': statistics.mean([fund['age_years'] for fund in funds])
                }
            
            # Identify trends
            analysis = {
                'vintage_trends': vintage_metrics,
                'performance_correlation_with_age': self._calculate_age_performance_correlation(comparison_data),
                'best_performing_vintage': max(vintage_metrics.items(), key=lambda x: x[1]['average_irr'])[0],
                'vintage_diversification_benefit': len(vintage_groups) > 1,
                'key_insights': [
                    f"Analyzed {len(comparison_data)} funds across {len(vintage_groups)} vintages",
                    f"Average age: {statistics.mean([fund['age_years'] for fund in comparison_data]):.1f} years",
                    f"Best vintage: {max(vintage_metrics.items(), key=lambda x: x[1]['average_irr'])[0]}"
                ]
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing cross-vintage performance: {e}")
            return {}
    
    def _calculate_age_performance_correlation(self, comparison_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate correlation between fund age and performance"""
        try:
            ages = [fund['age_years'] for fund in comparison_data]
            irrs = [fund['irr'] for fund in comparison_data]
            
            if len(ages) < 2:
                return {'correlation': 0, 'note': 'Insufficient data for correlation analysis'}
            
            # Simple correlation calculation
            mean_age = statistics.mean(ages)
            mean_irr = statistics.mean(irrs)
            
            numerator = sum((age - mean_age) * (irr - mean_irr) for age, irr in zip(ages, irrs))
            denominator = (sum((age - mean_age)**2 for age in ages) * sum((irr - mean_irr)**2 for irr in irrs))**0.5
            
            correlation = numerator / denominator if denominator != 0 else 0
            
            return {
                'correlation': correlation,
                'interpretation': 'positive' if correlation > 0.3 else 'negative' if correlation < -0.3 else 'weak',
                'strength': abs(correlation)
            }
            
        except Exception as e:
            logger.error(f"Error calculating age-performance correlation: {e}")
            return {'correlation': 0, 'error': str(e)}
    
    def _calculate_comparative_metrics(self, comparison_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate comparative metrics across funds"""
        try:
            irrs = [fund['irr'] for fund in comparison_data]
            tvpis = [fund['tvpi'] for fund in comparison_data]
            fund_sizes = [fund['fund_size'] for fund in comparison_data]
            ages = [fund['age_years'] for fund in comparison_data]
            
            return {
                'performance_spread': {
                    'irr_range': max(irrs) - min(irrs),
                    'tvpi_range': max(tvpis) - min(tvpis),
                    'best_performer': max(comparison_data, key=lambda x: x['irr'])['fund_name'],
                    'worst_performer': min(comparison_data, key=lambda x: x['irr'])['fund_name']
                },
                'size_analysis': {
                    'average_fund_size': statistics.mean(fund_sizes),
                    'size_performance_correlation': 'Analysis would require statistical calculation',
                    'largest_fund': max(comparison_data, key=lambda x: x['fund_size'])['fund_name'],
                    'smallest_fund': min(comparison_data, key=lambda x: x['fund_size'])['fund_name']
                },
                'maturity_analysis': {
                    'average_age': statistics.mean(ages),
                    'mature_funds_count': len([age for age in ages if age >= 7]),
                    'young_funds_count': len([age for age in ages if age < 5])
                },
                'diversification_metrics': {
                    'vintage_spread': max(fund['vintage_year'] for fund in comparison_data) - min(fund['vintage_year'] for fund in comparison_data),
                    'strategy_diversity': len(set(fund['investment_strategy'] for fund in comparison_data)),
                    'type_diversity': len(set(fund['fund_type'] for fund in comparison_data))
                }
            }
            
        except Exception as e:
            logger.error(f"Error calculating comparative metrics: {e}")
            return {}
    
    def _create_empty_vintage_report(self, vintage_year: int) -> VintageReport:
        """Create empty vintage report when no funds are available"""
        return VintageReport(
            report_id=str(uuid.uuid4()),
            vintage_year=vintage_year,
            generated_at=datetime.utcnow().isoformat(),
            vintage_summary={'total_funds': 0},
            funds_analysis=[],
            vintage_performance={},
            market_context=self._generate_market_context(vintage_year),
            peer_comparison={},
            lessons_learned=[f'No funds available for {vintage_year} vintage analysis'],
            market_timing_analysis={},
            success_factors=[],
            overall_vintage_score=0.0
        )
    
    def _create_mock_performance(self, fund_id: str) -> PerformanceMetrics:
        """Create mock performance metrics for demo"""
        return PerformanceMetrics(
            fund_id=fund_id,
            as_of_date=datetime.utcnow().isoformat(),
            irr=random.uniform(0.08, 0.25),
            tvpi=random.uniform(1.2, 2.8),
            dpi=random.uniform(0.3, 1.2),
            rvpi=random.uniform(0.5, 2.0),
            multiple=random.uniform(1.5, 3.0),
            quartile_ranking=random.randint(1, 4),
            percentile_ranking=random.uniform(25, 95),
            benchmark_comparison={'vs_benchmark': 'outperforming'}
        )

# Global orchestrator instance
fund_vintage_orchestrator = FundVintageOrchestrator()

# Convenience functions
async def add_fund(fund_data: Dict[str, Any]) -> Fund:
    """Add fund to the system"""
    return await fund_vintage_orchestrator.add_fund(fund_data)

async def update_fund_performance(fund_id: str, performance_data: Dict[str, Any]) -> PerformanceMetrics:
    """Update fund performance metrics"""
    return await fund_vintage_orchestrator.update_fund_performance(fund_id, performance_data)

async def generate_vintage_report(vintage_year: int) -> VintageReport:
    """Generate vintage performance report"""
    return await fund_vintage_orchestrator.generate_vintage_report(vintage_year)

async def generate_lp_report(fund_id: str, reporting_period: str) -> LPReportData:
    """Generate LP report"""
    return await fund_vintage_orchestrator.generate_lp_report(fund_id, reporting_period)

async def compare_funds_across_vintages(fund_ids: List[str]) -> Dict[str, Any]:
    """Compare funds across vintages"""
    return await fund_vintage_orchestrator.compare_funds_across_vintages(fund_ids)