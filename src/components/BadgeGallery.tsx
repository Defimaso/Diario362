import { motion, AnimatePresence } from 'framer-motion';
import { ELITE_BADGES, Badge, getUnlockedBadges, getLockedBadges, getPhaseInfo } from '@/lib/badges';
import { Lock, Trophy, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeGalleryProps {
  streak: number;
  totalCheckins: number;
  className?: string;
}

const BadgeCard = ({ 
  badge, 
  isUnlocked, 
  isCurrentBadge 
}: { 
  badge: Badge; 
  isUnlocked: boolean; 
  isCurrentBadge: boolean;
}) => {
  const phaseInfo = getPhaseInfo(badge.phase);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={isUnlocked ? { scale: 1.05, y: -5 } : undefined}
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-300",
        isUnlocked 
          ? "bg-card border-badge-gold/50 shadow-lg" 
          : "bg-muted/30 border-border/50",
        isCurrentBadge && "ring-2 ring-badge-gold shadow-badge-glow"
      )}
    >
      {/* Current Badge Indicator */}
      {isCurrentBadge && (
        <div className="absolute -top-2 -right-2">
          <Star className="w-5 h-5 text-badge-gold fill-badge-gold" />
        </div>
      )}
      
      {/* Badge Icon */}
      <div className={cn(
        "text-4xl text-center mb-2",
        !isUnlocked && "opacity-30 grayscale"
      )}>
        {badge.emoji}
      </div>
      
      {/* Badge Name */}
      <h4 className={cn(
        "text-sm font-semibold text-center truncate",
        isUnlocked ? "text-badge-gold" : "text-muted-foreground"
      )}>
        {isUnlocked ? badge.name : '???'}
      </h4>
      
      {/* Description */}
      <p className={cn(
        "text-xs text-center mt-1",
        isUnlocked ? "text-muted-foreground" : "text-muted-foreground/50"
      )}>
        {isUnlocked ? badge.description : `${badge.requiredStreak} giorni`}
      </p>
      
      {/* Lock Icon for Locked Badges */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl">
          <Lock className="w-6 h-6 text-muted-foreground/50" />
        </div>
      )}
      
      {/* Phase Indicator */}
      {isUnlocked && (
        <div 
          className="absolute top-2 left-2 w-2 h-2 rounded-full"
          style={{ backgroundColor: phaseInfo.color }}
        />
      )}
    </motion.div>
  );
};

const BadgeGallery = ({ streak, totalCheckins, className }: BadgeGalleryProps) => {
  const unlockedBadges = getUnlockedBadges(streak, totalCheckins);
  const currentBadgeId = unlockedBadges[unlockedBadges.length - 1]?.id || 1;
  
  // Group badges by phase
  const phases = ['immediate', 'consolidation', 'transformation', 'mastery'] as const;
  
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-badge-gold" />
        <h3 className="text-lg font-bold">I Tuoi Trofei</h3>
        <span className="text-sm text-muted-foreground">
          ({unlockedBadges.length}/{ELITE_BADGES.length})
        </span>
      </div>
      
      {phases.map((phase) => {
        const phaseInfo = getPhaseInfo(phase);
        const phaseBadges = ELITE_BADGES.filter(b => b.phase === phase);
        const unlockedInPhase = phaseBadges.filter(b => 
          unlockedBadges.some(ub => ub.id === b.id)
        );
        
        return (
          <div key={phase} className="space-y-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: phaseInfo.color }}
              />
              <span className="text-sm font-medium">{phaseInfo.name}</span>
              <span className="text-xs text-muted-foreground">
                {phaseInfo.description} • {unlockedInPhase.length}/{phaseBadges.length}
              </span>
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {phaseBadges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isUnlocked={unlockedBadges.some(b => b.id === badge.id)}
                  isCurrentBadge={badge.id === currentBadgeId}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BadgeGallery;
