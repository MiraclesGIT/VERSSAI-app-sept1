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

// Real types based on your actual backend
interface RealWorkflowStatus {
  session_id: string;
  workflow_id: string;
  status: 'initializing' | 'running' | 'completed' | 'failed';
  progress: number;
  workflow_name?: string;
  start_time?: string;
  rag_insights?: any;
  estimated_duration?: number;
  message?: string;
}

interface BackendHealthStatus {
  status: string;
  timestamp: string;
  services: {
    api: string;
    enhanced_mcp_protocol: string;
    rag_graph_engine: string;
    n8n_integration: string;
    active_websockets: number;
    active_workflow_sessions: number;
    active_chat_sessions: number;
  };
}

interface RAGEngineStatus {
  status: string;
  layers?: {
    roof: any;
    vc: any;
    founder: any;
  };
  timestamp: string;
}

interface User {
  id: string;
  role: 'SuperAdmin' | 'VC_Partner' | 'Analyst' | 'Founder';
  name: string;
  organization: string;
}

// Real MCP Service that connects to your actual backend
class RealMCPService {
  private baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
  private ws: WebSocket | null = null;
  private messageHandlers: ((data: any) => void)[] = [];
  
  // Connect to your real Enhanced MCP Backend
  async connectWebSocket(userRole: string = 'superadmin'): Promise<void> {
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
  onMessage(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
  }
  
  // Send real commands to your MCP backend
  async sendCommand(command: any): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(command));
    } else {
      throw new Error('WebSocket not connected');
    }
  }
  
  // Get real backend health status
  async getBackendHealth(): Promise<BackendHealthStatus> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
  
  // Get real RAG engine status
  async getRAGStatus(): Promise<RAGEngineStatus> {
    const response = await fetch(`${this.baseUrl}/api/rag/status`);
    return response.json();
  }
  
  // Trigger real workflows
  async triggerRealWorkflow(workflowId: string, data: any): Promise<void> {
    await this.sendCommand({
      type: 'trigger_workflow',
      workflow_id: workflowId,
      data: data
    });
  }
  
  // Get real workflow list
  async getWorkflowList(): Promise<void> {
    await this.sendCommand({
      type: 'list_workflows'
    });
  }
  
  // Real RAG query
  async queryRAG(query: string, layerWeights: any): Promise<any> {
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
  async sendAIChat(message: string, chatSessionId?: string): Promise<void> {
    await this.sendCommand({
      type: 'ai_chat_workflow',
      message: message,
      chat_session_id: chatSessionId
    });
  }
}

