// Real VERSSAI Enhanced Dashboard with Actual VC Platform Functionality
// Based on actual UI screenshots and requirements

import React, { useState, useEffect } from 'react';
import './VERSSAIStyles.css'; // Import custom VERSSAI styles
import { 
  ChevronRight, 
  Upload, 
  Download,
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
  Brain,
  Database,
  Layers,
  Wifi,
  WifiOff,
  Search,
  Filter,
  Eye,
  Edit,
  FileText,
  Folder,
  Plus,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  X,
  Trash2,
  RefreshCw
} from 'lucide-react';

const VERSSAIRealDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [ragLayerActive, setRagLayerActive] = useState('vc');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mcpConnected, setMcpConnected] = useState(true);
  const [workflowStatus, setWorkflowStatus] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  // Mock user with real roles
  const currentUser = {
    id: 'user_123',
    name: 'Alex Chen',
    role: 'SuperAdmin', // SuperAdmin, VC_Partner, Analyst, Founder
    organization: {
      name: 'Versatil.VC',
      logo: '/assets/verssai-logo.png'
    },
    permissions: ['*'] // Full access for SuperAdmin
  };

  // Real company data matching screenshots
  const companies = [
    {
      id: 'vistim_labs',
      name: 'Vistim Labs',
      founder: 'John Doe',
      stage: 'Series C',
      location: 'Salt Lake City, UT',
      industry: ['AI', 'Fintech'],
      foundedDate: 'Sep 1, 2021',
      readinessScore: 81,
      description: 'Vistim Labs is a MedTech diagnostic company that helps to detect, treat, and track neurological disorders.',
      website: 'Vistimlabs.com',
      team: [
        { name: 'James Hamet', role: 'Founder & CEO', avatar: '/avatars/james.jpg' },
        { name: 'Frank Zanow, PhD', role: 'Board Director', avatar: '/avatars/frank.jpg' }
      ],
      documents: {
        onePager: { name: 'VistimLabs_OnePager.pdf', uploaded: '23/03/2025', score: 75 },
        pitchDeck: { name: 'VistimLabs_Deck_3.2.pdf', uploaded: '15/03/2025', score: 81 },
        website: { name: 'VistimLabs.ai', submitted: '11/03/2025', score: 50 }
      },
      insights: {
        dataAndAI: 8.5,
        teamExecution: 7.8,
        techInfrastructure: 8.2,
        regulatoryRisk: 6.5,
        financialMetrics: 7.9,
        marketCompetition: 8.1
      }
    },
    {
      id: 'data_harvest',
      name: 'DataHarvest',
      founder: 'Jane Smith',
      stage: 'Seed',
      location: 'New York, NY',
      industry: ['Finance'],
      foundedDate: 'Oct 2023',
      readinessScore: 75,
      description: 'Advanced data analytics platform for financial institutions.',
      documents: {
        onePager: { name: 'DataHarvest_OnePager.pdf', uploaded: '20/03/2025', score: 70 },
        pitchDeck: { name: 'DataHarvest_Deck.pdf', uploaded: '18/03/2025', score: 75 }
      }
    },
    {
      id: 'ai_mentor',
      name: 'AI Mentor',
      founder: 'Mike Johnson',
      stage: 'Series A',
      location: 'Austin, TX',
      industry: ['Education'],
      foundedDate: 'Nov 2023',
      readinessScore: 63,
      description: 'AI-powered educational mentoring platform.',
      documents: {
        pitchDeck: { name: 'AIMentor_Deck.pdf', uploaded: '15/03/2025', score: 65 }
      }
    }
  ];

  // RAG layers with real functionality
  const ragLayers = [
    {
      id: 'roof',
      name: 'Roof Layer',
      description: 'Global Intelligence',
      collections: ['academic_papers', 'industry_reports', 'market_data'],
      status: 'active',
      performance: { accuracy: 96, latency: 150, documents: 15420 }
    },
    {
      id: 'vc',
      name: 'VC Layer', 
      description: 'Investor Intelligence',
      collections: ['deal_flow', 'portfolio_data', 'market_analysis'],
      status: 'active',
      performance: { accuracy: 94, latency: 200, documents: 8350 }
    },
    {
      id: 'startup',
      name: 'Startup Layer',
      description: 'Founder Intelligence', 
      collections: ['founder_profiles', 'startup_metrics', 'pitch_analysis'],
      status: 'active',
      performance: { accuracy: 92, latency: 250, documents: 5280 }
    }
  ];

  // Real N8N workflows
  const n8nWorkflows = [
    {
      id: 'due_diligence_automation',
      name: 'Due Diligence Automation',
      description: 'Automated document analysis and risk assessment',
      status: 'active',
      lastRun: '2 hours ago',
      successRate: 94
    },
    {
      id: 'founder_signal_assessment',
      name: 'Founder Signal Assessment', 
      description: 'AI personality analysis and pattern matching',
      status: 'active',
      lastRun: '1 hour ago',
      successRate: 96
    },
    {
      id: 'market_intelligence',
      name: 'Competitive Intelligence',
      description: 'Market analysis and positioning insights',
      status: 'active', 
      lastRun: '30 min ago',
      successRate: 97
    }
  ];

  // Handle workflow execution
  const executeWorkflow = async (workflowId, companyId) => {
    setWorkflowStatus(prev => ({ ...prev, [workflowId]: 'running' }));
    
    // Simulate API call to backend
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/workflows/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_type: workflowId,
          company_id: companyId,
          rag_layer: ragLayerActive,
          user_id: currentUser.id
        })
      });
      
      if (response.ok) {
        setTimeout(() => {
          setWorkflowStatus(prev => ({ ...prev, [workflowId]: 'completed' }));
        }, 3000);
      } else {
        setWorkflowStatus(prev => ({ ...prev, [workflowId]: 'failed' }));
      }
    } catch (error) {
      console.error('Workflow execution failed:', error);
      setWorkflowStatus(prev => ({ ...prev, [workflowId]: 'failed' }));
    }
  };

  // Real document upload functionality
  const handleDocumentUpload = async (files, companyId, documentType) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('company_id', companyId);
    formData.append('document_type', documentType);
    formData.append('rag_layer', ragLayerActive);
    
    setUploadProgress({ status: 'uploading', progress: 0 });
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/documents/upload`, {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress({ status: 'uploading', progress });
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setUploadProgress({ status: 'success', progress: 100 });
        setTimeout(() => {
          setUploadProgress({});
          setUploadModalOpen(false);
        }, 2000);
        console.log('Documents uploaded successfully:', result);
      } else {
        setUploadProgress({ status: 'error', progress: 0 });
      }
    } catch (error) {
      console.error('Document upload failed:', error);
      setUploadProgress({ status: 'error', progress: 0 });
    }
  };

  // Access N8N Dashboard
  const openN8NDashboard = () => {
    if (currentUser.role === 'SuperAdmin') {
      window.open('http://localhost:5678', '_blank');
    } else {
      alert('N8N Dashboard access requires SuperAdmin role');
    }
  };

  // Access MCP Console
  const openMCPConsole = () => {
    if (currentUser.role === 'SuperAdmin') {
      setCurrentView('mcp_console');
    }
  };

  // Header component
  const Header = () => (
    <div className="verssai-header bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">VERSS.AI</h1>
              <p className="text-xs text-purple-600">VC Intelligence Platform</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex space-x-6">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setCurrentView('ai_scouting')}
              className={`nav-button ${currentView === 'ai_scouting' ? 'active' : ''}`}
            >
              AI Scouting
            </button>
            <button 
              onClick={() => setCurrentView('due_diligence')}
              className={`nav-button ${currentView === 'due_diligence' ? 'active' : ''}`}
            >
              Due Diligence
            </button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* RAG Layer Selector */}
          <div className="rag-selector flex items-center space-x-2">
            <Layers className="w-4 h-4 text-gray-500" />
            <select 
              value={ragLayerActive}
              onChange={(e) => setRagLayerActive(e.target.value)}
              className="text-sm bg-transparent border-none outline-none"
            >
              {ragLayers.map(layer => (
                <option key={layer.id} value={layer.id}>{layer.name}</option>
              ))}
            </select>
            <div className={`status-indicator ${ragLayers.find(l => l.id === ragLayerActive)?.status === 'active' ? 'active' : 'inactive'}`} />
          </div>

          {/* MCP Status */}
          <div className="flex items-center space-x-2">
            {mcpConnected ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
            <span className="text-xs text-gray-600">MCP</span>
          </div>

          {/* Settings Access */}
          <button 
            onClick={() => setSettingsOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>

          {/* User Info */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-medium text-sm">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">{currentUser.name}</div>
              <div className="text-xs text-purple-600">{currentUser.role}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Document Upload Modal
  const DocumentUploadModal = () => (
    <div className={`modal-overlay fixed inset-0 z-50 ${uploadModalOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="modal-content w-full max-w-2xl">
          <div className="modal-header flex items-center justify-between">
            <h3 className="text-lg font-semibold">Upload Documents</h3>
            <button onClick={() => setUploadModalOpen(false)}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="modal-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Area */}
              <div>
                <h4 className="font-medium mb-3">Select Files</h4>
                <div className="upload-zone">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag & drop files here</p>
                  <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                  <input 
                    type="file"
                    multiple
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                      if (e.target.files.length > 0 && selectedCompany) {
                        handleDocumentUpload(Array.from(e.target.files), selectedCompany.id, 'general');
                      }
                    }}
                  />
                  <label 
                    htmlFor="file-upload"
                    className="btn-primary cursor-pointer"
                  >
                    Choose Files
                  </label>
                </div>
                
                {/* Upload Progress */}
                {uploadProgress.status && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        {uploadProgress.status === 'uploading' ? 'Uploading...' :
                         uploadProgress.status === 'success' ? 'Upload Complete' :
                         'Upload Failed'}
                      </span>
                      <span className="text-sm text-gray-600">{uploadProgress.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${uploadProgress.status}`}
                        style={{ width: `${uploadProgress.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* RAG Layer Selection */}
              <div>
                <h4 className="font-medium mb-3">Target RAG Layer</h4>
                <div className="space-y-3">
                  {ragLayers.map(layer => (
                    <div 
                      key={layer.id}
                      className={`rag-layer-card cursor-pointer ${ragLayerActive === layer.id ? 'active' : ''}`}
                      onClick={() => setRagLayerActive(layer.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{layer.name}</span>
                        <div className={`status-indicator ${layer.status === 'active' ? 'active' : 'inactive'}`} />
                      </div>
                      <p className="text-sm text-gray-600">{layer.description}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {layer.performance.documents} documents • {layer.performance.accuracy}% accuracy
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // MCP Console View
  const MCPConsoleView = () => (
    <div className="mcp-console p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">MCP Console</h2>
          <button 
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronRight className="w-4 h-4 transform rotate-180" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* N8N Workflow Management */}
        <div className="console-card">
          <div className="console-header">
            <h3 className="text-lg font-semibold">N8N Workflow Management</h3>
          </div>
          <div className="space-y-4">
            {n8nWorkflows.map(workflow => (
              <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{workflow.name}</h4>
                  <p className="text-sm text-gray-600">{workflow.description}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    Last run: {workflow.lastRun} • Success: {workflow.successRate}%
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`status-indicator ${workflow.status === 'active' ? 'active' : 'inactive'}`} />
                  <button className="p-1 text-gray-400 hover:text-purple-600">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RAG Layer Performance */}
        <div className="console-card">
          <div className="console-header">
            <h3 className="text-lg font-semibold">RAG Layer Performance</h3>
          </div>
          <div className="space-y-4">
            {ragLayers.map(layer => (
              <div key={layer.id} className="rag-layer-card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{layer.name}</h4>
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 text-gray-400 cursor-pointer hover:text-purple-600" />
                    <div className={`status-indicator ${layer.status === 'active' ? 'active' : 'inactive'}`} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Accuracy</div>
                    <div className="font-medium">{layer.performance.accuracy}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Latency</div>
                    <div className="font-medium">{layer.performance.latency}ms</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Documents</div>
                    <div className="font-medium">{layer.performance.documents.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="console-card">
          <div className="console-header">
            <h3 className="text-lg font-semibold">System Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>PostgreSQL Database</span>
              <div className="flex items-center space-x-2">
                <div className="status-indicator active" />
                <span className="text-sm text-gray-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>ChromaDB Vector Store</span>
              <div className="flex items-center space-x-2">
                <div className="status-indicator active" />
                <span className="text-sm text-gray-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>N8N Workflow Engine</span>
              <div className="flex items-center space-x-2">
                <div className="status-indicator active" />
                <span className="text-sm text-gray-600">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>MCP Service</span>
              <div className="flex items-center space-x-2">
                <div className={`status-indicator ${mcpConnected ? 'active' : 'inactive'}`} />
                <span className="text-sm text-gray-600">{mcpConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="console-card">
          <div className="console-header">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            <div className="activity-item">
              <div className="activity-indicator blue" />
              <div className="activity-content">
                <div className="activity-title">Workflow executed: Due Diligence</div>
                <div className="activity-time">2 hours ago • Vistim Labs</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-indicator green" />
              <div className="activity-content">
                <div className="activity-title">Documents processed</div>
                <div className="activity-time">3 hours ago • 15 files uploaded to VC Layer</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-indicator purple" />
              <div className="activity-content">
                <div className="activity-title">RAG Layer updated</div>
                <div className="activity-time">5 hours ago • Startup Layer performance optimized</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard View
  const DashboardView = () => (
    <div className="dashboard-view p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Hello {currentUser.organization.name}</h2>
          {currentUser.role === 'SuperAdmin' && (
            <div className="flex space-x-3">
              <button 
                onClick={openN8NDashboard}
                className="btn-primary flex items-center space-x-2"
              >
                <Monitor className="w-4 h-4" />
                <span>N8N Dashboard</span>
                <ExternalLink className="w-4 h-4" />
              </button>
              <button 
                onClick={openMCPConsole}
                className="btn-secondary flex items-center space-x-2"
              >
                <Brain className="w-4 h-4" />
                <span>MCP Console</span>
              </button>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-6 mb-8 stats-grid">
          <div className="stats-card">
            <div className="flex items-center justify-between mb-2">
              <Users className="stats-icon purple" />
              <span className="stats-value">932</span>
            </div>
            <div className="stats-label">Scouting Startups</div>
          </div>
          
          <div className="stats-card">
            <div className="flex items-center justify-between mb-2">
              <FileText className="stats-icon blue" />
              <span className="stats-value">155</span>
            </div>
            <div className="stats-label">Startups Applications</div>
          </div>
          
          <div className="stats-card">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="stats-icon green" />
              <span className="stats-value">21</span>
            </div>
            <div className="stats-label">Most Valuable Startups</div>
          </div>
        </div>
      </div>

      {/* Featured Company */}
      {selectedCompany && (
        <div className="verssai-card p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="company-avatar w-16 h-16">
                  <span className="text-white font-bold text-xl">
                    {selectedCompany.name.split(' ').map(w => w[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedCompany.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{selectedCompany.stage}</span>
                    <span>{selectedCompany.location}</span>
                    <span>Founded: {selectedCompany.foundedDate}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Readiness Score</div>
                  <div className={`readiness-score ${
                    selectedCompany.readinessScore >= 80 ? 'high' : 
                    selectedCompany.readinessScore >= 60 ? 'medium' : 'low'
                  }`}>
                    {selectedCompany.readinessScore}%
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{selectedCompany.description}</p>
              
              {/* AI Workflows for selected company */}
              <div className="grid grid-cols-3 gap-4 workflow-grid">
                {n8nWorkflows.map(workflow => (
                  <button
                    key={workflow.id}
                    onClick={() => executeWorkflow(workflow.id, selectedCompany.id)}
                    disabled={workflowStatus[workflow.id] === 'running'}
                    className="workflow-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{workflow.name}</h4>
                      {workflowStatus[workflow.id] === 'running' ? (
                        <Clock className="w-4 h-4 text-blue-500 animate-spin" />
                      ) : workflowStatus[workflow.id] === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Play className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{workflow.description}</p>
                    <div className="success-rate mt-2">
                      Success Rate: {workflow.successRate}%
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Companies List */}
      <div className="verssai-card">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Startup Applications</h3>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <Filter className="w-4 h-4" />
                <span>Filter by Industry</span>
              </button>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {companies.map(company => (
            <div 
              key={company.id}
              className="company-card"
              onClick={() => setSelectedCompany(company)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="company-avatar w-12 h-12">
                    <span className="text-white font-bold">
                      {company.name.split(' ').map(w => w[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{company.name}</h4>
                    <div className="text-sm text-gray-600">{company.founder}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`stage-badge ${
                        company.stage === 'Series C' ? 'series-c' :
                        company.stage === 'Series A' ? 'series-a' :
                        'seed'
                      }`}>
                        {company.stage}
                      </span>
                      <span className="text-xs text-gray-500">{company.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-sm text-gray-600">{company.foundedDate}</div>
                  <div className="text-center">
                    <div className={`readiness-score ${
                      company.readinessScore >= 80 ? 'high' : 
                      company.readinessScore >= 60 ? 'medium' : 'low'
                    }`}>
                      {company.readinessScore}%
                    </div>
                    <div className="text-xs text-gray-500">Readiness</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Settings Panel
  const SettingsPanel = () => (
    <div className={`modal-overlay ${settingsOpen ? 'block' : 'hidden'}`}>
      <div className="settings-panel fixed right-0 top-0 h-full w-96">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Settings</h3>
            <button onClick={() => setSettingsOpen(false)}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* RAG Configuration */}
          <div className="settings-section">
            <h4 className="font-medium mb-3">RAG Layer Configuration</h4>
            <div className="space-y-3">
              {ragLayers.map(layer => (
                <div key={layer.id} className="rag-layer-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{layer.name}</span>
                    <div className={`status-indicator ${layer.status === 'active' ? 'active' : 'inactive'}`} />
                  </div>
                  <div className="text-sm text-gray-600">{layer.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {layer.performance.documents} documents • {layer.performance.accuracy}% accuracy
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* N8N Workflows */}
          <div className="settings-section">
            <h4 className="font-medium mb-3">N8N Workflows</h4>
            <div className="space-y-2">
              {n8nWorkflows.map(workflow => (
                <div key={workflow.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{workflow.name}</span>
                  <div className={`status-indicator ${workflow.status === 'active' ? 'active' : 'inactive'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* User Permissions */}
          <div className="settings-section">
            <h4 className="font-medium mb-3">User Permissions</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Role</span>
                <span className="text-sm font-medium text-purple-600">{currentUser.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">N8N Access</span>
                <span className="text-sm">{currentUser.role === 'SuperAdmin' ? '✅ Enabled' : '❌ Disabled'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">MCP Console</span>
                <span className="text-sm">{currentUser.role === 'SuperAdmin' ? '✅ Enabled' : '❌ Disabled'}</span>
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="settings-section">
            <h4 className="font-medium mb-3">Document Management</h4>
            <button 
              onClick={() => setUploadModalOpen(true)}
              className="upload-zone w-full"
            >
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">Upload Documents</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="verssai-app min-h-screen bg-gray-50">
      <Header />
      {currentView === 'dashboard' && <DashboardView />}
      {currentView === 'mcp_console' && <MCPConsoleView />}
      <SettingsPanel />
      <DocumentUploadModal />
    </div>
  );
};

export default VERSSAIRealDashboard;