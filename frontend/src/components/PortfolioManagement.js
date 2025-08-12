import React, { useState, useEffect } from 'react';
import '../components/PalantirTheme.css';
import {
  ArrowLeft, Terminal, Activity, TrendingUp, Users, Target, 
  Plus, Search, Filter, Eye, BarChart3, Calendar, DollarSign,
  Briefcase, Award, AlertCircle, CheckCircle, Clock, Zap,
  Network, Database, Brain, Settings
} from 'lucide-react';
import axios from 'axios';

const PortfolioManagement = () => {
  const [portfolioCompanies, setPortfolioCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // overview, analytics, meetings, data-ingestion
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [isIngesting, setIsIngesting] = useState(false);
  const [showDataIngestionModal, setShowDataIngestionModal] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Data ingestion handler for portfolio companies
  const handleDataIngestion = async (formData) => {
    setIsIngesting(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/portfolio/ingest-data`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        // Refresh portfolio data
        fetchPortfolioData();
        setShowDataIngestionModal(false);
        alert('Portfolio data successfully ingested!');
      }
    } catch (error) {
      console.error('Data ingestion failed:', error);
      alert('Data ingestion failed. Using demo data for now.');
    } finally {
      setIsIngesting(false);
    }
  };

  const fetchPortfolioData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/portfolio/companies`);
      setPortfolioCompanies(response.data.companies || getMockPortfolioData());
    } catch (error) {
      console.error('Failed to fetch portfolio data:', error);
      // Use mock data as fallback
      setPortfolioCompanies(getMockPortfolioData());
    }
  };

  const getMockPortfolioData = () => [
      {
        id: 1,
        name: 'NeuralTech AI',
        stage: 'Series B',
        industry: 'AI/ML',
        investmentDate: '2023-03-15',
        investmentAmount: 5000000,
        currentValuation: 45000000,
        monthlyRRR: 125000,
        burnRate: 180000,
        runway: 18,
        teamSize: 45,
        kpis: {
          mrr: 125000,
          arr: 1500000,
          grossMargin: 78,
          netRevenueRetention: 112,
          customerCount: 340,
          cac: 2800
        },
        riskLevel: 'Low',
        boardMeetings: 4,
        lastUpdate: '2025-01-08'
      },
      {
        id: 2,
        name: 'QuantumSecure',
        stage: 'Series A',
        industry: 'Cybersecurity',
        investmentDate: '2024-01-20',
        investmentAmount: 8000000,
        currentValuation: 32000000,
        monthlyRRR: 85000,
        burnRate: 220000,
        runway: 12,
        teamSize: 32,
        kpis: {
          mrr: 85000,
          arr: 1020000,
          grossMargin: 82,
          netRevenueRetention: 108,
          customerCount: 120,
          cac: 4200
        },
        riskLevel: 'Medium',
        boardMeetings: 6,
        lastUpdate: '2025-01-05'
      },
      {
        id: 3,
        name: 'BioInnovate',
        stage: 'Seed',
        industry: 'Biotech',
        investmentDate: '2024-06-10',
        investmentAmount: 2000000,
        currentValuation: 12000000,
        monthlyRRR: 15000,
        burnRate: 85000,
        runway: 24,
        teamSize: 18,
        kpis: {
          mrr: 15000,
          arr: 180000,
          grossMargin: 65,
          netRevenueRetention: 95,
          customerCount: 8,
          cac: 12000
        },
        riskLevel: 'High',
        boardMeetings: 8,
        lastUpdate: '2025-01-10'
      }
    ];
  
  // Initialize with mock data and attempt to fetch real data
  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Seed': return 'bg-purple-500/20 text-purple-400';
      case 'Series A': return 'bg-blue-500/20 text-blue-400';
      case 'Series B': return 'bg-green-500/20 text-green-400';
      case 'Series C+': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredCompanies = portfolioCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStage === 'all' || company.stage === filterStage;
    return matchesSearch && matchesFilter;
  });

  const CompanyCard = ({ company }) => (
    <div 
      className="palantir-card p-6 cursor-pointer hover:scale-105 transition-all duration-300"
      onClick={() => setSelectedCompany(company)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{company.name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(company.stage)}`}>
            {company.stage}
          </span>
        </div>
        <div className={`palantir-status ${company.riskLevel === 'Low' ? 'operational' : 'warning'}`}>
          <div className={`w-2 h-2 rounded-full ${getRiskColor(company.riskLevel)}`}></div>
          {company.riskLevel} RISK
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-400">Current Valuation</div>
          <div className="text-lg font-bold text-cyan-400">{formatCurrency(company.currentValuation)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Monthly RRR</div>
          <div className="text-lg font-bold text-green-400">{formatCurrency(company.monthlyRRR)}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <div className="text-gray-500">Runway</div>
          <div className="text-white palantir-mono">{company.runway}mo</div>
        </div>
        <div>
          <div className="text-gray-500">Team</div>
          <div className="text-white palantir-mono">{company.teamSize}</div>
        </div>
        <div>
          <div className="text-gray-500">Board Meetings</div>
          <div className="text-white palantir-mono">{company.boardMeetings}</div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center">
        <div className="text-xs text-gray-400">
          Last Update: {new Date(company.lastUpdate).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <TrendingUp className="w-4 h-4 text-green-400" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Palantir Header */}
      <header className="palantir-panel border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="palantir-btn flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Command Center
            </button>
            <div className="w-px h-6 bg-gray-700"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Portfolio Management</h1>
                <p className="text-xs text-gray-400 palantir-mono">Intelligence Framework #3</p>
              </div>
            </div>
            <div className="palantir-status operational">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              ACTIVE
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="palantir-status processing">
              <Activity className="w-3 h-3" />
              PORTFOLIO: {portfolioCompanies.length}
            </div>
            <button className="palantir-btn">
              <Terminal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Portfolio Overview */}
        <div className="mb-8">
          <div className="palantir-panel p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                Portfolio Intelligence Dashboard
              </h2>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowDataIngestionModal(true)}
                  className="palantir-btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  INGEST DATA
                </button>
                <div className="palantir-mono text-sm text-gray-400">
                  REAL-TIME MONITORING
                </div>
              </div>
            </div>

            {/* Feature Explanation Panel */}
            <div className="palantir-card p-4 mb-6 border border-blue-500/30">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-400" />
                Portfolio Management Capabilities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-cyan-400">📊 DATA INGESTION</h4>
                  <p className="text-gray-300">
                    • Upload board decks & financial reports
                    • Integrate with accounting systems
                    • Import KPI data (MRR, ARR, CAC, LTV)
                    • Connect to CRM and sales platforms
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-400">🧠 AI ANALYSIS</h4>
                  <p className="text-gray-300">
                    • Automated performance trend analysis
                    • Risk assessment and runway prediction
                    • Board meeting insights extraction
                    • Competitive benchmarking
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-orange-400">📈 PORTFOLIO OPTIMIZATION</h4>
                  <p className="text-gray-300">
                    • Resource allocation recommendations
                    • Exit timing optimization
                    • Follow-on investment analysis
                    • Portfolio company cross-collaboration
                  </p>
                </div>
              </div>
            </div>

            {/* Portfolio Metrics */}
            <div className="palantir-grid-4 mb-6">
              <div className="palantir-metric">
                <div className="palantir-metric-value">{portfolioCompanies.length}</div>
                <div className="palantir-metric-label">Active Companies</div>
                <div className="mt-2 text-xs text-green-400">portfolio managed</div>
              </div>
              <div className="palantir-metric">
                <div className="palantir-metric-value">
                  {formatCurrency(portfolioCompanies.reduce((sum, c) => sum + c.currentValuation, 0))}
                </div>
                <div className="palantir-metric-label">Total Portfolio Value</div>
                <div className="mt-2 text-xs text-cyan-400">current valuation</div>
              </div>
              <div className="palantir-metric">
                <div className="palantir-metric-value">
                  {formatCurrency(portfolioCompanies.reduce((sum, c) => sum + c.monthlyRRR, 0))}
                </div>
                <div className="palantir-metric-label">Monthly RRR</div>
                <div className="mt-2 text-xs text-blue-400">recurring revenue</div>
              </div>
              <div className="palantir-metric">
                <div className="palantir-metric-value">
                  {(portfolioCompanies.reduce((sum, c) => sum + c.runway, 0) / portfolioCompanies.length).toFixed(1)}
                </div>
                <div className="palantir-metric-label">Avg Runway</div>
                <div className="mt-2 text-xs text-orange-400">months remaining</div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search portfolio companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="all">All Stages</option>
                <option value="Seed">Seed</option>
                <option value="Series A">Series A</option>
                <option value="Series B">Series B</option>
                <option value="Series C+">Series C+</option>
              </select>
              <button className="palantir-btn flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Company
              </button>
            </div>
          </div>
        </div>

        {/* Company Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredCompanies.map(company => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>

        {/* Company Detail Modal */}
        {selectedCompany && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="palantir-panel p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedCompany.name}</h2>
                  <p className="text-gray-400">{selectedCompany.industry} • {selectedCompany.stage}</p>
                </div>
                <button 
                  onClick={() => setSelectedCompany(null)}
                  className="palantir-btn"
                >
                  ✕
                </button>
              </div>

              {/* KPI Grid */}
              <div className="palantir-grid-4 mb-6">
                <div className="palantir-metric">
                  <div className="palantir-metric-value">{formatCurrency(selectedCompany.kpis.mrr)}</div>
                  <div className="palantir-metric-label">Monthly Recurring Revenue</div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">{selectedCompany.kpis.grossMargin}%</div>
                  <div className="palantir-metric-label">Gross Margin</div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">{selectedCompany.kpis.netRevenueRetention}%</div>
                  <div className="palantir-metric-label">Net Revenue Retention</div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">{formatCurrency(selectedCompany.kpis.cac)}</div>
                  <div className="palantir-metric-label">Customer Acquisition Cost</div>
                </div>
              </div>

              <div className="palantir-card p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Investment Summary</h3>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <div className="text-gray-400">Investment Date</div>
                    <div className="text-white">{new Date(selectedCompany.investmentDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Investment Amount</div>
                    <div className="text-white">{formatCurrency(selectedCompany.investmentAmount)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Current Valuation</div>
                    <div className="text-white">{formatCurrency(selectedCompany.currentValuation)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Unrealized Multiple</div>
                    <div className="text-green-400 font-bold">
                      {(selectedCompany.currentValuation / selectedCompany.investmentAmount).toFixed(1)}x
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Ingestion Modal */}
        {showDataIngestionModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="palantir-panel p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Portfolio Data Ingestion</h2>
                  <p className="text-gray-400">Upload financial reports, board decks, and KPI data for AI-powered analysis</p>
                </div>
                <button 
                  onClick={() => setShowDataIngestionModal(false)}
                  className="palantir-btn"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Data Source Options */}
                <div className="palantir-card p-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-cyan-400" />
                    Data Sources
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border border-gray-700 rounded cursor-pointer hover:border-cyan-400">
                      <input type="checkbox" className="text-cyan-400" />
                      <div>
                        <div className="font-medium text-white">📊 Board Deck Upload</div>
                        <div className="text-sm text-gray-400">Monthly/quarterly board presentations</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-700 rounded cursor-pointer hover:border-cyan-400">
                      <input type="checkbox" className="text-cyan-400" />
                      <div>
                        <div className="font-medium text-white">💰 Financial Reports</div>
                        <div className="text-sm text-gray-400">P&L, balance sheets, cash flow</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-700 rounded cursor-pointer hover:border-cyan-400">
                      <input type="checkbox" className="text-cyan-400" />
                      <div>
                        <div className="font-medium text-white">📈 KPI Dashboards</div>
                        <div className="text-sm text-gray-400">MRR, ARR, CAC, LTV metrics</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-700 rounded cursor-pointer hover:border-cyan-400">
                      <input type="checkbox" className="text-cyan-400" />
                      <div>
                        <div className="font-medium text-white">📧 Board Meeting Minutes</div>
                        <div className="text-sm text-gray-400">Meeting notes and action items</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* File Upload Area */}
                <div className="palantir-card p-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-400" />
                    File Upload
                  </h3>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-cyan-400 transition-colors">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-white mb-2">Drop files here or click to browse</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Supports PDF, Excel, PowerPoint, CSV files up to 100MB
                    </p>
                    <input 
                      type="file" 
                      multiple 
                      accept=".pdf,.xlsx,.pptx,.csv,.docx"
                      className="hidden" 
                      id="portfolio-file-upload"
                    />
                    <label 
                      htmlFor="portfolio-file-upload" 
                      className="palantir-btn-primary cursor-pointer inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Select Files
                    </label>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-semibold text-white mb-2">Expected Data Types:</h4>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div>• Monthly Recurring Revenue (MRR)</div>
                      <div>• Customer Acquisition Cost (CAC)</div>
                      <div>• Lifetime Value (LTV)</div>
                      <div>• Net Revenue Retention (NRR)</div>
                      <div>• Gross Margin & Unit Economics</div>
                      <div>• Cash Burn Rate & Runway</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button 
                  onClick={() => setShowDataIngestionModal(false)}
                  className="palantir-btn"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert('Data ingestion feature will extract KPIs from uploaded files and automatically update portfolio metrics using AI analysis.');
                    setShowDataIngestionModal(false);
                  }}
                  className="palantir-btn-primary flex items-center gap-2"
                  disabled={isIngesting}
                >
                  {isIngesting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Start Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioManagement;