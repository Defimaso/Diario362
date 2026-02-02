import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, X } from 'lucide-react';

const TUTORIAL_SEEN_KEY = 'tutorial_video_seen';
const LOOM_VIDEO_ID = '8de134211f624b7f887a2a6c9d048247';

interface TutorialVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialVideoModal = ({ isOpen, onClose }: TutorialVideoModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              Tutorial - Come usare l'app
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Guarda questo breve video per scoprire tutte le funzionalità dell'app
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-4">
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
            <iframe
              src={`https://www.loom.com/embed/${LOOM_VIDEO_ID}?autoplay=1`}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; fullscreen"
              title="Tutorial video"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const TutorialButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative"
        title="Guarda il tutorial"
      >
        <Play className="w-5 h-5" />
      </Button>
      <TutorialVideoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export const useTutorialFirstVisit = () => {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(TUTORIAL_SEEN_KEY);
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const closeTutorial = () => {
    localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
    setShowTutorial(false);
  };

  return { showTutorial, closeTutorial };
};

export default TutorialVideoModal;
