
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { enhancedUploadPitchDeck } from '@/services/enhancedFileUploadService';
import { fetchStartupById } from '@/services/startupQueryService';
import { triggerN8NWebhook } from '@/services/webhookService';

export const useStartupDetailUpload = (startupId: string, onFileUpdate: () => void) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { toast } = useToast();

  const handleUploadDeck = () => {
    setIsUploadModalOpen(true);
  };

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      console.log('🚀 Starting deck upload for startup:', startupId);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 85));
      }, 200);
      
      const result = await enhancedUploadPitchDeck(startupId, file);
      
      clearInterval(progressInterval);
      setUploadProgress(90);
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      console.log('✅ File uploaded successfully, triggering webhook...');

      const startupData = await fetchStartupById(startupId);
      
      if (!startupData) {
        throw new Error('Failed to fetch startup data after upload');
      }

      try {
        const fileInfo = {
          filePath: result.filePath,
          originalFile: file
        };

        await triggerN8NWebhook(startupData, fileInfo);
        
        console.log('✅ N8N webhook triggered successfully for deck upload');
        
        toast({
          title: "🎉 Deck uploaded and processing started!",
          description: "Your pitch deck has been uploaded successfully! Our AI minions are now analyzing it to generate insights. You'll get notified when they're done.",
        });
      } catch (webhookError) {
        console.error('❌ Webhook failed but upload succeeded:', webhookError);
        
        toast({
          title: "Deck uploaded successfully",
          description: "Your pitch deck has been uploaded. Processing may be delayed - please try refreshing in a few minutes.",
        });
      }
      
      setUploadProgress(100);
      
      // Close modal and refresh data
      setTimeout(() => {
        setIsUploadModalOpen(false);
        onFileUpdate();
        setUploadProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Deck upload failed:', error);
      setUploadProgress(0);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload the deck. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploadModalOpen,
    setIsUploadModalOpen,
    isUploading,
    uploadProgress,
    handleUploadDeck,
    handleUpload
  };
};
