#!/usr/bin/env python3
"""
VERSSAI Deterministic Scoring Test
Tests the AI-powered deal scoring algorithms
"""

import requests
import json
import time

# VERSSAI Backend Configuration
BACKEND_URL = "http://localhost:8080/api/v1"

def test_deterministic_scoring():
    """Test deterministic deal scoring"""
    print("🧠 Testing VERSSAI AI Deal Scoring...")
    
    # Test data for consistent scoring
    test_deals = [
        {
            "company_name": "Neural Networks Inc",
            "founder_name": "Dr. Alex Chen",
            "sector": "AI/ML", 
            "location": "Palo Alto, CA",
            "ask_amount": 10000000,
            "pre_money_valuation": 40000000,
            "lead_source": "University Network",
            "description": "Advanced neural network platform for enterprise AI"
        },
        {
            "company_name": "BioTech Innovations",
            "founder_name": "Dr. Sarah Kim",
            "sector": "Biotech",
            "location": "Cambridge, MA", 
            "ask_amount": 15000000,
            "pre_money_valuation": 60000000,
            "lead_source": "Accelerator",
            "description": "Novel drug discovery platform using AI"
        }
    ]
    
    scores = []
    
    for deal_data in test_deals:
        try:
            # Create deal
            response = requests.post(f"{BACKEND_URL}/deals", json=deal_data)
            if response.status_code == 200:
                result = response.json()
                deal_id = result.get('deal_id')
                
                if deal_id:
                    # Get scoring breakdown
                    score_response = requests.get(f"{BACKEND_URL}/analytics/deal-score/{deal_id}")
                    if score_response.status_code == 200:
                        score_data = score_response.json()
                        scores.append({
                            'company': deal_data['company_name'],
                            'score': score_data['overall_score'],
                            'breakdown': score_data['breakdown']
                        })
                        print(f"✅ {deal_data['company_name']}: Score {score_data['overall_score']}/100")
                        
                        # Print detailed breakdown
                        for factor, details in score_data['breakdown'].items():
                            print(f"   {factor}: {details['score']}/100 (weight: {details['weight']})")
                    else:
                        print(f"❌ Scoring failed for {deal_data['company_name']}")
            else:
                print(f"❌ Deal creation failed for {deal_data['company_name']}")
                
        except Exception as e:
            print(f"❌ Error testing {deal_data['company_name']}: {e}")
    
    # Test deterministic nature by running same deal twice
    if scores:
        print(f"\n🔄 Testing score consistency...")
        first_deal = test_deals[0]
        
        # Create same deal again
        response1 = requests.post(f"{BACKEND_URL}/deals", json=first_deal)
        response2 = requests.post(f"{BACKEND_URL}/deals", json=first_deal)
        
        if response1.status_code == 200 and response2.status_code == 200:
            deal_id1 = response1.json().get('deal_id')
            deal_id2 = response2.json().get('deal_id')
            
            score1_resp = requests.get(f"{BACKEND_URL}/analytics/deal-score/{deal_id1}")
            score2_resp = requests.get(f"{BACKEND_URL}/analytics/deal-score/{deal_id2}")
            
            if score1_resp.status_code == 200 and score2_resp.status_code == 200:
                score1 = score1_resp.json()['overall_score']
                score2 = score2_resp.json()['overall_score']
                
                if score1 == score2:
                    print(f"✅ Scoring is deterministic: {score1} = {score2}")
                else:
                    print(f"⚠️ Scoring inconsistency: {score1} ≠ {score2}")
    
    return len(scores) > 0

def run_scoring_test():
    """Run complete scoring test"""
    print("🚀 VERSSAI AI Deal Scoring Test")
    print("===============================")
    
    if test_deterministic_scoring():
        print("\n🎉 AI scoring system operational!")
    else:
        print("\n❌ AI scoring system needs attention")

if __name__ == "__main__":
    run_scoring_test()
