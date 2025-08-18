
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Company, CompanyRole } from '@/types/company';
import { getUserRole } from '@/services/companyService';
import { companyCache } from '@/services/companyCache';
import { useAuth } from './AuthContext';

type CompanyContextType = {
  company: Company | null;
  userRole: CompanyRole | null;
  loading: boolean;
  refreshCompany: () => Promise<void>;
};

const CompanyContext = createContext<CompanyContextType>({
  company: null,
  userRole: null,
  loading: true,
  refreshCompany: async () => {},
});

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [userRole, setUserRole] = useState<CompanyRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadCompanyData = async () => {
    if (!user) {
      setCompany(null);
      setUserRole(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [companyData, roleData] = await Promise.all([
        companyCache.getCompany(),
        getUserRole()
      ]);
      
      setCompany(companyData);
      setUserRole(roleData);
    } catch (error) {
      console.error('Error loading company data:', error);
      setCompany(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyData();
  }, [user]);

  const refreshCompany = async () => {
    companyCache.invalidate();
    await loadCompanyData();
  };

  const value = {
    company,
    userRole,
    loading,
    refreshCompany
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};
