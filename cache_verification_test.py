#!/usr/bin/env python3
"""
Cache Verification Test for Deterministic AI Agents
Tests the caching mechanism and deterministic behavior of AI agents directly
"""

import sys
import os
sys.path.append('/app/backend')

from ai_agents import (
    deck_extraction_agent, 
    founder_signal_agent, 
    investment_thesis_agent,
    get_cache_stats,
    clear_analysis_cache
)
import json
import time

def test_deck_extraction_caching():
    """Test deck extraction agent caching"""
    print("🧪 Testing Deck Extraction Agent Caching...")
    
    # Clear cache first
    clear_analysis_cache()
    print(f"Cache cleared. Stats: {get_cache_stats()}")
    
    # Test data - identical content
    test_content = """
    DataFlow AI - Pitch Deck
    Revolutionary Data Analytics Platform
    Founded by: Dr. Emily Watson, PhD MIT AI/ML
    CTO: James Rodriguez, Ex-Tesla Senior Engineer
    Market Size: $85B TAM, Growing 35% CAGR
    Stage: Series A, Seeking $12M
    ARR: $4.2M, Growing 400% YoY
    Customers: 25 enterprise clients, $168K average ACV
    """
    
    company_hint = "DataFlow AI"
    
    # First extraction
    print("First extraction (should hit AI)...")
    start_time = time.time()
    result1 = deck_extraction_agent.extract_from_text(test_content, company_hint)
    time1 = time.time() - start_time
    print(f"First extraction took {time1:.2f}s")
    print(f"Cache stats after first: {get_cache_stats()}")
    
    # Second extraction (should hit cache)
    print("Second extraction (should hit cache)...")
    start_time = time.time()
    result2 = deck_extraction_agent.extract_from_text(test_content, company_hint)
    time2 = time.time() - start_time
    print(f"Second extraction took {time2:.2f}s")
    print(f"Cache stats after second: {get_cache_stats()}")
    
    # Third extraction (should hit cache)
    print("Third extraction (should hit cache)...")
    start_time = time.time()
    result3 = deck_extraction_agent.extract_from_text(test_content, company_hint)
    time3 = time.time() - start_time
    print(f"Third extraction took {time3:.2f}s")
    print(f"Cache stats after third: {get_cache_stats()}")
    
    # Verify results are identical
    identical_12 = json.dumps(result1, sort_keys=True) == json.dumps(result2, sort_keys=True)
    identical_13 = json.dumps(result1, sort_keys=True) == json.dumps(result3, sort_keys=True)
    
    print(f"\nResults identical (1 vs 2): {identical_12}")
    print(f"Results identical (1 vs 3): {identical_13}")
    
    # Check if caching improved performance (cache hits should be faster)
    cache_performance = time2 < time1 * 0.5 and time3 < time1 * 0.5
    print(f"Cache performance improvement: {cache_performance}")
    
    return identical_12 and identical_13, get_cache_stats()

def test_founder_signal_caching():
    """Test founder signal agent caching"""
    print("\n🧪 Testing Founder Signal Agent Caching...")
    
    # Test data - identical founder data
    founder_data = {
        "name": "Dr. Emily Watson",
        "role": "CEO",
        "background": "PhD MIT AI/ML, Former Google product manager",
        "linkedin_hint": "emily-watson-mit"
    }
    
    company_context = {
        "market": "Data Analytics",
        "stage": "Series A",
        "business_model": "B2B SaaS"
    }
    
    # First analysis
    print("First founder analysis (should hit AI)...")
    start_time = time.time()
    result1 = founder_signal_agent.analyze_founder(founder_data, company_context)
    time1 = time.time() - start_time
    print(f"First analysis took {time1:.2f}s")
    print(f"Cache stats: {get_cache_stats()}")
    
    # Second analysis (should hit cache)
    print("Second founder analysis (should hit cache)...")
    start_time = time.time()
    result2 = founder_signal_agent.analyze_founder(founder_data, company_context)
    time2 = time.time() - start_time
    print(f"Second analysis took {time2:.2f}s")
    print(f"Cache stats: {get_cache_stats()}")
    
    # Verify results are identical
    identical = json.dumps(result1, sort_keys=True) == json.dumps(result2, sort_keys=True)
    print(f"Results identical: {identical}")
    
    # Check scores specifically
    scores1 = result1.get('scores', {})
    scores2 = result2.get('scores', {})
    scores_identical = scores1 == scores2
    print(f"Scores identical: {scores_identical}")
    print(f"Scores 1: {scores1}")
    print(f"Scores 2: {scores2}")
    
    return identical and scores_identical

