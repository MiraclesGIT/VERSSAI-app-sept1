
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { replacePitchDeck, enhancedDeletePitchDeck, cleanupOrphanedFiles } from '@/services/enhancedFileService';
import { enhancedUploadPitchDeck } from '@/services/enhancedFileUploadService';
import { downloadFile } from '@/services/fileDownloadService';
import { triggerMicroDueDiligence } from '@/services/microDueDiligenceService';
import { fetchStartupById } from '@/services/startupService';

export const useStartupFileManager = (startupId: string, onFileUpdate: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const triggerMicroDueDiligenceWithStartupData = async (filePath: string) => {
    try {
      const startupData = await fetchStartupById(startupId);
      
      if (!startupData) {
        throw new Error('Failed to fetch startup data for micro due diligence');
      }

      await triggerMicroDueDiligence(
        startupId, 
        startupData.name,
        filePath, 
        'deck_upload'
      );
      
    } catch (microDDError) {
      console.error('Failed to trigger micro due diligence:', microDDError);
      toast({
        title: "Deck uploaded",
        description: "Your pitch deck has been uploaded, but micro due diligence could not be triggered automatically.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (files: File[], deckFilePath?: string | null) => {
    const file = files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      if (!deckFilePath) {
        const result = await enhancedUploadPitchDeck(startupId, file);
        
        if (result.success && result.filePath) {
          await triggerMicroDueDiligenceWithStartupData(result.filePath);
          toast({
            title: "Deck uploaded successfully",
            description: "Your pitch deck has been uploaded and micro due diligence has been triggered.",
          });
          onFileUpdate();
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } else {
        await handleFileReplacement(file, deckFilePath);
      }
    } catch (error) {
      console.error('❌ Enhanced file upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileReplacement = async (newFile: File, deckFilePath: string) => {
    try {
      console.log('🔄 Starting enhanced file replacement process');
      
      const result = await replacePitchDeck(startupId, newFile, deckFilePath);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to replace deck');
      }

      if (result.newFilePath) {
        await triggerMicroDueDiligenceWithStartupData(result.newFilePath);
      }

      cleanupOrphanedFiles(startupId);

      toast({
        title: "Deck replaced successfully",
        description: "Your pitch deck has been replaced and micro due diligence has been triggered.",
      });
      
      onFileUpdate();

    } catch (error) {
      console.error('❌ Enhanced file replacement error:', error);
      throw error;
    }
  };

  const handleFileDownload = async (deckFilePath: string) => {
    try {
      await downloadFile('pitch_decks', deckFilePath);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileDelete = async (deckFilePath: string) => {
    if (!window.confirm('Are you sure you want to delete this pitch deck?')) {
      return;
    }

    try {
      setIsDeleting(true);
      
      const result = await enhancedDeletePitchDeck(startupId, deckFilePath);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete deck');
      }
      
      toast({
        title: "File deleted",
        description: "The pitch deck has been deleted successfully.",
      });
      
      onFileUpdate();
      
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isUploading,
    isDeleting,
    handleFileUpload,
    handleFileDownload,
    handleFileDelete
  };
};
