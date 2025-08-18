
import { supabase } from '@/integrations/supabase/client';
import { validateUserCompanyAccess } from '@/services/dueDiligence/dueDiligenceSecurityService';

export interface ExtractedScores {
  team_capability_score: number;
  technical_moat_score: number;
  infrastructure_capability_score: number;
  compliance_and_risk_score: number;
  market_position_score: number;
  financial_health_score: number;
}

export const fetchScoresFromDatabase = async (startupId: string): Promise<ExtractedScores> => {
  console.log('🔍 Fetching scores from basic_due_diligence for startup ID:', startupId);
  
  // Validate company access first
  const hasAccess = await validateUserCompanyAccess(startupId);
  if (!hasAccess) {
    console.error('❌ Access denied to startup scores');
    return {
      team_capability_score: 0,
      technical_moat_score: 0,
      infrastructure_capability_score: 0,
      compliance_and_risk_score: 0,
      market_position_score: 0,
      financial_health_score: 0,
    };
  }
  
  const { data, error } = await supabase
    .from('basic_due_diligence')
    .select('team_capability_score, technical_moat_score, infrastructure_capability_score, compliance_and_risk_score, market_position_score, financial_health_score')
    .eq('startup_id', startupId)
    .limit(1)
    .maybeSingle();
    
  if (error) {
    console.error('❌ Error fetching scores from basic_due_diligence:', error);
    return {
      team_capability_score: 0,
      technical_moat_score: 0,
      infrastructure_capability_score: 0,
      compliance_and_risk_score: 0,
      market_position_score: 0,
      financial_health_score: 0,
    };
  }
  
  console.log('✅ Fetched scores from basic_due_diligence:', data);
  
  if (!data) {
    console.log('📊 No analysis data found for startup ID:', startupId);
    return {
      team_capability_score: 0,
      technical_moat_score: 0,
      infrastructure_capability_score: 0,
      compliance_and_risk_score: 0,
      market_position_score: 0,
      financial_health_score: 0,
    };
  }
  
  return {
    team_capability_score: data.team_capability_score || 0,
    technical_moat_score: data.technical_moat_score || 0,
    infrastructure_capability_score: data.infrastructure_capability_score || 0,
    compliance_and_risk_score: data.compliance_and_risk_score || 0,
    market_position_score: data.market_position_score || 0,
    financial_health_score: data.financial_health_score || 0,
  };
};

// Legacy function for backward compatibility - will be removed
export const extractScoresFromContent = (): ExtractedScores => {
  return {
    team_capability_score: 0,
    technical_moat_score: 0,
    infrastructure_capability_score: 0,
    compliance_and_risk_score: 0,
    market_position_score: 0,
    financial_health_score: 0,
  };
};
