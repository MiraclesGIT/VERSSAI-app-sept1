#!/usr/bin/env python3
"""
VERSSAI VC Platform Backend Test
Tests the Real VC Platform API endpoints
"""

import requests
import json
import time
from datetime import datetime

# VERSSAI Backend Configuration
BACKEND_URL = "http://localhost:8080/api/v1"

def test_health_check():
    """Test system health check"""
    print("Testing VERSSAI VC Platform health...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_deal_flow():
    """Test deal flow management"""
    print("\n🔥 Testing Deal Flow Management...")
    
    # Create a new deal
    deal_data = {
        "company_name": "VERSSAI Test Startup",
        "founder_name": "Jane Smith",
        "sector": "AI/ML",
        "location": "San Francisco, CA",
        "ask_amount": 5000000,
        "pre_money_valuation": 20000000,
        "lead_source": "Partner Network",
        "description": "AI-powered analytics platform for enterprises"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/deals", json=deal_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Deal created successfully: {result}")
            deal_id = result.get('deal_id')
            
            # Test deal scoring
            if deal_id:
                score_response = requests.get(f"{BACKEND_URL}/analytics/deal-score/{deal_id}")
                if score_response.status_code == 200:
                    score_data = score_response.json()
                    print(f"✅ Deal scoring: {score_data['overall_score']}/100")
                    return True
        else:
            print(f"❌ Deal creation failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Deal flow error: {e}")
        return False

def test_portfolio_management():
    """Test portfolio management features"""
    print("\n📊 Testing Portfolio Management...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/portfolio")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Portfolio data retrieved: {len(data.get('companies', []))} companies")
            
            # Test fund performance
            fund_response = requests.get(f"{BACKEND_URL}/fund/performance")
            if fund_response.status_code == 200:
                fund_data = fund_response.json()
                metrics = fund_data.get('performance_metrics', {})
                print(f"✅ Fund performance - IRR: {metrics.get('irr', 0)}%, TVPI: {metrics.get('tvpi', 0)}x")
                return True
        else:
            print(f"❌ Portfolio retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Portfolio management error: {e}")
        return False

def run_platform_test():
    """Run complete VERSSAI VC Platform test"""
    print("🚀 VERSSAI VC Platform Backend Test")
    print("====================================")
    
    tests = [
        ("Health Check", test_health_check),
        ("Deal Flow Management", test_deal_flow),
        ("Portfolio Management", test_portfolio_management)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        if test_func():
            passed += 1
        time.sleep(1)
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! VERSSAI VC Platform is operational.")
    else:
        print("⚠️ Some tests failed. Check the platform configuration.")

if __name__ == "__main__":
    run_platform_test()
