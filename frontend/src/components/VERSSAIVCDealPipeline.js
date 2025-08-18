import React, { useState, useEffect } from 'react';
import { 
  Building2, TrendingUp, Users, DollarSign, Calendar, 
  MessageSquare, FileText, Eye, Edit, ChevronRight,
  Plus, Filter, Search, Download, Bell, Star,
  BarChart3, Target, Clock, CheckCircle, AlertTriangle,
  ArrowUp, ArrowDown, ExternalLink, Mail, Phone
} from 'lucide-react';

// Mock data for demonstration - in real implementation, this would come from your backend
const mockDeals = [
  {
    id: 'deal_001',
    companyName: 'Neural Dynamics AI',
    founders: [
      { name: 'Dr. Sarah Chen', role: 'CEO', linkedin: 'https://linkedin.com/in/sarahchen' },
      { name: 'Mike Rodriguez', role: 'CTO', linkedin: 'https://linkedin.com/in/mikerod' }
    ],
    stage: 'Series A',
    valuation: 12000000,
    askAmount: 3000000,
    industry: 'Artificial Intelligence',
    status: 'Due Diligence',
    submissionDate: '2024-01-15',
    lastActivity: '2024-01-20',
    assignedPartner: 'Jessica Williams',
    description: 'AI-powered autonomous vehicle navigation system with breakthrough computer vision technology.',
    metrics: {
      revenue: 850000,
      growth: '15%',
      customers: 23,
      teamSize: 18
    },
    documents: [
      { name: 'Pitch Deck', type: 'presentation', date: '2024-01-15' },
      { name: 'Financial Model', type: 'spreadsheet', date: '2024-01-16' },
      { name: 'Cap Table', type: 'document', date: '2024-01-16' }
    ],
    lastNote: 'Strong technical team, impressive IP portfolio. Need to validate market size.',
    priority: 'high'
  },
  {
    id: 'deal_002',
    companyName: 'EcoLogistics Inc',
    founders: [
      { name: 'Amanda Park', role: 'CEO', linkedin: 'https://linkedin.com/in/amandapark' }
    ],
    stage: 'Seed',
    valuation: 8000000,
    askAmount: 2000000,
    industry: 'Supply Chain',
    status: 'Qualified',
    submissionDate: '2024-01-18',
    lastActivity: '2024-01-19',
    assignedPartner: 'David Kim',
    description: 'Sustainable supply chain optimization platform reducing carbon footprint by 40%.',
    metrics: {
      revenue: 420000,
      growth: '25%',
      customers: 12,
      teamSize: 11
    },
    documents: [
      { name: 'Pitch Deck', type: 'presentation', date: '2024-01-18' }
    ],
    lastNote: 'Compelling sustainability angle, strong early customer traction.',
    priority: 'medium'
  },
  {
    id: 'deal_003',
    companyName: 'HealthTech Solutions',
    founders: [
      { name: 'Dr. James Miller', role: 'CEO', linkedin: 'https://linkedin.com/in/jamesmiller' },
      { name: 'Lisa Chang', role: 'CTO', linkedin: 'https://linkedin.com/in/lisachang' }
    ],
    stage: 'Series B',
    valuation: 45000000,
    askAmount: 12000000,
    industry: 'Healthcare',
    status: 'Term Sheet',
    submissionDate: '2024-01-10',
    lastActivity: '2024-01-21',
    assignedPartner: 'Michael Chen',
    description: 'AI-powered diagnostic platform for early cancer detection with 94% accuracy.',
    metrics: {
      revenue: 3200000,
      growth: '8%',
      customers: 156,
      teamSize: 45
    },
    documents: [
      { name: 'Pitch Deck', type: 'presentation', date: '2024-01-10' },
      { name: 'Financial Model', type: 'spreadsheet', date: '2024-01-11' },
      { name: 'Cap Table', type: 'document', date: '2024-01-11' },
      { name: 'Term Sheet Draft', type: 'document', date: '2024-01-20' }
    ],
    lastNote: 'Terms agreed, finalizing legal documentation. Strong clinical validation.',
    priority: 'high'
  }
];

const statusConfig = {
  'Lead': { color: 'bg-gray-100 text-gray-700', bgColor: 'bg-gray-50', icon: Target },
  'Qualified': { color: 'bg-blue-100 text-blue-700', bgColor: 'bg-blue-50', icon: Eye },
  'Due Diligence': { color: 'bg-yellow-100 text-yellow-700', bgColor: 'bg-yellow-50', icon: FileText },
  'Term Sheet': { color: 'bg-purple-100 text-purple-700', bgColor: 'bg-purple-50', icon: Edit },
  'Closed': { color: 'bg-green-100 text-green-700', bgColor: 'bg-green-50', icon: CheckCircle },
  'Passed': { color: 'bg-red-100 text-red-700', bgColor: 'bg-red-50', icon: AlertTriangle }
};

const priorityConfig = {
  'high': { color: 'text-red-600', bg: 'bg-red-100' },
  'medium': { color: 'text-yellow-600', bg: 'bg-yellow-100' },
  'low': { color: 'text-green-600', bg: 'bg-green-100' }
};

