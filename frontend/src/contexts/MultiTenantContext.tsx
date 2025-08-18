import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Organization {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    fontFamily: string;
  };
  settings: {
    features: string[];
    limits: {
      users: number;
      workflows: number;
      storage: string;
    };
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'SuperAdmin' | 'VC_Partner' | 'Analyst' | 'Founder';
  organizationId: string;
  avatar?: string;
  permissions: string[];
}

interface MultiTenantContextType {
  currentUser: User | null;
  currentOrganization: Organization | null;
  organizations: Organization[];
  users: User[];
  switchOrganization: (orgId: string) => void;
  updateBranding: (branding: Partial<Organization['branding']>) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  removeUser: (userId: string) => void;
  updateUserRole: (userId: string, role: User['role']) => void;
}

const MultiTenantContext = createContext<MultiTenantContextType | undefined>(undefined);

export const useMultiTenant = () => {
  const context = useContext(MultiTenantContext);
  if (!context) {
    throw new Error('useMultiTenant must be used within a MultiTenantProvider');
  }
  return context;
};

interface MultiTenantProviderProps {
  children: ReactNode;
}

export const MultiTenantProvider: React.FC<MultiTenantProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Initialize with mock data
  useEffect(() => {
    const mockOrganizations: Organization[] = [
      {
        id: 'org_1',
        name: 'Sequoia Capital',
        domain: 'sequoiacap.com',
        logo: '/logos/sequoia.png',
        branding: {
          primaryColor: '#1f2937',
          secondaryColor: '#3b82f6',
          backgroundColor: '#f9fafb',
          fontFamily: 'Inter'
        },
        settings: {
          features: ['founder_signal', 'due_diligence', 'portfolio_management', 'competitive_intelligence'],
          limits: {
            users: 100,
            workflows: 1000,
            storage: '100GB'
          }
        }
      },
      {
        id: 'org_2',
        name: 'Andreessen Horowitz',
        domain: 'a16z.com',
        logo: '/logos/a16z.png',
        branding: {
          primaryColor: '#7c3aed',
          secondaryColor: '#f59e0b',
          backgroundColor: '#faf5ff',
          fontFamily: 'Inter'
        },
        settings: {
          features: ['founder_signal', 'due_diligence', 'portfolio_management', 'competitive_intelligence', 'fund_allocation', 'lp_communication'],
          limits: {
            users: 200,
            workflows: 2000,
            storage: '500GB'
          }
        }
      }
    ];

    const mockUsers: User[] = [
      {
        id: 'user_1',
        email: 'alex@sequoiacap.com',
        name: 'Alex Chen',
        role: 'SuperAdmin',
        organizationId: 'org_1',
        permissions: ['*']
      },
      {
        id: 'user_2',
        email: 'sarah@sequoiacap.com',
        name: 'Sarah Williams',
        role: 'VC_Partner',
        organizationId: 'org_1',
        permissions: ['workflows:read', 'workflows:execute', 'reports:read']
      },
      {
        id: 'user_3',
        email: 'marc@a16z.com',
        name: 'Marc Rodriguez',
        role: 'SuperAdmin',
        organizationId: 'org_2',
        permissions: ['*']
      }
    ];

    setOrganizations(mockOrganizations);
    setUsers(mockUsers);
    setCurrentUser(mockUsers[0]);
    setCurrentOrganization(mockOrganizations[0]);
  }, []);

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      // Apply branding
      document.documentElement.style.setProperty('--primary-color', org.branding.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', org.branding.secondaryColor);
      document.documentElement.style.setProperty('--background-color', org.branding.backgroundColor);
    }
  };

  const updateBranding = (branding: Partial<Organization['branding']>) => {
    if (!currentOrganization) return;
    
    const updatedOrg = {
      ...currentOrganization,
      branding: { ...currentOrganization.branding, ...branding }
    };
    
    setCurrentOrganization(updatedOrg);
    setOrganizations(orgs => orgs.map(org => 
      org.id === updatedOrg.id ? updatedOrg : org
    ));
    
    // Apply new branding
    Object.entries(branding).forEach(([key, value]) => {
      if (key === 'primaryColor') document.documentElement.style.setProperty('--primary-color', value);
      if (key === 'secondaryColor') document.documentElement.style.setProperty('--secondary-color', value);
      if (key === 'backgroundColor') document.documentElement.style.setProperty('--background-color', value);
    });
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`
    };
    setUsers(prev => [...prev, newUser]);
  };

  const removeUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const updateUserRole = (userId: string, role: User['role']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role } : user
    ));
  };

  const value: MultiTenantContextType = {
    currentUser,
    currentOrganization,
    organizations,
    users,
    switchOrganization,
    updateBranding,
    addUser,
    removeUser,
    updateUserRole,
  };

  return (
    <MultiTenantContext.Provider value={value}>
      {children}
    </MultiTenantContext.Provider>
  );
};

export default MultiTenantProvider;