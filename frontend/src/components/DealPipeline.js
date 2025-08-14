import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeal } from '../contexts/DealContext';
import { 
  Search, Filter, Plus, MoreVertical, Clock, 
  CheckCircle, AlertCircle, Circle, User, Users,
  TrendingUp, Calendar, DollarSign, Award
} from 'lucide-react';

const DealPipeline = () => {
  const { deals, frameworkConfig, getFrameworkProgress, getOverallScore } = useDeal();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('uploadDate');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-300" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 font-semibold';
    if (score >= 60) return 'text-orange-500 font-semibold';
    return 'text-red-500 font-semibold';
  };

  const filteredDeals = deals
    .filter(deal => 
      deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.sector.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(deal => statusFilter === 'all' || deal.status.toLowerCase().replace(' ', '_') === statusFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'company':
          return a.company.localeCompare(b.company);
        case 'uploadDate':
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        case 'amount':
          return parseFloat(b.amount.replace(/[$M]/g, '')) - parseFloat(a.amount.replace(/[$M]/g, ''));
        default:
          return 0;
      }
    });

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deal Pipeline</h1>
            <p className="text-gray-600 mt-1">Manage and analyze your investment opportunities across all 6 frameworks</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Deal
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search deals, companies, sectors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="uploadDate">Sort by Date</option>
            <option value="company">Sort by Company</option>
            <option value="amount">Sort by Amount</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{deals.length}</div>
              <div className="text-sm text-gray-600">Total Deals</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {deals.filter(d => d.status === 'Completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {deals.filter(d => d.status === 'In Progress').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                ${deals.reduce((sum, d) => sum + parseFloat(d.amount.replace(/[$M]/g, '')), 0)}M
              </div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Deals Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Score
                </th>
                {Object.entries(frameworkConfig).map(([key, config]) => (
                  <th key={key} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">{config.icon}</span>
                      <span className="text-center leading-tight">{config.name}</span>
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeals.map((deal) => {
                const progress = getFrameworkProgress(deal.id);
                const overallScore = getOverallScore(deal.id);
                
                return (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{deal.company}</div>
                        <div className="text-sm text-gray-500">{deal.sector} • {deal.stage}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-medium text-gray-700">{deal.amount}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(deal.status.toLowerCase().replace(' ', '_'))}`}>
                            {deal.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {progress.completed}/{progress.total}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Uploaded {new Date(deal.uploadDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      {overallScore ? (
                        <div className="flex flex-col items-center">
                          <span className={`text-lg font-bold ${getScoreColor(overallScore)}`}>
                            {overallScore}%
                          </span>
                          <div className="flex items-center gap-1">
                            <Award className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">Overall</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    
                    {Object.entries(frameworkConfig).map(([key, config]) => {
                      const framework = deal.frameworks[key];
                      return (
                        <td key={key} className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {getStatusIcon(framework.status)}
                            {framework.score && (
                              <span className={`text-sm font-medium ${getScoreColor(framework.score)}`}>
                                {framework.score}%
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {deal.assignedTo.slice(0, 2).map((person, index) => (
                          <div key={index} className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {person.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        ))}
                        {deal.assignedTo.length > 2 && (
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{deal.assignedTo.length - 2}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/deal/${deal.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Analyze
                        </Link>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DealPipeline;