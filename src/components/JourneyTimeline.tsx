import { motion } from 'framer-motion';
import { MapPin, CheckCircle2, Circle, Trophy } from 'lucide-react';
import { useMilestones } from '@/hooks/useMilestones';

interface JourneyTimelineProps {
  streak: number;
  totalCheckins: number;
}

export default function JourneyTimeline({ streak, totalCheckins }: JourneyTimelineProps) {
  const { milestones, loading, achievedCount, totalCount, progressPercent, newlyAchieved, dismissNewMilestone } = useMilestones(streak, totalCheckins);

  if (loading) return null;

  return (
    <div className="card-elegant p-5 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Il Tuo Percorso</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {achievedCount}/{totalCount} traguardi
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted rounded-full mb-5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
        />
      </div>

      {/* New Milestone Animation */}
      {newlyAchieved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="mb-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-center cursor-pointer"
          onClick={dismissNewMilestone}
        >
          <div className="text-3xl mb-1">{newlyAchieved.emoji}</div>
          <p className="font-bold text-primary">{newlyAchieved.label}</p>
          <p className="text-xs text-muted-foreground">{newlyAchieved.description}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Tocca per chiudere</p>
        </motion.div>
      )}

      {/* Timeline */}
      <div className="space-y-0">
        {milestones.map((milestone, index) => (
          <div key={milestone.type} className="flex gap-3">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              {milestone.achieved ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                </motion.div>
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/30 shrink-0" />
              )}
              {index < milestones.length - 1 && (
                <div className={`w-0.5 h-8 ${milestone.achieved ? 'bg-primary/30' : 'bg-muted'}`} />
              )}
            </div>

            {/* Content */}
            <div className={`pb-6 ${!milestone.achieved ? 'opacity-40' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{milestone.emoji}</span>
                <span className="text-sm font-medium">{milestone.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{milestone.description}</p>
              {milestone.achieved_at && (
                <p className="text-[10px] text-primary mt-0.5">
                  {new Date(milestone.achieved_at).toLocaleDateString('it-IT')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CTA at the end */}
      {achievedCount === totalCount && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/20"
        >
          <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-500" />
          <p className="font-bold text-amber-500">Tutti i traguardi raggiunti!</p>
          <p className="text-xs text-muted-foreground">Sei un campione del 2% Extra</p>
        </motion.div>
      )}
    </div>
  );
}
