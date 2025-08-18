export type FeedbackCategory = 'bug' | 'feature_request' | 'improvement' | 'question' | 'other';

export type FeedbackPriority = 'critical' | 'high' | 'medium' | 'low';

export type FeedbackStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'duplicate';

export interface FeedbackAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  company_id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  attachments: FeedbackAttachment[];
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackData {
  title: string;
  description: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  attachments?: File[];
}

export interface UpdateFeedbackData {
  title?: string;
  description?: string;
  category?: FeedbackCategory;
  priority?: FeedbackPriority;
  status?: FeedbackStatus;
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
}

export const FEEDBACK_CATEGORIES: Array<{ value: FeedbackCategory; label: string }> = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'question', label: 'Question' },
  { value: 'other', label: 'Other' }
];

export const FEEDBACK_PRIORITIES: Array<{ value: FeedbackPriority; label: string }> = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

export const FEEDBACK_STATUSES: Array<{ value: FeedbackStatus; label: string }> = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'duplicate', label: 'Duplicate' }
];