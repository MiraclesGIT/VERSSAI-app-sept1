
import { supabase } from "@/integrations/supabase/client";
import { getUserCompany } from "../companyService";
import { StartupProfile } from './types';
import { mapDatabaseToProfile } from './profileMapper';

export const createStartupProfile = async (startupId: string, profileData: any): Promise<StartupProfile> => {
  console.log('📝 Creating startup profile for:', startupId);
  
  try {
    // Get user's company to associate with the profile
    const userCompany = await getUserCompany();
    if (!userCompany) {
      throw new Error('User must belong to a company to create startup profiles');
    }

    const insertData = {
      startup_id: startupId,
      company_id: userCompany.id, // Associate with user's company
      startup_name: profileData.startup_name || profileData.name || 'Unknown',
      ...profileData
    };

    console.log('📝 Inserting profile data for company:', userCompany.name);

    const { data, error } = await supabase
      .from('startup_profiles')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating startup profile:', error);
      throw error;
    }

    console.log('✅ Startup profile created successfully for company:', userCompany.name);
    return mapDatabaseToProfile(data);
  } catch (error) {
    console.error('❌ Error in createStartupProfile:', error);
    throw error;
  }
};

export const updateStartupProfile = async (startupId: string, updates: Partial<StartupProfile>): Promise<StartupProfile> => {
  console.log('🔄 Updating startup profile for:', startupId);
  
  try {
    // Get user's company for security
    const userCompany = await getUserCompany();
    if (!userCompany) {
      throw new Error('User must belong to a company to update startup profiles');
    }

    const { data, error } = await supabase
      .from('startup_profiles')
      .update(updates)
      .eq('startup_id', startupId)
      .eq('company_id', userCompany.id) // Ensure user can only update profiles from their company
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating startup profile:', error);
      throw error;
    }

    console.log('✅ Startup profile updated successfully for company:', userCompany.name);
    return mapDatabaseToProfile(data);
  } catch (error) {
    console.error('❌ Error in updateStartupProfile:', error);
    throw error;
  }
};

export const deleteStartupProfile = async (startupId: string): Promise<void> => {
  console.log('🗑️ Deleting startup profile for:', startupId);
  
  try {
    // Get user's company for security
    const userCompany = await getUserCompany();
    if (!userCompany) {
      throw new Error('User must belong to a company to delete startup profiles');
    }

    const { error } = await supabase
      .from('startup_profiles')
      .delete()
      .eq('startup_id', startupId)
      .eq('company_id', userCompany.id); // Ensure user can only delete profiles from their company

    if (error) {
      console.error('❌ Error deleting startup profile:', error);
      throw error;
    }

    console.log('✅ Startup profile deleted successfully for company:', userCompany.name);
  } catch (error) {
    console.error('❌ Error in deleteStartupProfile:', error);
    throw error;
  }
};
