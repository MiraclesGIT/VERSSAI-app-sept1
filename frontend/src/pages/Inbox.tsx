
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import InboxFilters from '@/components/InboxFilters';
import InboxBulkActions from '@/components/InboxBulkActions';
import InboxPagination from '@/components/InboxPagination';
import InboxNotificationList from '@/components/InboxNotificationList';
import { Settings } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useToast } from '@/hooks/use-toast';
import { useNotificationSelection } from '@/hooks/useNotificationSelection';
import { usePagination } from '@/hooks/usePagination';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { isBulkUploadNotification } from '@/utils/notificationUtils';

const Inbox = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    notifications, 
    loading, 
    showMyNotificationsOnly, 
    setShowMyNotificationsOnly,
    markNotificationAsRead, 
    deleteNotificationById 
  } = useNotifications();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Memoized filter function to prevent unnecessary recalculations
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const titleMatch = notification.title.toLowerCase().includes(searchLower);
        const descriptionMatch = notification.description.toLowerCase().includes(searchLower);
        if (!titleMatch && !descriptionMatch) return false;
      }

      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(notification.type)) {
        return false;
      }

      // Unread filter
      if (showUnreadOnly && notification.read) {
        return false;
      }

      return true;
    });
  }, [notifications, searchQuery, selectedTypes, showUnreadOnly]);

  // Pagination
  const pagination = usePagination({
    totalItems: filteredNotifications.length,
    itemsPerPage: 25
  });

  // Adjust pagination when filtered notifications change
  useEffect(() => {
    pagination.adjustPageForNewTotal(filteredNotifications.length);
  }, [filteredNotifications.length, pagination]);

  // Get current page notifications
  const currentPageNotifications = useMemo(() => {
    return filteredNotifications.slice(pagination.startIndex, pagination.endIndex);
  }, [filteredNotifications, pagination.startIndex, pagination.endIndex]);

  // Selection (only for current filtered notifications, not paginated)
  const selection = useNotificationSelection(filteredNotifications);
  
  // Actions
  const actions = useNotificationActions();

  // Memoized handlers to prevent unnecessary re-renders
  const handleBulkDelete = useCallback(async () => {
    await actions.bulkDelete(selection.selectedNotifications);
    selection.clearSelection();
  }, [actions, selection]);

  const handleBulkMarkAsRead = useCallback(async () => {
    await actions.bulkMarkAsRead(selection.selectedNotifications);
  }, [actions, selection]);

  const handleAction = useCallback(async (notification: any) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);
      }

      if (isBulkUploadNotification(notification)) {
        toast({
          title: "Notification marked as read",
          description: "The notification has been marked as read.",
        });
        return;
      }

      // Use action_url if it exists, otherwise fallback to micro-dd for legacy report notifications
      if (notification.action_url) {
        navigate(notification.action_url);
      } else if (notification.type === 'report' && notification.startup_id) {
        // Fallback for legacy micro due diligence notifications without action_url
        navigate(`/startup/${notification.startup_id}/micro-dd`);
      } else {
        toast({
          title: `Action completed`,
          description: `Action performed for: ${notification.title}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process notification action",
        variant: "destructive"
      });
    }
  }, [markNotificationAsRead, navigate, toast]);

  const handleDelete = useCallback(async (notificationId: string) => {
    await deleteNotificationById(notificationId);
  }, [deleteNotificationById]);

  if (loading) {
    return (
      <div className="px-4 py-6">
        <Header title="Inbox" subtitle="Notifications and updates" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <Header title="Inbox" subtitle="Notifications and updates" />
      
      <InboxFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        showUnreadOnly={showUnreadOnly}
        setShowUnreadOnly={setShowUnreadOnly}
        totalCount={notifications.length}
        filteredCount={filteredNotifications.length}
        isAllSelected={selection.isAllSelected}
        isIndeterminate={selection.isIndeterminate}
        onToggleSelectAll={selection.toggleSelectAll}
        selectedCount={selection.selectedCount}
        showMyNotificationsOnly={showMyNotificationsOnly}
        setShowMyNotificationsOnly={setShowMyNotificationsOnly}
      />

      <InboxBulkActions
        selectedNotifications={selection.selectedNotifications}
        onBulkDelete={handleBulkDelete}
        onBulkMarkAsRead={handleBulkMarkAsRead}
        onClearSelection={selection.clearSelection}
        isLoading={actions.isLoading}
      />
      
      {currentPageNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {notifications.length === 0 ? 'No notifications yet' : 'No notifications match your filters'}
          </h3>
          <p className="text-muted-foreground">
            {notifications.length === 0 
              ? "You'll see updates and notifications here when they arrive."
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
        </div>
      ) : (
        <>
          <InboxNotificationList
            notifications={currentPageNotifications}
            selectedIds={selection.selectedIds}
            onToggleSelection={selection.toggleSelection}
            onAction={handleAction}
            onDelete={handleDelete}
          />

          <InboxPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
            canGoNext={pagination.canGoNext}
            canGoPrevious={pagination.canGoPrevious}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            totalItems={filteredNotifications.length}
          />
        </>
      )}
    </div>
  );
};

export default Inbox;
