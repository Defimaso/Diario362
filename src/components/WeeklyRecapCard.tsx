import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Calendar, Battery, Zap, Brain } from 'lucide-react';
import { useWeeklyRecap } from '@/hooks/useWeeklyRecap';

const DeltaIndicator = ({ value }: { value: number | null }) => {
  if (value === null) return null;
  if (value > 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400">
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/15 shadow-[0_0_6px_rgba(34,197,94,0.3)]">
        <TrendingUp className="w-3 h-3" />
      </span>
      +{value}
    </span>
  );
  if (value < 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400">
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/15 shadow-[0_0_6px_rgba(239,68,68,0.3)]">
        <TrendingDown className="w-3 h-3" />
      </span>
      {value}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted/50">
        <Minus className="w-3 h-3" />
      </span>
      0
    </span>
  );
};

export default function WeeklyRecapCard() {
  const { currentRecap, previousRecap, loading, getDelta } = useWeeklyRecap();

  if (loading) return null;
  if (!currentRecap || currentRecap.total_checkins === 0) return null;

  const recoveryDelta = getDelta(currentRecap.avg_recovery, previousRecap?.avg_recovery ?? null);
  const energyDelta = getDelta(currentRecap.avg_energy, previousRecap?.avg_energy ?? null);
  const mindsetDelta = getDelta(currentRecap.avg_mindset, previousRecap?.avg_mindset ?? null);

  const weekLabel = (() => {
    const start = new Date(currentRecap.week_start);
    const end = new Date(currentRecap.week_end);
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${start.toLocaleDateString('it-IT', opts)} - ${end.toLocaleDateString('it-IT', opts)}`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elegant p-5 rounded-2xl"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Recap Settimanale</h3>
        <span className="text-xs text-muted-foreground ml-auto">{weekLabel}</span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {/* Check-ins */}
        <div className="text-center">
          <div className="text-2xl font-bold text-primary tabular-nums">{currentRecap.total_checkins}</div>
          <div className="text-[10px] text-muted-foreground mt-1">Diari</div>
          <div className="text-[10px] text-muted-foreground">/7 giorni</div>
        </div>

        {/* Recovery */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Battery className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-lg font-bold tabular-nums mt-1">{currentRecap.avg_recovery ?? '-'}</div>
          <DeltaIndicator value={recoveryDelta} />
          <div className="text-[10px] text-muted-foreground">Recovery</div>
        </div>

        {/* Energy */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="text-lg font-bold tabular-nums mt-1">{currentRecap.avg_energy ?? '-'}</div>
          <DeltaIndicator value={energyDelta} />
          <div className="text-[10px] text-muted-foreground">Energia</div>
        </div>

        {/* Mindset */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-lg font-bold tabular-nums mt-1">{currentRecap.avg_mindset ?? '-'}</div>
          <DeltaIndicator value={mindsetDelta} />
          <div className="text-[10px] text-muted-foreground">Mindset</div>
        </div>
      </div>

      {previousRecap && (
        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground text-center">
          Settimana scorsa: {previousRecap.total_checkins} diari | R:{previousRecap.avg_recovery} E:{previousRecap.avg_energy} M:{previousRecap.avg_mindset}
        </div>
      )}
    </motion.div>
  );
}
