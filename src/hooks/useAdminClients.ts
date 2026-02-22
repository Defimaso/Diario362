import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ClientData {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  coach_id: string | null;   // UUID del coach assegnato (profiles.coach_id)
  coach_names: string[];     // Derivato da full_name del coach (per filtro/display)
  streak: number;
  need_profile: string | null;
  referral_source: string | null;
  last_checkin: {
    date: string;
    recovery: number | null;
    nutrition_adherence: boolean | null;
    energy: number | null;
    mindset: number | null;
    two_percent_edge: string | null;
  } | null;
  status: 'green' | 'yellow' | 'red';
  is_premium: boolean;
  premium_code: string | null;
}

export const useAdminClients = () => {
  const { user, isAdmin, isCollaborator, isSuperAdmin } = useAuth();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateStatus = (checkin: ClientData['last_checkin']): 'green' | 'yellow' | 'red' => {
    if (!checkin) return 'red';
    
    const today = new Date().toISOString().split('T')[0];
    if (checkin.date !== today) return 'red';

    const scores = [
      checkin.recovery || 0,
      checkin.nutrition_adherence ? 10 : 0,
      checkin.energy || 0,
      checkin.mindset || 0,
    ];
    
    const avg = scores.reduce((a, b) => a + b, 0) / 4;
    
    if (avg > 7) return 'green';
    if (avg >= 4) return 'yellow';
    return 'red';
  };

  const calculateStreak = (checkins: { date: string }[]): number => {
    if (checkins.length === 0) return 0;

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateSet = new Set(checkins.map(c => c.date));

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (dateSet.has(dateStr)) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    return currentStreak;
  };

  const fetchClients = async () => {
    if (!user || (!isAdmin && !isCollaborator && !isSuperAdmin)) {
      setLoading(false);
      return;
    }

    try {
      console.log('useAdminClients - Starting fetch...');
      
      // Fetch all profiles with client role
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;
      console.log('useAdminClients - Profiles loaded:', profilesData?.length);

      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;
      console.log('useAdminClients - Roles loaded:', rolesData?.length);

      // Filter only clients
      const clientUserIds = rolesData
        ?.filter(r => r.role === 'client')
        .map(r => r.user_id) || [];

      const clientProfiles = profilesData?.filter(p => clientUserIds.includes(p.id)) || [];
      console.log('useAdminClients - Client profiles:', clientProfiles.length);

      // Fetch coach profiles for all coach_ids referenced in client profiles
      const coachIds = clientProfiles
        .map(p => (p as any).coach_id as string | null)
        .filter((id): id is string => !!id);

      let coachProfileMap: Record<string, string> = {};
      if (coachIds.length > 0) {
        const uniqueCoachIds = [...new Set(coachIds)];
        const { data: coachProfs } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', uniqueCoachIds);
        (coachProfs || []).forEach((cp: any) => {
          coachProfileMap[cp.id] = cp.full_name || cp.email;
        });
      }

      // Fetch checkins (last 365 days only for performance)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 365);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      const { data: checkinsData, error: checkinsError } = await supabase
        .from('daily_checkins')
        .select('id, user_id, date, recovery, nutrition_adherence, energy, mindset, two_percent_edge')
        .gte('date', cutoffStr)
        .order('date', { ascending: false });

      if (checkinsError) throw checkinsError;
      console.log('useAdminClients - Checkins loaded:', checkinsData?.length);

      // Build client data

      // Fetch premium status from secondary project API
      let premiumMap: Record<string, { plan: string; activation_code: string | null }> = {};
      try {
        const premiumPromises = clientProfiles.map(async (p) => {
          const res = await fetch('https://ppbbqchycxffsfavtsjp.supabase.co/functions/v1/toggle-premium', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'check-status', userId: p.id }),
          });
          const data = await res.json();
          return { userId: p.id, plan: data?.plan || 'free', activation_code: data?.activation_code || null };
        });
        const premiumResults = await Promise.all(premiumPromises);
        for (const r of premiumResults) {
          premiumMap[r.userId] = { plan: r.plan, activation_code: r.activation_code };
        }
      } catch (e) {
        console.warn('Failed to fetch premium status:', e);
      }

      const clientsData: ClientData[] = clientProfiles.map(profile => {
        const coachId = (profile as any).coach_id as string | null;
        const coachName = coachId ? coachProfileMap[coachId] : null;
        const coachNames = coachName ? [coachName] : [];

        const userCheckins = checkinsData?.filter(c => c.user_id === profile.id) || [];
        const lastCheckin = userCheckins[0] || null;
        const premium = premiumMap[profile.id];

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || profile.email,
          phone_number: profile.phone_number || null,
          need_profile: (profile as any).need_profile || null,
          referral_source: (profile as any).referral_source || null,
          coach_id: coachId,
          coach_names: coachNames,
          is_premium: premium?.plan === 'premium' || false,
          premium_code: premium?.activation_code || null,
          streak: calculateStreak(userCheckins),
          last_checkin: lastCheckin ? {
            date: lastCheckin.date,
            recovery: lastCheckin.recovery,
            nutrition_adherence: lastCheckin.nutrition_adherence,
            energy: lastCheckin.energy,
            mindset: lastCheckin.mindset,
            two_percent_edge: lastCheckin.two_percent_edge,
          } : null,
          status: calculateStatus(lastCheckin ? {
            date: lastCheckin.date,
            recovery: lastCheckin.recovery,
            nutrition_adherence: lastCheckin.nutrition_adherence,
            energy: lastCheckin.energy,
            mindset: lastCheckin.mindset,
            two_percent_edge: lastCheckin.two_percent_edge,
          } : null),
        };
      });

      // Filter by collaborator: mostra solo i propri clienti (coach_id === user.id)
      let filteredClients = clientsData;

      if (isCollaborator && !isSuperAdmin && !isAdmin) {
        filteredClients = clientsData.filter(client => client.coach_id === user.id);
      }

      setClients(filteredClients);
      console.log('useAdminClients - Final filtered clients:', filteredClients.length);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user, isAdmin, isCollaborator, isSuperAdmin]);

  // Real-time subscription for daily_checkins updates
  useEffect(() => {
    if (!user || (!isAdmin && !isCollaborator && !isSuperAdmin)) return;

    let debounceTimer: ReturnType<typeof setTimeout>;
    const channel = supabase
      .channel('admin-checkins-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'daily_checkins' },
        () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => fetchClients(), 2000);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, isCollaborator, isSuperAdmin]);

  return {
    clients,
    loading,
    refetch: fetchClients,
  };
};
