import React, { useState, useEffect } from 'react';
import '../components/ClickUpTheme.css';
import {
  TrendingUp, Users, BarChart3, Target, Calendar, 
  DollarSign, Activity, AlertCircle, CheckCircle,
  ArrowLeft, Plus, Filter, Search, Download,
  Building, Briefcase, Award, Clock, Zap
} from 'lucide-react';
import axios from 'axios';

const PortfolioManagement = () => {
  // Demo data for impressive display
  const [portfolioCompanies, setPortfolioCompanies] = useState([
    {
      id: '1',
      company_name: 'TechFlow AI',
      industry: 'Artificial Intelligence',
      stage: 'series-a',
      investment_amount: 8500000,
      current_valuation: 45000000,
      board_seat: true,
      investment_date: '2024-02-15',
      lead_partner: 'Sarah Chen',
      key_metrics: {
        revenue: 4200000,
        growth_rate: 0.28,
        burn_rate: 180000,
        runway_months: 22
      },
      last_board_meeting: '2024-12-10',
      status: 'performing'
    },
    {
      id: '2',
      company_name: 'HealthTech Solutions',
      industry: 'Healthcare Technology',
      stage: 'series-b',
      investment_amount: 12000000,
      current_valuation: 85000000,
      board_seat: true,
      investment_date: '2023-08-22',
      lead_partner: 'Michael Torres',
      key_metrics: {
        revenue: 7800000,
        growth_rate: 0.35,
        burn_rate: 220000,
        runway_months: 28
      },
      last_board_meeting: '2024-12-05',
      status: 'outperforming'
    },
    {
      id: '3',
      company_name: 'GreenEnergy Dynamics',
      industry: 'Clean Technology',
      stage: 'series-c',
      investment_amount: 18000000,
      current_valuation: 125000000,
      board_seat: false,
      investment_date: '2023-03-10',
      lead_partner: 'David Kim',
      key_metrics: {
        revenue: 12500000,
        growth_rate: 0.42,
        burn_rate: 280000,
        runway_months: 32
      },
      last_board_meeting: '2024-11-28',
      status: 'outperforming'
    },
    {
      id: '4',
      company_name: 'CyberSec Pro',
      industry: 'Cybersecurity',
      stage: 'seed',
      investment_amount: 3500000,
      current_valuation: 12000000,
      board_seat: true,
      investment_date: '2024-06-12',
      lead_partner: 'Emma Rodriguez',
      key_metrics: {
        revenue: 850000,
        growth_rate: 0.18,
        burn_rate: 120000,
        runway_months: 16
      },
      last_board_meeting: '2024-12-08',
      status: 'watch'
    },
    {
      id: '5',
      company_name: 'DataFlow Analytics',
      industry: 'Data & Analytics',
      stage: 'series-a',
      investment_amount: 6500000,
      current_valuation: 32000000,
      board_seat: true,
      investment_date: '2024-01-20',
      lead_partner: 'Alex Johnson',
      key_metrics: {
        revenue: 3200000,
        growth_rate: 0.22,
        burn_rate: 165000,
        runway_months: 24
      },
      last_board_meeting: '2024-12-12',
      status: 'performing'
    }
  ]);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [boardMeetings, setBoardMeetings] = useState([
    {
      id: '1',
      company_id: '1',
      company_name: 'TechFlow AI',
      meeting_date: '2024-12-10',
      attendees: ['Sarah Chen', 'CEO John Smith', 'CTO Alice Wang'],
      key_decisions: ['Approved Series B preparation', 'New hire authorization'],
      next_milestone: 'Product launch Q1 2025'
    },
    {
      id: '2', 
      company_id: '2',
      company_name: 'HealthTech Solutions',
      meeting_date: '2024-12-05',
      attendees: ['Michael Torres', 'CEO Maria Garcia', 'VP Sales Tom Wilson'],
      key_decisions: ['Expansion to European market', 'Partnership with MedTech Corp'],
      next_milestone: 'FDA approval Q2 2025'
    }
  ]);

  const [kpiData, setKpiData] = useState({
    total_portfolio_value: 299000000,
    total_companies: 5,
    avg_growth_rate: 0.29,
    active_deals: 3,
    board_meetings_this_month: 12,
    revenue_growth: 0.31
  });

  const [isLoading, setIsLoading] = useState(false);
  const [filterStage, setFilterStage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const companyStages = {
    'seed': { color: 'clickup-text-warning', bg: 'bg-yellow-100', label: 'Seed' },
    'series-a': { color: 'clickup-text-info', bg: 'bg-blue-100', label: 'Series A' },
    'series-b': { color: 'clickup-text-brand', bg: 'bg-purple-100', label: 'Series B' },
    'series-c': { color: 'clickup-text-success', bg: 'bg-green-100', label: 'Series C+' },
    'growth': { color: 'clickup-text-secondary', bg: 'bg-gray-100', label: 'Growth' }
  };

  const addCompany = async () => {
    setIsLoading(true);
    try {
      const newCompany = {
        company_name: 'TechCorp AI',
        industry: 'Artificial Intelligence',
        stage: 'series-a',
        investment_amount: 5000000,
        valuation: 25000000,
        board_seat: true,
        investment_date: '2024-01-15',
        lead_partner: 'Sarah Chen',
        key_metrics: {
          revenue: 2400000,
          growth_rate: 0.15,
          burn_rate: 200000,
          runway_months: 18
        }
      };

      const response = await axios.post(`${BACKEND_URL}/api/portfolio/add-company`, newCompany);
      
      // Refresh portfolio list
      fetchPortfolioCompanies();
      
    } catch (error) {
      console.error('Error adding company:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPortfolioCompanies = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/portfolio/companies`);
      setPortfolioCompanies(response.data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const addBoardMeeting = async (companyId) => {
    try {
      const meetingData = {
        company_id: companyId,
        meeting_date: new Date().toISOString().split('T')[0],
        meeting_type: 'quarterly',
        attendees: ['CEO', 'CTO', 'Lead Partner'],
        agenda_items: ['Financial Review', 'Product Updates', 'Hiring Plans'],
        notes: 'Strong quarter with 15% revenue growth. Product roadmap on track.',
        action_items: ['Hire VP Sales', 'Expand to European market'],
        next_meeting: '2024-04-15'
      };

      await axios.post(`${BACKEND_URL}/api/portfolio/board-meeting`, meetingData);
      
      // Refresh meetings for this company
      fetchBoardMeetings(companyId);
      
    } catch (error) {
      console.error('Error adding board meeting:', error);
    }
  };

  const fetchBoardMeetings = async (companyId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/portfolio/company/${companyId}/meetings`);
      setBoardMeetings(response.data.meetings || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  useEffect(() => {
    fetchPortfolioCompanies();
  }, []);

  const filteredCompanies = portfolioCompanies.filter(company => {
    const matchesSearch = company.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.industry?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = filterStage === 'all' || company.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const CompanyCard = ({ company }) => {
    const stageInfo = companyStages[company.stage] || companyStages['seed'];
    
    return (
      <div 
        className="clickup-card cursor-pointer transition-all duration-300 hover:shadow-lg"
        onClick={() => setSelectedCompany(company)}
      >
        <div className="clickup-card-body">
          <div className="flex items-start justify-between clickup-mb-md">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stageInfo.bg} flex items-center justify-center`}>
                <Building className={`w-5 h-5 ${stageInfo.color}`} />
              </div>
              <div>
                <h4 className="clickup-font-semibold">{company.company_name}</h4>
                <div className="clickup-text-sm clickup-text-secondary">{company.industry}</div>
              </div>
            </div>
            <span className={`clickup-status clickup-status-primary`}>
              {stageInfo.label}
            </span>
          </div>
          
          <div className="clickup-grid clickup-grid-2 clickup-mt-md">
            <div className="clickup-metric">
              <div className="clickup-metric-value clickup-text-success">
                ${(company.key_metrics?.revenue / 1000000 || 0).toFixed(1)}M
              </div>
              <div className="clickup-metric-label">Revenue</div>
            </div>
            <div className="clickup-metric">
              <div className="clickup-metric-value clickup-text-info">
                {((company.key_metrics?.growth_rate || 0) * 100).toFixed(0)}%
              </div>
              <div className="clickup-metric-label">Growth Rate</div>
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
        <span className="clickup-text-primary text-sm font-medium">Portfolio Management</span>
      </div>

      <div className="clickup-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="clickup-page-title">Portfolio Management</h1>
            <p className="clickup-page-subtitle">
              Real-time portfolio analytics with board meeting intelligence
            </p>
          </div>
          <button 
            onClick={addCompany}
            disabled={isLoading}
            className="clickup-btn clickup-btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="clickup-grid clickup-grid-4 clickup-mb-xl">
        <div className="clickup-card">
          <div className="clickup-card-body clickup-metric">
            <div className="clickup-metric-value clickup-text-success">
              {portfolioCompanies.length}
            </div>
            <div className="clickup-metric-label">Portfolio Companies</div>
          </div>
        </div>
        <div className="clickup-card">
          <div className="clickup-card-body clickup-metric">
            <div className="clickup-metric-value clickup-text-info">
              ${(kpiData.total_portfolio_value / 1000000).toFixed(0)}M
            </div>
            <div className="clickup-metric-label">Total Portfolio Value</div>
          </div>
        </div>
        <div className="clickup-card">
          <div className="clickup-card-body clickup-metric">
            <div className="clickup-metric-value clickup-text-brand">
              {(kpiData.avg_growth_rate * 100).toFixed(1)}%
            </div>
            <div className="clickup-metric-label">Average Growth Rate</div>
          </div>
        </div>
        <div className="clickup-card">
          <div className="clickup-card-body clickup-metric">
            <div className="clickup-metric-value clickup-text-warning">
              {kpiData.board_meetings_this_month}
            </div>
            <div className="clickup-metric-label">Board Meetings/Month</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="clickup-card clickup-mb-xl">
        <div className="clickup-card-body">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
              />
            </div>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
            >
              <option value="all">All Stages</option>
              {Object.entries(companyStages).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Company Grid */}
      <div className="clickup-grid clickup-grid-3">
        {filteredCompanies.map(company => (
          <CompanyCard key={company.company_id || company.id} company={company} />
        ))}
      </div>

      {/* Company Details Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="clickup-card max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="clickup-card-header">
              <div className="flex items-center justify-between">
                <h3 className="clickup-card-title">
                  <Building className="w-5 h-5" />
                  {selectedCompany.company_name}
                </h3>
                <button 
                  onClick={() => setSelectedCompany(null)}
                  className="clickup-btn clickup-btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="clickup-card-body">
              <div className="clickup-grid clickup-grid-2">
                <div>
                  <h4 className="clickup-font-semibold clickup-mb-md">Company Details</h4>
                  <div className="space-y-2 clickup-text-sm">
                    <div><strong>Industry:</strong> {selectedCompany.industry}</div>
                    <div><strong>Stage:</strong> {companyStages[selectedCompany.stage]?.label}</div>
                    <div><strong>Investment:</strong> ${(selectedCompany.investment_amount / 1000000).toFixed(1)}M</div>
                    <div><strong>Valuation:</strong> ${(selectedCompany.valuation / 1000000).toFixed(1)}M</div>
                    <div><strong>Lead Partner:</strong> {selectedCompany.lead_partner}</div>
                  </div>
                </div>
                <div>
                  <h4 className="clickup-font-semibold clickup-mb-md">Key Metrics</h4>
                  <div className="space-y-2 clickup-text-sm">
                    <div><strong>Revenue:</strong> ${(selectedCompany.key_metrics?.revenue / 1000000 || 0).toFixed(1)}M</div>
                    <div><strong>Growth Rate:</strong> {((selectedCompany.key_metrics?.growth_rate || 0) * 100).toFixed(0)}%</div>
                    <div><strong>Burn Rate:</strong> ${(selectedCompany.key_metrics?.burn_rate / 1000 || 0).toFixed(0)}K/month</div>
                    <div><strong>Runway:</strong> {selectedCompany.key_metrics?.runway_months || 0} months</div>
                  </div>
                </div>
              </div>
              
              <div className="clickup-mt-lg">
                <button 
                  onClick={() => addBoardMeeting(selectedCompany.company_id)}
                  className="clickup-btn clickup-btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Add Board Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManagement;