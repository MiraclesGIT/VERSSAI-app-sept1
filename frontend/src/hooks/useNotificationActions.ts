import { useCallback, useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useToast } from '@/hooks/use-toast';
import { Notification } from '@/services/notification';

export function useNotificationActions() {
  const { markNotificationAsRead, deleteNotificationById } = useNotifications();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const bulkDelete = useCallback(async (notifications: Notification[]) => {
    if (notifications.length === 0) return;

    setIsLoading(true);
    try {
      const promises = notifications.map(notification => 
        deleteNotificationById(notification.id)
      );
      
      await Promise.all(promises);
      
      toast({
        title: "Notifications deleted",
        description: `Successfully deleted ${notifications.length} notification${notifications.length > 1 ? 's' : ''}.`,
      });
    } catch (error) {
      console.error('Failed to bulk delete notifications:', error);
      toast({
        title: "Error",
        description: "Failed to delete some notifications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [deleteNotificationById, toast]);

  const bulkMarkAsRead = useCallback(async (notifications: Notification[]) => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;

    setIsLoading(true);
    try {
      const promises = unreadNotifications.map(notification => 
        markNotificationAsRead(notification.id)
      );
      
      await Promise.all(promises);
      
      toast({
        title: "Notifications marked as read",
        description: `Successfully marked ${unreadNotifications.length} notification${unreadNotifications.length > 1 ? 's' : ''} as read.`,
      });
    } catch (error) {
      console.error('Failed to bulk mark notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark some notifications as read. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [markNotificationAsRead, toast]);

  return {
    bulkDelete,
    bulkMarkAsRead,
    isLoading
  };
}
