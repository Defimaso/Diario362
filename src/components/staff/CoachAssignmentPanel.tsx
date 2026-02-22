import { useState, useEffect } from 'react';
import { UserCheck, UserX, Loader2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ClientData } from '@/hooks/useAdminClients';
import { cn } from '@/lib/utils';
import { getAvailableCoaches } from '@/lib/staffWhitelist';

const SUPA_URL = 'https://ppbbqchycxffsfavtsjp.supabase.co';
const SUPA_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Coach {
  id: string;
  name: string;
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

  // Carica coach da whitelist (bypass RPC)
  useEffect(() => {
    getAvailableCoaches(supabase).then(c => setCoaches(c));
  }, []);

  // Carica assegnazioni attuali (coach_id da profiles) via REST
  useEffect(() => {
    const ids = clients.map(c => c.id);
    if (!ids.length) return;
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      const idList = ids.map(id => `id=eq.${id}`).join(',');
      fetch(`${SUPA_URL}/rest/v1/profiles?select=id,coach_id&or=(${idList})`, {
        headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${token}` },
      }).then(r => r.json()).then((data: any[]) => {
        if (!Array.isArray(data)) return;
        const map: Record<string, string | null> = {};
        data.forEach((p: any) => { map[p.id] = p.coach_id || null; });
        setAssignments(map);
      }).catch(() => {});
    });
  }, [clients]);

  const handleAssign = async (clientId: string, coachId: string) => {
    setLoadingCoach(clientId);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) { setLoadingCoach(null); return; }
    const res = await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${clientId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ coach_id: coachId }),
    });
    if (res.ok) {
      setAssignments(prev => ({ ...prev, [clientId]: coachId }));
      toast({ title: 'Coach assegnato', description: coaches.find(c => c.id === coachId)?.name });
      onRefresh();
    } else {
      const err = await res.json().catch(() => ({}));
      toast({ variant: 'destructive', title: 'Errore', description: (err as any).message || 'Errore sconosciuto' });
    }
    setLoadingCoach(null);
  };

  const handleRemove = async (clientId: string) => {
    setLoadingCoach(clientId);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) { setLoadingCoach(null); return; }
    const res = await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${clientId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ coach_id: null }),
    });
    if (res.ok) {
      setAssignments(prev => ({ ...prev, [clientId]: null }));
      toast({ title: 'Coach rimosso' });
      onRefresh();
    } else {
      const err = await res.json().catch(() => ({}));
      toast({ variant: 'destructive', title: 'Errore', description: (err as any).message || 'Errore' });
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
