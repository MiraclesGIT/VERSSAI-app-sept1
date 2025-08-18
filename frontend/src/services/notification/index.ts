
// Re-export all notification functionality from the new modular structure
export type { Notification } from './types';

export {
  fetchNotifications,
  markAsRead,
  getUnreadCount,
  deleteNotification
} from './api';

export {
  createProfileReadyNotification,
  createBulkUploadStartedNotification,
  createMicroDDReadyNotification,
  createDeckProcessingErrorNotification
} from './creators';
