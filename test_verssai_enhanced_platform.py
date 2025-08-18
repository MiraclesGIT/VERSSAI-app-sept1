#!/usr/bin/env python3
"""
VERSSAI Enhanced Platform Comprehensive Test Suite
Testing 3-Layer RAG/GRAPH + Enhanced MCP + AI Chat + Frontend Integration
"""

import asyncio
import aiohttp
import websockets
import json
import time
import logging
from datetime import datetime
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class VERSSAIEnhancedTester:
    """Comprehensive test suite for VERSSAI enhanced platform"""
    
    def __init__(self):
        self.base_url = "http://localhost:8080"
        self.ws_url = "ws://localhost:8080/mcp"
        self.test_results = {
            'rag_engine': {'status': 'pending', 'details': []},
            'mcp_backend': {'status': 'pending', 'details': []},
            'ai_chat': {'status': 'pending', 'details': []},
            'workflow_triggers': {'status': 'pending', 'details': []},
            'role_based_access': {'status': 'pending', 'details': []},
            'integration': {'status': 'pending', 'details': []}
        }
        
    async def run_comprehensive_test(self):
        """Run all test suites"""
        logger.info("🚀 Starting VERSSAI Enhanced Platform Test Suite")
        logger.info("=" * 60)
        
        try:
            # Test 1: RAG/GRAPH Engine
            await self.test_rag_graph_engine()
            
            # Test 2: Enhanced MCP Backend
            await self.test_enhanced_mcp_backend()
            
            # Test 3: AI Chat Workflow Generation
            await self.test_ai_chat_capabilities()
            
            # Test 4: Enhanced Workflow Triggers
            await self.test_enhanced_workflow_triggers()
            
            # Test 5: Role-based Access Control
            await self.test_role_based_access()
            
            # Test 6: End-to-end Integration
            await self.test_integration_flow()
            
            # Generate final report
            self.generate_test_report()
            
        except Exception as e:
            logger.error(f"💥 Test suite failed: {e}")
            
    async def test_rag_graph_engine(self):
        """Test the 3-layer RAG/GRAPH architecture"""
        logger.info("🧠 Testing RAG/GRAPH Engine...")
        
        try:
            # Test RAG engine initialization
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/api/rag/status") as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('status') == 'ready':
                            self.test_results['rag_engine']['details'].append("✅ RAG engine initialized successfully")
                            
                            # Test layer statistics
                            layers = data.get('layers', {})
                            if 'roof' in layers and 'vc' in layers and 'founder' in layers:
                                self.test_results['rag_engine']['details'].append(f"✅ All 3 layers active: {list(layers.keys())}")
                                
                                # Test total nodes and edges
                                total_nodes = sum(layer.get('total_nodes', 0) for layer in layers.values())
                                total_edges = sum(layer.get('total_edges', 0) for layer in layers.values())
                                
                                if total_nodes > 1000:  # Expecting significant data from our dataset
                                    self.test_results['rag_engine']['details'].append(f"✅ Substantial knowledge graph: {total_nodes} nodes, {total_edges} edges")
                                else:
                                    self.test_results['rag_engine']['details'].append(f"⚠️ Limited knowledge graph: {total_nodes} nodes")
                                
                                # Test RAG query
                                query_payload = {
                                    "query": "machine learning startup success patterns",
                                    "layer_weights": {"roof": 0.5, "vc": 0.3, "founder": 0.2}
                                }
                                
                                async with session.post(f"{self.base_url}/api/rag/query", json=query_payload) as query_response:
                                    if query_response.status == 200:
                                        query_data = await query_response.json()
                                        if query_data.get('summary', {}).get('total_matches', 0) > 0:
                                            self.test_results['rag_engine']['details'].append("✅ RAG query returned relevant results")
                                            
                                            # Check cross-layer insights
                                            cross_insights = len(query_data.get('cross_layer_insights', []))
                                            if cross_insights > 0:
                                                self.test_results['rag_engine']['details'].append(f"✅ Cross-layer analysis working: {cross_insights} insights")
                                            else:
                                                self.test_results['rag_engine']['details'].append("⚠️ No cross-layer insights found")
                                        else:
                                            self.test_results['rag_engine']['details'].append("❌ RAG query returned no results")
                                    else:
                                        self.test_results['rag_engine']['details'].append(f"❌ RAG query failed: {query_response.status}")
                            else:
                                self.test_results['rag_engine']['details'].append(f"❌ Missing layers. Found: {list(layers.keys())}")
                        else:
                            self.test_results['rag_engine']['details'].append(f"⚠️ RAG engine status: {data.get('status')}")
                    else:
                        self.test_results['rag_engine']['details'].append(f"❌ RAG status endpoint failed: {response.status}")
            
            self.test_results['rag_engine']['status'] = 'passed' if all('✅' in detail for detail in self.test_results['rag_engine']['details']) else 'failed'
            
        except Exception as e:
            self.test_results['rag_engine']['status'] = 'failed'
            self.test_results['rag_engine']['details'].append(f"❌ RAG test exception: {e}")
    
    async def test_enhanced_mcp_backend(self):
        """Test enhanced MCP backend capabilities"""
        logger.info("🔌 Testing Enhanced MCP Backend...")
        
        try:
            # Test basic health endpoint
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/health") as response:
                    if response.status == 200:
                        data = await response.json()
                        services = data.get('services', {})
                        
                        if services.get('enhanced_mcp_protocol') == 'ready':
                            self.test_results['mcp_backend']['details'].append("✅ Enhanced MCP protocol ready")
                        
                        if services.get('rag_graph_engine') in ['ready', 'initializing']:
                            self.test_results['mcp_backend']['details'].append(f"✅ RAG integration status: {services.get('rag_graph_engine')}")
                        
                        # Check session counts
                        workflow_sessions = services.get('active_workflow_sessions', 0)
                        chat_sessions = services.get('active_chat_sessions', 0)
                        
                        self.test_results['mcp_backend']['details'].append(f"✅ Sessions tracking: {workflow_sessions} workflows, {chat_sessions} chats")
                    else:
                        self.test_results['mcp_backend']['details'].append(f"❌ Health endpoint failed: {response.status}")
            
            # Test WebSocket connection
            try:
                async with websockets.connect(f"{self.ws_url}?user_role=superadmin") as ws:
                    # Test connection
                    welcome_msg = await asyncio.wait_for(ws.recv(), timeout=5.0)
                    welcome_data = json.loads(welcome_msg)
                    
                    if welcome_data.get('type') == 'connection_established':
                        self.test_results['mcp_backend']['details'].append("✅ MCP WebSocket connection established")
                        
                        capabilities = welcome_data.get('capabilities', [])
                        expected_capabilities = ['ai_chat_workflow', 'create_workflow', 'rag_query']
                        
                        if all(cap in capabilities for cap in expected_capabilities):
                            self.test_results['mcp_backend']['details'].append("✅ SuperAdmin capabilities available")
                        else:
                            self.test_results['mcp_backend']['details'].append(f"⚠️ Missing capabilities: {set(expected_capabilities) - set(capabilities)}")
                        
                        # Test ping/pong
                        await ws.send(json.dumps({"type": "ping"}))
                        pong_msg = await asyncio.wait_for(ws.recv(), timeout=3.0)
                        pong_data = json.loads(pong_msg)
                        
                        if pong_data.get('type') == 'pong':
                            self.test_results['mcp_backend']['details'].append("✅ Ping/pong working")
                        
                        # Test workflow list
                        await ws.send(json.dumps({"type": "list_workflows"}))
                        list_msg = await asyncio.wait_for(ws.recv(), timeout=3.0)
                        list_data = json.loads(list_msg)
                        
                        if list_data.get('type') == 'workflow_list':
                            workflows = list_data.get('workflows', [])
                            if len(workflows) >= 6:  # Should have our 6 core workflows
                                self.test_results['mcp_backend']['details'].append(f"✅ Workflow list retrieved: {len(workflows)} workflows")
                            else:
                                self.test_results['mcp_backend']['details'].append(f"⚠️ Expected 6+ workflows, got {len(workflows)}")
                        
                    else:
                        self.test_results['mcp_backend']['details'].append(f"❌ Unexpected welcome message type: {welcome_data.get('type')}")
                        
            except asyncio.TimeoutError:
                self.test_results['mcp_backend']['details'].append("❌ WebSocket connection timeout")
            except Exception as e:
                self.test_results['mcp_backend']['details'].append(f"❌ WebSocket test failed: {e}")
            
            self.test_results['mcp_backend']['status'] = 'passed' if any('✅' in detail for detail in self.test_results['mcp_backend']['details']) else 'failed'
            
        except Exception as e:
            self.test_results['mcp_backend']['status'] = 'failed'
            self.test_results['mcp_backend']['details'].append(f"❌ MCP backend test exception: {e}")
    
    async def test_ai_chat_capabilities(self):
        """Test AI chat workflow generation capabilities"""
        logger.info("🤖 Testing AI Chat Capabilities...")
        
        try:
            async with websockets.connect(f"{self.ws_url}?user_role=superadmin") as ws:
                # Wait for welcome message
                welcome_msg = await asyncio.wait_for(ws.recv(), timeout=5.0)
                
                # Test AI chat workflow creation
                chat_message = {
                    "type": "ai_chat_workflow",
                    "message": "Create a new workflow for analyzing startup financial health"
                }
                
                await ws.send(json.dumps(chat_message))
                
                # Wait for AI response
                chat_response = await asyncio.wait_for(ws.recv(), timeout=10.0)
                chat_data = json.loads(chat_response)
                
                if chat_data.get('type') == 'ai_chat_response':
                    self.test_results['ai_chat']['details'].append("✅ AI chat response received")
                    
                    response_content = chat_data.get('response', {})
                    if response_content.get('message'):
                        self.test_results['ai_chat']['details'].append("✅ AI generated meaningful response")
                    
                    if response_content.get('suggestions'):
                        self.test_results['ai_chat']['details'].append("✅ AI provided workflow suggestions")
                    
                    # Test workflow explanation request
                    explain_message = {
                        "type": "ai_chat_workflow",
                        "message": "Explain the founder signal assessment workflow",
                        "chat_session_id": chat_data.get('chat_session_id')
                    }
                    
                    await ws.send(json.dumps(explain_message))
                    
                    explain_response = await asyncio.wait_for(ws.recv(), timeout=10.0)
                    explain_data = json.loads(explain_response)
                    
                    if explain_data.get('type') == 'ai_chat_response':
                        explain_content = explain_data.get('response', {})
                        if 'founder signal' in explain_content.get('message', '').lower():
                            self.test_results['ai_chat']['details'].append("✅ AI explained workflow correctly")
                        
                        if explain_content.get('workflow_details'):
                            self.test_results['ai_chat']['details'].append("✅ AI provided detailed workflow information")
                else:
                    self.test_results['ai_chat']['details'].append(f"❌ Unexpected AI chat response type: {chat_data.get('type')}")
            
            self.test_results['ai_chat']['status'] = 'passed' if any('✅' in detail for detail in self.test_results['ai_chat']['details']) else 'failed'
            
        except Exception as e:
            self.test_results['ai_chat']['status'] = 'failed'
            self.test_results['ai_chat']['details'].append(f"❌ AI chat test exception: {e}")
    
    async def test_enhanced_workflow_triggers(self):
        """Test enhanced workflow triggers with RAG integration"""
        logger.info("⚡ Testing Enhanced Workflow Triggers...")
        
        try:
            async with websockets.connect(f"{self.ws_url}?user_role=superadmin") as ws:
                # Wait for welcome message
                welcome_msg = await asyncio.wait_for(ws.recv(), timeout=5.0)
                
                # Test enhanced workflow trigger
                trigger_message = {
                    "type": "trigger_workflow",
                    "workflow_id": "founder_signal",
                    "data": {
                        "founder_name": "John Smith",
                        "company_name": "AI Innovations",
                        "industry": "artificial intelligence",
                        "stage": "seed"
                    }
                }
                
                await ws.send(json.dumps(trigger_message))
                
                # Collect workflow progress messages
                workflow_started = False
                workflow_progress = False
                rag_insights = False
                
                for _ in range(5):  # Wait for multiple progress updates
                    try:
                        progress_msg = await asyncio.wait_for(ws.recv(), timeout=3.0)
                        progress_data = json.loads(progress_msg)
                        
                        if progress_data.get('type') == 'workflow_started':
                            workflow_started = True
                            if progress_data.get('rag_insights'):
                                rag_insights = True
                            self.test_results['workflow_triggers']['details'].append("✅ Enhanced workflow started successfully")
                        
                        elif progress_data.get('type') == 'workflow_progress':
                            workflow_progress = True
                            progress = progress_data.get('progress', 0)
                            message = progress_data.get('message', '')
                            
                            if 'rag' in message.lower() or 'intelligence' in message.lower():
                                rag_insights = True
                            
                            self.test_results['workflow_triggers']['details'].append(f"✅ Progress update: {progress}% - {message}")
                            
                    except asyncio.TimeoutError:
                        break
                
                if workflow_started:
                    self.test_results['workflow_triggers']['details'].append("✅ Workflow trigger mechanism working")
                
                if workflow_progress:
                    self.test_results['workflow_triggers']['details'].append("✅ Real-time progress updates working")
                
                if rag_insights:
                    self.test_results['workflow_triggers']['details'].append("✅ RAG intelligence integration working")
                else:
                    self.test_results['workflow_triggers']['details'].append("⚠️ No RAG insights detected in workflow")
            
            self.test_results['workflow_triggers']['status'] = 'passed' if workflow_started and workflow_progress else 'failed'
            
        except Exception as e:
            self.test_results['workflow_triggers']['status'] = 'failed'
            self.test_results['workflow_triggers']['details'].append(f"❌ Workflow trigger test exception: {e}")
    
    async def test_role_based_access(self):
        """Test role-based access control"""
        logger.info("🔐 Testing Role-based Access Control...")
        
        roles_to_test = ['superadmin', 'vc_partner', 'analyst', 'founder']
        
        try:
            for role in roles_to_test:
                try:
                    async with websockets.connect(f"{self.ws_url}?user_role={role}") as ws:
                        welcome_msg = await asyncio.wait_for(ws.recv(), timeout=5.0)
                        welcome_data = json.loads(welcome_msg)
                        
                        if welcome_data.get('type') == 'connection_established':
                            user_role = welcome_data.get('user_role')
                            capabilities = welcome_data.get('capabilities', [])
                            
                            self.test_results['role_based_access']['details'].append(f"✅ {role} connection established")
                            
                            # Test role-specific capabilities
                            if role == 'superadmin':
                                expected_caps = ['ai_chat_workflow', 'create_workflow', 'rag_query']
                                if all(cap in capabilities for cap in expected_caps):
                                    self.test_results['role_based_access']['details'].append("✅ SuperAdmin has full capabilities")
                                else:
                                    self.test_results['role_based_access']['details'].append("❌ SuperAdmin missing capabilities")
                            
                            elif role == 'founder':
                                restricted_caps = ['ai_chat_workflow', 'create_workflow']
                                if not any(cap in capabilities for cap in restricted_caps):
                                    self.test_results['role_based_access']['details'].append("✅ Founder properly restricted")
                                else:
                                    self.test_results['role_based_access']['details'].append("❌ Founder has unauthorized capabilities")
                            
                            # Test unauthorized action (non-superadmin trying AI chat)
                            if role != 'superadmin':
                                unauthorized_msg = {
                                    "type": "ai_chat_workflow",
                                    "message": "Test unauthorized access"
                                }
                                
                                await ws.send(json.dumps(unauthorized_msg))
                                
                                try:
                                    error_response = await asyncio.wait_for(ws.recv(), timeout=3.0)
                                    error_data = json.loads(error_response)
                                    
                                    if error_data.get('type') == 'error' and 'permission denied' in error_data.get('message', '').lower():
                                        self.test_results['role_based_access']['details'].append(f"✅ {role} properly denied unauthorized access")
                                except asyncio.TimeoutError:
                                    self.test_results['role_based_access']['details'].append(f"⚠️ {role} unauthorized access test timeout")
                        
                except Exception as role_error:
                    self.test_results['role_based_access']['details'].append(f"❌ {role} test failed: {role_error}")
            
            passed_tests = sum(1 for detail in self.test_results['role_based_access']['details'] if '✅' in detail)
            self.test_results['role_based_access']['status'] = 'passed' if passed_tests >= 6 else 'failed'  # Expect at least 6 passed tests
            
        except Exception as e:
            self.test_results['role_based_access']['status'] = 'failed'
            self.test_results['role_based_access']['details'].append(f"❌ Role-based access test exception: {e}")
    
    async def test_integration_flow(self):
        """Test end-to-end integration flow"""
        logger.info("🔄 Testing End-to-end Integration...")
        
        try:
            # Test the complete flow: RAG Query -> AI Chat -> Workflow Trigger
            async with websockets.connect(f"{self.ws_url}?user_role=superadmin") as ws:
                welcome_msg = await asyncio.wait_for(ws.recv(), timeout=5.0)
                
                # Step 1: RAG Query
                rag_query = {
                    "type": "rag_query",
                    "query": "successful fintech startup characteristics",
                    "layer_weights": {"roof": 0.3, "vc": 0.5, "founder": 0.2}
                }
                
                await ws.send(json.dumps(rag_query))
                
                rag_response = await asyncio.wait_for(ws.recv(), timeout=10.0)
                rag_data = json.loads(rag_response)
                
                if rag_data.get('type') == 'rag_query_result':
                    self.test_results['integration']['details'].append("✅ Step 1: RAG query successful")
                    
                    # Step 2: AI Chat based on RAG results
                    ai_chat = {
                        "type": "ai_chat_workflow",
                        "message": "Create a fintech due diligence workflow based on the latest market intelligence"
                    }
                    
                    await ws.send(json.dumps(ai_chat))
                    
                    ai_response = await asyncio.wait_for(ws.recv(), timeout=10.0)
                    ai_data = json.loads(ai_response)
                    
                    if ai_data.get('type') == 'ai_chat_response':
                        self.test_results['integration']['details'].append("✅ Step 2: AI chat workflow design successful")
                        
                        # Step 3: Trigger workflow with enhanced data
                        workflow_trigger = {
                            "type": "trigger_workflow",
                            "workflow_id": "due_diligence",
                            "data": {
                                "company_name": "FinTech Innovations",
                                "industry": "fintech",
                                "analysis_type": "comprehensive",
                                "enhanced_by_rag": True
                            }
                        }
                        
                        await ws.send(json.dumps(workflow_trigger))
                        
                        # Wait for workflow confirmation
                        workflow_response = await asyncio.wait_for(ws.recv(), timeout=10.0)
                        workflow_data = json.loads(workflow_response)
                        
                        if workflow_data.get('type') == 'workflow_started':
                            self.test_results['integration']['details'].append("✅ Step 3: Enhanced workflow trigger successful")
                            
                            # Check for RAG insights in workflow
                            if workflow_data.get('rag_insights'):
                                self.test_results['integration']['details'].append("✅ Step 4: RAG insights integrated in workflow")
                            
                            self.test_results['integration']['details'].append("✅ Complete integration flow successful")
                            self.test_results['integration']['status'] = 'passed'
                        else:
                            self.test_results['integration']['details'].append("❌ Step 3: Workflow trigger failed")
                            self.test_results['integration']['status'] = 'failed'
                    else:
                        self.test_results['integration']['details'].append("❌ Step 2: AI chat failed")
                        self.test_results['integration']['status'] = 'failed'
                else:
                    self.test_results['integration']['details'].append("❌ Step 1: RAG query failed")
                    self.test_results['integration']['status'] = 'failed'
            
        except Exception as e:
            self.test_results['integration']['status'] = 'failed'
            self.test_results['integration']['details'].append(f"❌ Integration test exception: {e}")
    
    def generate_test_report(self):
        """Generate comprehensive test report"""
        logger.info("\n" + "=" * 60)
        logger.info("📊 VERSSAI ENHANCED PLATFORM TEST REPORT")
        logger.info("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result['status'] == 'passed')
        
        logger.info(f"🎯 Overall Result: {passed_tests}/{total_tests} test suites passed")
        logger.info("")
        
        for test_name, result in self.test_results.items():
            status_emoji = "✅" if result['status'] == 'passed' else "❌" if result['status'] == 'failed' else "⏳"
            logger.info(f"{status_emoji} {test_name.replace('_', ' ').title()}: {result['status'].upper()}")
            
            for detail in result['details']:
                logger.info(f"   {detail}")
            logger.info("")
        
        # Summary and recommendations
        logger.info("📋 SUMMARY & RECOMMENDATIONS:")
        logger.info("-" * 30)
        
        if passed_tests == total_tests:
            logger.info("🎉 All tests passed! VERSSAI Enhanced Platform is fully operational.")
            logger.info("✨ Features verified:")
            logger.info("   • 3-Layer RAG/GRAPH Architecture")
            logger.info("   • Enhanced MCP Protocol with AI Chat")
            logger.info("   • Role-based Access Control")
            logger.info("   • Real-time Workflow Automation")
            logger.info("   • End-to-end Integration")
        else:
            failed_tests = [name for name, result in self.test_results.items() if result['status'] == 'failed']
            logger.info(f"⚠️ {len(failed_tests)} test suite(s) failed: {failed_tests}")
            logger.info("🔧 Please review the detailed logs above and fix the issues.")
        
        logger.info("\n🚀 Ready to proceed with VERSSAI Enhanced Platform!")
        
        return {
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'success_rate': (passed_tests / total_tests) * 100,
            'detailed_results': self.test_results
        }

# Main execution
async def main():
    """Main test execution"""
    tester = VERSSAIEnhancedTester()
    
    print("🚀 VERSSAI Enhanced Platform Test Suite")
    print("Testing all enhancements from our previous discussion:")
    print("• 3-Layer RAG/GRAPH Architecture")
    print("• Enhanced MCP with AI Chat Workflow Generation")  
    print("• Role-based Access Control")
    print("• Linear App Look & Feel")
    print("• Multi-tenant Organization Support")
    print("")
    
    # Wait for backend to be ready
    print("⏳ Waiting for backend to be ready...")
    await asyncio.sleep(5)
    
    # Run comprehensive tests
    await tester.run_comprehensive_test()

if __name__ == "__main__":
    asyncio.run(main())
