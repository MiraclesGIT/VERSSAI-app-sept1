import React, { useState, useEffect } from 'react';
import '../components/ClickUpTheme.css';
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
    'financial': { icon: BarChart3, color: 'clickup-text-success', label: 'Financial' },
    'legal': { icon: Shield, color: 'clickup-text-info', label: 'Legal' },
    'technical': { icon: Database, color: 'clickup-text-brand', label: 'Technical' },
    'market': { icon: TrendingUp, color: 'clickup-text-secondary', label: 'Market' },
    'team': { icon: Users, color: 'clickup-text-warning', label: 'Team' },
    'other': { icon: FileText, color: 'clickup-text-tertiary', label: 'Other' }
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
        className={`clickup-card cursor-pointer transition-all duration-300 ${
          isSelected ? 'border-primary bg-primary/10' : ''
        }`}
        onClick={() => {
          setSelectedDocuments(prev => 
            prev.includes(document.id) 
              ? prev.filter(id => id !== document.id)
              : [...prev, document.id]
          );
        }}
      >
        <div className="clickup-card-body">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${documentTypes[document.type]?.color}`}>
              <DocIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="clickup-font-medium truncate">{document.name}</h4>
              <div className="flex items-center gap-4 mt-2 clickup-text-sm clickup-text-secondary">
                <span>{(document.size / 1024).toFixed(1)} KB</span>
                <span>{document.pages} pages</span>
                <span className="capitalize">{documentTypes[document.type]?.label}</span>
              </div>
              <div className="mt-2">
                <span className={`clickup-status ${document.status === 'uploaded' ? 'clickup-status-success' : 'clickup-status-primary'}`}>
                  {document.status.toUpperCase()}
                </span>
              </div>
            </div>
            {isSelected && (
              <CheckCircle className="w-5 h-5 clickup-text-success" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="clickup-main">
      {/* Breadcrumb */}
      <div className="clickup-mb-lg">
        <a href="/" className="clickup-text-secondary hover:clickup-text-primary text-sm">
          Dashboard
        </a>
        <span className="clickup-text-tertiary mx-2">/</span>
        <span className="clickup-text-primary text-sm font-medium">Due Diligence Data Room</span>
      </div>

      <div className="clickup-page-header">
        <h1 className="clickup-page-title">Due Diligence Data Room</h1>
        <p className="clickup-page-subtitle">
          Multi-document RAG analysis with comprehensive risk assessment
        </p>
      </div>

      <div className="clickup-grid clickup-grid-3" style={{ gap: '2rem' }}>
        {/* Document Upload Panel */}
        <div className="clickup-grid-2">
          <div className="clickup-card">
            <div className="clickup-card-header">
              <h3 className="clickup-card-title">
                <Upload className="w-5 h-5" />
                Document Intelligence Upload
              </h3>
            </div>
            <div className="clickup-card-body">
              <div className="clickup-mb-md">
                <div className="clickup-text-sm clickup-text-secondary clickup-mb-sm">
                  Room ID: {roomId || 'PENDING'}
                </div>
              </div>

              <label className="block clickup-mb-lg">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  onChange={handleFileUpload}
                />
                <div className="clickup-file-upload">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Folder className="w-8 h-8 clickup-text-info" />
                    </div>
                    <div className="text-center">
                      <div className="clickup-font-medium clickup-mb-sm">Multi-Document Upload</div>
                      <div className="clickup-text-secondary clickup-text-sm">
                        PDF, DOC, PPT, XLS files • Enterprise Grade
                      </div>
                    </div>
                    <button className="clickup-btn clickup-btn-primary">
                      <Upload className="w-4 h-4" />
                      Upload Documents
                    </button>
                  </div>
                </div>
              </label>

              {/* Document Search & Filter */}
              {uploadedDocuments.length > 0 && (
                <div className="flex gap-4 clickup-mb-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
                  >
                    <option value="all">All Types</option>
                    {Object.entries(documentTypes).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Document Grid */}
              <div className="clickup-grid clickup-grid-2">
                {filteredDocuments.map(doc => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>

              {/* Analysis Controls */}
              {uploadedDocuments.length > 0 && (
                <div className="clickup-mt-lg clickup-card">
                  <div className="clickup-card-body">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="clickup-font-medium">
                          {selectedDocuments.length > 0 ? `${selectedDocuments.length} selected` : 'All documents'}
                        </div>
                        <div className="clickup-text-sm clickup-text-secondary">
                          Ready for cross-document analysis
                        </div>
                      </div>
                      <button
                        onClick={startAnalysis}
                        disabled={isAnalyzing}
                        className="clickup-btn clickup-btn-primary"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Analyzing
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4" />
                            Initiate Analysis
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analysis Results Panel */}
        <div className="clickup-card">
          <div className="clickup-card-header">
            <h3 className="clickup-card-title">
              <Brain className="w-5 h-5" />
              Analysis Intelligence
            </h3>
          </div>
          <div className="clickup-card-body">
            {!analysisResults ? (
              <div className="text-center py-8">
                <Database className="w-12 h-12 clickup-text-tertiary mx-auto mb-4" />
                <div className="clickup-text-secondary clickup-text-sm">Upload documents to begin analysis</div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Risk Assessment */}
                <div className="clickup-card">
                  <div className="clickup-card-body">
                    <h4 className="clickup-font-semibold clickup-mb-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 clickup-text-warning" />
                      Risk Assessment
                    </h4>
                    <div className={`clickup-status ${
                      analysisResults.overall_risk === 'Low' ? 'clickup-status-success' :
                      analysisResults.overall_risk === 'Medium' ? 'clickup-status-warning' : 'clickup-status-danger'
                    }`}>
                      {analysisResults.overall_risk} Risk
                    </div>
                    <div className="clickup-mt-sm clickup-text-xs clickup-text-secondary">
                      Score: {analysisResults.risk_score}/100
                    </div>
                  </div>
                </div>

                {/* Key Findings */}
                <div className="clickup-card">
                  <div className="clickup-card-body">
                    <h4 className="clickup-font-semibold clickup-mb-md">Key Findings</h4>
                    <div className="space-y-2 clickup-text-sm">
                      {analysisResults.key_findings?.slice(0, 3).map((finding, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Target className="w-3 h-3 clickup-text-info mt-1 flex-shrink-0" />
                          <span>{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Flags */}
                {analysisResults.red_flags?.length > 0 && (
                  <div className="clickup-card">
                    <div className="clickup-card-body">
                      <h4 className="clickup-font-semibold clickup-mb-md flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 clickup-text-danger" />
                        Red Flags
                      </h4>
                      <div className="space-y-2 clickup-text-sm">
                        {analysisResults.red_flags.map((flag, idx) => (
                          <div key={idx} className="clickup-text-danger clickup-text-xs">{flag}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="clickup-card">
                  <div className="clickup-card-body">
                    <h4 className="clickup-font-semibold clickup-mb-md flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 clickup-text-success" />
                      Green Flags
                    </h4>
                    <div className="space-y-2 clickup-text-sm">
                      {analysisResults.green_flags?.slice(0, 2).map((flag, idx) => (
                        <div key={idx} className="clickup-text-success clickup-text-xs">{flag}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cross-References */}
                <div className="clickup-card">
                  <div className="clickup-card-body">
                    <h4 className="clickup-font-semibold clickup-mb-md">Cross-References</h4>
                    <div className="clickup-text-xs clickup-text-secondary">
                      {analysisResults.cross_references?.length || 0} connections found
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DueDiligenceDataRoom;