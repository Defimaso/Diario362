import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MonthlyCheck {
  id: string;
  user_id: string | null;
  email: string;
  
  // Personal data
  first_name: string | null;
  last_name: string | null;
  
  // Program
  program_type: string | null;
  coach_name: string | null;
  coach_rating: number | null;
  
  // Dates and progression
  check_date: string;
  start_date: string | null;
  check_number: string | null;
  
  // Training
  training_type: string | null;
  training_consistency: string | null;
  wants_to_change_training: boolean | null;
  activity_level: string | null;
  
  // Nutrition
  nutrition_type: string | null;
  wants_to_change_nutrition: boolean | null;
  off_program_meals: string | null;
  off_meals_location: string | null;
  off_meals_feeling: string | null;
  after_off_meals_feeling: string | null;
  
  // Weight
  starting_weight: number | null;
  last_check_weight: number | null;
  current_weight: number | null;
  
  // Health
  intestinal_function_start: string | null;
  intestinal_function_now: string | null;
  
  // Ratings (1-5)
  training_program_rating: number | null;
  nutrition_program_rating: number | null;
  assistance_rating: number | null;
  training_commitment: number | null;
  nutrition_commitment: number | null;
  mindset_commitment: number | null;
  
  // Feedback
  testimonial: string | null;
  improvement_feedback: string | null;
  next_phase_improvement: string | null;
  lifestyle_difficulty: string | null;
  next_month_goal: string | null;
  
  // Photos (Google Drive URLs)
  photo_front_url: string | null;
  photo_side_url: string | null;
  photo_back_url: string | null;
  photo_consent: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export const useMonthlyChecks = (clientId?: string) => {
  const { user } = useAuth();
  const [monthlyChecks, setMonthlyChecks] = useState<MonthlyCheck[]>([]);
  const [loading, setLoading] = useState(true);

  const targetUserId = clientId || user?.id;

  const fetchMonthlyChecks = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase
      .from('monthly_checks')
      .select('*')
      .eq('user_id', targetUserId)
      .order('check_date', { ascending: false });

    if (error) {
      console.error('Error fetching monthly checks:', error);
    } else {
      setMonthlyChecks((data as MonthlyCheck[]) || []);
    }
    setLoading(false);
  }, [targetUserId]);

  useEffect(() => {
    fetchMonthlyChecks();
  }, [fetchMonthlyChecks]);

  // Get check by ID
  const getCheckById = useCallback((id: string): MonthlyCheck | undefined => {
    return monthlyChecks.find(check => check.id === id);
  }, [monthlyChecks]);

  // Get all checks with photos
  const getChecksWithPhotos = useCallback((): MonthlyCheck[] => {
    return monthlyChecks.filter(
      check => check.photo_front_url || check.photo_side_url || check.photo_back_url
    );
  }, [monthlyChecks]);

  return {
    monthlyChecks,
    loading,
    getCheckById,
    getChecksWithPhotos,
    refetch: fetchMonthlyChecks,
  };
};
