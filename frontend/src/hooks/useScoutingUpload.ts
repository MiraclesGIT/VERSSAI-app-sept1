
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { uploadMultipleDecks } from '@/services/bulkUploadService';
import { createBulkUploadStartedNotification } from '@/services/notificationService';
import { enhancedUploadPitchDeck } from '@/services/enhancedFileUploadService';
import { fetchStartupById } from '@/services/startupQueryService';
import { triggerN8NWebhook } from '@/services/webhookService';

export const useScoutingUpload = (loadStartups: () => Promise<void>) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSingleUploadModalOpen, setIsSingleUploadModalOpen] = useState(false);
  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(null);
  const [isSingleUploading, setIsSingleUploading] = useState(false);
  
  const { toast } = useToast();

  const handleBulkUpload = async (files: File[]) => {
    console.log('Starting bulk upload for', files.length, 'files');
    setIsBulkUploading(true);
    setUploadProgress(0);
    
    try {
      await createBulkUploadStartedNotification(files.length);
      
      // Calculate realistic progress increments based on file count
      const totalFiles = files.length;
      const incrementPerFile = 90 / totalFiles; // Reserve 10% for final processing
      const baseIntervalTime = Math.max(300, Math.min(1000, totalFiles * 20)); // 300ms to 1s based on file count
      
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += incrementPerFile;
        setUploadProgress(Math.min(currentProgress, 90));
      }, baseIntervalTime);
      
      const result = await uploadMultipleDecks(files);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsBulkUploading(false);
        setUploadProgress(0);
        setIsUploadModalOpen(false); // Close the modal after successful upload
      }, 1000);
      
      if (result.success) {
        toast({
          title: "🎉 Bulk Upload Complete!",
          description: `${result.uploadedFiles.length} deck${result.uploadedFiles.length > 1 ? 's' : ''} uploaded successfully! Our AI minions are now hard at work creating startup profiles. You'll get notified when they're done procrastinating.`,
        });
        
        if (result.failedFiles.length > 0) {
          toast({
            title: "Some uploads failed",
            description: `${result.failedFiles.length} file(s) could not be uploaded. Check the console for details.`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Upload Failed",
          description: "No files were uploaded successfully. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Bulk upload failed:', error);
      setIsBulkUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUploadDeck = (startupId: string) => {
    setSelectedStartupId(startupId);
    setIsSingleUploadModalOpen(true);
  };

  const handleSingleUpload = async (files: File[], startupId?: string) => {
    if (!startupId || files.length === 0) return;
    
    const file = files[0];
    setIsSingleUploading(true);
    
    try {
      console.log('🚀 Starting single deck upload for startup:', startupId);
      
      const result = await enhancedUploadPitchDeck(startupId, file);
      
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
      
      await loadStartups();
      setIsSingleUploadModalOpen(false);
      setSelectedStartupId(null);
      
    } catch (error) {
      console.error('❌ Single deck upload failed:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload the deck. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSingleUploading(false);
    }
  };

  return {
    isUploadModalOpen,
    setIsUploadModalOpen,
    isBulkUploading,
    uploadProgress,
    isSingleUploadModalOpen,
    setIsSingleUploadModalOpen,
    selectedStartupId,
    setSelectedStartupId,
    isSingleUploading,
    handleBulkUpload,
    handleUploadDeck,
    handleSingleUpload
  };
};
