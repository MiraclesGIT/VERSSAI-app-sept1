
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { StartupFormState } from '@/types/startup';
import { createStartup } from '@/services/startupCreationService';
import { uploadPitchDeck } from '@/services/fileService';
import { triggerN8NWebhook } from '@/services/webhookService';

export const useStartupSubmission = () => {
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
      console.log("📝 Form data being submitted:", startup);
      
      // Step 1: Create startup in database first (this is the main action)
      console.log("🏢 Creating startup record...");
      const createdStartup = await createStartup(startup);

      console.log("✅ Startup created successfully:", createdStartup);

      // Step 2: Handle file upload (non-blocking - don't fail if this fails)
      let fileUploadFailed = false;
      let uploadErrorMessage = "";
      let fileInfo = null;

      if (file && createdStartup.id) {
        try {
          console.log("📄 Uploading pitch deck...");
          const filePath = await uploadPitchDeck(createdStartup.id, file);
          if (filePath) {
            console.log("✅ File uploaded successfully");
            fileInfo = {
              filePath,
              originalFile: file
            };
          }
        } catch (fileError) {
          console.error("❌ File upload failed:", fileError);
          fileUploadFailed = true;
          uploadErrorMessage = fileError instanceof Error ? fileError.message : "Unknown file upload error";
        }
      }

      // Step 3: Trigger N8N webhook (non-blocking - don't fail startup creation if this fails)
      let webhookFailed = false;
      let webhookErrorMessage = "";

      try {
        console.log("🚀 Triggering N8N webhook...");
        await triggerN8NWebhook(createdStartup, fileInfo);
        console.log("✅ N8N webhook triggered successfully");
      } catch (webhookError) {
        console.error("❌ N8N webhook failed:", webhookError);
        webhookFailed = true;
        webhookErrorMessage = webhookError instanceof Error ? webhookError.message : "Unknown webhook error";
      }

      // Show success message with appropriate warnings
      const humorousMessages = [
        `${startup.name} added! Our AI agents are brewing a profile faster than a cat video goes viral.`,
        `Starting up ${startup.name}! Our AI hamsters are running on wheels to create your profile.`,
        `${startup.name} is in! Our AI wizards are waving their digital wands to conjure your profile.`,
        `We've planted the ${startup.name} seed! Our AI gardeners are nurturing it into a full profile tree.`,
        `${startup.name} has entered the matrix! Our AI agents are coding reality to build your profile.`
      ];
      
      const randomMessage = humorousMessages[Math.floor(Math.random() * humorousMessages.length)];
      
      let toastTitle = "Success!";
      let toastDescription = randomMessage;
      let toastVariant: "default" | "destructive" = "default";
      
      // Handle different error combinations
      if (fileUploadFailed && webhookFailed) {
        toastTitle = "Startup Added (Upload & Processing Failed)";
        toastDescription = `${randomMessage}\n\nNote: Pitch deck upload failed: ${uploadErrorMessage}. AI processing also failed: ${webhookErrorMessage}. You can upload the deck later and trigger processing manually.`;
        toastVariant = "destructive";
      } else if (fileUploadFailed) {
        toastTitle = "Startup Added (Upload Failed)";
        toastDescription = `${randomMessage}\n\nNote: Pitch deck upload failed: ${uploadErrorMessage}. You can upload it later from the startup details page.`;
        toastVariant = "destructive";
      } else if (webhookFailed) {
        toastTitle = "Startup Added (Processing Failed)";
        toastDescription = `${randomMessage}\n\nNote: AI processing failed to start: ${webhookErrorMessage}. You can trigger it manually later.`;
        toastVariant = "destructive";
      }
      
      toast({
        title: toastTitle,
        description: toastDescription,
        variant: toastVariant
      });

      // Notify success
      onSuccess(createdStartup);

    } catch (error) {
      console.error('❌ Unexpected error in submitStartup:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
