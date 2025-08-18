import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart3, 
  Target, 
  Shield, 
  Users, 
  TrendingUp,
  MessageSquare,
  Zap,
  Database,
  Settings,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Brain,
  Network,
  FileSearch,
  Briefcase,
  PieChart,
  UserCheck,
  Monitor,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// VERSSAI Workflow Definitions with Real IDs
const VERSSAI_WORKFLOWS = [
  {
    id: 'founder-signal-assessment',
    name: 'Founder Signal Assessment',
    description: 'AI personality analysis and success pattern matching from research data',
    icon: UserCheck,
    color: 'bg-blue-500',
    endpoint: '/api/workflows/founder-assessment',
    estimatedTime: '2-3 minutes'
  },
  {
    id: 'due-diligence-automation',
    name: 'Due Diligence Automation',
    description: 'Document analysis, risk assessment, compliance validation',
    icon: FileSearch,
    color: 'bg-green-500',
    endpoint: '/api/workflows/due-diligence',
    estimatedTime: '5-8 minutes'
  },
  {
    id: 'portfolio-management',
    name: 'Portfolio Management',
    description: 'Performance tracking and optimization recommendations',
    icon: Briefcase,
    color: 'bg-purple-500',
    endpoint: '/api/workflows/portfolio-management',
    estimatedTime: '3-5 minutes'
  },
  {
    id: 'competitive-intelligence',
    name: 'Competitive Intelligence',
    description: 'Market analysis, competitor mapping, research positioning',
    icon: Target,
    color: 'bg-orange-500',
    endpoint: '/api/workflows/competitive-intelligence',
    estimatedTime: '4-6 minutes'
  },
  {
    id: 'fund-allocation-optimization',
    name: 'Fund Allocation Optimization',
    description: 'Investment allocation and risk-adjusted strategies',
    icon: PieChart,
    color: 'bg-indigo-500',
    endpoint: '/api/workflows/fund-allocation',
    estimatedTime: '3-4 minutes'
  },
  {
    id: 'lp-communication-automation',
    name: 'LP Communication Automation',
    description: 'Automated reporting and LP communication workflows',
    icon: MessageSquare,
    color: 'bg-teal-500',
    endpoint: '/api/workflows/lp-communication',
    estimatedTime: '2-3 minutes'
  }
];

interface WorkflowStatus {
  id: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  results?: any;
  startTime?: string;
  endTime?: string;
  executionId?: string;
}

interface DatasetStats {
  totalReferences: number;
  totalResearchers: number;
  totalCitations: number;
  totalInstitutions: number;
  avgCitationsPerPaper: number;
  openAccessRate: number;
  statisticalSignificanceRate: number;
  lastUpdated: string;
}

interface MCPStatus {
  status: 'Connected' | 'Disconnected' | 'Error';
  n8nConnection: boolean;
  ragSystemActive: boolean;
  lastHealthCheck: string;
  activeConnections: number;
}

interface RAGSystemStatus {
  roofLayer: 'active' | 'inactive' | 'error';
  vcLayer: 'active' | 'inactive' | 'error';
  startupLayer: 'active' | 'inactive' | 'error';
  totalEmbeddings: number;
  queryLatency: number;
}

