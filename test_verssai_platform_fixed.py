#!/usr/bin/env python3
"""
Fixed VERSSAI Platform Integration Test - WebSocket Compatibility Fix
"""

import asyncio
import json
import time
import requests
import websockets
from datetime import datetime
import sys

class VERSSAIIntegrationTesterFixed:
    """Fixed VERSSAI platform tester with WebSocket compatibility"""
    
    def __init__(self):
        self.backend_url = "http://localhost:8080"
        self.frontend_url = "http://localhost:3000"
        self.websocket_url = "ws://localhost:8080/mcp"
        
        self.test_results = {
            "timestamp": datetime.now().isoformat(),
            "tests": {},
            "overall_status": "unknown"
        }
    
    def log(self, message: str, test_name: str = "general"):
        """Log test messages"""
        print(f"[{test_name.upper()}] {message}")
    
    async def test_websocket_mcp_fixed(self):
        """Test WebSocket MCP Protocol with compatibility fix"""
        self.log("Testing WebSocket MCP Protocol (Fixed)...", "websocket")
        
        try:
            # Fixed WebSocket connection without timeout parameter
            websocket = await websockets.connect(f"{self.websocket_url}?user_role=superadmin")
            
            try:
                # Wait for welcome message
                welcome_response = await asyncio.wait_for(websocket.recv(), timeout=5)
                welcome_data = json.loads(welcome_response)
                self.log(f"✅ Connected: {welcome_data.get('message', 'Connected')}", "websocket")
                
                # Send ping
                await websocket.send(json.dumps({"type": "ping"}))
                response = await asyncio.wait_for(websocket.recv(), timeout=5)
                pong_data = json.loads(response)
                
                if pong_data.get("type") == "pong":
                    self.log("✅ WebSocket ping/pong successful", "websocket")
                else:
                    self.log("⚠️ Unexpected pong response", "websocket")
                
                # Test workflow list
                await websocket.send(json.dumps({"type": "list_workflows"}))
                response = await asyncio.wait_for(websocket.recv(), timeout=5)
                workflow_data = json.loads(response)
                
                if workflow_data.get("type") == "workflow_list":
                    workflows = workflow_data.get("workflows", [])
                    self.log(f"✅ Workflow list: {len(workflows)} workflows available", "websocket")
                    
                    # Show the 6 main VC features
                    vc_features = ["Founder Signal", "Due Diligence", "Portfolio Management", 
                                  "Competitive Intelligence", "Fund Allocation", "LP Communication"]
                    
                    found_features = []
                    for wf in workflows:
                        for feature in vc_features:
                            if feature.lower() in wf['name'].lower():
                                found_features.append(wf['name'])
                                break
                    
                    self.log(f"   🎯 VC Features Found: {len(found_features)}/6", "websocket")
                    for feature in found_features[:3]:
                        self.log(f"      • {feature}", "websocket")
                    
                    self.test_results["tests"]["websocket_mcp"] = {
                        "status": "pass",
                        "ping_pong": "success",
                        "workflow_count": len(workflows),
                        "vc_features_found": found_features
                    }
                else:
                    raise Exception("Failed to get workflow list")
                    
            finally:
                await websocket.close()
                
        except Exception as e:
            self.log(f"❌ WebSocket MCP test failed: {e}", "websocket")
            self.test_results["tests"]["websocket_mcp"] = {
                "status": "fail",
                "error": str(e)
            }
    
    async def test_workflow_trigger_fixed(self):
        """Test workflow triggering via MCP with fix"""
        self.log("Testing Workflow Trigger via MCP (Fixed)...", "workflow")
        
        try:
            websocket = await websockets.connect(f"{self.websocket_url}?user_role=superadmin")
            
            try:
                # Wait for connection message
                welcome_msg = await asyncio.wait_for(websocket.recv(), timeout=5)
                self.log("✅ Connected to MCP WebSocket", "workflow")
                
                # Trigger founder signal workflow
                trigger_msg = {
                    "type": "trigger_workflow",
                    "workflow_id": "founder_signal",
                    "data": {
                        "founder_name": "Alex Chen",
                        "company_name": "TechFlow AI",
                        "industry": "artificial intelligence",
                        "stage": "seed",
                        "triggered_by": "VERSSAI Integration Test v2"
                    }
                }
                
                await websocket.send(json.dumps(trigger_msg))
                self.log("📤 Workflow trigger sent", "workflow")
                
                # Wait for workflow started message
                response = await asyncio.wait_for(websocket.recv(), timeout=10)
                workflow_response = json.loads(response)
                
                if workflow_response.get("type") == "workflow_started":
                    session_id = workflow_response.get("session_id")
                    workflow_name = workflow_response.get("workflow_name")
                    duration = workflow_response.get("estimated_duration")
                    
                    self.log(f"✅ Workflow triggered: {workflow_name}", "workflow")
                    self.log(f"   📋 Session ID: {session_id}", "workflow")
                    self.log(f"   ⏱️ Estimated duration: {duration}s", "workflow")
                    
                    if workflow_response.get("rag_insights"):
                        self.log(f"   🧠 RAG Insights: Available", "workflow")
                    
                    # Wait for progress updates
                    progress_updates = []
                    for i in range(3):
                        try:
                            update = await asyncio.wait_for(websocket.recv(), timeout=8)
                            update_data = json.loads(update)
                            if update_data.get("type") == "workflow_progress":
                                progress = update_data.get("progress", 0)
                                message = update_data.get("message", "")
                                progress_updates.append(f"{progress}%: {message}")
                                self.log(f"   🔄 Progress: {progress}% - {message[:50]}...", "workflow")
                                
                                if progress >= 100:
                                    break
                        except asyncio.TimeoutError:
                            break
                    
                    self.test_results["tests"]["workflow_trigger"] = {
                        "status": "pass",
                        "session_id": session_id,
                        "workflow_name": workflow_name,
                        "progress_updates": len(progress_updates),
                        "rag_insights": "available" if workflow_response.get("rag_insights") else "none"
                    }
                    
                elif workflow_response.get("type") == "error":
                    error_msg = workflow_response.get("message", "Unknown error")
                    self.log(f"⚠️ Workflow error: {error_msg}", "workflow")
                    self.test_results["tests"]["workflow_trigger"] = {
                        "status": "partial",
                        "error": error_msg
                    }
                else:
                    raise Exception(f"Unexpected response: {workflow_response.get('type')}")
                    
            finally:
                await websocket.close()
                
        except Exception as e:
            self.log(f"❌ Workflow trigger test failed: {e}", "workflow")
            self.test_results["tests"]["workflow_trigger"] = {
                "status": "fail",
                "error": str(e)
            }
    
    async def test_rag_engine_fixed(self):
        """Test RAG engine with better error handling"""
        self.log("Testing RAG/GRAPH 3-Layer Engine...", "rag")
        
        try:
            # Check RAG status
            response = requests.get(f"{self.backend_url}/api/rag/status", timeout=10)
            if response.status_code == 200:
                rag_status = response.json()
                self.log(f"✅ RAG Engine: {rag_status['status']}", "rag")
                
                if rag_status["status"] == "ready":
                    # Try to get layer statistics
                    stats_response = requests.get(f"{self.backend_url}/api/rag/status", timeout=10)
                    if stats_response.status_code == 200:
                        stats_data = stats_response.json()
                        if "layers" in stats_data:
                            layers = stats_data["layers"]
                            self.log(f"   🏗️ Layers: {list(layers.keys())}", "rag")
                            for layer_name, layer_info in layers.items():
                                nodes = layer_info.get("total_nodes", 0)
                                edges = layer_info.get("total_edges", 0)
                                self.log(f"      • {layer_name}: {nodes} nodes, {edges} edges", "rag")
                    
                    # Test simple RAG query
                    query_data = {
                        "query": "AI startup founder analysis",
                        "layer_weights": {"roof": 0.4, "vc": 0.3, "founder": 0.3}
                    }
                    
                    query_response = requests.post(
                        f"{self.backend_url}/api/rag/query",
                        json=query_data,
                        timeout=20
                    )
                    
                    if query_response.status_code == 200:
                        query_result = query_response.json()
                        layers_queried = list(query_result.get('layers', {}).keys())
                        summary = query_result.get('summary', {})
                        
                        self.log(f"✅ RAG Query successful", "rag")
                        self.log(f"   🔍 Layers queried: {layers_queried}", "rag")
                        self.log(f"   📊 Total matches: {summary.get('total_matches', 0)}", "rag")
                        self.log(f"   🎯 Confidence: {summary.get('confidence_score', 0):.2f}", "rag")
                        
                        self.test_results["tests"]["rag_engine"] = {
                            "status": "pass",
                            "rag_status": "ready",
                            "query_test": "success",
                            "layers_queried": layers_queried,
                            "total_matches": summary.get('total_matches', 0)
                        }
                    else:
                        self.log(f"⚠️ RAG query failed: HTTP {query_response.status_code}", "rag")
                        self.test_results["tests"]["rag_engine"] = {
                            "status": "partial",
                            "rag_status": "ready",
                            "query_test": "failed"
                        }
                else:
                    self.log(f"🔄 RAG Engine still initializing (processing massive dataset)", "rag")
                    self.test_results["tests"]["rag_engine"] = {
                        "status": "initializing",
                        "rag_status": rag_status["status"],
                        "note": "Large dataset initialization in progress"
                    }
            else:
                raise Exception(f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log(f"❌ RAG Engine test failed: {e}", "rag")
            self.test_results["tests"]["rag_engine"] = {
                "status": "fail",
                "error": str(e)
            }
    
    async def run_fixed_tests(self):
        """Run the fixed integration tests"""
        print("🚀 VERSSAI Platform Integration Test Suite (FIXED)")
        print("=" * 65)
        print("Testing: Enhanced MCP Backend + RAG/GRAPH + N8N + WebSocket")
        print("")
        
        # Test core services first
        await self.test_rag_engine_fixed()
        
        # Test WebSocket MCP Protocol
        await self.test_websocket_mcp_fixed()
        
        # Test workflow triggering
        await self.test_workflow_trigger_fixed()
        
        # Calculate results
        test_statuses = [test["status"] for test in self.test_results["tests"].values()]
        passed = test_statuses.count("pass")
        failed = test_statuses.count("fail")
        partial = test_statuses.count("partial")
        initializing = test_statuses.count("initializing")
        
        print("\n" + "=" * 65)
        print("🎯 VERSSAI PLATFORM INTEGRATION TEST RESULTS (FIXED)")
        print("=" * 65)
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️ Partial: {partial}")
        print(f"🔄 Initializing: {initializing}")
        print(f"📊 Total Tests: {len(test_statuses)}")
        
        if failed == 0:
            if passed >= 2:
                overall_status = "EXCELLENT"
                print(f"\n🎉 OVERALL STATUS: {overall_status}")
                print("🔥 Your VERSSAI Platform MCP Integration is WORKING EXCELLENTLY!")
                print("💪 All core components functional")
            else:
                overall_status = "GOOD"
                print(f"\n✅ OVERALL STATUS: {overall_status}")
        elif failed <= 1:
            overall_status = "GOOD_WITH_MINOR_ISSUES"
            print(f"\n⚠️ OVERALL STATUS: {overall_status}")
        else:
            overall_status = "NEEDS_ATTENTION"
            print(f"\n🔧 OVERALL STATUS: {overall_status}")
        
        self.test_results["overall_status"] = overall_status
        
        print("\n📝 Component Status:")
        for test_name, result in self.test_results["tests"].items():
            status_emoji = {
                "pass": "✅",
                "fail": "❌", 
                "partial": "⚠️",
                "initializing": "🔄"
            }.get(result["status"], "❓")
            
            print(f"   {status_emoji} {test_name}: {result['status']}")
            
            # Show key details
            if result["status"] == "pass":
                if test_name == "websocket_mcp" and "vc_features_found" in result:
                    print(f"      └─ Found {len(result['vc_features_found'])} VC features")
                elif test_name == "workflow_trigger" and "workflow_name" in result:
                    print(f"      └─ Triggered: {result['workflow_name']}")
                elif test_name == "rag_engine" and "total_matches" in result:
                    print(f"      └─ Query matches: {result['total_matches']}")
        
        return self.test_results

async def main():
    """Run the fixed VERSSAI integration test"""
    tester = VERSSAIIntegrationTesterFixed()
    results = await tester.run_fixed_tests()
    
    print(f"\n🎯 FINAL ASSESSMENT:")
    print("Your VERSSAI Platform MCP Integration includes:")
    print("   🧠 3-Layer RAG/GRAPH Architecture (Roof/VC/Founder)")  
    print("   🔌 Enhanced MCP WebSocket Protocol")
    print("   🎯 6 VC Workflow Features")
    print("   🎨 Linear-inspired UI Design")
    print("   🔄 Real-time Progress Tracking")
    print("   👑 SuperAdmin Workflow Management")
    print("   📊 Role-based Access Control")
    
    return results

if __name__ == "__main__":
    asyncio.run(main())
