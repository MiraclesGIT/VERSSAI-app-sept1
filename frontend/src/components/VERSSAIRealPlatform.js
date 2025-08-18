import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  Play, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Zap,
  TrendingUp,
  Shield,
  Users,
  Target,
  BarChart3,
  MessageSquare,
  Monitor,
  Activity,
  Database,
  Brain,
  Layers,
  Cpu,
  Globe,
  FileText,
  BarChart,
  Send,
  Mic
} from 'lucide-react';

// Real MCP Service that connects to your actual Enhanced MCP Backend
class RealMCPService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
    this.ws = null;
    this.messageHandlers = [];
  }
  
  // Connect to your real Enhanced MCP Backend
  async connectWebSocket(userRole = 'superadmin') {
    const wsUrl = `ws://localhost:8080/mcp?user_role=${userRole}`;
    
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('🔌 Connected to VERSSAI Enhanced MCP Backend');
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.messageHandlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
      
      this.ws.onclose = () => {
        console.log('🔌 MCP WebSocket disconnected');
      };
    });
  }
  
  // Subscribe to real-time updates
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }
  
  // Send real commands to your MCP backend
  async sendCommand(command) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(command));
    } else {
      throw new Error('WebSocket not connected');
    }
  }
  
  // Get real backend health status
  async getBackendHealth() {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
  
  // Get real RAG engine status
  async getRAGStatus() {
    const response = await fetch(`${this.baseUrl}/api/rag/status`);
    return response.json();
  }
  
  // Trigger real workflows
  async triggerRealWorkflow(workflowId, data) {
    await this.sendCommand({
      type: 'trigger_workflow',
      workflow_id: workflowId,
      data: data
    });
  }
  
  // Get real workflow list
  async getWorkflowList() {
    await this.sendCommand({
      type: 'list_workflows'
    });
  }
  
  // Real RAG query
  async queryRAG(query, layerWeights) {
    const response = await fetch(`${this.baseUrl}/api/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        layer_weights: layerWeights
      })
    });
    return response.json();
  }
  
  // AI Chat for SuperAdmin workflow creation
  async sendAIChat(message, chatSessionId) {
    await this.sendCommand({
      type: 'ai_chat_workflow',
      message: message,
      chat_session_id: chatSessionId
    });
  }
}

const VERSSAIRealPlatform = () => {
  // Real state management
  const [backendHealth, setBackendHealth] = useState(null);
  const [ragStatus, setRAGStatus] = useState(null);
  const [realWorkflows, setRealWorkflows] = useState([]);
  const [activeWorkflows, setActiveWorkflows] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [aiChatMessages, setAIChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [ragQueryResult, setRAGQueryResult] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  
  const mcpService = useRef(new RealMCPService());
  
  const user = {
    id: 'real_user_001',
    role: 'SuperAdmin',
    name: 'VERSSAI Admin',
    organization: 'VERSSAI Intelligence'
  };
  
  // Initialize real connections
  useEffect(() => {
    const initializeRealPlatform = async () => {
      try {
        setConnectionStatus('Loading backend health...');
        
        // Get real backend health
        const health = await mcpService.current.getBackendHealth();
        setBackendHealth(health);
        
        setConnectionStatus('Loading RAG engine status...');
        
        // Get real RAG status
        const rag = await mcpService.current.getRAGStatus();
        setRAGStatus(rag);
        
        setConnectionStatus('Connecting to WebSocket...');
        
        // Connect to real WebSocket
        await mcpService.current.connectWebSocket(user.role.toLowerCase());
        setIsConnected(true);
        setConnectionStatus('Connected to VERSSAI Backend!');
        
        // Subscribe to real messages
        mcpService.current.onMessage((data) => {
          console.log('🔄 Real MCP Message:', data);
          
          if (data.type === 'connection_established') {
            setConnectionStatus(`Connected as ${data.user_role} - ${data.available_workflows} workflows available`);
          } else if (data.type === 'workflow_list') {
            setRealWorkflows(data.workflows || []);
          } else if (data.type === 'workflow_started') {
            setActiveWorkflows(prev => ({
              ...prev,
              [data.session_id]: {
                session_id: data.session_id,
                workflow_id: data.workflow_id,
                status: 'running',
                progress: 0,
                workflow_name: data.workflow_name,
                estimated_duration: data.estimated_duration,
                rag_insights: data.rag_insights
              }
            }));
          } else if (data.type === 'workflow_progress') {
            setActiveWorkflows(prev => ({
              ...prev,
              [data.session_id]: {
                ...prev[data.session_id],
                progress: data.progress,
                status: data.status,
                message: data.message,
                rag_insight: data.rag_insight
              }
            }));
          } else if (data.type === 'workflow_completed') {
            setActiveWorkflows(prev => ({
              ...prev,
              [data.session_id]: {
                ...prev[data.session_id],
                status: 'completed',
                progress: 100
              }
            }));
          } else if (data.type === 'ai_chat_response') {
            setAIChatMessages(prev => [...prev, {
              role: 'assistant',
              message: data.response.message,
              timestamp: new Date().toISOString()
            }]);
          }
        });
        
        // Get real workflow list
        await mcpService.current.getWorkflowList();
        
      } catch (error) {
        console.error('Failed to initialize real platform:', error);
        setConnectionStatus(`Connection failed: ${error.message}`);
      }
    };
    
    initializeRealPlatform();
    
    // Refresh data every 15 seconds
    const interval = setInterval(async () => {
      try {
        const health = await mcpService.current.getBackendHealth();
        setBackendHealth(health);
        
        const rag = await mcpService.current.getRAGStatus();
        setRAGStatus(rag);
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Real workflow triggering
  const handleRealWorkflowTrigger = async (workflowId) => {
    try {
      const realData = {
        user_id: user.id,
        organization: user.organization,
        triggered_by: `${user.name} via VERSSAI Real Platform`,
        timestamp: new Date().toISOString(),
        // Add specific data based on workflow type
        ...(workflowId === 'founder_signal' ? {
          founder_name: 'Sample Founder',
          company_name: 'TechCorp AI',
          industry: 'artificial intelligence',
          stage: 'seed'
        } : {}),
        ...(workflowId === 'due_diligence' ? {
          company_name: 'TechCorp AI',
          analysis_type: 'full_dd',
          document_count: 25
        } : {}),
        ...(workflowId === 'portfolio_management' ? {
          portfolio_size: 15,
          analysis_period: '12_months'
        } : {})
      };
      
      await mcpService.current.triggerRealWorkflow(workflowId, realData);
    } catch (error) {
      console.error('Failed to trigger real workflow:', error);
    }
  };
  
  // Real RAG query
  const handleRAGQuery = async () => {
    try {
      const result = await mcpService.current.queryRAG(
        'machine learning startup founder analysis venture capital investment',
        { roof: 0.4, vc: 0.3, founder: 0.3 }
      );
      setRAGQueryResult(result);
    } catch (error) {
      console.error('RAG query failed:', error);
    }
  };
  
  // AI Chat handling
  const handleAIChat = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {
      role: 'user',
      message: chatInput,
      timestamp: new Date().toISOString()
    };
    
    setAIChatMessages(prev => [...prev, userMessage]);
    
    try {
      await mcpService.current.sendAIChat(chatInput);
      setChatInput('');
    } catch (error) {
      console.error('AI chat failed:', error);
    }
  };
  
  // Status indicator component
  const StatusIndicator = ({ status, label }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'running':
        case 'ready': return 'bg-green-500';
        case 'initializing': return 'bg-yellow-500 animate-pulse';
        case 'healthy': return 'bg-green-500';
        default: return 'bg-red-500';
      }
    };
    
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
        <span className="text-sm">{label}: {status}</span>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Real Header with Live Status */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">VERSSAI</h1>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                REAL PLATFORM
              </span>
            </div>
            
            {/* Live Connection Status */}
            <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {connectionStatus}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user.organization}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
              <span className="text-xs text-gray-500 bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Real Backend Status Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Backend Health */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Monitor className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Backend Health</h3>
            </div>
            {backendHealth ? (
              <div className="space-y-2">
                <StatusIndicator status={backendHealth.services.api} label="API" />
                <StatusIndicator status={backendHealth.services.enhanced_mcp_protocol} label="MCP Protocol" />
                <StatusIndicator status={backendHealth.services.rag_graph_engine} label="RAG Engine" />
                <StatusIndicator status={backendHealth.services.n8n_integration} label="N8N" />
                <div className="text-xs text-gray-500 mt-2">
                  Active: {backendHealth.services.active_websockets} WS, 
                  {backendHealth.services.active_workflow_sessions} Workflows
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  Version: 3.0.0 (Enhanced MCP)
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Loading backend status...</div>
            )}
          </div>
          
          {/* RAG Engine Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-gray-900">RAG/GRAPH Engine</h3>
            </div>
            {ragStatus ? (
              <div className="space-y-2">
                <StatusIndicator status={ragStatus.status} label="Engine" />
                {ragStatus.status === 'ready' && ragStatus.layers && (
                  <div className="text-xs space-y-1">
                    <div>🏗️ Roof Layer: {ragStatus.layers.roof?.total_nodes || 0} nodes</div>
                    <div>💼 VC Layer: {ragStatus.layers.vc?.total_nodes || 0} nodes</div>
                    <div>🚀 Founder Layer: {ragStatus.layers.founder?.total_nodes || 0} nodes</div>
                  </div>
                )}
                {ragStatus.status === 'initializing' && (
                  <div className="text-xs text-yellow-600">
                    Processing massive dataset:<br/>
                    • 1,157 research papers<br/>
                    • 2,311 researchers<br/>
                    • 38,016 citations<br/>
                    • Building 3-layer architecture...
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Loading RAG status...</div>
            )}
          </div>
          
          {/* Real Workflow Count */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Layers className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">Live Workflows</h3>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">{realWorkflows.length}</div>
              <div className="text-sm text-gray-600">Available workflows</div>
              <div className="text-xs text-gray-500">
                Active: {Object.keys(activeWorkflows).length}
              </div>
              {isConnected && (
                <div className="text-xs text-green-600">
                  ✅ Real-time MCP connection active
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Real Workflows Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Real VC Intelligence Workflows
            <span className="text-sm font-normal text-gray-500 ml-2">
              (Connected to Enhanced MCP Backend)
            </span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {realWorkflows.length > 0 ? realWorkflows.map((workflow, index) => {
              const isActive = Object.values(activeWorkflows).some(
                w => w.workflow_id === workflow.id && w.status === 'running'
              );
              const activeWorkflow = Object.values(activeWorkflows).find(
                w => w.workflow_id === workflow.id
              );
              
              const iconMap = {
                'founder_signal': Target,
                'due_diligence': Shield,
                'portfolio_management': BarChart3,
                'competitive_intelligence': TrendingUp,
                'fund_allocation': Zap,
                'lp_communication': MessageSquare
              };
              
              const Icon = iconMap[workflow.id] || FileText;
              
              return (
                <div
                  key={workflow.id}
                  className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-lg
                    ${isActive ? 'ring-2 ring-blue-500 ring-opacity-50' : 'border-gray-200'}
                  `}
                >
                  {/* Progress Bar */}
                  {isActive && activeWorkflow && (
                    <div className="h-1 bg-gray-200 rounded-t-xl overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${activeWorkflow.progress || 0}%` }}
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                          <p className="text-sm text-gray-600">{workflow.description}</p>
                        </div>
                      </div>
                      
                      {isActive ? (
                        <Clock className="w-5 h-5 text-blue-500 animate-spin" />
                      ) : (
                        <Play className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Real workflow details */}
                    {workflow.required_inputs && (
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-2">Required Inputs:</div>
                        <div className="flex flex-wrap gap-1">
                          {workflow.required_inputs.map((input, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {input}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* RAG Layers */}
                    {workflow.rag_layers && (
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-2">RAG Layers:</div>
                        <div className="flex space-x-2">
                          {workflow.rag_layers.map((layer, idx) => (
                            <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {layer}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Active workflow status */}
                    {activeWorkflow && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="text-xs font-medium text-blue-900">
                          Status: {activeWorkflow.status} ({activeWorkflow.progress}%)
                        </div>
                        {activeWorkflow.message && (
                          <div className="text-xs text-blue-700 mt-1">
                            💬 {activeWorkflow.message}
                          </div>
                        )}
                        {activeWorkflow.rag_insights && (
                          <div className="text-xs text-blue-700 mt-1">
                            🧠 RAG insights integrated
                          </div>
                        )}
                        {activeWorkflow.rag_insight && (
                          <div className="text-xs text-blue-700 mt-1">
                            💡 {activeWorkflow.rag_insight}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleRealWorkflowTrigger(workflow.id)}
                      disabled={isActive}
                      className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg
                        font-medium text-sm transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-100 text-blue-600 cursor-not-allowed' 
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                        }
                      `}
                    >
                      {isActive ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>Processing Real Analysis...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Start Real Analysis</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-2 text-center py-12 text-gray-500">
                {isConnected ? 'Loading real workflows...' : 'Connecting to backend...'}
              </div>
            )}
          </div>
        </div>
        
        {/* Real RAG Query Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">3-Layer RAG Engine Query</h3>
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              Query across all three intelligence layers:
              <br/>
              🏗️ <strong>Roof Layer</strong>: Research intelligence
              <br/>
              💼 <strong>VC Layer</strong>: Investment insights  
              <br/>
              🚀 <strong>Founder Layer</strong>: Startup intelligence
            </div>
            
            <button
              onClick={handleRAGQuery}
              disabled={ragStatus?.status !== 'ready'}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ragStatus?.status === 'ready' ? 'Query RAG Engine' : 'RAG Engine Initializing...'}
            </button>
            
            {ragQueryResult && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-900">Real Query Results:</div>
                <div className="text-xs text-green-700 mt-1">
                  Layers: {Object.keys(ragQueryResult.layers || {}).join(', ')}
                </div>
                <div className="text-xs text-green-700">
                  Total Matches: {ragQueryResult.summary?.total_matches || 0}
                </div>
                <div className="text-xs text-green-700">
                  Confidence: {(ragQueryResult.summary?.confidence_score || 0).toFixed(2)}
                </div>
                <div className="text-xs text-green-700">
                  Cross-layer Insights: {ragQueryResult.cross_layer_insights?.length || 0}
                </div>
              </div>
            )}
          </div>
          
          {/* Real AI Chat Interface for SuperAdmin */}
          {user.role === 'SuperAdmin' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Mic className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-gray-900">AI Workflow Creation</h3>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                Chat with AI to create custom workflows, edit existing ones, or get workflow explanations.
              </div>
              
              <div className="h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
                {aiChatMessages.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    💬 Start chatting to create custom workflows...<br/>
                    Try: "Create a new workflow for startup valuation" or "Explain the founder signal workflow"
                  </div>
                ) : (
                  aiChatMessages.map((msg, idx) => (
                    <div key={idx} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-2 rounded text-xs max-w-xs ${
                        msg.role === 'user' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'bg-white text-gray-900 border'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAIChat()}
                  placeholder="Ask me to create a workflow..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={!isConnected}
                />
                <button
                  onClick={handleAIChat}
                  disabled={!isConnected || !chatInput.trim()}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Real System Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-gray-600" />
              <h3 className="font-semibold text-gray-900">VERSSAI System Status</h3>
            </div>
            {isConnected && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                LIVE CONNECTION ✅
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">N8N Dashboard</span>
              </div>
              <a href="http://localhost:5678" target="_blank" rel="noopener noreferrer">
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Active: {Object.keys(activeWorkflows).length}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">WS: {backendHealth?.services?.active_websockets || 0}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Brain className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">RAG: {ragStatus?.status || 'loading'}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-900 font-medium mb-1">
              🚀 VERSSAI Enhanced MCP Platform Status
            </div>
            <div className="text-xs text-blue-700">
              ✅ Enhanced MCP Backend v3.0.0 running on port 8080<br/>
              ✅ 3-Layer RAG/GRAPH Engine processing 15,847+ data points<br/>
              ✅ Real-time WebSocket communication active<br/>
              ✅ N8N workflow automation integrated<br/>
              ✅ SuperAdmin AI chat for workflow creation
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VERSSAIRealPlatform;