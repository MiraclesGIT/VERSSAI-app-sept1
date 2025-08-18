// File: frontend/src/components/EnhancedVERSSAILinearApp.tsx
// Enhanced Linear-inspired VERSSAI VC Intelligence Platform with full context integration

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
  Activity,
  Brain,
  Database,
  GitBranch,
  Layers,
  Wifi,
  WifiOff
} from 'lucide-react';

// Import contexts
import { useMultiTenant } from '../contexts/MultiTenantContext';
import { useWorkflow } from '../contexts/WorkflowContext';

interface WorkflowStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  features: string[];
  accuracy: string;
  estimatedTime: string;
  ragLayer: string;
}

const EnhancedVERSSAILinearApp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRagLayer, setSelectedRagLayer] = useState<string>('vc');
  
  // Context hooks
  const { 
    currentUser, 
    currentOrganization, 
    switchOrganization, 
    organizations 
  } = useMultiTenant();
  
  const {
    ragLayers,
    activeRagLayer,
    setActiveRagLayer,
    executions,
    startWorkflow,
    subscribeToExecution,
    n8nWorkflows,
    mcpConnected
  } = useWorkflow();

  // Enhanced workflow steps with RAG layer integration
  const workflowSteps: WorkflowStep[] = [
    {
      id: 'founder_signal',
      title: 'Founder Signal Assessment',
      subtitle: 'AI-Powered Founder Analysis',
      icon: Target,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50',
      borderColor: 'border-indigo-200',
      description: 'Deep personality analysis and success pattern matching using advanced ML models',
      features: ['Personality Assessment', 'Success Pattern Matching', 'Leadership Evaluation', 'Risk Profile Analysis'],
      accuracy: '96%',
      estimatedTime: '5-10 min',
      ragLayer: 'startup'
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
      estimatedTime: '15-30 min',
      ragLayer: 'vc'
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
      estimatedTime: '10-20 min',
      ragLayer: 'vc'
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
      estimatedTime: '8-15 min',
      ragLayer: 'roof'
    },
    {
      id: 'fund_allocation',
      title: 'Fund Allocation Optimization',
      subtitle: 'Investment Strategy',
      icon: Zap,
      color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      borderColor: 'border-yellow-200',
      description: 'Investment allocation analysis and risk-adjusted recommendations',
      features: ['Allocation Analysis', 'Risk Adjustment', 'ROI Optimization', 'Diversification Strategy'],
      accuracy: '89%',
      estimatedTime: '12-25 min',
      ragLayer: 'vc'
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
      estimatedTime: '5-12 min',
      ragLayer: 'vc'
    }
  ];

  // Get current execution status for a workflow
  const getWorkflowStatus = (workflowId: string) => {
    const workflowExecutions = executions.filter(
      exec => exec.workflowType === workflowId && 
      exec.user_id === currentUser?.id
    );
    
    if (workflowExecutions.length === 0) return 'idle';
    
    const latest = workflowExecutions[workflowExecutions.length - 1];
    return latest.status;
  };

  const getWorkflowProgress = (workflowId: string) => {
    const workflowExecutions = executions.filter(
      exec => exec.workflowType === workflowId && 
      exec.user_id === currentUser?.id
    );
    
    if (workflowExecutions.length === 0) return 0;
    
    const latest = workflowExecutions[workflowExecutions.length - 1];
    return latest.progress || 0;
  };

  // Handle workflow trigger
  const handleTriggerWorkflow = async (workflowType: string, stepIndex: number) => {
    if (!currentUser || !currentOrganization) {
      console.error('No user or organization context');
      return;
    }

    try {
      const step = workflowSteps[stepIndex];
      
      // Set active RAG layer for this workflow
      setActiveRagLayer(step.ragLayer);
      
      const parameters = {
        step_index: stepIndex,
        workflow_name: step.title,
        rag_layer: step.ragLayer,
        timestamp: new Date().toISOString(),
        user_preferences: currentUser.permissions || []
      };
      
      const executionId = await startWorkflow(workflowType, parameters);
      
      // Subscribe to updates
      subscribeToExecution(executionId, (execution) => {
        console.log(`Workflow ${workflowType} update:`, execution);
      });
      
      console.log(`Workflow ${workflowType} triggered with execution ID: ${executionId}`);
      
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
    }
  };

  // Handle RAG layer change
  const handleRagLayerChange = (layerId: string) => {
    setSelectedRagLayer(layerId);
    setActiveRagLayer(layerId);
  };

  // Status icon component
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

  // RAG layer indicator
  const RAGLayerIndicator = () => {
    const currentLayer = ragLayers.find(layer => layer.id === activeRagLayer);
    
    return (
      <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
        <Layers className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">RAG Layer:</span>
        <select
          value={selectedRagLayer}
          onChange={(e) => handleRagLayerChange(e.target.value)}
          className="text-sm font-medium bg-transparent border-none outline-none cursor-pointer"
        >
          {ragLayers.map(layer => (
            <option key={layer.id} value={layer.id}>
              {layer.name.split(' - ')[0]}
            </option>
          ))}
        </select>
        <div className={`w-2 h-2 rounded-full ${
          currentLayer?.status === 'active' ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Organization and RAG Layer Info */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ background: currentOrganization?.branding.primaryColor || '#3b82f6' }}
              >
                <span className="font-bold text-sm">V</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">VERSSAI</h1>
                <p className="text-xs text-gray-500">Enhanced v3.0.0</p>
              </div>
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              VC Intelligence Platform
            </span>
            
            {/* MCP Connection Status */}
            <div className="flex items-center space-x-1">
              {mcpConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-xs ${mcpConnected ? 'text-green-600' : 'text-red-600'}`}>
                {mcpConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* RAG Layer Indicator */}
            <RAGLayerIndicator />
            
            {/* Organization Info */}
            <span className="text-sm text-gray-600">{currentOrganization?.name}</span>
            
            {/* User Info */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {currentUser?.name.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">{currentUser?.name}</div>
                <span className="text-xs text-gray-500 bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {currentUser?.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Progress Overview with RAG Layer Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">VC Analysis Workflow</h2>
          <p className="text-gray-600 mb-4">
            Comprehensive venture capital analysis powered by 3-layer RAG architecture. 
            Complete each step for full investment intelligence.
          </p>
          
          {/* RAG Layer Performance */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {ragLayers.map(layer => (
              <div 
                key={layer.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  layer.id === activeRagLayer 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{layer.name.split(' - ')[0]}</h3>
                  <div className={`w-2 h-2 rounded-full ${
                    layer.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>
                <div className="text-sm text-gray-600 mb-2">{layer.description}</div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Accuracy: {(layer.performance.accuracy * 100).toFixed(1)}%</span>
                  <span>{layer.performance.latency}ms</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Linear-style Progress Bar */}
          <div className="flex items-center space-x-2 mb-8">
            {workflowSteps.map((step, index) => {
              const status = getWorkflowStatus(step.id);
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
        
        {/* Enhanced Workflow Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workflowSteps.map((step, index) => {
            const status = getWorkflowStatus(step.id);
            const progress = getWorkflowProgress(step.id);
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
                      style={{ width: `${progress * 100}%` }}
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
                    <div className="flex items-center space-x-2">
                      <StatusIcon status={status} />
                      {step.ragLayer && (
                        <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {step.ragLayer.charAt(0).toUpperCase() + step.ragLayer.slice(1)} Layer
                        </div>
                      )}
                    </div>
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
                        {Math.round(progress * 100)}% complete
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
        
        {/* Enhanced SuperAdmin Controls */}
        {currentUser?.role === 'SuperAdmin' && (
          <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">SuperAdmin Controls</h3>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                Enhanced v3.0.0
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">N8N Dashboard</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <Brain className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">RAG Management</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Data Sources</span>
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
            
            {/* System Status */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">System Status</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">RAG Layers:</span>
                  <span className="font-medium text-green-600">{ragLayers.length}/3 Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">N8N Workflows:</span>
                  <span className="font-medium text-green-600">{n8nWorkflows.length} Ready</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Executions:</span>
                  <span className="font-medium text-blue-600">
                    {executions.filter(e => e.status === 'running').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">MCP Status:</span>
                  <span className={`font-medium ${mcpConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {mcpConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EnhancedVERSSAILinearApp;