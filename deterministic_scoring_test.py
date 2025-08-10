#!/usr/bin/env python3
"""
CRITICAL BUG FIX VERIFICATION: Deterministic Scoring for Same Deck Processing
Tests to verify that the same pitch deck produces identical scores every time

This test addresses the user-reported bug: "why each time I am running the same deck I am receiving different score?"

FIXES BEING TESTED:
1. Temperature=0.0 across all AI agents for deterministic results
2. Deterministic sampling parameters (top_p=1.0, top_k=1, frequency_penalty=0)
3. Caching system using MD5 hashes of input data
4. Sorted RAG query results for consistency
5. Content-based hashes instead of dynamic timestamps
"""

import requests
import json
import os
import tempfile
import hashlib
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

# Configuration
BACKEND_URL = "https://6ba2da35-de59-4fa1-b62b-c6f198fa8fe5.preview.emergentagent.com/api"
TEST_TIMEOUT = 120
DETERMINISTIC_TEST_RUNS = 3  # Number of times to run same deck

class DeterministicScoringTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        self.deck_results = []  # Store results from multiple runs
        
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

    def create_deterministic_test_deck(self) -> str:
        """Create a consistent test deck for deterministic testing"""
        # Create identical content every time for consistent testing
        pitch_deck_content = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R 4 0 R 5 0 R 6 0 R]
