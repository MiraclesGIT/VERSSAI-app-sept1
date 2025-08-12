"""
LangGraph + LangSmith Workflow Orchestrator for VERSSAI VC Intelligence Platform
Provides robust, observable, and trustworthy AI workflow execution with comprehensive reporting
"""
import os
import asyncio
import logging
from typing import TypedDict, Annotated, Sequence, Dict, Any, Optional, List
from datetime import datetime, timedelta
import json
import uuid
from dataclasses import dataclass, asdict

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableLambda
from langgraph.graph import StateGraph, START, END
from langsmith import Client
import operator

# Configure LangSmith for monitoring and observability
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "VERSSAI-VC-Intelligence"
os.environ["LANGCHAIN_API_KEY"] = os.environ.get("OPENAI_API_KEY", "fallback_key")

logger = logging.getLogger(__name__)

@dataclass
class WorkflowMetrics:
    """Comprehensive workflow execution metrics"""
    execution_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    total_duration: Optional[float] = None
    steps_completed: int = 0
    steps_failed: int = 0
    api_calls_made: int = 0
    tokens_consumed: int = 0
    research_sources_found: int = 0
    confidence_score: float = 0.0
    quality_score: float = 0.0
    cost_estimate: float = 0.0

class VCWorkflowState(TypedDict):
    """Enhanced state for VC intelligence workflow with comprehensive tracking"""
    # Core data
    messages: Annotated[Sequence[BaseMessage], operator.add]
    deck_id: str
    company_name: str
    founder_names: List[str]
    industry: str
    
    # Research results
    web_research_results: Dict[str, Any]
    social_research_results: Dict[str, Any]
    ai_analysis_results: Dict[str, Any]
    
    # Workflow control
    current_step: str
    next_step: str
    execution_path: List[str]
    error_log: List[str]
    
    # Quality metrics
    data_quality_score: float
    research_completeness: float
    confidence_level: float
    
    # Execution metadata
    workflow_id: str
    execution_start: datetime
    step_timings: Dict[str, float]
    
    # Final outputs
    investment_recommendation: str
    risk_assessment: Dict[str, Any]
    detailed_analysis: Dict[str, Any]

