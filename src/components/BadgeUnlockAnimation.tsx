import { motion, AnimatePresence } from 'framer-motion';
import { Badge, getPhaseInfo } from '@/lib/badges';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface BadgeUnlockAnimationProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
}

const BadgeUnlockAnimation = ({ badge, isOpen, onClose }: BadgeUnlockAnimationProps) => {
  // Auto-close after 5 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!badge) return null;

  const phaseInfo = getPhaseInfo(badge.phase);

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
          {/* Particle Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-badge-gold"
                initial={{
                  x: '50vw',
                  y: '50vh',
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.05,
                  ease: 'easeOut',
                }}
              />
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
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 15,
              duration: 0.8 
            }}
            className="text-center px-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Phase Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
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
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-9xl mb-6 drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]"
            >
              {badge.emoji}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-badge-gold mb-2"
            >
              {badge.name}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-muted-foreground mb-6"
            >
              {badge.description}
            </motion.p>

            {/* Motivational Quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="max-w-md mx-auto p-4 rounded-lg bg-badge-gold/10 border border-badge-gold/30"
            >
              <p className="text-lg italic text-badge-gold">
                "{badge.motivationalQuote}"
              </p>
            </motion.div>

            {/* Badge Level */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-sm text-muted-foreground"
            >
              Livello {badge.id} di 20
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BadgeUnlockAnimation;
