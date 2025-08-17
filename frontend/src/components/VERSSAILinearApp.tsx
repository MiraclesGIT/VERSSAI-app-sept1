// File: frontend/src/components/VERSSAILinearApp.tsx
// Linear-inspired VERSSAI VC Intelligence Platform

import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Play, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Zap,
  TrendingUp,
  Shield,
  Users,
  Target,
  BarChart3,
  MessageSquare,
  Monitor,
  Activity
} from 'lucide-react';

// Types for MCP Integration
interface WorkflowStatus {
  execution_id: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  results?: any;
}

interface User {
  id: string;
  role: 'SuperAdmin' | 'VC_Partner' | 'Analyst' | 'Founder';
  name: string;
  organization: string;
  avatar?: string;
}

// MCP Service Integration
class MCPService {
  private baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
  private ws: WebSocket | null = null;
  
  async triggerWorkflow(workflowType: string, parameters: any, user: User): Promise<WorkflowStatus> {
    // For now, simulate workflow triggering since we're using WebSocket directly
    const executionId = `exec_${Date.now()}`;
    
    // Send workflow trigger via WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "trigger_workflow",
        workflow_id: workflowType,
        data: parameters,
        user_role: user.role.toLowerCase()
      }));
    }
    
    // Return mock response for now
    return {
      execution_id: executionId,
      status: 'running',
      progress: 0
    };
  }
  
  async getWorkflowStatus(executionId: string): Promise<WorkflowStatus> {
    // For now, return mock status since we're using WebSocket directly
    return {
      execution_id: executionId,
      status: 'running',
      progress: 50
    };
  }
  
  connectWebSocket(userId: string, onMessage: (data: any) => void) {
    const wsUrl = `ws://localhost:8080/ws/mcp`;
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    
    this.ws.onopen = () => console.log('MCP WebSocket connected');
    this.ws.onerror = (error) => console.error('MCP WebSocket error:', error);
  }
  
  subscribeToWorkflow(executionId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe_workflow',
        execution_id: executionId
      }));
    }
  }
}

