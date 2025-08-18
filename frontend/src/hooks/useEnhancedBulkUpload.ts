
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { enhancedUploadMultipleDecks } from '@/services/enhancedFileUploadService';
import { triggerBulkProcessingWebhook } from '@/services/bulkUploadService';
import { getUserCompany } from '@/services/companyService';
import { createBulkUploadStartedNotification } from '@/services/notificationService';

export const useEnhancedBulkUpload = () => {
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleBulkUpload = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setIsBulkUploading(true);
      setUploadProgress(10);

      console.log('🚀 Starting enhanced bulk upload process');

      // Create initial notification
      await createBulkUploadStartedNotification(files.length);
      setUploadProgress(30);

      // Get user company for webhook
      const userCompany = await getUserCompany();
      if (!userCompany) {
        throw new Error('User must belong to a company to perform bulk uploads');
      }
      setUploadProgress(40);

      // Enhanced upload with detailed error handling
      const result = await enhancedUploadMultipleDecks(files);
      setUploadProgress(80);

      // Trigger webhook if we have successful uploads
      if (result.success && result.uploadedFileInfos.length > 0) {
        try {
          await triggerBulkProcessingWebhook(result.uploadedFileInfos, userCompany);
          result.webhookTriggered = true;
          console.log('✅ Enhanced bulk upload webhook triggered');
        } catch (webhookError) {
          console.error('❌ Enhanced bulk upload webhook failed:', webhookError);
        }
      }
      setUploadProgress(100);

      // Show detailed results
      if (result.success) {
        let toastTitle = "Bulk upload completed";
        let toastDescription = `${result.uploadedFileInfos.length} file(s) uploaded successfully.`;
        
        if (result.failedFiles.length > 0) {
          toastDescription += ` ${result.failedFiles.length} file(s) failed.`;
          
          // Log detailed failure information
          result.failedFiles.forEach(failure => {
            console.error(`❌ File "${failure.file}" failed:`, failure.error);
          });
          
          toast({
            title: "Some uploads failed",
            description: `${result.failedFiles.length} files failed to upload. Check console for details.`,
            variant: "destructive",
          });
        }
        
        if (result.uploadedFileInfos.length > 0) {
          toast({
            title: toastTitle,
            description: toastDescription + " Processing has begun and you'll receive notifications when startup profiles are ready.",
          });
        }
      } else {
        toast({
          title: "Upload failed",
          description: "No files were uploaded successfully. Please check the file requirements and try again.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('❌ Enhanced bulk upload error:', error);
      toast({
        title: "Upload error",
        description: error instanceof Error ? error.message : "An error occurred during upload. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBulkUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    isBulkUploading,
    uploadProgress,
    handleBulkUpload
  };
};
