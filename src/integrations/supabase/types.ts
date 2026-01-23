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
          recovery: number | null
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
          recovery?: number | null
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
          recovery?: number | null
          two_percent_edge?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_checks: {
        Row: {
          activity_level: string | null
          after_off_meals_feeling: string | null
          assistance_rating: number | null
          check_date: string | null
          check_number: string | null
          coach_name: string | null
          coach_rating: number | null
          created_at: string | null
          current_weight: number | null
          email: string
          first_name: string | null
          id: string
          improvement_feedback: string | null
          intestinal_function_now: string | null
          intestinal_function_start: string | null
          last_check_weight: number | null
          last_name: string | null
          lifestyle_difficulty: string | null
          mindset_commitment: number | null
          next_month_goal: string | null
          next_phase_improvement: string | null
          nutrition_commitment: number | null
          nutrition_program_rating: number | null
          nutrition_type: string | null
          off_meals_feeling: string | null
          off_meals_location: string | null
          off_program_meals: string | null
          photo_back_url: string | null
          photo_consent: string | null
          photo_front_url: string | null
          photo_side_url: string | null
          program_type: string | null
          start_date: string | null
          starting_weight: number | null
          testimonial: string | null
          training_commitment: number | null
          training_consistency: string | null
          training_program_rating: number | null
          training_type: string | null
          updated_at: string | null
          user_id: string | null
          wants_to_change_nutrition: boolean | null
          wants_to_change_training: boolean | null
        }
        Insert: {
          activity_level?: string | null
          after_off_meals_feeling?: string | null
          assistance_rating?: number | null
          check_date?: string | null
          check_number?: string | null
          coach_name?: string | null
          coach_rating?: number | null
          created_at?: string | null
          current_weight?: number | null
          email: string
          first_name?: string | null
          id?: string
          improvement_feedback?: string | null
          intestinal_function_now?: string | null
          intestinal_function_start?: string | null
          last_check_weight?: number | null
          last_name?: string | null
          lifestyle_difficulty?: string | null
          mindset_commitment?: number | null
          next_month_goal?: string | null
          next_phase_improvement?: string | null
          nutrition_commitment?: number | null
          nutrition_program_rating?: number | null
          nutrition_type?: string | null
          off_meals_feeling?: string | null
          off_meals_location?: string | null
          off_program_meals?: string | null
          photo_back_url?: string | null
          photo_consent?: string | null
          photo_front_url?: string | null
          photo_side_url?: string | null
          program_type?: string | null
          start_date?: string | null
          starting_weight?: number | null
          testimonial?: string | null
          training_commitment?: number | null
          training_consistency?: string | null
          training_program_rating?: number | null
          training_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          wants_to_change_nutrition?: boolean | null
          wants_to_change_training?: boolean | null
        }
        Update: {
          activity_level?: string | null
          after_off_meals_feeling?: string | null
          assistance_rating?: number | null
          check_date?: string | null
          check_number?: string | null
          coach_name?: string | null
          coach_rating?: number | null
          created_at?: string | null
          current_weight?: number | null
          email?: string
          first_name?: string | null
          id?: string
          improvement_feedback?: string | null
          intestinal_function_now?: string | null
          intestinal_function_start?: string | null
          last_check_weight?: number | null
          last_name?: string | null
          lifestyle_difficulty?: string | null
          mindset_commitment?: number | null
          next_month_goal?: string | null
          next_phase_improvement?: string | null
          nutrition_commitment?: number | null
          nutrition_program_rating?: number | null
          nutrition_type?: string | null
          off_meals_feeling?: string | null
          off_meals_location?: string | null
          off_program_meals?: string | null
          photo_back_url?: string | null
          photo_consent?: string | null
          photo_front_url?: string | null
          photo_side_url?: string | null
          program_type?: string | null
          start_date?: string | null
          starting_weight?: number | null
          testimonial?: string | null
          training_commitment?: number | null
          training_consistency?: string | null
          training_program_rating?: number | null
          training_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          wants_to_change_nutrition?: boolean | null
          wants_to_change_training?: boolean | null
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
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "collaborator" | "client"
      coach_name: "Martina" | "Michela" | "Cristina" | "Michela_Martina"
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
      coach_name: ["Martina", "Michela", "Cristina", "Michela_Martina"],
    },
  },
} as const
