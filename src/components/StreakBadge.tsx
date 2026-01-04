import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
  streak: number;
}

const StreakBadge = ({ streak }: StreakBadgeProps) => {
  return (
    <motion.div 
      className="flex items-center gap-2 px-4 py-2 rounded-full card-elegant-accent"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Flame className="w-5 h-5 text-accent animate-pulse-glow" />
      <span className="text-sm font-medium">
        <span className="coral-text font-bold">{streak}</span>
        <span className="text-muted-foreground ml-1">day streak</span>
      </span>
    </motion.div>
  );
};

export default StreakBadge;
