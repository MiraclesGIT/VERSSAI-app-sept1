
import { supabase } from "@/integrations/supabase/client";
import { Company, CompanyRole } from "@/types/company";

export async function getUserCompany(): Promise<Company | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  console.log('🔍 Fetching company for user:', user.id);
  
  const { data, error } = await supabase
    .from('company_users')
    .select(`
      companies (
        id,
        name,
        domain,
        logo_url,
        created_at,
        updated_at,
        settings
      )
    `)
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    console.error('❌ Error fetching user company:', error);
    return null;
  }
  
  if (!data?.companies) {
    console.log('⚠️ No company found for user');
    return null;
  }
  
  const company = data.companies;
  console.log('✅ Found company:', company.name);
  
  return {
    id: company.id,
    name: company.name,
    domain: company.domain,
    logo_url: company.logo_url,
    created_at: company.created_at,
    updated_at: company.updated_at,
    settings: typeof company.settings === 'object' && company.settings !== null ? company.settings as Record<string, any> : {}
  };
}

export async function getUserRole(): Promise<CompanyRole | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  console.log('🔍 Fetching role for user:', user.id);
  
  const { data, error } = await supabase
    .from('company_users')
    .select('role')
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    console.error('❌ Error fetching user role:', error);
    return null;
  }
  
  console.log('✅ Found user role:', data?.role);
  return data?.role || null;
}
