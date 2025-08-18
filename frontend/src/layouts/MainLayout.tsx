
import React from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { UserMenu } from '@/components/auth/UserMenu';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-300">
      <Sidebar />
      <div className="ml-56 flex-1 overflow-auto pb-8">
        <div className="flex justify-end items-center gap-3 p-4">
          <ThemeSwitcher />
          <NotificationBell />
          <UserMenu />
        </div>
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
