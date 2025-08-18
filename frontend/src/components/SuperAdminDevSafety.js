import React, { useState, useEffect } from 'react';

const SuperAdminDevSafety = () => {
  const [autoBackupStatus, setAutoBackupStatus] = useState('running');
  const [currentEnvironment, setCurrentEnvironment] = useState('development');
  const [versioningEnabled, setVersioningEnabled] = useState(true);
  const [backupInterval, setBackupInterval] = useState(15);
  const [safetyMetrics, setSafetyMetrics] = useState({
    totalBackups: 47,
    lastBackup: '2 minutes ago',
    autoVersions: 156,
    environments: ['development', 'staging', 'production'],
    activeBranches: 8,
    systemHealth: 98
  });

  const [recentBackups, setRecentBackups] = useState([
    { name: 'auto-20250818-143000', type: 'auto', size: '45MB', created: '2 mins ago' },
    { name: 'feature-enhanced-ui', type: 'manual', size: '43MB', created: '15 mins ago' },
    { name: 'pre-deploy-staging-20250818-142500', type: 'deploy', size: '44MB', created: '35 mins ago' },
    { name: 'milestone-v2.1.0', type: 'manual', size: '42MB', created: '2 hours ago' },
  ]);

  const [environments, setEnvironments] = useState([
    { name: 'development', status: 'active', lastDeploy: '5 mins ago', health: 'good' },
    { name: 'staging', status: 'active', lastDeploy: '2 hours ago', health: 'good' },
    { name: 'production', status: 'stable', lastDeploy: '1 day ago', health: 'excellent' }
  ]);

  // API calls to backend
  const apiCall = async (endpoint, method = 'GET', data = null) => {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(`http://localhost:8080/api/admin/dev-safety${endpoint}`, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      // Handle errors silently for production use
      throw error;
    }
  };

  const toggleAutoBackup = async () => {
    try {
      const newStatus = autoBackupStatus === 'running' ? 'stopped' : 'running';
      await apiCall('/auto-backup/toggle', 'POST', { status: newStatus });
      setAutoBackupStatus(newStatus);
    } catch (error) {
      // Handle errors silently for production use
    }
  };

  const createManualBackup = async () => {
    try {
      const result = await apiCall('/backup/create', 'POST', { 
        name: `manual-${Date.now()}` 
      });
      const newBackup = {
        name: result.name,
        type: 'manual',
        size: result.size,
        created: 'just now'
      };
      setRecentBackups([newBackup, ...recentBackups.slice(0, 3)]);
    } catch (error) {
      // Handle errors silently for production use
    }
  };

  const deployToEnvironment = async (env) => {
    try {
      await apiCall('/deploy', 'POST', { environment: env });
      // Deployment successful
    } catch (error) {
      // Handle errors silently for production use
    }
  };

  const runCommand = async (command) => {
    try {
      const result = await apiCall('/command', 'POST', { command });
      return result;
    } catch (error) {
      // Handle errors silently for production use
    }
  };

  // Load safety metrics on component mount
  useEffect(() => {
    const loadSafetyMetrics = async () => {
      try {
        const metrics = await apiCall('/status');
        setSafetyMetrics(metrics);
      } catch (error) {
        // Handle errors silently for production use
      }
    };

    loadSafetyMetrics();
    const interval = setInterval(loadSafetyMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Development Safety & Version Control
          </h1>
          <p className="text-gray-600 mt-1">
            Manage VERSSAI development environments, backups, and safety systems
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            autoBackupStatus === 'running' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {autoBackupStatus === 'running' ? 'System Protected' : 'Protection Inactive'}
          </div>
        </div>
      </div>

      {/* Safety Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-green-600">{safetyMetrics.systemHealth}%</p>
            </div>
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Backups</p>
              <p className="text-2xl font-bold text-blue-600">{safetyMetrics.totalBackups}</p>
            </div>
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Auto Versions</p>
              <p className="text-2xl font-bold text-purple-600">{safetyMetrics.autoVersions}</p>
            </div>
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Branches</p>
              <p className="text-2xl font-bold text-orange-600">{safetyMetrics.activeBranches}</p>
            </div>
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Auto-Backup Controls */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Auto-Backup System
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Status</p>
                  <p className="text-sm text-gray-600">
                    {autoBackupStatus === 'running' ? 'Running normally' : 'Stopped'}
                  </p>
                </div>
                <button 
                  onClick={toggleAutoBackup}
                  className={`p-2 rounded-lg ${
                    autoBackupStatus === 'running' 
                      ? 'text-red-600 hover:bg-red-50' 
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  {autoBackupStatus === 'running' ? 
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg> : 
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Interval (minutes)
                  </label>
                  <select 
                    value={backupInterval}
                    onChange={(e) => setBackupInterval(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Auto-Versioning</span>
                  <button
                    onClick={() => setVersioningEnabled(!versioningEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      versioningEnabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      versioningEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600 mb-2">Last backup: {safetyMetrics.lastBackup}</p>
                <button 
                  onClick={createManualBackup}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Create Manual Backup
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Management */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
            Environment Control
            </h3>
            
            <div className="space-y-3">
              {environments.map((env) => (
                <div key={env.name} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        env.health === 'excellent' ? 'bg-green-500' :
                        env.health === 'good' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium capitalize">{env.name}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      env.status === 'active' ? 'bg-green-100 text-green-800' :
                      env.status === 'stable' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {env.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Last deploy: {env.lastDeploy}
                  </p>
                  <button 
                    onClick={() => deployToEnvironment(env.name)}
                    className={`w-full px-3 py-1 rounded text-sm font-medium transition-colors ${
                      env.name === 'production' 
                        ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Deploy to {env.name}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Current Environment</span>
                <span className="text-sm text-gray-600 capitalize">{currentEnvironment}</span>
              </div>
              <select 
                value={currentEnvironment}
                onChange={(e) => setCurrentEnvironment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {environments.map((env) => (
                  <option key={env.name} value={env.name}>{env.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Recent Backups */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              Recent Backups
            </h3>
            
            <div className="space-y-2">
              {recentBackups.map((backup, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {backup.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className={`px-1.5 py-0.5 rounded ${
                        backup.type === 'auto' ? 'bg-blue-100 text-blue-700' :
                        backup.type === 'manual' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {backup.type}
                      </span>
                      <span>{backup.size}</span>
                      <span>{backup.created}</span>
                    </div>
                  </div>
                  <button className="ml-2 p-1 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t">
              <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All Backups →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Emergency Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => runCommand('npm run safe:commit "Quick save"')}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Quick Commit
            </button>
            
            <button 
              onClick={() => runCommand('npm run backup:create')}
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Quick Backup
            </button>
            
            <button 
              onClick={() => runCommand('npm run safety:status')}
              className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              System Status
            </button>
            
            <button 
              onClick={() => runCommand('npm run github:push-all')}
              className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Push to GitHub
            </button>
          </div>
        </div>

        {/* Emergency Controls */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Emergency Controls
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => runCommand('npm run emergency:rollback')}
              className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Emergency Rollback
            </button>
            
            <button 
              onClick={() => runCommand('npm run emergency:backup')}
              className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Create Emergency Backup
            </button>
            
            <button 
              onClick={() => runCommand('npm run health:full')}
              className="flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              System Diagnostics
            </button>
          </div>
          
          <p className="text-sm text-red-700 mt-3">
            ⚠️ Emergency controls will create automatic safety backups before executing any destructive operations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDevSafety;