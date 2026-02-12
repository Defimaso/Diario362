import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DailyCheckin {
  id: string;
  user_id: string;
  date: string;
  recovery: number | null;
  nutrition_adherence: boolean | null;
  energy: number | null;
  mindset: number | null;
  two_percent_edge: string | null;
  created_at: string;
  updated_at: string;
}

export const useCheckins = () => {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  const fetchCheckins = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching checkins:', error);
    } else {
      setCheckins(data || []);
      
      const today = new Date().toISOString().split('T')[0];
      const todayData = data?.find(c => c.date === today) || null;
      setTodayCheckin(todayData);
      
      // Calculate streak
      calculateStreak(data || []);
    }
    setLoading(false);
  };

  const calculateStreak = (data: DailyCheckin[]) => {
    if (data.length === 0) {
      setStreak(0);
      return;
    }

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasCheckin = data.some(c => c.date === dateStr);
      
      if (hasCheckin) {
        currentStreak++;
      } else if (i > 0) {
        // Allow missing today, but break if any previous day is missing
        break;
      }
    }
    
    setStreak(currentStreak);
  };

  const saveCheckin = async (checkinData: {
    recovery: number;
    nutrition_adherence: boolean;
    energy: number;
    mindset: number;
    two_percent_edge: string;
    nutrition_score?: number;
    nutrition_notes?: string;
    training_score?: number | null;
    training_rest_day?: boolean;
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    const today = new Date().toISOString().split('T')[0];

    // Prepare data with new fields
    const dataToSave: any = {
      recovery: checkinData.recovery,
      nutrition_adherence: checkinData.nutrition_adherence,
      energy: checkinData.energy,
      mindset: checkinData.mindset,
      two_percent_edge: checkinData.two_percent_edge,
    };

    // Add new fields if present
    if (checkinData.nutrition_score !== undefined) {
      dataToSave.nutrition_score = checkinData.nutrition_score;
    }
    if (checkinData.nutrition_notes !== undefined) {
      dataToSave.nutrition_notes = checkinData.nutrition_notes;
    }
    if (checkinData.training_rest_day !== undefined) {
      dataToSave.training_rest_day = checkinData.training_rest_day;
      dataToSave.training_score = checkinData.training_rest_day ? null : checkinData.training_score;
    }

    // Check if today's checkin exists
    const existing = checkins.find(c => c.date === today);

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('daily_checkins')
        .update({
          ...dataToSave,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (!error) {
        await fetchCheckins();
      }
      return { error };
    } else {
      // Insert new
      const { error } = await supabase
        .from('daily_checkins')
        .insert({
          user_id: user.id,
          date: today,
          ...dataToSave,
        });

      if (!error) {
        // Notify coaches about new daily check-in (fire and forget)
        supabase.functions.invoke('notify-interaction', {
          body: {
            type: 'daily_checkin',
            clientId: user.id,
            authorId: user.id,
          }
        }).catch(err => console.error('Notify error:', err));

        await fetchCheckins();
      }
      return { error };
    }
  };

  const getWeeklyCheckins = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return checkins.filter(c => new Date(c.date) >= weekAgo);
  };

  const calculateDailyScore = (checkin: DailyCheckin): number => {
    const recovery = checkin.recovery || 0;
    const nutritionScore = checkin.nutrition_adherence ? 10 : 5;
    const energy = checkin.energy || 0;
    const mindset = checkin.mindset || 0;
    return Math.round(((recovery + nutritionScore + energy + mindset) / 4) * 10) / 10;
  };

  const getDailyCompletionPercentage = (): number => {
    if (!todayCheckin) return 0;
    const score = calculateDailyScore(todayCheckin);
    return (score / 10) * 100;
  };

  useEffect(() => {
    fetchCheckins();
  }, [user]);

  return {
    checkins,
    todayCheckin,
    loading,
    streak,
    saveCheckin,
    getWeeklyCheckins,
    calculateDailyScore,
    getDailyCompletionPercentage,
    refetch: fetchCheckins,
  };
};
