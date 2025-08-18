
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchNotifications, getUnreadCount, markAsRead, deleteNotification, Notification } from '@/services/notification';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useCompany } from './CompanyContext';
import { useToast } from '@/hooks/use-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  showMyNotificationsOnly: boolean;
  setShowMyNotificationsOnly: (showMyOnly: boolean) => void;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  deleteNotificationById: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'notifications_show_my_only';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMyNotificationsOnly, setShowMyNotificationsOnlyState] = useState(() => {
    // Default to true (show only my notifications), but check localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : true;
  });
  
  const { user } = useAuth();
  const { company } = useCompany();
  const { toast } = useToast();

  const setShowMyNotificationsOnly = useCallback((showMyOnly: boolean) => {
    setShowMyNotificationsOnlyState(showMyOnly);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(showMyOnly));
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!user || !company) return;
    
    try {
      setLoading(true);
      const [notificationsData, unreadCountData] = await Promise.all([
        fetchNotifications(showMyNotificationsOnly),
        getUnreadCount(showMyNotificationsOnly)
      ]);
      
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, company, showMyNotificationsOnly]);

  const markNotificationAsRead = useCallback(async (id: string) => {
    try {
      await markAsRead(id);
      
      // Update local state optimistically
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const deleteNotificationById = useCallback(async (id: string) => {
    try {
      await deleteNotification(id);
      
      // Remove from local state optimistically
      setNotifications(prev => {
        const notification = prev.find(n => n.id === id);
        const newNotifications = prev.filter(n => n.id !== id);
        
        // Update unread count if the deleted notification was unread
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        return newNotifications;
      });
      
      toast({
        title: "Notification deleted",
        description: "The notification has been removed from your inbox.",
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Refresh notifications when the filter changes
  useEffect(() => {
    if (user && company) {
      refreshNotifications();
    }
  }, [refreshNotifications, showMyNotificationsOnly]);

  useEffect(() => {
    if (!user || !company) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    refreshNotifications();

    // Set up real-time subscription for company-specific notifications with improved debouncing
    let refreshTimeout: NodeJS.Timeout | null = null;
    
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `company_id=eq.${company.id}`
        },
        (payload) => {
          console.log('📬 Notification change detected:', { 
            eventType: payload.eventType, 
            startupId: payload.new && typeof payload.new === 'object' ? (payload.new as any).startup_id : null,
            title: payload.new && typeof payload.new === 'object' ? (payload.new as any).title : null,
            userId: payload.new && typeof payload.new === 'object' ? (payload.new as any).user_id : null,
            timestamp: new Date().toISOString()
          });
          
          // Show toast for new notifications only if they're for the current user (when in user-only mode)
          if (payload.eventType === 'INSERT' && payload.new && typeof payload.new === 'object') {
            const newNotification = payload.new as Notification;
            const shouldShowToast = !showMyNotificationsOnly || newNotification.user_id === user.id;
            
            if (shouldShowToast) {
              toast({
                title: newNotification.title,
                description: newNotification.description,
                duration: 5000,
              });
            }
          }
          
          // Clear existing timeout to prevent multiple refreshes
          if (refreshTimeout) {
            clearTimeout(refreshTimeout);
            refreshTimeout = null;
          }
          
          // Debounced refresh with longer delay to prevent excessive API calls
          refreshTimeout = setTimeout(() => {
            console.log('🔄 Refreshing notifications after real-time event');
            refreshNotifications();
            refreshTimeout = null;
          }, 2000); // Increased delay to 2 seconds
        }
      )
      .subscribe();

    return () => {
      // Clear timeout on cleanup
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
        refreshTimeout = null;
      }
      supabase.removeChannel(channel);
    };
  }, [user, company, toast, refreshNotifications, showMyNotificationsOnly]);

  const value = {
    notifications,
    unreadCount,
    loading,
    showMyNotificationsOnly,
    setShowMyNotificationsOnly,
    refreshNotifications,
    markNotificationAsRead,
    deleteNotificationById
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
