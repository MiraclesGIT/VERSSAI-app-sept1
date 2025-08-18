import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ScatterPlot, Scatter,
  TreeMap, RadialBarChart, RadialBar
} from 'recharts';
import { 
  Brain, Users, BookOpen, TrendingUp, Award, Globe, 
  Zap, Target, Shield, Layers, Database, Search,
  Filter, Download, Eye, RefreshCw, BarChart3,
  PieChart as PieChartIcon, Activity, ArrowUp, ArrowDown
} from 'lucide-react';

const VERSSAIDataVisualization = ({ 
  datasetStats, 
  researchInsights, 
  institutionAnalysis, 
  vcInsights,
  isVisible = true 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState('citations');
  const [animationKey, setAnimationKey] = useState(0);

  // Sample data for visualization when real data isn't available
  const sampleData = {
    yearlyTrends: [
      { year: '2020', papers: 145, citations: 4250, researchers: 89 },
      { year: '2021', papers: 156, citations: 4890, researchers: 112 },
      { year: '2022', papers: 178, citations: 5670, researchers: 134 },
      { year: '2023', papers: 189, citations: 6240, researchers: 158 },
      { year: '2024', papers: 142, citations: 4820, researchers: 97 }
    ],
    categoryDistribution: [
      { name: 'AI/ML Methods', value: 387, color: '#3B82F6' },
      { name: 'VC Decision Making', value: 298, color: '#8B5CF6' },
      { name: 'Startup Assessment', value: 245, color: '#10B981' },
      { name: 'Financial Modeling', value: 156, color: '#F59E0B' },
      { name: 'Risk Analysis', value: 71, color: '#EF4444' }
    ],
    institutionPerformance: [
      { name: 'Stanford', papers: 89, citations: 2847, hIndex: 45, country: 'USA' },
      { name: 'MIT', papers: 76, citations: 3124, hIndex: 52, country: 'USA' },
      { name: 'CMU', papers: 64, citations: 2156, hIndex: 38, country: 'USA' },
      { name: 'Berkeley', papers: 71, citations: 2634, hIndex: 41, country: 'USA' },
      { name: 'Oxford', papers: 45, citations: 1789, hIndex: 34, country: 'UK' },
      { name: 'Cambridge', papers: 52, citations: 2012, hIndex: 37, country: 'UK' }
    ],
    researcherNetwork: [
      { name: 'AI/ML', researchers: 45, avgHIndex: 28, avgFunding: 2.3 },
      { name: 'Computer Science', researchers: 38, avgHIndex: 24, avgFunding: 1.9 },
      { name: 'Economics', researchers: 29, avgHIndex: 22, avgFunding: 1.6 },
      { name: 'Engineering', researchers: 34, avgHIndex: 26, avgFunding: 2.1 },
      { name: 'Business', researchers: 18, avgHIndex: 19, avgFunding: 1.4 }
    ]
  };

  // Refresh animation
  const refreshData = () => {
    setAnimationKey(prev => prev + 1);
  };

  // Color schemes
  const colors = {
    primary: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'],
    gradient: ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B']
  };

  if (!isVisible) return null;

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {datasetStats?.total_references || 1157}
          </div>
          <div className="text-sm text-blue-700">Research Papers</div>
          <div className="text-xs text-blue-600 mt-1">
            Avg. {datasetStats?.avg_citations_per_paper?.toFixed(1) || 32.9} citations
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-purple-600" />
            <Brain className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {datasetStats?.total_researchers || 2311}
          </div>
          <div className="text-sm text-purple-700">Researchers</div>
          <div className="text-xs text-purple-600 mt-1">
            {datasetStats?.total_institutions || 24} institutions
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-green-600" />
            <Award className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-900">
            {((datasetStats?.statistical_significance_rate || 0.766) * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-green-700">Statistically Significant</div>
          <div className="text-xs text-green-600 mt-1">High research quality</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Globe className="w-8 h-8 text-orange-600" />
            <Zap className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {datasetStats?.total_citations?.toLocaleString() || '38,015'}
          </div>
          <div className="text-sm text-orange-700">Total Citations</div>
          <div className="text-xs text-orange-600 mt-1">Citation network</div>
        </div>
      </div>

      {/* Research Categories Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Research Categories Distribution</h3>
          <PieChartIcon className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-8">
          <div className="w-full lg:w-1/2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart key={animationKey}>
                <Pie
                  data={sampleData.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {sampleData.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full lg:w-1/2 space-y-3">
            {sampleData.categoryDistribution.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="text-lg font-bold text-gray-700">{category.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Yearly Trends */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Research Trends Over Time</h3>
          <BarChart3 className="w-5 h-5 text-gray-500" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart key={animationKey} data={sampleData.yearlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="papers" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              name="Papers Published"
              animationDuration={1000}
            />
            <Line 
              type="monotone" 
              dataKey="citations" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              name="Citations Received"
              animationDuration={1200}
            />
            <Line 
              type="monotone" 
              dataKey="researchers" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              name="Active Researchers"
              animationDuration={1400}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderInstitutionsTab = () => (
    <div className="space-y-6">
      {/* Institution Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Institutions</h3>
          <Award className="w-5 h-5 text-gray-500" />
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart key={animationKey} data={sampleData.institutionPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [value, name === 'papers' ? 'Papers' : name === 'citations' ? 'Citations' : 'H-Index']}
            />
            <Legend />
            <Bar dataKey="papers" fill="#3B82F6" name="Papers" animationDuration={1000} />
            <Bar dataKey="citations" fill="#8B5CF6" name="Citations" animationDuration={1200} />
            <Bar dataKey="hIndex" fill="#10B981" name="H-Index" animationDuration={1400} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Country Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Institution Distribution by Country</h3>
          <div className="space-y-3">
            {[
              { country: 'USA', institutions: 8, percentage: 33.3 },
              { country: 'Canada', institutions: 4, percentage: 16.7 },
              { country: 'UK', institutions: 3, percentage: 12.5 },
              { country: 'China', institutions: 3, percentage: 12.5 },
              { country: 'Australia', institutions: 2, percentage: 8.3 },
              { country: 'Others', institutions: 4, percentage: 16.7 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                    {item.country === 'Others' ? '🌍' : '🏛️'}
                  </div>
                  <span className="font-medium">{item.country}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{item.institutions}</span>
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-10">{item.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Specializations</h3>
          <div className="space-y-3">
            {[
              { field: 'AI/ML', count: 45, color: '#3B82F6' },
              { field: 'Computer Science', count: 38, color: '#8B5CF6' },
              { field: 'Engineering', count: 34, color: '#10B981' },
              { field: 'Economics', count: 29, color: '#F59E0B' },
              { field: 'Business', count: 18, color: '#EF4444' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="font-medium">{item.field}</span>
                </div>
                <div className="text-lg font-bold" style={{ color: item.color }}>
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderResearchersTab = () => (
    <div className="space-y-6">
      {/* Researcher Field Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Researcher Distribution by Field</h3>
          <Users className="w-5 h-5 text-gray-500" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart key={animationKey} data={sampleData.researcherNetwork}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="researchers" fill="#3B82F6" name="Researchers" animationDuration={1000} />
            <Bar dataKey="avgHIndex" fill="#8B5CF6" name="Avg H-Index" animationDuration={1200} />
            <Bar dataKey="avgFunding" fill="#10B981" name="Avg Funding (M$)" animationDuration={1400} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Researcher Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">H-Index Leaders</h3>
            <Brain className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-3">
            {[
              { name: 'Dr. Sarah Chen', hIndex: 45, field: 'AI/ML' },
              { name: 'Prof. Michael Rodriguez', hIndex: 42, field: 'CS' },
              { name: 'Dr. Lisa Wang', hIndex: 38, field: 'Engineering' },
              { name: 'Prof. James Kim', hIndex: 35, field: 'Economics' }
            ].map((researcher, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-sm">{researcher.name}</div>
                  <div className="text-xs text-gray-500">{researcher.field}</div>
                </div>
                <div className="text-lg font-bold text-purple-600">{researcher.hIndex}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Citation Leaders</h3>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            {[
              { name: 'Prof. Emily Zhang', citations: 4238, growth: '+12%' },
              { name: 'Dr. Alex Johnson', citations: 3847, growth: '+8%' },
              { name: 'Prof. Maria Santos', citations: 3562, growth: '+15%' },
              { name: 'Dr. David Lee', citations: 3124, growth: '+6%' }
            ].map((researcher, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-sm">{researcher.name}</div>
                  <div className="text-xs text-green-600">{researcher.growth}</div>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {researcher.citations.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Industry Experience</h3>
            <Target className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">With Industry Experience</span>
              <span className="text-xl font-bold text-green-600">67%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-green-500 rounded-full transition-all duration-1000" style={{ width: '67%' }}></div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">1,547</div>
                <div className="text-xs text-green-700">With Experience</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-600">764</div>
                <div className="text-xs text-gray-700">Academic Only</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVCInsightsTab = () => (
    <div className="space-y-6">
      {/* VC Investment Signals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Investment Signal Strength</h3>
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-4">
            {[
              { category: 'AI/ML Startups', signal: 89, trend: 'up' },
              { category: 'HealthTech', signal: 84, trend: 'up' },
              { category: 'FinTech', signal: 76, trend: 'stable' },
              { category: 'CleanTech', signal: 71, trend: 'up' },
              { category: 'EdTech', signal: 68, trend: 'down' }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{item.category}</span>
                  <div className="flex items-center space-x-2">
                    {item.trend === 'up' && <ArrowUp className="w-4 h-4 text-green-500" />}
                    {item.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-500" />}
                    {item.trend === 'stable' && <Activity className="w-4 h-4 text-gray-500" />}
                    <span className="font-bold text-lg">{item.signal}</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      item.signal > 80 ? 'bg-green-500' : 
                      item.signal > 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.signal}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Risk Assessment Matrix</h3>
            <Shield className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-4">
            {[
              { factor: 'Technology Risk', level: 'Low', score: 25, color: 'green' },
              { factor: 'Market Risk', level: 'Medium', score: 55, color: 'yellow' },
              { factor: 'Execution Risk', level: 'Medium', score: 45, color: 'yellow' },
              { factor: 'Competitive Risk', level: 'High', score: 75, color: 'red' },
              { factor: 'Regulatory Risk', level: 'Low', score: 30, color: 'green' }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{item.factor}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium
                    ${item.color === 'green' ? 'bg-green-100 text-green-700' :
                      item.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'}`}
                  >
                    {item.level}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      item.color === 'green' ? 'bg-green-500' :
                      item.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Opportunity Radar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Market Opportunity Assessment</h3>
          <Target className="w-5 h-5 text-blue-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              market: 'Artificial Intelligence',
              score: 92,
              factors: {
                'Market Size': 95,
                'Growth Rate': 89,
                'Research Backing': 94,
                'Competition': 78
              }
            },
            {
              market: 'Healthcare Tech',
              score: 87,
              factors: {
                'Market Size': 88,
                'Growth Rate': 86,
                'Research Backing': 91,
                'Competition': 83
              }
            },
            {
              market: 'Financial Services',
              score: 79,
              factors: {
                'Market Size': 92,
                'Growth Rate': 71,
                'Research Backing': 76,
                'Competition': 77
              }
            }
          ].map((market, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="text-center mb-4">
                <h4 className="font-semibold text-lg">{market.market}</h4>
                <div className="text-3xl font-bold text-blue-600 mt-2">{market.score}</div>
                <div className="text-sm text-gray-500">Opportunity Score</div>
              </div>
              <div className="space-y-2">
                {Object.entries(market.factors).map(([factor, score], idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{factor}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-1 bg-gray-200 rounded">
                        <div 
                          className="h-1 bg-blue-500 rounded transition-all duration-1000"
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 w-6">{score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">VERSSAI Dataset Analytics</h2>
              <p className="text-gray-600">Comprehensive VC intelligence insights and trends</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshData}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">Refresh</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: Database },
            { id: 'institutions', label: 'Institutions', icon: Globe },
            { id: 'researchers', label: 'Researchers', icon: Users },
            { id: 'vc-insights', label: 'VC Insights', icon: Zap }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${activeTab === tab.id 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'institutions' && renderInstitutionsTab()}
        {activeTab === 'researchers' && renderResearchersTab()}
        {activeTab === 'vc-insights' && renderVCInsightsTab()}
      </div>
    </div>
  );
};

export default VERSSAIDataVisualization;