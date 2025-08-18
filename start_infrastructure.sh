#!/bin/bash
# VERSSAI Platform Startup Script
# Comprehensive startup for all services

echo "🚀 VERSSAI VC Intelligence Platform Startup"
echo "============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Start infrastructure services
echo ""
echo "🔧 Starting Infrastructure Services..."
echo "--------------------------------------"

echo "📊 Starting PostgreSQL, ChromaDB, Redis, Neo4j, N8N..."
docker-compose up -d postgres chromadb redis neo4j n8n

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking Service Health..."
echo "----------------------------"

# PostgreSQL
if docker-compose ps postgres | grep -q "Up"; then
    echo "✅ PostgreSQL: Running (Port 5432)"
else
    echo "❌ PostgreSQL: Failed to start"
fi

# ChromaDB
if docker-compose ps chromadb | grep -q "Up"; then
    echo "✅ ChromaDB: Running (Port 8000)"
else
    echo "❌ ChromaDB: Failed to start"
fi

# Redis
if docker-compose ps redis | grep -q "Up"; then
    echo "✅ Redis: Running (Port 6379)"
else
    echo "❌ Redis: Failed to start"
fi

# Neo4j
if docker-compose ps neo4j | grep -q "Up"; then
    echo "✅ Neo4j: Running (Port 7474/7687)"
else
    echo "❌ Neo4j: Failed to start"
fi

# N8N
if docker-compose ps n8n | grep -q "Up"; then
    echo "✅ N8N: Running (Port 5678)"
    echo "   🔗 Access N8N: http://localhost:5678"
    echo "   👤 Username: verssai_admin"
    echo "   🔑 Password: verssai_n8n_2024"
else
    echo "❌ N8N: Failed to start"
fi

echo ""
echo "🎯 Infrastructure Services Ready!"
echo ""
echo "📋 Next Steps:"
echo "1. Start backend: cd backend && python3 enhanced_mcp_backend.py"
echo "2. Start frontend: cd frontend && npm start"
echo ""
echo "🔗 Service URLs:"
echo "   🏢 Main API: http://localhost:8080"
echo "   🔌 WebSocket: ws://localhost:8080/mcp"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🛠️  N8N Workflows: http://localhost:5678"
echo "   📊 ChromaDB: http://localhost:8000"
echo ""
echo "🎉 Ready to start VERSSAI Backend!"
