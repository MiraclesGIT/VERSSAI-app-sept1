
import { ChatMessage } from '@/hooks/useStartupChat';

interface ChatResponse {
  message: string;
  conversationId?: string;
}

class StartupChatService {
  private baseUrl = '/functions/v1/startup-chat'; // Updated to use Supabase Edge Function

  async sendMessage(
    startupId: string, 
    message: string, 
    conversationHistory: ChatMessage[]
  ): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${startupId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message,
          conversationHistory: conversationHistory.slice(-10), // Keep last 10 messages for context
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in chat service:', error);
      throw new Error('Failed to send message to AI assistant');
    }
  }

  async getConversationHistory(startupId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${startupId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        }
      });
      
      if (!response.ok) {
        return []; // Return empty array if no history
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }
}

export const startupChatService = new StartupChatService();
