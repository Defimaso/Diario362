import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  type: 'weekly' | 'monthly' | 'custom';
  target_value: number;
  target_metric: string;
  starts_at: string;
  ends_at: string;
  badge_emoji: string;
  badge_name: string;
  is_active: boolean;
  created_at: string;
  // Computed
  my_progress?: number;
  my_completed?: boolean;
  total_participants?: number;
  days_left?: number;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  progress: number;
  completed_at: string | null;
  joined_at: string;
  user_name?: string;
}

export function useChallenges() {
  const { user, isAdmin, isCollaborator, isSuperAdmin } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const isStaff = isAdmin || isCollaborator || isSuperAdmin;

  const fetchChallenges = useCallback(async () => {
    if (!user) return;

    const { data: challengeData, error } = await supabase
      .from('challenges' as any)
      .select('*')
      .eq('is_active', true)
      .order('ends_at', { ascending: true });

    if (error || !challengeData) {
      setChallenges([]);
      setLoading(false);
      return;
    }

    // Fetch my participations
    const { data: myParts } = await supabase
      .from('challenge_participants' as any)
      .select('challenge_id, progress, completed_at')
      .eq('user_id', user.id);

    const myPartsMap = new Map<string, { progress: number; completed_at: string | null }>();
    (myParts as any[] || []).forEach((p: any) => {
      myPartsMap.set(p.challenge_id, { progress: p.progress, completed_at: p.completed_at });
    });

    // Count participants per challenge
    const challengeIds = (challengeData as any[]).map(c => c.id);
    const { data: allParts } = await supabase
      .from('challenge_participants' as any)
      .select('challenge_id')
      .in('challenge_id', challengeIds);

    const partCounts = new Map<string, number>();
    (allParts as any[] || []).forEach((p: any) => {
      partCounts.set(p.challenge_id, (partCounts.get(p.challenge_id) || 0) + 1);
    });

    const now = new Date();
    const enriched: Challenge[] = (challengeData as any[]).map(c => {
      const myPart = myPartsMap.get(c.id);
      const daysLeft = Math.max(0, Math.ceil((new Date(c.ends_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        ...c,
        my_progress: myPart?.progress || 0,
        my_completed: !!myPart?.completed_at,
        total_participants: partCounts.get(c.id) || 0,
        days_left: daysLeft,
      };
    });

    setChallenges(enriched);
    setLoading(false);
  }, [user]);

  const joinChallenge = useCallback(async (challengeId: string) => {
    if (!user) return { error: 'Non autenticato' };

    const { error } = await supabase
      .from('challenge_participants' as any)
      .insert({
        challenge_id: challengeId,
        user_id: user.id,
        progress: 0,
      } as any);

    if (error) return { error: error.message };

    await fetchChallenges();
    return { error: null };
  }, [user, fetchChallenges]);

  const updateProgress = useCallback(async (challengeId: string, progress: number, targetValue: number) => {
    if (!user) return;

    const updateData: any = { progress };
    if (progress >= targetValue) {
      updateData.completed_at = new Date().toISOString();
    }

    await supabase
      .from('challenge_participants' as any)
      .update(updateData as any)
      .eq('challenge_id', challengeId)
      .eq('user_id', user.id);

    await fetchChallenges();
  }, [user, fetchChallenges]);

  const createChallenge = useCallback(async (challenge: {
    title: string;
    description?: string;
    type: 'weekly' | 'monthly' | 'custom';
    target_value: number;
    target_metric: string;
    ends_at: string;
    badge_emoji?: string;
    badge_name?: string;
  }) => {
    if (!user || !isStaff) return { error: 'Non autorizzato' };

    const { error } = await supabase
      .from('challenges' as any)
      .insert({
        ...challenge,
        created_by: user.id,
        starts_at: new Date().toISOString(),
      } as any);

    if (error) return { error: error.message };

    await fetchChallenges();
    return { error: null };
  }, [user, isStaff, fetchChallenges]);

  const fetchLeaderboard = useCallback(async (challengeId: string): Promise<ChallengeParticipant[]> => {
    const { data } = await supabase
      .from('challenge_participants' as any)
      .select('*')
      .eq('challenge_id', challengeId)
      .order('progress', { ascending: false });

    if (!data) return [];

    // Get names
    const userIds = (data as any[]).map(p => p.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    const nameMap = new Map<string, string>();
    (profiles || []).forEach((p: any) => nameMap.set(p.id, p.full_name || p.email));

    return (data as any[]).map(p => ({
      ...p,
      user_name: nameMap.get(p.user_id) || 'Utente',
    }));
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  return {
    challenges,
    loading,
    joinChallenge,
    updateProgress,
    createChallenge,
    fetchLeaderboard,
    refetch: fetchChallenges,
  };
}