class LangGraphVCOrchestrator:
    """
    LangGraph-based workflow orchestrator with LangSmith monitoring
    Provides robust, observable VC intelligence workflows
    """
    
    def __init__(self):
        # Initialize LLM with fallback support
        self.llm = self._initialize_llm()
        
        # Initialize LangSmith client for monitoring
        self.langsmith_client = Client()
        
        # Build the workflow graph
        self.workflow_graph = self._build_workflow_graph()
        
        # Initialize metrics storage
        self.execution_metrics: Dict[str, WorkflowMetrics] = {}
        
        logger.info("LangGraph VC Orchestrator initialized with LangSmith monitoring")
    
    def _initialize_llm(self) -> ChatOpenAI:
        """Initialize LLM with proper fallback configuration"""
        try:
            # Try OpenAI first
            if os.environ.get('OPENAI_API_KEY'):
                return ChatOpenAI(
                    model="gpt-4-turbo-preview",
                    temperature=0.0,  # Deterministic for consistency
                    timeout=30,
                    max_retries=3
                )
            else:
                # Fallback to local/mock for development
                logger.warning("No OpenAI API key found, using mock LLM")
                return self._create_mock_llm()
                
        except Exception as e:
            logger.error(f"LLM initialization failed: {e}")
            return self._create_mock_llm()
    
    def _create_mock_llm(self):
        """Create mock LLM for development/testing"""
        class MockLLM:
            def invoke(self, messages):
                return AIMessage(content="Mock analysis result for development")
        return MockLLM()
    
    def _build_workflow_graph(self) -> StateGraph:
        """Build the comprehensive VC intelligence workflow graph"""
        
        workflow = StateGraph(VCWorkflowState)
        
        # Add workflow nodes
        workflow.add_node("initialize_workflow", self._initialize_workflow_node)
        workflow.add_node("extract_deck_data", self._extract_deck_data_node)
        workflow.add_node("web_research", self._web_research_node)
        workflow.add_node("social_research", self._social_research_node)
        workflow.add_node("compile_research", self._compile_research_node)
        workflow.add_node("ai_analysis", self._ai_analysis_node)
        workflow.add_node("quality_assessment", self._quality_assessment_node)
        workflow.add_node("investment_evaluation", self._investment_evaluation_node)
        workflow.add_node("generate_report", self._generate_report_node)
        workflow.add_node("finalize_workflow", self._finalize_workflow_node)
        
        # Define the workflow edges
        workflow.add_edge(START, "initialize_workflow")
        workflow.add_edge("initialize_workflow", "extract_deck_data")
        workflow.add_edge("extract_deck_data", "web_research")
        workflow.add_edge("extract_deck_data", "social_research")
        workflow.add_edge("web_research", "compile_research")
        workflow.add_edge("social_research", "compile_research")
        workflow.add_edge("compile_research", "ai_analysis")
        workflow.add_edge("ai_analysis", "quality_assessment")
        
        # Conditional routing based on quality assessment
        workflow.add_conditional_edges(
            "quality_assessment",
            self._quality_routing_decision,
            {
                "high_quality": "investment_evaluation",
                "medium_quality": "investment_evaluation", 
                "low_quality": "generate_report",  # Skip detailed evaluation for low quality
                "error": "finalize_workflow"
            }
        )
        
        workflow.add_edge("investment_evaluation", "generate_report")
        workflow.add_edge("generate_report", "finalize_workflow")
        workflow.add_edge("finalize_workflow", END)
        
        return workflow.compile()
    
    async def process_deck_with_langraph(self, deck_id: str, deck_file_path: str) -> Dict[str, Any]:
        """
        Process a pitch deck using the LangGraph workflow with comprehensive monitoring
        """
        workflow_id = f"vc_analysis_{deck_id}_{int(datetime.now().timestamp())}"
        
        # Initialize workflow metrics
        metrics = WorkflowMetrics(
            execution_id=workflow_id,
            start_time=datetime.now()
        )
        self.execution_metrics[workflow_id] = metrics
        
        try:
            # Initialize workflow state
            initial_state = VCWorkflowState(
                messages=[HumanMessage(content=f"Analyze pitch deck: {deck_file_path}")],
                deck_id=deck_id,
                company_name="",  # Will be extracted
                founder_names=[],  # Will be extracted
                industry="",  # Will be extracted
                web_research_results={},
                social_research_results={},
                ai_analysis_results={},
                current_step="initialize",
                next_step="extract_deck_data",
                execution_path=[],
                error_log=[],
                data_quality_score=0.0,
                research_completeness=0.0,
                confidence_level=0.0,
                workflow_id=workflow_id,
                execution_start=datetime.now(),
                step_timings={},
                investment_recommendation="PENDING",
                risk_assessment={},
                detailed_analysis={}
            )
            
            logger.info(f"Starting LangGraph workflow execution: {workflow_id}")
            
            # Execute the workflow with LangSmith tracing
            final_state = None
            step_count = 0
            
            for step_output in self.workflow_graph.stream(initial_state):
                step_count += 1
                metrics.steps_completed = step_count
                
                # Log each step for observability
                logger.info(f"Workflow {workflow_id} - Step {step_count}: {list(step_output.keys())}")
                
                # Update final state
                for node_name, node_output in step_output.items():
                    if isinstance(node_output, dict):
                        final_state = node_output
            
            # Finalize metrics
            metrics.end_time = datetime.now()
            metrics.total_duration = (metrics.end_time - metrics.start_time).total_seconds()
            
            # Compile final results with enhanced reporting
            final_results = self._compile_enhanced_results(final_state, metrics)
            
            logger.info(f"LangGraph workflow completed successfully: {workflow_id}")
            return final_results
            
        except Exception as e:
            logger.error(f"LangGraph workflow failed: {workflow_id} - {str(e)}")
            
            # Update metrics for failure
            metrics.end_time = datetime.now()
            metrics.total_duration = (metrics.end_time - metrics.start_time).total_seconds()
            metrics.steps_failed += 1
            
            # Return error state with partial results
            return {
                'workflow_id': workflow_id,
                'status': 'failed',
                'error': str(e),
                'execution_metrics': asdict(metrics),
                'partial_results': final_state if 'final_state' in locals() else {}
            }
    
    def _initialize_workflow_node(self, state: VCWorkflowState) -> Dict[str, Any]:
        """Initialize the workflow with proper tracking"""
        
        step_start = datetime.now()
        
        try:
            # Extract basic information from the initial message
            deck_info = state["messages"][0].content if state["messages"] else ""
            
            # Initialize tracking
            execution_path = state.get("execution_path", [])
            execution_path.append("initialize_workflow")
            
            logger.info(f"Initializing workflow for: {deck_info}")
            
            # Record step timing
            step_timings = state.get("step_timings", {})
            step_timings["initialize_workflow"] = (datetime.now() - step_start).total_seconds()
            
            return {
                "current_step": "initialize_workflow",
                "next_step": "extract_deck_data",
                "execution_path": execution_path,
                "step_timings": step_timings,
                "messages": [AIMessage(content="Workflow initialized successfully")]
            }
            
        except Exception as e:
            error_log = state.get("error_log", [])
            error_log.append(f"Initialize workflow error: {str(e)}")
            
            return {
                "current_step": "initialize_workflow",
                "next_step": "error",
                "error_log": error_log
            }
    
    def _extract_deck_data_node(self, state: VCWorkflowState) -> Dict[str, Any]:
        """Extract data from the pitch deck with AI assistance"""
        
        step_start = datetime.now()
        
        try:
            # Use existing deck extraction logic
            from ai_agents import extract_deck_information
            
            deck_id = state.get("deck_id", "")
            
            # Mock extraction for now - in production this would read the actual file
            extraction_results = {
                "company_name": "TechStartup Inc",  # Would be extracted from deck
                "founders": [{"name": "John Doe"}, {"name": "Jane Smith"}],
                "industry": "SaaS",
                "funding_ask": 2000000,
                "market": "B2B Software"
            }
            
            # Update state with extracted data
            execution_path = state.get("execution_path", [])
            execution_path.append("extract_deck_data")
            
            step_timings = state.get("step_timings", {})
            step_timings["extract_deck_data"] = (datetime.now() - step_start).total_seconds()
            
            logger.info(f"Extracted deck data for {extraction_results.get('company_name', 'Unknown')}")
            
            return {
                "company_name": extraction_results.get("company_name", ""),
                "founder_names": [f.get("name", "") for f in extraction_results.get("founders", [])],
                "industry": extraction_results.get("industry", ""),
                "current_step": "extract_deck_data",
                "next_step": "research",
                "execution_path": execution_path,
                "step_timings": step_timings,
                "messages": [AIMessage(content=f"Extracted data for {extraction_results.get('company_name', 'company')}")]
            }
            
        except Exception as e:
            error_log = state.get("error_log", [])
            error_log.append(f"Deck extraction error: {str(e)}")
            
            return {
                "current_step": "extract_deck_data",
                "next_step": "error",
                "error_log": error_log
            }
    
    def _web_research_node(self, state: VCWorkflowState) -> Dict[str, Any]:
        """Conduct web research using Google Search API"""
        
        step_start = datetime.now()
        
        try:
            from google_search_service import google_search_service
            
            company_name = state.get("company_name", "")
            industry = state.get("industry", "")
            
            # Conduct company research
            if company_name:
                web_results = asyncio.run(
                    google_search_service.search_company_intelligence(company_name, industry)
                )
                
                # Update metrics
                metrics = self.execution_metrics.get(state.get("workflow_id", ""))
                if metrics:
                    metrics.api_calls_made += 1
                    metrics.research_sources_found += len(web_results.get("all_sources", []))
            else:
                web_results = {"error": "No company name provided"}
            
            execution_path = state.get("execution_path", [])
            execution_path.append("web_research")
            
            step_timings = state.get("step_timings", {})
            step_timings["web_research"] = (datetime.now() - step_start).total_seconds()
            
            logger.info(f"Completed web research for {company_name}")
            
            return {
                "web_research_results": web_results,
                "current_step": "web_research", 
                "execution_path": execution_path,
                "step_timings": step_timings,
                "messages": [AIMessage(content=f"Web research completed for {company_name}")]
            }
            
        except Exception as e:
            error_log = state.get("error_log", [])
            error_log.append(f"Web research error: {str(e)}")
            
            return {
                "web_research_results": {"error": str(e)},
                "current_step": "web_research",
                "error_log": error_log
            }
    
    def _social_research_node(self, state: VCWorkflowState) -> Dict[str, Any]:
        """Conduct social media research using Twitter API"""
        
        step_start = datetime.now()
        
        try:
            from twitter_search_service import twitter_search_service
            
            company_name = state.get("company_name", "")
            
            # Conduct social research
            if company_name:
                social_results = asyncio.run(
                    twitter_search_service.search_company_social_signals(company_name)
                )
                
                # Update metrics
                metrics = self.execution_metrics.get(state.get("workflow_id", ""))
                if metrics:
                    metrics.api_calls_made += 1
            else:
                social_results = {"error": "No company name provided"}
            
            execution_path = state.get("execution_path", [])
            execution_path.append("social_research")
            
            step_timings = state.get("step_timings", {})
            step_timings["social_research"] = (datetime.now() - step_start).total_seconds()
            
            logger.info(f"Completed social research for {company_name}")
            
            return {
                "social_research_results": social_results,
                "current_step": "social_research",
                "execution_path": execution_path, 
                "step_timings": step_timings,
                "messages": [AIMessage(content=f"Social research completed for {company_name}")]
            }
            
        except Exception as e:
            error_log = state.get("error_log", [])
            error_log.append(f"Social research error: {str(e)}")
            
            return {
                "social_research_results": {"error": str(e)},
                "current_step": "social_research",
                "error_log": error_log
            }
    
    def _compile_research_node(self, state: VCWorkflowState) -> Dict[str, Any]:
        """Compile and analyze research results"""
        
        step_start = datetime.now()
        
        try:
            web_results = state.get("web_research_results", {})
            social_results = state.get("social_research_results", {})
            
            # Calculate research completeness score
            completeness_score = 0.0
            
            # Web research scoring
            if not web_results.get("error"):
                web_sources = len(web_results.get("all_sources", []))
                completeness_score += min(web_sources / 10, 0.5)  # Max 0.5 for web
            
            # Social research scoring  
            if not social_results.get("error"):
                social_mentions = social_results.get("mentions", {}).get("total_mentions", 0)
                completeness_score += min(social_mentions / 20, 0.5)  # Max 0.5 for social
            
            execution_path = state.get("execution_path", [])
            execution_path.append("compile_research")
            
            step_timings = state.get("step_timings", {})
            step_timings["compile_research"] = (datetime.now() - step_start).total_seconds()
            
            logger.info(f"Research compilation completed - Completeness: {completeness_score:.2f}")
            
            return {
                "research_completeness": completeness_score,
                "current_step": "compile_research",
                "next_step": "ai_analysis",
                "execution_path": execution_path,
                "step_timings": step_timings,
                "messages": [AIMessage(content=f"Research compiled - {completeness_score:.1%} complete")]
            }
            
        except Exception as e:
            error_log = state.get("error_log", [])
            error_log.append(f"Research compilation error: {str(e)}")
            
            return {
                "current_step": "compile_research",
                "next_step": "error",
                "error_log": error_log
            }
    
    def _ai_analysis_node(self, state: VCWorkflowState) -> Dict[str, Any]:
        """Perform AI-powered analysis of all collected data"""
        
        step_start = datetime.now()
        
        try:
            # Compile all available data for analysis
            analysis_context = {
                "company_name": state.get("company_name", ""),
                "industry": state.get("industry", ""),
                "founders": state.get("founder_names", []),
                "web_research": state.get("web_research_results", {}),
                "social_research": state.get("social_research_results", {}),
                "research_completeness": state.get("research_completeness", 0.0)
            }
            
            # Create analysis prompt
            analysis_prompt = PromptTemplate.from_template("""
            Analyze the following VC intelligence data and provide a comprehensive assessment:
            
            Company: {company_name}
            Industry: {industry}
            Founders: {founders}
            Research Completeness: {research_completeness:.1%}
            
            Web Research Summary: {web_summary}
            Social Research Summary: {social_summary}
            
            Provide analysis including:
            1. Investment recommendation (STRONG_BUY/BUY/HOLD/PASS)
            2. Confidence level (HIGH/MEDIUM/LOW)
            3. Key strengths (3-5 points)
            4. Risk factors (3-5 points)
            5. Market validation score (1-10)
            """)
            
            # Simplify data for prompt
            web_summary = self._summarize_web_research(analysis_context["web_research"])
            social_summary = self._summarize_social_research(analysis_context["social_research"])
            
            # Generate AI analysis
            try:
                analysis_result = self.llm.invoke(
                    analysis_prompt.format(
                        company_name=analysis_context["company_name"],
                        industry=analysis_context["industry"],
                        founders=", ".join(analysis_context["founders"]),
                        research_completeness=analysis_context["research_completeness"],
                        web_summary=web_summary,
                        social_summary=social_summary
                    )
                )
                
                ai_analysis = {"analysis": analysis_result.content if hasattr(analysis_result, 'content') else str(analysis_result)}
                
                # Update metrics
                metrics = self.execution_metrics.get(state.get("workflow_id", ""))
                if metrics:
                    metrics.api_calls_made += 1
                    metrics.tokens_consumed += 500  # Estimate
                    
            except Exception as llm_error:
                logger.warning(f"LLM analysis failed, using fallback: {llm_error}")
                ai_analysis = {"analysis": "Fallback analysis based on available data", "fallback": True}
            
            execution_path = state.get("execution_path", [])
            execution_path.append("ai_analysis")
            
            step_timings = state.get("step_timings", {})
            step_timings["ai_analysis"] = (datetime.now() - step_start).total_seconds()
            
            logger.info("AI analysis completed")
            
            return {
                "ai_analysis_results": ai_analysis,
                "current_step": "ai_analysis",
                "next_step": "quality_assessment", 
                "execution_path": execution_path,
                "step_timings": step_timings,
                "messages": [AIMessage(content="AI analysis completed")]
            }
            
        except Exception as e:
            error_log = state.get("error_log", [])
            error_log.append(f"AI analysis error: {str(e)}")
            
            return {
                "ai_analysis_results": {"error": str(e)},
                "current_step": "ai_analysis",
                "next_step": "error",
                "error_log": error_log
            }
    
    def _quality_assessment_node(self, state: VCWorkflowState) -> Dict[str, Any]:
        """Assess the overall quality of the analysis"""
        
        step_start = datetime.now()
        
        try:
            # Calculate quality metrics
            research_completeness = state.get("research_completeness", 0.0)
            error_count = len(state.get("error_log", []))
            has_ai_analysis = bool(state.get("ai_analysis_results", {}).get("analysis"))
            
            # Quality scoring algorithm
            quality_score = 0.0
            
            # Research completeness (40% of score)
            quality_score += research_completeness * 0.4
            
            # Error penalty (20% deduction max)
            error_penalty = min(error_count * 0.05, 0.2)
            quality_score -= error_penalty
            
            # AI analysis completion (40% of score)
            if has_ai_analysis:
                quality_score += 0.4
            
            # Confidence level based on quality
            if quality_score >= 0.8:
                confidence_level = "HIGH"
                data_quality = "high_quality"
            elif quality_score >= 0.6:
                confidence_level = "MEDIUM"
                data_quality = "medium_quality" 
            elif quality_score >= 0.3:
                confidence_level = "LOW"
                data_quality = "low_quality"
            else:
                confidence_level = "VERY_LOW"
                data_quality = "error"
            
            execution_path = state.get("execution_path", [])
            execution_path.append("quality_assessment")
            
            step_timings = state.get("step_timings", {})
            step_timings["quality_assessment"] = (datetime.now() - step_start).total_seconds()
            
            # Update metrics
            metrics = self.execution_metrics.get(state.get("workflow_id", ""))
            if metrics:
                metrics.quality_score = quality_score
                metrics.confidence_score = quality_score
            
            logger.info(f"Quality assessment completed - Score: {quality_score:.2f}, Level: {confidence_level}")
            
            return {
                "data_quality_score": quality_score,
                "confidence_level": confidence_level,
                "current_step": "quality_assessment",
                "next_step": data_quality,
                "execution_path": execution_path,
                "step_timings": step_timings,
                "messages": [AIMessage(content=f"Quality assessment: {confidence_level} ({quality_score:.1%})")]
            }
            
        except Exception as e:
            error_log = state.get("error_log", [])
            error_log.append(f"Quality assessment error: {str(e)}")
            
            return {
                "current_step": "quality_assessment",
                "next_step": "error",
                "error_log": error_log
            }
    
    def _investment_evaluation_node(self, state: VCWorkflowState) -> Dict[str, Any]:
        """Generate final investment evaluation and recommendation"""
        
        step_start = datetime.now()
        
        try:
            # Extract key data for evaluation
            company_name = state.get("company_name", "Unknown")
            confidence_level = state.get("confidence_level", "MEDIUM")
            quality_score = state.get("data_quality_score", 0.5)
            ai_analysis = state.get("ai_analysis_results", {})
            
            # Generate investment recommendation based on available data
            if quality_score >= 0.8:
                recommendation = "BUY"
                recommendation_reason = "Strong data quality and positive signals"
            elif quality_score >= 0.6:
                recommendation = "HOLD"
                recommendation_reason = "Moderate data quality, requires deeper analysis"
            else:
                recommendation = "PASS"
                recommendation_reason = "Insufficient data quality for investment decision"
            
            # Risk assessment
            risk_factors = []
            if confidence_level == "LOW":
                risk_factors.append("Low confidence due to limited research data")
            if state.get("error_log"):
                risk_factors.append("Data collection errors encountered")
            
            risk_assessment = {
                "overall_risk": "MEDIUM" if len(risk_factors) <= 1 else "HIGH",
                "risk_factors": risk_factors,
                "mitigation_recommendations": [
                    "Conduct additional due diligence",
                    "Verify research findings through alternative sources"
                ]
            }
            
            execution_path = state.get("execution_path", [])
            execution_path.append("investment_evaluation")
            
            step_timings = state.get("step_timings", {})
            step_timings["investment_evaluation"] = (datetime.now() - step_start).total_seconds()
            
            logger.info(f"Investment evaluation completed - Recommendation: {recommendation}")
            
            return {
                "investment_recommendation": recommendation,
                "risk_assessment": risk_assessment,
                "current_step": "investment_evaluation",
                "next_step": "generate_report",
                "execution_path": execution_path,
                "step_timings": step_timings,
                "messages": [AIMessage(content=f"Investment recommendation: {recommendation}")]
            }
            
        except Exception as e:
            error_log = state.get("error_log", [])
            error_log.append(f"Investment evaluation error: {str(e)}")
            
            return {
                "investment_recommendation": "ERROR",
                "current_step": "investment_evaluation",
                "next_step": "error",
                "error_log": error_log
            }
    
    def _generate_report_node(self, state: VCWorkflowState) -> Dict[str, Any]:
        """Generate comprehensive analysis report"""
        
        step_start = datetime.now()
        
        try:
            # Compile detailed analysis
            detailed_analysis = {
                "executive_summary": {
                    "company": state.get("company_name", "Unknown"),
                    "industry": state.get("industry", "Unknown"),
                    "recommendation": state.get("investment_recommendation", "PENDING"),
                    "confidence": state.get("confidence_level", "MEDIUM"),
                    "quality_score": state.get("data_quality_score", 0.0)
                },
                "research_findings": {
                    "web_research_completed": bool(state.get("web_research_results", {}).get("all_sources")),
                    "social_research_completed": bool(state.get("social_research_results", {}).get("mentions")),
                    "research_completeness": state.get("research_completeness", 0.0),
                    "total_sources": self._count_research_sources(state)
                },
                "ai_insights": state.get("ai_analysis_results", {}),
                "risk_assessment": state.get("risk_assessment", {}),
                "workflow_performance": {
                    "steps_completed": len(state.get("execution_path", [])),
                    "errors_encountered": len(state.get("error_log", [])),
                    "execution_time": sum(state.get("step_timings", {}).values())
                }
            }
            
            execution_path = state.get("execution_path", [])
            execution_path.append("generate_report")
            
            step_timings = state.get("step_timings", {})
            step_timings["generate_report"] = (datetime.now() - step_start).total_seconds()
            
            logger.info("Comprehensive report generated")
            
            return {
                "detailed_analysis": detailed_analysis,
                "current_step": "generate_report",
                "next_step": "finalize_workflow",
                "execution_path": execution_path,
                "step_timings": step_timings,
                "messages": [AIMessage(content="Comprehensive analysis report generated")]
            }
            
        except Exception as e:
            error_log = state.get("error_log", [])
            error_log.append(f"Report generation error: {str(e)}")
            
            return {
                "detailed_analysis": {"error": str(e)},
                "current_step": "generate_report",
                "next_step": "error",
                "error_log": error_log
            }
    
    def _finalize_workflow_node(self, state: VCWorkflowState) -> Dict[str, Any]:
        """Finalize workflow execution with comprehensive logging"""
        
        step_start = datetime.now()
        
        try:
            workflow_id = state.get("workflow_id", "")
            
            # Update final metrics
            metrics = self.execution_metrics.get(workflow_id)
            if metrics:
                metrics.end_time = datetime.now()
                metrics.total_duration = (metrics.end_time - metrics.start_time).total_seconds()
                
                # Calculate cost estimate (mock)
                metrics.cost_estimate = metrics.api_calls_made * 0.02 + metrics.tokens_consumed * 0.00001
            
            execution_path = state.get("execution_path", [])
            execution_path.append("finalize_workflow")
            
            step_timings = state.get("step_timings", {})
            step_timings["finalize_workflow"] = (datetime.now() - step_start).total_seconds()
            
            # Log final workflow completion to LangSmith
            logger.info(f"Workflow {workflow_id} finalized successfully")
            
            return {
                "current_step": "finalize_workflow",
                "next_step": "completed",
                "execution_path": execution_path,
                "step_timings": step_timings,
                "workflow_status": "completed",
                "messages": [AIMessage(content="Workflow completed successfully")]
            }
            
        except Exception as e:
            error_log = state.get("error_log", [])
            error_log.append(f"Workflow finalization error: {str(e)}")
            
            return {
                "current_step": "finalize_workflow",
                "next_step": "error",
                "error_log": error_log,
                "workflow_status": "failed"
            }
    
    def _quality_routing_decision(self, state: VCWorkflowState) -> str:
        """Determine routing based on quality assessment"""
        return state.get("next_step", "error")
    
    def _summarize_web_research(self, web_research: Dict[str, Any]) -> str:
        """Summarize web research for AI analysis"""
        if web_research.get("error"):
            return f"Web research error: {web_research['error']}"
        
        sources_count = len(web_research.get("all_sources", []))
        funding_info = len(web_research.get("funding_information", []))
        
        return f"{sources_count} web sources found, {funding_info} funding mentions"
    
    def _summarize_social_research(self, social_research: Dict[str, Any]) -> str:
        """Summarize social research for AI analysis"""
        if social_research.get("error"):
            return f"Social research error: {social_research['error']}"
        
        mentions = social_research.get("mentions", {}).get("total_mentions", 0)
        sentiment = social_research.get("sentiment_analysis", {}).get("overall_sentiment", "neutral")
        
        return f"{mentions} social mentions, {sentiment} sentiment"
    
    def _count_research_sources(self, state: VCWorkflowState) -> int:
        """Count total research sources found"""
        web_sources = len(state.get("web_research_results", {}).get("all_sources", []))
        social_mentions = state.get("social_research_results", {}).get("mentions", {}).get("total_mentions", 0)
        return web_sources + social_mentions
    
    def _compile_enhanced_results(self, final_state: Dict[str, Any], metrics: WorkflowMetrics) -> Dict[str, Any]:
        """Compile enhanced results with comprehensive reporting"""
        
        return {
            # Core results
            "workflow_id": final_state.get("workflow_id", ""),
            "status": "completed",
            "company": final_state.get("company_name", "Unknown"),
            "industry": final_state.get("industry", "Unknown"),
            "recommendation": final_state.get("investment_recommendation", "PENDING"),
            
            # Enhanced reporting
            "execution_metrics": asdict(metrics),
            "quality_assessment": {
                "data_quality_score": final_state.get("data_quality_score", 0.0),
                "research_completeness": final_state.get("research_completeness", 0.0),
                "confidence_level": final_state.get("confidence_level", "MEDIUM")
            },
            
            # Detailed analysis
            "detailed_analysis": final_state.get("detailed_analysis", {}),
            "risk_assessment": final_state.get("risk_assessment", {}),
            
            # Research results
            "research_results": {
                "web_research": final_state.get("web_research_results", {}),
                "social_research": final_state.get("social_research_results", {}),
                "ai_analysis": final_state.get("ai_analysis_results", {})
            },
            
            # Workflow transparency
            "execution_path": final_state.get("execution_path", []),
            "step_timings": final_state.get("step_timings", {}),
            "error_log": final_state.get("error_log", []),
            
            # Observability
            "langsmith_project": os.environ.get("LANGCHAIN_PROJECT", ""),
            "tracing_enabled": os.environ.get("LANGCHAIN_TRACING_V2", "false") == "true"
        }
    
    def get_workflow_analytics(self) -> Dict[str, Any]:
        """Get comprehensive workflow analytics"""
        
        total_workflows = len(self.execution_metrics)
        completed_workflows = sum(1 for m in self.execution_metrics.values() if m.end_time is not None)
        
        if total_workflows == 0:
            return {"message": "No workflows executed yet"}
        
        avg_duration = sum(m.total_duration for m in self.execution_metrics.values() if m.total_duration) / max(completed_workflows, 1)
        total_api_calls = sum(m.api_calls_made for m in self.execution_metrics.values())
        total_cost = sum(m.cost_estimate for m in self.execution_metrics.values())
        
        return {
            "total_workflows": total_workflows,
            "completed_workflows": completed_workflows,
            "success_rate": completed_workflows / total_workflows * 100,
            "average_duration": avg_duration,
            "total_api_calls": total_api_calls,
            "total_cost_estimate": total_cost,
            "recent_executions": [
                {
                    "execution_id": metrics.execution_id,
                    "duration": metrics.total_duration,
                    "quality_score": metrics.quality_score,
                    "api_calls": metrics.api_calls_made
                }
                for metrics in list(self.execution_metrics.values())[-5:]  # Last 5 executions
            ]
        }

# Global orchestrator instance
langraph_orchestrator = LangGraphVCOrchestrator()

# Convenience function for integration
async def process_deck_with_langraph(deck_id: str, deck_file_path: str) -> Dict[str, Any]:
    """Process a deck using the LangGraph orchestrator"""
    return await langraph_orchestrator.process_deck_with_langraph(deck_id, deck_file_path)

def get_workflow_analytics() -> Dict[str, Any]:
    """Get workflow analytics"""
    return langraph_orchestrator.get_workflow_analytics()