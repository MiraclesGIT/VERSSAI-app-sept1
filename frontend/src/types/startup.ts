
export interface StartupFormState {
  name: string;
  website?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
}

export interface StartupData {
  id?: string;
  name: string;
  founder?: string;
  stage?: string;
  location?: string;
  readiness_score: number;
  logo_initials: string;
  logo_color: string;
  deck_file_path?: string;
  deck_data?: string;
  website?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
  primary_contact_first_name?: string;
  primary_contact_last_name?: string;
  primary_contact_email?: string;
  created_at?: string;
  updated_at?: string;
  industry?: string;
  founded_date?: string;
  company_id?: string;
  status?: string;
  data_room_file_paths?: string[];
  logo_url?: string;
}

export type StartupFormData = {
  name: string;
  founder: string;
  stage: string;
  location: string;
  industry: string;
  website: string;
};
