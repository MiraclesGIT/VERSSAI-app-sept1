
import { supabase } from "@/integrations/supabase/client";
import { validateStorageAccess } from "./dueDiligence/dueDiligenceSecurityService";

export const uploadStartupDeck = async (startupId: string, file: File) => {
  console.log('🔄 Uploading deck for startup:', startupId, 'File:', file.name, 'Size:', file.size, 'Type:', file.type);
  
  // Validate file size (50MB limit)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    throw new Error(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds the 50MB limit`);
  }

  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed. Please upload PDF, PPT, or PPTX files only.`);
  }
  
  const fileExt = file.name.split('.').pop();
  const timestamp = new Date().getTime();
  const fileName = `${startupId}/${timestamp}_deck.${fileExt}`;
  
  console.log('📁 Uploading to bucket: pitch_decks, path:', fileName);
  
  // Validate storage access
  const hasStorageAccess = await validateStorageAccess('pitch_decks', fileName);
  if (!hasStorageAccess) {
    throw new Error('Access denied: You do not have permission to upload files for this startup');
  }
  
  try {
    // Upload the file to the secured pitch_decks bucket
    const { data, error } = await supabase.storage
      .from('pitch_decks')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Storage upload error:', {
        message: error.message,
        error: error
      });
      
      // Provide more specific error messages
      if (error.message?.includes('duplicate')) {
        throw new Error('A file with this name already exists. Please try uploading again.');
      } else if (error.message?.includes('policy')) {
        throw new Error('Permission denied. Please make sure you are logged in and have access to this startup.');
      } else if (error.message?.includes('size')) {
        throw new Error('File size exceeds the allowed limit.');
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    }

    console.log('✅ File uploaded successfully:', data.path);
    
    // Update the startup record with the deck file path
    const { error: updateError } = await supabase
      .from('startups')
      .update({ deck_file_path: data.path })
      .eq('id', startupId);
      
    if (updateError) {
      console.error('❌ Failed to update startup with deck path:', updateError);
      // Don't throw here as the file was uploaded successfully
    }
    
    return data.path;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
};
