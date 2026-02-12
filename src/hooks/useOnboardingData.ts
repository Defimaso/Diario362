import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingProfile {
  profile_badge: string | null;
  gender: string | null;
  age: number | null;
  height: number | null;
  current_weight: number | null;
  target_weight: number | null;
  metabolism: string | null;
  health_conditions: string[] | null;
  energy_level: string | null;
  experience_level: string | null;
  stress_eating: boolean | null;
  biggest_fear: string | null;
  motivation_source: string | null;
  diet_type: string | null;
  weekly_sessions: string | null;
  preferred_location: string | null;
  why_now: string | null;
}

export const useOnboardingData = (clientId?: string) => {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOnboarding = useCallback(async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      // First try matching by user email through profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', clientId)
        .single();

      if (!profileData?.email) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('onboarding_leads')
        .select('profile_badge, gender, age, height, current_weight, target_weight, metabolism, health_conditions, energy_level, experience_level, stress_eating, biggest_fear, motivation_source, diet_type, weekly_sessions, preferred_location, why_now')
        .eq('email', profileData.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching onboarding data:', error);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error in useOnboardingData:', err);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchOnboarding();
  }, [fetchOnboarding]);

  return { profile, loading };
};
