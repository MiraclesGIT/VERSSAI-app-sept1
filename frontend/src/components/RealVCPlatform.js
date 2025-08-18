// Real VC Platform - Core Deal Flow Management
// Complete venture capital operations platform

import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Upload, 
  Download,
  Settings, 
  Users,
  TrendingUp,
  Target,
  BarChart3,
  Monitor,
  Brain,
  Database,
  Layers,
  Wifi,
  WifiOff,
  Search,
  Filter,
  Eye,
  Edit,
  FileText,
  Plus,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  X,
  DollarSign,
  Calendar,
  MessageSquare,
  Award,
  Zap,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Star,
  TrendingDown
} from 'lucide-react';

const RealVCPlatform = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [dealPipelineFilter, setDealPipelineFilter] = useState('all');
  const [portfolioFilter, setPortfolioFilter] = useState('all');

  // Current user with real VC roles
  const currentUser = {
    id: 'user_123',
    name: 'Sarah Williams',
    role: 'Managing Partner',
    fund: {
      name: 'Accel Partners',
      vintage: 'Fund VII',
      totalCommitments: 650000000,
      deployed: 420000000,
      available: 230000000
    },
    permissions: ['*']
  };

  // Real deal pipeline data
  const dealPipeline = [
    {
      id: 'deal_001',
      companyName: 'Neural Systems',
      founder: 'Alex Chen',
      stage: 'Lead',
      sector: 'AI/ML',
      location: 'San Francisco, CA',
      askAmount: 8000000,
      valuation: 32000000,
      leadSource: 'Inbound',
      dealScore: 87,
      lastActivity: '2025-08-17',
      nextMilestone: 'Partner Meeting',
      timeline: '2 weeks',
      riskFactors: ['Market timing', 'Competition'],
      highlights: ['Experienced team', 'Strong traction', 'Large market'],
      financials: {
        revenue: 2400000,
        growth: 180,
        burnRate: 150000,
        runway: 18
      }
    },
    {
      id: 'deal_002',
      companyName: 'HealthTech Solutions',
      founder: 'Dr. Maria Rodriguez',
      stage: 'Interest',
      sector: 'HealthTech',
      location: 'Boston, MA',
      askAmount: 12000000,
      valuation: 48000000,
      leadSource: 'Partner Network',
      dealScore: 91,
      lastActivity: '2025-08-16',
      nextMilestone: 'Due Diligence',
      timeline: '3 weeks',
      riskFactors: ['Regulatory risk'],
      highlights: ['Proven team', 'FDA approval', 'Revenue growth'],
      financials: {
        revenue: 5200000,
        growth: 240,
        burnRate: 180000,
        runway: 24
      }
    },
    {
      id: 'deal_003',
      companyName: 'FinTech Innovations',
      founder: 'James Park',
      stage: 'Due Diligence',
      sector: 'FinTech',
      location: 'New York, NY',
      askAmount: 15000000,
      valuation: 60000000,
      leadSource: 'Portfolio Referral',
      dealScore: 84,
      lastActivity: '2025-08-15',
      nextMilestone: 'Investment Committee',
      timeline: '1 week',
      riskFactors: ['Compliance complexity', 'Market saturation'],
      highlights: ['Strong metrics', 'Experienced team', 'Clear path to exit'],
      financials: {
        revenue: 8100000,
        growth: 160,
        burnRate: 220000,
        runway: 20
      }
    },
    {
      id: 'deal_004',
      companyName: 'CleanTech Energy',
      founder: 'Lisa Thompson',
      stage: 'Term Sheet',
      sector: 'CleanTech',
      location: 'Austin, TX',
      askAmount: 20000000,
      valuation: 80000000,
      leadSource: 'Conference',
      dealScore: 88,
      lastActivity: '2025-08-14',
      nextMilestone: 'Legal Documentation',
      timeline: '2 weeks',
      riskFactors: ['Technology risk', 'Capital intensive'],
      highlights: ['Breakthrough technology', 'Government support', 'Large TAM'],
      financials: {
        revenue: 1200000,
        growth: 320,
        burnRate: 280000,
        runway: 15
      }
    }
  ];

  // Portfolio companies
  const portfolioCompanies = [
    {
      id: 'portfolio_001',
      name: 'DataFlow Inc',
      founder: 'Michael Chang',
      sector: 'Enterprise SaaS',
      investmentDate: '2023-03-15',
      investmentAmount: 10000000,
      ownership: 18.5,
      currentValuation: 85000000,
      totalRaise: 28000000,
      status: 'Growing',
      boardMeeting: '2025-09-15',
      kpis: {
        revenue: 12500000,
        growth: 140,
        burnRate: 180000,
        runway: 28,
        employees: 85,
        churn: 2.1
      },
      recentUpdates: [
        'Closed major enterprise deal with Fortune 500 company',
        'Hired VP of Sales from competitor',
        'Launched new product feature with 40% adoption'
      ]
    },
    {
      id: 'portfolio_002',
      name: 'BioMed Therapeutics',
      founder: 'Dr. Jennifer Kim',
      sector: 'Biotech',
      investmentDate: '2022-11-20',
      investmentAmount: 15000000,
      ownership: 22.3,
      currentValuation: 120000000,
      totalRaise: 45000000,
      status: 'Scaling',
      boardMeeting: '2025-08-25',
      kpis: {
        revenue: 8200000,
        growth: 180,
        burnRate: 320000,
        runway: 18,
        employees: 62,
        trials: 3
      },
      recentUpdates: [
        'Phase II trial results exceeded expectations',
        'Received FDA fast track designation',
        'Partnership discussions with Big Pharma'
      ]
    },
    {
      id: 'portfolio_003',
      name: 'RoboTech Systems',
      founder: 'David Wilson',
      sector: 'Robotics',
      investmentDate: '2023-07-10',
      investmentAmount: 8000000,
      ownership: 15.2,
      currentValuation: 65000000,
      totalRaise: 22000000,
      status: 'Challenged',
      boardMeeting: '2025-08-30',
      kpis: {
        revenue: 4100000,
        growth: 60,
        burnRate: 150000,
        runway: 14,
        employees: 45,
        customers: 28
      },
      recentUpdates: [
        'Manufacturing delays due to supply chain issues',
        'Key customer postponed large order',
        'Working on cost reduction initiatives'
      ]
    }
  ];

  // Fund performance metrics
  const fundMetrics = {
    totalCommitments: 650000000,
    totalDeployed: 420000000,
    totalValue: 680000000,
    unrealizedValue: 580000000,
    realizedValue: 100000000,
    irr: 28.5,
    tvpi: 1.62,
    dpi: 0.15,
    activeInvestments: 18,
    exits: 3,
    writeOffs: 1
  };

  // Deal scoring algorithm
  const calculateDealScore = (deal) => {
    let score = 0;
    
    // Team score (30%)
    const teamScore = Math.min(100, deal.highlights.filter(h => 
      h.includes('team') || h.includes('experienced') || h.includes('proven')
    ).length * 25 + 50);
    score += teamScore * 0.3;
    
    // Market score (25%)
    const marketScore = Math.min(100, deal.highlights.filter(h => 
      h.includes('market') || h.includes('large') || h.includes('growing')
    ).length * 30 + 40);
    score += marketScore * 0.25;
    
    // Traction score (25%)
    const tractionScore = Math.min(100, (deal.financials.growth / 2) + 
      (deal.financials.revenue / 100000));
    score += tractionScore * 0.25;
    
    // Risk score (20%)
    const riskScore = Math.max(0, 100 - (deal.riskFactors.length * 20));
    score += riskScore * 0.2;
    
    return Math.round(score);
  };

  // Header component
  const Header = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{currentUser.fund.name}</h1>
              <p className="text-xs text-blue-600">{currentUser.fund.vintage}</p>
            </div>
          </div>
          
          <nav className="flex space-x-6">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`text-sm font-medium ${currentView === 'dashboard' ? 'text-blue-600' : 'text-gray-600'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setCurrentView('deals')}
              className={`text-sm font-medium ${currentView === 'deals' ? 'text-blue-600' : 'text-gray-600'}`}
            >
              Deal Flow
            </button>
            <button 
              onClick={() => setCurrentView('portfolio')}
              className={`text-sm font-medium ${currentView === 'portfolio' ? 'text-blue-600' : 'text-gray-600'}`}
            >
              Portfolio
            </button>
            <button 
              onClick={() => setCurrentView('analytics')}
              className={`text-sm font-medium ${currentView === 'analytics' ? 'text-blue-600' : 'text-gray-600'}`}
            >
              Analytics
            </button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">{currentUser.name}</div>
            <div className="text-xs text-blue-600">{currentUser.role}</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard view
  const DashboardView = () => (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Fund Overview</h2>
        <p className="text-gray-600">Performance metrics and portfolio summary</p>
      </div>

      {/* Fund Performance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Commitments</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(fundMetrics.totalCommitments / 1000000).toFixed(0)}M
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">IRR</p>
              <p className="text-2xl font-bold text-green-600">{fundMetrics.irr}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">TVPI</p>
              <p className="text-2xl font-bold text-gray-900">{fundMetrics.tvpi}x</p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Investments</p>
              <p className="text-2xl font-bold text-gray-900">{fundMetrics.activeInvestments}</p>
            </div>
            <Building className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Deal Activity</h3>
          <div className="space-y-4">
            {dealPipeline.slice(0, 3).map(deal => (
              <div key={deal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{deal.companyName}</p>
                  <p className="text-sm text-gray-600">{deal.stage} • ${(deal.askAmount / 1000000).toFixed(1)}M</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    deal.dealScore >= 85 ? 'bg-green-100 text-green-800' :
                    deal.dealScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Score: {deal.dealScore}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Portfolio Performance</h3>
          <div className="space-y-4">
            {portfolioCompanies.slice(0, 3).map(company => (
              <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{company.name}</p>
                  <p className="text-sm text-gray-600">{company.kpis.growth}% growth • {company.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${(company.currentValuation / 1000000).toFixed(0)}M
                  </p>
                  <p className="text-xs text-gray-600">{company.ownership}% owned</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Deal Flow view
  const DealFlowView = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deal Pipeline</h2>
          <p className="text-gray-600">Manage and track investment opportunities</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Deal</span>
        </button>
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {['Lead', 'Interest', 'Due Diligence', 'Term Sheet'].map(stage => {
          const stageDeals = dealPipeline.filter(deal => deal.stage === stage);
          return (
            <div key={stage} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{stage}</h3>
                <span className="text-sm text-gray-600">({stageDeals.length})</span>
              </div>
              <div className="space-y-3">
                {stageDeals.map(deal => (
                  <div 
                    key={deal.id} 
                    className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedDeal(deal)}
                  >
                    <p className="font-medium text-gray-900 text-sm">{deal.companyName}</p>
                    <p className="text-xs text-gray-600">{deal.sector}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-600">
                        ${(deal.askAmount / 1000000).toFixed(1)}M
                      </span>
                      <div className={`w-2 h-2 rounded-full ${
                        deal.dealScore >= 85 ? 'bg-green-500' :
                        deal.dealScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Deal Details */}
      {selectedDeal && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{selectedDeal.companyName}</h3>
              <p className="text-gray-600">{selectedDeal.sector} • {selectedDeal.location}</p>
            </div>
            <button 
              onClick={() => setSelectedDeal(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Ask Amount</p>
                  <p className="text-lg font-semibold">${(selectedDeal.askAmount / 1000000).toFixed(1)}M</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valuation</p>
                  <p className="text-lg font-semibold">${(selectedDeal.valuation / 1000000).toFixed(1)}M</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-lg font-semibold">${(selectedDeal.financials.revenue / 1000000).toFixed(1)}M</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Growth Rate</p>
                  <p className="text-lg font-semibold">{selectedDeal.financials.growth}%</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Highlights</h4>
                <ul className="space-y-1">
                  {selectedDeal.highlights.map((highlight, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Risk Factors</h4>
                <ul className="space-y-1">
                  {selectedDeal.riskFactors.map((risk, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-center mb-3">
                  <div className="text-2xl font-bold text-gray-900">{selectedDeal.dealScore}</div>
                  <div className="text-sm text-gray-600">Deal Score</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      selectedDeal.dealScore >= 85 ? 'bg-green-500' :
                      selectedDeal.dealScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${selectedDeal.dealScore}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Next Milestone</p>
                  <p className="font-medium">{selectedDeal.nextMilestone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Timeline</p>
                  <p className="font-medium">{selectedDeal.timeline}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lead Source</p>
                  <p className="font-medium">{selectedDeal.leadSource}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Schedule Meeting
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                  Request Materials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Portfolio view
  const PortfolioView = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Companies</h2>
          <p className="text-gray-600">Monitor and manage portfolio performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {portfolioCompanies.map(company => (
          <div key={company.id} className="bg-white rounded-lg border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                <p className="text-sm text-gray-600">{company.sector}</p>
                <p className="text-xs text-gray-500">Invested {company.investmentDate}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                company.status === 'Growing' ? 'bg-green-100 text-green-800' :
                company.status === 'Scaling' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {company.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-600">Current Value</p>
                <p className="font-semibold">${(company.currentValuation / 1000000).toFixed(0)}M</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Ownership</p>
                <p className="font-semibold">{company.ownership}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Revenue</p>
                <p className="font-semibold">${(company.kpis.revenue / 1000000).toFixed(1)}M</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Growth</p>
                <p className="font-semibold">{company.kpis.growth}%</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2">Recent Updates</p>
              <div className="space-y-1">
                {company.recentUpdates.slice(0, 2).map((update, index) => (
                  <p key={index} className="text-xs text-gray-700">• {update}</p>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-xs hover:bg-blue-700">
                Board Materials
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-xs hover:bg-gray-200">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {currentView === 'dashboard' && <DashboardView />}
      {currentView === 'deals' && <DealFlowView />}
      {currentView === 'portfolio' && <PortfolioView />}
    </div>
  );
};

export default RealVCPlatform;