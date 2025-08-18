
import { supabase } from "@/integrations/supabase/client";
import { getUserCompany } from "./companyService";

export interface CompanyContext {
  id: string;
  name: string;
}

export async function validateCompanyAccess(startupId: string): Promise<CompanyContext> {
  console.log('🔒 Validating company access for startup:', startupId);
  
  // Get user's company
  const userCompany = await getUserCompany();
  if (!userCompany) {
    throw new Error('User must belong to a company');
  }

  // Verify startup belongs to user's company
  const { data: startup, error } = await supabase
    .from('startups')
    .select('company_id')
    .eq('id', startupId)
    .single();

  if (error) {
    console.error('❌ Error fetching startup:', error);
    throw new Error('Failed to verify startup access');
  }

  if (startup.company_id !== userCompany.id) {
    console.error('❌ Startup does not belong to user company');
    throw new Error('Access denied: Startup does not belong to your company');
  }

  console.log('✅ Company access validated for:', userCompany.name);
  return userCompany;
}

export async function getStartupCompanyContext(startupId: string): Promise<CompanyContext> {
  console.log('🔍 Fetching company context for startup:', startupId);
  
  const { data: startup, error } = await supabase
    .from('startups')
    .select('company_id, companies!inner(name)')
    .eq('id', startupId)
    .single();

  if (error || !startup) {
    console.error('❌ Failed to fetch startup company data:', error);
    throw new Error('Failed to fetch startup company information');
  }

  if (!startup.company_id) {
    throw new Error('Startup must be associated with a company');
  }

  return {
    id: startup.company_id,
    name: startup.companies?.name || 'Unknown Company'
  };
}

export function logWebhookActivity(
  webhookType: string, 
  startupId: string, 
  companyContext: CompanyContext
): void {
  console.log(`📊 Webhook Activity Log:`, {
    type: webhookType,
    startupId,
    companyId: companyContext.id,
    companyName: companyContext.name,
    timestamp: new Date().toISOString()
  });
}
