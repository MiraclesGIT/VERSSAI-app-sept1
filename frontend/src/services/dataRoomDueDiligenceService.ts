
import type { DataRoomDueDiligence } from './dueDiligenceService';

export interface DataRoomReportSection {
  id: string;
  title: string;
  content?: string;
}

export function getDataRoomSections(report: DataRoomDueDiligence): DataRoomReportSection[] {
  const sections: DataRoomReportSection[] = [];

  // Executive Summary
  if (report.html_executive_summary || report.executive_summary) {
    sections.push({
      id: 'executive-summary',
      title: 'Executive Summary',
      content: report.html_executive_summary || report.executive_summary || '',
    });
  }

  // Team Analysis
  if (report.html_team_section || report.team_section) {
    sections.push({
      id: 'team-analysis',
      title: 'Team Analysis',
      content: report.html_team_section || report.team_section || '',
    });
  }

  // Technical Moat
  if (report.html_tech_moat_section || report.tech_moat_section) {
    sections.push({
      id: 'technical-moat',
      title: 'Technical Moat Analysis',
      content: report.html_tech_moat_section || report.tech_moat_section || '',
    });
  }

  // Infrastructure
  if (report.html_infrastructure_section || report.infrastructure_section) {
    sections.push({
      id: 'infrastructure',
      title: 'Infrastructure Capability',
      content: report.html_infrastructure_section || report.infrastructure_section || '',
    });
  }

  // Compliance & Risk
  if (report.html_compliance_section || report.compliance_section) {
    sections.push({
      id: 'compliance-risk',
      title: 'Compliance & Risk Assessment',
      content: report.html_compliance_section || report.compliance_section || '',
    });
  }

  // Market Analysis
  if (report.html_market_section || report.market_section) {
    sections.push({
      id: 'market-analysis',
      title: 'Market Position Analysis',
      content: report.html_market_section || report.market_section || '',
    });
  }

  // Financial Analysis
  if (report.html_finance_section || report.finance_section) {
    sections.push({
      id: 'financial-analysis',
      title: 'Financial Health Analysis',
      content: report.html_finance_section || report.finance_section || '',
    });
  }

  // Investment Recommendations
  if (report.html_investment_recommendations || report.investment_recommendations) {
    sections.push({
      id: 'investment-recommendations',
      title: 'Investment Recommendations',
      content: report.html_investment_recommendations || report.investment_recommendations || '',
    });
  }

  // Appendix
  if (report.html_appendix_section || report.appendix_section) {
    sections.push({
      id: 'appendix',
      title: 'Appendix',
      content: report.html_appendix_section || report.appendix_section || '',
    });
  }

  return sections;
}
