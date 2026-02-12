import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Flame, Crown, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function LeaderboardView() {
  const { user } = useAuth();
  const { entries, myRank, isOptedIn, loading, optIn, optOut } = useLeaderboard();
  const [displayName, setDisplayName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  if (loading) return null;

  const handleOptIn = async () => {
    if (!displayName.trim() && !isAnonymous) return;
    setIsJoining(true);
    await optIn(isAnonymous ? 'Anonimo' : displayName, isAnonymous);
    setIsJoining(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="card-elegant p-5 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold">Classifica</h3>
        </div>
        {myRank && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
            #{myRank}
          </span>
        )}
      </div>

      {/* Opt-in */}
      {!isOptedIn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 rounded-xl bg-muted/50 space-y-3"
        >
          <p className="text-sm text-muted-foreground">
            Partecipa alla classifica per confrontarti con gli altri! La partecipazione e' opzionale.
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              {isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>Anonimo</span>
            </div>
            <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>
          {!isAnonymous && (
            <Input
              placeholder="Il tuo nome"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          )}
          <Button
            className="w-full"
            onClick={handleOptIn}
            disabled={isJoining || (!isAnonymous && !displayName.trim())}
          >
            {isJoining ? 'Caricamento...' : 'Partecipa'}
          </Button>
        </motion.div>
      )}

      {/* Leaderboard List */}
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nessun partecipante ancora. Sii il primo!
        </p>
      ) : (
        <div className="space-y-2">
          {entries.slice(0, 15).map((entry) => (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl",
                entry.user_id === user?.id ? "bg-primary/5 border border-primary/20" : "bg-muted/30"
              )}
            >
              <div className="flex items-center gap-3">
                {getRankIcon(entry.rank)}
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    entry.user_id === user?.id && "text-primary"
                  )}>
                    {entry.display_name}
                    {entry.user_id === user?.id && ' (tu)'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.total_checkins} check-in totali
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <Flame className="w-4 h-4 text-orange-500" />
                {entry.streak}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Opt-out */}
      {isOptedIn && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 text-xs text-muted-foreground"
          onClick={optOut}
        >
          Lascia la classifica
        </Button>
      )}
    </div>
  );
}
