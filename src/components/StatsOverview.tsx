import { motion } from "framer-motion";
import { Battery, Zap, Brain, Apple } from "lucide-react";

interface StatsOverviewProps {
  recovery: number;
  nutritionHit: boolean;
  energy: number;
  mindset: number;
}

const StatsOverview = ({ recovery, nutritionHit, energy, mindset }: StatsOverviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="space-y-3"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card-elegant rounded-xl p-3 flex items-center gap-3 sm:flex-col sm:text-center"
        >
          <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 sm:mx-auto">
            <Battery className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col sm:items-center">
            <p className="text-lg font-bold text-primary leading-tight tabular-nums">{recovery}</p>
            <p className="text-xs text-muted-foreground">Recupero</p>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card-elegant rounded-xl p-3 flex items-center gap-3 sm:flex-col sm:text-center"
        >
          <div className="flex-shrink-0 p-2 rounded-lg bg-amber-500/10 sm:mx-auto">
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex flex-col sm:items-center">
            <p className="text-lg font-bold text-amber-500 leading-tight tabular-nums">{energy}</p>
            <p className="text-xs text-muted-foreground">Energia</p>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card-elegant rounded-xl p-3 flex items-center gap-3 sm:flex-col sm:text-center"
        >
          <div className="flex-shrink-0 p-2 rounded-lg bg-purple-500/10 sm:mx-auto">
            <Brain className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex flex-col sm:items-center">
            <p className="text-lg font-bold text-purple-500 leading-tight tabular-nums">{mindset}</p>
            <p className="text-xs text-muted-foreground">Mindset</p>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="card-elegant rounded-xl p-3 flex items-center gap-3 sm:flex-col sm:text-center"
        >
          <div className="flex-shrink-0 p-2 rounded-lg bg-accent/10 sm:mx-auto">
            <Apple className="w-4 h-4 text-accent" />
          </div>
          <div className="flex flex-col sm:items-center">
            <p className="text-lg font-bold text-accent leading-tight">{nutritionHit ? '✓' : '✗'}</p>
            <p className="text-xs text-muted-foreground">Nutrizione</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatsOverview;
