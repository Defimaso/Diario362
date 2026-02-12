import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  is_anonymous: boolean;
  streak: number;
  total_checkins: number;
  rank: number;
}

export function useLeaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    if (!user) return;

    // Check if current user is opted in
    const { data: optIn } = await supabase
      .from('leaderboard_opt_in' as any)
      .select('*')
      .eq('user_id', user.id)
      .single();

    setIsOptedIn(!!optIn);

    // Get all opted-in users
    const { data: optIns } = await supabase
      .from('leaderboard_opt_in' as any)
      .select('user_id, display_name, is_anonymous');

    if (!optIns || (optIns as any[]).length === 0) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const userIds = (optIns as any[]).map(o => o.user_id);

    // Get checkin counts and streaks
    // We compute from daily_checkins: total count + current streak
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 365);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const { data: checkins } = await supabase
      .from('daily_checkins')
      .select('user_id, date')
      .in('user_id', userIds)
      .gte('date', cutoffStr)
      .order('date', { ascending: false });

    // Compute stats per user
    const statsMap = new Map<string, { streak: number; total: number }>();

    const checkinsByUser = new Map<string, string[]>();
    (checkins || []).forEach((c: any) => {
      if (!checkinsByUser.has(c.user_id)) checkinsByUser.set(c.user_id, []);
      checkinsByUser.get(c.user_id)!.push(c.date);
    });

    checkinsByUser.forEach((dates, userId) => {
      const total = dates.length;
      const dateSet = new Set(dates);
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        if (dateSet.has(ds)) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      statsMap.set(userId, { streak, total });
    });

    // Build leaderboard sorted by streak then total
    const optInMap = new Map<string, any>();
    (optIns as any[]).forEach(o => optInMap.set(o.user_id, o));

    const board: LeaderboardEntry[] = userIds.map(uid => {
      const stats = statsMap.get(uid) || { streak: 0, total: 0 };
      const optInData = optInMap.get(uid);
      return {
        user_id: uid,
        display_name: optInData?.is_anonymous ? 'Anonimo' : (optInData?.display_name || 'Utente'),
        is_anonymous: optInData?.is_anonymous || false,
        streak: stats.streak,
        total_checkins: stats.total,
        rank: 0,
      };
    });

    // Sort by streak descending, then total checkins descending
    board.sort((a, b) => b.streak - a.streak || b.total_checkins - a.total_checkins);

    // Assign ranks
    board.forEach((entry, i) => {
      entry.rank = i + 1;
      if (entry.user_id === user.id) setMyRank(entry.rank);
    });

    setEntries(board);
    setLoading(false);
  }, [user]);

  const optIn = useCallback(async (displayName: string, anonymous: boolean = false) => {
    if (!user) return { error: 'Non autenticato' };

    const { error } = await supabase
      .from('leaderboard_opt_in' as any)
      .upsert({
        user_id: user.id,
        display_name: displayName,
        is_anonymous: anonymous,
      } as any, { onConflict: 'user_id' });

    if (error) return { error: error.message };

    setIsOptedIn(true);
    await fetchLeaderboard();
    return { error: null };
  }, [user, fetchLeaderboard]);

  const optOut = useCallback(async () => {
    if (!user) return;

    await supabase
      .from('leaderboard_opt_in' as any)
      .delete()
      .eq('user_id', user.id);

    setIsOptedIn(false);
    await fetchLeaderboard();
  }, [user, fetchLeaderboard]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    entries,
    myRank,
    isOptedIn,
    loading,
    optIn,
    optOut,
    refetch: fetchLeaderboard,
  };
}
