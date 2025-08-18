
import { supabase } from "@/integrations/supabase/client";
import { BasicDueDiligenceReport } from "./types";

export async function fetchBasicDueDiligenceReport(startupId: string): Promise<BasicDueDiligenceReport | null> {
  console.log('🔍 Fetching basic due diligence report for startup ID:', startupId);
  
  const { data, error } = await supabase
    .from('basic_due_diligence')
    .select('*')
    .eq('startup_id', startupId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  if (error) {
    console.error('❌ Error fetching basic due diligence report:', error);
    return null;
  }
  
  console.log('✅ Fetched basic due diligence report:', data);
  return data;
}
