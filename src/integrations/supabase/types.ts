export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_table: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_table?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_table?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      coach_assignments: {
        Row: {
          client_id: string
          coach_name: Database["public"]["Enums"]["coach_name"]
          created_at: string
          id: string
        }
        Insert: {
          client_id: string
          coach_name: Database["public"]["Enums"]["coach_name"]
          created_at?: string
          id?: string
        }
        Update: {
          client_id?: string
          coach_name?: Database["public"]["Enums"]["coach_name"]
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      coach_notes: {
        Row: {
          author_id: string
          client_id: string
          content: string
          created_at: string
          id: string
          read_by: string[] | null
        }
        Insert: {
          author_id: string
          client_id: string
          content: string
          created_at?: string
          id?: string
          read_by?: string[] | null
        }
        Update: {
          author_id?: string
          client_id?: string
          content?: string
          created_at?: string
          id?: string
          read_by?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checkins: {
        Row: {
          created_at: string
          date: string
          energy: number | null
          id: string
          mindset: number | null
          nutrition_adherence: boolean | null
          nutrition_notes: string | null
          nutrition_score: number | null
          recovery: number | null
          training_rest_day: boolean | null
          training_score: number | null
          two_percent_edge: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          energy?: number | null
          id?: string
          mindset?: number | null
          nutrition_adherence?: boolean | null
          nutrition_notes?: string | null
          nutrition_score?: number | null
          recovery?: number | null
          training_rest_day?: boolean | null
          training_score?: number | null
          two_percent_edge?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          energy?: number | null
          id?: string
          mindset?: number | null
          nutrition_adherence?: boolean | null
          nutrition_notes?: string | null
          nutrition_score?: number | null
          recovery?: number | null
          training_rest_day?: boolean | null
          training_score?: number | null
          two_percent_edge?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exercise_videos: {
        Row: {
          category: string
          created_at: string | null
          id: string
          sort_order: number | null
          title: string
          trainer: string
          video_type: string | null
          video_url: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          sort_order?: number | null
          title: string
          trainer: string
          video_type?: string | null
          video_url: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          sort_order?: number | null
          title?: string
          trainer?: string
          video_type?: string | null
          video_url?: string
        }
        Relationships: []
      }
      monthly_checks: {
        Row: {
          check_date: string | null
          created_at: string | null
          current_weight: number | null
          email: string
          id: string
          photo_back_url: string | null
          photo_front_url: string | null
          photo_side_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          check_date?: string | null
          created_at?: string | null
          current_weight?: number | null
          email: string
          id?: string
          photo_back_url?: string | null
          photo_front_url?: string | null
          photo_side_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          check_date?: string | null
          created_at?: string | null
          current_weight?: number | null
          email?: string
          id?: string
          photo_back_url?: string | null
          photo_front_url?: string | null
          photo_side_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_checks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_leads: {
        Row: {
          age: number | null
          alcohol_frequency: string | null
          allergies: string | null
          biggest_fear: string | null
          body_type: string | null
          cardio_preference: string | null
          commit_daily_diary: boolean | null
          completed_at: string | null
          created_at: string
          current_weight: number | null
          daily_activity: string | null
          diet_type: string | null
          digestion: string | null
          eating_out_frequency: string | null
          email: string | null
          energy_level: string | null
          experience_level: string | null
          flexibility: string | null
          gender: string | null
          health_conditions: string[] | null
          height: number | null
          home_equipment: string | null
          home_support: boolean | null
          id: string
          injuries: string | null
          late_eating: boolean | null
          meals_per_day: number | null
          medications: string | null
          metabolism: string | null
          min_historic_size: string | null
          motivation_source: string | null
          name: string | null
          past_obstacle: string | null
          post_cheat_feeling: string | null
          predicted_weeks: number | null
          preferred_location: string | null
          previous_diets: string[] | null
          profile_badge: string | null
          session_duration: string | null
          skip_breakfast: boolean | null
          sleep_hours: number | null
          snacking_habit: string | null
          special_event: string | null
          stress_eating: boolean | null
          target_weight: number | null
          updated_at: string
          wake_quality: string | null
          water_liters: number | null
          weakness: string | null
          weekend_challenge: string | null
          weekly_sessions: string | null
          why_now: string | null
        }
        Insert: {
          age?: number | null
          alcohol_frequency?: string | null
          allergies?: string | null
          biggest_fear?: string | null
          body_type?: string | null
          cardio_preference?: string | null
          commit_daily_diary?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_weight?: number | null
          daily_activity?: string | null
          diet_type?: string | null
          digestion?: string | null
          eating_out_frequency?: string | null
          email?: string | null
          energy_level?: string | null
          experience_level?: string | null
          flexibility?: string | null
          gender?: string | null
          health_conditions?: string[] | null
          height?: number | null
          home_equipment?: string | null
          home_support?: boolean | null
          id?: string
          injuries?: string | null
          late_eating?: boolean | null
          meals_per_day?: number | null
          medications?: string | null
          metabolism?: string | null
          min_historic_size?: string | null
          motivation_source?: string | null
          name?: string | null
          past_obstacle?: string | null
          post_cheat_feeling?: string | null
          predicted_weeks?: number | null
          preferred_location?: string | null
          previous_diets?: string[] | null
          profile_badge?: string | null
          session_duration?: string | null
          skip_breakfast?: boolean | null
          sleep_hours?: number | null
          snacking_habit?: string | null
          special_event?: string | null
          stress_eating?: boolean | null
          target_weight?: number | null
          updated_at?: string
          wake_quality?: string | null
          water_liters?: number | null
          weakness?: string | null
          weekend_challenge?: string | null
          weekly_sessions?: string | null
          why_now?: string | null
        }
        Update: {
          age?: number | null
          alcohol_frequency?: string | null
          allergies?: string | null
          biggest_fear?: string | null
          body_type?: string | null
          cardio_preference?: string | null
          commit_daily_diary?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_weight?: number | null
          daily_activity?: string | null
          diet_type?: string | null
          digestion?: string | null
          eating_out_frequency?: string | null
          email?: string | null
          energy_level?: string | null
          experience_level?: string | null
          flexibility?: string | null
          gender?: string | null
          health_conditions?: string[] | null
          height?: number | null
          home_equipment?: string | null
          home_support?: boolean | null
          id?: string
          injuries?: string | null
          late_eating?: boolean | null
          meals_per_day?: number | null
          medications?: string | null
          metabolism?: string | null
          min_historic_size?: string | null
          motivation_source?: string | null
          name?: string | null
          past_obstacle?: string | null
          post_cheat_feeling?: string | null
          predicted_weeks?: number | null
          preferred_location?: string | null
          previous_diets?: string[] | null
          profile_badge?: string | null
          session_duration?: string | null
          skip_breakfast?: boolean | null
          sleep_hours?: number | null
          snacking_habit?: string | null
          special_event?: string | null
          stress_eating?: boolean | null
          target_weight?: number | null
          updated_at?: string
          wake_quality?: string | null
          water_liters?: number | null
          weakness?: string | null
          weekend_challenge?: string | null
          weekly_sessions?: string | null
          why_now?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      progress_checks: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          photo_back_url: string | null
          photo_front_url: string | null
          photo_side_url: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          photo_back_url?: string | null
          photo_front_url?: string | null
          photo_side_url?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          photo_back_url?: string | null
          photo_front_url?: string | null
          photo_side_url?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_checks: {
        Row: {
          check_date: string
          check_number: number
          created_at: string
          id: string
          notes: string | null
          photo_back_url: string | null
          photo_front_url: string | null
          photo_side_url: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          check_date?: string
          check_number: number
          created_at?: string
          id?: string
          notes?: string | null
          photo_back_url?: string | null
          photo_front_url?: string | null
          photo_side_url?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          check_date?: string
          check_number?: number
          created_at?: string
          id?: string
          notes?: string | null
          photo_back_url?: string | null
          photo_front_url?: string | null
          photo_side_url?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      user_consents: {
        Row: {
          biometric_consent: boolean
          biometric_consent_at: string | null
          created_at: string
          id: string
          ip_address: string | null
          privacy_accepted: boolean
          privacy_accepted_at: string | null
          terms_accepted: boolean
          terms_accepted_at: string | null
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          biometric_consent?: boolean
          biometric_consent_at?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          privacy_accepted?: boolean
          privacy_accepted_at?: string | null
          terms_accepted?: boolean
          terms_accepted_at?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          biometric_consent?: boolean
          biometric_consent_at?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          privacy_accepted?: boolean
          privacy_accepted_at?: string | null
          terms_accepted?: boolean
          terms_accepted_at?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_diet_plans: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          updated_at: string | null
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          updated_at?: string | null
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          updated_at?: string | null
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_correction_feedback: {
        Row: {
          coach_id: string
          created_at: string
          feedback: string
          id: string
          is_read: boolean
          video_id: string
          video_url: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string
          feedback: string
          id?: string
          is_read?: boolean
          video_id: string
          video_url?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string
          feedback?: string
          id?: string
          is_read?: boolean
          video_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_correction_feedback_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_corrections"
            referencedColumns: ["id"]
          },
        ]
      }
      video_corrections: {
        Row: {
          created_at: string
          exercise_name: string
          id: string
          notes: string | null
          updated_at: string
          user_id: string
          video_url: string
        }
        Insert: {
          created_at?: string
          exercise_name: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
          video_url: string
        }
        Update: {
          created_at?: string
          exercise_name?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_collaborator_see_client: {
        Args: { _client_id: string; _collaborator_id: string }
        Returns: boolean
      }
      get_collaborator_coach_name: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "collaborator" | "client"
      coach_name:
        | "Martina"
        | "Michela"
        | "Cristina"
        | "Michela_Martina"
        | "Ilaria"
        | "Ilaria_Marco"
        | "Ilaria_Marco_Michela"
        | "Ilaria_Michela"
        | "Ilaria_Martina"
        | "Martina_Michela"
        | "Marco"
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
      app_role: ["admin", "collaborator", "client"],
      coach_name: [
        "Martina",
        "Michela",
        "Cristina",
        "Michela_Martina",
        "Ilaria",
        "Ilaria_Marco",
        "Ilaria_Marco_Michela",
        "Ilaria_Michela",
        "Ilaria_Martina",
        "Martina_Michela",
        "Marco",
      ],
    },
  },
} as const
