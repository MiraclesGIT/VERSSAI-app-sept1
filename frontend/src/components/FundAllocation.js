import React, { useState, useEffect } from 'react';
import '../components/PalantirTheme.css';
import {
  ArrowLeft, Terminal, Activity, Target, DollarSign, TrendingUp,
  PieChart, Calculator, Zap, Shield, Award, AlertTriangle,
  Settings, Database, Brain, Network, BarChart3, Clock,
  Users, Briefcase, Eye, Download, Upload, RefreshCw
} from 'lucide-react';
import axios from 'axios';

const FundAllocation = () => {
  const [allocationData, setAllocationData] = useState(null);
  const [simulationResults, setSimulationResults] = useState(null);
  const [isRunningSimulation, setIsRunningSimulation] = useState(false);
  const [simulationParams, setSimulationParams] = useState({
    totalFundSize: 100000000,
    investmentHorizon: 10,
    targetSectors: ['AI/ML', 'Cybersecurity', 'FinTech', 'HealthTech'],
    riskTolerance: 'moderate',
    diversificationLevel: 'high'
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Mock allocation data
  useEffect(() => {
    const mockAllocationData = {
      currentFund: {
        totalSize: 100000000,
        deployed: 65000000,
        reserved: 20000000,
        available: 15000000,
        investmentsMade: 25,
        reserveRatio: 0.35
      },
      sectorAllocation: [
        { sector: 'AI/ML', allocated: 28000000, percentage: 28, companies: 8, avgInvestment: 3500000 },
        { sector: 'Cybersecurity', allocated: 18000000, percentage: 18, companies: 5, avgInvestment: 3600000 },
        { sector: 'FinTech', allocated: 12000000, percentage: 12, companies: 4, avgInvestment: 3000000 },
        { sector: 'HealthTech', allocated: 7000000, percentage: 7, companies: 3, avgInvestment: 2333000 },
        { sector: 'SaaS', allocated: 15000000, percentage: 15, companies: 5, avgInvestment: 3000000 },
        { sector: 'Other', allocated: 5000000, percentage: 5, companies: 2, avgInvestment: 2500000 }
      ],
      stageAllocation: [
        { stage: 'Seed', allocated: 15000000, percentage: 15, companies: 10, avgCheck: 1500000 },
        { stage: 'Series A', allocated: 35000000, percentage: 35, companies: 10, avgCheck: 3500000 },
        { stage: 'Series B', allocated: 25000000, percentage: 25, companies: 4, avgCheck: 6250000 },
        { stage: 'Series C+', allocated: 10000000, percentage: 10, companies: 1, avgCheck: 10000000 }
      ],
      riskMetrics: {
        overallRisk: 'Moderate',
        concentrationRisk: 'Low',
        sectorDiversification: 0.82,
        stageDiversification: 0.75,
        geographicDiversification: 0.68,
        vintageRisk: 'Low'
      },
      reserveStrategy: {
        followOnReserve: 15000000,
        newInvestmentReserve: 5000000,
        emergencyReserve: 5000000,
        opportunisticReserve: 10000000
      }
    };

    setAllocationData(mockAllocationData);
  }, []);

  const runMonteCarloSimulation = async () => {
    setIsRunningSimulation(true);
    
    // Simulate Monte Carlo analysis
    setTimeout(() => {
      const mockSimulationResults = {
        expectedReturns: {
          p10: 0.85, // 10th percentile (worst case)
          p25: 1.25,
          p50: 2.15, // median
          p75: 3.45,
          p90: 5.80  // 90th percentile (best case)
        },
        riskAnalysis: {
          valueAtRisk: 0.15, // 15% chance of losing money
          expectedShortfall: 0.25, // if we lose, expected loss is 25%
          sharpeRatio: 1.65,
          maxDrawdown: 0.32,
          volatility: 0.28
        },
        optimalAllocation: {
          'AI/ML': 25,
          'Cybersecurity': 20,
          'FinTech': 18,
          'HealthTech': 12,
          'SaaS': 15,
          'Other': 10
        },
        sensitivityAnalysis: [
          { factor: 'Market Conditions', impact: 'High', riskMultiplier: 1.4 },
          { factor: 'Sector Rotation', impact: 'Medium', riskMultiplier: 1.2 },
          { factor: 'Interest Rates', impact: 'Medium', riskMultiplier: 1.15 },
          { factor: 'Competition', impact: 'Low', riskMultiplier: 1.05 }
        ],
        scenarios: [
          { name: 'Base Case', probability: 0.5, tvpi: 2.15, irr: 0.285 },
          { name: 'Bull Case', probability: 0.25, tvpi: 3.45, irr: 0.425 },
          { name: 'Bear Case', probability: 0.25, tvpi: 1.25, irr: 0.165 }
        ]
      };
      
      setSimulationResults(mockSimulationResults);
      setIsRunningSimulation(false);
    }, 4000);
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

  const formatPercentage = (value) => `${(value * 100).toFixed(1)}%`;

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-400';
      case 'moderate': case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const AllocationCard = ({ title, data, type }) => (
    <div className="palantir-panel p-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-cyan-400" />
        {title}
      </h3>
      <div className="space-y-3">
        {data.map((item, idx) => {
          const key = type === 'sector' ? item.sector : item.stage;
          return (
            <div key={idx} className="palantir-card p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-white">{key}</span>
                <span className="text-cyan-400 palantir-mono">{item.percentage}%</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>{formatCurrency(item.allocated)}</span>
                <span>{item.companies} companies</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
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
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Fund Allocation & Deployment</h1>
                <p className="text-xs text-gray-400 palantir-mono">Intelligence Framework #5</p>
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
              DEPLOYED: {allocationData ? formatCurrency(allocationData.currentFund.deployed) : 'Loading...'}
            </div>
            <button className="palantir-btn">
              <Terminal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Fund Overview */}
        <div className="mb-8">
          <div className="palantir-panel p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calculator className="w-6 h-6 text-green-400" />
                Fund Deployment Intelligence
              </h2>
              <div className="palantir-mono text-sm text-gray-400">
                MONTE CARLO OPTIMIZATION
              </div>
            </div>

            {allocationData && (
              <div className="palantir-grid-4 mb-6">
                <div className="palantir-metric">
                  <div className="palantir-metric-value">
                    {formatCurrency(allocationData.currentFund.totalSize)}
                  </div>
                  <div className="palantir-metric-label">Total Fund Size</div>
                  <div className="mt-2 text-xs text-cyan-400">committed capital</div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">
                    {formatCurrency(allocationData.currentFund.deployed)}
                  </div>
                  <div className="palantir-metric-label">Capital Deployed</div>
                  <div className="mt-2 text-xs text-green-400">
                    {((allocationData.currentFund.deployed / allocationData.currentFund.totalSize) * 100).toFixed(1)}% deployed
                  </div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">
                    {formatCurrency(allocationData.currentFund.reserved)}
                  </div>
                  <div className="palantir-metric-label">Reserved Capital</div>
                  <div className="mt-2 text-xs text-orange-400">follow-on ready</div>
                </div>
                <div className="palantir-metric">
                  <div className="palantir-metric-value">
                    {formatCurrency(allocationData.currentFund.available)}
                  </div>
                  <div className="palantir-metric-label">Available Capital</div>
                  <div className="mt-2 text-xs text-blue-400">new investments</div>
                </div>
              </div>
            )}

            {/* Monte Carlo Simulation Controls */}
            <div className="palantir-card p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Monte Carlo Simulation</h3>
                <button
                  onClick={runMonteCarloSimulation}
                  disabled={isRunningSimulation}
                  className="palantir-btn-primary flex items-center gap-2"
                >
                  {isRunningSimulation ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      SIMULATING
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      RUN SIMULATION
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <label className="text-gray-400">Fund Size</label>
                  <input
                    type="number"
                    value={simulationParams.totalFundSize}
                    onChange={(e) => setSimulationParams(prev => ({...prev, totalFundSize: parseInt(e.target.value)}))}
                    className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400">Investment Horizon</label>
                  <select
                    value={simulationParams.investmentHorizon}
                    onChange={(e) => setSimulationParams(prev => ({...prev, investmentHorizon: parseInt(e.target.value)}))}
                    className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                  >
                    <option value={5}>5 years</option>
                    <option value={7}>7 years</option>
                    <option value={10}>10 years</option>
                    <option value={12}>12 years</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400">Risk Tolerance</label>
                  <select
                    value={simulationParams.riskTolerance}
                    onChange={(e) => setSimulationParams(prev => ({...prev, riskTolerance: e.target.value}))}
                    className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                  >
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400">Diversification</label>
                  <select
                    value={simulationParams.diversificationLevel}
                    onChange={(e) => setSimulationParams(prev => ({...prev, diversificationLevel: e.target.value}))}
                    className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400">Iterations</label>
                  <select className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white">
                    <option value="10000">10,000</option>
                    <option value="50000">50,000</option>
                    <option value="100000">100,000</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Allocation Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {allocationData && (
            <>
              <AllocationCard 
                title="Sector Allocation" 
                data={allocationData.sectorAllocation} 
                type="sector" 
              />
              <AllocationCard 
                title="Stage Allocation" 
                data={allocationData.stageAllocation} 
                type="stage" 
              />
            </>
          )}
        </div>

        {/* Simulation Results */}
        {simulationResults && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-green-400" />
              Monte Carlo Simulation Results
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Expected Returns */}
              <div className="palantir-panel p-6">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Expected Returns Distribution
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">P90 (Best Case)</span>
                    <span className="text-green-400 palantir-mono">{simulationResults.expectedReturns.p90.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">P75</span>
                    <span className="text-cyan-400 palantir-mono">{simulationResults.expectedReturns.p75.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Median</span>
                    <span className="text-white palantir-mono font-bold">{simulationResults.expectedReturns.p50.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">P25</span>
                    <span className="text-yellow-400 palantir-mono">{simulationResults.expectedReturns.p25.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">P10 (Worst Case)</span>
                    <span className="text-red-400 palantir-mono">{simulationResults.expectedReturns.p10.toFixed(2)}x</span>
                  </div>
                </div>
              </div>

              {/* Risk Analysis */}
              <div className="palantir-panel p-6">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-400" />
                  Risk Analysis
                </h4>
                <div className="space-y-3">
                  <div className="palantir-card p-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Value at Risk</span>
                      <span className="text-red-400 palantir-mono">
                        {formatPercentage(simulationResults.riskAnalysis.valueAtRisk)}
                      </span>
                    </div>
                  </div>
                  <div className="palantir-card p-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sharpe Ratio</span>
                      <span className="text-green-400 palantir-mono">
                        {simulationResults.riskAnalysis.sharpeRatio.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="palantir-card p-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Drawdown</span>
                      <span className="text-red-400 palantir-mono">
                        {formatPercentage(simulationResults.riskAnalysis.maxDrawdown)}
                      </span>
                    </div>
                  </div>
                  <div className="palantir-card p-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Volatility</span>
                      <span className="text-yellow-400 palantir-mono">
                        {formatPercentage(simulationResults.riskAnalysis.volatility)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scenarios */}
              <div className="palantir-panel p-6">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-400" />
                  Scenario Analysis
                </h4>
                <div className="space-y-3">
                  {simulationResults.scenarios.map((scenario, idx) => (
                    <div key={idx} className="palantir-card p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-white">{scenario.name}</span>
                        <span className="text-xs text-gray-400 palantir-mono">
                          {formatPercentage(scenario.probability)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-cyan-400">TVPI: {scenario.tvpi.toFixed(2)}x</span>
                        <span className="text-green-400">IRR: {formatPercentage(scenario.irr)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Metrics */}
        {allocationData && (
          <div className="palantir-panel p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-400" />
              Risk & Diversification Metrics
            </h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="palantir-card p-4 text-center">
                <div className="text-sm text-gray-400">Overall Risk</div>
                <div className={`text-lg font-bold ${getRiskColor(allocationData.riskMetrics.overallRisk)}`}>
                  {allocationData.riskMetrics.overallRisk}
                </div>
              </div>
              <div className="palantir-card p-4 text-center">
                <div className="text-sm text-gray-400">Concentration Risk</div>
                <div className={`text-lg font-bold ${getRiskColor(allocationData.riskMetrics.concentrationRisk)}`}>
                  {allocationData.riskMetrics.concentrationRisk}
                </div>
              </div>
              <div className="palantir-card p-4 text-center">
                <div className="text-sm text-gray-400">Sector Diversification</div>
                <div className="text-lg font-bold text-cyan-400">
                  {(allocationData.riskMetrics.sectorDiversification * 100).toFixed(0)}%
                </div>
              </div>
              <div className="palantir-card p-4 text-center">
                <div className="text-sm text-gray-400">Stage Diversification</div>
                <div className="text-lg font-bold text-cyan-400">
                  {(allocationData.riskMetrics.stageDiversification * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundAllocation;