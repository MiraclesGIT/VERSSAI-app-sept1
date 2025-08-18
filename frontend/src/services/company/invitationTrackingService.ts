
import { supabase } from "@/integrations/supabase/client";

export interface PendingInvitation {
  email: string;
  role: string;
  invitedAt: Date;
  companyId: string;
}

// Store pending invitations in localStorage for now
// In a production app, you might want to store these in the database
const PENDING_INVITATIONS_KEY = 'pending_invitations';

export function addPendingInvitation(invitation: PendingInvitation) {
  const existingInvitations = getPendingInvitations();
  const updatedInvitations = existingInvitations.filter(
    inv => inv.email !== invitation.email || inv.companyId !== invitation.companyId
  );
  updatedInvitations.push(invitation);
  
  localStorage.setItem(PENDING_INVITATIONS_KEY, JSON.stringify(updatedInvitations));
}

export function getPendingInvitations(): PendingInvitation[] {
  try {
    const stored = localStorage.getItem(PENDING_INVITATIONS_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored).map((inv: any) => ({
      ...inv,
      invitedAt: new Date(inv.invitedAt)
    }));
  } catch {
    return [];
  }
}

export function removePendingInvitation(email: string, companyId: string) {
  const existingInvitations = getPendingInvitations();
  const filteredInvitations = existingInvitations.filter(
    inv => inv.email !== email || inv.companyId !== companyId
  );
  
  localStorage.setItem(PENDING_INVITATIONS_KEY, JSON.stringify(filteredInvitations));
}

export function updatePendingInvitationTimestamp(email: string, companyId: string) {
  const existingInvitations = getPendingInvitations();
  const updatedInvitations = existingInvitations.map(inv => {
    if (inv.email === email && inv.companyId === companyId) {
      return { ...inv, invitedAt: new Date() };
    }
    return inv;
  });
  
  localStorage.setItem(PENDING_INVITATIONS_KEY, JSON.stringify(updatedInvitations));
}

export function clearOldPendingInvitations() {
  const existingInvitations = getPendingInvitations();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7); // Remove invitations older than 7 days
  
  const filteredInvitations = existingInvitations.filter(
    inv => inv.invitedAt > cutoffDate
  );
  
  localStorage.setItem(PENDING_INVITATIONS_KEY, JSON.stringify(filteredInvitations));
}
