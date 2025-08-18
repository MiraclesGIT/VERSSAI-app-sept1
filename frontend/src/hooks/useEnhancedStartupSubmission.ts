
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { StartupFormState } from '@/types/startup';
import { createStartup } from '@/services/startupCreationService';
import { enhancedUploadPitchDeck } from '@/services/enhancedFileUploadService';
import { triggerN8NWebhook } from '@/services/webhookService';

export const useEnhancedStartupSubmission = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (startup: StartupFormState): boolean => {
    if (!startup.name) {
      toast({
        title: "Validation Error",
        description: "Startup Name is required.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const submitStartup = async (
    startup: StartupFormState,
    file: File | null,
    onSuccess: (startup: any) => void
  ) => {
    if (!validateForm(startup)) return;

    setIsLoading(true);

    try {
      console.log("📝 Enhanced form submission starting:", startup);
      
      // Step 1: Create startup in database
      const createdStartup = await createStartup(startup);
      console.log("✅ Startup created:", createdStartup);

      // Step 2: Enhanced file upload with detailed diagnostics
      let fileUploadResult = null;
      if (file && createdStartup.id) {
        try {
          console.log("📄 Starting enhanced file upload...");
          fileUploadResult = await enhancedUploadPitchDeck(createdStartup.id, file);
          
          if (!fileUploadResult.success) {
            // Show detailed error but don't fail the startup creation
            toast({
              title: "File Upload Failed",
              description: fileUploadResult.error,
              variant: "destructive"
            });
            console.error("❌ Enhanced upload failed:", fileUploadResult);
          } else {
            console.log("✅ Enhanced file upload successful");
          }
        } catch (fileError) {
          console.error("❌ Enhanced file upload error:", fileError);
        }
      }

      // Step 3: Trigger webhook (non-blocking)
      let webhookSuccess = false;
      try {
        if (fileUploadResult?.success) {
          await triggerN8NWebhook(createdStartup, {
            filePath: fileUploadResult.filePath,
            originalFile: file
          });
          webhookSuccess = true;
        }
      } catch (webhookError) {
        console.error("❌ Webhook failed:", webhookError);
      }

      // Step 4: Show appropriate success message
      let toastTitle = "Success!";
      let toastDescription = `${startup.name} has been added successfully!`;
      let toastVariant: "default" | "destructive" = "default";
      
      if (file && !fileUploadResult?.success) {
        toastTitle = "Startup Added (Upload Failed)";
        toastDescription += ` However, the pitch deck upload failed: ${fileUploadResult?.error || 'Unknown error'}. You can upload it later from the startup details page.`;
        toastVariant = "destructive";
      } else if (!webhookSuccess && fileUploadResult?.success) {
        toastTitle = "Startup Added (Processing Failed)";
        toastDescription += " The pitch deck was uploaded but automatic processing failed to start.";
        toastVariant = "destructive";
      }
      
      toast({
        title: toastTitle,
        description: toastDescription,
        variant: toastVariant
      });

      onSuccess(createdStartup);

    } catch (error) {
      console.error('❌ Enhanced submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitStartup,
    isLoading
  };
};
