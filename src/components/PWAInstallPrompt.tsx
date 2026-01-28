import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, X, Share, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PWAInstallPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Check if prompt was dismissed recently
    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Only show on mobile devices not in standalone mode
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile && !standalone) {
      // Delay popup appearance
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (isStandalone || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto"
      >
        <div className="card-elegant rounded-2xl p-4 shadow-xl border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10 shrink-0">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">
                Porta 362gradi sempre con te! 📱
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isIOS ? (
                  <>
                    Clicca su <Share className="w-3 h-3 inline mx-0.5" /> <strong>Condividi</strong> e poi <strong>"Aggiungi a Home"</strong> per installare l'app.
                  </>
                ) : (
                  <>
                    Clicca sui <MoreVertical className="w-3 h-3 inline mx-0.5" /> <strong>tre puntini</strong> e seleziona <strong>"Installa app"</strong> o <strong>"Aggiungi a Home"</strong>.
                  </>
                )}
              </p>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg hover:bg-muted/50 transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="flex-1"
            >
              Dopo
            </Button>
            <Button
              size="sm"
              onClick={handleDismiss}
              className="flex-1"
            >
              Capito!
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
