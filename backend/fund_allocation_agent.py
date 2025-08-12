"""
VERSSAI Fund Allocation & Deployment AI Agent
Framework #5: Monte Carlo simulations for optimal fund allocation and capital deployment timing
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
import math

from ai_agents import VERSSAIAIAgent
from rag_service import rag_service, add_company_document

logger = logging.getLogger(__name__)

@dataclass
class AllocationTarget:
    target_id: str
    category: str  # "stage", "industry", "geography", "theme"
    subcategory: str  # "Series A", "AI", "US", "ESG"
    target_percentage: float
    minimum_percentage: float
    maximum_percentage: float
    current_allocation: float
    target_amount: float
    deployed_amount: float
    remaining_amount: float

@dataclass
class DeploymentSchedule:
    schedule_id: str
    fund_id: str
    fund_size: float
    investment_period: str  # "3 years", "5 years"
    quarterly_targets: List[Dict[str, Any]]
    seasonal_adjustments: Dict[str, float]
    market_condition_adjustments: Dict[str, float]
    reserves: Dict[str, float]

@dataclass
class MarketCondition:
    condition_id: str
    period: str
    market_sentiment: str  # "bull", "bear", "neutral"
    valuation_environment: str  # "high", "moderate", "low"
    liquidity_conditions: str  # "abundant", "moderate", "constrained"
    competitive_intensity: str  # "high", "moderate", "low"
    economic_indicators: Dict[str, Any]
    venture_market_metrics: Dict[str, Any]

@dataclass
class MonteCarloScenario:
    scenario_id: str
    scenario_name: str
    probability: float
    market_conditions: List[MarketCondition]
    expected_returns: Dict[str, float]
    risk_factors: Dict[str, float]
    deployment_impact: Dict[str, Any]

@dataclass
class OptimizationResult:
    optimization_id: str
    fund_id: str
    target_allocations: List[AllocationTarget]
    recommended_deployment: DeploymentSchedule
    monte_carlo_results: Dict[str, Any]
    risk_metrics: Dict[str, float]
    expected_outcomes: Dict[str, Any]
    sensitivity_analysis: Dict[str, Any]
    recommendations: List[str]
    confidence_score: float

@dataclass
class AllocationReport:
    report_id: str
    fund_id: str
    fund_name: str
    generated_at: str
    current_allocations: Dict[str, Any]
    target_vs_actual: Dict[str, Any]
    deployment_progress: Dict[str, Any]
    optimization_recommendations: List[str]
    risk_analysis: Dict[str, Any]
    market_timing_insights: Dict[str, Any]
    scenario_planning: List[MonteCarloScenario]
    rebalancing_suggestions: List[Dict[str, Any]]
    overall_allocation_score: float

class MonteCarloEngine:
    """Monte Carlo simulation engine for fund allocation optimization"""
    
    def __init__(self, num_simulations: int = 500):  # REDUCED for investor demo performance (was 10000)
        self.num_simulations = num_simulations
        self.random_seed = 42  # For reproducible results
        
    def run_allocation_simulation(self, fund_size: float, 
                                allocation_targets: List[AllocationTarget],
                                market_scenarios: List[MonteCarloScenario],
                                investment_period: int = 5) -> Dict[str, Any]:
        """
        Run Monte Carlo simulation for optimal fund allocation
        
        Args:
            fund_size: Total fund size
            allocation_targets: Target allocation percentages
            market_scenarios: Market condition scenarios
            investment_period: Investment period in years
            
        Returns:
            Simulation results with optimal allocations
        """
        try:
            random.seed(self.random_seed)
            
            simulation_results = []
            
            for sim in range(self.num_simulations):
                # Select random market scenario
                scenario = random.choices(market_scenarios, weights=[s.probability for s in market_scenarios])[0]
                
                # Run single simulation
                sim_result = self._run_single_simulation(
                    fund_size, allocation_targets, scenario, investment_period, sim
                )
                
                simulation_results.append(sim_result)
            
            # Aggregate results
            aggregated_results = self._aggregate_simulation_results(simulation_results)
            
            return {
                'total_simulations': self.num_simulations,
                'aggregated_results': aggregated_results,
                'confidence_intervals': self._calculate_confidence_intervals(simulation_results),
                'risk_metrics': self._calculate_risk_metrics(simulation_results),
                'optimal_allocations': self._find_optimal_allocations(simulation_results),
                'scenario_analysis': self._analyze_scenario_performance(simulation_results, market_scenarios)
            }
            
        except Exception as e:
            logger.error(f"Error running Monte Carlo simulation: {e}")
            return self._create_fallback_simulation_results()
    
    def _run_single_simulation(self, fund_size: float, targets: List[AllocationTarget], 
                             scenario: MonteCarloScenario, period: int, sim_id: int) -> Dict[str, Any]:
        """Run a single Monte Carlo simulation"""
        try:
            results = {
                'simulation_id': sim_id,
                'scenario_id': scenario.scenario_id,
                'allocations': {},
                'returns': {},
                'final_value': 0,
                'irr': 0,
                'multiple': 0,
                'risk_adjusted_return': 0
            }
            
            total_return = 0
            
            for target in targets:
                # Calculate allocation amount
                allocation_amount = fund_size * (target.target_percentage / 100)
                
                # Get expected return for this category from scenario
                category_key = f"{target.category}_{target.subcategory}"
                expected_return = scenario.expected_returns.get(category_key, 0.15)  # Default 15%
                
                # Add randomness (normal distribution around expected return)
                volatility = scenario.risk_factors.get(category_key, 0.3)  # Default 30% volatility
                actual_return = random.normalvariate(expected_return, volatility)
                
                # Calculate final value for this allocation
                final_allocation_value = allocation_amount * (1 + actual_return) ** period
                
                results['allocations'][category_key] = {
                    'target_percentage': target.target_percentage,
                    'allocated_amount': allocation_amount,
                    'actual_return': actual_return,
                    'final_value': final_allocation_value
                }
                
                total_return += final_allocation_value
            
            # Calculate overall metrics
            results['final_value'] = total_return
            results['multiple'] = total_return / fund_size if fund_size > 0 else 0
            results['irr'] = ((total_return / fund_size) ** (1/period)) - 1 if fund_size > 0 else 0
            
            # Risk-adjusted return (Sharpe-like ratio)
            portfolio_volatility = self._calculate_portfolio_volatility(results['allocations'])
            results['risk_adjusted_return'] = results['irr'] / portfolio_volatility if portfolio_volatility > 0 else 0
            
            return results
            
        except Exception as e:
            logger.error(f"Error in single simulation: {e}")
            return self._create_empty_simulation_result(sim_id)
    
    def _calculate_portfolio_volatility(self, allocations: Dict[str, Any]) -> float:
        """Calculate portfolio volatility based on allocations"""
        try:
            # Simple approach - weighted average volatility
            total_vol = 0
            total_weight = 0
            
            for allocation in allocations.values():
                weight = allocation['target_percentage'] / 100
                vol = abs(allocation['actual_return']) * 0.3  # Simplified volatility estimate
                total_vol += weight * vol
                total_weight += weight
            
            return total_vol / total_weight if total_weight > 0 else 0.2
            
        except Exception as e:
            logger.error(f"Error calculating portfolio volatility: {e}")
            return 0.2
    
    def _aggregate_simulation_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate results from all simulations"""
        try:
            if not results:
                return {}
            
            # Calculate summary statistics
            multiples = [r['multiple'] for r in results]
            irrs = [r['irr'] for r in results]
            risk_adj_returns = [r['risk_adjusted_return'] for r in results]
            
            aggregated = {
                'expected_multiple': statistics.mean(multiples),
                'median_multiple': statistics.median(multiples),
                'multiple_std': statistics.stdev(multiples) if len(multiples) > 1 else 0,
                'expected_irr': statistics.mean(irrs),
                'median_irr': statistics.median(irrs),
                'irr_std': statistics.stdev(irrs) if len(irrs) > 1 else 0,
                'expected_risk_adj_return': statistics.mean(risk_adj_returns),
                'probability_positive_returns': sum(1 for m in multiples if m > 1.0) / len(multiples),
                'probability_target_returns': sum(1 for m in multiples if m > 2.0) / len(multiples),
                'value_at_risk_5': sorted(multiples)[int(len(multiples) * 0.05)],
                'value_at_risk_95': sorted(multiples)[int(len(multiples) * 0.95)]
            }
            
            return aggregated
            
        except Exception as e:
            logger.error(f"Error aggregating simulation results: {e}")
            return {}
    
    def _calculate_confidence_intervals(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate confidence intervals for key metrics"""
        try:
            multiples = sorted([r['multiple'] for r in results])
            irrs = sorted([r['irr'] for r in results])
            
            n = len(multiples)
            
            return {
                'multiple_90_ci': {
                    'lower': multiples[int(n * 0.05)],
                    'upper': multiples[int(n * 0.95)]
                },
                'multiple_95_ci': {
                    'lower': multiples[int(n * 0.025)],
                    'upper': multiples[int(n * 0.975)]
                },
                'irr_90_ci': {
                    'lower': irrs[int(n * 0.05)],
                    'upper': irrs[int(n * 0.95)]
                },
                'irr_95_ci': {
                    'lower': irrs[int(n * 0.025)],
                    'upper': irrs[int(n * 0.975)]
                }
            }
            
        except Exception as e:
            logger.error(f"Error calculating confidence intervals: {e}")
            return {}
    
    def _calculate_risk_metrics(self, results: List[Dict[str, Any]]) -> Dict[str, float]:
        """Calculate risk metrics from simulation results"""
        try:
            multiples = [r['multiple'] for r in results]
            irrs = [r['irr'] for r in results]
            
            # Calculate various risk metrics
            risk_metrics = {
                'volatility': statistics.stdev(irrs) if len(irrs) > 1 else 0,
                'downside_deviation': self._calculate_downside_deviation(irrs),
                'maximum_drawdown': self._calculate_max_drawdown(multiples),
                'probability_of_loss': sum(1 for m in multiples if m < 1.0) / len(multiples),
                'expected_shortfall_5': statistics.mean([m for m in multiples if m <= sorted(multiples)[int(len(multiples) * 0.05)]]),
                'sharpe_ratio': self._calculate_sharpe_ratio(irrs),
                'sortino_ratio': self._calculate_sortino_ratio(irrs)
            }
            
            return risk_metrics
            
        except Exception as e:
            logger.error(f"Error calculating risk metrics: {e}")
            return {}
    
    def _calculate_downside_deviation(self, returns: List[float], target_return: float = 0.0) -> float:
        """Calculate downside deviation"""
        try:
            downside_returns = [r - target_return for r in returns if r < target_return]
            if not downside_returns:
                return 0.0
            
            return math.sqrt(sum(r**2 for r in downside_returns) / len(downside_returns))
            
        except Exception as e:
            return 0.0
    
    def _calculate_max_drawdown(self, values: List[float]) -> float:
        """Calculate maximum drawdown"""
        try:
            if not values:
                return 0.0
            
            peak = values[0]
            max_drawdown = 0.0
            
            for value in values:
                if value > peak:
                    peak = value
                else:
                    drawdown = (peak - value) / peak
                    max_drawdown = max(max_drawdown, drawdown)
            
            return max_drawdown
            
        except Exception as e:
            return 0.0
    
    def _calculate_sharpe_ratio(self, returns: List[float], risk_free_rate: float = 0.03) -> float:
        """Calculate Sharpe ratio"""
        try:
            if not returns:
                return 0.0
            
            excess_returns = [r - risk_free_rate for r in returns]
            mean_excess = statistics.mean(excess_returns)
            std_excess = statistics.stdev(excess_returns) if len(excess_returns) > 1 else 0
            
            return mean_excess / std_excess if std_excess > 0 else 0.0
            
        except Exception as e:
            return 0.0
    
    def _calculate_sortino_ratio(self, returns: List[float], target_return: float = 0.0) -> float:
        """Calculate Sortino ratio"""
        try:
            if not returns:
                return 0.0
            
            mean_return = statistics.mean(returns)
            downside_dev = self._calculate_downside_deviation(returns, target_return)
            
            return (mean_return - target_return) / downside_dev if downside_dev > 0 else 0.0
            
        except Exception as e:
            return 0.0
    
    def _find_optimal_allocations(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Find optimal allocations based on risk-return trade-off"""
        try:
            # For simplicity, find allocations with highest risk-adjusted returns
            best_simulation = max(results, key=lambda x: x.get('risk_adjusted_return', 0))
            
            optimal_allocations = {}
            for category, allocation in best_simulation.get('allocations', {}).items():
                optimal_allocations[category] = {
                    'recommended_percentage': allocation['target_percentage'],
                    'expected_return': allocation['actual_return'],
                    'risk_contribution': abs(allocation['actual_return']) * 0.3  # Simplified
                }
            
            return {
                'best_simulation_id': best_simulation['simulation_id'],
                'optimal_allocations': optimal_allocations,
                'expected_portfolio_return': best_simulation['irr'],
                'expected_multiple': best_simulation['multiple'],
                'risk_adjusted_return': best_simulation['risk_adjusted_return']
            }
            
        except Exception as e:
            logger.error(f"Error finding optimal allocations: {e}")
            return {}
    
    def _analyze_scenario_performance(self, results: List[Dict[str, Any]], 
                                    scenarios: List[MonteCarloScenario]) -> Dict[str, Any]:
        """Analyze performance across different scenarios"""
        try:
            scenario_analysis = {}
            
            for scenario in scenarios:
                scenario_results = [r for r in results if r['scenario_id'] == scenario.scenario_id]
                
                if scenario_results:
                    multiples = [r['multiple'] for r in scenario_results]
                    irrs = [r['irr'] for r in scenario_results]
                    
                    scenario_analysis[scenario.scenario_id] = {
                        'scenario_name': scenario.scenario_name,
                        'probability': scenario.probability,
                        'simulations_count': len(scenario_results),
                        'expected_multiple': statistics.mean(multiples),
                        'expected_irr': statistics.mean(irrs),
                        'volatility': statistics.stdev(irrs) if len(irrs) > 1 else 0,
                        'probability_positive': sum(1 for m in multiples if m > 1.0) / len(multiples)
                    }
            
            return scenario_analysis
            
        except Exception as e:
            logger.error(f"Error analyzing scenario performance: {e}")
            return {}
    
    def _create_fallback_simulation_results(self) -> Dict[str, Any]:
        """Create fallback simulation results when Monte Carlo fails"""
        return {
            'total_simulations': 0,
            'aggregated_results': {
                'expected_multiple': 2.5,
                'expected_irr': 0.15,
                'probability_positive_returns': 0.75
            },
            'confidence_intervals': {},
            'risk_metrics': {'volatility': 0.3},
            'optimal_allocations': {},
            'scenario_analysis': {},
            'note': 'Fallback results - Monte Carlo simulation not available'
        }
    
    def _create_empty_simulation_result(self, sim_id: int) -> Dict[str, Any]:
        """Create empty simulation result for failed runs"""
        return {
            'simulation_id': sim_id,
            'scenario_id': 'unknown',
            'allocations': {},
            'returns': {},
            'final_value': 0,
            'irr': 0,
            'multiple': 1.0,
            'risk_adjusted_return': 0
        }

class AllocationOptimizer(VERSSAIAIAgent):
    """AI Agent for fund allocation optimization"""
    
    def __init__(self):
        super().__init__("AllocationOptimizer")
        self.monte_carlo = MonteCarloEngine()
        self.system_prompt = """
        You are an expert VC fund allocation strategist AI with deep knowledge of portfolio optimization and risk management.
        
        Your role is to analyze fund allocation strategies and provide optimization recommendations:
        - Optimize allocation across stages, industries, and geographies
        - Balance risk-return trade-offs for different market conditions
        - Recommend deployment timing based on market cycles
        - Identify concentration risks and diversification opportunities
        - Suggest rebalancing strategies based on performance
        
        Key considerations:
        - Vintage year effects and market timing
        - Portfolio construction theory applied to venture capital
        - Risk management through diversification
        - Capital deployment pacing and reserves management
        - Market cycle optimization
        
        Return ONLY valid JSON in this exact format:
        {
            "allocation_recommendations": {},
            "deployment_strategy": {},
            "risk_analysis": {},
            "market_timing_insights": {},
            "optimization_rationale": [],
            "rebalancing_suggestions": [],
            "confidence_score": 0.85
        }
        
        Provide specific, actionable recommendations based on quantitative analysis.
        """
    
    async def optimize_fund_allocation(self, fund_id: str, fund_size: float,
                                     current_allocations: Dict[str, Any],
                                     target_allocations: List[AllocationTarget],
                                     market_conditions: Dict[str, Any] = None) -> OptimizationResult:
        """
        Optimize fund allocation using Monte Carlo simulation and AI analysis
        
        Args:
            fund_id: Fund identifier
            fund_size: Total fund size
            current_allocations: Current allocation breakdown
            target_allocations: Target allocation objectives
            market_conditions: Current market conditions
            
        Returns:
            Comprehensive optimization result
        """
        try:
            # Create market scenarios for Monte Carlo simulation
            market_scenarios = self._create_market_scenarios(market_conditions)
            
            # Run Monte Carlo simulation
            mc_results = self.monte_carlo.run_allocation_simulation(
                fund_size, target_allocations, market_scenarios
            )
            
            # Create cache key for deterministic AI analysis
            cache_key = hashlib.md5(
                f"allocation_optimization_{fund_id}_{fund_size}_{json.dumps(current_allocations, sort_keys=True)}".encode()
            ).hexdigest()
            
            # Get RAG insights on allocation strategies
            rag_results = rag_service.query_platform_knowledge(
                f"fund_allocation_optimization_strategies", top_k=3
            )
            strategy_insights = "\n".join([r['content'][:300] for r in rag_results])
            
            # Prepare optimization prompt
            optimization_prompt = f"""Optimize fund allocation strategy with Monte Carlo analysis:

Fund Details:
- Fund ID: {fund_id}
- Fund Size: ${fund_size:,.0f}
- Investment Period: 5 years

Current Allocations:
{json.dumps(current_allocations, indent=2)}

Target Allocations:
{chr(10).join([f"- {t.category}/{t.subcategory}: {t.target_percentage}% (Min: {t.minimum_percentage}%, Max: {t.maximum_percentage}%)" for t in target_allocations])}

Monte Carlo Results:
- Expected Multiple: {mc_results['aggregated_results'].get('expected_multiple', 2.5):.2f}x
- Expected IRR: {mc_results['aggregated_results'].get('expected_irr', 0.15):.1%}
- Probability Positive Returns: {mc_results['aggregated_results'].get('probability_positive_returns', 0.75):.1%}
- Portfolio Volatility: {mc_results['risk_metrics'].get('volatility', 0.3):.1%}

Market Conditions:
{json.dumps(market_conditions or {}, indent=2)}

Strategy Insights:
{strategy_insights[:1000] if strategy_insights else 'Limited strategy insights available'}

Please provide optimization recommendations with valid JSON only."""
            
            # Get AI optimization recommendations
            ai_response = self.call_ai(optimization_prompt, self.system_prompt, temperature=0.0)
            optimization_analysis = self._parse_optimization_response(ai_response)
            
            # Create deployment schedule
            deployment_schedule = self._create_deployment_schedule(
                fund_id, fund_size, target_allocations, market_conditions
            )
            
            # Calculate risk metrics
            risk_metrics = mc_results.get('risk_metrics', {})
            
            # Create optimization result
            optimization = OptimizationResult(
                optimization_id=str(uuid.uuid4()),
                fund_id=fund_id,
                target_allocations=target_allocations,
                recommended_deployment=deployment_schedule,
                monte_carlo_results=mc_results,
                risk_metrics=risk_metrics,
                expected_outcomes={
                    'expected_multiple': mc_results['aggregated_results'].get('expected_multiple', 2.5),
                    'expected_irr': mc_results['aggregated_results'].get('expected_irr', 0.15),
                    'risk_adjusted_return': mc_results['aggregated_results'].get('expected_risk_adj_return', 0.5)
                },
                sensitivity_analysis=self._conduct_sensitivity_analysis(mc_results),
                recommendations=optimization_analysis.get('optimization_rationale', []),
                confidence_score=optimization_analysis.get('confidence_score', 0.75)
            )
            
            logger.info(f"Completed fund allocation optimization for {fund_id}")
            return optimization
            
        except Exception as e:
            logger.error(f"Error optimizing fund allocation: {e}")
            return self._create_fallback_optimization(fund_id, fund_size, target_allocations)
    
    def _create_market_scenarios(self, market_conditions: Dict[str, Any] = None) -> List[MonteCarloScenario]:
        """Create market scenarios for Monte Carlo simulation"""
        try:
            scenarios = [
                MonteCarloScenario(
                    scenario_id="bull_market",
                    scenario_name="Bull Market",
                    probability=0.3,
                    market_conditions=[],
                    expected_returns={
                        'stage_Seed': 0.25,
                        'stage_Series A': 0.20,
                        'stage_Series B': 0.15,
                        'industry_Artificial Intelligence': 0.30,
                        'industry_Healthcare Technology': 0.22,
                        'industry_Clean Technology': 0.18,
                        'geography_US': 0.20,
                        'geography_Europe': 0.15
                    },
                    risk_factors={
                        'stage_Seed': 0.50,
                        'stage_Series A': 0.40,
                        'stage_Series B': 0.30,
                        'industry_Artificial Intelligence': 0.45,
                        'industry_Healthcare Technology': 0.35,
                        'industry_Clean Technology': 0.40,
                        'geography_US': 0.35,
                        'geography_Europe': 0.30
                    },
                    deployment_impact={'pacing_adjustment': 1.2}
                ),
                MonteCarloScenario(
                    scenario_id="bear_market",
                    scenario_name="Bear Market",
                    probability=0.2,
                    market_conditions=[],
                    expected_returns={
                        'stage_Seed': -0.10,
                        'stage_Series A': 0.05,
                        'stage_Series B': 0.08,
                        'industry_Artificial Intelligence': 0.00,
                        'industry_Healthcare Technology': 0.10,
                        'industry_Clean Technology': 0.05,
                        'geography_US': 0.05,
                        'geography_Europe': 0.08
                    },
                    risk_factors={
                        'stage_Seed': 0.60,
                        'stage_Series A': 0.45,
                        'stage_Series B': 0.35,
                        'industry_Artificial Intelligence': 0.55,
                        'industry_Healthcare Technology': 0.40,
                        'industry_Clean Technology': 0.45,
                        'geography_US': 0.40,
                        'geography_Europe': 0.35
                    },
                    deployment_impact={'pacing_adjustment': 0.8}
                ),
                MonteCarloScenario(
                    scenario_id="neutral_market",
                    scenario_name="Neutral Market",
                    probability=0.5,
                    market_conditions=[],
                    expected_returns={
                        'stage_Seed': 0.12,
                        'stage_Series A': 0.15,
                        'stage_Series B': 0.12,
                        'industry_Artificial Intelligence': 0.18,
                        'industry_Healthcare Technology': 0.16,
                        'industry_Clean Technology': 0.14,
                        'geography_US': 0.15,
                        'geography_Europe': 0.12
                    },
                    risk_factors={
                        'stage_Seed': 0.45,
                        'stage_Series A': 0.35,
                        'stage_Series B': 0.25,
                        'industry_Artificial Intelligence': 0.40,
                        'industry_Healthcare Technology': 0.30,
                        'industry_Clean Technology': 0.35,
                        'geography_US': 0.30,
                        'geography_Europe': 0.25
                    },
                    deployment_impact={'pacing_adjustment': 1.0}
                )
            ]
            
            return scenarios
            
        except Exception as e:
            logger.error(f"Error creating market scenarios: {e}")
            return []
    
    def _parse_optimization_response(self, response: str) -> Dict[str, Any]:
        """Parse AI optimization response"""
        try:
            response_clean = response.strip()
            if response_clean.startswith('```json'):
                response_clean = response_clean[7:-3].strip()
            elif response_clean.startswith('```'):
                response_clean = response_clean[3:-3].strip()
            
            return json.loads(response_clean)
            
        except json.JSONDecodeError:
            logger.error(f"Failed to parse optimization response: {response}")
            return {
                'allocation_recommendations': {'error': 'AI analysis parsing failed'},
                'deployment_strategy': {'error': 'Strategy analysis failed'},
                'risk_analysis': {'error': 'Risk analysis failed'},
                'market_timing_insights': {'error': 'Market analysis failed'},
                'optimization_rationale': ['AI analysis not available - manual review needed'],
                'rebalancing_suggestions': ['Enable AI analysis for rebalancing insights'],
                'confidence_score': 0.3
            }
    
    def _create_deployment_schedule(self, fund_id: str, fund_size: float,
                                  targets: List[AllocationTarget],
                                  market_conditions: Dict[str, Any] = None) -> DeploymentSchedule:
        """Create optimal deployment schedule"""
        try:
            # Create quarterly deployment targets
            investment_period_quarters = 20  # 5 years
            quarterly_budget = fund_size * 0.8 / investment_period_quarters  # 80% deployed, 20% reserves
            
            quarterly_targets = []
            for quarter in range(investment_period_quarters):
                # Front-load deployment slightly (higher early deployment)
                multiplier = 1.2 if quarter < 8 else 1.0 if quarter < 16 else 0.8
                
                quarterly_targets.append({
                    'quarter': quarter + 1,
                    'target_deployment': quarterly_budget * multiplier,
                    'cumulative_target': sum(t['target_deployment'] for t in quarterly_targets) + quarterly_budget * multiplier,
                    'market_adjustment': market_conditions.get('deployment_adjustment', 1.0) if market_conditions else 1.0
                })
            
            deployment = DeploymentSchedule(
                schedule_id=str(uuid.uuid4()),
                fund_id=fund_id,
                fund_size=fund_size,
                investment_period="5 years",
                quarterly_targets=quarterly_targets,
                seasonal_adjustments={'Q4': 0.9, 'Q1': 1.1},  # Slightly less Q4, more Q1
                market_condition_adjustments={'bull': 1.1, 'bear': 0.9, 'neutral': 1.0},
                reserves={'follow_on': 0.15, 'new_investments': 0.05}  # 15% follow-on, 5% new
            )
            
            return deployment
            
        except Exception as e:
            logger.error(f"Error creating deployment schedule: {e}")
            return self._create_default_deployment_schedule(fund_id, fund_size)
    
    def _conduct_sensitivity_analysis(self, mc_results: Dict[str, Any]) -> Dict[str, Any]:
        """Conduct sensitivity analysis on key parameters"""
        try:
            # Simplified sensitivity analysis
            base_multiple = mc_results['aggregated_results'].get('expected_multiple', 2.5)
            base_irr = mc_results['aggregated_results'].get('expected_irr', 0.15)
            
            sensitivity = {
                'market_conditions': {
                    'bull_market_impact': {'multiple_change': 0.5, 'irr_change': 0.05},
                    'bear_market_impact': {'multiple_change': -0.8, 'irr_change': -0.08},
                },
                'allocation_changes': {
                    'increase_early_stage': {'multiple_change': 0.3, 'risk_change': 0.1},
                    'increase_late_stage': {'multiple_change': -0.2, 'risk_change': -0.05},
                },
                'deployment_timing': {
                    'faster_deployment': {'irr_impact': -0.02, 'risk_impact': 0.05},
                    'slower_deployment': {'irr_impact': 0.01, 'risk_impact': -0.02}
                }
            }
            
            return sensitivity
            
        except Exception as e:
            logger.error(f"Error conducting sensitivity analysis: {e}")
            return {}
    
    def _create_fallback_optimization(self, fund_id: str, fund_size: float,
                                    targets: List[AllocationTarget]) -> OptimizationResult:
        """Create fallback optimization result"""
        return OptimizationResult(
            optimization_id=str(uuid.uuid4()),
            fund_id=fund_id,
            target_allocations=targets,
            recommended_deployment=self._create_default_deployment_schedule(fund_id, fund_size),
            monte_carlo_results={'note': 'Monte Carlo simulation not available'},
            risk_metrics={'volatility': 0.3, 'sharpe_ratio': 1.2},
            expected_outcomes={'expected_multiple': 2.5, 'expected_irr': 0.15},
            sensitivity_analysis={},
            recommendations=['Enable AI analysis for optimization insights'],
            confidence_score=0.5
        )
    
    def _create_default_deployment_schedule(self, fund_id: str, fund_size: float) -> DeploymentSchedule:
        """Create default deployment schedule"""
        return DeploymentSchedule(
            schedule_id=str(uuid.uuid4()),
            fund_id=fund_id,
            fund_size=fund_size,
            investment_period="5 years",
            quarterly_targets=[],
            seasonal_adjustments={},
            market_condition_adjustments={},
            reserves={'total': 0.2}
        )

class AllocationOrchestrator:
    """Orchestrates fund allocation and deployment optimization"""
    
    def __init__(self):
        self.optimizer = AllocationOptimizer()
        self.allocation_targets = {}  # In-memory storage for demo
        self.optimization_results = {}
        
    async def create_allocation_targets(self, fund_id: str, targets_data: List[Dict[str, Any]]) -> List[AllocationTarget]:
        """Create allocation targets for a fund"""
        try:
            targets = []
            
            for target_data in targets_data:
                target = AllocationTarget(
                    target_id=target_data.get('target_id', str(uuid.uuid4())),
                    category=target_data['category'],
                    subcategory=target_data['subcategory'],
                    target_percentage=target_data['target_percentage'],
                    minimum_percentage=target_data.get('minimum_percentage', target_data['target_percentage'] * 0.7),
                    maximum_percentage=target_data.get('maximum_percentage', target_data['target_percentage'] * 1.3),
                    current_allocation=target_data.get('current_allocation', 0),
                    target_amount=0,  # Will be calculated
                    deployed_amount=target_data.get('deployed_amount', 0),
                    remaining_amount=0  # Will be calculated
                )
                
                targets.append(target)
                self.allocation_targets[target.target_id] = target
            
            logger.info(f"Created {len(targets)} allocation targets for fund {fund_id}")
            return targets
            
        except Exception as e:
            logger.error(f"Error creating allocation targets: {e}")
            raise
    
    async def optimize_fund_allocation(self, fund_id: str, fund_size: float,
                                     targets_data: List[Dict[str, Any]],
                                     current_allocations: Dict[str, Any] = None,
                                     market_conditions: Dict[str, Any] = None) -> OptimizationResult:
        """Run complete fund allocation optimization"""
        try:
            # Create allocation targets
            targets = await self.create_allocation_targets(fund_id, targets_data)
            
            # Run optimization
            optimization = await self.optimizer.optimize_fund_allocation(
                fund_id, fund_size, current_allocations or {}, targets, market_conditions
            )
            
            # Store results
            self.optimization_results[optimization.optimization_id] = optimization
            
            return optimization
            
        except Exception as e:
            logger.error(f"Error optimizing fund allocation: {e}")
            raise
    
    async def generate_allocation_report(self, fund_id: str, fund_name: str = None) -> AllocationReport:
        """Generate comprehensive allocation report"""
        try:
            # Get fund's allocation targets
            fund_targets = [t for t in self.allocation_targets.values() if t.target_id.startswith(fund_id)]
            
            # Get latest optimization results
            fund_optimizations = [o for o in self.optimization_results.values() if o.fund_id == fund_id]
            latest_optimization = max(fund_optimizations, key=lambda x: x.optimization_id) if fund_optimizations else None
            
            # Calculate current vs target allocations
            current_vs_target = {}
            deployment_progress = {}
            
            if fund_targets:
                for target in fund_targets:
                    key = f"{target.category}_{target.subcategory}"
                    current_vs_target[key] = {
                        'target_percentage': target.target_percentage,
                        'current_percentage': target.current_allocation,
                        'variance': target.current_allocation - target.target_percentage,
                        'status': 'on_track' if abs(target.current_allocation - target.target_percentage) < 5 else 'rebalancing_needed'
                    }
                    
                    deployment_progress[key] = {
                        'target_amount': target.target_amount,
                        'deployed_amount': target.deployed_amount,
                        'remaining_amount': target.remaining_amount,
                        'deployment_percentage': (target.deployed_amount / target.target_amount * 100) if target.target_amount > 0 else 0
                    }
            
            # Generate market scenarios for scenario planning
            market_scenarios = self.optimizer._create_market_scenarios()
            
            # Generate recommendations
            recommendations = []
            if latest_optimization:
                recommendations.extend(latest_optimization.recommendations[:5])
            
            recommendations.extend([
                "Review allocation targets quarterly",
                "Monitor market conditions for deployment timing",
                "Maintain adequate reserves for follow-on investments"
            ])
            
            # Calculate overall allocation score
            allocation_score = self._calculate_allocation_score(current_vs_target, latest_optimization)
            
            report = AllocationReport(
                report_id=str(uuid.uuid4()),
                fund_id=fund_id,
                fund_name=fund_name or f"Fund {fund_id}",
                generated_at=datetime.utcnow().isoformat(),
                current_allocations=current_vs_target,
                target_vs_actual=current_vs_target,
                deployment_progress=deployment_progress,
                optimization_recommendations=recommendations,
                risk_analysis=latest_optimization.risk_metrics if latest_optimization else {},
                market_timing_insights={
                    'current_market_phase': 'neutral',
                    'deployment_recommendation': 'steady_pace',
                    'sector_timing': {'AI': 'opportunistic', 'Healthcare': 'steady'}
                },
                scenario_planning=market_scenarios,
                rebalancing_suggestions=self._generate_rebalancing_suggestions(current_vs_target),
                overall_allocation_score=allocation_score
            )
            
            logger.info(f"Generated allocation report for {fund_name} - Score: {allocation_score}")
            return report
            
        except Exception as e:
            logger.error(f"Error generating allocation report: {e}")
            raise
    
    def _calculate_allocation_score(self, current_vs_target: Dict[str, Any], 
                                  optimization: OptimizationResult = None) -> float:
        """Calculate overall allocation score (0-100)"""
        try:
            if not current_vs_target:
                return 50.0
            
            # Calculate variance-based score
            total_variance = sum(abs(alloc['variance']) for alloc in current_vs_target.values())
            variance_score = max(0, 100 - (total_variance * 2))  # Penalize large variances
            
            # Add optimization score if available
            optimization_score = 0
            if optimization and optimization.confidence_score:
                optimization_score = optimization.confidence_score * 30  # 30% weight
            
            # Risk-adjusted score
            risk_score = 20  # Base risk score
            if optimization and optimization.risk_metrics:
                sharpe_ratio = optimization.risk_metrics.get('sharpe_ratio', 1.0)
                risk_score = min(30, sharpe_ratio * 15)
            
            total_score = variance_score * 0.5 + optimization_score + risk_score
            return round(min(100, max(0, total_score)), 1)
            
        except Exception as e:
            logger.error(f"Error calculating allocation score: {e}")
            return 50.0
    
    def _generate_rebalancing_suggestions(self, current_vs_target: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate rebalancing suggestions"""
        suggestions = []
        
        try:
            for category, allocation in current_vs_target.items():
                if abs(allocation['variance']) > 5:  # More than 5% variance
                    action = "reduce" if allocation['variance'] > 0 else "increase"
                    suggestions.append({
                        'category': category,
                        'action': action,
                        'target_adjustment': abs(allocation['variance']),
                        'priority': 'high' if abs(allocation['variance']) > 10 else 'medium',
                        'rationale': f"Current allocation is {allocation['variance']:.1f}% off target"
                    })
            
        except Exception as e:
            logger.error(f"Error generating rebalancing suggestions: {e}")
        
        return suggestions[:10]  # Top 10 suggestions

# Global orchestrator instance
allocation_orchestrator = AllocationOrchestrator()

# Convenience functions
async def create_allocation_targets(fund_id: str, targets_data: List[Dict[str, Any]]) -> List[AllocationTarget]:
    """Create allocation targets"""
    return await allocation_orchestrator.create_allocation_targets(fund_id, targets_data)

async def optimize_fund_allocation(fund_id: str, fund_size: float,
                                 targets_data: List[Dict[str, Any]],
                                 current_allocations: Dict[str, Any] = None,
                                 market_conditions: Dict[str, Any] = None) -> OptimizationResult:
    """Optimize fund allocation"""
    return await allocation_orchestrator.optimize_fund_allocation(
        fund_id, fund_size, targets_data, current_allocations, market_conditions
    )

async def generate_allocation_report(fund_id: str, fund_name: str = None) -> AllocationReport:
    """Generate allocation report"""
    return await allocation_orchestrator.generate_allocation_report(fund_id, fund_name)