const VERSSAIVCDealPipeline = () => {
  const [deals, setDeals] = useState(mockDeals);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [currentView, setCurrentView] = useState('pipeline'); // pipeline, analytics, team
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDealModal, setShowNewDealModal] = useState(false);

  // Filter deals based on current filters
  const filteredDeals = deals.filter(deal => {
    const matchesStatus = filterStatus === 'all' || deal.status === filterStatus;
    const matchesStage = filterStage === 'all' || deal.stage === filterStage;
    const matchesSearch = searchQuery === '' || 
      deal.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.founders.some(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesStage && matchesSearch;
  });

  // Analytics calculations
  const analytics = {
    totalDeals: deals.length,
    totalValue: deals.reduce((sum, deal) => sum + deal.askAmount, 0),
    avgValuation: deals.reduce((sum, deal) => sum + deal.valuation, 0) / deals.length,
    statusBreakdown: deals.reduce((acc, deal) => {
      acc[deal.status] = (acc[deal.status] || 0) + 1;
      return acc;
    }, {}),
    stageBreakdown: deals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {})
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const DealCard = ({ deal }) => {
    const StatusIcon = statusConfig[deal.status]?.icon || Target;
    const isHighPriority = deal.priority === 'high';
    
    return (
      <div 
        className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer
          ${isHighPriority ? 'ring-2 ring-red-200' : ''}
        `}
        onClick={() => setSelectedDeal(deal)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
              {deal.companyName.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{deal.companyName}</h3>
              <p className="text-sm text-gray-600">{deal.industry}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isHighPriority && (
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[deal.status]?.color}`}>
              {deal.status}
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500">Valuation</div>
            <div className="font-semibold text-gray-900">{formatCurrency(deal.valuation)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Ask Amount</div>
            <div className="font-semibold text-gray-900">{formatCurrency(deal.askAmount)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Revenue</div>
            <div className="font-semibold text-gray-900">{formatCurrency(deal.metrics.revenue)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Growth</div>
            <div className="font-semibold text-green-600 flex items-center">
              <ArrowUp className="w-3 h-3 mr-1" />
              {deal.metrics.growth}
            </div>
          </div>
        </div>

        {/* Founders */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Founders</div>
          <div className="space-y-1">
            {deal.founders.map((founder, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{founder.name}</span>
                <span className="text-xs text-gray-500">{founder.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{deal.assignedPartner}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {new Date(deal.lastActivity).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const DealDetailModal = ({ deal, onClose }) => {
    if (!deal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {deal.companyName.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{deal.companyName}</h2>
                <p className="text-gray-600">{deal.industry} • {deal.stage}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Company Overview</h3>
                  <p className="text-gray-700">{deal.description}</p>
                </div>

                {/* Key Metrics */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Key Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(deal.metrics.revenue)}</div>
                      <div className="text-sm text-blue-700">Annual Revenue</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-green-600">{deal.metrics.growth}</div>
                      <div className="text-sm text-green-700">Monthly Growth</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-purple-600">{deal.metrics.customers}</div>
                      <div className="text-sm text-purple-700">Active Customers</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-orange-600">{deal.metrics.teamSize}</div>
                      <div className="text-sm text-orange-700">Team Members</div>
                    </div>
                  </div>
                </div>

                {/* Founders */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Founding Team</h3>
                  <div className="space-y-3">
                    {deal.founders.map((founder, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <div className="font-medium text-gray-900">{founder.name}</div>
                          <div className="text-sm text-gray-600">{founder.role}</div>
                        </div>
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Documents</h3>
                  <div className="space-y-2">
                    {deal.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{doc.name}</div>
                            <div className="text-sm text-gray-500">
                              {doc.type} • {new Date(doc.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status & Priority */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Deal Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[deal.status]?.color}`}>
                        {deal.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Priority</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityConfig[deal.priority]?.color} ${priorityConfig[deal.priority]?.bg}`}>
                        {deal.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Assigned to</span>
                      <span className="text-sm font-medium text-gray-900">{deal.assignedPartner}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Financial Summary</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Valuation</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(deal.valuation)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ask Amount</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(deal.askAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Stage</span>
                      <span className="text-sm font-medium text-gray-900">{deal.stage}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
                  <div className="text-sm text-gray-700">
                    <p className="mb-2">{deal.lastNote}</p>
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(deal.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Schedule Meeting
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    Add Note
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Deal Pipeline</h1>
              <p className="text-gray-600">Manage your investment opportunities</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>New Deal</span>
              </button>
              <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{analytics.totalDeals}</div>
              <div className="text-sm text-gray-600">Total Deals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(analytics.totalValue)}</div>
              <div className="text-sm text-gray-600">Total Ask Amount</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.avgValuation)}</div>
              <div className="text-sm text-gray-600">Avg Valuation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.statusBreakdown['Due Diligence'] || 0}
              </div>
              <div className="text-sm text-gray-600">In Due Diligence</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search deals, companies, or founders..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {Object.keys(statusConfig).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
          >
            <option value="all">All Stages</option>
            <option value="Pre-Seed">Pre-Seed</option>
            <option value="Seed">Seed</option>
            <option value="Series A">Series A</option>
            <option value="Series B">Series B</option>
          </select>
        </div>

        {/* Deal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>

        {filteredDeals.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {/* Deal Detail Modal */}
      <DealDetailModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
    </div>
  );
};

export default VERSSAIVCDealPipeline;