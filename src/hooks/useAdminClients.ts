import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ClientData {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  coach_names: string[];
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

type CoachName = 'Ilaria' | 'Marco' | 'Martina' | 'Michela' | 'Cristina';

export const useAdminClients = () => {
  const { user, isAdmin, isCollaborator, isSuperAdmin } = useAuth();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);

  const getCollaboratorCoachName = (email: string): CoachName | null => {
    switch (email) {
      case 'ilaria@362gradi.it': return 'Ilaria';
      case 'marco@362gradi.it': return 'Marco';
      case 'martina@362gradi.it':
      case 'martina.fienga@hotmail.it': return 'Martina';
      case 'michela@362gradi.it':
      case 'michela.amadei@hotmail.it': return 'Michela';
      case 'cristina@362gradi.it':
      case 'spicri@gmail.com': return 'Cristina';
      default: return null;
    }
  };

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

      // Fetch coach assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('coach_assignments')
        .select('*');

      if (assignmentsError) throw assignmentsError;

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

      // Fetch subscription status for premium detection and pending codes
      const { data: subscriptionsData } = await supabase
        .from('user_subscriptions' as any)
        .select('user_id, plan, activation_code');

      const subsMap = new Map<string, { plan: string; activation_code: string | null }>();
      ((subscriptionsData as any[]) || []).forEach((s: any) => {
        subsMap.set(s.user_id, { plan: s.plan, activation_code: s.activation_code });
      });
      const premiumUserIds = new Set(
        [...subsMap.entries()].filter(([, v]) => v.plan === 'premium').map(([k]) => k)
      );

      // Build client data
      const collaboratorCoachName = user.email ? getCollaboratorCoachName(user.email) : null;

      const clientsData: ClientData[] = clientProfiles.map(profile => {
        const assignments = assignmentsData?.filter(a => a.client_id === profile.id) || [];
        const coachNames = assignments.map(a => a.coach_name);
        
        const userCheckins = checkinsData?.filter(c => c.user_id === profile.id) || [];
        const lastCheckin = userCheckins[0] || null;

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || profile.email,
          phone_number: profile.phone_number || null,
          need_profile: (profile as any).need_profile || null,
          referral_source: (profile as any).referral_source || null,
          coach_names: coachNames,
          is_premium: premiumUserIds.has(profile.id),
          premium_code: subsMap.get(profile.id)?.activation_code || null,
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

      // Filter by collaborator if not admin/superadmin
      let filteredClients = clientsData;
      
      if (isCollaborator && !isSuperAdmin && !isAdmin && collaboratorCoachName) {
        filteredClients = clientsData.filter(client => {
          // Check for Ilaria's assignments
          if (collaboratorCoachName === 'Ilaria') {
            return client.coach_names.some(name => 
              name === 'Ilaria' || 
              name === 'Ilaria_Marco' || 
              name === 'Ilaria_Marco_Michela' || 
              name === 'Ilaria_Michela' || 
              name === 'Ilaria_Martina'
            );
          }
          // Check for Marco's assignments
          if (collaboratorCoachName === 'Marco') {
            return client.coach_names.some(name => 
              name === 'Marco' || 
              name === 'Ilaria_Marco' || 
              name === 'Ilaria_Marco_Michela'
            );
          }
          // Check for Martina's assignments
          if (collaboratorCoachName === 'Martina') {
            return client.coach_names.some(name => 
              name === 'Martina' || 
              name === 'Michela_Martina' ||
              name === 'Ilaria_Martina' ||
              name === 'Martina_Michela'
            );
          }
          // Check for Michela's assignments
          if (collaboratorCoachName === 'Michela') {
            return client.coach_names.some(name => 
              name === 'Michela' || 
              name === 'Michela_Martina' ||
              name === 'Ilaria_Marco_Michela' ||
              name === 'Ilaria_Michela' ||
              name === 'Martina_Michela'
            );
          }
          // Cristina only has single assignment
          return client.coach_names.includes(collaboratorCoachName);
        });
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
