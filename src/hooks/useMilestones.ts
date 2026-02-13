import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Milestone {
  type: string;
  label: string;
  description: string;
  emoji: string;
  achieved: boolean;
  achieved_at: string | null;
  sort_order: number;
}

const MILESTONE_DEFINITIONS = [
  { type: 'first_checkin', label: 'Primo Diario', description: 'Hai completato il tuo primo diario', emoji: '🎯', sort_order: 1 },
  { type: 'streak_3', label: '3 Giorni di Fila', description: '3 diari consecutivi', emoji: '🔥', sort_order: 2 },
  { type: 'streak_7', label: 'Settimana Perfetta', description: '7 diari consecutivi', emoji: '⭐', sort_order: 3 },
  { type: 'streak_14', label: 'Due Settimane', description: '14 diari consecutivi', emoji: '💪', sort_order: 4 },
  { type: 'streak_30', label: 'Un Mese', description: '30 diari consecutivi', emoji: '🏆', sort_order: 5 },
  { type: 'streak_60', label: 'Due Mesi', description: '60 diari consecutivi', emoji: '💎', sort_order: 6 },
  { type: 'streak_90', label: 'Tre Mesi', description: '90 diari consecutivi', emoji: '👑', sort_order: 7 },
  { type: 'total_10', label: '10 Diari', description: 'Hai totalizzato 10 diari', emoji: '📊', sort_order: 8 },
  { type: 'total_50', label: '50 Diari', description: 'Hai totalizzato 50 diari', emoji: '🚀', sort_order: 9 },
  { type: 'total_100', label: '100 Diari', description: 'Hai totalizzato 100 diari', emoji: '🌟', sort_order: 10 },
  { type: 'avg_recovery_8', label: 'Recovery Master', description: 'Media recovery settimanale > 8', emoji: '💤', sort_order: 11 },
  { type: 'avg_energy_8', label: 'Energia Pura', description: 'Media energia settimanale > 8', emoji: '⚡', sort_order: 12 },
  { type: 'avg_mindset_8', label: 'Mente d\'Acciaio', description: 'Media mindset settimanale > 8', emoji: '🧠', sort_order: 13 },
  { type: 'first_challenge', label: 'Prima Sfida', description: 'Hai completato la tua prima sfida', emoji: '🏅', sort_order: 14 },
];

export function useMilestones(streak: number, totalCheckins: number) {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [newlyAchieved, setNewlyAchieved] = useState<Milestone | null>(null);

  const fetchMilestones = useCallback(async () => {
    if (!user) return;

    const { data: achieved } = await supabase
      .from('user_milestones' as any)
      .select('milestone_type, achieved_at')
      .eq('user_id', user.id);

    const achievedMap = new Map<string, string>();
    (achieved as any[] || []).forEach((m: any) => {
      achievedMap.set(m.milestone_type, m.achieved_at);
    });

    const result: Milestone[] = MILESTONE_DEFINITIONS.map(def => ({
      ...def,
      achieved: achievedMap.has(def.type),
      achieved_at: achievedMap.get(def.type) || null,
    }));

    setMilestones(result);
    setLoading(false);
  }, [user]);

  // Check and unlock new milestones
  const checkMilestones = useCallback(async () => {
    if (!user) return;

    const toCheck: { type: string; condition: boolean }[] = [
      { type: 'first_checkin', condition: totalCheckins >= 1 },
      { type: 'streak_3', condition: streak >= 3 },
      { type: 'streak_7', condition: streak >= 7 },
      { type: 'streak_14', condition: streak >= 14 },
      { type: 'streak_30', condition: streak >= 30 },
      { type: 'streak_60', condition: streak >= 60 },
      { type: 'streak_90', condition: streak >= 90 },
      { type: 'total_10', condition: totalCheckins >= 10 },
      { type: 'total_50', condition: totalCheckins >= 50 },
      { type: 'total_100', condition: totalCheckins >= 100 },
    ];

    const existing = milestones.filter(m => m.achieved).map(m => m.type);

    for (const check of toCheck) {
      if (check.condition && !existing.includes(check.type)) {
        const { error } = await supabase
          .from('user_milestones' as any)
          .insert({
            user_id: user.id,
            milestone_type: check.type,
          } as any);

        if (!error) {
          const def = MILESTONE_DEFINITIONS.find(d => d.type === check.type);
          if (def) {
            setNewlyAchieved({
              ...def,
              achieved: true,
              achieved_at: new Date().toISOString(),
            });
          }
        }
      }
    }

    await fetchMilestones();
  }, [user, streak, totalCheckins, milestones, fetchMilestones]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  useEffect(() => {
    if (milestones.length > 0 && totalCheckins > 0) {
      checkMilestones();
    }
  }, [streak, totalCheckins]);

  const dismissNewMilestone = useCallback(() => {
    setNewlyAchieved(null);
  }, []);

  const achievedCount = milestones.filter(m => m.achieved).length;
  const totalCount = milestones.length;
  const progressPercent = totalCount > 0 ? Math.round((achievedCount / totalCount) * 100) : 0;

  return {
    milestones,
    loading,
    newlyAchieved,
    dismissNewMilestone,
    achievedCount,
    totalCount,
    progressPercent,
  };
}
