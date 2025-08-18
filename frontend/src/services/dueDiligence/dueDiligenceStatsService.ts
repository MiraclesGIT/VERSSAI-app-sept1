
import { supabase } from "@/integrations/supabase/client";
import { DueDiligenceStats } from "./dueDiligenceTypes";
import { getUserCompany } from "../companyService";

export async function fetchDueDiligenceStats(): Promise<DueDiligenceStats> {
  console.log('📊 Fetching due diligence statistics');
  
  try {
    // Get user's company for security filtering
    const userCompany = await getUserCompany();
    if (!userCompany) {
      console.error('❌ No user company found');
      return { micro: 0, basic: 0, dataroom: 0 };
    }

    console.log('🏢 Fetching stats for company:', userCompany.name);

    // Fetch micro DD count with company filtering
    const { count: microCount } = await supabase
      .from('startup_profiles')
      .select('*, startups!inner(company_id)', { count: 'exact', head: true })
      .not('micro_due_diligence_html', 'is', null)
      .eq('startups.company_id', userCompany.id);

    // Fetch basic DD count with company filtering
    const { count: basicCount } = await supabase
      .from('basic_due_diligence')
      .select('*, startups!inner(company_id)', { count: 'exact', head: true })
      .eq('startups.company_id', userCompany.id);

    // Fetch data room DD count with company filtering
    const { count: dataroomCount } = await supabase
      .from('startup_dataroom_analysis')
      .select('*, startups!inner(company_id)', { count: 'exact', head: true })
      .eq('startups.company_id', userCompany.id);

    console.log('✅ Due diligence stats for company', userCompany.name, ':', { microCount, basicCount, dataroomCount });

    return {
      micro: microCount || 0,
      basic: basicCount || 0,
      dataroom: dataroomCount || 0
    };
  } catch (error) {
    console.error('❌ Error fetching due diligence stats:', error);
    return { micro: 0, basic: 0, dataroom: 0 };
  }
}
