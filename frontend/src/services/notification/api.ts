
import { supabase } from "@/integrations/supabase/client";
import { companyCache } from "../companyCache";
import { Notification } from "./types";

export async function fetchNotifications(userOnly: boolean = true): Promise<Notification[]> {
  console.log('📬 Fetching notifications for user company', userOnly ? '(user-specific)' : '(all company)');
  
  // Get current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('❌ No authenticated user found:', userError);
    return [];
  }

  // Use company cache instead of direct API call
  const company = await companyCache.getCompany();
  if (!company) {
    console.error('❌ No company found for user');
    return [];
  }
  
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('company_id', company.id);
  
  // Add user filter if requested
  if (userOnly) {
    query = query.eq('user_id', user.id);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
    
  if (error) {
    console.error('❌ Error fetching notifications:', error);
    throw error;
  }
  
  console.log('✅ Fetched notifications:', data?.length || 0, userOnly ? '(user-specific)' : '(all company)');
  return (data || []) as Notification[];
}

export async function markAsRead(notificationId: string): Promise<void> {
  console.log('👁️ Marking notification as read:', notificationId);
  
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
    
  if (error) {
    console.error('❌ Error marking notification as read:', error);
    throw error;
  }
  
  console.log('✅ Notification marked as read');
}

export async function getUnreadCount(userOnly: boolean = true): Promise<number> {
  // Get current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('❌ No authenticated user found for unread count:', userError);
    return 0;
  }

  // Use company cache instead of direct API call
  const company = await companyCache.getCompany();
  if (!company) {
    console.error('❌ No company found for user');
    return 0;
  }
  
  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company.id)
    .eq('read', false);
  
  // Add user filter if requested
  if (userOnly) {
    query = query.eq('user_id', user.id);
  }
  
  const { count, error } = await query;
    
  if (error) {
    console.error('❌ Error getting unread count:', error);
    return 0;
  }
  
  return count || 0;
}

export async function deleteNotification(notificationId: string): Promise<void> {
  console.log('🗑️ Deleting notification:', notificationId);
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
    
  if (error) {
    console.error('❌ Error deleting notification:', error);
    throw error;
  }
  
  console.log('✅ Notification deleted');
}
