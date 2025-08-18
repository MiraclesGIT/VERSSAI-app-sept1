
import { supabase } from "@/integrations/supabase/client";
import { getUserCompany } from "../companyService";
import { StartupProfile } from './types';
import { mapDatabaseToProfile } from './profileMapper';

export const getStartupProfile = async (startupId: string): Promise<StartupProfile | null> => {
  console.log('🔍 Fetching startup profile for:', startupId);
  
  try {
    // Get user's company for security
    const userCompany = await getUserCompany();
    if (!userCompany) {
      console.log('⚠️ No company found for user');
      return null;
    }

    const { data, error } = await supabase
      .from('startup_profiles')
      .select('*')
      .eq('startup_id', startupId)
      .eq('company_id', userCompany.id) // Ensure user can only access profiles from their company
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('📝 No profile found for startup:', startupId, 'in company:', userCompany.name);
        return null;
      }
      console.error('❌ Error fetching startup profile:', error);
      throw error;
    }

    console.log('✅ Found startup profile data:', data);
    console.log('🏢 Company:', userCompany.name);
    
    const mappedProfile = mapDatabaseToProfile(data);
    console.log('🔄 Mapped profile data:', mappedProfile);
    
    return mappedProfile;
  } catch (error) {
    console.error('❌ Error in getStartupProfile:', error);
    return null;
  }
};
