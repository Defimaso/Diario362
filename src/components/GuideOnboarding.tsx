import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, X, ChevronRight, CheckCircle2, Sparkles, ArrowRight,
  TrendingUp, LayoutGrid, ClipboardCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const GUIDE_SEEN_KEY = 'diario_guide_seen';
const TOUR_VERSION = 'v2';

export interface GuideOnboardingProps {
  userId: string;
  onOpenCheckin?: () => void;
}

interface TourStep {
  id: string;
  targetId: string | null;
  title: string;
  body: string;
  emoji: string;
  tipPosition: 'above' | 'below' | 'center';
  primaryLabel: string;
  primaryAction: 'next' | 'checkin' | 'close';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    targetId: null,
    title: 'Benvenuta nel tuo Diario! 🎉',
    body: 'Questo è il tuo spazio personale per tracciare ogni giorno il tuo percorso. Ti mostro come funziona in pochi step.',
    emoji: '🌟',
    tipPosition: 'center',
    primaryLabel: 'Dai, mostrami!',
    primaryAction: 'next',
  },
  {
    id: 'checkin',
    targetId: 'tour-checkin',
    title: 'Il tuo gesto quotidiano 🔴',
    body: 'Ogni giorno tocca questo bottone rosso. Compila recovery, energia e mindset — bastano 60 secondi. Questa è l\'abitudine che cambia tutto.',
    emoji: '🔴',
    tipPosition: 'below',
    primaryLabel: 'Capito →',
    primaryAction: 'next',
  },
  {
    id: 'momentum',
    targetId: 'tour-momentum',
    title: 'Il tuo Momentum ⭕',
    body: 'Questo cerchio si riempie ogni giorno che compili il diario. Più lo riempi, più sei costante. La costanza fa la differenza.',
    emoji: '⭕',
    tipPosition: 'below',
    primaryLabel: 'Capito →',
    primaryAction: 'next',
  },
  {
    id: 'actions',
    targetId: 'tour-actions',
    title: 'I tuoi strumenti 🗂️',
    body: 'Da qui accedi ai messaggi col coach, al programma di allenamento e alla dieta personalizzata. Tutto in un posto.',
    emoji: '🗂️',
    tipPosition: 'above',
    primaryLabel: 'Perfetto →',
    primaryAction: 'next',
  },
  {
    id: 'start',
    targetId: null,
    title: 'Sei pronta! 💪',
    body: 'Fai subito il tuo primo check-in. Meno di 2 minuti, e segna l\'inizio del tuo percorso.',
    emoji: '🚀',
    tipPosition: 'center',
    primaryLabel: 'Faccio il primo check-in ora!',
    primaryAction: 'checkin',
  },
];

const PADDING = 10;
const TOOLTIP_MAX_W = 320;

