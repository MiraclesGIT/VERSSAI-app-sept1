
import { supabase } from "@/integrations/supabase/client";

export interface ProfileSyncResult {
  synced: number;
  errors: string[];
}

export async function syncMissingProfiles(): Promise<ProfileSyncResult> {
  console.log('🔄 Starting profile sync for missing users...');
  
  try {
    // Manual approach since we don't have the RPC function
    const { data: companyUsers, error: usersError } = await supabase
      .from('company_users')
      .select('user_id');
    
    if (usersError) {
      console.error('❌ Error fetching company users:', usersError);
      return { synced: 0, errors: [usersError.message] };
    }
    
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');
    
    if (profilesError) {
      console.error('❌ Error fetching existing profiles:', profilesError);
      return { synced: 0, errors: [profilesError.message] };
    }
    
    const existingProfileIds = new Set(existingProfiles?.map(p => p.id) || []);
    const missingUserIds = companyUsers?.filter(cu => !existingProfileIds.has(cu.user_id)) || [];
    
    if (missingUserIds.length === 0) {
      console.log('✅ No missing profiles found');
      return { synced: 0, errors: [] };
    }
    
    // Create missing profiles
    const profilesToCreate = missingUserIds.map(user => ({
      id: user.user_id,
      email: `${user.user_id}@unknown.com`,
      full_name: 'Unknown User'
    }));
    
    const { error: insertError } = await supabase
      .from('profiles')
      .insert(profilesToCreate);
    
    if (insertError) {
      console.error('❌ Error creating profiles:', insertError);
      return { synced: 0, errors: [insertError.message] };
    }
    
    console.log('✅ Profile sync completed, created:', missingUserIds.length, 'profiles');
    return { synced: missingUserIds.length, errors: [] };
  } catch (error) {
    console.error('Failed to sync missing profiles:', error);
    return { synced: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}
