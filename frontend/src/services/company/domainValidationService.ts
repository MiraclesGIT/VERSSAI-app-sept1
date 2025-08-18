
import { supabase } from "@/integrations/supabase/client";

export async function checkDomainRegistration(email: string): Promise<{ success: boolean; requiresApproval?: boolean; message?: string; adminContact?: string }> {
  const domain = email.split('@')[1];
  
  console.log('🔍 [DOMAIN CHECK] Starting domain registration check for:', domain);
  
  // Enhanced security: Prevent gmail and other personal email domains from being associated with companies
  const personalEmailDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
    'icloud.com', 'protonmail.com', 'mail.com', 'yandex.com', 'zoho.com',
    'live.com', 'msn.com', 'comcast.net', 'verizon.net', 'att.net'
  ];
  
  if (personalEmailDomains.includes(domain.toLowerCase())) {
    console.log('❌ [DOMAIN CHECK] Personal email domain detected:', domain);
    return {
      success: false,
      message: 'Personal email addresses are not allowed for company registration. Please use a corporate email address.'
    };
  }
  
  // Check if it's a corporate domain
  console.log('🔍 [DOMAIN CHECK] Checking if domain is corporate:', domain);
  const { data: isCorporate, error: domainError } = await supabase.rpc('is_corporate_domain', { domain });
  
  if (domainError) {
    console.error('❌ [DOMAIN CHECK] Error checking corporate domain:', domainError);
    throw new Error(`Domain validation failed: ${domainError.message}`);
  }
  
  console.log('📋 [DOMAIN CHECK] Corporate domain check result for', domain, ':', isCorporate);
  
  if (!isCorporate) {
    console.log('❌ [DOMAIN CHECK] Not a corporate domain:', domain);
    return {
      success: false,
      message: 'Please use a corporate email address. Generic email providers are not allowed.'
    };
  }
  
  // CRITICAL CHECK: Does company already exist for this domain?
  console.log('🔍 [DOMAIN CHECK] Checking if company already exists for domain:', domain);
  
  // Step 1: Check if company exists for this domain
  const { data: existingCompany, error: companyError } = await supabase
    .from('companies')
    .select('id, name, domain')
    .eq('domain', domain)
    .maybeSingle();
  
  if (companyError) {
    console.error('❌ [DOMAIN CHECK] Error checking existing company:', companyError);
    throw new Error(`Company lookup failed: ${companyError.message}`);
  }
  
  if (existingCompany) {
    console.log('🚫 [DOMAIN CHECK] COMPANY ALREADY EXISTS for domain:', domain);
    console.log('📋 [DOMAIN CHECK] Existing company data:', existingCompany);
    
    // Step 2: Get admin users for this company (separate query)
    const { data: adminUsers, error: adminError } = await supabase
      .from('company_users')
      .select('role, user_id')
      .eq('company_id', existingCompany.id)
      .eq('role', 'admin');
    
    if (adminError) {
      console.error('❌ [DOMAIN CHECK] Error getting admin users:', adminError);
      // Don't fail the whole process, just proceed without admin info
    }
    
    console.log('📋 [DOMAIN CHECK] Admin users found:', adminUsers?.length || 0);
    
    const result = {
      success: false, // CRITICAL: This must be false to trigger requiresApproval handling
      requiresApproval: true, // This flags it as a company approval case
      message: `A company with domain ${domain} already exists. Please contact your company admin to get access.`,
      adminContact: (adminUsers && adminUsers.length > 0) ? 'Contact your company admin' : 'Contact support@verss.ai'
    };
    
    console.log('🚫 [DOMAIN CHECK] Returning company exists result:', result);
    console.log('🚫 [DOMAIN CHECK] This should trigger requiresApproval flow and STOP signup');
    return result;
  }
  
  console.log('✅ [DOMAIN CHECK] Domain registration check passed for:', domain);
  return { success: true };
}

export async function checkUserNeedsCompany(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return false;
  
  const company = await import('./companyQueryService').then(m => m.getUserCompany());
  if (company) return false;
  
  // Check if user's domain is corporate
  const domain = user.email.split('@')[1];
  const { data: isCorporate } = await supabase.rpc('is_corporate_domain', { domain });
  
  return isCorporate === true;
}
