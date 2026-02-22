import { useState, useEffect } from 'react';
import { UserCheck, UserX, Loader2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ClientData } from '@/hooks/useAdminClients';
import { cn } from '@/lib/utils';
import { getAvailableCoaches, STAFF_WHITELIST } from '@/lib/staffWhitelist';

// Valori enum validi per coach_assignments.coach_name
const VALID_COACH_ENUMS = [
  "Martina","Michela","Cristina","Michela_Martina",
  "Ilaria","Ilaria_Marco","Ilaria_Marco_Michela","Ilaria_Michela",
  "Ilaria_Martina","Martina_Michela","Marco"
];

interface Coach {
  id: string;
  name: string;
  email?: string;
}

interface CoachAssignmentPanelProps {
  clients: ClientData[];
  onRefresh: () => void;
}

export default function CoachAssignmentPanel({ clients, onRefresh }: CoachAssignmentPanelProps) {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string | null>>({});
  const [loadingCoach, setLoadingCoach] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  // Carica coach da whitelist
  useEffect(() => {
    getAvailableCoaches(supabase).then(c => {
      console.log('[CoachPanel] coaches caricati:', c);
      setCoaches(c);
    });
  }, []);

  // Carica assegnazioni attuali da coach_assignments (legacy, più affidabile)
  useEffect(() => {
    const ids = clients.map(c => c.id);
    if (!ids.length) return;

    // Legge coach_assignments (legacy) per costruire la mappa
    supabase
      .from('coach_assignments')
      .select('client_id, coach_name')
      .in('client_id', ids)
      .then(({ data: legacyData }) => {
        // Legge anche profiles.coach_id (nuovo sistema)
        supabase
          .from('profiles')
          .select('id, coach_id')
          .in('id', ids)
          .then(({ data: profileData }) => {
            const map: Record<string, string | null> = {};

            // Prima popola con profiles.coach_id (nuovo sistema ha priorità display)
            (profileData || []).forEach(p => { map[p.id] = p.coach_id || null; });

            // Per chi non ha coach_id nel profilo, cerca nell'assegnazione legacy
            // e poi riconcilia: se c'è in coach_assignments, mostra il coach corrispondente
            (legacyData || []).forEach(a => {
              if (!map[a.client_id]) {
                // Cerca l'UUID del coach dal nome enum
                const coachEntry = Object.entries(STAFF_WHITELIST).find(([, info]) =>
                  info.name.split(' / ')[0] === a.coach_name
                );
                if (coachEntry) {
                  const coachProfile = coaches.find(c => c.email === coachEntry[0]);
                  if (coachProfile) map[a.client_id] = coachProfile.id;
                }
              }
            });

            console.log('[CoachPanel] assignments mappa:', map);
            setAssignments(map);
          });
      });
  }, [clients, coaches]);

  const handleAssign = async (clientId: string, coachId: string) => {
    setLoadingCoach(clientId);

    const coach = coaches.find(c => c.id === coachId);
    const coachEmail = (coach as any)?.email as string | undefined;
    const whitelistName = coachEmail ? STAFF_WHITELIST[coachEmail]?.name : undefined;
    const coachEnumName = whitelistName ? whitelistName.split(' / ')[0] : undefined;

    console.log('[CoachAssign] RPC assign_coach:', { clientId, coachId, coachEnumName });

    // Usa RPC SECURITY DEFINER — bypassa RLS completamente
    const { data, error } = await (supabase as any).rpc('assign_coach', {
      p_client_id: clientId,
      p_coach_id: coachId,
      p_coach_name: (coachEnumName && VALID_COACH_ENUMS.includes(coachEnumName)) ? coachEnumName : '',
    });

    console.log('[CoachAssign] RPC result:', data, error);

    if (error) {
      console.error('[CoachAssign] RPC error:', error);
      toast({ variant: 'destructive', title: 'Errore assegnazione', description: error.message });
    } else if (data && data.success === false) {
      console.error('[CoachAssign] RPC DB error:', data.error);
      toast({ variant: 'destructive', title: 'Errore DB', description: data.error });
    } else {
      setAssignments(prev => ({ ...prev, [clientId]: coachId }));
      toast({ title: 'Coach assegnato ✓', description: coach?.name });
      onRefresh();
    }
    setLoadingCoach(null);
  };

  const handleRemove = async (clientId: string) => {
    setLoadingCoach(clientId);

    console.log('[CoachAssign] RPC remove_coach:', clientId);

    const { data, error } = await (supabase as any).rpc('remove_coach', {
      p_client_id: clientId,
    });

    console.log('[CoachAssign] RPC remove result:', data, error);

    if (error) {
      console.error('[CoachAssign] RPC remove error:', error);
      toast({ variant: 'destructive', title: 'Errore rimozione', description: error.message });
    } else {
      setAssignments(prev => ({ ...prev, [clientId]: null }));
      toast({ title: 'Coach rimosso' });
      onRefresh();
    }
    setLoadingCoach(null);
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return (c.full_name || c.email).toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cerca cliente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Lista clienti */}
      <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">Nessun cliente trovato</p>
        )}
        {filtered.map(client => {
          const assignedCoachId = assignments[client.id];
          const assignedCoach = coaches.find(c => c.id === assignedCoachId);
          const isLoading = loadingCoach === client.id;

          return (
            <div
              key={client.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card/50"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                {(client.full_name || client.email).charAt(0).toUpperCase()}
              </div>

              {/* Info cliente */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{client.full_name || client.email}</p>
                {assignedCoach ? (
                  <p className="text-xs text-primary flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    {assignedCoach.name}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <UserX className="w-3 h-3" />
                    Nessun coach
                  </p>
                )}
              </div>

              {/* Controlli */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <select
                      value={assignedCoachId || ''}
                      onChange={e => {
                        if (e.target.value) handleAssign(client.id, e.target.value);
                      }}
                      className={cn(
                        'text-xs rounded-lg border border-border bg-background px-2 py-1.5 pr-6 appearance-none cursor-pointer',
                        'focus:outline-none focus:ring-1 focus:ring-primary/50',
                        assignedCoachId ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      <option value="">Assegna coach</option>
                      {coaches.map(coach => (
                        <option key={coach.id} value={coach.id}>{coach.name}</option>
                      ))}
                    </select>
                    {assignedCoachId && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => handleRemove(client.id)}
                        title="Rimuovi coach"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
