import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Clock, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useChallenges, Challenge, ChallengeParticipant } from '@/hooks/useChallenges';
import { cn } from '@/lib/utils';

export default function ChallengeCard() {
  const { challenges, loading, joinChallenge, fetchLeaderboard } = useChallenges();
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<ChallengeParticipant[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  if (loading) return null;
  if (challenges.length === 0) return null;

  const toggleLeaderboard = async (challengeId: string) => {
    if (expandedChallenge === challengeId) {
      setExpandedChallenge(null);
      return;
    }
    setExpandedChallenge(challengeId);
    setLoadingLeaderboard(true);
    const lb = await fetchLeaderboard(challengeId);
    setLeaderboard(lb);
    setLoadingLeaderboard(false);
  };

  const handleJoin = async (challengeId: string) => {
    await joinChallenge(challengeId);
  };

  return (
    <div className="space-y-3">
      {challenges.map((challenge) => {
        const progressPercent = challenge.target_value > 0
          ? Math.min(100, Math.round(((challenge.my_progress || 0) / challenge.target_value) * 100))
          : 0;
        const isJoined = (challenge.my_progress || 0) > 0 || challenge.my_completed;
        const isExpanded = expandedChallenge === challenge.id;

        return (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "card-elegant rounded-2xl overflow-hidden",
              challenge.my_completed && "border border-primary/30"
            )}
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{challenge.badge_emoji}</span>
                  <div>
                    <h4 className="font-semibold text-sm">{challenge.title}</h4>
                    {challenge.description && (
                      <p className="text-xs text-muted-foreground">{challenge.description}</p>
                    )}
                  </div>
                </div>
                {challenge.my_completed && (
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                )}
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {challenge.total_participants} partecipanti
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {challenge.days_left} giorni rimasti
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  {challenge.target_value} target
                </span>
              </div>

              {/* Progress */}
              {isJoined && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">{challenge.my_progress}/{challenge.target_value}</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {!isJoined && !challenge.my_completed && (challenge.days_left || 0) > 0 && (
                  <Button
                    size="sm"
                    onClick={() => handleJoin(challenge.id)}
                    className="flex-1"
                  >
                    Partecipa
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleLeaderboard(challenge.id)}
                  className="flex items-center gap-1"
                >
                  Classifica
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              </div>
            </div>

            {/* Expanded Leaderboard */}
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="border-t border-border"
              >
                <div className="p-4 space-y-2">
                  {loadingLeaderboard ? (
                    <p className="text-xs text-muted-foreground text-center py-2">Caricamento...</p>
                  ) : leaderboard.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">Nessun partecipante</p>
                  ) : (
                    leaderboard.slice(0, 10).map((p, i) => (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                            i === 0 ? "bg-amber-500/20 text-amber-500" :
                            i === 1 ? "bg-gray-400/20 text-gray-400" :
                            i === 2 ? "bg-orange-600/20 text-orange-600" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {i + 1}
                          </span>
                          <span className="truncate">{p.user_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{p.progress}/{challenge.target_value}</span>
                          {p.completed_at && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
