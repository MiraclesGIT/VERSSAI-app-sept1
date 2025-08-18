#!/usr/bin/env python3
"""
Complete VERSSAI Frontend Integration Script
Sets up the React frontend to work with the backend API
"""

import os
import subprocess
import json

def setup_frontend_integration():
    """Setup the complete frontend integration"""
    
    print("🚀 Setting up VERSSAI Professional Frontend Integration")
    print("=" * 60)
    
    # Check if frontend directory exists
    frontend_dir = "frontend"
    
    if not os.path.exists(frontend_dir):
        print("📁 Creating frontend directory...")
        os.makedirs(frontend_dir, exist_ok=True)
    
    # Create package.json
    package_json = {
        "name": "verssai-professional-frontend",
        "version": "1.0.0",
        "private": True,
        "dependencies": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-scripts": "5.0.1",
            "lucide-react": "^0.263.1",
            "axios": "^1.4.0",
            "tailwindcss": "^3.3.0",
            "autoprefixer": "^10.4.14",
            "postcss": "^8.4.24"
        },
        "scripts": {
            "start": "react-scripts start",
            "build": "react-scripts build",
            "test": "react-scripts test",
            "eject": "react-scripts eject"
        },
        "browserslist": {
            "production": [
                ">0.2%",
                "not dead",
                "not op_mini all"
            ],
            "development": [
                "last 1 chrome version",
                "last 1 firefox version",
                "last 1 safari version"
            ]
        }
    }
    
    with open(os.path.join(frontend_dir, "package.json"), 'w') as f:
        json.dump(package_json, f, indent=2)
    
    print("✅ Created package.json")
    
    # Create public directory and files
    public_dir = os.path.join(frontend_dir, "public")
    os.makedirs(public_dir, exist_ok=True)
    
    # Create index.html
    index_html = '''<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="VERSSAI - AI-Powered VC Intelligence Platform"
    />
    <title>VERSSAI - VC Intelligence Platform</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>'''
    
    with open(os.path.join(public_dir, "index.html"), 'w') as f:
        f.write(index_html)
    
    print("✅ Created public/index.html")
    
    # Create src directory and files
    src_dir = os.path.join(frontend_dir, "src")
    os.makedirs(src_dir, exist_ok=True)
    
    # Create index.js
    index_js = '''import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);'''
    
    with open(os.path.join(src_dir, "index.js"), 'w') as f:
        f.write(index_js)
    
    print("✅ Created src/index.js")
    
    # Create index.css with Tailwind
    index_css = '''@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}'''
    
    with open(os.path.join(src_dir, "index.css"), 'w') as f:
        f.write(index_css)
    
    print("✅ Created src/index.css")
    
    # Create App.js with API integration
    app_js = '''import React, { useState, useEffect } from 'react';
import VERSSAIProfessionalInterface from './components/VERSSAIProfessionalInterface';
import { ApiProvider } from './contexts/ApiContext';

function App() {
  return (
    <ApiProvider>
      <div className="App">
        <VERSSAIProfessionalInterface />
      </div>
    </ApiProvider>
  );
}

export default App;'''
    
    with open(os.path.join(src_dir, "App.js"), 'w') as f:
        f.write(app_js)
    
    print("✅ Created src/App.js")
    
    # Create components directory
    components_dir = os.path.join(src_dir, "components")
    os.makedirs(components_dir, exist_ok=True)
    
    # Create contexts directory
    contexts_dir = os.path.join(src_dir, "contexts")
    os.makedirs(contexts_dir, exist_ok=True)
    
    # Create API context
    api_context = '''import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  
  const apiCall = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios({
        url: `${API_BASE_URL}${endpoint}`,
        method: 'GET',
        ...options
      });
      
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      setLoading(false);
      throw err;
    }
  };
  
  // API Methods
  const getDeals = () => apiCall('/api/deals');
  
  const getAcademicStats = () => apiCall('/api/academic/stats');
  
  const validateFounder = (founderName, institution = null, field = null) => {
    const params = new URLSearchParams({ founder_name: founderName });
    if (institution) params.append('founder_institution', institution);
    if (field) params.append('founder_field', field);
    return apiCall(`/api/academic/validate-founder?${params}`);
  };
  
  const getMarketResearch = (industry, technology = null, stage = null) => {
    const params = new URLSearchParams({ industry });
    if (technology) params.append('technology', technology);
    if (stage) params.append('stage', stage);
    return apiCall(`/api/academic/market-research?${params}`);
  };
  
  const findAdvisors = (industry, expertise, minHIndex = 30) => {
    const params = new URLSearchParams({ 
      industry, 
      expertise, 
      min_h_index: minHIndex 
    });
    return apiCall(`/api/academic/find-advisors?${params}`);
  };
  
  const getCompleteAnalysis = (dealId) => {
    return apiCall(`/api/deals/${dealId}/complete-academic-analysis`);
  };
  
  const value = {
    loading,
    error,
    getDeals,
    getAcademicStats,
    validateFounder,
    getMarketResearch,
    findAdvisors,
    getCompleteAnalysis
  };
  
  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};'''
    
    with open(os.path.join(contexts_dir, "ApiContext.js"), 'w') as f:
        f.write(api_context)
    
    print("✅ Created API context")
    
    # Create enhanced component that uses real API data
    enhanced_component = '''import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import { Search, Filter, Upload, Download, Share, MoreVertical, Globe, Mail, Phone, Calendar, Users, TrendingUp, Award, Brain, BookOpen, ExternalLink, AlertTriangle, CheckCircle, Loader } from 'lucide-react';

const VERSSAIProfessionalInterface = () => {
  const [currentView, setCurrentView] = useState('scouting');
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');
  
  // API Integration
  const { 
    loading, 
    error, 
    getDeals, 
    getAcademicStats, 
    validateFounder, 
    getMarketResearch, 
    findAdvisors, 
    getCompleteAnalysis 
  } = useApi();
  
  // State for API data
  const [deals, setDeals] = useState([]);
  const [academicStats, setAcademicStats] = useState(null);
  const [startupAnalysis, setStartupAnalysis] = useState({});
  
  // Load initial data
  useEffect(() => {
    loadDeals();
    loadAcademicStats();
  }, []);
  
  const loadDeals = async () => {
    try {
      const response = await getDeals();
      setDeals(response.data || []);
    } catch (err) {
      console.error('Failed to load deals:', err);
    }
  };
  
  const loadAcademicStats = async () => {
    try {
      const response = await getAcademicStats();
      setAcademicStats(response.data);
    } catch (err) {
      console.error('Failed to load academic stats:', err);
    }
  };
  
  const loadStartupAnalysis = async (startupId) => {
    if (startupAnalysis[startupId]) return; // Already loaded
    
    try {
      const response = await getCompleteAnalysis(startupId);
      setStartupAnalysis(prev => ({
        ...prev,
        [startupId]: response.data
      }));
    } catch (err) {
      console.error('Failed to load startup analysis:', err);
    }
  };
  
  // Transform deals data to match component format
  const transformedStartups = deals.map(deal => ({
    id: deal.id,
    name: deal.company_name,
    founder: deal.founders?.[0]?.name || 'Unknown',
    stage: deal.stage,
    location: deal.location || 'Unknown',
    founders: deal.founders?.map(f => f.name) || [],
    industry: deal.industry,
    foundedDate: deal.founded_date || 'Unknown',
    readinessScore: Math.floor(Math.random() * 40) + 40, // Placeholder
    description: deal.description,
    website: deal.website || 'company.com',
    team: deal.founders?.map(f => ({
      name: f.name,
      role: f.role,
      linkedin: f.linkedin || '#'
    })) || [],
    academicIntelligence: startupAnalysis[deal.id]?.comprehensive_academic_intelligence || {
      founderValidation: { found: false, credibility: 0 },
      marketResearch: { validationScore: 0, papers: 0, momentum: 0 },
      experts: 0
    }
  }));
  
  const getStageColor = (stage) => {
    const colors = {
      'Pre-Seed': 'bg-purple-100 text-purple-700 border-purple-200',
      'Seed': 'bg-orange-100 text-orange-700 border-orange-200',
      'Series A': 'bg-green-100 text-green-700 border-green-200',
      'Series B': 'bg-blue-100 text-blue-700 border-blue-200',
      'Series C': 'bg-indigo-100 text-indigo-700 border-indigo-200'
    };
    return colors[stage] || 'bg-gray-100 text-gray-700 border-gray-200';
  };
  
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const CircularProgress = ({ score, size = 60 }) => {
    const radius = (size - 8) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={strokeDasharray}
            className={getScoreColor(score)}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-sm font-semibold ${getScoreColor(score)}`}>
          {score}%
        </div>
      </div>
    );
  };
  
  const handleStartupClick = async (startupId) => {
    setSelectedStartup(startupId);
    await loadStartupAnalysis(startupId);
  };
  
  const filteredStartups = transformedStartups.filter(startup => {
    const matchesSearch = startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         startup.founder.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         startup.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterIndustry === 'all' || startup.industry.toLowerCase().includes(filterIndustry.toLowerCase());
    return matchesSearch && matchesFilter;
  });
  
  if (loading && (!deals.length && !academicStats)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading VERSSAI Platform...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">Error loading platform: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (selectedStartup) {
    const startup = transformedStartups.find(s => s.id === selectedStartup);
    const analysis = startupAnalysis[selectedStartup];
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">V</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">VERS.AI</span>
                </div>
                <span className="text-gray-400">Hello Versatil.VC</span>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setSelectedStartup(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  ← Back
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">{startup.name.substring(0, 2)}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{startup.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="col-span-2 space-y-6">
              {/* Academic Intelligence Panel */}
              {analysis && (
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <div className="flex items-center space-x-3 mb-6">
                    <Brain className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Complete Academic Intelligence Analysis</h3>
                    {loading && <Loader className="w-4 h-4 animate-spin text-purple-600" />}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    {/* Founder Validation */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-blue-500" />
                        Founder Validation
                      </h4>
                      {analysis.founder_validations?.map((fv, index) => (
                        <div key={index} className="space-y-2">
                          <div className="text-sm font-medium">{fv.founder.name}</div>
                          {fv.validation.found_in_database ? (
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                <span>Found in academic database</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Credibility: {fv.validation.academic_credibility}%
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center text-sm">
                              <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                              <span>Not found in database</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Market Research */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <BookOpen className="w-4 h-4 mr-2 text-green-500" />
                        Market Research
                      </h4>
                      {analysis.market_analysis && (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            {analysis.market_analysis.key_papers?.length || 0} relevant papers
                          </div>
                          <div className="text-sm text-gray-600">
                            Research momentum: {analysis.market_analysis.research_momentum || 0}%
                          </div>
                          <div className="text-sm font-medium text-blue-600">
                            Validation: {analysis.market_analysis.market_validation_score || 0}%
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expert Network */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <Award className="w-4 h-4 mr-2 text-purple-500" />
                        Expert Network
                      </h4>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          {analysis.expert_recommendations?.length || 0} potential advisors
                        </div>
                        <div className="text-sm font-medium text-purple-600">
                          Overall Score: {analysis.overall_academic_score || 0}%
                        </div>
                        <div className="text-sm text-gray-600">
                          Confidence: {analysis.investment_confidence || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  {analysis.risk_assessment && analysis.risk_assessment.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium text-gray-900 mb-3">Risk Assessment</h4>
                      <div className="space-y-2">
                        {analysis.risk_assessment.map((risk, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{risk.type}</div>
                              <div className="text-sm text-gray-600">{risk.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strategic Recommendations */}
                  {analysis.strategic_recommendations && analysis.strategic_recommendations.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium text-gray-900 mb-3">Strategic Recommendations</h4>
                      <div className="space-y-2">
                        {analysis.strategic_recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{rec.category} ({rec.priority})</div>
                              <div className="text-sm text-gray-600">{rec.action}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Company Details */}
            <div className="space-y-6">
              {/* Company Header */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 text-sm">COMPANY NAME</span>
                  <span className="text-gray-500 text-sm">READINESS SCORE</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{startup.name}</h2>
                  <CircularProgress score={startup.readinessScore} size={50} />
                </div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStageColor(startup.stage)}`}>
                    {startup.stage}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">LOCATION</span>
                    <div>{startup.location}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">FOUNDED DATE</span>
                    <div>{startup.foundedDate}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{startup.description}</p>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">{startup.website}</span>
                  </button>
                </div>
              </div>

              {/* Team */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">TEAM</h3>
                <div className="space-y-4">
                  {startup.team.map((member, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">{member.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <span className="text-xl font-bold text-gray-900">VERS.AI</span>
              </div>
              <span className="text-purple-500 font-medium">AI Scouting Startups</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select 
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                >
                  <option value="all">Filter by Industry</option>
                  <option value="ai">AI & Tech</option>
                  <option value="fintech">Fintech</option>
                  <option value="education">Education</option>
                  <option value="finance">Finance</option>
                  <option value="cyber">Cyber Security</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Academic Stats Banner */}
        {academicStats && (
          <div className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Academic Intelligence Platform</h3>
                <p className="text-purple-100">Powered by {academicStats.Total_References?.toLocaleString()} research papers and {academicStats.Total_Researchers?.toLocaleString()} expert researchers</p>
              </div>
              <Brain className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        )}

        {/* Startup List */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">STARTUP</div>
            <div className="col-span-1">STAGE</div>
            <div className="col-span-2">LOCATION</div>
            <div className="col-span-2">FOUNDERS</div>
            <div className="col-span-1">INDUSTRY</div>
            <div className="col-span-1">FOUNDED DATE</div>
            <div className="col-span-1">READINESS SCORE</div>
            <div className="col-span-1"></div>
          </div>

          {/* Startup Rows */}
          <div className="divide-y divide-gray-200">
            {filteredStartups.map((startup) => (
              <div 
                key={startup.id} 
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleStartupClick(startup.id)}
              >
                <div className="col-span-3 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{startup.name.substring(0, 2)}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{startup.name}</div>
                    <div className="text-sm text-gray-500">{startup.founder}</div>
                  </div>
                </div>
                <div className="col-span-1 flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStageColor(startup.stage)}`}>
                    {startup.stage}
                  </span>
                </div>
                <div className="col-span-2 flex items-center text-sm text-gray-600">
                  {startup.location}
                </div>
                <div className="col-span-2 flex items-center text-sm text-gray-600">
                  {startup.founders.join(', ')}
                </div>
                <div className="col-span-1 flex items-center text-sm text-gray-600">
                  {startup.industry}
                </div>
                <div className="col-span-1 flex items-center text-sm text-gray-600">
                  {startup.foundedDate}
                </div>
                <div className="col-span-1 flex items-center">
                  <CircularProgress score={startup.readinessScore} size={40} />
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VERSSAIProfessionalInterface;'''
    
    with open(os.path.join(components_dir, "VERSSAIProfessionalInterface.js"), 'w') as f:
        f.write(enhanced_component)
    
    print("✅ Created enhanced component with API integration")
    
    # Create .env file for API configuration
    env_content = '''# VERSSAI Frontend Configuration
REACT_APP_API_URL=http://localhost:8080
REACT_APP_VERSION=1.0.0
REACT_APP_PLATFORM_NAME=VERSSAI Professional'''
    
    with open(os.path.join(frontend_dir, ".env"), 'w') as f:
        f.write(env_content)
    
    print("✅ Created .env configuration")
    
    # Create README
    readme_content = '''# VERSSAI Professional Frontend

This is the React frontend for the VERSSAI VC Intelligence Platform.

## Features

- Professional VC interface matching industry standards
- Real-time academic intelligence integration
- Complete deal analysis with research backing
- Expert advisor recommendations
- Market validation insights

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Make sure the backend is running on port 8080:
   ```bash
   python3 backend/complete_verssai_backend.py
   ```

## API Integration

The frontend automatically connects to the VERSSAI backend API at http://localhost:8080

Available endpoints:
- GET /api/deals - Get all deals
- GET /api/academic/stats - Get academic platform statistics  
- GET /api/academic/validate-founder - Validate founder credentials
- GET /api/deals/{id}/complete-academic-analysis - Get complete deal analysis

## Building for Production

```bash
npm run build
```
'''
    
    with open(os.path.join(frontend_dir, "README.md"), 'w') as f:
        f.write(readme_content)
    
    print("✅ Created README.md")
    
    print(f"\n🎉 FRONTEND INTEGRATION SETUP COMPLETE!")
    print(f"\n📁 Frontend Structure Created:")
    print(f"• frontend/package.json - NPM configuration")
    print(f"• frontend/public/index.html - HTML template")
    print(f"• frontend/src/App.js - Main application")
    print(f"• frontend/src/components/VERSSAIProfessionalInterface.js - Professional UI")
    print(f"• frontend/src/contexts/ApiContext.js - Backend API integration")
    print(f"• frontend/.env - Environment configuration")
    
    print(f"\n🚀 NEXT STEPS:")
    print(f"1. Install frontend dependencies:")
    print(f"   cd frontend && npm install")
    print(f"2. Start the backend:")
    print(f"   python3 backend/complete_verssai_backend.py")
    print(f"3. Start the frontend:")
    print(f"   cd frontend && npm start")
    print(f"4. Access your platform at http://localhost:3000")
    
    return True

if __name__ == "__main__":
    setup_frontend_integration()
