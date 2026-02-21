import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COOKIE_CONSENT_KEY = '362gradi_cookie_consent';

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to prevent flash on load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (consent: Omit<CookieConsent, 'timestamp'>) => {
    const fullConsent: CookieConsent = {
      ...consent,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(fullConsent));
    setShowBanner(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const rejectAll = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const savePreferences = () => {
    saveConsent(preferences);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[200] p-4 pb-28"
        >
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Cookie className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Utilizziamo i Cookie 🍪
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Utilizziamo cookie per migliorare la tua esperienza. Puoi accettare 
                    tutti i cookie o personalizzare le tue preferenze.
                  </p>
                </div>
                <button
                  onClick={rejectAll}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-4 space-y-3"
                  >
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Cookie Necessari</p>
                        <p className="text-xs text-muted-foreground">
                          Essenziali per il funzionamento del sito
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">Sempre attivi</div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Cookie Analytics</p>
                        <p className="text-xs text-muted-foreground">
                          Ci aiutano a capire come usi l'app
                        </p>
                      </div>
                      <Button
                        variant={preferences.analytics ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                          setPreferences({ ...preferences, analytics: !preferences.analytics })
                        }
                      >
                        {preferences.analytics ? 'Attivo' : 'Disattivo'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Cookie Marketing</p>
                        <p className="text-xs text-muted-foreground">
                          Usati per mostrare contenuti rilevanti
                        </p>
                      </div>
                      <Button
                        variant={preferences.marketing ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                          setPreferences({ ...preferences, marketing: !preferences.marketing })
                        }
                      >
                        {preferences.marketing ? 'Attivo' : 'Disattivo'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex-1"
                >
                  {showDetails ? 'Nascondi dettagli' : 'Personalizza'}
                </Button>
                {showDetails ? (
                  <Button size="sm" onClick={savePreferences} className="flex-1">
                    Salva preferenze
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={rejectAll} className="flex-1">
                      Rifiuta tutto
                    </Button>
                    <Button size="sm" onClick={acceptAll} className="flex-1">
                      Accetta tutto
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
