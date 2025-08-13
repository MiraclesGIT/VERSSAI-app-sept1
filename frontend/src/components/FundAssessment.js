import React, { useState, useEffect } from 'react';
import '../components/ClickUpTheme.css';
import {
  BarChart3, TrendingUp, Target, Award, Calendar,
  DollarSign, Activity, AlertCircle, CheckCircle,
  ArrowLeft, Plus, Filter, Search, Download,
  Building, Briefcase, Clock, Zap, Brain
} from 'lucide-react';
import axios from 'axios';

const FundAssessment = () => {
  const [investmentDecisions, setInvestmentDecisions] = useState([]);
  const [investmentOutcomes, setInvestmentOutcomes] = useState([]);
  const [backtestResults, setBacktestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('conservative');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const addInvestmentDecision = async () => {
    setIsLoading(true);
    try {
      const decision = {
        company_name: 'TechCorp AI',
        decision_type: 'investment',
        investment_amount: 5000000,
        valuation: 25000000,
        stage: 'series-a',
        industry: 'AI',
        decision_date: new Date().toISOString().split('T')[0],
        rationale: 'Strong technical team with proven AI expertise',
        key_factors: ['Experienced team', 'Large market opportunity', 'Strong traction'],
        risk_factors: ['Competitive market', 'Regulatory uncertainty'],
        decision_maker: 'Investment Committee'
      };

      await axios.post(`${BACKEND_URL}/api/fund-assessment/add-investment-decision`, decision);
      fetchInvestmentDecisions();
      
    } catch (error) {
      console.error('Error adding investment decision:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addInvestmentOutcome = async () => {
    setIsLoading(true);
    try {
      const outcome = {
        company_name: 'TechCorp AI',
        outcome_type: 'success',
        exit_date: '2024-12-01',
        exit_valuation: 75000000,
        multiple: 3.0,
        irr: 0.45,
        outcome_notes: 'Successful acquisition by major tech company'
      };

      await axios.post(`${BACKEND_URL}/api/fund-assessment/add-investment-outcome`, outcome);
      fetchInvestmentOutcomes();
      
    } catch (error) {
      console.error('Error adding investment outcome:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runBacktest = async () => {
    setIsLoading(true);
    try {
      const backtestParams = {
        strategy_name: selectedStrategy === 'conservative' ? 'Conservative Growth' : 'Aggressive Growth',
        start_date: '2020-01-01',
        end_date: '2024-12-31',
        initial_fund_size: 100000000,
        strategy_parameters: {
          max_position_size: selectedStrategy === 'conservative' ? 0.05 : 0.10,
          sector_concentration_limit: selectedStrategy === 'conservative' ? 0.25 : 0.40,
          stage_focus: selectedStrategy === 'conservative' ? ['series-a', 'series-b'] : ['seed', 'series-a']
        }
      };

      const response = await axios.post(`${BACKEND_URL}/api/fund-assessment/run-backtest`, backtestParams);
      setBacktestResults(response.data);
      
    } catch (error) {
      console.error('Error running backtest:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvestmentDecisions = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/fund-assessment/investment-decisions`);
      setInvestmentDecisions(response.data.decisions || []);
    } catch (error) {
      console.error('Error fetching decisions:', error);
    }
  };

  const fetchInvestmentOutcomes = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/fund-assessment/investment-outcomes`);
      setInvestmentOutcomes(response.data.outcomes || []);
    } catch (error) {
      console.error('Error fetching outcomes:', error);
    }
  };

  useEffect(() => {
    fetchInvestmentDecisions();
    fetchInvestmentOutcomes();
  }, []);

  return (
    <div className="clickup-main">
      {/* Breadcrumb */}
      <div className="clickup-mb-lg">
        <a href="/" className="clickup-text-secondary hover:clickup-text-primary text-sm">
          Dashboard
        </a>
        <span className="clickup-text-tertiary mx-2">/</span>
        <span className="clickup-text-primary text-sm font-medium">Fund Assessment</span>
      </div>

      <div className="clickup-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="clickup-page-title">Fund Assessment & Backtesting</h1>
            <p className="clickup-page-subtitle">
              Historical backtesting and performance analysis with benchmarking
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={addInvestmentDecision}
              disabled={isLoading}
              className="clickup-btn clickup-btn-primary"
            >
              <Plus className="w-4 h-4" />
              Add Decision
            </button>
            <button 
              onClick={addInvestmentOutcome}
              disabled={isLoading}
              className="clickup-btn clickup-btn-secondary"
            >
              <Award className="w-4 h-4" />
              Add Outcome
            </button>
          </div>
        </div>
      </div>

      {/* Fund Performance Overview */}
      <div className="clickup-grid clickup-grid-4 clickup-mb-xl">
        <div className="clickup-card">
          <div className="clickup-card-body clickup-metric">
            <div className="clickup-metric-value clickup-text-success">
              {investmentDecisions.length}
            </div>
            <div className="clickup-metric-label">Investment Decisions</div>
          </div>
        </div>
        <div className="clickup-card">
          <div className="clickup-card-body clickup-metric">
            <div className="clickup-metric-value clickup-text-info">
              {investmentOutcomes.length}
            </div>
            <div className="clickup-metric-label">Realized Outcomes</div>
          </div>
        </div>
        <div className="clickup-card">
          <div className="clickup-card-body clickup-metric">
            <div className="clickup-metric-value clickup-text-brand">
              28.4%
            </div>
            <div className="clickup-metric-label">Average IRR</div>
          </div>
        </div>
        <div className="clickup-card">
          <div className="clickup-card-body clickup-metric">
            <div className="clickup-metric-value clickup-text-warning">
              Top 10%
            </div>
            <div className="clickup-metric-label">Industry Quartile</div>
          </div>
        </div>
      </div>

      {/* Backtesting Section */}
      <div className="clickup-card clickup-mb-xl">
        <div className="clickup-card-header">
          <h3 className="clickup-card-title">
            <Brain className="w-5 h-5" />
            Strategy Backtesting
          </h3>
        </div>
        <div className="clickup-card-body">
          <div className="flex items-center gap-4 clickup-mb-lg">
            <div>
              <label className="clickup-text-sm clickup-font-medium clickup-mb-sm block">
                Strategy Type
              </label>
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
              >
                <option value="conservative">Conservative Growth</option>
                <option value="aggressive">Aggressive Growth</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={runBacktest}
                disabled={isLoading}
                className="clickup-btn clickup-btn-primary"
              >
                <BarChart3 className="w-4 h-4" />
                Run Backtest
              </button>
            </div>
          </div>

          {backtestResults && (
            <div className="clickup-grid clickup-grid-3">
              <div className="clickup-card">
                <div className="clickup-card-body clickup-metric">
                  <div className="clickup-metric-value clickup-text-success">
                    {(backtestResults.performance_metrics?.total_return * 100 || 0).toFixed(1)}%
                  </div>
                  <div className="clickup-metric-label">Total Return</div>
                </div>
              </div>
              <div className="clickup-card">
                <div className="clickup-card-body clickup-metric">
                  <div className="clickup-metric-value clickup-text-info">
                    {(backtestResults.performance_metrics?.irr * 100 || 0).toFixed(1)}%
                  </div>
                  <div className="clickup-metric-label">IRR</div>
                </div>
              </div>
              <div className="clickup-card">
                <div className="clickup-card-body clickup-metric">
                  <div className="clickup-metric-value clickup-text-brand">
                    {backtestResults.performance_metrics?.sharpe_ratio?.toFixed(2) || 'N/A'}
                  </div>
                  <div className="clickup-metric-label">Sharpe Ratio</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Decisions */}
      <div className="clickup-card">
        <div className="clickup-card-header">
          <h3 className="clickup-card-title">
            <Activity className="w-5 h-5" />
            Recent Investment Decisions
          </h3>
        </div>
        <div className="clickup-card-body">
          {investmentDecisions.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 clickup-text-tertiary mx-auto mb-4" />
              <div className="clickup-text-secondary">No investment decisions recorded</div>
            </div>
          ) : (
            <div className="space-y-4">
              {investmentDecisions.slice(0, 5).map((decision, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 clickup-text-info" />
                    <div>
                      <div className="clickup-font-medium clickup-text-sm">{decision.company_name}</div>
                      <div className="clickup-text-xs clickup-text-secondary">
                        {decision.stage} • ${(decision.investment_amount / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                  <div className="clickup-text-xs clickup-text-secondary">
                    {decision.decision_date}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FundAssessment;