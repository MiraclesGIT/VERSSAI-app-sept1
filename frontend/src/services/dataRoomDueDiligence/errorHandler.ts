
import { storeFallbackRequest } from './fallbackStorage';
import { DataRoomDueDiligenceWebhookPayload } from './types';

export async function handleWebhookError(
  error: unknown,
  startupId: string,
  startupName: string,
  dataRoomFilePaths: string[]
): Promise<never> {
  console.error('❌ Failed to trigger data room due diligence webhook:', error);
  
  // Provide more specific error messages based on error type
  if (error instanceof TypeError && error.message.includes('fetch')) {
    // Store fallback request for manual processing
    const fallbackPayload: DataRoomDueDiligenceWebhookPayload = {
      startup_id: startupId,
      startup_name: startupName,
      data_room_files: [],
      metadata: {
        total_files: dataRoomFilePaths.length,
        file_types: [],
        webhook_triggered_at: new Date().toISOString()
      }
    };
    await storeFallbackRequest(startupId, startupName, fallbackPayload);
    
    throw new Error('Network error: Unable to connect to the webhook service. The request has been saved for manual processing. Please check your internet connection or contact support if the issue persists.');
  } else if (error instanceof Error && error.message.includes('timeout')) {
    throw new Error('Request timeout: The webhook service took too long to respond. Please try again or contact support if the issue persists.');
  } else if (error instanceof Error) {
    throw error;
  } else {
    throw new Error('An unexpected error occurred while triggering the data room analysis');
  }
}
