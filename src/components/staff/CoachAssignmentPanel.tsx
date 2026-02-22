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

    console.log('[CoachAssign] assegno:', { clientId, coachId, coachEmail, coachEnumName });

    let legacyOk = false;
    let profileOk = false;

    // 1) coach_assignments: DELETE poi INSERT (evita problemi unique constraint)
    if (coachEnumName && VALID_COACH_ENUMS.includes(coachEnumName)) {
      const { error: delErr } = await (supabase as any)
        .from('coach_assignments')
        .delete()
        .eq('client_id', clientId);
      console.log('[CoachAssign] delete legacy:', delErr || 'OK');

      const { error: insErr } = await (supabase as any)
        .from('coach_assignments')
        .insert({ client_id: clientId, coach_name: coachEnumName });
      if (insErr) {
        console.error('[CoachAssign] insert legacy ERRORE:', insErr);
        toast({ variant: 'destructive', title: 'Errore coach_assignments', description: insErr.message });
      } else {
        legacyOk = true;
        console.log('[CoachAssign] coach_assignments INSERT OK:', coachEnumName);
      }
    } else {
      console.warn('[CoachAssign] enum non trovato per coach:', coachEmail, '→', coachEnumName);
    }

    // 2) profiles.coach_id (nuovo sistema — potrebbe fallire per RLS, non bloccante)
    const { error: profileError, data: profileData } = await (supabase as any)
      .from('profiles')
      .update({ coach_id: coachId })
      .eq('id', clientId)
      .select('id, coach_id');
    if (profileError) {
      console.error('[CoachAssign] profiles.coach_id ERRORE:', profileError);
    } else if (!profileData || profileData.length === 0) {
      console.warn('[CoachAssign] profiles.coach_id: 0 righe aggiornate (RLS bloccato?)');
    } else {
      profileOk = true;
      console.log('[CoachAssign] profiles.coach_id OK:', profileData);
    }

    if (legacyOk || profileOk) {
      setAssignments(prev => ({ ...prev, [clientId]: coachId }));
      toast({
        title: 'Coach assegnato ✓',
        description: `${coach?.name}${!profileOk ? ' (legacy only)' : ''}`,
      });
      onRefresh();
    } else {
      toast({
        variant: 'destructive',
        title: 'Nessuna scrittura riuscita',
        description: 'Apri DevTools → Console per vedere l\'errore esatto',
      });
    }
    setLoadingCoach(null);
  };

  const handleRemove = async (clientId: string) => {
    setLoadingCoach(clientId);

    // 1) Elimina da coach_assignments (legacy)
    const { error: delErr } = await (supabase as any)
      .from('coach_assignments')
      .delete()
      .eq('client_id', clientId);
    if (delErr) console.error('[CoachAssign] remove legacy ERRORE:', delErr);
    else console.log('[CoachAssign] remove legacy OK');

    // 2) Rimuovi profiles.coach_id (nuovo sistema)
    const { error: profileErr } = await (supabase as any)
      .from('profiles')
      .update({ coach_id: null })
      .eq('id', clientId);
    if (profileErr) console.error('[CoachAssign] remove profile ERRORE:', profileErr);
    else console.log('[CoachAssign] remove profile OK');

    setAssignments(prev => ({ ...prev, [clientId]: null }));
    toast({ title: 'Coach rimosso' });
    onRefresh();
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
