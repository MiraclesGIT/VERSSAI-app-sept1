
import { useState, useCallback, useMemo } from 'react';
import { Notification } from '@/services/notificationService';

export function useNotificationSelection(notifications: Notification[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(notifications.map(n => n.id)));
  }, [notifications]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === notifications.length && notifications.length > 0) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [selectedIds.size, notifications.length, selectAll, deselectAll]);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const isAllSelected = useMemo(() => 
    notifications.length > 0 && selectedIds.size === notifications.length,
    [notifications.length, selectedIds.size]
  );

  const isIndeterminate = useMemo(() => 
    selectedIds.size > 0 && selectedIds.size < notifications.length,
    [selectedIds.size, notifications.length]
  );

  const selectedCount = selectedIds.size;
  const selectedNotifications = useMemo(() => 
    notifications.filter(n => selectedIds.has(n.id)),
    [notifications, selectedIds]
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    selectedIds,
    selectedCount,
    selectedNotifications,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleSelection,
    toggleSelectAll,
    selectAll,
    deselectAll,
    clearSelection
  };
}
