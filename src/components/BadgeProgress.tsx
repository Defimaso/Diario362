import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { 
  getCurrentBadge, 
  getNextBadge, 
  getCheckinsToNextBadge, 
  getBadgeProgress,
  getPhaseInfo 
} from '@/lib/badges';
import { cn } from '@/lib/utils';
import { ChevronRight, Crown } from 'lucide-react';

interface BadgeProgressProps {
  streak: number;
  totalCheckins: number;
  className?: string;
  compact?: boolean;
}

const BadgeProgress = ({ streak, totalCheckins, className, compact = false }: BadgeProgressProps) => {
  const currentBadge = getCurrentBadge(streak, totalCheckins);
  const nextBadge = getNextBadge(streak, totalCheckins);
  const checkinsToNext = getCheckinsToNextBadge(streak, totalCheckins);
  const progress = getBadgeProgress(streak, totalCheckins);
  const phaseInfo = getPhaseInfo(currentBadge.phase);
  
  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="text-2xl">{currentBadge.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-badge-gold truncate">
              {currentBadge.name}
            </span>
            {nextBadge && (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  {nextBadge.emoji} {nextBadge.name}
                </span>
              </>
            )}
          </div>
          {nextBadge && (
            <div className="flex items-center gap-2 mt-1">
              <Progress value={progress} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground shrink-0">
                {checkinsToNext}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl bg-card border border-border",
        className
      )}
    >
      {/* Current Badge Display */}
      <div className="flex items-center gap-4 mb-4">
        <motion.div 
          className="text-5xl"
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {currentBadge.emoji}
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-badge-gold">{currentBadge.name}</h3>
            <div 
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${phaseInfo.color}20`,
                color: phaseInfo.color 
              }}
            >
              {phaseInfo.name}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{currentBadge.description}</p>
        </div>
      </div>
      
      {/* Progress to Next Badge */}
      {nextBadge ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Prossimo: {nextBadge.emoji} {nextBadge.name}</span>
            <span className="font-medium">
              Mancano <span className="text-badge-gold">{checkinsToNext}</span> check-in
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-badge-gold/10 border border-badge-gold/30">
          <Crown className="w-5 h-5 text-badge-gold" />
          <span className="text-sm font-medium text-badge-gold">
            Hai raggiunto il livello massimo! Sei un vero Maestro 362°
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default BadgeProgress;
