
import { supabase } from "@/integrations/supabase/client";
import { uploadStartupDeck } from "./fileUploadService";
import { getUserCompany } from "./companyService";

export interface BulkUploadResponse {
  success: boolean;
  uploadedFiles: string[];
  failedFiles: { file: string; error: string }[];
  webhookTriggered: boolean;
}

interface UploadedFileInfo {
  signedUrl: string;
  filePath: string;
  fileName: string;
}

export const uploadMultipleDecks = async (files: File[]): Promise<BulkUploadResponse> => {
  console.log('🔄 Starting bulk upload for', files.length, 'files');
  
  // Get user's company context first
  const userCompany = await getUserCompany();
  if (!userCompany) {
    throw new Error('User must belong to a company to perform bulk uploads');
  }

  console.log('📋 Bulk upload initiated by company:', userCompany.name);
  
  const uploadedFiles: string[] = [];
  const uploadedFileInfos: UploadedFileInfo[] = [];
  const failedFiles: { file: string; error: string }[] = [];
  
  // Upload each file to storage and collect signed URLs and file paths
  for (const file of files) {
    try {
      // Create a temporary startup ID for organizing files
      const tempId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const filePath = await uploadStartupDeck(tempId, file);
      
      // Generate signed URL for the uploaded file
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('pitch_decks')
        .createSignedUrl(filePath, 172800); // 48 hours expiry
      
      if (urlError || !signedUrlData) {
        throw new Error(`Failed to generate signed URL: ${urlError?.message}`);
      }
      
      // Store both signed URL and file path
      uploadedFileInfos.push({
        signedUrl: signedUrlData.signedUrl,
        filePath: filePath,
        fileName: file.name
      });
      
      uploadedFiles.push(signedUrlData.signedUrl);
      console.log('✅ Successfully uploaded:', file.name);
    } catch (error) {
      console.error('❌ Failed to upload:', file.name, error);
      failedFiles.push({
        file: file.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Trigger N8N webhook if we have any successful uploads
  let webhookTriggered = false;
  if (uploadedFileInfos.length > 0) {
    try {
      await triggerBulkProcessingWebhook(uploadedFileInfos, userCompany);
      webhookTriggered = true;
      console.log('✅ N8N webhook triggered successfully with company context');
    } catch (error) {
      console.error('❌ Failed to trigger N8N webhook:', error);
    }
  }
  
  return {
    success: uploadedFiles.length > 0,
    uploadedFiles,
    failedFiles,
    webhookTriggered
  };
};

export const triggerBulkProcessingWebhook = async (
  uploadedFileInfos: UploadedFileInfo[], 
  userCompany: { id: string; name: string }
): Promise<void> => {
  console.log('🚀 Triggering N8N bulk processing webhook with', uploadedFileInfos.length, 'files');
  
  const webhookUrl = 'https://versatil.app.n8n.cloud/webhook/6c7a7515-aa7d-4378-a198-88a086ed63b0';
  
  const payload = {
    companyId: userCompany.id,
    companyName: userCompany.name,
    decks: uploadedFileInfos.map(info => ({
      downloadUrl: info.signedUrl,
      filePath: info.filePath,
      fileName: info.fileName
    })),
    submittedAt: new Date().toISOString(),
    totalDecks: uploadedFileInfos.length,
    source: 'bulk_upload',
    callbackUrl: 'https://chwjydignjdyhkpgkdsz.supabase.co/functions/v1/n8n-webhook'
  };
  
  try {
    console.log('📤 Sending bulk processing webhook with company context:', payload);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.text();
    console.log('✅ Bulk processing webhook triggered successfully with company context:', result);
  } catch (error) {
    console.error('❌ Failed to trigger bulk processing webhook:', error);
    throw error;
  }
};
