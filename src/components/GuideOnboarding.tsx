import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, X, ClipboardCheck, TrendingUp,
  ArrowRight, Sparkles, ChevronRight, LayoutGrid,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const GUIDE_SEEN_KEY = 'diario_guide_seen';
const TOUR_VERSION = 'v2'; // bump per forzare re-show su utenti esistenti

interface GuideOnboardingProps {
  userId: string;
  /** Apre il modal check-in dall'esterno */
  onOpenCheckin?: () => void;
}

interface TourStep {
  id: string;
  targetId: string | null; // ID DOM elemento da evidenziare (null = no highlight)
  title: string;
  body: string;
  emoji: string;
  tipPosition: 'top' | 'bottom' | 'center'; // dove appare il tooltip rispetto all'elemento
  primaryLabel: string;
  primaryAction: 'next' | 'checkin' | 'close';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    targetId: null,
    title: 'Benvenuta nel tuo Diario! 🎉',
    body: 'Questo è il tuo spazio personale per tracciare ogni giorno il tuo percorso di trasformazione. Ti mostro in 3 secondi come funziona.',
    emoji: '🌟',
    tipPosition: 'center',
    primaryLabel: 'Dai, mostrami!',
    primaryAction: 'next',
  },
  {
    id: 'checkin',
    targetId: 'tour-checkin',
    title: 'Il tuo gesto quotidiano',
    body: 'Ogni giorno tocca questo bottone rosso e compila il diario. Recovery, energia, mindset — bastano 60 secondi. Questa è l\'abitudine che fa la differenza.',
    emoji: '🔴',
    tipPosition: 'bottom',
    primaryLabel: 'Capito, avanti →',
    primaryAction: 'next',
  },
  {
    id: 'momentum',
    targetId: 'tour-momentum',
    title: 'Il tuo Momentum',
    body: 'Questo cerchio si riempie ogni giorno che compili il diario. Più è pieno, più sei costante. Tornare ogni giorno è il segreto.',
    emoji: '⭕',
    tipPosition: 'bottom',
    primaryLabel: 'Capito, avanti →',
    primaryAction: 'next',
  },
  {
    id: 'actions',
    targetId: 'tour-actions',
    title: 'I tuoi strumenti',
    body: 'Da qui accedi ai messaggi col coach, al tuo programma di allenamento e alla dieta personalizzata. Tutto in un posto solo.',
    emoji: '🗂️',
    tipPosition: 'top',
    primaryLabel: 'Perfetto, avanti →',
    primaryAction: 'next',
  },
  {
    id: 'start',
    targetId: null,
    title: 'Sei pronta a iniziare! 💪',
    body: 'Fai subito il tuo primo check-in. Ci vogliono meno di 2 minuti e segna l\'inizio del tuo percorso.',
    emoji: '🚀',
    tipPosition: 'center',
    primaryLabel: 'Faccio il primo check-in ora!',
    primaryAction: 'checkin',
  },
];

// Calcola il rect dell'elemento target per posizionare il tooltip e l'overlay
function getTargetRect(targetId: string | null): DOMRect | null {
  if (!targetId) return null;
  const el = document.getElementById(targetId);
  if (!el) return null;
  return el.getBoundingClientRect();
}

