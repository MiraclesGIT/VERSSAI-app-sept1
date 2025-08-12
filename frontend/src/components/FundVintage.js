import React, { useState, useEffect } from 'react';
import '../components/PalantirTheme.css';
import {
  ArrowLeft, Terminal, Activity, Award, TrendingUp, BarChart3,
  Calendar, DollarSign, Target, Users, Eye, Filter, Search,
  Briefcase, Clock, Zap, Shield, Network, Database, Brain,
  Download, Upload, RefreshCw, Settings, Info, CheckCircle
} from 'lucide-react';
import axios from 'axios';

const FundVintage = () => {
  const [vintageData, setVintageData] = useState(null);
  const [selectedVintage, setSelectedVintage] = useState(null);
  const [comparisonMode, setComparisonMode] = useState('performance');
  const [benchmarkData, setBenchmarkData] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Mock vintage data
  useEffect(() => {
    const mockVintageData = {
      funds: [
        {
          id: 'vintage_2018',
          name: 'VERSSAI Fund I',
          vintage: 2018,
          fundSize: 50000000,
          committed: 50000000,
          deployed: 45000000,
          returned: 68000000,
          irr: 42.3,
          tvpi: 1.51,
          dpi: 1.36,
          rvpi: 0.15,
          investmentCount: 18,
          activeInvestments: 3,
          exitCount: 15,
          status: 'Mature',
          topSectors: ['AI/ML', 'SaaS', 'FinTech'],
          averageHoldPeriod: 4.2,
          successRate: 33.3,
          riskRating: 'Medium-Low'
        },
        {
          id: 'vintage_2020',
          name: 'VERSSAI Fund II',
          vintage: 2020,
          fundSize: 100000000,
          committed: 100000000,
          deployed: 85000000,
          returned: 125000000,
          irr: 38.7,
          tvpi: 1.47,
          dpi: 1.25,
          rvpi: 0.22,
          investmentCount: 25,
          activeInvestments: 8,
          exitCount: 17,
          status: 'Active',
          topSectors: ['AI/ML', 'Cybersecurity', 'HealthTech'],
          averageHoldPeriod: 3.8,
          successRate: 28.0,
          riskRating: 'Medium'
        },
        {
          id: 'vintage_2022',
          name: 'VERSSAI Growth Fund',
          vintage: 2022,
          fundSize: 250000000,
          committed: 250000000,
          deployed: 180000000,
          returned: 95000000,
          irr: 15.2,
          tvpi: 0.53,
          dpi: 0.38,
          rvpi: 0.15,
          investmentCount: 32,
          activeInvestments: 28,
          exitCount: 4,
          status: 'Active',
          topSectors: ['AI/ML', 'Climate Tech', 'Web3'],
          averageHoldPeriod: 2.1,
          successRate: 12.5,
          riskRating: 'Medium-High'
        },
        {
          id: 'vintage_2024',
          name: 'VERSSAI Opportunity Fund',
          vintage: 2024,
          fundSize: 150000000,
          committed: 150000000,
          deployed: 45000000,
          returned: 8000000,
          irr: -5.3,
          tvpi: 0.18,
          dpi: 0.05,
          rvpi: 0.13,
          investmentCount: 12,
          activeInvestments: 12,
          exitCount: 0,
          status: 'Early Stage',
          topSectors: ['AI/ML', 'Robotics', 'Quantum'],
          averageHoldPeriod: 0.8,
          successRate: 0.0,
          riskRating: 'High'
        }
      ],
      portfolioSummary: {
        totalFunds: 4,
        totalCommitted: 550000000,
        totalDeployed: 355000000,
        totalReturned: 296000000,
        averageIRR: 22.7,
        averageTVPI: 0.92,
        totalInvestments: 87,
        totalExits: 36,
        overallSuccessRate: 18.4
      },
      benchmarkComparison: {
        industryIRR: 18.5,
        industryTVPI: 1.15,
        peerRanking: 'Top Quartile',
        outperformanceYears: 3,
        underperformanceYears: 1
      }
    };

    const mockBenchmarkData = {
      cambridge: { irr: 16.2, tvpi: 1.08, dpi: 0.72 },
      preqin: { irr: 17.8, tvpi: 1.12, dpi: 0.68 },
      pitchbook: { irr: 18.5, tvpi: 1.15, dpi: 0.75 },
      topQuartile: { irr: 25.0, tvpi: 1.45, dpi: 0.95 },
      median: { irr: 15.5, tvpi: 0.98, dpi: 0.62 }
    };

    setVintageData(mockVintageData);
    setBenchmarkData(mockBenchmarkData);
  }, []);

  const formatCurrency = (amount) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const getPerformanceColor = (value, benchmark, type) => {
    const diff = type === 'irr' ? value - benchmark : value / benchmark;
    if (type === 'irr') {
      return diff > 5 ? 'text-green-400' : diff > 0 ? 'text-yellow-400' : 'text-red-400';
    } else {
      return diff > 1.1 ? 'text-green-400' : diff > 0.9 ? 'text-yellow-400' : 'text-red-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Mature': return 'operational';
      case 'Active': return 'processing';
      case 'Early Stage': return 'warning';
      default: return 'error';
    }
  };

  const VintageCard = ({ fund }) => (
    <div 
      className="palantir-card p-6 cursor-pointer hover:scale-105 transition-all duration-300"
      onClick={() => setSelectedVintage(fund)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{fund.name}</h3>
          <div className="text-sm text-gray-400 palantir-mono">Vintage {fund.vintage}</div>
        </div>
        <div className={`palantir-status ${getStatusColor(fund.status)}`}>
          <div className="w-2 h-2 bg-current rounded-full"></div>
          {fund.status.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-400">Fund Size</div>
          <div className="text-lg font-bold text-cyan-400">{formatCurrency(fund.fundSize)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">IRR</div>
          <div className={`text-lg font-bold ${getPerformanceColor(fund.irr, benchmarkData?.median.irr || 15.5, 'irr')}`}>
            {fund.irr.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">TVPI</div>
          <div className={`text-lg font-bold ${getPerformanceColor(fund.tvpi, benchmarkData?.median.tvpi || 0.98, 'tvpi')}`}>
            {fund.tvpi.toFixed(2)}x
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs mb-4">
        <div>
          <div className="text-gray-500">Investments</div>
          <div className="text-white palantir-mono">{fund.investmentCount}</div>
        </div>
        <div>
          <div className="text-gray-500">Success Rate</div>
          <div className="text-white palantir-mono">{fund.successRate.toFixed(1)}%</div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-700 flex justify-between items-center">
        <div className="text-xs text-gray-400">
          Deployed: {((fund.deployed / fund.fundSize) * 100).toFixed(0)}%
        </div>
        <div className="flex gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          <BarChart3 className="w-4 h-4 text-green-400" />
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
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Funds/Vintage Management</h1>
                <p className="text-xs text-gray-400 palantir-mono">Intelligence Framework #6</p>
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
              FUNDS: {vintageData?.funds.length || 0}
            </div>
            <button className="palantir-btn">
              <Terminal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Portfolio Summary */}
        <div className="mb-8">
          <div className="palantir-panel p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-purple-400" />
                Vintage Portfolio Intelligence
              </h2>
              <div className="palantir-mono text-sm text-gray-400">
                MULTI-VINTAGE ANALYSIS
              </div>
            </div>

            {vintageData?.portfolioSummary && (
              <div className="palantir-grid-4 mb-6">
                <div className="palantir-metric">
                  <div className="palantir-metric-value">
                    {formatCurrency(vintageData.portfolioSummary.totalCommitted)}
                  </div>
                  <div className="palantir-metric-label">Total Committed</div>
                  <div className="mt-2 text-xs text-cyan-400">across all funds</div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">
                    {vintageData.portfolioSummary.averageIRR.toFixed(1)}%
                  </div>
                  <div className="palantir-metric-label">Portfolio IRR</div>
                  <div className="mt-2 text-xs text-green-400">weighted average</div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">
                    {vintageData.portfolioSummary.averageTVPI.toFixed(2)}x
                  </div>
                  <div className="palantir-metric-label">Portfolio TVPI</div>
                  <div className="mt-2 text-xs text-blue-400">total value multiple</div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">
                    {vintageData.portfolioSummary.overallSuccessRate.toFixed(1)}%
                  </div>
                  <div className="palantir-metric-label">Success Rate</div>
                  <div className="mt-2 text-xs text-orange-400">portfolio wide</div>
                </div>
              </div>
            )}

            {/* Comparison Mode Toggle */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setComparisonMode('performance')}
                className={`palantir-btn ${comparisonMode === 'performance' ? 'palantir-btn-primary' : ''}`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Performance
              </button>
              <button
                onClick={() => setComparisonMode('risk')}
                className={`palantir-btn ${comparisonMode === 'risk' ? 'palantir-btn-primary' : ''}`}
              >
                <Shield className="w-4 h-4 mr-2" />
                Risk Analysis
              </button>
              <button
                onClick={() => setComparisonMode('portfolio')}
                className={`palantir-btn ${comparisonMode === 'portfolio' ? 'palantir-btn-primary' : ''}`}
              >
                <Target className="w-4 h-4 mr-2" />
                Portfolio Composition
              </button>
            </div>
          </div>
        </div>

        {/* Benchmark Comparison */}
        {benchmarkData && (
          <div className="mb-8">
            <div className="palantir-panel p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Industry Benchmark Comparison
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="palantir-card p-4 text-center">
                  <div className="text-sm text-gray-400 mb-2">VERSSAI Portfolio</div>
                  <div className="text-cyan-400 font-bold">{vintageData.portfolioSummary.averageIRR.toFixed(1)}% IRR</div>
                  <div className="text-cyan-400 font-bold">{vintageData.portfolioSummary.averageTVPI.toFixed(2)}x TVPI</div>
                  <div className="palantir-status operational mt-2">ACTUAL</div>
                </div>
                
                <div className="palantir-card p-4 text-center">
                  <div className="text-sm text-gray-400 mb-2">Industry Median</div>
                  <div className="text-white font-bold">{benchmarkData.median.irr.toFixed(1)}% IRR</div>
                  <div className="text-white font-bold">{benchmarkData.median.tvpi.toFixed(2)}x TVPI</div>
                  <div className="text-xs text-gray-500 mt-2">benchmark</div>
                </div>
                
                <div className="palantir-card p-4 text-center">
                  <div className="text-sm text-gray-400 mb-2">Top Quartile</div>
                  <div className="text-green-400 font-bold">{benchmarkData.topQuartile.irr.toFixed(1)}% IRR</div>
                  <div className="text-green-400 font-bold">{benchmarkData.topQuartile.tvpi.toFixed(2)}x TVPI</div>
                  <div className="text-xs text-green-500 mt-2">target</div>
                </div>

                <div className="palantir-card p-4 text-center">
                  <div className="text-sm text-gray-400 mb-2">Cambridge Associates</div>
                  <div className="text-gray-300 font-bold">{benchmarkData.cambridge.irr.toFixed(1)}% IRR</div>
                  <div className="text-gray-300 font-bold">{benchmarkData.cambridge.tvpi.toFixed(2)}x TVPI</div>
                  <div className="text-xs text-gray-500 mt-2">reference</div>
                </div>

                <div className="palantir-card p-4 text-center">
                  <div className="text-sm text-gray-400 mb-2">PitchBook</div>
                  <div className="text-gray-300 font-bold">{benchmarkData.pitchbook.irr.toFixed(1)}% IRR</div>
                  <div className="text-gray-300 font-bold">{benchmarkData.pitchbook.tvpi.toFixed(2)}x TVPI</div>
                  <div className="text-xs text-gray-500 mt-2">market data</div>
                </div>
              </div>

              <div className="mt-4 p-4 palantir-card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-400">Performance vs Median</div>
                    <div className={`text-lg font-bold ${vintageData.portfolioSummary.averageIRR > benchmarkData.median.irr ? 'text-green-400' : 'text-red-400'}`}>
                      {vintageData.portfolioSummary.averageIRR > benchmarkData.median.irr ? '+' : ''}{(vintageData.portfolioSummary.averageIRR - benchmarkData.median.irr).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Quartile Ranking</div>
                    <div className="text-lg font-bold text-cyan-400">Top Quartile</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Peer Outperformance</div>
                    <div className="text-lg font-bold text-green-400">78%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vintage Fund Cards */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-400" />
            Vintage Fund Performance
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {vintageData?.funds.map(fund => (
              <VintageCard key={fund.id} fund={fund} />
            ))}
          </div>
        </div>

        {/* Vintage Detail Modal */}
        {selectedVintage && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="palantir-panel p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedVintage.name}</h2>
                  <p className="text-gray-400">Vintage {selectedVintage.vintage} • {formatCurrency(selectedVintage.fundSize)} Fund</p>
                </div>
                <button 
                  onClick={() => setSelectedVintage(null)}
                  className="palantir-btn"
                >
                  ✕
                </button>
              </div>

              {/* Detailed Performance Metrics */}
              <div className="palantir-grid-4 mb-6">
                <div className="palantir-metric">
                  <div className="palantir-metric-value">{selectedVintage.irr.toFixed(1)}%</div>
                  <div className="palantir-metric-label">Internal Rate of Return</div>
                  <div className="mt-2 text-xs text-green-400">
                    {selectedVintage.irr > (benchmarkData?.median.irr || 15.5) ? 'Above' : 'Below'} Median
                  </div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">{selectedVintage.tvpi.toFixed(2)}x</div>
                  <div className="palantir-metric-label">Total Value Multiple</div>
                  <div className="mt-2 text-xs text-cyan-400">portfolio multiple</div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">{selectedVintage.dpi.toFixed(2)}x</div>
                  <div className="palantir-metric-label">Distributions Multiple</div>
                  <div className="mt-2 text-xs text-blue-400">cash returned</div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">{selectedVintage.rvpi.toFixed(2)}x</div>
                  <div className="palantir-metric-label">Residual Value Multiple</div>
                  <div className="mt-2 text-xs text-orange-400">unrealized value</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fund Summary */}
                <div className="palantir-card p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Fund Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Investments</span>
                      <span className="text-white palantir-mono">{selectedVintage.investmentCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Successful Exits</span>
                      <span className="text-green-400 palantir-mono">{selectedVintage.exitCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Investments</span>
                      <span className="text-cyan-400 palantir-mono">{selectedVintage.activeInvestments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Success Rate</span>
                      <span className="text-yellow-400 palantir-mono">{selectedVintage.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Hold Period</span>
                      <span className="text-white palantir-mono">{selectedVintage.averageHoldPeriod} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Rating</span>
                      <span className="text-orange-400">{selectedVintage.riskRating}</span>
                    </div>
                  </div>
                </div>

                {/* Deployment Status */}
                <div className="palantir-card p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Capital Deployment</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Deployed</span>
                        <span className="text-green-400">{formatCurrency(selectedVintage.deployed)}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-400 h-2 rounded-full"
                          style={{ width: `${(selectedVintage.deployed / selectedVintage.fundSize) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Returned</span>
                        <span className="text-cyan-400">{formatCurrency(selectedVintage.returned)}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-cyan-400 h-2 rounded-full"
                          style={{ width: `${(selectedVintage.returned / selectedVintage.deployed) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-700">
                      <div className="text-sm text-gray-400 mb-2">Top Sectors</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedVintage.topSectors.map(sector => (
                          <span key={sector} className="px-2 py-1 bg-gray-700 rounded text-xs text-cyan-400">
                            {sector}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundVintage;