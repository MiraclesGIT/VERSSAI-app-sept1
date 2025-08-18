#!/usr/bin/env python3
"""
Test VERSSAI Enhanced Platform with Academic Intelligence
"""

import sys
import os
import asyncio
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

async def test_enhanced_verssai():
    """Test all enhanced VERSSAI features"""
    
    print("🚀 Testing VERSSAI Enhanced Platform with Academic Intelligence")
    print("=" * 70)
    
    try:
        from enhanced_verssai_backend import (
            get_deals, get_academic_stats, validate_founder, 
            get_research_insights, get_deal_academic_analysis,
            get_enhanced_dashboard
        )
        
        # Test 1: Basic deals endpoint
        print("\n📊 Testing VC Deal Pipeline...")
        deals_result = await get_deals()
        print(f"✅ Found {len(deals_result['data'])} deals in pipeline")
        for deal in deals_result['data']:
            print(f"  - {deal['company_name']} ({deal['stage']}) - ${deal['valuation']:,}")
        
        # Test 2: Academic stats
        print("\n🎓 Testing Academic Intelligence Platform...")
        academic_stats = await get_academic_stats()
        stats = academic_stats['data']
        print(f"✅ Academic Intelligence Loaded:")
        print(f"  - Academic Papers: {int(stats['Total_References']):,}")
        print(f"  - Expert Researchers: {int(stats['Total_Researchers']):,}")
        print(f"  - Research Citations: {int(stats['Total_Citations']):,}")
        print(f"  - Statistical Significance: {stats['Statistical_Significance_Rate']*100:.1f}%")
        
        # Test 3: Founder validation
        print("\n👤 Testing Founder Academic Validation...")
        founder_result = await validate_founder("Emily Williams")
        founder_data = founder_result['data']
        print(f"✅ Founder Validation Results:")
        print(f"  - Found in Academic Database: {founder_data['found_in_database']}")
        if founder_data['found_in_database']:
            profile = founder_data['researcher_profile']
            print(f"  - Name: {profile['name']}")
            print(f"  - Institution: {profile['institution']}")
            print(f"  - h-index: {profile['h_index']}")
            print(f"  - Industry Experience: {profile['industry_experience']}")
            print(f"  - Academic Credibility Score: {founder_data['academic_credibility']:.1f}%")
        
        # Test 4: Research insights
        print("\n🔬 Testing Market Research Intelligence...")
        research_result = await get_research_insights("artificial intelligence")
        research_data = research_result['data']
        print(f"✅ Research Insights for 'Artificial Intelligence':")
        print(f"  - Relevant Research Categories: {len(research_data['relevant_categories'])}")
        print(f"  - Research Papers Found: {len(research_data['relevant_papers'])}")
        print(f"  - Research Strength Score: {research_data['research_strength']}/100")
        print(f"  - Analysis Confidence: {research_data['confidence']}%")
        
        # Test 5: Enhanced deal analysis (the killer feature!)
        print("\n🎯 Testing Enhanced Deal Analysis with Academic Intelligence...")
        deal_analysis = await get_deal_academic_analysis("deal-001")
        analysis_data = deal_analysis['data']
        print(f"✅ Complete Academic Analysis for '{analysis_data['company_name']}':")
        
        intelligence = analysis_data['academic_intelligence']
        print(f"  - Overall Academic Confidence Score: {intelligence['overall_academic_score']:.1f}%")
        print(f"  - Expert Advisor Candidates: {len(intelligence['expert_recommendations'])}")
        print(f"  - Academic Recommendations:")
        for i, rec in enumerate(intelligence['recommendations'], 1):
            print(f"    {i}. {rec}")
        
        if intelligence['expert_recommendations']:
            print(f"  - Top Academic Advisor Candidate:")
            top_expert = intelligence['expert_recommendations'][0]
            print(f"    • {top_expert['name']} ({top_expert['institution']})")
            print(f"    • h-index: {top_expert['h_index']}, Citations: {top_expert['citations']:,}")
            print(f"    • Field: {top_expert['field']}")
        
        # Test 6: Enhanced dashboard
        print("\n📈 Testing Complete Platform Dashboard...")
        dashboard_result = await get_enhanced_dashboard()
        dashboard_data = dashboard_result['data']
        
        print(f"✅ VERSSAI Enhanced Platform Dashboard:")
        vc_metrics = dashboard_data['vc_platform']
        academic_metrics = dashboard_data['academic_intelligence']
        
        print(f"\n   📊 VC Platform Metrics:")
        print(f"     - Active Deals: {vc_metrics['total_deals']}")
        print(f"     - Total Pipeline Valuation: ${vc_metrics['total_valuation']:,}")
        print(f"     - Deal Stages: {', '.join(f'{k}: {v}' for k, v in vc_metrics['deal_stages'].items())}")
        print(f"     - Industries: {', '.join(f'{k}: {v}' for k, v in vc_metrics['industries'].items())}")
        
        print(f"\n   🎓 Academic Intelligence Metrics:")
        print(f"     - Research Papers: {academic_metrics.get('total_papers', 'N/A'):,}")
        print(f"     - Expert Network: {academic_metrics.get('total_researchers', 'N/A'):,} researchers")
        print(f"     - Citation Network: {academic_metrics.get('total_citations', 'N/A'):,} citations")
        print(f"     - Research Quality Score: {academic_metrics.get('research_quality', 0):.1f}%")
        
        print(f"\n   🔗 Integration Status: {dashboard_data['integration_status'].upper()}")
        print(f"\n   ✨ Enhanced Features Available:")
        for feature in dashboard_data['enhanced_features']:
            print(f"     ✅ {feature}")
        
        print(f"\n" + "=" * 70)
        print(f"🎉 VERSSAI ENHANCED PLATFORM TEST COMPLETED SUCCESSFULLY!")
        print(f"🚀 Your VC platform now has AI-powered academic intelligence!")
        
        print(f"\n💡 IMMEDIATE USE CASES:")
        print(f"1. Validate founder credentials against 2,311 academic researchers")
        print(f"2. Get research-backed market insights from 1,157 papers")
        print(f"3. Find academic advisors from top-tier institutions")
        print(f"4. Support investment decisions with academic citations")
        print(f"5. Enhance LP reports with institutional credibility")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing enhanced platform: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_enhanced_verssai())
    
    if success:
        print(f"\n🎯 NEXT STEPS:")
        print(f"1. Start the enhanced backend: python backend/enhanced_verssai_backend.py")
        print(f"2. Update your frontend to use the new academic endpoints")
        print(f"3. Demo the enhanced features to your team")
        print(f"4. Download the full Excel dataset for complete functionality")
        
        print(f"\n📞 READY FOR DEMO:")
        print(f"Your VERSSAI platform combines practical VC operations")
        print(f"with the rigor of academic research - perfect for LPs!")
    else:
        print(f"\n❌ Setup incomplete. Please resolve errors and try again.")