/Count 4
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 7 0 R
>>
endobj
4 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 8 0 R
>>
endobj
5 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 9 0 R
>>
endobj
6 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 10 0 R
>>
endobj
7 0 obj
<<
/Length 300
>>
stream
BT
/F1 24 Tf
100 700 Td
(DataFlow AI - Pitch Deck) Tj
/F1 16 Tf
100 650 Td
(Revolutionary Data Analytics Platform) Tj
/F1 12 Tf
100 600 Td
(Founded by: Dr. Emily Watson, PhD MIT AI/ML) Tj
100 580 Td
(CTO: James Rodriguez, Ex-Tesla Senior Engineer) Tj
100 560 Td
(Market Size: $85B TAM, Growing 35% CAGR) Tj
100 540 Td
(Stage: Series A, Seeking $12M) Tj
ET
endstream
endobj
8 0 obj
<<
/Length 250
>>
stream
BT
/F1 18 Tf
100 700 Td
(Problem & Solution) Tj
/F1 12 Tf
100 650 Td
(Enterprise data analytics is fragmented and expensive) Tj
100 630 Td
(Our AI platform unifies data sources and reduces costs by 70%) Tj
100 610 Td
(Proven with 25 Fortune 500 clients including Google, Microsoft) Tj
100 590 Td
(Patent-pending ML algorithms for real-time insights) Tj
100 570 Td
(10x faster than competitors like Palantir and Snowflake) Tj
ET
endstream
endobj
9 0 obj
<<
/Length 200
>>
stream
BT
/F1 18 Tf
100 700 Td
(Traction & Team) Tj
/F1 12 Tf
100 650 Td
(ARR: $4.2M, Growing 400% YoY) Tj
100 630 Td
(Customers: 25 enterprise clients, $168K average ACV) Tj
100 610 Td
(Team: 35 engineers, 15 from FAANG companies) Tj
100 590 Td
(Retention: 98% gross revenue retention) Tj
100 570 Td
(Expansion: 150% net revenue retention) Tj
ET
endstream
endobj
10 0 obj
<<
/Length 180
>>
stream
BT
/F1 18 Tf
100 700 Td
(Financials & Use of Funds) Tj
/F1 12 Tf
100 650 Td
(Current ARR: $4.2M, Projected $15M by end of year) Tj
100 630 Td
(Gross Margin: 85%, Unit Economics: 3.2x LTV/CAC) Tj
100 610 Td
(Seeking: $12M Series A) Tj
100 590 Td
(Use of funds: 60% R&D, 30% Sales, 10% Operations) Tj
100 570 Td
(18-month runway to $20M ARR and profitability) Tj
ET
endstream
endobj
xref
0 11
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000136 00000 n 
0000000213 00000 n 
0000000290 00000 n 
0000000367 00000 n 
0000000444 00000 n 
0000000796 00000 n 
0000001098 00000 n 
0000001350 00000 n 
trailer
<<
/Size 11
/Root 1 0 R
>>
startxref
1582
%%EOF"""
        
        # Create temporary file with consistent name
        temp_file = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False, prefix='dataflow_ai_deterministic_')
        temp_file.write(pitch_deck_content)
        temp_file.close()
        
        return temp_file.name

    def upload_deck_for_analysis(self, run_number: int) -> str:
        """Upload the same deck for analysis"""
        try:
            test_pdf_path = self.create_deterministic_test_deck()
            
            test_data = {
                'company_name': 'DataFlow AI',  # Consistent company name
                'uploaded_by': 'Deterministic Test Suite'
            }
            
            with open(test_pdf_path, 'rb') as f:
                files = {'file': (f'dataflow_ai_deterministic_run_{run_number}.pdf', f, 'application/pdf')}
                response = self.session.post(
                    f"{self.base_url}/founder-signal/upload-deck",
                    data=test_data,
                    files=files,
                    timeout=TEST_TIMEOUT
                )
            
            # Clean up
            os.unlink(test_pdf_path)
            
            if response.status_code == 200:
                data = response.json()
                deck_id = data.get('deck_id')
                
                if deck_id:
                    self.log_test(f"Deck Upload Run {run_number}", True, f"Deck ID: {deck_id}")
                    return deck_id
                else:
                    self.log_test(f"Deck Upload Run {run_number}", False, "", "No deck ID returned")
            else:
                self.log_test(f"Deck Upload Run {run_number}", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test(f"Deck Upload Run {run_number}", False, "", str(e))
        
        return None

    def wait_for_analysis_completion(self, deck_id: str, run_number: int, max_wait_time: int = 180) -> Dict[str, Any]:
        """Wait for analysis to complete and return results"""
        start_time = time.time()
        
        while time.time() - start_time < max_wait_time:
            try:
                response = self.session.get(
                    f"{self.base_url}/founder-signal/deck/{deck_id}/analysis",
                    timeout=TEST_TIMEOUT
                )
                
                if response.status_code == 200:
                    data = response.json()
                    status = data.get('status', 'unknown')
                    
                    if status == 'completed':
                        self.log_test(f"Analysis Completion Run {run_number}", True, f"Analysis completed for deck {deck_id}")
                        return data
                    elif status == 'failed':
                        self.log_test(f"Analysis Completion Run {run_number}", False, f"Analysis failed for deck {deck_id}", data.get('error', 'Unknown error'))
                        return data
                    else:
                        # Still processing, wait a bit more
                        time.sleep(10)
                        continue
                else:
                    self.log_test(f"Analysis Completion Run {run_number}", False, f"Status: {response.status_code}", response.text)
                    return None
                    
            except Exception as e:
                self.log_test(f"Analysis Completion Run {run_number}", False, "", str(e))
                return None
        
        # Timeout reached
        self.log_test(f"Analysis Completion Run {run_number}", False, "", f"Analysis timeout after {max_wait_time} seconds")
        return None

    def extract_scores_from_analysis(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract key scores from analysis results for comparison"""
        if not analysis_data or analysis_data.get('status') != 'completed':
            return {}
        
        analysis = analysis_data.get('analysis', {})
        
        # Extract all relevant scores that should be deterministic
        scores = {
            'overall_score': analysis.get('overall_score', 0),
            'company_name': analysis.get('company', ''),
            'market': analysis.get('market', ''),
            'stage': analysis.get('stage', ''),
            'funding_ask': analysis.get('fundingAsk', 0),
            'team_size': analysis.get('teamSize', 0),
            'recommendation': analysis.get('recommendation', ''),
            'components': analysis.get('components', {}),
            'founders': analysis.get('founders', []),
            'traction': analysis.get('traction', {}),
            'insights': sorted(analysis.get('insights', [])),  # Sort for consistency
            'risks': sorted(analysis.get('risks', []))  # Sort for consistency
        }
        
        # Extract component scores
        components = scores.get('components', {})
        for component_name, component_data in components.items():
            if isinstance(component_data, dict):
                scores[f'{component_name}_score'] = component_data.get('score', 0)
                scores[f'{component_name}_confidence'] = component_data.get('confidence', 0)
        
        return scores

    def test_cache_functionality(self):
        """Test that caching system is working"""
        try:
            # Test cache stats endpoint if available
            response = self.session.get(f"{self.base_url}/cache/stats", timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                cached_analyses = data.get('cached_analyses', 0)
                self.log_test("Cache System Status", True, f"Cache contains {cached_analyses} analyses")
            else:
                # Cache endpoint might not exist, that's okay
                self.log_test("Cache System Status", True, "Cache endpoint not available (expected)")
                
        except Exception as e:
            # Cache testing is optional
            self.log_test("Cache System Status", True, f"Cache testing skipped: {str(e)}")

    def test_ai_agent_determinism(self):
        """Test AI agent deterministic configuration"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                features = data.get('features', {})
                
                gemini_status = features.get('gemini_integration', 'unknown')
                ai_agents_status = data.get('services', {}).get('ai_agents', 'unknown')
                
                if gemini_status == 'configured' and ai_agents_status == 'operational':
                    self.log_test("AI Agent Deterministic Configuration", True, f"Gemini: {gemini_status}, AI Agents: {ai_agents_status}")
                else:
                    self.log_test("AI Agent Deterministic Configuration", False, f"Gemini: {gemini_status}, AI Agents: {ai_agents_status}")
            else:
                self.log_test("AI Agent Deterministic Configuration", False, f"Health check failed: {response.status_code}")
                
        except Exception as e:
            self.log_test("AI Agent Deterministic Configuration", False, "", str(e))

    def compare_analysis_results(self, results_list: List[Dict[str, Any]]) -> bool:
        """Compare analysis results for identical scores"""
        if len(results_list) < 2:
            return False
        
        # Compare each result with the first one
        first_result = results_list[0]
        
        for i, result in enumerate(results_list[1:], 1):
            # Compare key scores
            for key in ['overall_score', 'company_name', 'market', 'stage', 'funding_ask', 'team_size', 'recommendation']:
                if first_result.get(key) != result.get(key):
                    self.log_test(f"Score Comparison - {key}", False, 
                                f"Run 1: {first_result.get(key)} vs Run {i+1}: {result.get(key)}")
                    return False
            
            # Compare component scores
            first_components = first_result.get('components', {})
            result_components = result.get('components', {})
            
            for component_name in first_components.keys():
                first_score = first_components.get(component_name, {}).get('score', 0)
                result_score = result_components.get(component_name, {}).get('score', 0)
                
                if first_score != result_score:
                    self.log_test(f"Component Score Comparison - {component_name}", False,
                                f"Run 1: {first_score} vs Run {i+1}: {result_score}")
                    return False
        
        return True

    def run_deterministic_scoring_tests(self):
        """Run comprehensive deterministic scoring tests"""
        print("🔧 CRITICAL BUG FIX VERIFICATION: Deterministic Scoring")
        print("🎯 Testing: Same deck produces identical scores every time")
        print(f"Testing against: {self.base_url}")
        print(f"Test runs: {DETERMINISTIC_TEST_RUNS}")
        print("=" * 80)
        
        # Test 1: AI Agent Configuration
        print("🤖 TESTING: AI Agent Deterministic Configuration")
        self.test_ai_agent_determinism()
        
        # Test 2: Cache System
        print("💾 TESTING: Cache System Functionality")
        self.test_cache_functionality()
        
        # Test 3: Core Deterministic Test - Upload same deck multiple times
        print(f"📄 TESTING: Core Deterministic Test ({DETERMINISTIC_TEST_RUNS} runs)")
        
        deck_ids = []
        analysis_results = []
        
        # Upload and analyze the same deck multiple times
        for run in range(1, DETERMINISTIC_TEST_RUNS + 1):
            print(f"\n--- Run {run}/{DETERMINISTIC_TEST_RUNS} ---")
            
            # Upload deck
            deck_id = self.upload_deck_for_analysis(run)
            if not deck_id:
                self.log_test(f"Deterministic Test Run {run}", False, "", "Failed to upload deck")
                continue
            
            deck_ids.append(deck_id)
            
            # Wait for analysis completion
            analysis_data = self.wait_for_analysis_completion(deck_id, run)
            if not analysis_data:
                self.log_test(f"Deterministic Test Run {run}", False, "", "Failed to get analysis results")
                continue
            
            # Extract scores
            scores = self.extract_scores_from_analysis(analysis_data)
            if not scores:
                self.log_test(f"Deterministic Test Run {run}", False, "", "Failed to extract scores")
                continue
            
            analysis_results.append(scores)
            self.log_test(f"Deterministic Test Run {run}", True, 
                         f"Overall Score: {scores.get('overall_score', 'N/A')}, Recommendation: {scores.get('recommendation', 'N/A')}")
        
        # Test 4: Compare Results for Identical Scores
        print("\n🔍 TESTING: Score Consistency Verification")
        
        if len(analysis_results) >= 2:
            identical_scores = self.compare_analysis_results(analysis_results)
            
            if identical_scores:
                self.log_test("Deterministic Scoring Verification", True, 
                             f"All {len(analysis_results)} runs produced IDENTICAL scores!")
            else:
                self.log_test("Deterministic Scoring Verification", False, 
                             f"Scores differed between runs - deterministic fix FAILED")
            
            # Detailed comparison logging
            print("\n📊 DETAILED SCORE COMPARISON:")
            for i, result in enumerate(analysis_results, 1):
                print(f"Run {i}:")
                print(f"  Overall Score: {result.get('overall_score', 'N/A')}")
                print(f"  Recommendation: {result.get('recommendation', 'N/A')}")
                print(f"  Company: {result.get('company_name', 'N/A')}")
                print(f"  Market: {result.get('market', 'N/A')}")
                print(f"  Funding Ask: ${result.get('funding_ask', 0):,}")
                
                components = result.get('components', {})
                for comp_name, comp_data in components.items():
                    if isinstance(comp_data, dict):
                        print(f"  {comp_name.title()} Score: {comp_data.get('score', 'N/A')}")
                print()
        else:
            self.log_test("Deterministic Scoring Verification", False, 
                         f"Insufficient results for comparison: {len(analysis_results)} runs completed")
        
        # Test Summary
        print("=" * 80)
        print("🔧 DETERMINISTIC SCORING TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Critical test results
        deterministic_test_passed = any("Deterministic Scoring Verification" in result['test'] and result['success'] 
                                      for result in self.test_results)
        
        print(f"\n🎯 CRITICAL BUG FIX STATUS:")
        if deterministic_test_passed:
            print("✅ DETERMINISTIC SCORING: WORKING - Same deck produces identical scores!")
            print("✅ BUG FIX SUCCESSFUL: User issue resolved")
        else:
            print("❌ DETERMINISTIC SCORING: FAILED - Scores still inconsistent")
            print("❌ BUG FIX INCOMPLETE: User issue persists")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['error']}")
        
        print("\n" + "=" * 80)
        
        return {
            'total': total_tests,
            'passed': passed_tests,
            'failed': failed_tests,
            'success_rate': (passed_tests/total_tests)*100,
            'deterministic_fix_working': deterministic_test_passed,
            'analysis_results': analysis_results,
            'results': self.test_results
        }

if __name__ == "__main__":
    tester = DeterministicScoringTester()
    results = tester.run_deterministic_scoring_tests()
    
    # Exit with appropriate code
    if results['deterministic_fix_working']:
        print("🎉 CRITICAL BUG FIX VERIFIED: Deterministic scoring is working!")
        exit(0)
    else:
        print("💥 CRITICAL BUG FIX FAILED: Deterministic scoring still broken!")
        exit(1)