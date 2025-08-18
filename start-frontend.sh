#!/bin/bash

# VERSSAI Frontend Startup Script
echo "🚀 Starting VERSSAI Enhanced Frontend..."

# Navigate to frontend directory
cd frontend

# Install new dependencies
echo "📦 Installing dependencies..."
npm install

# Start the development server
echo "🌟 Starting development server..."
echo "Frontend will be available at: http://localhost:3000"
echo "Backend should be running at: http://localhost:8080"
echo "N8N should be running at: http://localhost:5678"
echo ""
echo "✨ Features Available:"
echo "  - Linear VC Workflow Interface"
echo "  - Real-time MCP+N8N Integration"
echo "  - Analytics Dashboard with Real Data"
echo "  - SuperAdmin Controls"
echo ""

npm start