export const GuideOnboarding = ({ userId, onOpenCheckin }: GuideOnboardingProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const navigate = useNavigate();

  const storageKey = `${GUIDE_SEEN_KEY}_${userId}_${TOUR_VERSION}`;

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      const timer = setTimeout(() => setShowTour(true), 900);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const currentStep = TOUR_STEPS[stepIndex];

  // Aggiorna il rect quando cambia lo step
  const updateRect = useCallback(() => {
    if (!currentStep?.targetId) {
      setTargetRect(null);
      return;
    }
    const rect = getTargetRect(currentStep.targetId);
    setTargetRect(rect);
  }, [currentStep?.targetId]);

  useEffect(() => {
    if (!showTour) return;
    updateRect();
    // Scroll to element
    if (currentStep?.targetId) {
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Ricomisuriamo dopo scroll
        const t = setTimeout(updateRect, 400);
        return () => clearTimeout(t);
      }
    }
  }, [showTour, stepIndex, currentStep?.targetId, updateRect]);

  const closeTour = useCallback(() => {
    setShowTour(false);
    localStorage.setItem(storageKey, 'true');
  }, [storageKey]);

  const handlePrimary = useCallback(() => {
    const action = currentStep.primaryAction;
    if (action === 'next') {
      if (stepIndex < TOUR_STEPS.length - 1) {
        setStepIndex(s => s + 1);
      } else {
        closeTour();
      }
    } else if (action === 'checkin') {
      closeTour();
      onOpenCheckin?.();
    } else {
      closeTour();
    }
  }, [currentStep, stepIndex, closeTour, onOpenCheckin]);

  const handleSkip = useCallback(() => closeTour(), [closeTour]);

  if (!showTour) return null;

  const isCenter = currentStep.tipPosition === 'center' || !targetRect;
  const PADDING = 12; // px di padding intorno all'elemento evidenziato

  // Calcola dimensioni highlight
  const highlight = targetRect
    ? {
        top: targetRect.top - PADDING,
        left: targetRect.left - PADDING,
        width: targetRect.width + PADDING * 2,
        height: targetRect.height + PADDING * 2,
      }
    : null;

  // Posizione del tooltip
  const getTooltipStyle = (): React.CSSProperties => {
    if (!highlight || isCenter) return {};
    const vw = window.innerWidth;
    const left = Math.max(16, Math.min(highlight.left, vw - 340));

    if (currentStep.tipPosition === 'bottom') {
      return {
        top: highlight.top + highlight.height + 12,
        left,
        width: Math.min(340, vw - 32),
      };
    } else {
      // top
      return {
        top: Math.max(60, highlight.top - 180),
        left,
        width: Math.min(340, vw - 32),
      };
    }
  };

  const progress = ((stepIndex + 1) / TOUR_STEPS.length) * 100;

  return (
    <AnimatePresence>
      {showTour && (
        <>
          {/* Overlay scuro con "buco" sull'elemento */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] pointer-events-none"
            style={{
              background: highlight
                ? `
                    linear-gradient(to bottom, rgba(0,0,0,0.7) ${highlight.top}px, transparent ${highlight.top}px),
                    linear-gradient(to top, rgba(0,0,0,0.7) ${window.innerHeight - highlight.top - highlight.height}px, transparent ${window.innerHeight - highlight.top - highlight.height}px),
                    linear-gradient(to right, rgba(0,0,0,0.7) ${highlight.left}px, transparent ${highlight.left}px),
                    linear-gradient(to left, rgba(0,0,0,0.7) ${window.innerWidth - highlight.left - highlight.width}px, transparent ${window.innerWidth - highlight.left - highlight.width}px)
                  `
                : 'rgba(0,0,0,0.75)',
            }}
          />

          {/* Ring sull'elemento evidenziato */}
          {highlight && (
            <motion.div
              key={`ring-${stepIndex}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-[301] pointer-events-none rounded-2xl border-2 border-primary shadow-[0_0_0_4px_rgba(var(--primary-rgb),0.3)]"
              style={{
                top: highlight.top,
                left: highlight.left,
                width: highlight.width,
                height: highlight.height,
              }}
            />
          )}

          {/* Tooltip posizionato / Modal centrale */}
          {isCenter ? (
            /* Step senza target → modal centrato */
            <>
              <motion.div
                key="backdrop-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[302] pointer-events-auto"
                onClick={handleSkip}
              />
              <motion.div
                key={`tooltip-center-${stepIndex}`}
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[303] max-w-sm mx-auto pointer-events-auto"
              >
                <TourCard
                  step={currentStep}
                  stepIndex={stepIndex}
                  total={TOUR_STEPS.length}
                  progress={progress}
                  onPrimary={handlePrimary}
                  onSkip={handleSkip}
                />
              </motion.div>
            </>
          ) : (
            /* Tooltip posizionato accanto all'elemento */
            <>
              <motion.div
                key="backdrop-pos"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[302] pointer-events-auto"
                onClick={handleSkip}
              />
              <motion.div
                key={`tooltip-${stepIndex}`}
                initial={{ opacity: 0, y: currentStep.tipPosition === 'bottom' ? -8 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                className="fixed z-[303] pointer-events-auto"
                style={getTooltipStyle()}
              >
                {/* Freccia */}
                {currentStep.tipPosition === 'bottom' && (
                  <div className="ml-6 mb-1 w-3 h-3 border-l-2 border-t-2 border-primary rotate-45 bg-card" />
                )}
                <TourCard
                  step={currentStep}
                  stepIndex={stepIndex}
                  total={TOUR_STEPS.length}
                  progress={progress}
                  onPrimary={handlePrimary}
                  onSkip={handleSkip}
                />
                {currentStep.tipPosition === 'top' && (
                  <div className="ml-6 mt-1 w-3 h-3 border-r-2 border-b-2 border-primary rotate-45 bg-card" />
                )}
              </motion.div>
            </>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Card interna del tooltip ──────────────────────────────────────────────
interface TourCardProps {
  step: TourStep;
  stepIndex: number;
  total: number;
  progress: number;
  onPrimary: () => void;
  onSkip: () => void;
}

const TourCard = ({ step, stepIndex, total, progress, onPrimary, onSkip }: TourCardProps) => {
  const isLast = stepIndex === total - 1;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-muted w-full">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{step.emoji}</span>
            <div>
              <p className="font-bold text-sm leading-tight">{step.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {stepIndex + 1} di {total}
              </p>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {step.body}
        </p>

        {/* Dots progress */}
        <div className="flex items-center gap-1.5 mb-4">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === stepIndex
                  ? 'w-4 bg-primary'
                  : i < stepIndex
                  ? 'w-1.5 bg-primary/40'
                  : 'w-1.5 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={onPrimary}
            className={`w-full h-11 font-semibold ${
              isLast
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-primary text-primary-foreground'
            }`}
          >
            {isLast ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {step.primaryLabel}
              </>
            ) : (
              <>
                {step.primaryLabel}
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>

          {stepIndex < total - 1 && (
            <button
              onClick={onSkip}
              className="text-xs text-muted-foreground text-center py-1 hover:text-foreground transition-colors"
            >
              Salta la guida
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Pulsante guida (header) ───────────────────────────────────────────────
export const GuideButton = () => {
  const navigate = useNavigate();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    const timer = setTimeout(() => setPulse(false), 30000);
    return () => clearTimeout(timer);
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
      {pulse && (
        <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-primary animate-ping" />
      )}
      {pulse && (
        <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-primary" />
      )}
    </Button>
  );
};

// Esporta anche icone usate altrove (backward compat)
export { BookOpen, Sparkles, ArrowRight, TrendingUp, LayoutGrid, ClipboardCheck };
