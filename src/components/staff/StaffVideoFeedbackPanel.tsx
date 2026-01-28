import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, MessageSquare, ChevronDown, Send, User, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useStaffVideoCorrections, ClientVideo } from '@/hooks/useStaffVideoCorrections';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface StaffVideoFeedbackPanelProps {
  clientId?: string;
}

const StaffVideoFeedbackPanel = ({ clientId }: StaffVideoFeedbackPanelProps) => {
  const { clientVideos, allFeedback, loading, addFeedback, deleteFeedback } = useStaffVideoCorrections();
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [newFeedback, setNewFeedback] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const { toast } = useToast();

  // Filter by client if clientId is provided
  const filteredVideos = clientId 
    ? clientVideos.filter(v => v.user_id === clientId)
    : clientVideos;

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Caricamento video...
      </div>
    );
  }

  if (filteredVideos.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Nessun video caricato dal cliente</p>
      </div>
    );
  }

  const handleSubmitFeedback = async (videoId: string) => {
    const feedbackText = newFeedback[videoId]?.trim();
    if (!feedbackText) return;

    setSubmitting(videoId);
    const { error } = await addFeedback(videoId, feedbackText);
    setSubmitting(null);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Non è stato possibile inviare il feedback',
      });
    } else {
      toast({
        title: 'Feedback inviato',
        description: 'Il cliente riceverà una notifica',
      });
      setNewFeedback(prev => ({ ...prev, [videoId]: '' }));
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium flex items-center gap-2 text-sm px-1">
        <Video className="w-4 h-4 text-primary" />
        Video per Correzione
        <Badge variant="secondary" className="ml-auto">
          {filteredVideos.length}
        </Badge>
      </h4>

      {filteredVideos.map((video) => {
        const videoFeedback = allFeedback[video.id] || [];
        const isExpanded = expandedVideo === video.id;

        return (
          <div
            key={video.id}
            className="border border-border rounded-lg overflow-hidden bg-card/50"
          >
            {/* Header */}
            <button
              onClick={() => setExpandedVideo(isExpanded ? null : video.id)}
              className="w-full p-3 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                <Video className="w-4 h-4 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm truncate block">
                  {video.exercise_name}
                </span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {format(new Date(video.created_at), 'dd MMM, HH:mm', { locale: it })}
                  {videoFeedback.length > 0 && (
                    <span className="flex items-center gap-1">
                      • <MessageSquare className="w-3 h-3" /> {videoFeedback.length}
                    </span>
                  )}
                </div>
              </div>

              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-3">
                    {/* Video Player */}
                    <div className="rounded-lg overflow-hidden bg-black">
                      <video
                        src={video.video_url}
                        className="w-full aspect-video object-contain"
                        controls
                      />
                    </div>

                    {/* Client Notes */}
                    {video.notes && (
                      <div className="p-2 rounded-lg bg-muted/50 text-sm">
                        <span className="text-muted-foreground">Note cliente:</span>
                        <p className="italic mt-1">"{video.notes}"</p>
                      </div>
                    )}

                    {/* Existing Feedback */}
                    {videoFeedback.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-medium text-muted-foreground">
                          Feedback precedenti:
                        </h5>
                        {videoFeedback.map((fb) => (
                          <div
                            key={fb.id}
                            className="p-2 rounded-lg bg-primary/5 border border-primary/20 text-sm flex items-start gap-2"
                          >
                            <User className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p>{fb.feedback}</p>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(fb.created_at), 'dd/MM HH:mm', { locale: it })}
                              </span>
                            </div>
                            <button
                              onClick={() => deleteFeedback(fb.id)}
                              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* New Feedback Input */}
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Scrivi il tuo feedback sulla tecnica..."
                        value={newFeedback[video.id] || ''}
                        onChange={(e) => setNewFeedback(prev => ({
                          ...prev,
                          [video.id]: e.target.value
                        }))}
                        className="min-h-[80px] resize-none text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSubmitFeedback(video.id)}
                        disabled={!newFeedback[video.id]?.trim() || submitting === video.id}
                        className="w-full"
                      >
                        {submitting === video.id ? (
                          'Invio...'
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1" />
                            Invia Feedback
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default StaffVideoFeedbackPanel;
