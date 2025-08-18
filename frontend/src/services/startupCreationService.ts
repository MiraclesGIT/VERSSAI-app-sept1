
import { supabase } from "@/integrations/supabase/client";
import { StartupData, StartupFormState } from "@/types/startup";
import { getUserCompany } from "./companyService";

// Generate random color for startup logo
const generateRandomColor = () => {
  const colors = [
    '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', 
    '#EC4899', '#6366F1', '#84CC16', '#F97316', '#14B8A6'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate initials from startup name
const generateInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export const createStartup = async (startupData: StartupFormState): Promise<StartupData> => {
  console.log('🚀 Creating new startup:', startupData.name);
  
  try {
    // Get user's company to associate with the startup
    const userCompany = await getUserCompany();
    if (!userCompany) {
      throw new Error('User must belong to a company to create startups');
    }

    console.log('🏢 Creating startup for company:', userCompany.name);

    // Generate logo details
    const logoInitials = generateInitials(startupData.name);
    const logoColor = generateRandomColor();
    
    // Prepare startup data with company association (without contact fields)
    const newStartupData = {
      name: startupData.name,
      founder: null,
      stage: null,
      location: null,
      industry: null,
      founded_date: null,
      website: startupData.website || null,
      logo_initials: logoInitials,
      logo_color: logoColor,
      status: 'active',
      company_id: userCompany.id
      // Note: readiness_score will use the database default value of 0
    };

    console.log('📝 Inserting startup data:', { ...newStartupData, company: userCompany.name });

    const { data, error } = await supabase
      .from('startups')
      .insert([newStartupData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating startup:', error);
      throw error;
    }

    console.log('✅ Startup created successfully:', data.name, 'for company:', userCompany.name);

    // Create corresponding startup profile with company association and contact fields
    const profileData = {
      startup_id: data.id,
      company_id: userCompany.id,
      startup_name: data.name,
      primary_contact_first_name: startupData.contactFirstName || null,
      primary_contact_last_name: startupData.contactLastName || null,
      primary_contact_email: startupData.contactEmail || null
    };

    const { error: profileError } = await supabase
      .from('startup_profiles')
      .insert([profileData]);

    if (profileError) {
      console.error('❌ Error creating startup profile:', profileError);
      console.log('⚠️ Continuing without profile creation');
    } else {
      console.log('✅ Startup profile created successfully for company:', userCompany.name);
    }

    return {
      id: data.id,
      name: data.name,
      founder: data.founder,
      stage: data.stage,
      location: data.location,
      industry: data.industry,
      founded_date: data.founded_date,
      website: data.website,
      contactFirstName: startupData.contactFirstName,
      contactLastName: startupData.contactLastName,
      contactEmail: startupData.contactEmail,
      readiness_score: data.readiness_score || 0,
      logo_initials: data.logo_initials,
      logo_color: data.logo_color,
      created_at: data.created_at,
      updated_at: data.updated_at,
      company_id: data.company_id,
      status: data.status
    };

  } catch (error) {
    console.error('❌ Failed to create startup:', error);
    throw error;
  }
};

export const createStartupFromDeck = async (
  name: string, 
  deckFilePath: string,
  contactInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }
): Promise<StartupData> => {
  console.log('📄 Creating startup from deck:', { name, deckFilePath });
  
  try {
    // Get user's company to associate with the startup
    const userCompany = await getUserCompany();
    if (!userCompany) {
      throw new Error('User must belong to a company to create startups');
    }

    console.log('🏢 Creating startup from deck for company:', userCompany.name);

    const logoInitials = generateInitials(name);
    const logoColor = generateRandomColor();
    
    // Prepare startup data without contact fields
    const startupData = {
      name,
      founder: null,
      stage: null,
      location: null,
      industry: null,
      founded_date: null,
      website: null,
      deck_file_path: deckFilePath,
      logo_initials: logoInitials,
      logo_color: logoColor,
      status: 'active',
      company_id: userCompany.id
      // Note: readiness_score will use the database default value of 0
    };

    console.log('📝 Inserting startup from deck:', { ...startupData, company: userCompany.name });

    const { data, error } = await supabase
      .from('startups')
      .insert([startupData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating startup from deck:', error);
      throw error;
    }

    console.log('✅ Startup created from deck successfully:', data.name, 'for company:', userCompany.name);

    // Create corresponding startup profile with company association and contact fields
    const profileData = {
      startup_id: data.id,
      company_id: userCompany.id,
      startup_name: data.name,
      primary_contact_first_name: contactInfo?.firstName || null,
      primary_contact_last_name: contactInfo?.lastName || null,
      primary_contact_email: contactInfo?.email || null
    };

    const { error: profileError } = await supabase
      .from('startup_profiles')
      .insert([profileData]);

    if (profileError) {
      console.error('❌ Error creating startup profile from deck:', profileError);
      console.log('⚠️ Continuing without profile creation');
    } else {
      console.log('✅ Startup profile from deck created successfully for company:', userCompany.name);
    }

    return {
      id: data.id,
      name: data.name,
      deck_file_path: data.deck_file_path,
      contactFirstName: contactInfo?.firstName,
      contactLastName: contactInfo?.lastName,
      contactEmail: contactInfo?.email,
      readiness_score: data.readiness_score || 0,
      logo_initials: data.logo_initials,
      logo_color: data.logo_color,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

  } catch (error) {
    console.error('❌ Failed to create startup from deck:', error);
    throw error;
  }
};
