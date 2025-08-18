
import { supabase } from "@/integrations/supabase/client";
import { triggerMicroDueDiligence } from "./microDueDiligenceService";

export const triggerN8NWebhook = async (startupData: any, fileInfo?: any) => {
  console.log('🚀 Triggering N8N webhook with startup data:', startupData.name);
  
  // Ensure we have company context
  if (!startupData.company_id) {
    console.error('❌ Startup data missing company_id');
    throw new Error('Startup must be associated with a company');
  }

  // Fetch company information
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('name')
    .eq('id', startupData.company_id)
    .single();

  if (companyError || !company) {
    console.error('❌ Failed to fetch company data:', companyError);
    throw new Error('Failed to fetch company information');
  }

  const webhookUrl = 'https://versatil.app.n8n.cloud/webhook/30952066-19f5-4000-bdbd-755d1fc139e5';
  const callbackUrl = 'https://chwjydignjdyhkpgkdsz.supabase.co/functions/v1/n8n-webhook';
  
  // Generate download URL if file exists
  let deckDownloadUrl = '';
  if (fileInfo?.filePath) {
    try {
      const { data, error } = await supabase.storage
        .from('pitch_decks')
        .createSignedUrl(fileInfo.filePath, 172800); // 48 hours expiry

      if (!error && data) {
        deckDownloadUrl = data.signedUrl;
      }
    } catch (error) {
      console.error('❌ Failed to generate download URL:', error);
    }
  }
  
  const payload = {
    startupId: startupData.id,
    startupName: startupData.name,
    companyId: startupData.company_id,
    companyName: company.name,
    founder: startupData.founder || '',
    stage: startupData.stage || '',
    location: startupData.location || '',
    industry: startupData.industry || '',
    website: startupData.website || '',
    callbackUrl,
    submittedAt: new Date().toISOString(),
    hasFile: fileInfo ? true : false,
    filePath: fileInfo?.filePath || '',
    fileMimeType: fileInfo?.originalFile?.type || '',
    deckDownloadUrl: deckDownloadUrl,
    fileInfo: fileInfo || null
  };

  try {
    console.log('📤 Sending webhook POST request to:', webhookUrl);
    console.log('📦 Payload with company context:', payload);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`N8N webhook failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.text();
    console.log('✅ N8N webhook triggered successfully with company context:', result);
    
    // If there's a deck file, also trigger micro due diligence
    if (fileInfo?.filePath) {
      try {
        console.log('🔄 Triggering micro due diligence for new startup with deck...');
        await triggerMicroDueDiligence(
          startupData.id,
          startupData.name,
          fileInfo.filePath,
          'startup_creation'
        );
        console.log('✅ Micro due diligence triggered successfully');
      } catch (microDDError) {
        console.error('❌ Failed to trigger micro due diligence:', microDDError);
        // Don't fail the entire process for micro DD errors
      }
    }
    
    return result;
  } catch (error) {
    console.error('❌ Failed to trigger N8N webhook:', error);
    throw error;
  }
};
