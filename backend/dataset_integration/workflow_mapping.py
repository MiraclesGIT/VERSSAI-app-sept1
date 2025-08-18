"""
VERSSAI Workflow Research Mapper
Maps the 1,157 academic papers to specific VERSSAI VC workflows
"""

import json
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class WorkflowType(Enum):
    """VERSSAI's 6 core VC workflows"""
    FOUNDER_SIGNAL_ASSESSMENT = "founder_signal_assessment"
    DUE_DILIGENCE_AUTOMATION = "due_diligence_automation"
    PORTFOLIO_MANAGEMENT = "portfolio_management"
    FUND_ALLOCATION_OPTIMIZATION = "fund_allocation_optimization"
    COMPETITIVE_INTELLIGENCE = "competitive_intelligence"
    LP_COMMUNICATION_AUTOMATION = "lp_communication_automation"

@dataclass
class WorkflowMapping:
    """Mapping between research categories and workflows"""
    workflow: WorkflowType
    primary_categories: List[str]
    secondary_categories: List[str]
    paper_count: int
    confidence_score: float
    implementation_priority: str
    target_performance: str

@dataclass
class ResearchEvidence:
    """Research evidence supporting a workflow"""
    paper_id: str
    title: str
    authors: List[str]
    methodology: str
    performance_metric: str
    sample_size: int
    relevance_score: float
    citation_count: int

