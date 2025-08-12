import React, { useEffect, useState } from "react";
import "./App.css";
import "./components/ClickUpTheme.css";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import axios from "axios";
import FounderSignalFit from "./components/FounderSignalFit";
import DueDiligenceDataRoom from "./components/DueDiligenceDataRoom";
import PortfolioManagement from "./components/PortfolioManagement";
import FundAssessment from "./components/FundAssessment";
import FundAllocation from "./components/FundAllocation";
import FundVintage from "./components/FundVintage";
import { 
  Activity, Search, Brain, Shield, 
  TrendingUp, BarChart3, Target, Award, 
  Users, FileText, Zap, Settings, Bell, User, 
  Home, ChevronRight, Database, Network
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Header = () => {
  const location = useLocation();

  return (
    <header className="clickup-header">
      <div className="clickup-header-content">
        <div className="clickup-nav">
          <Link to="/" className="clickup-logo">
            <div className="clickup-framework-icon clickup-bg-primary">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span>VERSSAI</span>
          </Link>
          <nav className="clickup-nav" style={{ marginLeft: '2rem' }}>
            <Link to="/" className={`clickup-nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            <Link to="/founder-signal" className={`clickup-nav-link ${location.pathname === '/founder-signal' ? 'active' : ''}`}>
              <Users className="w-4 h-4" />
              Founder Analysis
            </Link>
            <Link to="/due-diligence" className={`clickup-nav-link ${location.pathname === '/due-diligence' ? 'active' : ''}`}>
              <FileText className="w-4 h-4" />
              Due Diligence
            </Link>
            <Link to="/portfolio" className={`clickup-nav-link ${location.pathname === '/portfolio' ? 'active' : ''}`}>
              <TrendingUp className="w-4 h-4" />
              Portfolio
            </Link>
          </nav>
        </div>
        
        <div className="clickup-nav">
          <button className="clickup-btn clickup-btn-secondary">
            <Search className="w-4 h-4" />
            Search
          </button>
          <button className="clickup-btn clickup-btn-secondary">
            <Settings className="w-4 h-4" />
          </button>
          <button className="clickup-btn clickup-btn-secondary">
            <Bell className="w-4 h-4" />
          </button>
          <button className="clickup-btn clickup-btn-secondary">
            <User className="w-4 h-4" />
            Admin
          </button>
        </div>
      </div>
    </header>
  );
};

const Dashboard = () => {
  const [systemStats, setSystemStats] = useState({
    totalAnalyses: 1247,
    activeDeals: 18,
    portfolioValue: 2.8,
    aiAccuracy: 94.7
  });

  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  const frameworks = [
    {
      id: 'founder-signal',
      title: 'Founder Signal Fit',
      description: 'AI-powered founder assessment with enhanced research and social intelligence',
      icon: <Users className="w-6 h-6" />,
      color: 'var(--success)',
      bgColor: 'rgb(16 185 129 / 0.1)',
      stats: { accuracy: '94.7%', avgTime: '0.8 min', processed: 347 },
      status: 'Production Ready'
    },
    {
      id: 'due-diligence',
      title: 'Due Diligence Data Room',
      description: 'Multi-document RAG analysis with comprehensive risk assessment',
      icon: <FileText className="w-6 h-6" />,
      color: 'var(--info)',
      bgColor: 'rgb(59 130 246 / 0.1)',
      stats: { accuracy: '91.2%', avgTime: '3.2 min', processed: 156 },
      status: 'Production Ready'
    },
    {
      id: 'portfolio',
      title: 'Portfolio Management',
      description: 'Real-time portfolio analytics with board meeting intelligence',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'var(--primary-brand)',
      bgColor: 'rgb(124 58 237 / 0.1)',
      stats: { companies: 67, totalValue: '$2.8B', irr: '34.7%' },
      status: 'Production Ready'
    },
    {
      id: 'fund-assessment',
      title: 'Fund Assessment',
      description: 'Historical backtesting and performance analysis with benchmarking',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'var(--warning)',
      bgColor: 'rgb(245 158 11 / 0.1)',
      stats: { funds: 12, avgReturn: '28.4%', quartile: 'Top 10%' },
      status: 'Production Ready'
    },
    {
      id: 'fund-allocation',
      title: 'Fund Allocation',
      description: 'Monte Carlo optimization for strategic fund deployment',
      icon: <Target className="w-6 h-6" />,
      color: 'var(--secondary-brand)',
      bgColor: 'rgb(6 182 212 / 0.1)',
      stats: { simulations: '10k+', efficiency: '97.3%', savings: '$24M' },
      status: 'Production Ready'
    },
    {
      id: 'fund-vintage',
      title: 'Fund Vintage Management',
      description: 'Multi-vintage performance comparison and industry benchmarking',
      icon: <Award className="w-6 h-6" />,
      color: '#ec4899',
      bgColor: 'rgb(236 72 153 / 0.1)',
      stats: { vintages: 8, ranking: 'Top Decile', tvpi: '2.45x' },
      status: 'Production Ready'
    }
  ];

  return (
    <div className="clickup-main">
      <div className="clickup-page-header">
        <h1 className="clickup-page-title">VERSSAI VC Intelligence Platform</h1>
        <p className="clickup-page-subtitle">
          Institutional-grade investment intelligence powered by AI and research-backed insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="clickup-grid clickup-grid-4 clickup-mb-xl">
        <div className="clickup-card">
          <div className="clickup-card-body clickup-metric">
            <div className="clickup-metric-value clickup-text-success">
              {systemStats.totalAnalyses.toLocaleString()}
            </div>
            <div className="clickup-metric-label">Total Analyses Completed</div>
            <div className="clickup-metric-change positive clickup-mt-xs">
              +127 this month
            </div>
          </div>
        </div>

        <div className="clickup-card">
          <div className="clickup-card-body clickup-metric">
            <div className="clickup-metric-value clickup-text-info">
              {systemStats.activeDeals}
            </div>
            <div className="clickup-metric-label">Active Deal Analysis</div>
            <div className="clickup-metric-change positive clickup-mt-xs">
              +5 today
            </div>
          </div>
        </div>

        <div className="clickup-card">
          <div className="clickup-card-body clickup-metric">
            <div className="clickup-metric-value clickup-text-brand">
              ${systemStats.portfolioValue}B
            </div>
            <div className="clickup-metric-label">Assets Under Management</div>
            <div className="clickup-metric-change positive clickup-mt-xs">
              +$340M QTD
            </div>
          </div>
        </div>

        <div className="clickup-card">
          <div className="clickup-card-body clickup-metric">
            <div className="clickup-metric-value clickup-text-warning">
              {systemStats.aiAccuracy}%
            </div>
            <div className="clickup-metric-label">AI Prediction Accuracy</div>
            <div className="clickup-metric-change positive clickup-mt-xs">
              Top decile performance
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="clickup-card clickup-mb-xl">
        <div className="clickup-card-header">
          <h3 className="clickup-card-title">
            <Activity className="w-5 h-5" />
            System Status
          </h3>
        </div>
        <div className="clickup-card-body">
          <div className="clickup-grid clickup-grid-4">
            <div className="clickup-metric">
              <div className="flex items-center justify-center mb-3">
                <Database className="w-8 h-8 clickup-text-success" />
              </div>
              <div className="clickup-metric-label">ChromaDB</div>
              <div className="clickup-status clickup-status-success clickup-mt-sm">
                <div className="w-2 h-2 rounded-full bg-current"></div>
                Operational
              </div>
            </div>

            <div className="clickup-metric">
              <div className="flex items-center justify-center mb-3">
                <Brain className="w-8 h-8 clickup-text-info" />
              </div>
              <div className="clickup-metric-label">Google Gemini Pro</div>
              <div className="clickup-status clickup-status-success clickup-mt-sm">
                <div className="w-2 h-2 rounded-full bg-current"></div>
                Operational
              </div>
            </div>

            <div className="clickup-metric">
              <div className="flex items-center justify-center mb-3">
                <Search className="w-8 h-8 clickup-text-warning" />
              </div>
              <div className="clickup-metric-label">Google Search API</div>
              <div className="clickup-status clickup-status-success clickup-mt-sm">
                <div className="w-2 h-2 rounded-full bg-current"></div>
                Operational
              </div>
            </div>

            <div className="clickup-metric">
              <div className="flex items-center justify-center mb-3">
                <Network className="w-8 h-8 clickup-text-brand" />
              </div>
              <div className="clickup-metric-label">Twitter API</div>
              <div className="clickup-status clickup-status-warning clickup-mt-sm">
                <div className="w-2 h-2 rounded-full bg-current"></div>
                Rate Limited
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VC Intelligence Frameworks */}
      <div className="clickup-mb-xl">
        <h2 className="clickup-text-xl clickup-font-semibold clickup-mb-lg">
          Intelligence Frameworks
        </h2>
        <div className="clickup-grid clickup-grid-3">
          {frameworks.map((framework) => (
            <Link 
              key={framework.id} 
              to={`/${framework.id}`} 
              className="clickup-framework-card"
            >
              <div className="clickup-framework-header">
                <div 
                  className="clickup-framework-icon"
                  style={{ 
                    backgroundColor: framework.bgColor,
                    color: framework.color 
                  }}
                >
                  {framework.icon}
                </div>
                <div className="clickup-framework-info">
                  <h3>{framework.title}</h3>
                  <div className="clickup-status clickup-status-success clickup-mt-xs">
                    {framework.status}
                  </div>
                </div>
              </div>
              <div className="clickup-framework-body">
                <p className="clickup-text-secondary clickup-mb-md">
                  {framework.description}
                </p>
                <div className="clickup-framework-stats">
                  {Object.entries(framework.stats).map(([key, value]) => (
                    <div key={key} className="clickup-framework-stat">
                      <div className="clickup-framework-stat-value">{value}</div>
                      <div className="clickup-framework-stat-label">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="clickup-card">
        <div className="clickup-card-header">
          <h3 className="clickup-card-title">
            <Activity className="w-5 h-5" />
            Recent Activity
          </h3>
        </div>
        <div className="clickup-card-body">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-sm">TechCorp AI Analysis Completed</div>
                  <div className="text-xs text-gray-600">Founder Signal Fit • Score: 85% • Recommendation: STRONG_BUY</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">2 minutes ago</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-sm">DataTech Due Diligence Uploaded</div>
                  <div className="text-xs text-gray-600">Due Diligence Data Room • 12 documents • Processing...</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">15 minutes ago</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-sm">Fund Allocation Optimization Complete</div>
                  <div className="text-xs text-gray-600">Growth Fund I • Expected IRR: 28.4% • Optimization Score: 97.3%</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">1 hour ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/founder-signal" element={<FounderSignalFit />} />
          <Route path="/due-diligence" element={<DueDiligenceDataRoom />} />
          <Route path="/portfolio" element={<PortfolioManagement />} />
          <Route path="/fund-assessment" element={<FundAssessment />} />
          <Route path="/fund-allocation" element={<FundAllocation />} />
          <Route path="/fund-vintage" element={<FundVintage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;