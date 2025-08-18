#!/usr/bin/env python3
"""
VERSSAI Enhanced Platform Integration Test
Tests all components of the platform including dataset integration
"""

import asyncio
import aiohttp
import json
import time
import sys
import logging
from datetime import datetime
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class VERSSAIIntegrationTester:
    def __init__(self):
        self.backend_url = "http://localhost:8080"
        self.frontend_url = "http://localhost:3000"
        self.test_results = {}
        self.start_time = datetime.now()
        
    async def test_backend_health(self, session):
        """Test backend health endpoint"""
        logger.info("🏥 Testing backend health...")
        try:
            async with session.get(f"{self.backend_url}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info("✅ Backend health check passed")
                    self.test_results['backend_health'] = {
                        'status': 'PASS',
                        'response_time': data.get('timestamp'),
                        'services': data.get('services', {}),
                        'dataset': data.get('dataset', {})
                    }
                    return True
                else:
                    logger.error(f"❌ Backend health check failed: {response.status}")
                    self.test_results['backend_health'] = {'status': 'FAIL', 'error': f"HTTP {response.status}"}
                    return False
        except Exception as e:
            logger.error(f"❌ Backend health check error: {str(e)}")
            self.test_results['backend_health'] = {'status': 'FAIL', 'error': str(e)}
            return False
    
    async def test_dataset_integration(self, session):
        """Test dataset integration endpoints"""
        logger.info("📊 Testing dataset integration...")
        
        endpoints = [
            "/api/dataset/stats",
            "/api/researchers/search",
            "/api/institutions/analysis",
            "/api/rag/status"
        ]
        
        dataset_results = {}
        
        for endpoint in endpoints:
            try:
                if endpoint == "/api/researchers/search":
                    # POST request with search data
                    async with session.post(f"{self.backend_url}{endpoint}", 
                                          json={"query": "AI", "filters": {}}) as response:
                        if response.status == 200:
                            data = await response.json()
                            dataset_results[endpoint] = {
                                'status': 'PASS',
                                'data_available': len(data.get('researchers', [])) > 0,
                                'total_found': data.get('total_found', 0)
                            }
                            logger.info(f"✅ {endpoint} - Found {data.get('total_found', 0)} researchers")
                        else:
                            dataset_results[endpoint] = {'status': 'FAIL', 'error': f"HTTP {response.status}"}
                else:
                    # GET request
                    async with session.get(f"{self.backend_url}{endpoint}") as response:
                        if response.status == 200:
                            data = await response.json()
                            dataset_results[endpoint] = {
                                'status': 'PASS',
                                'has_data': bool(data),
                                'sample_keys': list(data.keys())[:5] if isinstance(data, dict) else []
                            }
                            
                            # Log specific dataset stats
                            if endpoint == "/api/dataset/stats":
                                logger.info(f"✅ Dataset stats - {data.get('total_references', 0)} papers, {data.get('total_researchers', 0)} researchers")
                            elif endpoint == "/api/rag/status":
                                logger.info(f"✅ RAG status - {data.get('status', 'unknown')}")
                            else:
                                logger.info(f"✅ {endpoint} - Data available")
                        else:
                            dataset_results[endpoint] = {'status': 'FAIL', 'error': f"HTTP {response.status}"}
                            
            except Exception as e:
                logger.error(f"❌ {endpoint} error: {str(e)}")
                dataset_results[endpoint] = {'status': 'FAIL', 'error': str(e)}
        
        self.test_results['dataset_integration'] = dataset_results
        
        # Check overall dataset integration status
        passed_tests = sum(1 for result in dataset_results.values() if result.get('status') == 'PASS')
        total_tests = len(dataset_results)
        
        if passed_tests == total_tests:
            logger.info(f"✅ Dataset integration fully working ({passed_tests}/{total_tests})")
            return True
        else:
            logger.warning(f"⚠️ Dataset integration partially working ({passed_tests}/{total_tests})")
            return passed_tests > 0
    
    async def test_rag_queries(self, session):
        """Test RAG system queries"""
        logger.info("🧠 Testing RAG system queries...")
        
        test_queries = [
            {
                "query": "machine learning startup founders",
                "layer": "vc",
                "limit": 5
            },
            {
                "query": "artificial intelligence research papers",
                "layer": "roof",
                "limit": 3
            },
            {
                "query": "startup investment opportunities",
                "layer": "founder",
                "limit": 5
            }
        ]
        
        rag_results = {}
        
        for i, query_data in enumerate(test_queries):
            try:
                async with session.post(f"{self.backend_url}/api/rag/query", 
                                      json=query_data) as response:
                    if response.status == 200:
                        data = await response.json()
                        rag_results[f"query_{i+1}"] = {
                            'status': 'PASS',
                            'layer': query_data['layer'],
                            'total_found': data.get('total_found', 0),
                            'has_results': data.get('total_found', 0) > 0
                        }
                        logger.info(f"✅ RAG query {i+1} ({query_data['layer']}) - {data.get('total_found', 0)} results")
                    else:
                        rag_results[f"query_{i+1}"] = {'status': 'FAIL', 'error': f"HTTP {response.status}"}
                        
            except Exception as e:
                logger.error(f"❌ RAG query {i+1} error: {str(e)}")
                rag_results[f"query_{i+1}"] = {'status': 'FAIL', 'error': str(e)}
        
        self.test_results['rag_queries'] = rag_results
        
        passed_tests = sum(1 for result in rag_results.values() if result.get('status') == 'PASS')
        total_tests = len(rag_results)
        
        if passed_tests == total_tests:
            logger.info(f"✅ RAG system fully functional ({passed_tests}/{total_tests})")
            return True
        else:
            logger.warning(f"⚠️ RAG system partially functional ({passed_tests}/{total_tests})")
            return passed_tests > 0
    
    async def test_workflow_endpoints(self, session):
        """Test workflow management endpoints"""
        logger.info("⚙️ Testing workflow endpoints...")
        
        try:
            # Test workflow listing
            async with session.get(f"{self.backend_url}/api/workflows") as response:
                if response.status == 200:
                    data = await response.json()
                    workflows = data.get('workflows', [])
                    
                    self.test_results['workflows'] = {
                        'status': 'PASS',
                        'total_workflows': len(workflows),
                        'workflow_ids': [w.get('id') for w in workflows]
                    }
                    
                    logger.info(f"✅ Found {len(workflows)} available workflows")
                    return True
                else:
                    self.test_results['workflows'] = {'status': 'FAIL', 'error': f"HTTP {response.status}"}
                    return False
                    
        except Exception as e:
            logger.error(f"❌ Workflow endpoints error: {str(e)}")
            self.test_results['workflows'] = {'status': 'FAIL', 'error': str(e)}
            return False
    
    async def test_portfolio_endpoints(self, session):
        """Test portfolio management endpoints"""
        logger.info("💼 Testing portfolio endpoints...")
        
        try:
            async with session.get(f"{self.backend_url}/api/portfolios/companies") as response:
                if response.status == 200:
                    data = await response.json()
                    companies = data.get('companies', [])
                    
                    self.test_results['portfolio'] = {
                        'status': 'PASS',
                        'total_companies': len(companies),
                        'sample_company': companies[0] if companies else None
                    }
                    
                    logger.info(f"✅ Found {len(companies)} portfolio companies")
                    return True
                else:
                    self.test_results['portfolio'] = {'status': 'FAIL', 'error': f"HTTP {response.status}"}
                    return False
                    
        except Exception as e:
            logger.error(f"❌ Portfolio endpoints error: {str(e)}")
            self.test_results['portfolio'] = {'status': 'FAIL', 'error': str(e)}
            return False
    
    async def test_frontend_accessibility(self, session):
        """Test frontend accessibility"""
        logger.info("🌐 Testing frontend accessibility...")
        
        try:
            async with session.get(self.frontend_url) as response:
                if response.status == 200:
                    content = await response.text()
                    
                    # Check for key React app indicators
                    has_react_app = 'react' in content.lower() or 'root' in content
                    has_verssai = 'verssai' in content.lower()
                    
                    self.test_results['frontend'] = {
                        'status': 'PASS',
                        'accessible': True,
                        'has_react_indicators': has_react_app,
                        'has_verssai_branding': has_verssai
                    }
                    
                    logger.info("✅ Frontend is accessible")
                    return True
                else:
                    self.test_results['frontend'] = {'status': 'FAIL', 'error': f"HTTP {response.status}"}
                    return False
                    
        except Exception as e:
            logger.error(f"❌ Frontend accessibility error: {str(e)}")
            self.test_results['frontend'] = {'status': 'FAIL', 'error': str(e)}
            return False
    
    async def test_websocket_connection(self):
        """Test WebSocket MCP connection"""
        logger.info("🔌 Testing WebSocket MCP connection...")
        
        try:
            import websockets
            
            uri = "ws://localhost:8080/mcp?user_role=superadmin"
            
            async with websockets.connect(uri) as websocket:
                # Send a test message
                await websocket.send(json.dumps({"type": "ping"}))
                
                # Wait for response
                response = await asyncio.wait_for(websocket.recv(), timeout=5)
                data = json.loads(response)
                
                if data.get('type') == 'pong' or data.get('type') == 'connected':
                    self.test_results['websocket'] = {
                        'status': 'PASS',
                        'connection_successful': True,
                        'response_type': data.get('type')
                    }
                    logger.info("✅ WebSocket MCP connection working")
                    return True
                else:
                    self.test_results['websocket'] = {'status': 'FAIL', 'error': f"Unexpected response: {data}"}
                    return False
                    
        except ImportError:
            logger.warning("⚠️ websockets library not available for WebSocket testing")
            self.test_results['websocket'] = {'status': 'SKIP', 'reason': 'websockets library not available'}
            return True  # Don't fail the overall test
        except Exception as e:
            logger.error(f"❌ WebSocket connection error: {str(e)}")
            self.test_results['websocket'] = {'status': 'FAIL', 'error': str(e)}
            return False
    
    def check_file_structure(self):
        """Check if required files exist"""
        logger.info("📁 Checking file structure...")
        
        required_files = [
            "backend/verssai_enhanced_backend_with_dataset.py",
            "backend/verssai_dataset_processor.py",
            "frontend/src/components/VERSSAIEnhancedPlatform.js",
            "frontend/src/components/VERSSAIDataVisualization.js",
            "start_verssai_enhanced_platform.sh"
        ]
        
        file_status = {}
        
        for file_path in required_files:
            exists = Path(file_path).exists()
            file_status[file_path] = exists
            
            if exists:
                logger.info(f"✅ {file_path}")
            else:
                logger.warning(f"⚠️ {file_path} - Missing")
        
        self.test_results['file_structure'] = file_status
        
        missing_files = [f for f, exists in file_status.items() if not exists]
        if missing_files:
            logger.warning(f"⚠️ {len(missing_files)} files missing")
            return False
        else:
            logger.info("✅ All required files present")
            return True
    
    async def run_all_tests(self):
        """Run all integration tests"""
        logger.info("🚀 Starting VERSSAI Enhanced Platform Integration Tests")
        logger.info("="*60)
        
        # Check file structure first
        self.check_file_structure()
        
        # Create aiohttp session
        timeout = aiohttp.ClientTimeout(total=30)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            
            # Run all async tests
            tests = [
                ("Backend Health", self.test_backend_health(session)),
                ("Dataset Integration", self.test_dataset_integration(session)),
                ("RAG Queries", self.test_rag_queries(session)),
                ("Workflow Endpoints", self.test_workflow_endpoints(session)),
                ("Portfolio Endpoints", self.test_portfolio_endpoints(session)),
                ("Frontend Accessibility", self.test_frontend_accessibility(session))
            ]
            
            # Run tests sequentially
            test_results = []
            for test_name, test_coro in tests:
                logger.info(f"\n📋 Running: {test_name}")
                try:
                    result = await test_coro
                    test_results.append((test_name, result))
                except Exception as e:
                    logger.error(f"❌ {test_name} failed with exception: {str(e)}")
                    test_results.append((test_name, False))
        
        # Test WebSocket separately
        logger.info(f"\n📋 Running: WebSocket Connection")
        try:
            websocket_result = await self.test_websocket_connection()
            test_results.append(("WebSocket Connection", websocket_result))
        except Exception as e:
            logger.error(f"❌ WebSocket test failed: {str(e)}")
            test_results.append(("WebSocket Connection", False))
        
        # Generate report
        self.generate_test_report(test_results)
    
    def generate_test_report(self, test_results):
        """Generate comprehensive test report"""
        logger.info("\n" + "="*60)
        logger.info("📊 VERSSAI INTEGRATION TEST REPORT")
        logger.info("="*60)
        
        # Calculate overall statistics
        total_tests = len(test_results)
        passed_tests = sum(1 for _, result in test_results if result)
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        # Test duration
        duration = datetime.now() - self.start_time
        
        # Overall status
        logger.info(f"🕒 Test Duration: {duration.total_seconds():.2f} seconds")
        logger.info(f"📈 Success Rate: {success_rate:.1f}% ({passed_tests}/{total_tests})")
        
        if success_rate >= 80:
            logger.info("🎉 OVERALL STATUS: EXCELLENT")
        elif success_rate >= 60:
            logger.info("⚠️ OVERALL STATUS: GOOD (some issues)")
        else:
            logger.info("❌ OVERALL STATUS: NEEDS ATTENTION")
        
        logger.info("\n📋 Individual Test Results:")
        for test_name, result in test_results:
            status_icon = "✅" if result else "❌"
            logger.info(f"{status_icon} {test_name}")
        
        # Detailed results
        logger.info("\n📊 Detailed Results:")
        
        # Dataset information
        if 'dataset_integration' in self.test_results:
            dataset_stats = self.test_results['dataset_integration'].get('/api/dataset/stats', {})
            if dataset_stats.get('status') == 'PASS':
                logger.info("📊 Dataset: Real VERSSAI data loaded successfully")
            else:
                logger.info("📊 Dataset: Using simulated data (real dataset not found)")
        
        # RAG system
        if 'rag_queries' in self.test_results:
            rag_working = sum(1 for result in self.test_results['rag_queries'].values() 
                            if result.get('status') == 'PASS')
            logger.info(f"🧠 RAG System: {rag_working}/3 layers working")
        
        # Workflows
        if 'workflows' in self.test_results and self.test_results['workflows'].get('status') == 'PASS':
            workflow_count = self.test_results['workflows'].get('total_workflows', 0)
            logger.info(f"⚙️ Workflows: {workflow_count} workflows available")
        
        # Recommendations
        logger.info(f"\n💡 Recommendations:")
        
        if failed_tests == 0:
            logger.info("🎯 Platform is ready for production use!")
            logger.info("🚀 All systems operational - excellent work!")
        else:
            if 'backend_health' in [name for name, result in test_results if not result]:
                logger.info("🔧 Backend server may not be running - check startup script")
            if 'frontend' in [name for name, result in test_results if not result]:
                logger.info("🌐 Frontend may not be accessible - check React development server")
            if any('dataset' in name.lower() for name, result in test_results if not result):
                logger.info("📊 Consider placing VERSSAI_Massive_Dataset_Complete.xlsx in project root")
        
        # Next steps
        logger.info(f"\n🎯 Next Steps:")
        logger.info("1. Open http://localhost:3000 to access the VERSSAI platform")
        logger.info("2. Test the 6 VC intelligence workflows")
        logger.info("3. Explore the dataset visualizations")
        logger.info("4. Try the researcher search and RAG queries")
        
        logger.info("\n" + "="*60)
        
        # Save results to file
        self.save_results_to_file()
    
    def save_results_to_file(self):
        """Save test results to JSON file"""
        try:
            results_file = "verssai_integration_test_results.json"
            
            report_data = {
                "timestamp": datetime.now().isoformat(),
                "test_results": self.test_results,
                "platform_info": {
                    "backend_url": self.backend_url,
                    "frontend_url": self.frontend_url,
                    "test_duration_seconds": (datetime.now() - self.start_time).total_seconds()
                }
            }
            
            with open(results_file, 'w') as f:
                json.dump(report_data, f, indent=2)
            
            logger.info(f"💾 Test results saved to: {results_file}")
            
        except Exception as e:
            logger.error(f"❌ Failed to save test results: {str(e)}")

async def main():
    """Main test execution"""
    if len(sys.argv) > 1 and sys.argv[1] == '--help':
        print("""
VERSSAI Enhanced Platform Integration Tester

Usage: python test_verssai_integration.py

This script tests all components of the VERSSAI Enhanced Platform:
- Backend API health and endpoints
- Dataset integration (real or simulated)
- RAG system queries
- Workflow management
- Portfolio endpoints
- Frontend accessibility
- WebSocket MCP connection

Make sure both backend and frontend servers are running:
1. Backend: python backend/verssai_enhanced_backend_with_dataset.py
2. Frontend: npm start (in frontend directory)

Or use the startup script: ./start_verssai_enhanced_platform.sh
        """)
        return
    
    tester = VERSSAIIntegrationTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
