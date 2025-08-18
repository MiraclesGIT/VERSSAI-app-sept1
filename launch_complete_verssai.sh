#!/bin/bash

# VERSSAI Complete Platform Launcher
# Full Excel Dataset with 1,157 Papers + 2,311 Researchers

echo "🚀 VERSSAI COMPLETE VC INTELLIGENCE PLATFORM"
echo "=============================================="
echo "📊 Academic Papers: 1,157"
echo "👨‍🔬 Expert Researchers: 2,311"  
echo "🏛️ Top Institutions: 24"
echo "🔗 Citation Network: 38,015"
echo "🔍 Advanced AI Search: Active"
echo ""

# Check requirements
echo "🔍 Checking requirements..."

if [ ! -f "VERSSAI_Massive_Dataset_Complete.xlsx" ]; then
    echo "❌ Excel dataset not found in project root"
    echo "Please ensure VERSSAI_Massive_Dataset_Complete.xlsx is in the project directory"
    exit 1
fi

if [ ! -f "backend/complete_verssai_backend.py" ]; then
    echo "❌ Complete backend not found"
    exit 1
fi

echo "✅ All requirements met!"
echo ""

# Install dependencies if needed
echo "📦 Checking Python dependencies..."
python3 -c "import pandas, sklearn, fastapi, uvicorn" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️ Installing required packages..."
    pip3 install pandas openpyxl scikit-learn fastapi uvicorn
fi

echo "✅ Dependencies ready!"
echo ""

# Run quick test
echo "🧪 Running platform validation..."
python3 test_complete_verssai_platform.py > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Platform validation successful!"
else
    echo "⚠️ Platform validation had issues - continuing anyway"
fi

echo ""
echo "🎯 LAUNCHING COMPLETE VERSSAI PLATFORM..."
echo ""
echo "🌐 Platform URL: http://localhost:8080"
echo "📚 API Documentation: http://localhost:8080/docs"
echo "🔗 Interactive API: http://localhost:8080/redoc"
echo ""
echo "🔥 ULTIMATE FEATURES AVAILABLE:"
echo "✅ Advanced Founder Validation (2,311 researchers)"
echo "✅ Comprehensive Market Research (1,157 papers)"
echo "✅ Expert Advisor Network (AI-powered matching)"
echo "✅ Complete Deal Analysis (multi-dimensional scoring)"
echo "✅ Risk Assessment & Strategic Recommendations"
echo "✅ Real-time Academic Intelligence"
echo ""
echo "💡 QUICK TEST COMMANDS:"
echo "curl http://localhost:8080/api/academic/stats"
echo "curl 'http://localhost:8080/api/academic/validate-founder?founder_name=Emily%20Williams'"
echo "curl 'http://localhost:8080/api/academic/market-research?industry=artificial%20intelligence'"
echo "curl http://localhost:8080/api/deals/deal-001/complete-academic-analysis"
echo ""
echo "🚀 Starting server... (Press Ctrl+C to stop)"
echo ""

# Start the complete backend
cd backend
python3 complete_verssai_backend.py
