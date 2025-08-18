import React, { useState, useEffect } from 'react';
import {
  Search,
  Upload,
  Download,
  FileText,
  Filter,
  Plus,
  MoreHorizontal,
  User,
  Globe,
  Calendar,
  TrendingUp,
  Building,
  Users,
  Target,
  Award,
  ChevronRight,
  Share2,
  Bookmark,
  Save,
  ExternalLink,
  Mail,
  X
} from 'lucide-react';

const VERSSAIMainDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, ai-scouting, due-diligence
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data matching the screenshots
  const startupStats = {
    scouting: 932,
    applications: 155,
    valuable: 21
  };

  const companies = [
    {
      id: 1,
      name: 'Vistim Labs',
      founder: 'John Doe',
      stage: 'Series C',
      location: 'Salt Lake City, UT',
      industry: 'AI, Fintech',
      foundedDate: 'Sep 2021',
      readinessScore: 81,
      description: 'Vistim Labs is a MedTech diagnostic company that helps to detect, treat, and track neurological disorders.',
      website: 'vistimabs.com',
      team: [
        { name: 'James Hamet', role: 'Founder & CEO' },
        { name: 'Frank Zanow, PhD', role: 'Board Director' }
      ],
      avatar: 'SW'
    },
    {
      id: 2,
      name: 'DataHarvest',
      founder: 'Jane Smith',
      stage: 'Seed',
      location: 'New York, NY',
      industry: 'Finance',
      foundedDate: 'Oct 2023',
      readinessScore: 75,
      avatar: 'DH'
    },
    {
      id: 3,
      name: 'AI Mentor',
      founder: 'Mike Johnson',
      stage: 'Series A',
      location: 'Austin, TX',
      industry: 'Education',
      foundedDate: 'Nov 2023',
      readinessScore: 69,
      avatar: 'AM'
    },
    {
      id: 4,
      name: 'CloudScale',
      founder: 'Sarah Wilson',
      stage: 'Pre-Seed',
      location: 'Seattle, WA',
      industry: 'Cyber Security',
      foundedDate: 'Jan 2024',
      readinessScore: 51,
      avatar: 'CS'
    },
    {
      id: 5,
      name: 'EcoTech',
      founder: 'David Brown',
      stage: 'Seed',
      location: 'Boston, MA',
      industry: 'Education',
      foundedDate: 'May 2024',
      readinessScore: 50,
      avatar: 'ET'
    },
    {
      id: 6,
      name: 'FinAi',
      founder: 'Lisa Chen',
      stage: 'Pre-Seed',
      location: 'Chicago, IL',
      industry: 'AI, Fintech',
      foundedDate: 'Jun 2024',
      readinessScore: 41,
      avatar: 'FI'
    }
  ];

  const industryTrends = [
    { name: 'AI Software & Data', count: 255, color: '#8b5cf6' },
    { name: 'Health Tech', count: 199, color: '#8b5cf6' },
    { name: 'Social & Leisure', count: 115, color: '#8b5cf6' },
    { name: 'Fintech', count: 132, color: '#8b5cf6' },
    { name: 'Marketing & Sales', count: 111, color: '#8b5cf6' }
  ];

  const dueDiligenceFiles = [
    { id: '2.1', title: 'Company Finance Documents', type: 'folder', size: '7 docs', date: 'Oct 19' },
    { id: '2.2', title: 'Finance Report.xlsx', type: 'xlsx', size: '23kb', date: 'Oct 19' },
    { id: '2.3', title: 'Finance Report template.docx', type: 'docx', size: '700.7kb', date: 'Oct 19' },
    { id: '2.4', title: '2012 Historical Financials.pdf', type: 'pdf', size: '41kb', date: 'Oct 19' },
    { id: '2.5', title: '2012 Historical Financials.pdf', type: 'pdf', size: '41kb', date: 'Oct 19' },
    { id: '2.6', title: '2012 Historical Financials.pdf', type: 'pdf', size: '41kb', date: 'Oct 19' }
  ];

  // Readiness Score Component
  const ReadinessScore = ({ score, size = 'md' }) => {
    const radius = size === 'lg' ? 40 : 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    const getColor = (score) => {
      if (score >= 70) return '#10b981'; // green
      if (score >= 50) return '#f59e0b'; // orange
      return '#ef4444'; // red
    };

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size === 'lg' ? 100 : 50} height={size === 'lg' ? 100 : 50} className="transform -rotate-90">
          <circle
            cx={size === 'lg' ? 50 : 25}
            cy={size === 'lg' ? 50 : 25}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={size === 'lg' ? 6 : 3}
            fill="none"
          />
          <circle
            cx={size === 'lg' ? 50 : 25}
            cy={size === 'lg' ? 50 : 25}
            r={radius}
            stroke={getColor(score)}
            strokeWidth={size === 'lg' ? 6 : 3}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-gray-900 font-semibold ${size === 'lg' ? 'text-lg' : 'text-xs'}`}>
          {score}%
        </div>
      </div>
    );
  };

  // Sidebar Navigation
  const Sidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-xl font-bold text-gray-900">VERSS.AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors ${
            activeView === 'dashboard' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveView('ai-scouting')}
          className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors ${
            activeView === 'ai-scouting' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="font-medium">AI Scouting</span>
        </button>

        <button
          onClick={() => setActiveView('due-diligence')}
          className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors ${
            activeView === 'due-diligence' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="font-medium">Due Diligence</span>
          <span className="ml-auto bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">(3)</span>
        </button>

        <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-50 transition-colors">
          <Bookmark className="w-5 h-5" />
          <span className="font-medium">Saved</span>
          <span className="ml-auto bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">(13)</span>
        </button>

        <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-50 transition-colors">
          <Users className="w-5 h-5" />
          <span className="font-medium">Applications</span>
          <span className="ml-auto bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">(2)</span>
        </button>

        <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-50 transition-colors">
          <Mail className="w-5 h-5" />
          <span className="font-medium">Inbox</span>
        </button>
      </nav>

      {/* Upload Section */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span className="font-medium">UPLOAD YOUR STARTUPS</span>
        </button>
        
        {/* User Profile */}
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium text-sm">VC</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">VC</div>
            <div className="text-xs text-gray-500">Profile</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Main Dashboard View
  const DashboardView = () => (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello Versatil.VC</h1>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>Due Diligence Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span>Vistim Labs</span>
            <ChevronRight className="w-4 h-4" />
            <span>Financial Information</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Search className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">SCOUTING STARTUPS</div>
              <div className="text-3xl font-bold text-gray-900">{startupStats.scouting}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">STARTUPS APPLICATIONS</div>
              <div className="text-3xl font-bold text-gray-900">{startupStats.applications}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">MOST VALUABLE STARTUPS</div>
              <div className="text-3xl font-bold text-gray-900">{startupStats.valuable}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Startup List */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Startups</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">All</button>
                <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-lg text-sm">Drafts</button>
                <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-lg text-sm">In-Review</button>
                <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-lg text-sm">Rejected</button>
                <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-lg text-sm">Shortlisted</button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {companies.slice(0, 6).map((company) => (
              <div
                key={company.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedCompany(company)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {company.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{company.name}</h4>
                      <div className="text-sm text-gray-500">{company.founder}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          company.stage === 'Series C' ? 'bg-green-100 text-green-700' :
                          company.stage === 'Series A' ? 'bg-blue-100 text-blue-700' :
                          company.stage === 'Seed' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {company.stage}
                        </span>
                        <span className="text-xs text-gray-500">{company.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Founded</div>
                      <div className="text-sm font-medium text-gray-900">{company.foundedDate}</div>
                    </div>
                    <ReadinessScore score={company.readinessScore} />
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Startup Applications Industry Trends</h3>
          <div className="space-y-4">
            {industryTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{trend.name}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(trend.count / 255) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900 ml-4">{trend.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Company Detail */}
      {selectedCompany && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {selectedCompany.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCompany.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedCompany.stage === 'Series C' ? 'bg-green-100 text-green-700' :
                    selectedCompany.stage === 'Series A' ? 'bg-blue-100 text-blue-700' :
                    selectedCompany.stage === 'Seed' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedCompany.stage}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">MedTech</span>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Globe className="w-4 h-4" />
                    <span>{selectedCompany.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Founded: {selectedCompany.foundedDate}</span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{selectedCompany.description}</p>

                {selectedCompany.website && (
                  <div className="flex items-center space-x-2 mb-4">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a href={`https://${selectedCompany.website}`} className="text-purple-600 hover:text-purple-700">
                      {selectedCompany.website}
                    </a>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                )}

                {selectedCompany.team && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">TEAM</h4>
                    <div className="flex items-center space-x-4">
                      {selectedCompany.team.map((member, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-xs text-gray-500">{member.role}</div>
                          </div>
                        </div>
                      ))}
                      <button className="text-purple-600 text-sm">+8</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">READINESS SCORE</div>
                <ReadinessScore score={selectedCompany.readinessScore} size="lg" />
              </div>
              <div className="flex flex-col space-y-2">
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Bookmark className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Save className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* AI Summary Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">AI-Powered Executive Summary</span>
            </button>
            <button className="w-full mt-3 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
              <Download className="w-5 h-5" />
              <span className="font-medium">Download Due Diligence Report</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // AI Scouting View
  const AIScouttingView = () => (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Scouting Startups</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">Filter by Industry</option>
            <option value="ai">AI, Fintech</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
            <option value="security">Cyber Security</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium">All</button>
        <button className="px-4 py-2 text-gray-600 hover:bg-white rounded-lg text-sm">Recent (+5)</button>
        <button className="px-4 py-2 text-gray-600 hover:bg-white rounded-lg text-sm">Applications (+2)</button>
        <button className="px-4 py-2 text-gray-600 hover:bg-white rounded-lg text-sm">Viewed (+31)</button>
        <button className="px-4 py-2 text-gray-600 hover:bg-white rounded-lg text-sm">Saved (+13)</button>
        <button className="px-4 py-2 text-gray-600 hover:bg-white rounded-lg text-sm">Declined (+3)</button>
      </div>

      {/* Startup Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wide">
            <div>STARTUP</div>
            <div>STAGE</div>
            <div>LOCATION</div>
            <div>FOUNDERS</div>
            <div>INDUSTRY</div>
            <div>FOUNDED DATE</div>
            <div>READINESS SCORE</div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {companies.filter(company => 
            filterIndustry === 'all' || company.industry.toLowerCase().includes(filterIndustry)
          ).filter(company =>
            searchTerm === '' || company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.founder.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((company) => (
            <div
              key={company.id}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setSelectedCompany(company)}
            >
              <div className="grid grid-cols-7 gap-4 items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {company.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{company.name}</div>
                    <div className="text-sm text-gray-500">{company.founder}</div>
                  </div>
                </div>
                
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    company.stage === 'Series C' ? 'bg-green-100 text-green-700' :
                    company.stage === 'Series A' ? 'bg-blue-100 text-blue-700' :
                    company.stage === 'Seed' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {company.stage}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">{company.location}</div>
                
                <div className="text-sm text-gray-600">
                  {company.founder}, John Malcovitch,<br />
                  <span className="text-gray-500">Anastasiia Gritsenko</span>
                </div>
                
                <div className="text-sm text-gray-600">{company.industry}</div>
                
                <div className="text-sm text-gray-600">{company.foundedDate}</div>
                
                <div className="flex items-center justify-between">
                  <ReadinessScore score={company.readinessScore} />
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Previous</button>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((page) => (
              <button
                key={page}
                className={`w-8 h-8 rounded ${page === 1 ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {page}
              </button>
            ))}
          </div>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Next</button>
        </div>
      </div>
    </div>
  );

  // Due Diligence View
  const DueDiligenceView = () => (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Due Diligence Dashboard / Vistim Labs / Financial Information</h1>
          <div className="text-sm text-gray-500 mt-1">5 Saved Startups</div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>UPLOAD</span>
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>DOWNLOAD ALL</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            New Request
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Edit Index
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Export Index
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left Sidebar - Company Structure */}
        <div className="col-span-1 bg-white rounded-xl border border-gray-200 p-4">
          <div className="space-y-2">
            {/* Saved Startups */}
            <div className="space-y-1">
              <button className="w-full text-left px-2 py-1 text-purple-600 hover:bg-purple-50 rounded">SolarWing</button>
              <button className="w-full text-left px-2 py-1 text-purple-600 hover:bg-purple-50 rounded">Convrt.ai</button>
              
              {/* Vistim Labs - Expanded */}
              <div className="bg-purple-50 rounded-lg p-2">
                <button className="w-full text-left font-medium text-purple-700 mb-2">Vistim Labs</button>
                <div className="ml-4 space-y-1 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>1. Corporate</span>
                  </div>
                  <div className="bg-purple-100 rounded p-2">
                    <div className="flex items-center space-x-2 text-purple-700 font-medium">
                      <FileText className="w-4 h-4" />
                      <span>2. Financial information</span>
                    </div>
                    <div className="ml-6 mt-2 text-xs text-gray-500">
                      2.1 Company Finance Documents
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>3. Legal & Compliance</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>4. Other contracts and agreements</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>5. Risk Management</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>6. Sales & Marketing</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>7. Tax</span>
                  </div>
                </div>
              </div>
              
              <button className="w-full text-left px-2 py-1 text-purple-600 hover:bg-purple-50 rounded">InnoPlaya</button>
              <button className="w-full text-left px-2 py-1 text-purple-600 hover:bg-purple-50 rounded">Spotlight</button>
            </div>
          </div>
        </div>

        {/* Main Content - File List */}
        <div className="col-span-4 bg-white rounded-xl border border-gray-200">
          {/* File Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wide">
              <div>Index</div>
              <div className="col-span-2">Title</div>
              <div>Size</div>
              <div>Date</div>
            </div>
          </div>

          {/* File List */}
          <div className="divide-y divide-gray-200">
            {dueDiligenceFiles.map((file) => (
              <div key={file.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="text-sm text-gray-600">{file.id}</div>
                  <div className="col-span-2 flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${
                      file.type === 'folder' ? 'bg-gray-100' :
                      file.type === 'xlsx' ? 'bg-green-100' :
                      file.type === 'docx' ? 'bg-red-100' :
                      'bg-red-100'
                    }`}>
                      {file.type === 'folder' ? '📁' :
                       file.type === 'xlsx' ? '📊' :
                       file.type === 'docx' ? '📄' :
                       '📕'}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{file.title}</span>
                  </div>
                  <div className="text-sm text-gray-600">{file.size}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{file.date}</span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Complete Notification */}
          <div className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4">
            <div className="flex-1">
              <div className="font-medium">Uploads completed</div>
              <div className="text-sm text-purple-200">
                <div>2.4 📕 2012 Historical Financials.pdf 41kb Uploaded</div>
                <div>2.5 📊 2012 Historical Financials.pdf 41kb Uploaded</div>
              </div>
            </div>
            <button className="text-purple-200 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {activeView === 'dashboard' && <DashboardView />}
      {activeView === 'ai-scouting' && <AIScouttingView />}
      {activeView === 'due-diligence' && <DueDiligenceView />}
    </div>
  );
};

export default VERSSAIMainDashboard;