import React, { useState, useEffect } from 'react';
import '../components/ClickUpTheme.css';
import {
  Award, BarChart3, TrendingUp, Calendar, DollarSign,
  Activity, AlertCircle, CheckCircle, ArrowLeft, Plus,
  Filter, Search, Download, Building, Briefcase,
  Clock, Zap, Brain, Target, Users
} from 'lucide-react';
import axios from 'axios';

const FundVintage = () => {
  // Demo data for impressive display
  const [funds, setFunds] = useState([
    {
      fund_id: '1',
      fund_name: 'VERSSAI Growth Fund I',
      vintage_year: 2022,
      fund_size: 100000000,
      fund_type: 'Growth',
      current_nav: 125000000,
      total_investments: 18,
      realized_returns: 32000000,
      unrealized_value: 93000000,
      irr: 0.287,
      tvpi: 2.45,
      dpi: 1.32,
      status: 'active',
      deployment_status: 85
    },
    {
      fund_id: '2', 
      fund_name: 'VERSSAI Seed Fund II',
      vintage_year: 2023,
      fund_size: 75000000,
      fund_type: 'Seed',
      current_nav: 78000000,
      total_investments: 32,
      realized_returns: 8500000,
      unrealized_value: 69500000,
      irr: 0.192,
      tvpi: 1.84,
      dpi: 0.41,
      status: 'active',
      deployment_status: 67
    },
    {
      fund_id: '3',
      fund_name: 'VERSSAI Growth Fund II', 
      vintage_year: 2024,
      fund_size: 150000000,
      fund_type: 'Growth',
      current_nav: 145000000,
      total_investments: 12,
      realized_returns: 0,
      unrealized_value: 145000000,
      irr: 0.034,
      tvpi: 1.12,
      dpi: 0.0,
      status: 'deploying',
      deployment_status: 32
    }
  ]);
  
  const [vintageAnalysis, setVintageAnalysis] = useState({
    total_funds: 3,
    total_aum: 325000000,
    weighted_avg_irr: 0.245,
    weighted_avg_tvpi: 2.18,
    best_performing_vintage: 2022,
    quartile_ranking: 'Top Decile',
    benchmark_comparison: {
      industry_avg_irr: 0.187,
      outperformance: 0.058
    },
    vintage_trends: {
      '2022': { irr: 0.287, tvpi: 2.45, fund_count: 1 },
      '2023': { irr: 0.192, tvpi: 1.84, fund_count: 1 },
      '2024': { irr: 0.034, tvpi: 1.12, fund_count: 1 }
    }
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedVintages, setSelectedVintages] = useState([]);
  const [filterYear, setFilterYear] = useState('all');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const addFund = async () => {
    setIsAnalyzing(true);
    try {
      const newFund = {
        fund_name: 'Growth Fund II',
        vintage_year: 2024,
        fund_size: 150000000,
        fund_type: 'Growth',
        target_returns: {
          target_irr: 0.25,
          target_multiple: 3.0,
          target_dpi: 1.8
        },
        investment_strategy: {
          stage_focus: ['series-a', 'series-b'],
          sector_focus: ['AI', 'Healthcare', 'FinTech'],
          geographic_focus: ['US', 'Europe']
        },
        fund_managers: ['Sarah Chen', 'Michael Rodriguez'],
        lp_commitments: 145000000,
        management_fee: 0.02,
        carried_interest: 0.20
      };

      await axios.post(`${BACKEND_URL}/api/fund-vintage/add-fund`, newFund);
      fetchFunds();
      
    } catch (error) {
      console.error('Error adding fund:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runVintageAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysisParams = {
        vintage_years: selectedVintages.length > 0 ? selectedVintages : [2020, 2021, 2022, 2023, 2024],
        benchmark_type: 'industry',
        analysis_type: 'comprehensive'
      };

      const response = await axios.post(`${BACKEND_URL}/api/fund-vintage/analyze`, analysisParams);
      setVintageAnalysis(response.data);
      
    } catch (error) {
      console.error('Error running vintage analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchFunds = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/fund-vintage/funds`);
      setFunds(response.data.funds || []);
    } catch (error) {
      console.error('Error fetching funds:', error);
    }
  };

  useEffect(() => {
    fetchFunds();
  }, []);

  const filteredFunds = funds.filter(fund => {
    return filterYear === 'all' || fund.vintage_year?.toString() === filterYear;
  });

  const FundCard = ({ fund }) => {
    return (
      <div className="clickup-card">
        <div className="clickup-card-body">
          <div className="flex items-start justify-between clickup-mb-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Award className="w-5 h-5 clickup-text-brand" />
              </div>
              <div>
                <h4 className="clickup-font-semibold">{fund.fund_name}</h4>
                <div className="clickup-text-sm clickup-text-secondary">Vintage {fund.vintage_year}</div>
              </div>
            </div>
            <span className="clickup-status clickup-status-success">
              {fund.fund_type}
            </span>
          </div>
          
          <div className="clickup-grid clickup-grid-2 clickup-mt-md">
            <div className="clickup-metric">
              <div className="clickup-metric-value clickup-text-success">
                ${(fund.fund_size / 1000000 || 0).toFixed(0)}M
              </div>
              <div className="clickup-metric-label">Fund Size</div>
            </div>
            <div className="clickup-metric">
              <div className="clickup-metric-value clickup-text-info">
                {((fund.target_returns?.target_irr || 0) * 100).toFixed(0)}%
              </div>
              <div className="clickup-metric-label">Target IRR</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="clickup-main">
      {/* Breadcrumb */}
      <div className="clickup-mb-lg">
        <a href="/" className="clickup-text-secondary hover:clickup-text-primary text-sm">
          Dashboard
        </a>
        <span className="clickup-text-tertiary mx-2">/</span>
        <span className="clickup-text-primary text-sm font-medium">Fund Vintage Management</span>
      </div>

      <div className="clickup-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="clickup-page-title">Fund Vintage Management</h1>
            <p className="clickup-page-subtitle">
              Multi-vintage performance comparison and industry benchmarking
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={addFund}
              disabled={isAnalyzing}
              className="clickup-btn clickup-btn-primary"
            >
              <Plus className="w-4 h-4" />
              Add Fund
            </button>
            <button 
              onClick={runVintageAnalysis}
              disabled={isAnalyzing}
              className="clickup-btn clickup-btn-secondary"
            >
              <Brain className="w-4 h-4" />
              Analyze Vintages
            </button>
          </div>
        </div>
      </div>

      {/* Vintage Performance Overview */}
      <div className="clickup-grid clickup-grid-4 clickup-mb-xl">
        <div className="clickup-card">
          <div className="clickup-card-body clickup-metric">
            <div className="clickup-metric-value clickup-text-success">
              {funds.length}
            </div>
            <div className="clickup-metric-label">Total Funds</div>
          </div>
        </div>
        <div className="clickup-card">
          <div className="clickup-card-body clickup-metric">
            <div className="clickup-metric-value clickup-text-info">
              2.45x
            </div>
            <div className="clickup-metric-label">Average TVPI</div>
          </div>
        </div>
        <div className="clickup-card">
          <div className="clickup-card-body clickup-metric">
            <div className="clickup-metric-value clickup-text-brand">
              Top Decile
            </div>
            <div className="clickup-metric-label">Industry Ranking</div>
          </div>
        </div>
        <div className="clickup-card">
          <div className="clickup-card-body clickup-metric">
            <div className="clickup-metric-value clickup-text-warning">
              8
            </div>
            <div className="clickup-metric-label">Vintage Years</div>
          </div>
        </div>
      </div>

      {/* Fund Filter */}
      <div className="clickup-card clickup-mb-xl">
        <div className="clickup-card-body">
          <div className="flex gap-4">
            <div>
              <label className="clickup-text-sm clickup-font-medium clickup-mb-sm block">
                Filter by Vintage Year
              </label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
              >
                <option value="all">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Fund Grid */}
      <div className="clickup-grid clickup-grid-3 clickup-mb-xl">
        {filteredFunds.map(fund => (
          <FundCard key={fund.fund_id || fund.id} fund={fund} />
        ))}
      </div>

      {/* Vintage Analysis Results */}
      {vintageAnalysis && (
        <div className="clickup-card">
          <div className="clickup-card-header">
            <h3 className="clickup-card-title">
              <BarChart3 className="w-5 h-5" />
              Vintage Analysis Results
            </h3>
          </div>
          <div className="clickup-card-body">
            <div className="clickup-grid clickup-grid-3">
              <div className="clickup-metric">
                <div className="clickup-metric-value clickup-text-success">
                  {vintageAnalysis.vintage_summary?.total_funds || 0}
                </div>
                <div className="clickup-metric-label">Funds Analyzed</div>
              </div>
              <div className="clickup-metric">
                <div className="clickup-metric-value clickup-text-info">
                  {vintageAnalysis.vintage_summary?.avg_irr?.toFixed(1) || 'N/A'}%
                </div>
                <div className="clickup-metric-label">Average IRR</div>
              </div>
              <div className="clickup-metric">
                <div className="clickup-metric-value clickup-text-brand">
                  {vintageAnalysis.vintage_summary?.avg_multiple?.toFixed(2) || 'N/A'}x
                </div>
                <div className="clickup-metric-label">Average Multiple</div>
              </div>
            </div>

            {vintageAnalysis.market_timing_analysis && (
              <div className="clickup-mt-lg clickup-card">
                <div className="clickup-card-header">
                  <h4 className="clickup-card-title">Market Timing Analysis</h4>
                </div>
                <div className="clickup-card-body">
                  <div className="clickup-text-sm clickup-text-secondary">
                    {vintageAnalysis.market_timing_analysis.market_phase}: {vintageAnalysis.market_timing_analysis.timing_score}/100
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FundVintage;