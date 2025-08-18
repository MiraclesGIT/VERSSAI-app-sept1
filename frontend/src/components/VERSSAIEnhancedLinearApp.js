import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Upload, Download, Settings, Zap, TrendingUp, Shield, Users, Target, 
  BarChart3, MessageSquare, Monitor, Activity, Brain, Database, Layers, Wifi, 
  WifiOff, Filter, Eye, Edit, FileText, Folder, Plus, ExternalLink, AlertCircle, 
  CheckCircle, Clock, Play, Pause, X, Send, Bot, User as UserIcon, ChevronRight,
  Globe, Calendar, Award, MoreHorizontal, Bookmark, Save, Share2, Mail
} from 'lucide-react';

const VERSSAIEnhancedLinearApp = () => {
  // State management
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [mcpConnected, setMcpConnected] = useState(false);
  const [ragEngineStatus, setRagEngineStatus] = useState('initializing');
  const [userRole, setUserRole] = useState('superadmin'); // superadmin, vc_partner, analyst, founder
  const [workflowSessions, setWorkflowSessions] = useState({});
  const [chatSessions, setChatSessions] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [ragLayers, setRagLayers] = useState({ roof: true, vc: true, founder: true });
  
  // WebSocket connection
  const wsRef = useRef(null);
  const chatInputRef = useRef(null);
  
  // Mock organization data
  const organization = {
    name: 'Versatil.VC',
    logo: '/assets/verssai-logo.png',
    tier: 'enterprise'
  };

  // Enhanced user profile with role-based capabilities
  const currentUser = {
    id: 'user_123',
    name: 'Alex Chen',
    role: userRole,
    email: 'alex@versatil.vc',
    organization: organization,
    permissions: userRole === 'superadmin' ? ['*'] : 
                userRole === 'vc_partner' ? ['view', 'trigger_workflow', 'create_basic_workflow'] :
                userRole === 'analyst' ? ['view', 'trigger_workflow'] :
                ['view_limited', 'submit_application']
  };

  // Enhanced 6 VC Workflows with RAG integration
  const enhancedWorkflows = [
    {
      id: 'founder_signal',
      name: 'Founder Signal Assessment',
      description: 'AI personality analysis and success pattern matching',
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-500 to-blue-600',
      duration: '~3 min',
      ragLayers: ['roof', 'vc', 'founder'],
      aiCapabilities: ['Personality Analysis', 'Success Patterns', 'Network Assessment'],
      status: 'ready',
      accuracy: '95%'
    },
    {
      id: 'due_diligence',
      name: 'Due Diligence Automation',
      description: 'Document analysis, risk assessment, compliance',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-green-500 to-teal-600',
      duration: '~5 min',
      ragLayers: ['roof', 'vc'],
      aiCapabilities: ['Document Analysis', 'Risk Scoring', 'Compliance Check'],
      status: 'ready',
      accuracy: '92%'
    },
    {
      id: 'portfolio_management',
      name: 'Portfolio Management',
      description: 'Performance tracking and optimization recommendations',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-600',
      duration: '~4 min',
      ragLayers: ['vc'],
      aiCapabilities: ['Performance Tracking', 'Optimization', 'Benchmarking'],
      status: 'ready',
      accuracy: '89%'
    },
    {
      id: 'competitive_intelligence',
      name: 'Competitive Intelligence',
      description: 'Market analysis, competitor mapping, positioning',
      icon: <Target className="w-6 h-6" />,
      color: 'from-orange-500 to-red-600',
      duration: '~6 min',
      ragLayers: ['roof', 'vc'],
      aiCapabilities: ['Market Analysis', 'Competitor Mapping', 'Positioning'],
      status: 'ready',
      accuracy: '87%'
    },
    {
      id: 'fund_allocation',
      name: 'Fund Allocation Optimization',
      description: 'Investment allocation and risk-adjusted strategies',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-indigo-500 to-purple-600',
      duration: '~7 min',
      ragLayers: ['vc'],
      aiCapabilities: ['Risk Optimization', 'Allocation Strategy', 'Scenario Analysis'],
      status: 'ready',
      accuracy: '91%'
    },
    {
      id: 'lp_communication',
      name: 'LP Communication Automation',
      description: 'Automated reporting and LP communication workflows',
      icon: <Mail className="w-6 h-6" />,
      color: 'from-pink-500 to-rose-600',
      duration: '~5 min',
      ragLayers: ['vc'],
      aiCapabilities: ['Report Generation', 'Communication Automation', 'Personalization'],
      status: 'ready',
      accuracy: '94%'
    }
  ];

  // WebSocket connection and management
  useEffect(() => {
    connectToMCP();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [userRole]);

  const connectToMCP = () => {
    try {
      const wsUrl = `ws://localhost:8080/mcp?user_role=${userRole}`;
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('🔌 Connected to Enhanced MCP Protocol');
        setMcpConnected(true);
      };
      
      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleMCPMessage(message);
      };
      
      wsRef.current.onclose = () => {
        console.log('🔌 Disconnected from MCP Protocol');
        setMcpConnected(false);
        // Attempt reconnection after 3 seconds
        setTimeout(connectToMCP, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('🚨 MCP WebSocket error:', error);
        setMcpConnected(false);
      };
      
    } catch (error) {
      console.error('Failed to connect to MCP:', error);
      setMcpConnected(false);
    }
  };

  const handleMCPMessage = (message) => {
    console.log('📨 MCP Message:', message);
    
    switch (message.type) {
      case 'connection_established':
        setRagEngineStatus(message.rag_engine_status === 'ready' ? 'ready' : 'initializing');
        break;
        
      case 'workflow_started':
        setWorkflowSessions(prev => ({
          ...prev,
          [message.session_id]: {
            ...message,
            progress: 0,
            logs: [`Workflow started: ${message.workflow_name}`]
          }
        }));
        break;
        
      case 'workflow_progress':
        setWorkflowSessions(prev => ({
          ...prev,
          [message.session_id]: {
            ...prev[message.session_id],
            progress: message.progress,
            status: message.status,
            logs: [...(prev[message.session_id]?.logs || []), message.message]
          }
        }));
        break;
        
      case 'workflow_completed':
        setWorkflowSessions(prev => ({
          ...prev,
          [message.session_id]: {
            ...prev[message.session_id],
            status: 'completed',
            completionTime: message.completion_time,
            results: message,
            logs: [...(prev[message.session_id]?.logs || []), 'Workflow completed successfully']
          }
        }));
        break;
        
      case 'ai_chat_response':
        setChatSessions(prev => ({
          ...prev,
          [message.chat_session_id]: {
            ...prev[message.chat_session_id],
            messages: [
              ...(prev[message.chat_session_id]?.messages || []),
              {
                role: 'assistant',
                content: message.response.message,
                timestamp: new Date().toISOString(),
                suggestions: message.response.suggestions,
                action: message.response.action
              }
            ]
          }
        }));
        break;
        
      case 'rag_query_result':
        console.log('🧠 RAG Query Result:', message.results);
        break;
        
      case 'error':
        console.error('🚨 MCP Error:', message.message);
        break;
    }
  };

  const sendMCPMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('🚨 MCP WebSocket not connected');
    }
  };

  // Workflow management
  const triggerWorkflow = (workflowId, workflowData = {}) => {
    sendMCPMessage({
      type: 'trigger_workflow',
      workflow_id: workflowId,
      data: {
        triggered_by: currentUser.name,
        organization: organization.name,
        timestamp: new Date().toISOString(),
        user_role: userRole,
        ...workflowData
      }
    });
  };

  const cancelWorkflow = (sessionId) => {
    sendMCPMessage({
      type: 'cancel_workflow',
      session_id: sessionId
    });
  };

  // AI Chat for workflow creation (SuperAdmin only)
  const sendChatMessage = (message, chatSessionId = null) => {
    if (userRole !== 'superadmin') return;
    
    const sessionId = chatSessionId || `chat_${Date.now()}`;
    
    // Add user message to local state
    setChatSessions(prev => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        messages: [
          ...(prev[sessionId]?.messages || []),
          {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
          }
        ]
      }
    }));
    
    // Send to MCP backend
    sendMCPMessage({
      type: 'ai_chat_workflow',
      message: message,
      chat_session_id: sessionId
    });
    
    setActiveChat(sessionId);
  };

  // RAG Query function
  const performRAGQuery = (query, layerWeights = { roof: 0.4, vc: 0.3, founder: 0.3 }) => {
    sendMCPMessage({
      type: 'rag_query',
      query: query,
      layer_weights: layerWeights
    });
  };

  // Header Component
  const Header = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">VERSS.AI</h1>
              <div className="text-xs text-gray-500">Enhanced with RAG/GRAPH Intelligence</div>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${mcpConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {mcpConnected ? 'Connected' : 'Disconnected'}
            </span>
            
            <div className={`w-2 h-2 rounded-full ${ragEngineStatus === 'ready' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm text-gray-600">
              RAG: {ragEngineStatus === 'ready' ? 'Ready' : 'Initializing'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Role Selector (for demo) */}
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="superadmin">SuperAdmin</option>
            <option value="vc_partner">VC Partner</option>
            <option value="analyst">Analyst</option>
            <option value="founder">Founder</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search workflows, companies..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-64"
            />
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">{currentUser.name.split(' ').map(n => n[0]).join('')}</span>
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">{currentUser.name}</div>
              <div className="text-gray-500 capitalize">{userRole.replace('_', ' ')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Workflow Card
  const WorkflowCard = ({ workflow }) => {
    const isRunning = Object.values(workflowSessions).some(session => 
      session.workflow_id === workflow.id && session.status === 'running'
    );
    
    const hasPermission = currentUser.permissions.includes('*') || 
                         currentUser.permissions.includes('trigger_workflow');

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${workflow.color} group-hover:scale-105 transition-transform duration-200`}>
            <div className="text-white">
              {workflow.icon}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              workflow.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {workflow.status}
            </span>
            <div className="text-xs text-gray-500">{workflow.accuracy}</div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{workflow.name}</h3>
          <p className="text-gray-600 text-sm mb-3">{workflow.description}</p>
          
          {/* RAG Layers */}
          <div className="flex items-center space-x-2 mb-3">
            <Layers className="w-4 h-4 text-gray-400" />
            <div className="flex space-x-1">
              {workflow.ragLayers.map(layer => (
                <span
                  key={layer}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    layer === 'roof' ? 'bg-blue-100 text-blue-700' :
                    layer === 'vc' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}
                >
                  {layer.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* AI Capabilities */}
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-4 h-4 text-gray-400" />
            <div className="text-xs text-gray-600">
              {workflow.aiCapabilities.join(' • ')}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{workflow.duration}</span>
          </div>
          
          <div className="flex space-x-2">
            {hasPermission && (
              <button
                onClick={() => triggerWorkflow(workflow.id)}
                disabled={isRunning || !mcpConnected}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isRunning || !mcpConnected
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isRunning ? (
                  <>
                    <Activity className="w-4 h-4 mr-1 animate-spin" />
                    Running
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Trigger
                  </>
                )}
              </button>
            )}
            
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Running Progress */}
        {isRunning && Object.values(workflowSessions).map(session => {
          if (session.workflow_id === workflow.id && session.status === 'running') {
            return (
              <div key={session.session_id} className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Progress</span>
                  <span className="text-sm text-gray-600">{session.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${session.progress || 0}%` }}
                  ></div>
                </div>
                {session.logs && session.logs.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    {session.logs[session.logs.length - 1]}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  // AI Chat Component (SuperAdmin only)
  const AIChatInterface = () => {
    const [chatInput, setChatInput] = useState('');
    
    if (userRole !== 'superadmin') return null;

    const activeChatSession = activeChat ? chatSessions[activeChat] : null;

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Bot className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Workflow Assistant</h3>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            SuperAdmin
          </span>
        </div>

        <div className="h-64 border border-gray-200 rounded-lg p-4 overflow-y-auto mb-4 bg-gray-50">
          {activeChatSession?.messages?.length > 0 ? (
            activeChatSession.messages.map((message, index) => (
              <div key={index} className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}>
                  <div className="text-sm">{message.content}</div>
                  {message.suggestions && (
                    <div className="mt-2 space-y-1">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendChatMessage(suggestion, activeChat)}
                          className="block w-full text-left text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 mt-8">
              <Bot className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Ask me to create, edit, or explain workflows!</p>
              <div className="mt-2 text-xs text-gray-400">
                Try: "Create a new due diligence workflow" or "Explain the founder signal process"
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <input
            ref={chatInputRef}
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && chatInput.trim()) {
                sendChatMessage(chatInput.trim());
                setChatInput('');
              }
            }}
            placeholder="Type your workflow request..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            onClick={() => {
              if (chatInput.trim()) {
                sendChatMessage(chatInput.trim());
                setChatInput('');
              }
            }}
            disabled={!chatInput.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // RAG Query Interface
  const RAGQueryInterface = () => {
    const [ragQuery, setRagQuery] = useState('');
    const [layerWeights, setLayerWeights] = useState({ roof: 0.4, vc: 0.3, founder: 0.3 });

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">RAG/GRAPH Intelligence Query</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            ragEngineStatus === 'ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {ragEngineStatus}
          </span>
        </div>

        <div className="space-y-4">
          {/* Layer Weight Controls */}
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(layerWeights).map(([layer, weight]) => (
              <div key={layer} className="space-y-2">
                <label className="text-sm font-medium text-gray-700 capitalize">{layer} Layer</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setLayerWeights(prev => ({
                    ...prev,
                    [layer]: parseFloat(e.target.value)
                  }))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">{(weight * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>

          {/* Query Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && ragQuery.trim() && ragEngineStatus === 'ready') {
                  performRAGQuery(ragQuery.trim(), layerWeights);
                  setRagQuery('');
                }
              }}
              placeholder="Query the knowledge graph (e.g., 'machine learning startups')"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => {
                if (ragQuery.trim() && ragEngineStatus === 'ready') {
                  performRAGQuery(ragQuery.trim(), layerWeights);
                  setRagQuery('');
                }
              }}
              disabled={!ragQuery.trim() || ragEngineStatus !== 'ready'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Sample Queries */}
          <div className="flex flex-wrap gap-2">
            {[
              'machine learning research trends',
              'successful AI startup founders',
              'venture capital investment patterns',
              'due diligence best practices'
            ].map(query => (
              <button
                key={query}
                onClick={() => setRagQuery(query)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Main Dashboard View
  const DashboardView = () => (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Active Workflows</div>
              <div className="text-2xl font-bold text-gray-900">{Object.keys(workflowSessions).length}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">RAG Layers</div>
              <div className="text-2xl font-bold text-gray-900">3</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Success Rate</div>
              <div className="text-2xl font-bold text-gray-900">95%</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">User Role</div>
              <div className="text-lg font-bold text-gray-900 capitalize">{userRole.replace('_', ' ')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Workflows Grid */}
      <div className="grid grid-cols-2 gap-6">
        {enhancedWorkflows.map(workflow => (
          <WorkflowCard key={workflow.id} workflow={workflow} />
        ))}
      </div>

      {/* AI Chat and RAG Query Interfaces */}
      <div className="grid grid-cols-2 gap-6">
        <AIChatInterface />
        <RAGQueryInterface />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              VERSSAI Intelligence Platform
            </h1>
            <p className="text-gray-600">
              Enhanced VC workflows powered by 3-layer RAG/GRAPH architecture and AI automation
            </p>
          </div>

          {/* Main Content */}
          <DashboardView />
        </div>
      </div>
    </div>
  );
};

export default VERSSAIEnhancedLinearApp;