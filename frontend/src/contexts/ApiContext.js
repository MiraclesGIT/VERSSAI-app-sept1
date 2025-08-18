import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  
  const apiCall = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios({
        url: `${API_BASE_URL}${endpoint}`,
        method: 'GET',
        ...options
      });
      
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      setLoading(false);
      throw err;
    }
  };
  
  // API Methods
  const getDeals = () => apiCall('/api/deals');
  
  const getAcademicStats = () => apiCall('/api/academic/stats');
  
  const validateFounder = (founderName, institution = null, field = null) => {
    const params = new URLSearchParams({ founder_name: founderName });
    if (institution) params.append('founder_institution', institution);
    if (field) params.append('founder_field', field);
    return apiCall(`/api/academic/validate-founder?${params}`);
  };
  
  const getMarketResearch = (industry, technology = null, stage = null) => {
    const params = new URLSearchParams({ industry });
    if (technology) params.append('technology', technology);
    if (stage) params.append('stage', stage);
    return apiCall(`/api/academic/market-research?${params}`);
  };
  
  const findAdvisors = (industry, expertise, minHIndex = 30) => {
    const params = new URLSearchParams({ 
      industry, 
      expertise, 
      min_h_index: minHIndex 
    });
    return apiCall(`/api/academic/find-advisors?${params}`);
  };
  
  const getCompleteAnalysis = (dealId) => {
    return apiCall(`/api/deals/${dealId}/complete-academic-analysis`);
  };
  
  const value = {
    loading,
    error,
    getDeals,
    getAcademicStats,
    validateFounder,
    getMarketResearch,
    findAdvisors,
    getCompleteAnalysis
  };
  
  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};