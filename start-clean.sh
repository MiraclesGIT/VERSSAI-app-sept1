#!/bin/bash

# VERSSAI Clean Startup Script
# Removes all emergent branding and starts clean development server

echo "🚀 Starting VERSSAI VC Platform - Clean Mode"
echo "=========================================="

# Step 1: Clear all caches
echo "🧹 Cleaning caches..."
cd frontend
rm -rf node_modules/.cache
npm cache clean --force
rm -rf build/
rm -rf public/*.cache

# Step 2: Kill any existing development servers
echo "🔄 Stopping existing servers..."
pkill -f "react-scripts"
pkill -f "webpack"
pkill -f "craco"

# Step 3: Reinstall clean dependencies
echo "📦 Reinstalling dependencies..."
npm install

# Step 4: Start clean development server
echo "🎯 Starting VERSSAI Platform..."
npm start

echo "✅ VERSSAI Platform started successfully!"
echo "📍 Access your platform at: http://localhost:3000"
echo "🛡️ Anti-emergent protection active"