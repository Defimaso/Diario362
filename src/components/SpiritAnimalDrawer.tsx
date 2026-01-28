import { motion } from 'framer-motion';
import { Badge, getPhaseInfo, ELITE_BADGES } from '@/lib/badges';
import { getBadgeIcon } from '@/lib/badgeIcons';
import { getSpiritContent } from '@/lib/badgeSpirits';
import { Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface SpiritAnimalDrawerProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  streak: number;
  totalCheckins: number;
}

const SpiritAnimalDrawer = ({ 
  badge, 
  isOpen, 
  onClose, 
  isUnlocked,
  streak,
  totalCheckins 
}: SpiritAnimalDrawerProps) => {
  if (!badge) return null;

  const BadgeIcon = getBadgeIcon(badge.id);
  const phaseInfo = getPhaseInfo(badge.phase);
  const spiritContent = getSpiritContent(badge.id);
  
  // Calculate check-ins remaining
  const checkinsRemaining = badge.id === 20 
    ? Math.max(0, 300 - totalCheckins)
    : Math.max(0, badge.requiredStreak - streak);

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <div className="overflow-y-auto px-4 pb-8">
          <DrawerHeader className="text-center pt-2">
            <DrawerTitle className="sr-only">
              {badge.name} - Spirito Animale
            </DrawerTitle>
          </DrawerHeader>

          {/* Badge Icon */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex justify-center mb-4"
          >
            <div className={cn(
              "relative w-24 h-24 rounded-full flex items-center justify-center",
              isUnlocked 
                ? "bg-badge-gold/20 border-2 border-badge-gold" 
                : "bg-muted/50 border-2 border-muted-foreground/30"
            )}>
              <BadgeIcon className={cn(
                "w-12 h-12",
                isUnlocked ? "text-badge-gold" : "text-muted-foreground/50"
              )} />
              
              {!isUnlocked && (
                <div className="absolute inset-0 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center">
                  <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Phase Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-2"
          >
            <span 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${phaseInfo.color}20`,
                color: phaseInfo.color 
              }}
            >
              {phaseInfo.name} • {phaseInfo.description}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={cn(
              "text-2xl font-bold text-center mb-1",
              isUnlocked ? "text-badge-gold" : "text-muted-foreground"
            )}
          >
            {isUnlocked ? badge.name : '???'}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground text-center mb-6"
          >
            {isUnlocked ? 'Il tuo Spirito Guida' : 'Spirito da Risvegliare'}
          </motion.p>

          {isUnlocked ? (
            <>
              {/* Traits */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-card border border-border rounded-xl p-4 mb-4"
              >
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Qualità Positive
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {spiritContent.traits.map((trait, index) => (
                    <div key={trait} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-badge-gold/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-badge-gold" />
                      </div>
                      <span className="text-sm text-foreground">{trait}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4"
              >
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {spiritContent.description}
                </p>
              </motion.div>

              {/* Motivational Quote */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-badge-gold/10 border border-badge-gold/30 rounded-xl p-4"
              >
                <p className="text-base italic text-badge-gold text-center">
                  "{badge.motivationalQuote}"
                </p>
                <p className="text-xs text-badge-gold/70 text-right mt-2">
                  — 362gradi
                </p>
              </motion.div>
            </>
          ) : (
            /* Locked State */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-muted/30 border border-border rounded-xl p-6 text-center"
            >
              <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                {spiritContent.unlockMessage}
              </p>
              <div className="bg-background/50 rounded-lg p-3">
                <p className="text-lg font-bold text-foreground">
                  {checkinsRemaining > 0 
                    ? `Mancano ancora ${checkinsRemaining} check-in`
                    : 'Quasi sbloccato!'
                  }
                </p>
              </div>
            </motion.div>
          )}

          {/* Level Indicator */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            Livello {badge.id} di {ELITE_BADGES.length}
          </motion.p>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SpiritAnimalDrawer;
