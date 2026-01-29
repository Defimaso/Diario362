import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { User, CheckCheck, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface VideoChatBubbleProps {
  isCoach: boolean;
  feedback: string;
  videoUrl?: string | null;
  createdAt: string;
  isRead?: boolean;
}

const VideoChatBubble = ({ isCoach, feedback, videoUrl, createdAt, isRead }: VideoChatBubbleProps) => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className={cn(
      "flex gap-2 max-w-[85%]",
      isCoach ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {/* Avatar */}
      <div className={cn(
        "shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
        isCoach 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted text-muted-foreground"
      )}>
        {isCoach ? 'C' : <User className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className={cn(
        "rounded-2xl px-3 py-2 space-y-2",
        isCoach 
          ? "bg-primary text-primary-foreground rounded-tr-sm" 
          : "bg-muted rounded-tl-sm"
      )}>
        {/* Video feedback */}
        {videoUrl && (
          <div 
            className="relative rounded-lg overflow-hidden bg-black/20 cursor-pointer"
            onClick={() => setShowVideo(!showVideo)}
          >
            {showVideo ? (
              <video
                src={videoUrl}
                className="w-full max-w-[280px] aspect-video object-contain"
                controls
                playsInline
                preload="metadata"
                autoPlay
              />
            ) : (
              <div className="w-full max-w-[280px] aspect-video flex items-center justify-center bg-black/40">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text feedback */}
        {feedback && (
          <p className="text-sm whitespace-pre-wrap">{feedback}</p>
        )}

        {/* Timestamp & read status */}
        <div className={cn(
          "flex items-center gap-1 text-[10px]",
          isCoach ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          <span>{format(new Date(createdAt), 'HH:mm', { locale: it })}</span>
          {isCoach && isRead && (
            <CheckCheck className="w-3 h-3" />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoChatBubble;
