import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, MessageSquare, ChevronDown, Send, Clock, Trash2, Upload, Loader2, Play } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useStaffVideoCorrections, ClientVideo } from '@/hooks/useStaffVideoCorrections';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import VideoChatBubble from '@/components/allenamento/VideoChatBubble';

interface StaffVideoFeedbackPanelProps {
  clientId?: string;
}

const StaffVideoFeedbackPanel = ({ clientId }: StaffVideoFeedbackPanelProps) => {
  const { clientVideos, allFeedback, loading, addFeedback, deleteFeedback } = useStaffVideoCorrections();
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [newFeedback, setNewFeedback] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState<string | null>(null);
  const videoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
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

  const handleSubmitFeedback = async (videoId: string, videoFile?: File) => {
    const feedbackText = newFeedback[videoId]?.trim() || '';
    
    if (!feedbackText && !videoFile) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Inserisci un messaggio o carica un video',
      });
      return;
    }

    setSubmitting(videoId);
    const { error } = await addFeedback(videoId, feedbackText, videoFile);
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

  const handleVideoSelect = async (videoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate video
    if (!file.type.startsWith('video/')) {
      toast({
        variant: 'destructive',
        title: 'Formato non valido',
        description: 'Seleziona un file video',
      });
      return;
    }

    // Max 100MB
    if (file.size > 100 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File troppo grande',
        description: 'Il video non può superare i 100MB',
      });
      return;
    }

    setUploadingVideo(videoId);
    await handleSubmitFeedback(videoId, file);
    setUploadingVideo(null);

    // Reset input
    if (videoInputRefs.current[videoId]) {
      videoInputRefs.current[videoId]!.value = '';
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
                    {/* Client Video Player */}
                    <div className="rounded-lg overflow-hidden bg-black">
                      <video
                        src={video.video_url}
                        className="w-full aspect-video object-contain"
                        controls
                        playsInline
                        preload="metadata"
                      />
                    </div>

                    {/* Client Notes */}
                    {video.notes && (
                      <div className="p-2 rounded-lg bg-muted/50 text-sm">
                        <span className="text-muted-foreground">Note cliente:</span>
                        <p className="italic mt-1">"{video.notes}"</p>
                      </div>
                    )}

                    {/* Chat-style Feedback */}
                    <div className="space-y-3 py-2">
                      <h5 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" />
                        Chat correzione
                      </h5>
                      
                      {videoFeedback.length > 0 ? (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {videoFeedback.map((fb) => (
                            <div key={fb.id} className="relative group">
                              <VideoChatBubble
                                isCoach={true}
                                feedback={fb.feedback}
                                videoUrl={fb.video_url}
                                createdAt={fb.created_at}
                                isRead={fb.is_read}
                              />
                              <button
                                onClick={() => deleteFeedback(fb.id)}
                                className="absolute top-1 right-1 p-1 rounded bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          Nessun feedback ancora. Scrivi o registra un video!
                        </p>
                      )}
                    </div>

                    {/* New Feedback Input */}
                    <div className="space-y-2 border-t pt-3">
                      <Textarea
                        placeholder="Scrivi il tuo feedback sulla tecnica..."
                        value={newFeedback[video.id] || ''}
                        onChange={(e) => setNewFeedback(prev => ({
                          ...prev,
                          [video.id]: e.target.value
                        }))}
                        className="min-h-[60px] resize-none text-sm"
                      />
                      
                      <div className="flex gap-2">
                        {/* Video upload input */}
                        <input
                          ref={el => videoInputRefs.current[video.id] = el}
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => handleVideoSelect(video.id, e)}
                        />
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => videoInputRefs.current[video.id]?.click()}
                          disabled={submitting === video.id || uploadingVideo === video.id}
                          className="gap-1"
                        >
                          {uploadingVideo === video.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Video className="w-4 h-4" />
                          )}
                          Video
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleSubmitFeedback(video.id)}
                          disabled={!newFeedback[video.id]?.trim() || submitting === video.id}
                          className="flex-1"
                        >
                          {submitting === video.id ? (
                            'Invio...'
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-1" />
                              Invia
                            </>
                          )}
                        </Button>
                      </div>
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
