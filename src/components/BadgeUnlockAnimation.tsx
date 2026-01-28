import { motion, AnimatePresence } from 'framer-motion';
import { Badge, getPhaseInfo } from '@/lib/badges';
import { getBadgeEmoji, getBadgeGlowColor, getBadgeSolidColor } from '@/lib/badgeEmojis';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface BadgeUnlockAnimationProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
}

const BadgeUnlockAnimation = ({ badge, isOpen, onClose }: BadgeUnlockAnimationProps) => {
  // Auto-close after 8 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 8000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!badge) return null;

  const phaseInfo = getPhaseInfo(badge.phase);
  const emoji = getBadgeEmoji(badge.id);
  const glowColor = getBadgeGlowColor(badge.id);
  const solidColor = getBadgeSolidColor(badge.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Sparkle Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  delay: 0.5 + i * 0.1,
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
                style={{
                  position: 'absolute',
                  left: `${30 + Math.random() * 40}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
              >
                <Sparkles className="w-4 h-4" style={{ color: solidColor }} />
              </motion.div>
            ))}
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Badge Content */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: [0, 1.3, 0.9, 1.1, 1],
              rotate: 0,
            }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ 
              duration: 1,
              times: [0, 0.4, 0.6, 0.8, 1],
              ease: "easeOut"
            }}
            className="text-center px-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Phase Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-4"
            >
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: `${phaseInfo.color}20`,
                  color: phaseInfo.color 
                }}
              >
                {phaseInfo.name}
              </span>
            </motion.div>

            {/* Emoji with Glow */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex justify-center mb-6"
            >
              <div 
                className="w-32 h-32 rounded-full border-3 flex items-center justify-center"
                style={{
                  borderColor: solidColor,
                  boxShadow: `0 0 60px ${glowColor}, 0 0 120px ${glowColor.replace('0.6', '0.4')}`,
                  background: `radial-gradient(circle, ${glowColor.replace('0.6', '0.3')} 0%, transparent 70%)`,
                }}
              >
                <span 
                  className="text-7xl"
                  style={{ filter: `drop-shadow(0 0 20px ${glowColor})` }}
                >
                  {emoji}
                </span>
              </div>
            </motion.div>

            {/* Congratulations */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg font-medium text-muted-foreground mb-2"
            >
              🎉 Nuovo Badge Sbloccato!
            </motion.p>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-4xl font-bold mb-2"
              style={{ color: solidColor }}
            >
              {badge.name}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-lg text-muted-foreground mb-6"
            >
              {badge.description}
            </motion.p>

            {/* Motivational Quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="max-w-md mx-auto p-4 rounded-lg"
              style={{
                backgroundColor: `${glowColor.replace('0.6', '0.1')}`,
                border: `1px solid ${glowColor.replace('0.6', '0.3')}`,
              }}
            >
              <p className="text-lg italic" style={{ color: solidColor }}>
                "{badge.motivationalQuote}"
              </p>
            </motion.div>

            {/* Badge Level */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="mt-6 text-sm text-muted-foreground"
            >
              Livello {badge.id} di 20
            </motion.p>

            {/* Continue Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-4"
            >
              <Button 
                onClick={onClose}
                className="px-8"
                style={{
                  backgroundColor: solidColor,
                  color: 'white',
                }}
              >
                Continua
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BadgeUnlockAnimation;
