
import { supabase } from "@/integrations/supabase/client";
import { DueDiligenceReport } from "./dueDiligence/dueDiligenceTypes";
import { generateLogoColor, getLogoInitials } from "./dueDiligence/dueDiligenceUtils";
import { getUserCompany } from "./companyService";

// Re-export types and functions for backward compatibility
export type { DueDiligenceReport, DueDiligenceStats } from "./dueDiligence/dueDiligenceTypes";
export { fetchDueDiligenceStats } from "./dueDiligence/dueDiligenceStatsService";
export { downloadReportPDF } from "./dueDiligence/dueDiligenceDownloadService";

export async function fetchRecentDueDiligenceReports(): Promise<DueDiligenceReport[]> {
  console.log('📋 Fetching recent due diligence reports');
  
  try {
    // Get user's company for security filtering
    const userCompany = await getUserCompany();
    if (!userCompany) {
      console.error('❌ No user company found');
      return [];
    }

    console.log('🏢 Fetching reports for company:', userCompany.name);

    const reports: DueDiligenceReport[] = [];

    // Fetch micro DD reports with company filtering
    const { data: microReports } = await supabase
      .from('startup_profiles')
      .select(`
        startup_id, 
        startup_name, 
        micro_due_diligence_created_at, 
        micro_due_diligence_updated_at,
        startups!inner(company_id)
      `)
      .not('micro_due_diligence_html', 'is', null)
      .not('startup_id', 'is', null)
      .eq('startups.company_id', userCompany.id)
      .order('micro_due_diligence_updated_at', { ascending: false })
      .limit(10);

    if (microReports) {
      microReports.forEach(report => {
        reports.push({
          id: `micro-${report.startup_id}`,
          startupName: report.startup_name,
          startupLogo: getLogoInitials(report.startup_name),
          logoColor: generateLogoColor(report.startup_name),
          reportType: 'micro',
          reportDate: report.micro_due_diligence_updated_at || report.micro_due_diligence_created_at,
          startupId: report.startup_id
        });
      });
    }

    // Fetch basic DD reports with company filtering
    const { data: basicReports } = await supabase
      .from('basic_due_diligence')
      .select(`
        id, 
        startup_id, 
        startup_name, 
        created_at,
        startups!inner(company_id)
      `)
      .eq('startups.company_id', userCompany.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (basicReports) {
      basicReports.forEach(report => {
        reports.push({
          id: report.id,
          startupName: report.startup_name,
          startupLogo: getLogoInitials(report.startup_name),
          logoColor: generateLogoColor(report.startup_name),
          reportType: 'basic',
          reportDate: report.created_at,
          startupId: report.startup_id
        });
      });
    }

    // Fetch data room DD reports with company filtering
    const { data: dataroomReports } = await supabase
      .from('startup_dataroom_analysis')
      .select(`
        startup_id, 
        startup_name, 
        created_at,
        startups!inner(company_id)
      `)
      .eq('startups.company_id', userCompany.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (dataroomReports) {
      dataroomReports.forEach(report => {
        reports.push({
          id: report.startup_id,
          startupName: report.startup_name,
          startupLogo: getLogoInitials(report.startup_name),
          logoColor: generateLogoColor(report.startup_name),
          reportType: 'dataroom',
          reportDate: report.created_at,
          startupId: report.startup_id
        });
      });
    }

    // Sort all reports by date
    reports.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());

    console.log('✅ Fetched recent reports for company', userCompany.name, ':', reports.length);
    return reports.slice(0, 12); // Return latest 12 reports
  } catch (error) {
    console.error('❌ Error fetching recent reports:', error);
    return [];
  }
}
