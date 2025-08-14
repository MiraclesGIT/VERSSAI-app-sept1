import React, { createContext, useContext, useReducer, useCallback } from 'react';

const DealContext = createContext();

// Mock data for demonstration
const MOCK_DEALS = [
  {
    id: 'deal-001',
    company: 'TechCorp AI',
    sector: 'Artificial Intelligence',
    stage: 'Series A',
    amount: '$5M',
    uploadDate: '2024-01-15',
    status: 'In Progress',
    assignedTo: ['John Smith', 'Sarah Wilson'],
    frameworks: {
      founderSignalFit: { status: 'completed', score: 85, recommendation: 'STRONG_BUY' },
      dueDiligence: { status: 'in_progress', score: null, recommendation: null },
      portfolioManagement: { status: 'pending', score: null, recommendation: null },
      fundAssessment: { status: 'not_started', score: null, recommendation: null },
      fundAllocation: { status: 'not_started', score: null, recommendation: null },
      fundVintage: { status: 'not_started', score: null, recommendation: null }
    },
    teamNotes: [
      { id: 1, author: 'John Smith', content: 'Strong technical team, experienced founders', framework: 'founderSignalFit', timestamp: '2024-01-16T10:30:00Z' },
      { id: 2, author: 'Sarah Wilson', content: 'Need to review financial projections', framework: 'dueDiligence', timestamp: '2024-01-16T14:15:00Z' }
    ]
  },
  {
    id: 'deal-002',  
    company: 'DataTech Solutions',
    sector: 'Data Analytics',
    stage: 'Seed',
    amount: '$2M',
    uploadDate: '2024-01-10',
    status: 'Completed',
    assignedTo: ['Mike Johnson'],
    frameworks: {
      founderSignalFit: { status: 'completed', score: 72, recommendation: 'BUY' },
      dueDiligence: { status: 'completed', score: 78, recommendation: 'BUY' },
      portfolioManagement: { status: 'completed', score: 81, recommendation: 'STRONG_BUY' },
      fundAssessment: { status: 'completed', score: 75, recommendation: 'BUY' },
      fundAllocation: { status: 'completed', score: 70, recommendation: 'HOLD' },
      fundVintage: { status: 'completed', score: 77, recommendation: 'BUY' }
    },
    teamNotes: [
      { id: 3, author: 'Mike Johnson', content: 'Solid market opportunity, competitive pricing model', framework: 'portfolioManagement', timestamp: '2024-01-12T09:45:00Z' }
    ]
  },
  {
    id: 'deal-003',
    company: 'GreenTech Innovations',
    sector: 'Clean Energy',
    stage: 'Series B',
    amount: '$15M',
    uploadDate: '2024-01-20',
    status: 'New',
    assignedTo: ['Sarah Wilson', 'David Chen'],
    frameworks: {
      founderSignalFit: { status: 'not_started', score: null, recommendation: null },
      dueDiligence: { status: 'not_started', score: null, recommendation: null },
      portfolioManagement: { status: 'not_started', score: null, recommendation: null },
      fundAssessment: { status: 'not_started', score: null, recommendation: null },  
      fundAllocation: { status: 'not_started', score: null, recommendation: null },
      fundVintage: { status: 'not_started', score: null, recommendation: null }
    },
    teamNotes: []
  }
];

const FRAMEWORK_CONFIG = {
  founderSignalFit: { 
    name: 'Founder Signal Fit', 
    order: 1, 
    icon: '👥',
    description: 'AI-powered founder assessment with research-backed analysis and web intelligence'
  },
  dueDiligence: { 
    name: 'Due Diligence', 
    order: 2, 
    icon: '📋',
    description: 'Comprehensive due diligence data room with document analysis and risk assessment'
  },
  portfolioManagement: { 
    name: 'Portfolio Management', 
    order: 3, 
    icon: '📊',
    description: 'Portfolio fit analysis and management recommendations'
  },
  fundAssessment: { 
    name: 'Fund Assessment', 
    order: 4, 
    icon: '🔍',
    description: 'Fund performance assessment and backtesting analysis'
  },
  fundAllocation: { 
    name: 'Fund Allocation', 
    order: 5, 
    icon: '💰',
    description: 'Optimal fund allocation and deployment strategies'
  },
  fundVintage: { 
    name: 'Fund Vintage', 
    order: 6, 
    icon: '📈',
    description: 'Vintage analysis and comparative fund performance'
  }
};

const dealReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DEALS':
      return { ...state, deals: action.payload };
    
    case 'SET_CURRENT_DEAL':
      return { ...state, currentDeal: action.payload };
    
    case 'UPDATE_DEAL':
      return {
        ...state,
        deals: state.deals.map(deal => 
          deal.id === action.payload.id ? { ...deal, ...action.payload } : deal
        ),
        currentDeal: state.currentDeal?.id === action.payload.id ? 
          { ...state.currentDeal, ...action.payload } : state.currentDeal
      };
    
    case 'UPDATE_FRAMEWORK_STATUS':
      const { dealId, framework, status, score, recommendation } = action.payload;
      return {
        ...state,
        deals: state.deals.map(deal => 
          deal.id === dealId ? {
            ...deal,
            frameworks: {
              ...deal.frameworks,
              [framework]: { status, score, recommendation }
            }
          } : deal
        )
      };
    
    case 'ADD_TEAM_NOTE':
      const { dealId: notesDealId, note } = action.payload;
      return {
        ...state,
        deals: state.deals.map(deal => 
          deal.id === notesDealId ? {
            ...deal,
            teamNotes: [...deal.teamNotes, { ...note, id: Date.now() }]
          } : deal
        )
      };
    
    case 'SET_CURRENT_FRAMEWORK':
      return { ...state, currentFramework: action.payload };
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    
    default:
      return state;
  }
};

const initialState = {
  deals: MOCK_DEALS,
  currentDeal: null,
  currentFramework: null,
  viewMode: 'pipeline', // 'pipeline', 'analysis', 'comparison'
  frameworkConfig: FRAMEWORK_CONFIG
};

export const DealProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dealReducer, initialState);

  // Actions
  const setDeals = useCallback((deals) => dispatch({ type: 'SET_DEALS', payload: deals }), []);
  
  const setCurrentDeal = useCallback((deal) => dispatch({ type: 'SET_CURRENT_DEAL', payload: deal }), []);
  
  const updateDeal = useCallback((deal) => dispatch({ type: 'UPDATE_DEAL', payload: deal }), []);
  
  const updateFrameworkStatus = useCallback((dealId, framework, status, score = null, recommendation = null) => {
    dispatch({ 
      type: 'UPDATE_FRAMEWORK_STATUS', 
      payload: { dealId, framework, status, score, recommendation } 
    });
  }, []);
  
  const addTeamNote = useCallback((dealId, note) => {
    dispatch({ type: 'ADD_TEAM_NOTE', payload: { dealId, note } });
  }, []);
  
  const setCurrentFramework = useCallback((framework) => dispatch({ type: 'SET_CURRENT_FRAMEWORK', payload: framework }), []);
  
  const setViewMode = useCallback((mode) => dispatch({ type: 'SET_VIEW_MODE', payload: mode }), []);

  // Computed values
  const getFrameworkProgress = useCallback((dealId) => {
    const deal = state.deals.find(d => d.id === dealId);
    if (!deal) return { completed: 0, total: 6 };
    
    const completed = Object.values(deal.frameworks).filter(f => f.status === 'completed').length;
    return { completed, total: 6 };
  }, [state.deals]);

  const getOverallScore = useCallback((dealId) => {
    const deal = state.deals.find(d => d.id === dealId);
    if (!deal) return null;
    
    const scores = Object.values(deal.frameworks)
      .filter(f => f.score !== null)
      .map(f => f.score);
    
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [state.deals]);

  const getNextFramework = useCallback((dealId) => {
    const deal = state.deals.find(d => d.id === dealId);
    if (!deal) return null;
    
    const frameworks = Object.entries(deal.frameworks);
    const nextFramework = frameworks.find(([key, framework]) => 
      framework.status === 'not_started' || framework.status === 'in_progress'
    );
    
    return nextFramework ? nextFramework[0] : null;
  }, [state.deals]);

  const value = {
    ...state,
    setDeals,
    setCurrentDeal,
    updateDeal,
    updateFrameworkStatus,
    addTeamNote,
    setCurrentFramework,
    setViewMode,
    getFrameworkProgress,
    getOverallScore,
    getNextFramework
  };

  return (
    <DealContext.Provider value={value}>
      {children}
    </DealContext.Provider>
  );
};

export const useDeal = () => {
  const context = useContext(DealContext);
  if (!context) {
    throw new Error('useDeal must be used within a DealProvider');
  }
  return context;
};

export default DealContext;