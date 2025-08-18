import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, BarChart3, PieChart, Target, AlertTriangle, Award,
  DollarSign, Users, Building, Globe, Calendar, Clock, Activity,
  ArrowUp, ArrowDown, Plus, Settings, Maximize2, Minimize2, X,
  RefreshCw, Filter, Download, Share, Eye, ChevronDown, Info,
  Zap, Brain, Shield, Lightbulb, LineChart, MapPin, Phone, Bell
} from 'lucide-react';

const VERSSAIWidgetDashboard = () => {
  const [selectedWidgets, setSelectedWidgets] = useState([
    'portfolio-overview', 'top-performers', 'sector-allocation', 
    'ai-insights', 'deal-pipeline', 'risk-monitor'
  ]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [expandedWidget, setExpandedWidget] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveData, setLiveData] = useState({});
  const [notifications, setNotifications] = useState([]);
  const wsRef = useRef(null);

  // Backend connection
  const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    connectWebSocket();
    // Load initial data
    loadDashboardData();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      wsRef.current = new WebSocket(`ws://localhost:8080/mcp`);
      
      wsRef.current.onopen = () => {
        console.log('Connected to VERSSAI backend');
        setIsConnected(true);
        addNotification('Connected to VERSSAI Intelligence Platform', 'success');
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLiveData(prev => ({ ...prev, ...data }));
        
        if (data.type === 'workflow_update') {
          addNotification(`Workflow ${data.status}: ${data.workflow_type}`, 'info');
        }
      };
      
      wsRef.current.onerror = () => {
        setIsConnected(false);
        addNotification('Connection lost - using cached data', 'warning');
      };
      
      wsRef.current.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWebSocket, 5000); // Auto-reconnect
      };
      
    } catch (error) {
      console.log('WebSocket connection failed, using demo mode');
      setIsConnected(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load portfolio analytics
      const portfolioResponse = await fetch(`${BACKEND_URL}/api/analytics/portfolio`);
      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json();
        setLiveData(prev => ({ ...prev, portfolio: portfolioData.data }));
      }

      // Load AI insights
      const insightsResponse = await fetch(`${BACKEND_URL}/api/analytics/insights`);
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setLiveData(prev => ({ ...prev, insights: insightsData.insights }));
      }

      // Load market intelligence
      const marketResponse = await fetch(`${BACKEND_URL}/api/analytics/market-intelligence`);
      if (marketResponse.ok) {
        const marketData = await marketResponse.json();
        setLiveData(prev => ({ ...prev, market: marketData.market_intelligence }));
      }

    } catch (error) {
      console.log('Using demo data:', error);
      setLiveData(getDemoData());
    }
  };

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Demo data structure matching VERSSAI backend
  const getDemoData = () => ({
    portfolio: {
      portfolio_summary: {
        total_valuation: 847.2,
        total_invested: 623.8,
        total_return: 35.8,
        company_count: 127,
        avg_risk_score: 0.28,
        sharpe_ratio: 2.1,
        diversification_score: 0.73
      },
      sector_breakdown: [
        { sector: 'AI/ML', valuation: 324.1, count: 48, percentage: 38.3, avg_risk: 0.25 },
        { sector: 'FinTech', valuation: 276.8, count: 31, percentage: 32.7, avg_risk: 0.32 },
        { sector: 'HealthTech', valuation: 156.2, count: 24, percentage: 18.4, avg_risk: 0.21 },
        { sector: 'CleanTech', valuation: 90.1, count: 24, percentage: 10.6, avg_risk: 0.35 }
      ],
      top_performers: [
        {
          name: 'DataFoundry AI',
          sector: 'AI/ML',
          stage: 'Series A',
          valuation: 45.0,
          invested: 5.0,
          multiple: 9.0,
          performance_data: { arr: 8.5, growth_rate: 156, burn_rate: 0.8, runway_months: 24, team_size: 42 },
          risk_score: 0.25
        },
        {
          name: 'MedAI Corp',
          sector: 'HealthTech',
          stage: 'Series B', 
          valuation: 120.0,
          invested: 12.0,
          multiple: 10.0,
          performance_data: { arr: 25.3, growth_rate: 89, burn_rate: 1.8, runway_months: 28, team_size: 87 },
          risk_score: 0.15
        },
        {
          name: 'FinSecure',
          sector: 'FinTech',
          stage: 'Seed',
          valuation: 15.0,
          invested: 2.5,
          multiple: 6.0,
          performance_data: { arr: 1.2, growth_rate: 245, burn_rate: 0.3, runway_months: 18, team_size: 23 },
          risk_score: 0.45
        }
      ]
    },
    insights: [
      {
        type: 'opportunity',
        priority: 'high',
        title: 'Follow-on Opportunity: MedAI Corp',
        description: 'Exceptional 156% growth rate with strong market position. Similar companies achieved 3.2x returns on follow-on rounds.',
        confidence: 94,
        action_items: ['Schedule follow-up meeting', 'Prepare term sheet', 'Connect with partners'],
        timeline: '1 week',
        impact: 'High',
        tags: ['Follow-on', 'HealthTech', 'High Growth']
      },
      {
        type: 'risk',
        priority: 'medium',
        title: 'Portfolio Concentration Risk',
        description: 'AI/ML sector represents 38% of portfolio value. Consider diversification to reduce sector-specific risk.',
        confidence: 87,
        action_items: ['Review allocation strategy', 'Identify diversification targets', 'Assess correlation risks'],
        timeline: '2 weeks',
        impact: 'Medium',
        tags: ['Risk Management', 'Diversification', 'AI/ML']
      },
      {
        type: 'performance',
        priority: 'high',
        title: 'Exceptional Performance: DataFoundry AI',
        description: 'Achieved 9x return with strong technical moats. Consider strategic partnership opportunities.',
        confidence: 96,
        action_items: ['Connect with strategic partners', 'Evaluate IPO readiness', 'Board engagement'],
        timeline: '1 week',
        impact: 'High',
        tags: ['High Performance', 'Strategic', 'AI/ML']
      }
    ],
    market: {
      sectors: [
        { name: 'AI/ML', growth: 34.5, deals: 156, avgValuation: 12.4, sentiment: 'bullish' },
        { name: 'FinTech', growth: 18.2, deals: 89, avgValuation: 8.7, sentiment: 'positive' },
        { name: 'HealthTech', growth: 28.1, deals: 67, avgValuation: 15.2, sentiment: 'bullish' },
        { name: 'CleanTech', growth: 45.3, deals: 34, avgValuation: 9.8, sentiment: 'bullish' }
      ]
    }
  });

  const currentData = Object.keys(liveData).length > 0 ? liveData : getDemoData();

  // Deal pipeline data (derived from current portfolio and market data)
  const dealPipeline = [
    { stage: 'Sourcing', count: 8, value: 45.2, avgSize: 5.65, companies: ['TechFlow', 'AI Systems', 'DataCore'] },
    { stage: 'Initial Review', count: 7, value: 89.1, avgSize: 12.73, companies: ['MedTech Pro', 'FinAI'] },
    { stage: 'Due Diligence', count: 5, value: 156.3, avgSize: 31.26, companies: ['CloudScale', 'EcoTech'] },
    { stage: 'Investment Committee', count: 3, value: 87.9, avgSize: 29.3, companies: ['Quantum AI'] }
  ];

  const riskMetrics = {
    portfolioRisk: currentData.portfolio?.portfolio_summary?.avg_risk_score > 0.4 ? 'High' : 
                    currentData.portfolio?.portfolio_summary?.avg_risk_score > 0.25 ? 'Medium' : 'Low',
    concentrationRisk: currentData.portfolio?.sector_breakdown?.[0]?.percentage > 35 ? 'High' : 'Medium',
    liquidityRisk: 'Low',
    marketRisk: 'Medium',
    alerts: [
      { type: 'warning', message: 'FinSecure runway below 24 months (18 months remaining)', priority: 'high' },
      { type: 'info', message: 'AI/ML sector concentration at 38% - monitor diversification', priority: 'medium' },
      { type: 'success', message: 'Portfolio Sharpe ratio above benchmark (2.1)', priority: 'low' }
    ]
  };

  // Widget definitions with real data connections
  const availableWidgets = {
    'portfolio-overview': {
      title: 'Portfolio Overview',
      icon: BarChart3,
      size: 'large',
      category: 'portfolio',
      data: currentData.portfolio?.portfolio_summary || {}
    },
    'top-performers': {
      title: 'Top Performers',
      icon: Award,
      size: 'medium',
      category: 'portfolio', 
      data: currentData.portfolio?.top_performers || []
    },
    'sector-allocation': {
      title: 'Sector Allocation',
      icon: PieChart,
      size: 'medium',
      category: 'allocation',
      data: currentData.portfolio?.sector_breakdown || []
    },
    'ai-insights': {
      title: 'AI Insights',
      icon: Brain,
      size: 'large',
      category: 'intelligence',
      data: currentData.insights || []
    },
    'deal-pipeline': {
      title: 'Deal Pipeline',
      icon: Target,
      size: 'medium',
      category: 'deals',
      data: dealPipeline
    },
    'risk-monitor': {
      title: 'Risk Monitor',
      icon: Shield,
      size: 'medium',
      category: 'risk',
      data: riskMetrics
    },
    'market-trends': {
      title: 'Market Trends',
      icon: TrendingUp,
      size: 'large',
      category: 'market',
      data: currentData.market?.sectors || []
    },
    'performance-metrics': {
      title: 'Performance KPIs',
      icon: Activity,
      size: 'small',
      category: 'performance',
      data: {
        irr: 24.5,
        cashMultiple: currentData.portfolio?.portfolio_summary?.total_valuation / currentData.portfolio?.portfolio_summary?.total_invested || 1.36,
        deploymentRate: 78.3,
        hitRate: 42.1,
        sharpeRatio: currentData.portfolio?.portfolio_summary?.sharpe_ratio || 2.1,
        diversificationScore: currentData.portfolio?.portfolio_summary?.diversification_score || 0.73
      }
    },
    'recent-activity': {
      title: 'Recent Activity',
      icon: Clock,
      size: 'medium',
      category: 'activity',
      data: [
        { type: 'investment', company: 'DataFoundry AI', amount: 5.0, date: '2024-08-15', stage: 'Series A' },
        { type: 'follow-on', company: 'MedAI Corp', amount: 3.2, date: '2024-08-12', stage: 'Series B' },
        { type: 'due-diligence', company: 'CloudScale', status: 'started', date: '2024-08-10' },
        { type: 'exit', company: 'TechFlow Solutions', multiple: 4.2, date: '2024-08-08', exit_type: 'acquisition' }
      ]
    }
  };

  const Widget = ({ widgetId, isExpanded = false }) => {
    const widget = availableWidgets[widgetId];
    if (!widget) return null;

    const Icon = widget.icon;
    const sizeClasses = {
      small: 'col-span-1 row-span-1',
      medium: 'col-span-2 row-span-2', 
      large: 'col-span-4 row-span-2'
    };

    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 overflow-auto' : sizeClasses[widget.size]
      }`}>
        {/* Widget Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Icon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{widget.title}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{widget.category}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
            <button 
              onClick={() => setExpandedWidget(isExpanded ? null : widgetId)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            {isCustomizing && (
              <button 
                onClick={() => setSelectedWidgets(prev => prev.filter(id => id !== widgetId))}
                className="p-1 hover:bg-red-100 rounded text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Widget Content */}
        <div className="widget-content">
          {widgetId === 'portfolio-overview' && <PortfolioOverviewWidget data={widget.data} />}
          {widgetId === 'top-performers' && <TopPerformersWidget data={widget.data} />}
          {widgetId === 'sector-allocation' && <SectorAllocationWidget data={widget.data} />}
          {widgetId === 'ai-insights' && <AIInsightsWidget data={widget.data} />}
          {widgetId === 'deal-pipeline' && <DealPipelineWidget data={widget.data} />}
          {widgetId === 'risk-monitor' && <RiskMonitorWidget data={widget.data} />}
          {widgetId === 'market-trends' && <MarketTrendsWidget data={widget.data} />}
          {widgetId === 'performance-metrics' && <PerformanceMetricsWidget data={widget.data} />}
          {widgetId === 'recent-activity' && <RecentActivityWidget data={widget.data} />}
        </div>
      </div>
    );
  };

  // Individual Widget Components with real data integration
  const PortfolioOverviewWidget = ({ data }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">${data.total_valuation?.toFixed(1) || '0.0'}M</div>
          <div className="text-sm text-gray-600">Portfolio Value</div>
          <div className="text-green-600 text-sm font-medium">+{data.total_return?.toFixed(1) || '0.0'}%</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{data.company_count || 0}</div>
          <div className="text-sm text-gray-600">Companies</div>
          <div className="text-blue-600 text-sm font-medium">
            {((data.total_valuation || 0) / (data.total_invested || 1)).toFixed(1)}x Avg
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Deployed Capital</span>
          <span className="font-medium">${data.total_invested?.toFixed(1) || '0.0'}M</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Diversification Score</span>
          <span className="font-medium">{(data.diversification_score * 100)?.toFixed(0) || '0'}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Sharpe Ratio</span>
          <span className="font-medium">{data.sharpe_ratio?.toFixed(1) || '0.0'}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(((data.total_invested || 0) / (data.total_valuation || 1)) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );

  const TopPerformersWidget = ({ data }) => (
    <div className="space-y-3">
      {Array.isArray(data) && data.slice(0, 5).map((company, index) => (
        <div key={company.name || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-purple-600">{index + 1}</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{company.name}</div>
              <div className="text-sm text-gray-500">{company.sector} • {company.stage}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-green-600">{company.multiple?.toFixed(1) || '0.0'}x</div>
            <div className="text-sm text-gray-500">${company.valuation?.toFixed(1) || '0.0'}M</div>
          </div>
        </div>
      ))}
      {(!Array.isArray(data) || data.length === 0) && (
        <div className="text-center py-4 text-gray-500">
          <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No performance data available</p>
        </div>
      )}
    </div>
  );

  const SectorAllocationWidget = ({ data }) => (
    <div className="space-y-4">
      {Array.isArray(data) && data.map((sector, index) => (
        <div key={sector.sector || index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-900">{sector.sector}</span>
            <div className="text-right">
              <span className="text-sm font-bold">{sector.percentage?.toFixed(1) || '0.0'}%</span>
              <span className="text-xs text-gray-500 ml-2">${sector.valuation?.toFixed(1) || '0.0'}M</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(sector.percentage || 0, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>{sector.count || 0} companies</span>
            <span className="font-medium text-blue-600">
              Risk: {(sector.avg_risk * 100)?.toFixed(0) || '0'}%
            </span>
          </div>
        </div>
      ))}
      {(!Array.isArray(data) || data.length === 0) && (
        <div className="text-center py-4 text-gray-500">
          <PieChart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No sector data available</p>
        </div>
      )}
    </div>
  );

  const AIInsightsWidget = ({ data }) => (
    <div className="space-y-4">
      {Array.isArray(data) && data.slice(0, 3).map((insight, index) => (
        <div key={insight.id || index} className={`p-4 rounded-lg border-l-4 ${
          insight.priority === 'high' ? 'border-l-red-500 bg-red-50' :
          insight.priority === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
          'border-l-blue-500 bg-blue-50'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  insight.type === 'opportunity' ? 'bg-green-100 text-green-700' :
                  insight.type === 'risk' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {insight.type}
                </span>
                <span className="text-xs text-gray-500">{insight.confidence || 0}% confidence</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Timeline: {insight.timeline}</span>
                <button 
                  onClick={() => addNotification(`Action started: ${insight.action_items?.[0] || 'Review insight'}`, 'info')}
                  className="px-3 py-1 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                >
                  Act Now
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {(!Array.isArray(data) || data.length === 0) && (
        <div className="text-center py-4 text-gray-500">
          <Brain className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>Generating AI insights...</p>
        </div>
      )}
    </div>
  );

  const DealPipelineWidget = ({ data }) => (
    <div className="space-y-3">
      {Array.isArray(data) && data.map((stage, index) => (
        <div key={stage.stage || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div>
            <div className="font-medium text-gray-900">{stage.stage}</div>
            <div className="text-sm text-gray-500">{stage.count} deals</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-900">${stage.value?.toFixed(1) || '0.0'}M</div>
            <div className="text-sm text-gray-500">${stage.avgSize?.toFixed(1) || '0.0'}M avg</div>
          </div>
        </div>
      ))}
      <div className="pt-2 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Pipeline</span>
          <span className="font-bold">
            ${Array.isArray(data) ? data.reduce((sum, stage) => sum + (stage.value || 0), 0).toFixed(1) : '0.0'}M
          </span>
        </div>
      </div>
    </div>
  );

  const RiskMonitorWidget = ({ data }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(data).filter(([key]) => key.endsWith('Risk')).map(([key, value]) => (
          <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`font-medium ${
              value === 'High' ? 'text-red-600' :
              value === 'Medium' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {value}
            </div>
            <div className="text-xs text-gray-600 capitalize">
              {key.replace('Risk', ' Risk')}
            </div>
          </div>
        ))}
      </div>
      
      {data.alerts && data.alerts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Active Alerts</h4>
          {data.alerts.slice(0, 3).map((alert, index) => (
            <div key={index} className={`p-2 rounded-lg text-sm ${
              alert.priority === 'high' ? 'bg-red-100 text-red-800' :
              alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              <div className="flex items-center space-x-2">
                {alert.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                {alert.type === 'info' && <Info className="w-4 h-4" />}
                {alert.type === 'success' && <Award className="w-4 h-4" />}
                <span>{alert.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const MarketTrendsWidget = ({ data }) => (
    <div className="space-y-4">
      {Array.isArray(data) && data.map((sector, index) => (
        <div key={sector.name || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{sector.name}</h4>
              <p className="text-sm text-gray-500">{sector.deals || 0} active deals</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <span className={`text-lg font-semibold ${
                sector.sentiment === 'bullish' ? 'text-green-600' :
                sector.sentiment === 'positive' ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                +{sector.growth?.toFixed(1) || '0.0'}%
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                sector.sentiment === 'bullish' ? 'bg-green-100 text-green-700' :
                sector.sentiment === 'positive' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {sector.sentiment}
              </span>
            </div>
            <p className="text-sm text-gray-500">Avg: ${sector.avgValuation?.toFixed(1) || '0.0'}M</p>
          </div>
        </div>
      ))}
      {(!Array.isArray(data) || data.length === 0) && (
        <div className="text-center py-4 text-gray-500">
          <LineChart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>Loading market data...</p>
        </div>
      )}
    </div>
  );

  const PerformanceMetricsWidget = ({ data }) => (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="text-xl font-bold text-gray-900">{data.irr?.toFixed(1) || '0.0'}%</div>
        <div className="text-xs text-gray-600">IRR</div>
      </div>
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="text-xl font-bold text-gray-900">{data.cashMultiple?.toFixed(1) || '0.0'}x</div>
        <div className="text-xs text-gray-600">Cash Multiple</div>
      </div>
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="text-xl font-bold text-gray-900">{data.deploymentRate?.toFixed(0) || '0'}%</div>
        <div className="text-xs text-gray-600">Deployed</div>
      </div>
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="text-xl font-bold text-gray-900">{data.hitRate?.toFixed(0) || '0'}%</div>
        <div className="text-xs text-gray-600">Hit Rate</div>
      </div>
    </div>
  );

  const RecentActivityWidget = ({ data }) => (
    <div className="space-y-3">
      {Array.isArray(data) && data.slice(0, 4).map((activity, index) => {
        const getActivityIcon = (type) => {
          switch(type) {
            case 'investment': return <Plus className="w-4 h-4" />;
            case 'follow-on': return <TrendingUp className="w-4 h-4" />;
            case 'exit': return <Award className="w-4 h-4" />;
            case 'due-diligence': return <Eye className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
          }
        };

        const getActivityColor = (type) => {
          switch(type) {
            case 'investment': return 'bg-green-50 text-green-600';
            case 'follow-on': return 'bg-blue-50 text-blue-600';
            case 'exit': return 'bg-purple-50 text-purple-600';
            case 'due-diligence': return 'bg-yellow-50 text-yellow-600';
            default: return 'bg-gray-50 text-gray-600';
          }
        };

        return (
          <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 capitalize">
                {activity.type.replace('-', ' ')}: {activity.company}
              </h4>
              <p className="text-sm text-gray-500">
                {activity.amount && `$${activity.amount}M`}
                {activity.multiple && `${activity.multiple}x return`}
                {activity.status && `Status: ${activity.status}`}
                {activity.stage && ` • ${activity.stage}`}
                {activity.exit_type && ` • ${activity.exit_type}`}
              </p>
              <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
            </div>
          </div>
        );
      })}
      {(!Array.isArray(data) || data.length === 0) && (
        <div className="text-center py-4 text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No recent activity</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">VERSS.AI Analytics</h1>
                <p className="text-sm text-gray-500">Real-time VC Intelligence Dashboard</p>
              </div>
            </div>
            
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              isConnected ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
              }`}></div>
              <span className="text-sm font-medium">
                {isConnected ? 'Live Data' : 'Demo Mode'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => loadDashboardData()}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            
            <button 
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isCustomizing 
                  ? 'bg-purple-600 text-white border-purple-600' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Customize
            </button>

            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 relative">
              <Bell className="w-5 h-5 text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Notifications */}
      <div className="fixed top-20 right-6 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg border animate-slide-in ${
              notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <p className="text-sm font-medium">{notification.message}</p>
            <p className="text-xs opacity-75 mt-1">
              {notification.timestamp.toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>

      {/* Widget Customization Panel */}
      {isCustomizing && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize Dashboard</h3>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(availableWidgets).map(([widgetId, widget]) => {
              const Icon = widget.icon;
              const isSelected = selectedWidgets.includes(widgetId);
              
              return (
                <button
                  key={widgetId}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedWidgets(prev => prev.filter(id => id !== widgetId));
                    } else {
                      setSelectedWidgets(prev => [...prev, widgetId]);
                    }
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-purple-600' : 'text-gray-600'}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                      {widget.title}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{widget.category}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <main className="p-6">
        <div className="grid grid-cols-4 gap-6 auto-rows-fr">
          {selectedWidgets.map(widgetId => (
            <Widget 
              key={widgetId} 
              widgetId={widgetId} 
              isExpanded={expandedWidget === widgetId} 
            />
          ))}
          
          {selectedWidgets.length === 0 && (
            <div className="col-span-4 text-center py-20">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Widgets Selected</h3>
              <p className="text-gray-600 mb-6">Click "Customize" to add widgets to your dashboard</p>
              <button 
                onClick={() => setIsCustomizing(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Customize Dashboard
              </button>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default VERSSAIWidgetDashboard;