import { useState } from 'react';
import { motion } from 'framer-motion';
import { ELITE_BADGES, Badge, getUnlockedBadges, getPhaseInfo } from '@/lib/badges';
import { getBadgeIcon } from '@/lib/badgeIcons';
import { Lock, Trophy, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import SpiritAnimalDrawer from './SpiritAnimalDrawer';

interface BadgeGalleryProps {
  streak: number;
  totalCheckins: number;
  className?: string;
}

const BadgeCard = ({ 
  badge, 
  isUnlocked, 
  isCurrentBadge,
  onClick
}: { 
  badge: Badge; 
  isUnlocked: boolean; 
  isCurrentBadge: boolean;
  onClick: () => void;
}) => {
  const phaseInfo = getPhaseInfo(badge.phase);
  const BadgeIcon = getBadgeIcon(badge.id);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={isUnlocked ? { scale: 1.05 } : undefined}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative p-2 sm:p-3 rounded-xl border transition-all duration-300 cursor-pointer",
        isUnlocked 
          ? "bg-card border-badge-gold/50 shadow-lg" 
          : "bg-muted/30 border-border/50",
        isCurrentBadge && "ring-2 ring-badge-gold shadow-badge-glow"
      )}
    >
      {/* Current Badge Indicator */}
      {isCurrentBadge && (
        <div className="absolute -top-1.5 -right-1.5">
          <Star className="w-4 h-4 text-badge-gold fill-badge-gold" />
        </div>
      )}
      
      {/* Badge Icon in Circle */}
      <div className="flex justify-center mb-1.5">
        <div className={cn(
          "w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all",
          isUnlocked 
            ? "border-badge-gold bg-badge-gold/10" 
            : "border-muted-foreground/30 bg-muted/50"
        )}>
          <BadgeIcon className={cn(
            "w-5 h-5 sm:w-6 sm:h-6",
            isUnlocked ? "text-badge-gold" : "text-muted-foreground/40"
          )} />
        </div>
      </div>
      
      {/* Badge Name */}
      <h4 className={cn(
        "text-[10px] sm:text-xs font-semibold text-center truncate",
        isUnlocked ? "text-badge-gold" : "text-muted-foreground"
      )}>
        {isUnlocked ? badge.name : '???'}
      </h4>
      
      {/* Days Required */}
      <p className={cn(
        "text-[9px] sm:text-[10px] text-center",
        isUnlocked ? "text-muted-foreground" : "text-muted-foreground/50"
      )}>
        {badge.requiredStreak}gg
      </p>
      
      {/* Lock Icon for Locked Badges */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/30 rounded-xl">
          <Lock className="w-4 h-4 text-muted-foreground/50" />
        </div>
      )}
      
      {/* Phase Indicator */}
      {isUnlocked && (
        <div 
          className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: phaseInfo.color }}
        />
      )}
    </motion.div>
  );
};

const BadgeGallery = ({ streak, totalCheckins, className }: BadgeGalleryProps) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const unlockedBadges = getUnlockedBadges(streak, totalCheckins);
  const currentBadgeId = unlockedBadges[unlockedBadges.length - 1]?.id || 1;
  
  // Group badges by phase
  const phases = ['immediate', 'consolidation', 'transformation', 'mastery'] as const;

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setIsDrawerOpen(true);
  };

  const isBadgeUnlocked = (badge: Badge) => {
    return unlockedBadges.some(b => b.id === badge.id);
  };
  
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
            
            {/* Responsive grid: 4 columns on mobile, 5 on larger screens */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
              {phaseBadges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isUnlocked={isBadgeUnlocked(badge)}
                  isCurrentBadge={badge.id === currentBadgeId}
                  onClick={() => handleBadgeClick(badge)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Spirit Animal Drawer */}
      <SpiritAnimalDrawer
        badge={selectedBadge}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isUnlocked={selectedBadge ? isBadgeUnlocked(selectedBadge) : false}
        streak={streak}
        totalCheckins={totalCheckins}
      />
    </div>
  );
};

export default BadgeGallery;
