import React, { useEffect, useState } from "react";
import "./App.css";
import "./components/PalantirTheme.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import FounderSignalFit from "./components/FounderSignalFit";
import DueDiligenceDataRoom from "./components/DueDiligenceDataRoom";
import PortfolioManagement from "./components/PortfolioManagement";
import FundAssessment from "./components/FundAssessment";
import FundAllocation from "./components/FundAllocation";
import FundVintage from "./components/FundVintage";
import { 
  Activity, Database, Search, Brain, Shield, 
  TrendingUp, BarChart3, Target, Award, 
  Users, FileText, Cpu, Network, Zap,
  Settings, Bell, User, Terminal, Briefcase
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

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
    
    // Command palette keyboard shortcut
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900" style={{ background: 'var(--bg-primary)' }}>
      {/* Institutional Command Header */}
      <header className="institutional-panel border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-sm flex items-center justify-center border border-gray-700">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="institutional-title text-3xl">VERSSAI</h1>
                <p className="institutional-mono text-xs text-gray-400 tracking-wider">TOP DECILE VC INTELLIGENCE</p>
              </div>
            </div>
            <div className="institutional-status operational">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              OPERATIONAL
            </div>
            <div className="institutional-ticker hidden lg:block">
              <div className="institutional-ticker-content">
                <span className="mr-8">NASDAQ: +0.85%</span>
                <span className="mr-8">VIX: 18.45</span>
                <span className="mr-8">USD/EUR: 1.0856</span>
                <span className="mr-8">VC INDEX: +2.3%</span>
                <span className="mr-8">UNICORN COUNT: 1,207</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="institutional-btn">
              <Terminal className="w-4 h-4" />
              CTRL+K
            </button>
            <button className="institutional-btn">
              <Settings className="w-4 h-4" />
            </button>
            <button className="institutional-btn">
              <Bell className="w-4 h-4" />
            </button>
            <button className="institutional-btn">
              <User className="w-4 h-4" />
              LP ADMIN
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Executive Command Center */}
        <div className="mb-8">
          <div className="institutional-panel p-8">
            <div className="text-center mb-8">
              <h2 className="institutional-title mb-4 text-4xl">VENTURE CAPITAL COMMAND CENTER</h2>
              <p className="institutional-mono max-w-4xl mx-auto text-lg text-gray-300 tracking-wide">
                INSTITUTIONAL-GRADE INVESTMENT INTELLIGENCE • AI-POWERED DEAL FLOW ANALYSIS • PORTFOLIO OPTIMIZATION ENGINE
              </p>
            </div>

            {/* Real-time Performance Metrics */}
            <div className="institutional-grid-4 mb-8">
              <div className="institutional-metric">
                <div className="institutional-metric-value institutional-pulse text-green-400">$2.8B</div>
                <div className="institutional-metric-label">Assets Under Management</div>
                <div className="mt-2 text-xs text-green-400 institutional-mono">+$340M QTD</div>
              </div>
              <div className="institutional-metric">
                <div className="institutional-metric-value text-cyan-400">34.7%</div>
                <div className="institutional-metric-label">Portfolio IRR</div>
                <div className="mt-2 text-xs text-cyan-400 institutional-mono">Top Decile Performance</div>
              </div>
              <div className="institutional-metric">
                <div className="institutional-metric-value text-blue-400">2.45x</div>
                <div className="institutional-metric-label">TVPI Multiple</div>
                <div className="mt-2 text-xs text-blue-400 institutional-mono">vs 1.8x Benchmark</div>
              </div>
              <div className="institutional-metric">
                <div className="institutional-metric-value text-orange-400">0.8</div>
                <div className="institutional-metric-label">Avg Analysis Time</div>
                <div class="mt-2 text-xs text-orange-400 institutional-mono">Minutes Per Deal</div>
              </div>
            </div>

            {/* System Architecture Intelligence */}
            <div className="institutional-panel p-6 mb-8 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3 institutional-mono">
                <Cpu className="w-6 h-6 text-cyan-400" />
                INFRASTRUCTURE STATUS
              </h3>
              <div className="institutional-grid-6">
                <div className="flex flex-col items-center gap-3 p-4 institutional-card">
                  <Database className="w-8 h-8 text-green-400" />
                  <div className="text-center">
                    <div className="text-sm font-medium text-white institutional-mono">ChromaDB</div>
                    <div className="institutional-status operational text-xs">3-LEVEL RAG</div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3 p-4 institutional-card">
                  <Search className="w-8 h-8 text-blue-400" />
                  <div className="text-center">
                    <div className="text-sm font-medium text-white institutional-mono">Google API</div>
                    <div className="institutional-status operational text-xs">WEB INTEL</div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3 p-4 institutional-card">
                  <Brain className="w-8 h-8 text-purple-400" />
                  <div className="text-center">
                    <div className="text-sm font-medium text-white institutional-mono">Gemini Pro</div>
                    <div className="institutional-status operational text-xs">AI ENGINE</div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3 p-4 institutional-card">
                  <Network className="w-8 h-8 text-indigo-400" />
                  <div className="text-center">
                    <div className="text-sm font-medium text-white institutional-mono">Twitter API</div>
                    <div className="institutional-status processing text-xs">SOCIAL INTEL</div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3 p-4 institutional-card">
                  <Shield className="w-8 h-8 text-orange-400" />
                  <div className="text-center">
                    <div className="text-sm font-medium text-white institutional-mono">Enterprise</div>
                    <div className="institutional-status operational text-xs">SECURED</div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3 p-4 institutional-card">
                  <Zap className="w-8 h-8 text-yellow-400" />
                  <div className="text-center">
                    <div className="text-sm font-medium text-white institutional-mono">Real-time</div>
                    <div className="institutional-status operational text-xs">LIVE DATA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Framework Modules */}
        <div className="mb-8">
          <h3 className="institutional-title text-xl mb-6 flex items-center gap-3">
            <Target className="w-7 h-7 text-cyan-400" />
            INVESTMENT INTELLIGENCE FRAMEWORKS
          </h3>

          <div className="institutional-grid-3">
            {/* Framework #1 - Founder Signal Fit */}
            <Link to="/founder-signal" className="institutional-card p-6 group hover:border-green-500">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-sm flex items-center justify-center border border-green-500">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="institutional-mono text-lg font-semibold text-white">FOUNDER SIGNAL FIT</h4>
                    <div className="institutional-status operational">PRODUCTION</div>
                  </div>
                  <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                    AI-powered founder assessment using institutional-grade due diligence 
                    with enhanced web and social research intelligence
                  </p>
                  <div className="institutional-table text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 institutional-mono">ANALYSIS TYPE</span>
                      <span className="text-white institutional-mono">TOP DECILE VC</span>
                    </div>
                    <div class="flex justify-between py-1">
                      <span className="text-gray-500 institutional-mono">AVG PROCESSING</span>
                      <span className="text-green-400 institutional-mono">0.8 MIN</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Framework #2 - Due Diligence Data Room */}
            <Link to="/due-diligence" className="institutional-card p-6 group hover:border-blue-500">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-sm flex items-center justify-center border border-blue-500">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="institutional-mono text-lg font-semibold text-white">DUE DILIGENCE DATA ROOM</h4>
                    <div className="institutional-status operational">PRODUCTION</div>
                  </div>
                  <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                    Multi-document RAG analysis with cross-document insights, 
                    comprehensive risk assessment and regulatory compliance scoring
                  </p>
                  <div className="institutional-table text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 institutional-mono">ANALYSIS TYPE</span>
                      <span className="text-white institutional-mono">CROSS-DOCUMENT</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 institutional-mono">AVG PROCESSING</span>
                      <span className="text-blue-400 institutional-mono">3.2 MIN</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Framework #3 - Portfolio Management */}
            <Link to="/portfolio" className="institutional-card p-6 group hover:border-purple-500">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-sm flex items-center justify-center border border-purple-500">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="institutional-mono text-lg font-semibold text-white">PORTFOLIO MANAGEMENT</h4>
                    <div className="institutional-status operational">PRODUCTION</div>
                  </div>
                  <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                    Real-time portfolio analytics with board meeting intelligence, 
                    KPI tracking and predictive performance modeling
                  </p>
                  <div className="institutional-table text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 institutional-mono">ANALYSIS TYPE</span>
                      <span className="text-white institutional-mono">RAG-ENHANCED</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 institutional-mono">AVG PROCESSING</span>
                      <span className="text-purple-400 institutional-mono">1.5 MIN</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Framework #4 - Fund Assessment */}
            <Link to="/fund-assessment" className="institutional-card p-6 group hover:border-orange-500">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-orange-700 rounded-sm flex items-center justify-center border border-orange-500">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="institutional-mono text-lg font-semibold text-white">FUND ASSESSMENT</h4>
                    <div className="institutional-status operational">PRODUCTION</div>
                  </div>
                  <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                    Comprehensive fund performance analysis with historical backtesting 
                    and benchmark comparison against industry standards
                  </p>
                  <div className="institutional-table text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 institutional-mono">ANALYSIS TYPE</span>
                      <span className="text-white institutional-mono">HISTORICAL</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 institutional-mono">AVG PROCESSING</span>
                      <span className="text-orange-400 institutional-mono">4.8 MIN</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Framework #5 - Fund Allocation */}
            <Link to="/fund-allocation" className="institutional-card p-6 group hover:border-teal-500">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-teal-700 rounded-sm flex items-center justify-center border border-teal-500">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="institutional-mono text-lg font-semibold text-white">FUND ALLOCATION</h4>
                    <div className="institutional-status operational">PRODUCTION</div>
                  </div>
                  <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                    Monte Carlo simulation engine for optimal fund allocation 
                    with risk-adjusted portfolio optimization and deployment strategy
                  </p>
                  <div className="institutional-table text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 institutional-mono">ANALYSIS TYPE</span>
                      <span className="text-white institutional-mono">MONTE CARLO</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 institutional-mono">AVG PROCESSING</span>
                      <span className="text-teal-400 institutional-mono">3.7 MIN</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Framework #6 - Fund Vintage */}
            <Link to="/fund-vintage" className="institutional-card p-6 group hover:border-pink-500">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-pink-700 rounded-sm flex items-center justify-center border border-pink-500">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="institutional-mono text-lg font-semibold text-white">VINTAGE MANAGEMENT</h4>
                    <div className="institutional-status operational">PRODUCTION</div>
                  </div>
                  <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                    Multi-vintage performance comparison with industry benchmark analysis 
                    and quartile ranking across institutional datasets
                  </p>
                  <div className="institutional-table text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 institutional-mono">ANALYSIS TYPE</span>
                      <span className="text-white institutional-mono">COMPARATIVE</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 institutional-mono">AVG PROCESSING</span>
                      <span className="text-pink-400 institutional-mono">2.1 MIN</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Executive Intelligence Panel */}
        <div className="institutional-panel p-6">
          <h3 className="institutional-title text-lg mb-6 flex items-center gap-3">
            <Activity className="w-6 h-6 text-cyan-400" />
            PORTFOLIO INTELLIGENCE DASHBOARD
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="institutional-card p-6 text-center">
              <div className="institutional-mono text-sm text-gray-400 mb-2">ACTIVE ANALYSES</div>
              <div class="institutional-data text-cyan-400">3</div>
              <div className="text-xs text-gray-500 institutional-mono mt-1">Real-time Processing</div>
            </div>
            <div className="institutional-card p-6 text-center">
              <div className="institutional-mono text-sm text-gray-400 mb-2">DEALS ANALYZED TODAY</div>
              <div className="institutional-data text-green-400">17</div>
              <div className="text-xs text-green-500 institutional-mono mt-1">+8 vs Yesterday</div>
            </div>
            <div className="institutional-card p-6 text-center">
              <div className="institutional-mono text-sm text-gray-400 mb-2">SYSTEM UPTIME</div>
              <div className="institutional-data text-blue-400">99.97%</div>
              <div className="text-xs text-blue-400 institutional-mono mt-1">Enterprise SLA</div>
            </div>
            <div className="institutional-card p-6 text-center">
              <div className="institutional-mono text-sm text-gray-400 mb-2">API CALLS/MIN</div>
              <div className="institutional-data text-orange-400">2,847</div>
              <div className="text-xs text-orange-400 institutional-mono mt-1">Real-time Intelligence</div>
            </div>
          </div>
          
          <div className="mt-8 p-4 institutional-card">
            <div className="institutional-mono text-sm text-gray-300 mb-2">EXECUTIVE SUMMARY</div>
            <div className="text-gray-400 text-sm leading-relaxed">
              Platform operating at optimal performance levels. All 6 investment intelligence frameworks operational 
              with enhanced Google Search and Twitter API integration. Current portfolio valued at $2.8B AUM 
              delivering top-decile returns of 34.7% IRR vs industry median of 18.5%. 
              <span className="text-cyan-400 font-semibold"> Ready for institutional deployment.</span>
            </div>
          </div>
        </div>

        {/* Command Palette Interface */}
        {isCommandPaletteOpen && (
          <>
            <div className="institutional-overlay" onClick={() => setIsCommandPaletteOpen(false)}></div>
            <div className="institutional-command-bar">
              <div className="p-4 border-b border-gray-700">
                <div className="institutional-mono text-sm text-gray-400 mb-2">VERSSAI COMMAND INTERFACE</div>
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  className="institutional-command-input"
                  autoFocus
                />
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <Link to="/founder-signal" onClick={() => setIsCommandPaletteOpen(false)} 
                        className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded institutional-mono text-sm">
                    <Users className="w-4 h-4 text-green-400" />
                    <span>Go to Founder Signal Fit</span>
                    <span className="ml-auto text-gray-500">F1</span>
                  </Link>
                  <Link to="/due-diligence" onClick={() => setIsCommandPaletteOpen(false)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded institutional-mono text-sm">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>Go to Due Diligence</span>
                    <span className="ml-auto text-gray-500">F2</span>
                  </Link>
                  <Link to="/portfolio" onClick={() => setIsCommandPaletteOpen(false)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded institutional-mono text-sm">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span>Go to Portfolio Management</span>
                    <span className="ml-auto text-gray-500">F3</span>
                  </Link>
                  <Link to="/fund-assessment" onClick={() => setIsCommandPaletteOpen(false)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded institutional-mono text-sm">
                    <BarChart3 className="w-4 h-4 text-orange-400" />
                    <span>Go to Fund Assessment</span>
                    <span className="ml-auto text-gray-500">F4</span>
                  </Link>
                  <Link to="/fund-allocation" onClick={() => setIsCommandPaletteOpen(false)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded institutional-mono text-sm">
                    <Target className="w-4 h-4 text-teal-400" />
                    <span>Go to Fund Allocation</span>
                    <span className="ml-auto text-gray-500">F5</span>
                  </Link>
                  <Link to="/fund-vintage" onClick={() => setIsCommandPaletteOpen(false)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded institutional-mono text-sm">
                    <Award className="w-4 h-4 text-pink-400" />
                    <span>Go to Vintage Management</span>
                    <span className="ml-auto text-gray-500">F6</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
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