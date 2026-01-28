import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { 
  getCurrentBadge, 
  getNextBadge, 
  getCheckinsToNextBadge, 
  getBadgeProgress,
  getPhaseInfo 
} from '@/lib/badges';
import { getBadgeEmoji, getBadgeGlowColor, getBadgeSolidColor } from '@/lib/badgeEmojis';
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
  
  const currentEmoji = getBadgeEmoji(currentBadge.id);
  const currentGlow = getBadgeGlowColor(currentBadge.id);
  const currentSolid = getBadgeSolidColor(currentBadge.id);
  const nextEmoji = nextBadge ? getBadgeEmoji(nextBadge.id) : null;
  
  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div 
          className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
          style={{
            borderColor: currentSolid,
            boxShadow: `0 0 15px ${currentGlow}`,
            background: `radial-gradient(circle, ${currentGlow.replace('0.6', '0.15')} 0%, transparent 70%)`,
          }}
        >
          <span 
            className="text-xl"
            style={{ filter: `drop-shadow(0 0 5px ${currentGlow})` }}
          >
            {currentEmoji}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate" style={{ color: currentSolid }}>
              {currentBadge.name}
            </span>
            {nextBadge && nextEmoji && (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-1 grayscale opacity-60">
                  <span className="text-base">{nextEmoji}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {nextBadge.name}
                  </span>
                </div>
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
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-14 h-14 rounded-full border-2 flex items-center justify-center"
          style={{
            borderColor: currentSolid,
            boxShadow: `0 0 25px ${currentGlow}, 0 0 50px ${currentGlow.replace('0.6', '0.3')}`,
            background: `radial-gradient(circle, ${currentGlow.replace('0.6', '0.2')} 0%, transparent 70%)`,
          }}
        >
          <span 
            className="text-4xl"
            style={{ filter: `drop-shadow(0 0 10px ${currentGlow})` }}
          >
            {currentEmoji}
          </span>
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold" style={{ color: currentSolid }}>
              {currentBadge.name}
            </h3>
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
      {nextBadge && nextEmoji ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Prossimo:</span>
              <span className="text-lg grayscale opacity-60">{nextEmoji}</span>
              <span className="text-muted-foreground">{nextBadge.name}</span>
            </div>
            <span className="font-medium">
              Mancano <span style={{ color: currentSolid }}>{checkinsToNext}</span> check-in
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      ) : (
        <div 
          className="flex items-center gap-2 p-3 rounded-lg"
          style={{
            backgroundColor: `${currentGlow.replace('0.6', '0.1')}`,
            border: `1px solid ${currentGlow.replace('0.6', '0.3')}`,
          }}
        >
          <Crown className="w-5 h-5" style={{ color: currentSolid }} />
          <span className="text-sm font-medium" style={{ color: currentSolid }}>
            Hai raggiunto il livello massimo! Sei un vero Maestro 362°
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default BadgeProgress;
