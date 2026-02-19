import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, X, Smartphone, ClipboardCheck, Trophy, TrendingUp,
  FolderOpen, Bell, ChevronRight, Crown, ArrowRight, BarChart3,
  MessageCircle, Dumbbell, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const GUIDE_SEEN_KEY = 'diario_guide_seen';

interface GuideOnboardingProps {
  userId: string;
}

const quickSteps = [
  {
    icon: <Smartphone className="w-5 h-5 text-cyan-400" />,
    title: 'Installa l\'App',
    desc: 'Aggiungi alla schermata Home per notifiche e accesso rapido',
    color: 'bg-cyan-500/15 border-cyan-500/20',
    section: 'free' as const,
  },
  {
    icon: <ClipboardCheck className="w-5 h-5 text-[hsl(var(--section-red))]" />,
    title: 'Compila il Diario',
    desc: 'Ogni giorno: recupero, energia, mindset, nutrizione e il tuo 2% extra',
    color: 'bg-[hsl(var(--section-red))]/15 border-[hsl(var(--section-red))]/20',
    section: 'free' as const,
  },
  {
    icon: <Trophy className="w-5 h-5 text-yellow-400" />,
    title: 'Sblocca Badge',
    desc: 'Giorni consecutivi = streak + badge celebrativi con animazione',
    color: 'bg-yellow-500/15 border-yellow-500/20',
    section: 'free' as const,
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    title: 'Progressi & Foto',
    desc: 'Check mensili con peso e foto per vedere la tua trasformazione',
    color: 'bg-emerald-500/15 border-emerald-500/20',
    section: 'free' as const,
  },
  {
    icon: <Bell className="w-5 h-5 text-amber-400" />,
    title: 'Attiva le Notifiche',
    desc: 'Promemoria diario e aggiornamenti dal coach',
    color: 'bg-amber-500/15 border-amber-500/20',
    section: 'free' as const,
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-blue-400" />,
    title: 'Statistiche Avanzate',
    desc: 'Grafici settimanali e medie dettagliate dei tuoi parametri',
    color: 'bg-blue-500/15 border-blue-500/20',
    section: 'premium' as const,
  },
  {
    icon: <FolderOpen className="w-5 h-5 text-primary" />,
    title: 'Materiali & Video',
    desc: 'Piano alimentare, documenti e video-correzioni dal coach',
    color: 'bg-primary/15 border-primary/20',
    section: 'premium' as const,
  },
  {
    icon: <MessageCircle className="w-5 h-5 text-green-400" />,
    title: 'Chat col Coach',
    desc: 'Messaggi diretti con il tuo coach dedicato',
    color: 'bg-green-500/15 border-green-500/20',
    section: 'premium' as const,
  },
];

export const GuideOnboarding = ({ userId }: GuideOnboardingProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const key = `${GUIDE_SEEN_KEY}_${userId}`;
    const seen = localStorage.getItem(key);
    if (!seen) {
      // Piccolo delay per far caricare la dashboard prima
      const timer = setTimeout(() => setShowPopup(true), 800);
      return () => clearTimeout(timer);
    }
  }, [userId]);

  const handleClose = () => {
    setShowPopup(false);
    localStorage.setItem(`${GUIDE_SEEN_KEY}_${userId}`, 'true');
  };

  const handleFullGuide = () => {
    handleClose();
    navigate('/guida');
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[5%] bottom-[5%] z-[61] max-w-md mx-auto flex flex-col"
          >
            <div className="card-elegant rounded-2xl flex flex-col overflow-hidden h-full">
              {/* Header */}
              <div className="p-5 pb-3 flex items-start justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base">Benvenuta in Diario362!</h2>
                    <p className="text-xs text-muted-foreground">Ecco cosa puoi fare</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Steps - scrollabile */}
              <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-2.5">
                {/* Free section label */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-px flex-1 bg-emerald-500/30" />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Gratis</span>
                  <div className="h-px flex-1 bg-emerald-500/30" />
                </div>

                {quickSteps.filter(s => s.section === 'free').map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.07 }}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${step.color}`}
                  >
                    <div className="shrink-0 mt-0.5">{step.icon}</div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm">{step.title}</span>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}

                {/* Premium section label */}
                <div className="flex items-center gap-2 pt-2">
                  <div className="h-px flex-1 bg-amber-500/30" />
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5" />
                    Percorso Personalizzato
                  </span>
                  <div className="h-px flex-1 bg-amber-500/30" />
                </div>

                {quickSteps.filter(s => s.section === 'premium').map((step, i) => (
                  <motion.div
                    key={`p-${i}`}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.07 }}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${step.color} opacity-80`}
                  >
                    <div className="shrink-0 mt-0.5">{step.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm">{step.title}</span>
                        <Lock className="w-3 h-3 text-amber-500" />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer buttons */}
              <div className="p-5 pt-3 border-t border-border shrink-0 space-y-2">
                <Button
                  onClick={handleFullGuide}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Guida completa
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="w-full text-muted-foreground text-sm"
                >
                  Ho capito, iniziamo!
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/** Icona guida colorata per l'header — sempre visibile, pulsante la prima volta */
export const GuideButton = () => {
  const navigate = useNavigate();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Pulse per i primi 30 secondi dopo il mount per attirare attenzione
    setPulse(true);
    const timer = setTimeout(() => setPulse(false), 30000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate('/guida')}
      className="relative text-primary hover:text-primary/80"
      title="Guida app"
    >
      <BookOpen className="w-5 h-5" />
      {pulse && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-ping" />
      )}
      {pulse && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
      )}
    </Button>
  );
};
