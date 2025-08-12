import React, { useState, useEffect } from 'react';
import './WorkflowVisualization.css';

const WorkflowVisualization = () => {
  const [workflowState, setWorkflowState] = useState({
    currentStep: 'initialize_workflow',
    completedSteps: [],
    executionPath: [],
    stepTimings: {},
    errors: []
  });
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionId, setExecutionId] = useState(null);

  // Define the workflow steps with visual properties
  const workflowSteps = {
    initialize_workflow: {
      name: 'Initialize Workflow',
      icon: '🚀',
      description: 'Start analysis pipeline',
      position: { x: 100, y: 200 },
      color: '#4CAF50'
    },
    extract_deck_data: {
      name: 'Extract Deck Data',
      icon: '📄',
      description: 'AI-powered deck parsing',
      position: { x: 300, y: 200 },
      color: '#2196F3'
    },
    web_research: {
      name: 'Web Research',
      icon: '🌐',
      description: 'Google Search API research',
      position: { x: 500, y: 150 },
      color: '#FF9800'
    },
    social_research: {
      name: 'Social Research',
      icon: '🐦',
      description: 'Twitter API analysis',
      position: { x: 500, y: 250 },
      color: '#9C27B0'
    },
    compile_research: {
      name: 'Compile Research',
      icon: '📊',
      description: 'Aggregate research data',
      position: { x: 700, y: 200 },
      color: '#607D8B'
    },
    ai_analysis: {
      name: 'AI Analysis',
      icon: '🧠',
      description: 'LLM-powered evaluation',
      position: { x: 900, y: 200 },
      color: '#E91E63'
    },
    quality_assessment: {
      name: 'Quality Assessment',
      icon: '✅',
      description: 'Confidence scoring',
      position: { x: 1100, y: 200 },
      color: '#795548'
    },
    investment_evaluation: {
      name: 'Investment Evaluation',
      icon: '💰',
      description: 'Final recommendation',
      position: { x: 1300, y: 200 },
      color: '#4CAF50'
    },
    generate_report: {
      name: 'Generate Report',
      icon: '📋',
      description: 'Comprehensive analysis',
      position: { x: 1500, y: 200 },
      color: '#3F51B5'
    },
    finalize_workflow: {
      name: 'Finalize',
      icon: '🎯',
      description: 'Complete execution',
      position: { x: 1700, y: 200 },
      color: '#009688'
    }
  };

  // Define workflow connections
  const workflowConnections = [
    { from: 'initialize_workflow', to: 'extract_deck_data' },
    { from: 'extract_deck_data', to: 'web_research' },
    { from: 'extract_deck_data', to: 'social_research' },
    { from: 'web_research', to: 'compile_research' },
    { from: 'social_research', to: 'compile_research' },
    { from: 'compile_research', to: 'ai_analysis' },
    { from: 'ai_analysis', to: 'quality_assessment' },
    { from: 'quality_assessment', to: 'investment_evaluation' },
    { from: 'investment_evaluation', to: 'generate_report' },
    { from: 'generate_report', to: 'finalize_workflow' }
  ];

  const getStepStatus = (stepId) => {
    if (workflowState.errors.some(e => e.includes(stepId))) return 'error';
    if (workflowState.completedSteps.includes(stepId)) return 'completed';
    if (workflowState.currentStep === stepId) return 'active';
    return 'pending';
  };

  const simulateWorkflowExecution = async () => {
    setIsExecuting(true);
    setExecutionId(`exec_${Date.now()}`);
    
    const steps = Object.keys(workflowSteps);
    let completedSteps = [];
    let executionPath = [];
    let stepTimings = {};
    
    for (let i = 0; i < steps.length; i++) {
      const currentStep = steps[i];
      
      setWorkflowState(prev => ({
        ...prev,
        currentStep,
        executionPath: [...executionPath, currentStep]
      }));
      
      executionPath.push(currentStep);
      
      // Simulate step execution time
      const executionTime = Math.random() * 2 + 0.5; // 0.5-2.5 seconds
      const startTime = Date.now();
      
      await new Promise(resolve => setTimeout(resolve, executionTime * 1000));
      
      const endTime = Date.now();
      stepTimings[currentStep] = (endTime - startTime) / 1000;
      completedSteps.push(currentStep);
      
      setWorkflowState(prev => ({
        ...prev,
        completedSteps: [...completedSteps],
        stepTimings: { ...stepTimings }
      }));
      
      // Small chance of error for demonstration
      if (Math.random() < 0.1 && currentStep !== 'finalize_workflow') {
        setWorkflowState(prev => ({
          ...prev,
          errors: [...prev.errors, `Error in ${currentStep}: Simulated failure`],
          currentStep: 'error'
        }));
        setIsExecuting(false);
        return;
      }
    }
    
    setIsExecuting(false);
    setWorkflowState(prev => ({
      ...prev,
      currentStep: 'completed'
    }));
  };

  const resetWorkflow = () => {
    setWorkflowState({
      currentStep: 'initialize_workflow',
      completedSteps: [],
      executionPath: [],
      stepTimings: {},
      errors: []
    });
    setIsExecuting(false);
    setExecutionId(null);
  };

  const renderWorkflowStep = (stepId) => {
    const step = workflowSteps[stepId];
    const status = getStepStatus(stepId);
    const timing = workflowState.stepTimings[stepId];

    return (
      <div
        key={stepId}
        className={`workflow-step ${status}`}
        style={{
          left: step.position.x,
          top: step.position.y,
          borderColor: step.color
        }}
      >
        <div className="step-icon" style={{ backgroundColor: step.color }}>
          {step.icon}
        </div>
        <div className="step-content">
          <div className="step-name">{step.name}</div>
          <div className="step-description">{step.description}</div>
          {timing && (
            <div className="step-timing">{timing.toFixed(2)}s</div>
          )}
          {status === 'active' && (
            <div className="step-pulse"></div>
          )}
          {status === 'error' && (
            <div className="step-error">❌</div>
          )}
          {status === 'completed' && (
            <div className="step-success">✅</div>
          )}
        </div>
      </div>
    );
  };

  const renderConnection = (connection) => {
    const fromStep = workflowSteps[connection.from];
    const toStep = workflowSteps[connection.to];
    
    const fromX = fromStep.position.x + 120; // Step width
    const fromY = fromStep.position.y + 50;  // Step height / 2
    const toX = toStep.position.x;
    const toY = toStep.position.y + 50;
    
    const isActive = workflowState.executionPath.includes(connection.from) &&
                    workflowState.executionPath.includes(connection.to);
    
    return (
      <line
        key={`${connection.from}-${connection.to}`}
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        className={`workflow-connection ${isActive ? 'active' : ''}`}
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
    );
  };

  return (
    <div className="workflow-visualization">
      <div className="workflow-header">
        <h2>🎯 LangGraph Workflow Visualization</h2>
        <p>ADHD-Friendly Visual Workflow Representation</p>
        
        <div className="workflow-controls">
          <button 
            onClick={simulateWorkflowExecution} 
            disabled={isExecuting}
            className="control-btn primary"
          >
            {isExecuting ? '⏳ Executing...' : '🚀 Start Workflow'}
          </button>
          
          <button 
            onClick={resetWorkflow}
            disabled={isExecuting}
            className="control-btn secondary"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      <div className="workflow-canvas">
        <svg className="workflow-svg" width="1800" height="400">
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
            </marker>
          </defs>
          
          {/* Render connections */}
          {workflowConnections.map(renderConnection)}
        </svg>
        
        {/* Render workflow steps */}
        {Object.keys(workflowSteps).map(renderWorkflowStep)}
      </div>

      <div className="workflow-sidebar">
        <div className="execution-info">
          <h3>📊 Execution Info</h3>
          {executionId && (
            <div className="execution-id">ID: {executionId}</div>
          )}
          <div className="current-step">
            Current: {workflowState.currentStep.replace(/_/g, ' ').toUpperCase()}
          </div>
          <div className="progress">
            Progress: {workflowState.completedSteps.length}/{Object.keys(workflowSteps).length}
          </div>
        </div>

        <div className="step-details">
          <h3>🔍 Step Details</h3>
          {workflowState.executionPath.map((stepId, index) => (
            <div key={index} className="step-detail">
              <span className="step-icon">{workflowSteps[stepId]?.icon}</span>
              <span className="step-name">{workflowSteps[stepId]?.name}</span>
              {workflowState.stepTimings[stepId] && (
                <span className="step-time">{workflowState.stepTimings[stepId].toFixed(2)}s</span>
              )}
            </div>
          ))}
        </div>

        {workflowState.errors.length > 0 && (
          <div className="error-log">
            <h3>❌ Errors</h3>
            {workflowState.errors.map((error, index) => (
              <div key={index} className="error-item">
                {error}
              </div>
            ))}
          </div>
        )}

        <div className="workflow-legend">
          <h3>🎨 Status Legend</h3>
          <div className="legend-item">
            <div className="legend-color pending"></div>
            <span>Pending</span>
          </div>
          <div className="legend-item">
            <div className="legend-color active"></div>
            <span>Active</span>
          </div>
          <div className="legend-item">
            <div className="legend-color completed"></div>
            <span>Completed</span>
          </div>
          <div className="legend-item">
            <div className="legend-color error"></div>
            <span>Error</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowVisualization;