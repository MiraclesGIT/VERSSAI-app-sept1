
import { supabase } from "@/integrations/supabase/client";
import { StartupType } from "@/components/StartupCard";
import { getUserCompany } from "./companyService";

export async function updateStartupStatus(id: string, status: 'active' | 'saved' | 'approved' | 'declined'): Promise<void> {
  console.log('🔄 Starting status update:', { id, status, timestamp: new Date().toISOString() });
  
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Authentication error:', authError);
      throw new Error('User must be authenticated to update startup status');
    }
    
    console.log('👤 User authenticated:', { userId: user.id, email: user.email });
    
    // Get user's company for additional verification
    const userCompany = await getUserCompany();
    if (!userCompany) {
      throw new Error('User must belong to a company to update startup status');
    }
    
    console.log('🏢 User company:', userCompany.name);
    
    // Execute the update with detailed error handling
    console.log('🔄 Executing update command...');
    const { data, error: updateError } = await supabase
      .from('startups')
      .update({ status })
      .eq('id', id)
      .eq('company_id', userCompany.id) // Ensure user can only update startups from their company
      .select();
    
    if (updateError) {
      console.error('❌ Error updating startup status:', updateError);
      
      // Provide specific error messages for common RLS issues
      if (updateError.code === '42501' || updateError.message.includes('permission denied')) {
        throw new Error('Permission denied: You may not have the required permissions to update startup status');
      }
      
      if (updateError.code === 'PGRST116' || updateError.message.includes('row-level security')) {
        throw new Error('Row-level security policy violation: Unable to update startup status');
      }
      
      throw new Error(`Failed to update status: ${updateError.message}`);
    }
    
    // Verify the update was successful
    if (!data || data.length === 0) {
      console.error('❌ No rows were updated');
      throw new Error('No startup was updated. The startup may not exist or you may not have permission to update it.');
    }
    
    const updatedStartup = data[0];
    console.log('✅ Status update completed successfully:', { 
      id, 
      expectedStatus: status, 
      actualStatus: updatedStartup.status,
      updatedAt: updatedStartup.updated_at,
      company: userCompany.name
    });
    
    // Final verification
    if (updatedStartup.status !== status) {
      throw new Error(`Status verification failed. Expected: ${status}, Got: ${updatedStartup.status}`);
    }
    
  } catch (error) {
    console.error('❌ Status update failed:', error);
    throw error;
  }
}

export async function updateStartupDetails(id: string, details: Partial<{
  name: string;
  founder: string;
  stage: string;
  location: string;
  industry: string;
}>): Promise<void> {
  try {
    // Get user's company for security
    const userCompany = await getUserCompany();
    if (!userCompany) {
      throw new Error('User must belong to a company to update startup details');
    }

    const { error } = await supabase
      .from('startups')
      .update(details)
      .eq('id', id)
      .eq('company_id', userCompany.id); // Ensure user can only update startups from their company
      
    if (error) {
      console.error('Error updating startup details:', error);
      throw error;
    }
  } catch (error) {
    console.error('❌ Error in updateStartupDetails:', error);
    throw error;
  }
}

export async function generateStartupScore(id: string): Promise<number> {
  try {
    // Get user's company for security
    const userCompany = await getUserCompany();
    if (!userCompany) {
      throw new Error('User must belong to a company to generate startup score');
    }

    // Simulate score generation - in real app this would call an AI service
    const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
    
    const { error } = await supabase
      .from('startups')
      .update({ readiness_score: score })
      .eq('id', id)
      .eq('company_id', userCompany.id); // Ensure user can only update startups from their company
      
    if (error) {
      console.error('Error updating startup score:', error);
      throw error;
    }
    
    return score;
  } catch (error) {
    console.error('❌ Error in generateStartupScore:', error);
    throw error;
  }
}

export const updateStartup = async (startupId: string, updates: Partial<StartupType>) => {
  try {
    // Get user's company for security
    const userCompany = await getUserCompany();
    if (!userCompany) {
      throw new Error('User must belong to a company to update startup');
    }

    const { data, error } = await supabase
      .from('startups')
      .update(updates)
      .eq('id', startupId)
      .eq('company_id', userCompany.id) // Ensure user can only update startups from their company
      .select()
      .single();

    if (error) {
      console.error('Error updating startup:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ Error in updateStartup:', error);
    throw error;
  }
};
