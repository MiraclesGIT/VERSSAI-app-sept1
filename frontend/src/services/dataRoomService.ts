
import { supabase } from "@/integrations/supabase/client";

export async function uploadDataRoomFiles(startupId: string, files: File[]): Promise<string[]> {
  console.log('📁 Uploading data room files for startup:', startupId);
  
  const uploadPromises = files.map(async (file) => {
    const fileName = `${startupId}/${Date.now()}_${file.name}`;
    const filePath = `data_room/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('data_room_files')
      .upload(filePath, file);

    if (uploadError) {
      console.error('❌ Error uploading data room file:', uploadError);
      throw uploadError;
    }

    return filePath;
  });

  const filePaths = await Promise.all(uploadPromises);

  // Update the startup record with the data room file paths
  const { data: currentStartup } = await supabase
    .from('startups')
    .select('data_room_file_paths')
    .eq('id', startupId)
    .single();

  const existingPaths = currentStartup?.data_room_file_paths || [];
  const updatedPaths = [...existingPaths, ...filePaths];

  const { error: updateError } = await supabase
    .from('startups')
    .update({ data_room_file_paths: updatedPaths })
    .eq('id', startupId);

  if (updateError) {
    console.error('❌ Error updating startup with data room file paths:', updateError);
    throw updateError;
  }

  console.log('✅ Data room files uploaded successfully:', filePaths);
  return filePaths;
}

export async function deleteDataRoomFile(startupId: string, filePath: string): Promise<void> {
  console.log('🗑️ Deleting data room file:', filePath);
  
  const { error: deleteError } = await supabase.storage
    .from('data_room_files')
    .remove([filePath]);

  if (deleteError) {
    console.error('❌ Error deleting data room file:', deleteError);
    throw deleteError;
  }

  // Remove the file path from startup record
  const { data: currentStartup } = await supabase
    .from('startups')
    .select('data_room_file_paths')
    .eq('id', startupId)
    .single();

  const existingPaths = currentStartup?.data_room_file_paths || [];
  const updatedPaths = existingPaths.filter(path => path !== filePath);

  const { error: updateError } = await supabase
    .from('startups')
    .update({ data_room_file_paths: updatedPaths })
    .eq('id', startupId);

  if (updateError) {
    console.error('❌ Error updating startup after data room file deletion:', updateError);
    throw updateError;
  }

  console.log('✅ Data room file deleted successfully');
}

export async function getDataRoomFileUrl(filePath: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from('data_room_files')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
