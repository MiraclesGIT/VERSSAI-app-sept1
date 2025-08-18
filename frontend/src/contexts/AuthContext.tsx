
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '@/contexts/NavigationContext';
import { checkDomainRegistration } from '@/services/companyService';
import { CompanyRegistrationResult } from '@/types/company';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  checkCompanyRegistration: (email: string) => Promise<CompanyRegistrationResult>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  checkCompanyRegistration: async () => ({ success: false }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { restoreLastVisitedPage, clearStoredRoute } = useNavigation();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (event === 'SIGNED_IN' && currentSession) {
        // Use setTimeout to prevent potential auth deadlocks
        setTimeout(() => {
          restoreLastVisitedPage();
        }, 0);
      }
      
      if (event === 'SIGNED_OUT') {
        clearStoredRoute();
        navigate('/auth');
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, restoreLastVisitedPage, clearStoredRoute]);

  const signOut = async () => {
    await supabase.auth.signOut();
    clearStoredRoute();
    navigate('/auth');
  };

  const checkCompanyRegistration = async (email: string): Promise<CompanyRegistrationResult> => {
    return await checkDomainRegistration(email);
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    checkCompanyRegistration,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
