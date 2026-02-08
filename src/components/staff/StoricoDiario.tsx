import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface DiaryEntry {
  id: string;
  date: string;
  two_percent_edge: string;
}

interface StoricoDiarioProps {
  clientId: string;
}

const StoricoDiario = ({ clientId }: StoricoDiarioProps) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchDiary = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('id, date, two_percent_edge')
        .eq('user_id', clientId)
        .not('two_percent_edge', 'is', null)
        .neq('two_percent_edge', '')
        .order('date', { ascending: false });

      if (!error && data) {
        setEntries(data as DiaryEntry[]);
      }
      setLoading(false);
    };

    fetchDiary();
  }, [clientId]);

  const visibleEntries = showAll ? entries : entries.slice(0, 5);

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-3 sm:p-4 border border-primary/20">
        <div className="h-20 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-3 sm:p-4 border border-primary/20">
      <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-primary" />
        Storico Diario ({entries.length})
      </h4>

      {entries.length === 0 ? (
        <div className="text-center py-4">
          <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">Nessun pensiero registrato</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {visibleEntries.map((entry) => (
              <div
                key={entry.id}
                className="relative pl-3 border-l-2 border-primary/30 py-1.5"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {format(new Date(entry.date), 'd MMMM yyyy', { locale: it })}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  "{entry.two_percent_edge}"
                </p>
              </div>
            ))}
          </div>

          {entries.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className={cn(
                "w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg",
                "text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
              )}
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Mostra meno
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Mostra tutti ({entries.length})
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default StoricoDiario;
