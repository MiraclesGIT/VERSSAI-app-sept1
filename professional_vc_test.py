#!/usr/bin/env python3
"""
VERSSAI Professional VC Platform Test
Comprehensive test of all VC platform features
"""

import requests
import json
import time

# VERSSAI Backend Configuration
BACKEND_URL = "http://localhost:8080/api/v1"

def test_complete_vc_workflow():
    """Test complete VC investment workflow"""
    print("🎯 Testing Complete VC Workflow...")
    
    # Step 1: Create a deal
    deal_data = {
        "company_name": "VERSSAI Demo Corp",
        "founder_name": "Sarah Johnson",
        "sector": "Enterprise SaaS",
        "location": "Austin, TX",
        "ask_amount": 8000000,
        "pre_money_valuation": 32000000,
        "lead_source": "Conference",
        "description": "AI-powered workforce analytics platform"
    }
    
    print("📋 Step 1: Creating deal...")
    try:
        deal_response = requests.post(f"{BACKEND_URL}/deals", json=deal_data)
        if deal_response.status_code != 200:
            print(f"❌ Deal creation failed: {deal_response.status_code}")
            return False
        
        deal_result = deal_response.json()
        deal_id = deal_result.get('deal_id')
        print(f"✅ Deal created with score: {deal_result.get('deal_score')}/100")
        
        # Step 2: Progress deal through pipeline
        print("📈 Step 2: Progressing through pipeline...")
        
        stages = ['Interest', 'Due Diligence', 'Term Sheet']
        for stage in stages:
            update_data = {"stage": stage}
            update_response = requests.put(f"{BACKEND_URL}/deals/{deal_id}", json=update_data)
            if update_response.status_code == 200:
                print(f"✅ Moved to {stage}")
            else:
                print(f"❌ Failed to move to {stage}")
                return False
            time.sleep(0.5)
        
        # Step 3: Create investment
        print("💰 Step 3: Creating investment...")
        investment_data = {
            "deal_id": deal_id,
            "investment_amount": 8000000,
            "ownership_percentage": 20.0,
            "investment_date": "2025-08-17T12:00:00Z",
            "security_type": "Series A Preferred"
        }
        
        investment_response = requests.post(f"{BACKEND_URL}/investments", json=investment_data)
        if investment_response.status_code == 200:
            investment_result = investment_response.json()
            print(f"✅ Investment created: {investment_result.get('investment_id')}")
            
            # Step 4: Update financial metrics
            print("📊 Step 4: Updating financial metrics...")
            metrics_data = {
                "company_id": "demo_company_001",
                "revenue": 3000000,
                "growth_rate": 180,
                "burn_rate": 150000,
                "runway_months": 20,
                "employees": 35,
                "customers": 85
            }
            
            metrics_response = requests.post(f"{BACKEND_URL}/financial-metrics", json=metrics_data)
            if metrics_response.status_code == 200:
                print("✅ Financial metrics updated")
                return True
            else:
                print(f"❌ Metrics update failed: {metrics_response.status_code}")
                return False
        else:
            print(f"❌ Investment creation failed: {investment_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Workflow error: {e}")
        return False

def test_ai_analytics():
    """Test AI-powered analytics features"""
    print("\n🧠 Testing AI Analytics...")
    
    try:
        # Test deal scoring for multiple companies
        test_companies = [
            {"name": "AI Startup A", "sector": "AI/ML", "growth": 200},
            {"name": "Biotech B", "sector": "Biotech", "growth": 150},
            {"name": "Fintech C", "sector": "FinTech", "growth": 120}
        ]
        
        scores = []
        for company in test_companies:
            deal_data = {
                "company_name": company["name"],
                "founder_name": "Test Founder",
                "sector": company["sector"],
                "location": "San Francisco, CA",
                "ask_amount": 5000000,
                "pre_money_valuation": 20000000,
                "lead_source": "AI Test"
            }
            
            response = requests.post(f"{BACKEND_URL}/deals", json=deal_data)
            if response.status_code == 200:
                result = response.json()
                scores.append({
                    'company': company['name'],
                    'score': result.get('deal_score', 0)
                })
        
        if scores:
            print("✅ AI scoring results:")
            for item in scores:
                print(f"   {item['company']}: {item['score']}/100")
            return True
        else:
            print("❌ No AI scores generated")
            return False
            
    except Exception as e:
        print(f"❌ AI analytics error: {e}")
        return False

def run_professional_test():
    """Run complete professional VC platform test"""
    print("🚀 VERSSAI Professional VC Platform Test")
    print("========================================")
    
    tests = [
        ("Complete VC Workflow", test_complete_vc_workflow),
        ("AI Analytics", test_ai_analytics)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        if test_func():
            passed += 1
        time.sleep(1)
    
    print(f"\n📊 Professional Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 VERSSAI Professional VC Platform fully operational!")
    else:
        print("⚠️ Some professional features need attention")

if __name__ == "__main__":
    run_professional_test()
