#!/usr/bin/env python3
"""
Fixed MCP + N8N Integration Test for VERSSAI
Tests the complete workflow automation pipeline with proper error handling
"""

import asyncio
import json
import requests
import time
from datetime import datetime
from typing import Dict, Any
import sys

# Try importing websockets with proper error handling
try:
    import websockets
    from websockets.exceptions import ConnectionClosed, InvalidURI
    WEBSOCKETS_AVAILABLE = True
except ImportError:
    print("⚠️  websockets library not available. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "websockets"])
    import websockets
    from websockets.exceptions import ConnectionClosed, InvalidURI
    WEBSOCKETS_AVAILABLE = True

class MCPIntegrationTesterFixed:
    """Test MCP + N8N integration with proper error handling"""
    
    def __init__(self):
        self.mcp_websocket_url = "ws://localhost:8080/mcp-websocket"
        self.n8n_base_url = "http://localhost:5678"
        self.backend_base_url = "http://localhost:8080"
        self.test_results = {}
        
    async def run_comprehensive_integration_test(self):
        """Run complete MCP + N8N integration test"""
        
        print("🧪 VERSSAI MCP + N8N Integration Test (Fixed)")
        print("=" * 55)
        print(f"⏰ Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("")
        
        # Test 1: Service Connectivity
        await self.test_service_connectivity()
        
        # Test 2: N8N Authentication and Status
        await self.test_n8n_authentication()
        
        # Test 3: Backend Webhook Endpoints (only if backend is running)
        if self.test_results.get("backend_api") == "✅ CONNECTED":
            await self.test_backend_webhooks()
        else:
            print("\n🔗 Skipping webhook tests - backend not available")
            self.test_results["webhooks"] = "❌ BACKEND NOT AVAILABLE"
        
        # Test 4: MCP WebSocket Connection (only if backend is running)
        if self.test_results.get("backend_api") == "✅ CONNECTED":
            await self.test_mcp_websocket_connection()
        else:
            print("\n📡 Skipping WebSocket tests - backend not available")
            self.test_results["mcp_websocket"] = "❌ BACKEND NOT AVAILABLE"
        
        # Generate final report
        self.generate_integration_report()
        
    async def test_service_connectivity(self):
        """Test basic service connectivity with detailed diagnostics"""
        
        print("🔌 Testing Service Connectivity...")
        
        services = {
            "backend_api": f"{self.backend_base_url}/health",
            "n8n_health": f"{self.n8n_base_url}/healthz",
            "chromadb": "http://localhost:8000/api/v1/heartbeat"
        }
        
        for service_name, url in services.items():
            try:
                print(f"   Testing {service_name} at {url}...")
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    self.test_results[service_name] = "✅ CONNECTED"
                    print(f"   ✅ {service_name}: Connected (HTTP 200)")
                elif response.status_code == 404:
                    self.test_results[service_name] = "✅ CONNECTED"
                    print(f"   ✅ {service_name}: Connected (HTTP 404 - service up)")
                else:
                    self.test_results[service_name] = f"⚠️  HTTP {response.status_code}"
                    print(f"   ⚠️  {service_name}: HTTP {response.status_code}")
                    
            except requests.exceptions.ConnectionError as e:
                self.test_results[service_name] = "❌ CONNECTION REFUSED"
                print(f"   ❌ {service_name}: Connection refused - service not running")
            except requests.exceptions.Timeout:
                self.test_results[service_name] = "❌ TIMEOUT"
                print(f"   ❌ {service_name}: Request timeout")
            except Exception as e:
                self.test_results[service_name] = f"❌ ERROR: {str(e)[:30]}"
                print(f"   ❌ {service_name}: {str(e)[:50]}")
        
    async def test_n8n_authentication(self):
        """Test N8N authentication with better error handling"""
        
        print("\n🔐 Testing N8N Authentication...")
        
        # First check if N8N is responding at all
        if self.test_results.get("n8n_health") != "✅ CONNECTED":
            print("   ❌ Skipping auth test - N8N not responding")
            self.test_results["n8n_auth"] = "❌ SERVICE NOT AVAILABLE"
            return
        
        auth = ('verssai_admin', 'verssai_n8n_2024')
        
        try:
            print("   Testing authentication...")
            response = requests.get(f"{self.n8n_base_url}/rest/workflows", auth=auth, timeout=15)
            
            if response.status_code == 200:
                workflows = response.json()
                workflow_count = len(workflows) if isinstance(workflows, list) else 0
                
                self.test_results["n8n_auth"] = "✅ AUTHENTICATED"
                self.test_results["n8n_workflows"] = f"{workflow_count} workflows"
                
                print(f"   ✅ N8N Authentication: Success")
                print(f"   📊 Workflows Available: {workflow_count}")
                
                # List VERSSAI workflows
                if isinstance(workflows, list):
                    verssai_workflows = [w for w in workflows if 'verssai' in w.get('name', '').lower()]
                    if verssai_workflows:
                        print(f"   🎯 VERSSAI Workflows: {len(verssai_workflows)}")
                        for workflow in verssai_workflows[:3]:
                            print(f"      • {workflow.get('name', 'Unknown')}")
                    else:
                        print("   ℹ️  No VERSSAI workflows found (may need to import)")
                
            elif response.status_code == 401:
                self.test_results["n8n_auth"] = "❌ AUTHENTICATION FAILED"
                print("   ❌ N8N Authentication: Invalid credentials")
            elif response.status_code == 404:
                self.test_results["n8n_auth"] = "⚠️  API NOT AVAILABLE"
                print("   ⚠️  N8N API endpoint not found - may be starting up")
            else:
                self.test_results["n8n_auth"] = f"⚠️  HTTP {response.status_code}"
                print(f"   ⚠️  N8N Response: HTTP {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            self.test_results["n8n_auth"] = "❌ CONNECTION ERROR"
            print("   ❌ N8N Connection: Connection refused")
        except requests.exceptions.Timeout:
            self.test_results["n8n_auth"] = "❌ TIMEOUT"
            print("   ❌ N8N Connection: Request timeout (may be starting)")
        except Exception as e:
            self.test_results["n8n_auth"] = f"❌ ERROR: {str(e)[:20]}"
            print(f"   ❌ N8N Connection: {str(e)}")
    
    async def test_backend_webhooks(self):
        """Test backend webhook endpoints"""
        
        print("\n🔗 Testing Backend Webhook Endpoints...")
        
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
            webhook_name = endpoint.split('/')[-1].replace('-webhook', '').replace('-', '_')
            
            try:
                test_payload = {
                    "test": True,
                    "workflow_id": webhook_name,
                    "timestamp": datetime.now().isoformat()
                }
                
                print(f"   Testing {webhook_name}...")
                response = requests.post(
                    f"{self.backend_base_url}{endpoint}",
                    json=test_payload,
                    timeout=10
                )
                
                if response.status_code in [200, 201, 202]:
                    webhook_results[webhook_name] = "✅ AVAILABLE"
                    print(f"   ✅ {webhook_name}: Available")
                elif response.status_code == 404:
                    webhook_results[webhook_name] = "❌ NOT FOUND"
                    print(f"   ❌ {webhook_name}: Endpoint not found")
                elif response.status_code == 405:
                    webhook_results[webhook_name] = "⚠️  METHOD NOT ALLOWED"
                    print(f"   ⚠️  {webhook_name}: Method not allowed (endpoint exists)")
                else:
                    webhook_results[webhook_name] = f"⚠️  HTTP {response.status_code}"
                    print(f"   ⚠️  {webhook_name}: HTTP {response.status_code}")
                    
            except requests.exceptions.ConnectionError:
                webhook_results[webhook_name] = "❌ CONNECTION ERROR"
                print(f"   ❌ {webhook_name}: Connection error")
            except Exception as e:
                webhook_results[webhook_name] = f"❌ ERROR"
                print(f"   ❌ {webhook_name}: {str(e)[:40]}")
        
        self.test_results["webhooks"] = webhook_results
    
    async def test_mcp_websocket_connection(self):
        """Test MCP WebSocket connection with proper error handling"""
        
        print("\n📡 Testing MCP WebSocket Connection...")
        
        try:
            print(f"   Connecting to {self.mcp_websocket_url}...")
            
            # Try to connect with timeout
            async with websockets.connect(self.mcp_websocket_url, timeout=10) as websocket:
                
                print("   ✅ WebSocket connection established")
                
                # Test workflow list request
                list_request = {
                    "type": "list_workflows",
                    "timestamp": datetime.now().isoformat()
                }
                
                await websocket.send(json.dumps(list_request))
                
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5)
                    response_data = json.loads(response)
                    
                    if response_data.get("type") == "workflow_list":
                        workflows = response_data.get("workflows", [])
                        print(f"   ✅ MCP Protocol: Working ({len(workflows)} workflows)")
                        
                        self.test_results["mcp_websocket"] = "✅ FUNCTIONAL"
                        self.test_results["mcp_workflows"] = f"{len(workflows)} workflows"
                        
                        # Show available workflows
                        for workflow in workflows[:3]:
                            print(f"      • {workflow.get('name', 'Unknown')}")
                    else:
                        print(f"   ⚠️  Unexpected response: {response_data.get('type')}")
                        self.test_results["mcp_websocket"] = "⚠️  PARTIAL"
                        
                except asyncio.TimeoutError:
                    print("   ⚠️  WebSocket response timeout")
                    self.test_results["mcp_websocket"] = "⚠️  NO RESPONSE"
                except json.JSONDecodeError:
                    print("   ⚠️  Invalid JSON response")
                    self.test_results["mcp_websocket"] = "⚠️  INVALID RESPONSE"
                    
        except ConnectionRefusedError:
            print("   ❌ WebSocket connection refused")
            self.test_results["mcp_websocket"] = "❌ CONNECTION REFUSED"
        except asyncio.TimeoutError:
            print("   ❌ WebSocket connection timeout")
            self.test_results["mcp_websocket"] = "❌ TIMEOUT"
        except Exception as e:
            error_msg = str(e)
            if "Connection refused" in error_msg:
                print("   ❌ WebSocket connection refused")
                self.test_results["mcp_websocket"] = "❌ CONNECTION REFUSED"
            else:
                print(f"   ❌ WebSocket error: {error_msg}")
                self.test_results["mcp_websocket"] = f"❌ ERROR: {error_msg[:20]}"
    
    def generate_integration_report(self):
        """Generate comprehensive integration test report"""
        
        print("\n" + "=" * 60)
        print("📊 MCP + N8N Integration Test Report")
        print("=" * 60)
        
        # Flatten test results for counting
        all_results = []
        for key, value in self.test_results.items():
            if isinstance(value, dict):
                all_results.extend(value.values())
            else:
                all_results.append(value)
        
        # Calculate metrics
        total_tests = len(all_results)
        successful_tests = len([r for r in all_results if "✅" in str(r)])
        partial_tests = len([r for r in all_results if "⚠️" in str(r)])
        failed_tests = len([r for r in all_results if "❌" in str(r)])
        
        print(f"📈 Test Summary:")
        print(f"   Total Tests: {total_tests}")
        print(f"   ✅ Successful: {successful_tests}")
        print(f"   ⚠️  Partial: {partial_tests}")
        print(f"   ❌ Failed: {failed_tests}")
        
        if total_tests > 0:
            success_rate = (successful_tests / total_tests) * 100
            print(f"   🎯 Success Rate: {success_rate:.1f}%")
        else:
            success_rate = 0
            print(f"   🎯 Success Rate: 0%")
        
        print(f"\n📋 Detailed Results:")
        for test_name, result in self.test_results.items():
            if isinstance(result, dict):
                print(f"   📁 {test_name.replace('_', ' ').title()}:")
                for sub_test, sub_result in result.items():
                    status_icon = "✅" if "✅" in str(sub_result) else "⚠️" if "⚠️" in str(sub_result) else "❌"
                    print(f"      {status_icon} {sub_test}: {sub_result}")
            else:
                status_icon = "✅" if "✅" in str(result) else "⚠️" if "⚠️" in str(result) else "❌"
                print(f"   {status_icon} {test_name.replace('_', ' ').title()}: {result}")
        
        # Diagnosis and recommendations
        print(f"\n🔍 Diagnosis:")
        
        if self.test_results.get("backend_api") != "✅ CONNECTED":
            print("   🚨 PRIMARY ISSUE: Backend API not running on port 8080")
            print("      • This is the main blocker for MCP + N8N integration")
            print("      • All webhook and WebSocket tests depend on this")
        
        if self.test_results.get("n8n_health") != "✅ CONNECTED":
            print("   ⚠️  N8N service issues detected")
        
        if self.test_results.get("chromadb") != "✅ CONNECTED":
            print("   ⚠️  ChromaDB service issues detected")
        
        # Recommendations
        print(f"\n🔧 Immediate Actions Needed:")
        
        if self.test_results.get("backend_api") != "✅ CONNECTED":
            print("   1. 🚀 START BACKEND: Run './start_backend_only.sh'")
            print("   2. 🔍 CHECK LOGS: Look for backend startup errors")
            print("   3. 📦 VERIFY DEPS: Ensure Python dependencies installed")
        
        if success_rate >= 80:
            print("   ✅ System mostly operational - minor fixes needed")
        elif success_rate >= 50:
            print("   ⚠️  System partially operational - backend restart needed")
        else:
            print("   🚨 System needs full service restart")
            print("   4. 🔄 FULL RESTART: docker-compose down && ./start_all_services.sh")
        
        print(f"\n⏰ Test completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return {
            "success_rate": success_rate,
            "total_tests": total_tests,
            "test_results": self.test_results
        }

async def main():
    """Run the fixed MCP + N8N integration test"""
    
    tester = MCPIntegrationTesterFixed()
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
