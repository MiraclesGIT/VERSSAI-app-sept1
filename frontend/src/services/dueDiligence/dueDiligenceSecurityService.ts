
import { supabase } from "@/integrations/supabase/client";
import { getUserCompany } from "../companyService";

export async function validateUserCompanyAccess(startupId?: string): Promise<boolean> {
  console.log('🔒 Validating user company access for startup:', startupId);
  
  try {
    const userCompany = await getUserCompany();
    if (!userCompany) {
      console.error('❌ No user company found');
      return false;
    }

    if (!startupId) {
      console.log('✅ User has company access');
      return true;
    }

    // Verify the startup belongs to the user's company
    const { data: startup, error } = await supabase
      .from('startups')
      .select('company_id')
      .eq('id', startupId)
      .single();

    if (error) {
      console.error('❌ Error fetching startup company:', error);
      return false;
    }

    if (startup.company_id !== userCompany.id) {
      console.error('❌ Startup does not belong to user company');
      return false;
    }

    console.log('✅ User has access to startup');
    return true;
  } catch (error) {
    console.error('❌ Error validating company access:', error);
    return false;
  }
}

export async function getCompanyFilteredQuery(baseQuery: any, tableName: string = 'startups') {
  const userCompany = await getUserCompany();
  if (!userCompany) {
    throw new Error('User must belong to a company');
  }

  // Add company filtering to the query
  if (tableName === 'startups') {
    return baseQuery.eq('company_id', userCompany.id);
  } else {
    // For related tables, filter through startup relationship
    return baseQuery.eq('startups.company_id', userCompany.id);
  }
}

// Enhanced security checker for storage operations
export async function validateStorageAccess(bucketId: string, filePath: string): Promise<boolean> {
  console.log('🔒 Validating storage access:', { bucketId, filePath });
  
  try {
    const userCompany = await getUserCompany();
    if (!userCompany) {
      console.error('❌ No user company found for storage access');
      return false;
    }

    // Extract startup ID from file path (assuming format: startupId/filename)
    const pathParts = filePath.split('/');
    if (pathParts.length < 2) {
      console.error('❌ Invalid file path format:', filePath);
      return false;
    }

    const startupId = pathParts[0];
    
    // Handle bulk upload temporary IDs - these don't correspond to real startups yet
    if (startupId.startsWith('bulk_')) {
      console.log('🔄 Bulk upload detected, validating company access only');
      // For bulk uploads, just validate that user has a company
      // The actual startup records will be created later by N8N
      console.log('✅ Storage access validated for bulk upload by company:', userCompany.name);
      return true;
    }
    
    // For regular startup files, verify startup belongs to user's company
    const { data: startup, error } = await supabase
      .from('startups')
      .select('company_id')
      .eq('id', startupId)
      .single();

    if (error) {
      console.error('❌ Error fetching startup for storage validation:', error);
      return false;
    }

    if (startup.company_id !== userCompany.id) {
      console.error('❌ Storage access denied: startup not in user company');
      return false;
    }

    console.log('✅ Storage access validated for company:', userCompany.name);
    return true;
  } catch (error) {
    console.error('❌ Error validating storage access:', error);
    return false;
  }
}
