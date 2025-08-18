
export type CompanyRole = 'admin' | 'member' | 'viewer';

export interface Company {
  id: string;
  name: string;
  domain: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  settings?: Record<string, any>;
}

export interface CompanyUser {
  id: string;
  user_id: string;
  company_id: string;
  role: CompanyRole;
  email?: string; // Added email property to match database schema
  created_at: string;
  user?: {
    email: string;
    full_name?: string;
  };
}

export interface UserInvitation {
  id: string;
  email: string;
  company_id: string;
  role: CompanyRole;
  invited_by?: string;
  token: string;
  accepted_at?: string;
  expires_at: string;
  created_at: string;
}

export interface CompanyRegistrationResult {
  success: boolean;
  company?: Company;
  message?: string;
  requiresApproval?: boolean;
  adminContact?: string;
}
