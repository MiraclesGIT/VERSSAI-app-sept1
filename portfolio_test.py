#!/usr/bin/env python3
"""
VERSSAI Portfolio Management Test
Tests portfolio tracking and analytics features
"""

import requests
import json

# VERSSAI Backend Configuration  
BACKEND_URL = "http://localhost:8080/api/v1"

def test_portfolio_tracking():
    """Test portfolio company tracking"""
    print("📊 Testing VERSSAI Portfolio Management...")
    
    try:
        # Get portfolio data
        response = requests.get(f"{BACKEND_URL}/portfolio")
        
        if response.status_code == 200:
            data = response.json()
            companies = data.get('companies', [])
            health = data.get('portfolio_health', {})
            
            print(f"✅ Portfolio retrieved: {len(companies)} companies")
            print(f"✅ Portfolio health score: {health.get('score', 0)}/100")
            
            # Show sample companies
            for i, company in enumerate(companies[:3]):
                print(f"   {i+1}. {company['name']} - {company['status']} - {company['kpis']['growth_rate']}% growth")
            
            return True
        else:
            print(f"❌ Portfolio retrieval failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Portfolio test error: {e}")
        return False

def test_fund_performance():
    """Test fund performance calculations"""
    print("\n💰 Testing Fund Performance Analytics...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/fund/performance")
        
        if response.status_code == 200:
            data = response.json()
            fund_info = data.get('fund_info', {})
            metrics = data.get('performance_metrics', {})
            
            print(f"✅ Fund: {fund_info.get('name')} {fund_info.get('vintage')}")
            print(f"✅ Commitments: ${fund_info.get('total_commitments', 0)/1000000:.0f}M")
            print(f"✅ Deployed: ${fund_info.get('total_deployed', 0)/1000000:.0f}M")
            print(f"✅ IRR: {metrics.get('irr', 0):.1f}%")
            print(f"✅ TVPI: {metrics.get('tvpi', 0):.2f}x")
            print(f"✅ DPI: {metrics.get('dpi', 0):.2f}x")
            print(f"✅ Active investments: {metrics.get('active_investments', 0)}")
            
            return True
        else:
            print(f"❌ Fund performance failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Fund performance error: {e}")
        return False

def test_financial_metrics():
    """Test financial metrics updates"""
    print("\n📈 Testing Financial Metrics Updates...")
    
    metrics_data = {
        "company_id": "test_company_001",
        "revenue": 5000000,
        "growth_rate": 150,
        "burn_rate": 200000,
        "runway_months": 24,
        "employees": 45,
        "customers": 120,
        "arr": 4800000,
        "churn_rate": 3.2
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/financial-metrics", json=metrics_data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Financial metrics updated: {result.get('metrics_id')}")
            return True
        else:
            print(f"❌ Metrics update failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Metrics update error: {e}")
        return False

def run_portfolio_test():
    """Run complete portfolio test"""
    print("🚀 VERSSAI Portfolio Management Test")
    print("===================================")
    
    tests = [
        test_portfolio_tracking,
        test_fund_performance,
        test_financial_metrics
    ]
    
    passed = 0
    for test_func in tests:
        if test_func():
            passed += 1
    
    print(f"\n📊 Portfolio Test Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 Portfolio management system operational!")
    else:
        print("⚠️ Some portfolio features need attention")

if __name__ == "__main__":
    run_portfolio_test()
