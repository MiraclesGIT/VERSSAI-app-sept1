
import { StartupProfile } from './types';

export const mapDatabaseToProfile = (data: any): StartupProfile => {
  console.log('🔄 Mapping database data to profile:', data);
  
  const mapped = {
    id: data.id,
    startup_id: data.startup_id,
    company_id: data.company_id,
    startup_name: data.startup_name || '',
    created_at: data.created_at,
    updated_at: data.updated_at,
    primary_contact_first_name: data.primary_contact_first_name,
    primary_contact_last_name: data.primary_contact_last_name,
    primary_contact_email: data.primary_contact_email,
    contact_phone_number: data.contact_phone_number,
    elevator_pitch: data.elevator_pitch,
    problem_solving: data.problem_solving,
    unique_selling_proposition: data.unique_selling_proposition,
    target_audience: data.target_audience,
    product_goals: data.product_goals,
    user_goals: data.user_goals,
    business_model: data.business_model,
    competitors: data.competitors,
    why_your_solution_is_great: data.why_your_solution_is_great,
    growth_strategy_and_market_readiness: data.growth_strategy_and_market_readiness,
    product_maturity_level: data.product_maturity_level,
    investment_and_fundraising: data.investment_and_fundraising,
    ai_technology_type: data.ai_technology_type,
    ai_adoption_level: data.ai_adoption_level,
    dataset_level: data.dataset_level,
    ai_technical_robustness_and_innovation: data.ai_technical_robustness_and_innovation,
    ai_ethics_and_compliance: data.ai_ethics_and_compliance,
    team_competence_in_ai_and_product_development: data.team_competence_in_ai_and_product_development,
    founder_executives_linkedin_pages: data.founder_executives_linkedin_pages,
    micro_due_diligence_html: data.micro_due_diligence_html,
    micro_due_diligence_markdown: data.micro_due_diligence_markdown,
    micro_due_diligence_created_at: data.micro_due_diligence_created_at,
    micro_due_diligence_updated_at: data.micro_due_diligence_updated_at
  };
  
  console.log('✅ Mapped profile result:', mapped);
  return mapped;
};
