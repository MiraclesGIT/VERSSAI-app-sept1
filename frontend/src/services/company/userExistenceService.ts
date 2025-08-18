
import { supabase } from "@/integrations/supabase/client";

export async function checkUserExists(email: string): Promise<{ exists: boolean; message?: string }> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    console.log('🔍 Checking if user exists for email:', cleanEmail);
    
    // Check if user exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .ilike('email', cleanEmail)
      .maybeSingle();

    console.log('📋 Profile check result:', { profile, profileError });

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error checking profiles table:', profileError);
      // Don't fail the process, just continue
      return { exists: false };
    }

    if (profile) {
      console.log('✅ User exists in profiles table');
      return { 
        exists: true, 
        message: 'An account with this email already exists. Please sign in instead.' 
      };
    }

    console.log('ℹ️ User does not appear to exist in profiles');
    return { exists: false };
  } catch (error) {
    console.error('❌ Error in user existence check:', error);
    // Don't fail the process, just continue with sign-up
    return { exists: false };
  }
}
