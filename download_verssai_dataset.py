#!/usr/bin/env python3
"""
Download and save the VERSSAI Dataset from the conversation
"""

import os
import sys
import shutil

def download_verssai_dataset():
    """Download the VERSSAI dataset and set up the academic API"""
    
    print("🚀 VERSSAI Dataset Setup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('backend'):
        print("❌ Error: Not in VERSSAI project directory")
        print("Please run this from: /Users/nissimmenashe/Projects/VERSSAI-engineAug10")
        sys.exit(1)
    
    dataset_path = "VERSSAI_Massive_Dataset_Complete.xlsx"
    backend_dataset_path = os.path.join("backend", "VERSSAI_Massive_Dataset_Complete.xlsx")
    
    print(f"📂 Looking for dataset file: {dataset_path}")
    
    # Check if file exists in current directory
    if os.path.exists(dataset_path):
        print("✅ Found dataset in current directory")
        # Copy to backend directory
        shutil.copy2(dataset_path, backend_dataset_path)
        print(f"✅ Copied dataset to: {backend_dataset_path}")
    elif os.path.exists(backend_dataset_path):
        print("✅ Dataset already exists in backend directory")
    else:
        print("❌ Dataset file not found!")
        print("\nTo download the dataset:")
        print("1. The Excel file is uploaded to this conversation")
        print("2. You can download it by:")
        print("   - Right-clicking on the file attachment in the conversation")
        print("   - Selecting 'Save as...'")
        print("   - Saving it as 'VERSSAI_Massive_Dataset_Complete.xlsx'")
        print("   - Either in the project root or backend/ directory")
        print("\nAlternatively, if you have the file elsewhere:")
        print(f"cp /path/to/VERSSAI_Massive_Dataset_Complete.xlsx {os.getcwd()}/")
        return False
    
    # Test dataset loading
    try:
        print("\n📊 Testing dataset loading...")
        import pandas as pd
        
        summary_df = pd.read_excel(backend_dataset_path, sheet_name='Summary_Statistics')
        stats = summary_df.iloc[0]
        
        print("✅ Dataset loaded successfully!")
        print(f"📚 Academic References: {int(stats['Total_References']):,}")
        print(f"👨‍🔬 Researchers: {int(stats['Total_Researchers']):,}")
        print(f"🏛️ Institutions: {int(stats['Total_Institutions'])}")
        print(f"🔗 Citations: {int(stats['Total_Citations']):,}")
        print(f"📅 Research Period: {stats['Year_Range']}")
        print(f"📊 Statistical Significance: {stats['Statistical_Significance_Rate']*100:.1f}%")
        
        return True
        
    except ImportError:
        print("⚠️  pandas not installed. Installing required packages...")
        os.system("pip install pandas openpyxl scikit-learn numpy")
        return True
        
    except Exception as e:
        print(f"❌ Error loading dataset: {e}")
        return False

def setup_academic_api():
    """Set up the academic API integration"""
    
    print("\n🧠 Setting up Academic Intelligence API...")
    
    api_code = '''# VERSSAI Academic Dataset Integration API
# File: backend/verssai_academic_api.py

import pandas as pd
import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Optional
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import numpy as np
import os

class VERSSAIAcademicAPI:
    """
    API for integrating VERSSAI's massive academic dataset with VC operations
    """
    
    def __init__(self, excel_file_path: str = None):
        if excel_file_path is None:
            excel_file_path = os.path.join(os.path.dirname(__file__), "VERSSAI_Massive_Dataset_Complete.xlsx")
        
        self.excel_file_path = excel_file_path
        self.datasets = {}
        self.load_datasets()
    
    def load_datasets(self):
        """Load all sheets from the VERSSAI Excel dataset"""
        try:
            # Load all sheets
            self.datasets['summary'] = pd.read_excel(self.excel_file_path, sheet_name='Summary_Statistics')
            self.datasets['references'] = pd.read_excel(self.excel_file_path, sheet_name='References_1157')
            self.datasets['researchers'] = pd.read_excel(self.excel_file_path, sheet_name='Researchers_2311')
            self.datasets['institutions'] = pd.read_excel(self.excel_file_path, sheet_name='Institutions')
            self.datasets['citations'] = pd.read_excel(self.excel_file_path, sheet_name='Citation_Network')
            self.datasets['verified_papers'] = pd.read_excel(self.excel_file_path, sheet_name='Verified_Papers_32')
            
            print("✅ VERSSAI Academic Dataset Loaded Successfully")
            print(f"📊 {len(self.datasets['references'])} academic papers")
            print(f"👨‍🔬 {len(self.datasets['researchers'])} researchers")
            print(f"🏛️ {len(self.datasets['institutions'])} institutions")
            print(f"🔗 {len(self.datasets['citations'])} citations")
            
        except Exception as e:
            print(f"❌ Error loading dataset: {e}")
            raise
    
    def get_summary_stats(self):
        """Get platform summary statistics"""
        return self.datasets['summary'].iloc[0].to_dict()
    
    def validate_founder_background(self, founder_name: str, founder_institution: str = None) -> Dict:
        """
        Validate founder academic credentials against researcher database
        """
        results = {
            'found_in_database': False,
            'academic_credibility': 0,
            'researcher_profile': None,
            'related_researchers': [],
            'validation_confidence': 0
        }
        
        # Direct name match
        exact_matches = self.datasets['researchers'][
            self.datasets['researchers']['name'].str.contains(founder_name, case=False, na=False)
        ]
        
        if not exact_matches.empty:
            researcher = exact_matches.iloc[0]
            results['found_in_database'] = True
            results['researcher_profile'] = {
                'name': researcher['name'],
                'institution': researcher['institution'],
                'h_index': researcher['h_index'],
                'total_citations': researcher['total_citations'],
                'years_active': researcher['years_active'],
                'primary_field': researcher['primary_field'],
                'industry_experience': researcher['industry_experience']
            }
            results['academic_credibility'] = min(100, researcher['h_index'] * 2)
            results['validation_confidence'] = 95
        
        return results
    
    def search_research_papers(self, query: str, limit: int = 10) -> List[Dict]:
        """Search for relevant research papers"""
        papers = self.datasets['references']
        
        # Simple text search across title and authors
        mask = (papers['title'].str.contains(query, case=False, na=False) |
                papers['authors'].str.contains(query, case=False, na=False))
        
        relevant_papers = papers[mask].head(limit)
        
        return [
            {
                'title': row['title'],
                'authors': row['authors'],
                'year': row['year'],
                'citations': row['citation_count'],
                'venue': row['venue'],
                'category': row['category']
            }
            for _, row in relevant_papers.iterrows()
        ]
    
    def find_researchers(self, field: str = None, min_h_index: int = 20, limit: int = 10) -> List[Dict]:
        """Find researchers by field and expertise"""
        researchers = self.datasets['researchers']
        
        if field:
            researchers = researchers[
                researchers['primary_field'].str.contains(field, case=False, na=False)
            ]
        
        researchers = researchers[researchers['h_index'] >= min_h_index]
        researchers = researchers.sort_values('h_index', ascending=False).head(limit)
        
        return [
            {
                'name': row['name'],
                'institution': row['institution'],
                'h_index': row['h_index'],
                'citations': row['total_citations'],
                'field': row['primary_field'],
                'industry_experience': row['industry_experience']
            }
            for _, row in researchers.iterrows()
        ]


# FastAPI app
app = FastAPI(title="VERSSAI Academic Intelligence API", version="1.0.0")

# Initialize the academic API
try:
    academic_api = VERSSAIAcademicAPI()
except Exception as e:
    print(f"Warning: Could not load academic dataset: {e}")
    academic_api = None

@app.get("/")
async def root():
    return {"message": "VERSSAI Academic Intelligence API", "status": "active"}

@app.get("/academic/stats")
async def get_academic_stats():
    """Get overall academic platform statistics"""
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic dataset not available")
    
    try:
        summary = academic_api.get_summary_stats()
        return {"status": "success", "data": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/academic/validate-founder")
async def validate_founder(founder_name: str, founder_institution: str = None):
    """Validate founder academic credentials"""
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic dataset not available")
    
    try:
        result = academic_api.validate_founder_background(founder_name, founder_institution)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/academic/search-papers")
async def search_papers(query: str, limit: int = 10):
    """Search for relevant academic papers"""
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic dataset not available")
    
    try:
        results = academic_api.search_research_papers(query, limit)
        return {"status": "success", "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/academic/find-researchers")
async def find_researchers(field: str = None, min_h_index: int = 20, limit: int = 10):
    """Find researchers by field"""
    if not academic_api:
        raise HTTPException(status_code=503, detail="Academic dataset not available")
    
    try:
        results = academic_api.find_researchers(field, min_h_index, limit)
        return {"status": "success", "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8081)
'''
    
    api_file_path = os.path.join("backend", "verssai_academic_api.py")
    with open(api_file_path, 'w') as f:
        f.write(api_code)
    
    print(f"✅ Created academic API: {api_file_path}")
    
    # Create a simple test script
    test_script = '''#!/usr/bin/env python3
"""
Test the VERSSAI Academic API
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from verssai_academic_api import VERSSAIAcademicAPI
    
    print("🧪 Testing VERSSAI Academic API...")
    api = VERSSAIAcademicAPI()
    
    # Test stats
    stats = api.get_summary_stats()
    print(f"✅ Loaded {int(stats['Total_References']):,} papers")
    
    # Test founder validation
    result = api.validate_founder_background("Sarah Chen")
    print(f"✅ Founder validation: {result['validation_confidence']}% confidence")
    
    # Test paper search
    papers = api.search_research_papers("artificial intelligence", limit=3)
    print(f"✅ Found {len(papers)} relevant papers")
    
    # Test researcher search
    researchers = api.find_researchers("Computer Science", min_h_index=30, limit=3)
    print(f"✅ Found {len(researchers)} expert researchers")
    
    print("\\n🎉 Academic API test completed successfully!")
    
except Exception as e:
    print(f"❌ Error testing API: {e}")
    import traceback
    traceback.print_exc()
'''
    
    with open("test_academic_api.py", 'w') as f:
        f.write(test_script)
    
    print("✅ Created test script: test_academic_api.py")

def main():
    """Main setup function"""
    
    # Step 1: Download dataset
    if not download_verssai_dataset():
        print("\n❌ Setup failed: Could not load dataset")
        print("\nNext steps:")
        print("1. Download the Excel file from the conversation")
        print("2. Save it as 'VERSSAI_Massive_Dataset_Complete.xlsx'")
        print("3. Run this script again")
        return
    
    # Step 2: Setup academic API
    setup_academic_api()
    
    # Step 3: Install dependencies
    print("\n📦 Installing required packages...")
    os.system("pip install pandas openpyxl scikit-learn numpy fastapi uvicorn")
    
    print("\n🎉 VERSSAI Academic Dataset Setup Complete!")
    print("\nNext steps:")
    print("1. Test the API: python test_academic_api.py")
    print("2. Start the API server: python backend/verssai_academic_api.py")
    print("3. Test endpoints: curl http://localhost:8081/academic/stats")
    print("4. Integrate with your existing VERSSAI platform")

if __name__ == "__main__":
    main()
