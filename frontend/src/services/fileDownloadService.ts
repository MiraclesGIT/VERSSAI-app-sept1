
import { supabase } from "@/integrations/supabase/client";

export async function downloadFile(bucket: string, filePath: string): Promise<void> {
  console.log('📥 Downloading file:', filePath);
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 60); // 1 minute expiry for download

  if (error) {
    console.error('❌ Error creating download URL:', error);
    throw error;
  }

  // Open the file in a new tab
  window.open(data.signedUrl, '_blank');
}
