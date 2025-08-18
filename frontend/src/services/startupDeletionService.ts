
import { supabase } from "@/integrations/supabase/client";
import { getUserCompany } from "./companyService";

export async function deleteStartupCompletely(id: string): Promise<void> {
  console.log('🗑️ Starting complete deletion of startup:', id);
  
  try {
    // Get user's company for security
    const userCompany = await getUserCompany();
    if (!userCompany) {
      throw new Error('User must belong to a company to delete startup');
    }

    // First, get the startup data to find associated files
    const { data: startup, error: fetchError } = await supabase
      .from('startups')
      .select('deck_file_path, logo_url, data_room_file_paths')
      .eq('id', id)
      .eq('company_id', userCompany.id) // Ensure user can only delete startups from their company
      .single();
    
    if (fetchError) {
      console.error('❌ Error fetching startup for deletion:', fetchError);
      throw fetchError;
    }
    
    // Delete pitch deck file if exists
    if (startup.deck_file_path) {
      try {
        await supabase.storage
          .from('pitch_decks')
          .remove([startup.deck_file_path]);
        console.log('✅ Deleted pitch deck file');
      } catch (error) {
        console.error('❌ Error deleting pitch deck file:', error);
      }
    }
    
    // Delete logo file if exists
    if (startup.logo_url) {
      try {
        const url = new URL(startup.logo_url);
        const filePath = url.pathname.split('/').slice(-2).join('/');
        await supabase.storage
          .from('startup_logos')
          .remove([filePath]);
        console.log('✅ Deleted logo file');
      } catch (error) {
        console.error('❌ Error deleting logo file:', error);
      }
    }
    
    // Delete data room files if exist
    if (startup.data_room_file_paths && startup.data_room_file_paths.length > 0) {
      try {
        await supabase.storage
          .from('data_room_files')
          .remove(startup.data_room_file_paths);
        console.log('✅ Deleted data room files');
      } catch (error) {
        console.error('❌ Error deleting data room files:', error);
      }
    }
    
    // Delete startup profile (RLS will handle company filtering)
    const { error: profileError } = await supabase
      .from('startup_profiles')
      .delete()
      .eq('startup_id', id);
    
    if (profileError) {
      console.error('❌ Error deleting startup profile:', profileError);
      // Don't throw here, continue with startup deletion
    } else {
      console.log('✅ Deleted startup profile');
    }
    
    // Finally, delete the startup record (RLS will handle company filtering)
    const { error: deleteError } = await supabase
      .from('startups')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('❌ Error deleting startup:', deleteError);
      throw deleteError;
    }
    
    console.log('✅ Startup completely deleted successfully for company:', userCompany.name);
    
  } catch (error) {
    console.error('❌ Complete startup deletion failed:', error);
    throw error;
  }
}
