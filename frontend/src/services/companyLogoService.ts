
import { supabase } from "@/integrations/supabase/client";

export async function uploadCompanyLogo(companyId: string, file: File): Promise<string> {
  console.log('📁 Uploading company logo for:', companyId);
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${companyId}_logo.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('company_logos')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error('❌ Error uploading company logo:', uploadError);
    throw uploadError;
  }

  // Get public URL
  const { data } = await supabase.storage
    .from('company_logos')
    .getPublicUrl(filePath);

  console.log('✅ Company logo uploaded successfully:', data.publicUrl);
  return data.publicUrl;
}

export async function deleteCompanyLogo(companyId: string, logoUrl: string): Promise<void> {
  console.log('🗑️ Deleting company logo:', logoUrl);
  
  // Extract file path from URL
  const url = new URL(logoUrl);
  const filePath = url.pathname.split('/').pop(); // Get just the filename
  
  if (!filePath) {
    throw new Error('Invalid logo URL');
  }

  const { error: deleteError } = await supabase.storage
    .from('company_logos')
    .remove([filePath]);

  if (deleteError) {
    console.error('❌ Error deleting company logo:', deleteError);
    throw deleteError;
  }

  console.log('✅ Company logo deleted successfully');
}
