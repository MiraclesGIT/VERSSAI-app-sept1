import React, { useState, useEffect } from 'react';
import '../components/PalantirTheme.css';
import {
  Upload, FileText, Folder, Search, AlertCircle, CheckCircle, 
  ArrowLeft, Terminal, Activity, Shield, Database, Brain,
  Eye, Download, Filter, BarChart3, TrendingUp, Target,
  Clock, Users, Zap, Network, Award, Info
} from 'lucide-react';
import axios from 'axios';

const DueDiligenceDataRoom = () => {
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [roomId, setRoomId] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const documentTypes = {
    'financial': { icon: BarChart3, color: 'text-green-400', label: 'Financial' },
    'legal': { icon: Shield, color: 'text-blue-400', label: 'Legal' },
    'technical': { icon: Database, color: 'text-purple-400', label: 'Technical' },
    'market': { icon: TrendingUp, color: 'text-cyan-400', label: 'Market' },
    'team': { icon: Users, color: 'text-orange-400', label: 'Team' },
    'other': { icon: FileText, color: 'text-gray-400', label: 'Other' }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    setIsAnalyzing(true);

    try {
      // Create single FormData for all files (as backend expects)
      const formData = new FormData();
      
      // Add all files to the same FormData
      for (let file of files) {
        formData.append('files', file);  // Backend expects 'files' not 'file'
      }
      
      // Add required company_name parameter
      formData.append('company_name', roomId || 'Demo Company');
      formData.append('company_id', roomId || 'demo-001');
      formData.append('industry', 'Technology');
      formData.append('uploaded_by', 'VC Partner');

      // Use correct backend endpoint
      const response = await axios.post(`${BACKEND_URL}/api/due-diligence/upload-data-room`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.data_room_id) {
        setRoomId(response.data.data_room_id);
      }

      // Process uploaded documents
      const uploadedFiles = response.data.uploaded_files || [];
      const newDocuments = files.map((file, index) => ({
        id: uploadedFiles[index]?.document_id || Date.now() + index,
        name: file.name,
        type: detectDocumentType(file.name),
        size: file.size,
        uploadTime: new Date().toISOString(),
        status: 'uploaded',
        pages: Math.floor(file.size / 2000) + 1
      }));

      setUploadedDocuments(prev => [...prev, ...newDocuments]);
      
      // Auto-trigger analysis after successful upload
      setTimeout(() => {
        startAnalysis();
      }, 1000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('File upload failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const detectDocumentType = (filename) => {
    const name = filename.toLowerCase();
    if (name.includes('financial') || name.includes('revenue') || name.includes('budget') || name.includes('excel')) return 'financial';
    if (name.includes('legal') || name.includes('contract') || name.includes('agreement')) return 'legal';
    if (name.includes('tech') || name.includes('architecture') || name.includes('api')) return 'technical';
    if (name.includes('market') || name.includes('competition') || name.includes('analysis')) return 'market';
    if (name.includes('team') || name.includes('org') || name.includes('hiring')) return 'team';
    return 'other';
  };

  const startAnalysis = async () => {
    if (uploadedDocuments.length === 0) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis process
    setTimeout(() => {
      const mockResults = {
        overall_risk: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        risk_score: Math.floor(Math.random() * 100),
        key_findings: [
          'Strong financial position with consistent revenue growth',
          'Intellectual property portfolio well-documented',
          'Management team has relevant industry experience',
          'Market opportunity validated through customer testimonials',
          'Technical architecture scalable and secure'
        ],
        cross_references: [
          'Financial projections align with market analysis',
          'Legal agreements consistent with business model',
          'Team structure supports technical roadmap'
        ],
        red_flags: Math.random() > 0.7 ? [
          'Potential IP infringement issues identified',
          'Customer concentration risk in top 3 clients'
        ] : [],
        green_flags: [
          'Recurring revenue model established',
          'Strong customer retention metrics',
          'Experienced advisory board'
        ],
        document_scores: uploadedDocuments.map(doc => ({
          document_id: doc.id,
          quality_score: Math.floor(Math.random() * 40) + 60,
          completeness: Math.floor(Math.random() * 30) + 70
        }))
      };
      
      setAnalysisResults(mockResults);
      setIsAnalyzing(false);
    }, 3000);
  };

  const filteredDocuments = uploadedDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const DocumentCard = ({ document }) => {
    const DocIcon = documentTypes[document.type]?.icon || FileText;
    const isSelected = selectedDocuments.includes(document.id);

    return (
      <div 
        className={`palantir-card p-4 cursor-pointer transition-all duration-300 ${
          isSelected ? 'border-cyan-400 bg-cyan-400/10' : ''
        }`}
        onClick={() => {
          setSelectedDocuments(prev => 
            prev.includes(document.id) 
              ? prev.filter(id => id !== document.id)
              : [...prev, document.id]
          );
        }}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-gray-800 ${documentTypes[document.type]?.color}`}>
            <DocIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium truncate">{document.name}</h4>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span className="palantir-mono">{(document.size / 1024).toFixed(1)} KB</span>
              <span>{document.pages} pages</span>
              <span className="capitalize">{documentTypes[document.type]?.label}</span>
            </div>
            <div className="mt-2">
              <span className={`palantir-status ${document.status === 'uploaded' ? 'operational' : 'processing'}`}>
                {document.status.toUpperCase()}
              </span>
            </div>
          </div>
          {isSelected && (
            <CheckCircle className="w-5 h-5 text-cyan-400" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Palantir Header */}
      <header className="palantir-panel border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="palantir-btn flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Command Center
            </button>
            <div className="w-px h-6 bg-gray-700"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Folder className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Due Diligence Data Room</h1>
                <p className="text-xs text-gray-400 palantir-mono">Intelligence Framework #2</p>
              </div>
            </div>
            <div className="palantir-status operational">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              ACTIVE
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="palantir-status processing">
              <Activity className="w-3 h-3" />
              DOCUMENTS: {uploadedDocuments.length}
            </div>
            <button className="palantir-btn">
              <Terminal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Upload Panel */}
          <div className="lg:col-span-2">
            <div className="palantir-panel p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Upload className="w-6 h-6 text-cyan-400" />
                  Document Intelligence Upload
                </h2>
                <div className="palantir-mono text-sm text-gray-400">
                  ROOM ID: {roomId || 'PENDING'}
                </div>
              </div>

              <label className="block mb-6">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  onChange={handleFileUpload}
                />
                <div className="palantir-card p-8 text-center cursor-pointer hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Folder className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-sm text-gray-400 palantir-mono mb-2">MULTI-DOCUMENT UPLOAD</div>
                  <div className="text-xs text-gray-500 mb-4">PDF, DOC, PPT, XLS • Enterprise Grade</div>
                  <button className="palantir-btn-primary">
                    <Upload className="w-4 h-4 mr-2" />
                    UPLOAD DOCUMENTS
                  </button>
                </div>
              </label>

              {/* Document Search & Filter */}
              {uploadedDocuments.length > 0 && (
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="all">All Types</option>
                    {Object.entries(documentTypes).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Document Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocuments.map(doc => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>

              {/* Analysis Controls */}
              {uploadedDocuments.length > 0 && (
                <div className="mt-6 p-4 palantir-panel">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">
                        {selectedDocuments.length > 0 ? `${selectedDocuments.length} selected` : 'All documents'}
                      </div>
                      <div className="text-xs text-gray-400 palantir-mono">
                        Ready for cross-document analysis
                      </div>
                    </div>
                    <button
                      onClick={startAnalysis}
                      disabled={isAnalyzing}
                      className="palantir-btn-primary flex items-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ANALYZING
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4" />
                          INITIATE ANALYSIS
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Results Panel */}
          <div className="lg:col-span-1">
            <div className="palantir-panel p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Analysis Intelligence
              </h3>

              {!analysisResults ? (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <div className="text-gray-400 text-sm">Upload documents to begin analysis</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Risk Assessment */}
                  <div className="palantir-card p-4">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      Risk Assessment
                    </h4>
                    <div className={`palantir-status ${
                      analysisResults.overall_risk === 'Low' ? 'operational' :
                      analysisResults.overall_risk === 'Medium' ? 'warning' : 'error'
                    }`}>
                      {analysisResults.overall_risk} RISK
                    </div>
                    <div className="mt-2 text-xs text-gray-400 palantir-mono">
                      Score: {analysisResults.risk_score}/100
                    </div>
                  </div>

                  {/* Key Findings */}
                  <div className="palantir-card p-4">
                    <h4 className="font-semibold text-white mb-3">Key Findings</h4>
                    <div className="space-y-2 text-sm">
                      {analysisResults.key_findings?.slice(0, 3).map((finding, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-gray-300">
                          <Target className="w-3 h-3 text-cyan-400 mt-1 flex-shrink-0" />
                          <span>{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flags */}
                  {analysisResults.red_flags?.length > 0 && (
                    <div className="palantir-card p-4">
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        Red Flags
                      </h4>
                      <div className="space-y-2 text-sm">
                        {analysisResults.red_flags.map((flag, idx) => (
                          <div key={idx} className="text-red-300 text-xs">{flag}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="palantir-card p-4">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Green Flags
                    </h4>
                    <div className="space-y-2 text-sm">
                      {analysisResults.green_flags?.slice(0, 2).map((flag, idx) => (
                        <div key={idx} className="text-green-300 text-xs">{flag}</div>
                      ))}
                    </div>
                  </div>

                  {/* Cross-References */}
                  <div className="palantir-card p-4">
                    <h4 className="font-semibold text-white mb-3">Cross-References</h4>
                    <div className="text-xs text-gray-400 palantir-mono">
                      {analysisResults.cross_references?.length || 0} connections found
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DueDiligenceDataRoom;