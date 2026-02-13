import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, Calendar, Sparkles, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DailyCheckin } from '@/hooks/useCheckins';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiarioPensieriProps {
  checkins: DailyCheckin[];
  onDelete?: () => void;
}

const DiarioPensieri = ({ checkins, onDelete }: DiarioPensieriProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (checkinId: string) => {
    setDeletingId(checkinId);
    const { error } = await supabase
      .from('daily_checkins')
      .update({ two_percent_edge: null })
      .eq('id', checkinId);

    if (error) {
      toast({ title: 'Errore', description: 'Impossibile eliminare il pensiero', variant: 'destructive' });
    } else {
      onDelete?.();
    }
    setDeletingId(null);
  };

  // Filter only checkins that have a two_percent_edge text (non-empty)
  const diaryEntries = checkins.filter(
    (c) => c.two_percent_edge && c.two_percent_edge.trim().length > 0
  );

  const visibleEntries = isExpanded ? diaryEntries : diaryEntries.slice(0, 3);

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold">Il Mio Diario</h3>
          <p className="text-xs text-muted-foreground">
            {diaryEntries.length} {diaryEntries.length === 1 ? 'pensiero' : 'pensieri'} registrati
          </p>
        </div>
      </div>

      {diaryEntries.length === 0 ? (
        <div className="text-center py-6">
          <Sparkles className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">Nessun pensiero ancora</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Scrivi qualcosa nel tuo diario giornaliero per vederlo qui
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {visibleEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative pl-4 border-l-2 border-primary/30"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {format(new Date(entry.date), "EEEE d MMMM yyyy", { locale: it })}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className={cn("w-3.5 h-3.5", deletingId === entry.id && "animate-pulse")} />
                    </button>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {entry.two_percent_edge}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {diaryEntries.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg",
                "text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
              )}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Mostra meno
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Mostra tutti ({diaryEntries.length})
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default DiarioPensieri;
