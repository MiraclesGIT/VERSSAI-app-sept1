
import type { Notification } from '@/services/notification/types';

export const isBulkUploadNotification = (notification: Notification): boolean => {
  const content = `${notification.title} ${notification.description}`.toLowerCase();
  return content.includes('bulk upload') || 
         content.includes('processing') || 
         (content.includes('pitch deck') && content.includes('being processed'));
};

export const getActionText = (type: Notification['type'], notification: Notification): string => {
  if (isBulkUploadNotification(notification)) {
    return 'Mark as read';
  }

  const content = `${notification.title} ${notification.description}`.toLowerCase();
  
  if (content.includes('micro due diligence') || content.includes('micro dd')) {
    return 'View Micro DD';
  }
  
  // Handle all notification types including 'profile'
  if (type === 'profile') {
    return 'View Profile';
  }
  
  if (type === 'report') {
    return 'View Report';
  }
  
  if (type === 'upload') {
    return 'View Startup';
  }
  
  if (type === 'system') {
    return 'Configure Now';
  }
  
  return 'View Details';
};

export const boldStartupNames = (text: string): string => {
  const startupNamePattern = /\b[A-Z][a-zA-Z0-9]*(?:\s+[A-Z][a-zA-Z0-9]*)*(?:\s+(?:Inc|LLC|Ltd|Corp|AI|Tech|Labs|Solutions|Systems|Technologies)\.?)?/g;
  
  return text.replace(startupNamePattern, (match) => {
    const skipWords = ['The', 'For', 'And', 'Or', 'But', 'In', 'On', 'At', 'To', 'From', 'Up', 'Out', 'Down', 'Complete', 'Profile', 'Analysis', 'Ready', 'View', 'Startup', 'Report'];
    
    if (skipWords.includes(match) || match.length < 3) {
      return match;
    }
    
    return `**${match}**`;
  });
};

export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
};
