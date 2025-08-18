
// Main service file - re-exports everything for backward compatibility
export type { BasicDueDiligenceReport, ReportSection } from './basicDueDiligence';
export {
  fetchBasicDueDiligenceReport,
  getReportSections,
  generateBasicDueDiligencePDF
} from './basicDueDiligence';
export { triggerBasicDueDiligenceWebhook } from './basicDueDiligence/webhook';
