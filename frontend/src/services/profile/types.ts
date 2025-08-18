
export interface StartupProfile {
  id: string;
  startup_id: string;
  company_id: string;
  startup_name: string;
  created_at: string;
  updated_at: string;
  // Contact Information
  primary_contact_first_name?: string;
  primary_contact_last_name?: string;
  primary_contact_email?: string;
  contact_phone_number?: string;
  // Business Information
  elevator_pitch?: string;
  problem_solving?: string;
  unique_selling_proposition?: string;
  target_audience?: string;
  product_goals?: string;
  user_goals?: string;
  business_model?: string;
  competitors?: string;
  why_your_solution_is_great?: string;
  growth_strategy_and_market_readiness?: string;
  product_maturity_level?: string;
  investment_and_fundraising?: string;
  // AI & Technology
  ai_technology_type?: string;
  ai_adoption_level?: string;
  dataset_level?: string;
  ai_technical_robustness_and_innovation?: string;
  ai_ethics_and_compliance?: string;
  team_competence_in_ai_and_product_development?: string;
  // LinkedIn and JSON fields
  founder_executives_linkedin_pages?: any;
  // Micro Due Diligence
  micro_due_diligence_html?: string;
  micro_due_diligence_markdown?: string;
  micro_due_diligence_created_at?: string;
  micro_due_diligence_updated_at?: string;
}
