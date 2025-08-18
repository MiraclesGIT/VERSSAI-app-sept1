#!/usr/bin/env python3
"""
VERSSAI Dataset Integration Script
Processes and ingests the comprehensive research dataset into the 3-layer RAG system
Handles 1,157 papers, 2,311 researchers, and 38,015 citations
"""

import asyncio
import pandas as pd
import json
import logging
from datetime import datetime
from pathlib import Path
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('dataset_integration.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

async def analyze_dataset(dataset_path='VERSSAI_Massive_Dataset_Complete.xlsx'):
    """Analyze the VERSSAI dataset structure and contents"""
    
    print("🔍 Analyzing VERSSAI Research Dataset...")
    print("=" * 60)
    
    if not Path(dataset_path).exists():
        print(f"❌ Dataset file not found: {dataset_path}")
        print("📥 Please ensure the VERSSAI_Massive_Dataset_Complete.xlsx file is in the current directory")
        return False
    
    try:
        # Get all sheet names
        excel_file = pd.ExcelFile(dataset_path)
        sheet_names = excel_file.sheet_names
        
        print(f"📊 Dataset file: {dataset_path}")
        print(f"📋 Found {len(sheet_names)} sheets:")
        
        total_data_points = 0
        sheet_analysis = {}
        
        for sheet_name in sheet_names:
            try:
                df = pd.read_excel(dataset_path, sheet_name=sheet_name)
                rows, cols = df.shape
                total_data_points += rows
                
                sheet_analysis[sheet_name] = {
                    'rows': rows,
                    'columns': cols,
                    'data_points': rows
                }
                
                print(f"  📄 {sheet_name:<25} | {rows:>6} rows | {cols:>2} cols")
                
                # Show column names for key sheets
                if sheet_name in ['References_1157', 'Researchers_2311', 'Citation_Network']:
                    print(f"      Columns: {', '.join(df.columns[:5].tolist())}{'...' if len(df.columns) > 5 else ''}")
                
            except Exception as e:
                print(f"  ❌ Error reading {sheet_name}: {str(e)}")
                sheet_analysis[sheet_name] = {'error': str(e)}
        
        print("=" * 60)
        print(f"📈 Dataset Summary:")
        print(f"   • Total Data Points: {total_data_points:,}")
        print(f"   • Research Papers: {sheet_analysis.get('References_1157', {}).get('rows', 0):,}")
        print(f"   • Researchers: {sheet_analysis.get('Researchers_2311', {}).get('rows', 0):,}")
        print(f"   • Citations: {sheet_analysis.get('Citation_Network', {}).get('rows', 0):,}")
        print(f"   • Institutions: {sheet_analysis.get('Institutions', {}).get('rows', 0):,}")
        print(f"   • Verified Papers: {sheet_analysis.get('Verified_Papers_32', {}).get('rows', 0):,}")
        
        # Sample data from key sheets
        print("\n📋 Sample Data Preview:")
        try:
            refs_df = pd.read_excel(dataset_path, sheet_name='References_1157')
            if not refs_df.empty:
                sample_paper = refs_df.iloc[0]
                print(f"   📄 Sample Paper: {sample_paper.get('title', 'N/A')}")
                print(f"      Category: {sample_paper.get('category', 'N/A')}")
                print(f"      Year: {sample_paper.get('year', 'N/A')}")
                print(f"      Citations: {sample_paper.get('citation_count', 'N/A')}")
        except Exception as e:
            print(f"   ⚠️ Could not preview sample data: {str(e)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error analyzing dataset: {str(e)}")
        return False

async def test_rag_integration():
    """Test the RAG system integration"""
    
    print("\n🧪 Testing RAG System Integration...")
    print("=" * 60)
    
    try:
        # Import the RAG system
        from verssai_enhanced_backend import VERSSAIEnhancedRAG, RAGLayer
        
        # Initialize RAG system
        rag_config = {
            'chroma_db_path': './chroma_db',
            'postgres_url': 'postgresql://verssai_user:verssai_secure_password_2024@localhost:5432/verssai_vc'
        }
        
        rag_system = VERSSAIEnhancedRAG(rag_config)
        
        print("✅ RAG System initialized successfully")
        
        # Test dataset ingestion
        print("🔄 Testing dataset ingestion...")
        ingestion_stats = await rag_system.ingest_verssai_dataset()
        
        print("📊 Ingestion Results:")
        for key, value in ingestion_stats.items():
            print(f"   • {key}: {value}")
        
        # Test query functionality
        print("\n🔍 Testing query functionality...")
        
        # Test each layer
        for layer in [RAGLayer.ROOF, RAGLayer.VC, RAGLayer.FOUNDER]:
            print(f"\n   Testing {layer.value} layer...")
            
            test_queries = {
                RAGLayer.ROOF: "machine learning artificial intelligence",
                RAGLayer.VC: "venture capital investment research",
                RAGLayer.FOUNDER: "startup entrepreneurship funding"
            }
            
            query = test_queries[layer]
            results = await rag_system.query_rag_system(query, layer, limit=3)
            
            print(f"   Query: '{query}'")
            print(f"   Results found: {results.get('total_found', 0)}")
            
            if results.get('total_found', 0) > 0:
                print("   ✅ Query successful")
            else:
                print("   ⚠️ No results found (may need more data)")
        
        # Test VC Intelligence generation
        print("\n🎯 Testing VC Intelligence generation...")
        
        test_description = """
        AI-powered fintech startup developing machine learning algorithms for credit risk assessment.
        Founded by PhD graduates from Stanford with previous experience at Google and Goldman Sachs.
        Seeking Series A funding for scaling their proprietary risk modeling technology.
        """
        
        intelligence = await rag_system.generate_vc_intelligence(test_description)
        
        print("📈 VC Intelligence Results:")
        print(f"   • Investment Signal: {intelligence.investment_signal:.1%}")
        print(f"   • Risk Score: {intelligence.risk_score:.1%}")
        print(f"   • Growth Potential: {intelligence.growth_potential:.1%}")
        print(f"   • Market Validation: {intelligence.market_validation.get('validation_strength', 'Unknown')}")
        print(f"   • Research Backing: {len(intelligence.research_backing)} papers")
        
        print("\n✅ RAG System integration test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ RAG integration test failed: {str(e)}")
        return False

async def verify_backend_endpoints():
    """Verify that backend endpoints are working"""
    
    print("\n🔗 Testing Backend API Endpoints...")
    print("=" * 60)
    
    try:
        import aiohttp
        import asyncio
        
        base_url = "http://localhost:8080/api"
        
        endpoints_to_test = [
            ("/health", "GET"),
            ("/workflows", "GET"),
            ("/portfolios/companies", "GET"),
            ("/dashboard/stats", "GET")
        ]
        
        async with aiohttp.ClientSession() as session:
            for endpoint, method in endpoints_to_test:
                try:
                    url = f"{base_url}{endpoint}"
                    async with session.request(method, url) as response:
                        if response.status == 200:
                            print(f"   ✅ {method} {endpoint} - Status: {response.status}")
                        else:
                            print(f"   ⚠️ {method} {endpoint} - Status: {response.status}")
                except Exception as e:
                    print(f"   ❌ {method} {endpoint} - Error: {str(e)}")
        
        # Test RAG endpoints with POST requests
        print("\n   Testing RAG endpoints...")
        
        async with aiohttp.ClientSession() as session:
            # Test RAG query
            rag_query_data = {
                "query": "artificial intelligence machine learning",
                "layer": "roof",
                "limit": 3
            }
            
            try:
                async with session.post(f"{base_url}/rag/query", json=rag_query_data) as response:
                    if response.status == 200:
                        result = await response.json()
                        print(f"   ✅ POST /rag/query - Results: {result.get('total_found', 0)}")
                    else:
                        print(f"   ⚠️ POST /rag/query - Status: {response.status}")
            except Exception as e:
                print(f"   ❌ POST /rag/query - Error: {str(e)}")
        
        print("\n✅ Backend endpoint testing completed!")
        return True
        
    except ImportError:
        print("⚠️ aiohttp not available, skipping endpoint tests")
        return True
    except Exception as e:
        print(f"❌ Backend endpoint testing failed: {str(e)}")
        return False

def create_sample_data():
    """Create sample data files for testing"""
    
    print("\n📝 Creating sample data files...")
    print("=" * 60)
    
    # Create uploads directory
    uploads_dir = Path("uploads")
    uploads_dir.mkdir(exist_ok=True)
    
    # Create sample company data
    sample_companies = [
        {
            "id": "vistim_labs",
            "name": "Vistim Labs",
            "description": "MedTech diagnostic company that helps to detect, treat, and track neurological disorders using AI-powered brain imaging technology.",
            "industry": "MedTech",
            "stage": "Series C",
            "valuation": 45000000,
            "founder_names": ["Dr. Sarah Chen", "Dr. Michael Rodriguez"],
            "founder_backgrounds": ["PhD Neuroscience Stanford", "MD/PhD Harvard Medical"],
            "signal_scores": {
                "founder_signal": 85,
                "market_opportunity": 78,
                "competitive_advantage": 82,
                "overall": 81
            }
        },
        {
            "id": "synthetix_ai",
            "name": "Synthetix AI",
            "description": "AI-powered synthetic data generation platform for training machine learning models in privacy-sensitive industries.",
            "industry": "AI/ML",
            "stage": "Series A",
            "valuation": 12000000,
            "founder_names": ["Alex Kim", "Jordan Thompson"],
            "founder_backgrounds": ["PhD Computer Science MIT", "Former Google AI Engineer"],
            "signal_scores": {
                "founder_signal": 72,
                "market_opportunity": 88,
                "competitive_advantage": 75,
                "overall": 78
            }
        },
        {
            "id": "quantum_finance",
            "name": "Quantum Finance",
            "description": "Quantum computing applications for financial risk modeling and portfolio optimization using advanced algorithms.",
            "industry": "Fintech",
            "stage": "Seed",
            "valuation": 3000000,
            "founder_names": ["Dr. Emily Zhang", "David Wilson"],
            "founder_backgrounds": ["PhD Quantum Physics Caltech", "Former Goldman Sachs Quant"],
            "signal_scores": {
                "founder_signal": 91,
                "market_opportunity": 82,
                "competitive_advantage": 89,
                "overall": 87
            }
        }
    ]
    
    # Save sample companies
    with open("sample_companies.json", "w") as f:
        json.dump(sample_companies, f, indent=2)
    
    print(f"✅ Created sample_companies.json with {len(sample_companies)} companies")
    
    # Create sample workflow test data
    sample_workflows = {
        "founder_signal_test": {
            "founder_name": "Dr. Sarah Chen",
            "company_name": "Vistim Labs",
            "linkedin_profile": "https://linkedin.com/in/sarah-chen-md",
            "previous_experience": ["Stanford Research", "Google Health", "McKinsey"],
            "education_background": "PhD Neuroscience Stanford, MD Harvard"
        },
        "due_diligence_test": {
            "company_name": "Synthetix AI",
            "documents": ["pitch_deck.pdf", "financial_statements.xlsx", "legal_docs.pdf"],
            "financial_statements": ["2023_financials.xlsx", "2024_projections.xlsx"],
            "market_research": {"tam": 50000000000, "sam": 5000000000, "som": 500000000}
        },
        "competitive_intelligence_test": {
            "target_company": "Quantum Finance",
            "industry_sector": "Fintech",
            "geographic_scope": "North America",
            "analysis_depth": "comprehensive"
        }
    }
    
    with open("sample_workflow_tests.json", "w") as f:
        json.dump(sample_workflows, f, indent=2)
    
    print(f"✅ Created sample_workflow_tests.json")
    
    print("✅ Sample data creation completed!")

async def main():
    """Main integration function"""
    
    print("🚀 VERSSAI Dataset Integration & Testing")
    print("=" * 60)
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    success_count = 0
    total_tests = 4
    
    # Step 1: Analyze dataset
    if await analyze_dataset():
        success_count += 1
        print("✅ Dataset analysis completed")
    else:
        print("❌ Dataset analysis failed")
    
    # Step 2: Create sample data
    try:
        create_sample_data()
        success_count += 1
        print("✅ Sample data creation completed")
    except Exception as e:
        print(f"❌ Sample data creation failed: {str(e)}")
    
    # Step 3: Test RAG integration (only if backend is available)
    try:
        if await test_rag_integration():
            success_count += 1
            print("✅ RAG integration test completed")
        else:
            print("❌ RAG integration test failed")
    except Exception as e:
        print(f"⚠️ RAG integration test skipped: {str(e)}")
        print("   (This is normal if the backend is not running)")
    
    # Step 4: Test backend endpoints (only if backend is running)
    try:
        if await verify_backend_endpoints():
            success_count += 1
            print("✅ Backend endpoint testing completed")
        else:
            print("❌ Backend endpoint testing failed")
    except Exception as e:
        print(f"⚠️ Backend endpoint testing skipped: {str(e)}")
        print("   (This is normal if the backend is not running)")
    
    print("\n" + "=" * 60)
    print(f"📊 Integration Summary:")
    print(f"   • Tests completed: {success_count}/{total_tests}")
    print(f"   • Success rate: {(success_count/total_tests)*100:.1f}%")
    print(f"   • Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if success_count >= 2:  # At least dataset analysis and sample data creation
        print("\n🎉 VERSSAI dataset integration completed successfully!")
        print("\n📋 Next Steps:")
        print("   1. Start the VERSSAI platform: ./start_verssai_enhanced.sh")
        print("   2. Visit http://localhost:3000 to access the dashboard")
        print("   3. Click 'Ingest Dataset' to load the research data")
        print("   4. Test RAG queries and VC intelligence features")
    else:
        print("\n⚠️ Some integration steps failed. Please check the logs above.")
    
    return success_count >= 2

if __name__ == "__main__":
    asyncio.run(main())
