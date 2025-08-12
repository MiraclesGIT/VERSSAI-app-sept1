import React, { useState } from 'react';
import './LangGraphDemo.css';

const LangGraphDemo = () => {
  const [status, setStatus] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [processingResult, setProcessingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchLangGraphStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/workflows/langraph/status`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching LangGraph status:', error);
      setStatus({ error: 'Failed to fetch status' });
    }
    setLoading(false);
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/workflows/langraph/analytics`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({ error: 'Failed to fetch analytics' });
    }
    setLoading(false);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('deck_file', selectedFile);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/workflows/langraph/process-deck`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      setProcessingResult(result);
    } catch (error) {
      console.error('Error processing deck:', error);
      setProcessingResult({ error: 'Failed to process deck' });
    }
    setLoading(false);
  };

  const renderStatus = () => {
    if (!status) return null;

    return (
      <div className="status-panel">
        <h3>🚀 LangGraph Orchestrator Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <strong>Status:</strong> 
            <span className={`status-badge ${status.status}`}>{status.status}</span>
          </div>
          <div className="status-item">
            <strong>Type:</strong> {status.orchestrator_type}
          </div>
        </div>

        <div className="features-section">
          <h4>🎯 Advanced Features</h4>
          <div className="features-grid">
            {status.features && Object.entries(status.features).map(([feature, enabled]) => (
              <div key={feature} className="feature-item">
                <span className={`feature-dot ${enabled ? 'enabled' : 'disabled'}`}></span>
                {feature.replace(/_/g, ' ').toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        <div className="config-section">
          <h4>⚙️ Configuration Status</h4>
          
          <div className="config-group">
            <strong>LangSmith Monitoring:</strong>
            <div className="config-details">
              <div>Project: {status.langsmith_config?.project}</div>
              <div>Tracing: {status.langsmith_config?.tracing_enabled ? '✅ Enabled' : '❌ Disabled'}</div>
              <div>API Key: {status.langsmith_config?.api_key_configured ? '✅ Configured' : '⚠️ Missing'}</div>
            </div>
          </div>

          <div className="config-group">
            <strong>AI Models:</strong>
            <div className="config-details">
              <div>OpenAI: {status.llm_config?.openai_available ? '✅ Available' : '⚠️ Fallback Mode'}</div>
              <div>Mode: {status.llm_config?.fallback_mode ? 'Mock/Development' : 'Production'}</div>
            </div>
          </div>

          <div className="config-group">
            <strong>Research APIs:</strong>
            <div className="config-details">
              <div>Google Search: {status.research_apis?.google_search ? '✅ Connected' : '❌ Not Configured'}</div>
              <div>Twitter API: {status.research_apis?.twitter_api ? '✅ Connected' : '❌ Not Configured'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <div className="analytics-panel">
        <h3>📊 Workflow Analytics</h3>
        
        {analytics.analytics?.total_workflows > 0 ? (
          <div className="analytics-grid">
            <div className="metric-card">
              <div className="metric-value">{analytics.analytics.total_workflows}</div>
              <div className="metric-label">Total Workflows</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{analytics.analytics.completed_workflows}</div>
              <div className="metric-label">Completed</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{analytics.analytics.success_rate?.toFixed(1)}%</div>
              <div className="metric-label">Success Rate</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{analytics.analytics.average_duration?.toFixed(1)}s</div>
              <div className="metric-label">Avg Duration</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{analytics.analytics.total_api_calls}</div>
              <div className="metric-label">API Calls</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">${analytics.analytics.total_cost_estimate?.toFixed(3)}</div>
              <div className="metric-label">Est. Cost</div>
            </div>
          </div>
        ) : (
          <div className="no-data">
            <p>No workflow executions yet. Upload a pitch deck to see analytics!</p>
          </div>
        )}

        <div className="langsmith-info">
          <h4>🔍 LangSmith Monitoring</h4>
          <div className="monitoring-details">
            <div>Project: <code>{analytics.langsmith_project}</code></div>
            <div>Tracing: {analytics.tracing_enabled ? '✅ Active' : '⚠️ Disabled'}</div>
            <div>Observability: Full execution traces and metrics available</div>
          </div>
        </div>
      </div>
    );
  };

  const renderProcessingResult = () => {
    if (!processingResult) return null;

    return (
      <div className="processing-result">
        <h3>🎯 Processing Results</h3>
        
        {processingResult.success ? (
          <div className="success-result">
            <div className="result-header">
              <div className="success-badge">✅ SUCCESS</div>
              <div className="deck-id">Deck ID: {processingResult.deck_id}</div>
            </div>

            <div className="workflow-details">
              <h4>📈 Workflow Execution Details</h4>
              
              {processingResult.workflow_results?.execution_metrics && (
                <div className="execution-metrics">
                  <div className="metric">
                    <strong>Execution ID:</strong> {processingResult.workflow_results.execution_metrics.execution_id}
                  </div>
                  <div className="metric">
                    <strong>Duration:</strong> {processingResult.workflow_results.execution_metrics.total_duration?.toFixed(2)}s
                  </div>
                  <div className="metric">
                    <strong>Steps Completed:</strong> {processingResult.workflow_results.execution_metrics.steps_completed}
                  </div>
                  <div className="metric">
                    <strong>API Calls:</strong> {processingResult.workflow_results.execution_metrics.api_calls_made}
                  </div>
                  <div className="metric">
                    <strong>Quality Score:</strong> {(processingResult.workflow_results.execution_metrics.quality_score * 100).toFixed(1)}%
                  </div>
                </div>
              )}

              {processingResult.workflow_results?.quality_assessment && (
                <div className="quality-assessment">
                  <h4>🎯 Quality Assessment</h4>
                  <div className="quality-metrics">
                    <div>Data Quality: {(processingResult.workflow_results.quality_assessment.data_quality_score * 100).toFixed(1)}%</div>
                    <div>Research Completeness: {(processingResult.workflow_results.quality_assessment.research_completeness * 100).toFixed(1)}%</div>
                    <div>Confidence Level: {processingResult.workflow_results.quality_assessment.confidence_level}</div>
                  </div>
                </div>
              )}

              {processingResult.workflow_results?.recommendation && (
                <div className="recommendation">
                  <h4>💡 Investment Recommendation</h4>
                  <div className={`recommendation-badge ${processingResult.workflow_results.recommendation.toLowerCase()}`}>
                    {processingResult.workflow_results.recommendation}
                  </div>
                </div>
              )}

              {processingResult.workflow_results?.execution_path && (
                <div className="execution-path">
                  <h4>🛤️ Execution Path</h4>
                  <div className="path-steps">
                    {processingResult.workflow_results.execution_path.map((step, index) => (
                      <div key={index} className="path-step">
                        {index + 1}. {step.replace(/_/g, ' ').toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="langsmith-tracking">
                <h4>🔍 LangSmith Tracking</h4>
                <div className="tracking-info">
                  <div>✅ Full execution trace captured</div>
                  <div>✅ Step-by-step monitoring active</div>
                  <div>✅ Quality metrics recorded</div>
                  <div>✅ Error tracking enabled</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="error-result">
            <div className="error-badge">❌ ERROR</div>
            <div className="error-message">{processingResult.error || 'Processing failed'}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="langraph-demo">
      <div className="demo-header">
        <h1>🚀 LangGraph + LangSmith Workflow Orchestrator</h1>
        <p>Robust, observable, and trustworthy AI workflow execution with comprehensive monitoring</p>
      </div>

      <div className="demo-controls">
        <button onClick={fetchLangGraphStatus} disabled={loading} className="control-btn">
          {loading ? '⏳ Loading...' : '📊 Get Status'}
        </button>
        
        <button onClick={fetchAnalytics} disabled={loading} className="control-btn">
          {loading ? '⏳ Loading...' : '📈 View Analytics'}
        </button>
        
        <div className="file-upload-section">
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            accept=".pdf,.pptx,.docx"
            className="file-input"
          />
          <button onClick={handleFileUpload} disabled={loading || !selectedFile} className="upload-btn">
            {loading ? '⏳ Processing...' : '🎯 Process with LangGraph'}
          </button>
        </div>
      </div>

      <div className="demo-content">
        {renderStatus()}
        {renderAnalytics()}
        {renderProcessingResult()}
      </div>

      {!status && !analytics && !processingResult && (
        <div className="welcome-message">
          <h3>🎯 Welcome to Advanced Workflow Orchestration</h3>
          <p>Click "Get Status" to see the robust LangGraph + LangSmith configuration</p>
          <p>Upload a pitch deck to experience comprehensive AI analysis with full observability</p>
          
          <div className="features-highlight">
            <h4>✨ Key Features:</h4>
            <ul>
              <li>🔍 <strong>Complete Observability:</strong> Every step tracked and monitored</li>
              <li>📊 <strong>Quality Assessment:</strong> Automated quality scoring and confidence levels</li>
              <li>🛤️ <strong>Execution Tracing:</strong> Full workflow path visualization</li>
              <li>💰 <strong>Cost Tracking:</strong> Real-time API usage and cost estimation</li>
              <li>🎯 <strong>Error Handling:</strong> Comprehensive error logging and recovery</li>
              <li>🚀 <strong>Performance Analytics:</strong> Success rates, timing, and throughput metrics</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default LangGraphDemo;