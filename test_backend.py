#!/usr/bin/env python3
"""
Quick test of VERSSAI Enhanced MCP Backend components
"""

import asyncio
import sys
import os
sys.path.append('./backend')

async def test_rag_engine():
    """Test the RAG engine initialization"""
    print("🧠 Testing RAG/GRAPH Engine...")
    
    try:
        from enhanced_rag_graph_engine import VERSSAIRAGGraphEngine
        
        engine = VERSSAIRAGGraphEngine()
        print("   ✓ RAG Engine created")
        
        # Test dataset loading
        dataset_path = "./backend/uploads/VERSSAI_Massive_Dataset_Complete.xlsx"
        if os.path.exists(dataset_path):
            print(f"   ✓ Dataset found: {dataset_path}")
            
            # Initialize layers (this will test the full pipeline)
            print("   🔄 Initializing layers...")
            result = await engine.initialize_layers()
            print(f"   ✅ RAG Engine initialization: {result['status']}")
            print(f"   📊 Layers: {result['layers_initialized']}")
            
            # Test a simple query
            print("   🔍 Testing query...")
            query_result = await engine.query_multi_layer("machine learning startup")
            print(f"   ✅ Query test: {len(query_result['layers'])} layers queried")
            
            return True
        else:
            print(f"   ❌ Dataset not found: {dataset_path}")
            return False
            
    except Exception as e:
        print(f"   ❌ RAG Engine test failed: {e}")
        return False

async def test_mcp_manager():
    """Test the MCP manager components"""
    print("\n🔌 Testing MCP Manager...")
    
    try:
        from enhanced_mcp_backend import EnhancedMCPWorkflowManager
        
        manager = EnhancedMCPWorkflowManager()
        print("   ✓ MCP Manager created")
        print(f"   ✓ Available workflows: {len(manager.workflow_templates)}")
        
        # List workflow templates
        for wf_id, config in manager.workflow_templates.items():
            print(f"      - {wf_id}: {config['name']}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ MCP Manager test failed: {e}")
        return False

async def test_fastapi_imports():
    """Test FastAPI and related imports"""
    print("\n🚀 Testing FastAPI Components...")
    
    try:
        import fastapi
        import uvicorn
        import aiohttp
        print("   ✓ FastAPI imports successful")
        
        # Test basic app creation
        from fastapi import FastAPI
        app = FastAPI(title="Test")
        print("   ✓ FastAPI app creation successful")
        
        return True
        
    except Exception as e:
        print(f"   ❌ FastAPI test failed: {e}")
        return False

async def main():
    """Run all tests"""
    print("🔬 VERSSAI Backend Component Tests")
    print("=" * 50)
    
    results = []
    
    # Test FastAPI components first
    results.append(await test_fastapi_imports())
    
    # Test MCP Manager
    results.append(await test_mcp_manager())
    
    # Test RAG Engine (most complex)
    results.append(await test_rag_engine())
    
    print("\n📋 Test Summary:")
    print("=" * 30)
    if all(results):
        print("✅ All tests passed!")
        print("🚀 Backend is ready to start")
    else:
        print("❌ Some tests failed")
        print("🔧 Check the errors above")
    
    return all(results)

if __name__ == "__main__":
    asyncio.run(main())
