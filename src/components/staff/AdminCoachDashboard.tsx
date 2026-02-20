import { useMemo, useState } from 'react';
import { ClientData } from '@/hooks/useAdminClients';
import { isClientAtRisk } from '@/lib/badges';
import { Users, CheckCircle2, AlertTriangle, XCircle, TrendingUp, Activity, Target, Flame } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Props {
  clients: ClientData[];
}

const COACHES = ['Ilaria', 'Marco', 'Martina', 'Michela', 'Cristina'] as const;
type CoachName = typeof COACHES[number];

const COACH_COLORS: Record<CoachName, string> = {
  Ilaria:  'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  Marco:   'text-blue-400 border-blue-500/40 bg-blue-500/10',
  Martina: 'text-violet-400 border-violet-500/40 bg-violet-500/10',
  Michela: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
  Cristina:'text-rose-400 border-rose-500/40 bg-rose-500/10',
};

const COACH_DOT: Record<CoachName, string> = {
  Ilaria:  'bg-emerald-400',
  Marco:   'bg-blue-400',
  Martina: 'bg-violet-400',
  Michela: 'bg-amber-400',
  Cristina:'bg-rose-400',
};

function getCoachClients(clients: ClientData[], coach: CoachName): ClientData[] {
  return clients.filter(c => c.coach_names.some(n => n.includes(coach)));
}

function avg(values: (number | null | undefined)[]): string {
  const valid = values.filter((v): v is number => v != null);
  if (!valid.length) return '—';
  return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1);
}

interface CoachStats {
  total: number;
  green: number;
  yellow: number;
  red: number;
  checkedInToday: number;
  completionRate: number;
  avgRecovery: string;
  avgEnergy: string;
  avgMindset: string;
  avgStreak: string;
  atRisk: number;
  premium: number;
}

function computeStats(clients: ClientData[]): CoachStats {
  const today = new Date().toISOString().split('T')[0];
  const green  = clients.filter(c => c.status === 'green').length;
  const yellow = clients.filter(c => c.status === 'yellow').length;
  const red    = clients.filter(c => c.status === 'red').length;
  const checkedInToday = clients.filter(c => c.last_checkin?.date === today).length;
  const withCheckin = clients.filter(c => c.last_checkin);
  return {
    total: clients.length,
    green, yellow, red,
    checkedInToday,
    completionRate: clients.length ? Math.round((checkedInToday / clients.length) * 100) : 0,
    avgRecovery: avg(withCheckin.map(c => c.last_checkin?.recovery)),
    avgEnergy:   avg(withCheckin.map(c => c.last_checkin?.energy)),
    avgMindset:  avg(withCheckin.map(c => c.last_checkin?.mindset)),
    avgStreak:   avg(clients.map(c => c.streak)),
    atRisk:  clients.filter(c => isClientAtRisk(c.last_checkin?.date ?? null)).length,
    premium: clients.filter(c => c.is_premium).length,
  };
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-card rounded-xl p-3 border border-border text-center">
      <Icon className={cn('w-4 h-4 mx-auto mb-1', color)} />
      <div className="text-lg font-bold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground leading-tight">{label}</div>
    </div>
  );
}

function ClientRow({ client }: { client: ClientData }) {
  const today = new Date().toISOString().split('T')[0];
  const checkedToday = client.last_checkin?.date === today;
  const atRisk = isClientAtRisk(client.last_checkin?.date ?? null);

  return (
    <div className={cn(
      'flex items-center gap-2 py-2 px-3 rounded-lg text-sm border',
      atRisk ? 'border-red-500/30 bg-red-500/5' : 'border-border bg-card/50'
    )}>
      <span className={cn('w-2 h-2 rounded-full shrink-0', {
        'bg-green-400': client.status === 'green',
        'bg-yellow-400': client.status === 'yellow',
        'bg-red-400': client.status === 'red',
      })} />
      <span className="font-medium truncate flex-1 min-w-0">{client.full_name || client.email}</span>
      {client.is_premium && (
        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-medium shrink-0">PRO</span>
      )}
      {atRisk && (
        <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-medium shrink-0">A RISCHIO</span>
      )}
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
        <Flame className="w-3 h-3" />
        {client.streak}d
      </div>
      {checkedToday ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-red-400/50 shrink-0" />
      )}
    </div>
  );
}

