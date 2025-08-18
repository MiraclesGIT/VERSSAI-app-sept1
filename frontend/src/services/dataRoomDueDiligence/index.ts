
import { makeWebhookRequest, getWebhookUrl } from './webhookClient';
import { storeFallbackRequest } from './fallbackStorage';
import { updateAnalysisStatus, fetchDataRoomDueDiligenceStatus } from './statusTracking';
import { buildWebhookPayload } from './payloadBuilder';
import { handleWebhookError } from './errorHandler';

export async function triggerDataRoomDueDiligenceWebhook(
  startupId: string, 
  startupName: string, 
  dataRoomFilePaths: string[]
): Promise<void> {
  console.log('🚀 Triggering data room due diligence webhook for:', startupName);
  console.log('📂 Data room file paths:', dataRoomFilePaths);
  console.log('🌐 Webhook URL:', getWebhookUrl());
  
  if (!dataRoomFilePaths || dataRoomFilePaths.length === 0) {
    throw new Error('No data room files available for analysis');
  }

  try {
    // Build the webhook payload
    const payload = await buildWebhookPayload(startupId, startupName, dataRoomFilePaths);

    console.log('📤 Sending webhook payload:', {
      startup_id: startupId,
      startup_name: startupName,
      file_count: payload.data_room_files.length,
      webhook_url: getWebhookUrl(),
      payload_size: JSON.stringify(payload).length
    });

    // Test with a minimal payload first if this is a retry
    console.log('🧪 Testing webhook connectivity...');

    // Send webhook request with retry logic
    const response = await makeWebhookRequest(payload);

    console.log('📡 Webhook response status:', response.status);
    console.log('📡 Webhook response ok:', response.ok);
    console.log('📡 Webhook response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        console.error('❌ Webhook error response:', errorText);
      } catch (e) {
        console.error('❌ Could not read error response:', e);
        errorText = `HTTP ${response.status} ${response.statusText}`;
      }
      
      // Store fallback request before throwing error
      await storeFallbackRequest(startupId, startupName, payload);
      
      throw new Error(`Webhook failed with status ${response.status}: ${errorText}`);
    }

    // Try to read response
    let responseData = '';
    try {
      responseData = await response.text();
      console.log('✅ Webhook response:', responseData);
    } catch (e) {
      console.log('✅ Webhook succeeded but could not read response body');
    }

    // Update analysis record with webhook trigger timestamp
    await updateAnalysisStatus(startupId, startupName, 'processing');

    console.log('✅ Data room due diligence webhook triggered successfully');

  } catch (error) {
    await handleWebhookError(error, startupId, startupName, dataRoomFilePaths);
  }
}

export { fetchDataRoomDueDiligenceStatus };

// Re-export types for backward compatibility
export type { DataRoomDueDiligenceWebhookPayload } from './types';
