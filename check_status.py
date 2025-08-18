#!/usr/bin/env python3
"""
VERSSAI Platform Status Checker
Comprehensive health check for all components
"""

import asyncio
import aiohttp
import json
import sys
import os
from datetime import datetime

async def check_api_endpoint(url: str, name: str, timeout: int = 3):
    """Check if an API endpoint is responding"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=timeout)) as response:
                if response.status == 200:
                    data = await response.json()
                    return True, data
                else:
                    return False, f"HTTP {response.status}"
    except Exception as e:
        return False, str(e)

async def check_websocket(url: str, name: str):
    """Check WebSocket connection"""
    try:
        import websockets
        async with websockets.connect(url, timeout=3) as websocket:
            # Send ping
            await websocket.send(json.dumps({"type": "ping"}))
            response = await asyncio.wait_for(websocket.recv(), timeout=3)
            data = json.loads(response)
            if data.get("type") == "pong":
                return True, "WebSocket responding"
            else:
                return True, "Connected but unexpected response"
    except Exception as e:
        return False, str(e)

async def main():
    """Run comprehensive status check"""
    print("🔬 VERSSAI Platform Status Check")
    print("=" * 40)
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("")
    
    # 1. Infrastructure Services
    print("🏗️ Infrastructure Services")
    print("-" * 25)
    
    infrastructure = [
        ("PostgreSQL", "http://localhost:5432", "Database"),
        ("ChromaDB", "http://localhost:8000/api/v1/heartbeat", "Vector Store"),
        ("N8N", "http://localhost:5678/healthz", "Workflow Engine"),
        ("Redis", "http://localhost:6379", "Cache"),
        ("Neo4j", "http://localhost:7474", "Graph DB")
    ]
    
    infra_status = {}
    for name, url, description in infrastructure:
        status, result = await check_api_endpoint(url, name, timeout=2)
        status_icon = "✅" if status else "❌"
        print(f"   {status_icon} {name:12} ({description})")
        if not status:
            print(f"      📝 {result}")
        infra_status[name.lower()] = status
    
    # 2. VERSSAI Backend API
    print("\n🚀 VERSSAI Backend API")
    print("-" * 20)
    
    backend_endpoints = [
        ("Health Check", "http://localhost:8080/health"),
        ("Root Endpoint", "http://localhost:8080/"),
        ("RAG Status", "http://localhost:8080/api/rag/status"),
        ("MCP Status", "http://localhost:8080/api/mcp/status")
    ]
    
    backend_healthy = True
    backend_data = {}
    
    for name, url in backend_endpoints:
        status, result = await check_api_endpoint(url, name)
        status_icon = "✅" if status else "❌"
        print(f"   {status_icon} {name}")
        
        if status and isinstance(result, dict):
            backend_data[name] = result
            # Show key info
            if name == "Health Check":
                services = result.get('services', {})
                for service, status_val in services.items():
                    service_icon = "✅" if status_val == "running" or status_val == "ready" else "⚠️"
                    print(f"      {service_icon} {service}: {status_val}")
            elif name == "RAG Status":
                rag_status = result.get('status', 'unknown')
                rag_icon = "✅" if rag_status == "ready" else "🔄" if rag_status == "initializing" else "❌"
                print(f"      {rag_icon} RAG Engine: {rag_status}")
                if 'layers' in result:
                    for layer, stats in result['layers'].items():
                        print(f"         🔗 {layer}: {stats.get('total_nodes', 0)} nodes")
            elif name == "MCP Status":
                connections = result.get('active_connections', 0)
                workflows = result.get('available_workflows', 0)
                print(f"      🔌 Connections: {connections}")
                print(f"      ⚡ Workflows: {workflows}")
        else:
            backend_healthy = False
            if not status:
                print(f"      📝 Error: {result}")
    
    # 3. WebSocket Connection
    print("\n🔌 WebSocket Connections")
    print("-" * 22)
    
    websocket_endpoints = [
        ("MCP Protocol", "ws://localhost:8080/mcp")
    ]
    
    for name, url in websocket_endpoints:
        status, result = await check_websocket(url, name)
        status_icon = "✅" if status else "❌"
        print(f"   {status_icon} {name}")
        if not status:
            print(f"      📝 {result}")
    
    # 4. File System Checks
    print("\n📁 File System")
    print("-" * 13)
    
    important_files = [
        ("Dataset", "./backend/uploads/VERSSAI_Massive_Dataset_Complete.xlsx"),
        ("Docker Compose", "./docker-compose.yml"),
        ("Backend Config", "./backend/.env" if os.path.exists("./backend/.env") else "./.env"),
        ("Frontend Package", "./frontend/package.json")
    ]
    
    for name, path in important_files:
        exists = os.path.exists(path)
        status_icon = "✅" if exists else "❌"
        print(f"   {status_icon} {name}: {path}")
        if exists:
            size = os.path.getsize(path) if os.path.isfile(path) else "directory"
            if isinstance(size, int):
                if size > 1024*1024:
                    size_str = f"{size/(1024*1024):.1f} MB"
                elif size > 1024:
                    size_str = f"{size/1024:.1f} KB"
                else:
                    size_str = f"{size} bytes"
                print(f"      📊 Size: {size_str}")
    
    # 5. Summary
    print("\n📋 Status Summary")
    print("-" * 15)
    
    total_infra = len(infrastructure)
    healthy_infra = sum(1 for status in infra_status.values() if status)
    
    print(f"   🏗️  Infrastructure: {healthy_infra}/{total_infra} services healthy")
    
    if backend_healthy:
        print("   🚀 Backend API: ✅ Healthy")
        if 'Health Check' in backend_data:
            active_connections = backend_data.get('MCP Status', {}).get('active_connections', 0)
            available_workflows = backend_data.get('MCP Status', {}).get('available_workflows', 0)
            print(f"   ⚡ Workflows: {available_workflows} available")
            print(f"   🔌 Connections: {active_connections} active")
    else:
        print("   🚀 Backend API: ❌ Issues detected")
    
    # 6. Recommendations
    print("\n💡 Recommendations")
    print("-" * 17)
    
    if healthy_infra < total_infra:
        print("   🔧 Start infrastructure: ./start_infrastructure.sh")
    
    if not backend_healthy:
        print("   🚀 Start backend: python3 start_backend.py")
    
    if backend_healthy and healthy_infra >= 3:  # Most important services
        print("   ✅ System is operational!")
        print("   🌐 Access API: http://localhost:8080")
        print("   🔌 WebSocket: ws://localhost:8080/mcp")
        print("   🛠️  N8N: http://localhost:5678")
    
    print(f"\n🕒 Check completed at {datetime.now().strftime('%H:%M:%S')}")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Status check interrupted")
    except Exception as e:
        print(f"\n❌ Status check failed: {e}")
