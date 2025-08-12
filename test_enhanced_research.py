#!/usr/bin/env python3
"""
Enhanced Research API Testing for VERSSAI VC Intelligence Platform
Tests Google Search & Twitter API integration for enhanced founder research
"""

import sys
import os
sys.path.append('/app')

from backend_test import VERSSAIAIBackendTester

def main():
    """Run enhanced research API tests"""
    tester = VERSSAIAIBackendTester()
    
    print("🔍 STARTING ENHANCED RESEARCH API TESTING")
    print("=" * 80)
    print("Testing VERSSAI VC Intelligence Platform with Google Search & Twitter API Integration")
    print("Focus: Enhanced Founder Research, Company Intelligence, Social Signals")
    print("=" * 80)
    print()
    
    # Run enhanced research API tests
    tester.run_enhanced_research_api_tests()

if __name__ == "__main__":
    main()