
import { supabase } from "@/integrations/supabase/client";

export interface FileReplacementResult {
  success: boolean;
  newFilePath?: string;
  error?: string;
}

export const replacePitchDeck = async (
  startupId: string, 
  newFile: File, 
  oldFilePath?: string | null
): Promise<FileReplacementResult> => {
  console.log('🔄 Starting atomic pitch deck replacement for startup:', startupId);
  
  try {
    // Validate file first
    const validation = validatePitchDeckFile(newFile);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Step 1: Upload new file first
    const fileName = `${startupId}_${Date.now()}_${newFile.name}`;
    const newFilePath = `pitch_decks/${fileName}`;

    console.log('📁 Uploading new pitch deck to:', newFilePath);
    const { error: uploadError } = await supabase.storage
      .from('pitch_decks')
      .upload(newFilePath, newFile);

    if (uploadError) {
      console.error('❌ Failed to upload new file:', uploadError);
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    // Step 2: Update database with new file path
    console.log('💾 Updating startup record with new file path');
    const { error: updateError } = await supabase
      .from('startups')
      .update({ deck_file_path: newFilePath })
      .eq('id', startupId);

    if (updateError) {
      console.error('❌ Failed to update database, rolling back upload');
      // Rollback: delete the uploaded file
      await supabase.storage.from('pitch_decks').remove([newFilePath]);
      return { success: false, error: `Database update failed: ${updateError.message}` };
    }

    // Step 3: Delete old file if it exists (after successful database update)
    if (oldFilePath) {
      console.log('🗑️ Cleaning up old file:', oldFilePath);
      try {
        await supabase.storage.from('pitch_decks').remove([oldFilePath]);
        console.log('✅ Old file deleted successfully');
      } catch (deleteError) {
        console.error('⚠️ Failed to delete old file (non-critical):', deleteError);
        // Don't fail the entire operation for cleanup issues
      }
    }

    console.log('✅ Pitch deck replacement completed successfully');
    return { success: true, newFilePath };

  } catch (error) {
    console.error('❌ Unexpected error during pitch deck replacement:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unexpected error occurred' 
    };
  }
};

export const validatePitchDeckFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds the 50MB limit`
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Please upload PDF, PPT, or PPTX files only.`
    };
  }

  return { isValid: true };
};

export const enhancedDeletePitchDeck = async (
  startupId: string, 
  filePath: string
): Promise<{ success: boolean; error?: string }> => {
  console.log('🗑️ Starting enhanced pitch deck deletion for startup:', startupId);
  
  try {
    // Step 1: Delete file from storage
    const { error: deleteError } = await supabase.storage
      .from('pitch_decks')
      .remove([filePath]);

    if (deleteError) {
      console.error('❌ Failed to delete file from storage:', deleteError);
      return { success: false, error: `Storage deletion failed: ${deleteError.message}` };
    }

    // Step 2: Update database to remove file path
    const { error: updateError } = await supabase
      .from('startups')
      .update({ deck_file_path: null })
      .eq('id', startupId);

    if (updateError) {
      console.error('❌ Failed to update database after file deletion:', updateError);
      return { success: false, error: `Database update failed: ${updateError.message}` };
    }

    console.log('✅ Pitch deck deletion completed successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Unexpected error during pitch deck deletion:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unexpected error occurred' 
    };
  }
};

export const cleanupOrphanedFiles = async (startupId: string): Promise<void> => {
  console.log('🧹 Starting cleanup of orphaned files for startup:', startupId);
  
  try {
    // List all files in the startup's folder
    const { data: files, error: listError } = await supabase.storage
      .from('pitch_decks')
      .list('', {
        search: startupId
      });

    if (listError || !files) {
      console.error('❌ Failed to list files for cleanup:', listError);
      return;
    }

    // Get current file path from database
    const { data: startup, error: fetchError } = await supabase
      .from('startups')
      .select('deck_file_path')
      .eq('id', startupId)
      .single();

    if (fetchError) {
      console.error('❌ Failed to fetch startup data for cleanup:', fetchError);
      return;
    }

    const currentFilePath = startup?.deck_file_path;
    const orphanedFiles = files.filter(file => {
      const fullPath = `pitch_decks/${file.name}`;
      return fullPath !== currentFilePath && file.name.includes(startupId);
    });

    if (orphanedFiles.length > 0) {
      console.log(`🗑️ Found ${orphanedFiles.length} orphaned files, cleaning up...`);
      const pathsToDelete = orphanedFiles.map(file => `pitch_decks/${file.name}`);
      
      await supabase.storage
        .from('pitch_decks')
        .remove(pathsToDelete);
      
      console.log('✅ Orphaned files cleaned up successfully');
    } else {
      console.log('✅ No orphaned files found');
    }

  } catch (error) {
    console.error('❌ Error during orphaned file cleanup:', error);
    // Don't throw - cleanup is non-critical
  }
};
