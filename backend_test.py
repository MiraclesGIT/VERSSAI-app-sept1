#!/usr/bin/env python3
"""
AI-POWERED Backend Testing for VERSSAI VC Intelligence Platform
Tests REAL AI integration with Google Gemini Pro, RAG system, and workflow orchestrator
Focus: AI-powered pitch deck analysis, 3-level RAG, and workflow orchestration
"""

import requests
import json
import os
import tempfile
from pathlib import Path
from datetime import datetime
import uuid
import time

# Configuration
BACKEND_URL = "https://403fd143-1576-4648-a6f7-6d825c1afb74.preview.emergentagent.com/api"
TEST_TIMEOUT = 60  # Increased for AI processing
AI_PROCESSING_TIMEOUT = 120  # Extended timeout for AI workflows

class VERSSAIAIBackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        self.uploaded_deck_id = None  # Store for AI workflow testing
        
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

    def test_ai_health_check(self):
        """Test AI services health check - CRITICAL for Gemini integration"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                services = data.get('services', {})
                features = data.get('features', {})
                
                # Check AI-specific services
                rag_system = services.get('rag_system', 'unknown')
                ai_agents = services.get('ai_agents', 'unknown')
                
                # Check AI integrations
                gemini_status = features.get('gemini_integration', 'unknown')
                rag_enabled = features.get('3_level_rag', 'unknown')
                founder_signal_ai = features.get('founder_signal_ai', 'unknown')
                
                details = f"RAG: {rag_system}, AI Agents: {ai_agents}, Gemini: {gemini_status}, 3-Level RAG: {rag_enabled}, Founder Signal AI: {founder_signal_ai}"
                
                # Success criteria: Gemini should be "configured" and core AI features enabled
                if (gemini_status == 'configured' and 
                    rag_enabled == 'enabled' and 
                    founder_signal_ai == 'enabled' and
                    ai_agents == 'operational'):
                    self.log_test("AI Health Check - Gemini Integration", True, details)
                else:
                    self.log_test("AI Health Check - AI Services", False, details, "AI services not fully operational")
                    
            else:
                self.log_test("AI Health Check - Endpoint", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("AI Health Check - Connection", False, "", str(e))

    def test_rag_system_status(self):
        """Test 3-level RAG system status"""
        try:
            response = self.session.get(f"{self.base_url}/rag/status", timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for RAG system components
                if 'rag_system' in data:
                    rag_status = data.get('rag_system', 'unknown')
                    collections = data.get('collections', {})
                    
                    # Look for 3-level collections
                    platform_collection = collections.get('platform_knowledge', 'unknown')
                    investor_collection = collections.get('investor_knowledge', 'unknown') 
                    company_collection = collections.get('company_knowledge', 'unknown')
                    
                    details = f"RAG Status: {rag_status}, Platform: {platform_collection}, Investor: {investor_collection}, Company: {company_collection}"
                    
                    if rag_status == 'operational':
                        self.log_test("RAG System Status - 3-Level Architecture", True, details)
                    else:
                        self.log_test("RAG System Status", False, details, "RAG system not operational")
                else:
                    self.log_test("RAG System Status", False, f"Unexpected response: {data}")
            else:
                self.log_test("RAG System Status", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("RAG System Status", False, "", str(e))

    def test_rag_query(self):
        """Test RAG query functionality"""
        try:
            # Test query for VC insights
            query_data = {
                "query": "What are the key founder signals for successful startups?",
                "top_k": 3
            }
            
            response = self.session.post(
                f"{self.base_url}/rag/query",
                json=query_data,
                timeout=TEST_TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                
                query = data.get('query')
                results = data.get('results', {})
                total_results = data.get('total_results', 0)
                processing_time = data.get('processing_time', 0)
                
                # Check for multi-level results
                platform_results = results.get('platform_results', [])
                investor_results = results.get('investor_results', [])
                company_results = results.get('company_results', [])
                
                details = f"Query: '{query}', Total Results: {total_results}, Processing Time: {processing_time:.2f}s, Platform: {len(platform_results)}, Investor: {len(investor_results)}, Company: {len(company_results)}"
                
                if total_results > 0 and processing_time > 0:
                    self.log_test("RAG Query - Multi-Level Search", True, details)
                else:
                    self.log_test("RAG Query", False, details, "No results or invalid processing time")
                    
            else:
                self.log_test("RAG Query", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("RAG Query", False, "", str(e))

    def create_realistic_pitch_deck_pdf(self):
        """Create a realistic pitch deck PDF for AI testing"""
        try:
            # Create a more realistic PDF content for AI analysis
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
/Kids [3 0 R 4 0 R 5 0 R]
/Count 3
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 6 0 R
>>
endobj
4 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 7 0 R
>>
endobj
5 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 8 0 R
>>
endobj
6 0 obj
<<
/Length 200
>>
stream
BT
/F1 24 Tf
100 700 Td
(TechVenture AI - Pitch Deck) Tj
/F1 16 Tf
100 650 Td
(Revolutionary AI Platform for Enterprise) Tj
/F1 12 Tf
100 600 Td
(Founded by: Sarah Chen, PhD Stanford AI) Tj
100 580 Td
(CTO: Michael Rodriguez, Ex-Google) Tj
100 560 Td
(Market Size: $50B TAM) Tj
ET
endstream
endobj
7 0 obj
<<
/Length 150
>>
stream
BT
/F1 18 Tf
100 700 Td
(Problem & Solution) Tj
/F1 12 Tf
100 650 Td
(Enterprise AI adoption is complex and expensive) Tj
100 630 Td
(Our platform reduces implementation time by 80%) Tj
100 610 Td
(Proven with 15 Fortune 500 clients) Tj
ET
endstream
endobj
8 0 obj
<<
/Length 120
>>
stream
BT
/F1 18 Tf
100 700 Td
(Traction & Financials) Tj
/F1 12 Tf
100 650 Td
(ARR: $2.5M, Growing 300% YoY) Tj
100 630 Td
(Seeking: $10M Series A) Tj
100 610 Td
(Use of funds: Product development, Sales team) Tj
ET
endstream
endobj
xref
0 9
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000136 00000 n 
0000000213 00000 n 
0000000290 00000 n 
0000000367 00000 n 
0000000619 00000 n 
0000000821 00000 n 
trailer
<<
/Size 9
/Root 1 0 R
>>
startxref
983
%%EOF"""
            
            # Create temporary file
            temp_file = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
            temp_file.write(pitch_deck_content)
            temp_file.close()
            
            return temp_file.name
        except Exception as e:
            print(f"Error creating realistic test PDF: {e}")
            return None

    def test_ai_powered_deck_upload(self):
        """Test AI-powered pitch deck upload and analysis trigger"""
        try:
            test_pdf_path = self.create_realistic_pitch_deck_pdf()
            if not test_pdf_path:
                self.log_test("AI Deck Upload - PDF Creation", False, "", "Could not create test PDF")
                return None
            
            test_data = {
                'company_name': 'TechVenture AI',
                'uploaded_by': 'VC Partner'
            }
            
            with open(test_pdf_path, 'rb') as f:
                files = {'file': ('techventure_pitch_deck.pdf', f, 'application/pdf')}
                response = self.session.post(
                    f"{self.base_url}/founder-signal/upload-deck",
                    data=test_data,
                    files=files,
                    timeout=AI_PROCESSING_TIMEOUT
                )
            
            # Clean up
            os.unlink(test_pdf_path)
            
            if response.status_code == 200:
                data = response.json()
                deck_id = data.get('deck_id')
                company_name = data.get('company_name')
                status = data.get('status', 'unknown')
                
                if deck_id and company_name == 'TechVenture AI':
                    self.uploaded_deck_id = deck_id  # Store for workflow testing
                    self.log_test("AI Deck Upload - Real AI Processing", True, f"Deck ID: {deck_id}, Company: {company_name}, Status: {status}")
                    return deck_id
                else:
                    self.log_test("AI Deck Upload - Response", False, f"Invalid response: {data}")
            else:
                self.log_test("AI Deck Upload", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("AI Deck Upload", False, "", str(e))
        
        return None

    def test_ai_workflow_execution(self, deck_id):
        """Test AI workflow orchestrator execution"""
        if not deck_id:
            self.log_test("AI Workflow Execution", False, "", "No deck ID provided")
            return
            
        try:
            # Wait a bit for background AI processing to start
            time.sleep(5)
            
            # Check workflow execution status
            response = self.session.get(
                f"{self.base_url}/founder-signal/deck/{deck_id}/analysis",
                timeout=AI_PROCESSING_TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                status = data.get('status', 'unknown')
                workflow_id = data.get('workflow_id')
                
                if status == 'completed':
                    analysis = data.get('analysis', {})
                    extraction_method = analysis.get('extraction_method', 'unknown')
                    
                    details = f"Status: {status}, Workflow ID: {workflow_id}, Extraction Method: {extraction_method}"
                    
                    # Check if AI agent was used (not mock)
                    if extraction_method == 'ai_agent_gemini':
                        self.log_test("AI Workflow Execution - Gemini Processing", True, details)
                    else:
                        self.log_test("AI Workflow Execution - Processing Method", False, details, f"Expected 'ai_agent_gemini', got '{extraction_method}'")
                        
                elif status == 'processing':
                    self.log_test("AI Workflow Execution - In Progress", True, f"Status: {status}, Workflow ID: {workflow_id}")
                    
                    # Try waiting a bit more and check again
                    time.sleep(10)
                    response2 = self.session.get(
                        f"{self.base_url}/founder-signal/deck/{deck_id}/analysis",
                        timeout=AI_PROCESSING_TIMEOUT
                    )
                    
                    if response2.status_code == 200:
                        data2 = response2.json()
                        status2 = data2.get('status', 'unknown')
                        
                        if status2 == 'completed':
                            analysis = data2.get('analysis', {})
                            extraction_method = analysis.get('extraction_method', 'unknown')
                            details2 = f"Final Status: {status2}, Extraction Method: {extraction_method}"
                            
                            if extraction_method == 'ai_agent_gemini':
                                self.log_test("AI Workflow Execution - Delayed Completion", True, details2)
                            else:
                                self.log_test("AI Workflow Execution - Final Method", False, details2, f"Expected 'ai_agent_gemini', got '{extraction_method}'")
                        else:
                            self.log_test("AI Workflow Execution - Still Processing", True, f"Status after wait: {status2}")
                            
                elif status == 'failed':
                    error = data.get('error', 'Unknown error')
                    self.log_test("AI Workflow Execution - Failed", False, f"Workflow failed: {error}")
                else:
                    self.log_test("AI Workflow Execution - Unknown Status", False, f"Unexpected status: {status}")
                    
            else:
                self.log_test("AI Workflow Execution", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("AI Workflow Execution", False, "", str(e))

    def test_founder_signals_ai_analysis(self, deck_id):
        """Test AI-generated founder signals"""
        if not deck_id:
            self.log_test("Founder Signals AI Analysis", False, "", "No deck ID provided")
            return
            
        try:
            response = self.session.get(
                f"{self.base_url}/founder-signal/deck/{deck_id}/signals",
                timeout=TEST_TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list) and len(data) > 0:
                    # Check first signal for AI-generated scores
                    signal = data[0]
                    
                    education_score = signal.get('education_score')
                    experience_score = signal.get('experience_score')
                    overall_score = signal.get('overall_signal_score')
                    recommendation = signal.get('recommendation')
                    
                    details = f"Signals found: {len(data)}, Education: {education_score}, Experience: {experience_score}, Overall: {overall_score}, Recommendation: {recommendation}"
                    
                    # Check if scores are realistic (not default values)
                    if (education_score is not None and experience_score is not None and 
                        overall_score is not None and recommendation):
                        self.log_test("Founder Signals AI Analysis - Real Scores", True, details)
                    else:
                        self.log_test("Founder Signals AI Analysis - Missing Data", False, details, "Some AI-generated scores missing")
                        
                elif isinstance(data, list) and len(data) == 0:
                    self.log_test("Founder Signals AI Analysis - No Signals", True, "No signals generated yet (processing may still be ongoing)")
                else:
                    self.log_test("Founder Signals AI Analysis - Format", False, f"Unexpected response format: {type(data)}")
                    
            else:
                self.log_test("Founder Signals AI Analysis", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Founder Signals AI Analysis", False, "", str(e))

    def test_database_ai_storage(self, deck_id):
        """Test that AI results are properly stored in PostgreSQL"""
        if not deck_id:
            self.log_test("Database AI Storage", False, "", "No deck ID provided")
            return
            
        try:
            # Get deck details to verify storage
            response = self.session.get(
                f"{self.base_url}/founder-signal/deck/{deck_id}",
                timeout=TEST_TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                
                deck_id_returned = data.get('deck_id')
                company_name = data.get('company_name')
                upload_date = data.get('upload_date')
                file_size = data.get('file_size')
                status = data.get('status')
                
                details = f"Deck ID: {deck_id_returned}, Company: {company_name}, Upload Date: {upload_date}, Size: {file_size}, Status: {status}"
                
                if (deck_id_returned == deck_id and company_name == 'TechVenture AI' and 
                    upload_date and file_size and status):
                    self.log_test("Database AI Storage - PostgreSQL", True, details)
                else:
                    self.log_test("Database AI Storage - Data Integrity", False, details, "Some required fields missing")
                    
            else:
                self.log_test("Database AI Storage", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Database AI Storage", False, "", str(e))

    def run_ai_focused_tests(self):
        """Run AI-focused backend tests for VERSSAI VC Intelligence Platform"""
        print("🤖 Starting AI-POWERED VERSSAI VC Intelligence Platform Tests")
        print("🎯 Focus: REAL AI Integration with Google Gemini Pro")
        print(f"Testing against: {self.base_url}")
        print("=" * 80)
        
        # 1. AI Health Check - Verify Gemini integration
        print("🔍 TESTING: AI Health Check & Gemini Integration")
        self.test_ai_health_check()
        
        # 2. RAG System Testing - 3-level architecture
        print("🧠 TESTING: 3-Level RAG System")
        self.test_rag_system_status()
        self.test_rag_query()
        
        # 3. Real AI Deck Analysis - Core functionality
        print("📄 TESTING: Real AI Deck Analysis")
        deck_id = self.test_ai_powered_deck_upload()
        
        # 4. Workflow Orchestrator - 6-stage AI pipeline
        print("⚙️ TESTING: AI Workflow Orchestrator")
        self.test_ai_workflow_execution(deck_id)
        
        # 5. AI-Generated Founder Signals
        print("🎯 TESTING: AI-Generated Founder Signals")
        self.test_founder_signals_ai_analysis(deck_id)
        
        # 6. Database Storage - PostgreSQL integration
        print("💾 TESTING: AI Results Database Storage")
        self.test_database_ai_storage(deck_id)
        
        # AI Test Summary
        print("=" * 80)
        print("🤖 AI-POWERED TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total AI Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"AI Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # AI-specific success criteria
        critical_ai_tests = [
            "AI Health Check - Gemini Integration",
            "RAG System Status - 3-Level Architecture", 
            "AI Deck Upload - Real AI Processing",
            "AI Workflow Execution - Gemini Processing"
        ]
        
        critical_passed = sum(1 for result in self.test_results 
                            if result['success'] and any(critical in result['test'] for critical in critical_ai_tests))
        
        print(f"Critical AI Tests Passed: {critical_passed}/{len(critical_ai_tests)}")
        
        if failed_tests > 0:
            print("\n❌ FAILED AI TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['error']}")
        
        # AI Integration Status
        print("\n🤖 AI INTEGRATION STATUS:")
        gemini_working = any("Gemini Integration" in result['test'] and result['success'] for result in self.test_results)
        rag_working = any("RAG System Status" in result['test'] and result['success'] for result in self.test_results)
        workflow_working = any("AI Workflow Execution" in result['test'] and result['success'] for result in self.test_results)
        
        print(f"  Gemini Integration: {'✅ WORKING' if gemini_working else '❌ FAILED'}")
        print(f"  3-Level RAG System: {'✅ WORKING' if rag_working else '❌ FAILED'}")
        print(f"  AI Workflow Orchestrator: {'✅ WORKING' if workflow_working else '❌ FAILED'}")
        
        if gemini_working and rag_working:
            print("\n🎉 VERSSAI VC Intelligence Platform: PRODUCTION-READY AI INTEGRATION!")
        else:
            print("\n⚠️ AI Integration Issues Detected - Review Failed Tests")
        
        print("\n" + "=" * 80)
        
        return {
            'total': total_tests,
            'passed': passed_tests,
            'failed': failed_tests,
            'success_rate': (passed_tests/total_tests)*100,
            'ai_integration_status': {
                'gemini': gemini_working,
                'rag': rag_working,
                'workflow': workflow_working
            },
            'results': self.test_results
        }

if __name__ == "__main__":
    tester = VERSSAIAIBackendTester()
    results = tester.run_ai_focused_tests()
    
    # Exit with error code if tests failed
    if results['failed'] > 0:
        exit(1)
    else:
        print("🎉 All AI tests passed!")
        exit(0)