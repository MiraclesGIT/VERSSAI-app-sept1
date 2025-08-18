
import { supabase } from "@/integrations/supabase/client";

export async function uploadPitchDeck(startupId: string, file: File): Promise<string> {
  console.log('📁 Uploading pitch deck for startup:', startupId);
  
  const fileName = `${startupId}_${Date.now()}_${file.name}`;
  const filePath = `pitch_decks/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('pitch_decks')
    .upload(filePath, file);

  if (uploadError) {
    console.error('❌ Error uploading pitch deck:', uploadError);
    throw uploadError;
  }

  // Update the startup record with the deck file path
  const { error: updateError } = await supabase
    .from('startups')
    .update({ deck_file_path: filePath })
    .eq('id', startupId);

  if (updateError) {
    console.error('❌ Error updating startup with deck path:', updateError);
    throw updateError;
  }

  console.log('✅ Pitch deck uploaded successfully:', filePath);
  return filePath;
}

export async function deletePitchDeck(filePath: string): Promise<void> {
  console.log('🗑️ Deleting pitch deck:', filePath);
  
  const { error: deleteError } = await supabase.storage
    .from('pitch_decks')
    .remove([filePath]);

  if (deleteError) {
    console.error('❌ Error deleting pitch deck:', deleteError);
    throw deleteError;
  }

  // Extract startup ID from file path to update the record
  const fileName = filePath.split('/').pop();
  const startupId = fileName?.split('_')[0];
  
  if (startupId) {
    const { error: updateError } = await supabase
      .from('startups')
      .update({ deck_file_path: null })
      .eq('id', startupId);

    if (updateError) {
      console.error('❌ Error updating startup after deck deletion:', updateError);
      throw updateError;
    }
  }

  console.log('✅ Pitch deck deleted successfully');
}

export async function getPitchDeckUrl(filePath: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from('pitch_decks')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
