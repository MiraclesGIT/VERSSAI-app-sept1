#!/usr/bin/env python3
"""
COMPREHENSIVE QA TESTING FOR INVESTOR DEMO - VERSSAI VC INTELLIGENCE PLATFORM
ZERO TOLERANCE FOR BUGS - EXHAUSTIVE TESTING OF ALL 6 VC FRAMEWORKS

This test suite covers:
1. Founder Signal Fit Framework (Framework #1)
2. Due Diligence Data Room Framework (Framework #2) 
3. Portfolio Management Framework (Framework #3)
4. Fund Assessment & Backtesting Framework (Framework #4)
5. Fund Allocation & Deployment Framework (Framework #5)
6. Fund Vintage Management Framework (Framework #6)
7. Enhanced Research APIs (Google Search + Twitter)
8. AI Integration (Gemini Pro + RAG System)
9. Performance, Security, and Error Handling
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
import io

# Disable SSL warnings for testing
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configuration
BACKEND_URL = "https://vc-intelligence-1.preview.emergentagent.com/api"
TEST_TIMEOUT = 30
AI_PROCESSING_TIMEOUT = 90
INVESTOR_DEMO_TIMEOUT = 10  # 10 seconds max response time for investor demo

class VERSSAIInvestorDemoTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.session.verify = False
        self.test_results = []
        self.critical_failures = []
        self.uploaded_deck_id = None
        self.data_room_id = None
        self.company_id = None
        self.fund_id = None
        
    def log_test(self, test_name, success, details="", error_msg="", is_critical=False):
        """Log test results with critical failure tracking"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "error": error_msg,
            "is_critical": is_critical,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        if not success and is_critical:
            self.critical_failures.append(test_name)
        
        status = "✅ PASS" if success else "❌ FAIL"
        critical_marker = " [CRITICAL]" if is_critical else ""
        print(f"{status}: {test_name}{critical_marker}")
        if details:
            print(f"   Details: {details}")
        if error_msg:
            print(f"   Error: {error_msg}")
        print()

    def test_health_check_comprehensive(self):
        """CRITICAL: Test comprehensive health check for investor demo"""
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/health", timeout=INVESTOR_DEMO_TIMEOUT)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                services = data.get('services', {})
                features = data.get('features', {})
                
                # Check critical services
                mongodb_status = services.get('mongodb', 'unknown')
                postgresql_status = services.get('postgresql', 'unknown')
                rag_system = services.get('rag_system', 'unknown')
                ai_agents = services.get('ai_agents', 'unknown')
                
                # Check AI features
                gemini_status = features.get('gemini_integration', 'unknown')
                founder_signal_ai = features.get('founder_signal_ai', 'unknown')
                
                # Check all 6 frameworks
                due_diligence = features.get('due_diligence', 'unknown')
                portfolio_management = features.get('portfolio_management', 'unknown')
                fund_assessment = features.get('fund_assessment', 'unknown')
                fund_allocation = features.get('fund_allocation', 'unknown')
                fund_vintage = features.get('fund_vintage_management', 'unknown')
                
                # Check research APIs
                google_search = features.get('google_search_api', 'unknown')
                twitter_api = features.get('twitter_api', 'unknown')
                
                details = f"Response Time: {response_time:.2f}s, MongoDB: {mongodb_status}, PostgreSQL: {postgresql_status}, RAG: {rag_system}, AI: {ai_agents}, Gemini: {gemini_status}"
                
                # Critical success criteria
                core_services_ok = (mongodb_status == 'connected' and 
                                  postgresql_status == 'connected' and
                                  rag_system == 'operational' and
                                  ai_agents == 'operational')
                
                ai_integration_ok = (gemini_status == 'configured' and 
                                   founder_signal_ai == 'enabled')
                
                frameworks_ok = (due_diligence == 'enabled' and
                               portfolio_management == 'enabled' and
                               fund_assessment == 'enabled' and
                               fund_allocation == 'enabled')
                
                response_time_ok = response_time <= INVESTOR_DEMO_TIMEOUT
                
                if core_services_ok and ai_integration_ok and frameworks_ok and response_time_ok:
                    self.log_test("Health Check - All Systems Operational", True, details, is_critical=True)
                else:
                    error_details = []
                    if not core_services_ok:
                        error_details.append("Core services not operational")
                    if not ai_integration_ok:
                        error_details.append("AI integration not configured")
                    if not frameworks_ok:
                        error_details.append("VC frameworks not enabled")
                    if not response_time_ok:
                        error_details.append(f"Response time {response_time:.2f}s > {INVESTOR_DEMO_TIMEOUT}s")
                    
                    self.log_test("Health Check - System Issues", False, details, "; ".join(error_details), is_critical=True)
                    
            else:
                self.log_test("Health Check - Endpoint Failure", False, f"Status: {response.status_code}", response.text, is_critical=True)
                
        except Exception as e:
            self.log_test("Health Check - Connection Failure", False, "", str(e), is_critical=True)

    def create_investor_demo_pitch_deck(self):
        """Create a realistic pitch deck for investor demo"""
        try:
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
/Kids [3 0 R 4 0 R 5 0 R 6 0 R 7 0 R]
/Count 5
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 8 0 R
>>
endobj
4 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 9 0 R
>>
endobj
5 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 10 0 R
>>
endobj
6 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 11 0 R
>>
endobj
7 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 12 0 R
>>
endobj
8 0 obj
<<
/Length 300
>>
stream
BT
/F1 24 Tf
100 700 Td
(NeuralTech AI - Series A Pitch) Tj
/F1 16 Tf
100 650 Td
(Revolutionary AI Platform for Enterprise Automation) Tj
/F1 12 Tf
100 600 Td
(Founded by: Dr. Emily Chen, PhD MIT AI/ML) Tj
100 580 Td
(CTO: Marcus Rodriguez, Ex-Google DeepMind) Tj
100 560 Td
(CEO: Sarah Kim, Ex-McKinsey Partner) Tj
100 540 Td
(Market Size: $127B TAM, $23B SAM) Tj
100 520 Td
(Seeking: $15M Series A) Tj
ET
endstream
endobj
9 0 obj
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
(Enterprise AI adoption is complex, expensive, and time-consuming) Tj
100 630 Td
(Current solutions require 12-18 months implementation) Tj
100 610 Td
(Our platform reduces implementation time by 85%) Tj
100 590 Td
(Proven ROI of 340% within 6 months) Tj
100 570 Td
(Already deployed at 25 Fortune 500 companies) Tj
ET
endstream
endobj
10 0 obj
<<
/Length 200
>>
stream
BT
/F1 18 Tf
100 700 Td
(Traction & Market Validation) Tj
/F1 12 Tf
100 650 Td
(ARR: $4.2M, Growing 450% YoY) Tj
100 630 Td
(Net Revenue Retention: 165%) Tj
100 610 Td
(Customer Acquisition Cost: $12K) Tj
100 590 Td
(Lifetime Value: $180K) Tj
100 570 Td
(Gross Margin: 87%) Tj
ET
endstream
endobj
11 0 obj
<<
/Length 180
>>
stream
BT
/F1 18 Tf
100 700 Td
(Team & Advisors) Tj
/F1 12 Tf
100 650 Td
(Dr. Emily Chen: 15 years AI research, 3 patents) Tj
100 630 Td
(Marcus Rodriguez: Led AI teams at Google, Meta) Tj
100 610 Td
(Sarah Kim: Built $100M+ revenue streams) Tj
100 590 Td
(Advisors: Former CTOs from Salesforce, Microsoft) Tj
ET
endstream
endobj
12 0 obj
<<
/Length 160
>>
stream
BT
/F1 18 Tf
100 700 Td
(Financials & Use of Funds) Tj
/F1 12 Tf
100 650 Td
(Projected 2024 Revenue: $12M) Tj
100 630 Td
(Projected 2025 Revenue: $35M) Tj
100 610 Td
(Use of funds: 60% R&D, 30% Sales, 10% Operations) Tj
100 590 Td
(Path to $100M ARR by 2026) Tj
ET
endstream
endobj
xref
0 13
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000151 00000 n 
0000000228 00000 n 
0000000305 00000 n 
0000000382 00000 n 
0000000459 00000 n 
0000000536 00000 n 
0000000888 00000 n 
0000001190 00000 n 
0000001442 00000 n 
0000001674 00000 n 
trailer
<<
/Size 13
/Root 1 0 R
>>
startxref
1886
%%EOF"""
            
            temp_file = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
            temp_file.write(pitch_deck_content)
            temp_file.close()
            
            return temp_file.name
        except Exception as e:
            print(f"Error creating investor demo PDF: {e}")
            return None

    def test_framework_1_founder_signal_fit(self):
        """CRITICAL: Test Framework #1 - Founder Signal Fit with file upload and AI analysis"""
        try:
            # Test file upload
            test_pdf_path = self.create_investor_demo_pitch_deck()
            if not test_pdf_path:
                self.log_test("Framework #1 - File Upload", False, "", "Could not create test PDF", is_critical=True)
                return None
            
            test_data = {
                'company_name': 'NeuralTech AI',
                'uploaded_by': 'Lead Partner'
            }
            
            start_time = time.time()
            with open(test_pdf_path, 'rb') as f:
                files = {'file': ('neuraltech_series_a.pdf', f, 'application/pdf')}
                response = self.session.post(
                    f"{self.base_url}/founder-signal/upload-deck",
                    data=test_data,
                    files=files,
                    timeout=INVESTOR_DEMO_TIMEOUT
                )
            upload_time = time.time() - start_time
            
            os.unlink(test_pdf_path)
            
            if response.status_code == 200:
                data = response.json()
                deck_id = data.get('deck_id')
                company_name = data.get('company_name')
                status = data.get('status', 'unknown')
                
                if deck_id and company_name == 'NeuralTech AI' and upload_time <= INVESTOR_DEMO_TIMEOUT:
                    self.uploaded_deck_id = deck_id
                    self.log_test("Framework #1 - File Upload Success", True, f"Deck ID: {deck_id}, Upload Time: {upload_time:.2f}s", is_critical=True)
                    
                    # Test analysis retrieval
                    time.sleep(2)  # Brief wait for processing to start
                    analysis_response = self.session.get(
                        f"{self.base_url}/founder-signal/deck/{deck_id}/analysis",
                        timeout=INVESTOR_DEMO_TIMEOUT
                    )
                    
                    if analysis_response.status_code == 200:
                        analysis_data = analysis_response.json()
                        analysis_status = analysis_data.get('status', 'unknown')
                        
                        if analysis_status in ['processing', 'completed']:
                            self.log_test("Framework #1 - AI Analysis Pipeline", True, f"Analysis Status: {analysis_status}", is_critical=True)
                        else:
                            self.log_test("Framework #1 - AI Analysis Pipeline", False, f"Unexpected status: {analysis_status}", is_critical=True)
                    else:
                        self.log_test("Framework #1 - Analysis Endpoint", False, f"Status: {analysis_response.status_code}", is_critical=True)
                    
                    return deck_id
                else:
                    error_msg = f"Upload time: {upload_time:.2f}s" if upload_time > INVESTOR_DEMO_TIMEOUT else "Invalid response data"
                    self.log_test("Framework #1 - Upload Performance", False, f"Response: {data}", error_msg, is_critical=True)
            else:
                self.log_test("Framework #1 - Upload Endpoint", False, f"Status: {response.status_code}", response.text, is_critical=True)
                
        except Exception as e:
            self.log_test("Framework #1 - Exception", False, "", str(e), is_critical=True)
        
        return None

    def test_framework_2_due_diligence(self):
        """CRITICAL: Test Framework #2 - Due Diligence Data Room"""
        try:
            # Create multiple test documents
            documents = []
            
            # Financial document
            financial_doc = io.BytesIO(b"Financial Statements 2023\nRevenue: $4.2M\nGross Margin: 87%\nBurn Rate: $400K/month")
            documents.append(('files', ('financials_2023.txt', financial_doc, 'text/plain')))
            
            # Legal document  
            legal_doc = io.BytesIO(b"Legal Documents\nIncorporation: Delaware C-Corp\nIP Portfolio: 15 patents pending\nCompliance: SOC2, GDPR")
            documents.append(('files', ('legal_summary.txt', legal_doc, 'text/plain')))
            
            # Business plan
            business_doc = io.BytesIO(b"Business Plan Executive Summary\nMarket Size: $127B TAM\nCompetitive Advantage: Proprietary AI algorithms\nGo-to-Market: Enterprise sales")
            documents.append(('files', ('business_plan.txt', business_doc, 'text/plain')))
            
            test_data = {
                'company_name': 'NeuralTech AI',
                'industry': 'Artificial Intelligence',
                'uploaded_by': 'Due Diligence Team'
            }
            
            start_time = time.time()
            response = self.session.post(
                f"{self.base_url}/due-diligence/upload-data-room",
                data=test_data,
                files=documents,
                timeout=INVESTOR_DEMO_TIMEOUT
            )
            upload_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                data_room_id = data.get('data_room_id')
                uploaded_files = data.get('uploaded_files', 0)
                status = data.get('status', 'unknown')
                
                if data_room_id and uploaded_files == 3 and upload_time <= INVESTOR_DEMO_TIMEOUT:
                    self.data_room_id = data_room_id
                    self.log_test("Framework #2 - Multi-Document Upload", True, f"Data Room ID: {data_room_id}, Files: {uploaded_files}, Time: {upload_time:.2f}s", is_critical=True)
                    
                    # Test data room listing
                    list_response = self.session.get(
                        f"{self.base_url}/due-diligence/data-rooms",
                        timeout=INVESTOR_DEMO_TIMEOUT
                    )
                    
                    if list_response.status_code == 200:
                        rooms = list_response.json()
                        if isinstance(rooms, list) and len(rooms) > 0:
                            self.log_test("Framework #2 - Data Room Management", True, f"Found {len(rooms)} data rooms", is_critical=True)
                        else:
                            self.log_test("Framework #2 - Data Room Management", False, "No data rooms found", is_critical=True)
                    else:
                        self.log_test("Framework #2 - Data Room Listing", False, f"Status: {list_response.status_code}", is_critical=True)
                    
                    return data_room_id
                else:
                    error_msg = f"Upload time: {upload_time:.2f}s" if upload_time > INVESTOR_DEMO_TIMEOUT else "Invalid response data"
                    self.log_test("Framework #2 - Upload Performance", False, f"Response: {data}", error_msg, is_critical=True)
            else:
                self.log_test("Framework #2 - Upload Endpoint", False, f"Status: {response.status_code}", response.text, is_critical=True)
                
        except Exception as e:
            self.log_test("Framework #2 - Exception", False, "", str(e), is_critical=True)
        
        return None

    def test_framework_3_portfolio_management(self):
        """CRITICAL: Test Framework #3 - Portfolio Management"""
        try:
            # Test adding portfolio company
            company_data = {
                "company_name": "NeuralTech AI",
                "investment_date": "2024-01-15",
                "initial_investment": 15000000,
                "current_valuation": 45000000,
                "stage": "Series A",
                "industry": "Artificial Intelligence",
                "founders": ["Dr. Emily Chen", "Marcus Rodriguez", "Sarah Kim"],
                "board_members": ["Lead Partner", "Independent Director"],
                "key_metrics": {
                    "arr": 4200000,
                    "growth_rate": 4.5,
                    "burn_rate": 400000,
                    "runway_months": 18
                }
            }
            
            start_time = time.time()
            response = self.session.post(
                f"{self.base_url}/portfolio/add-company",
                json=company_data,
                timeout=INVESTOR_DEMO_TIMEOUT
            )
            add_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                company_id = data.get('company_id')
                success = data.get('success', False)
                
                if company_id and success and add_time <= INVESTOR_DEMO_TIMEOUT:
                    self.company_id = company_id
                    self.log_test("Framework #3 - Add Portfolio Company", True, f"Company ID: {company_id}, Time: {add_time:.2f}s", is_critical=True)
                    
                    # Test portfolio companies listing
                    list_response = self.session.get(
                        f"{self.base_url}/portfolio/companies",
                        timeout=INVESTOR_DEMO_TIMEOUT
                    )
                    
                    if list_response.status_code == 200:
                        companies_data = list_response.json()
                        total_companies = companies_data.get('total_companies', 0)
                        companies = companies_data.get('companies', [])
                        
                        if total_companies > 0 and len(companies) > 0:
                            self.log_test("Framework #3 - Portfolio Listing", True, f"Total Companies: {total_companies}", is_critical=True)
                            
                            # Test board meeting processing
                            meeting_data = {
                                "company_id": company_id,
                                "meeting_date": "2024-01-20",
                                "attendees": ["Lead Partner", "CEO", "CTO"],
                                "agenda_items": ["Q4 Performance Review", "2024 Strategy", "Hiring Plans"],
                                "key_decisions": ["Approved $2M marketing budget", "Hired VP of Sales"],
                                "kpi_updates": {
                                    "arr": 4500000,
                                    "new_customers": 15,
                                    "churn_rate": 0.02
                                },
                                "meeting_notes": "Strong Q4 performance with 450% YoY growth. Team execution excellent."
                            }
                            
                            meeting_response = self.session.post(
                                f"{self.base_url}/portfolio/board-meeting",
                                json=meeting_data,
                                timeout=INVESTOR_DEMO_TIMEOUT
                            )
                            
                            if meeting_response.status_code == 200:
                                meeting_result = meeting_response.json()
                                meeting_success = meeting_result.get('success', False)
                                
                                if meeting_success:
                                    self.log_test("Framework #3 - Board Meeting Processing", True, "Meeting processed successfully", is_critical=True)
                                else:
                                    self.log_test("Framework #3 - Board Meeting Processing", False, "Meeting processing failed", is_critical=True)
                            else:
                                self.log_test("Framework #3 - Board Meeting Endpoint", False, f"Status: {meeting_response.status_code}", is_critical=True)
                        else:
                            self.log_test("Framework #3 - Portfolio Listing", False, "No companies found", is_critical=True)
                    else:
                        self.log_test("Framework #3 - Companies Endpoint", False, f"Status: {list_response.status_code}", is_critical=True)
                    
                    return company_id
                else:
                    error_msg = f"Add time: {add_time:.2f}s" if add_time > INVESTOR_DEMO_TIMEOUT else "Invalid response data"
                    self.log_test("Framework #3 - Add Company Performance", False, f"Response: {data}", error_msg, is_critical=True)
            else:
                self.log_test("Framework #3 - Add Company Endpoint", False, f"Status: {response.status_code}", response.text, is_critical=True)
                
        except Exception as e:
            self.log_test("Framework #3 - Exception", False, "", str(e), is_critical=True)
        
        return None

    def test_framework_4_fund_assessment(self):
        """CRITICAL: Test Framework #4 - Fund Assessment & Backtesting"""
        try:
            # Test adding investment decision
            decision_data = {
                "company_name": "NeuralTech AI",
                "decision_type": "invested",
                "investment_amount": 15000000,
                "valuation_at_decision": 45000000,
                "stage": "Series A",
                "industry": "Artificial Intelligence",
                "decision_rationale": "Strong team with proven AI expertise, large TAM, excellent traction",
                "key_factors": ["Experienced team", "Strong product-market fit", "Scalable technology"],
                "risk_factors": ["Competitive market", "Regulatory uncertainty"],
                "decision_maker": "Investment Committee",
                "confidence_score": 0.85
            }
            
            start_time = time.time()
            response = self.session.post(
                f"{self.base_url}/fund-assessment/add-investment-decision",
                json=decision_data,
                timeout=INVESTOR_DEMO_TIMEOUT
            )
            decision_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                decision_id = data.get('decision_id')
                status = data.get('status', 'unknown')
                
                if decision_id and status == 'added' and decision_time <= INVESTOR_DEMO_TIMEOUT:
                    self.log_test("Framework #4 - Add Investment Decision", True, f"Decision ID: {decision_id}, Time: {decision_time:.2f}s", is_critical=True)
                    
                    # Test adding investment outcome
                    outcome_data = {
                        "decision_id": decision_id,
                        "company_name": "NeuralTech AI",
                        "outcome_type": "success",
                        "exit_valuation": 150000000,
                        "multiple": 3.33,
                        "irr": 0.45,
                        "success_factors": ["Strong execution", "Market timing", "Product innovation"],
                        "lessons_learned": ["AI market timing was perfect", "Team execution exceeded expectations"]
                    }
                    
                    outcome_response = self.session.post(
                        f"{self.base_url}/fund-assessment/add-investment-outcome",
                        json=outcome_data,
                        timeout=INVESTOR_DEMO_TIMEOUT
                    )
                    
                    if outcome_response.status_code == 200:
                        outcome_result = outcome_response.json()
                        outcome_status = outcome_result.get('status', 'unknown')
                        
                        if outcome_status == 'added':
                            self.log_test("Framework #4 - Add Investment Outcome", True, "Outcome recorded successfully", is_critical=True)
                            
                            # Test backtesting
                            backtest_data = {
                                "fund_id": "demo_fund_2024",
                                "strategy_name": "AI Focus Strategy",
                                "time_period": "2020-2024",
                                "strategy_config": {
                                    "focus_sectors": ["AI", "ML", "Data"],
                                    "stage_preference": ["Series A", "Series B"],
                                    "minimum_check_size": 5000000
                                }
                            }
                            
                            backtest_response = self.session.post(
                                f"{self.base_url}/fund-assessment/run-backtest",
                                json=backtest_data,
                                timeout=INVESTOR_DEMO_TIMEOUT
                            )
                            
                            if backtest_response.status_code == 200:
                                backtest_result = backtest_response.json()
                                backtest_status = backtest_result.get('status', 'unknown')
                                results = backtest_result.get('results', {})
                                
                                if backtest_status == 'completed' and results:
                                    success_rate = results.get('success_rate', 0)
                                    average_multiple = results.get('average_multiple', 0)
                                    self.log_test("Framework #4 - Backtesting Engine", True, f"Success Rate: {success_rate}%, Avg Multiple: {average_multiple}x", is_critical=True)
                                else:
                                    self.log_test("Framework #4 - Backtesting Engine", False, "Backtest failed or incomplete", is_critical=True)
                            else:
                                self.log_test("Framework #4 - Backtest Endpoint", False, f"Status: {backtest_response.status_code}", is_critical=True)
                        else:
                            self.log_test("Framework #4 - Add Investment Outcome", False, f"Outcome status: {outcome_status}", is_critical=True)
                    else:
                        self.log_test("Framework #4 - Outcome Endpoint", False, f"Status: {outcome_response.status_code}", is_critical=True)
                    
                    return decision_id
                else:
                    error_msg = f"Decision time: {decision_time:.2f}s" if decision_time > INVESTOR_DEMO_TIMEOUT else "Invalid response data"
                    self.log_test("Framework #4 - Decision Performance", False, f"Response: {data}", error_msg, is_critical=True)
            else:
                self.log_test("Framework #4 - Decision Endpoint", False, f"Status: {response.status_code}", response.text, is_critical=True)
                
        except Exception as e:
            self.log_test("Framework #4 - Exception", False, "", str(e), is_critical=True)
        
        return None

    def test_framework_5_fund_allocation(self):
        """CRITICAL: Test Framework #5 - Fund Allocation & Deployment"""
        try:
            # Test creating allocation targets
            targets_data = [
                {
                    "category": "stage",
                    "subcategory": "Series A",
                    "target_percentage": 40.0,
                    "minimum_percentage": 30.0,
                    "maximum_percentage": 50.0
                },
                {
                    "category": "industry",
                    "subcategory": "AI",
                    "target_percentage": 35.0,
                    "minimum_percentage": 25.0,
                    "maximum_percentage": 45.0
                },
                {
                    "category": "geography",
                    "subcategory": "US",
                    "target_percentage": 70.0,
                    "minimum_percentage": 60.0,
                    "maximum_percentage": 80.0
                }
            ]
            
            start_time = time.time()
            response = self.session.post(
                f"{self.base_url}/fund-allocation/create-targets",
                json=targets_data,
                timeout=INVESTOR_DEMO_TIMEOUT
            )
            targets_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                fund_id = data.get('fund_id')
                targets_created = data.get('targets_created', 0)
                
                if fund_id and targets_created == 3 and targets_time <= INVESTOR_DEMO_TIMEOUT:
                    self.fund_id = fund_id
                    self.log_test("Framework #5 - Create Allocation Targets", True, f"Fund ID: {fund_id}, Targets: {targets_created}, Time: {targets_time:.2f}s", is_critical=True)
                    
                    # Test Monte Carlo optimization
                    optimization_data = {
                        "fund_id": fund_id,
                        "fund_name": "AI Innovation Fund",
                        "fund_size": 100000000,
                        "allocation_targets": [
                            {"category": "stage", "subcategory": "Series A", "target_percentage": 40.0},
                            {"category": "industry", "subcategory": "AI", "target_percentage": 35.0},
                            {"category": "geography", "subcategory": "US", "target_percentage": 70.0}
                        ],
                        "current_allocations": {},
                        "market_conditions": {
                            "market_phase": "growth",
                            "volatility": "medium",
                            "sector_outlook": "positive"
                        }
                    }
                    
                    optimization_response = self.session.post(
                        f"{self.base_url}/fund-allocation/optimize",
                        json=optimization_data,
                        timeout=INVESTOR_DEMO_TIMEOUT
                    )
                    
                    if optimization_response.status_code == 200:
                        optimization_result = optimization_response.json()
                        optimization_status = optimization_result.get('status', 'unknown')
                        results = optimization_result.get('optimization_results', {})
                        
                        if optimization_status == 'completed' and results:
                            expected_multiple = results.get('expected_multiple', 0)
                            expected_irr = results.get('expected_irr', 0)
                            confidence_score = results.get('confidence_score', 0)
                            
                            self.log_test("Framework #5 - Monte Carlo Optimization", True, f"Expected Multiple: {expected_multiple}x, IRR: {expected_irr}%, Confidence: {confidence_score}%", is_critical=True)
                        else:
                            self.log_test("Framework #5 - Monte Carlo Optimization", False, "Optimization failed or incomplete", is_critical=True)
                    else:
                        self.log_test("Framework #5 - Optimization Endpoint", False, f"Status: {optimization_response.status_code}", is_critical=True)
                    
                    return fund_id
                else:
                    error_msg = f"Targets time: {targets_time:.2f}s" if targets_time > INVESTOR_DEMO_TIMEOUT else "Invalid response data"
                    self.log_test("Framework #5 - Targets Performance", False, f"Response: {data}", error_msg, is_critical=True)
            else:
                self.log_test("Framework #5 - Targets Endpoint", False, f"Status: {response.status_code}", response.text, is_critical=True)
                
        except Exception as e:
            self.log_test("Framework #5 - Exception", False, "", str(e), is_critical=True)
        
        return None

    def test_framework_6_fund_vintage(self):
        """CRITICAL: Test Framework #6 - Fund Vintage Management"""
        try:
            # Test adding fund
            fund_data = {
                "fund_name": "AI Innovation Fund I",
                "vintage_year": 2024,
                "fund_size": 100000000,
                "fund_type": "Multi-Stage VC",
                "investment_strategy": "AI-focused growth equity",
                "target_sectors": ["Artificial Intelligence", "Machine Learning", "Data Analytics"],
                "target_geographies": ["US", "Europe"],
                "fund_manager": "Lead Partner",
                "committed_capital": 100000000,
                "called_capital": 25000000,
                "distributed_capital": 0,
                "status": "investing"
            }
            
            start_time = time.time()
            response = self.session.post(
                f"{self.base_url}/fund-vintage/add-fund",
                json=fund_data,
                timeout=INVESTOR_DEMO_TIMEOUT
            )
            fund_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                fund_id = data.get('fund_id')
                success = data.get('success', False)
                
                if fund_id and success and fund_time <= INVESTOR_DEMO_TIMEOUT:
                    self.log_test("Framework #6 - Add Fund", True, f"Fund ID: {fund_id}, Time: {fund_time:.2f}s", is_critical=True)
                    
                    # Test fund listing
                    list_response = self.session.get(
                        f"{self.base_url}/fund-vintage/funds",
                        timeout=INVESTOR_DEMO_TIMEOUT
                    )
                    
                    if list_response.status_code == 200:
                        funds_data = list_response.json()
                        total_funds = funds_data.get('total_funds', 0)
                        funds = funds_data.get('funds', [])
                        
                        if total_funds > 0 and len(funds) > 0:
                            self.log_test("Framework #6 - Fund Listing", True, f"Total Funds: {total_funds}", is_critical=True)
                            
                            # Test vintage analysis
                            analysis_response = self.session.get(
                                f"{self.base_url}/fund-vintage/vintage-analysis/2024",
                                timeout=INVESTOR_DEMO_TIMEOUT
                            )
                            
                            if analysis_response.status_code == 200:
                                analysis_data = analysis_response.json()
                                analysis_success = analysis_data.get('success', False)
                                
                                if analysis_success:
                                    self.log_test("Framework #6 - Vintage Analysis", True, "Vintage analysis completed", is_critical=True)
                                else:
                                    self.log_test("Framework #6 - Vintage Analysis", False, "Analysis failed", is_critical=True)
                            else:
                                self.log_test("Framework #6 - Analysis Endpoint", False, f"Status: {analysis_response.status_code}", is_critical=True)
                        else:
                            self.log_test("Framework #6 - Fund Listing", False, "No funds found", is_critical=True)
                    else:
                        self.log_test("Framework #6 - Funds Endpoint", False, f"Status: {list_response.status_code}", is_critical=True)
                    
                    return fund_id
                else:
                    error_msg = f"Fund time: {fund_time:.2f}s" if fund_time > INVESTOR_DEMO_TIMEOUT else "Invalid response data"
                    self.log_test("Framework #6 - Fund Performance", False, f"Response: {data}", error_msg, is_critical=True)
            else:
                self.log_test("Framework #6 - Fund Endpoint", False, f"Status: {response.status_code}", response.text, is_critical=True)
                
        except Exception as e:
            self.log_test("Framework #6 - Exception", False, "", str(e), is_critical=True)
        
        return None

    def test_enhanced_research_apis(self):
        """CRITICAL: Test Enhanced Research APIs (Google Search + Twitter)"""
        try:
            # Test research status
            start_time = time.time()
            status_response = self.session.get(
                f"{self.base_url}/research/status",
                timeout=INVESTOR_DEMO_TIMEOUT
            )
            status_time = time.time() - start_time
            
            if status_response.status_code == 200:
                data = status_response.json()
                google_search = data.get('google_search_api', {})
                twitter_api = data.get('twitter_api', {})
                cache_stats = data.get('cache_stats', {})
                
                google_status = google_search.get('status', 'unknown')
                twitter_status = twitter_api.get('status', 'unknown')
                
                if status_time <= INVESTOR_DEMO_TIMEOUT:
                    self.log_test("Enhanced Research - API Status", True, f"Google: {google_status}, Twitter: {twitter_status}, Time: {status_time:.2f}s", is_critical=True)
                    
                    # Test founder research
                    founder_data = {
                        'founder_name': 'Dr. Emily Chen',
                        'company_name': 'NeuralTech AI'
                    }
                    
                    founder_response = self.session.post(
                        f"{self.base_url}/research/founder",
                        data=founder_data,
                        timeout=INVESTOR_DEMO_TIMEOUT
                    )
                    
                    if founder_response.status_code == 200:
                        founder_result = founder_response.json()
                        founder_name = founder_result.get('founder_name')
                        web_research = founder_result.get('web_research', {})
                        social_research = founder_result.get('social_research', {})
                        
                        if founder_name == 'Dr. Emily Chen':
                            self.log_test("Enhanced Research - Founder Research", True, "Founder research completed", is_critical=True)
                            
                            # Test company research
                            company_data = {
                                'company_name': 'NeuralTech AI',
                                'industry': 'Artificial Intelligence'
                            }
                            
                            company_response = self.session.post(
                                f"{self.base_url}/research/company",
                                data=company_data,
                                timeout=INVESTOR_DEMO_TIMEOUT
                            )
                            
                            if company_response.status_code == 200:
                                company_result = company_response.json()
                                company_name = company_result.get('company_name')
                                
                                if company_name == 'NeuralTech AI':
                                    self.log_test("Enhanced Research - Company Research", True, "Company research completed", is_critical=True)
                                else:
                                    self.log_test("Enhanced Research - Company Research", False, "Invalid company research response", is_critical=True)
                            else:
                                self.log_test("Enhanced Research - Company Endpoint", False, f"Status: {company_response.status_code}", is_critical=True)
                        else:
                            self.log_test("Enhanced Research - Founder Research", False, "Invalid founder research response", is_critical=True)
                    else:
                        self.log_test("Enhanced Research - Founder Endpoint", False, f"Status: {founder_response.status_code}", is_critical=True)
                else:
                    self.log_test("Enhanced Research - Status Performance", False, f"Status time: {status_time:.2f}s > {INVESTOR_DEMO_TIMEOUT}s", is_critical=True)
            else:
                self.log_test("Enhanced Research - Status Endpoint", False, f"Status: {status_response.status_code}", is_critical=True)
                
        except Exception as e:
            self.log_test("Enhanced Research - Exception", False, "", str(e), is_critical=True)

    def test_ai_integration_comprehensive(self):
        """CRITICAL: Test AI Integration (Gemini Pro + RAG System)"""
        try:
            # Test RAG system status
            start_time = time.time()
            rag_response = self.session.get(
                f"{self.base_url}/rag/status",
                timeout=INVESTOR_DEMO_TIMEOUT
            )
            rag_time = time.time() - start_time
            
            if rag_response.status_code == 200:
                data = rag_response.json()
                rag_system = data.get('rag_system', 'unknown')
                collections = data.get('collections', {})
                
                if rag_system == 'operational' and rag_time <= INVESTOR_DEMO_TIMEOUT:
                    self.log_test("AI Integration - RAG System", True, f"RAG Status: {rag_system}, Time: {rag_time:.2f}s", is_critical=True)
                    
                    # Test RAG query
                    query_data = {
                        "query": "What are key success factors for AI startups?",
                        "top_k": 3
                    }
                    
                    query_response = self.session.post(
                        f"{self.base_url}/rag/query",
                        json=query_data,
                        timeout=INVESTOR_DEMO_TIMEOUT
                    )
                    
                    if query_response.status_code == 200:
                        query_result = query_response.json()
                        total_results = query_result.get('total_results', 0)
                        processing_time = query_result.get('processing_time', 0)
                        
                        if total_results > 0 and processing_time > 0:
                            self.log_test("AI Integration - RAG Query", True, f"Results: {total_results}, Processing: {processing_time:.2f}s", is_critical=True)
                        else:
                            self.log_test("AI Integration - RAG Query", False, "No results or invalid processing time", is_critical=True)
                    else:
                        self.log_test("AI Integration - RAG Query Endpoint", False, f"Status: {query_response.status_code}", is_critical=True)
                else:
                    error_msg = f"RAG time: {rag_time:.2f}s" if rag_time > INVESTOR_DEMO_TIMEOUT else f"RAG status: {rag_system}"
                    self.log_test("AI Integration - RAG Performance", False, f"Response: {data}", error_msg, is_critical=True)
            else:
                self.log_test("AI Integration - RAG Endpoint", False, f"Status: {rag_response.status_code}", is_critical=True)
                
        except Exception as e:
            self.log_test("AI Integration - Exception", False, "", str(e), is_critical=True)

    def test_error_handling_comprehensive(self):
        """CRITICAL: Test comprehensive error handling"""
        try:
            # Test invalid file upload
            invalid_file = io.BytesIO(b"This is not a valid PDF file")
            files = {'file': ('invalid.exe', invalid_file, 'application/octet-stream')}
            data = {'company_name': 'Test Company'}
            
            response = self.session.post(
                f"{self.base_url}/founder-signal/upload-deck",
                data=data,
                files=files,
                timeout=INVESTOR_DEMO_TIMEOUT
            )
            
            if response.status_code in [400, 422]:
                self.log_test("Error Handling - Invalid File Upload", True, f"Properly rejected invalid file: {response.status_code}", is_critical=True)
            else:
                self.log_test("Error Handling - Invalid File Upload", False, f"Unexpected response: {response.status_code}", is_critical=True)
            
            # Test malformed API request
            malformed_response = self.session.post(
                f"{self.base_url}/portfolio/add-company",
                json={"invalid": "data"},
                timeout=INVESTOR_DEMO_TIMEOUT
            )
            
            if malformed_response.status_code in [400, 422, 500]:
                self.log_test("Error Handling - Malformed Request", True, f"Properly handled malformed request: {malformed_response.status_code}", is_critical=True)
            else:
                self.log_test("Error Handling - Malformed Request", False, f"Unexpected response: {malformed_response.status_code}", is_critical=True)
            
            # Test non-existent endpoint
            nonexistent_response = self.session.get(
                f"{self.base_url}/nonexistent/endpoint",
                timeout=INVESTOR_DEMO_TIMEOUT
            )
            
            if nonexistent_response.status_code == 404:
                self.log_test("Error Handling - Non-existent Endpoint", True, "Properly returned 404 for non-existent endpoint", is_critical=True)
            else:
                self.log_test("Error Handling - Non-existent Endpoint", False, f"Unexpected response: {nonexistent_response.status_code}", is_critical=True)
                
        except Exception as e:
            self.log_test("Error Handling - Exception", False, "", str(e), is_critical=True)

    def test_performance_under_load(self):
        """CRITICAL: Test performance under load for investor demo"""
        try:
            # Test multiple concurrent health checks
            import concurrent.futures
            import threading
            
            def health_check_request():
                try:
                    start_time = time.time()
                    response = self.session.get(f"{self.base_url}/health", timeout=INVESTOR_DEMO_TIMEOUT)
                    end_time = time.time()
                    return {
                        'status_code': response.status_code,
                        'response_time': end_time - start_time,
                        'success': response.status_code == 200 and (end_time - start_time) <= INVESTOR_DEMO_TIMEOUT
                    }
                except Exception as e:
                    return {
                        'status_code': 0,
                        'response_time': INVESTOR_DEMO_TIMEOUT + 1,
                        'success': False,
                        'error': str(e)
                    }
            
            # Run 5 concurrent requests
            with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                futures = [executor.submit(health_check_request) for _ in range(5)]
                results = [future.result() for future in concurrent.futures.as_completed(futures)]
            
            successful_requests = sum(1 for r in results if r['success'])
            avg_response_time = sum(r['response_time'] for r in results) / len(results)
            max_response_time = max(r['response_time'] for r in results)
            
            if successful_requests >= 4 and avg_response_time <= INVESTOR_DEMO_TIMEOUT:
                self.log_test("Performance - Concurrent Load", True, f"Success: {successful_requests}/5, Avg: {avg_response_time:.2f}s, Max: {max_response_time:.2f}s", is_critical=True)
            else:
                self.log_test("Performance - Concurrent Load", False, f"Success: {successful_requests}/5, Avg: {avg_response_time:.2f}s", is_critical=True)
                
        except Exception as e:
            self.log_test("Performance - Load Test", False, "", str(e), is_critical=True)

    def run_comprehensive_investor_demo_tests(self):
        """Run all comprehensive tests for investor demo"""
        print("🚀 STARTING COMPREHENSIVE QA TESTING FOR INVESTOR DEMO")
        print("=" * 80)
        print("ZERO TOLERANCE FOR BUGS - TESTING ALL 6 VC FRAMEWORKS")
        print("=" * 80)
        print()
        
        # Critical Path Testing
        print("🔥 CRITICAL PATH TESTING")
        print("-" * 40)
        self.test_health_check_comprehensive()
        
        # Test all 6 VC frameworks
        print("\n📊 FRAMEWORK TESTING - ALL 6 VC FRAMEWORKS")
        print("-" * 50)
        self.test_framework_1_founder_signal_fit()
        self.test_framework_2_due_diligence()
        self.test_framework_3_portfolio_management()
        self.test_framework_4_fund_assessment()
        self.test_framework_5_fund_allocation()
        self.test_framework_6_fund_vintage()
        
        # Enhanced Research APIs
        print("\n🔍 ENHANCED RESEARCH API TESTING")
        print("-" * 40)
        self.test_enhanced_research_apis()
        
        # AI Integration Testing
        print("\n🤖 AI INTEGRATION TESTING")
        print("-" * 30)
        self.test_ai_integration_comprehensive()
        
        # Error Handling & Security
        print("\n🛡️ ERROR HANDLING & SECURITY TESTING")
        print("-" * 45)
        self.test_error_handling_comprehensive()
        
        # Performance Testing
        print("\n⚡ PERFORMANCE TESTING")
        print("-" * 25)
        self.test_performance_under_load()
        
        # Generate final report
        self.generate_investor_demo_report()

    def generate_investor_demo_report(self):
        """Generate comprehensive investor demo test report"""
        print("\n" + "=" * 80)
        print("🎯 INVESTOR DEMO QA TESTING REPORT")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r['success'])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        critical_tests = [r for r in self.test_results if r.get('is_critical', False)]
        critical_passed = sum(1 for r in critical_tests if r['success'])
        critical_failed = len(critical_tests) - critical_passed
        critical_success_rate = (critical_passed / len(critical_tests) * 100) if critical_tests else 0
        
        print(f"\n📈 OVERALL RESULTS:")
        print(f"   Total Tests: {total_tests}")
        print(f"   Passed: {passed_tests} ✅")
        print(f"   Failed: {failed_tests} ❌")
        print(f"   Success Rate: {success_rate:.1f}%")
        print()
        print(f"🔥 CRITICAL TESTS:")
        print(f"   Critical Tests: {len(critical_tests)}")
        print(f"   Critical Passed: {critical_passed} ✅")
        print(f"   Critical Failed: {critical_failed} ❌")
        print(f"   Critical Success Rate: {critical_success_rate:.1f}%")
        
        # Framework-specific results
        print(f"\n📊 FRAMEWORK RESULTS:")
        frameworks = {
            "Framework #1 - Founder Signal Fit": [r for r in self.test_results if "Framework #1" in r['test']],
            "Framework #2 - Due Diligence": [r for r in self.test_results if "Framework #2" in r['test']],
            "Framework #3 - Portfolio Management": [r for r in self.test_results if "Framework #3" in r['test']],
            "Framework #4 - Fund Assessment": [r for r in self.test_results if "Framework #4" in r['test']],
            "Framework #5 - Fund Allocation": [r for r in self.test_results if "Framework #5" in r['test']],
            "Framework #6 - Fund Vintage": [r for r in self.test_results if "Framework #6" in r['test']]
        }
        
        for framework_name, framework_tests in frameworks.items():
            if framework_tests:
                framework_passed = sum(1 for r in framework_tests if r['success'])
                framework_total = len(framework_tests)
                framework_rate = (framework_passed / framework_total * 100) if framework_total > 0 else 0
                status = "✅ OPERATIONAL" if framework_rate >= 80 else "❌ ISSUES DETECTED"
                print(f"   {framework_name}: {framework_passed}/{framework_total} ({framework_rate:.1f}%) {status}")
        
        # Critical failures
        if self.critical_failures:
            print(f"\n🚨 CRITICAL FAILURES (INVESTOR DEMO BLOCKERS):")
            for failure in self.critical_failures:
                print(f"   ❌ {failure}")
        else:
            print(f"\n🎉 NO CRITICAL FAILURES - INVESTOR DEMO READY!")
        
        # Performance summary
        performance_tests = [r for r in self.test_results if "Performance" in r['test'] or "response time" in r['details'].lower()]
        if performance_tests:
            print(f"\n⚡ PERFORMANCE SUMMARY:")
            for test in performance_tests:
                status = "✅" if test['success'] else "❌"
                print(f"   {status} {test['test']}: {test['details']}")
        
        # Final verdict
        print(f"\n" + "=" * 80)
        if critical_success_rate >= 95 and success_rate >= 90:
            print("🎉 INVESTOR DEMO STATUS: READY FOR PRESENTATION")
            print("   All critical systems operational, performance within limits")
        elif critical_success_rate >= 90:
            print("⚠️  INVESTOR DEMO STATUS: MINOR ISSUES DETECTED")
            print("   Core systems operational, some non-critical issues present")
        else:
            print("🚨 INVESTOR DEMO STATUS: CRITICAL ISSUES - NOT READY")
            print("   Critical failures detected, immediate attention required")
        print("=" * 80)

def main():
    """Main test execution"""
    tester = VERSSAIInvestorDemoTester()
    tester.run_comprehensive_investor_demo_tests()

if __name__ == "__main__":
    main()