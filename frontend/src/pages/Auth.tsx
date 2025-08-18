
import React, { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { InvitationForm } from '@/components/auth/InvitationForm';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [isInvitation, setIsInvitation] = useState(false);

  useEffect(() => {
    // Check if this is an invitation flow
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    
    if (token && type === 'invite') {
      setIsInvitation(true);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {isInvitation ? <InvitationForm /> : <AuthForm />}
      </div>
    </div>
  );
};

export default Auth;
