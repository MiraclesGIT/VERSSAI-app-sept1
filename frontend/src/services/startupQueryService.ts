
import { supabase } from "@/integrations/supabase/client";
import { StartupType } from "@/components/StartupCard";
import { getUserCompany } from "./companyService";

export async function fetchStartups(): Promise<StartupType[]> {
  console.log('🔍 Fetching startups for current user company...');
  
  try {
    // Get user's company first
    const userCompany = await getUserCompany();
    if (!userCompany) {
      console.log('⚠️ No company found for user');
      return [];
    }

    console.log('🏢 Fetching startups for company:', userCompany.name);
    
    const { data, error } = await supabase
      .from('startups')
      .select('*')
      .eq('company_id', userCompany.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('❌ Error fetching startups:', error);
      throw error;
    }
    
    console.log('✅ Fetched startups:', data?.length || 0, 'records for company', userCompany.name);
    
    // Format the data to match the StartupType
    return (data || []).map(startup => ({
      id: startup.id,
      name: startup.name,
      founder: startup.founder || "Unknown",
      stage: startup.stage || "Unknown",
      location: startup.location || "Unknown",
      readinessScore: startup.readiness_score || 0,
      industry: startup.industry || "Unknown",
      foundedDate: startup.founded_date ? new Date(startup.founded_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short'
      }) : "Unknown",
      logoInitials: startup.logo_initials,
      logoColor: startup.logo_color,
      status: (startup.status || 'active') as 'active' | 'saved' | 'approved' | 'declined',
      deck_file_path: startup.deck_file_path,
      deck_data: startup.deck_data,
      website: startup.website,
      logo_url: startup.logo_url,
      data_room_file_paths: startup.data_room_file_paths || [],
      company_id: startup.company_id
    }));
  } catch (error) {
    console.error('❌ Error in fetchStartups:', error);
    throw error;
  }
}

export async function fetchStartupById(id: string): Promise<StartupType | null> {
  console.log('🔍 Fetching startup by ID:', id);
  
  try {
    // Get user's company first for security
    const userCompany = await getUserCompany();
    if (!userCompany) {
      console.log('⚠️ No company found for user');
      return null;
    }

    const { data, error } = await supabase
      .from('startups')
      .select('*')
      .eq('id', id)
      .eq('company_id', userCompany.id)
      .maybeSingle();
      
    if (error) {
      console.error('❌ Error fetching startup by ID:', error);
      return null;
    }
    
    if (!data) {
      console.log('⚠️ No startup found with ID:', id, 'for company:', userCompany.name);
      return null;
    }
    
    console.log('✅ Found startup:', data.name, 'for company:', userCompany.name);
    
    // Format the data to match the StartupType
    return {
      id: data.id,
      name: data.name,
      founder: data.founder || "Unknown",
      stage: data.stage || "Unknown",
      location: data.location || "Unknown",
      readinessScore: data.readiness_score || 0,
      industry: data.industry || "Unknown",
      foundedDate: data.founded_date ? new Date(data.founded_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short'
      }) : "Unknown",
      logoInitials: data.logo_initials,
      logoColor: data.logo_color,
      status: (data.status || 'active') as 'active' | 'saved' | 'approved' | 'declined',
      deck_file_path: data.deck_file_path,
      deck_data: data.deck_data,
      website: data.website,
      logo_url: data.logo_url,
      data_room_file_paths: data.data_room_file_paths || [],
      company_id: data.company_id
    };
  } catch (error) {
    console.error('❌ Error in fetchStartupById:', error);
    return null;
  }
}
