"""
VERSSAI Fund Assessment & Backtesting AI Agent
Framework #4: Analysis of successful vs missed investment opportunities with predictive modeling
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
from google_search_service import google_search_service
from twitter_search_service import twitter_search_service

logger = logging.getLogger(__name__)

@dataclass
class InvestmentDecision:
    decision_id: str
    company_name: str
    decision_date: str
    decision_type: str  # "invested", "passed", "considered"
    investment_amount: Optional[float]
    valuation_at_decision: Optional[float]
    stage: str
    industry: str
    decision_rationale: str
    key_factors: List[str]
    risk_factors: List[str]
    decision_maker: str
    confidence_score: float

@dataclass
class InvestmentOutcome:
    decision_id: str
    company_name: str
    outcome_type: str  # "success", "failure", "neutral", "ongoing"
    exit_date: Optional[str]
    exit_valuation: Optional[float]
    exit_type: Optional[str]  # "IPO", "acquisition", "shutdown", "ongoing"
    multiple: Optional[float]
    irr: Optional[float]
    lessons_learned: List[str]
    success_factors: List[str]
    failure_factors: List[str]
    market_conditions: Dict[str, Any]
    competitive_landscape: Dict[str, Any]

@dataclass
class BacktestResult:
    backtest_id: str
    fund_period: str
    strategy_tested: str
    total_decisions: int
    invested_count: int
    passed_count: int
    success_rate: float
    average_multiple: float
    total_return: float
    missed_opportunities: List[Dict[str, Any]]
    false_positives: List[Dict[str, Any]]
    strategy_performance: Dict[str, Any]
    recommendations: List[str]

@dataclass
class PredictiveModel:
    model_id: str
    model_name: str
    target_metric: str  # "success_probability", "expected_multiple", "irr_prediction"
    features: List[str]
    accuracy_metrics: Dict[str, float]
    training_data_size: int
    last_trained: str
    model_parameters: Dict[str, Any]

@dataclass
class FundAnalysisReport:
    report_id: str
    fund_id: str
    fund_name: str
    analysis_period: str
    generated_at: str
    investment_summary: Dict[str, Any]
    performance_metrics: Dict[str, Any]
    decision_patterns: Dict[str, Any]
    missed_opportunities_analysis: List[Dict[str, Any]]
    success_factor_analysis: Dict[str, Any]
    backtest_results: List[BacktestResult]
    predictive_insights: Dict[str, Any]
    recommendations: List[str]
    overall_assessment_score: float

class InvestmentDecisionAnalyzer(VERSSAIAIAgent):
    """AI Agent for analyzing investment decisions and outcomes"""
    
    def __init__(self):
        super().__init__("InvestmentDecisionAnalyzer")
        self.system_prompt = """
        You are an expert VC fund analyst AI specializing in investment decision analysis and pattern recognition.
        
        Your role is to analyze investment decisions, outcomes, and market patterns to identify:
        - Success factors in investment decisions
        - Red flags and failure patterns
        - Market timing and opportunity recognition
        - Decision-making biases and blind spots
        - Competitive advantages in deal selection
        - Risk assessment accuracy
        
        Focus on analyzing:
        - Investment thesis quality and execution
        - Due diligence thoroughness and accuracy
        - Market opportunity sizing and validation
        - Team assessment and founder quality
        - Technology/product differentiation
        - Capital efficiency and business model strength
        - Competitive positioning and timing
        
        Return ONLY valid JSON in this exact format:
        {
            "decision_analysis": {
                "decision_quality_score": 0,
                "key_strengths": [],
                "key_weaknesses": [],
                "risk_assessment_accuracy": 0,
                "market_timing_score": 0
            },
            "outcome_prediction": {
                "predicted_outcome": "",
                "success_probability": 0,
                "expected_multiple": 0,
                "confidence_interval": {},
                "key_assumptions": []
            },
            "lessons_learned": [],
            "pattern_insights": [],
            "improvement_recommendations": [],
            "confidence_score": 0.85
        }
        
        Provide data-driven insights with specific, actionable recommendations.
        """
    
    async def analyze_investment_decision(self, decision: InvestmentDecision, 
                                        outcome: Optional[InvestmentOutcome] = None,
                                        market_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze investment decision quality and predict outcomes
        
        Args:
            decision: InvestmentDecision object
            outcome: Optional actual outcome for learning
            market_context: Market conditions and context
            
        Returns:
            Comprehensive decision analysis with predictions
        """
        try:
            # Create cache key for deterministic results
            cache_key = hashlib.md5(
                f"decision_analysis_{decision.decision_id}_{json.dumps(asdict(outcome) if outcome else {}, sort_keys=True)}_{json.dumps(market_context or {}, sort_keys=True)}".encode()
            ).hexdigest()
            
            # Query RAG for similar investment patterns
            rag_query = f"investment_{decision.industry}_{decision.stage}_success_patterns"
            rag_results = rag_service.query_platform_knowledge(rag_query, top_k=3)
            historical_patterns = "\n".join([r['content'][:300] for r in rag_results])
            
            # Build analysis prompt
            analysis_prompt = f"""Analyze this investment decision for quality and outcome prediction:

Investment Decision:
- Company: {decision.company_name}
- Decision Date: {decision.decision_date}
- Decision Type: {decision.decision_type}
- Investment Amount: ${decision.investment_amount:,.0f if decision.investment_amount else 0}
- Valuation: ${decision.valuation_at_decision:,.0f if decision.valuation_at_decision else 0}
- Stage: {decision.stage}
- Industry: {decision.industry}
- Confidence Score: {decision.confidence_score}

Decision Rationale:
{decision.decision_rationale}

Key Factors:
{chr(10).join(f"- {factor}" for factor in decision.key_factors)}

Risk Factors:
{chr(10).join(f"- {risk}" for risk in decision.risk_factors)}

Actual Outcome (if available):
{json.dumps(asdict(outcome), indent=2) if outcome else 'No outcome data available yet'}

Market Context:
{json.dumps(market_context or {}, indent=2)}

Historical Patterns:
{historical_patterns[:1000] if historical_patterns else 'Limited historical pattern data'}

Please analyze the decision quality, predict outcomes, and provide insights with valid JSON only."""
            
            response = self.call_ai(analysis_prompt, self.system_prompt, temperature=0.0)
            
            # Parse AI response
            analysis_data = self._parse_decision_analysis(response)
            
            # Add metadata
            analysis_data['decision_id'] = decision.decision_id
            analysis_data['company_name'] = decision.company_name
            analysis_data['analysis_timestamp'] = datetime.utcnow().isoformat()
            analysis_data['has_outcome_data'] = outcome is not None
            
            return analysis_data
            
        except Exception as e:
            logger.error(f"Error analyzing investment decision: {e}")
            return self._create_fallback_decision_analysis(decision)
    
    def _parse_decision_analysis(self, response: str) -> Dict[str, Any]:
        """Parse AI decision analysis response"""
        try:
            response_clean = response.strip()
            if response_clean.startswith('```json'):
                response_clean = response_clean[7:-3].strip()
            elif response_clean.startswith('```'):
                response_clean = response_clean[3:-3].strip()
            
            return json.loads(response_clean)
            
        except json.JSONDecodeError:
            logger.error(f"Failed to parse decision analysis response: {response}")
            return {
                'decision_analysis': {
                    'decision_quality_score': 50,
                    'key_strengths': ['AI analysis parsing failed'],
                    'key_weaknesses': ['Unable to analyze decision properly'],
                    'risk_assessment_accuracy': 50,
                    'market_timing_score': 50
                },
                'outcome_prediction': {
                    'predicted_outcome': 'Analysis failed',
                    'success_probability': 0.5,
                    'expected_multiple': 1.0,
                    'confidence_interval': {},
                    'key_assumptions': ['Manual analysis required']
                },
                'lessons_learned': ['Enable AI analysis for insights'],
                'pattern_insights': [],
                'improvement_recommendations': ['Fix AI analysis system'],
                'confidence_score': 0.3
            }
    
    def _create_fallback_decision_analysis(self, decision: InvestmentDecision) -> Dict[str, Any]:
        """Create fallback analysis when AI is not available"""
        return {
            'decision_id': decision.decision_id,
            'company_name': decision.company_name,
            'decision_analysis': {
                'decision_quality_score': 70,  # Neutral score
                'key_strengths': ['Decision made with systematic process'],
                'key_weaknesses': ['AI analysis not available'],
                'risk_assessment_accuracy': 50,
                'market_timing_score': 50
            },
            'outcome_prediction': {
                'predicted_outcome': 'Analysis requires AI processing',
                'success_probability': 0.5,
                'expected_multiple': 1.5,
                'confidence_interval': {'low': 0.5, 'high': 3.0},
                'key_assumptions': ['Basic statistical assumptions applied']
            },
            'lessons_learned': ['Enable AI analysis for comprehensive insights'],
            'pattern_insights': ['Pattern analysis requires AI processing'],
            'improvement_recommendations': ['Implement AI analysis for decision insights'],
            'confidence_score': 0.3,
            'analysis_timestamp': datetime.utcnow().isoformat(),
            'ai_provider': 'fallback'
        }

