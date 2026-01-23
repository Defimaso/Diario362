import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MonthlyCheck {
  id: string;
  user_id: string | null;
  email: string;
  current_weight: number | null;
  photo_front_url: string | null;
  photo_side_url: string | null;
  photo_back_url: string | null;
  check_date: string;
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

  const getCheckById = useCallback((id: string): MonthlyCheck | undefined => {
    return monthlyChecks.find(check => check.id === id);
  }, [monthlyChecks]);

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