const EnhancedDashboard = () => {
  const [workflowStatuses, setWorkflowStatuses] = useState<Record<string, WorkflowStatus>>({});
  const [datasetStats, setDatasetStats] = useState<DatasetStats | null>(null);
  const [mcpStatus, setMcpStatus] = useState<MCPStatus | null>(null);
  const [ragStatus, setRagStatus] = useState<RAGSystemStatus | null>(null);
  const [workflowLogs, setWorkflowLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const { toast } = useToast();

  // WebSocket connection for real-time updates
  useEffect(() => {
    let ws: WebSocket | null = null;
    
    const connectWebSocket = () => {
      try {
        // Connect to your VERSSAI MCP backend WebSocket
        ws = new WebSocket('ws://localhost:8080/ws/dashboard');
        
        ws.onopen = () => {
          setWsConnected(true);
          console.log('Connected to VERSSAI MCP WebSocket');
        };
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'workflow_status':
              setWorkflowStatuses(prev => ({
                ...prev,
                [data.workflowId]: data.status
              }));
              break;
              
            case 'dataset_stats':
              setDatasetStats(data.stats);
              break;
              
            case 'mcp_status':
              setMcpStatus(data.status);
              break;
              
            case 'rag_status':
              setRagStatus(data.status);
              break;
              
            case 'workflow_log':
              setWorkflowLogs(prev => [data.log, ...prev.slice(0, 19)]);
              break;
          }
        };
        
        ws.onclose = () => {
          setWsConnected(false);
          // Reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setWsConnected(false);
        };
        
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setWsConnected(false);
      }
    };
    
    connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load dataset statistics
      const statsResponse = await fetch('/api/dataset/stats');
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setDatasetStats(stats);
      }
      
      // Load MCP status
      const mcpResponse = await fetch('/api/mcp/status');
      if (mcpResponse.ok) {
        const mcp = await mcpResponse.json();
        setMcpStatus(mcp);
      }
      
      // Load RAG system status
      const ragResponse = await fetch('/api/rag/status');
      if (ragResponse.ok) {
        const rag = await ragResponse.json();
        setRagStatus(rag);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Connection Error",
        description: "Could not connect to VERSSAI backend. Using offline mode.",
        variant: "destructive"
      });
      
      // Set mock data for offline development
      setDatasetStats({
        totalReferences: 1157,
        totalResearchers: 2311,
        totalCitations: 38015,
        totalInstitutions: 24,
        avgCitationsPerPaper: 32.86,
        openAccessRate: 0.623,
        statisticalSignificanceRate: 0.766,
        lastUpdated: new Date().toISOString()
      });
      
      setMcpStatus({
        status: 'Connected',
        n8nConnection: true,
        ragSystemActive: true,
        lastHealthCheck: new Date().toISOString(),
        activeConnections: 3
      });
      
      setRagStatus({
        roofLayer: 'active',
        vcLayer: 'active',
        startupLayer: 'active',
        totalEmbeddings: 45678,
        queryLatency: 120
      });
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const workflow = VERSSAI_WORKFLOWS.find(w => w.id === workflowId);
      if (!workflow) return;

      // Update local status
      setWorkflowStatuses(prev => ({
        ...prev,
        [workflowId]: {
          id: workflowId,
          status: 'running',
          progress: 0,
          startTime: new Date().toISOString()
        }
      }));

      // Add to logs
      setWorkflowLogs(prev => [{
        id: Date.now(),
        workflowId,
        workflowName: workflow.name,
        timestamp: new Date().toISOString(),
        message: `Started ${workflow.name}`,
        status: 'running'
      }, ...prev.slice(0, 19)]);

      // Execute workflow via MCP backend
      const response = await fetch(workflow.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflowId,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Workflow execution failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: "Workflow Started",
        description: `${workflow.name} is now running. Estimated completion: ${workflow.estimatedTime}`,
      });

    } catch (error) {
      console.error('Error executing workflow:', error);
      
      setWorkflowStatuses(prev => ({
        ...prev,
        [workflowId]: {
          id: workflowId,
          status: 'failed',
          progress: 0,
          endTime: new Date().toISOString()
        }
      }));
      
      toast({
        title: "Workflow Failed",
        description: `Failed to start ${VERSSAI_WORKFLOWS.find(w => w.id === workflowId)?.name}`,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">VERSSAI Intelligence Platform</h1>
          <p className="text-muted-foreground">
            AI-Powered VC Intelligence with Real Academic Research Data
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={wsConnected ? "default" : "destructive"}>
            {wsConnected ? "Live" : "Offline"}
          </Badge>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Research Papers</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{datasetStats?.totalReferences.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg {datasetStats?.avgCitationsPerPaper.toFixed(1) || 0} citations each
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Researchers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{datasetStats?.totalResearchers.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              From {datasetStats?.totalInstitutions || 0} institutions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citation Network</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{datasetStats?.totalCitations.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {((datasetStats?.statisticalSignificanceRate || 0) * 100).toFixed(1)}% significant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MCP Status</CardTitle>
            <Zap className={`h-4 w-4 ${mcpStatus?.status === 'Connected' ? 'text-green-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mcpStatus?.status || 'Unknown'}</div>
            <p className="text-xs text-muted-foreground">
              {mcpStatus?.activeConnections || 0} active connections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* RAG System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>3-Layer RAG Intelligence System</span>
          </CardTitle>
          <CardDescription>
            Research-backed intelligence layers with {ragStatus?.totalEmbeddings.toLocaleString() || 0} embeddings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Roof Layer</h3>
                <Badge variant={ragStatus?.roofLayer === 'active' ? 'default' : 'secondary'}>
                  {ragStatus?.roofLayer || 'unknown'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Market & Industry Intelligence</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">VC Layer</h3>
                <Badge variant={ragStatus?.vcLayer === 'active' ? 'default' : 'secondary'}>
                  {ragStatus?.vcLayer || 'unknown'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Investment & Portfolio Analysis</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Startup Layer</h3>
                <Badge variant={ragStatus?.startupLayer === 'active' ? 'default' : 'secondary'}>
                  {ragStatus?.startupLayer || 'unknown'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Company & Founder Intelligence</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Average query latency: {ragStatus?.queryLatency || 0}ms
          </div>
        </CardContent>
      </Card>

      {/* Workflow Execution Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>VC Intelligence Workflows</span>
          </CardTitle>
          <CardDescription>
            Execute research-backed VC analysis workflows powered by N8N
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VERSSAI_WORKFLOWS.map((workflow) => {
              const IconComponent = workflow.icon;
              const status = workflowStatuses[workflow.id];
              
              return (
                <div key={workflow.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${workflow.color}`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{workflow.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{workflow.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {status?.status === 'running' && <Activity className="h-3 w-3 text-blue-500 animate-spin" />}
                      {status?.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-500" />}
                      {status?.status === 'failed' && <AlertCircle className="h-3 w-3 text-red-500" />}
                      {!status && <Clock className="h-3 w-3 text-gray-400" />}
                      <span className="text-xs text-muted-foreground">
                        {status?.status || 'Ready'} • {workflow.estimatedTime}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => executeWorkflow(workflow.id)}
                      disabled={status?.status === 'running'}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Real-time Workflow Logs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {workflowLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No workflow executions yet. Click "Run" on any workflow above to get started.
              </p>
            ) : (
              workflowLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {log.status === 'running' && <Activity className="h-4 w-4 text-blue-500 animate-spin" />}
                    {log.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {log.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <span className="text-sm">{log.message}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboard;