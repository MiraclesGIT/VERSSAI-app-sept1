
import { supabase } from "@/integrations/supabase/client";

export async function downloadReportPDF(reportType: string, startupId: string, startupName: string): Promise<void> {
  console.log('📄 Downloading PDF for:', { reportType, startupId, startupName });
  
  try {
    let content = '';
    
    switch (reportType) {
      case 'micro':
        const { data: microData } = await supabase
          .from('startup_profiles')
          .select('micro_due_diligence_html, micro_due_diligence_markdown')
          .eq('startup_id', startupId)
          .single();
        
        content = microData?.micro_due_diligence_html || microData?.micro_due_diligence_markdown || '';
        break;
        
      case 'basic':
        const { data: basicData } = await supabase
          .from('basic_due_diligence')
          .select('basic_due_diligence_full_html, legacy_full_markdown, full_report_markdown')
          .eq('startup_id', startupId)
          .single();
        
        content = basicData?.basic_due_diligence_full_html || 
                 basicData?.full_report_markdown || 
                 basicData?.legacy_full_markdown || '';
        break;
        
      case 'dataroom':
        const { data: dataroomData } = await supabase
          .from('startup_dataroom_analysis')
          .select('html_executive_summary')
          .eq('startup_id', startupId)
          .single();
        
        content = dataroomData?.html_executive_summary || '';
        break;
    }

    if (!content) {
      throw new Error('No content available for PDF generation');
    }

    // Create a downloadable HTML file that will automatically trigger download
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${startupName} - ${reportType.toUpperCase()} Due Diligence Report</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6; 
              color: #333;
            }
            h1, h2, h3 { 
              color: #333; 
              margin-top: 30px;
              margin-bottom: 15px;
            }
            .header { 
              border-bottom: 2px solid #8B5CF6; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
              text-align: center;
            }
            .header h1 {
              color: #8B5CF6;
              margin-bottom: 10px;
            }
            .header h2 {
              color: #666;
              font-weight: normal;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f8f9fa;
            }
            @media print {
              body { margin: 0; }
              .header { page-break-after: avoid; }
              h1, h2, h3 { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${startupName}</h1>
            <h2>${reportType.toUpperCase()} Due Diligence Report</h2>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="content">
            ${content}
          </div>
        </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${startupName}_${reportType}_due_diligence_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ PDF download initiated successfully');
  } catch (error) {
    console.error('❌ Error downloading PDF:', error);
    throw error;
  }
}
