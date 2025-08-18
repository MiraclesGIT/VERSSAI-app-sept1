/**
 * VERSSAI API Service
 * Connects frontend widgets to backend data sources
 */

class VERSSAIAPIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    this.backupURL = 'http://localhost:8081'; // Enhanced analytics backend
    this.isConnected = false;
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  // Connection management
  async checkConnection() {
    try {
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });
      
      if (response.ok) {
        this.isConnected = true;
        return true;
      } else {
        // Try backup URL
        const backupResponse = await fetch(`${this.backupURL}/api/health`);
        if (backupResponse.ok) {
          this.baseURL = this.backupURL;
          this.isConnected = true;
          return true;
        }
      }
    } catch (error) {
      console.warn('API connection failed, using cached/demo data:', error);
      this.isConnected = false;
    }
    return false;
  }

  // Cache management
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // API call wrapper with error handling and caching
  async apiCall(endpoint, options = {}) {
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        ...options
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the response
      this.setCache(cacheKey, data);
      
      return data;
    } catch (error) {
      console.warn(`API call to ${endpoint} failed:`, error);
      
      // Return demo data if API fails
      return this.getDemoData(endpoint);
    }
  }

  // Portfolio Analytics
  async getPortfolioAnalytics(timeframe = '6M') {
    const endpoint = `/api/analytics/portfolio?timeframe=${timeframe}`;
    const response = await this.apiCall(endpoint);
    
    return {
      success: response.success || true,
      data: response.data || this.getDefaultPortfolioData(),
      timeframe: response.timeframe || timeframe,
      last_updated: response.generated_at || new Date().toISOString()
    };
  }

  // AI Insights
  async getAIInsights() {
    const endpoint = '/api/analytics/insights';
    const response = await this.apiCall(endpoint);
    
    return {
      success: response.success || true,
      insights: response.insights || this.getDefaultInsights(),
      total_count: response.total_count || 3,
      confidence: response.ai_confidence || 'high'
    };
  }

  // Market Intelligence
  async getMarketIntelligence() {
    const endpoint = '/api/analytics/market-intelligence';
    const response = await this.apiCall(endpoint);
    
    return {
      success: response.success || true,
      market_intelligence: response.market_intelligence || this.getDefaultMarketData(),
      last_updated: response.last_updated || new Date().toISOString()
    };
  }

  // Portfolio Companies
  async getPortfolioCompanies() {
    const endpoint = '/api/portfolio/companies';
    const response = await this.apiCall(endpoint);
    
    return {
      success: response.success || true,
      companies: response.companies || this.getDefaultCompanies(),
      total_count: response.total_count || 5
    };
  }

  // Performance Dashboard
  async getPerformanceDashboard() {
    const endpoint = '/api/analytics/performance-dashboard';
    const response = await this.apiCall(endpoint);
    
    return {
      success: response.success || true,
      dashboard: response.dashboard || this.getDefaultDashboardData(),
      last_updated: response.last_updated || new Date().toISOString()
    };
  }

  // Custom Analytics
  async runCustomAnalysis(analysisRequest) {
    try {
      const response = await fetch(`${this.baseURL}/api/analytics/custom-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisRequest)
      });

      if (!response.ok) {
        throw new Error(`Custom analysis failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Custom analysis failed:', error);
      return {
        success: false,
        error: error.message,
        analysis: this.getDefaultAnalysisResult(analysisRequest)
      };
    }
  }

  // Real-time data streaming
  connectWebSocket(onMessage, onError) {
    try {
      const wsUrl = this.baseURL.replace('http', 'ws') + '/mcp';
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Connected to VERSSAI WebSocket');
        this.isConnected = true;
        if (onMessage) onMessage({ type: 'connected', status: 'WebSocket connected' });
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
        if (onError) onError(error);
      };
      
      ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.isConnected = false;
        // Auto-reconnect after 5 seconds
        setTimeout(() => this.connectWebSocket(onMessage, onError), 5000);
      };
      
      return ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.isConnected = false;
      if (onError) onError(error);
      return null;
    }
  }

  // Demo/Default Data Methods
  getDefaultPortfolioData() {
    return {
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
      stage_breakdown: [
        { stage: 'Pre-Seed', count: 23, valuation: 45.2, avg_risk: 0.55 },
        { stage: 'Seed', count: 45, valuation: 123.1, avg_risk: 0.42 },
        { stage: 'Series A', count: 31, valuation: 234.7, avg_risk: 0.28 },
        { stage: 'Series B+', count: 28, valuation: 444.2, avg_risk: 0.18 }
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
        },
        {
          name: 'CleanEnergy Systems',
          sector: 'CleanTech',
          stage: 'Series A',
          valuation: 65.0,
          invested: 8.0,
          multiple: 8.1,
          performance_data: { arr: 12.8, growth_rate: 123, burn_rate: 1.1, runway_months: 22, team_size: 58 },
          risk_score: 0.30
        },
        {
          name: 'EduTech Pro',
          sector: 'EdTech',
          stage: 'Pre-Seed',
          valuation: 4.5,
          invested: 0.75,
          multiple: 6.0,
          performance_data: { arr: 0.4, growth_rate: 189, burn_rate: 0.15, runway_months: 15, team_size: 12 },
          risk_score: 0.55
        }
      ]
    };
  }

  getDefaultInsights() {
    return [
      {
        id: 'insight_001',
        type: 'opportunity',
        priority: 'high',
        title: 'Follow-on Opportunity: MedAI Corp',
        description: 'Exceptional 156% growth rate with strong market position. Our analysis shows similar companies achieved 3.2x returns on follow-on rounds.',
        confidence: 94,
        action_items: ['Schedule follow-up meeting', 'Prepare term sheet', 'Connect with strategic partners'],
        timeline: '1 week',
        impact: 'High',
        tags: ['Follow-on', 'HealthTech', 'High Growth']
      },
      {
        id: 'insight_002',
        type: 'risk',
        priority: 'medium',
        title: 'Portfolio Concentration Risk',
        description: 'AI/ML sector represents 38% of portfolio value. Consider diversification strategies to reduce sector-specific risk exposure.',
        confidence: 87,
        action_items: ['Review allocation strategy', 'Identify diversification targets', 'Assess market correlation risks'],
        timeline: '2 weeks',
        impact: 'Medium',
        tags: ['Risk Management', 'Diversification', 'AI/ML']
      },
      {
        id: 'insight_003',
        type: 'performance',
        priority: 'high',
        title: 'Exceptional Performance: DataFoundry AI',
        description: 'Achieved 9x return with strong technical moats and market leadership. Consider strategic partnership opportunities.',
        confidence: 96,
        action_items: ['Connect with strategic partners', 'Evaluate IPO readiness', 'Enhance board engagement'],
        timeline: '1 week',
        impact: 'High',
        tags: ['High Performance', 'Strategic Partnerships', 'AI/ML']
      }
    ];
  }

  getDefaultMarketData() {
    return {
      sectors: [
        { name: 'AI/ML', growth: 34.5, deals: 156, avgValuation: 12.4, sentiment: 'bullish' },
        { name: 'FinTech', growth: 18.2, deals: 89, avgValuation: 8.7, sentiment: 'positive' },
        { name: 'HealthTech', growth: 28.1, deals: 67, avgValuation: 15.2, sentiment: 'bullish' },
        { name: 'CleanTech', growth: 45.3, deals: 34, avgValuation: 9.8, sentiment: 'bullish' },
        { name: 'EdTech', growth: 12.4, deals: 23, avgValuation: 6.1, sentiment: 'neutral' }
      ],
      market_summary: {
        total_deals: 369,
        avg_growth: 27.7,
        hot_sectors: ['AI/ML', 'CleanTech', 'HealthTech'],
        market_sentiment: 'positive'
      },
      emerging_trends: [
        { trend: 'AI Infrastructure', momentum: 'high', confidence: 92 },
        { trend: 'Vertical SaaS', momentum: 'medium', confidence: 78 },
        { trend: 'Quantum Computing', momentum: 'emerging', confidence: 65 },
        { trend: 'Web3 Infrastructure', momentum: 'cooling', confidence: 81 }
      ]
    };
  }

  getDefaultCompanies() {
    return [
      {
        id: 'comp_001',
        name: 'DataFoundry AI',
        legal_name: 'DataFoundry AI Inc.',
        stage: 'Series A',
        sector: 'AI/ML',
        sub_sector: 'Infrastructure',
        valuation: 45.0,
        investment_amount: 5.0,
        multiple: 9.0,
        founded_date: '2022-03-15',
        headquarters_city: 'San Francisco',
        headquarters_country: 'USA',
        employee_count: 42,
        website: 'datafoundry.ai',
        description: 'AI infrastructure platform for enterprise data processing',
        performance_metrics: {
          arr: 8.5,
          growth_rate: 156,
          burn_rate: 0.8,
          runway_months: 24,
          team_size: 42,
          customer_count: 28,
          revenue_growth: '156%'
        },
        risk_score: 0.25,
        esg_score: 0.78
      },
      {
        id: 'comp_002',
        name: 'MedAI Corp',
        legal_name: 'Medical AI Corporation',
        stage: 'Series B',
        sector: 'HealthTech',
        sub_sector: 'AI Diagnostics',
        valuation: 120.0,
        investment_amount: 12.0,
        multiple: 10.0,
        founded_date: '2021-08-10',
        headquarters_city: 'Boston',
        headquarters_country: 'USA',
        employee_count: 87,
        website: 'medai.com',
        description: 'AI-powered medical diagnostic platform',
        performance_metrics: {
          arr: 25.3,
          growth_rate: 89,
          burn_rate: 1.8,
          runway_months: 28,
          team_size: 87,
          customer_count: 156,
          revenue_growth: '89%'
        },
        risk_score: 0.15,
        esg_score: 0.85
      }
    ];
  }

  getDefaultDashboardData() {
    return {
      portfolio: this.getDefaultPortfolioData(),
      insights: this.getDefaultInsights(),
      market: this.getDefaultMarketData(),
      performance_metrics: {
        total_irr: 24.5,
        cash_on_cash: 2.8,
        fund_deployment: 78.3,
        portfolio_companies_count: 127,
        exits_ytd: 3,
        follow_on_rate: 42.1
      },
      risk_metrics: {
        portfolio_var: 15.2,
        concentration_risk: 'medium',
        liquidity_risk: 'low',
        market_correlation: 0.67
      },
      recent_activity: [
        {
          type: 'investment',
          company: 'DataFoundry AI',
          amount: 5.0,
          date: '2024-08-15',
          stage: 'Series A'
        },
        {
          type: 'follow-on',
          company: 'MedAI Corp',
          amount: 3.2,
          date: '2024-08-12',
          stage: 'Series B'
        },
        {
          type: 'exit',
          company: 'TechFlow Solutions',
          multiple: 4.2,
          date: '2024-08-10',
          acquirer: 'Enterprise Corp'
        }
      ]
    };
  }

  getDefaultAnalysisResult(request) {
    return {
      metric_type: request.metric_type,
      timeframe: request.timeframe,
      filters_applied: request.filters,
      analysis_results: {
        summary: 'Custom analysis completed using demo data',
        data_points: 1247,
        insights_generated: 3,
        confidence_score: 0.89
      },
      recommendations: [
        'Consider increasing allocation to AI/ML sector based on performance trends',
        'Monitor portfolio concentration risk in high-growth sectors',
        'Evaluate follow-on opportunities in top-performing companies'
      ]
    };
  }

  // Demo data endpoint mapping
  getDemoData(endpoint) {
    const endpointMap = {
      '/api/analytics/portfolio': { success: true, data: this.getDefaultPortfolioData() },
      '/api/analytics/insights': { success: true, insights: this.getDefaultInsights() },
      '/api/analytics/market-intelligence': { success: true, market_intelligence: this.getDefaultMarketData() },
      '/api/portfolio/companies': { success: true, companies: this.getDefaultCompanies() },
      '/api/analytics/performance-dashboard': { success: true, dashboard: this.getDefaultDashboardData() }
    };

    return endpointMap[endpoint] || { success: false, error: 'Unknown endpoint' };
  }

  // Utility methods for widget data formatting
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(amount);
  }

  formatPercentage(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }

  formatNumber(value) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(value);
  }

  // Widget-specific data processors
  processPortfolioData(rawData) {
    if (!rawData || !rawData.portfolio_summary) return this.getDefaultPortfolioData();
    
    return {
      ...rawData,
      portfolio_summary: {
        ...rawData.portfolio_summary,
        formatted_values: {
          total_valuation: this.formatCurrency(rawData.portfolio_summary.total_valuation),
          total_invested: this.formatCurrency(rawData.portfolio_summary.total_invested),
          total_return: this.formatPercentage(rawData.portfolio_summary.total_return)
        }
      }
    };
  }

  processInsightsData(rawData) {
    if (!Array.isArray(rawData)) return this.getDefaultInsights();
    
    return rawData.map(insight => ({
      ...insight,
      formatted_confidence: this.formatPercentage(insight.confidence || 0),
      priority_color: this.getPriorityColor(insight.priority),
      type_icon: this.getInsightTypeIcon(insight.type)
    }));
  }

  getPriorityColor(priority) {
    const colors = {
      'high': 'text-red-600 bg-red-50 border-red-200',
      'medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'low': 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[priority] || colors['low'];
  }

  getInsightTypeIcon(type) {
    const icons = {
      'opportunity': 'target',
      'risk': 'shield',
      'performance': 'trending-up'
    };
    return icons[type] || 'info';
  }
}

// Export singleton instance
const verssaiAPI = new VERSSAIAPIService();
export default verssaiAPI;