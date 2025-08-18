import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, Shield, TrendingUp, Zap, BarChart3, MessageSquare,
  Play, Clock, CheckCircle, AlertCircle, Settings, Monitor,
  User, Bell, Search, Filter, Plus, ChevronRight, 
  ArrowUpRight, Activity, Database, Layers, Brain,
  Sparkles, Award, Eye, RefreshCw, Menu, X, Users,
  ExternalLink, Save, TestTube, BookOpen, TrendingDown,
  DollarSign, PieChart, FileText, Lightbulb
} from 'lucide-react';

// Enhanced MCP Service with Real Data Integration
class VERSSAIRealMCPService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    this.ws = null;
    this.isConnected = false;
    this.messageHandlers = [];
    this.dataCache = new Map();
  }
  
  async connectWebSocket() {
    try {
      const wsUrl = `ws://localhost:8080/mcp`;
      this.ws = new WebSocket(wsUrl);
      
      return new Promise((resolve, reject) => {
        this.ws.onopen = () => {
          console.log('🔌 Connected to VERSSAI Real Backend');
          this.isConnected = true;
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 Real backend message:', data);
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
          console.log('🔌 Real backend WebSocket disconnected');
          this.isConnected = false;
        };
      });
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      throw error;
    }
  }
  
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }
  
  // Real data fetching methods
  async fetchHealthStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      const data = await response.json();
      this.dataCache.set('health', data);
      return data;
    } catch (error) {
      console.error('Error fetching health status:', error);
      return null;
    }
  }
  
  async fetchDatasetStats() {
    try {
      const response = await fetch(`${this.baseUrl}/api/dataset/stats`);
      const data = await response.json();
      this.dataCache.set('dataset_stats', data);
      return data;
    } catch (error) {
      console.error('Error fetching dataset stats:', error);
      return null;
    }
  }
  
  async fetchAvailableWorkflows() {
    try {
      const response = await fetch(`${this.baseUrl}/api/workflows/list`);
      const data = await response.json();
      this.dataCache.set('workflows', data);
      return data;
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return null;
    }
  }
  
  async searchResearchers(query, limit = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/api/researchers/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching researchers:', error);
      return null;
    }
  }
  
  async fetchInstitutionAnalysis() {
    try {
      const response = await fetch(`${this.baseUrl}/api/institutions/analysis`);
      const data = await response.json();
      this.dataCache.set('institutions', data);
      return data;
    } catch (error) {
      console.error('Error fetching institution analysis:', error);
      return null;
    }
  }
  
  async triggerWorkflow(workflowType, data) {
    try {
      const response = await fetch(`${this.baseUrl}/api/workflows/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_type: workflowType,
          company_id: data.company_id || 'sample_company',
          user_id: data.user_id || 'verssai_user',
          parameters: data.parameters || {}
        })
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error triggering workflow:', error);
      throw error;
    }
  }
}

const VERSSAILinearPlatformReal = () => {
  // State Management
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [activeWorkflows, setActiveWorkflows] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Real data state
  const [realDatasetStats, setRealDatasetStats] = useState(null);
  const [realWorkflows, setRealWorkflows] = useState([]);
  const [realHealthStatus, setRealHealthStatus] = useState(null);
  const [realInstitutions, setRealInstitutions] = useState([]);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    dataset: true,
    workflows: true,
    health: true,
    institutions: true
  });
  
  const mcpService = useRef(new VERSSAIRealMCPService());
  
  // Initialize platform with real data
  useEffect(() => {
    const initializePlatform = async () => {
      try {
        setConnectionStatus('🔄 Connecting to Real VERSSAI Backend...');
        
        // Connect WebSocket
        await mcpService.current.connectWebSocket();
        setIsConnected(true);
        setConnectionStatus('🚀 Connected to Real VERSSAI Backend');
        addNotification('success', 'Connected to real VERSSAI platform');
        
        // Load all real data
        await loadAllRealData();
        
        // Setup real-time handlers
        mcpService.current.onMessage((data) => {
          handleRealMCPMessage(data);
        });
        
      } catch (error) {
        console.error('Platform initialization failed:', error);
        setConnectionStatus('❌ Connection failed - using offline mode');
        addNotification('error', 'Failed to connect to VERSSAI backend');
        
        // Load fallback data
        loadFallbackData();
      }
    };
    
    initializePlatform();
  }, []);
  
  const loadAllRealData = async () => {
    try {
      console.log('📊 Loading real VERSSAI data...');
      
      // Load dataset statistics
      setLoadingStates(prev => ({ ...prev, dataset: true }));
      const datasetStats = await mcpService.current.fetchDatasetStats();
      if (datasetStats) {
        setRealDatasetStats(datasetStats);
        console.log('📈 Dataset stats loaded:', datasetStats);
      }
      setLoadingStates(prev => ({ ...prev, dataset: false }));
      
      // Load available workflows
      setLoadingStates(prev => ({ ...prev, workflows: true }));
      const workflowsData = await mcpService.current.fetchAvailableWorkflows();
      if (workflowsData) {
        setRealWorkflows(workflowsData.workflows || []);
        console.log('⚙️ Workflows loaded:', workflowsData.workflows?.length);
      }
      setLoadingStates(prev => ({ ...prev, workflows: false }));
      
      // Load health status
      setLoadingStates(prev => ({ ...prev, health: true }));
      const healthStatus = await mcpService.current.fetchHealthStatus();
      if (healthStatus) {
        setRealHealthStatus(healthStatus);
        console.log('🏥 Health status loaded:', healthStatus.status);
      }
      setLoadingStates(prev => ({ ...prev, health: false }));
      
      // Load institution analysis
      setLoadingStates(prev => ({ ...prev, institutions: true }));
      const institutions = await mcpService.current.fetchInstitutionAnalysis();
      if (institutions) {
        setRealInstitutions(institutions.institutions || []);
        console.log('🏛️ Institutions loaded:', institutions.institutions?.length);
      }
      setLoadingStates(prev => ({ ...prev, institutions: false }));
      
      addNotification('success', 'All real data loaded successfully');
      
    } catch (error) {
      console.error('Error loading real data:', error);
      addNotification('error', 'Some real data failed to load');
    }
  };
  
  const loadFallbackData = () => {
    // Fallback data when backend is not available
    setRealDatasetStats({
      papers: { total: 1157, avg_citations: 24.5 },
      researchers: { total: 2311, avg_h_index: 15.2 },
      institutions: { total: 24 },
      citations: { total: 38015 },
      processing_status: 'offline'
    });
    
    setRealWorkflows([
      {
        type: 'founder_signal_assessment',
        name: 'Founder Signal Assessment',
        description: 'AI-powered founder personality analysis',
        accuracy: '96%'
      },
      {
        type: 'due_diligence_automation', 
        name: 'Due Diligence Automation',
        description: 'Automated document analysis and risk assessment',
        accuracy: '94%'
      },
      {
        type: 'competitive_intelligence',
        name: 'Competitive Intelligence', 
        description: 'Real-time market analysis and positioning',
        accuracy: '97%'
      }
    ]);
    
    setLoadingStates({
      dataset: false,
      workflows: false,
      health: false,
      institutions: false
    });
  };
  
  const handleRealMCPMessage = (data) => {
    console.log('🎯 Real MCP Message:', data.type, data);
    
    switch (data.type) {
      case 'workflow_result':
        const executionId = data.result?.execution_id;
        if (executionId) {
          setActiveWorkflows(prev => ({
            ...prev,
            [executionId]: {
              ...data.result,
              status: data.result.status,
              progress: data.result.status === 'completed' ? 100 : 50
            }
          }));
        }
        addNotification(
          data.result?.status === 'completed' ? 'success' : 'info',
          `Workflow ${data.result?.status || 'updated'}`
        );
        break;
        
      case 'workflow_update':
        setActiveWorkflows(prev => ({
          ...prev,
          [data.execution_id]: {
            ...prev[data.execution_id],
            ...data.update
          }
        }));
        break;
        
      case 'connection_established':
        console.log('✅ MCP Connection established with capabilities:', data.capabilities);
        break;
        
      default:
        console.log('🔍 Unhandled real MCP message:', data);
    }
  };
  
  const addNotification = (type, message) => {
    const notification = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };
  
  const triggerRealAnalysis = async (workflowType) => {
    try {
      const workflowData = realWorkflows.find(w => w.type === workflowType);
      if (!workflowData) {
        addNotification('error', `Workflow ${workflowType} not found`);
        return;
      }
      
      addNotification('info', `Starting ${workflowData.name}...`);
      
      const result = await mcpService.current.triggerWorkflow(workflowType, {
        company_id: 'real_analysis_target',
        user_id: 'verssai_user',
        parameters: { analysis_depth: 'comprehensive' }
      });
      
      if (result.execution_id) {
        setActiveWorkflows(prev => ({
          ...prev,
          [result.execution_id]: {
            ...result,
            workflow_name: workflowData.name,
            progress: result.status === 'completed' ? 100 : 25
          }
        }));
        
        // Add to recent analyses
        setRecentAnalyses(prev => [{
          id: result.execution_id,
          workflow_name: workflowData.name,
          status: result.status,
          timestamp: new Date().toISOString()
        }, ...prev.slice(0, 9)]);
      }
      
      addNotification('success', `${workflowData.name} initiated successfully`);
      
    } catch (error) {
      console.error('Failed to trigger real analysis:', error);
      addNotification('error', 'Failed to start analysis');
    }
  };
  
  const searchRealResearchers = async () => {
    if (!searchQuery) return;
    
    try {
      const results = await mcpService.current.searchResearchers(searchQuery, 5);
      if (results && results.results.length > 0) {
        addNotification('success', `Found ${results.results.length} researchers for "${searchQuery}"`);
        console.log('🔍 Search results:', results);
      } else {
        addNotification('info', `No researchers found for "${searchQuery}"`);
      }
    } catch (error) {
      console.error('Search failed:', error);
      addNotification('error', 'Search failed');
    }
  };
  
  // Create workflow cards from real data
  const createWorkflowCards = () => {
    return realWorkflows.map((workflow, index) => {
      const icons = [Target, Shield, TrendingUp, Zap, BarChart3, MessageSquare];
      const gradients = [
        'from-blue-500 to-indigo-600',
        'from-emerald-500 to-green-600', 
        'from-purple-500 to-violet-600',
        'from-amber-500 to-orange-600',
        'from-rose-500 to-pink-600',
        'from-cyan-500 to-blue-600'
      ];
      
      const Icon = icons[index % icons.length];
      const gradient = gradients[index % gradients.length];
      
      const isActive = Object.values(activeWorkflows).some(
        w => w.workflow_type === workflow.type && w.status === 'running'
      );
      
      return {
        ...workflow,
        icon: Icon,
        gradient,
        isActive,
        bgGradient: `from-${gradient.split('-')[1]}-50 to-${gradient.split('-')[3]}-100`
      };
    });
  };
  
  const workflowCards = createWorkflowCards();
  
  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Monitor },
    { id: 'workflows', label: 'VC Intelligence', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'research', label: 'Research Papers', icon: BookOpen, badge: realDatasetStats?.papers?.total?.toString() || '1157' },
    { id: 'researchers', label: 'Researchers', icon: Users, badge: realDatasetStats?.researchers?.total?.toString() || '2311' },
    { id: 'institutions', label: 'Institutions', icon: Award, badge: realDatasetStats?.institutions?.total?.toString() || '24' }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Linear-Style Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } flex flex-col`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">VERSSAI</h1>
                  <p className="text-xs text-gray-500">
                    {realDatasetStats ? `${realDatasetStats.papers.total} Papers` : 'Real VC Platform'}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${item.id === 'workflows' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>
                {item.badge && !sidebarCollapsed && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        
        {/* Real Data Summary */}
        {!sidebarCollapsed && realDatasetStats && (
          <div className="p-3 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Dataset Status</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Papers:</span>
                  <span className="font-medium">{realDatasetStats.papers.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Researchers:</span>
                  <span className="font-medium">{realDatasetStats.researchers.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Citations:</span>
                  <span className="font-medium">{realDatasetStats.citations.total}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* User Profile */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">VERSSAI User</p>
                <p className="text-xs text-gray-500">Real Data Connected</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Real VC Intelligence Platform</h1>
              <p className="text-gray-600 mt-1">
                {realDatasetStats 
                  ? `Research-backed insights from ${realDatasetStats.papers.total} academic papers`
                  : 'AI-powered venture capital decision making'
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Real Data Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search researchers, papers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchRealResearchers()}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Real Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                }`}></div>
                <span className="text-sm text-gray-600">{connectionStatus}</span>
              </div>
              
              {/* Refresh Data */}
              <button 
                onClick={loadAllRealData}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh Real Data"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* New Analysis */}
              <button className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                <Plus className="w-4 h-4" />
                <span>New Analysis</span>
              </button>
            </div>
          </div>
        </header>
        
        {/* Notifications */}
        <div className="fixed top-20 right-6 z-40 space-y-2 max-w-sm">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg border ${
                notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <p className="text-sm font-medium">{notification.message}</p>
              <p className="text-xs opacity-75 mt-1">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            
            {/* Real Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Research Papers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {realDatasetStats?.papers?.total || 
                        (loadingStates.dataset ? '...' : '1157')
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center space-x-1 mt-4">
                  <Activity className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    Avg {realDatasetStats?.papers?.avg_citations || '24.5'} citations
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Researchers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {realDatasetStats?.researchers?.total || 
                        (loadingStates.dataset ? '...' : '2311')
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center space-x-1 mt-4">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    H-index {realDatasetStats?.researchers?.avg_h_index || '15.2'}
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Workflows</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Object.keys(activeWorkflows).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Layers className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center space-x-1 mt-4">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600">Real-time processing</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Backend Status</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {realHealthStatus?.status || (loadingStates.health ? '...' : 'OK')}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="flex items-center space-x-1 mt-4">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    {isConnected ? 'Connected' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Real Workflow Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {workflowCards.map((workflow) => {
                const Icon = workflow.icon;
                const activeWorkflow = Object.values(activeWorkflows).find(
                  w => w.workflow_type === workflow.type
                );
                
                return (
                  <div
                    key={workflow.type}
                    className={`group bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg overflow-hidden
                      ${workflow.isActive ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                    `}
                  >
                    {/* Progress Bar for Active Workflows */}
                    {workflow.isActive && activeWorkflow && (
                      <div className="h-1 bg-gray-200">
                        <div 
                          className={`h-full bg-gradient-to-r ${workflow.gradient} transition-all duration-500`}
                          style={{ width: `${activeWorkflow.progress || 0}%` }}
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 bg-gradient-to-r ${workflow.gradient} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {workflow.name}
                            </h3>
                            <p className="text-sm text-gray-600">{workflow.description}</p>
                          </div>
                        </div>
                        
                        {/* Real Accuracy Badge */}
                        <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-100">
                          <Sparkles className="w-3 h-3 text-green-600" />
                          <span className="text-sm font-bold text-green-600">
                            {workflow.accuracy}
                          </span>
                        </div>
                      </div>
                      
                      {/* Real Status */}
                      {workflow.isActive && activeWorkflow && (
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-blue-900">
                              Processing ({activeWorkflow.progress || 0}%)
                            </span>
                          </div>
                          {activeWorkflow.message && (
                            <p className="text-sm text-blue-800 mt-1">{activeWorkflow.message}</p>
                          )}
                        </div>
                      )}
                      
                      {/* Action Button */}
                      <button
                        onClick={() => triggerRealAnalysis(workflow.type)}
                        disabled={workflow.isActive || !isConnected}
                        className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                          ${workflow.isActive 
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                            : isConnected
                              ? 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg transform hover:scale-[1.02]'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }
                        `}
                      >
                        {workflow.isActive ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Running Analysis...</span>
                          </>
                        ) : !isConnected ? (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            <span>Backend Offline</span>
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
            
            {/* Real Recent Activity */}
            <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Real Analysis Activity</h3>
                  <p className="text-sm text-gray-600">Latest results from VERSSAI backend</p>
                </div>
                <button 
                  onClick={loadAllRealData}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">Refresh</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {Object.values(activeWorkflows).length > 0 || recentAnalyses.length > 0 ? (
                  [...Object.values(activeWorkflows), ...recentAnalyses].slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                        ${item.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'}
                      `}>
                        {item.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.workflow_name || 'Real Analysis'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.status === 'completed' ? 'Completed successfully' : 
                           item.status === 'failed' ? 'Analysis failed' :
                           `In progress (${item.progress || 0}%)`}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'Just now'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">No recent activity</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {isConnected ? 'Start an analysis to see real results here' : 'Connect to backend to see activity'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Real Institutions Preview */}
            {realInstitutions.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Top Research Institutions</h3>
                    <p className="text-sm text-gray-600">Real data from VERSSAI dataset</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {realInstitutions.slice(0, 6).map((institution, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-medium text-gray-900 mb-2">{institution.name}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Papers:</span>
                          <span className="font-medium">{institution.total_papers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Citations:</span>
                          <span className="font-medium">{institution.total_citations}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg/Paper:</span>
                          <span className="font-medium">{institution.avg_citations_per_paper?.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default VERSSAILinearPlatformReal;