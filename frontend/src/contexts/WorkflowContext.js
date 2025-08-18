import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkflowContext = createContext();

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

export const WorkflowProvider = ({ children }) => {
  const [ragLayers, setRagLayers] = useState([]);
  const [activeRagLayer, setActiveRagLayerState] = useState('vc');
  const [executions, setExecutions] = useState([]);
  const [n8nWorkflows, setN8nWorkflows] = useState([]);
  const [mcpConnected, setMcpConnected] = useState(false);
  
  // WebSocket connection for real-time updates
  const [ws, setWs] = useState(null);

  // Initialize RAG layers and connections
  useEffect(() => {
    // Initialize 3-Layer RAG Architecture
    const initialRagLayers = [
      {
        id: 'roof',
        name: 'Roof Layer - Global Intelligence',
        description: 'VERSSAI global intelligence for ML/DL research and datasets',
        status: 'active',
        collections: ['academic_papers', 'research_datasets', 'ml_models', 'industry_trends'],
        performance: {
          accuracy: 0.96,
          latency: 150,
          throughput: 1200
        }
      },
      {
        id: 'vc',
        name: 'VC Layer - Investor Experience',
        description: 'Customized VC-specific intelligence and fund analytics',
        status: 'active',
        collections: ['deal_flow', 'portfolio_data', 'market_analysis', 'competitor_intel'],
        performance: {
          accuracy: 0.94,
          latency: 200,
          throughput: 800
        }
      },
      {
        id: 'startup',
        name: 'Startup Layer - Founder Intelligence',
        description: 'Founder-level insights and startup-specific analytics',
        status: 'active',
        collections: ['founder_profiles', 'startup_metrics', 'pitch_decks', 'due_diligence'],
        performance: {
          accuracy: 0.92,
          latency: 250,
          throughput: 600
        }
      }
    ];

    // Initialize N8N workflows
    const initialN8nWorkflows = [
      {
        id: 'founder_signal_workflow',
        name: 'Founder Signal Assessment',
        description: 'AI-powered founder personality and success pattern analysis',
        isActive: true,
        trigger: 'webhook',
        nodes: 12,
        lastExecution: '2025-08-17T15:30:00Z'
      },
      {
        id: 'due_diligence_workflow',
        name: 'Due Diligence Automation',
        description: 'Automated document analysis and risk assessment',
        isActive: true,
        trigger: 'webhook',
        nodes: 18,
        lastExecution: '2025-08-17T14:45:00Z'
      },
      {
        id: 'portfolio_analysis_workflow',
        name: 'Portfolio Performance Analysis',
        description: 'Portfolio tracking and optimization recommendations',
        isActive: true,
        trigger: 'scheduled',
        nodes: 15,
        lastExecution: '2025-08-17T16:00:00Z'
      },
      {
        id: 'competitive_intelligence_workflow',
        name: 'Competitive Intelligence',
        description: 'Market analysis and competitor mapping',
        isActive: true,
        trigger: 'webhook',
        nodes: 20,
        lastExecution: '2025-08-17T15:15:00Z'
      },
      {
        id: 'fund_allocation_workflow',
        name: 'Fund Allocation Optimization',
        description: 'Investment allocation and risk-adjusted strategies',
        isActive: true,
        trigger: 'webhook',
        nodes: 14,
        lastExecution: '2025-08-17T13:30:00Z'
      },
      {
        id: 'lp_communication_workflow',
        name: 'LP Communication Automation',
        description: 'Automated reporting and LP communication',
        isActive: true,
        trigger: 'scheduled',
        nodes: 10,
        lastExecution: '2025-08-17T12:00:00Z'
      }
    ];

    setRagLayers(initialRagLayers);
    setN8nWorkflows(initialN8nWorkflows);

    // Initialize WebSocket connection for MCP
    initializeWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const initializeWebSocket = () => {
    const wsUrl = process.env.REACT_APP_MCP_WEBSOCKET_URL || 'ws://localhost:3000';
    
    try {
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log('MCP WebSocket connected');
        setMcpConnected(true);
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      websocket.onclose = () => {
        console.log('MCP WebSocket disconnected');
        setMcpConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(initializeWebSocket, 5000);
      };

      websocket.onerror = (error) => {
        console.error('MCP WebSocket error:', error);
        setMcpConnected(false);
      };

      setWs(websocket);
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      setMcpConnected(false);
    }
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'workflow_update':
        updateExecution(data.execution_id, data.data);
        break;
      case 'rag_layer_update':
        updateRagLayer(data.layer_id, data.updates);
        break;
      case 'n8n_workflow_update':
        updateN8nWorkflow(data.workflow_id, data.updates);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  const setActiveRagLayer = (layerId) => {
    setActiveRagLayerState(layerId);
    // Send message to backend to switch RAG layer
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'set_active_rag_layer',
        layer_id: layerId
      }));
    }
  };

  const updateRagLayer = (layerId, updates) => {
    setRagLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  };

  const startWorkflow = async (workflowType, parameters) => {
    const executionId = `exec_${Date.now()}`;
    
    const newExecution = {
      id: executionId,
      workflowType,
      status: 'pending',
      progress: 0,
      startedAt: new Date().toISOString(),
      ragLayers: [activeRagLayer],
      results: null
    };

    setExecutions(prev => [...prev, newExecution]);

    // Send to backend via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'start_workflow',
        execution_id: executionId,
        workflow_type: workflowType,
        parameters,
        rag_layer: activeRagLayer
      }));
    }

    // Also trigger N8N workflow
    const n8nWorkflow = n8nWorkflows.find(w => w.id === `${workflowType}_workflow`);
    if (n8nWorkflow) {
      try {
        const n8nExecutionId = await triggerN8NWorkflow(n8nWorkflow.id, {
          execution_id: executionId,
          ...parameters
        });
        updateExecution(executionId, { n8nExecutionId });
      } catch (error) {
        console.error('Failed to trigger N8N workflow:', error);
        updateExecution(executionId, { status: 'failed' });
      }
    }

    return executionId;
  };

  const updateExecution = (executionId, updates) => {
    setExecutions(prev => prev.map(exec => 
      exec.id === executionId ? { ...exec, ...updates } : exec
    ));
  };

  const getExecution = (executionId) => {
    return executions.find(exec => exec.id === executionId) || null;
  };

  const subscribeToExecution = (executionId, callback) => {
    // Subscribe via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'subscribe_execution',
        execution_id: executionId
      }));
    }

    // Set up local subscription
    const interval = setInterval(() => {
      const execution = getExecution(executionId);
      if (execution) {
        callback(execution);
        if (execution.status === 'completed' || execution.status === 'failed') {
          clearInterval(interval);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  const triggerN8NWorkflow = async (workflowId, data) => {
    const n8nUrl = process.env.REACT_APP_N8N_URL || 'http://localhost:5678';
    const webhookUrl = `${n8nUrl}/webhook/${workflowId}`;
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`N8N workflow trigger failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.execution_id || `n8n_${Date.now()}`;
    } catch (error) {
      console.error('N8N workflow trigger error:', error);
      throw error;
    }
  };

  const updateN8nWorkflow = (workflowId, updates) => {
    setN8nWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId ? { ...workflow, ...updates } : workflow
    ));
  };

  const getN8NStatus = async () => {
    const n8nUrl = process.env.REACT_APP_N8N_URL || 'http://localhost:5678';
    
    try {
      const response = await fetch(`${n8nUrl}/healthz`);
      return response.ok;
    } catch (error) {
      console.error('N8N health check failed:', error);
      return false;
    }
  };

  const sendMCPMessage = async (message) => {
    return new Promise((resolve, reject) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        reject(new Error('MCP WebSocket not connected'));
        return;
      }

      const messageId = `msg_${Date.now()}`;
      const messageWithId = { ...message, id: messageId };

      // Set up one-time listener for response
      const handleResponse = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === messageId) {
          ws.removeEventListener('message', handleResponse);
          resolve(data);
        }
      };

      ws.addEventListener('message', handleResponse);
      ws.send(JSON.stringify(messageWithId));

      // Timeout after 30 seconds
      setTimeout(() => {
        ws.removeEventListener('message', handleResponse);
        reject(new Error('MCP message timeout'));
      }, 30000);
    });
  };

  const value = {
    ragLayers,
    activeRagLayer,
    setActiveRagLayer,
    updateRagLayer,
    executions,
    startWorkflow,
    getExecution,
    subscribeToExecution,
    n8nWorkflows,
    triggerN8NWorkflow,
    getN8NStatus,
    mcpConnected,
    sendMCPMessage,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};

export default WorkflowProvider;