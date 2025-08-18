#!/usr/bin/env python3
"""
VERSSAI Enhanced MCP Backend Startup Script
Comprehensive startup with health checks and monitoring
"""

import asyncio
import sys
import os
import json
import subprocess
from datetime import datetime
from pathlib import Path

# Add backend to path
sys.path.append('./backend')

async def check_dependencies():
    """Check all required dependencies"""
    print("🔍 Checking Dependencies...")
    print("-" * 30)
    
    dependencies = [
        'fastapi', 'uvicorn', 'aiohttp', 'pandas', 
        'numpy', 'sklearn', 'networkx', 'websockets'
    ]
    
    missing = []
    for dep in dependencies:
        try:
            __import__(dep)
            print(f"   ✅ {dep}")
        except ImportError:
            print(f"   ❌ {dep}")
            missing.append(dep)
    
    if missing:
        print(f"\n❌ Missing dependencies: {missing}")
        print("💡 Install with: pip install " + " ".join(missing))
        return False
    
    print("✅ All dependencies available")
    return True

async def check_infrastructure():
    """Check infrastructure services"""
    print("\n🏗️ Checking Infrastructure Services...")
    print("-" * 40)
    
    import aiohttp
    
    services = {
        'PostgreSQL': 'http://localhost:5432',
        'ChromaDB': 'http://localhost:8000/api/v1/heartbeat',
        'N8N': 'http://localhost:5678/healthz'
    }
    
    all_ready = True
    
    for service, url in services.items():
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=3)) as response:
                    if response.status < 400:
                        print(f"   ✅ {service}: Ready")
                    else:
                        print(f"   ⚠️  {service}: Responding but not healthy")
                        all_ready = False
        except Exception as e:
            print(f"   ❌ {service}: Not accessible")
            all_ready = False
    
    return all_ready

async def initialize_rag_engine():
    """Initialize and test RAG engine"""
    print("\n🧠 Initializing RAG/GRAPH Engine...")
    print("-" * 35)
    
    try:
        from enhanced_rag_graph_engine import VERSSAIRAGGraphEngine
        
        dataset_path = "./backend/uploads/VERSSAI_Massive_Dataset_Complete.xlsx"
        
        if not os.path.exists(dataset_path):
            print(f"   ❌ Dataset not found: {dataset_path}")
            return None
        
        print(f"   ✅ Dataset found: {dataset_path}")
        
        engine = VERSSAIRAGGraphEngine(dataset_path=dataset_path)
        print("   🔄 Initializing layers...")
        
        result = await engine.initialize_layers()
        
        print(f"   ✅ Initialization: {result['status']}")
        print(f"   📊 Layers: {result['layers_initialized']}")
        
        for layer_name, stats in result['layer_stats'].items():
            print(f"      🔗 {layer_name}: {stats['nodes']} nodes, {stats['edges']} edges")
        
        # Quick test query
        test_result = await engine.query_multi_layer("AI startup founder")
        total_matches = sum(len(layer.get('matches', [])) for layer in test_result['layers'].values())
        print(f"   🔍 Test query: {total_matches} matches across layers")
        
        return engine
        
    except Exception as e:
        print(f"   ❌ RAG Engine failed: {e}")
        return None

async def start_enhanced_backend(rag_engine=None):
    """Start the enhanced MCP backend"""
    print("\n🚀 Starting Enhanced MCP Backend...")
    print("-" * 35)
    
    try:
        from enhanced_mcp_backend import app, enhanced_mcp_manager
        import uvicorn
        
        # Pre-initialize RAG if available
        if rag_engine:
            enhanced_mcp_manager.rag_engine = rag_engine
            enhanced_mcp_manager.rag_initialized = True
            print("   ✅ RAG Engine pre-initialized")
        
        print("   🔧 Starting FastAPI server...")
        print("   📡 API: http://localhost:8080")
        print("   🔌 WebSocket: ws://localhost:8080/mcp")
        print("")
        print("   🎯 Available Endpoints:")
        print("      📊 Health: http://localhost:8080/health")
        print("      🧠 RAG Status: http://localhost:8080/api/rag/status")
        print("      🔗 MCP Status: http://localhost:8080/api/mcp/status")
        print("")
        print("   ⚡ 6 VC Workflows Ready:")
        for wf_id, config in enhanced_mcp_manager.workflow_templates.items():
            print(f"      - {config['name']}")
        print("")
        
        # Start the server
        config = uvicorn.Config(
            app,
            host="0.0.0.0",
            port=8080,
            log_level="info",
            access_log=True
        )
        server = uvicorn.Server(config)
        await server.serve()
        
    except Exception as e:
        print(f"   ❌ Backend startup failed: {e}")
        return False

async def main():
    """Main startup sequence"""
    print("🚀 VERSSAI Enhanced MCP Backend Startup")
    print("=" * 45)
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("")
    
    # 1. Check dependencies
    if not await check_dependencies():
        return
    
    # 2. Check infrastructure (optional, continue even if not all ready)
    infrastructure_ready = await check_infrastructure()
    if not infrastructure_ready:
        print("\n⚠️  Some infrastructure services not ready")
        print("💡 Run: ./start_infrastructure.sh")
        print("🔄 Continuing with backend startup...")
    
    # 3. Initialize RAG engine
    rag_engine = await initialize_rag_engine()
    if not rag_engine:
        print("\n⚠️  RAG Engine failed to initialize")
        print("🔄 Starting backend without RAG...")
    
    # 4. Start backend
    print("\n" + "="*50)
    print("🎉 VERSSAI Backend Starting...")
    print("="*50)
    
    await start_enhanced_backend(rag_engine)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n👋 VERSSAI Backend shutdown requested")
        print("✅ Goodbye!")
