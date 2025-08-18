
import { supabase } from "@/integrations/supabase/client";
import { triggerBasicDueDiligenceWebhook } from "./basicDueDiligence/webhook";
import { validateUserCompanyAccess } from "./dueDiligence/dueDiligenceSecurityService";
import { validateCompanyAccess, logWebhookActivity } from "./webhookSecurityService";

export interface BasicDueDiligence {
  startup_id: string;
  startup_name?: string;
  executive_summary?: string;
  final_report?: string;
  final_score?: number;
  team_capability_score?: number;
  technical_moat_score?: number;
  infrastructure_capability_score?: number;
  compliance_and_risk_score?: number;
  market_position_score?: number;
  financial_health_score?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DataRoomDueDiligence {
  startup_id: string;
  startup_name: string;
  executive_summary?: string;
  team_section?: string;
  tech_moat_section?: string;
  infrastructure_section?: string;
  compliance_section?: string;
  market_section?: string;
  finance_section?: string;
  investment_recommendations?: string;
  appendix_section?: string;
  html_executive_summary?: string;
  html_team_section?: string;
  html_tech_moat_section?: string;
  html_infrastructure_section?: string;
  html_compliance_section?: string;
  html_market_section?: string;
  html_finance_section?: string;
  html_investment_recommendations?: string;
  html_appendix_section?: string;
  created_at?: string;
  updated_at?: string;
}

export async function fetchBasicDueDiligence(startupId: string): Promise<BasicDueDiligence | null> {
  console.log('🔍 Fetching basic due diligence for startup ID:', startupId);
  
  // Validate company access first
  const hasAccess = await validateUserCompanyAccess(startupId);
  if (!hasAccess) {
    console.error('❌ Access denied to basic due diligence');
    return null;
  }
  
  const { data, error } = await supabase
    .from('basic_due_diligence')
    .select('*')
    .eq('startup_id', startupId)
    .maybeSingle();
    
  if (error) {
    console.error('❌ Error fetching basic due diligence:', error);
    return null;
  }
  
  console.log('✅ Fetched basic due diligence:', data);
  return data;
}

export async function fetchDataRoomDueDiligence(startupId: string): Promise<DataRoomDueDiligence | null> {
  console.log('🔍 Fetching data room due diligence for startup ID:', startupId);
  
  // Validate company access first
  const hasAccess = await validateUserCompanyAccess(startupId);
  if (!hasAccess) {
    console.error('❌ Access denied to data room due diligence');
    return null;
  }
  
  const { data, error } = await supabase
    .from('startup_dataroom_analysis')
    .select('*')
    .eq('startup_id', startupId)
    .maybeSingle();
    
  if (error) {
    console.error('❌ Error fetching data room due diligence:', error);
    return null;
  }
  
  console.log('✅ Fetched data room due diligence:', data);
  return data;
}

export async function triggerBasicDueDiligence(startupId: string, startupName: string): Promise<void> {
  console.log('🚀 Triggering basic due diligence for:', startupName);
  
  // Validate company access and get context
  const companyContext = await validateCompanyAccess(startupId);
  
  // Log webhook activity with company context
  logWebhookActivity('basic_due_diligence', startupId, companyContext);
  
  try {
    await triggerBasicDueDiligenceWebhook(startupId, startupName);
    console.log('✅ Basic due diligence webhook triggered successfully with company context');
  } catch (error) {
    console.error('❌ Failed to trigger basic due diligence:', error);
    throw error;
  }
}

export async function triggerDataRoomDueDiligence(
  startupId: string, 
  startupName: string, 
  dataRoomFilePaths: string[]
): Promise<void> {
  console.log('🚀 Triggering data room due diligence for:', startupName);
  
  // Validate company access and get context
  const companyContext = await validateCompanyAccess(startupId);
  
  // Log webhook activity with company context
  logWebhookActivity('data_room_due_diligence', startupId, companyContext);
  
  try {
    const { triggerDataRoomDueDiligenceWebhook } = await import('./dataRoomDueDiligence');
    await triggerDataRoomDueDiligenceWebhook(startupId, startupName, dataRoomFilePaths);
    console.log('✅ Data room due diligence webhook triggered successfully with company context');
  } catch (error) {
    console.error('❌ Failed to trigger data room due diligence:', error);
    throw error;
  }
}
