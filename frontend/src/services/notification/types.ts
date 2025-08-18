
export interface Notification {
  id: string;
  user_id: string;
  company_id: string;
  startup_id?: string;
  type: 'profile' | 'report' | 'upload' | 'system';
  title: string;
  description: string;
  read: boolean;
  action_url?: string;
  created_at: string;
  updated_at: string;
}
