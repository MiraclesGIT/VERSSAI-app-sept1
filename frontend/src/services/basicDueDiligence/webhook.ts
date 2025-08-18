
import { supabase } from "@/integrations/supabase/client";

export async function triggerBasicDueDiligenceWebhook(startupId: string, startupName: string): Promise<void> {
  console.log('🚀 Triggering basic due diligence webhook for:', startupName);
  
  // Fetch startup's company information first
  const { data: startup, error: startupError } = await supabase
    .from('startups')
    .select('company_id, companies!inner(name)')
    .eq('id', startupId)
    .single();

  if (startupError || !startup) {
    console.error('❌ Failed to fetch startup company data:', startupError);
    throw new Error('Failed to fetch startup company information');
  }

  if (!startup.company_id) {
    console.error('❌ Startup has no company association');
    throw new Error('Startup must be associated with a company');
  }

  const companyId = startup.company_id;
  const companyName = startup.companies?.name || 'Unknown Company';
  
  const webhookUrl = 'https://versatil.app.n8n.cloud/webhook/1ba65c6b-a709-4774-85b3-b0747ccd03ef';
  
  const payload = {
    startupId,
    startupName,
    companyId,
    companyName,
    timestamp: new Date().toISOString(),
    processingType: 'basic_due_diligence'
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
    console.log('✅ N8N basic due diligence webhook triggered successfully with company context:', result);
    
  } catch (error) {
    console.error('❌ Failed to trigger N8N basic due diligence webhook:', error);
    throw error;
  }
}
