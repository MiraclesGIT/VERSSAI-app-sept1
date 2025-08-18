import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Filter, Upload, Download, Edit, Eye, ExternalLink, Plus,
  FileText, Folder, Users, TrendingUp, BarChart3, Target, Shield,
  Brain, Database, Layers, Monitor, Activity, MessageSquare, Zap, 
  Share, X, MoreHorizontal, ChevronDown, ChevronRight, ChevronLeft, Globe,
  Calendar, MapPin, Building, User, Award, CheckCircle, Bell,
  Settings, Menu, Play, Clock, AlertCircle, Sparkles, RefreshCw,
  ArrowUpRight, DollarSign, PieChart, TestTube, Lightbulb, Edit3, Save, Trash2
} from 'lucide-react';

// Enhanced MCP Service for VERSSAI N8N Integration
class VERSSAIRealMCPService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    this.n8nBaseUrl = process.env.REACT_APP_N8N_URL || 'https://versatil.app.n8n.cloud';
    this.ws = null;
    this.isConnected = false;
    this.messageHandlers = [];
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
  
  // N8N Workflow Integration
  async triggerN8NWorkflow(workflowType, startupData) {
    const workflowEndpoints = {
      // Bulk Upload Workflow
      'bulk_upload': `${this.n8nBaseUrl}/webhook/6c7a7515-aa7d-4378-a198-88a086ed63b0`,
      
      // New Startup Workflow
      'new_startup': `${this.n8nBaseUrl}/webhook/30952066-19f5-4000-bdbd-755d1fc139e5`,
      
      // Basic Due Diligence - Website Data
      'basic_due_diligence': `${this.n8nBaseUrl}/webhook/1ba65c6b-a709-4774-85b3-b0747ccd03ef`,
      
      // Micro Due Diligence
      'micro_due_diligence': `${this.n8nBaseUrl}/webhook/410ec99e-b644-41df-bba1-9be9c5bcad76`
    };
    
    const endpoint = workflowEndpoints[workflowType];
    if (!endpoint) {
      throw new Error(`Unknown workflow type: ${workflowType}`);
    }
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(startupData)
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error triggering ${workflowType} workflow:`, error);
      throw error;
    }
  }
  
  // Startup Operations
  async uploadStartupDeck(file, startupData) {
    const formData = new FormData();
    formData.append('deck', file);
    formData.append('data', JSON.stringify(startupData));
    
    try {
      const response = await fetch(`${this.baseUrl}/api/startups/upload-deck`, {
        method: 'POST',
        body: formData
      });
      return await response.json();
    } catch (error) {
      console.error('Error uploading startup deck:', error);
      throw error;
    }
  }
  
  async fetchStartups() {
    try {
      const response = await fetch(`${this.baseUrl}/api/startups`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching startups:', error);
      return [];
    }
  }
  
  async fetchDueDiligenceFiles(startupId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/startups/${startupId}/due-diligence-files`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching due diligence files:', error);
      return [];
    }
  }
}

