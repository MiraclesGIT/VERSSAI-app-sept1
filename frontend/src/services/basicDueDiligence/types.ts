
export interface BasicDueDiligenceReport {
  id: string;
  startup_id: string;
  startup_name: string;
  // Legacy sections (keeping for backward compatibility)
  team_capability_section?: string;
  technical_moat_section?: string;
  infrastructure_capability_section?: string;
  compliance_and_risk_section?: string;
  market_position_section?: string;
  financial_health_section?: string;
  // New individual report sections
  executive_summary?: string;
  introduction?: string;
  team_capability_analysis?: string;
  technical_moat_analysis?: string;
  infrastructure_capability_analysis?: string;
  compliance_and_risk_analysis?: string;
  market_position_analysis?: string;
  financial_health_analysis?: string;
  overall_conclusion?: string;
  investment_verdict?: string;
  investment_recommendations?: string;
  full_report_markdown?: string;
  // Scores and justifications (updated naming)
  team_capability_score?: number;
  team_capability_score_justification?: string;
  technical_moat_score?: number;
  technical_moat_score_justification?: string;
  infrastructure_capability_score?: number;
  infrastructure_capability_score_justification?: string;
  compliance_and_risk_score?: number;
  compliance_and_risk_score_justification?: string;
  market_position_score?: number;
  market_position_score_justification?: string;
  financial_health_score?: number;
  financial_health_score_justification?: string;
  final_score?: number;
  // Edit flags (updated to match database schema - these are strings, not booleans)
  team_capability_edited?: string;
  technical_moat_edited?: string;
  infrastructure_capability_edited?: string;
  compliance_and_risk_edited?: string;
  market_position_edited?: string;
  financial_health_edited?: string;
  introduction_edited?: string;
  summary_edited?: string;
  // Legacy fields
  legacy_full_markdown?: string;
  basic_due_diligence_full_html?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReportSection {
  id: string;
  title: string;
  content?: string;
  order: number;
}
