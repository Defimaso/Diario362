import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WeeklyRecap {
  id: string;
  week_start: string;
  week_end: string;
  total_checkins: number;
  avg_recovery: number | null;
  avg_energy: number | null;
  avg_mindset: number | null;
  streak_at_end: number;
  highlights: string | null;
}

export function useWeeklyRecap() {
  const { user } = useAuth();
  const [currentRecap, setCurrentRecap] = useState<WeeklyRecap | null>(null);
  const [previousRecap, setPreviousRecap] = useState<WeeklyRecap | null>(null);
  const [loading, setLoading] = useState(true);

  const getWeekDates = useCallback(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const thisMonday = new Date(now);
    thisMonday.setDate(now.getDate() + mondayOffset);
    thisMonday.setHours(0, 0, 0, 0);

    const thisSunday = new Date(thisMonday);
    thisSunday.setDate(thisMonday.getDate() + 6);

    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(thisMonday.getDate() - 7);

    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);

    return {
      thisMonday: thisMonday.toISOString().split('T')[0],
      thisSunday: thisSunday.toISOString().split('T')[0],
      lastMonday: lastMonday.toISOString().split('T')[0],
      lastSunday: lastSunday.toISOString().split('T')[0],
    };
  }, []);

  const generateRecap = useCallback(async () => {
    if (!user) return;

    const { thisMonday, thisSunday, lastMonday, lastSunday } = getWeekDates();

    // Fetch this week's checkins
    const { data: thisWeekCheckins } = await supabase
      .from('daily_checkins')
      .select('recovery, energy, mindset, date')
      .eq('user_id', user.id)
      .gte('date', thisMonday)
      .lte('date', thisSunday)
      .order('date', { ascending: true });

    const checkins = thisWeekCheckins || [];

    if (checkins.length > 0) {
      const avgRecovery = checkins.reduce((sum, c) => sum + (c.recovery || 0), 0) / checkins.length;
      const avgEnergy = checkins.reduce((sum, c) => sum + (c.energy || 0), 0) / checkins.length;
      const avgMindset = checkins.reduce((sum, c) => sum + (c.mindset || 0), 0) / checkins.length;

      setCurrentRecap({
        id: 'current',
        week_start: thisMonday,
        week_end: thisSunday,
        total_checkins: checkins.length,
        avg_recovery: Math.round(avgRecovery * 10) / 10,
        avg_energy: Math.round(avgEnergy * 10) / 10,
        avg_mindset: Math.round(avgMindset * 10) / 10,
        streak_at_end: 0,
        highlights: null,
      });
    }

    // Fetch last week's checkins
    const { data: lastWeekCheckins } = await supabase
      .from('daily_checkins')
      .select('recovery, energy, mindset, date')
      .eq('user_id', user.id)
      .gte('date', lastMonday)
      .lte('date', lastSunday)
      .order('date', { ascending: true });

    const lastCheckins = lastWeekCheckins || [];

    if (lastCheckins.length > 0) {
      const avgRecovery = lastCheckins.reduce((sum, c) => sum + (c.recovery || 0), 0) / lastCheckins.length;
      const avgEnergy = lastCheckins.reduce((sum, c) => sum + (c.energy || 0), 0) / lastCheckins.length;
      const avgMindset = lastCheckins.reduce((sum, c) => sum + (c.mindset || 0), 0) / lastCheckins.length;

      setPreviousRecap({
        id: 'previous',
        week_start: lastMonday,
        week_end: lastSunday,
        total_checkins: lastCheckins.length,
        avg_recovery: Math.round(avgRecovery * 10) / 10,
        avg_energy: Math.round(avgEnergy * 10) / 10,
        avg_mindset: Math.round(avgMindset * 10) / 10,
        streak_at_end: 0,
        highlights: null,
      });
    }

    setLoading(false);
  }, [user, getWeekDates]);

  useEffect(() => {
    generateRecap();
  }, [generateRecap]);

  // Compute delta (improvement/decline)
  const getDelta = useCallback((current: number | null, previous: number | null): number | null => {
    if (current === null || previous === null) return null;
    return Math.round((current - previous) * 10) / 10;
  }, []);

  return {
    currentRecap,
    previousRecap,
    loading,
    getDelta,
    refetch: generateRecap,
  };
}
