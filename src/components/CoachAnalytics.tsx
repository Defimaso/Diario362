import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Target, Activity, AlertTriangle, Flame, Calendar } from 'lucide-react';
import { ClientData } from '@/hooks/useAdminClients';
import { cn } from '@/lib/utils';

interface CoachAnalyticsProps {
  clients: ClientData[];
  coachFilter?: string;
}

export default function CoachAnalytics({ clients, coachFilter }: CoachAnalyticsProps) {
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const totalClients = clients.length;

    // Today's check-ins
    const checkedInToday = clients.filter(c => c.last_checkin?.date === today).length;
    const completionRate = totalClients > 0 ? Math.round((checkedInToday / totalClients) * 100) : 0;

    // Streaks
    const avgStreak = totalClients > 0
      ? Math.round(clients.reduce((sum, c) => sum + c.streak, 0) / totalClients * 10) / 10
      : 0;
    const maxStreak = clients.reduce((max, c) => Math.max(max, c.streak), 0);
    const activeClients = clients.filter(c => c.streak > 0).length;

    // Scores
    const clientsWithCheckin = clients.filter(c => c.last_checkin);
    const avgRecovery = clientsWithCheckin.length > 0
      ? Math.round(clientsWithCheckin.reduce((sum, c) => sum + (c.last_checkin?.recovery || 0), 0) / clientsWithCheckin.length * 10) / 10
      : 0;
    const avgEnergy = clientsWithCheckin.length > 0
      ? Math.round(clientsWithCheckin.reduce((sum, c) => sum + (c.last_checkin?.energy || 0), 0) / clientsWithCheckin.length * 10) / 10
      : 0;
    const avgMindset = clientsWithCheckin.length > 0
      ? Math.round(clientsWithCheckin.reduce((sum, c) => sum + (c.last_checkin?.mindset || 0), 0) / clientsWithCheckin.length * 10) / 10
      : 0;

    // Risk analysis
    const atRiskClients = clients.filter(c => {
      if (!c.last_checkin?.date) return true;
      const lastDate = new Date(c.last_checkin.date);
      const now = new Date();
      const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince >= 3;
    });

    const lowMindsetClients = clients.filter(c =>
      c.last_checkin?.mindset !== null && (c.last_checkin?.mindset || 0) < 5
    );

    // Status distribution
    const statusDist = {
      green: clients.filter(c => c.status === 'green').length,
      yellow: clients.filter(c => c.status === 'yellow').length,
      red: clients.filter(c => c.status === 'red').length,
    };

    // Quiz profile distribution
    const profileDist = new Map<string, number>();
    clients.forEach(c => {
      if (c.need_profile) {
        profileDist.set(c.need_profile, (profileDist.get(c.need_profile) || 0) + 1);
      }
    });

    // Referral sources
    const referralDist = new Map<string, number>();
    clients.forEach(c => {
      if (c.referral_source) {
        referralDist.set(c.referral_source, (referralDist.get(c.referral_source) || 0) + 1);
      }
    });

    return {
      totalClients, checkedInToday, completionRate,
      avgStreak, maxStreak, activeClients,
      avgRecovery, avgEnergy, avgMindset,
      atRiskClients, lowMindsetClients,
      statusDist, profileDist, referralDist,
    };
  }, [clients]);

  const profileEmojis: Record<string, string> = {
    significance: '⭐', intelligence: '🧠', acceptance: '🤝',
    approval: '🏆', power: '💪', pity: '🔥',
  };

  const profileNames: Record<string, string> = {
    significance: 'Protagonista', intelligence: 'Stratega', acceptance: 'Connettore',
    approval: 'Eccellente', power: 'Leader', pity: 'Resiliente',
  };

  return (
    <div className="space-y-4">
      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard
          icon={<Users className="w-4 h-4 text-primary" />}
          value={stats.activeClients}
          label="Clienti attivi"
          subtext={`su ${stats.totalClients} totali`}
        />
        <StatCard
          icon={<Target className="w-4 h-4 text-green-500" />}
          value={`${stats.completionRate}%`}
          label="Completamento oggi"
          subtext={`${stats.checkedInToday}/${stats.totalClients}`}
          color={stats.completionRate >= 70 ? 'text-green-500' : stats.completionRate >= 40 ? 'text-amber-500' : 'text-red-500'}
        />
        <StatCard
          icon={<Flame className="w-4 h-4 text-orange-500" />}
          value={stats.avgStreak}
          label="Streak medio"
          subtext={`max: ${stats.maxStreak}`}
        />
        <StatCard
          icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
          value={stats.atRiskClients.length}
          label="A rischio"
          subtext="3+ giorni assenti"
          color={stats.atRiskClients.length > 0 ? 'text-red-500' : 'text-green-500'}
        />
      </div>

      {/* KPI Cards Row 2 - Averages */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          icon={<Activity className="w-4 h-4 text-blue-400" />}
          value={stats.avgRecovery}
          label="Recovery medio"
          color={stats.avgRecovery >= 7 ? 'text-green-500' : stats.avgRecovery >= 5 ? 'text-amber-500' : 'text-red-500'}
        />
        <StatCard
          icon={<Activity className="w-4 h-4 text-yellow-400" />}
          value={stats.avgEnergy}
          label="Energy media"
          color={stats.avgEnergy >= 7 ? 'text-green-500' : stats.avgEnergy >= 5 ? 'text-amber-500' : 'text-red-500'}
        />
        <StatCard
          icon={<Activity className="w-4 h-4 text-purple-400" />}
          value={stats.avgMindset}
          label="Mindset medio"
          color={stats.avgMindset >= 7 ? 'text-green-500' : stats.avgMindset >= 5 ? 'text-amber-500' : 'text-red-500'}
        />
      </div>

      {/* At-risk clients list */}
      {stats.atRiskClients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elegant rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h4 className="text-sm font-semibold text-red-500">Clienti a Rischio ({stats.atRiskClients.length})</h4>
          </div>
          <div className="space-y-2">
            {stats.atRiskClients.slice(0, 5).map(c => {
              const days = c.last_checkin?.date
                ? Math.floor((new Date().getTime() - new Date(c.last_checkin.date).getTime()) / (1000 * 60 * 60 * 24))
                : 999;
              return (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{c.full_name}</span>
                  <span className="text-xs text-red-500 font-medium shrink-0 ml-2">
                    {days === 999 ? 'Mai' : `${days}gg`} senza check-in
                  </span>
                </div>
              );
            })}
            {stats.atRiskClients.length > 5 && (
              <p className="text-xs text-muted-foreground">+{stats.atRiskClients.length - 5} altri</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Low mindset clients */}
      {stats.lowMindsetClients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elegant rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-semibold">Mindset Basso ({stats.lowMindsetClients.length})</h4>
          </div>
          <div className="space-y-2">
            {stats.lowMindsetClients.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{c.full_name}</span>
                <span className="text-xs text-purple-400 font-medium shrink-0 ml-2">
                  Mindset: {c.last_checkin?.mindset}/10
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Profile Distribution */}
      {stats.profileDist.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elegant rounded-xl p-4"
        >
          <h4 className="text-sm font-semibold mb-3">Profili 6-Needs</h4>
          <div className="grid grid-cols-3 gap-2">
            {Array.from(stats.profileDist.entries()).map(([profile, count]) => (
              <div key={profile} className="text-center p-2 rounded-lg bg-muted/50">
                <span className="text-lg">{profileEmojis[profile] || '?'}</span>
                <div className="text-sm font-bold tabular-nums">{count}</div>
                <div className="text-[10px] text-muted-foreground">{profileNames[profile] || profile}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Referral Sources */}
      {stats.referralDist.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elegant rounded-xl p-4"
        >
          <h4 className="text-sm font-semibold mb-3">Provenienza Clienti</h4>
          <div className="space-y-2">
            {Array.from(stats.referralDist.entries()).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <span className="text-sm capitalize">{source}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-primary/20 rounded-full overflow-hidden" style={{ width: '80px' }}>
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.round((count / stats.totalClients) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium tabular-nums">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label, subtext, color }: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  subtext?: string;
  color?: string;
}) {
  return (
    <div className="card-elegant rounded-xl p-3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <div className={cn("text-lg font-bold tabular-nums", color)}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      {subtext && <div className="text-[10px] text-muted-foreground/60">{subtext}</div>}
    </div>
  );
}