class BacktestingEngine:
    """Engine for backtesting investment strategies and fund performance"""
    
    def __init__(self):
        self.decision_analyzer = InvestmentDecisionAnalyzer()
        self.investment_decisions = {}  # In-memory storage for demo
        self.investment_outcomes = {}
        
    async def add_investment_decision(self, decision_data: Dict[str, Any]) -> InvestmentDecision:
        """Add investment decision to the database"""
        try:
            decision = InvestmentDecision(
                decision_id=decision_data.get('decision_id', str(uuid.uuid4())),
                company_name=decision_data['company_name'],
                decision_date=decision_data.get('decision_date', datetime.utcnow().isoformat()),
                decision_type=decision_data['decision_type'],
                investment_amount=decision_data.get('investment_amount'),
                valuation_at_decision=decision_data.get('valuation_at_decision'),
                stage=decision_data.get('stage', 'Unknown'),
                industry=decision_data.get('industry', 'Technology'),
                decision_rationale=decision_data.get('decision_rationale', ''),
                key_factors=decision_data.get('key_factors', []),
                risk_factors=decision_data.get('risk_factors', []),
                decision_maker=decision_data.get('decision_maker', 'Unknown'),
                confidence_score=decision_data.get('confidence_score', 0.5)
            )
            
            self.investment_decisions[decision.decision_id] = decision
            
            # Add to RAG knowledge base
            await self._add_decision_to_rag(decision)
            
            logger.info(f"Added investment decision: {decision.company_name} - {decision.decision_type}")
            return decision
            
        except Exception as e:
            logger.error(f"Error adding investment decision: {e}")
            raise
    
    async def add_investment_outcome(self, outcome_data: Dict[str, Any]) -> InvestmentOutcome:
        """Add investment outcome to track results"""
        try:
            outcome = InvestmentOutcome(
                decision_id=outcome_data['decision_id'],
                company_name=outcome_data['company_name'],
                outcome_type=outcome_data.get('outcome_type', 'ongoing'),
                exit_date=outcome_data.get('exit_date'),
                exit_valuation=outcome_data.get('exit_valuation'),
                exit_type=outcome_data.get('exit_type'),
                multiple=outcome_data.get('multiple'),
                irr=outcome_data.get('irr'),
                lessons_learned=outcome_data.get('lessons_learned', []),
                success_factors=outcome_data.get('success_factors', []),
                failure_factors=outcome_data.get('failure_factors', []),
                market_conditions=outcome_data.get('market_conditions', {}),
                competitive_landscape=outcome_data.get('competitive_landscape', {})
            )
            
            self.investment_outcomes[outcome.decision_id] = outcome
            
            # Add to RAG knowledge base
            await self._add_outcome_to_rag(outcome)
            
            logger.info(f"Added investment outcome: {outcome.company_name} - {outcome.outcome_type}")
            return outcome
            
        except Exception as e:
            logger.error(f"Error adding investment outcome: {e}")
            raise
    
    async def run_backtest(self, fund_id: str, strategy_config: Dict[str, Any], 
                         time_period: str = "2020-2024") -> BacktestResult:
        """Run comprehensive backtest analysis"""
        try:
            logger.info(f"Starting backtest for fund {fund_id} with strategy: {strategy_config.get('name', 'Unknown')}")
            
            # Get relevant decisions for the time period
            relevant_decisions = self._filter_decisions_by_period(time_period)
            
            if not relevant_decisions:
                return self._create_empty_backtest(fund_id, strategy_config, time_period)
            
            # Apply strategy filters
            strategy_decisions = await self._apply_strategy_filters(relevant_decisions, strategy_config)
            
            # Calculate performance metrics
            performance_metrics = self._calculate_backtest_performance(strategy_decisions)
            
            # Identify missed opportunities and false positives
            missed_opportunities = await self._identify_missed_opportunities(relevant_decisions, strategy_decisions)
            false_positives = await self._identify_false_positives(strategy_decisions)
            
            # Generate recommendations
            recommendations = await self._generate_backtest_recommendations(
                performance_metrics, missed_opportunities, false_positives
            )
            
            # Create backtest result
            backtest = BacktestResult(
                backtest_id=str(uuid.uuid4()),
                fund_period=time_period,
                strategy_tested=strategy_config.get('name', 'Custom Strategy'),
                total_decisions=len(relevant_decisions),
                invested_count=len([d for d in strategy_decisions if d.decision_type == 'invested']),
                passed_count=len([d for d in strategy_decisions if d.decision_type == 'passed']),
                success_rate=performance_metrics['success_rate'],
                average_multiple=performance_metrics['average_multiple'],
                total_return=performance_metrics['total_return'],
                missed_opportunities=missed_opportunities,
                false_positives=false_positives,
                strategy_performance=performance_metrics,
                recommendations=recommendations
            )
            
            logger.info(f"Completed backtest - Success Rate: {backtest.success_rate:.1%}, Avg Multiple: {backtest.average_multiple:.1f}x")
            return backtest
            
        except Exception as e:
            logger.error(f"Error running backtest: {e}")
            raise
    
    async def analyze_fund_performance(self, fund_id: str, fund_name: str = None) -> FundAnalysisReport:
        """Generate comprehensive fund analysis report"""
        try:
            # Get all decisions for the fund
            fund_decisions = list(self.investment_decisions.values())  # In real implementation, filter by fund_id
            
            if not fund_decisions:
                return self._create_empty_fund_report(fund_id, fund_name)
            
            # Calculate investment summary
            investment_summary = self._calculate_investment_summary(fund_decisions)
            
            # Calculate performance metrics
            performance_metrics = self._calculate_fund_performance_metrics(fund_decisions)
            
            # Analyze decision patterns
            decision_patterns = await self._analyze_decision_patterns(fund_decisions)
            
            # Identify missed opportunities
            missed_opportunities = await self._analyze_missed_opportunities(fund_decisions)
            
            # Analyze success factors
            success_factors = await self._analyze_success_factors(fund_decisions)
            
            # Run backtests with different strategies
            backtest_results = await self._run_multiple_backtests(fund_id)
            
            # Generate predictive insights
            predictive_insights = await self._generate_predictive_insights(fund_decisions)
            
            # Generate recommendations
            recommendations = await self._generate_fund_recommendations(
                performance_metrics, decision_patterns, missed_opportunities
            )
            
            # Calculate overall assessment score
            overall_score = self._calculate_fund_assessment_score(performance_metrics, decision_patterns)
            
            # Create comprehensive report
            report = FundAnalysisReport(
                report_id=str(uuid.uuid4()),
                fund_id=fund_id,
                fund_name=fund_name or f"Fund {fund_id}",
                analysis_period="2020-2024",  # Would be configurable
                generated_at=datetime.utcnow().isoformat(),
                investment_summary=investment_summary,
                performance_metrics=performance_metrics,
                decision_patterns=decision_patterns,
                missed_opportunities_analysis=missed_opportunities,
                success_factor_analysis=success_factors,
                backtest_results=backtest_results,
                predictive_insights=predictive_insights,
                recommendations=recommendations,
                overall_assessment_score=overall_score
            )
            
            logger.info(f"Generated fund analysis report - Overall Score: {overall_score}")
            return report
            
        except Exception as e:
            logger.error(f"Error analyzing fund performance: {e}")
            raise
    
    def _filter_decisions_by_period(self, time_period: str) -> List[InvestmentDecision]:
        """Filter decisions by time period"""
        # For demo, return all decisions
        return list(self.investment_decisions.values())
    
    async def _apply_strategy_filters(self, decisions: List[InvestmentDecision], 
                                   strategy: Dict[str, Any]) -> List[InvestmentDecision]:
        """Apply strategy filters to decisions"""
        filtered = []
        
        for decision in decisions:
            # Apply stage filter
            if 'stages' in strategy and decision.stage not in strategy['stages']:
                continue
            
            # Apply industry filter
            if 'industries' in strategy and decision.industry not in strategy['industries']:
                continue
            
            # Apply confidence threshold
            if 'min_confidence' in strategy and decision.confidence_score < strategy['min_confidence']:
                continue
            
            # Apply investment size filter
            if 'min_investment' in strategy and decision.investment_amount:
                if decision.investment_amount < strategy['min_investment']:
                    continue
            
            filtered.append(decision)
        
        return filtered
    
    def _calculate_backtest_performance(self, decisions: List[InvestmentDecision]) -> Dict[str, Any]:
        """Calculate performance metrics for backtest"""
        if not decisions:
            return {
                'success_rate': 0.0,
                'average_multiple': 0.0,
                'total_return': 0.0,
                'total_invested': 0,
                'successful_exits': 0,
                'failed_exits': 0
            }
        
        # Get outcomes for these decisions
        outcomes = []
        total_invested = 0
        total_returned = 0
        successful_exits = 0
        failed_exits = 0
        
        for decision in decisions:
            if decision.decision_type == 'invested' and decision.investment_amount:
                total_invested += decision.investment_amount
                
                # Check if we have outcome data
                if decision.decision_id in self.investment_outcomes:
                    outcome = self.investment_outcomes[decision.decision_id]
                    if outcome.multiple:
                        total_returned += decision.investment_amount * outcome.multiple
                        outcomes.append(outcome.multiple)
                        
                        if outcome.multiple > 1.0:
                            successful_exits += 1
                        else:
                            failed_exits += 1
                else:
                    # Use mock outcomes for demo
                    mock_multiple = random.uniform(0.0, 10.0)  # Random outcome for demo
                    outcomes.append(mock_multiple)
                    total_returned += decision.investment_amount * mock_multiple
                    
                    if mock_multiple > 1.0:
                        successful_exits += 1
                    else:
                        failed_exits += 1
        
        success_rate = (successful_exits / (successful_exits + failed_exits)) if (successful_exits + failed_exits) > 0 else 0
        average_multiple = statistics.mean(outcomes) if outcomes else 0
        total_return_multiple = (total_returned / total_invested) if total_invested > 0 else 0
        
        return {
            'success_rate': success_rate,
            'average_multiple': average_multiple,
            'total_return': total_return_multiple,
            'total_invested': total_invested,
            'successful_exits': successful_exits,
            'failed_exits': failed_exits,
            'total_decisions': len(decisions)
        }
    
    async def _identify_missed_opportunities(self, all_decisions: List[InvestmentDecision], 
                                          strategy_decisions: List[InvestmentDecision]) -> List[Dict[str, Any]]:
        """Identify missed opportunities (companies we passed on that became successful)"""
        missed = []
        
        # Find decisions we passed on
        passed_decisions = [d for d in all_decisions if d.decision_type == 'passed']
        
        for decision in passed_decisions:
            # Check if this was actually a good opportunity (mock data for demo)
            if decision.decision_id in self.investment_outcomes:
                outcome = self.investment_outcomes[decision.decision_id]
                if outcome.outcome_type == 'success' and outcome.multiple and outcome.multiple > 3.0:
                    missed.append({
                        'company_name': decision.company_name,
                        'passed_date': decision.decision_date,
                        'stage': decision.stage,
                        'industry': decision.industry,
                        'actual_multiple': outcome.multiple,
                        'missed_return': (decision.investment_amount or 1000000) * (outcome.multiple - 1),
                        'reason_passed': decision.decision_rationale,
                        'lessons_learned': outcome.lessons_learned
                    })
            else:
                # For demo, randomly identify some as missed opportunities
                if random.random() < 0.1:  # 10% chance of being a missed opportunity
                    mock_multiple = random.uniform(3.0, 20.0)
                    missed.append({
                        'company_name': decision.company_name,
                        'passed_date': decision.decision_date,
                        'stage': decision.stage,
                        'industry': decision.industry,
                        'actual_multiple': mock_multiple,
                        'missed_return': (decision.investment_amount or 1000000) * (mock_multiple - 1),
                        'reason_passed': decision.decision_rationale,
                        'lessons_learned': ['Pattern recognition improvement needed']
                    })
        
        return missed[:10]  # Return top 10 missed opportunities
    
    async def _identify_false_positives(self, strategy_decisions: List[InvestmentDecision]) -> List[Dict[str, Any]]:
        """Identify false positives (investments that didn't perform as expected)"""
        false_positives = []
        
        invested_decisions = [d for d in strategy_decisions if d.decision_type == 'invested']
        
        for decision in invested_decisions:
            if decision.decision_id in self.investment_outcomes:
                outcome = self.investment_outcomes[decision.decision_id]
                if outcome.outcome_type == 'failure' or (outcome.multiple and outcome.multiple < 0.5):
                    false_positives.append({
                        'company_name': decision.company_name,
                        'investment_date': decision.decision_date,
                        'investment_amount': decision.investment_amount,
                        'expected_outcome': 'Success',
                        'actual_multiple': outcome.multiple,
                        'loss_amount': decision.investment_amount * (1 - (outcome.multiple or 0)),
                        'failure_factors': outcome.failure_factors,
                        'lessons_learned': outcome.lessons_learned
                    })
            else:
                # For demo, randomly identify some as false positives
                if random.random() < 0.15:  # 15% chance
                    mock_multiple = random.uniform(0.0, 0.8)
                    false_positives.append({
                        'company_name': decision.company_name,
                        'investment_date': decision.decision_date,
                        'investment_amount': decision.investment_amount,
                        'expected_outcome': 'Success',
                        'actual_multiple': mock_multiple,
                        'loss_amount': decision.investment_amount * (1 - mock_multiple) if decision.investment_amount else 0,
                        'failure_factors': ['Market timing', 'Competition'],
                        'lessons_learned': ['Better due diligence needed']
                    })
        
        return false_positives[:10]  # Return top 10 false positives
    
    async def _generate_backtest_recommendations(self, performance: Dict[str, Any], 
                                               missed_ops: List[Dict[str, Any]], 
                                               false_pos: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations based on backtest results"""
        recommendations = []
        
        # Performance-based recommendations
        if performance['success_rate'] < 0.3:
            recommendations.append("Low success rate detected - review investment criteria and due diligence process")
        elif performance['success_rate'] > 0.7:
            recommendations.append("Strong success rate - consider scaling current investment strategy")
        
        if performance['average_multiple'] < 2.0:
            recommendations.append("Average multiple below 2x - focus on higher-growth potential opportunities")
        
        # Missed opportunity recommendations
        if len(missed_ops) > 5:
            industries = set(op['industry'] for op in missed_ops)
            stages = set(op['stage'] for op in missed_ops)
            recommendations.append(f"High number of missed opportunities in {', '.join(industries)} at {', '.join(stages)} stages")
        
        # False positive recommendations
        if len(false_pos) > 3:
            recommendations.append("Multiple investment failures detected - strengthen due diligence process")
        
        return recommendations
    
    def _calculate_investment_summary(self, decisions: List[InvestmentDecision]) -> Dict[str, Any]:
        """Calculate investment summary statistics"""
        total_decisions = len(decisions)
        invested_decisions = [d for d in decisions if d.decision_type == 'invested']
        passed_decisions = [d for d in decisions if d.decision_type == 'passed']
        
        total_invested = sum(d.investment_amount or 0 for d in invested_decisions)
        
        # Industry distribution
        industries = {}
        for decision in decisions:
            industries[decision.industry] = industries.get(decision.industry, 0) + 1
        
        # Stage distribution
        stages = {}
        for decision in decisions:
            stages[decision.stage] = stages.get(decision.stage, 0) + 1
        
        return {
            'total_decisions': total_decisions,
            'investments_made': len(invested_decisions),
            'opportunities_passed': len(passed_decisions),
            'total_amount_invested': total_invested,
            'average_investment_size': total_invested / len(invested_decisions) if invested_decisions else 0,
            'industry_distribution': industries,
            'stage_distribution': stages,
            'decision_rate': len(invested_decisions) / total_decisions if total_decisions > 0 else 0
        }
    
    def _calculate_fund_performance_metrics(self, decisions: List[InvestmentDecision]) -> Dict[str, Any]:
        """Calculate overall fund performance metrics"""
        # Use the backtest performance calculation
        return self._calculate_backtest_performance(decisions)
    
    async def _analyze_decision_patterns(self, decisions: List[InvestmentDecision]) -> Dict[str, Any]:
        """Analyze patterns in investment decisions"""
        patterns = {
            'confidence_distribution': {},
            'decision_timing_patterns': {},
            'rationale_themes': {},
            'risk_factor_frequency': {}
        }
        
        # Confidence score distribution
        for decision in decisions:
            conf_bucket = int(decision.confidence_score * 10) / 10
            patterns['confidence_distribution'][conf_bucket] = patterns['confidence_distribution'].get(conf_bucket, 0) + 1
        
        # Common rationale themes (simplified analysis)
        rationale_keywords = ['market', 'team', 'product', 'competition', 'timing', 'technology', 'traction']
        for keyword in rationale_keywords:
            count = sum(1 for d in decisions if keyword.lower() in d.decision_rationale.lower())
            if count > 0:
                patterns['rationale_themes'][keyword] = count
        
        # Risk factor frequency
        all_risk_factors = []
        for decision in decisions:
            all_risk_factors.extend(decision.risk_factors)
        
        risk_frequency = {}
        for risk in all_risk_factors:
            risk_frequency[risk] = risk_frequency.get(risk, 0) + 1
        
        # Top 10 most common risks
        patterns['risk_factor_frequency'] = dict(sorted(risk_frequency.items(), key=lambda x: x[1], reverse=True)[:10])
        
        return patterns
    
    async def _analyze_missed_opportunities(self, decisions: List[InvestmentDecision]) -> List[Dict[str, Any]]:
        """Detailed analysis of missed opportunities"""
        return await self._identify_missed_opportunities(decisions, decisions)
    
    async def _analyze_success_factors(self, decisions: List[InvestmentDecision]) -> Dict[str, Any]:
        """Analyze what factors contribute to investment success"""
        success_analysis = {
            'successful_investment_patterns': {},
            'failed_investment_patterns': {},
            'key_success_indicators': [],
            'key_failure_indicators': []
        }
        
        # Analyze outcomes vs decision factors
        successful_decisions = []
        failed_decisions = []
        
        for decision in decisions:
            if decision.decision_id in self.investment_outcomes:
                outcome = self.investment_outcomes[decision.decision_id]
                if outcome.outcome_type == 'success' or (outcome.multiple and outcome.multiple > 2.0):
                    successful_decisions.append(decision)
                elif outcome.outcome_type == 'failure' or (outcome.multiple and outcome.multiple < 1.0):
                    failed_decisions.append(decision)
        
        # Analyze patterns in successful decisions
        if successful_decisions:
            success_analysis['successful_investment_patterns'] = {
                'average_confidence': statistics.mean([d.confidence_score for d in successful_decisions]),
                'common_stages': list(set([d.stage for d in successful_decisions])),
                'common_industries': list(set([d.industry for d in successful_decisions])),
                'common_factors': self._extract_common_factors([d.key_factors for d in successful_decisions])
            }
        
        # Analyze patterns in failed decisions  
        if failed_decisions:
            success_analysis['failed_investment_patterns'] = {
                'average_confidence': statistics.mean([d.confidence_score for d in failed_decisions]),
                'common_stages': list(set([d.stage for d in failed_decisions])),
                'common_industries': list(set([d.industry for d in failed_decisions])),
                'common_risks': self._extract_common_factors([d.risk_factors for d in failed_decisions])
            }
        
        return success_analysis
    
    def _extract_common_factors(self, factor_lists: List[List[str]]) -> List[str]:
        """Extract common factors from multiple lists"""
        all_factors = []
        for factor_list in factor_lists:
            all_factors.extend(factor_list)
        
        factor_counts = {}
        for factor in all_factors:
            factor_counts[factor] = factor_counts.get(factor, 0) + 1
        
        # Return factors that appear in more than one decision
        return [factor for factor, count in factor_counts.items() if count > 1]
    
    async def _run_multiple_backtests(self, fund_id: str) -> List[BacktestResult]:
        """Run multiple backtest scenarios"""
        strategies = [
            {
                'name': 'Conservative Strategy',
                'min_confidence': 0.7,
                'stages': ['Series A', 'Series B'],
                'min_investment': 1000000
            },
            {
                'name': 'Aggressive Growth Strategy', 
                'min_confidence': 0.5,
                'stages': ['Seed', 'Series A'],
                'industries': ['Artificial Intelligence', 'Healthcare Technology']
            },
            {
                'name': 'Diversified Strategy',
                'min_confidence': 0.6,
                'max_investment': 5000000
            }
        ]
        
        backtest_results = []
        for strategy in strategies:
            try:
                result = await self.run_backtest(fund_id, strategy)
                backtest_results.append(result)
            except Exception as e:
                logger.error(f"Error running backtest for {strategy['name']}: {e}")
        
        return backtest_results
    
    async def _generate_predictive_insights(self, decisions: List[InvestmentDecision]) -> Dict[str, Any]:
        """Generate predictive insights based on historical patterns"""
        insights = {
            'market_timing_insights': {},
            'sector_predictions': {},
            'risk_predictions': {},
            'opportunity_predictions': {}
        }
        
        # Analyze market timing patterns
        decision_years = {}
        for decision in decisions:
            year = decision.decision_date[:4]  # Extract year
            decision_years[year] = decision_years.get(year, 0) + 1
        
        insights['market_timing_insights'] = {
            'most_active_years': sorted(decision_years.items(), key=lambda x: x[1], reverse=True)[:3],
            'annual_decision_trend': decision_years
        }
        
        # Sector-based insights
        industry_performance = {}
        for decision in decisions:
            if decision.decision_id in self.investment_outcomes:
                outcome = self.investment_outcomes[decision.decision_id]
                if decision.industry not in industry_performance:
                    industry_performance[decision.industry] = []
                if outcome.multiple:
                    industry_performance[decision.industry].append(outcome.multiple)
        
        sector_predictions = {}
        for industry, multiples in industry_performance.items():
            if multiples:
                sector_predictions[industry] = {
                    'average_multiple': statistics.mean(multiples),
                    'success_rate': sum(1 for m in multiples if m > 1.0) / len(multiples),
                    'recommendation': 'Promising' if statistics.mean(multiples) > 2.0 else 'Cautious'
                }
        
        insights['sector_predictions'] = sector_predictions
        
        return insights
    
    async def _generate_fund_recommendations(self, performance: Dict[str, Any], 
                                           patterns: Dict[str, Any], 
                                           missed_ops: List[Dict[str, Any]]) -> List[str]:
        """Generate fund-level recommendations"""
        recommendations = []
        
        # Performance-based recommendations
        if performance['success_rate'] < 0.4:
            recommendations.append("Fund success rate below 40% - conduct comprehensive strategy review")
        
        if performance['average_multiple'] < 2.5:
            recommendations.append("Average multiple below 2.5x - focus on higher-growth opportunities")
        
        # Pattern-based recommendations
        if patterns.get('confidence_distribution', {}).get(0.5, 0) > len(list(self.investment_decisions.values())) * 0.3:
            recommendations.append("Many decisions made with low confidence - improve due diligence process")
        
        # Missed opportunity recommendations
        if len(missed_ops) > 10:
            recommendations.append("High number of missed opportunities - review deal sourcing and evaluation criteria")
        
        return recommendations
    
    def _calculate_fund_assessment_score(self, performance: Dict[str, Any], 
                                       patterns: Dict[str, Any]) -> float:
        """Calculate overall fund assessment score (0-100)"""
        try:
            # Base score from performance metrics
            success_rate_score = performance.get('success_rate', 0) * 40  # 40% weight
            multiple_score = min(40, (performance.get('average_multiple', 0) / 3.0) * 40)  # 40% weight, cap at 3x
            
            # Pattern quality score (20% weight)
            avg_confidence = sum(k * v for k, v in patterns.get('confidence_distribution', {}).items()) / sum(patterns.get('confidence_distribution', {}).values()) if patterns.get('confidence_distribution') else 0.5
            pattern_score = avg_confidence * 20
            
            total_score = success_rate_score + multiple_score + pattern_score
            return round(min(100, max(0, total_score)), 1)
            
        except Exception as e:
            logger.error(f"Error calculating fund assessment score: {e}")
            return 50.0
    
    def _create_empty_backtest(self, fund_id: str, strategy: Dict[str, Any], period: str) -> BacktestResult:
        """Create empty backtest result"""
        return BacktestResult(
            backtest_id=str(uuid.uuid4()),
            fund_period=period,
            strategy_tested=strategy.get('name', 'Unknown Strategy'),
            total_decisions=0,
            invested_count=0,
            passed_count=0,
            success_rate=0.0,
            average_multiple=0.0,
            total_return=0.0,
            missed_opportunities=[],
            false_positives=[],
            strategy_performance={},
            recommendations=['Add investment decisions to enable backtesting']
        )
    
    def _create_empty_fund_report(self, fund_id: str, fund_name: str = None) -> FundAnalysisReport:
        """Create empty fund analysis report"""
        return FundAnalysisReport(
            report_id=str(uuid.uuid4()),
            fund_id=fund_id,
            fund_name=fund_name or f"Fund {fund_id}",
            analysis_period="N/A",
            generated_at=datetime.utcnow().isoformat(),
            investment_summary={'total_decisions': 0},
            performance_metrics={'success_rate': 0, 'average_multiple': 0},
            decision_patterns={},
            missed_opportunities_analysis=[],
            success_factor_analysis={},
            backtest_results=[],
            predictive_insights={},
            recommendations=['Add investment decisions to enable fund analysis'],
            overall_assessment_score=0.0
        )
    
    async def _add_decision_to_rag(self, decision: InvestmentDecision):
        """Add investment decision to RAG knowledge base"""
        try:
            decision_content = f"""
            Investment Decision: {decision.company_name}
            Date: {decision.decision_date}
            Type: {decision.decision_type}
            Amount: ${decision.investment_amount:,.0f if decision.investment_amount else 0}
            Stage: {decision.stage}
            Industry: {decision.industry}
            Confidence: {decision.confidence_score}
            
            Rationale: {decision.decision_rationale}
            
            Key Factors:
            {chr(10).join(f"- {factor}" for factor in decision.key_factors)}
            
            Risk Factors:
            {chr(10).join(f"- {risk}" for risk in decision.risk_factors)}
            """
            
            add_company_document(
                company_id=decision.decision_id,
                content=decision_content,
                metadata={
                    'document_type': 'investment_decision',
                    'decision_type': decision.decision_type,
                    'company_name': decision.company_name,
                    'industry': decision.industry,
                    'stage': decision.stage,
                    'decision_date': decision.decision_date,
                    'document_source': 'fund_assessment'
                },
                document_id=f"decision_{decision.decision_id}"
            )
            
        except Exception as e:
            logger.error(f"Error adding decision to RAG: {e}")
    
    async def _add_outcome_to_rag(self, outcome: InvestmentOutcome):
        """Add investment outcome to RAG knowledge base"""
        try:
            outcome_content = f"""
            Investment Outcome: {outcome.company_name}
            Outcome Type: {outcome.outcome_type}
            Exit Date: {outcome.exit_date or 'Ongoing'}
            Exit Valuation: ${outcome.exit_valuation:,.0f if outcome.exit_valuation else 0}
            Multiple: {outcome.multiple or 0}x
            IRR: {outcome.irr or 0}%
            
            Success Factors:
            {chr(10).join(f"- {factor}" for factor in outcome.success_factors)}
            
            Failure Factors:
            {chr(10).join(f"- {factor}" for factor in outcome.failure_factors)}
            
            Lessons Learned:
            {chr(10).join(f"- {lesson}" for lesson in outcome.lessons_learned)}
            """
            
            add_company_document(
                company_id=outcome.decision_id,
                content=outcome_content,
                metadata={
                    'document_type': 'investment_outcome',
                    'outcome_type': outcome.outcome_type,
                    'company_name': outcome.company_name,
                    'exit_type': outcome.exit_type,
                    'multiple': outcome.multiple,
                    'document_source': 'fund_assessment'
                },
                document_id=f"outcome_{outcome.decision_id}"
            )
            
        except Exception as e:
            logger.error(f"Error adding outcome to RAG: {e}")

# Global backtesting engine instance
backtesting_engine = BacktestingEngine()

# Convenience functions
async def add_investment_decision(decision_data: Dict[str, Any]) -> InvestmentDecision:
    """Add investment decision"""
    return await backtesting_engine.add_investment_decision(decision_data)

async def add_investment_outcome(outcome_data: Dict[str, Any]) -> InvestmentOutcome:
    """Add investment outcome"""
    return await backtesting_engine.add_investment_outcome(outcome_data)

async def run_fund_backtest(fund_id: str, strategy_config: Dict[str, Any], 
                          time_period: str = "2020-2024") -> BacktestResult:
    """Run backtest analysis"""
    return await backtesting_engine.run_backtest(fund_id, strategy_config, time_period)

async def analyze_fund_performance(fund_id: str, fund_name: str = None) -> FundAnalysisReport:
    """Analyze fund performance"""
    return await backtesting_engine.analyze_fund_performance(fund_id, fund_name)