const VERSSAILinearApp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowStatuses, setWorkflowStatuses] = useState<Record<string, WorkflowStatus>>({});
  const [user] = useState<User>({
    id: 'user_123',
    role: 'SuperAdmin',
    name: 'Alex Chen',
    organization: 'Sequoia Capital'
  });
  
  const mcpService = new MCPService();
  
  // Initialize MCP WebSocket connection
  useEffect(() => {
    mcpService.connectWebSocket(user.id, (data) => {
      if (data.type === 'workflow_update') {
        setWorkflowStatuses(prev => ({
          ...prev,
          [data.execution_id]: data.data
        }));
      }
    });
  }, [user.id]);
  
  // Enhanced workflow steps with Linear-style design
  const workflowSteps = [
    {
      id: 'founder_signal',
      title: 'Founder Signal Fit',
      subtitle: 'AI-Powered Founder Assessment',
      icon: Target,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50',
      borderColor: 'border-indigo-200',
      description: 'Deep personality analysis and success pattern matching using advanced ML models',
      features: ['Personality Assessment', 'Success Pattern Matching', 'Leadership Evaluation', 'Risk Profile Analysis'],
      accuracy: '96%',
      estimatedTime: '5-10 min'
    },
    {
      id: 'due_diligence',
      title: 'Due Diligence Automation',
      subtitle: 'Intelligent Document Analysis',
      icon: Shield,
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      bgColor: 'bg-gradient-to-br from-pink-50 to-red-50',
      borderColor: 'border-pink-200',
      description: 'Automated document processing with risk assessment and compliance checking',
      features: ['Document Analysis', 'Risk Assessment', 'Compliance Checking', 'Financial Validation'],
      accuracy: '94%',
      estimatedTime: '15-30 min'
    },
    {
      id: 'portfolio_management',
      title: 'Portfolio Management',
      subtitle: 'Performance Optimization',
      icon: BarChart3,
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      description: 'Portfolio analysis, performance tracking, and optimization recommendations',
      features: ['Performance Tracking', 'Risk Analysis', 'Optimization Recommendations', 'Scenario Modeling'],
      accuracy: '92%',
      estimatedTime: '10-20 min'
    },
    {
      id: 'competitive_intelligence',
      title: 'Competitive Intelligence',
      subtitle: 'Market Analysis & Positioning',
      icon: TrendingUp,
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      bgColor: 'bg-gradient-to-br from-teal-50 to-pink-50',
      borderColor: 'border-teal-200',
      description: 'Market analysis, competitor mapping, and strategic positioning insights',
      features: ['Competitor Analysis', 'Market Mapping', 'Strategic Positioning', 'Trend Analysis'],
      accuracy: '97%',
      estimatedTime: '8-15 min'
    },
    {
      id: 'fund_allocation',
      title: 'Fund Allocation',
      subtitle: 'Investment Optimization',
      icon: Zap,
      color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      borderColor: 'border-yellow-200',
      description: 'Investment allocation analysis and risk-adjusted recommendations',
      features: ['Allocation Analysis', 'Risk Adjustment', 'ROI Optimization', 'Diversification Strategy'],
      accuracy: '89%',
      estimatedTime: '12-25 min'
    },
    {
      id: 'lp_communication',
      title: 'LP Communication',
      subtitle: 'Automated Reporting',
      icon: MessageSquare,
      color: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      bgColor: 'bg-gradient-to-br from-purple-50 to-yellow-50',
      borderColor: 'border-purple-200',
      description: 'Automated reporting and communication workflows for Limited Partners',
      features: ['Automated Reports', 'Performance Updates', 'Compliance Documentation', 'Communication Scheduling'],
      accuracy: '91%',
      estimatedTime: '5-12 min'
    }
  ];
  
  const handleTriggerWorkflow = async (workflowType: string, stepIndex: number) => {
    try {
      const parameters = {
        step_index: stepIndex,
        timestamp: new Date().toISOString()
      };
      
      const result = await mcpService.triggerWorkflow(workflowType, parameters, user);
      
      setWorkflowStatuses(prev => ({
        ...prev,
        [result.execution_id]: result
      }));
      
      // Subscribe to workflow updates
      mcpService.subscribeToWorkflow(result.execution_id);
      
      console.log(`Workflow ${workflowType} triggered:`, result);
      
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
    }
  };
  
  const getStepStatus = (stepId: string) => {
    const executions = Object.values(workflowStatuses).filter(
      status => status.workflow_type === stepId
    );
    
    if (executions.length === 0) return 'idle';
    
    const latest = executions[executions.length - 1];
    return latest.status;
  };
  
  const getStepProgress = (stepId: string) => {
    const executions = Object.values(workflowStatuses).filter(
      status => status.workflow_type === stepId
    );
    
    if (executions.length === 0) return 0;
    
    const executions = Object.values(workflowStatuses).filter(
      status => status.workflow_type === stepId
    );
    
    if (executions.length === 0) return 0;
    
    const latest = executions[executions.length - 1];
    return latest.progress || 0;
  };
  
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Play className="w-5 h-5 text-gray-400" />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Linear-style Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">VERSSAI</h1>
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              VC Intelligence Platform
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user.organization}</span>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
              <span className="text-xs text-gray-500 bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">VC Analysis Workflow</h2>
          <p className="text-gray-600 mb-6">
            Comprehensive venture capital analysis powered by AI. Complete each step for full investment intelligence.
          </p>
          
          {/* Linear-style Progress Bar */}
          <div className="flex items-center space-x-2 mb-8">
            {workflowSteps.map((step, index) => {
              const status = getStepStatus(step.id);
              const isCompleted = status === 'completed';
              const isActive = index === currentStep;
              const isRunning = status === 'running';
              
              return (
                <React.Fragment key={step.id}>
                  <div 
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
                      ${isCompleted ? 'bg-green-500 text-white' : 
                        isRunning ? 'bg-blue-500 text-white animate-pulse' :
                        isActive ? 'bg-blue-100 text-blue-600 border-2 border-blue-500' : 
                        'bg-gray-200 text-gray-500'}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : isRunning ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div 
                      className={`h-0.5 w-12 transition-all duration-200 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
        
        {/* Workflow Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workflowSteps.map((step, index) => {
            const status = getStepStatus(step.id);
            const progress = getStepProgress(step.id);
            const IconComponent = step.icon;
            
            return (
              <div
                key={step.id}
                className={`
                  group relative bg-white rounded-xl border transition-all duration-200 hover:shadow-lg
                  ${step.borderColor} ${status === 'running' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                `}
              >
                {/* Progress Bar for Running State */}
                {status === 'running' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-xl overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
                
                <div className={`p-6 ${step.bgColor} rounded-xl`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                        style={{ background: step.color }}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.subtitle}</p>
                      </div>
                    </div>
                    <StatusIcon status={status} />
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {step.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        <span className="text-xs text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Metrics */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-500">
                        Accuracy: <span className="font-medium text-green-600">{step.accuracy}</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        Time: <span className="font-medium">{step.estimatedTime}</span>
                      </span>
                    </div>
                    {status === 'running' && (
                      <span className="text-xs text-blue-600 font-medium">
                        {progress}% complete
                      </span>
                    )}
                  </div>
                  
                  {/* Action Button */}
                  <button
                    onClick={() => handleTriggerWorkflow(step.id, index)}
                    disabled={status === 'running'}
                    className={`
                      w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg
                      font-medium text-sm transition-all duration-200
                      ${status === 'running' 
                        ? 'bg-blue-100 text-blue-600 cursor-not-allowed' : 
                        status === 'completed'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-900 text-white hover:bg-gray-800 group-hover:bg-gray-800'
                      }
                    `}
                  >
                    {status === 'running' ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : status === 'completed' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>View Results</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Start Analysis</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* SuperAdmin Controls */}
        {user.role === 'SuperAdmin' && (
          <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">SuperAdmin Controls</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">N8N Dashboard</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">System Monitoring</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">User Management</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VERSSAILinearApp;
