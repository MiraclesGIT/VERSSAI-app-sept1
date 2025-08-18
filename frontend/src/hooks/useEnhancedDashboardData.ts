import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { verssaiMCPService, DatasetStatistics, MCPConnectionStatus, RAGSystemStatus } from '@/services/verssaiMCPService';

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  results?: any;
  error?: string;
}

export interface DashboardData {
  datasetStats: DatasetStatistics | null;
  mcpStatus: MCPConnectionStatus | null;
  ragStatus: RAGSystemStatus | null;
  workflowExecutions: Record<string, WorkflowExecution>;
  workflowLogs: any[];
  systemHealth: {
    cpu: number;
    memory: number;
    uptime: number;
  } | null;
}

export const useEnhancedDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    datasetStats: null,
    mcpStatus: null,
    ragStatus: null,
    workflowExecutions: {},
    workflowLogs: [],
    systemHealth: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  // Load initial dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [datasetStats, mcpStatus, ragStatus] = await Promise.allSettled([
        verssaiMCPService.getDatasetStatistics(),
        verssaiMCPService.getMCPStatus(),
        verssaiMCPService.getRAGStatus()
      ]);

      // Update state with successful results
      setData(prev => ({
        ...prev,
        datasetStats: datasetStats.status === 'fulfilled' ? datasetStats.value : null,
        mcpStatus: mcpStatus.status === 'fulfilled' ? mcpStatus.value : null,
        ragStatus: ragStatus.status === 'fulfilled' ? ragStatus.value : null
      }));

      // Check for any failures
      const failures = [datasetStats, mcpStatus, ragStatus].filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.warn('Some dashboard data failed to load:', failures);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      
      toast({
        title: "Connection Warning",
        description: "Some dashboard data may be outdated. Check your connection to VERSSAI backend.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      const ws = verssaiMCPService.createWebSocketConnection(
        (message) => {
          // Handle incoming WebSocket messages
          switch (message.type) {
            case 'workflow_status':
              setData(prev => ({
                ...prev,
                workflowExecutions: {
                  ...prev.workflowExecutions,
                  [message.executionId]: {
                    id: message.executionId,
                    workflowId: message.workflowId,
                    workflowName: message.workflowName,
                    status: message.status,
                    progress: message.progress,
                    startTime: message.startTime,
                    endTime: message.endTime,
                    results: message.results,
                    error: message.error
                  }
                }
              }));
              break;

            case 'workflow_log':
              setData(prev => ({
                ...prev,
                workflowLogs: [message.log, ...prev.workflowLogs.slice(0, 49)] // Keep last 50 logs
              }));
              break;

            case 'dataset_update':
              setData(prev => ({
                ...prev,
                datasetStats: message.stats
              }));
              break;

            case 'mcp_status':
              setData(prev => ({
                ...prev,
                mcpStatus: message.status
              }));
              break;

            case 'rag_status':
              setData(prev => ({
                ...prev,
                ragStatus: message.status
              }));
              break;

            case 'system_health':
              setData(prev => ({
                ...prev,
                systemHealth: message.health
              }));
              break;

            case 'error':
              console.error('WebSocket error:', message.error);
              toast({
                title: "Real-time Update Error",
                description: message.error,
                variant: "destructive"
              });
              break;

            default:
              console.log('Unknown WebSocket message type:', message.type);
          }
        },
        (error) => {
          console.error('WebSocket error:', error);
          setWsConnected(false);
        }
      );

      ws.onopen = () => {
        setWsConnected(true);
        setError(null);
      };

      ws.onclose = () => {
        setWsConnected(false);
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current = ws;

    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      setWsConnected(false);
      setError('Failed to connect to real-time updates');
    }
  }, [toast]);

  // Execute a workflow
  const executeWorkflow = useCallback(async (workflowId: string, parameters?: any) => {
    try {
      const result = await verssaiMCPService.executeWorkflow({
        workflowId,
        parameters,
        priority: 'normal'
      });

      // Add to local state immediately
      setData(prev => ({
        ...prev,
        workflowExecutions: {
          ...prev.workflowExecutions,
          [result.executionId]: {
            id: result.executionId,
            workflowId,
            workflowName: getWorkflowName(workflowId),
            status: result.status,
            progress: result.progress,
            startTime: result.startTime,
            endTime: result.endTime,
            results: result.results,
            error: result.error
          }
        }
      }));

      toast({
        title: "Workflow Started",
        description: `${getWorkflowName(workflowId)} has been queued for execution.`
      });

      return result;

    } catch (error) {
      console.error('Error executing workflow:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to execute workflow';
      
      toast({
        title: "Workflow Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  }, [toast]);

  // Cancel a workflow
  const cancelWorkflow = useCallback(async (executionId: string) => {
    try {
      await verssaiMCPService.cancelWorkflow(executionId);
      
      setData(prev => ({
        ...prev,
        workflowExecutions: {
          ...prev.workflowExecutions,
          [executionId]: {
            ...prev.workflowExecutions[executionId],
            status: 'failed',
            error: 'Cancelled by user',
            endTime: new Date().toISOString()
          }
        }
      }));

      toast({
        title: "Workflow Cancelled",
        description: "The workflow execution has been cancelled."
      });

    } catch (error) {
      console.error('Error cancelling workflow:', error);
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel the workflow.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Query the RAG system
  const queryRAG = useCallback(async (query: string, layer?: 'roof' | 'vc' | 'startup') => {
    try {
      const result = await verssaiMCPService.queryRAG(query, layer);
      return result;
    } catch (error) {
      console.error('Error querying RAG system:', error);
      toast({
        title: "Query Failed",
        description: "Failed to query the RAG system.",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  // Refresh all data
  const refreshData = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Initialize on mount
  useEffect(() => {
    loadDashboardData();
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [loadDashboardData, connectWebSocket]);

  // Periodic health check
  useEffect(() => {
    const healthCheckInterval = setInterval(async () => {
      try {
        await verssaiMCPService.healthCheck();
      } catch (error) {
        console.warn('Health check failed:', error);
        setError('Backend connection issues detected');
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, []);

  return {
    ...data,
    loading,
    error,
    wsConnected,
    executeWorkflow,
    cancelWorkflow,
    queryRAG,
    refreshData,
    // Computed values
    isSystemHealthy: data.mcpStatus?.status === 'connected' && wsConnected,
    totalActiveWorkflows: Object.values(data.workflowExecutions).filter(w => w.status === 'running').length,
    recentCompletedWorkflows: Object.values(data.workflowExecutions)
      .filter(w => w.status === 'completed')
      .sort((a, b) => new Date(b.endTime || 0).getTime() - new Date(a.endTime || 0).getTime())
      .slice(0, 5)
  };
};

// Helper function to get workflow display name
function getWorkflowName(workflowId: string): string {
  const names: Record<string, string> = {
    'founder-signal-assessment': 'Founder Signal Assessment',
    'due-diligence-automation': 'Due Diligence Automation',
    'portfolio-management': 'Portfolio Management',
    'competitive-intelligence': 'Competitive Intelligence',
    'fund-allocation-optimization': 'Fund Allocation Optimization',
    'lp-communication-automation': 'LP Communication Automation'
  };
  
  return names[workflowId] || workflowId;
}

// Hook for individual workflow status
export const useWorkflowExecution = (executionId: string) => {
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExecution = async () => {
      try {
        const result = await verssaiMCPService.getWorkflowStatus(executionId);
        setExecution({
          id: result.executionId,
          workflowId: '', // This would need to be included in the API response
          workflowName: '',
          status: result.status,
          progress: result.progress,
          startTime: result.startTime,
          endTime: result.endTime,
          results: result.results,
          error: result.error
        });
      } catch (error) {
        console.error('Error loading workflow execution:', error);
      } finally {
        setLoading(false);
      }
    };

    if (executionId) {
      loadExecution();
    }
  }, [executionId]);

  return { execution, loading };
};

// Hook for RAG system queries
export const useRAGQuery = () => {
  const [isQuerying, setIsQuerying] = useState(false);
  const { toast } = useToast();

  const query = useCallback(async (question: string, layer?: 'roof' | 'vc' | 'startup') => {
    setIsQuerying(true);
    try {
      const result = await verssaiMCPService.queryRAG(question, layer);
      return result;
    } catch (error) {
      console.error('RAG query failed:', error);
      toast({
        title: "Query Failed",
        description: "Failed to query the research database.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsQuerying(false);
    }
  }, [toast]);

  return { query, isQuerying };
};