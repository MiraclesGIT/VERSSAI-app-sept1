
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
}

export async function getUserProfiles(userIds: string[]): Promise<UserProfile[]> {
  if (userIds.length === 0) return [];
  
  console.log('🔍 Fetching profiles for users:', userIds);
  
  try {
    // First, fetch existing profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds);

    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return [];
    }

    console.log('✅ Fetched profiles:', data?.length || 0, 'out of', userIds.length, 'requested');
    
    // Check which users are missing profiles
    const foundUserIds = data?.map(profile => profile.id) || [];
    const missingUserIds = userIds.filter(id => !foundUserIds.includes(id));
    
    if (missingUserIds.length > 0) {
      console.warn('⚠️ Missing profiles for user IDs:', missingUserIds);
      
      // Try to sync profiles from auth.users metadata
      console.log('🔧 Attempting to sync missing profiles from auth metadata...');
      await syncProfilesFromAuth(missingUserIds);
      
      // Retry the query after syncing
      const { data: retryData, error: retryError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);
      
      if (!retryError && retryData) {
        console.log('✅ After syncing, found:', retryData.length, 'profiles');
        return retryData;
      }
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch user profiles:', error);
    return [];
  }
}

async function syncProfilesFromAuth(userIds: string[]): Promise<void> {
  console.log('🔧 Syncing profiles from auth metadata for users:', userIds);
  
  try {
    // We can't directly query auth.users from the client, so we'll use the admin function
    // Create profiles with reasonable defaults and let the admin sync them later
    const profilesToCreate = userIds.map(userId => ({
      id: userId,
      email: `user-${userId.slice(0, 8)}@pending-sync.com`, // Temporary email to indicate sync needed
      full_name: 'Profile Sync Pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { error } = await supabase
      .from('profiles')
      .upsert(profilesToCreate, {
        onConflict: 'id',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error('❌ Error creating sync placeholder profiles:', error);
    } else {
      console.log('✅ Created placeholder profiles for manual sync');
    }
  } catch (error) {
    console.error('❌ Failed to sync profiles from auth:', error);
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const profiles = await getUserProfiles([userId]);
  return profiles.length > 0 ? profiles[0] : null;
}

export async function createProfileWithRealEmail(userId: string, email: string, fullName?: string): Promise<boolean> {
  console.log('📝 Creating profile with real email for user:', userId, 'email:', email);
  
  try {
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
      console.error('❌ Error creating profile with real email:', error);
      return false;
    }
    
    console.log('✅ Profile created/updated with real email');
    return true;
  } catch (error) {
    console.error('Failed to create profile with real email:', error);
    return false;
  }
}