export const GuideOnboarding = ({ userId, onOpenCheckin }: GuideOnboardingProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const storageKey = `${GUIDE_SEEN_KEY}_${userId}_${TOUR_VERSION}`;

  // Mostra solo al primo accesso
  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      const t = setTimeout(() => setShowTour(true), 900);
      return () => clearTimeout(t);
    }
  }, [storageKey]);

  const currentStep = TOUR_STEPS[stepIndex];

  // Misura l'elemento e scrolla su di esso
  const measureAndScroll = useCallback(() => {
    const id = currentStep?.targetId;
    if (!id) { setRect(null); return; }
    const el = document.getElementById(id);
    if (!el) { setRect(null); return; }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const after = setTimeout(() => {
      const r = document.getElementById(id)?.getBoundingClientRect() ?? null;
      setRect(r);
    }, 450);
    return () => clearTimeout(after);
  }, [currentStep?.targetId]);

  useEffect(() => {
    if (!showTour) return;
    const cleanup = measureAndScroll();
    return cleanup;
  }, [showTour, stepIndex, measureAndScroll]);

  // Blocca scroll body durante il tour (solo quando non c'è target)
  useEffect(() => {
    if (showTour && !currentStep?.targetId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showTour, currentStep?.targetId]);

  const closeTour = useCallback(() => {
    setShowTour(false);
    localStorage.setItem(storageKey, 'true');
  }, [storageKey]);

  const handlePrimary = useCallback(() => {
    if (currentStep.primaryAction === 'next') {
      if (stepIndex < TOUR_STEPS.length - 1) {
        setStepIndex(s => s + 1);
      } else {
        closeTour();
      }
    } else if (currentStep.primaryAction === 'checkin') {
      closeTour();
      onOpenCheckin?.();
    } else {
      closeTour();
    }
  }, [currentStep, stepIndex, closeTour, onOpenCheckin]);

  if (!showTour) return null;

  const isCenter = currentStep.tipPosition === 'center' || !rect;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Highlight box
  const hl = rect
    ? {
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        w: rect.width + PADDING * 2,
        h: rect.height + PADDING * 2,
      }
    : null;

  // Calcola posizione tooltip (sempre dentro viewport)
  const tooltipLeft = hl
    ? Math.max(12, Math.min(hl.left, vw - TOOLTIP_MAX_W - 12))
    : vw / 2 - Math.min(TOOLTIP_MAX_W, vw - 32) / 2;

  const tooltipTop = hl
    ? currentStep.tipPosition === 'below'
      ? hl.top + hl.h + 10
      : Math.max(70, hl.top - 220)
    : vh / 2 - 140;

  const tooltipW = Math.min(TOOLTIP_MAX_W, vw - 24);
  const progress = ((stepIndex + 1) / TOUR_STEPS.length) * 100;

  return (
    <AnimatePresence>
      {showTour && (
        <>
          {/* ── Overlay: 4 rettangoli scuri + area trasparente sul target ── */}
          {hl ? (
            <>
              {/* sopra */}
              <div className="fixed z-[300] bg-black/70 pointer-events-none"
                style={{ top: 0, left: 0, right: 0, height: Math.max(0, hl.top) }} />
              {/* sotto */}
              <div className="fixed z-[300] bg-black/70 pointer-events-none"
                style={{ top: hl.top + hl.h, left: 0, right: 0, bottom: 0 }} />
              {/* sinistra */}
              <div className="fixed z-[300] bg-black/70 pointer-events-none"
                style={{ top: hl.top, left: 0, width: Math.max(0, hl.left), height: hl.h }} />
              {/* destra */}
              <div className="fixed z-[300] bg-black/70 pointer-events-none"
                style={{ top: hl.top, left: hl.left + hl.w, right: 0, height: hl.h }} />
              {/* ring sull'elemento */}
              <motion.div
                key={`ring-${stepIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed z-[301] rounded-xl border-2 border-primary pointer-events-none"
                style={{ top: hl.top, left: hl.left, width: hl.w, height: hl.h,
                  boxShadow: '0 0 0 3px hsl(var(--primary) / 0.25)' }}
              />
            </>
          ) : (
            /* overlay completo quando non c'è target */
            <div className="fixed inset-0 z-[300] bg-black/75" onClick={closeTour} />
          )}

          {/* ── Tap-to-skip area ── */}
          {hl && (
            <div className="fixed inset-0 z-[302]" onClick={closeTour} style={{ pointerEvents: 'auto' }}>
              {/* buco cliccabile sull'elemento stesso (passa il click) */}
              <div style={{ position: 'absolute', top: hl.top, left: hl.left, width: hl.w, height: hl.h, pointerEvents: 'none' }} />
            </div>
          )}

          {/* ── Freccia sopra/sotto ── */}
          {hl && currentStep.tipPosition === 'below' && (
            <div
              className="fixed z-[304] w-3 h-3 rotate-45 border-t-2 border-l-2 border-primary bg-card"
              style={{ top: tooltipTop - 7, left: tooltipLeft + 20 }}
            />
          )}
          {hl && currentStep.tipPosition === 'above' && (
            <div
              className="fixed z-[304] w-3 h-3 rotate-[225deg] border-t-2 border-l-2 border-primary bg-card"
              style={{ top: tooltipTop + /* card height approx */ 200 - 5, left: tooltipLeft + 20 }}
            />
          )}

          {/* ── Tooltip / Modal card ── */}
          <motion.div
            key={`card-${stepIndex}`}
            initial={{ opacity: 0, y: currentStep.tipPosition === 'below' ? -6 : 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="fixed z-[305] pointer-events-auto"
            style={{ top: tooltipTop, left: tooltipLeft, width: tooltipW }}
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* progress bar */}
              <div className="h-1 bg-muted">
                <motion.div className="h-full bg-primary" animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} />
              </div>

              <div className="p-4">
                {/* header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none">{currentStep.emoji}</span>
                    <div>
                      <p className="font-bold text-sm leading-snug">{currentStep.title}</p>
                      <p className="text-[10px] text-muted-foreground">{stepIndex + 1} di {TOUR_STEPS.length}</p>
                    </div>
                  </div>
                  <button onClick={closeTour} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* body */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{currentStep.body}</p>

                {/* dot progress */}
                <div className="flex items-center gap-1.5 mb-3">
                  {TOUR_STEPS.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === stepIndex ? 'w-4 bg-primary' : i < stepIndex ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-muted'
                    }`} />
                  ))}
                </div>

                {/* buttons */}
                <Button
                  onClick={handlePrimary}
                  className={`w-full h-11 font-semibold ${
                    currentStep.primaryAction === 'checkin'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : ''
                  }`}
                >
                  {currentStep.primaryAction === 'checkin'
                    ? <><CheckCircle2 className="w-4 h-4 mr-2" />{currentStep.primaryLabel}</>
                    : <>{currentStep.primaryLabel}<ChevronRight className="w-4 h-4 ml-1" /></>
                  }
                </Button>

                {stepIndex < TOUR_STEPS.length - 1 && (
                  <button onClick={closeTour} className="w-full text-xs text-muted-foreground text-center pt-2 pb-0.5 hover:text-foreground transition-colors">
                    Salta la guida
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Pulsante guida header ─────────────────────────────────────────────────
export const GuideButton = () => {
  const navigate = useNavigate();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 30000);
    return () => clearTimeout(t);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate('/guida')}
      className="relative text-primary hover:text-primary/80 w-8 h-8"
      title="Guida app"
    >
      <BookOpen className="w-4 h-4" />
      {pulse && <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-primary animate-ping" />}
      {pulse && <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-primary" />}
    </Button>
  );
};

// backward compat exports
export { Sparkles, ArrowRight, TrendingUp, LayoutGrid, ClipboardCheck };
