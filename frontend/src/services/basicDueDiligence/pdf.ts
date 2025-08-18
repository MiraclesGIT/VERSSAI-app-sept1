
import { BasicDueDiligenceReport } from "./types";
import { getReportSections } from "./utils";

export async function generateBasicDueDiligencePDF(report: BasicDueDiligenceReport): Promise<Blob> {
  console.log('📄 Generating PDF for:', report.startup_name);
  
  // Create HTML content for PDF generation
  const sections = getReportSections(report);
  let htmlContent = `
    <html>
      <head>
        <title>Basic Due Diligence Report - ${report.startup_name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; border-left: 4px solid #7c3aed; padding-left: 15px; }
          .content { margin-bottom: 20px; }
          .score-summary { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .score-item { display: inline-block; margin: 10px 20px; text-align: center; }
          .score-value { font-size: 24px; font-weight: bold; color: #7c3aed; }
          .score-label { font-size: 12px; color: #666; }
          @media print { .page-break { page-break-before: always; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Basic Due Diligence Report</h1>
          <h2>${report.startup_name}</h2>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
  `;

  // Add sections
  sections.forEach((section, index) => {
    if (index > 0 && index % 3 === 0) {
      htmlContent += '<div class="page-break"></div>';
    }
    htmlContent += `
      <div class="section">
        <div class="section-title">${section.title}</div>
        <div class="content">${section.content || 'Content not available'}</div>
      </div>
    `;
  });

  // Add score summary if available
  if (report.final_score) {
    htmlContent += `
      <div class="score-summary">
        <h3>Assessment Scores</h3>
        <div class="score-item">
          <div class="score-value">${report.final_score}%</div>
          <div class="score-label">Final Score</div>
        </div>
    `;
    
    if (report.team_capability_score) {
      htmlContent += `
        <div class="score-item">
          <div class="score-value">${report.team_capability_score}%</div>
          <div class="score-label">Team Capability</div>
        </div>
      `;
    }
    
    if (report.technical_moat_score) {
      htmlContent += `
        <div class="score-item">
          <div class="score-value">${report.technical_moat_score}%</div>
          <div class="score-label">Technical Moat</div>
        </div>
      `;
    }
    
    htmlContent += '</div>';
  }

  htmlContent += '</body></html>';

  // For now, return a simple text blob. In a real implementation, you'd use a PDF generation library
  const pdfBlob = new Blob([htmlContent], { type: 'text/html' });
  
  // TODO: Implement actual PDF generation using a library like jsPDF or Puppeteer
  console.log('📄 PDF content prepared. Actual PDF generation to be implemented.');
  
  return pdfBlob;
}
