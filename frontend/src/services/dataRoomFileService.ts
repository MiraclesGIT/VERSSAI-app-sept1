
import { supabase } from "@/integrations/supabase/client";

export interface DataRoomFileInfo {
  filePath: string;
  fileName: string;
  downloadUrl: string;
  fileSize?: number;
  fileType?: string;
}

export async function generateDataRoomFileUrls(filePaths: string[]): Promise<DataRoomFileInfo[]> {
  console.log('🔗 Generating download URLs for data room files:', filePaths);
  
  const fileInfos: DataRoomFileInfo[] = [];
  
  for (const filePath of filePaths) {
    try {
      // Generate signed URL with 1 hour expiry using the correct bucket
      const { data, error } = await supabase.storage
        .from('data_room_files')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (error) {
        console.error(`❌ Error generating URL for ${filePath}:`, error);
        continue;
      }
      
      if (data?.signedUrl) {
        const fileName = filePath.split('/').pop()?.split('_').slice(1).join('_') || filePath;
        
        fileInfos.push({
          filePath,
          fileName,
          downloadUrl: data.signedUrl,
          fileType: getFileType(fileName),
        });
        
        console.log(`✅ Generated URL for ${fileName}`);
      }
    } catch (error) {
      console.error(`❌ Unexpected error generating URL for ${filePath}:`, error);
    }
  }
  
  return fileInfos;
}

function getFileType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'xlsx':
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'docx':
    case 'doc':
      return 'application/msword';
    case 'txt':
      return 'text/plain';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

export async function getDataRoomFileUrl(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('data_room_files')
      .createSignedUrl(filePath, 3600);
    
    if (error) {
      console.error('Error generating file URL:', error);
      return null;
    }
    
    return data?.signedUrl || null;
  } catch (error) {
    console.error('Unexpected error generating file URL:', error);
    return null;
  }
}
