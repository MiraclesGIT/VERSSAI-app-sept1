# VERSSAI Academic Dataset API (CSV-based)
# File: backend/verssai_academic_csv_api.py

import pandas as pd
import os
import json
from datetime import datetime
from typing import List, Dict, Optional
from fastapi import FastAPI, HTTPException

class VERSSAIAcademicCSVAPI:
    """
    CSV-based Academic API for VERSSAI
    """
    
    def __init__(self, data_dir: str = "academic_data"):
        self.data_dir = data_dir
        self.datasets = {}
        self.load_datasets()
    
    def load_datasets(self):
        """Load CSV datasets"""
        try:
            base_path = os.path.join(os.path.dirname(__file__), self.data_dir)
            
            self.datasets['summary'] = pd.read_csv(os.path.join(base_path, "summary_statistics.csv"))
            self.datasets['verified_papers'] = pd.read_csv(os.path.join(base_path, "verified_papers.csv"))
            self.datasets['categories'] = pd.read_csv(os.path.join(base_path, "research_categories.csv"))
            self.datasets['researchers'] = pd.read_csv(os.path.join(base_path, "top_researchers.csv"))
            
            print("✅ VERSSAI Academic CSV Dataset Loaded")
            print(f"📊 Verified papers: {len(self.datasets['verified_papers'])}")
            print(f"👨‍🔬 Top researchers: {len(self.datasets['researchers'])}")
            print(f"📚 Categories: {len(self.datasets['categories'])}")
            
        except Exception as e:
            print(f"❌ Error loading CSV datasets: {e}")
            raise
    
    def get_summary_stats(self):
        """Get platform summary statistics"""
        return self.datasets['summary'].iloc[0].to_dict()
    
    def validate_founder_background(self, founder_name: str) -> Dict:
        """Validate founder against researcher database"""
        researchers = self.datasets['researchers']
        
        # Check if founder matches any researcher
        matches = researchers[researchers['name'].str.contains(founder_name, case=False, na=False)]
        
        if not matches.empty:
            researcher = matches.iloc[0]
            return {
                'found_in_database': True,
                'academic_credibility': min(100, researcher['h_index'] * 0.7),
                'researcher_profile': {
                    'name': researcher['name'],
                    'institution': researcher['institution'],
                    'h_index': researcher['h_index'],
                    'citations': researcher['citations'],
                    'field': researcher['field'],
                    'years_active': researcher['years_active'],
                    'industry_experience': researcher['industry_experience']
                },
                'validation_confidence': 90
            }
        else:
            return {
                'found_in_database': False,
                'academic_credibility': 0,
                'validation_confidence': 0,
                'message': 'No academic profile found in database'
            }
    
    def get_research_insights(self, topic: str) -> Dict:
        """Get research insights for a topic"""
        categories = self.datasets['categories']
        papers = self.datasets['verified_papers']
        
        # Simple keyword matching
        relevant_categories = categories[categories['category'].str.contains(topic, case=False, na=False)]
        relevant_papers = papers[papers['Paper'].str.contains(topic, case=False, na=False)]
        
        return {
            'topic': topic,
            'relevant_categories': relevant_categories.to_dict('records'),
            'relevant_papers': relevant_papers.to_dict('records'),
            'research_strength': len(relevant_papers) * 20,
            'confidence': min(100, len(relevant_categories) * 30)
        }
    
    def find_expert_researchers(self, field: str = None, min_h_index: int = 50) -> List[Dict]:
        """Find expert researchers"""
        researchers = self.datasets['researchers']
        
        if field:
            researchers = researchers[researchers['field'].str.contains(field, case=False, na=False)]
        
        experts = researchers[researchers['h_index'] >= min_h_index]
        return experts.to_dict('records')

# FastAPI Application
app = FastAPI(title="VERSSAI Academic Intelligence API (CSV)", version="1.0.0")

try:
    academic_api = VERSSAIAcademicCSVAPI()
except Exception as e:
    print(f"Warning: Could not load academic dataset: {e}")
    academic_api = None

@app.get("/")
async def root():
    return {"message": "VERSSAI Academic Intelligence API (CSV-based)", "status": "active"}

@app.get("/academic/stats")
async def get_stats():
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic dataset not available")
    
    try:
        return {"status": "success", "data": academic_api.get_summary_stats()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/academic/validate-founder")
async def validate_founder(founder_name: str):
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic dataset not available")
    
    try:
        result = academic_api.validate_founder_background(founder_name)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/academic/research-insights")
async def get_research_insights(topic: str):
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic dataset not available")
    
    try:
        result = academic_api.get_research_insights(topic)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/academic/experts")
async def find_experts(field: str = None, min_h_index: int = 50):
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic dataset not available")
    
    try:
        result = academic_api.find_expert_researchers(field, min_h_index)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8081)
