
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { checkDomainRegistration } from "./domainValidationService";

export async function createCompanyAndUser(email: string, companyName: string): Promise<Company> {
  const domain = email.split('@')[1];
  
  console.log('🏢 Starting company creation process...');
  console.log('📧 Email:', email);
  console.log('🏷️ Company Name:', companyName);
  console.log('🌐 Domain:', domain);
  
  // Validate inputs
  if (!email?.trim()) {
    throw new Error('Email is required');
  }
  
  if (!companyName?.trim()) {
    throw new Error('Company name is required');
  }
  
  if (!domain) {
    throw new Error('Invalid email format - no domain found');
  }
  
  // Enhanced security: Ensure email domain matches company domain for security
  const emailDomain = email.split('@')[1];
  if (!emailDomain) {
    throw new Error('Invalid email format');
  }
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('❌ Error getting current user:', userError);
    throw new Error(`Authentication error: ${userError.message}`);
  }
  
  if (!user) {
    console.error('❌ No authenticated user found');
    throw new Error('User must be authenticated to create a company');
  }
  
  // Security validation: Ensure user's email domain matches the company domain they're trying to create
  const userEmailDomain = user.email?.split('@')[1];
  if (userEmailDomain !== emailDomain) {
    throw new Error('You can only create a company for your own email domain');
  }
  
  console.log('👤 Authenticated user ID:', user.id);
  console.log('📧 User email:', user.email);
  
  // Verify domain validation one more time
  const domainCheck = await checkDomainRegistration(email);
  if (!domainCheck.success) {
    throw new Error(domainCheck.message || 'Domain validation failed');
  }
  
  try {
    // Step 1: Create company
    console.log('🏢 Creating company record...');
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: companyName.trim(),
        domain: domain
      })
      .select()
      .single();
    
    if (companyError) {
      console.error('❌ Error creating company:', companyError);
      throw new Error(`Failed to create company: ${companyError.message}`);
    }
    
    if (!company) {
      throw new Error('Company creation returned no data');
    }
    
    console.log('✅ Company created successfully:', company.id);
    
    // Step 2: Add user as admin
    console.log('👤 Adding user as company admin...');
    const { error: userError } = await supabase
      .from('company_users')
      .insert({
        user_id: user.id,
        company_id: company.id,
        role: 'admin'
      });
    
    if (userError) {
      console.error('❌ Error adding user to company:', userError);
      
      // Cleanup: try to delete the company we just created
      console.log('🧹 Attempting to clean up company record...');
      await supabase
        .from('companies')
        .delete()
        .eq('id', company.id);
      
      throw new Error(`Failed to add user to company: ${userError.message}`);
    }
    
    console.log('✅ User added as admin successfully');
    
    // Convert the database response to our Company type
    const result: Company = {
      id: company.id,
      name: company.name,
      domain: company.domain,
      logo_url: company.logo_url,
      created_at: company.created_at,
      updated_at: company.updated_at,
      settings: typeof company.settings === 'object' && company.settings !== null ? company.settings as Record<string, any> : {}
    };
    
    console.log('🎉 Company creation completed successfully!');
    return result;
    
  } catch (error) {
    console.error('💥 Company creation failed:', error);
    throw error;
  }
}

export async function updateCompany(companyId: string, updates: Partial<Company>): Promise<void> {
  const { error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', companyId);
  
  if (error) throw error;
}
