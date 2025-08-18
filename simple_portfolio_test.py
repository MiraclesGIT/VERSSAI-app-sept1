#!/usr/bin/env python3
"""
Simple Portfolio Management Framework Test
"""

import requests
import json
import urllib3

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BACKEND_URL = "https://vc-intelligence-1.preview.localhost:8080/api"

def test_portfolio_status():
    """Test portfolio status endpoint"""
    try:
        response = requests.get(f"{BACKEND_URL}/portfolio/status", verify=False, timeout=30)
        print(f"Portfolio Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Status: {data.get('status')}")
            print(f"Framework: {data.get('framework')}")
            features = data.get('features', {})
            print(f"Portfolio Tracking: {features.get('portfolio_company_tracking')}")
            print(f"Board Meeting Analysis: {features.get('board_meeting_analysis')}")
            print(f"KPI Monitoring: {features.get('kpi_monitoring')}")
            print(f"AI Insights: {features.get('ai_powered_insights')}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

def test_add_company():
    """Test adding a portfolio company"""
    try:
        company_data = {
            "company_name": "TechVenture AI",
            "investment_date": "2023-01-15",
            "initial_investment": 2000000,
            "current_valuation": 8000000,
            "stage": "Series A",
            "industry": "Artificial Intelligence",
            "founders": ["Sarah Chen", "Michael Rodriguez"],
            "board_members": ["Sarah Chen", "John Smith (VC)", "Lisa Wang (Independent)"],
            "key_metrics": {
                "arr": 1500000,
                "monthly_growth_rate": 15,
                "customer_count": 45,
                "team_size": 25
            }
        }
        
        response = requests.post(
            f"{BACKEND_URL}/portfolio/add-company",
            json=company_data,
            verify=False,
            timeout=30
        )
        
        print(f"Add Company: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data.get('success')}")
            print(f"Company ID: {data.get('company_id')}")
            print(f"Company Name: {data.get('company_name')}")
            return data.get('company_id')
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Exception: {e}")
        return None

def test_get_companies():
    """Test getting portfolio companies"""
    try:
        response = requests.get(f"{BACKEND_URL}/portfolio/companies", verify=False, timeout=30)
        print(f"Get Companies: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data.get('success')}")
            print(f"Total Companies: {data.get('total_companies')}")
            companies = data.get('companies', [])
            if companies:
                print(f"First Company: {companies[0].get('company_name')}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

def test_performance_report():
    """Test portfolio performance report"""
    try:
        response = requests.get(f"{BACKEND_URL}/portfolio/performance-report", verify=False, timeout=60)
        print(f"Performance Report: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data.get('success')}")
            report = data.get('report', {})
            print(f"Report ID: {report.get('report_id')}")
            print(f"Companies Analyzed: {report.get('total_companies_analyzed')}")
            print(f"Health Score: {report.get('overall_health_score')}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Simple Portfolio Management Framework Test")
    print("=" * 50)
    
    # Test 1: Portfolio Status
    print("\n1. Testing Portfolio Status...")
    status_ok = test_portfolio_status()
    
    # Test 2: Add Company
    print("\n2. Testing Add Company...")
    company_id = test_add_company()
    
    # Test 3: Get Companies
    print("\n3. Testing Get Companies...")
    companies_ok = test_get_companies()
    
    # Test 4: Performance Report
    print("\n4. Testing Performance Report...")
    report_ok = test_performance_report()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"Portfolio Status: {'✅' if status_ok else '❌'}")
    print(f"Add Company: {'✅' if company_id else '❌'}")
    print(f"Get Companies: {'✅' if companies_ok else '❌'}")
    print(f"Performance Report: {'✅' if report_ok else '❌'}")
    
    total_tests = 4
    passed_tests = sum([status_ok, bool(company_id), companies_ok, report_ok])
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed ({passed_tests/total_tests*100:.1f}%)")