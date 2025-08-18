export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      basic_due_diligence: {
        Row: {
          basic_due_diligence_full_html: string | null
          company_id: string | null
          compliance_and_risk_analysis: string | null
          compliance_and_risk_edited: string | null
          compliance_and_risk_score: number | null
          compliance_and_risk_score_justification: string | null
          compliance_and_risk_section: string | null
          created_at: string
          executive_summary: string | null
          final_score: number | null
          financial_health_analysis: string | null
          financial_health_edited: string | null
          financial_health_score: number | null
          financial_health_score_justification: string | null
          financial_health_section: string | null
          full_report_markdown: string | null
          id: string
          infrastructure_capability_analysis: string | null
          infrastructure_capability_edited: string | null
          infrastructure_capability_score: number | null
          infrastructure_capability_score_justification: string | null
          infrastructure_capability_section: string | null
          introduction: string | null
          introduction_edited: string | null
          investment_recommendations: string | null
          investment_verdict: string | null
          legacy_full_markdown: string | null
          market_position_analysis: string | null
          market_position_edited: string | null
          market_position_score: number | null
          market_position_score_justification: string | null
          market_position_section: string | null
          overall_conclusion: string | null
          startup_id: string
          startup_name: string
          summary_edited: string | null
          team_capability_analysis: string | null
          team_capability_edited: string | null
          team_capability_score: number | null
          team_capability_score_justification: string | null
          team_capability_section: string | null
          technical_moat_analysis: string | null
          technical_moat_edited: string | null
          technical_moat_score: number | null
          technical_moat_score_justification: string | null
          technical_moat_section: string | null
          updated_at: string
        }
        Insert: {
          basic_due_diligence_full_html?: string | null
          company_id?: string | null
          compliance_and_risk_analysis?: string | null
          compliance_and_risk_edited?: string | null
          compliance_and_risk_score?: number | null
          compliance_and_risk_score_justification?: string | null
          compliance_and_risk_section?: string | null
          created_at?: string
          executive_summary?: string | null
          final_score?: number | null
          financial_health_analysis?: string | null
          financial_health_edited?: string | null
          financial_health_score?: number | null
          financial_health_score_justification?: string | null
          financial_health_section?: string | null
          full_report_markdown?: string | null
          id?: string
          infrastructure_capability_analysis?: string | null
          infrastructure_capability_edited?: string | null
          infrastructure_capability_score?: number | null
          infrastructure_capability_score_justification?: string | null
          infrastructure_capability_section?: string | null
          introduction?: string | null
          introduction_edited?: string | null
          investment_recommendations?: string | null
          investment_verdict?: string | null
          legacy_full_markdown?: string | null
          market_position_analysis?: string | null
          market_position_edited?: string | null
          market_position_score?: number | null
          market_position_score_justification?: string | null
          market_position_section?: string | null
          overall_conclusion?: string | null
          startup_id: string
          startup_name: string
          summary_edited?: string | null
          team_capability_analysis?: string | null
          team_capability_edited?: string | null
          team_capability_score?: number | null
          team_capability_score_justification?: string | null
          team_capability_section?: string | null
          technical_moat_analysis?: string | null
          technical_moat_edited?: string | null
          technical_moat_score?: number | null
          technical_moat_score_justification?: string | null
          technical_moat_section?: string | null
          updated_at?: string
        }
        Update: {
          basic_due_diligence_full_html?: string | null
          company_id?: string | null
          compliance_and_risk_analysis?: string | null
          compliance_and_risk_edited?: string | null
          compliance_and_risk_score?: number | null
          compliance_and_risk_score_justification?: string | null
          compliance_and_risk_section?: string | null
          created_at?: string
          executive_summary?: string | null
          final_score?: number | null
          financial_health_analysis?: string | null
          financial_health_edited?: string | null
          financial_health_score?: number | null
          financial_health_score_justification?: string | null
          financial_health_section?: string | null
          full_report_markdown?: string | null
          id?: string
          infrastructure_capability_analysis?: string | null
          infrastructure_capability_edited?: string | null
          infrastructure_capability_score?: number | null
          infrastructure_capability_score_justification?: string | null
          infrastructure_capability_section?: string | null
          introduction?: string | null
          introduction_edited?: string | null
          investment_recommendations?: string | null
          investment_verdict?: string | null
          legacy_full_markdown?: string | null
          market_position_analysis?: string | null
          market_position_edited?: string | null
          market_position_score?: number | null
          market_position_score_justification?: string | null
          market_position_section?: string | null
          overall_conclusion?: string | null
          startup_id?: string
          startup_name?: string
          summary_edited?: string | null
          team_capability_analysis?: string | null
          team_capability_edited?: string | null
          team_capability_score?: number | null
          team_capability_score_justification?: string | null
          team_capability_section?: string | null
          technical_moat_analysis?: string | null
          technical_moat_edited?: string | null
          technical_moat_score?: number | null
          technical_moat_score_justification?: string | null
          technical_moat_section?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "basic_due_diligence_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_basic_due_diligence_startup"
            columns: ["startup_id"]
            isOneToOne: true
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      company_users: {
        Row: {
          company_id: string
          created_at: string | null
          email: string | null
          id: string
          role: Database["public"]["Enums"]["company_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["company_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["company_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          contact_id: string
          created_at: string | null
          email: string | null
          first_name: string
          last_name: string
          linkedin_profile: string | null
          startup_id: string | null
          temp_password: string | null
          updated_at: string | null
          user_role: string[] | null
        }
        Insert: {
          contact_id?: string
          created_at?: string | null
          email?: string | null
          first_name: string
          last_name: string
          linkedin_profile?: string | null
          startup_id?: string | null
          temp_password?: string | null
          updated_at?: string | null
          user_role?: string[] | null
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          email?: string | null
          first_name?: string
          last_name?: string
          linkedin_profile?: string | null
          startup_id?: string | null
          temp_password?: string | null
          updated_at?: string | null
          user_role?: string[] | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_ai_based_breath_analysis_platform: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_analytics_model: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_autoto: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_benicann: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_boh: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_calculum: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_calculum_inc: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_cavitas: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_chatcoder: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_clofind: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_crypto_combat_world: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_ethicsanswer: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_example_startup: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_facements: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_finberry: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_finnx: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_genesis_medical: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_gohub: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_hypeindex: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_instant_health_analysis: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_intersight: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_inverseting_labs: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_knowdroids_ai: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_komi: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_lestock_ai: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_letstok: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_medime: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_medmetrix: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_mindtension: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_nanosynex: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_ness_fertigation: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_novalert: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_null: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_p_valyou: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_panacea_ml: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_pitchbob: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_pitchbob_io: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_pleadcop: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_pol_intell_ltd: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_rulrr: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_smartrole: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_smartymeet: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_soly_emotional_health_ltd: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_tbwe: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_the_book_screen_platform: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_undefined: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_verssai: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_vistim_labs: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_yieldx_solutions: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          admin_notes: string | null
          attachments: Json | null
          category: Database["public"]["Enums"]["feedback_category"]
          company_id: string
          created_at: string
          description: string
          id: string
          priority: Database["public"]["Enums"]["feedback_priority"]
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["feedback_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          attachments?: Json | null
          category?: Database["public"]["Enums"]["feedback_category"]
          company_id: string
          created_at?: string
          description: string
          id?: string
          priority?: Database["public"]["Enums"]["feedback_priority"]
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["feedback_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          attachments?: Json | null
          category?: Database["public"]["Enums"]["feedback_category"]
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          priority?: Database["public"]["Enums"]["feedback_priority"]
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["feedback_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      investors_fs: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          company_id: string
          created_at: string
          description: string
          id: string
          read: boolean
          startup_id: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          company_id: string
          created_at?: string
          description: string
          id?: string
          read?: boolean
          startup_id?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          read?: boolean
          startup_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      startup_dataroom_analysis: {
        Row: {
          analysis_completed_at: string | null
          appendix_section: string | null
          company_id: string | null
          compliance_and_risk_score: number | null
          compliance_and_risk_score_justification: string | null
          compliance_section: string | null
          created_at: string | null
          executive_summary: string | null
          final_score: number | null
          finance_section: string | null
          financial_health_score: number | null
          financial_health_score_justification: string | null
          full_report_markdown: string | null
          html_appendix_section: string | null
          html_compliance_section: string | null
          html_executive_summary: string | null
          html_finance_section: string | null
          html_infrastructure_section: string | null
          html_investment_recommendations: string | null
          html_market_section: string | null
          html_team_section: string | null
          html_tech_moat_section: string | null
          infrastructure_capability_score: number | null
          infrastructure_capability_score_justification: string | null
          infrastructure_section: string | null
          investment_recommendations: string | null
          investment_verdict: string | null
          market_position_score: number | null
          market_position_score_justification: string | null
          market_section: string | null
          overall_conclusion: string | null
          processing_status: string | null
          startup_id: string
          startup_name: string
          team_capability_score: number | null
          team_capability_score_justification: string | null
          team_section: string | null
          tech_moat_section: string | null
          technical_moat_score: number | null
          technical_moat_score_justification: string | null
          updated_at: string | null
          webhook_triggered_at: string | null
        }
        Insert: {
          analysis_completed_at?: string | null
          appendix_section?: string | null
          company_id?: string | null
          compliance_and_risk_score?: number | null
          compliance_and_risk_score_justification?: string | null
          compliance_section?: string | null
          created_at?: string | null
          executive_summary?: string | null
          final_score?: number | null
          finance_section?: string | null
          financial_health_score?: number | null
          financial_health_score_justification?: string | null
          full_report_markdown?: string | null
          html_appendix_section?: string | null
          html_compliance_section?: string | null
          html_executive_summary?: string | null
          html_finance_section?: string | null
          html_infrastructure_section?: string | null
          html_investment_recommendations?: string | null
          html_market_section?: string | null
          html_team_section?: string | null
          html_tech_moat_section?: string | null
          infrastructure_capability_score?: number | null
          infrastructure_capability_score_justification?: string | null
          infrastructure_section?: string | null
          investment_recommendations?: string | null
          investment_verdict?: string | null
          market_position_score?: number | null
          market_position_score_justification?: string | null
          market_section?: string | null
          overall_conclusion?: string | null
          processing_status?: string | null
          startup_id: string
          startup_name: string
          team_capability_score?: number | null
          team_capability_score_justification?: string | null
          team_section?: string | null
          tech_moat_section?: string | null
          technical_moat_score?: number | null
          technical_moat_score_justification?: string | null
          updated_at?: string | null
          webhook_triggered_at?: string | null
        }
        Update: {
          analysis_completed_at?: string | null
          appendix_section?: string | null
          company_id?: string | null
          compliance_and_risk_score?: number | null
          compliance_and_risk_score_justification?: string | null
          compliance_section?: string | null
          created_at?: string | null
          executive_summary?: string | null
          final_score?: number | null
          finance_section?: string | null
          financial_health_score?: number | null
          financial_health_score_justification?: string | null
          full_report_markdown?: string | null
          html_appendix_section?: string | null
          html_compliance_section?: string | null
          html_executive_summary?: string | null
          html_finance_section?: string | null
          html_infrastructure_section?: string | null
          html_investment_recommendations?: string | null
          html_market_section?: string | null
          html_team_section?: string | null
          html_tech_moat_section?: string | null
          infrastructure_capability_score?: number | null
          infrastructure_capability_score_justification?: string | null
          infrastructure_section?: string | null
          investment_recommendations?: string | null
          investment_verdict?: string | null
          market_position_score?: number | null
          market_position_score_justification?: string | null
          market_section?: string | null
          overall_conclusion?: string | null
          processing_status?: string | null
          startup_id?: string
          startup_name?: string
          team_capability_score?: number | null
          team_capability_score_justification?: string | null
          team_section?: string | null
          tech_moat_section?: string | null
          technical_moat_score?: number | null
          technical_moat_score_justification?: string | null
          updated_at?: string | null
          webhook_triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startup_dataroom_analysis_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_profiles: {
        Row: {
          ai_adoption_level: string | null
          ai_ethics_and_compliance: string | null
          ai_technical_robustness_and_innovation: string | null
          ai_technology_type: string | null
          business_model: string | null
          company_id: string | null
          competitors: string | null
          contact_phone_number: string | null
          created_at: string | null
          dataset_level: string | null
          elevator_pitch: string | null
          founder_executives_linkedin_pages: Json | null
          growth_strategy_and_market_readiness: string | null
          id: string
          investment_and_fundraising: string | null
          micro_due_diligence_created_at: string | null
          micro_due_diligence_html: string | null
          micro_due_diligence_markdown: string | null
          micro_due_diligence_updated_at: string | null
          primary_contact_email: string | null
          primary_contact_first_name: string | null
          primary_contact_last_name: string | null
          problem_solving: string | null
          product_goals: string | null
          product_maturity_level: string | null
          startup_id: string
          startup_name: string
          target_audience: string | null
          team_competence_in_ai_and_product_development: string | null
          unique_selling_proposition: string | null
          updated_at: string | null
          user_goals: string | null
          why_your_solution_is_great: string | null
        }
        Insert: {
          ai_adoption_level?: string | null
          ai_ethics_and_compliance?: string | null
          ai_technical_robustness_and_innovation?: string | null
          ai_technology_type?: string | null
          business_model?: string | null
          company_id?: string | null
          competitors?: string | null
          contact_phone_number?: string | null
          created_at?: string | null
          dataset_level?: string | null
          elevator_pitch?: string | null
          founder_executives_linkedin_pages?: Json | null
          growth_strategy_and_market_readiness?: string | null
          id?: string
          investment_and_fundraising?: string | null
          micro_due_diligence_created_at?: string | null
          micro_due_diligence_html?: string | null
          micro_due_diligence_markdown?: string | null
          micro_due_diligence_updated_at?: string | null
          primary_contact_email?: string | null
          primary_contact_first_name?: string | null
          primary_contact_last_name?: string | null
          problem_solving?: string | null
          product_goals?: string | null
          product_maturity_level?: string | null
          startup_id: string
          startup_name: string
          target_audience?: string | null
          team_competence_in_ai_and_product_development?: string | null
          unique_selling_proposition?: string | null
          updated_at?: string | null
          user_goals?: string | null
          why_your_solution_is_great?: string | null
        }
        Update: {
          ai_adoption_level?: string | null
          ai_ethics_and_compliance?: string | null
          ai_technical_robustness_and_innovation?: string | null
          ai_technology_type?: string | null
          business_model?: string | null
          company_id?: string | null
          competitors?: string | null
          contact_phone_number?: string | null
          created_at?: string | null
          dataset_level?: string | null
          elevator_pitch?: string | null
          founder_executives_linkedin_pages?: Json | null
          growth_strategy_and_market_readiness?: string | null
          id?: string
          investment_and_fundraising?: string | null
          micro_due_diligence_created_at?: string | null
          micro_due_diligence_html?: string | null
          micro_due_diligence_markdown?: string | null
          micro_due_diligence_updated_at?: string | null
          primary_contact_email?: string | null
          primary_contact_first_name?: string | null
          primary_contact_last_name?: string | null
          problem_solving?: string | null
          product_goals?: string | null
          product_maturity_level?: string | null
          startup_id?: string
          startup_name?: string
          target_audience?: string | null
          team_competence_in_ai_and_product_development?: string | null
          unique_selling_proposition?: string | null
          updated_at?: string | null
          user_goals?: string | null
          why_your_solution_is_great?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startup_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_profiles_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: true
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      startups: {
        Row: {
          company_id: string
          created_at: string | null
          data_room_file_paths: string[] | null
          deck_data: string | null
          deck_file_path: string | null
          founded_date: string | null
          founder: string | null
          id: string
          industry: string | null
          location: string | null
          logo_color: string
          logo_initials: string
          logo_url: string | null
          name: string
          readiness_score: number | null
          stage: string | null
          status: string | null
          updated_at: string | null
          vector_function_name: string | null
          vector_table_name: string | null
          website: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          data_room_file_paths?: string[] | null
          deck_data?: string | null
          deck_file_path?: string | null
          founded_date?: string | null
          founder?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_color: string
          logo_initials: string
          logo_url?: string | null
          name: string
          readiness_score?: number | null
          stage?: string | null
          status?: string | null
          updated_at?: string | null
          vector_function_name?: string | null
          vector_table_name?: string | null
          website?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          data_room_file_paths?: string[] | null
          deck_data?: string | null
          deck_file_path?: string | null
          founded_date?: string | null
          founder?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_color?: string
          logo_initials?: string
          logo_url?: string | null
          name?: string
          readiness_score?: number | null
          stage?: string | null
          status?: string | null
          updated_at?: string | null
          vector_function_name?: string | null
          vector_table_name?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startups_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      startups_fs: {
        Row: {
          ai_adoption_level: string | null
          ai_ethics_and_compliance: string | null
          ai_technical_robustness_and_innovation: string | null
          ai_technology_type: string | null
          business_model: string | null
          competitor_analysis: string | null
          competitor_website_urls: string[] | null
          contact_email: string | null
          contact_first_name: string | null
          contact_last_name: string | null
          created_at: string
          data_room_files_uris: string[] | null
          dataset_level: string | null
          elevator_pitch: string | null
          growth_strategy: string | null
          headquarters_location: string | null
          id: string
          industry_focus: string | null
          name: string
          phone_number: string | null
          pitch_deck_data_uri: string | null
          problem_solving: string | null
          product_goals: string | null
          product_maturity: string | null
          startup_location: string | null
          startup_stage: string | null
          target_audience: string | null
          team_competence_in_ai_and_product: string | null
          unique_selling_proposition: string | null
          updated_at: string
          user_goals: string | null
          website_url: string | null
          why_next_big_thing: string | null
          year_founded: number | null
        }
        Insert: {
          ai_adoption_level?: string | null
          ai_ethics_and_compliance?: string | null
          ai_technical_robustness_and_innovation?: string | null
          ai_technology_type?: string | null
          business_model?: string | null
          competitor_analysis?: string | null
          competitor_website_urls?: string[] | null
          contact_email?: string | null
          contact_first_name?: string | null
          contact_last_name?: string | null
          created_at?: string
          data_room_files_uris?: string[] | null
          dataset_level?: string | null
          elevator_pitch?: string | null
          growth_strategy?: string | null
          headquarters_location?: string | null
          id?: string
          industry_focus?: string | null
          name: string
          phone_number?: string | null
          pitch_deck_data_uri?: string | null
          problem_solving?: string | null
          product_goals?: string | null
          product_maturity?: string | null
          startup_location?: string | null
          startup_stage?: string | null
          target_audience?: string | null
          team_competence_in_ai_and_product?: string | null
          unique_selling_proposition?: string | null
          updated_at?: string
          user_goals?: string | null
          website_url?: string | null
          why_next_big_thing?: string | null
          year_founded?: number | null
        }
        Update: {
          ai_adoption_level?: string | null
          ai_ethics_and_compliance?: string | null
          ai_technical_robustness_and_innovation?: string | null
          ai_technology_type?: string | null
          business_model?: string | null
          competitor_analysis?: string | null
          competitor_website_urls?: string[] | null
          contact_email?: string | null
          contact_first_name?: string | null
          contact_last_name?: string | null
          created_at?: string
          data_room_files_uris?: string[] | null
          dataset_level?: string | null
          elevator_pitch?: string | null
          growth_strategy?: string | null
          headquarters_location?: string | null
          id?: string
          industry_focus?: string | null
          name?: string
          phone_number?: string | null
          pitch_deck_data_uri?: string | null
          problem_solving?: string | null
          product_goals?: string | null
          product_maturity?: string | null
          startup_location?: string | null
          startup_stage?: string | null
          target_audience?: string | null
          team_competence_in_ai_and_product?: string | null
          unique_selling_proposition?: string | null
          updated_at?: string
          user_goals?: string | null
          website_url?: string | null
          why_next_big_thing?: string | null
          year_founded?: number | null
        }
        Relationships: []
      }
      startups_old: {
        Row: {
          ai_adoption_level: string | null
          ai_ethics_and_compliance: string | null
          ai_technical_robustness_and_innovation: string | null
          ai_technology_type: string | null
          business_model: string | null
          competitors: Json | null
          contact_phone_number: string | null
          content_sheet_id: string | null
          content_table_id: number | null
          content_vector_function_name: string | null
          content_vector_table_name: string | null
          created_at: string | null
          data_room_drive_url: string | null
          dataset_level: string | null
          deck_file_ids: string[] | null
          elevator_pitch: string | null
          founder_executives_linkedin_pages: Json | null
          growth_strategy_and_market_readiness: string | null
          headquarters_city: string | null
          headquarters_country: string | null
          headquarters_state: string | null
          headquarters_street: string | null
          industry_focus: string | null
          investment_and_fundraising: string | null
          micro_dd: string | null
          name_status: string | null
          primary_contact_email: string | null
          primary_contact_first_name: string | null
          primary_contact_last_name: string | null
          problem_solving: string | null
          product_goals: Json | null
          product_maturity_level: string | null
          startup_id: string
          startup_location: string | null
          startup_name: string
          startup_stage: string | null
          summary_draft_1: string | null
          summary_draft_2: string | null
          summary_draft_3: string | null
          target_audience: string | null
          team_competence_in_ai_and_product_development: string | null
          unique_selling_proposition: string | null
          updated_at: string | null
          user_goals: Json | null
          vector_function_name: string | null
          vector_table_id: unknown | null
          vector_table_name: string | null
          versatil_tailor_made_acceleration_program: string | null
          website_data: string | null
          website_url: string | null
          why_your_solution_is_great: string | null
          year_founded: string | null
        }
        Insert: {
          ai_adoption_level?: string | null
          ai_ethics_and_compliance?: string | null
          ai_technical_robustness_and_innovation?: string | null
          ai_technology_type?: string | null
          business_model?: string | null
          competitors?: Json | null
          contact_phone_number?: string | null
          content_sheet_id?: string | null
          content_table_id?: number | null
          content_vector_function_name?: string | null
          content_vector_table_name?: string | null
          created_at?: string | null
          data_room_drive_url?: string | null
          dataset_level?: string | null
          deck_file_ids?: string[] | null
          elevator_pitch?: string | null
          founder_executives_linkedin_pages?: Json | null
          growth_strategy_and_market_readiness?: string | null
          headquarters_city?: string | null
          headquarters_country?: string | null
          headquarters_state?: string | null
          headquarters_street?: string | null
          industry_focus?: string | null
          investment_and_fundraising?: string | null
          micro_dd?: string | null
          name_status?: string | null
          primary_contact_email?: string | null
          primary_contact_first_name?: string | null
          primary_contact_last_name?: string | null
          problem_solving?: string | null
          product_goals?: Json | null
          product_maturity_level?: string | null
          startup_id?: string
          startup_location?: string | null
          startup_name: string
          startup_stage?: string | null
          summary_draft_1?: string | null
          summary_draft_2?: string | null
          summary_draft_3?: string | null
          target_audience?: string | null
          team_competence_in_ai_and_product_development?: string | null
          unique_selling_proposition?: string | null
          updated_at?: string | null
          user_goals?: Json | null
          vector_function_name?: string | null
          vector_table_id?: unknown | null
          vector_table_name?: string | null
          versatil_tailor_made_acceleration_program?: string | null
          website_data?: string | null
          website_url?: string | null
          why_your_solution_is_great?: string | null
          year_founded?: string | null
        }
        Update: {
          ai_adoption_level?: string | null
          ai_ethics_and_compliance?: string | null
          ai_technical_robustness_and_innovation?: string | null
          ai_technology_type?: string | null
          business_model?: string | null
          competitors?: Json | null
          contact_phone_number?: string | null
          content_sheet_id?: string | null
          content_table_id?: number | null
          content_vector_function_name?: string | null
          content_vector_table_name?: string | null
          created_at?: string | null
          data_room_drive_url?: string | null
          dataset_level?: string | null
          deck_file_ids?: string[] | null
          elevator_pitch?: string | null
          founder_executives_linkedin_pages?: Json | null
          growth_strategy_and_market_readiness?: string | null
          headquarters_city?: string | null
          headquarters_country?: string | null
          headquarters_state?: string | null
          headquarters_street?: string | null
          industry_focus?: string | null
          investment_and_fundraising?: string | null
          micro_dd?: string | null
          name_status?: string | null
          primary_contact_email?: string | null
          primary_contact_first_name?: string | null
          primary_contact_last_name?: string | null
          problem_solving?: string | null
          product_goals?: Json | null
          product_maturity_level?: string | null
          startup_id?: string
          startup_location?: string | null
          startup_name?: string
          startup_stage?: string | null
          summary_draft_1?: string | null
          summary_draft_2?: string | null
          summary_draft_3?: string | null
          target_audience?: string | null
          team_competence_in_ai_and_product_development?: string | null
          unique_selling_proposition?: string | null
          updated_at?: string | null
          user_goals?: Json | null
          vector_function_name?: string | null
          vector_table_id?: unknown | null
          vector_table_name?: string | null
          versatil_tailor_made_acceleration_program?: string | null
          website_data?: string | null
          website_url?: string | null
          why_your_solution_is_great?: string | null
          year_founded?: string | null
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["company_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["company_role"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["company_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vc_profiles: {
        Row: {
          created_at: string | null
          description: string | null
          email: string
          id: string
          investment_focus: string[] | null
          logo_url: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          email: string
          id?: string
          investment_focus?: string[] | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          email?: string
          id?: string
          investment_focus?: string[] | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_simple_documents_table: {
        Args: { startup_name: string }
        Returns: Json
      }
      create_table: {
        Args: { table_name: string; schema_name?: string }
        Returns: Json
      }
      create_vector_documents_table: {
        Args: { startup_name: string; vector_dimensions?: number }
        Returns: string
      }
      extract_domain_from_email: {
        Args: { email: string }
        Returns: string
      }
      get_user_company: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_company_id_clean: {
        Args: { input_user_id: string }
        Returns: string
      }
      get_user_role_clean: {
        Args: { input_user_id: string }
        Returns: Database["public"]["Enums"]["company_role"]
      }
      is_corporate_domain: {
        Args: { domain: string }
        Returns: boolean
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_ai_based_breath_analysis_platform: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_analytics_model: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_autoto: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_benicann: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_boh: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_calculum: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_calculum_inc: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_cavitas: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_chatcoder: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_clofind: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_crypto_combat_world: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_ethicsanswer: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_example_startup: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_facements: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_finberry: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_finnx: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_genesis_medical: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_gohub: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_hypeindex: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_instant_health_analysis: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_intersight: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_inverseting_labs: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_knowdroids_ai: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_komi: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_lestock_ai: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_letstok: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_medime: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_medmetrix: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_mindtension: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_nanosynex: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_ness_fertigation: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_novalert: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_null: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_p_valyou: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_panacea_ml: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_pitchbob: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_pitchbob_io: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_pleadcop: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_pol_intell_ltd: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_rulrr: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_smartrole: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_smartymeet: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_soly_emotional_health_ltd: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_tbwe: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_the_book_screen_platform: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_undefined: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_verssai: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_vistim_labs: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_yieldx_solutions: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      user_belongs_to_company: {
        Args: { user_id: string; company_id: string }
        Returns: boolean
      }
      user_has_company_access_clean: {
        Args: { input_user_id: string; input_company_id: string }
        Returns: boolean
      }
      user_has_company_role: {
        Args: {
          user_id: string
          company_id: string
          required_role: Database["public"]["Enums"]["company_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      company_role: "admin" | "member" | "viewer"
      feedback_category:
        | "bug"
        | "feature_request"
        | "improvement"
        | "question"
        | "other"
      feedback_priority: "critical" | "high" | "medium" | "low"
      feedback_status:
        | "open"
        | "in_progress"
        | "resolved"
        | "closed"
        | "duplicate"
      startup_stage_enum:
        | "Stealth"
        | "Pre Seed"
        | "Seed"
        | "Series A"
        | "Series B"
        | "Growth (Series B/C)"
        | "Scale (Series D+)"
      user_role: "admin" | "startup" | "investor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      company_role: ["admin", "member", "viewer"],
      feedback_category: [
        "bug",
        "feature_request",
        "improvement",
        "question",
        "other",
      ],
      feedback_priority: ["critical", "high", "medium", "low"],
      feedback_status: [
        "open",
        "in_progress",
        "resolved",
        "closed",
        "duplicate",
      ],
      startup_stage_enum: [
        "Stealth",
        "Pre Seed",
        "Seed",
        "Series A",
        "Series B",
        "Growth (Series B/C)",
        "Scale (Series D+)",
      ],
      user_role: ["admin", "startup", "investor", "viewer"],
    },
  },
} as const
