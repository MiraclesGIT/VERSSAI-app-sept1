
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { uploadMultipleDecks } from '@/services/bulkUploadService';
import { createBulkUploadStartedNotification } from '@/services/notificationService';

export const useBulkUpload = () => {
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleBulkUpload = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setIsBulkUploading(true);
      setUploadProgress(10);

      // Create initial notification
      await createBulkUploadStartedNotification(files.length);
      setUploadProgress(30);

      // Upload files and trigger processing
      const result = await uploadMultipleDecks(files);
      setUploadProgress(100);

      if (result.success) {
        toast({
          title: "Bulk upload started",
          description: `${result.uploadedFiles.length} file(s) uploaded successfully. Processing has begun and you'll receive notifications when startup profiles are ready.`,
        });

        if (result.failedFiles.length > 0) {
          toast({
            title: "Some files failed",
            description: `${result.failedFiles.length} file(s) could not be uploaded. Check notifications for details.`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Upload failed",
          description: "Failed to upload files. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast({
        title: "Upload error",
        description: "An error occurred during upload. Please try again.",
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
