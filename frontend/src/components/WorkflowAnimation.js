import React, { useState, useEffect } from 'react';
import './WorkflowAnimation.css';
import { 
  FileText, Database, Search, Twitter, Brain, Target, 
  CheckCircle, Loader, Zap, Network, GitBranch, 
  MessageSquare, TrendingUp, Shield, Award, 
  ArrowRight, Activity, Cpu, BarChart3
} from 'lucide-react';

const WorkflowAnimation = ({ analysisStage, enrichmentProgress }) => {
  const [activeNodes, setActiveNodes] = useState(new Set(['upload']));
  const [completedNodes, setCompletedNodes] = useState(new Set());
  const [dataFlow, setDataFlow] = useState([]);
  const [reasoningStep, setReasoningStep] = useState('');

  // Workflow stages configuration
  const workflowStages = {
    upload: {
      icon: FileText,
      label: 'Document Upload',
      description: 'Pitch deck received and validated',
      color: 'bg-blue-500',
      position: { x: 50, y: 100 }
    },
    extraction: {
      icon: Cpu,
      label: 'AI Text Extraction',
      description: 'Gemini Pro 1.5 extracting structured data',
      color: 'bg-purple-500',
      position: { x: 250, y: 100 }
    },
    webResearch: {
      icon: Search,
      label: 'Web Intelligence',
      description: 'Google Search API gathering market data',
      color: 'bg-green-500',
      position: { x: 450, y: 50 }
    },
    socialResearch: {
      icon: Twitter,
      label: 'Social Signals',
      description: 'Social media analysis & sentiment',
      color: 'bg-cyan-500',
      position: { x: 450, y: 150 }
    },
    ragQuery: {
      icon: Database,
      label: '3-Level RAG',
      description: 'ChromaDB knowledge retrieval',
      color: 'bg-orange-500',
      position: { x: 650, y: 100 }
    },
    aiAnalysis: {
      icon: Brain,
      label: 'Professional Analysis',
      description: 'Top Decile VC assessment generation',
      color: 'bg-red-500',
      position: { x: 850, y: 100 }
    },
    compilation: {
      icon: Target,
      label: 'Final Compilation',
      description: 'Investment recommendation synthesis',
      color: 'bg-indigo-500',
      position: { x: 1050, y: 100 }
    }
  };

  // Reasoning steps for AI analysis
  const reasoningSteps = [
    'Analyzing founder background patterns...',
    'Evaluating technical execution capability...',
    'Assessing market-founder fit alignment...',
    'Computing risk-adjusted scoring weights...',
    'Cross-referencing with 1,157 research papers...',
    'Generating investment recommendation logic...',
    'Validating professional due diligence structure...',
    'Synthesizing final VC-grade assessment...'
  ];

  // Update active nodes based on analysis stage
  useEffect(() => {
    const updateWorkflowState = () => {
      const newActive = new Set();
      const newCompleted = new Set();

      switch (analysisStage) {
        case 'extracting':
          newCompleted.add('upload');
          newActive.add('extraction');
          break;
        case 'enriching':
          newCompleted.add('upload', 'extraction');
          if (enrichmentProgress.web === 'processing') {
            newActive.add('webResearch');
          } else if (enrichmentProgress.web === 'complete') {
            newCompleted.add('webResearch');
          }
          if (enrichmentProgress.media === 'processing') {
            newActive.add('socialResearch');
          } else if (enrichmentProgress.media === 'complete') {
            newCompleted.add('socialResearch');
          }
          break;
        case 'analyzing':
          newCompleted.add('upload', 'extraction', 'webResearch', 'socialResearch');
          newActive.add('ragQuery', 'aiAnalysis');
          break;
        case 'complete':
          Object.keys(workflowStages).forEach(stage => newCompleted.add(stage));
          break;
        default:
          newActive.add('upload');
      }

      setActiveNodes(newActive);
      setCompletedNodes(newCompleted);
    };

    updateWorkflowState();
  }, [analysisStage, enrichmentProgress]);

  // Animate reasoning steps during AI analysis
  useEffect(() => {
    let interval;
    if (activeNodes.has('aiAnalysis')) {
      let stepIndex = 0;
      interval = setInterval(() => {
        setReasoningStep(reasoningSteps[stepIndex]);
        stepIndex = (stepIndex + 1) % reasoningSteps.length;
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeNodes]);

  // Animate data flows between nodes
  useEffect(() => {
    const flows = [];
    const connections = [
      ['upload', 'extraction'],
      ['extraction', 'webResearch'],
      ['extraction', 'socialResearch'],
      ['webResearch', 'ragQuery'],
      ['socialResearch', 'ragQuery'],
      ['ragQuery', 'aiAnalysis'],
      ['aiAnalysis', 'compilation']
    ];

    connections.forEach(([from, to]) => {
      if (completedNodes.has(from) && (activeNodes.has(to) || completedNodes.has(to))) {
        flows.push({ from, to, id: `${from}-${to}` });
      }
    });

    setDataFlow(flows);
  }, [activeNodes, completedNodes]);

  const NodeComponent = ({ nodeId, stage }) => {
    const Icon = stage.icon;
    const isActive = activeNodes.has(nodeId);
    const isCompleted = completedNodes.has(nodeId);
    const isUpcoming = !isActive && !isCompleted;

    return (
      <div
        className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
          isCompleted ? 'scale-90' : isActive ? 'scale-110' : 'scale-75'
        }`}
        style={{ left: stage.position.x, top: stage.position.y }}
      >
        {/* Node glow effect */}
        {isActive && (
          <div className={`absolute inset-0 rounded-xl blur-lg opacity-60 animate-pulse ${stage.color}`} />
        )}
        
        {/* Main node */}
        <div className={`relative w-20 h-20 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
          isActive ? 'active-node' : ''
        } ${
          isCompleted ? `${stage.color} border-white` :
          isActive ? `${stage.color} border-white shadow-lg` :
          'bg-gray-200 border-gray-300'
        }`}>
          {isCompleted ? (
            <CheckCircle className="w-8 h-8 text-white" />
          ) : isActive ? (
            <div className="relative">
              <Icon className="w-8 h-8 text-white" />
              <div className="absolute -inset-1">
                <div className="w-full h-full border-2 border-white/30 rounded-full animate-spin" />
              </div>
            </div>
          ) : (
            <Icon className="w-8 h-8 text-gray-500" />
          )}
        </div>

        {/* Node label */}
        <div className={`absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-center transition-opacity duration-300 ${
          isUpcoming ? 'opacity-50' : 'opacity-100'
        }`}>
          <div className="text-sm font-semibold text-gray-800 whitespace-nowrap">{stage.label}</div>
          <div className="text-xs text-gray-600 mt-1 max-w-32">{stage.description}</div>
        </div>

        {/* Processing indicator for active nodes */}
        {isActive && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-1">
              <Loader className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-xs text-blue-600 font-medium">Processing...</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const DataFlowAnimation = ({ flow }) => {
    const fromStage = workflowStages[flow.from];
    const toStage = workflowStages[flow.to];
    
    const pathData = `M ${fromStage.position.x + 40} ${fromStage.position.y} 
                      Q ${(fromStage.position.x + toStage.position.x) / 2} ${fromStage.position.y - 20} 
                      ${toStage.position.x - 40} ${toStage.position.y}`;

    return (
      <g key={flow.id}>
        {/* Path line */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="5,5"
          className="data-flow-path"
        />
        
        {/* Animated data packet */}
        <circle r="4" fill="#3b82f6" className="animate-pulse">
          <animateMotion dur="2s" repeatCount="indefinite" rotate="auto">
            <path d={pathData} />
          </animateMotion>
        </circle>
        
        {/* Arrow head */}
        <polygon
          points={`${toStage.position.x - 45},${toStage.position.y - 3} ${toStage.position.x - 35},${toStage.position.y} ${toStage.position.x - 45},${toStage.position.y + 3}`}
          fill="#3b82f6"
        />
      </g>
    );
  };

  return (
    <div className="workflow-animation w-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-8 mb-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          AI Workflow Architecture Engine
        </h3>
        <p className="text-gray-600 text-sm">Professional VC Analysis Pipeline • Powered by Gemini Pro 1.5</p>
      </div>

      {/* Main workflow visualization */}
      <div className="relative bg-white rounded-lg p-6 mb-6" style={{ height: '300px' }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {dataFlow.map(flow => (
            <DataFlowAnimation key={flow.id} flow={flow} />
          ))}
        </svg>

        {Object.entries(workflowStages).map(([nodeId, stage]) => (
          <NodeComponent key={nodeId} nodeId={nodeId} stage={stage} />
        ))}
      </div>

      {/* AI Reasoning Display */}
      {activeNodes.has('aiAnalysis') && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <Brain className="w-6 h-6 text-purple-600" />
              <div className="absolute -inset-1 border-2 border-purple-300 rounded-full animate-spin" />
            </div>
            <h4 className="font-semibold text-purple-900">AI Logic Reasoning Engine</h4>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-600 animate-pulse" />
            <span className="reasoning-text text-purple-800 text-sm font-medium">{reasoningStep}</span>
          </div>
          
          {/* Processing metrics */}
          <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <div className="font-semibold text-purple-900">1,157</div>
              <div className="text-purple-600">Research Papers</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-900">6</div>
              <div className="text-purple-600">Analysis Stages</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-900">15+</div>
              <div className="text-purple-600">Risk Factors</div>
            </div>
          </div>
        </div>
      )}

      {/* System Architecture Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-white rounded-lg p-3 text-center">
          <Database className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <div className="font-semibold text-gray-900">ChromaDB</div>
          <div className="text-green-600">3-Level RAG</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <Search className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <div className="font-semibold text-gray-900">Google API</div>
          <div className="text-blue-600">Web Research</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <Brain className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <div className="font-semibold text-gray-900">Gemini Pro</div>
          <div className="text-purple-600">AI Analysis</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <Award className="w-5 h-5 text-orange-600 mx-auto mb-1" />
          <div className="font-semibold text-gray-900">VC Grade</div>
          <div className="text-orange-600">Professional</div>
        </div>
      </div>

      {/* Progress metrics */}
      <div className="mt-4 bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Analysis Progress</span>
          <span className="text-sm text-gray-600">
            {completedNodes.size} / {Object.keys(workflowStages).length} stages
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedNodes.size / Object.keys(workflowStages).length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkflowAnimation;