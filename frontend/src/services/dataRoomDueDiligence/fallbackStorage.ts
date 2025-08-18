
import { supabase } from "@/integrations/supabase/client";
import { DataRoomDueDiligenceWebhookPayload } from './types';

export async function storeFallbackRequest(
  startupId: string, 
  startupName: string, 
  payload: DataRoomDueDiligenceWebhookPayload
): Promise<void> {
  console.log('💾 Storing fallback request for manual processing');
  
  try {
    const { error } = await supabase
      .from('startup_dataroom_analysis')
      .upsert({
        startup_id: startupId,
        startup_name: startupName,
        processing_status: 'failed_webhook',
        webhook_triggered_at: new Date().toISOString(),
        metadata: {
          webhook_payload: payload,
          error_reason: 'webhook_connection_failed',
          retry_count: 2
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'startup_id'
      });

    if (error) {
      console.error('❌ Failed to store fallback request:', error);
    } else {
      console.log('✅ Fallback request stored successfully');
    }
  } catch (error) {
    console.error('❌ Error storing fallback request:', error);
  }
}
