import React, { useState, useEffect, useCallback } from 'react';
import { 
  Brain, 
  FileSearch, 
  TrendingUp, 
  Target, 
  DollarSign, 
  MessageSquare,
  Play,
  Pause,
  Settings,
  Users,
  Zap,
  Shield,
  Activity,
  ChevronRight,
  BarChart3,
  GitBranch,
  Database,
  Layers,
  Wifi,
  WifiOff,
  Upload,
  Download,
  Filter,
  Search,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  TrendingDown
} from 'lucide-react';

const VERSSAIEnhancedDashboard = () => {
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState({});
  const [mcpConnected, setMcpConnected] = useState(true);
  const [currentUser] = useState({
    id: 'user_123',
    name: 'Alex Chen',
    role: 'SuperAdmin',
    organization: 'Versatil.VC',
    avatar: '/api/placeholder/32/32'
  });
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [ragLayer, setRagLayer] = useState('vc');
  const [dashboardStats, setDashboardStats] = useState({
    totalCompanies: 247,
    activeDeals: 18,
    portfolioValue: '$284M',
    monthlyROI: '+12.4%'
  });
  const [portfolioCompanies, setPortfolioCompanies] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [ragQuery, setRagQuery] = useState('');
  const [ragResults, setRagResults] = useState(null);
  const [vcIntelligence, setVcIntelligence] = useState(null);
  const [loading, setLoading] = useState(false);

  // API base URL
  const API_BASE = 'http://localhost:8080/api';

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE}/dashboard/stats`);
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setDashboardStats(stats);
      }

      // Fetch portfolio companies
      const companiesResponse = await fetch(`${API_BASE}/portfolios/companies`);
      if (companiesResponse.ok) {
        const companies = await companiesResponse.json();
        setPortfolioCompanies(companies);
      }

      // Fetch workflows
      const workflowsResponse = await fetch(`${API_BASE}/workflows`);
      if (workflowsResponse.ok) {
        const workflowData = await workflowsResponse.json();
        setWorkflows(workflowData.workflows);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // RAG Layer switching
  const ragLayers = [
    { id: 'roof', label: 'Academic Research', color: 'bg-blue-100 text-blue-800', description: '1,157 Papers' },
    { id: 'vc', label: 'VC Intelligence', color: 'bg-purple-100 text-purple-800', description: '2,311 Researchers' },
    { id: 'founder', label: 'Founder Intel', color: 'bg-green-100 text-green-800', description: '38K Citations' }
  ];

  // Execute workflow
  const executeWorkflow = useCallback(async (workflowId) => {
    setActiveWorkflow(workflowId);
    setWorkflowStatus(prev => ({ ...prev, [workflowId]: { status: 'running', progress: 0 } }));
    
    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setWorkflowStatus(prev => ({ 
        ...prev, 
        [workflowId]: { status: 'running', progress: i } 
      }));
    }
    
    setWorkflowStatus(prev => ({ 
      ...prev, 
      [workflowId]: { status: 'completed', progress: 100 } 
    }));
    setActiveWorkflow(null);
  }, []);

  // Query RAG system
  const queryRAGSystem = async () => {
    if (!ragQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/rag/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: ragQuery,
          layer: ragLayer,
          limit: 5
        })
      });

      if (response.ok) {
        const results = await response.json();
        setRagResults(results);
      } else {
        console.error('RAG query failed');
      }
    } catch (error) {
      console.error('Error querying RAG system:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate VC Intelligence
  const generateVCIntelligence = async (companyDescription) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/rag/vc-intelligence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_description: companyDescription
        })
      });

      if (response.ok) {
        const intelligence = await response.json();
        setVcIntelligence(intelligence);
      } else {
        console.error('VC intelligence generation failed');
      }
    } catch (error) {
      console.error('Error generating VC intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ingest dataset
  const ingestDataset = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/rag/ingest-dataset`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Dataset ingestion started in background. This may take a few minutes.');
      }
    } catch (error) {
      console.error('Error starting dataset ingestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const WorkflowCard = ({ workflow }) => {
    const isRunning = workflowStatus[workflow.workflow_id]?.status === 'running';
    const isCompleted = workflowStatus[workflow.workflow_id]?.status === 'completed';
    const progress = workflowStatus[workflow.workflow_id]?.progress || 0;

    const iconMap = {
      'founder_signal': Brain,
      'due_diligence': FileSearch,
      'portfolio_management': TrendingUp,
      'competitive_intelligence': Target,
      'fund_allocation': DollarSign,
      'lp_communication': MessageSquare
    };

    const colorMap = {
      'founder_signal': 'bg-blue-500',
      'due_diligence': 'bg-purple-500',
      'portfolio_management': 'bg-green-500',
      'competitive_intelligence': 'bg-orange-500',
      'fund_allocation': 'bg-indigo-500',
      'lp_communication': 'bg-pink-500'
    };

    const IconComponent = iconMap[workflow.workflow_id] || Brain;
    const bgColor = colorMap[workflow.workflow_id] || 'bg-blue-500';

    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${bgColor}`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {workflow.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {workflow.description}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded-md">
                    {workflow.category}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {workflow.estimated_time}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isCompleted && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {isRunning ? (
                <button 
                  onClick={() => setActiveWorkflow(null)}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                >
                  <Pause className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={() => executeWorkflow(workflow.workflow_id)}
                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                  disabled={activeWorkflow && activeWorkflow !== workflow.workflow_id}
                >
                  <Play className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {isRunning && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center text-green-800 text-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Workflow completed successfully
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {workflow.features?.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-600">
                    {feature}
                  </div>
                ))}
                {workflow.features?.length > 3 && (
                  <div className="px-2 py-1 text-xs bg-gray-200 rounded text-gray-500">
                    +{workflow.features.length - 3}
                  </div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PortfolioCard = ({ company }) => (
    <div 
      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm cursor-pointer"
      onClick={() => setSelectedCompany(company)}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">{company.name}</h4>
          <div className={`w-2 h-2 rounded-full ${
            company.status === 'performing' ? 'bg-green-500' :
            company.status === 'growing' ? 'bg-blue-500' : 'bg-yellow-500'
          }`} />
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Stage:</span>
            <span className="font-medium">{company.stage}</span>
          </div>
          <div className="flex justify-between">
            <span>Valuation:</span>
            <span className="font-medium">{company.valuation}</span>
          </div>
          <div className="flex justify-between">
            <span>Signal:</span>
            <span className={`font-medium ${company.signal > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
              {company.signal}/100
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{company.industry}</span>
            <span>{company.lastUpdate}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">VERSSAI Enhanced</h1>
              </div>
              <div className="flex items-center space-x-2">
                {mcpConnected ? (
                  <div className="flex items-center text-green-600 text-sm">
                    <Wifi className="w-4 h-4 mr-1" />
                    Connected
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 text-sm">
                    <WifiOff className="w-4 h-4 mr-1" />
                    Disconnected
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* RAG Layer Selector */}
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-gray-500" />
                <select 
                  value={ragLayer} 
                  onChange={(e) => setRagLayer(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ragLayers.map(layer => (
                    <option key={layer.id} value={layer.id}>{layer.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full bg-gray-200"
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{currentUser.name}</div>
                  <div className="text-gray-500">{currentUser.role}</div>
                </div>
              </div>
              
              <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portfolio Companies</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalCompanies}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeDeals}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.portfolioValue}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly ROI</p>
                <p className="text-2xl font-bold text-green-600">{dashboardStats.monthlyROI}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* VC Workflows */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">VC Intelligence Workflows</h2>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={ingestDataset}
                  disabled={loading}
                  className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 mr-1 inline animate-spin" />
                  ) : (
                    <Database className="w-4 h-4 mr-1 inline" />
                  )}
                  Ingest Dataset
                </button>
                <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4 mr-1 inline" />
                  New Workflow
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workflows.map(workflow => (
                <WorkflowCard key={workflow.workflow_id} workflow={workflow} />
              ))}
            </div>
          </div>

          {/* Portfolio & RAG Intelligence */}
          <div className="space-y-6">
            {/* RAG Query Interface */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Intelligence Query</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  {ragLayers.map(layer => (
                    <div 
                      key={layer.id}
                      className={`px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
                        ragLayer === layer.id ? layer.color : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => setRagLayer(layer.id)}
                    >
                      <div className="font-medium">{layer.label}</div>
                      <div className="text-xs opacity-75">{layer.description}</div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={ragQuery}
                    onChange={(e) => setRagQuery(e.target.value)}
                    placeholder="Query the research intelligence..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && queryRAGSystem()}
                  />
                  <button 
                    onClick={queryRAGSystem}
                    disabled={loading || !ragQuery.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </div>

                {ragResults && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">
                      Found {ragResults.total_found} results in {ragResults.layer} layer
                    </div>
                    {ragResults.results.documents && ragResults.results.documents[0] && (
                      <div className="space-y-2">
                        {ragResults.results.documents[0].slice(0, 2).map((doc, idx) => (
                          <div key={idx} className="p-2 bg-white rounded text-xs">
                            {doc.substring(0, 200)}...
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* VC Intelligence Generator */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">VC Intelligence Assessment</h3>
              
              <button 
                onClick={() => generateVCIntelligence("AI-powered fintech startup developing machine learning algorithms for credit risk assessment")}
                disabled={loading}
                className="w-full p-3 text-left rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center">
                  <Brain className="w-4 h-4 mr-3 text-blue-500" />
                  <span className="text-sm font-medium">Generate Sample VC Intelligence</span>
                </div>
              </button>

              {vcIntelligence && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-green-700 font-medium">Investment Signal</div>
                      <div className="text-green-900 text-lg">{(vcIntelligence.investment_signal * 100).toFixed(1)}%</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-red-700 font-medium">Risk Score</div>
                      <div className="text-red-900 text-lg">{(vcIntelligence.risk_score * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-blue-700 font-medium mb-2">Market Validation</div>
                    <div className="text-blue-900 text-sm">
                      Academic Support: {vcIntelligence.market_validation.academic_support} papers
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Portfolio Companies */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Portfolio Companies</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {portfolioCompanies.map(company => (
                  <PortfolioCard key={company.id} company={company} />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full p-3 text-left rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <Upload className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-sm font-medium">Upload Documents</span>
                  </div>
                </button>
                <button 
                  onClick={() => setRagQuery("AI startup funding trends 2024")}
                  className="w-full p-3 text-left rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Search className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-sm font-medium">Research Query</span>
                  </div>
                </button>
                <button className="w-full p-3 text-left rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-sm font-medium">Generate Report</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VERSSAIEnhancedDashboard;
