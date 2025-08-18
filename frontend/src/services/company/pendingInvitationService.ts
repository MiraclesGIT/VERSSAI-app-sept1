
import { supabase } from "@/integrations/supabase/client";

export interface PendingInvitation {
  id?: string;
  email: string;
  role: string;
  invitedAt: Date;
  companyId: string;
  invitedBy?: string;
}

// Database-based pending invitation management
export async function addPendingInvitation(invitation: PendingInvitation): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('user_invitations')
      .upsert({
        email: invitation.email,
        role: invitation.role as any,
        company_id: invitation.companyId,
        invited_by: user?.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        token: generateInvitationToken(invitation.email, invitation.companyId)
      }, {
        onConflict: 'email,company_id'
      });
    
    if (error) {
      console.error('❌ Error adding pending invitation to database:', error);
      // Fallback to localStorage
      addPendingInvitationToLocalStorage(invitation);
    } else {
      console.log('✅ Added pending invitation to database');
    }
  } catch (error) {
    console.error('❌ Failed to add pending invitation:', error);
    // Fallback to localStorage
    addPendingInvitationToLocalStorage(invitation);
  }
}

export async function getPendingInvitations(companyId: string): Promise<PendingInvitation[]> {
  try {
    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('company_id', companyId)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString());
    
    if (error) {
      console.error('❌ Error fetching pending invitations from database:', error);
      // Fallback to localStorage
      return getPendingInvitationsFromLocalStorage().filter(inv => inv.companyId === companyId);
    }
    
    return data?.map(inv => ({
      id: inv.id,
      email: inv.email,
      role: inv.role,
      invitedAt: new Date(inv.created_at),
      companyId: inv.company_id,
      invitedBy: inv.invited_by
    })) || [];
  } catch (error) {
    console.error('❌ Failed to fetch pending invitations:', error);
    // Fallback to localStorage
    return getPendingInvitationsFromLocalStorage().filter(inv => inv.companyId === companyId);
  }
}

export async function removePendingInvitation(email: string, companyId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_invitations')
      .delete()
      .eq('email', email)
      .eq('company_id', companyId);
    
    if (error) {
      console.error('❌ Error removing pending invitation from database:', error);
    } else {
      console.log('✅ Removed pending invitation from database');
    }
  } catch (error) {
    console.error('❌ Failed to remove pending invitation from database:', error);
  }
  
  // Also remove from localStorage as backup
  removePendingInvitationFromLocalStorage(email, companyId);
}

export async function updatePendingInvitationTimestamp(email: string, companyId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_invitations')
      .update({ 
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('email', email)
      .eq('company_id', companyId);
    
    if (error) {
      console.error('❌ Error updating pending invitation timestamp:', error);
    } else {
      console.log('✅ Updated pending invitation timestamp');
    }
  } catch (error) {
    console.error('❌ Failed to update pending invitation timestamp:', error);
  }
}

// Fallback localStorage functions
function addPendingInvitationToLocalStorage(invitation: PendingInvitation): void {
  const existingInvitations = getPendingInvitationsFromLocalStorage();
  const updatedInvitations = existingInvitations.filter(
    inv => inv.email !== invitation.email || inv.companyId !== invitation.companyId
  );
  updatedInvitations.push(invitation);
  
  localStorage.setItem('pending_invitations', JSON.stringify(updatedInvitations));
}

function getPendingInvitationsFromLocalStorage(): PendingInvitation[] {
  try {
    const stored = localStorage.getItem('pending_invitations');
    if (!stored) return [];
    
    return JSON.parse(stored).map((inv: any) => ({
      ...inv,
      invitedAt: new Date(inv.invitedAt)
    }));
  } catch {
    return [];
  }
}

function removePendingInvitationFromLocalStorage(email: string, companyId: string): void {
  const existingInvitations = getPendingInvitationsFromLocalStorage();
  const filteredInvitations = existingInvitations.filter(
    inv => inv.email !== email || inv.companyId !== companyId
  );
  
  localStorage.setItem('pending_invitations', JSON.stringify(filteredInvitations));
}

function generateInvitationToken(email: string, companyId: string): string {
  // Simple token generation - in production, use a proper JWT or UUID
  return btoa(`${email}:${companyId}:${Date.now()}`);
}
