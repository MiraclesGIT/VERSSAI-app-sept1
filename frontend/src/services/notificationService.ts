
// This file now serves as a compatibility layer for existing imports
// All functionality has been moved to the notification/ directory

export type { Notification } from './notification';

export {
  fetchNotifications,
  markAsRead,
  getUnreadCount,
  deleteNotification,
  createProfileReadyNotification,
  createBulkUploadStartedNotification,
  createMicroDDReadyNotification,
  createDeckProcessingErrorNotification
} from './notification';
