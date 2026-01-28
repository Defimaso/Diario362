import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, MessageSquare, ChevronDown, Trash2, Clock, User, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useVideoCorrections, VideoCorrection, VideoFeedback } from '@/hooks/useVideoCorrections';
import { cn } from '@/lib/utils';

const VideoFeedbackList = () => {
  const { videos, feedback, loading, deleteVideo, markFeedbackAsRead } = useVideoCorrections();
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="card-elegant rounded-xl p-8 text-center">
        <div className="animate-pulse text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elegant rounded-xl p-8 text-center"
      >
        <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">
          Nessun video caricato ancora
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Carica il tuo primo video per ricevere feedback dal coach
        </p>
      </motion.div>
    );
  }

  const handleExpand = async (videoId: string) => {
    if (expandedVideo === videoId) {
      setExpandedVideo(null);
    } else {
      setExpandedVideo(videoId);
      // Mark all feedback as read for this video
      const videoFeedback = feedback[videoId] || [];
      for (const fb of videoFeedback) {
        if (!fb.is_read) {
          await markFeedbackAsRead(fb.id);
        }
      }
    }
  };

  const getUnreadCount = (videoId: string) => {
    return (feedback[videoId] || []).filter(f => !f.is_read).length;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <h3 className="text-lg font-semibold flex items-center gap-2 px-1">
        <MessageSquare className="w-5 h-5 text-primary" />
        I Tuoi Video
      </h3>

      {videos.map((video) => {
        const videoFeedback = feedback[video.id] || [];
        const unreadCount = getUnreadCount(video.id);
        const isExpanded = expandedVideo === video.id;

        return (
          <motion.div
            key={video.id}
            layout
            className="card-elegant rounded-xl overflow-hidden"
          >
            {/* Video Header */}
            <button
              onClick={() => handleExpand(video.id)}
              className="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors"
            >
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Video className="w-5 h-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{video.exercise_name}</span>
                  {unreadCount > 0 && (
                    <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <Clock className="w-3 h-3" />
                  {format(new Date(video.created_at), 'dd MMM yyyy, HH:mm', { locale: it })}
                  {videoFeedback.length > 0 && (
                    <span className="flex items-center gap-1">
                      • <MessageSquare className="w-3 h-3" /> {videoFeedback.length}
                    </span>
                  )}
                </div>
              </div>

              <ChevronDown
                className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform",
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
                  <div className="px-4 pb-4 space-y-4">
                    {/* Video Preview */}
                    <div className="rounded-lg overflow-hidden bg-black">
                      <video
                        src={video.video_url}
                        className="w-full aspect-video object-contain"
                        controls
                      />
                    </div>

                    {/* Notes */}
                    {video.notes && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground italic">
                          "{video.notes}"
                        </p>
                      </div>
                    )}

                    {/* Feedback */}
                    {videoFeedback.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          Feedback del Coach
                        </h4>
                        {videoFeedback.map((fb) => (
                          <div
                            key={fb.id}
                            className={cn(
                              "p-3 rounded-lg border",
                              fb.is_read 
                                ? "bg-muted/30 border-muted" 
                                : "bg-primary/5 border-primary/30"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">Coach</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(fb.created_at), 'dd MMM, HH:mm', { locale: it })}
                              </span>
                              {fb.is_read && (
                                <CheckCheck className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                              )}
                            </div>
                            <p className="text-sm">{fb.feedback}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        Nessun feedback ancora. Il coach esaminerà presto il tuo video.
                      </div>
                    )}

                    {/* Delete Button */}
                    <div className="flex justify-end pt-2 border-t border-muted">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Elimina
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminare questo video?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Questa azione è irreversibile. Il video e tutti i feedback associati verranno eliminati.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteVideo(video.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Elimina
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default VideoFeedbackList;
