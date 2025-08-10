"""
Database configuration and models for VERSSAI VC Platform
"""
import os
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, DateTime, Text, JSON, Numeric, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base  
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime
from pydantic import BaseModel, Field

# Database URL from environment
POSTGRES_URL = os.environ.get('POSTGRES_URL', 'postgresql://postgres@localhost:5432/verssai_vc')

# SQLAlchemy setup
engine = create_engine(POSTGRES_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# SQLAlchemy Models

class FounderDeck(Base):
    __tablename__ = "founder_decks"
    
    deck_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String(255))
    upload_date = Column(DateTime, default=func.now())
    file_url = Column(Text)
    file_path = Column(Text)
    file_size = Column(Integer)
    page_count = Column(Integer)
    status = Column(String(50), default='processing')
    uploaded_by = Column(String(255))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now())
    
    # Relationships
    extractions = relationship("DeckExtraction", back_populates="deck")
    signals = relationship("FounderSignal", back_populates="deck")

class DeckExtraction(Base):
    __tablename__ = "deck_extractions"
    
    extraction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deck_id = Column(UUID(as_uuid=True), ForeignKey('founder_decks.deck_id', ondelete='CASCADE'))
    founders = Column(JSON)  # [{name, role, linkedin, email}]
    company_website = Column(Text)
    company_linkedin = Column(Text)
    problem_statement = Column(Text)
    solution_description = Column(Text)
    market_size = Column(JSON)
    business_model = Column(Text)
    traction_metrics = Column(JSON)
    team_size = Column(Integer)
    funding_ask = Column(Numeric(15,2))
    funding_stage = Column(String(50))
    extraction_confidence = Column(Numeric(5,2))
    extraction_method = Column(String(100))
    extracted_at = Column(DateTime, default=func.now())
    
    # Relationships
    deck = relationship("FounderDeck", back_populates="extractions")

class FounderSignal(Base):
    __tablename__ = "founder_signals"
    
    signal_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deck_id = Column(UUID(as_uuid=True), ForeignKey('founder_decks.deck_id', ondelete='CASCADE'))
    founder_name = Column(String(255))
    founder_role = Column(String(100))
    linkedin_data = Column(JSON)
    education_score = Column(Numeric(5,2))
    experience_score = Column(Numeric(5,2))
    network_quality_score = Column(Numeric(5,2))
    online_presence_score = Column(Numeric(5,2))
    media_mentions = Column(Integer, default=0)
    github_activity = Column(JSON)
    technical_fit = Column(Numeric(5,2))
    market_fit = Column(Numeric(5,2))
    execution_capability = Column(Numeric(5,2))
    overall_signal_score = Column(Numeric(5,2))
    confidence_level = Column(Numeric(5,2))
    risk_factors = Column(JSON)
    positive_signals = Column(JSON)
    recommendation = Column(String(20))  # STRONG, POSITIVE, NEUTRAL, NEGATIVE
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    deck = relationship("FounderDeck", back_populates="signals")

class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"
    
    execution_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_name = Column(String(255))
    workflow_type = Column(String(100))
    entity_id = Column(UUID(as_uuid=True))
    status = Column(String(50))
    input_data = Column(JSON)
    output_data = Column(JSON)
    error_message = Column(Text)
    started_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime)
    duration_seconds = Column(Integer)

# Pydantic Models for API

class FounderDeckCreate(BaseModel):
    company_name: str
    file_url: str
    file_path: str
    file_size: int
    uploaded_by: Optional[str] = None

class FounderDeckResponse(BaseModel):
    deck_id: str
    company_name: str
    upload_date: datetime
    file_url: str
    file_size: int
    status: str
    uploaded_by: Optional[str]
    
    class Config:
        from_attributes = True

class DeckExtractionCreate(BaseModel):
    deck_id: str
    founders: List[Dict[str, Any]]
    company_website: Optional[str] = None
    company_linkedin: Optional[str] = None
    problem_statement: Optional[str] = None
    solution_description: Optional[str] = None
    market_size: Optional[Dict[str, Any]] = None
    business_model: Optional[str] = None
    traction_metrics: Optional[Dict[str, Any]] = None
    team_size: Optional[int] = None
    funding_ask: Optional[float] = None
    funding_stage: Optional[str] = None
    extraction_confidence: Optional[float] = None

class FounderSignalCreate(BaseModel):
    deck_id: str
    founder_name: str
    founder_role: str
    linkedin_data: Optional[Dict[str, Any]] = None
    education_score: Optional[float] = None
    experience_score: Optional[float] = None
    network_quality_score: Optional[float] = None
    online_presence_score: Optional[float] = None
    media_mentions: Optional[int] = 0
    github_activity: Optional[Dict[str, Any]] = None
    technical_fit: Optional[float] = None
    market_fit: Optional[float] = None
    execution_capability: Optional[float] = None
    overall_signal_score: Optional[float] = None
    confidence_level: Optional[float] = None
    risk_factors: Optional[List[str]] = None
    positive_signals: Optional[List[str]] = None
    recommendation: Optional[str] = None

class FounderSignalResponse(BaseModel):
    signal_id: str
    deck_id: str
    founder_name: str
    founder_role: str
    education_score: Optional[float]
    experience_score: Optional[float]
    network_quality_score: Optional[float]
    online_presence_score: Optional[float]
    technical_fit: Optional[float]
    market_fit: Optional[float]
    execution_capability: Optional[float]
    overall_signal_score: Optional[float]
    recommendation: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class WorkflowExecutionCreate(BaseModel):
    workflow_name: str
    workflow_type: str
    entity_id: str
    input_data: Dict[str, Any]

class WorkflowExecutionResponse(BaseModel):
    execution_id: str
    workflow_name: str
    workflow_type: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime]
    duration_seconds: Optional[int]
    
    class Config:
        from_attributes = True