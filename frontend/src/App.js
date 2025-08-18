import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import your enhanced VERSSAI components
import VERSSAILinearApp from './components/VERSSAILinearApp';
import VERSSAIWidgetDashboard from './components/VERSSAIWidgetDashboard';

// Main App with routing between Linear workflow and Dashboard
function App() {
  const [currentView, setCurrentView] = useState('workflow');

  return (
    <div className="App">
      <Router>
        {/* Navigation Header */}
        <div className="bg-gray-900 text-white px-6 py-2">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">V</span>
              </div>
              <span className="font-semibold">VERSSAI Platform</span>
            </div>
            
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('workflow')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  currentView === 'workflow' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                VC Workflows
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  currentView === 'dashboard' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Analytics Dashboard
              </button>
              <div className="h-4 w-px bg-gray-600 mx-2"></div>
              <span className="text-xs text-gray-400">MCP+N8N Integration</span>
            </nav>
          </div>
        </div>

        <Routes>
          {/* Default route - Enhanced Linear Workflow App */}
          <Route path="/" element={
            currentView === 'workflow' ? <VERSSAILinearApp /> : <VERSSAIWidgetDashboard />
          } />
          
          {/* Direct routes for specific views */}
          <Route path="/workflow" element={<VERSSAILinearApp />} />
          <Route path="/dashboard" element={<VERSSAIWidgetDashboard />} />
          
          {/* Catch all - redirect to main */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;