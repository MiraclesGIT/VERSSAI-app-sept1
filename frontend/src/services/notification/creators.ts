
import { supabase } from "@/integrations/supabase/client";
import { companyCache } from "../companyCache";

async function getAuthenticatedUserAndCompany() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('❌ No authenticated user found:', userError);
    throw new Error('No authenticated user found');
  }

  // Use company cache instead of direct API call
  const company = await companyCache.getCompany();
  if (!company) {
    console.error('❌ No company found for user');
    throw new Error('No company found for user');
  }

  return { user, company };
}

export async function createProfileReadyNotification(startupId: string, startupName: string): Promise<void> {
  console.log('📝 Creating profile ready notification for:', startupName);
  
  const { user, company } = await getAuthenticatedUserAndCompany();
  
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: user.id,
      company_id: company.id,
      startup_id: startupId,
      type: 'profile' as const,
      title: 'Startup Profile Ready',
      description: `The complete profile analysis for ${startupName} has been processed and is ready to view.`,
      action_url: `/startup/${startupId}`,
      read: false
    });
    
  if (error) {
    console.error('❌ Error creating profile notification:', error);
    throw error;
  }
  
  console.log('✅ Profile ready notification created');
}

export async function createBulkUploadStartedNotification(fileCount: number): Promise<void> {
  console.log('📝 Creating bulk upload started notification for', fileCount, 'files');
  
  const { user, company } = await getAuthenticatedUserAndCompany();
  
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: user.id,
      company_id: company.id,
      type: 'upload' as const,
      title: 'Bulk Upload Processing',
      description: `${fileCount} pitch deck${fileCount > 1 ? 's are' : ' is'} being processed. You'll receive notifications when startup profiles are ready.`,
      action_url: '/inbox',
      read: false
    });
    
  if (error) {
    console.error('❌ Error creating bulk upload notification:', error);
    throw error;
  }
  
  console.log('✅ Bulk upload started notification created');
}

export async function createMicroDDReadyNotification(startupId: string, startupName: string): Promise<void> {
  console.log('📝 Creating micro DD ready notification for:', startupName);
  
  const { user, company } = await getAuthenticatedUserAndCompany();
  
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: user.id,
      company_id: company.id,
      startup_id: startupId,
      type: 'report' as const,
      title: 'Micro Due Diligence Complete',
      description: `The micro due diligence analysis for ${startupName} has been completed and is ready to review.`,
      action_url: `/startup/${startupId}/micro-dd`,
      read: false
    });
    
  if (error) {
    console.error('❌ Error creating micro DD notification:', error);
    throw error;
  }
  
  console.log('✅ Micro DD ready notification created');
}

export async function createDeckProcessingErrorNotification(
  fileName: string, 
  errorMessage: string, 
  startupId?: string
): Promise<void> {
  console.log('📝 Creating deck processing error notification for:', fileName);
  
  const { user, company } = await getAuthenticatedUserAndCompany();
  
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: user.id,
      company_id: company.id,
      startup_id: startupId || null,
      type: 'system' as const,
      title: 'Deck Processing Error',
      description: `Failed to process "${fileName}": ${errorMessage}`,
      action_url: '/inbox',
      read: false
    });
    
  if (error) {
    console.error('❌ Error creating deck processing error notification:', error);
    throw error;
  }
  
  console.log('✅ Deck processing error notification created');
}
