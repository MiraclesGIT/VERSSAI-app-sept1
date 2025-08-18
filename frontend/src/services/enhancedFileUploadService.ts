
import { supabase } from "@/integrations/supabase/client";
import { runUploadDiagnostics, logDetailedUploadError } from "./uploadDiagnostics";

export interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
  diagnostics?: any;
}

export const enhancedUploadPitchDeck = async (startupId: string, file: File): Promise<UploadResult> => {
  console.log('🚀 Starting enhanced pitch deck upload for:', startupId, file.name);
  
  try {
    // Step 1: Run comprehensive diagnostics
    const diagnostics = await runUploadDiagnostics(file);
    
    if (!diagnostics.authStatus) {
      return {
        success: false,
        error: "Authentication required. Please log in and try again.",
        diagnostics
      };
    }

    if (!diagnostics.userCompany) {
      return {
        success: false,
        error: "Company access required. Please ensure you belong to a company.",
        diagnostics
      };
    }

    if (!diagnostics.fileValidation.isValidSize) {
      return {
        success: false,
        error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds the 50MB limit.`,
        diagnostics
      };
    }

    if (!diagnostics.fileValidation.isValidType) {
      return {
        success: false,
        error: `File type "${file.type}" is not supported. Please upload PDF, PPT, or PPTX files only.`,
        diagnostics
      };
    }

    if (!diagnostics.storageAccess) {
      return {
        success: false,
        error: "Storage access denied. Please check your permissions.",
        diagnostics
      };
    }

    // Step 2: Prepare file upload
    const fileExt = file.name.split('.').pop();
    const timestamp = new Date().getTime();
    const fileName = `${startupId}/${timestamp}_deck.${fileExt}`;
    
    console.log('📁 Uploading to path:', fileName);

    // Step 3: Upload with detailed error tracking
    const { data, error } = await supabase.storage
      .from('pitch_decks')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      logDetailedUploadError(error, 'storage upload', file);
      
      let userFriendlyError = "Upload failed. ";
      if (error.message?.includes('duplicate')) {
        userFriendlyError += "A file with this name already exists. Please try again.";
      } else if (error.message?.includes('policy')) {
        userFriendlyError += "Permission denied. Please check your account permissions.";
      } else if (error.message?.includes('size')) {
        userFriendlyError += "File size exceeds the allowed limit.";
      } else if (error.message?.includes('timeout')) {
        userFriendlyError += "Upload timeout. Please check your connection and try again.";
      } else {
        userFriendlyError += `${error.message}`;
      }

      return {
        success: false,
        error: userFriendlyError,
        diagnostics
      };
    }

    console.log('✅ File uploaded successfully to:', data.path);

    // Step 4: Update startup record
    const { error: updateError } = await supabase
      .from('startups')
      .update({ deck_file_path: data.path })
      .eq('id', startupId);
      
    if (updateError) {
      logDetailedUploadError(updateError, 'startup update', file);
      console.warn('⚠️ File uploaded but failed to update startup record:', updateError);
    }

    return {
      success: true,
      filePath: data.path,
      diagnostics
    };

  } catch (error) {
    logDetailedUploadError(error, 'general upload', file);
    
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      diagnostics: await runUploadDiagnostics(file)
    };
  }
};

export const enhancedUploadMultipleDecks = async (files: File[]): Promise<any> => {
  console.log('🔄 Starting enhanced bulk upload for', files.length, 'files');
  
  const results = [];
  const failedFiles: { file: string; error: string }[] = [];
  
  // Run diagnostics on first file to check general readiness
  if (files.length > 0) {
    const diagnostics = await runUploadDiagnostics(files[0]);
    
    if (!diagnostics.authStatus || !diagnostics.userCompany || !diagnostics.storageAccess) {
      throw new Error(diagnostics.error || 'System not ready for uploads');
    }
  }

  for (const file of files) {
    try {
      const tempId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const result = await enhancedUploadPitchDeck(tempId, file);
      
      if (result.success && result.filePath) {
        // Generate signed URL for the uploaded file
        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from('pitch_decks')
          .createSignedUrl(result.filePath, 172800); // 48 hours
        
        if (!urlError && signedUrlData) {
          results.push({
            signedUrl: signedUrlData.signedUrl,
            filePath: result.filePath,
            fileName: file.name
          });
          console.log('✅ Bulk upload success:', file.name);
        } else {
          failedFiles.push({
            file: file.name,
            error: `URL generation failed: ${urlError?.message}`
          });
        }
      } else {
        failedFiles.push({
          file: file.name,
          error: result.error || 'Unknown upload error'
        });
      }
    } catch (error) {
      logDetailedUploadError(error, 'bulk upload item', file);
      failedFiles.push({
        file: file.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return {
    success: results.length > 0,
    uploadedFiles: results.map(r => r.signedUrl),
    uploadedFileInfos: results,
    failedFiles,
    webhookTriggered: false // Will be set by calling function
  };
};
