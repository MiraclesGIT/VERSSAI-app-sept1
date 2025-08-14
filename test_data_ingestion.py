#!/usr/bin/env python3
"""
Data Ingestion Endpoints Testing for VERSSAI VC Intelligence Platform
Tests the newly implemented data ingestion endpoints for Portfolio Management, Fund Assessment, and Fund Allocation
"""

import requests
import json
import os
import time
from datetime import datetime
import urllib3

# Disable SSL warnings for testing
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configuration
BACKEND_URL = "https://vc-intelligence-1.preview.emergentagent.com/api"
TEST_TIMEOUT = 60
AI_PROCESSING_TIMEOUT = 120

class DataIngestionTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
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

    def test_portfolio_data_ingestion(self):
        """Test new portfolio data ingestion endpoints"""
        print("\n🔥 TESTING NEW PORTFOLIO DATA INGESTION ENDPOINTS...")
        
        # Test 1: Portfolio company data ingestion
        try:
            company_data = {
                "company_name": "DataTech Innovations",
                "investment_date": "2024-01-15",
                "initial_investment": 3000000,
                "current_valuation": 9000000,
                "stage": "Series A",
                "industry": "Data Analytics",
                "founders": ["Alice Johnson", "Bob Smith"],
                "board_members": ["Alice Johnson", "Carol Davis (VC)", "David Wilson (Independent)"],
                "key_metrics": {
                    "arr": 2500000,
                    "monthly_growth_rate": 12,
                    "customer_count": 65,
                    "team_size": 35
                }
            }
            
            response = self.session.post(
                f"{self.base_url}/portfolio/ingest-data",
                data={
                    'data_type': 'company',
                    'company_id': 'datatech_001',
                    'data': json.dumps(company_data)
                },
                timeout=TEST_TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                message = data.get('message', '')
                ingestion_id = data.get('ingestion_id')
                data_type = data.get('data_type')
                result = data.get('result', {})
                
                if 'successfully' in message.lower() and ingestion_id and data_type == 'company':
                    self.log_test("Portfolio Data Ingestion - Company Data", True, f"Ingestion ID: {ingestion_id}, Result: {result.get('type', 'unknown')}")
                else:
                    self.log_test("Portfolio Data Ingestion - Company Data", False, f"Invalid response: {data}")
            else:
                self.log_test("Portfolio Data Ingestion - Company Data", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Portfolio Data Ingestion - Company Data", False, "", str(e))
        
        # Test 2: Meeting notes data ingestion
        try:
            meeting_notes_data = {
                "meeting_date": "2024-03-20",
                "attendees": ["CEO", "CTO", "Lead Investor"],
                "agenda_items": ["Q1 Review", "Product Roadmap", "Funding Discussion"],
                "key_decisions": ["Approved marketing budget increase", "Decided on Series B timeline"],
                "meeting_notes": "Comprehensive quarterly review meeting with strong performance indicators and strategic planning for next phase of growth.",
                "financial_updates": {
                    "revenue": 2800000,
                    "burn_rate": 200000,
                    "cash_runway_months": 18
                },
                "kpi_updates": {
                    "customer_acquisition_cost": 2200,
                    "lifetime_value": 32000,
                    "churn_rate": 2.8
                }
            }
            
            response = self.session.post(
                f"{self.base_url}/portfolio/ingest-data",
                data={
                    'data_type': 'meeting_notes',
                    'company_id': 'datatech_001',
                    'data': json.dumps(meeting_notes_data)
                },
                timeout=AI_PROCESSING_TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                message = data.get('message', '')
                result = data.get('result', {})
                
                if 'successfully' in message.lower() and result.get('type') == 'meeting_processed':
                    self.log_test("Portfolio Data Ingestion - Meeting Notes", True, f"Meeting ID: {result.get('meeting_id')}, Status: {result.get('status')}")
                else:
                    self.log_test("Portfolio Data Ingestion - Meeting Notes", False, f"Invalid response: {data}")
            else:
                self.log_test("Portfolio Data Ingestion - Meeting Notes", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Portfolio Data Ingestion - Meeting Notes", False, "", str(e))
        
        # Test 3: KPI updates data ingestion
        try:
            kpi_data = {
                "monthly_recurring_revenue": 180000,
                "customer_acquisition_cost": 2100,
                "lifetime_value": 34000,
                "churn_rate": 2.5,
                "net_promoter_score": 68,
                "gross_margin": 78
            }
            
            response = self.session.post(
                f"{self.base_url}/portfolio/ingest-data",
                data={
                    'data_type': 'kpi_update',
                    'company_id': 'datatech_001',
                    'data': json.dumps(kpi_data)
                },
                timeout=TEST_TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                message = data.get('message', '')
                result = data.get('result', {})
                
                if 'successfully' in message.lower() and result.get('type') == 'kpi_updated':
                    kpis_updated = result.get('kpis_updated', [])
                    self.log_test("Portfolio Data Ingestion - KPI Updates", True, f"KPIs Updated: {len(kpis_updated)} ({', '.join(kpis_updated[:3])}...)")
                else:
                    self.log_test("Portfolio Data Ingestion - KPI Updates", False, f"Invalid response: {data}")
            else:
                self.log_test("Portfolio Data Ingestion - KPI Updates", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Portfolio Data Ingestion - KPI Updates", False, "", str(e))
        
        # Test 4: Error handling for invalid data types
        try:
            response = self.session.post(
                f"{self.base_url}/portfolio/ingest-data",
                data={
                    'data_type': 'invalid_type',
                    'company_id': 'test_company',
                    'data': '{"test": "data"}'
                },
                timeout=TEST_TIMEOUT
            )
            
            # Should return 400 error for invalid data type
            if response.status_code == 400:
                self.log_test("Portfolio Data Ingestion - Error Handling", True, "Properly rejected invalid data type")
            else:
                self.log_test("Portfolio Data Ingestion - Error Handling", False, f"Expected 400, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Portfolio Data Ingestion - Error Handling", False, "", str(e))

    def test_fund_assessment_data_ingestion(self):
        """Test new fund assessment and backtesting data ingestion endpoints"""
        print("\n💰 TESTING NEW FUND ASSESSMENT DATA INGESTION ENDPOINTS...")
        
        # Test 1: Add investment decision
        try:
            decision_data = {
                "company_name": "FinTech Innovations",
                "decision_type": "invested",
                "investment_amount": 2500000,
                "valuation_at_decision": 10000000,
                "stage": "Series A",
                "industry": "Financial Technology",
                "decision_rationale": "Strong team with proven track record in fintech, large addressable market, and solid product-market fit demonstrated by 200% YoY growth.",
                "key_factors": [
                    "Experienced founding team with previous exits",
                    "Strong product-market fit with enterprise customers",
                    "Large and growing TAM ($50B+)",
                    "Defensible technology and IP portfolio"
                ],
                "risk_factors": [
                    "Regulatory uncertainty in fintech space",
                    "Intense competition from well-funded startups",
                    "Customer concentration risk"
                ],
                "decision_maker": "Investment Committee",
                "confidence_score": 0.85
            }
            
            response = self.session.post(
                f"{self.base_url}/fund-assessment/add-investment-decision",
                json=decision_data,
                timeout=TEST_TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                decision_id = data.get('decision_id')
                company_name = data.get('company_name')
                decision_type = data.get('decision_type')
                status = data.get('status')
                
                if decision_id and company_name == "FinTech Innovations" and decision_type == "invested" and status == "added":
                    self.log_test("Fund Assessment Data Ingestion - Investment Decision", True, f"Decision ID: {decision_id}, Company: {company_name}")
                    self.test_decision_id = decision_id  # Store for outcome test
                else:
                    self.log_test("Fund Assessment Data Ingestion - Investment Decision", False, f"Invalid response: {data}")
            else:
                self.log_test("Fund Assessment Data Ingestion - Investment Decision", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Fund Assessment Data Ingestion - Investment Decision", False, "", str(e))
        
        # Test 2: Add investment outcome
        try:
            if hasattr(self, 'test_decision_id'):
                outcome_data = {
                    "decision_id": self.test_decision_id,
                    "company_name": "FinTech Innovations",
                    "outcome_type": "success",
                    "exit_date": "2024-02-15",
                    "exit_valuation": 45000000,
                    "exit_type": "acquisition",
                    "multiple": 4.5,
                    "irr": 0.68,
                    "lessons_learned": [
                        "Strong founding team was key to successful execution",
                        "Early enterprise customer validation proved crucial",
                        "Regulatory compliance expertise was differentiating factor"
                    ],
                    "success_factors": [
                        "Exceptional product-market fit",
                        "Strong unit economics and scalable business model",
                        "Effective go-to-market strategy"
                    ]
                }
                
                response = self.session.post(
                    f"{self.base_url}/fund-assessment/add-investment-outcome",
                    json=outcome_data,
                    timeout=TEST_TIMEOUT
                )
                
                if response.status_code == 200:
                    data = response.json()
                    outcome_id = data.get('outcome_id')
                    decision_id = data.get('decision_id')
                    outcome_type = data.get('outcome_type')
                    status = data.get('status')
                    
                    if outcome_id and decision_id == self.test_decision_id and outcome_type == "success" and status == "added":
                        self.log_test("Fund Assessment Data Ingestion - Investment Outcome", True, f"Outcome ID: {outcome_id}, Multiple: {outcome_data['multiple']}x")
                    else:
                        self.log_test("Fund Assessment Data Ingestion - Investment Outcome", False, f"Invalid response: {data}")
                else:
                    self.log_test("Fund Assessment Data Ingestion - Investment Outcome", False, f"Status: {response.status_code}", response.text)
            else:
                self.log_test("Fund Assessment Data Ingestion - Investment Outcome", True, "Skipped - no decision ID available")
                
        except Exception as e:
            self.log_test("Fund Assessment Data Ingestion - Investment Outcome", False, "", str(e))
        
        # Test 3: Run backtest
        try:
            backtest_data = {
                "fund_id": "test_fund_001",
                "strategy_name": "Conservative Growth Strategy",
                "time_period": "2020-2024",
                "strategy_config": {
                    "risk_tolerance": "medium",
                    "sector_focus": ["fintech", "healthtech", "enterprise_software"],
                    "stage_preference": ["series_a", "series_b"],
                    "check_size_range": [1000000, 5000000]
                }
            }
            
            response = self.session.post(
                f"{self.base_url}/fund-assessment/run-backtest",
                json=backtest_data,
                timeout=AI_PROCESSING_TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                backtest_id = data.get('backtest_id')
                fund_id = data.get('fund_id')
                strategy_name = data.get('strategy_name')
                status = data.get('status')
                results = data.get('results', {})
                
                if backtest_id and fund_id == "test_fund_001" and status == "completed":
                    self.log_test("Fund Assessment Data Ingestion - Run Backtest", True, f"Backtest ID: {backtest_id}, Strategy: {strategy_name}")
                    self.test_fund_id = fund_id  # Store for performance analysis test
                else:
                    self.log_test("Fund Assessment Data Ingestion - Run Backtest", False, f"Invalid response: {data}")
            else:
                self.log_test("Fund Assessment Data Ingestion - Run Backtest", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Fund Assessment Data Ingestion - Run Backtest", False, "", str(e))
        
        # Test 4: Performance analysis
        try:
            if hasattr(self, 'test_fund_id'):
                response = self.session.get(
                    f"{self.base_url}/fund-assessment/performance-analysis/{self.test_fund_id}",
                    timeout=AI_PROCESSING_TIMEOUT
                )
                
                if response.status_code == 200:
                    data = response.json()
                    fund_id = data.get('fund_id')
                    analysis = data.get('analysis', {})
                    status = data.get('status')
                    
                    if fund_id == self.test_fund_id and analysis and status == "completed":
                        self.log_test("Fund Assessment Data Ingestion - Performance Analysis", True, f"Analysis completed for fund: {fund_id}")
                    else:
                        self.log_test("Fund Assessment Data Ingestion - Performance Analysis", False, f"Invalid response: {data}")
                else:
                    self.log_test("Fund Assessment Data Ingestion - Performance Analysis", False, f"Status: {response.status_code}", response.text)
            else:
                self.log_test("Fund Assessment Data Ingestion - Performance Analysis", True, "Skipped - no fund ID available")
                
        except Exception as e:
            self.log_test("Fund Assessment Data Ingestion - Performance Analysis", False, "", str(e))

    def test_fund_allocation_data_ingestion(self):
        """Test new fund allocation and deployment data ingestion endpoints"""
        print("\n📈 TESTING NEW FUND ALLOCATION DATA INGESTION ENDPOINTS...")
        
        # Test 1: Create allocation targets
        try:
            allocation_targets = [
                {
                    "category": "stage",
                    "subcategory": "Series A",
                    "target_percentage": 40.0,
                    "minimum_percentage": 30.0,
                    "maximum_percentage": 50.0,
                    "current_allocation": 0.0,
                    "deployed_amount": 0.0
                },
                {
                    "category": "industry",
                    "subcategory": "Artificial Intelligence",
                    "target_percentage": 25.0,
                    "minimum_percentage": 15.0,
                    "maximum_percentage": 35.0,
                    "current_allocation": 0.0,
                    "deployed_amount": 0.0
                },
                {
                    "category": "geography",
                    "subcategory": "North America",
                    "target_percentage": 60.0,
                    "minimum_percentage": 50.0,
                    "maximum_percentage": 70.0,
                    "current_allocation": 0.0,
                    "deployed_amount": 0.0
                }
            ]
            
            response = self.session.post(
                f"{self.base_url}/fund-allocation/create-targets",
                json=allocation_targets,
                timeout=TEST_TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                targets_created = data.get('targets_created', 0)
                results = data.get('results', [])
                message = data.get('message', '')
                
                if targets_created == len(allocation_targets) and 'successfully' in message.lower():
                    target_details = ", ".join([f"{r['category']}: {r['subcategory']} ({r['target_percentage']}%)" for r in results])
                    self.log_test("Fund Allocation Data Ingestion - Create Targets", True, f"Created {targets_created} targets: {target_details}")
                else:
                    self.log_test("Fund Allocation Data Ingestion - Create Targets", False, f"Invalid response: {data}")
            else:
                self.log_test("Fund Allocation Data Ingestion - Create Targets", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Fund Allocation Data Ingestion - Create Targets", False, "", str(e))
        
        # Test 2: Optimize fund allocation
        try:
            optimization_data = {
                "fund_id": "allocation_test_fund_001",
                "fund_name": "Growth Equity Fund III",
                "fund_size": 100000000,
                "allocation_targets": [
                    {"category": "stage", "subcategory": "Series A", "target_percentage": 40.0},
                    {"category": "stage", "subcategory": "Series B", "target_percentage": 35.0},
                    {"category": "stage", "subcategory": "Growth", "target_percentage": 25.0}
                ],
                "current_allocations": {
                    "series_a": 15000000,
                    "series_b": 8000000,
                    "growth": 2000000
                },
                "market_conditions": {
                    "market_phase": "expansion",
                    "volatility_index": 0.3,
                    "sector_trends": ["ai_growth", "fintech_stable", "healthtech_emerging"]
                }
            }
            
            response = self.session.post(
                f"{self.base_url}/fund-allocation/optimize",
                json=optimization_data,
                timeout=AI_PROCESSING_TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                optimization_id = data.get('optimization_id')
                fund_id = data.get('fund_id')
                fund_name = data.get('fund_name')
                status = data.get('status')
                optimization_results = data.get('optimization_results', {})
                
                if optimization_id and fund_id == "allocation_test_fund_001" and status == "completed":
                    self.log_test("Fund Allocation Data Ingestion - Optimize", True, f"Optimization ID: {optimization_id}, Fund: {fund_name}")
                    self.test_allocation_fund_id = fund_id  # Store for report test
                else:
                    self.log_test("Fund Allocation Data Ingestion - Optimize", False, f"Invalid response: {data}")
            else:
                self.log_test("Fund Allocation Data Ingestion - Optimize", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Fund Allocation Data Ingestion - Optimize", False, "", str(e))
        
        # Test 3: Generate allocation report
        try:
            if hasattr(self, 'test_allocation_fund_id'):
                response = self.session.get(
                    f"{self.base_url}/fund-allocation/report/{self.test_allocation_fund_id}",
                    timeout=AI_PROCESSING_TIMEOUT
                )
                
                if response.status_code == 200:
                    data = response.json()
                    fund_id = data.get('fund_id')
                    report = data.get('report', {})
                    status = data.get('status')
                    
                    if fund_id == self.test_allocation_fund_id and report and status == "completed":
                        self.log_test("Fund Allocation Data Ingestion - Report", True, f"Report generated for fund: {fund_id}")
                    else:
                        self.log_test("Fund Allocation Data Ingestion - Report", False, f"Invalid response: {data}")
                else:
                    self.log_test("Fund Allocation Data Ingestion - Report", False, f"Status: {response.status_code}", response.text)
            else:
                self.log_test("Fund Allocation Data Ingestion - Report", True, "Skipped - no fund ID available")
                
        except Exception as e:
            self.log_test("Fund Allocation Data Ingestion - Report", False, "", str(e))
        
        # Test 4: Fund allocation data ingestion endpoint
        try:
            # Test allocation target data ingestion
            allocation_target_data = {
                "category": "theme",
                "subcategory": "ESG",
                "target_percentage": 15.0,
                "minimum_percentage": 10.0,
                "maximum_percentage": 20.0
            }
            
            response = self.session.post(
                f"{self.base_url}/fund-allocation/ingest-data",
                data={
                    'data_type': 'allocation_target',
                    'fund_id': 'allocation_test_fund_001',
                    'data': json.dumps(allocation_target_data)
                },
                timeout=TEST_TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                message = data.get('message', '')
                result = data.get('result', {})
                
                if 'successfully' in message.lower() and result.get('type') == 'allocation_target_created':
                    self.log_test("Fund Allocation Data Ingestion - Ingest Data", True, f"Target ID: {result.get('target_id')}")
                else:
                    self.log_test("Fund Allocation Data Ingestion - Ingest Data", False, f"Invalid response: {data}")
            else:
                self.log_test("Fund Allocation Data Ingestion - Ingest Data", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Fund Allocation Data Ingestion - Ingest Data", False, "", str(e))

    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 100)
        print("🔥 NEW DATA INGESTION ENDPOINTS TEST SUMMARY")
        print("=" * 100)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n📊 OVERALL RESULTS:")
        print(f"   Total Tests: {total_tests}")
        print(f"   Passed: {passed_tests} ✅")
        print(f"   Failed: {failed_tests} ❌")
        print(f"   Success Rate: {success_rate:.1f}%")
        
        # Categorize results
        portfolio_tests = [r for r in self.test_results if 'Portfolio Data Ingestion' in r['test']]
        fund_assessment_tests = [r for r in self.test_results if 'Fund Assessment Data Ingestion' in r['test']]
        fund_allocation_tests = [r for r in self.test_results if 'Fund Allocation Data Ingestion' in r['test']]
        
        print(f"\n🔥 DATA INGESTION ENDPOINTS RESULTS:")
        
        if portfolio_tests:
            portfolio_passed = sum(1 for r in portfolio_tests if r['success'])
            portfolio_total = len(portfolio_tests)
            print(f"\n📊 Portfolio Management Data Ingestion: {portfolio_passed}/{portfolio_total} tests passed")
            for result in portfolio_tests:
                status = "✅" if result['success'] else "❌"
                print(f"   {status} {result['test']}")
        
        if fund_assessment_tests:
            assessment_passed = sum(1 for r in fund_assessment_tests if r['success'])
            assessment_total = len(fund_assessment_tests)
            print(f"\n💰 Fund Assessment Data Ingestion: {assessment_passed}/{assessment_total} tests passed")
            for result in fund_assessment_tests:
                status = "✅" if result['success'] else "❌"
                print(f"   {status} {result['test']}")
        
        if fund_allocation_tests:
            allocation_passed = sum(1 for r in fund_allocation_tests if r['success'])
            allocation_total = len(fund_allocation_tests)
            print(f"\n📈 Fund Allocation Data Ingestion: {allocation_passed}/{allocation_total} tests passed")
            for result in fund_allocation_tests:
                status = "✅" if result['success'] else "❌"
                print(f"   {status} {result['test']}")
        
        # Show failed tests details
        failed_results = [r for r in self.test_results if not r['success']]
        if failed_results:
            print("\n❌ FAILED TESTS DETAILS:")
            for result in failed_results:
                print(f"   • {result['test']}")
                if result['error']:
                    print(f"     Error: {result['error']}")
                print()
        
        print(f"\n🎯 DATA INGESTION ENDPOINTS ASSESSMENT:")
        if success_rate >= 80:
            print("   🎉 EXCELLENT: Data ingestion endpoints are production-ready!")
        elif success_rate >= 60:
            print("   ✅ GOOD: Data ingestion endpoints are mostly working")
        elif success_rate >= 40:
            print("   ⚠️ FAIR: Data ingestion endpoints have significant issues")
        else:
            print("   ❌ POOR: Data ingestion endpoints require major fixes")
        
        print("=" * 100)
        
        return {
            'total': total_tests,
            'passed': passed_tests,
            'failed': failed_tests,
            'success_rate': success_rate,
            'results': self.test_results
        }

if __name__ == "__main__":
    tester = DataIngestionTester()
    
    print("🔥 TESTING NEW VERSSAI DATA INGESTION ENDPOINTS")
    print("=" * 100)
    print("🎯 FOCUS: Portfolio Management, Fund Assessment, and Fund Allocation Data Ingestion")
    print("=" * 100)
    
    # Test all data ingestion endpoints
    tester.test_portfolio_data_ingestion()
    tester.test_fund_assessment_data_ingestion()
    tester.test_fund_allocation_data_ingestion()
    
    # Generate comprehensive summary
    results = tester.generate_summary()
    
    print(f"\n🎯 FINAL SUMMARY: {results['passed']}/{results['total']} tests passed ({results['success_rate']:.1f}% success rate)")