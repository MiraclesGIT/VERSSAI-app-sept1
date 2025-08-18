
import { supabase } from '@/integrations/supabase/client';
import { validateStorageAccess } from '@/services/dueDiligence/dueDiligenceSecurityService';

export const generateDeckDownloadUrl = async (filePath: string): Promise<string | null> => {
  try {
    // Validate storage access before generating URL
    const hasAccess = await validateStorageAccess('pitch_decks', filePath);
    if (!hasAccess) {
      console.error('❌ Access denied to generate download URL');
      return null;
    }

    const { data, error } = await supabase.storage
      .from('pitch_decks')
      .createSignedUrl(filePath, 172800); // 48 hours expiry

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error generating download URL:', error);
    return null;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Enhanced file validation with security checks
export const validateFileAccess = async (bucketId: string, filePath: string): Promise<boolean> => {
  return await validateStorageAccess(bucketId, filePath);
};