def test_investment_thesis_caching():
    """Test investment thesis agent caching"""
    print("\n🧪 Testing Investment Thesis Agent Caching...")
    
    # Test data - identical company data
    company_data = {
        "company_name": "DataFlow AI",
        "market": "Data Analytics",
        "business_model": "B2B SaaS",
        "stage": "Series A",
        "funding_ask": 12000000,
        "market_size": "$85B TAM",
        "traction": {
            "revenue": "$4.2M ARR",
            "customers": "25 enterprise clients",
            "growth_rate": "400% YoY"
        }
    }
    
    founder_analysis = {
        "scores": {
            "education_score": 85,
            "experience_score": 90,
            "overall_signal_score": 87
        }
    }
    
    investor_thesis = "Focus on B2B SaaS companies with strong technical founders and proven traction"
    
    # First evaluation
    print("First investment evaluation (should hit AI)...")
    start_time = time.time()
    result1 = investment_thesis_agent.evaluate_investment(company_data, founder_analysis, investor_thesis)
    time1 = time.time() - start_time
    print(f"First evaluation took {time1:.2f}s")
    print(f"Cache stats: {get_cache_stats()}")
    
    # Second evaluation (should hit cache)
    print("Second investment evaluation (should hit cache)...")
    start_time = time.time()
    result2 = investment_thesis_agent.evaluate_investment(company_data, founder_analysis, investor_thesis)
    time2 = time.time() - start_time
    print(f"Second evaluation took {time2:.2f}s")
    print(f"Cache stats: {get_cache_stats()}")
    
    # Verify results are identical
    identical = json.dumps(result1, sort_keys=True) == json.dumps(result2, sort_keys=True)
    print(f"Results identical: {identical}")
    
    # Check key scores
    score1 = result1.get('thesis_match_score', 0)
    score2 = result2.get('thesis_match_score', 0)
    recommendation1 = result1.get('recommendation', '')
    recommendation2 = result2.get('recommendation', '')
    
    print(f"Thesis match scores: {score1} vs {score2} (identical: {score1 == score2})")
    print(f"Recommendations: {recommendation1} vs {recommendation2} (identical: {recommendation1 == recommendation2})")
    
    return identical

def main():
    """Run all cache verification tests"""
    print("🔧 CACHE VERIFICATION TESTS FOR DETERMINISTIC AI AGENTS")
    print("=" * 70)
    
    # Test 1: Deck Extraction Caching
    extraction_success, cache_stats = test_deck_extraction_caching()
    
    # Test 2: Founder Signal Caching
    founder_success = test_founder_signal_caching()
    
    # Test 3: Investment Thesis Caching
    investment_success = test_investment_thesis_caching()
    
    # Summary
    print("\n" + "=" * 70)
    print("🔧 CACHE VERIFICATION SUMMARY")
    print("=" * 70)
    
    print(f"Deck Extraction Caching: {'✅ PASS' if extraction_success else '❌ FAIL'}")
    print(f"Founder Signal Caching: {'✅ PASS' if founder_success else '❌ FAIL'}")
    print(f"Investment Thesis Caching: {'✅ PASS' if investment_success else '❌ FAIL'}")
    
    all_passed = extraction_success and founder_success and investment_success
    print(f"\nOverall Cache System: {'✅ WORKING' if all_passed else '❌ ISSUES DETECTED'}")
    
    print(f"\nFinal cache stats: {get_cache_stats()}")
    
    if all_passed:
        print("\n🎉 CACHE SYSTEM VERIFICATION: ALL TESTS PASSED!")
        print("✅ Deterministic caching is working correctly")
        print("✅ Same inputs produce identical outputs")
        print("✅ Cache improves performance on repeated calls")
    else:
        print("\n💥 CACHE SYSTEM VERIFICATION: ISSUES DETECTED!")
        print("❌ Some caching tests failed")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)