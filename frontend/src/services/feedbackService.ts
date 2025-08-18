import { supabase } from "@/integrations/supabase/client";
import { Feedback, CreateFeedbackData, UpdateFeedbackData } from "@/types/feedback";
import { FeedbackFileService } from "./feedbackFileService";

export class FeedbackService {
  static async createFeedback(data: CreateFeedbackData): Promise<Feedback> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data: companyData } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('user_id', userData.user.id)
      .single();

    if (!companyData) {
      throw new Error('User not associated with any company');
    }

    const { data: feedback, error } = await supabase
      .from('feedback')
      .insert({
        user_id: userData.user.id,
        company_id: companyData.company_id,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        attachments: []
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create feedback: ${error.message}`);
    }

    return {
      ...feedback,
      attachments: (feedback.attachments as any) || []
    };
  }

  static async getFeedback(companyId: string): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch feedback: ${error.message}`);
    }

    return (data || []).map(item => ({
      ...item,
      attachments: (item.attachments as any) || []
    }));
  }

  static async getFeedbackById(id: string): Promise<Feedback | null> {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch feedback: ${error.message}`);
    }

    return data ? {
      ...data,
      attachments: (data.attachments as any) || []
    } : null;
  }

  static async updateFeedback(id: string, data: UpdateFeedbackData): Promise<Feedback> {
    const updateData: any = { ...data };
    
    if (data.resolved_by && data.status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data: feedback, error } = await supabase
      .from('feedback')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update feedback: ${error.message}`);
    }

    return {
      ...feedback,
      attachments: (feedback.attachments as any) || []
    };
  }

  static async deleteFeedback(id: string): Promise<void> {
    try {
      // First, get the feedback to access its attachments
      const feedback = await this.getFeedbackById(id);
      
      if (feedback?.attachments && feedback.attachments.length > 0) {
        // Delete all attached files from storage
        const deletionPromises = feedback.attachments.map(async (attachment) => {
          try {
            await FeedbackFileService.deleteAttachment(attachment.id);
          } catch (error) {
            console.error(`Failed to delete attachment ${attachment.id}:`, error);
            // Continue with other deletions even if one fails
          }
        });
        
        // Wait for all file deletions to complete (or fail)
        await Promise.allSettled(deletionPromises);
      }
      
      // Delete the feedback record from the database
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete feedback: ${error.message}`);
      }
    } catch (error) {
      // If getting feedback fails, still try to delete the record
      if (error instanceof Error && error.message.includes('Failed to fetch feedback')) {
        const { error: deleteError } = await supabase
          .from('feedback')
          .delete()
          .eq('id', id);

        if (deleteError) {
          throw new Error(`Failed to delete feedback: ${deleteError.message}`);
        }
      } else {
        throw error;
      }
    }
  }

  static async getUserFeedback(userId: string): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user feedback: ${error.message}`);
    }

    return (data || []).map(item => ({
      ...item,
      attachments: (item.attachments as any) || []
    }));
  }
}