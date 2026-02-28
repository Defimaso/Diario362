import { motion } from 'framer-motion';
import { Users, Sparkles } from 'lucide-react';
import BottomDock from '@/components/BottomDock';

export default function Community() {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-36">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold">Community</h1>
            <p className="text-xs text-muted-foreground">In arrivo</p>
          </div>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Coming Soon</h2>
          <p className="text-muted-foreground leading-relaxed">
            La community di Diario362 sta per arrivare! Presto potrai condividere
            pensieri, confrontarti con gli altri e crescere insieme.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-xs text-primary bg-primary/10 px-4 py-2 rounded-full">
            <Users className="w-3.5 h-3.5" />
            Stiamo preparando tutto per te
          </div>
        </motion.div>
      </div>

      <BottomDock />
    </div>
  );
}