const VERSSAIRealPlatform: React.FC = () => {
  // Real state management
  const [backendHealth, setBackendHealth] = useState<BackendHealthStatus | null>(null);
  const [ragStatus, setRAGStatus] = useState<RAGEngineStatus | null>(null);
  const [realWorkflows, setRealWorkflows] = useState<any[]>([]);
  const [activeWorkflows, setActiveWorkflows] = useState<Record<string, RealWorkflowStatus>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [aiChatMessages, setAIChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [ragQueryResult, setRAGQueryResult] = useState<any>(null);
  
  const mcpService = useRef(new RealMCPService());
  
  const user: User = {
    id: 'real_user_001',
    role: 'SuperAdmin',
    name: 'VERSSAI Admin',
    organization: 'VERSSAI Intelligence'
  };
  
  // Initialize real connections
  useEffect(() => {
    const initializeRealPlatform = async () => {
      try {
        // Get real backend health
        const health = await mcpService.current.getBackendHealth();
        setBackendHealth(health);
        
        // Get real RAG status
        const rag = await mcpService.current.getRAGStatus();
        setRAGStatus(rag);
        
        // Connect to real WebSocket
        await mcpService.current.connectWebSocket(user.role.toLowerCase());
        setIsConnected(true);
        
        // Subscribe to real messages
        mcpService.current.onMessage((data) => {
          console.log('Real MCP Message:', data);
          
          if (data.type === 'workflow_list') {
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
                message: data.message
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
      }
    };
    
    initializeRealPlatform();
    
    // Refresh data every 10 seconds
    const interval = setInterval(async () => {
      try {
        const health = await mcpService.current.getBackendHealth();
        setBackendHealth(health);
        
        const rag = await mcpService.current.getRAGStatus();
        setRAGStatus(rag);
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Real workflow triggering
  const handleRealWorkflowTrigger = async (workflowId: string) => {
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
        'machine learning startup founder analysis venture capital',
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
  const StatusIndicator = ({ status, label }: { status: string; label: string }) => {
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
            
            {/* Live Status Indicators */}
            <div className="flex items-center space-x-4 text-xs">
              <StatusIndicator 
                status={isConnected ? 'connected' : 'disconnected'} 
                label="MCP" 
              />
              <StatusIndicator 
                status={backendHealth?.services?.rag_graph_engine || 'unknown'} 
                label="RAG" 
              />
              <StatusIndicator 
                status={backendHealth?.services?.n8n_integration || 'unknown'} 
                label="N8N" 
              />
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
              </div>
            ) : (
              <div className="text-gray-500">Loading...</div>
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
                    Processing massive dataset (15,847+ entries)...
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Loading...</div>
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
            </div>
          </div>
        </div>
        
        {/* Real Workflows Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Real VC Intelligence Workflows</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {realWorkflows.map((workflow, index) => {
              const isActive = Object.values(activeWorkflows).some(
                w => w.workflow_id === workflow.id && w.status === 'running'
              );
              const activeWorkflow = Object.values(activeWorkflows).find(
                w => w.workflow_id === workflow.id
              );
              
              const iconMap: Record<string, any> = {
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
                          {workflow.required_inputs.map((input: string, idx: number) => (
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
                          {workflow.rag_layers.map((layer: string, idx: number) => (
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
                            {activeWorkflow.message}
                          </div>
                        )}
                        {activeWorkflow.rag_insights && (
                          <div className="text-xs text-blue-700 mt-1">
                            🧠 RAG insights available
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
                          <span>Processing...</span>
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
            })}
          </div>
        </div>
        
        {/* Real RAG Query Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">RAG Intelligence Query</h3>
            </div>
            <button
              onClick={handleRAGQuery}
              disabled={ragStatus?.status !== 'ready'}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Query 3-Layer RAG Engine
            </button>
            
            {ragQueryResult && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-900">Query Results:</div>
                <div className="text-xs text-green-700 mt-1">
                  Layers: {Object.keys(ragQueryResult.layers || {}).join(', ')}
                </div>
                <div className="text-xs text-green-700">
                  Matches: {ragQueryResult.summary?.total_matches || 0}
                </div>
                <div className="text-xs text-green-700">
                  Confidence: {ragQueryResult.summary?.confidence_score || 0}
                </div>
              </div>
            )}
          </div>
          
          {/* Real AI Chat Interface for SuperAdmin */}
          {user.role === 'SuperAdmin' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Mic className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-gray-900">AI Workflow Chat</h3>
              </div>
              
              <div className="h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 mb-3">
                {aiChatMessages.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    Start chatting to create custom workflows...
                  </div>
                ) : (
                  aiChatMessages.map((msg, idx) => (
                    <div key={idx} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-2 rounded text-xs ${
                        msg.role === 'user' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'bg-gray-100 text-gray-900'
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={handleAIChat}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Real N8N Integration Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-gray-600" />
              <h3 className="font-semibold text-gray-900">N8N Integration Status</h3>
            </div>
            {backendHealth?.services?.n8n_integration === 'ready' && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                LIVE CONNECTION
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <span className="font-medium text-gray-900">WebSockets: {backendHealth?.services?.active_websockets || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VERSSAIRealPlatform;