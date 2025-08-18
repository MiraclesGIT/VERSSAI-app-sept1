
import { supabase } from "@/integrations/supabase/client";
import { DataRoomAnalysisStatus } from './types';

export async function updateAnalysisStatus(
  startupId: string,
  startupName: string,
  status: 'processing' | 'completed' | 'failed_webhook' = 'processing'
): Promise<void> {
  const { error } = await supabase
    .from('startup_dataroom_analysis')
    .upsert({
      startup_id: startupId,
      startup_name: startupName,
      processing_status: status,
      webhook_triggered_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'startup_id'
    });

  if (error) {
    console.error('❌ Failed to update data room analysis status:', error);
  }
}

export async function fetchDataRoomDueDiligenceStatus(startupId: string): Promise<DataRoomAnalysisStatus | null> {
  const { data, error } = await supabase
    .from('startup_dataroom_analysis')
    .select('processing_status, webhook_triggered_at, analysis_completed_at')
    .eq('startup_id', startupId)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching data room DD status:', error);
    return null;
  }
  
  return data;
}
