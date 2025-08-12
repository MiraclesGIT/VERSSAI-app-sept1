import React, { useState, useEffect } from 'react';
import '../components/PalantirTheme.css';
import {
  ArrowLeft, Terminal, Activity, BarChart3, Target, TrendingUp,
  CheckCircle, XCircle, AlertCircle, Award, DollarSign, Users,
  Calendar, Search, Filter, Eye, Database, Brain, Zap,
  Network, Settings, Info, Download, Upload, Clock
} from 'lucide-react';
import axios from 'axios';

const FundAssessment = () => {
  const [assessmentData, setAssessmentData] = useState(null);
  const [selectedFund, setSelectedFund] = useState(null);
  const [backtestPeriod, setBacktestPeriod] = useState('2020-2024');
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [isRunningBacktest, setIsRunningBacktest] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Mock fund performance data
  useEffect(() => {
    const mockFunds = [
      {
        id: 'fund_001',
        name: 'VERSSAI Venture Fund I',
        vintage: 2020,
        size: 100000000,
        investmentsMade: 28,
        successfulExits: 6,
        totalReturns: 185000000,
        irr: 34.5,
        tvpi: 1.85,
        dpi: 0.68,
        rvpi: 1.17,
        successRate: 21.4,
        averageHoldPeriod: 3.2,
        topPerformer: { name: 'NeuralTech AI', return: '8.5x' },
        riskScore: 'Medium-Low'
      },
      {
        id: 'fund_002', 
        name: 'VERSSAI Growth Fund II',
        vintage: 2022,
        size: 250000000,
        investmentsMade: 15,
        successfulExits: 2,
        totalReturns: 95000000,
        irr: 28.7,
        tvpi: 0.38,
        dpi: 0.12,
        rvpi: 0.26,
        successRate: 13.3,
        averageHoldPeriod: 1.8,
        topPerformer: { name: 'QuantumSecure', return: '3.2x' },
        riskScore: 'Medium'
      }
    ];

    const mockBacktestResults = {
      overallPerformance: {
        totalFunds: 2,
        averageIRR: 31.6,
        averageTVPI: 1.12,
        totalDeployed: 350000000,
        totalValue: 280000000,
        successfulInvestments: 8,
        failedInvestments: 12,
        pendingInvestments: 23
      },
      benchmarkComparison: {
        market: 'Top Quartile',
        peerFunds: 'Outperforming 78%',
        indexComparison: '+12.4% vs S&P 500'
      },
      investmentPatterns: {
        bestSectors: ['AI/ML', 'Cybersecurity', 'FinTech'],
        worstSectors: ['E-commerce', 'Gaming'],
        optimalStage: 'Series A',
        bestGeographies: ['San Francisco Bay Area', 'Boston', 'Austin']
      },
      missedOpportunities: [
        {
          company: 'UnicornCorp',
          sector: 'AI/ML',
          passReason: 'Valuation concerns',
          currentValuation: '2.5B',
          missedReturn: '15.8x'
        },
        {
          company: 'ScaleTech',
          sector: 'SaaS',
          passReason: 'Market size doubts',
          currentValuation: '1.2B',
          missedReturn: '8.3x'
        }
      ]
    };

    setAssessmentData({
      funds: mockFunds,
      backtestResults: mockBacktestResults
    });
  }, []);

  const runBacktestAnalysis = async () => {
    setIsRunningBacktest(true);
    
    // Simulate analysis
    setTimeout(() => {
      setIsRunningBacktest(false);
    }, 5000);
  };

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

  const getPerformanceColor = (value, type) => {
    switch (type) {
      case 'irr':
        return value > 25 ? 'text-green-400' : value > 15 ? 'text-yellow-400' : 'text-red-400';
      case 'tvpi':
        return value > 1.5 ? 'text-green-400' : value > 1.0 ? 'text-yellow-400' : 'text-red-400';
      case 'successRate':
        return value > 20 ? 'text-green-400' : value > 10 ? 'text-yellow-400' : 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const FundCard = ({ fund }) => (
    <div 
      className="palantir-card p-6 cursor-pointer hover:scale-105 transition-all duration-300"
      onClick={() => setSelectedFund(fund)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{fund.name}</h3>
          <div className="text-sm text-gray-400 palantir-mono">Vintage {fund.vintage}</div>
        </div>
        <div className="palantir-status operational">
          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
          {fund.riskScore}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-400">Fund Size</div>
          <div className="text-lg font-bold text-cyan-400">{formatCurrency(fund.size)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">IRR</div>
          <div className={`text-lg font-bold ${getPerformanceColor(fund.irr, 'irr')}`}>
            {fund.irr.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">TVPI</div>
          <div className={`text-lg font-bold ${getPerformanceColor(fund.tvpi, 'tvpi')}`}>
            {fund.tvpi.toFixed(2)}x
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs mb-4">
        <div>
          <div className="text-gray-500">Investments</div>
          <div className="text-white palantir-mono">{fund.investmentsMade}</div>
        </div>
        <div>
          <div className="text-gray-500">Successful Exits</div>
          <div className="text-white palantir-mono">{fund.successfulExits}</div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-700 flex justify-between items-center">
        <div className="text-xs text-gray-400">
          Top: {fund.topPerformer.name} ({fund.topPerformer.return})
        </div>
        <div className="flex gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
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
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Fund Assessment & Backtesting</h1>
                <p className="text-xs text-gray-400 palantir-mono">Intelligence Framework #4</p>
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
              FUNDS: {assessmentData?.funds.length || 0}
            </div>
            <button className="palantir-btn">
              <Terminal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Performance Overview */}
        <div className="mb-8">
          <div className="palantir-panel p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Award className="w-6 h-6 text-orange-400" />
                Portfolio Performance Intelligence
              </h2>
              <div className="palantir-mono text-sm text-gray-400">
                COMPREHENSIVE ANALYSIS
              </div>
            </div>

            {assessmentData?.backtestResults && (
              <div className="palantir-grid-4 mb-6">
                <div className="palantir-metric">
                  <div className="palantir-metric-value">
                    {assessmentData.backtestResults.overallPerformance.averageIRR.toFixed(1)}%
                  </div>
                  <div className="palantir-metric-label">Average IRR</div>
                  <div className="mt-2 text-xs text-green-400">outperforming</div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">
                    {assessmentData.backtestResults.overallPerformance.averageTVPI.toFixed(2)}x
                  </div>
                  <div className="palantir-metric-label">Average TVPI</div>
                  <div className="mt-2 text-xs text-cyan-400">portfolio multiple</div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">
                    {formatCurrency(assessmentData.backtestResults.overallPerformance.totalValue)}
                  </div>
                  <div className="palantir-metric-label">Total Portfolio Value</div>
                  <div className="mt-2 text-xs text-blue-400">current valuation</div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">
                    {((assessmentData.backtestResults.overallPerformance.successfulInvestments / 
                      (assessmentData.backtestResults.overallPerformance.successfulInvestments + 
                       assessmentData.backtestResults.overallPerformance.failedInvestments)) * 100).toFixed(1)}%
                  </div>
                  <div className="palantir-metric-label">Success Rate</div>
                  <div className="mt-2 text-xs text-orange-400">investment wins</div>
                </div>
              </div>
            )}

            {/* Backtesting Controls */}
            <div className="palantir-card p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Backtesting Analysis</h3>
                  <div className="flex gap-4">
                    <select
                      value={backtestPeriod}
                      onChange={(e) => setBacktestPeriod(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-white text-sm"
                    >
                      <option value="2020-2024">2020-2024 (4 years)</option>
                      <option value="2018-2024">2018-2024 (6 years)</option>
                      <option value="2015-2024">2015-2024 (9 years)</option>
                    </select>
                    <select
                      value={analysisType}
                      onChange={(e) => setAnalysisType(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-white text-sm"
                    >
                      <option value="comprehensive">Comprehensive</option>
                      <option value="sector">Sector Analysis</option>
                      <option value="stage">Stage Analysis</option>
                      <option value="geography">Geography Analysis</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={runBacktestAnalysis}
                  disabled={isRunningBacktest}
                  className="palantir-btn-primary flex items-center gap-2"
                >
                  {isRunningBacktest ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ANALYZING
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      RUN BACKTEST
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Fund Performance Cards */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-cyan-400" />
            Fund Performance Analysis
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assessmentData?.funds.map(fund => (
              <FundCard key={fund.id} fund={fund} />
            ))}
          </div>
        </div>

        {/* Investment Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Benchmark Comparison */}
          <div className="palantir-panel p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Benchmark Comparison
            </h3>
            
            {assessmentData?.backtestResults.benchmarkComparison && (
              <div className="space-y-4">
                <div className="palantir-card p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Market Position</span>
                    <span className="palantir-status operational">
                      {assessmentData.backtestResults.benchmarkComparison.market}
                    </span>
                  </div>
                </div>
                <div className="palantir-card p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Peer Comparison</span>
                    <span className="text-cyan-400 palantir-mono">
                      {assessmentData.backtestResults.benchmarkComparison.peerFunds}
                    </span>
                  </div>
                </div>
                <div className="palantir-card p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Index Performance</span>
                    <span className="text-green-400 palantir-mono">
                      {assessmentData.backtestResults.benchmarkComparison.indexComparison}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Missed Opportunities */}
          <div className="palantir-panel p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Missed Opportunities
            </h3>
            
            <div className="space-y-3">
              {assessmentData?.backtestResults.missedOpportunities?.map((miss, idx) => (
                <div key={idx} className="palantir-card p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white">{miss.company}</h4>
                    <span className="text-red-400 palantir-mono">{miss.missedReturn}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1">{miss.sector}</div>
                  <div className="text-xs text-gray-500">
                    Pass Reason: {miss.passReason}
                  </div>
                  <div className="text-xs text-cyan-400 mt-1">
                    Current Val: {miss.currentValuation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fund Detail Modal */}
        {selectedFund && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="palantir-panel p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedFund.name}</h2>
                  <p className="text-gray-400">Vintage {selectedFund.vintage} • {formatCurrency(selectedFund.size)}</p>
                </div>
                <button 
                  onClick={() => setSelectedFund(null)}
                  className="palantir-btn"
                >
                  ✕
                </button>
              </div>

              {/* Detailed Metrics */}
              <div className="palantir-grid-4 mb-6">
                <div className="palantir-metric">
                  <div className="palantir-metric-value">{selectedFund.irr.toFixed(1)}%</div>
                  <div className="palantir-metric-label">Internal Rate of Return</div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">{selectedFund.tvpi.toFixed(2)}x</div>
                  <div className="palantir-metric-label">Total Value Multiple</div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">{selectedFund.dpi.toFixed(2)}x</div>
                  <div className="palantir-metric-label">Distributions Multiple</div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">{selectedFund.rvpi.toFixed(2)}x</div>
                  <div className="palantir-metric-label">Residual Value Multiple</div>
                </div>
              </div>

              <div className="palantir-card p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Fund Performance Summary</h3>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <div className="text-gray-400">Total Returns</div>
                    <div className="text-white text-xl">{formatCurrency(selectedFund.totalReturns)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Success Rate</div>
                    <div className="text-green-400 text-xl">{selectedFund.successRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Average Hold Period</div>
                    <div className="text-white">{selectedFund.averageHoldPeriod} years</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Risk Assessment</div>
                    <div className="text-cyan-400">{selectedFund.riskScore}</div>
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

export default FundAssessment;