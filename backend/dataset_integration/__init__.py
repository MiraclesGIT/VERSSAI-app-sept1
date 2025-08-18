"""
VERSSAI Master Dataset Integration Module
Provides academic foundation for all 6 VC workflows with research-backed credibility
"""

from .master_dataset_loader import VERSSAIMasterDatasetLoader
from .research_foundation import ResearchFoundationEngine
from .academic_validation import AcademicValidationSystem
from .workflow_mapping import WorkflowResearchMapper
from .performance_benchmarks import PerformanceBenchmarkEngine

__all__ = [
    'VERSSAIMasterDatasetLoader',
    'ResearchFoundationEngine', 
    'AcademicValidationSystem',
    'WorkflowResearchMapper',
    'PerformanceBenchmarkEngine'
]
