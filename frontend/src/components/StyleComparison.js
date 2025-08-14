import React, { useState } from 'react';
import './BloombergStyle.css';
import './ModernFinancialStyle.css';

const StyleComparison = () => {
  const [currentStyle, setCurrentStyle] = useState('modern'); // 'bloomberg' or 'modern'

  const demoData = {
    metrics: [
      { value: '1,247', label: 'Total Analyses', change: '+12% this month', positive: true },
      { value: '18', label: 'Active Deals', change: '+5 today', positive: true },
      { value: '$2.8B', label: 'Assets Under Management', change: '+$340M QTD', positive: true },
      { value: '94.7%', label: 'AI Prediction Accuracy', change: 'Top decile performance', positive: true }
    ],
    features: [
      { title: 'Team Assessment', description: 'Founder backgrounds and team composition', icon: '👥' },
      { title: 'Web Intelligence', description: 'Enhanced research with Google Search API', icon: '🌐' },
      { title: 'Market Analysis', description: 'Market size and competitive landscape', icon: '📊' },
      { title: 'Risk Assessment', description: 'Comprehensive risk analysis and scoring', icon: '⚠️' }
    ],
    services: [
      { name: 'ChromaDB', status: 'operational' },
      { name: 'Google Gemini Pro', status: 'operational' },
      { name: 'Google Search API', status: 'operational' },
      { name: 'Twitter API', status: 'warning' }
    ]
  };

  const BloombergView = () => (
    <div className="bloomberg-container">
      <div className="bloomberg-header">
        <div className="bloomberg-logo">VERSSAI</div>
        <div className="bloomberg-nav">
          <button className="bloomberg-nav-item active">Dashboard</button>
          <button className="bloomberg-nav-item">Founder Analysis</button>
          <button className="bloomberg-nav-item">Due Diligence</button>
          <button className="bloomberg-nav-item">Portfolio</button>
        </div>
        <div className="bloomberg-status-bar">
          <span>NYSE: 16:32 EST</span>
          <span>SYSTEM: OPERATIONAL</span>
          <span>API: CONNECTED</span>
        </div>
      </div>

      <div className="bloomberg-main">
        <div className="bloomberg-panel">
          <div className="bloomberg-panel-header">Upload Pitch Deck</div>
          <div className="bloomberg-upload">
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📤</div>
            <div style={{ fontSize: '12px', marginBottom: '5px' }}>Choose a file or drag it here</div>
            <div style={{ fontSize: '10px', color: 'var(--bloomberg-text-muted)', marginBottom: '15px' }}>
              PDF, PPTX, PPT files up to 50MB
            </div>
            <button className="bloomberg-upload-button">Browse Files</button>
          </div>

          <div className="bloomberg-panel-header">Analysis Features</div>
          <div className="bloomberg-features">
            {demoData.features.map((feature, index) => (
              <div key={index} className="bloomberg-feature">
                <div className="bloomberg-feature-icon" style={{ backgroundColor: 'var(--bloomberg-accent)' }}>
                  {feature.icon}
                </div>
                <div>
                  <div className="bloomberg-feature-text">{feature.title}</div>
                  <div className="bloomberg-feature-description">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bloomberg-panel">
          <div className="bloomberg-panel-header">Platform Statistics</div>
          <div className="bloomberg-metrics">
            {demoData.metrics.map((metric, index) => (
              <div key={index} className="bloomberg-metric">
                <div className="bloomberg-metric-value">{metric.value}</div>
                <div className="bloomberg-metric-label">{metric.label}</div>
                <div className={`bloomberg-metric-change ${metric.positive ? 'positive' : 'negative'}`}>
                  {metric.change}
                </div>
              </div>
            ))}
          </div>

          <div className="bloomberg-panel-header">System Status</div>
          <table className="bloomberg-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Status</th>
                <th>Uptime</th>
              </tr>
            </thead>
            <tbody>
              {demoData.services.map((service, index) => (
                <tr key={index}>
                  <td>{service.name}</td>
                  <td>
                    <span className={`bloomberg-status ${service.status}`}></span>
                    {service.status.toUpperCase()}
                  </td>
                  <td>99.9%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ModernView = () => (
    <div className="modern-container">
      <div className="modern-header">
        <div className="modern-logo">VERSSAI</div>
        <div className="modern-nav">
          <button className="modern-nav-item active">Dashboard</button>
          <button className="modern-nav-item">Founder Analysis</button>
          <button className="modern-nav-item">Due Diligence</button>
          <button className="modern-nav-item">Portfolio</button>
        </div>
        <div className="modern-user-section">
          <input type="text" placeholder="Search..." className="modern-search" />
          <div style={{ fontSize: '14px', color: 'var(--modern-text-muted)' }}>Admin</div>
        </div>
      </div>

      <div className="modern-main">
        <h1 className="modern-title">VERSSAI VC Intelligence Platform</h1>
        <p className="modern-subtitle">Institutional-grade investment intelligence powered by AI and research-backed insights</p>

        <div className="modern-metrics">
          {demoData.metrics.map((metric, index) => (
            <div key={index} className="modern-metric">
              <div className="modern-metric-value">{metric.value}</div>
              <div className="modern-metric-label">{metric.label}</div>
              <div className={`modern-metric-change ${metric.positive ? 'positive' : 'negative'}`}>
                <span>↗</span> {metric.change}
              </div>
            </div>
          ))}
        </div>

        <div className="modern-grid">
          <div className="modern-card">
            <div className="modern-card-header">
              <div className="modern-card-title">
                <div className="modern-card-icon" style={{ backgroundColor: 'var(--modern-primary)', color: 'white' }}>📤</div>
                Upload Pitch Deck
              </div>
            </div>
            <div className="modern-upload">
              <div className="modern-upload-icon">📄</div>
              <div className="modern-upload-text">Choose a file or drag it here</div>
              <div className="modern-upload-subtext">PDF, PPTX, PPT files up to 50MB</div>
              <button className="modern-upload-button">Browse Files</button>
            </div>
          </div>

          <div className="modern-card">
            <div className="modern-card-header">
              <div className="modern-card-title">
                <div className="modern-card-icon" style={{ backgroundColor: 'var(--modern-accent)', color: 'white' }}>🔧</div>
                Analysis Features
              </div>
            </div>
            <div className="modern-features">
              {demoData.features.map((feature, index) => (
                <div key={index} className="modern-feature">
                  <div className="modern-feature-icon" style={{ backgroundColor: 'var(--modern-primary)', color: 'white' }}>
                    {feature.icon}
                  </div>
                  <div className="modern-feature-content">
                    <div className="modern-feature-title">{feature.title}</div>
                    <div className="modern-feature-description">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modern-card">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <div className="modern-card-icon" style={{ backgroundColor: 'var(--modern-success)', color: 'white' }}>📊</div>
              System Status
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {demoData.services.map((service, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{service.name}</span>
                <span className={`modern-status ${service.status}`}>
                  <span className="modern-status-dot"></span>
                  {service.status === 'operational' ? 'Operational' : 'Rate Limited'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Style Toggle */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px', 
        zIndex: 1000,
        display: 'flex',
        gap: '8px',
        background: 'white',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <button 
          onClick={() => setCurrentStyle('modern')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: currentStyle === 'modern' ? '#2563eb' : '#f3f4f6',
            color: currentStyle === 'modern' ? 'white' : '#374151',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Modern Financial
        </button>
        <button 
          onClick={() => setCurrentStyle('bloomberg')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: currentStyle === 'bloomberg' ? '#ff6b35' : '#f3f4f6',
            color: currentStyle === 'bloomberg' ? 'white' : '#374151',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Bloomberg Terminal
        </button>
      </div>

      {currentStyle === 'bloomberg' ? <BloombergView /> : <ModernView />}
    </div>
  );
};

export default StyleComparison;