
import { supabase } from "@/integrations/supabase/client";

interface MicroDDWebhookPayload {
  startup_id: string;
  startup_name: string;
  company_id: string;
  company_name: string;
  deck_download_link: string;
  callback_url: string;
  trigger_type: 'startup_creation' | 'deck_upload';
}

export const triggerMicroDueDiligence = async (
  startupId: string,
  startupName: string,
  deckFilePath: string,
  triggerType: 'startup_creation' | 'deck_upload' = 'deck_upload'
) => {
  console.log('🚀 Triggering Micro Due Diligence for:', startupName);
  
  const webhookUrl = 'https://versatil.app.n8n.cloud/webhook/410ec99e-b644-41df-bba1-9be9c5bcad76';
  const callbackUrl = 'https://chwjydignjdyhkpgkdsz.supabase.co/functions/v1/micro-dd-webhook';
  
  // Get startup data with company information
  const { data: startupData, error: startupError } = await supabase
    .from('startups')
    .select('*, companies!inner(name)')
    .eq('id', startupId)
    .single();

  if (startupError || !startupData) {
    console.error('❌ Failed to fetch startup data:', startupError);
    throw new Error('Failed to fetch startup data for micro due diligence');
  }

  if (!startupData.company_id) {
    console.error('❌ Startup has no company association');
    throw new Error('Startup must be associated with a company');
  }

  const companyName = startupData.companies?.name || 'Unknown Company';

  // Generate download URL for the deck file
  let deckDownloadUrl = '';
  if (deckFilePath) {
    try {
      const { data, error } = await supabase.storage
        .from('pitch_decks')
        .createSignedUrl(deckFilePath, 172800); // 48 hours expiry

      if (!error && data) {
        deckDownloadUrl = data.signedUrl;
      }
    } catch (error) {
      console.error('❌ Failed to generate deck download URL:', error);
      throw new Error('Failed to generate deck download URL');
    }
  }

  if (!deckDownloadUrl) {
    throw new Error('No deck file available for micro due diligence');
  }

  // Get or create startup profile data for the workflow
  let profileData = null;
  const { data: existingProfile, error: profileError } = await supabase
    .from('startup_profiles')
    .select('*')
    .eq('startup_id', startupId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('❌ Failed to fetch startup profile:', profileError);
    throw new Error('Failed to fetch startup profile');
  }

  if (existingProfile) {
    profileData = existingProfile;
  } else {
    // Create a basic profile if it doesn't exist
    const { data: newProfile, error: createError } = await supabase
      .from('startup_profiles')
      .insert({
        startup_id: startupId,
        startup_name: startupName,
        company_id: startupData.company_id,
        micro_due_diligence_markdown: null,
        micro_due_diligence_html: null
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create startup profile:', createError);
      throw new Error('Failed to create startup profile');
    }
    profileData = newProfile;
  }

  // Create the payload structure that matches the N8N workflow expectations
  const payload = {
    body: {
      startup_id: startupId,
      startup_name: startupName,
      company_id: startupData.company_id,
      company_name: companyName,
      deck_download_link: deckDownloadUrl,
      callback_url: callbackUrl,
      trigger_type: triggerType
    }
  };

  try {
    console.log('📤 Sending micro DD webhook request to:', webhookUrl);
    console.log('📦 Payload with company context:', payload);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Micro DD webhook failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.text();
    console.log('✅ Micro DD webhook triggered successfully with company context:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to trigger micro DD webhook:', error);
    throw error;
  }
};
