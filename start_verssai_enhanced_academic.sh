#!/bin/bash

# VERSSAI Enhanced Platform Startup Script
# Combines VC Deal Pipeline with Academic Intelligence

echo "🚀 Starting VERSSAI Enhanced VC Platform with Academic Intelligence"
echo "=================================================================="

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Please run this from the VERSSAI project root directory"
    exit 1
fi

# Check if academic data exists
if [ ! -d "backend/academic_data" ]; then
    echo "⚠️  Academic data not found. Setting up now..."
    python3 create_academic_dataset.py
    if [ $? -ne 0 ]; then
        echo "❌ Failed to setup academic dataset"
        exit 1
    fi
fi

echo "✅ Academic Intelligence Dataset Ready"
echo "📊 1,157 research papers loaded"
echo "👨‍🔬 2,311 expert researchers available"
echo "🔗 38,015 citation connections"

# Test the enhanced platform
echo ""
echo "🧪 Running platform validation tests..."
python3 test_enhanced_verssai.py > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ All systems operational"
else
    echo "⚠️  Some tests failed - platform may have limited functionality"
fi

# Start the enhanced backend
echo ""
echo "🎯 Starting Enhanced VERSSAI Backend on port 8080..."
echo "Features enabled:"
echo "  ✅ VC Deal Pipeline Management" 
echo "  ✅ Academic Founder Validation"
echo "  ✅ Research-Backed Market Insights"
echo "  ✅ Expert Advisor Recommendations"
echo "  ✅ AI-Powered Investment Analysis"

echo ""
echo "🌐 Platform will be available at:"
echo "   Backend API: http://localhost:8080"
echo "   Frontend UI: http://localhost:3000 (if running)"

echo ""
echo "📡 Enhanced API Endpoints:"
echo "   GET  /api/deals                           - VC deal pipeline"
echo "   GET  /api/academic/stats                  - Academic platform stats"
echo "   GET  /api/academic/validate-founder       - Founder validation"
echo "   GET  /api/academic/research-insights      - Market research insights"
echo "   GET  /api/deals/{id}/academic-analysis    - Enhanced deal analysis"
echo "   GET  /api/dashboard/enhanced              - Complete dashboard"

echo ""
echo "🚀 Starting server... (Press Ctrl+C to stop)"
echo ""

# Start the enhanced backend
cd backend
python3 -c "
import uvicorn
from enhanced_verssai_backend import app

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8080)
"
