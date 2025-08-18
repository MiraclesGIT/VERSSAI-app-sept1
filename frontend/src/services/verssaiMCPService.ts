// VERSSAI MCP+N8N Integration Service
// Connects to the real VERSSAI backend with MCP protocol support

export interface MCPWorkflowRequest {
  workflowId: string;
  parameters?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  timeout?: number;
}

export interface MCPWorkflowResponse {
  executionId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  results?: any;
  error?: string;
  startTime: string;
  endTime?: string;
}

export interface DatasetStatistics {
  totalReferences: number;
  totalResearchers: number;
  totalCitations: number;
  totalInstitutions: number;
  avgCitationsPerPaper: number;
  openAccessRate: number;
  statisticalSignificanceRate: number;
  yearRange: string;
  topCategories: Record<string, number>;
  lastUpdated: string;
}

export interface RAGSystemStatus {
  roofLayer: {
    status: 'active' | 'inactive' | 'error';
    documentsIndexed: number;
    lastUpdate: string;
  };
  vcLayer: {
    status: 'active' | 'inactive' | 'error';
    documentsIndexed: number;
    lastUpdate: string;
  };
  startupLayer: {
    status: 'active' | 'inactive' | 'error';
    documentsIndexed: number;
    lastUpdate: string;
  };
  totalEmbeddings: number;
  queryLatency: number;
  memoryUsage: number;
}

export interface MCPConnectionStatus {
  status: 'connected' | 'disconnected' | 'error';
  n8nConnection: boolean;
  ragSystemActive: boolean;
  lastHealthCheck: string;
  activeConnections: number;
  version: string;
  uptime: number;
}

class VERSSAIMCPService {
  private baseUrl: string;
  private wsUrl: string;
  private apiKey?: string;

