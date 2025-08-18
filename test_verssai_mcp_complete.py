#!/usr/bin/env python3
"""
VERSSAI MCP + N8N Integration Test Suite
Complete testing of all 6 VC workflows with real verification
"""

import asyncio
import json
import logging
import requests
import time
import websockets
from datetime import datetime
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class VERSSAIMCPTester:
    """Comprehensive test suite for VERSSAI MCP + N8N integration"""
    
    def __init__(self):
        self.mcp_backend_url = "http://localhost:8080"
        self.n8n_url = "http://localhost:5678"
        self.websocket_url = "ws://localhost:8080/mcp"
        self.test_results = {}
        
    def test_mcp_backend_health(self) -> bool:
        """Test MCP backend health and availability"""
        try:
            logger.info("🔍 Testing MCP Backend Health...")
            
            response = requests.get(f"{self.mcp_backend_url}/api/health", timeout=10)
            if response.status_code == 200:
                health_data = response.json()
                logger.info(f"✅ MCP Backend Health: {health_data['status']}")
                logger.info(f"   Services: {health_data['services']}")
                logger.info(f"   Metrics: {health_data['metrics']}")
                return True
            else:
                logger.error(f"❌ MCP Backend health check failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ MCP Backend health check error: {e}")
            return False
    
    def test_n8n_connectivity(self) -> bool:
        """Test N8N connectivity and workflow availability"""
        try:
            logger.info("🔍 Testing N8N Connectivity...")
            
            # Test N8N health endpoint
            response = requests.get(f"{self.n8n_url}/healthz", timeout=10)
            if response.status_code == 200:
                logger.info("✅ N8N is operational and accessible")
                return True
            else:
                logger.error(f"❌ N8N connectivity failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ N8N connectivity error: {e}")
            return False
    
    def test_dataset_integration(self) -> bool:
        """Test VERSSAI dataset integration and statistics"""
        try:
            logger.info("🔍 Testing VERSSAI Dataset Integration...")
            
            response = requests.get(f"{self.mcp_backend_url}/api/dataset/stats", timeout=10)
            if response.status_code == 200:
                stats = response.json()
                logger.info("✅ VERSSAI Dataset Integration:")
                logger.info(f"   Papers: {stats['papers']['total']}")
                logger.info(f"   Researchers: {stats['researchers']['total']}")
                logger.info(f"   Institutions: {stats['institutions']['total']}")
                logger.info(f"   Citations: {stats['citations']['total']}")
                logger.info(f"   Status: {stats['processing_status']}")
                
                # Verify minimum dataset requirements
                if (stats['papers']['total'] >= 1000 and 
                    stats['researchers']['total'] >= 2000):
                    return True
                else:
                    logger.error("❌ Dataset does not meet minimum requirements")
                    return False
            else:
                logger.error(f"❌ Dataset stats failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Dataset integration error: {e}")
            return False
    
    def test_workflow_list(self) -> bool:
        """Test workflow listing and configuration"""
        try:
            logger.info("🔍 Testing Available Workflows...")
            
            response = requests.get(f"{self.mcp_backend_url}/api/workflows/list", timeout=10)
            if response.status_code == 200:
                workflows = response.json()
                logger.info(f"✅ Available Workflows: {workflows['total_workflows']}")
                
                expected_workflows = [
                    'founder_signal_assessment',
                    'due_diligence_automation', 
                    'competitive_intelligence',
                    'fund_allocation_optimization',
                    'portfolio_management',
                    'lp_communication_automation'
                ]
                
                available_types = [w['type'] for w in workflows['workflows']]
                
                for expected in expected_workflows:
                    if expected in available_types:
                        logger.info(f"   ✅ {expected}")
                    else:
                        logger.error(f"   ❌ Missing: {expected}")
                        return False
                
                return len(available_types) == 6
            else:
                logger.error(f"❌ Workflow list failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Workflow list error: {e}")
            return False
    
    def test_rag_system(self) -> bool:
        """Test 3-layer RAG system"""
        try:
            logger.info("🔍 Testing RAG System...")
            
            # Test RAG status
            response = requests.get(f"{self.mcp_backend_url}/api/rag/status", timeout=10)
            if response.status_code == 200:
                rag_status = response.json()
                logger.info(f"✅ RAG System Status: {rag_status['status']}")
                logger.info(f"   Architecture: {rag_status['architecture']}")
                logger.info(f"   Confidence: {rag_status['confidence_score']}")
                
                # Test RAG query
                query_payload = {
                    "query": "venture capital investment patterns",
                    "layer": "all"
                }
                
                response = requests.post(
                    f"{self.mcp_backend_url}/api/rag/query",
                    json=query_payload,
                    timeout=15
                )
                
                if response.status_code == 200:
                    query_result = response.json()
                    logger.info(f"✅ RAG Query successful")
                    logger.info(f"   Confidence: {query_result['results']['confidence_score']}")
                    logger.info(f"   Processing time: {query_result['metadata']['processing_time_ms']}ms")
                    return True
                else:
                    logger.error(f"❌ RAG query failed: {response.status_code}")
                    return False
            else:
                logger.error(f"❌ RAG status failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ RAG system error: {e}")
            return False
    
    def test_individual_workflow(self, workflow_type: str) -> bool:
        """Test individual workflow execution"""
        try:
            logger.info(f"🔍 Testing Workflow: {workflow_type}")
            
            # Prepare test payload
            workflow_payload = {
                "workflow_type": workflow_type,
                "company_id": "test_company_001",
                "user_id": "test_user@verssai.com",
                "parameters": {
                    "analysis_depth": "comprehensive",
                    "test_mode": True
                }
            }
            
            # Trigger workflow
            response = requests.post(
                f"{self.mcp_backend_url}/api/workflows/trigger",
                json=workflow_payload,
                timeout=45  # Allow more time for workflow execution
            )
            
            if response.status_code == 200:
                result = response.json()
                execution_id = result['execution_id']
                
                logger.info(f"✅ Workflow {workflow_type} triggered successfully")
                logger.info(f"   Execution ID: {execution_id}")
                logger.info(f"   Status: {result['status']}")
                
                # Check workflow status
                time.sleep(2)  # Allow processing time
                
                status_response = requests.get(
                    f"{self.mcp_backend_url}/api/workflows/status/{execution_id}",
                    timeout=10
                )
                
                if status_response.status_code == 200:
                    status_data = status_response.json()
                    logger.info(f"   Final Status: {status_data['status']}")
                    
                    if status_data['status'] == 'completed':
                        logger.info(f"✅ Workflow {workflow_type} completed successfully")
                        return True
                    else:
                        logger.error(f"❌ Workflow {workflow_type} failed: {status_data.get('error', 'Unknown error')}")
                        return False
                else:
                    logger.error(f"❌ Status check failed for {workflow_type}")
                    return False
            else:
                logger.error(f"❌ Workflow {workflow_type} trigger failed: {response.status_code}")
                try:
                    error_data = response.json()
                    logger.error(f"   Error details: {error_data}")
                except:
                    logger.error(f"   Error response: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Workflow {workflow_type} error: {e}")
            return False
    
    def test_all_workflows(self) -> Dict[str, bool]:
        """Test all 6 VC workflows"""
        workflows = [
            'founder_signal_assessment',
            'due_diligence_automation',
            'competitive_intelligence', 
            'fund_allocation_optimization',
            'portfolio_management',
            'lp_communication_automation'
        ]
        
        results = {}
        logger.info("🔍 Testing All VC Workflows...")
        
        for workflow in workflows:
            results[workflow] = self.test_individual_workflow(workflow)
            time.sleep(1)  # Brief pause between tests
        
        return results
    
    async def test_websocket_mcp(self) -> bool:
        """Test WebSocket MCP communication"""
        try:
            logger.info("🔍 Testing WebSocket MCP Communication...")
            
            async with websockets.connect(self.websocket_url) as websocket:
                # Wait for connection message
                welcome_msg = await websocket.recv()
                welcome_data = json.loads(welcome_msg)
                
                if welcome_data['type'] == 'connection_established':
                    logger.info("✅ WebSocket connection established")
                    logger.info(f"   Connection ID: {welcome_data['connection_id']}")
                    
                    # Test status request
                    status_request = {
                        "id": "test_001",
                        "method": "get_status",
                        "params": {}
                    }
                    
                    await websocket.send(json.dumps(status_request))
                    
                    # Wait for response
                    response_msg = await websocket.recv()
                    response_data = json.loads(response_msg)
                    
                    if response_data['type'] == 'status_update':
                        logger.info("✅ WebSocket status request successful")
                        logger.info(f"   Platform: {response_data['status']['platform']}")
                        return True
                    else:
                        logger.error(f"❌ Unexpected WebSocket response: {response_data}")
                        return False
                else:
                    logger.error(f"❌ Unexpected welcome message: {welcome_data}")
                    return False
                    
        except Exception as e:
            logger.error(f"❌ WebSocket MCP error: {e}")
            return False
    
    def test_researcher_search(self) -> bool:
        """Test researcher search functionality"""
        try:
            logger.info("🔍 Testing Researcher Search...")
            
            search_payload = {
                "query": "artificial intelligence",
                "limit": 5
            }
            
            response = requests.post(
                f"{self.mcp_backend_url}/api/researchers/search",
                json=search_payload,
                timeout=10
            )
            
            if response.status_code == 200:
                search_results = response.json()
                logger.info(f"✅ Researcher search successful")
                logger.info(f"   Query: {search_results['query']}")
                logger.info(f"   Results found: {search_results['total_found']}")
                
                if search_results['total_found'] > 0:
                    logger.info("   Sample results:")
                    for i, researcher in enumerate(search_results['results'][:2]):
                        logger.info(f"     {i+1}. {researcher['name']} ({researcher['affiliation']})")
                
                return True
            else:
                logger.error(f"❌ Researcher search failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Researcher search error: {e}")
            return False
    
    def test_institution_analysis(self) -> bool:
        """Test institution analysis functionality"""
        try:
            logger.info("🔍 Testing Institution Analysis...")
            
            response = requests.get(f"{self.mcp_backend_url}/api/institutions/analysis", timeout=10)
            
            if response.status_code == 200:
                analysis_data = response.json()
                logger.info(f"✅ Institution analysis successful")
                logger.info(f"   Institutions analyzed: {len(analysis_data['institutions'])}")
                
                if analysis_data['institutions']:
                    top_institution = analysis_data['institutions'][0]
                    logger.info(f"   Top institution: {top_institution['name']}")
                    logger.info(f"   Total citations: {top_institution['total_citations']}")
                
                return True
            else:
                logger.error(f"❌ Institution analysis failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Institution analysis error: {e}")
            return False
    
    async def run_comprehensive_test(self):
        """Run complete test suite"""
        logger.info("🚀 Starting VERSSAI MCP + N8N Integration Test Suite")
        logger.info("=" * 60)
        
        test_results = {}
        
        # Test sequence
        tests = [
            ("MCP Backend Health", self.test_mcp_backend_health),
            ("N8N Connectivity", self.test_n8n_connectivity),
            ("Dataset Integration", self.test_dataset_integration),
            ("Workflow List", self.test_workflow_list),
            ("RAG System", self.test_rag_system),
            ("Researcher Search", self.test_researcher_search),
            ("Institution Analysis", self.test_institution_analysis),
        ]
        
        # Run basic tests
        for test_name, test_func in tests:
            logger.info(f"\n📋 Running: {test_name}")
            test_results[test_name] = test_func()
        
        # Test WebSocket MCP
        logger.info(f"\n📋 Running: WebSocket MCP Communication")
        test_results["WebSocket MCP"] = await self.test_websocket_mcp()
        
        # Test all workflows
        logger.info(f"\n📋 Running: All VC Workflows")
        workflow_results = self.test_all_workflows()
        test_results.update(workflow_results)
        
        # Print summary
        self.print_test_summary(test_results)
        
        return test_results
    
    def print_test_summary(self, test_results: Dict[str, bool]):
        """Print comprehensive test summary"""
        logger.info("\n" + "=" * 60)
        logger.info("📊 VERSSAI MCP + N8N Integration Test Results")
        logger.info("=" * 60)
        
        passed = sum(1 for result in test_results.values() if result)
        total = len(test_results)
        
        # Basic functionality tests
        basic_tests = [
            "MCP Backend Health",
            "N8N Connectivity", 
            "Dataset Integration",
            "Workflow List",
            "RAG System",
            "Researcher Search",
            "Institution Analysis",
            "WebSocket MCP"
        ]
        
        logger.info("\n🔧 Core Platform Tests:")
        for test_name in basic_tests:
            if test_name in test_results:
                status = "✅ PASS" if test_results[test_name] else "❌ FAIL"
                logger.info(f"   {test_name}: {status}")
        
        # Workflow tests
        workflow_tests = [
            "founder_signal_assessment",
            "due_diligence_automation",
            "competitive_intelligence",
            "fund_allocation_optimization", 
            "portfolio_management",
            "lp_communication_automation"
        ]
        
        logger.info("\n⚙️  VC Workflow Tests:")
        for workflow in workflow_tests:
            if workflow in test_results:
                status = "✅ PASS" if test_results[workflow] else "❌ FAIL"
                workflow_name = workflow.replace('_', ' ').title()
                logger.info(f"   {workflow_name}: {status}")
        
        # Overall summary
        logger.info(f"\n📈 Overall Results:")
        logger.info(f"   Tests Passed: {passed}/{total}")
        logger.info(f"   Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            logger.info("🎉 ALL TESTS PASSED! VERSSAI MCP + N8N integration is fully operational!")
        elif passed >= total * 0.8:
            logger.info("⚠️  Most tests passed. Minor issues detected.")
        else:
            logger.info("❌ Multiple test failures. Please check configuration and services.")
        
        # Recommendations
        logger.info(f"\n💡 Next Steps:")
        if passed == total:
            logger.info("   ✅ Platform is ready for production use")
            logger.info("   ✅ All 6 VC workflows are operational")
            logger.info("   ✅ MCP + N8N integration is working perfectly")
        else:
            failed_tests = [name for name, result in test_results.items() if not result]
            logger.info(f"   🔧 Fix failed tests: {', '.join(failed_tests)}")
            logger.info("   📋 Verify N8N workflows are imported and active")
            logger.info("   🔌 Check service connectivity and configurations")

async def main():
    """Main test execution"""
    tester = VERSSAIMCPTester()
    
    # Brief startup delay to ensure services are ready
    logger.info("⏳ Waiting for services to be ready...")
    await asyncio.sleep(2)
    
    # Run comprehensive test suite
    results = await tester.run_comprehensive_test()
    
    # Exit with appropriate code
    all_passed = all(results.values())
    exit_code = 0 if all_passed else 1
    
    logger.info(f"\n🏁 Test suite completed. Exit code: {exit_code}")
    return exit_code

if __name__ == "__main__":
    # Run the test suite
    try:
        exit_code = asyncio.run(main())
        exit(exit_code)
    except KeyboardInterrupt:
        logger.info("\n⚠️  Test suite interrupted by user")
        exit(1)
    except Exception as e:
        logger.error(f"\n❌ Test suite error: {e}")
        exit(1)
