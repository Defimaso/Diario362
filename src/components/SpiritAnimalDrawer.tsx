import { motion } from 'framer-motion';
import { Badge, getPhaseInfo, ELITE_BADGES } from '@/lib/badges';
import { getBadgeEmoji, getBadgeGlowColor, getBadgeSolidColor } from '@/lib/badgeEmojis';
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

  const emoji = getBadgeEmoji(badge.id);
  const glowColor = getBadgeGlowColor(badge.id);
  const solidColor = getBadgeSolidColor(badge.id);
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
              {badge.name} - Milestone Percorso
            </DrawerTitle>
          </DrawerHeader>

          {/* Badge Emoji */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex justify-center mb-4"
          >
            <div 
              className={cn(
                "relative w-28 h-28 rounded-full flex items-center justify-center",
                !isUnlocked && "grayscale opacity-40"
              )}
              style={isUnlocked ? {
                border: `3px solid ${solidColor}`,
                boxShadow: `0 0 40px ${glowColor}, 0 0 80px ${glowColor.replace('0.6', '0.3')}`,
                background: `radial-gradient(circle, ${glowColor.replace('0.6', '0.2')} 0%, transparent 70%)`,
              } : {
                border: '2px solid hsl(var(--muted-foreground) / 0.3)',
              }}
            >
              <span 
                className="text-6xl"
                style={isUnlocked ? {
                  filter: `drop-shadow(0 0 15px ${glowColor})`,
                } : undefined}
              >
                {emoji}
              </span>
              
              {!isUnlocked && (
                <div className="absolute inset-0 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center">
                  <Lock className="w-10 h-10 text-muted-foreground" />
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
              "text-2xl font-bold text-center mb-1"
            )}
            style={isUnlocked ? { color: solidColor } : undefined}
          >
            {isUnlocked ? badge.name : '???'}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground text-center mb-6"
          >
            {isUnlocked ? 'Milestone Raggiunta' : 'Milestone da Sbloccare'}
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
                  Qualita' Sviluppate
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {spiritContent.traits.map((trait) => (
                    <div key={trait} className="flex items-center gap-2">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: `${glowColor.replace('0.6', '0.2')}`,
                        }}
                      >
                        <Check className="w-3 h-3" style={{ color: solidColor }} />
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
                className="rounded-xl p-4"
                style={{
                  backgroundColor: `${glowColor.replace('0.6', '0.1')}`,
                  border: `1px solid ${glowColor.replace('0.6', '0.3')}`,
                }}
              >
                <p className="text-base italic text-center" style={{ color: solidColor }}>
                  "{badge.motivationalQuote}"
                </p>
                <p className="text-xs text-right mt-2" style={{ color: `${solidColor}99` }}>
                  — Diario362
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
                    ? `Mancano ancora ${checkinsRemaining} diari`
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
