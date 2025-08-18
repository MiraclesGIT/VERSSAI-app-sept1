
import { supabase } from "@/integrations/supabase/client";
import { generateDataRoomFileUrls } from "../dataRoomFileService";
import { DataRoomDueDiligenceWebhookPayload } from './types';

export async function buildWebhookPayload(
  startupId: string,
  startupName: string,
  dataRoomFilePaths: string[]
): Promise<DataRoomDueDiligenceWebhookPayload> {
  // Generate signed download URLs for all files
  console.log('🔗 Generating download URLs for files...');
  const fileInfos = await generateDataRoomFileUrls(dataRoomFilePaths);
  
  console.log('✅ Generated file infos:', fileInfos);
  
  if (fileInfos.length === 0) {
    throw new Error('Failed to generate download URLs for data room files');
  }

  // Get startup details for additional context
  const { data: startup, error: startupError } = await supabase
    .from('startups')
    .select('company_id, website, industry, founded_date')
    .eq('id', startupId)
    .single();

  if (startupError) {
    console.warn('⚠️ Could not fetch startup details:', startupError);
  }

  // Get the current origin for the callback URL
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://chwjydignjdyhkpgkdsz.supabase.co';
  
  return {
    startup_id: startupId,
    startup_name: startupName,
    company_id: startup?.company_id,
    data_room_files: fileInfos,
    callback_url: `${currentOrigin}/functions/v1/dataroom-dd-webhook`,
    metadata: {
      total_files: fileInfos.length,
      file_types: [...new Set(fileInfos.map(f => f.fileType || 'unknown'))],
      webhook_triggered_at: new Date().toISOString()
    }
  };
}