function CoachPanel({ coach, clients }: { coach: CoachName; clients: ClientData[] }) {
  const stats = useMemo(() => computeStats(clients), [clients]);
  const colorClass = COACH_COLORS[coach];

  if (clients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Nessun cliente assegnato a {coach}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status summary */}
      <div className="grid grid-cols-4 gap-2">
        <div className={cn('rounded-xl p-3 border text-center', colorClass)}>
          <Users className="w-4 h-4 mx-auto mb-1" />
          <div className="text-xl font-bold">{stats.total}</div>
          <div className="text-[10px]">Totale</div>
        </div>
        <StatCard label="Verdi" value={stats.green}  icon={CheckCircle2} color="text-green-400" />
        <StatCard label="Gialli" value={stats.yellow} icon={AlertTriangle} color="text-yellow-400" />
        <StatCard label="Rossi"  value={stats.red}    icon={XCircle}      color="text-red-400" />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard label="Check oggi"    value={`${stats.completionRate}%`} icon={Target}    color="text-primary" />
        <StatCard label="Avg Recovery"  value={stats.avgRecovery}          icon={Activity}  color="text-blue-400" />
        <StatCard label="Avg Energia"   value={stats.avgEnergy}            icon={TrendingUp} color="text-emerald-400" />
        <StatCard label="Avg Streak"    value={stats.avgStreak}            icon={Flame}     color="text-orange-400" />
      </div>

      {/* Extra pills */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
          ⭐ {stats.premium} premium
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
          ⚠️ {stats.atRisk} a rischio
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
          ✅ {stats.checkedInToday}/{stats.total} check oggi
        </span>
      </div>

      {/* Client list */}
      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
        {clients
          .sort((a, b) => {
            // At-risk first, then by status
            const risk = (isClientAtRisk(b.last_checkin?.date ?? null) ? 1 : 0) - (isClientAtRisk(a.last_checkin?.date ?? null) ? 1 : 0);
            if (risk !== 0) return risk;
            const order = { red: 0, yellow: 1, green: 2 };
            return order[a.status] - order[b.status];
          })
          .map(client => <ClientRow key={client.id} client={client} />)
        }
      </div>
    </div>
  );
}

export default function AdminCoachDashboard({ clients }: Props) {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const coachData = useMemo(() =>
    Object.fromEntries(
      COACHES.map(c => [c, getCoachClients(clients, c)])
    ) as Record<CoachName, ClientData[]>,
    [clients]
  );

  const overallStats = useMemo(() => computeStats(clients), [clients]);

  return (
    <div className="bg-card border border-primary/20 rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Dashboard Coach</h3>
        <span className="text-xs text-muted-foreground ml-auto">Solo tu vedi questa sezione</span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-6 mb-4 h-auto">
          <TabsTrigger value="overview" className="text-[11px] py-1.5">
            Overview
          </TabsTrigger>
          {COACHES.map(coach => (
            <TabsTrigger key={coach} value={coach} className="text-[11px] py-1.5 flex items-center gap-1">
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', COACH_DOT[coach])} />
              {coach}
              <span className="ml-0.5 text-[10px] text-muted-foreground">({coachData[coach].length})</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {COACHES.map(coach => {
              const s = computeStats(coachData[coach]);
              const today = new Date().toISOString().split('T')[0];
              return (
                <button
                  key={coach}
                  onClick={() => setActiveTab(coach)}
                  className={cn(
                    'rounded-xl p-3 border text-left transition-all hover:scale-[1.02] cursor-pointer',
                    COACH_COLORS[coach]
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={cn('w-2 h-2 rounded-full', COACH_DOT[coach])} />
                    <span className="text-xs font-semibold">{coach}</span>
                  </div>
                  <div className="text-2xl font-bold tabular-nums mb-1">{s.total}</div>
                  <div className="space-y-0.5 text-[10px] opacity-80">
                    <div className="flex justify-between">
                      <span>Check oggi</span>
                      <span className="font-medium">{s.completionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>A rischio</span>
                      <span className={cn('font-medium', s.atRisk > 0 ? 'text-red-400' : '')}>{s.atRisk}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Premium</span>
                      <span className="font-medium">{s.premium}</span>
                    </div>
                    <div className="flex gap-1 pt-1">
                      <span className="bg-green-500/20 text-green-400 px-1 rounded">{s.green}✓</span>
                      <span className="bg-yellow-500/20 text-yellow-400 px-1 rounded">{s.yellow}~</span>
                      <span className="bg-red-500/20 text-red-400 px-1 rounded">{s.red}✗</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Team totals */}
          <div className="mt-4 grid grid-cols-4 gap-2 pt-3 border-t border-border">
            <StatCard label="Team totale"   value={overallStats.total}          icon={Users}      color="text-primary" />
            <StatCard label="A rischio"     value={overallStats.atRisk}         icon={AlertTriangle} color="text-red-400" />
            <StatCard label="Premium"       value={overallStats.premium}        icon={CheckCircle2} color="text-amber-400" />
            <StatCard label="Check oggi"    value={`${overallStats.completionRate}%`} icon={Target} color="text-green-400" />
          </div>
        </TabsContent>

        {/* Per-coach tabs */}
        {COACHES.map(coach => (
          <TabsContent key={coach} value={coach} className="mt-0">
            <CoachPanel coach={coach} clients={coachData[coach]} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
