import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, Play, Clock, CheckCircle, AlertCircle, Settings, Zap, TrendingUp,
  Shield, Users, Target, BarChart3, MessageSquare, Monitor, Activity, Database,
  Brain, Layers, Cpu, Globe, FileText, BarChart, Send, Mic, Star, Award,
  Sparkles, ArrowUp, ArrowDown, Eye, Filter, Search, Download, Upload,
  Calendar, Bell, User, LogOut, HelpCircle, ExternalLink, RefreshCw
} from 'lucide-react';

// Enhanced MCP Service for VERSSAI Platform
class VERSSAIEnhancedMCPService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
    this.ws = null;
    this.messageHandlers = [];
    this.isConnected = false;
  }
  
  async connectWebSocket(userRole = 'superadmin') {
    const wsUrl = `ws://localhost:8080/mcp?user_role=${userRole}`;
    
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('🔌 Connected to VERSSAI Enhanced MCP Backend');
        this.isConnected = true;
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
        this.isConnected = false;
        reject(error);
      };
      
      this.ws.onclose = () => {
        console.log('🔌 MCP WebSocket disconnected');
        this.isConnected = false;
      };
    });
  }
  
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }
  
  async sendCommand(command) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(command));
    } else {
      throw new Error('WebSocket not connected');
    }
  }
  
  async getBackendHealth() {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
  
  async getRAGStatus() {
    const response = await fetch(`${this.baseUrl}/api/rag/status`);
    return response.json();
  }
  
  async triggerWorkflow(workflowId, data) {
    await this.sendCommand({
      type: 'trigger_workflow',
      workflow_id: workflowId,
      data: data
    });
  }
  
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
  
  async getDatasetStats() {
    const response = await fetch(`${this.baseUrl}/api/dataset/stats`);
    return response.json();
  }
  
  async searchResearchers(query, filters = {}) {
    const response = await fetch(`${this.baseUrl}/api/researchers/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, filters })
    });
    return response.json();
  }
  
  async getInstitutionAnalysis() {
    const response = await fetch(`${this.baseUrl}/api/institutions/analysis`);
    return response.json();
  }
}

const VERSSAIEnhancedPlatform = () => {
  // State management
  const [backendHealth, setBackendHealth] = useState(null);
  const [ragStatus, setRAGStatus] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [activeWorkflows, setActiveWorkflows] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [ragQueryResult, setRAGQueryResult] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showRAGDetails, setShowRAGDetails] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [datasetStats, setDatasetStats] = useState(null);
  const [showDatasetViewer, setShowDatasetViewer] = useState(false);
  
  const mcpService = useRef(new VERSSAIEnhancedMCPService());
  
  const user = {
    id: 'verssai_admin_001',
    role: 'SuperAdmin',
    name: 'VERSSAI Administrator',
    organization: 'VERSSAI Intelligence Platform',
    avatar: '👨‍💼'
  };
  
  // Initialize platform
  useEffect(() => {
    const initializePlatform = async () => {
      try {
        setConnectionStatus('🔄 Connecting to VERSSAI Backend...');
        
        // Get backend health
        const health = await mcpService.current.getBackendHealth();
        setBackendHealth(health);
        setConnectionStatus('✅ Backend connected');
        
        // Get RAG status
        const rag = await mcpService.current.getRAGStatus();
        setRAGStatus(rag);
        
        // Get dataset statistics
        try {
          const stats = await mcpService.current.getDatasetStats();
          setDatasetStats(stats);
        } catch (error) {
          console.log('Dataset stats not available yet:', error);
        }
        
        // Connect WebSocket
        setConnectionStatus('🔌 Establishing real-time connection...');
        await mcpService.current.connectWebSocket(user.role.toLowerCase());
        setIsConnected(true);
        setConnectionStatus('🚀 VERSSAI Platform LIVE');
        
        // Add success notification
        addNotification('success', 'VERSSAI Platform connected successfully');
        
        // Setup message handlers
        mcpService.current.onMessage((data) => {
          console.log('📨 Real-time message:', data);
          
          if (data.type === 'workflow_list') {
            setWorkflows(data.workflows || []);
          } else if (data.type === 'workflow_started') {
            setActiveWorkflows(prev => ({
              ...prev,
              [data.session_id]: {
                ...data,
                progress: 0,
                startTime: Date.now()
              }
            }));
            addNotification('info', `Started: ${data.workflow_name}`);
          } else if (data.type === 'workflow_progress') {
            setActiveWorkflows(prev => ({
              ...prev,
              [data.session_id]: {
                ...prev[data.session_id],
                ...data
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
            addNotification('success', `Completed: ${prev[data.session_id]?.workflow_name || 'Workflow'}`);
          }
        });
        
        // Get workflows
        await mcpService.current.sendCommand({ type: 'list_workflows' });
        
      } catch (error) {
        console.error('Platform initialization failed:', error);
        setConnectionStatus(`❌ Connection failed: ${error.message}`);
        addNotification('error', 'Failed to connect to VERSSAI Backend');
      }
    };
    
    initializePlatform();
  }, []);
  
  // Helper functions
  const addNotification = (type, message) => {
    const notification = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };
  
  const triggerWorkflow = async (workflowId) => {
    try {
      const sampleData = {
        user_id: user.id,
        organization: user.organization,
        triggered_by: user.name,
        timestamp: new Date().toISOString(),
        // Workflow-specific data
        ...(workflowId === 'founder_signal' && {
          founder_name: 'Dr. Sarah Chen',
          company_name: 'Neural Dynamics AI',
          industry: 'Artificial Intelligence',
          stage: 'Series A',
          funding_target: '$5M'
        }),
        ...(workflowId === 'due_diligence' && {
          company_name: 'Neural Dynamics AI',
          analysis_type: 'comprehensive_dd',
          document_count: 47,
          priority: 'high'
        }),
        ...(workflowId === 'portfolio_management' && {
          portfolio_size: 23,
          analysis_period: '12_months',
          focus_metrics: ['IRR', 'MOIC', 'DPI']
        })
      };
      
      await mcpService.current.triggerWorkflow(workflowId, sampleData);
      addNotification('info', 'Workflow triggered successfully');
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
      addNotification('error', 'Failed to trigger workflow');
    }
  };
  
  const performRAGQuery = async () => {
    try {
      setShowRAGDetails(true);
      const result = await mcpService.current.queryRAG(
        'high-potential AI startup founders with machine learning expertise venture capital investment opportunity',
        { roof: 0.4, vc: 0.3, founder: 0.3 }
      );
      setRAGQueryResult(result);
      addNotification('success', `RAG Query: ${result.summary?.total_matches || 0} matches found`);
    } catch (error) {
      console.error('RAG query failed:', error);
      addNotification('error', 'RAG query failed');
    }
  };
  
  // Status indicator component
  const StatusBadge = ({ status, size = 'sm' }) => {
    const getStatusConfig = () => {
      switch (status) {
        case 'ready':
        case 'running':
        case 'healthy':
          return { color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' };
        case 'initializing':
          return { color: 'bg-yellow-500 animate-pulse', text: 'text-yellow-700', bg: 'bg-yellow-50' };
        case 'completed':
          return { color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' };
        default:
          return { color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' };
      }
    };
    
    const config = getStatusConfig();
    const sizeClass = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';
    
    return (
      <div className={`inline-flex items-center space-x-2 px-2 py-1 rounded-full ${config.bg}`}>
        <div className={`${sizeClass} rounded-full ${config.color}`}></div>
        <span className={`text-xs font-medium ${config.text}`}>{status}</span>
      </div>
    );
  };
  
  // Notification component
  const NotificationToast = ({ notification, onDismiss }) => {
    const getNotificationConfig = () => {
      switch (notification.type) {
        case 'success':
          return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
        case 'error':
          return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
        case 'info':
          return { icon: Monitor, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
        default:
          return { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
      }
    };
    
    const config = getNotificationConfig();
    const Icon = config.icon;
    
    return (
      <div className={`flex items-start space-x-3 p-4 rounded-lg border ${config.bg} ${config.border} shadow-sm`}>
        <Icon className={`w-5 h-5 ${config.color} mt-0.5`} />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(notification.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={() => onDismiss(notification.id)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    );
  };
  
  // Dataset viewer component
  const DatasetViewer = () => {
    if (!showDatasetViewer || !datasetStats) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-auto">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">VERSSAI Dataset Overview</h3>
              <p className="text-gray-600">Comprehensive VC Intelligence Data</p>
            </div>
            <button
              onClick={() => setShowDatasetViewer(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{datasetStats.total_references || 1157}</div>
                <div className="text-sm text-blue-700">Research Papers</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">{datasetStats.total_researchers || 2311}</div>
                <div className="text-sm text-purple-700">Researchers</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{datasetStats.total_institutions || 24}</div>
                <div className="text-sm text-green-700">Institutions</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-600">{datasetStats.total_citations || 38015}</div>
                <div className="text-sm text-orange-700">Citations</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-2">Top Research Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(datasetStats.top_categories || {}).map(([category, count]) => (
                    <span key={category} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {category}: {count}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-2">Dataset Quality Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Average Citations/Paper:</span>
                    <span className="font-medium ml-2">{datasetStats.avg_citations_per_paper || 32.86}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Statistical Significance Rate:</span>
                    <span className="font-medium ml-2">{((datasetStats.statistical_significance_rate || 0.766) * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Open Access Rate:</span>
                    <span className="font-medium ml-2">{((datasetStats.open_access_rate || 0.623) * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Year Range:</span>
                    <span className="font-medium ml-2">{datasetStats.year_range || '2015-2024'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Branding */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    VERSSAI
                  </h1>
                  <p className="text-xs text-gray-500">VC Intelligence Platform v3.0</p>
                </div>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                <span className="text-sm font-medium text-gray-700">{connectionStatus}</span>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-6">
              <nav className="flex space-x-1">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: Monitor },
                  { id: 'workflows', label: 'Workflows', icon: Layers },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${currentView === item.id 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
                  <User className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Notifications */}
      <div className="fixed top-20 right-6 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
          />
        ))}
      </div>
      
      {/* Dataset Viewer Modal */}
      <DatasetViewer />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Backend Health */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <StatusBadge status={backendHealth?.services?.api || 'loading'} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Backend Status</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">API Server</span>
                <StatusBadge status={backendHealth?.services?.api || 'loading'} size="xs" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">MCP Protocol</span>
                <StatusBadge status={backendHealth?.services?.enhanced_mcp_protocol || 'loading'} size="xs" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">RAG Engine</span>
                <StatusBadge status={backendHealth?.services?.rag_graph_engine || 'loading'} size="xs" />
              </div>
            </div>
          </div>
          
          {/* RAG Intelligence */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <StatusBadge status={ragStatus?.status || 'loading'} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">RAG Intelligence</h3>
            {ragStatus?.layers && (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Nodes</span>
                  <span className="font-medium">{ragStatus.layers.total_nodes || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Research Papers</span>
                  <span className="font-medium">{ragStatus.layers.roof?.total_nodes || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">VC Insights</span>
                  <span className="font-medium">{ragStatus.layers.vc?.total_nodes || 0}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Dataset Stats */}
          <div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={() => setShowDatasetViewer(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{datasetStats?.total_references || 1157}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">VERSSAI Dataset</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Papers</span>
                <span className="font-medium">{datasetStats?.total_references || 1157}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Researchers</span>
                <span className="font-medium">{datasetStats?.total_researchers || 2311}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Citations</span>
                <span className="font-medium">{datasetStats?.total_citations || 38015}</span>
              </div>
            </div>
          </div>
          
          {/* Active Workflows */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{Object.keys(activeWorkflows).length}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Workflows</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Available</span>
                <span className="font-medium">{workflows.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Running</span>
                <span className="font-medium text-blue-600">
                  {Object.values(activeWorkflows).filter(w => w.status === 'running').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium text-green-600">
                  {Object.values(activeWorkflows).filter(w => w.status === 'completed').length}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Workflows Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">VC Intelligence Workflows</h2>
              <p className="text-gray-600 mt-1">
                AI-powered automation for venture capital decision making
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={performRAGQuery}
                disabled={ragStatus?.status !== 'ready'}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Database className="w-4 h-4" />
                <span>Query RAG Engine</span>
              </button>
              <button 
                onClick={() => setShowDatasetViewer(true)}
                className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>View Dataset</span>
              </button>
              <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          {/* Enhanced Workflows Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workflows.length > 0 ? workflows.map((workflow) => {
              const isActive = Object.values(activeWorkflows).some(
                w => w.workflow_id === workflow.id && w.status === 'running'
              );
              const activeWorkflow = Object.values(activeWorkflows).find(
                w => w.workflow_id === workflow.id
              );
              
              const iconMap = {
                'founder_signal': { icon: Target, gradient: 'from-blue-500 to-purple-500' },
                'due_diligence': { icon: Shield, gradient: 'from-green-500 to-emerald-500' },
                'portfolio_management': { icon: BarChart3, gradient: 'from-orange-500 to-red-500' },
                'competitive_intelligence': { icon: TrendingUp, gradient: 'from-purple-500 to-pink-500' },
                'fund_allocation': { icon: Zap, gradient: 'from-yellow-500 to-orange-500' },
                'lp_communication': { icon: MessageSquare, gradient: 'from-cyan-500 to-blue-500' }
              };
              
              const config = iconMap[workflow.id] || { icon: FileText, gradient: 'from-gray-500 to-gray-600' };
              const Icon = config.icon;
              
              return (
                <div
                  key={workflow.id}
                  className={`group bg-white/80 backdrop-blur-sm rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
                    ${isActive 
                      ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-xl' 
                      : 'border-gray-200/50 shadow-lg hover:border-blue-200'
                    }
                  `}
                >
                  {/* Progress Bar */}
                  {isActive && activeWorkflow && (
                    <div className="h-1 bg-gray-200 rounded-t-2xl overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${activeWorkflow.progress || 0}%` }}
                      />
                    </div>
                  )}
                  
                  <div className="p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 bg-gradient-to-r ${config.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {workflow.name}
                          </h3>
                          <p className="text-gray-600 mt-1">{workflow.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              ~{workflow.estimated_duration}s processing time
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isActive ? (
                          <div className="flex items-center space-x-2 text-blue-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">Processing</span>
                          </div>
                        ) : (
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Workflow Details */}
                    <div className="space-y-4 mb-6">
                      {/* Required Inputs */}
                      {workflow.required_inputs && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">Required Inputs:</div>
                          <div className="flex flex-wrap gap-2">
                            {workflow.required_inputs.map((input, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                                {input.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* RAG Layers */}
                      {workflow.rag_layers && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">Intelligence Layers:</div>
                          <div className="flex space-x-2">
                            {workflow.rag_layers.map((layer, idx) => {
                              const layerConfig = {
                                'roof': { label: 'Research', color: 'bg-blue-100 text-blue-700' },
                                'vc': { label: 'VC Insights', color: 'bg-purple-100 text-purple-700' },
                                'founder': { label: 'Founder Intel', color: 'bg-green-100 text-green-700' }
                              };
                              const config = layerConfig[layer] || { label: layer, color: 'bg-gray-100 text-gray-700' };
                              return (
                                <span key={idx} className={`text-xs px-3 py-1 rounded-full ${config.color}`}>
                                  {config.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Active Status */}
                      {activeWorkflow && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium text-blue-900">
                                {activeWorkflow.status} ({activeWorkflow.progress}%)
                              </span>
                            </div>
                            {activeWorkflow.startTime && (
                              <span className="text-xs text-blue-700">
                                {Math.floor((Date.now() - activeWorkflow.startTime) / 1000)}s
                              </span>
                            )}
                          </div>
                          {activeWorkflow.message && (
                            <div className="text-sm text-blue-800 mb-2">
                              💬 {activeWorkflow.message}
                            </div>
                          )}
                          {activeWorkflow.rag_insights && (
                            <div className="text-sm text-purple-800">
                              🧠 RAG insights: {activeWorkflow.rag_insights}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Button */}
                    <button
                      onClick={() => triggerWorkflow(workflow.id)}
                      disabled={isActive || !isConnected}
                      className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl
                        font-semibold text-sm transition-all duration-200 shadow-lg
                        ${isActive 
                          ? 'bg-blue-100 text-blue-600 cursor-not-allowed' 
                          : isConnected
                            ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 hover:shadow-xl transform hover:scale-105'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      {isActive ? (
                        <>
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing AI Analysis...</span>
                        </>
                      ) : !isConnected ? (
                        <>
                          <AlertCircle className="w-5 h-5" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          <span>Start Intelligence Analysis</span>
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Layers className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Workflows</h3>
                <p className="text-gray-600 mb-4">
                  {isConnected ? 'Fetching available workflows...' : 'Establishing connection to VERSSAI Backend...'}
                </p>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* RAG Query Results */}
        {showRAGDetails && ragQueryResult && (
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">RAG Query Results</h3>
                    <p className="text-gray-600">3-Layer Intelligence Analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRAGDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{ragQueryResult.summary?.total_matches || 0}</div>
                  <div className="text-sm text-blue-700">Total Matches</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">
                    {(ragQueryResult.summary?.confidence_score * 100 || 0).toFixed(0)}%
                  </div>
                  <div className="text-sm text-purple-700">Confidence Score</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">
                    {ragQueryResult.cross_layer_insights?.length || 0}
                  </div>
                  <div className="text-sm text-green-700">Cross-Layer Insights</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">AI Recommendation:</div>
                <div className="text-sm text-gray-900">{ragQueryResult.summary?.recommendation}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* System Status Footer */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">VERSSAI Platform Status</h3>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">All Systems Operational</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="http://localhost:5678"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">N8N Dashboard</span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </a>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Active Workflows</span>
              </div>
              <span className="text-lg font-bold text-green-600">{Object.keys(activeWorkflows).length}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">WebSockets</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{backendHealth?.services?.active_websockets || 0}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Brain className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-900">RAG Engine</span>
              </div>
              <StatusBadge status={ragStatus?.status || 'loading'} size="sm" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VERSSAIEnhancedPlatform;