import { useState } from 'react';
import { motion } from 'framer-motion';
import { ELITE_BADGES, Badge, getUnlockedBadges, getPhaseInfo } from '@/lib/badges';
import { getBadgeEmoji, getBadgeGlowColor, getBadgeSolidColor } from '@/lib/badgeEmojis';
import { Trophy, Star } from 'lucide-react';
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
  const emoji = getBadgeEmoji(badge.id);
  const glowColor = getBadgeGlowColor(badge.id);
  const solidColor = getBadgeSolidColor(badge.id);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={isUnlocked ? { scale: 1.05 } : undefined}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={cn(
        "relative p-2 sm:p-3 rounded-xl transition-all duration-300 cursor-pointer flex flex-col items-center",
        isCurrentBadge && "ring-2 ring-badge-gold"
      )}
    >
      {/* Current Badge Indicator */}
      {isCurrentBadge && (
        <div className="absolute -top-1.5 -right-1.5 z-10">
          <Star className="w-4 h-4 text-badge-gold fill-badge-gold" />
        </div>
      )}
      
      {/* Badge Emoji in Circle */}
      <div className="flex justify-center mb-1.5">
        <div 
          className={cn(
            "w-16 h-16 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300",
            isUnlocked 
              ? "border-2" 
              : "border border-muted-foreground/30 grayscale opacity-40"
          )}
          style={isUnlocked ? {
            borderColor: solidColor,
            boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor.replace('0.6', '0.3')}`,
            background: `radial-gradient(circle, ${glowColor.replace('0.6', '0.15')} 0%, transparent 70%)`,
          } : undefined}
        >
          <span 
            className="text-3xl sm:text-2xl"
            style={isUnlocked ? {
              filter: `drop-shadow(0 0 8px ${glowColor})`,
            } : undefined}
          >
            {emoji}
          </span>
        </div>
      </div>
      
      {/* Badge Name */}
      <h4 className={cn(
        "text-[10px] sm:text-xs font-semibold text-center truncate w-full",
        isUnlocked ? "text-foreground" : "text-muted-foreground"
      )}>
        {isUnlocked ? badge.name : '???'}
      </h4>
      
      {/* Days Required */}
      <p className={cn(
        "text-[9px] sm:text-[10px] text-center",
        isUnlocked ? "text-muted-foreground" : "text-muted-foreground/50"
      )}>
        {badge.id === 20 ? '300 tot' : `${badge.requiredStreak}gg`}
      </p>
      
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
        <h3 className="text-lg font-bold">Il Tuo Percorso</h3>
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
            
            {/* Responsive grid: 3 columns on mobile, 5 on larger screens */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
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

      {/* Milestone Drawer */}
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
