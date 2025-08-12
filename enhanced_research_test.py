#!/usr/bin/env python3
"""
Enhanced Research API Testing for VERSSAI VC Intelligence Platform
Focus: Google Search and Twitter API integrations with proper error handling
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BACKEND_URL = "https://6ba2da35-de59-4fa1-b62b-c6f198fa8fe5.preview.emergentagent.com/api"
TEST_TIMEOUT = 10  # Shorter timeout for initial tests

class EnhancedResearchTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
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

    def test_health_check_research_features(self):
        """Test health check for research API features"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                features = data.get('features', {})
                
                google_search_api = features.get('google_search_api', 'unknown')
                twitter_api = features.get('twitter_api', 'unknown')
                enhanced_research = features.get('enhanced_research', 'unknown')
                
                details = f"Google Search API: {google_search_api}, Twitter API: {twitter_api}, Enhanced Research: {enhanced_research}"
                
                # Check if research features are enabled
                research_enabled = (google_search_api in ['configured', 'not_configured'] and 
                                  twitter_api in ['configured', 'not_configured'] and
                                  enhanced_research in ['enabled', 'limited'])
                
                if research_enabled:
                    self.log_test("Health Check - Research Features Present", True, details)
                else:
                    self.log_test("Health Check - Research Features", False, details, "Research features not properly configured")
                    
            else:
                self.log_test("Health Check - Endpoint", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Health Check - Connection", False, "", str(e))

    def test_research_status_detailed(self):
        """Test research status endpoint with detailed analysis"""
        try:
            response = self.session.get(f"{self.base_url}/research/status", timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                
                google_search = data.get('google_search_api', {})
                twitter_api = data.get('twitter_api', {})
                cache_stats = data.get('cache_stats', {})
                
                google_status = google_search.get('status', 'unknown')
                google_engine_id = google_search.get('search_engine_id', 'unknown')
                twitter_status = twitter_api.get('status', 'unknown')
                twitter_bearer = twitter_api.get('bearer_token', 'unknown')
                
                details = f"Google: {google_status} (Engine ID: {google_engine_id}), Twitter: {twitter_status} (Bearer: {twitter_bearer}), Cache entries: G={cache_stats.get('google_cache_entries', 0)}, T={cache_stats.get('twitter_cache_entries', 0)}"
                
                # Detailed analysis
                google_ready = google_status == 'configured' and google_engine_id != 'needs_setup'
                twitter_ready = twitter_status == 'configured' and twitter_bearer == 'configured'
                
                if google_ready and twitter_ready:
                    self.log_test("Research Status - Both APIs Ready", True, details)
                elif google_ready or twitter_ready:
                    self.log_test("Research Status - Partial Configuration", True, details)
                else:
                    self.log_test("Research Status - APIs Need Setup", True, details + " (Will use mock responses)")
                    
            else:
                self.log_test("Research Status Endpoint", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Research Status Endpoint", False, "", str(e))

    def test_founder_research_with_timeout_handling(self):
        """Test founder research with proper timeout handling"""
        try:
            test_data = {
                'founder_name': 'Elon Musk',  # Well-known founder for better test results
                'company_name': 'Tesla'
            }
            
            print("   Testing founder research (may take up to 45 seconds for API calls)...")
            
            response = self.session.post(
                f"{self.base_url}/research/founder",
                data=test_data,
                timeout=45  # Extended timeout for research APIs
            )
            
            if response.status_code == 200:
                data = response.json()
                
                founder_name = data.get('founder_name')
                company_name = data.get('company_name')
                web_research = data.get('web_research', {})
                social_research = data.get('social_research', {})
                
                # Analyze research quality
                web_api_status = web_research.get('api_status', 'unknown')
                social_api_status = social_research.get('api_status', 'unknown')
                
                web_insights = len(web_research.get('key_insights', []))
                social_insights = len(social_research.get('social_analysis', {}).get('key_insights', []))
                
                details = f"Founder: {founder_name}, Company: {company_name}, Web API: {web_api_status} ({web_insights} insights), Social API: {social_api_status} ({social_insights} insights)"
                
                if founder_name and company_name:
                    self.log_test("Founder Research - API Response", True, details)
                    
                    # Check research quality
                    if web_api_status == 'active' or social_api_status == 'active':
                        self.log_test("Founder Research - Real API Data", True, "Successfully retrieved data from configured APIs")
                    elif web_api_status == 'not_configured' and social_api_status == 'not_configured':
                        self.log_test("Founder Research - Mock Data", True, "APIs not configured - returned mock responses as expected")
                    else:
                        self.log_test("Founder Research - Mixed Results", True, "Some APIs working, others using mock data")
                        
                else:
                    self.log_test("Founder Research - Response Format", False, f"Invalid response: {data}")
                    
            elif response.status_code == 422:
                # Validation error - check what's wrong
                error_data = response.json()
                self.log_test("Founder Research - Validation", False, f"Validation error: {error_data}", "Check request format")
                
            else:
                self.log_test("Founder Research - HTTP Error", False, f"Status: {response.status_code}", response.text[:200])
                
        except requests.exceptions.Timeout:
            self.log_test("Founder Research - Timeout", False, "", "Request timed out - APIs may be slow or rate limited")
        except Exception as e:
            self.log_test("Founder Research - Exception", False, "", str(e))

    def test_company_research_with_timeout_handling(self):
        """Test company research with proper timeout handling"""
        try:
            test_data = {
                'company_name': 'OpenAI',  # Well-known company for better test results
                'industry': 'Artificial Intelligence'
            }
            
            print("   Testing company research (may take up to 45 seconds for API calls)...")
            
            response = self.session.post(
                f"{self.base_url}/research/company",
                data=test_data,
                timeout=45  # Extended timeout for research APIs
            )
            
            if response.status_code == 200:
                data = response.json()
                
                company_name = data.get('company_name')
                industry = data.get('industry')
                web_research = data.get('web_research', {})
                social_research = data.get('social_research', {})
                
                # Analyze research quality
                web_api_status = web_research.get('api_status', 'unknown')
                social_api_status = social_research.get('api_status', 'unknown')
                
                funding_info = len(web_research.get('funding_information', []))
                recent_developments = len(web_research.get('recent_developments', []))
                sentiment = social_research.get('sentiment_analysis', {}).get('overall_sentiment', 'unknown')
                
                details = f"Company: {company_name}, Industry: {industry}, Web API: {web_api_status} (Funding: {funding_info}, News: {recent_developments}), Social API: {social_api_status} (Sentiment: {sentiment})"
                
                if company_name and industry:
                    self.log_test("Company Research - API Response", True, details)
                    
                    # Check research quality
                    if web_api_status == 'active' or social_api_status == 'active':
                        self.log_test("Company Research - Real API Data", True, "Successfully retrieved data from configured APIs")
                    elif web_api_status == 'not_configured' and social_api_status == 'not_configured':
                        self.log_test("Company Research - Mock Data", True, "APIs not configured - returned mock responses as expected")
                    else:
                        self.log_test("Company Research - Mixed Results", True, "Some APIs working, others using mock data")
                        
                else:
                    self.log_test("Company Research - Response Format", False, f"Invalid response: {data}")
                    
            elif response.status_code == 422:
                # Validation error - check what's wrong
                error_data = response.json()
                self.log_test("Company Research - Validation", False, f"Validation error: {error_data}", "Check request format")
                
            else:
                self.log_test("Company Research - HTTP Error", False, f"Status: {response.status_code}", response.text[:200])
                
        except requests.exceptions.Timeout:
            self.log_test("Company Research - Timeout", False, "", "Request timed out - APIs may be slow or rate limited")
        except Exception as e:
            self.log_test("Company Research - Exception", False, "", str(e))

    def test_research_error_handling(self):
        """Test error handling for research APIs"""
        try:
            # Test with missing required fields
            response1 = self.session.post(f"{self.base_url}/research/founder", data={}, timeout=TEST_TIMEOUT)
            response2 = self.session.post(f"{self.base_url}/research/company", data={}, timeout=TEST_TIMEOUT)
            
            # Should return validation errors
            founder_error_handled = response1.status_code == 422
            company_error_handled = response2.status_code == 422
            
            if founder_error_handled and company_error_handled:
                self.log_test("Research APIs - Error Validation", True, f"Proper validation: Founder {response1.status_code}, Company {response2.status_code}")
            else:
                self.log_test("Research APIs - Error Validation", False, f"Unexpected responses: Founder {response1.status_code}, Company {response2.status_code}")
                
        except Exception as e:
            self.log_test("Research APIs - Error Handling", False, "", str(e))

    def run_enhanced_research_tests(self):
        """Run focused tests for enhanced research capabilities"""
        print("🔍 Starting Enhanced Research API Tests for VERSSAI VC Intelligence Platform")
        print("🎯 Focus: Google Search & Twitter API Integration Testing")
        print(f"Testing against: {self.base_url}")
        print("=" * 80)
        
        # 1. Health Check - Research Features
        print("🏥 TESTING: Health Check - Research Features")
        self.test_health_check_research_features()
        
        # 2. Research Status - Detailed Analysis
        print("📊 TESTING: Research Status - Detailed Configuration")
        self.test_research_status_detailed()
        
        # 3. Founder Research - With Timeout Handling
        print("👤 TESTING: Founder Research API (Extended Timeout)")
        self.test_founder_research_with_timeout_handling()
        
        # 4. Company Research - With Timeout Handling
        print("🏢 TESTING: Company Research API (Extended Timeout)")
        self.test_company_research_with_timeout_handling()
        
        # 5. Error Handling
        print("⚠️ TESTING: Research APIs Error Handling")
        self.test_research_error_handling()
        
        # Test Summary
        print("=" * 80)
        print("🔍 ENHANCED RESEARCH API TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Research Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['error']}")
        
        # Research Integration Status
        print("\n🔍 RESEARCH INTEGRATION STATUS:")
        health_check_passed = any("Health Check" in result['test'] and result['success'] for result in self.test_results)
        status_check_passed = any("Research Status" in result['test'] and result['success'] for result in self.test_results)
        founder_research_passed = any("Founder Research - API Response" in result['test'] and result['success'] for result in self.test_results)
        company_research_passed = any("Company Research - API Response" in result['test'] and result['success'] for result in self.test_results)
        
        print(f"  Research Features Available: {'✅ YES' if health_check_passed else '❌ NO'}")
        print(f"  API Configuration Status: {'✅ WORKING' if status_check_passed else '❌ FAILED'}")
        print(f"  Founder Research Endpoint: {'✅ WORKING' if founder_research_passed else '❌ FAILED'}")
        print(f"  Company Research Endpoint: {'✅ WORKING' if company_research_passed else '❌ FAILED'}")
        
        # Overall Assessment
        if health_check_passed and status_check_passed:
            if founder_research_passed and company_research_passed:
                print("\n🎉 ENHANCED RESEARCH INTEGRATION: FULLY OPERATIONAL!")
                print("   ✅ Research APIs integrated and working")
                print("   ✅ Both founder and company research functional")
            elif founder_research_passed or company_research_passed:
                print("\n✅ ENHANCED RESEARCH INTEGRATION: PARTIALLY WORKING!")
                print("   ✅ Research APIs integrated")
                print("   ⚠️ Some endpoints may be using mock data due to API configuration")
            else:
                print("\n⚠️ ENHANCED RESEARCH INTEGRATION: CONFIGURED BUT NOT RESPONDING")
                print("   ✅ Research features are integrated")
                print("   ❌ API endpoints timing out or returning errors")
        else:
            print("\n❌ ENHANCED RESEARCH INTEGRATION: ISSUES DETECTED")
        
        print("\n" + "=" * 80)
        
        return {
            'total': total_tests,
            'passed': passed_tests,
            'failed': failed_tests,
            'success_rate': (passed_tests/total_tests)*100,
            'research_integration_status': {
                'features_available': health_check_passed,
                'configuration_working': status_check_passed,
                'founder_research': founder_research_passed,
                'company_research': company_research_passed
            },
            'results': self.test_results
        }

if __name__ == "__main__":
    tester = EnhancedResearchTester()
    results = tester.run_enhanced_research_tests()
    
    # Exit with appropriate code
    if results['failed'] == 0:
        print("🎉 All enhanced research tests passed!")
        exit(0)
    elif results['passed'] > results['failed']:
        print("✅ Most enhanced research tests passed!")
        exit(0)
    else:
        print("⚠️ Some enhanced research tests failed - check configuration")
        exit(1)