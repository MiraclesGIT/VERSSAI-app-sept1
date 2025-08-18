
import { BasicDueDiligenceReport, ReportSection } from "./types";

export function getReportSections(report: BasicDueDiligenceReport): ReportSection[] {
  return [
    {
      id: 'executive_summary',
      title: 'Executive Summary',
      content: report.executive_summary,
      order: 1
    },
    {
      id: 'introduction',
      title: 'Introduction',
      content: report.introduction,
      order: 2
    },
    {
      id: 'team_capability_analysis',
      title: 'Team Capability Analysis',
      content: report.team_capability_analysis,
      order: 3
    },
    {
      id: 'technical_moat_analysis',
      title: 'Technical Moat Analysis',
      content: report.technical_moat_analysis,
      order: 4
    },
    {
      id: 'infrastructure_capability_analysis',
      title: 'Infrastructure Capability Analysis',
      content: report.infrastructure_capability_analysis,
      order: 5
    },
    {
      id: 'compliance_and_risk_analysis',
      title: 'Compliance and Risk Analysis',
      content: report.compliance_and_risk_analysis,
      order: 6
    },
    {
      id: 'market_position_analysis',
      title: 'Market Position Analysis',
      content: report.market_position_analysis,
      order: 7
    },
    {
      id: 'financial_health_analysis',
      title: 'Financial Health Analysis',
      content: report.financial_health_analysis,
      order: 8
    },
    {
      id: 'overall_conclusion',
      title: 'Overall Conclusion',
      content: report.overall_conclusion,
      order: 9
    },
    {
      id: 'investment_verdict',
      title: 'Investment Verdict',
      content: report.investment_verdict,
      order: 10
    },
    {
      id: 'investment_recommendations',
      title: 'Investment Recommendations',
      content: report.investment_recommendations,
      order: 11
    }
  ].filter(section => section.content); // Only return sections with content
}
