
import { DataRoomDueDiligenceWebhookPayload } from './types';

const DATA_ROOM_WEBHOOK_URL = "https://versatil.app.n8n.cloud/webhook/57ca9d03-cbfd-481e-b7d5-d12322b6d9ff";
const WEBHOOK_TIMEOUT_MS = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 2;

export async function makeWebhookRequest(payload: DataRoomDueDiligenceWebhookPayload, attempt: number = 1): Promise<Response> {
  console.log(`📡 Webhook attempt ${attempt}/${MAX_RETRY_ATTEMPTS}`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
  
  try {
    const response = await fetch(DATA_ROOM_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Webhook request timed out after ${WEBHOOK_TIMEOUT_MS}ms`);
    }
    
    // Retry on network errors
    if (attempt < MAX_RETRY_ATTEMPTS && error instanceof TypeError) {
      console.log(`🔄 Retrying webhook request (attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      return makeWebhookRequest(payload, attempt + 1);
    }
    
    throw error;
  }
}

export function getWebhookUrl(): string {
  return DATA_ROOM_WEBHOOK_URL;
}
