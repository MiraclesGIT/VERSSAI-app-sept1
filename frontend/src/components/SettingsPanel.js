// Real Settings Panel Component with Role-Based Access
// File: frontend/src/components/SettingsPanel.js

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  Database,
  Upload,
  Key,
  Shield,
  Brain,
  GitBranch,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

const SettingsPanel = ({ isOpen, onClose, userRole }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      organizationName: 'Sequoia Capital',
      timezone: 'UTC',
      language: 'en',
      theme: 'light'
    },
    rag: {
      enableRoofLayer: true,
      enableVcLayer: true,
      enableStartupLayer: true,
      embeddingModel: 'all-MiniLM-L6-v2',
      chunkSize: 1000,
      chunkOverlap: 200,
      topK: 5
    },
    n8n: {
      serverUrl: 'http://localhost:5678',
      username: 'verssai_admin',
      password: '********',
      enableWebhooks: true,
      workflowTimeout: 1800
    },
    users: [],
    integrations: {
      googleDrive: { enabled: false, credentials: null },
      slack: { enabled: false, credentials: null },
      notion: { enabled: false, credentials: null }
    }
  });

  const [showPasswords, setShowPasswords] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', role: 'Analyst', permissions: [] });

  // Role-based tab access
  const getAvailableTabs = () => {
    const baseTabs = [
      { id: 'general', label: 'General', icon: Settings }
    ];

    if (userRole === 'SuperAdmin') {
      return [
        ...baseTabs,
        { id: 'rag', label: 'RAG Configuration', icon: Brain },
        { id: 'n8n', label: 'N8N Integration', icon: GitBranch },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'integrations', label: 'Integrations', icon: Database },
        { id: 'security', label: 'Security', icon: Shield }
      ];
    } else if (userRole === 'VC_Partner') {
      return [
        ...baseTabs,
        { id: 'rag', label: 'RAG Settings', icon: Brain },
        { id: 'integrations', label: 'Data Sources', icon: Database }
      ];
    } else {
      return baseTabs;
    }
  };

  // Save settings to backend
  const saveSettings = async () => {
    try {
      const response = await fetch('/api/v1/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('verssai_token')}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  // Add new user
  const addUser = () => {
    if (newUser.email && newUser.role) {
      setSettings(prev => ({
        ...prev,
        users: [...prev.users, { ...newUser, id: Date.now() }]
      }));
      setNewUser({ email: '', role: 'Analyst', permissions: [] });
    }
  };

  // Remove user
  const removeUser = (userId) => {
    setSettings(prev => ({
      ...prev,
      users: prev.users.filter(user => user.id !== userId)
    }));
  };

  if (!isOpen) return null;

  const availableTabs = getAvailableTabs();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-5/6 flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 rounded-l-xl p-6 border-r border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <nav className="space-y-2">
            {availableTabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">Role: {userRole}</p>
            <p className="text-xs text-blue-500 mt-1">
              {userRole === 'SuperAdmin' ? 'Full access to all settings' : 'Limited access based on role'}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.organizationName}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, organizationName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, timezone: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* RAG Configuration */}
          {activeTab === 'rag' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">RAG Configuration</h3>
              
              <div className="space-y-6">
                {/* Layer Toggles */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">RAG Layers</h4>
                  
                  <div className="space-y-3">
                    {[
                      { key: 'enableRoofLayer', label: 'Roof Layer - Global Intelligence', desc: 'Academic research, ML/DL datasets' },
                      { key: 'enableVcLayer', label: 'VC Layer - Fund Intelligence', desc: 'Deal flow, portfolio data, market analysis' },
                      { key: 'enableStartupLayer', label: 'Startup Layer - Founder Intelligence', desc: 'Founder profiles, startup metrics, pitch analysis' }
                    ].map(layer => (
                      <div key={layer.key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{layer.label}</p>
                          <p className="text-sm text-gray-500">{layer.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.rag[layer.key]}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              rag: { ...prev.rag, [layer.key]: e.target.checked }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advanced RAG Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Embedding Model
                    </label>
                    <select
                      value={settings.rag.embeddingModel}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        rag: { ...prev.rag, embeddingModel: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all-MiniLM-L6-v2">all-MiniLM-L6-v2</option>
                      <option value="text-embedding-ada-002">OpenAI Ada-002</option>
                      <option value="sentence-transformers/all-mpnet-base-v2">MPNet Base v2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Top K Results
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={settings.rag.topK}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        rag: { ...prev.rag, topK: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* N8N Integration */}
          {activeTab === 'n8n' && userRole === 'SuperAdmin' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">N8N Integration</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      N8N Server URL
                    </label>
                    <input
                      type="url"
                      value={settings.n8n.serverUrl}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        n8n: { ...prev.n8n, serverUrl: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={settings.n8n.username}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        n8n: { ...prev.n8n, username: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={settings.n8n.password}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        n8n: { ...prev.n8n, password: e.target.value }
                      }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Test Connection Button */}
                <div className="flex space-x-4">
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`${settings.n8n.serverUrl}/healthz`);
                        if (response.ok) {
                          alert('✅ N8N connection successful!');
                        } else {
                          alert('❌ N8N connection failed');
                        }
                      } catch (error) {
                        alert('❌ N8N connection failed: ' + error.message);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Test Connection
                  </button>

                  <button
                    onClick={() => window.open(settings.n8n.serverUrl, '_blank')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Open N8N Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User Management */}
          {activeTab === 'users' && userRole === 'SuperAdmin' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">User Management</h3>
              
              {/* Add New User */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-900 mb-4">Add New User</h4>
                <div className="flex space-x-4">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Analyst">Analyst</option>
                    <option value="VC_Partner">VC Partner</option>
                    <option value="SuperAdmin">Super Admin</option>
                  </select>
                  <button
                    onClick={addUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-2">
                {settings.users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{user.email}</p>
                      <p className="text-sm text-gray-500">{user.role}</p>
                    </div>
                    <button
                      onClick={() => removeUser(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="fixed bottom-6 right-6">
            <button
              onClick={saveSettings}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <Save className="w-5 h-5" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;