import React, { useState, useEffect } from 'react';
import '../components/ClickUpTheme.css';
import {
  Target, BarChart3, TrendingUp, Award, Calendar,
  DollarSign, Activity, AlertCircle, CheckCircle,
  ArrowLeft, Plus, Filter, Search, Download,
  Building, Briefcase, Clock, Zap, Brain
} from 'lucide-react';
import axios from 'axios';

const FundAllocation = () => {
  const [allocationTargets, setAllocationTargets] = useState([]);
  const [optimizationResults, setOptimizationResults] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('5-year');
  const [fundSize, setFundSize] = useState(100000000);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const allocationTypes = {
    'stage': { color: 'clickup-text-info', label: 'Stage' },
    'industry': { color: 'clickup-text-success', label: 'Industry' },
    'geography': { color: 'clickup-text-brand', label: 'Geography' },
    'theme': { color: 'clickup-text-warning', label: 'Theme' }
  };

  const createAllocationTargets = async () => {
    setIsOptimizing(true);
    try {
      const targets = {
        fund_id: 'growth-fund-i',
        allocation_type: 'stage',
        targets: [
          {
            category: 'Seed',
            target_percentage: 30,
            minimum_percentage: 20,
            maximum_percentage: 40
          },
          {
            category: 'Series A',
            target_percentage: 50,
            minimum_percentage: 40,
            maximum_percentage: 60
          },
          {
            category: 'Series B',
            target_percentage: 20,
            minimum_percentage: 10,
            maximum_percentage: 30
          }
        ]
      };

      await axios.post(`${BACKEND_URL}/api/fund-allocation/create-targets`, targets);
      fetchAllocationTargets();
      
    } catch (error) {
      console.error('Error creating allocation targets:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const runOptimization = async () => {
    setIsOptimizing(true);
    try {
      const optimizationParams = {
        fund_id: 'growth-fund-i',
        fund_size: fundSize,
        investment_period_years: parseInt(selectedTimeframe.split('-')[0]),
        risk_tolerance: 'moderate',
        return_target: 0.25,
        constraints: {
          max_position_size: 0.10,
          min_diversification: 20,
          sector_limits: {
            'AI': 0.30,
            'Healthcare': 0.25,
            'FinTech': 0.20
          }
        }
      };

      const response = await axios.post(`${BACKEND_URL}/api/fund-allocation/optimize`, optimizationParams);
      setOptimizationResults(response.data);
      
    } catch (error) {
      console.error('Error running optimization:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const fetchAllocationTargets = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/fund-allocation/targets`);
      setAllocationTargets(response.data.targets || []);
    } catch (error) {
      console.error('Error fetching allocation targets:', error);
    }
  };

  useEffect(() => {
    fetchAllocationTargets();
  }, []);

  return (
    <div className="clickup-main">
      {/* Breadcrumb */}
      <div className="clickup-mb-lg">
        <a href="/" className="clickup-text-secondary hover:clickup-text-primary text-sm">
          Dashboard
        </a>
        <span className="clickup-text-tertiary mx-2">/</span>
        <span className="clickup-text-primary text-sm font-medium">Fund Allocation</span>
      </div>

      <div className="clickup-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="clickup-page-title">Fund Allocation & Deployment</h1>
            <p className="clickup-page-subtitle">
              Monte Carlo optimization for strategic fund deployment
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={createAllocationTargets}
              disabled={isOptimizing}
              className="clickup-btn clickup-btn-primary"
            >
              <Target className="w-4 h-4" />
              Create Targets
            </button>
            <button 
              onClick={runOptimization}
              disabled={isOptimizing}
              className="clickup-btn clickup-btn-secondary"
            >
              <Brain className="w-4 h-4" />
              Optimize
            </button>
          </div>
        </div>
      </div>

      {/* Fund Configuration */}
      <div className="clickup-card clickup-mb-xl">
        <div className="clickup-card-header">
          <h3 className="clickup-card-title">
            <DollarSign className="w-5 h-5" />
            Fund Configuration
          </h3>
        </div>
        <div className="clickup-card-body">
          <div className="clickup-grid clickup-grid-3">
            <div>
              <label className="clickup-text-sm clickup-font-medium clickup-mb-sm block">
                Fund Size
              </label>
              <input
                type="number"
                value={fundSize}
                onChange={(e) => setFundSize(parseInt(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
                placeholder="100000000"
              />
            </div>
            <div>
              <label className="clickup-text-sm clickup-font-medium clickup-mb-sm block">
                Investment Period
              </label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
              >
                <option value="3-year">3 Years</option>
                <option value="5-year">5 Years</option>
                <option value="7-year">7 Years</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="clickup-metric">
                <div className="clickup-metric-value clickup-text-success">
                  ${(fundSize / 1000000).toFixed(0)}M
                </div>
                <div className="clickup-metric-label">Total Fund Size</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Targets */}
      <div className="clickup-card clickup-mb-xl">
        <div className="clickup-card-header">
          <h3 className="clickup-card-title">
            <Target className="w-5 h-5" />
            Allocation Targets
          </h3>
        </div>
        <div className="clickup-card-body">
          {allocationTargets.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 clickup-text-tertiary mx-auto mb-4" />
              <div className="clickup-text-secondary">No allocation targets set</div>
            </div>
          ) : (
            <div className="clickup-grid clickup-grid-3">
              {allocationTargets.map((target, idx) => (
                <div key={idx} className="clickup-card">
                  <div className="clickup-card-body">
                    <div className="flex items-center justify-between clickup-mb-md">
                      <div className="clickup-font-semibold">{target.category}</div>
                      <div className="clickup-text-lg clickup-font-bold clickup-text-brand">
                        {target.target_percentage}%
                      </div>
                    </div>
                    <div className="clickup-progress">
                      <div 
                        className="clickup-progress-bar"
                        style={{ width: `${target.target_percentage}%` }}
                      ></div>
                    </div>
                    <div className="clickup-text-sm clickup-text-secondary clickup-mt-sm">
                      Range: {target.minimum_percentage}% - {target.maximum_percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Optimization Results */}
      {optimizationResults && (
        <div className="clickup-card clickup-mb-xl">
          <div className="clickup-card-header">
            <h3 className="clickup-card-title">
              <BarChart3 className="w-5 h-5" />
              Monte Carlo Optimization Results
            </h3>
          </div>
          <div className="clickup-card-body">
            <div className="clickup-grid clickup-grid-4 clickup-mb-lg">
              <div className="clickup-metric">
                <div className="clickup-metric-value clickup-text-success">
                  {(optimizationResults.expected_return * 100 || 0).toFixed(1)}%
                </div>
                <div className="clickup-metric-label">Expected Return</div>
              </div>
              <div className="clickup-metric">
                <div className="clickup-metric-value clickup-text-info">
                  {(optimizationResults.risk_metrics?.volatility * 100 || 0).toFixed(1)}%
                </div>
                <div className="clickup-metric-label">Volatility</div>
              </div>
              <div className="clickup-metric">
                <div className="clickup-metric-value clickup-text-brand">
                  {optimizationResults.risk_metrics?.sharpe_ratio?.toFixed(2) || 'N/A'}
                </div>
                <div className="clickup-metric-label">Sharpe Ratio</div>
              </div>
              <div className="clickup-metric">
                <div className="clickup-metric-value clickup-text-warning">
                  {optimizationResults.confidence_score || 85}%
                </div>
                <div className="clickup-metric-label">Confidence</div>
              </div>
            </div>

            {optimizationResults.recommendations && (
              <div className="clickup-card">
                <div className="clickup-card-header">
                  <h4 className="clickup-card-title">AI Recommendations</h4>
                </div>
                <div className="clickup-card-body">
                  <ul className="space-y-2">
                    {optimizationResults.recommendations.slice(0, 3).map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 clickup-text-success mt-1 flex-shrink-0" />
                        <span className="clickup-text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FundAllocation;