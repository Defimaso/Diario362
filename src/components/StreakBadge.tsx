import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
  streak: number;
}

const StreakBadge = ({ streak }: StreakBadgeProps) => {
  return (
    <motion.div 
      className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full card-elegant-accent"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-accent animate-pulse-glow flex-shrink-0" />
      <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
        <span className="coral-text font-bold tabular-nums">{streak}</span>
        <span className="text-muted-foreground ml-1">giorni</span>
      </span>
    </motion.div>
  );
};

export default StreakBadge;