const VERSSAIExactDashboard = () => {
  const [currentView, setCurrentView] = useState('ai-scouting');
  const [selectedCompany, setSelectedCompany] = useState('vistim-labs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedTab, setSelectedTab] = useState('All');
  const [mcpConnected, setMcpConnected] = useState(false);
  const [activeWorkflows, setActiveWorkflows] = useState({});
  const [realStartups, setRealStartups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [uploadType, setUploadType] = useState(null); // 'single' or 'bulk'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const mcpService = useRef(new VERSSAIRealMCPService());

  // Upload handling functions
  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleUploadTypeSelect = (type) => {
    setUploadType(type);
    setShowUploadModal(false);
    // Open file selector
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.ppt,.pptx';
    input.multiple = type === 'bulk';
    input.onchange = (e) => handleFileUpload(e.target.files, type);
    input.click();
  };

  const handleFileUpload = async (files, type) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileArray = Array.from(files);
      let uploadedStartups = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress(((i + 1) / fileArray.length) * 100);

        // Simulate upload processing
        const result = await mcpService.current.uploadStartupDeck(file, {
          name: file.name.replace(/\.(pdf|ppt|pptx)$/i, ''),
          type: type
        });

        // Create startup object from upload
        const newStartup = {
          id: `startup-${Date.now()}-${i}`,
          name: file.name.replace(/\.(pdf|ppt|pptx)$/i, ''),
          founder: 'To be analyzed',
          coFounders: [],
          stage: 'Analysis pending',
          stageColor: 'bg-gray-100 text-gray-700',
          location: 'TBD',
          industry: 'Analyzing...',
          foundedDate: 'TBD',
          readinessScore: 0,
          scoreColor: 'text-gray-600',
          avatar: file.name.substring(0, 2).toUpperCase(),
          avatarColor: 'bg-indigo-500',
          description: 'Currently being analyzed by VERSSAI AI',
          website: 'TBD',
          uploadedFile: file.name,
          uploadedAt: new Date().toISOString()
        };

        uploadedStartups.push(newStartup);
      }

      // Add uploaded startups to the list
      setRealStartups(prev => [...uploadedStartups, ...(Array.isArray(prev) ? prev : [])]);
      
      // Show success notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        title: `${uploadedStartups.length} startup${uploadedStartups.length > 1 ? 's' : ''} uploaded successfully`,
        message: 'AI analysis has started. Results will be available in the AI Scouting section.',
        timestamp: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Upload failed:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        title: 'Upload failed',
        message: 'There was an error uploading your files. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleStartupRowClick = (startup) => {
    setSelectedCompany(startup.id);
    setShowRightPanel(true);
  };

  const handleCompanyNameClick = (startup, e) => {
    e.stopPropagation();
    // Close the right panel and navigate to startup detail page
    setShowRightPanel(false);
    
    // Create a new view state for startup detail
    setCurrentView('startup-detail');
    setSelectedCompany(startup.id);
    
    // Optional: For future implementation with React Router
    // navigate(`/startup/${startup.id}`);
  };

  // Real dashboard stats
  const dashboardStats = {
    scoutingStartups: 932,
    startupApplications: 155,
    mostValuableStartups: 21
  };

  // Sample startups data (to be replaced with real data)
  const startups = [
    {
      id: 'vistim-labs',
      name: 'Vistim Labs',
      founder: 'John Doe',
      coFounders: ['John Malcovich', 'Anastasiia Gritsenko'],
      stage: 'Series C',
      stageColor: 'bg-purple-100 text-purple-700',
      location: 'Salt Lake City, UT',
      industry: 'AI, Fintech',
      foundedDate: 'Sep 2021',
      readinessScore: 81,
      scoreColor: 'text-green-600',
      avatar: 'SW',
      avatarColor: 'bg-orange-500',
      description: 'Vistim Labs is a MedTech diagnostic company that helps to detect, treat, and track neurological disorders.',
      website: 'Vistimlabs.com',
      team: [
        { name: 'James Hamet', role: 'Founder & CEO', avatar: '/api/placeholder/40/40' },
        { name: 'Frank Zanow, PhD', role: 'Board Director', avatar: '/api/placeholder/40/40' }
      ],
      radarData: [
        { category: 'Team & Execution', current: 85, benchmark: 70, risk: 60 },
        { category: 'Tech Infrastructure', current: 75, benchmark: 80, risk: 50 },
        { category: 'Financial Metrics', current: 90, benchmark: 75, risk: 40 },
        { category: 'Market & Competition', current: 70, benchmark: 65, risk: 55 },
        { category: 'Regulatory & Risk', current: 80, benchmark: 70, risk: 45 },
        { category: 'Data & AI Moats', current: 95, benchmark: 85, risk: 30 }
      ]
    },
    {
      id: 'dataharvest',
      name: 'DataHarvest',
      founder: 'Jane Smith',
      coFounders: ['John Malcovich', 'Anastasiia Gritsenko'],
      stage: 'Seed',
      stageColor: 'bg-yellow-100 text-yellow-700',
      location: 'New York, NY',
      industry: 'Finance',
      foundedDate: 'Oct 2023',
      readinessScore: 75,
      scoreColor: 'text-green-600',
      avatar: 'DH',
      avatarColor: 'bg-blue-500'
    },
    {
      id: 'ai-mentor',
      name: 'AI Mentor',
      founder: 'Mike Johnson',
      coFounders: ['John Malcovich', 'Anastasiia Gritsenko'],
      stage: 'Series A',
      stageColor: 'bg-green-100 text-green-700',
      location: 'Austin, TX',
      industry: 'Education',
      foundedDate: 'Nov 2023',
      readinessScore: 63,
      scoreColor: 'text-orange-600',
      avatar: 'AM',
      avatarColor: 'bg-purple-500'
    },
    {
      id: 'cloudscale',
      name: 'CloudScale',
      founder: 'Sarah Wilson',
      coFounders: ['John Malcovich', 'Anastasiia Gritsenko'],
      stage: 'Pre-Seed',
      stageColor: 'bg-blue-100 text-blue-700',
      location: 'Seattle, WA',
      industry: 'Cyber Security',
      foundedDate: 'Jan 2024',
      readinessScore: 61,
      scoreColor: 'text-orange-600',
      avatar: 'CS',
      avatarColor: 'bg-cyan-500'
    },
    {
      id: 'ecotech',
      name: 'EcoTech',
      founder: 'David Brown',
      coFounders: ['John Malcovich', 'Anastasiia Gritsenko'],
      stage: 'Seed',
      stageColor: 'bg-yellow-100 text-yellow-700',
      location: 'Boston, MA',
      industry: 'Education',
      foundedDate: 'May 2024',
      readinessScore: 50,
      scoreColor: 'text-orange-600',
      avatar: 'ET',
      avatarColor: 'bg-green-500'
    },
    {
      id: 'finai',
      name: 'FinAI',
      founder: 'Lisa Chen',
      coFounders: ['John Malcovich', 'Anastasiia Gritsenko'],
      stage: 'Pre-Seed',
      stageColor: 'bg-blue-100 text-blue-700',
      location: 'Chicago, IL',
      industry: 'AI, Fintech',
      foundedDate: 'Jun 2024',
      readinessScore: 41,
      scoreColor: 'text-red-600',
      avatar: 'FI',
      avatarColor: 'bg-pink-500'
    }
  ];

  const industryTrends = [
    { name: 'AI Software & Data', count: 255, color: 'bg-purple-500', width: '100%' },
    { name: 'Health Tech', count: 199, color: 'bg-purple-400', width: '78%' },
    { name: 'Social & Leisure', count: 115, color: 'bg-purple-300', width: '45%' },
    { name: 'Fintech', count: 132, color: 'bg-purple-300', width: '52%' },
    { name: 'Marketing & Sales', count: 111, color: 'bg-purple-200', width: '43%' }
  ];

  const dueDiligenceFiles = [
    { id: '2.1', title: 'Company Finance Documents', type: 'folder', size: '7 docs', date: 'Oct 19', icon: 'folder' },
    { id: '2.2', title: 'Finance Report.xlsx', type: 'excel', size: '23kb', date: 'Oct 19', icon: 'excel' },
    { id: '2.3', title: 'Finance Report template.docx', type: 'word', size: '700.7kb', date: 'Oct 19', icon: 'word' },
    { id: '2.4', title: '2012 Historical Financials.pdf', type: 'pdf', size: '41kb', date: 'Oct 19', icon: 'pdf' },
    { id: '2.5', title: '2012 Historical Financials.pdf', type: 'pdf', size: '41kb', date: 'Oct 19', icon: 'pdf' },
    { id: '2.6', title: '2012 Historical Financials.pdf', type: 'pdf', size: '41kb', date: 'Oct 19', icon: 'pdf' },
    { id: '2.7', title: '2012 Historical Financials.pdf', type: 'pdf', size: '41kb', date: 'Oct 19', icon: 'pdf' }
  ];

  const tabs = [
    { id: 'All', label: 'All', count: null },
    { id: 'Recent', label: 'Recent', count: 45 },
    { id: 'Applications', label: 'Applications', count: 12 },
    { id: 'Viewed', label: 'Viewed', count: 31 },
    { id: 'Saved', label: 'Saved', count: 13 },
    { id: 'Declined', label: 'Declined', count: 9 }
  ];

  // Updated Navigation menu items based on requirements
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Monitor, active: false },
    { 
      id: 'dealflow', 
      label: 'Dealflow', 
      icon: Target, 
      active: true,
      subItems: [
        { 
          id: 'ai-scouting', 
          label: 'AI Scouting', 
          active: currentView === 'ai-scouting',
          description: 'Founder Signal Assessment + Startup Deck Micro Due Diligence'
        },
        { 
          id: 'due-diligence', 
          label: 'Due Diligence', 
          active: currentView === 'due-diligence',
          description: 'Selected Startups + Due Diligence Automation (Dataroom)'
        }
      ]
    },
    { id: 'portfolio-management', label: 'Portfolio Management', icon: BarChart3, active: false },
    { id: 'fund-backtesting', label: 'Fund Backtesting', icon: TrendingUp, active: false },
    { id: 'fund-allocation', label: 'Fund Allocation Optimization', icon: Zap, active: false },
    { id: 'lp-communication', label: 'LP Communication Automation', icon: MessageSquare, active: false },
    { id: 'saved', label: 'Saved', icon: Award, badge: '13', active: false },
    { id: 'applications', label: 'Applications', icon: FileText, badge: '2', active: false },
    { id: 'inbox', label: 'Inbox', icon: Bell, active: false },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      active: false,
      subItems: [
        { 
          id: 'general-settings', 
          label: 'General Settings', 
          active: currentView === 'general-settings',
          description: 'User preferences, notifications, and account settings'
        },
        { 
          id: 'superadmin-settings', 
          label: 'SuperAdmin Settings', 
          active: currentView === 'superadmin-settings',
          description: 'Advanced system configuration and user management'
        }
      ]
    }
  ];

  // Initialize MCP connection
  useEffect(() => {
    const initializePlatform = async () => {
      try {
        await mcpService.current.connectWebSocket();
        setMcpConnected(true);
        addNotification('success', 'Connected to VERSSAI backend');
        
        // Load real startups data
        try {
          const startupsData = await mcpService.current.fetchStartups();
          setRealStartups(Array.isArray(startupsData) ? startupsData : []);
        } catch (startupError) {
          console.warn('Could not load startups data:', startupError);
          setRealStartups([]);
        }
        
        // Setup real-time handlers
        mcpService.current.onMessage((data) => {
          handleWorkflowUpdate(data);
        });
        
      } catch (error) {
        console.error('Failed to initialize platform:', error);
        addNotification('error', 'Failed to connect to VERSSAI backend');
      }
    };
    
    initializePlatform();
  }, []);

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

  const handleWorkflowUpdate = (data) => {
    console.log('Workflow update received:', data);
    
    if (data.type === 'workflow_result') {
      const executionId = data.result?.execution_id;
      if (executionId) {
        setActiveWorkflows(prev => ({
          ...prev,
          [executionId]: {
            ...data.result,
            progress: data.result.status === 'completed' ? 100 : 50
          }
        }));
      }
      addNotification(
        data.result?.status === 'completed' ? 'success' : 'info',
        `Workflow ${data.result?.status || 'updated'}`
      );
    }
  };

  const triggerWorkflow = async (workflowType, startupId) => {
    try {
      const startup = startups.find(s => s.id === startupId);
      if (!startup) {
        addNotification('error', 'Startup not found');
        return;
      }

      const workflowData = {
        startupId: startupId,
        startupName: startup.name,
        companyId: 'verssai_company_id',
        companyName: 'VERSSAI VC',
        submittedAt: new Date().toISOString(),
        processingType: workflowType
      };

      addNotification('info', `Starting ${workflowType} for ${startup.name}...`);
      
      const result = await mcpService.current.triggerN8NWorkflow(workflowType, workflowData);
      
      console.log('Workflow triggered:', result);
      addNotification('success', `${workflowType} initiated successfully`);
      
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
      addNotification('error', `Failed to start ${workflowType}`);
    }
  };

  const selectedStartup = startups.find(s => s.id === selectedCompany);

  const getReadinessScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getReadinessScoreBackground = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const RadarChart = ({ data }) => {
    const centerX = 120;
    const centerY = 120;
    const radius = 80;
    const angleStep = (2 * Math.PI) / data.length;

    const getPoint = (index, value) => {
      const angle = index * angleStep - Math.PI / 2;
      const r = (value / 100) * radius;
      return {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle)
      };
    };

    const gridLevels = [20, 40, 60, 80, 100];
    
    return (
      <div className="relative w-64 h-64">
        <svg width="240" height="240" className="absolute inset-0">
          {/* Grid circles */}
          {gridLevels.map((level, i) => (
            <circle
              key={i}
              cx={centerX}
              cy={centerY}
              r={(level / 100) * radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Grid lines */}
          {data.map((_, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const endX = centerX + radius * Math.cos(angle);
            const endY = centerY + radius * Math.sin(angle);
            return (
              <line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={endX}
                y2={endY}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}

          {/* Current Score Polygon */}
          <polygon
            points={data.map((item, index) => {
              const point = getPoint(index, item.current);
              return `${point.x},${point.y}`;
            }).join(' ')}
            fill="rgba(147, 51, 234, 0.3)"
            stroke="#9333ea"
            strokeWidth="2"
          />

          {/* Benchmark Polygon */}
          <polygon
            points={data.map((item, index) => {
              const point = getPoint(index, item.benchmark);
              return `${point.x},${point.y}`;
            }).join(' ')}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Risk Factor Polygon */}
          <polygon
            points={data.map((item, index) => {
              const point = getPoint(index, item.risk);
              return `${point.x},${point.y}`;
            }).join(' ')}
            fill="rgba(239, 68, 68, 0.2)"
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="3,3"
          />
        </svg>

        {/* Labels */}
        {data.map((item, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const labelRadius = radius + 25;
          const x = centerX + labelRadius * Math.cos(angle);
          const y = centerY + labelRadius * Math.sin(angle);
          
          return (
            <div
              key={index}
              className="absolute text-xs font-medium text-gray-600 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: x,
                top: y,
                width: '80px',
                textAlign: 'center'
              }}
            >
              {item.category}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">VERSS.AI</h1>
                  <p className="text-sm text-gray-500">Hello Versatil.VC</p>
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
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id}>
                <button
                  onClick={() => item.subItems ? null : setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${item.active || (item.id === 'dealflow') 
                      ? 'bg-purple-50 text-purple-700 border border-purple-200' 
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
                  {item.subItems && !sidebarCollapsed && <ChevronDown className="w-4 h-4" />}
                </button>
                
                {/* Sub-menu for Dealflow */}
                {item.subItems && !sidebarCollapsed && (
                  <div className="ml-7 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => setCurrentView(subItem.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                          ${subItem.active 
                            ? 'bg-purple-50 text-purple-700 font-medium' 
                            : 'text-gray-600 hover:bg-gray-50'
                          }
                        `}
                        title={subItem.description}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Upload Button */}
        <div className="p-4 border-t border-gray-200">
          {!sidebarCollapsed && (
            <button 
              onClick={handleUploadClick}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>UPLOAD YOUR STARTUPS</span>
            </button>
          )}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">VC</span>
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="text-sm font-medium text-gray-900">VC</p>
                <p className="text-xs text-gray-500">
                  {mcpConnected ? 'Backend Connected' : 'Offline Mode'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentView === 'ai-scouting' ? 'AI Scouting Startups' : 
                 currentView === 'due-diligence' ? 'Due Diligence Dashboard' : 
                 'VERSSAI Dashboard'}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentView === 'ai-scouting' ? 'Founder Signal Assessment + Startup Deck Micro Due Diligence' :
                 currentView === 'due-diligence' ? 'Selected Startups + Due Diligence Automation (Dataroom)' :
                 'Real-time VC intelligence platform'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {currentView === 'ai-scouting' && (
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option>Filter by industry</option>
                    <option>AI, Fintech</option>
                    <option>Finance</option>
                    <option>Education</option>
                    <option>Cyber Security</option>
                  </select>
                </div>
              )}
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  mcpConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {mcpConnected ? 'Connected' : 'Offline'}
                </span>
              </div>
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

        {/* Content Area */}
        <main className="flex-1 p-6">
          {currentView === 'ai-scouting' && (
            <div className="grid grid-cols-4 gap-6">
              {/* Left Content - Startup List */}
              <div className="col-span-3">
                {/* Dashboard Stats */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">SCOUTING STARTUPS</p>
                        <p className="text-3xl font-bold text-gray-900">{dashboardStats.scoutingStartups}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">STARTUPS APPLICATIONS</p>
                        <p className="text-3xl font-bold text-gray-900">{dashboardStats.startupApplications}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Award className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">MOST VALUABLE STARTUPS</p>
                        <p className="text-3xl font-bold text-gray-900">{dashboardStats.mostValuableStartups}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg border border-gray-200 mb-6">
                  <div className="flex border-b border-gray-200">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors
                          ${selectedTab === tab.id 
                            ? 'border-purple-500 text-purple-600 bg-purple-50' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                          }
                        `}
                      >
                        {tab.label}
                        {tab.count && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Startup Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Startup</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Founders</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Founded Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Readiness Score</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[...(realStartups || []), ...startups].map((startup) => (
                          <tr 
                            key={startup.id}
                            onClick={() => handleStartupRowClick(startup)}
                            className={`hover:bg-gray-50 cursor-pointer transition-colors
                              ${selectedCompany === startup.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''}
                            `}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 ${startup.avatarColor} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                                  {startup.avatar}
                                </div>
                                <div>
                                  <p 
                                    className="font-medium text-gray-900 hover:text-purple-600 transition-colors cursor-pointer"
                                    onClick={(e) => handleCompanyNameClick(startup, e)}
                                  >
                                    {startup.name}
                                  </p>
                                  <p className="text-sm text-gray-500">{startup.founder}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${startup.stageColor}`}>
                                {startup.stage}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {startup.location}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {startup.coFounders.join(', ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {startup.industry}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {startup.foundedDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 relative">
                                  <svg className="w-8 h-8 transform -rotate-90">
                                    <circle
                                      cx="16"
                                      cy="16"
                                      r="12"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      fill="none"
                                      className="text-gray-200"
                                    />
                                    <circle
                                      cx="16"
                                      cy="16"
                                      r="12"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      fill="none"
                                      strokeDasharray={`${2 * Math.PI * 12}`}
                                      strokeDashoffset={`${2 * Math.PI * 12 * (1 - startup.readinessScore / 100)}`}
                                      className={getReadinessScoreBackground(startup.readinessScore)}
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </div>
                                <span className={`font-bold ${getReadinessScoreColor(startup.readinessScore)}`}>
                                  {startup.readinessScore}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700">Previous</p>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((page) => (
                          <button
                            key={page}
                            className={`w-8 h-8 rounded text-sm font-medium transition-colors
                              ${page === 1 
                                ? 'bg-purple-600 text-white' 
                                : 'text-gray-700 hover:bg-gray-100'
                              }
                            `}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">Next</p>
                    </div>
                  </div>
                </div>

                {/* Industry Trends */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Startup Applications Industry Trends</h3>
                  <div className="space-y-4">
                    {industryTrends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="text-sm font-medium text-gray-900 w-32">{trend.name}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${trend.color} h-2 rounded-full transition-all duration-500`}
                              style={{ width: trend.width }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 ml-4">{trend.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Company Details */}
              <div className="col-span-1">
                {selectedStartup && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    {/* Company Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 ${selectedStartup.avatarColor} rounded-lg flex items-center justify-center text-white font-bold`}>
                          {selectedStartup.avatar}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{selectedStartup.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${selectedStartup.stageColor}`}>
                              {selectedStartup.stage}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                              MedTech
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                          <Share className="w-4 h-4" />
                        </button>
                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                          <X className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                          <Award className="w-4 h-4" />
                        </button>
                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900">COMPANY NAME</p>
                        <p className="text-lg font-bold text-gray-900">{selectedStartup.name}</p>
                      </div>
                      
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">READINESS SCORE</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-12 h-12 relative">
                              <svg className="w-12 h-12 transform -rotate-90">
                                <circle
                                  cx="24"
                                  cy="24"
                                  r="18"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                  className="text-gray-200"
                                />
                                <circle
                                  cx="24"
                                  cy="24"
                                  r="18"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                  strokeDasharray={`${2 * Math.PI * 18}`}
                                  strokeDashoffset={`${2 * Math.PI * 18 * (1 - selectedStartup.readinessScore / 100)}`}
                                  className={getReadinessScoreBackground(selectedStartup.readinessScore)}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold">{selectedStartup.readinessScore}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-900">FOUNDED DATE</p>
                          <p className="text-sm text-gray-600">{selectedStartup.foundedDate}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900">LOCATION</p>
                        <p className="text-sm text-gray-600">Salt Lake City, Utah, United States</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">{selectedStartup.description}</p>
                      </div>

                      <div>
                        <a href="#" className="text-blue-600 hover:underline text-sm flex items-center space-x-1">
                          <Globe className="w-4 h-4" />
                          <span>{selectedStartup.website}</span>
                        </a>
                      </div>
                    </div>

                    {/* Team */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-900 mb-3">TEAM</p>
                      <div className="space-y-3">
                        {selectedStartup.team?.map((member, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.role}</p>
                            </div>
                          </div>
                        ))}
                        <button className="text-sm text-purple-600 hover:text-purple-800">+8</button>
                      </div>
                    </div>

                    {/* Radar Chart */}
                    {selectedStartup.radarData && (
                      <div className="mb-6">
                        <p className="text-sm font-medium text-gray-900 mb-3">Data & AI Moats</p>
                        <div className="flex justify-center">
                          <RadarChart data={selectedStartup.radarData} />
                        </div>
                        <div className="flex justify-center space-x-4 text-xs mt-2">
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-purple-500 rounded"></div>
                            <span>Current Score</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 border-2 border-blue-500 border-dashed rounded"></div>
                            <span>Industry Benchmark</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 border-2 border-red-500 border-dashed rounded"></div>
                            <span>Risk Factor</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button 
                        onClick={() => triggerWorkflow('micro_due_diligence', selectedStartup.id)}
                        className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        disabled={!mcpConnected}
                      >
                        AI-Powered Executive Summary
                      </button>
                      <button 
                        onClick={() => triggerWorkflow('basic_due_diligence', selectedStartup.id)}
                        className="w-full flex items-center justify-center space-x-2 border border-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={!mcpConnected}
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Due Diligence Report</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'due-diligence' && selectedStartup && (
            <div className="grid grid-cols-4 gap-6">
              {/* Left Sidebar - Company List */}
              <div className="col-span-1">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">5 Saved Startups</h3>
                    <button className="p-1 border border-gray-300 rounded hover:bg-gray-50">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <button className="w-full text-left p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-sm">SolarWine</span>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-sm">Convrt.ai</span>
                      </div>
                    </button>
                    
                    <div className="bg-purple-50 rounded">
                      <button className="w-full text-left p-2">
                        <div className="flex items-center space-x-2">
                          <ChevronDown className="w-4 h-4" />
                          <span className="text-sm font-medium">Vistim Labs</span>
                        </div>
                      </button>
                      
                      <div className="ml-6 pb-2 space-y-1">
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Folder className="w-3 h-3" />
                          <span>1. Corporate</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs bg-purple-100 p-1 rounded">
                          <Folder className="w-3 h-3" />
                          <span>2. Financial information</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Folder className="w-3 h-3" />
                          <span>3. Legal & Compliance</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Folder className="w-3 h-3" />
                          <span>4. Other contracts and agreements</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Folder className="w-3 h-3" />
                          <span>5. Risk Management</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Folder className="w-3 h-3" />
                          <span>6. Sales & Marketing</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Folder className="w-3 h-3" />
                          <span>7. Tax</span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="w-full text-left p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-sm">InnoPlaya</span>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-sm">Spotlight</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content - File List */}
              <div className="col-span-3">
                <div className="bg-white rounded-lg border border-gray-200">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Financial Information</h2>
                        <p className="text-sm text-gray-500">Due Diligence Dashboard / Vistim Labs / Financial Information</p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                          UPLOAD
                        </button>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                          DOWNLOAD ALL
                        </button>
                        <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                          New Request
                        </button>
                        <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                          Edit Index
                        </button>
                        <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                          Export Index
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* File Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Index</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dueDiligenceFiles.map((file) => (
                          <tr key={file.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input type="checkbox" className="rounded border-gray-300" />
                              <span className="ml-3 text-sm text-gray-900">{file.id}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6">
                                  {file.type === 'folder' && <Folder className="w-5 h-5 text-blue-500" />}
                                  {file.type === 'excel' && <FileText className="w-5 h-5 text-green-500" />}
                                  {file.type === 'word' && <FileText className="w-5 h-5 text-blue-500" />}
                                  {file.type === 'pdf' && <FileText className="w-5 h-5 text-red-500" />}
                                </div>
                                <span className="text-sm text-gray-900">{file.title}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {file.size}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {file.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button className="text-gray-400 hover:text-gray-600">
                                <Calendar className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Upload Complete Notification */}
                  <div className="p-4 bg-purple-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">Uploads completed</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <ChevronDown className="w-4 h-4 text-purple-600" />
                        <X className="w-4 h-4 text-purple-600" />
                      </div>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>2.4 📄 2012 Historical Financials.pdf</span>
                        <span>41kb</span>
                        <span className="text-green-600">Uploaded</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>2.5 📄 2012 Historical Financials.pdf</span>
                        <span>41kb</span>
                        <span className="text-green-600">Uploaded</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Startup Detail View */}
          {currentView === 'startup-detail' && selectedCompany && (() => {
            const startup = [...(realStartups || []), ...startups].find(s => s.id === selectedCompany);
            return startup ? (
              <div className="p-6">
                <div className="max-w-6xl mx-auto">
                  {/* Header with back button */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => {setCurrentView('ai-scouting'); setShowRightPanel(false);}}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 ${startup.avatarColor} rounded-xl flex items-center justify-center text-white font-bold text-xl`}>
                          {startup.avatar}
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900">{startup.name}</h1>
                          <p className="text-lg text-gray-600">{startup.founder}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${startup.stageColor}`}>
                        {startup.stage}
                      </span>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Readiness Score</p>
                        <p className={`text-2xl font-bold ${startup.scoreColor}`}>
                          {startup.readinessScore}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Company Overview */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Overview</h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500 uppercase font-medium">Location</p>
                            <p className="text-lg text-gray-900">{startup.location}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 uppercase font-medium">Industry</p>
                            <p className="text-lg text-gray-900">{startup.industry}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 uppercase font-medium">Founded</p>
                            <p className="text-lg text-gray-900">{startup.foundedDate}</p>
                          </div>
                          {startup.website && startup.website !== 'TBD' && (
                            <div>
                              <p className="text-sm text-gray-500 uppercase font-medium">Website</p>
                              <p className="text-lg text-blue-600 hover:text-blue-800 cursor-pointer">{startup.website}</p>
                            </div>
                          )}
                        </div>
                        {startup.description && (
                          <div>
                            <p className="text-sm text-gray-500 uppercase font-medium mb-2">Description</p>
                            <p className="text-gray-700 leading-relaxed">{startup.description}</p>
                          </div>
                        )}
                      </div>

                      {/* Team Information */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Team</h2>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{startup.founder}</p>
                              <p className="text-sm text-gray-500">Founder & CEO</p>
                            </div>
                          </div>
                          {startup.coFounders && startup.coFounders.length > 0 && (
                            startup.coFounders.map((coFounder, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{coFounder}</p>
                                  <p className="text-sm text-gray-500">Co-Founder</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Stats & Actions */}
                    <div className="space-y-6">
                      {/* Quick Stats */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Stage</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${startup.stageColor}`}>
                              {startup.stage}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Readiness</span>
                            <span className={`font-bold ${startup.scoreColor}`}>
                              {startup.readinessScore}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Industry</span>
                            <span className="text-gray-900">{startup.industry}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                        <div className="space-y-3">
                          <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                            Start Due Diligence
                          </button>
                          <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                            Add to Portfolio
                          </button>
                          <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                            Schedule Meeting
                          </button>
                        </div>
                      </div>

                      {/* Upload Information */}
                      {startup.uploadedFile && (
                        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                          <h3 className="text-lg font-semibold text-blue-900 mb-2">Upload Info</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-blue-600">File:</span>
                              <span className="text-blue-900">{startup.uploadedFile}</span>
                            </div>
                            {startup.uploadedAt && (
                              <div className="flex justify-between">
                                <span className="text-blue-600">Uploaded:</span>
                                <span className="text-blue-900">
                                  {new Date(startup.uploadedAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-gray-600 text-lg">Startup not found</p>
                  <button
                    onClick={() => setCurrentView('ai-scouting')}
                    className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Back to AI Scouting
                  </button>
                </div>
              </div>
            );
          })()}

          {/* General Settings View */}
          {currentView === 'general-settings' && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">General Settings</h1>
                  <p className="text-gray-600 mt-2">Manage your account preferences and notifications</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Settings Navigation */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <h2 className="font-semibold text-gray-900 mb-4">Settings</h2>
                      <nav className="space-y-2">
                        <button className="w-full text-left px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium">
                          Account & Profile
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
                          Notifications
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
                          Privacy & Security
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
                          API Keys
                        </button>
                        <button 
                          onClick={() => setCurrentView('superadmin-settings')}
                          className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          SuperAdmin Settings
                        </button>
                      </nav>
                    </div>
                  </div>

                  {/* Settings Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Account & Profile */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Account & Profile</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" defaultValue="VERSSAI" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" defaultValue="User" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" defaultValue="admin@verssai.com" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                          <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" defaultValue="VERSSAI Ventures" />
                        </div>
                      </div>
                    </div>

                    {/* Notification Preferences */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Email Notifications</p>
                            <p className="text-sm text-gray-500">Receive email updates for new startups and due diligence</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Desktop Notifications</p>
                            <p className="text-sm text-gray-500">Show browser notifications for real-time updates</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Weekly Reports</p>
                            <p className="text-sm text-gray-500">Get weekly summary of startup activity and metrics</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* API Configuration */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">API Configuration</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                          <div className="flex space-x-2">
                            <input 
                              type="password" 
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                              value="****-****-****-****" 
                              readOnly
                            />
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                              Regenerate
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Keep your API key secure and don't share it publicly</p>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SuperAdmin Settings View */}
          {currentView === 'superadmin-settings' && (
            <div className="p-6">
              <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">SuperAdmin Settings</h1>
                      <p className="text-gray-600">Advanced system configuration and user management</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* SuperAdmin Navigation */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <h2 className="font-semibold text-gray-900 mb-4">Admin Panel</h2>
                      <nav className="space-y-2">
                        <button className="w-full text-left px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium">
                          System Configuration
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
                          User Management
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
                          Company Settings
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
                          Integration Settings
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
                          Security & Permissions
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
                          Version Management
                        </button>
                        <button 
                          onClick={() => setCurrentView('general-settings')}
                          className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          ← Back to General
                        </button>
                      </nav>
                    </div>
                  </div>

                  {/* SuperAdmin Content */}
                  <div className="lg:col-span-3 space-y-6">
                    {/* System Configuration */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">System Configuration</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Backend API URL</label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" defaultValue="http://localhost:8080" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">N8N Webhook URL</label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" defaultValue="https://versatil.app.n8n.cloud" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ChromaDB URL</label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" defaultValue="http://localhost:8001" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Path</label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" defaultValue="./uploads" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* User Management */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">User Management</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">Total Users</p>
                            <p className="text-2xl font-bold text-purple-600">47</p>
                          </div>
                          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                            Add New User
                          </button>
                        </div>
                        <div className="border-t border-gray-200 pt-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">VC</span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">admin@verssai.com</p>
                                  <p className="text-sm text-gray-500">SuperAdmin</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Active</span>
                                <button className="text-gray-400 hover:text-gray-600">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Integration Settings */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Integration Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Database className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">N8N Automation Platform</p>
                              <p className="text-sm text-gray-500">Workflow automation and startup processing</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Connected</span>
                            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">Configure</button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Layers className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">ChromaDB Vector Database</p>
                              <p className="text-sm text-gray-500">AI embeddings and vector search</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Connected</span>
                            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">Configure</button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Brain className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">VERSSAI AI Engine</p>
                              <p className="text-sm text-gray-500">Startup analysis and scoring engine</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Online</span>
                            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">Monitor</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* System Status */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">System Status</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <p className="font-medium text-green-900">System Healthy</p>
                          </div>
                          <p className="text-sm text-green-700 mt-1">All services operational</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            <p className="font-medium text-blue-900">CPU Usage</p>
                          </div>
                          <p className="text-sm text-blue-700 mt-1">23% - Normal</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Database className="w-5 h-5 text-purple-600" />
                            <p className="font-medium text-purple-900">Storage</p>
                          </div>
                          <p className="text-sm text-purple-700 mt-1">2.3GB / 10GB used</p>
                        </div>
                      </div>
                    </div>

                    {/* Version Management */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Version Management</h3>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Up to date</span>
                        </div>
                      </div>

                      {/* Current Version Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Activity className="w-5 h-5 text-purple-600" />
                            <p className="font-medium text-purple-900">Frontend</p>
                          </div>
                          <p className="text-2xl font-bold text-purple-600">v1.4.2</p>
                          <p className="text-sm text-purple-700">Build 2024.08.18</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Database className="w-5 h-5 text-blue-600" />
                            <p className="font-medium text-blue-900">Backend API</p>
                          </div>
                          <p className="text-2xl font-bold text-blue-600">v2.1.0</p>
                          <p className="text-sm text-blue-700">Build 2024.08.15</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Brain className="w-5 h-5 text-green-600" />
                            <p className="font-medium text-green-900">AI Engine</p>
                          </div>
                          <p className="text-2xl font-bold text-green-600">v3.0.1</p>
                          <p className="text-sm text-green-700">Build 2024.08.17</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Zap className="w-5 h-5 text-orange-600" />
                            <p className="font-medium text-orange-900">N8N Workflows</p>
                          </div>
                          <p className="text-2xl font-bold text-orange-600">v1.8.5</p>
                          <p className="text-sm text-orange-700">Updated 3d ago</p>
                        </div>
                      </div>

                      {/* Version History */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Recent Updates</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <div>
                                <p className="font-medium text-gray-900">Frontend v1.4.2 - UI Enhancement Update</p>
                                <p className="text-sm text-gray-500">Added startup upload functionality and improved dashboard - Aug 18, 2024</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Current</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <div>
                                <p className="font-medium text-gray-900">AI Engine v3.0.1 - Performance Optimization</p>
                                <p className="text-sm text-gray-500">Improved startup analysis speed by 40% - Aug 17, 2024</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Deployed</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <div>
                                <p className="font-medium text-gray-900">Backend API v2.1.0 - Security Enhancement</p>
                                <p className="text-sm text-gray-500">Enhanced authentication and added new endpoints - Aug 15, 2024</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">Stable</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Deployment Controls */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Deployment Actions</h4>
                          <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center space-x-3">
                                <RefreshCw className="w-5 h-5 text-blue-600" />
                                <div className="text-left">
                                  <p className="font-medium text-gray-900">Check for Updates</p>
                                  <p className="text-sm text-gray-500">Scan for new versions</p>
                                </div>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-gray-400" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center space-x-3">
                                <Download className="w-5 h-5 text-green-600" />
                                <div className="text-left">
                                  <p className="font-medium text-gray-900">Download Backup</p>
                                  <p className="text-sm text-gray-500">Create system backup</p>
                                </div>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-gray-400" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                              <div className="flex items-center space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <div className="text-left">
                                  <p className="font-medium text-red-900">Emergency Rollback</p>
                                  <p className="text-sm text-red-500">Revert to previous version</p>
                                </div>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Environment Info</h4>
                          <div className="space-y-3">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Environment</span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Production</span>
                              </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Last Deployment</span>
                                <span className="text-sm font-medium text-gray-900">Aug 18, 2024 14:23</span>
                              </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Uptime</span>
                                <span className="text-sm font-medium text-gray-900">72h 15m</span>
                              </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Auto-Updates</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" defaultChecked className="sr-only peer" />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Changelog */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">Full Changelog</h4>
                          <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                            View All Releases
                          </button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm space-y-2">
                            <div className="flex items-start space-x-2">
                              <span className="text-green-600 font-mono">+</span>
                              <span className="text-gray-700">Added startup upload functionality with single/bulk options</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="text-green-600 font-mono">+</span>
                              <span className="text-gray-700">Implemented right-side panel for startup details</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="text-blue-600 font-mono">~</span>
                              <span className="text-gray-700">Improved navigation between AI Scouting and startup pages</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="text-blue-600 font-mono">~</span>
                              <span className="text-gray-700">Enhanced settings interface with SuperAdmin controls</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="text-orange-600 font-mono">!</span>
                              <span className="text-gray-700">Fixed realStartups iteration bug</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end space-x-3">
                      <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                        Reset to Defaults
                      </button>
                      <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                        Save Configuration
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Views Placeholder */}
          {!['ai-scouting', 'due-diligence', 'startup-detail', 'general-settings', 'superadmin-settings'].includes(currentView) && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg">
                  {currentView === 'portfolio-management' && 'Portfolio Management'}
                  {currentView === 'fund-backtesting' && 'Fund Backtesting'}
                  {currentView === 'fund-allocation' && 'Fund Allocation Optimization'}
                  {currentView === 'lp-communication' && 'LP Communication Automation'}
                  {!['portfolio-management', 'fund-backtesting', 'fund-allocation', 'lp-communication'].includes(currentView) && 'Coming Soon'}
                </p>
                <p className="text-sm text-gray-500 mt-1">This feature is under development</p>
              </div>
            </div>
          )}
        </main>

        {/* Right Side Panel */}
        {showRightPanel && (
          <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300">
            <div className="flex flex-col h-full">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Startup Details</h2>
                <button
                  onClick={() => setShowRightPanel(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {selectedCompany && (() => {
                  const startup = [...(realStartups || []), ...startups].find(s => s.id === selectedCompany);
                  return startup ? (
                    <div className="space-y-6">
                      {/* Company Header */}
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${startup.avatarColor} rounded-lg flex items-center justify-center text-white font-bold`}>
                          {startup.avatar}
                        </div>
                        <div>
                          <h3 
                            className="text-lg font-semibold text-gray-900 hover:text-purple-600 cursor-pointer transition-colors"
                            onClick={(e) => handleCompanyNameClick(startup, e)}
                          >
                            {startup.name}
                          </h3>
                          <p className="text-sm text-gray-500">{startup.founder}</p>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase font-medium">Stage</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${startup.stageColor}`}>
                            {startup.stage}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase font-medium">Readiness Score</p>
                          <p className={`font-bold text-lg ${startup.scoreColor}`}>
                            {startup.readinessScore}%
                          </p>
                        </div>
                      </div>

                      {/* Company Info */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-medium mb-2">Location</p>
                          <p className="text-sm text-gray-900">{startup.location}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-medium mb-2">Industry</p>
                          <p className="text-sm text-gray-900">{startup.industry}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-medium mb-2">Founded</p>
                          <p className="text-sm text-gray-900">{startup.foundedDate}</p>
                        </div>
                        {startup.website && startup.website !== 'TBD' && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-medium mb-2">Website</p>
                            <p className="text-sm text-blue-600">{startup.website}</p>
                          </div>
                        )}
                        {startup.uploadedFile && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-medium mb-2">Uploaded File</p>
                            <p className="text-sm text-gray-900">{startup.uploadedFile}</p>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {startup.description && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-medium mb-2">Description</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{startup.description}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-4 border-t border-gray-200">
                        <button
                          onClick={(e) => handleCompanyNameClick(startup, e)}
                          className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                          View Full Startup Page
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>Startup not found</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upload Startups</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 text-sm mb-6">
                  Choose how you'd like to upload startup decks to VERSSAI for AI analysis.
                </p>

                {/* Single Upload Option */}
                <button
                  onClick={() => handleUploadTypeSelect('single')}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">Single Deck Upload</h3>
                      <p className="text-sm text-gray-500">Upload one pitch deck (PDF, PPT, PPTX)</p>
                    </div>
                  </div>
                </button>

                {/* Bulk Upload Option */}
                <button
                  onClick={() => handleUploadTypeSelect('bulk')}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Folder className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">Bulk Upload</h3>
                      <p className="text-sm text-gray-500">Upload multiple pitch decks at once</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-6 text-xs text-gray-500 text-center">
                Supported formats: PDF, PPT, PPTX • Max file size: 25MB
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress Modal */}
        {isUploading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Uploading Startups...</h2>
                <p className="text-gray-600 text-sm mb-4">
                  AI analysis will begin once upload is complete.
                </p>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">{Math.round(uploadProgress)}% Complete</p>
              </div>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.slice(-3).map((notification) => (
              <div
                key={notification.id}
                className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 ${
                  notification.type === 'success' ? 'border-l-4 border-green-400' :
                  notification.type === 'error' ? 'border-l-4 border-red-400' :
                  'border-l-4 border-blue-400'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="ml-3 w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {notification.message}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                      <button
                        className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500"
                        onClick={() => {
                          setNotifications(prev => prev.filter(n => n.id !== notification.id));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VERSSAIExactDashboard;