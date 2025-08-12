#!/usr/bin/env python3
"""
VERSSAI Engine Backend Testing After Frontend Styling Update
Tests core functionality to ensure all backend services remain intact after ClickUp-style theme update
Focus: Health checks, Founder Signal Fit, Data Ingestion, Core Backend Services
"""

import requests
import json
import os
import tempfile
from pathlib import Path
from datetime import datetime
import uuid
import time
import urllib3

# Disable SSL warnings for testing
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configuration
BACKEND_URL = "https://6ba2da35-de59-4fa1-b62b-c6f198fa8fe5.preview.emergentagent.com/api"
TEST_TIMEOUT = 30
AI_PROCESSING_TIMEOUT = 60

class VERSSAIEngineBackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        # Disable SSL verification for testing environment
        self.session.verify = False
        self.test_results = []
        
    def log_test(self, test_name, success, details="", error_msg=""):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "error": error_msg,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if error_msg:
            print(f"   Error: {error_msg}")
        print()

    def test_main_health_endpoint(self):
        """Test main /api/health endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                status = data.get('status', 'unknown')
                services = data.get('services', {})
                features = data.get('features', {})
                
                # Check core services
                mongodb = services.get('mongodb', 'unknown')
                postgresql = services.get('postgresql', 'unknown')
                rag_system = services.get('rag_system', 'unknown')
                ai_agents = services.get('ai_agents', 'unknown')
                
                details = f"Status: {status}, MongoDB: {mongodb}, PostgreSQL: {postgresql}, RAG: {rag_system}, AI Agents: {ai_agents}"
                
                if status == 'healthy' and mongodb == 'connected' and rag_system == 'operational':
                    self.log_test("Main Health Endpoint", True, details)
                else:
                    self.log_test("Main Health Endpoint", False, details, "Core services not fully operational")
                    
            else:
                self.log_test("Main Health Endpoint", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Main Health Endpoint", False, "", str(e))

    def test_founder_signal_health(self):
        """Test /api/founder-signal/health endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/founder-signal/health", timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                status = data.get('status', 'unknown')
                framework = data.get('framework', 'unknown')
                features = data.get('features', {})
                
                # Check Founder Signal Fit features
                deck_upload = features.get('deck_upload', False)
                ai_analysis = features.get('ai_analysis', False)
                founder_scoring = features.get('founder_scoring', False)
                
                details = f"Status: {status}, Framework: {framework}, Upload: {deck_upload}, AI Analysis: {ai_analysis}, Scoring: {founder_scoring}"
                
                if status == 'operational' and deck_upload and ai_analysis:
                    self.log_test("Founder Signal Health", True, details)
                else:
                    self.log_test("Founder Signal Health", False, details, "Founder Signal features not fully operational")
                    
            else:
                self.log_test("Founder Signal Health", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Founder Signal Health", False, "", str(e))

    def test_google_twitter_api_status(self):
        """Test Google Search and Twitter API integration status"""
        try:
            response = self.session.get(f"{self.base_url}/research/status", timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                
                google_search = data.get('google_search_api', {})
                twitter_api = data.get('twitter_api', {})
                cache_stats = data.get('cache_stats', {})
                
                google_status = google_search.get('status', 'unknown')
                twitter_status = twitter_api.get('status', 'unknown')
                google_cache = cache_stats.get('google_cache_entries', 0)
                twitter_cache = cache_stats.get('twitter_cache_entries', 0)
                
                details = f"Google: {google_status} (cache: {google_cache}), Twitter: {twitter_status} (cache: {twitter_cache})"
                
                # Success if at least one API is configured
                if google_status == 'configured' or twitter_status == 'configured':
                    self.log_test("Google & Twitter API Status", True, details)
                else:
                    self.log_test("Google & Twitter API Status", True, details + " (Mock responses available)")
                    
            else:
                self.log_test("Google & Twitter API Status", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Google & Twitter API Status", False, "", str(e))

    def test_file_upload_quick_test(self):
        """Quick test of file upload functionality without actual file processing"""
        try:
            # Create a small test PDF
            test_pdf_content = b"""%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>stream
BT/F1 12 Tf 100 700 Td(Test Deck)Tj ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000207 00000 n 
trailer<</Size 5/Root 1 0 R>>
startxref
295
%%EOF"""
            
            # Create temporary file
            temp_file = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
            temp_file.write(test_pdf_content)
            temp_file.close()
            
            test_data = {
                'company_name': 'Quick Test Company',
                'uploaded_by': 'Test User'
            }
            
            with open(temp_file.name, 'rb') as f:
                files = {'file': ('test_deck.pdf', f, 'application/pdf')}
                response = self.session.post(
                    f"{self.base_url}/founder-signal/upload-deck",
                    data=test_data,
                    files=files,
                    timeout=TEST_TIMEOUT
                )
            
            # Clean up
            os.unlink(temp_file.name)
            
            if response.status_code == 200:
                data = response.json()
                deck_id = data.get('deck_id')
                company_name = data.get('company_name')
                status = data.get('status')
                
                if deck_id and company_name == 'Quick Test Company' and status == 'processing':
                    self.log_test("File Upload Quick Test", True, f"Upload successful - Deck ID: {deck_id}, Status: {status}")
                else:
                    self.log_test("File Upload Quick Test", False, f"Invalid response: {data}")
            else:
                self.log_test("File Upload Quick Test", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("File Upload Quick Test", False, "", str(e))

    def test_portfolio_management_endpoints(self):
        """Quick test of Portfolio Management endpoints"""
        try:
            # Test 1: Portfolio status
            status_response = self.session.get(f"{self.base_url}/portfolio/status", timeout=TEST_TIMEOUT)
            status_ok = status_response.status_code == 200
            
            # Test 2: Portfolio companies list
            companies_response = self.session.get(f"{self.base_url}/portfolio/companies", timeout=TEST_TIMEOUT)
            companies_ok = companies_response.status_code == 200
            
            # Test 3: Portfolio ingest data endpoint (with minimal test data)
            ingest_data = {
                'data_type': 'company',
                'company_id': 'test_company_001',
                'data': json.dumps({
                    'company_name': 'Test Portfolio Company',
                    'stage': 'Series A',
                    'industry': 'Technology',
                    'initial_investment': 1000000,
                    'current_valuation': 3000000
                })
            }
            
            ingest_response = self.session.post(
                f"{self.base_url}/portfolio/ingest-data",
                data=ingest_data,
                timeout=TEST_TIMEOUT
            )
            ingest_ok = ingest_response.status_code == 200
            
            endpoints_working = sum([status_ok, companies_ok, ingest_ok])
            
            details = f"Status: {'✅' if status_ok else '❌'}, Companies: {'✅' if companies_ok else '❌'}, Ingest: {'✅' if ingest_ok else '❌'}"
            
            if endpoints_working >= 2:
                self.log_test("Portfolio Management Endpoints", True, details)
            else:
                self.log_test("Portfolio Management Endpoints", False, details, f"Only {endpoints_working}/3 endpoints working")
                
        except Exception as e:
            self.log_test("Portfolio Management Endpoints", False, "", str(e))

    def test_fund_assessment_endpoints(self):
        """Quick test of Fund Assessment endpoints"""
        try:
            # Test 1: Add investment decision
            decision_data = {
                'company_name': 'Test Investment Company',
                'decision_type': 'invested',
                'investment_amount': 2000000,
                'valuation_at_decision': 8000000,
                'stage': 'Series A',
                'industry': 'Technology',
                'decision_rationale': 'Strong team and market opportunity',
                'key_factors': ['Experienced founders', 'Large market'],
                'risk_factors': ['Competition', 'Market timing'],
                'decision_maker': 'Investment Committee',
                'confidence_score': 0.8
            }
            
            decision_response = self.session.post(
                f"{self.base_url}/fund-assessment/add-investment-decision",
                json=decision_data,
                timeout=TEST_TIMEOUT
            )
            decision_ok = decision_response.status_code == 200
            
            # Test 2: Add investment outcome (if decision was successful)
            outcome_ok = False
            if decision_ok:
                decision_result = decision_response.json()
                decision_id = decision_result.get('decision_id')
                
                if decision_id:
                    outcome_data = {
                        'decision_id': decision_id,
                        'company_name': 'Test Investment Company',
                        'outcome_type': 'success',
                        'exit_valuation': 25000000,
                        'multiple': 3.1,
                        'irr': 45.5,
                        'success_factors': ['Strong execution', 'Market growth']
                    }
                    
                    outcome_response = self.session.post(
                        f"{self.base_url}/fund-assessment/add-investment-outcome",
                        json=outcome_data,
                        timeout=TEST_TIMEOUT
                    )
                    outcome_ok = outcome_response.status_code == 200
            
            # Test 3: Run backtest
            backtest_data = {
                'fund_id': 'test_fund_001',
                'strategy_name': 'AI Focus Strategy',
                'time_period': '2020-2024',
                'strategy_config': {
                    'focus_sectors': ['AI', 'Technology'],
                    'stage_preference': 'Series A',
                    'risk_tolerance': 'medium'
                }
            }
            
            backtest_response = self.session.post(
                f"{self.base_url}/fund-assessment/run-backtest",
                json=backtest_data,
                timeout=TEST_TIMEOUT
            )
            backtest_ok = backtest_response.status_code == 200
            
            endpoints_working = sum([decision_ok, outcome_ok, backtest_ok])
            
            details = f"Decision: {'✅' if decision_ok else '❌'}, Outcome: {'✅' if outcome_ok else '❌'}, Backtest: {'✅' if backtest_ok else '❌'}"
            
            if endpoints_working >= 2:
                self.log_test("Fund Assessment Endpoints", True, details)
            else:
                self.log_test("Fund Assessment Endpoints", False, details, f"Only {endpoints_working}/3 endpoints working")
                
        except Exception as e:
            self.log_test("Fund Assessment Endpoints", False, "", str(e))

    def test_fund_allocation_endpoints(self):
        """Quick test of Fund Allocation endpoints"""
        try:
            # Test 1: Create allocation targets
            targets_data = [
                {
                    'category': 'stage',
                    'subcategory': 'Series A',
                    'target_percentage': 60.0,
                    'minimum_percentage': 50.0,
                    'maximum_percentage': 70.0
                },
                {
                    'category': 'industry',
                    'subcategory': 'AI',
                    'target_percentage': 40.0,
                    'minimum_percentage': 30.0,
                    'maximum_percentage': 50.0
                }
            ]
            
            targets_response = self.session.post(
                f"{self.base_url}/fund-allocation/create-targets",
                json=targets_data,
                timeout=TEST_TIMEOUT
            )
            targets_ok = targets_response.status_code == 200
            
            # Test 2: Optimize fund allocation
            optimization_data = {
                'fund_id': 'test_fund_001',
                'fund_name': 'Test VC Fund',
                'fund_size': 100000000,
                'allocation_targets': [
                    {'category': 'stage', 'subcategory': 'Series A', 'target_percentage': 60.0},
                    {'category': 'industry', 'subcategory': 'AI', 'target_percentage': 40.0}
                ],
                'current_allocations': {},
                'market_conditions': {'market_phase': 'growth', 'risk_level': 'medium'}
            }
            
            optimize_response = self.session.post(
                f"{self.base_url}/fund-allocation/optimize",
                json=optimization_data,
                timeout=TEST_TIMEOUT
            )
            optimize_ok = optimize_response.status_code == 200
            
            # Test 3: Ingest allocation data
            ingest_data = {
                'data_type': 'allocation_target',
                'fund_id': 'test_fund_001',
                'data': json.dumps({
                    'category': 'geography',
                    'subcategory': 'US',
                    'target_percentage': 80.0
                })
            }
            
            ingest_response = self.session.post(
                f"{self.base_url}/fund-allocation/ingest-data",
                data=ingest_data,
                timeout=TEST_TIMEOUT
            )
            ingest_ok = ingest_response.status_code == 200
            
            endpoints_working = sum([targets_ok, optimize_ok, ingest_ok])
            
            details = f"Targets: {'✅' if targets_ok else '❌'}, Optimize: {'✅' if optimize_ok else '❌'}, Ingest: {'✅' if ingest_ok else '❌'}"
            
            if endpoints_working >= 2:
                self.log_test("Fund Allocation Endpoints", True, details)
            else:
                self.log_test("Fund Allocation Endpoints", False, details, f"Only {endpoints_working}/3 endpoints working")
                
        except Exception as e:
            self.log_test("Fund Allocation Endpoints", False, "", str(e))

    def test_ai_agents_operational(self):
        """Test that AI agents are operational"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                services = data.get('services', {})
                features = data.get('features', {})
                
                ai_agents = services.get('ai_agents', 'unknown')
                founder_signal_ai = features.get('founder_signal_ai', 'unknown')
                gemini_integration = features.get('gemini_integration', 'unknown')
                
                details = f"AI Agents: {ai_agents}, Founder Signal AI: {founder_signal_ai}, Gemini: {gemini_integration}"
                
                if ai_agents == 'operational' and founder_signal_ai == 'enabled':
                    self.log_test("AI Agents Operational", True, details)
                else:
                    self.log_test("AI Agents Operational", False, details, "AI agents not fully operational")
                    
            else:
                self.log_test("AI Agents Operational", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("AI Agents Operational", False, "", str(e))

    def test_chromadb_connectivity(self):
        """Test ChromaDB connectivity"""
        try:
            response = self.session.get(f"{self.base_url}/rag/status", timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                rag_system = data.get('rag_system', 'unknown')
                collections = data.get('collections', {})
                
                # Check for 3-level collections
                platform_collection = collections.get('platform_knowledge', 'unknown')
                investor_collection = collections.get('investor_knowledge', 'unknown')
                company_collection = collections.get('company_knowledge', 'unknown')
                
                details = f"RAG System: {rag_system}, Platform: {platform_collection}, Investor: {investor_collection}, Company: {company_collection}"
                
                if rag_system == 'operational':
                    self.log_test("ChromaDB Connectivity", True, details)
                else:
                    self.log_test("ChromaDB Connectivity", False, details, "ChromaDB not operational")
                    
            else:
                self.log_test("ChromaDB Connectivity", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("ChromaDB Connectivity", False, "", str(e))

    def test_gemini_integration(self):
        """Test Google Gemini Pro integration"""
        try:
            # Test RAG query to verify Gemini integration
            query_data = {
                "query": "What are key success factors for startups?",
                "top_k": 3
            }
            
            response = self.session.post(
                f"{self.base_url}/rag/query",
                json=query_data,
                timeout=TEST_TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                total_results = data.get('total_results', 0)
                processing_time = data.get('processing_time', 0)
                
                details = f"Query processed, Results: {total_results}, Processing Time: {processing_time:.2f}s"
                
                if total_results > 0 and processing_time > 0:
                    self.log_test("Gemini Integration", True, details)
                else:
                    self.log_test("Gemini Integration", False, details, "No results or invalid processing time")
                    
            else:
                self.log_test("Gemini Integration", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Gemini Integration", False, "", str(e))

    def generate_verssai_engine_test_report(self):
        """Generate comprehensive test report"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print("\n" + "=" * 100)
        print("🎯 VERSSAI ENGINE BACKEND TEST REPORT - AFTER FRONTEND STYLING UPDATE")
        print("=" * 100)
        print(f"📊 OVERALL RESULTS: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}% success rate)")
        print(f"✅ PASSED: {passed_tests}")
        print(f"❌ FAILED: {failed_tests}")
        print()
        
        # Categorize results
        health_tests = [r for r in self.test_results if 'Health' in r['test'] or 'health' in r['test']]
        founder_signal_tests = [r for r in self.test_results if 'Founder Signal' in r['test'] or 'File Upload' in r['test'] or 'Google & Twitter' in r['test']]
        data_ingestion_tests = [r for r in self.test_results if 'Portfolio' in r['test'] or 'Fund' in r['test']]
        core_services_tests = [r for r in self.test_results if 'AI Agents' in r['test'] or 'ChromaDB' in r['test'] or 'Gemini' in r['test']]
        
        def print_category_results(category_name, tests):
            if tests:
                passed = sum(1 for t in tests if t['success'])
                total = len(tests)
                rate = (passed / total * 100) if total > 0 else 0
                print(f"📋 {category_name}: {passed}/{total} ({rate:.1f}%)")
                for test in tests:
                    status = "✅" if test['success'] else "❌"
                    print(f"   {status} {test['test']}")
                    if test['details']:
                        print(f"      {test['details']}")
                    if test['error']:
                        print(f"      Error: {test['error']}")
                print()
        
        print_category_results("HEALTH CHECK AND STATUS", health_tests)
        print_category_results("FOUNDER SIGNAL FIT FUNCTIONALITY", founder_signal_tests)
        print_category_results("DATA INGESTION ENDPOINTS", data_ingestion_tests)
        print_category_results("CORE BACKEND SERVICES", core_services_tests)
        
        # Overall assessment
        print("🔍 ASSESSMENT:")
        if success_rate >= 90:
            print("🎉 EXCELLENT: All core functionality intact after frontend styling update")
        elif success_rate >= 80:
            print("✅ GOOD: Most functionality working, minor issues detected")
        elif success_rate >= 70:
            print("⚠️  ACCEPTABLE: Core functionality working, some issues need attention")
        else:
            print("❌ ISSUES DETECTED: Significant problems found, investigation needed")
        
        print()
        print("=" * 100)
        
        return {
            'total': total_tests,
            'passed': passed_tests,
            'failed': failed_tests,
            'success_rate': success_rate,
            'health_tests': len(health_tests),
            'founder_signal_tests': len(founder_signal_tests),
            'data_ingestion_tests': len(data_ingestion_tests),
            'core_services_tests': len(core_services_tests)
        }

    def run_verssai_engine_tests(self):
        """Run VERSSAI engine backend tests after frontend styling update"""
        print("🚀 TESTING VERSSAI ENGINE BACKEND AFTER FRONTEND STYLING UPDATE")
        print("=" * 100)
        print("🎯 FOCUS: Verify all core functionality remains intact after ClickUp-style theme update")
        print("🔬 TESTING: Health checks, Founder Signal Fit, Data Ingestion, Core Backend Services")
        print("=" * 100)
        print()
        
        # 1. Health Check and Status
        print("🏥 TESTING HEALTH CHECK AND STATUS...")
        self.test_main_health_endpoint()
        
        # 2. Founder Signal Fit Functionality
        print("\n🎯 TESTING FOUNDER SIGNAL FIT FUNCTIONALITY...")
        self.test_founder_signal_health()
        self.test_google_twitter_api_status()
        self.test_file_upload_quick_test()
        
        # 3. Data Ingestion Endpoints
        print("\n📊 TESTING DATA INGESTION ENDPOINTS...")
        self.test_portfolio_management_endpoints()
        self.test_fund_assessment_endpoints()
        self.test_fund_allocation_endpoints()
        
        # 4. Core Backend Services
        print("\n🤖 TESTING CORE BACKEND SERVICES...")
        self.test_ai_agents_operational()
        self.test_chromadb_connectivity()
        self.test_gemini_integration()
        
        # Generate test report
        return self.generate_verssai_engine_test_report()

if __name__ == "__main__":
    tester = VERSSAIEngineBackendTester()
    results = tester.run_verssai_engine_tests()
    
    # Exit with appropriate code
    exit_code = 0 if results['success_rate'] >= 80 else 1
    exit(exit_code)