  constructor() {
    // Use environment variables or fallback to development URLs
    this.baseUrl = process.env.REACT_APP_VERSSAI_API_URL || 'http://localhost:8080';
    this.wsUrl = process.env.REACT_APP_VERSSAI_WS_URL || 'ws://localhost:8080';
    this.apiKey = process.env.REACT_APP_VERSSAI_API_KEY;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`VERSSAI API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Dataset and Statistics APIs
  async getDatasetStatistics(): Promise<DatasetStatistics> {
    return this.makeRequest<DatasetStatistics>('/api/dataset/stats');
  }

  async searchResearchers(query: string, filters?: any): Promise<any[]> {
    return this.makeRequest<any[]>('/api/researchers/search', {
      method: 'POST',
      body: JSON.stringify({ query, filters })
    });
  }

  async getInstitutionAnalysis(): Promise<any> {
    return this.makeRequest<any>('/api/institutions/analysis');
  }

  // MCP Connection and Health APIs
  async getMCPStatus(): Promise<MCPConnectionStatus> {
    return this.makeRequest<MCPConnectionStatus>('/api/mcp/status');
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest<{ status: string; timestamp: string }>('/api/health');
  }

  // RAG System APIs
  async getRAGStatus(): Promise<RAGSystemStatus> {
    return this.makeRequest<RAGSystemStatus>('/api/rag/status');
  }

  async queryRAG(query: string, layer?: 'roof' | 'vc' | 'startup'): Promise<any> {
    return this.makeRequest<any>('/api/rag/query', {
      method: 'POST',
      body: JSON.stringify({ query, layer })
    });
  }

  // Workflow Execution APIs
  async executeWorkflow(request: MCPWorkflowRequest): Promise<MCPWorkflowResponse> {
    const endpoint = this.getWorkflowEndpoint(request.workflowId);
    return this.makeRequest<MCPWorkflowResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async getWorkflowStatus(executionId: string): Promise<MCPWorkflowResponse> {
    return this.makeRequest<MCPWorkflowResponse>(`/api/workflows/status/${executionId}`);
  }

  async getWorkflowHistory(limit: number = 20): Promise<MCPWorkflowResponse[]> {
    return this.makeRequest<MCPWorkflowResponse[]>(`/api/workflows/history?limit=${limit}`);
  }

  // Cancel a running workflow
  async cancelWorkflow(executionId: string): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>(`/api/workflows/cancel/${executionId}`, {
      method: 'POST'
    });
  }

  // VC Intelligence Specific APIs
  async getVCInsights(startupId?: string): Promise<any> {
    const endpoint = startupId ? `/api/vc/insights/${startupId}` : '/api/vc/insights';
    return this.makeRequest<any>(endpoint);
  }

  async getMarketIntelligence(sector?: string): Promise<any> {
    const query = sector ? `?sector=${encodeURIComponent(sector)}` : '';
    return this.makeRequest<any>(`/api/vc/market-intelligence${query}`);
  }

  async getRiskAssessment(startupData: any): Promise<any> {
    return this.makeRequest<any>('/api/vc/risk-assessment', {
      method: 'POST',
      body: JSON.stringify(startupData)
    });
  }

  // WebSocket connection for real-time updates
  createWebSocketConnection(onMessage: (data: any) => void, onError?: (error: Event) => void): WebSocket {
    const ws = new WebSocket(`${this.wsUrl}/ws/dashboard`);
    
    ws.onopen = () => {
      console.log('Connected to VERSSAI MCP WebSocket');
      // Send authentication if needed
      if (this.apiKey) {
        ws.send(JSON.stringify({
          type: 'auth',
          token: this.apiKey
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (onError) {
        onError(error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
    };

    return ws;
  }

  // Helper method to get workflow endpoint
  private getWorkflowEndpoint(workflowId: string): string {
    const endpointMap: Record<string, string> = {
      'founder-signal-assessment': '/api/workflows/founder-assessment',
      'due-diligence-automation': '/api/workflows/due-diligence',
      'portfolio-management': '/api/workflows/portfolio-management',
      'competitive-intelligence': '/api/workflows/competitive-intelligence',
      'fund-allocation-optimization': '/api/workflows/fund-allocation',
      'lp-communication-automation': '/api/workflows/lp-communication'
    };

    return endpointMap[workflowId] || `/api/workflows/execute/${workflowId}`;
  }

  // N8N Integration APIs
  async getN8NStatus(): Promise<{ status: string; activeWorkflows: number }> {
    return this.makeRequest<{ status: string; activeWorkflows: number }>('/api/n8n/status');
  }

  async getN8NWorkflows(): Promise<any[]> {
    return this.makeRequest<any[]>('/api/n8n/workflows');
  }

  async triggerN8NWorkflow(workflowId: string, data: any): Promise<any> {
    return this.makeRequest<any>(`/api/n8n/trigger/${workflowId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Analytics and Reporting APIs
  async getAnalyticsDashboard(): Promise<any> {
    return this.makeRequest<any>('/api/analytics/dashboard');
  }

  async getPerformanceMetrics(): Promise<any> {
    return this.makeRequest<any>('/api/analytics/performance');
  }

  async exportWorkflowResults(executionId: string, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/workflows/export/${executionId}?format=${format}`, {
      headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }

    return response.blob();
  }
}

// Export singleton instance
export const verssaiMCPService = new VERSSAIMCPService();

// React Hook for VERSSAI MCP Integration
export const useVERSSAIMCP = () => {
  return {
    service: verssaiMCPService,
    // Add convenience methods
    executeWorkflow: (workflowId: string, parameters?: any) => 
      verssaiMCPService.executeWorkflow({ workflowId, parameters }),
    getDatasetStats: () => verssaiMCPService.getDatasetStatistics(),
    getMCPStatus: () => verssaiMCPService.getMCPStatus(),
    getRAGStatus: () => verssaiMCPService.getRAGStatus(),
    queryRAG: (query: string, layer?: 'roof' | 'vc' | 'startup') => 
      verssaiMCPService.queryRAG(query, layer)
  };
};

export default VERSSAIMCPService;