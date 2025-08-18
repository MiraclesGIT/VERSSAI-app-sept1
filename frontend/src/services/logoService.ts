
import { supabase } from "@/integrations/supabase/client";

export async function uploadStartupLogo(startupId: string, file: File): Promise<string> {
  console.log('📁 Uploading logo for startup:', startupId);
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${startupId}_logo.${fileExt}`;
  const filePath = `logos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('startup_logos')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error('❌ Error uploading logo:', uploadError);
    throw uploadError;
  }

  // Get public URL
  const { data } = await supabase.storage
    .from('startup_logos')
    .getPublicUrl(filePath);

  // Update the startup record with the logo URL
  const { error: updateError } = await supabase
    .from('startups')
    .update({ logo_url: data.publicUrl })
    .eq('id', startupId);

  if (updateError) {
    console.error('❌ Error updating startup with logo URL:', updateError);
    throw updateError;
  }

  console.log('✅ Logo uploaded successfully:', data.publicUrl);
  return data.publicUrl;
}

export async function deleteStartupLogo(startupId: string, logoUrl: string): Promise<void> {
  console.log('🗑️ Deleting startup logo:', logoUrl);
  
  // Extract file path from URL
  const url = new URL(logoUrl);
  const filePath = url.pathname.split('/').slice(-2).join('/'); // Get bucket/file part
  
  const { error: deleteError } = await supabase.storage
    .from('startup_logos')
    .remove([filePath]);

  if (deleteError) {
    console.error('❌ Error deleting logo:', deleteError);
    throw deleteError;
  }

  // Remove the logo URL from startup record
  const { error: updateError } = await supabase
    .from('startups')
    .update({ logo_url: null })
    .eq('id', startupId);

  if (updateError) {
    console.error('❌ Error updating startup after logo deletion:', updateError);
    throw updateError;
  }

  console.log('✅ Logo deleted successfully');
}
