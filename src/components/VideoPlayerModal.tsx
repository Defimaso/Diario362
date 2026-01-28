import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string | null;
  title: string;
  trainer: 'maso' | 'martina';
  videoType: 'shorts' | 'standard';
}

const VideoPlayerModal = ({
  isOpen,
  onClose,
  videoId,
  title,
  trainer,
  videoType,
}: VideoPlayerModalProps) => {
  if (!videoId) return null;

  const trainerColor = trainer === 'maso' 
    ? 'bg-blue-500 hover:bg-blue-600' 
    : 'bg-purple-500 hover:bg-purple-600';

  const trainerName = trainer === 'maso' ? 'Maso' : 'Martina';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={`${
          videoType === 'shorts' 
            ? 'max-w-sm sm:max-w-md' 
            : 'max-w-3xl'
        } p-0 overflow-hidden bg-card border-border`}
      >
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <DialogTitle className="text-base font-semibold truncate">
                {title}
              </DialogTitle>
              <Badge className={`${trainerColor} text-white shrink-0`}>
                {trainerName}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 ml-2"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-4 pb-4">
          {videoType === 'shorts' ? (
            // Vertical player for Shorts (9:16)
            <div className="aspect-[9/16] max-h-[70vh] mx-auto rounded-xl overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title}
              />
            </div>
          ) : (
            // Horizontal player for standard videos (16:9)
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;
