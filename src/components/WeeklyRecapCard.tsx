import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Calendar, Battery, Zap, Brain, ClipboardCheck } from 'lucide-react';
import { useWeeklyRecap } from '@/hooks/useWeeklyRecap';

const DeltaIndicator = ({ value }: { value: number | null }) => {
  if (value === null) return null;
  if (value > 0) return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-400">
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500/15 shadow-[0_0_6px_rgba(34,197,94,0.3)]">
        <TrendingUp className="w-2.5 h-2.5" />
      </span>
      +{value}
    </span>
  );
  if (value < 0) return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-400">
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500/15 shadow-[0_0_6px_rgba(239,68,68,0.3)]">
        <TrendingDown className="w-2.5 h-2.5" />
      </span>
      {value}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-muted/50">
        <Minus className="w-2.5 h-2.5" />
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

      <div className="grid grid-cols-4 gap-2">
        {/* Check-ins */}
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 text-center shadow-[0_0_12px_rgba(var(--primary-rgb,99,102,241),0.08)]">
          <div className="flex items-center justify-center mb-1.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/15 shadow-[0_0_8px_rgba(var(--primary-rgb,99,102,241),0.2)]">
              <ClipboardCheck className="w-3.5 h-3.5 text-primary" />
            </span>
          </div>
          <div className="text-2xl font-bold text-primary tabular-nums">{currentRecap.total_checkins}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Diari /7g</div>
        </div>

        {/* Recovery */}
        <div className="rounded-xl border border-blue-400/25 bg-blue-500/5 p-3 text-center shadow-[0_0_12px_rgba(96,165,250,0.08)]">
          <div className="flex items-center justify-center mb-1.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/15 shadow-[0_0_8px_rgba(96,165,250,0.25)]">
              <Battery className="w-3.5 h-3.5 text-blue-400" />
            </span>
          </div>
          <div className="text-xl font-bold tabular-nums">{currentRecap.avg_recovery ?? '-'}</div>
          <div className="flex justify-center mt-1">
            <DeltaIndicator value={recoveryDelta} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Recovery</div>
        </div>

        {/* Energy */}
        <div className="rounded-xl border border-yellow-400/25 bg-yellow-500/5 p-3 text-center shadow-[0_0_12px_rgba(250,204,21,0.08)]">
          <div className="flex items-center justify-center mb-1.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500/15 shadow-[0_0_8px_rgba(250,204,21,0.25)]">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
            </span>
          </div>
          <div className="text-xl font-bold tabular-nums">{currentRecap.avg_energy ?? '-'}</div>
          <div className="flex justify-center mt-1">
            <DeltaIndicator value={energyDelta} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Energia</div>
        </div>

        {/* Mindset */}
        <div className="rounded-xl border border-purple-400/25 bg-purple-500/5 p-3 text-center shadow-[0_0_12px_rgba(168,85,247,0.08)]">
          <div className="flex items-center justify-center mb-1.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-500/15 shadow-[0_0_8px_rgba(168,85,247,0.25)]">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
            </span>
          </div>
          <div className="text-xl font-bold tabular-nums">{currentRecap.avg_mindset ?? '-'}</div>
          <div className="flex justify-center mt-1">
            <DeltaIndicator value={mindsetDelta} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Mindset</div>
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
