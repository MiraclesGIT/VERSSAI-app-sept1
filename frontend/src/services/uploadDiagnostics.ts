
import { supabase } from "@/integrations/supabase/client";

export interface UploadDiagnostics {
  authStatus: boolean;
  userCompany: any;
  fileValidation: {
    size: number;
    type: string;
    isValidSize: boolean;
    isValidType: boolean;
  };
  storageAccess: boolean;
  error?: string;
}

export const runUploadDiagnostics = async (file: File): Promise<UploadDiagnostics> => {
  console.log('🔍 Running upload diagnostics for file:', file.name);
  
  const diagnostics: UploadDiagnostics = {
    authStatus: false,
    userCompany: null,
    fileValidation: {
      size: file.size,
      type: file.type,
      isValidSize: file.size <= 50 * 1024 * 1024, // 50MB
      isValidType: [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ].includes(file.type)
    },
    storageAccess: false
  };

  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    diagnostics.authStatus = !!user && !authError;
    
    if (authError) {
      diagnostics.error = `Auth error: ${authError.message}`;
      return diagnostics;
    }

    // Check user company
    if (user) {
      const { data: companyUser, error: companyError } = await supabase
        .from('company_users')
        .select('company_id, companies(*)')
        .eq('user_id', user.id)
        .single();
      
      diagnostics.userCompany = companyUser;
      
      if (companyError) {
        diagnostics.error = `Company lookup error: ${companyError.message}`;
      }
    }

    // Test storage access with a simple list operation
    const { data: storageList, error: storageError } = await supabase.storage
      .from('pitch_decks')
      .list('', { limit: 1 });
    
    diagnostics.storageAccess = !storageError;
    
    if (storageError) {
      diagnostics.error = `Storage access error: ${storageError.message}`;
    }

    console.log('📊 Upload diagnostics results:', diagnostics);
    return diagnostics;

  } catch (error) {
    diagnostics.error = `Diagnostics error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('❌ Diagnostics failed:', error);
    return diagnostics;
  }
};

export const logDetailedUploadError = (error: any, context: string, file?: File) => {
  console.error(`❌ Upload error in ${context}:`, {
    error: error,
    message: error?.message,
    code: error?.code,
    status: error?.status,
    details: error?.details,
    hint: error?.hint,
    file: file ? {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    } : null,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  });
};
