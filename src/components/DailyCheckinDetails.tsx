import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Battery, Zap, Brain, Utensils, Sparkles, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DailyCheckin {
  id: string;
  date: string;
  recovery: number | null;
  nutrition_adherence: boolean | null;
  energy: number | null;
  mindset: number | null;
  two_percent_edge?: string | null;
}

interface DailyCheckinDetailsProps {
  checkins: DailyCheckin[];
}

const MetricBadge = ({ 
  label, 
  value, 
  icon: Icon, 
  isBoolean = false 
}: { 
  label: string; 
  value: number | boolean | null; 
  icon: React.ElementType; 
  isBoolean?: boolean;
}) => {
  if (value === null || value === undefined) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}: --</span>
      </div>
    );
  }

  let displayValue: string;
  let colorClass: string;

  if (isBoolean) {
    displayValue = value ? 'Sì' : 'No';
    colorClass = value ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10';
  } else {
    const numValue = value as number;
    displayValue = `${numValue}/10`;
    if (numValue >= 7) {
      colorClass = 'text-success bg-success/10';
    } else if (numValue >= 5) {
      colorClass = 'text-warning bg-warning/10';
    } else {
      colorClass = 'text-destructive bg-destructive/10';
    }
  }

  return (
    <div className={cn("flex items-center gap-2 p-2 rounded-lg", colorClass)}>
      <Icon className="w-4 h-4" />
      <span className="text-xs font-medium">{label}: {displayValue}</span>
    </div>
  );
};

const DailyCheckinDetails = ({ checkins }: DailyCheckinDetailsProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (checkins.length === 0) {
    return (
      <div className="text-center py-4 bg-muted/20 rounded-lg">
        <Calendar className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">Nessun check-in disponibile</p>
      </div>
    );
  }

  const calculateScore = (checkin: DailyCheckin): number => {
    const recovery = checkin.recovery || 0;
    const nutritionScore = checkin.nutrition_adherence ? 10 : 5;
    const energy = checkin.energy || 0;
    const mindset = checkin.mindset || 0;
    return Math.round(((recovery + nutritionScore + energy + mindset) / 4) * 10) / 10;
  };

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
        <Calendar className="w-3.5 h-3.5" />
        Storico Check-in Dettagliato
      </h4>
      
      {checkins.map((checkin) => {
        const isExpanded = expandedId === checkin.id;
        const score = calculateScore(checkin);
        const scoreColor = score >= 7 ? 'text-success' : score >= 5 ? 'text-warning' : 'text-destructive';
        
        return (
          <div 
            key={checkin.id} 
            className="border border-border rounded-lg bg-card/50 overflow-hidden"
          >
            {/* Header - Clickable */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : checkin.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {format(new Date(checkin.date), 'd MMMM yyyy', { locale: it })}
                </span>
                <span className={cn("text-sm font-bold", scoreColor)}>
                  {score}/10
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="p-3 pt-0 space-y-3 border-t border-border">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <MetricBadge 
                    label="Recupero" 
                    value={checkin.recovery} 
                    icon={Battery} 
                  />
                  <MetricBadge 
                    label="Nutrizione" 
                    value={checkin.nutrition_adherence} 
                    icon={Utensils} 
                    isBoolean 
                  />
                  <MetricBadge 
                    label="Energia" 
                    value={checkin.energy} 
                    icon={Zap} 
                  />
                  <MetricBadge 
                    label="Mindset" 
                    value={checkin.mindset} 
                    icon={Brain} 
                  />
                </div>

                {/* Low Score Warning */}
                {(checkin.recovery !== null && checkin.recovery < 5) && (
                  <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg">
                    ⚠️ Recupero basso - verificare qualità del sonno
                  </div>
                )}
                {(checkin.mindset !== null && checkin.mindset < 5) && (
                  <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg">
                    ⚠️ Mindset basso - potrebbe aver bisogno di supporto
                  </div>
                )}
                {(checkin.energy !== null && checkin.energy < 5) && (
                  <div className="text-xs text-warning bg-warning/10 p-2 rounded-lg">
                    ⚠️ Energia bassa - verificare alimentazione/riposo
                  </div>
                )}

                {/* Diario Giornaliero */}
                {checkin.two_percent_edge && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-muted-foreground">Diario Giornaliero</span>
                    </div>
                    <p className="text-sm text-foreground italic">"{checkin.two_percent_edge}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DailyCheckinDetails;
