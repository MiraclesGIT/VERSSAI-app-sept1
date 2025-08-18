
import { supabase } from "@/integrations/supabase/client";
import { StartupProfile, updateStartupProfile, getStartupProfile, createStartupProfile } from "./startupProfileService";
import { BasicDueDiligenceReport } from "./basicDueDiligence/types";

export interface ProfileEnrichmentData {
  // Overview section
  elevator_pitch?: string;
  problem_solving?: string;
  unique_selling_proposition?: string;
  
  // Team section
  team_competence_in_ai_and_product_development?: string;
  
  // Business section
  business_model?: string;
  target_audience?: string;
  competitors?: string;
  growth_strategy_and_market_readiness?: string;
  
  // Technology section
  ai_technology_type?: string;
  ai_technical_robustness_and_innovation?: string;
}

export const extractDataFromBasicDD = (basicDD: BasicDueDiligenceReport): ProfileEnrichmentData => {
  const enrichmentData: ProfileEnrichmentData = {};

  // Extract team information
  if (basicDD.team_capability_analysis) {
    enrichmentData.team_competence_in_ai_and_product_development = basicDD.team_capability_analysis;
  }

  // Extract technology information
  if (basicDD.technical_moat_analysis) {
    enrichmentData.ai_technical_robustness_and_innovation = basicDD.technical_moat_analysis;
  }

  // Extract market/business information
  if (basicDD.market_position_analysis) {
    // Try to extract target audience info from market analysis
    const marketText = basicDD.market_position_analysis.toLowerCase();
    if (marketText.includes('target') || marketText.includes('audience') || marketText.includes('customer')) {
      enrichmentData.target_audience = basicDD.market_position_analysis;
    }
  }

  // Extract business model from financial analysis
  if (basicDD.financial_health_analysis) {
    const financialText = basicDD.financial_health_analysis.toLowerCase();
    if (financialText.includes('business model') || financialText.includes('revenue') || financialText.includes('monetization')) {
      enrichmentData.business_model = basicDD.financial_health_analysis;
    }
  }

  // Extract problem solving from introduction or executive summary
  if (basicDD.introduction) {
    enrichmentData.problem_solving = basicDD.introduction;
  } else if (basicDD.executive_summary) {
    enrichmentData.problem_solving = basicDD.executive_summary;
  }

  return enrichmentData;
};

export const extractDataFromMicroDD = (microDDMarkdown: string): ProfileEnrichmentData => {
  const enrichmentData: ProfileEnrichmentData = {};

  if (!microDDMarkdown) return enrichmentData;

  // Try to extract elevator pitch from the beginning of micro DD
  const lines = microDDMarkdown.split('\n');
  const firstParagraphs = lines.filter(line => line.trim() && !line.startsWith('#')).slice(0, 3);
  if (firstParagraphs.length > 0) {
    enrichmentData.elevator_pitch = firstParagraphs.join(' ').substring(0, 500);
  }

  // Look for specific sections in the markdown
  const sections = microDDMarkdown.split(/#{1,3}\s+/);
  
  sections.forEach(section => {
    const lowerSection = section.toLowerCase();
    
    // Extract business model
    if (lowerSection.includes('business model') || lowerSection.includes('revenue')) {
      const content = section.split('\n').slice(1).join('\n').trim();
      if (content) enrichmentData.business_model = content.substring(0, 1000);
    }
    
    // Extract technology information
    if (lowerSection.includes('technology') || lowerSection.includes('ai') || lowerSection.includes('technical')) {
      const content = section.split('\n').slice(1).join('\n').trim();
      if (content) enrichmentData.ai_technology_type = content.substring(0, 1000);
    }
    
    // Extract market/audience information
    if (lowerSection.includes('market') || lowerSection.includes('audience') || lowerSection.includes('customer')) {
      const content = section.split('\n').slice(1).join('\n').trim();
      if (content) enrichmentData.target_audience = content.substring(0, 1000);
    }
  });

  return enrichmentData;
};

export const enrichProfileFromDueDiligence = async (
  startupId: string, 
  startupName: string,
  source: 'micro' | 'basic' | 'dataroom',
  data: any
): Promise<void> => {
  console.log(`🔄 Enriching profile for ${startupName} from ${source} due diligence`);
  
  try {
    // Get current profile or create if doesn't exist
    let profile = await getStartupProfile(startupId);
    
    if (!profile) {
      console.log('📝 Creating new profile for enrichment');
      profile = await createStartupProfile(startupId, { startup_name: startupName });
    }

    let enrichmentData: ProfileEnrichmentData = {};

    // Extract data based on source
    if (source === 'basic' && data) {
      enrichmentData = extractDataFromBasicDD(data as BasicDueDiligenceReport);
    } else if (source === 'micro' && data) {
      enrichmentData = extractDataFromMicroDD(data as string);
    }

    // Only update fields that are empty in the current profile to avoid overwriting manual edits
    const updates: Partial<StartupProfile> = {};
    
    Object.entries(enrichmentData).forEach(([key, value]) => {
      const profileKey = key as keyof StartupProfile;
      if (value && !profile![profileKey]) {
        updates[profileKey] = value as any;
      }
    });

    if (Object.keys(updates).length > 0) {
      await updateStartupProfile(startupId, updates);
      console.log(`✅ Profile enriched with ${Object.keys(updates).length} fields from ${source} DD`);
    } else {
      console.log(`ℹ️ No new fields to enrich from ${source} DD (profile already populated)`);
    }

  } catch (error) {
    console.error(`❌ Error enriching profile from ${source} DD:`, error);
    // Don't throw error to avoid breaking the main workflow
  }
};
