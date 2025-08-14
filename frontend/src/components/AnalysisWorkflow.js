import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../contexts/DealContext';
import { 
  ArrowLeft, ArrowRight, MessageSquare, Users, 
  CheckCircle, Clock, Circle, AlertCircle,
  FileText, Send, MoreVertical
} from 'lucide-react';

// Import existing framework components
import FounderSignalFit from './FounderSignalFit';
import DueDiligenceDataRoom from './DueDiligenceDataRoom';
import PortfolioManagement from './PortfolioManagement';
import FundAssessment from './FundAssessment';
import FundAllocation from './FundAllocation'; 
import FundVintage from './FundVintage';

const AnalysisWorkflow = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { 
    deals, 
    frameworkConfig, 
    currentFramework,
    setCurrentFramework,
    setCurrentDeal,
    getFrameworkProgress,
    addTeamNote
  } = useDeal();

  const [newNote, setNewNote] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const deal = deals.find(d => d.id === dealId);
  
  useEffect(() => {
    if (deal) {
      setCurrentDeal(deal);
    }
  }, [deal, setCurrentDeal]);

  useEffect(() => {
    // Set initial framework if none selected
    if (!currentFramework && frameworkConfig) {
      const frameworkKeys = Object.keys(frameworkConfig).sort((a, b) => 
        frameworkConfig[a].order - frameworkConfig[b].order
      );
      setCurrentFramework(frameworkKeys[0]);
    }
  }, [currentFramework, setCurrentFramework]);

  if (!deal) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Deal not found</h2>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Return to Pipeline
          </button>
        </div>
      </div>
    );
  }

  const frameworkKeys = Object.keys(frameworkConfig).sort((a, b) => 
    frameworkConfig[a].order - frameworkConfig[b].order
  );
  
  const currentIndex = frameworkKeys.indexOf(currentFramework);
  const progress = getFrameworkProgress(dealId);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      addTeamNote(dealId, {
        author: 'Current User', // In real app, get from auth context
        content: newNote,
        framework: currentFramework,
        timestamp: new Date().toISOString()
      });
      setNewNote('');
    }
  };

  const renderFrameworkComponent = () => {
    const props = { dealId, deal };
    
    switch (currentFramework) {
      case 'founderSignalFit':
        return <FounderSignalFit {...props} />;
      case 'dueDiligence':
        return <DueDiligenceDataRoom {...props} />;
      case 'portfolioManagement':
        return <PortfolioManagement {...props} />;
      case 'fundAssessment':
        return <FundAssessment {...props} />;
      case 'fundAllocation':
        return <FundAllocation {...props} />;
      case 'fundVintage':
        return <FundVintage {...props} />;
      default:
        return <div>Framework not found</div>;
    }
  };

  const frameworkNotes = deal.teamNotes.filter(note => note.framework === currentFramework);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Pipeline
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{deal.company}</h1>
              <p className="text-sm text-gray-600">{deal.sector} • {deal.stage} • {deal.amount}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Progress: {progress.completed}/{progress.total} frameworks
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(progress.completed / progress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Framework Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Analysis Frameworks</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {frameworkKeys.map((key, index) => {
              const config = frameworkConfig[key];
              const framework = deal.frameworks[key];
              const isActive = currentFramework === key;
              
              return (
                <button
                  key={key}
                  onClick={() => setCurrentFramework(key)}
                  className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-blue-50 border-r-2 border-r-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center">
                      {getStatusIcon(framework.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{config.icon}</span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {config.name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Step {config.order} of 6
                      </div>
                      {framework.score && (
                        <div className="text-xs font-medium text-blue-600 mt-1">
                          Score: {framework.score}%
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Navigation Controls */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (currentIndex > 0) {
                    setCurrentFramework(frameworkKeys[currentIndex - 1]);
                  }
                }}
                disabled={currentIndex === 0}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={() => {
                  if (currentIndex < frameworkKeys.length - 1) {
                    setCurrentFramework(frameworkKeys[currentIndex + 1]);
                  }
                }}
                disabled={currentIndex === frameworkKeys.length - 1}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Framework Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{frameworkConfig[currentFramework]?.icon}</span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {frameworkConfig[currentFramework]?.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {frameworkConfig[currentFramework]?.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <MessageSquare className="w-4 h-4" />
                  Notes ({frameworkNotes.length})
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Framework Content */}
            <div className={`${showNotes ? 'flex-1' : 'w-full'} overflow-y-auto`}>
              <div className="p-6">
                {renderFrameworkComponent()}
              </div>
            </div>

            {/* Right Sidebar - Team Notes */}
            {showNotes && (
              <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Team Collaboration</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Notes for {frameworkConfig[currentFramework]?.name}
                  </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {frameworkNotes.map((note) => (
                      <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {note.author.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{note.author}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(note.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{note.content}</p>
                      </div>
                    ))}
                    
                    {frameworkNotes.length === 0 && (
                      <div className="text-center py-8">
                        <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No notes yet for this framework</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
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

export default AnalysisWorkflow;