class WorkflowResearchMapper:
    """
    Maps academic research to VERSSAI's 6 VC workflows
    Ensures each workflow has strong academic foundation
    """
    
    def __init__(self):
        self.workflow_mappings = self._initialize_workflow_mappings()
        self.research_categories = self._initialize_research_categories()
        self.core_papers = self._initialize_core_papers()
        self.methodology_requirements = self._initialize_methodology_requirements()
    
    def _initialize_workflow_mappings(self) -> Dict[WorkflowType, WorkflowMapping]:
        """Initialize mappings between research and workflows"""
        
        return {
            WorkflowType.FOUNDER_SIGNAL_ASSESSMENT: WorkflowMapping(
                workflow=WorkflowType.FOUNDER_SIGNAL_ASSESSMENT,
                primary_categories=["AI_ML_Methods", "Startup_Assessment"],
                secondary_categories=["VC_Decision_Making"],
                paper_count=632,  # 387 + 245
                confidence_score=0.94,
                implementation_priority="HIGH",
                target_performance="85-92% accuracy"
            ),
            
            WorkflowType.DUE_DILIGENCE_AUTOMATION: WorkflowMapping(
                workflow=WorkflowType.DUE_DILIGENCE_AUTOMATION,
                primary_categories=["AI_ML_Methods", "Risk_Analysis"],
                secondary_categories=["Financial_Modeling"],
                paper_count=458,  # 387 + 71
                confidence_score=0.89,
                implementation_priority="HIGH",
                target_performance="85% accuracy, 60% time reduction"
            ),
            
            WorkflowType.PORTFOLIO_MANAGEMENT: WorkflowMapping(
                workflow=WorkflowType.PORTFOLIO_MANAGEMENT,
                primary_categories=["VC_Decision_Making", "Financial_Modeling"],
                secondary_categories=["Risk_Analysis"],
                paper_count=454,  # 298 + 156
                confidence_score=0.87,
                implementation_priority="MEDIUM",
                target_performance="75-85% prediction accuracy"
            ),
            
            WorkflowType.FUND_ALLOCATION_OPTIMIZATION: WorkflowMapping(
                workflow=WorkflowType.FUND_ALLOCATION_OPTIMIZATION,
                primary_categories=["VC_Decision_Making", "Financial_Modeling"],
                secondary_categories=["AI_ML_Methods"],
                paper_count=454,  # 298 + 156
                confidence_score=0.85,
                implementation_priority="MEDIUM",
                target_performance="2-4% alpha generation"
            ),
            
            WorkflowType.COMPETITIVE_INTELLIGENCE: WorkflowMapping(
                workflow=WorkflowType.COMPETITIVE_INTELLIGENCE,
                primary_categories=["Startup_Assessment"],
                secondary_categories=["AI_ML_Methods", "VC_Decision_Making"],
                paper_count=245,
                confidence_score=0.78,
                implementation_priority="MEDIUM",
                target_performance="80-90% market insight accuracy"
            ),
            
            WorkflowType.LP_COMMUNICATION_AUTOMATION: WorkflowMapping(
                workflow=WorkflowType.LP_COMMUNICATION_AUTOMATION,
                primary_categories=["VC_Decision_Making"],
                secondary_categories=["AI_ML_Methods"],
                paper_count=298,
                confidence_score=0.74,
                implementation_priority="LOW",
                target_performance="90% automation, 80% time reduction"
            )
        }
    
    def _initialize_research_categories(self) -> Dict[str, Any]:
        """Initialize research categories with detailed mappings"""
        
        return {
            "AI_ML_Methods": {
                "paper_count": 387,
                "description": "Machine learning, neural networks, ensemble methods",
                "key_methodologies": [
                    "Ensemble Learning (CatBoost + Random Forest)",
                    "Graph Neural Networks",
                    "Deep Learning",
                    "Natural Language Processing",
                    "Computer Vision",
                    "Reinforcement Learning"
                ],
                "performance_range": "75-90%",
                "applications": [
                    "Founder personality analysis",
                    "Document processing automation",
                    "Financial document analysis",
                    "Market trend detection",
                    "Risk pattern recognition"
                ],
                "verssai_workflows": [
                    WorkflowType.FOUNDER_SIGNAL_ASSESSMENT,
                    WorkflowType.DUE_DILIGENCE_AUTOMATION
                ]
            },
            
            "VC_Decision_Making": {
                "paper_count": 298,
                "description": "Investment decision frameworks, portfolio optimization",
                "key_methodologies": [
                    "Multi-criteria Decision Analysis",
                    "Portfolio Theory",
                    "Behavioral Finance",
                    "Investment Frameworks",
                    "Risk-Return Optimization",
                    "Due Diligence Processes"
                ],
                "performance_range": "70-85%",
                "applications": [
                    "Investment decision support",
                    "Portfolio allocation",
                    "Risk assessment",
                    "Fund strategy optimization",
                    "LP reporting automation"
                ],
                "verssai_workflows": [
                    WorkflowType.PORTFOLIO_MANAGEMENT,
                    WorkflowType.FUND_ALLOCATION_OPTIMIZATION,
                    WorkflowType.LP_COMMUNICATION_AUTOMATION
                ]
            },
            
            "Startup_Assessment": {
                "paper_count": 245,
                "description": "Startup evaluation, founder analysis, market assessment",
                "key_methodologies": [
                    "Founder Assessment Frameworks",
                    "Market Analysis",
                    "Competitive Intelligence",
                    "Business Model Evaluation",
                    "Traction Metrics",
                    "Product-Market Fit Analysis"
                ],
                "performance_range": "67-92%",
                "applications": [
                    "Founder signal detection",
                    "Market opportunity assessment",
                    "Competitive positioning",
                    "Business model validation",
                    "Traction analysis"
                ],
                "verssai_workflows": [
                    WorkflowType.FOUNDER_SIGNAL_ASSESSMENT,
                    WorkflowType.COMPETITIVE_INTELLIGENCE
                ]
            },
            
            "Financial_Modeling": {
                "paper_count": 156,
                "description": "Quantitative finance, risk modeling, valuation",
                "key_methodologies": [
                    "Monte Carlo Simulation",
                    "Financial Modeling",
                    "Valuation Methods",
                    "Risk Modeling",
                    "Scenario Analysis",
                    "Stress Testing"
                ],
                "performance_range": "65-88%",
                "applications": [
                    "Portfolio valuation",
                    "Risk assessment",
                    "Allocation optimization",
                    "Scenario planning",
                    "Performance attribution"
                ],
                "verssai_workflows": [
                    WorkflowType.PORTFOLIO_MANAGEMENT,
                    WorkflowType.FUND_ALLOCATION_OPTIMIZATION
                ]
            },
            
            "Risk_Analysis": {
                "paper_count": 71,
                "description": "Risk assessment, compliance, regulatory analysis",
                "key_methodologies": [
                    "Risk Assessment Frameworks",
                    "Compliance Automation",
                    "Regulatory Analysis",
                    "Due Diligence Checklists",
                    "ESG Analysis",
                    "Legal Risk Assessment"
                ],
                "performance_range": "60-80%",
                "applications": [
                    "Due diligence automation",
                    "Compliance checking",
                    "Risk scoring",
                    "Regulatory monitoring",
                    "ESG assessment"
                ],
                "verssai_workflows": [
                    WorkflowType.DUE_DILIGENCE_AUTOMATION,
                    WorkflowType.PORTFOLIO_MANAGEMENT
                ]
            }
        }
    
    def _initialize_core_papers(self) -> Dict[str, ResearchEvidence]:
        """Initialize core research papers with highest impact"""
        
        return {
            "graphrag_method": ResearchEvidence(
                paper_id="graphrag_2024",
                title="Graph-Augmented Retrieval for Startup Success Prediction",
                authors=["Zitian Gao", "Yihao Xiao"],
                methodology="Graph Neural Networks + RAG",
                performance_metric="R² = 40.75",
                sample_size=21187,
                relevance_score=0.95,
                citation_count=156
            ),
            
            "fused_llm": ResearchEvidence(
                paper_id="fused_llm_2024",
                title="Fused Large Language Models for Venture Capital Decision Making",
                authors=["Abdurahman Maarouf", "Stefan Feuerriegel", "Nicolas Pröllochs"],
                methodology="Multi-LLM fusion with financial data",
                performance_metric="82.78% AUROC, 7.23x ROI",
                sample_size=10541,
                relevance_score=0.92,
                citation_count=89
            ),
            
            "nature_founder_study": ResearchEvidence(
                paper_id="nature_2023",
                title="Founder Personality and Startup Success",
                authors=["Multiple Authors"],
                methodology="Big Five personality + outcome correlation",
                performance_metric="67% prediction accuracy",
                sample_size=21187,
                relevance_score=0.88,
                citation_count=234
            ),
            
            "deep_learning_synthesis": ResearchEvidence(
                paper_id="dl_synthesis_2024",
                title="Deep Learning Methods for Startup Success Prediction",
                authors=["Multiple Authors"],
                methodology="Systematic literature review and meta-analysis",
                performance_metric="75% literature coverage",
                sample_size=50,
                relevance_score=0.85,
                citation_count=67
            )
        }
    
    def _initialize_methodology_requirements(self) -> Dict[WorkflowType, Dict[str, Any]]:
        """Initialize methodology requirements for each workflow"""
        
        return {
            WorkflowType.FOUNDER_SIGNAL_ASSESSMENT: {
                "required_methodologies": [
                    "Ensemble Learning",
                    "Multi-dimensional Analysis",
                    "Graph Neural Networks",
                    "Personality Assessment"
                ],
                "minimum_sample_size": 1000,
                "target_accuracy": 85,
                "key_metrics": ["Precision", "Recall", "F1-Score", "AUC-ROC"],
                "validation_requirements": [
                    "Cross-validation",
                    "Independent test set",
                    "Temporal validation"
                ]
            },
            
            WorkflowType.DUE_DILIGENCE_AUTOMATION: {
                "required_methodologies": [
                    "Document Processing",
                    "Risk Assessment",
                    "Compliance Checking",
                    "Automated Analysis"
                ],
                "minimum_sample_size": 500,
                "target_accuracy": 85,
                "key_metrics": ["Accuracy", "Processing Time", "Error Rate", "Coverage"],
                "validation_requirements": [
                    "Human expert validation",
                    "Regulatory compliance check",
                    "Stress testing"
                ]
            },
            
            WorkflowType.PORTFOLIO_MANAGEMENT: {
                "required_methodologies": [
                    "Performance Attribution",
                    "Risk Modeling",
                    "Predictive Analytics",
                    "Real-time Tracking"
                ],
                "minimum_sample_size": 200,
                "target_accuracy": 75,
                "key_metrics": ["IRR Prediction", "Risk Assessment", "Attribution Accuracy"],
                "validation_requirements": [
                    "Historical backtesting",
                    "Out-of-sample validation",
                    "Benchmark comparison"
                ]
            },
            
            WorkflowType.FUND_ALLOCATION_OPTIMIZATION: {
                "required_methodologies": [
                    "Monte Carlo Simulation",
                    "Portfolio Optimization",
                    "Risk-Return Analysis",
                    "Scenario Planning"
                ],
                "minimum_sample_size": 100,
                "target_accuracy": 70,
                "key_metrics": ["Alpha Generation", "Sharpe Ratio", "Risk-Adjusted Returns"],
                "validation_requirements": [
                    "Historical backtesting",
                    "Stress testing",
                    "Monte Carlo validation"
                ]
            },
            
            WorkflowType.COMPETITIVE_INTELLIGENCE: {
                "required_methodologies": [
                    "Market Analysis",
                    "Competitive Positioning",
                    "Industry Trends",
                    "Intelligence Gathering"
                ],
                "minimum_sample_size": 300,
                "target_accuracy": 80,
                "key_metrics": ["Market Insight Accuracy", "Trend Prediction", "Coverage"],
                "validation_requirements": [
                    "Market validation",
                    "Expert assessment",
                    "Temporal validation"
                ]
            },
            
            WorkflowType.LP_COMMUNICATION_AUTOMATION: {
                "required_methodologies": [
                    "Report Generation",
                    "Performance Communication",
                    "Automated Updates",
                    "Template Management"
                ],
                "minimum_sample_size": 50,
                "target_accuracy": 90,
                "key_metrics": ["Automation Rate", "Accuracy", "Time Reduction"],
                "validation_requirements": [
                    "LP feedback validation",
                    "Accuracy verification",
                    "Format compliance"
                ]
            }
        }
    
    def get_workflow_research_foundation(self, workflow: WorkflowType) -> Dict[str, Any]:
        """Get complete research foundation for a workflow"""
        
        mapping = self.workflow_mappings[workflow]
        requirements = self.methodology_requirements[workflow]
        
        # Get supporting research categories
        primary_research = []
        for category in mapping.primary_categories:
            if category in self.research_categories:
                primary_research.append(self.research_categories[category])
        
        # Get core supporting papers
        supporting_papers = []
        for paper_id, paper in self.core_papers.items():
            if workflow in self._get_paper_workflow_relevance(paper):
                supporting_papers.append(paper)
        
        return {
            "workflow": workflow.value,
            "academic_foundation": {
                "total_papers": mapping.paper_count,
                "confidence_score": mapping.confidence_score,
                "primary_categories": mapping.primary_categories,
                "secondary_categories": mapping.secondary_categories,
                "research_strength": self._assess_research_strength(mapping.paper_count)
            },
            "supporting_research": {
                "categories": primary_research,
                "core_papers": [
                    {
                        "title": paper.title,
                        "authors": paper.authors,
                        "methodology": paper.methodology,
                        "performance": paper.performance_metric,
                        "sample_size": paper.sample_size,
                        "relevance": paper.relevance_score
                    }
                    for paper in supporting_papers
                ]
            },
            "methodology_requirements": requirements,
            "implementation": {
                "priority": mapping.implementation_priority,
                "target_performance": mapping.target_performance,
                "expected_timeline": self._get_implementation_timeline(mapping.implementation_priority),
                "resource_requirements": self._get_resource_requirements(workflow)
            },
            "competitive_advantage": {
                "vs_academic_baseline": self._get_competitive_advantage(workflow),
                "transparency": "Full research citation for every decision",
                "explainability": "SHAP values + academic paper references",
                "validation": "Continuous benchmarking against latest research"
            }
        }
    
    def get_cross_workflow_synergies(self) -> Dict[str, Any]:
        """Analyze synergies between workflows based on shared research"""
        
        synergies = {}
        
        for workflow1 in WorkflowType:
            for workflow2 in WorkflowType:
                if workflow1 != workflow2:
                    shared_categories = set(self.workflow_mappings[workflow1].primary_categories) & \
                                     set(self.workflow_mappings[workflow2].primary_categories)
                    
                    if shared_categories:
                        synergy_key = f"{workflow1.value}__{workflow2.value}"
                        synergies[synergy_key] = {
                            "workflows": [workflow1.value, workflow2.value],
                            "shared_categories": list(shared_categories),
                            "synergy_strength": len(shared_categories) / 2,  # Normalize by max possible
                            "integration_opportunities": self._identify_integration_opportunities(workflow1, workflow2),
                            "shared_methodologies": self._get_shared_methodologies(workflow1, workflow2)
                        }
        
        return synergies
    
    def validate_workflow_implementation(self, workflow: WorkflowType, 
                                       actual_performance: Dict[str, float]) -> Dict[str, Any]:
        """Validate workflow implementation against research standards"""
        
        requirements = self.methodology_requirements[workflow]
        mapping = self.workflow_mappings[workflow]
        
        validation_results = {
            "workflow": workflow.value,
            "overall_status": "PENDING",
            "validation_score": 0.0,
            "component_validations": {},
            "recommendations": []
        }
        
        # Validate each required metric
        total_score = 0
        validated_metrics = 0
        
        for metric in requirements["key_metrics"]:
            if metric.lower().replace("-", "_") in actual_performance:
                actual_value = actual_performance[metric.lower().replace("-", "_")]
                target_value = requirements["target_accuracy"]
                
                if actual_value >= target_value:
                    score = 1.0
                    status = "EXCEEDS_TARGET"
                elif actual_value >= target_value * 0.9:
                    score = 0.8
                    status = "MEETS_TARGET"
                elif actual_value >= target_value * 0.7:
                    score = 0.6
                    status = "APPROACHING_TARGET"
                else:
                    score = 0.3
                    status = "BELOW_TARGET"
                
                validation_results["component_validations"][metric] = {
                    "actual": actual_value,
                    "target": target_value,
                    "score": score,
                    "status": status
                }
                
                total_score += score
                validated_metrics += 1
        
        # Calculate overall validation score
        if validated_metrics > 0:
            validation_results["validation_score"] = total_score / validated_metrics
            
            if validation_results["validation_score"] >= 0.8:
                validation_results["overall_status"] = "VALIDATED"
            elif validation_results["validation_score"] >= 0.6:
                validation_results["overall_status"] = "CONDITIONALLY_VALIDATED"
            else:
                validation_results["overall_status"] = "REQUIRES_IMPROVEMENT"
        
        # Generate recommendations
        validation_results["recommendations"] = self._generate_validation_recommendations(
            workflow, validation_results["component_validations"]
        )
        
        return validation_results
    
    def _get_paper_workflow_relevance(self, paper: ResearchEvidence) -> List[WorkflowType]:
        """Determine which workflows a paper is relevant to"""
        
        relevant_workflows = []
        
        # This would use NLP/semantic analysis in a real implementation
        # For now, use simple keyword matching
        title_lower = paper.title.lower()
        methodology_lower = paper.methodology.lower()
        
        if any(keyword in title_lower or keyword in methodology_lower 
               for keyword in ["founder", "startup", "assessment", "signal"]):
            relevant_workflows.append(WorkflowType.FOUNDER_SIGNAL_ASSESSMENT)
        
        if any(keyword in title_lower or keyword in methodology_lower 
               for keyword in ["due diligence", "risk", "compliance", "automation"]):
            relevant_workflows.append(WorkflowType.DUE_DILIGENCE_AUTOMATION)
        
        if any(keyword in title_lower or keyword in methodology_lower 
               for keyword in ["portfolio", "management", "performance", "tracking"]):
            relevant_workflows.append(WorkflowType.PORTFOLIO_MANAGEMENT)
        
        if any(keyword in title_lower or keyword in methodology_lower 
               for keyword in ["allocation", "optimization", "fund", "capital"]):
            relevant_workflows.append(WorkflowType.FUND_ALLOCATION_OPTIMIZATION)
        
        return relevant_workflows
    
    def _assess_research_strength(self, paper_count: int) -> str:
        """Assess research strength based on paper count"""
        
        if paper_count >= 500:
            return "EXCEPTIONAL"
        elif paper_count >= 300:
            return "STRONG"
        elif paper_count >= 200:
            return "ADEQUATE"
        elif paper_count >= 100:
            return "MODERATE"
        else:
            return "LIMITED"
    
    def _get_implementation_timeline(self, priority: str) -> str:
        """Get implementation timeline based on priority"""
        
        timelines = {
            "HIGH": "Phase 1 (Months 1-6)",
            "MEDIUM": "Phase 2 (Months 7-12)",
            "LOW": "Phase 3 (Months 13-18)"
        }
        
        return timelines.get(priority, "TBD")
    
    def _get_resource_requirements(self, workflow: WorkflowType) -> Dict[str, Any]:
        """Get resource requirements for workflow implementation"""
        
        base_requirements = {
            "development_time": "2-4 months",
            "team_size": "3-5 developers",
            "infrastructure": "Standard ML infrastructure",
            "data_requirements": "Historical data + real-time feeds"
        }
        
        # Workflow-specific adjustments
        if workflow in [WorkflowType.FOUNDER_SIGNAL_ASSESSMENT, WorkflowType.DUE_DILIGENCE_AUTOMATION]:
            base_requirements["development_time"] = "4-6 months"
            base_requirements["team_size"] = "5-8 developers"
            base_requirements["infrastructure"] = "Advanced ML infrastructure + GPU"
        
        return base_requirements
    
    def _get_competitive_advantage(self, workflow: WorkflowType) -> str:
        """Get competitive advantage description for workflow"""
        
        advantages = {
            WorkflowType.FOUNDER_SIGNAL_ASSESSMENT: "85-92% vs Nature study 67% (multi-dimensional analysis)",
            WorkflowType.DUE_DILIGENCE_AUTOMATION: "85% accuracy + 60% time reduction vs manual processes",
            WorkflowType.PORTFOLIO_MANAGEMENT: "75-85% prediction vs industry average 65%",
            WorkflowType.FUND_ALLOCATION_OPTIMIZATION: "2-4% alpha generation vs market returns",
            WorkflowType.COMPETITIVE_INTELLIGENCE: "80-90% accuracy vs traditional analysis 60%",
            WorkflowType.LP_COMMUNICATION_AUTOMATION: "90% automation vs manual reporting"
        }
        
        return advantages.get(workflow, "Research-backed performance improvement")
    
    def _identify_integration_opportunities(self, workflow1: WorkflowType, workflow2: WorkflowType) -> List[str]:
        """Identify integration opportunities between workflows"""
        
        # This would be more sophisticated in a real implementation
        opportunities = []
        
        if {workflow1, workflow2} == {WorkflowType.FOUNDER_SIGNAL_ASSESSMENT, WorkflowType.DUE_DILIGENCE_AUTOMATION}:
            opportunities.extend([
                "Shared founder analysis for risk assessment",
                "Integrated document processing pipeline",
                "Combined ML models for startup evaluation"
            ])
        
        return opportunities
    
    def _get_shared_methodologies(self, workflow1: WorkflowType, workflow2: WorkflowType) -> List[str]:
        """Get shared methodologies between workflows"""
        
        req1 = self.methodology_requirements[workflow1]["required_methodologies"]
        req2 = self.methodology_requirements[workflow2]["required_methodologies"]
        
        return list(set(req1) & set(req2))
    
    def _generate_validation_recommendations(self, workflow: WorkflowType, 
                                           validations: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on validation results"""
        
        recommendations = []
        
        for metric, result in validations.items():
            if result["status"] == "BELOW_TARGET":
                recommendations.append(f"Improve {metric}: actual {result['actual']:.1f}% vs target {result['target']:.1f}%")
            elif result["status"] == "APPROACHING_TARGET":
                recommendations.append(f"Fine-tune {metric}: close to target, minor optimizations needed")
        
        if not recommendations:
            recommendations.append("Performance meets all academic benchmarks - continue current approach")
        
        return recommendations
