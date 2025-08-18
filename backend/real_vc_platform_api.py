#!/usr/bin/env python3
"""
Real VC Platform Backend - Complete Venture Capital Operations System
Handles deal flow, portfolio management, financial tracking, and AI-powered insights
"""

import os
import uuid
import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from decimal import Decimal

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import asyncpg
import redis
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import pandas as pd
import numpy as np

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://verssai_user:verssai_secure_password_2024@localhost:5432/verssai_vc")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="Real VC Platform API",
    description="Complete venture capital operations platform with AI-powered insights",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database models
Base = declarative_base()

class Fund(Base):
    __tablename__ = "funds"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    vintage = Column(String, nullable=False)
    total_commitments = Column(Float, nullable=False)
    total_deployed = Column(Float, default=0.0)
    management_fee = Column(Float, default=0.02)
    carry_percentage = Column(Float, default=0.20)
    created_at = Column(DateTime, default=datetime.utcnow)

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    website = Column(String)
    sector = Column(String, nullable=False)
    location = Column(String, nullable=False)
    founded_date = Column(DateTime)
    description = Column(Text)
    logo_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Deal(Base):
    __tablename__ = "deals"
    
    id = Column(String, primary_key=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    fund_id = Column(String, ForeignKey("funds.id"), nullable=False)
    stage = Column(String, nullable=False)  # Lead, Interest, DD, Term_Sheet, Closed
    ask_amount = Column(Float, nullable=False)
    pre_money_valuation = Column(Float)
    lead_source = Column(String)
    deal_score = Column(Integer)
    assigned_partner = Column(String)
    next_milestone = Column(String)
    timeline_weeks = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Investment(Base):
    __tablename__ = "investments"
    
    id = Column(String, primary_key=True)
    deal_id = Column(String, ForeignKey("deals.id"), nullable=False)
    fund_id = Column(String, ForeignKey("funds.id"), nullable=False)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    investment_amount = Column(Float, nullable=False)
    ownership_percentage = Column(Float, nullable=False)
    investment_date = Column(DateTime, nullable=False)
    security_type = Column(String, default="Preferred")
    liquidation_preference = Column(Float, default=1.0)
    anti_dilution = Column(String, default="Weighted Average")
    created_at = Column(DateTime, default=datetime.utcnow)

class PortfolioCompany(Base):
    __tablename__ = "portfolio_companies"
    
    id = Column(String, primary_key=True)
    investment_id = Column(String, ForeignKey("investments.id"), nullable=False)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    current_valuation = Column(Float)
    status = Column(String, default="Active")  # Active, Scaling, Challenged, Exited
    board_meeting_frequency = Column(String, default="Quarterly")
    next_board_meeting = Column(DateTime)
    updated_at = Column(DateTime, default=datetime.utcnow)

class FinancialMetrics(Base):
    __tablename__ = "financial_metrics"
    
    id = Column(String, primary_key=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    metric_date = Column(DateTime, nullable=False)
    revenue = Column(Float)
    growth_rate = Column(Float)
    burn_rate = Column(Float)
    runway_months = Column(Integer)
    employees = Column(Integer)
    customers = Column(Integer)
    arr = Column(Float)  # Annual Recurring Revenue
    churn_rate = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic models
class DealCreate(BaseModel):
    company_name: str
    founder_name: str
    sector: str
    location: str
    ask_amount: float
    pre_money_valuation: Optional[float] = None
    lead_source: str
    description: Optional[str] = None

class DealUpdate(BaseModel):
    stage: Optional[str] = None
    deal_score: Optional[int] = None
    next_milestone: Optional[str] = None
    timeline_weeks: Optional[int] = None
    notes: Optional[str] = None

class InvestmentCreate(BaseModel):
    deal_id: str
    investment_amount: float
    ownership_percentage: float
    investment_date: datetime
    security_type: str = "Preferred"

class FinancialMetricsUpdate(BaseModel):
    company_id: str
    revenue: Optional[float] = None
    growth_rate: Optional[float] = None
    burn_rate: Optional[float] = None
    runway_months: Optional[int] = None
    employees: Optional[int] = None
    customers: Optional[int] = None
    arr: Optional[float] = None
    churn_rate: Optional[float] = None

# Database setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

# Redis setup
redis_client = redis.from_url(REDIS_URL)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# AI-powered deal scoring service
class DealScoringEngine:
    def __init__(self):
        self.weights = {
            'team_score': 0.30,
            'market_score': 0.25, 
            'traction_score': 0.25,
            'financial_score': 0.20
        }
    
    def calculate_team_score(self, deal_data: dict) -> float:
        """Score team based on experience, education, previous exits"""
        score = 50  # Base score
        
        # Previous startup experience
        if deal_data.get('founder_previous_startups', 0) > 0:
            score += 20
        
        # Education (top tier universities)
        if deal_data.get('founder_education_tier') == 'top':
            score += 15
        
        # Previous exits
        if deal_data.get('founder_previous_exits', 0) > 0:
            score += 25
        
        # Team completeness
        team_size = deal_data.get('team_size', 1)
        if team_size >= 3:
            score += 10
        
        return min(100, score)
    
    def calculate_market_score(self, deal_data: dict) -> float:
        """Score market opportunity and timing"""
        score = 40  # Base score
        
        # Market size
        market_size = deal_data.get('tam_billions', 0)
        if market_size >= 10:
            score += 30
        elif market_size >= 1:
            score += 20
        elif market_size >= 0.1:
            score += 10
        
        # Market growth
        market_growth = deal_data.get('market_growth_rate', 0)
        if market_growth >= 20:
            score += 20
        elif market_growth >= 10:
            score += 10
        
        # Competition level
        competition = deal_data.get('competition_level', 'high')
        if competition == 'low':
            score += 15
        elif competition == 'medium':
            score += 10
        
        return min(100, score)
    
    def calculate_traction_score(self, deal_data: dict) -> float:
        """Score current traction and growth"""
        score = 30  # Base score
        
        # Revenue
        revenue = deal_data.get('annual_revenue', 0)
        if revenue >= 10000000:  # $10M+
            score += 30
        elif revenue >= 1000000:  # $1M+
            score += 25
        elif revenue >= 100000:  # $100K+
            score += 15
        elif revenue > 0:
            score += 10
        
        # Growth rate
        growth_rate = deal_data.get('revenue_growth_rate', 0)
        if growth_rate >= 300:
            score += 25
        elif growth_rate >= 100:
            score += 20
        elif growth_rate >= 50:
            score += 15
        elif growth_rate > 0:
            score += 10
        
        # Customer metrics
        customers = deal_data.get('total_customers', 0)
        if customers >= 1000:
            score += 15
        elif customers >= 100:
            score += 10
        elif customers >= 10:
            score += 5
        
        return min(100, score)
    
    def calculate_financial_score(self, deal_data: dict) -> float:
        """Score financial health and unit economics"""
        score = 40  # Base score
        
        # Burn rate efficiency
        revenue = deal_data.get('annual_revenue', 0)
        burn_rate = deal_data.get('monthly_burn_rate', 1)
        if revenue > 0 and burn_rate > 0:
            revenue_per_burn = (revenue / 12) / burn_rate
            if revenue_per_burn >= 1:
                score += 25
            elif revenue_per_burn >= 0.5:
                score += 15
            elif revenue_per_burn >= 0.2:
                score += 10
        
        # Runway
        runway_months = deal_data.get('runway_months', 0)
        if runway_months >= 24:
            score += 20
        elif runway_months >= 12:
            score += 15
        elif runway_months >= 6:
            score += 10
        
        # Unit economics
        ltv_cac = deal_data.get('ltv_cac_ratio', 0)
        if ltv_cac >= 3:
            score += 15
        elif ltv_cac >= 2:
            score += 10
        
        return min(100, score)
    
    def calculate_overall_score(self, deal_data: dict) -> int:
        """Calculate weighted overall deal score"""
        team_score = self.calculate_team_score(deal_data)
        market_score = self.calculate_market_score(deal_data)
        traction_score = self.calculate_traction_score(deal_data)
        financial_score = self.calculate_financial_score(deal_data)
        
        overall_score = (
            team_score * self.weights['team_score'] +
            market_score * self.weights['market_score'] +
            traction_score * self.weights['traction_score'] +
            financial_score * self.weights['financial_score']
        )
        
        return round(overall_score)

# Initialize scoring engine
scoring_engine = DealScoringEngine()

# Fund performance calculator
class FundPerformanceCalculator:
    @staticmethod
    def calculate_irr(cash_flows: List[tuple], periods: List[int]) -> float:
        """Calculate Internal Rate of Return using numpy"""
        try:
            # Convert to numpy arrays for calculation
            cf_array = np.array([cf[1] for cf in cash_flows])
            # Simple IRR approximation for demo
            if len(cf_array) < 2:
                return 0.0
            
            # Basic IRR calculation (simplified)
            total_invested = sum(cf for cf in cf_array if cf < 0)
            total_returned = sum(cf for cf in cf_array if cf > 0)
            
            if total_invested == 0:
                return 0.0
            
            multiple = abs(total_returned / total_invested)
            years = max(periods) / 12 if periods else 1
            
            irr = (multiple ** (1/years) - 1) * 100
            return round(irr, 2)
        except:
            return 0.0
    
    @staticmethod
    def calculate_tvpi(total_value: float, total_invested: float) -> float:
        """Calculate Total Value to Paid-In ratio"""
        if total_invested == 0:
            return 0.0
        return round(total_value / total_invested, 2)
    
    @staticmethod
    def calculate_dpi(distributions: float, total_invested: float) -> float:
        """Calculate Distributions to Paid-In ratio"""
        if total_invested == 0:
            return 0.0
        return round(distributions / total_invested, 2)

# Portfolio analytics service
class PortfolioAnalytics:
    @staticmethod
    def calculate_portfolio_health_score(companies: List[dict]) -> dict:
        """Calculate overall portfolio health metrics"""
        if not companies:
            return {'score': 0, 'breakdown': {}}
        
        growing = len([c for c in companies if c.get('status') == 'Growing'])
        scaling = len([c for c in companies if c.get('status') == 'Scaling'])
        challenged = len([c for c in companies if c.get('status') == 'Challenged'])
        total = len(companies)
        
        # Weight the health score
        health_score = round(
            ((growing * 1.0) + (scaling * 0.8) + (challenged * 0.3)) / total * 100
        )
        
        return {
            'score': health_score,
            'breakdown': {
                'growing': growing,
                'scaling': scaling, 
                'challenged': challenged,
                'total': total
            }
        }
    
    @staticmethod
    def predict_exit_readiness(company_data: dict) -> dict:
        """Predict exit readiness based on metrics"""
        score = 0
        factors = []
        
        # Revenue threshold
        revenue = company_data.get('revenue', 0)
        if revenue >= 100000000:  # $100M ARR
            score += 40
            factors.append("Strong revenue scale")
        elif revenue >= 20000000:  # $20M ARR
            score += 30
            factors.append("Good revenue base")
        elif revenue >= 5000000:  # $5M ARR
            score += 20
            factors.append("Moderate revenue")
        
        # Growth rate
        growth = company_data.get('growth_rate', 0)
        if growth >= 100:
            score += 25
            factors.append("High growth rate")
        elif growth >= 50:
            score += 15
            factors.append("Moderate growth")
        
        # Market position
        if company_data.get('market_leader', False):
            score += 20
            factors.append("Market leadership")
        
        # Profitability
        if company_data.get('profitable', False):
            score += 15
            factors.append("Profitable operations")
        
        readiness_level = "High" if score >= 70 else "Medium" if score >= 40 else "Low"
        
        return {
            'score': score,
            'readiness_level': readiness_level,
            'key_factors': factors
        }

# API Endpoints

@app.get("/")
async def root():
    return {"message": "Real VC Platform API", "version": "1.0.0", "status": "active"}

@app.get("/api/v1/health")
async def health_check():
    """System health check"""
    try:
        # Test database connection
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_status = True
    except:
        db_status = False
    
    try:
        # Test Redis connection
        redis_client.ping()
        redis_status = True
    except:
        redis_status = False
    
    return {
        "database": db_status,
        "redis": redis_status,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/v1/deals")
async def get_deals(
    stage: Optional[str] = None,
    sector: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    db = Depends(get_db)
):
    """Get deals with optional filtering"""
    try:
        query = db.query(Deal, Company).join(Company, Deal.company_id == Company.id)
        
        if stage:
            query = query.filter(Deal.stage == stage)
        if sector:
            query = query.filter(Company.sector == sector)
        
        results = query.limit(limit).all()
        
        deals = []
        for deal, company in results:
            deals.append({
                "id": deal.id,
                "company_name": company.name,
                "sector": company.sector,
                "location": company.location,
                "stage": deal.stage,
                "ask_amount": deal.ask_amount,
                "pre_money_valuation": deal.pre_money_valuation,
                "deal_score": deal.deal_score,
                "lead_source": deal.lead_source,
                "next_milestone": deal.next_milestone,
                "timeline_weeks": deal.timeline_weeks,
                "created_at": deal.created_at.isoformat(),
                "updated_at": deal.updated_at.isoformat()
            })
        
        return {"deals": deals, "total": len(deals)}
    
    except Exception as e:
        logger.error(f"Error fetching deals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/deals")
async def create_deal(deal_data: DealCreate, db = Depends(get_db)):
    """Create a new deal"""
    try:
        # Create company if doesn't exist
        company = db.query(Company).filter(Company.name == deal_data.company_name).first()
        if not company:
            company = Company(
                id=str(uuid.uuid4()),
                name=deal_data.company_name,
                sector=deal_data.sector,
                location=deal_data.location,
                description=deal_data.description
            )
            db.add(company)
            db.flush()
        
        # Create deal
        deal = Deal(
            id=str(uuid.uuid4()),
            company_id=company.id,
            fund_id="fund_001",  # Default fund for demo
            stage="Lead",
            ask_amount=deal_data.ask_amount,
            pre_money_valuation=deal_data.pre_money_valuation,
            lead_source=deal_data.lead_source,
            next_milestone="Initial Review"
        )
        
        # Calculate deal score
        scoring_data = {
            'annual_revenue': 0,  # Would come from deal_data in real implementation
            'revenue_growth_rate': 0,
            'tam_billions': 1.0,  # Default values for demo
            'market_growth_rate': 15,
            'team_size': 3
        }
        deal.deal_score = scoring_engine.calculate_overall_score(scoring_data)
        
        db.add(deal)
        db.commit()
        
        return {
            "success": True,
            "deal_id": deal.id,
            "deal_score": deal.deal_score,
            "message": "Deal created successfully"
        }
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating deal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/v1/deals/{deal_id}")
async def update_deal(deal_id: str, deal_update: DealUpdate, db = Depends(get_db)):
    """Update deal information"""
    try:
        deal = db.query(Deal).filter(Deal.id == deal_id).first()
        if not deal:
            raise HTTPException(status_code=404, detail="Deal not found")
        
        # Update fields
        if deal_update.stage:
            deal.stage = deal_update.stage
        if deal_update.deal_score:
            deal.deal_score = deal_update.deal_score
        if deal_update.next_milestone:
            deal.next_milestone = deal_update.next_milestone
        if deal_update.timeline_weeks:
            deal.timeline_weeks = deal_update.timeline_weeks
        
        deal.updated_at = datetime.utcnow()
        db.commit()
        
        return {"success": True, "message": "Deal updated successfully"}
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating deal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/portfolio")
async def get_portfolio(db = Depends(get_db)):
    """Get portfolio companies with performance metrics"""
    try:
        # Get portfolio companies with latest financial metrics
        query = """
        SELECT DISTINCT ON (pc.company_id)
            c.id, c.name, c.sector, c.location,
            i.investment_amount, i.ownership_percentage, i.investment_date,
            pc.current_valuation, pc.status, pc.next_board_meeting,
            fm.revenue, fm.growth_rate, fm.burn_rate, fm.runway_months,
            fm.employees, fm.customers, fm.arr, fm.churn_rate
        FROM portfolio_companies pc
        JOIN companies c ON pc.company_id = c.id
        JOIN investments i ON pc.investment_id = i.id
        LEFT JOIN financial_metrics fm ON c.id = fm.company_id
        ORDER BY pc.company_id, fm.metric_date DESC NULLS LAST
        """
        
        result = db.execute(query)
        companies = []
        
        for row in result:
            companies.append({
                "id": row[0],
                "name": row[1],
                "sector": row[2],
                "location": row[3],
                "investment_amount": row[4],
                "ownership_percentage": row[5],
                "investment_date": row[6].isoformat() if row[6] else None,
                "current_valuation": row[7],
                "status": row[8],
                "next_board_meeting": row[9].isoformat() if row[9] else None,
                "kpis": {
                    "revenue": row[10] or 0,
                    "growth_rate": row[11] or 0,
                    "burn_rate": row[12] or 0,
                    "runway_months": row[13] or 0,
                    "employees": row[14] or 0,
                    "customers": row[15] or 0,
                    "arr": row[16] or 0,
                    "churn_rate": row[17] or 0
                }
            })
        
        # Calculate portfolio analytics
        analytics = PortfolioAnalytics.calculate_portfolio_health_score(companies)
        
        return {
            "companies": companies,
            "portfolio_health": analytics,
            "total_companies": len(companies)
        }
    
    except Exception as e:
        logger.error(f"Error fetching portfolio: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/fund/performance")
async def get_fund_performance(fund_id: str = "fund_001", db = Depends(get_db)):
    """Get fund performance metrics"""
    try:
        # Get fund information
        fund = db.query(Fund).filter(Fund.id == fund_id).first()
        if not fund:
            raise HTTPException(status_code=404, detail="Fund not found")
        
        # Calculate portfolio value
        portfolio_query = """
        SELECT 
            SUM(i.investment_amount) as total_invested,
            SUM(pc.current_valuation * i.ownership_percentage / 100) as current_value,
            COUNT(*) as active_investments
        FROM investments i
        JOIN portfolio_companies pc ON i.id = pc.investment_id
        WHERE i.fund_id = %s AND pc.status != 'Exited'
        """
        
        result = db.execute(portfolio_query, (fund_id,)).fetchone()
        
        total_invested = result[0] or 0
        current_value = result[1] or 0
        active_investments = result[2] or 0
        
        # Mock some performance calculations for demo
        unrealized_value = current_value
        realized_value = total_invested * 0.15  # Assume 15% already realized
        total_value = unrealized_value + realized_value
        
        # Calculate metrics
        calculator = FundPerformanceCalculator()
        tvpi = calculator.calculate_tvpi(total_value, total_invested)
        dpi = calculator.calculate_dpi(realized_value, total_invested)
        
        # Mock IRR calculation
        cash_flows = [(-total_invested, 0), (realized_value, 24)]  # 2 years
        irr = calculator.calculate_irr(cash_flows, [0, 24])
        
        return {
            "fund_info": {
                "name": fund.name,
                "vintage": fund.vintage,
                "total_commitments": fund.total_commitments,
                "total_deployed": total_invested
            },
            "performance_metrics": {
                "total_value": total_value,
                "unrealized_value": unrealized_value,
                "realized_value": realized_value,
                "irr": irr,
                "tvpi": tvpi,
                "dpi": dpi,
                "active_investments": active_investments
            },
            "calculated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error calculating fund performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/investments")
async def create_investment(investment_data: InvestmentCreate, db = Depends(get_db)):
    """Create a new investment"""
    try:
        # Get the deal
        deal = db.query(Deal).filter(Deal.id == investment_data.deal_id).first()
        if not deal:
            raise HTTPException(status_code=404, detail="Deal not found")
        
        # Create investment
        investment = Investment(
            id=str(uuid.uuid4()),
            deal_id=investment_data.deal_id,
            fund_id=deal.fund_id,
            company_id=deal.company_id,
            investment_amount=investment_data.investment_amount,
            ownership_percentage=investment_data.ownership_percentage,
            investment_date=investment_data.investment_date,
            security_type=investment_data.security_type
        )
        
        db.add(investment)
        
        # Create portfolio company entry
        portfolio_company = PortfolioCompany(
            id=str(uuid.uuid4()),
            investment_id=investment.id,
            company_id=deal.company_id,
            current_valuation=deal.pre_money_valuation + investment_data.investment_amount,
            status="Active"
        )
        
        db.add(portfolio_company)
        
        # Update deal stage to Closed
        deal.stage = "Closed"
        deal.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "investment_id": investment.id,
            "portfolio_company_id": portfolio_company.id,
            "message": "Investment created successfully"
        }
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating investment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/financial-metrics")
async def update_financial_metrics(metrics: FinancialMetricsUpdate, db = Depends(get_db)):
    """Update company financial metrics"""
    try:
        financial_metrics = FinancialMetrics(
            id=str(uuid.uuid4()),
            company_id=metrics.company_id,
            metric_date=datetime.utcnow(),
            revenue=metrics.revenue,
            growth_rate=metrics.growth_rate,
            burn_rate=metrics.burn_rate,
            runway_months=metrics.runway_months,
            employees=metrics.employees,
            customers=metrics.customers,
            arr=metrics.arr,
            churn_rate=metrics.churn_rate
        )
        
        db.add(financial_metrics)
        db.commit()
        
        return {
            "success": True,
            "metrics_id": financial_metrics.id,
            "message": "Financial metrics updated successfully"
        }
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating financial metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/analytics/deal-score/{deal_id}")
async def get_deal_score_breakdown(deal_id: str, db = Depends(get_db)):
    """Get detailed deal score breakdown"""
    try:
        deal = db.query(Deal, Company).join(Company, Deal.company_id == Company.id).filter(Deal.id == deal_id).first()
        if not deal:
            raise HTTPException(status_code=404, detail="Deal not found")
        
        # Mock detailed scoring for demo
        scoring_data = {
            'annual_revenue': 2000000,
            'revenue_growth_rate': 150,
            'tam_billions': 5.0,
            'market_growth_rate': 20,
            'team_size': 4,
            'founder_previous_startups': 1,
            'founder_education_tier': 'top',
            'monthly_burn_rate': 120000,
            'runway_months': 18
        }
        
        team_score = scoring_engine.calculate_team_score(scoring_data)
        market_score = scoring_engine.calculate_market_score(scoring_data)
        traction_score = scoring_engine.calculate_traction_score(scoring_data)
        financial_score = scoring_engine.calculate_financial_score(scoring_data)
        overall_score = scoring_engine.calculate_overall_score(scoring_data)
        
        return {
            "deal_id": deal_id,
            "overall_score": overall_score,
            "breakdown": {
                "team_score": {
                    "score": team_score,
                    "weight": scoring_engine.weights['team_score'],
                    "factors": ["Experienced founder", "Complete team", "Previous startup experience"]
                },
                "market_score": {
                    "score": market_score,
                    "weight": scoring_engine.weights['market_score'],
                    "factors": ["Large market opportunity", "Growing market", "Low competition"]
                },
                "traction_score": {
                    "score": traction_score,
                    "weight": scoring_engine.weights['traction_score'],
                    "factors": ["Strong revenue growth", "Good customer base", "Proven product-market fit"]
                },
                "financial_score": {
                    "score": financial_score,
                    "weight": scoring_engine.weights['financial_score'],
                    "factors": ["Healthy burn rate", "Adequate runway", "Strong unit economics"]
                }
            },
            "calculated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error calculating deal score breakdown: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "real_vc_platform_api:app",
        host="0.0.0.0", 
        port=8080,
        reload=True,
        log_level="info"
    )
