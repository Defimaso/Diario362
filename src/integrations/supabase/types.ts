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
      absence_notifications: {
        Row: {
          id: string
          notification_type: string
          sent_at: string | null
          sent_date: string
          user_id: string
        }
        Insert: {
          id?: string
          notification_type: string
          sent_at?: string | null
          sent_date?: string
          user_id: string
        }
        Update: {
          id?: string
          notification_type?: string
          sent_at?: string | null
          sent_date?: string
          user_id?: string
        }
        Relationships: []
      }
      activation_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          id: string
          is_used: boolean | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      ai_stacks: {
        Row: {
          created_at: string | null
          description: string
          icon: string
          id: string
          slug: string
          sort_order: number
          tier_free: string[] | null
          tier_mid: string[] | null
          tier_pro: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          icon?: string
          id?: string
          slug: string
          sort_order?: number
          tier_free?: string[] | null
          tier_mid?: string[] | null
          tier_pro?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          slug?: string
          sort_order?: number
          tier_free?: string[] | null
          tier_mid?: string[] | null
          tier_pro?: string[] | null
          title?: string
        }
        Relationships: []
      }
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
      challenge_participants: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          joined_at: string | null
          progress: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          progress?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          badge_emoji: string | null
          badge_name: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          ends_at: string
          id: string
          is_active: boolean | null
          starts_at: string
          target_metric: string
          target_value: number
          title: string
          type: string
        }
        Insert: {
          badge_emoji?: string | null
          badge_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ends_at: string
          id?: string
          is_active?: boolean | null
          starts_at?: string
          target_metric?: string
          target_value?: number
          title: string
          type?: string
        }
        Update: {
          badge_emoji?: string | null
          badge_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ends_at?: string
          id?: string
          is_active?: boolean | null
          starts_at?: string
          target_metric?: string
          target_value?: number
          title?: string
          type?: string
        }
        Relationships: []
      }
      client_documents: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          title: string
          updated_at: string
          uploaded_by: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          title: string
          updated_at?: string
          uploaded_by: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string
          user_id?: string
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
        Relationships: [
          {
            foreignKeyName: "coach_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "absent_clients"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "coach_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "absent_clients"
            referencedColumns: ["user_id"]
          },
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
            referencedRelation: "absent_clients"
            referencedColumns: ["user_id"]
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
      community_posts: {
        Row: {
          anonymous_nickname: string | null
          content: string
          created_at: string
          id: string
          is_anonymous: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          anonymous_nickname?: string | null
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          anonymous_nickname?: string | null
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_foods: {
        Row: {
          calories: number | null
          carbohydrates: number | null
          category: string | null
          created_at: string | null
          fat: number | null
          fiber: number | null
          id: string
          name: string
          nutrients: Json | null
          nutritionist_id: string
          protein: number | null
          sodium: number | null
          sugar: number | null
          updated_at: string | null
        }
        Insert: {
          calories?: number | null
          carbohydrates?: number | null
          category?: string | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          id?: string
          name: string
          nutrients?: Json | null
          nutritionist_id: string
          protein?: number | null
          sodium?: number | null
          sugar?: number | null
          updated_at?: string | null
        }
        Update: {
          calories?: number | null
          carbohydrates?: number | null
          category?: string | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          id?: string
          name?: string
          nutrients?: Json | null
          nutritionist_id?: string
          protein?: number | null
          sodium?: number | null
          sugar?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_foods_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "absent_clients"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "custom_foods_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
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
      diet_plans: {
        Row: {
          created_at: string | null
          daily_calories_target: number | null
          daily_carbs_target: number | null
          daily_fat_target: number | null
          daily_protein_target: number | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          nutritionist_id: string
          patient_id: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_calories_target?: number | null
          daily_carbs_target?: number | null
          daily_fat_target?: number | null
          daily_protein_target?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          nutritionist_id: string
          patient_id: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_calories_target?: number | null
          daily_carbs_target?: number | null
          daily_fat_target?: number | null
          daily_protein_target?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          nutritionist_id?: string
          patient_id?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diet_plans_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "absent_clients"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "diet_plans_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diet_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      eezy_quiz_leads: {
        Row: {
          answers: Json
          created_at: string | null
          email: string
          email_sent: boolean | null
          id: string
          resend_email_id: string | null
          suggested_tier: string
          top_stack: string
        }
        Insert: {
          answers?: Json
          created_at?: string | null
          email: string
          email_sent?: boolean | null
          id?: string
          resend_email_id?: string | null
          suggested_tier?: string
          top_stack?: string
        }
        Update: {
          answers?: Json
          created_at?: string | null
          email?: string
          email_sent?: boolean | null
          id?: string
          resend_email_id?: string | null
          suggested_tier?: string
          top_stack?: string
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
      food_substitutions: {
        Row: {
          id: string
          meal_id: string
          new_food_id: string
          new_quantity: number | null
          original_food_id: string
          original_quantity: number | null
          patient_id: string
          rebalanced_quantities: Json | null
          substituted_at: string | null
        }
        Insert: {
          id?: string
          meal_id: string
          new_food_id: string
          new_quantity?: number | null
          original_food_id: string
          original_quantity?: number | null
          patient_id: string
          rebalanced_quantities?: Json | null
          substituted_at?: string | null
        }
        Update: {
          id?: string
          meal_id?: string
          new_food_id?: string
          new_quantity?: number | null
          original_food_id?: string
          original_quantity?: number | null
          patient_id?: string
          rebalanced_quantities?: Json | null
          substituted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_substitutions_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      foods_cache: {
        Row: {
          brand_name: string | null
          calories: number | null
          carbohydrates: number | null
          category: string | null
          created_at: string | null
          description: string
          fat: number | null
          fdc_id: string | null
          fiber: number | null
          id: string
          last_synced_at: string | null
          nutrients: Json | null
          protein: number | null
          search_vector: unknown
          sodium: number | null
          source: string
          sugar: number | null
        }
        Insert: {
          brand_name?: string | null
          calories?: number | null
          carbohydrates?: number | null
          category?: string | null
          created_at?: string | null
          description: string
          fat?: number | null
          fdc_id?: string | null
          fiber?: number | null
          id?: string
          last_synced_at?: string | null
          nutrients?: Json | null
          protein?: number | null
          search_vector?: unknown
          sodium?: number | null
          source: string
          sugar?: number | null
        }
        Update: {
          brand_name?: string | null
          calories?: number | null
          carbohydrates?: number | null
          category?: string | null
          created_at?: string | null
          description?: string
          fat?: number | null
          fdc_id?: string | null
          fiber?: number | null
          id?: string
          last_synced_at?: string | null
          nutrients?: Json | null
          protein?: number | null
          search_vector?: unknown
          sodium?: number | null
          source?: string
          sugar?: number | null
        }
        Relationships: []
      }
      leaderboard_opt_in: {
        Row: {
          display_name: string
          id: string
          is_anonymous: boolean | null
          opted_in_at: string | null
          user_id: string
        }
        Insert: {
          display_name: string
          id?: string
          is_anonymous?: boolean | null
          opted_in_at?: string | null
          user_id: string
        }
        Update: {
          display_name?: string
          id?: string
          is_anonymous?: boolean | null
          opted_in_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meal_foods: {
        Row: {
          created_at: string | null
          custom_food_id: string | null
          food_cache_id: string | null
          food_order: number | null
          id: string
          meal_id: string
          preparation_notes: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          custom_food_id?: string | null
          food_cache_id?: string | null
          food_order?: number | null
          id?: string
          meal_id: string
          preparation_notes?: string | null
          quantity: number
        }
        Update: {
          created_at?: string | null
          custom_food_id?: string | null
          food_cache_id?: string | null
          food_order?: number | null
          id?: string
          meal_id?: string
          preparation_notes?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_foods_custom_food_id_fkey"
            columns: ["custom_food_id"]
            isOneToOne: false
            referencedRelation: "custom_foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_foods_food_cache_id_fkey"
            columns: ["food_cache_id"]
            isOneToOne: false
            referencedRelation: "foods_cache"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_foods_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          created_at: string | null
          day_of_week: number
          diet_plan_id: string
          id: string
          meal_order: number | null
          meal_type: string
          name: string | null
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          diet_plan_id: string
          id?: string
          meal_order?: number | null
          meal_type: string
          name?: string | null
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          diet_plan_id?: string
          id?: string
          meal_order?: number | null
          meal_type?: string
          name?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meals_diet_plan_id_fkey"
            columns: ["diet_plan_id"]
            isOneToOne: false
            referencedRelation: "diet_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
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
            referencedRelation: "absent_clients"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "monthly_checks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_leads: {
        Row: {
          created_at: string | null
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
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
      patient_measurements: {
        Row: {
          body_fat_percentage: number | null
          created_at: string | null
          hip_circumference: number | null
          id: string
          measurement_date: string
          muscle_mass: number | null
          notes: string | null
          patient_id: string
          waist_circumference: number | null
          weight: number | null
        }
        Insert: {
          body_fat_percentage?: number | null
          created_at?: string | null
          hip_circumference?: number | null
          id?: string
          measurement_date?: string
          muscle_mass?: number | null
          notes?: string | null
          patient_id: string
          waist_circumference?: number | null
          weight?: number | null
        }
        Update: {
          body_fat_percentage?: number | null
          created_at?: string | null
          hip_circumference?: number | null
          id?: string
          measurement_date?: string
          muscle_mass?: number | null
          notes?: string | null
          patient_id?: string
          waist_circumference?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_measurements_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_progress: {
        Row: {
          created_at: string | null
          date: string
          diet_plan_id: string
          energy_level: number | null
          hunger_level: number | null
          id: string
          meals_completed: number | null
          meals_total: number | null
          notes: string | null
          patient_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          diet_plan_id: string
          energy_level?: number | null
          hunger_level?: number | null
          id?: string
          meals_completed?: number | null
          meals_total?: number | null
          notes?: string | null
          patient_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          diet_plan_id?: string
          energy_level?: number | null
          hunger_level?: number | null
          id?: string
          meals_completed?: number | null
          meals_total?: number | null
          notes?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_progress_diet_plan_id_fkey"
            columns: ["diet_plan_id"]
            isOneToOne: false
            referencedRelation: "diet_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_progress_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_questionnaires: {
        Row: {
          activity_level: string
          alcohol_frequency: string | null
          allergies: string[] | null
          calculated_bmr: number | null
          calculated_tdee: number | null
          completed_at: string | null
          created_at: string | null
          current_weight: number
          daily_steps: number | null
          date_of_birth: string
          dietary_restrictions: string[] | null
          digestive_issues: string | null
          disliked_foods: string | null
          gender: string
          goal: string
          height: number
          hip_cm: number | null
          id: string
          liked_foods: string | null
          meal_preferences: string | null
          meals_per_day: number | null
          medical_conditions: string | null
          medications: string | null
          notes: string | null
          occupation: string | null
          previous_diets: string | null
          sleep_hours: number | null
          smoking: boolean | null
          sport_description: string | null
          stress_level: string | null
          supplements: string | null
          target_calories: number | null
          target_carbs: number | null
          target_fat: number | null
          target_protein: number | null
          target_weight: number | null
          training_duration: number | null
          training_frequency: number | null
          training_intensity: string | null
          training_type: string | null
          updated_at: string | null
          user_id: string
          waist_cm: number | null
          water_intake: number | null
          work_type: string | null
        }
        Insert: {
          activity_level: string
          alcohol_frequency?: string | null
          allergies?: string[] | null
          calculated_bmr?: number | null
          calculated_tdee?: number | null
          completed_at?: string | null
          created_at?: string | null
          current_weight: number
          daily_steps?: number | null
          date_of_birth: string
          dietary_restrictions?: string[] | null
          digestive_issues?: string | null
          disliked_foods?: string | null
          gender: string
          goal: string
          height: number
          hip_cm?: number | null
          id?: string
          liked_foods?: string | null
          meal_preferences?: string | null
          meals_per_day?: number | null
          medical_conditions?: string | null
          medications?: string | null
          notes?: string | null
          occupation?: string | null
          previous_diets?: string | null
          sleep_hours?: number | null
          smoking?: boolean | null
          sport_description?: string | null
          stress_level?: string | null
          supplements?: string | null
          target_calories?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          target_protein?: number | null
          target_weight?: number | null
          training_duration?: number | null
          training_frequency?: number | null
          training_intensity?: string | null
          training_type?: string | null
          updated_at?: string | null
          user_id: string
          waist_cm?: number | null
          water_intake?: number | null
          work_type?: string | null
        }
        Update: {
          activity_level?: string
          alcohol_frequency?: string | null
          allergies?: string[] | null
          calculated_bmr?: number | null
          calculated_tdee?: number | null
          completed_at?: string | null
          created_at?: string | null
          current_weight?: number
          daily_steps?: number | null
          date_of_birth?: string
          dietary_restrictions?: string[] | null
          digestive_issues?: string | null
          disliked_foods?: string | null
          gender?: string
          goal?: string
          height?: number
          hip_cm?: number | null
          id?: string
          liked_foods?: string | null
          meal_preferences?: string | null
          meals_per_day?: number | null
          medical_conditions?: string | null
          medications?: string | null
          notes?: string | null
          occupation?: string | null
          previous_diets?: string | null
          sleep_hours?: number | null
          smoking?: boolean | null
          sport_description?: string | null
          stress_level?: string | null
          supplements?: string | null
          target_calories?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          target_protein?: number | null
          target_weight?: number | null
          training_duration?: number | null
          training_frequency?: number | null
          training_intensity?: string | null
          training_type?: string | null
          updated_at?: string | null
          user_id?: string
          waist_cm?: number | null
          water_intake?: number | null
          work_type?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          activity_level: string | null
          allergies: string[] | null
          bmi: number | null
          created_at: string | null
          current_weight: number | null
          date_of_birth: string | null
          dietary_restrictions: string[] | null
          email: string | null
          first_name: string
          gender: string | null
          goal: string | null
          height: number | null
          id: string
          last_name: string
          linked_user_id: string | null
          notes: string | null
          nutritionist_id: string
          phone: string | null
          target_weight: number | null
          updated_at: string | null
        }
        Insert: {
          activity_level?: string | null
          allergies?: string[] | null
          bmi?: number | null
          created_at?: string | null
          current_weight?: number | null
          date_of_birth?: string | null
          dietary_restrictions?: string[] | null
          email?: string | null
          first_name: string
          gender?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          last_name: string
          linked_user_id?: string | null
          notes?: string | null
          nutritionist_id: string
          phone?: string | null
          target_weight?: number | null
          updated_at?: string | null
        }
        Update: {
          activity_level?: string | null
          allergies?: string[] | null
          bmi?: number | null
          created_at?: string | null
          current_weight?: number | null
          date_of_birth?: string | null
          dietary_restrictions?: string[] | null
          email?: string | null
          first_name?: string
          gender?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          last_name?: string
          linked_user_id?: string | null
          notes?: string | null
          nutritionist_id?: string
          phone?: string | null
          target_weight?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "absent_clients"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "patients_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_clients: {
        Row: {
          activated_at: string | null
          activation_code: string | null
          created_at: string | null
          id: string
          plan: string | null
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          activation_code?: string | null
          created_at?: string | null
          id?: string
          plan?: string | null
          user_id: string
        }
        Update: {
          activated_at?: string | null
          activation_code?: string | null
          created_at?: string | null
          id?: string
          plan?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activated_at: string | null
          activation_code: string | null
          coach_id: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_premium: boolean | null
          need_profile: string | null
          phone_number: string | null
          plan: string | null
          premium_activated_at: string | null
          premium_activated_by: string | null
          premium_code: string | null
          questionnaire_completed: boolean | null
          referral_source: string | null
          trial_ends_at: string | null
          updated_at: string
          user_type: string
        }
        Insert: {
          activated_at?: string | null
          activation_code?: string | null
          coach_id?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_premium?: boolean | null
          need_profile?: string | null
          phone_number?: string | null
          plan?: string | null
          premium_activated_at?: string | null
          premium_activated_by?: string | null
          premium_code?: string | null
          questionnaire_completed?: boolean | null
          referral_source?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_type?: string
        }
        Update: {
          activated_at?: string | null
          activation_code?: string | null
          coach_id?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_premium?: boolean | null
          need_profile?: string | null
          phone_number?: string | null
          plan?: string | null
          premium_activated_at?: string | null
          premium_activated_by?: string | null
          premium_code?: string | null
          questionnaire_completed?: boolean | null
          referral_source?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_type?: string
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
      purchases: {
        Row: {
          created_at: string
          currency: string
          id: string
          product_id: string
          product_name: string
          teachable_order_id: string
          total_value: number
          updated_at: string
          user_email: string
          user_name: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          product_id: string
          product_name: string
          teachable_order_id: string
          total_value: number
          updated_at?: string
          user_email: string
          user_name?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          product_id?: string
          product_name?: string
          teachable_order_id?: string
          total_value?: number
          updated_at?: string
          user_email?: string
          user_name?: string | null
        }
        Relationships: []
      }
      quiz_leads: {
        Row: {
          all_answers: Json | null
          consent_given: boolean | null
          consent_timestamp: string | null
          created_at: string | null
          email: string
          email_sent: boolean | null
          hook_choice: string | null
          id: string
          name: string | null
          need_profile: string
          profile_name: string
          quiz_mode: string | null
          resend_email_id: string | null
          source: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          all_answers?: Json | null
          consent_given?: boolean | null
          consent_timestamp?: string | null
          created_at?: string | null
          email: string
          email_sent?: boolean | null
          hook_choice?: string | null
          id?: string
          name?: string | null
          need_profile: string
          profile_name: string
          quiz_mode?: string | null
          resend_email_id?: string | null
          source?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          all_answers?: Json | null
          consent_given?: boolean | null
          consent_timestamp?: string | null
          created_at?: string | null
          email?: string
          email_sent?: boolean | null
          hook_choice?: string | null
          id?: string
          name?: string | null
          need_profile?: string
          profile_name?: string
          quiz_mode?: string | null
          resend_email_id?: string | null
          source?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          created_at: string | null
          food_cache_id: string | null
          id: string
          ingredient_order: number | null
          notes: string | null
          quantity: number
          recipe_id: string
        }
        Insert: {
          created_at?: string | null
          food_cache_id?: string | null
          id?: string
          ingredient_order?: number | null
          notes?: string | null
          quantity: number
          recipe_id: string
        }
        Update: {
          created_at?: string | null
          food_cache_id?: string | null
          id?: string
          ingredient_order?: number | null
          notes?: string | null
          quantity?: number
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_food_cache_id_fkey"
            columns: ["food_cache_id"]
            isOneToOne: false
            referencedRelation: "foods_cache"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          instructions: string | null
          name: string
          nutritionist_id: string
          preparation_time: number | null
          servings: number | null
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_protein: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instructions?: string | null
          name: string
          nutritionist_id: string
          preparation_time?: number | null
          servings?: number | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instructions?: string | null
          name?: string
          nutritionist_id?: string
          preparation_time?: number | null
          servings?: number | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tools: {
        Row: {
          affiliate_url: string | null
          category: string
          cons: string[] | null
          cost: string
          cost_detail: string
          created_at: string | null
          description: string
          difficulty: string
          features: string[] | null
          id: string
          italian_support: boolean
          logo_url: string | null
          name: string
          pros: string[] | null
          rating: number
          slug: string
          synergies: string[] | null
          tagline: string
          updated_at: string | null
          use_cases: string[] | null
          user_tier: string
          website: string
        }
        Insert: {
          affiliate_url?: string | null
          category: string
          cons?: string[] | null
          cost: string
          cost_detail: string
          created_at?: string | null
          description: string
          difficulty: string
          features?: string[] | null
          id?: string
          italian_support?: boolean
          logo_url?: string | null
          name: string
          pros?: string[] | null
          rating?: number
          slug: string
          synergies?: string[] | null
          tagline: string
          updated_at?: string | null
          use_cases?: string[] | null
          user_tier: string
          website: string
        }
        Update: {
          affiliate_url?: string | null
          category?: string
          cons?: string[] | null
          cost?: string
          cost_detail?: string
          created_at?: string | null
          description?: string
          difficulty?: string
          features?: string[] | null
          id?: string
          italian_support?: boolean
          logo_url?: string | null
          name?: string
          pros?: string[] | null
          rating?: number
          slug?: string
          synergies?: string[] | null
          tagline?: string
          updated_at?: string | null
          use_cases?: string[] | null
          user_tier?: string
          website?: string
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
      user_milestones: {
        Row: {
          achieved_at: string | null
          id: string
          milestone_type: string
          milestone_value: string | null
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          id?: string
          milestone_type: string
          milestone_value?: string | null
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          id?: string
          milestone_type?: string
          milestone_value?: string | null
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
      user_subscriptions: {
        Row: {
          activated_at: string | null
          activation_code: string | null
          created_at: string | null
          id: string
          plan: string
          trial_ends_at: string | null
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          activation_code?: string | null
          created_at?: string | null
          id?: string
          plan?: string
          trial_ends_at?: string | null
          user_id: string
        }
        Update: {
          activated_at?: string | null
          activation_code?: string | null
          created_at?: string | null
          id?: string
          plan?: string
          trial_ends_at?: string | null
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
      weekly_recaps: {
        Row: {
          avg_energy: number | null
          avg_mindset: number | null
          avg_recovery: number | null
          created_at: string | null
          highlights: string | null
          id: string
          streak_at_end: number | null
          total_checkins: number | null
          user_id: string
          week_end: string
          week_start: string
        }
        Insert: {
          avg_energy?: number | null
          avg_mindset?: number | null
          avg_recovery?: number | null
          created_at?: string | null
          highlights?: string | null
          id?: string
          streak_at_end?: number | null
          total_checkins?: number | null
          user_id: string
          week_end: string
          week_start: string
        }
        Update: {
          avg_energy?: number | null
          avg_mindset?: number | null
          avg_recovery?: number | null
          created_at?: string | null
          highlights?: string | null
          id?: string
          streak_at_end?: number | null
          total_checkins?: number | null
          user_id?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      absent_clients: {
        Row: {
          alert_level: number | null
          days_absent: number | null
          email: string | null
          full_name: string | null
          last_checkin_date: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_premium_code: { Args: { _code: string }; Returns: Json }
      assign_coach: {
        Args: { p_client_id: string; p_coach_id: string }
        Returns: undefined
      }
      can_access_client_data: {
        Args: { _client_id: string; _user_id: string }
        Returns: boolean
      }
      can_collaborator_see_client: {
        Args: { _client_id: string; _collaborator_id: string }
        Returns: boolean
      }
      check_absent_clients: {
        Args: never
        Returns: {
          alert_level: number
          days_absent: number
          email: string
          full_name: string
          user_id: string
        }[]
      }
      create_community_post: {
        Args: {
          p_anonymous_nickname?: string
          p_content: string
          p_is_anonymous?: boolean
        }
        Returns: string
      }
      delete_community_post: { Args: { p_id: string }; Returns: undefined }
      generate_premium_code: {
        Args: { _client_id: string; _code: string }
        Returns: Json
      }
      get_client_subscriptions: {
        Args: { client_ids: string[] }
        Returns: {
          activation_code: string
          plan: string
          user_id: string
        }[]
      }
      get_coaches: {
        Args: never
        Returns: {
          id: string
          name: string
        }[]
      }
      get_community_posts: {
        Args: { lim?: number }
        Returns: {
          anonymous_nickname: string
          content: string
          created_at: string
          id: string
          is_anonymous: boolean
          user_id: string
        }[]
      }
      get_my_coach: {
        Args: never
        Returns: {
          id: string
          name: string
        }[]
      }
      get_my_patient_id: { Args: never; Returns: string }
      get_premium_clients: {
        Args: { client_ids: string[] }
        Returns: {
          id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_coach_of_patient: {
        Args: { coach_id: string; patient_user_id: string }
        Returns: boolean
      }
      is_patient_for_diet_plan: {
        Args: { plan_id: string; user_id: string }
        Returns: boolean
      }
      is_patient_for_meal: {
        Args: { p_meal_id: string; user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      remove_coach: { Args: { p_client_id: string }; Returns: undefined }
      toggle_premium: {
        Args: { grant_premium: boolean; target_user_id: string }
        Returns: Json
      }
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
