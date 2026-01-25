import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { Check, X, Scale, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
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
      <div className="bg-card rounded-xl p-4 border border-section-red/30">
        <Skeleton className="h-6 w-48 mb-3" />
        <div className="flex gap-2">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="w-10 h-14 rounded-lg" />
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
    <div className="bg-card rounded-xl p-4 border border-section-red/30">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-section-red" />
          Stato Check-in Giornaliero
        </h4>
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-section-red">{completedDays}/7</span> giorni
        </div>
      </div>

      {/* 7-day visual indicator */}
      <div className="grid grid-cols-7 gap-1.5 mb-4">
        {last7Days.map((dateStr) => {
          const hasCheckin = checkinByDate.has(dateStr);
          const date = new Date(dateStr);
          const isToday = dateStr === today.toISOString().split('T')[0];
          
          return (
            <div
              key={dateStr}
              className={cn(
                "flex flex-col items-center p-1.5 rounded-lg transition-colors",
                hasCheckin 
                  ? "bg-success/10 border border-success/30" 
                  : "bg-destructive/10 border border-destructive/30",
                isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background"
              )}
            >
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                {format(date, 'EEE', { locale: it })}
              </span>
              <span className="text-xs font-semibold mb-1">
                {format(date, 'd')}
              </span>
              {hasCheckin ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <X className="w-4 h-4 text-destructive" />
              )}
            </div>
          );
        })}
      </div>

      {/* Last check-in score */}
      {lastCheckin && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          <Scale className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <span className="text-xs text-muted-foreground">Ultimo check-in: </span>
            <span className="text-sm font-medium">
              {format(new Date(lastCheckin.date), 'd MMM yyyy', { locale: it })}
            </span>
          </div>
          {lastScore !== null && (
            <div className={cn(
              "text-sm font-bold px-2 py-0.5 rounded",
              lastScore >= 7 ? "bg-success/10 text-success" :
              lastScore >= 4 ? "bg-warning/10 text-warning" :
              "bg-destructive/10 text-destructive"
            )}>
              Score: {lastScore}/10
            </div>
          )}
        </div>
      )}

      {!lastCheckin && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Nessun check-in giornaliero negli ultimi 7 giorni
        </p>
      )}
    </div>
  );
};

export default DailyCheckinStatus;