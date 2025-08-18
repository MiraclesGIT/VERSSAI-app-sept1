import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, Shield, TrendingUp, Zap, BarChart3, MessageSquare,
  Play, Clock, CheckCircle, AlertCircle, Settings, Monitor,
  User, Bell, Search, Filter, Plus, ChevronRight, 
  ArrowUpRight, Activity, Database, Layers, Brain,
  Sparkles, Award, Eye, RefreshCw, Menu, X, Users,
  ExternalLink, Save, TestTube
} from 'lucide-react';

// Enhanced MCP Service for VERSSAI with Full Settings Management
class VERSSAIMCPService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
    this.ws = null;
    this.isConnected = false;
    this.messageHandlers = [];
  }
  
  async connectWebSocket() {
    try {
      const wsUrl = `ws://localhost:8080/mcp?user_role=superadmin`;
      this.ws = new WebSocket(wsUrl);
      
      return new Promise((resolve, reject) => {
        this.ws.onopen = () => {
          console.log('🔌 Connected to VERSSAI MCP Backend');
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
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      throw error;
    }
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
  
  async triggerWorkflow(workflowId, data) {
    await this.sendCommand({
      type: 'trigger_workflow',
      workflow_id: workflowId,
      data: data
    });
  }
  
  // Settings Management via MCP
  async getOrganizationSettings() {
    await this.sendCommand({
      type: 'get_organization_settings'
    });
  }
  
  async updateOrganizationSettings(settings) {
    await this.sendCommand({
      type: 'update_organization_settings',
      data: settings
    });
  }
  
  async getBrandSettings() {
    await this.sendCommand({
      type: 'get_brand_settings'
    });
  }
  
  async updateBrandSettings(settings) {
    await this.sendCommand({
      type: 'update_brand_settings',
      data: settings
    });
  }
  
  async getApiConfiguration() {
    await this.sendCommand({
      type: 'get_api_configuration'
    });
  }
  
  async updateApiConfiguration(config) {
    await this.sendCommand({
      type: 'update_api_configuration',
      data: config
    });
  }
  
  async getMCPStatus() {
    await this.sendCommand({
      type: 'get_mcp_status'
    });
  }
  
  async testApiConnection(apiType, apiKey) {
    await this.sendCommand({
      type: 'test_api_connection',
      data: { api_type: apiType, api_key: apiKey }
    });
  }
  
  async testWebhookEndpoint(workflowId) {
    await this.sendCommand({
      type: 'test_webhook',
      data: { workflow_id: workflowId }
    });
  }

  // User management
  async getUserList() {
    await this.sendCommand({
      type: 'get_user_list'
    });
  }

  async inviteUser(userData) {
    await this.sendCommand({
      type: 'invite_user',
      data: userData
    });
  }

  // N8N workflow management
  async getWorkflowList() {
    await this.sendCommand({
      type: 'get_workflow_list'
    });
  }

  async createWorkflow(workflowData) {
    await this.sendCommand({
      type: 'create_workflow',
      data: workflowData
    });
  }

  async getSystemHealth() {
    await this.sendCommand({
      type: 'get_system_health'
    });
  }
}

const VERSSAILinearPlatform = () => {
  // State Management
  const [activeFeature, setActiveFeature] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [activeWorkflows, setActiveWorkflows] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('organization');
  
  // Settings state loaded via MCP
  const [organizationSettings, setOrganizationSettings] = useState({
    name: 'Loading...',
    tier: 'Enterprise',
    userLimit: 0,
    currentUsers: 0,
    subscription: 'Loading...',
    planType: 'Annual Pro',
    billingCycle: 'yearly'
  });
  
  const [brandSettings, setBrandSettings] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    logoUrl: '',
    companyName: 'Loading...',
    customCss: '',
    faviconUrl: ''
  });
  
  const [apiSettings, setApiSettings] = useState({
    openaiKey: '',
    anthropicKey: '',
    n8nWebhook: '',
    mcpEndpoint: '',
    slackWebhook: '',
    emailProvider: 'smtp',
    smtpSettings: {}
  });
  
  const [mcpStatus, setMcpStatus] = useState({
    mcp_service: 'connecting',
    n8n_workflows: 'loading',
    database: 'connecting',
    active_workflows: [],
    system_health: {
      cpu_usage: 0,
      memory_usage: 0,
      disk_usage: 0,
      uptime: 0
    }
  });
  
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [userList, setUserList] = useState([]);
  const [workflowList, setWorkflowList] = useState([]);
  
  const mcpService = useRef(new VERSSAIMCPService());
  
  // 6 Core VC Intelligence Features
  const vcFeatures = [
    {
      id: 'founder_signal',
      title: 'Founder Signal Assessment',
      subtitle: 'AI personality analysis and success prediction',
      accuracy: 96,
      icon: Target,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-100',
      description: 'Advanced AI analysis of founder personality traits, leadership potential, and success patterns',
      metrics: ['Big 5 Personality', 'Leadership Score', 'Execution Track Record', 'Network Analysis'],
      avgTime: '3-5 min',
      complexity: 'Advanced'
    },
    {
      id: 'due_diligence',
      title: 'Due Diligence Automation',
      subtitle: 'Document analysis and risk assessment',
      accuracy: 94,
      icon: Shield,
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-100',
      description: 'Automated document review, financial analysis, and comprehensive risk evaluation',
      metrics: ['Financial Health', 'Legal Compliance', 'Market Position', 'Technical Assessment'],
      avgTime: '10-15 min',
      complexity: 'Comprehensive'
    },
    {
      id: 'competitive_intel',
      title: 'Competitive Intelligence',
      subtitle: 'Market analysis and positioning insights',
      accuracy: 97,
      icon: TrendingUp,
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-100',
      description: 'Real-time competitive landscape analysis and strategic positioning recommendations',
      metrics: ['Market Size', 'Competitive Position', 'Threat Assessment', 'Opportunities'],
      avgTime: '5-8 min',
      complexity: 'Strategic'
    },
    {
      id: 'fund_allocation',
      title: 'Fund Allocation Optimization',
      subtitle: 'Portfolio optimization and capital deployment',
      accuracy: 98,
      icon: Zap,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-100',
      description: 'AI-driven portfolio construction and risk-optimized capital allocation strategies',
      metrics: ['Stage Allocation', 'Sector Diversification', 'Geographic Distribution', 'Risk-Return'],
      avgTime: '8-12 min',
      complexity: 'Optimization'
    },
    {
      id: 'portfolio_mgmt',
      title: 'Portfolio Management',
      subtitle: 'Performance tracking and optimization',
      accuracy: 92,
      icon: BarChart3,
      gradient: 'from-rose-500 to-pink-600',
      bgGradient: 'from-rose-50 to-pink-100',
      description: 'Comprehensive portfolio monitoring, performance analysis, and value creation recommendations',
      metrics: ['Performance Tracking', 'Risk Analysis', 'Value Creation', 'Exit Planning'],
      avgTime: '6-10 min',
      complexity: 'Analytical'
    },
    {
      id: 'lp_communication',
      title: 'LP Communication',
      subtitle: 'Automated reporting and investor updates',
      accuracy: 95,
      icon: MessageSquare,
      gradient: 'from-cyan-500 to-blue-600',
      bgGradient: 'from-cyan-50 to-blue-100',
      description: 'Professional LP report generation and automated investor communication workflows',
      metrics: ['Fund Performance', 'Portfolio Updates', 'Market Analysis', 'ESG Reporting'],
      avgTime: '4-7 min',
      complexity: 'Communication'
    }
  ];
  
  // Initialize platform
  useEffect(() => {
    const initializePlatform = async () => {
      try {
        setConnectionStatus('🔄 Connecting to VERSSAI...');
        await mcpService.current.connectWebSocket();
        setIsConnected(true);
        setConnectionStatus('🚀 VERSSAI Connected');
        addNotification('success', 'Platform connected successfully');
        
        // Load all settings via MCP
        await loadAllSettings();
        
        // Setup real-time handlers
        mcpService.current.onMessage((data) => {
          handleMCPMessage(data);
        });
        
      } catch (error) {
        console.error('Platform initialization failed:', error);
        setConnectionStatus('❌ Connection failed');
        addNotification('error', 'Failed to connect to VERSSAI');
      }
    };
    
    initializePlatform();
  }, []);
  
  // Load all settings from MCP backend
  const loadAllSettings = async () => {
    try {
      setSettingsLoading(true);
      await Promise.all([
        mcpService.current.getOrganizationSettings(),
        mcpService.current.getBrandSettings(),
        mcpService.current.getApiConfiguration(),
        mcpService.current.getMCPStatus(),
        mcpService.current.getUserList(),
        mcpService.current.getWorkflowList(),
        mcpService.current.getSystemHealth()
      ]);
    } catch (error) {
      console.error('Failed to load settings:', error);
      addNotification('error', 'Failed to load settings');
    } finally {
      setSettingsLoading(false);
    }
  };
  
  // Handle MCP messages
  const handleMCPMessage = (data) => {
    console.log('🎯 MCP Message:', data.type, data);
    
    switch (data.type) {
      case 'workflow_started':
        setActiveWorkflows(prev => ({
          ...prev,
          [data.session_id]: { ...data, status: 'running', progress: 0 }
        }));
        addNotification('info', `Started: ${data.workflow_name}`);
        break;
        
      case 'workflow_progress':
        setActiveWorkflows(prev => ({
          ...prev,
          [data.session_id]: { ...prev[data.session_id], ...data }
        }));
        break;
        
      case 'workflow_completed':
        setActiveWorkflows(prev => ({
          ...prev,
          [data.session_id]: { ...prev[data.session_id], status: 'completed', progress: 100 }
        }));
        addNotification('success', `Completed: ${data.workflow_name || 'Analysis'}`);
        break;
        
      case 'organization_settings_response':
        setOrganizationSettings(data.data);
        console.log('📊 Organization settings updated:', data.data);
        break;
        
      case 'brand_settings_response':
        setBrandSettings(data.data);
        console.log('🎨 Brand settings updated:', data.data);
        break;
        
      case 'api_configuration_response':
        setApiSettings(data.data);
        console.log('🔑 API settings updated:', data.data);
        break;
        
      case 'mcp_status_response':
        setMcpStatus(data.data);
        console.log('🔌 MCP status updated:', data.data);
        break;

      case 'user_list_response':
        setUserList(data.data);
        console.log('👥 User list updated:', data.data);
        break;

      case 'workflow_list_response':
        setWorkflowList(data.data);
        console.log('⚙️ Workflow list updated:', data.data);
        break;
        
      case 'api_test_result':
        addNotification(
          data.data.success ? 'success' : 'error',
          `${data.data.api_type} API: ${data.data.message}`
        );
        break;
        
      case 'webhook_test_result':
        addNotification(
          data.data.success ? 'success' : 'error',
          `Webhook test: ${data.data.message}`
        );
        break;
        
      case 'settings_updated':
        addNotification('success', 'Settings updated successfully');
        // Reload settings after update
        setTimeout(() => loadAllSettings(), 1000);
        break;

      case 'error':
        addNotification('error', data.message || 'An error occurred');
        break;
        
      default:
        console.log('🔍 Unhandled MCP message:', data);
    }
  };
  
  // Helper functions
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
  
  const triggerAnalysis = async (featureId) => {
    try {
      const feature = vcFeatures.find(f => f.id === featureId);
      if (!feature) return;
      
      const sampleData = {
        user_id: 'verssai_user_001',
        workflow_type: featureId,
        company_name: featureId === 'founder_signal' ? 'Neural Dynamics AI' : 'Sample Company',
        timestamp: new Date().toISOString()
      };
      
      await mcpService.current.triggerWorkflow(featureId, sampleData);
      addNotification('info', `${feature.title} analysis started`);
    } catch (error) {
      console.error('Failed to trigger analysis:', error);
      addNotification('error', 'Failed to start analysis');
    }
  };
  
  // Settings functions
  const saveOrganizationSettings = async () => {
    try {
      setSettingsLoading(true);
      await mcpService.current.updateOrganizationSettings(organizationSettings);
    } catch (error) {
      console.error('Failed to save organization settings:', error);
      addNotification('error', 'Failed to save organization settings');
    } finally {
      setSettingsLoading(false);
    }
  };
  
  const saveBrandSettings = async () => {
    try {
      setSettingsLoading(true);
      await mcpService.current.updateBrandSettings(brandSettings);
    } catch (error) {
      console.error('Failed to save brand settings:', error);
      addNotification('error', 'Failed to save brand settings');
    } finally {
      setSettingsLoading(false);
    }
  };
  
  const saveApiSettings = async () => {
    try {
      setSettingsLoading(true);
      await mcpService.current.updateApiConfiguration(apiSettings);
    } catch (error) {
      console.error('Failed to save API settings:', error);
      addNotification('error', 'Failed to save API settings');
    } finally {
      setSettingsLoading(false);
    }
  };
  
  const testApiConnection = async (apiType) => {
    try {
      const apiKey = apiType === 'openai' ? apiSettings.openaiKey : apiSettings.anthropicKey;
      await mcpService.current.testApiConnection(apiType, apiKey);
    } catch (error) {
      console.error('Failed to test API connection:', error);
      addNotification('error', 'Failed to test API connection');
    }
  };
  
  const testWebhook = async (workflowId) => {
    try {
      await mcpService.current.testWebhookEndpoint(workflowId);
    } catch (error) {
      console.error('Failed to test webhook:', error);
      addNotification('error', 'Failed to test webhook');
    }
  };
  
  // Get accuracy color
  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 95) return 'text-emerald-600';
    if (accuracy >= 90) return 'text-blue-600';
    return 'text-amber-600';
  };
  
  // Get status indicator
  const getStatusIndicator = (status) => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'active':
        return { color: 'bg-green-500', text: 'text-green-700' };
      case 'connecting':
      case 'loading':
        return { color: 'bg-yellow-500 animate-pulse', text: 'text-yellow-700' };
      default:
        return { color: 'bg-red-500', text: 'text-red-700' };
    }
  };
  
  // Sidebar navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Monitor },
    { id: 'workflows', label: 'VC Intelligence', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'saved', label: 'Saved', icon: Award, badge: '13' },
    { id: 'applications', label: 'Applications', icon: Database, badge: '2' },
    { id: 'inbox', label: 'Inbox', icon: Bell, badge: '7' }
  ];
  
  // Enhanced Settings Panel Component
  const SettingsPanel = () => {
    if (!showSettings) return null;
    
    const settingsTabs = [
      { id: 'organization', label: 'Organization', icon: Users },
      { id: 'brand', label: 'Brand Settings', icon: Sparkles },
      { id: 'mcp', label: 'MCP + N8N', icon: Layers },
      { id: 'api', label: 'API Configuration', icon: Database }
    ];
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
          {/* Settings Sidebar */}
          <div className="w-72 bg-gray-50 border-r border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Settings</h2>
                <p className="text-sm text-gray-600">Configure your VERSSAI platform</p>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="space-y-2">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSettingsTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                      ${settingsTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Stats */}
            <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-medium">{organizationSettings.currentUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Workflows Run</span>
                  <span className="font-medium">847</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">API Calls</span>
                  <span className="font-medium">12.3k</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Settings Content */}
          <div className="flex-1 p-8 overflow-auto">
            {settingsTab === 'organization' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Organization Settings</h3>
                    <p className="text-gray-600 mt-1">Manage your organization and subscription</p>
                  </div>
                  <button
                    onClick={saveOrganizationSettings}
                    disabled={settingsLoading}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{settingsLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
                
                <div className="space-y-8">
                  {/* Organization Info */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-6">Organization Information</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                        <input
                          type="text"
                          value={organizationSettings.name}
                          onChange={(e) => setOrganizationSettings({...organizationSettings, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          placeholder="Enter organization name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Tier</label>
                        <select
                          value={organizationSettings.tier}
                          onChange={(e) => setOrganizationSettings({...organizationSettings, tier: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Starter">Starter (5 users)</option>
                          <option value="Professional">Professional (25 users)</option>
                          <option value="Enterprise">Enterprise (Unlimited)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Plan Type</label>
                        <input
                          type="text"
                          value={organizationSettings.planType}
                          onChange={(e) => setOrganizationSettings({...organizationSettings, planType: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Annual Pro"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Billing Cycle</label>
                        <select
                          value={organizationSettings.billingCycle}
                          onChange={(e) => setOrganizationSettings({...organizationSettings, billingCycle: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Usage Stats */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-6">Usage Statistics</h4>
                    <div className="grid grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{organizationSettings.currentUsers}</div>
                        <div className="text-sm text-gray-600 mt-1">Active Users</div>
                        <div className="text-xs text-gray-500">of {organizationSettings.userLimit} limit</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">847</div>
                        <div className="text-sm text-gray-600 mt-1">Analyses This Month</div>
                        <div className="text-xs text-green-500">+12% vs last month</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">12.3k</div>
                        <div className="text-sm text-gray-600 mt-1">API Calls</div>
                        <div className="text-xs text-purple-500">Excellent usage</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">94.8%</div>
                        <div className="text-sm text-gray-600 mt-1">Success Rate</div>
                        <div className="text-xs text-orange-500">Above target</div>
                      </div>
                    </div>
                  </div>

                  {/* User Management */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-semibold text-gray-900">Team Members</h4>
                      <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Invite User</span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {userList.length > 0 ? userList.map((user, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                              {user.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.name || 'Unknown User'}</div>
                              <div className="text-sm text-gray-500">{user.email} • {user.role}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {user.status}
                            </span>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No team members loaded yet</p>
                          <p className="text-sm">Data will appear when backend is connected</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {settingsTab === 'brand' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Brand Settings</h3>
                    <p className="text-gray-600 mt-1">Customize your VERSSAI platform appearance</p>
                  </div>
                  <button
                    onClick={saveBrandSettings}
                    disabled={settingsLoading}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{settingsLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
                
                <div className="space-y-8">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-6">Brand Colors</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={brandSettings.primaryColor}
                            onChange={(e) => setBrandSettings({...brandSettings, primaryColor: e.target.value})}
                            className="w-16 h-12 rounded-xl border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={brandSettings.primaryColor}
                            onChange={(e) => setBrandSettings({...brandSettings, primaryColor: e.target.value})}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="#3B82F6"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={brandSettings.secondaryColor}
                            onChange={(e) => setBrandSettings({...brandSettings, secondaryColor: e.target.value})}
                            className="w-16 h-12 rounded-xl border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={brandSettings.secondaryColor}
                            onChange={(e) => setBrandSettings({...brandSettings, secondaryColor: e.target.value})}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="#8B5CF6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-6">Logo & Branding</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                        <input
                          type="text"
                          value={brandSettings.companyName}
                          onChange={(e) => setBrandSettings({...brandSettings, companyName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Your Company Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                        <input
                          type="url"
                          value={brandSettings.logoUrl}
                          onChange={(e) => setBrandSettings({...brandSettings, logoUrl: e.target.value})}
                          placeholder="https://yourcompany.com/logo.png"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Favicon URL</label>
                        <input
                          type="url"
                          value={brandSettings.faviconUrl}
                          onChange={(e) => setBrandSettings({...brandSettings, faviconUrl: e.target.value})}
                          placeholder="https://yourcompany.com/favicon.ico"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-6">Custom CSS</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional Styling</label>
                      <textarea
                        value={brandSettings.customCss}
                        onChange={(e) => setBrandSettings({...brandSettings, customCss: e.target.value})}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="/* Custom CSS rules */&#10;.custom-class {&#10;  color: #333;&#10;}"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {settingsTab === 'mcp' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">MCP + N8N Configuration</h3>
                    <p className="text-gray-600 mt-1">Monitor and configure workflow automation</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <a
                      href="http://localhost:5678"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open N8N</span>
                    </a>
                    <button
                      onClick={() => mcpService.current.getMCPStatus()}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh Status</span>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-8">
                  {/* Connection Status */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-6">System Health</h4>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">MCP Service</span>
                          <div className={`w-3 h-3 rounded-full ${getStatusIndicator(mcpStatus.mcp_service).color}`}></div>
                        </div>
                        <div className={`text-sm ${getStatusIndicator(mcpStatus.mcp_service).text} capitalize`}>
                          {mcpStatus.mcp_service}
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">N8N Workflows</span>
                          <div className={`w-3 h-3 rounded-full ${getStatusIndicator('active').color}`}></div>
                        </div>
                        <div className="text-sm text-green-700">
                          {mcpStatus.n8n_workflows}
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">Database</span>
                          <div className={`w-3 h-3 rounded-full ${getStatusIndicator(mcpStatus.database).color}`}></div>
                        </div>
                        <div className={`text-sm ${getStatusIndicator(mcpStatus.database).text} capitalize`}>
                          {mcpStatus.database}
                        </div>
                      </div>
                    </div>
                    
                    {/* System Metrics */}
                    {mcpStatus.system_health && (
                      <div className="mt-6 grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{mcpStatus.system_health.cpu_usage}%</div>
                          <div className="text-sm text-gray-600">CPU Usage</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{mcpStatus.system_health.memory_usage}%</div>
                          <div className="text-sm text-gray-600">Memory</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{mcpStatus.system_health.disk_usage}%</div>
                          <div className="text-sm text-gray-600">Disk Usage</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{Math.floor(mcpStatus.system_health.uptime / 3600)}h</div>
                          <div className="text-sm text-gray-600">Uptime</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Active Workflows */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-6">Active Workflows</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {vcFeatures.map((feature) => (
                        <div key={feature.id} className="bg-white p-4 rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <feature.icon className="w-5 h-5 text-gray-600" />
                              <span className="font-medium text-gray-900">{feature.title}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600">Active</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">{feature.accuracy}% accuracy</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Webhook Configuration */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-6">Webhook Endpoints</h4>
                    <div className="space-y-3">
                      {vcFeatures.map((feature) => (
                        <div key={feature.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{feature.title}</div>
                            <div className="text-sm text-gray-500 font-mono">
                              http://localhost:5678/webhook/{feature.id}_wf
                            </div>
                          </div>
                          <button 
                            onClick={() => testWebhook(feature.id)}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <TestTube className="w-4 h-4" />
                            <span className="text-sm font-medium">Test</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {settingsTab === 'api' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">API Configuration</h3>
                    <p className="text-gray-600 mt-1">Configure external services and integrations</p>
                  </div>
                  <button
                    onClick={saveApiSettings}
                    disabled={settingsLoading}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{settingsLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
                
                <div className="space-y-8">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-6">AI Service APIs</h4>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">OpenAI API Key</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="password"
                            value={apiSettings.openaiKey}
                            onChange={(e) => setApiSettings({...apiSettings, openaiKey: e.target.value})}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="sk-..."
                          />
                          <button 
                            onClick={() => testApiConnection('openai')}
                            className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                          >
                            <TestTube className="w-4 h-4" />
                            <span>Test</span>
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Anthropic API Key</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="password"
                            value={apiSettings.anthropicKey}
                            onChange={(e) => setApiSettings({...apiSettings, anthropicKey: e.target.value})}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="ant-..."
                          />
                          <button 
                            onClick={() => testApiConnection('anthropic')}
                            className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                          >
                            <TestTube className="w-4 h-4" />
                            <span>Test</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-6">VERSSAI Configuration</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">N8N Webhook URL</label>
                        <input
                          type="url"
                          value={apiSettings.n8nWebhook}
                          onChange={(e) => setApiSettings({...apiSettings, n8nWebhook: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="http://localhost:5678/webhook"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">MCP Endpoint</label>
                        <input
                          type="text"
                          value={apiSettings.mcpEndpoint}
                          onChange={(e) => setApiSettings({...apiSettings, mcpEndpoint: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ws://localhost:8080/mcp"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Slack Webhook (Optional)</label>
                        <input
                          type="url"
                          value={apiSettings.slackWebhook}
                          onChange={(e) => setApiSettings({...apiSettings, slackWebhook: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://hooks.slack.com/services/..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-6">Email Configuration</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Provider</label>
                        <select
                          value={apiSettings.emailProvider}
                          onChange={(e) => setApiSettings({...apiSettings, emailProvider: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="smtp">SMTP</option>
                          <option value="sendgrid">SendGrid</option>
                          <option value="mailgun">Mailgun</option>
                        </select>
                      </div>
                      {apiSettings.emailProvider === 'smtp' && (
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="SMTP Host"
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="number"
                            placeholder="Port"
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Settings Panel */}
      <SettingsPanel />
      
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
                  <h1 className="text-lg font-bold text-gray-900">VERSS.AI</h1>
                  <p className="text-xs text-gray-500">VC Intelligence Platform</p>
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
          {navigationItems.slice(0, 3).map((item) => {
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
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          
          {/* Separator */}
          {!sidebarCollapsed && <div className="border-t border-gray-200 my-3"></div>}
          
          {navigationItems.slice(3).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
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
        
        {/* User Profile */}
        <div className="p-3 border-t border-gray-200">
          <div 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => setShowSettings(true)}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Alex Chen</p>
                <p className="text-xs text-gray-500">alex@versatil.vc</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <Settings className="w-4 h-4 text-gray-400" />
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
              <h1 className="text-2xl font-bold text-gray-900">VC Intelligence</h1>
              <p className="text-gray-600 mt-1">AI-powered venture capital decision making</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search companies, founders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                <span className="text-sm text-gray-600">{connectionStatus}</span>
              </div>
              
              {/* Settings Button */}
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Actions */}
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
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Analyses Today</p>
                    <p className="text-2xl font-bold text-gray-900">47</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center space-x-1 mt-4">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+12% vs yesterday</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">94.8%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center space-x-1 mt-4">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+2.1% this month</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Workflows</p>
                    <p className="text-2xl font-bold text-gray-900">{Object.keys(activeWorkflows).length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Layers className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center space-x-1 mt-4">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600">Real-time monitoring</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">4.2s</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="flex items-center space-x-1 mt-4">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">15% faster</span>
                </div>
              </div>
            </div>
            
            {/* 6 Core VC Features Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {vcFeatures.map((feature) => {
                const Icon = feature.icon;
                const isActive = Object.values(activeWorkflows).some(
                  w => w.workflow_id === feature.id && w.status === 'running'
                );
                const activeWorkflow = Object.values(activeWorkflows).find(
                  w => w.workflow_id === feature.id
                );
                
                return (
                  <div
                    key={feature.id}
                    className={`group bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg overflow-hidden
                      ${isActive ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                    `}
                  >
                    {/* Progress Bar */}
                    {isActive && activeWorkflow && (
                      <div className="h-1 bg-gray-200">
                        <div 
                          className={`h-full bg-gradient-to-r ${feature.gradient} transition-all duration-500`}
                          style={{ width: `${activeWorkflow.progress || 0}%` }}
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {feature.title}
                            </h3>
                            <p className="text-sm text-gray-600">{feature.subtitle}</p>
                          </div>
                        </div>
                        
                        {/* Accuracy Badge */}
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r ${feature.bgGradient}`}>
                          <Sparkles className={`w-3 h-3 ${getAccuracyColor(feature.accuracy)}`} />
                          <span className={`text-sm font-bold ${getAccuracyColor(feature.accuracy)}`}>
                            {feature.accuracy}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                        {feature.description}
                      </p>
                      
                      {/* Metrics */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Analysis Type:</span>
                          <span className="font-medium text-gray-900">{feature.complexity}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Avg Processing:</span>
                          <span className="font-medium text-gray-900">{feature.avgTime}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {feature.metrics.slice(0, 2).map((metric, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {metric}
                            </span>
                          ))}
                          {feature.metrics.length > 2 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{feature.metrics.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Active Status */}
                      {isActive && activeWorkflow && (
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.bgGradient} border border-blue-200 mb-4`}>
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
                        onClick={() => triggerAnalysis(feature.id)}
                        disabled={isActive || !isConnected}
                        className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                          ${isActive 
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                            : isConnected
                              ? 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg transform hover:scale-[1.02]'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }
                        `}
                      >
                        {isActive ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing Analysis...</span>
                          </>
                        ) : !isConnected ? (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Start Analysis</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Recent Activity */}
            <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <p className="text-sm text-gray-600">Latest analysis results and workflow updates</p>
                </div>
                <button 
                  onClick={() => loadAllSettings()}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">Refresh</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {Object.values(activeWorkflows).length > 0 ? (
                  Object.values(activeWorkflows).map((workflow, idx) => (
                    <div key={idx} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                        ${workflow.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'}
                      `}>
                        {workflow.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{workflow.workflow_name || 'Analysis'}</p>
                        <p className="text-sm text-gray-600">
                          {workflow.status === 'completed' ? 'Completed' : `In progress (${workflow.progress || 0}%)`}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">No recent activity</p>
                    <p className="text-sm text-gray-500 mt-1">Start an analysis to see results here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VERSSAILinearPlatform;