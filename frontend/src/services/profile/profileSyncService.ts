
import { supabase } from "@/integrations/supabase/client";

export async function ensureUserProfile(userId: string, email?: string, fullName?: string): Promise<boolean> {
  console.log('🔄 Ensuring profile exists for user:', userId);
  
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .maybeSingle();
    
    if (existingProfile && existingProfile.email && !existingProfile.email.includes('@pending-sync.com')) {
      console.log('✅ Profile already exists with real email for user:', userId);
      return true;
    }
    
    // If no email provided, we can't create a meaningful profile
    if (!email) {
      console.log('📧 No email provided for profile creation');
      return false;
    }
    
    // Create or update profile with real email
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: email,
        full_name: fullName || email.split('@')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });
    
    if (error) {
      console.error('❌ Error creating/updating profile for user:', userId, error);
      return false;
    }
    
    console.log('✅ Profile created/updated for user:', userId, 'with email:', email);
    return true;
  } catch (error) {
    console.error('Failed to ensure user profile:', error);
    return false;
  }
}

export async function syncAllMissingProfiles(): Promise<void> {
  console.log('🔄 Starting profile sync for missing or placeholder profiles...');
  
  try {
    // Get all company users
    const { data: companyUsers, error: usersError } = await supabase
      .from('company_users')
      .select('user_id, company_id');
    
    if (usersError) {
      console.error('❌ Error fetching company users:', usersError);
      throw new Error(`Failed to fetch company users: ${usersError.message}`);
    }
    
    console.log(`📊 Found ${companyUsers?.length || 0} company users`);
    
    // Get existing profiles
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email');
    
    if (profilesError) {
      console.error('❌ Error fetching existing profiles:', profilesError);
      throw new Error(`Failed to fetch existing profiles: ${profilesError.message}`);
    }
    
    const profileMap = new Map(existingProfiles?.map(p => [p.id, p.email]) || []);
    
    // Find users without profiles or with placeholder emails
    const usersNeedingSync = companyUsers?.filter(user => {
      const email = profileMap.get(user.user_id);
      return !email || email.includes('@pending-sync.com') || email.includes('@unknown.com');
    }) || [];
    
    if (usersNeedingSync.length === 0) {
      console.log('✅ All company users have proper profiles');
      return;
    }
    
    console.log(`🔄 Found ${usersNeedingSync.length} users needing profile sync`);
    console.log('ℹ️ Manual profile sync needed for users with missing or placeholder emails');
    console.log('💡 These users will show as "Profile Sync Pending" until their profiles are properly synced');
    
  } catch (error) {
    console.error('❌ Failed to sync missing profiles:', error);
    throw error;
  }
}
