
import { supabase } from "@/integrations/supabase/client";
import { CompanyUser, CompanyRole } from "@/types/company";
import { getUserCompany } from "./companyQueryService";
import { 
  addPendingInvitation, 
  getPendingInvitations, 
  removePendingInvitation,
  updatePendingInvitationTimestamp
} from "./pendingInvitationService";

export async function getCompanyUsers(companyId: string): Promise<CompanyUser[]> {
  console.log('🔍 Fetching users for company:', companyId);
  
  try {
    const { data: companyUsers, error: companyUsersError } = await supabase
      .from('company_users')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (companyUsersError) {
      console.error('Error fetching company users:', companyUsersError);
      throw companyUsersError;
    }

    if (!companyUsers || companyUsers.length === 0) {
      console.log('✅ No company users found');
      return [];
    }

    console.log('📊 Found company users:', companyUsers.length);
    console.log('✅ Fetched company users with emails directly from company_users table');
    
    return companyUsers.map(user => ({
      ...user,
      user: {
        email: user.email || `User ID: ${user.user_id.slice(0, 12)}...`,
        full_name: null // We can add this later if needed
      }
    }));
  } catch (error) {
    console.error('Failed to fetch company users:', error);
    throw error;
  }
}

export async function addUserToCompany(email: string, role: CompanyRole): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated');
  
  const company = await getUserCompany();
  if (!company) throw new Error('No company found');
  
  const newUserDomain = email.split('@')[1];
  if (newUserDomain !== company.domain) {
    throw new Error(`User must have an email from the company domain: ${company.domain}`);
  }
  
  console.log('👤 Inviting user to company:', email, role);
  
  try {
    const { data, error } = await supabase.functions.invoke('invite-user', {
      body: {
        email: email,
        role: role
      }
    });
    
    if (error) {
      console.error('❌ Error from invite-user function:', error);
      throw new Error(error.message || 'Failed to invite user');
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to invite user');
    }
    
    console.log('✅ Invite function response:', data);
    
    // Check if this was a new user invitation (not existing user added directly)
    const isNewInvitation = data.rateLimited || 
                           (data.message && (
                             data.message.includes('sign up') || 
                             data.message.includes('invitation') ||
                             data.message.includes('invite')
                           )) &&
                           !data.message.includes('Existing user added');
    
    if (isNewInvitation) {
      console.log('📝 Tracking as pending invitation:', { email, role, rateLimited: data.rateLimited });
      await addPendingInvitation({
        email,
        role,
        invitedAt: new Date(),
        companyId: company.id
      });
    } else {
      console.log('👤 User was added directly (existing user)');
    }
    
    console.log('✅ User invited successfully');
  } catch (error) {
    console.error('Failed to add user to company:', error);
    throw error;
  }
}

export async function resendUserInvitation(email: string, role: CompanyRole): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated');
  
  const company = await getUserCompany();
  if (!company) throw new Error('No company found');
  
  console.log('🔄 Resending invitation to:', email, role);
  
  try {
    const { data, error } = await supabase.functions.invoke('invite-user', {
      body: {
        email: email,
        role: role
      }
    });
    
    if (error) {
      console.error('❌ Error from invite-user function:', error);
      throw new Error(error.message || 'Failed to resend invitation');
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to resend invitation');
    }
    
    // Update the invitation timestamp
    await updatePendingInvitationTimestamp(email, company.id);
    
    console.log('✅ Invitation resent successfully');
  } catch (error) {
    console.error('Failed to resend invitation:', error);
    throw error;
  }
}

export async function removeUser(userId: string): Promise<void> {
  console.log('🗑️ Removing user from system:', userId);
  
  try {
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: {
        userId: userId
      }
    });
    
    if (error) {
      console.error('❌ Error from delete-user function:', error);
      throw new Error(error.message || 'Failed to delete user');
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete user');
    }
    
    console.log('✅ User removed successfully');
  } catch (error) {
    console.error('Failed to remove user:', error);
    throw error;
  }
}

export async function updateUserRole(userId: string, role: CompanyRole): Promise<void> {
  const { error } = await supabase
    .from('company_users')
    .update({ role })
    .eq('user_id', userId);
  
  if (error) throw error;
}

export async function getPendingInvitationsForCompany(companyId: string) {
  return await getPendingInvitations(companyId);
}

export async function handleUserSignedUp(email: string, companyId: string) {
  // Remove from pending invitations when user signs up
  console.log('🧹 Cleaning up pending invitation for:', email, 'in company:', companyId);
  await removePendingInvitation(email, companyId);
}

export async function deletePendingInvitation(email: string, companyId: string) {
  await removePendingInvitation(email, companyId);
}
