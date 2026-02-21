import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Battery, Zap, Brain, Utensils, Sparkles, ChevronRight, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { saveCheckin } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface DailyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const steps = [
  { id: 'recovery', title: 'Recupero', subtitle: 'Come ti sei ripreso oggi?', icon: Battery },
  { id: 'nutrition', title: 'Nutrizione', subtitle: 'Hai rispettato i tuoi macro?', icon: Utensils },
  { id: 'energy', title: 'Energia', subtitle: 'Valuta il tuo livello di energia', icon: Zap },
  { id: 'mindset', title: 'Mindset', subtitle: 'Quanto sei focalizzato?', icon: Brain },
  { id: 'edge', title: 'Il 2% Extra', subtitle: "Qual è stata la tua azione extra oggi?", icon: Sparkles },
];

const DailyCheckinModal = ({ isOpen, onClose, onComplete }: DailyCheckinModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [recovery, setRecovery] = useState(5);
  const [nutritionHit, setNutritionHit] = useState<boolean | null>(null);
  const [energy, setEnergy] = useState(5);
  const [mindset, setMindset] = useState(5);
  const [twoPercentEdge, setTwoPercentEdge] = useState("");
  const [showLowMindsetAlert, setShowLowMindsetAlert] = useState(false);

  const handleNext = () => {
    if (currentStep === 3 && mindset < 5) {
      setShowLowMindsetAlert(true);
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const today = new Date().toISOString().split('T')[0];
    saveCheckin({
      date: today,
      recovery,
      nutritionHit: nutritionHit ?? false,
      energy,
      mindset,
      twoPercentEdge,
    });
    onComplete();
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep(0);
    setRecovery(5);
    setNutritionHit(null);
    setEnergy(5);
    setMindset(5);
    setTwoPercentEdge("");
    setShowLowMindsetAlert(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return nutritionHit !== null;
      default:
        return true;
    }
  };

  const CurrentIcon = steps[currentStep].icon;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md card-elegant-accent rounded-2xl p-6"
        >
          {/* Progress */}
          <div className="flex gap-1 mb-6">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  idx <= currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <CurrentIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{steps[currentStep].title}</h2>
              <p className="text-sm text-muted-foreground">{steps[currentStep].subtitle}</p>
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[160px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Recovery */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <Slider
                      value={[recovery]}
                      onValueChange={([val]) => setRecovery(val)}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Scarico</span>
                      <span className="text-2xl font-bold gradient-text">{recovery}</span>
                      <span>Ricaricato</span>
                    </div>
                  </div>
                )}

                {/* Nutrition */}
                {currentStep === 1 && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => setNutritionHit(true)}
                      className={cn(
                        "flex-1 p-6 rounded-xl border-2 transition-all duration-300",
                        nutritionHit === true 
                          ? "border-primary bg-primary/10 teal-glow"
                          : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      <Check className={cn(
                        "w-8 h-8 mx-auto mb-2",
                        nutritionHit === true ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className="font-medium">Sì</span>
                    </button>
                    <button
                      onClick={() => setNutritionHit(false)}
                      className={cn(
                        "flex-1 p-6 rounded-xl border-2 transition-all duration-300",
                        nutritionHit === false 
                          ? "border-destructive bg-destructive/10" 
                          : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      <span className={cn(
                        "block w-8 h-8 mx-auto mb-2 rounded-full border-2",
                        nutritionHit === false ? "border-destructive" : "border-muted-foreground"
                      )} />
                      <span className="font-medium">No</span>
                    </button>
                  </div>
                )}

                {/* Energy */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <Slider
                      value={[energy]}
                      onValueChange={([val]) => setEnergy(val)}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Bassa</span>
                      <span className="text-2xl font-bold gradient-text">{energy}</span>
                      <span>Al massimo</span>
                    </div>
                  </div>
                )}

                {/* Mindset */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <Slider
                      value={[mindset]}
                      onValueChange={([val]) => setMindset(val)}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>In difficoltà</span>
                      <span className="text-2xl font-bold gradient-text">{mindset}</span>
                      <span>Super focalizzato</span>
                    </div>
                  </div>
                )}

                {/* 2% Edge */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    {showLowMindsetAlert && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/30"
                      >
                        <AlertTriangle className="w-5 h-5 text-warning" />
                        <p className="text-sm">
                          <a 
                            href="https://sso.teachable.com/secure/564301/identity/login/otp"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline hover:no-underline"
                          >
                            Ti senti giù? Guarda questo video sul mindset nella sezione Allenamento Personalizzato
                          </a>
                        </p>
                      </motion.div>
                    )}
                    <Textarea
                      placeholder="Doccia fredda, 10 min extra di meditazione, ho scelto le scale..."
                      value={twoPercentEdge}
                      onChange={e => setTwoPercentEdge(e.target.value)}
                      className="min-h-[100px] bg-muted border-muted focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground text-center italic">
                      "Non accontentarti di 360°. Trova il tuo 2% extra."
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? onClose : () => setCurrentStep(prev => prev - 1)}
              className="flex-1"
            >
              {currentStep === 0 ? "Annulla" : "Indietro"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 coral-glow"
            >
              {currentStep === steps.length - 1 ? "Completa" : "Avanti"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DailyCheckinModal;
