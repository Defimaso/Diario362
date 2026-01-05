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
  last_checkin: {
    date: string;
    recovery: number | null;
    nutrition_adherence: boolean | null;
    energy: number | null;
    mindset: number | null;
    two_percent_edge: string | null;
  } | null;
  status: 'green' | 'yellow' | 'red';
}

type CoachName = 'Martina' | 'Michela' | 'Cristina' | 'Michela_Martina';

export const useAdminClients = () => {
  const { user, isAdmin, isCollaborator, isSuperAdmin } = useAuth();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);

  const getCollaboratorCoachName = (email: string): CoachName | null => {
    switch (email) {
      case 'martina@362gradi.it': return 'Martina';
      case 'michela@362gradi.it': return 'Michela';
      case 'cristina@362gradi.it': return 'Cristina';
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

    const sortedDates = checkins
      .map(c => c.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (sortedDates.includes(dateStr)) {
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
      // Fetch all profiles with client role
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Filter only clients
      const clientUserIds = rolesData
        ?.filter(r => r.role === 'client')
        .map(r => r.user_id) || [];

      const clientProfiles = profilesData?.filter(p => clientUserIds.includes(p.id)) || [];

      // Fetch coach assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('coach_assignments')
        .select('*');

      if (assignmentsError) throw assignmentsError;

      // Fetch all checkins
      const { data: checkinsData, error: checkinsError } = await supabase
        .from('daily_checkins')
        .select('*')
        .order('date', { ascending: false });

      if (checkinsError) throw checkinsError;

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
          coach_names: coachNames,
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
          if (collaboratorCoachName === 'Martina') {
            return client.coach_names.includes('Martina') || client.coach_names.includes('Michela_Martina');
          }
          if (collaboratorCoachName === 'Michela') {
            return client.coach_names.includes('Michela') || client.coach_names.includes('Michela_Martina');
          }
          return client.coach_names.includes(collaboratorCoachName);
        });
      }

      setClients(filteredClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user, isAdmin, isCollaborator, isSuperAdmin]);

  return {
    clients,
    loading,
    refetch: fetchClients,
  };
};
