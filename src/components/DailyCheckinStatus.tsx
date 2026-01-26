import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { Check, X, Scale, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface DailyCheckin {
  id: string;
  date: string;
  recovery: number | null;
  nutrition_adherence: boolean | null;
  energy: number | null;
  mindset: number | null;
}

interface DailyCheckinStatusProps {
  clientId: string;
}

const DailyCheckinStatus = ({ clientId }: DailyCheckinStatusProps) => {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentCheckins = async () => {
      setLoading(true);
      
      // Get last 7 days date range
      const today = new Date();
      const sevenDaysAgo = subDays(today, 6);
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('id, date, recovery, nutrition_adherence, energy, mindset')
        .eq('user_id', clientId)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .lte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (!error && data) {
        setCheckins(data);
      }
      setLoading(false);
    };

    fetchRecentCheckins();
  }, [clientId]);

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-3 sm:p-4 border border-section-red/30">
        <div className="h-5 w-40 bg-muted rounded animate-pulse mb-3" />
        <div className="flex gap-1.5 sm:gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-1 h-12 sm:h-14 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Create array of last 7 days
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    return date.toISOString().split('T')[0];
  });

  // Map checkins by date
  const checkinByDate = new Map(checkins.map(c => [c.date, c]));

  // Get last recorded weight from daily checkin
  // Note: Daily checkins don't have weight, but we'll show the last check-in score
  const lastCheckin = checkins.length > 0 ? checkins[0] : null;
  const lastScore = lastCheckin
    ? Math.round(
        ((lastCheckin.recovery || 0) +
          (lastCheckin.nutrition_adherence ? 10 : 5) +
          (lastCheckin.energy || 0) +
          (lastCheckin.mindset || 0)) / 4
      )
    : null;

  const completedDays = last7Days.filter(date => checkinByDate.has(date)).length;

  return (
    <div className="bg-card rounded-xl p-3 sm:p-4 border border-section-red/30">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h4 className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-section-red" />
          <span className="hidden xs:inline">Stato Check-in Giornaliero</span>
          <span className="xs:hidden">Check-in</span>
        </h4>
        <div className="text-[10px] sm:text-xs text-muted-foreground">
          <span className="font-medium text-section-red">{completedDays}/7</span> giorni
        </div>
      </div>

      {/* 7-day visual indicator */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-4">
        {last7Days.map((dateStr) => {
          const hasCheckin = checkinByDate.has(dateStr);
          const date = new Date(dateStr);
          const isToday = dateStr === today.toISOString().split('T')[0];
          
          return (
            <div
              key={dateStr}
              className={cn(
                "flex flex-col items-center p-1 sm:p-1.5 rounded-lg transition-colors min-w-0",
                hasCheckin 
                  ? "bg-success/10 border border-success/30" 
                  : "bg-destructive/10 border border-destructive/30",
                isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background"
              )}
            >
              <span className="text-[8px] sm:text-[10px] font-medium text-muted-foreground uppercase truncate">
                {format(date, 'EEE', { locale: it })}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold mb-0.5 sm:mb-1">
                {format(date, 'd')}
              </span>
              {hasCheckin ? (
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
              ) : (
                <X className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
              )}
            </div>
          );
        })}
      </div>

      {/* Last check-in score */}
      {lastCheckin && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] sm:text-xs text-muted-foreground">Ultimo: </span>
            <span className="text-xs sm:text-sm font-medium">
              {format(new Date(lastCheckin.date), 'd MMM', { locale: it })}
            </span>
          </div>
          {lastScore !== null && (
            <div className={cn(
              "text-xs sm:text-sm font-bold px-1.5 sm:px-2 py-0.5 rounded shrink-0",
              lastScore >= 7 ? "bg-success/10 text-success" :
              lastScore >= 4 ? "bg-warning/10 text-warning" :
              "bg-destructive/10 text-destructive"
            )}>
              {lastScore}/10
            </div>
          )}
        </div>
      )}

      {!lastCheckin && (
        <div className="text-center py-3 px-2 bg-muted/30 rounded-lg">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Nessun check-in registrato negli ultimi 7 giorni
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-1">
            Il cliente non ha ancora compilato il check giornaliero
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyCheckinStatus;