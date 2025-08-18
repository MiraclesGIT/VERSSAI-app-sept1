import { supabase } from "@/integrations/supabase/client";
import { FeedbackAttachment } from "@/types/feedback";

export class FeedbackFileService {
  static async uploadAttachment(
    file: File,
    companyId: string,
    feedbackId: string
  ): Promise<FeedbackAttachment> {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = `${companyId}/${feedbackId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('feedback_attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const { data: publicUrl } = supabase.storage
      .from('feedback_attachments')
      .getPublicUrl(filePath);

    return {
      id: data.path,
      name: file.name,
      type: file.type,
      size: file.size,
      url: publicUrl.publicUrl,
      uploaded_at: new Date().toISOString()
    };
  }

  static async uploadMultipleAttachments(
    files: File[],
    companyId: string,
    feedbackId: string
  ): Promise<FeedbackAttachment[]> {
    const uploadPromises = files.map(file => 
      this.uploadAttachment(file, companyId, feedbackId)
    );

    return Promise.all(uploadPromises);
  }

  static async deleteAttachment(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from('feedback_attachments')
      .remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  static async updateFeedbackAttachments(
    feedbackId: string,
    attachments: FeedbackAttachment[]
  ): Promise<void> {
    const { error } = await supabase
      .from('feedback')
      .update({ attachments: attachments as any })
      .eq('id', feedbackId);

    if (error) {
      throw new Error(`Failed to update feedback attachments: ${error.message}`);
    }
  }

  static async deleteAllAttachments(feedbackId: string): Promise<void> {
    try {
      const { data: feedback } = await supabase
        .from('feedback')
        .select('attachments')
        .eq('id', feedbackId)
        .single();

      if (feedback?.attachments && Array.isArray(feedback.attachments)) {
        const deletionPromises = feedback.attachments.map(async (attachment: any) => {
          try {
            await this.deleteAttachment(attachment.id);
          } catch (error) {
            console.error(`Failed to delete attachment ${attachment.id}:`, error);
          }
        });
        
        await Promise.allSettled(deletionPromises);
      }
    } catch (error) {
      console.error('Error deleting all attachments:', error);
    }
  }

  static validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/csv'
    ];

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 10MB'
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not supported. Please upload images, PDFs, or text files.'
      };
    }

    return { isValid: true };
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }
}