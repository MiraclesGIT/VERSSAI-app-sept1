#!/usr/bin/env python3
"""
MCP + N8N Integration Test for VERSSAI
Tests the complete workflow automation pipeline after port fixes
"""

import asyncio
import websockets
import json
import requests
import time
from datetime import datetime
from typing import Dict, Any
import sys

class MCPIntegrationTester:
    """Test MCP + N8N integration with the VERSSAI platform"""
    
    def __init__(self):
        self.mcp_websocket_url = "ws://localhost:8080/mcp-websocket"
        self.n8n_base_url = "http://localhost:5678"
        self.backend_base_url = "http://localhost:8080"
        self.test_results = {}
        
    async def run_comprehensive_integration_test(self):
        """Run complete MCP + N8N integration test"""
        
        print("🧪 VERSSAI MCP + N8N Integration Test")
        print("=" * 50)
        print(f"⏰ Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("")
        
        # Test 1: Service Connectivity
        await self.test_service_connectivity()
        
        # Test 2: N8N Authentication and Status
        await self.test_n8n_authentication()
        
        # Test 3: Backend Webhook Endpoints
        await self.test_backend_webhooks()
        
        # Test 4: MCP WebSocket Connection
        await self.test_mcp_websocket_connection()
        
        # Test 5: End-to-End Workflow Trigger
        await self.test_end_to_end_workflow()
        
        # Generate final report
        self.generate_integration_report()
        
    async def test_service_connectivity(self):
        """Test basic service connectivity"""
        
        print("🔌 Testing Service Connectivity...")
        
        services = {
            "Backend API": f"{self.backend_base_url}/health",
            "N8N Health": f"{self.n8n_base_url}/healthz",
            "ChromaDB": "http://localhost:8000/api/v1/heartbeat"
        }
        
        connectivity_results = {}
        
        for service_name, url in services.items():
            try:
                response = requests.get(url, timeout=10)
                if response.status_code in [200, 404]:  # 404 is OK for basic connectivity
                    connectivity_results[service_name] = "✅ CONNECTED"
                    print(f"   ✅ {service_name}: Connected")
                else:
                    connectivity_results[service_name] = f"⚠️  HTTP {response.status_code}"
                    print(f"   ⚠️  {service_name}: HTTP {response.status_code}")
            except Exception as e:
                connectivity_results[service_name] = f"❌ ERROR: {str(e)[:30]}"
                print(f"   ❌ {service_name}: {str(e)[:50]}")
        
        self.test_results["connectivity"] = connectivity_results
        
    async def test_n8n_authentication(self):
        """Test N8N authentication and workflow availability"""
        
        print("\n🔐 Testing N8N Authentication...")
        
        # Test N8N authentication
        auth = ('verssai_admin', 'verssai_n8n_2024')
        
        try:
            # Test basic auth
            response = requests.get(f"{self.n8n_base_url}/rest/workflows", auth=auth, timeout=10)
            
            if response.status_code == 200:
                workflows = response.json()
                workflow_count = len(workflows) if isinstance(workflows, list) else 0
                
                self.test_results["n8n_auth"] = "✅ AUTHENTICATED"
                self.test_results["n8n_workflows"] = f"{workflow_count} workflows available"
                
                print(f"   ✅ N8N Authentication: Success")
                print(f"   📊 Workflows Available: {workflow_count}")
                
                # List VERSSAI workflows if any
                verssai_workflows = [w for w in workflows if 'verssai' in w.get('name', '').lower()] if isinstance(workflows, list) else []
                if verssai_workflows:
                    print(f"   🎯 VERSSAI Workflows: {len(verssai_workflows)}")
                    for workflow in verssai_workflows[:3]:  # Show first 3
                        print(f"      • {workflow.get('name', 'Unknown')}")
                
            elif response.status_code == 401:
                self.test_results["n8n_auth"] = "❌ AUTHENTICATION FAILED"
                print(f"   ❌ N8N Authentication: Failed (401)")
            else:
                self.test_results["n8n_auth"] = f"⚠️  HTTP {response.status_code}"
                print(f"   ⚠️  N8N Response: HTTP {response.status_code}")
                
        except Exception as e:
            self.test_results["n8n_auth"] = f"❌ ERROR: {str(e)}"
            print(f"   ❌ N8N Connection: {str(e)}")
    
    async def test_backend_webhooks(self):
        """Test backend webhook endpoints for N8N integration"""
        
        print("\n🔗 Testing Backend Webhook Endpoints...")
        
        # VERSSAI workflow webhooks
        webhook_endpoints = [
            "/webhook/founder-signal-webhook",
            "/webhook/due-diligence-webhook", 
            "/webhook/competitive-intel-webhook",
            "/webhook/portfolio-webhook",
            "/webhook/fund-allocation-webhook",
            "/webhook/lp-communication-webhook"
        ]
        
        webhook_results = {}
        
        for endpoint in webhook_endpoints:
            try:
                # Test POST request (webhooks expect POST)
                test_payload = {
                    "test": True,
                    "workflow_id": endpoint.split('/')[-1].replace('-webhook', ''),
                    "timestamp": datetime.now().isoformat()
                }
                
                response = requests.post(
                    f"{self.backend_base_url}{endpoint}",
                    json=test_payload,
                    timeout=10
                )
                
                webhook_name = endpoint.split('/')[-1].replace('-webhook', '').replace('-', '_')
                
                if response.status_code in [200, 201, 202]:
                    webhook_results[webhook_name] = "✅ AVAILABLE"
                    print(f"   ✅ {webhook_name}: Available")
                elif response.status_code == 404:
                    webhook_results[webhook_name] = "❌ NOT FOUND"
                    print(f"   ❌ {webhook_name}: Not found (404)")
                else:
                    webhook_results[webhook_name] = f"⚠️  HTTP {response.status_code}"
                    print(f"   ⚠️  {webhook_name}: HTTP {response.status_code}")
                    
            except Exception as e:
                webhook_name = endpoint.split('/')[-1].replace('-webhook', '').replace('-', '_')
                webhook_results[webhook_name] = f"❌ ERROR: {str(e)[:20]}"
                print(f"   ❌ {webhook_name}: {str(e)[:40]}")
        
        self.test_results["webhooks"] = webhook_results
    
    async def test_mcp_websocket_connection(self):
        """Test MCP WebSocket connection and protocol"""
        
        print("\n📡 Testing MCP WebSocket Connection...")
        
        try:
            # Try to connect to MCP WebSocket
            async with websockets.connect(self.mcp_websocket_url, timeout=10) as websocket:
                
                print("   ✅ WebSocket connection established")
                
                # Test 1: List available workflows
                list_request = {
                    "type": "list_workflows",
                    "timestamp": datetime.now().isoformat()
                }
                
                await websocket.send(json.dumps(list_request))
                response = await asyncio.wait_for(websocket.recv(), timeout=5)
                response_data = json.loads(response)
                
                if response_data.get("type") == "workflow_list":
                    workflows = response_data.get("workflows", [])
                    print(f"   ✅ MCP Protocol: Working ({len(workflows)} workflows)")
                    
                    self.test_results["mcp_websocket"] = "✅ FUNCTIONAL"
                    self.test_results["mcp_workflows"] = f"{len(workflows)} workflows"
                    
                    # Show available workflows
                    for workflow in workflows[:3]:  # Show first 3
                        print(f"      • {workflow.get('name', 'Unknown')}")
                else:
                    print(f"   ⚠️  Unexpected response type: {response_data.get('type')}")
                    self.test_results["mcp_websocket"] = "⚠️  PARTIAL"
                    
        except websockets.exceptions.ConnectionRefused:
            print("   ❌ WebSocket connection refused")
            self.test_results["mcp_websocket"] = "❌ CONNECTION REFUSED"
        except asyncio.TimeoutError:
            print("   ❌ WebSocket connection timeout")
            self.test_results["mcp_websocket"] = "❌ TIMEOUT"
        except Exception as e:
            print(f"   ❌ WebSocket error: {str(e)}")
            self.test_results["mcp_websocket"] = f"❌ ERROR: {str(e)[:20]}"
    
    async def test_end_to_end_workflow(self):
        """Test complete end-to-end workflow execution"""
        
        print("\n🎯 Testing End-to-End Workflow Execution...")
        
        try:
            # Try to connect and trigger a test workflow
            async with websockets.connect(self.mcp_websocket_url, timeout=10) as websocket:
                
                # Trigger founder signal workflow
                trigger_request = {
                    "type": "trigger_workflow",
                    "workflow_id": "founder_signal",
                    "user_role": "superadmin",  # Required for triggering
                    "data": {
                        "founder_name": "Test Founder",
                        "company_name": "Test Startup Inc",
                        "triggered_by": "Integration Test",
                        "organization": "VERSSAI Test"
                    },
                    "timestamp": datetime.now().isoformat()
                }
                
                await websocket.send(json.dumps(trigger_request))
                
                # Wait for initial response
                response = await asyncio.wait_for(websocket.recv(), timeout=10)
                response_data = json.loads(response)
                
                if response_data.get("type") == "workflow_started":
                    session_id = response_data.get("session_id")
                    print(f"   ✅ Workflow triggered: {session_id}")
                    
                    # Wait for progress updates (timeout after 30 seconds)
                    progress_updates = 0
                    start_time = time.time()
                    
                    while time.time() - start_time < 30:
                        try:
                            progress_response = await asyncio.wait_for(websocket.recv(), timeout=5)
                            progress_data = json.loads(progress_response)
                            
                            if progress_data.get("type") == "workflow_progress":
                                progress_updates += 1
                                progress = progress_data.get("progress", 0)
                                message = progress_data.get("message", "")
                                
                                print(f"   📈 Progress: {progress}% - {message}")
                                
                                if progress_data.get("status") == "completed":
                                    print("   🎉 Workflow completed successfully!")
                                    self.test_results["end_to_end"] = "✅ SUCCESS"
                                    break
                            elif progress_data.get("type") == "error":
                                print(f"   ❌ Workflow error: {progress_data.get('message')}")
                                self.test_results["end_to_end"] = "❌ WORKFLOW ERROR"
                                break
                                
                        except asyncio.TimeoutError:
                            # No more progress updates
                            break
                    
                    if progress_updates > 0:
                        print(f"   📊 Received {progress_updates} progress updates")
                        if "end_to_end" not in self.test_results:
                            self.test_results["end_to_end"] = "⚠️  PARTIAL (timeout)"
                    else:
                        self.test_results["end_to_end"] = "⚠️  NO PROGRESS UPDATES"
                        
                elif response_data.get("type") == "error":
                    error_msg = response_data.get("message", "Unknown error")
                    print(f"   ❌ Workflow trigger failed: {error_msg}")
                    self.test_results["end_to_end"] = f"❌ TRIGGER FAILED: {error_msg[:30]}"
                else:
                    print(f"   ⚠️  Unexpected response: {response_data.get('type')}")
                    self.test_results["end_to_end"] = "⚠️  UNEXPECTED RESPONSE"
                    
        except Exception as e:
            print(f"   ❌ End-to-end test failed: {str(e)}")
            self.test_results["end_to_end"] = f"❌ ERROR: {str(e)[:30]}"
    
    def generate_integration_report(self):
        """Generate comprehensive integration test report"""
        
        print("\n" + "=" * 60)
        print("📊 MCP + N8N Integration Test Report")
        print("=" * 60)
        
        # Calculate success metrics
        total_tests = len(self.test_results)
        successful_tests = len([r for r in self.test_results.values() if "✅" in str(r)])
        partial_tests = len([r for r in self.test_results.values() if "⚠️" in str(r)])
        failed_tests = len([r for r in self.test_results.values() if "❌" in str(r)])
        
        print(f"📈 Test Summary:")
        print(f"   Total Tests: {total_tests}")
        print(f"   ✅ Successful: {successful_tests}")
        print(f"   ⚠️  Partial: {partial_tests}")
        print(f"   ❌ Failed: {failed_tests}")
        print(f"   🎯 Success Rate: {(successful_tests/total_tests)*100:.1f}%")
        
        print(f"\n📋 Detailed Results:")
        for test_name, result in self.test_results.items():
            status_icon = "✅" if "✅" in str(result) else "⚠️" if "⚠️" in str(result) else "❌"
            print(f"   {status_icon} {test_name.replace('_', ' ').title()}: {result}")
        
        # Overall status
        print(f"\n🎯 Overall Integration Status:")
        if successful_tests >= total_tests * 0.8:
            print("🚀 MCP + N8N Integration: FULLY OPERATIONAL")
            integration_status = "OPERATIONAL"
        elif successful_tests >= total_tests * 0.6:
            print("⚠️  MCP + N8N Integration: PARTIALLY OPERATIONAL")
            integration_status = "PARTIAL"
        else:
            print("❌ MCP + N8N Integration: NEEDS ATTENTION")
            integration_status = "NEEDS_ATTENTION"
        
        # Next steps
        print(f"\n🔧 Next Steps:")
        if integration_status == "OPERATIONAL":
            print("   • ✅ Integration is working - ready for production use!")
            print("   • 🎯 Test individual workflow features")
            print("   • 📊 Monitor workflow performance")
        elif integration_status == "PARTIAL":
            print("   • 🔧 Review failed components")
            print("   • 🔄 Restart services if needed")
            print("   • 🧪 Re-run specific tests")
        else:
            print("   • 🚨 Check service logs for errors")
            print("   • 🔄 Restart all services")
            print("   • 🔍 Verify port configuration")
            print("   • 📞 Check documentation for setup")
        
        print(f"\n⏰ Test completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return {
            "integration_status": integration_status,
            "success_rate": (successful_tests/total_tests)*100,
            "test_results": self.test_results
        }

async def main():
    """Run the MCP + N8N integration test"""
    
    tester = MCPIntegrationTester()
    await tester.run_comprehensive_integration_test()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        sys.exit(1)
