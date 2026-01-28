import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Battery, Zap, Brain, Utensils, Sparkles, Dumbbell, ChevronRight, Check, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useCheckins, DailyCheckin } from "@/hooks/useCheckins";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CheckinModalRedesignProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  existingCheckin?: DailyCheckin | null;
}

const steps = [
  { 
    id: 'recovery', 
    title: '💤 Recupero', 
    subtitle: 'Qualità del sonno e riposo',
    description: 'Valuta la qualità del tuo sonno (quanto profondamente hai dormito) e la sensazione di riposo al risveglio.',
    icon: Battery,
    lowLabel: 'Sonno pessimo',
    highLabel: 'Super riposato'
  },
  { 
    id: 'nutrition', 
    title: '🍎 Alimentazione', 
    subtitle: 'Aderenza al piano nutrizionale',
    description: 'Quanto hai seguito il tuo piano alimentare oggi? Aggiungi note per dettagli.',
    icon: Utensils,
    lowLabel: 'Fuori piano',
    highLabel: 'Perfetto'
  },
  { 
    id: 'training', 
    title: '💪 Allenamento', 
    subtitle: 'Intensità e qualità dell\'esecuzione',
    description: 'Valuta l\'intensità e la qualità del tuo allenamento. Se è giorno di riposo, seleziona "X".',
    icon: Dumbbell,
    lowLabel: 'Scarso',
    highLabel: 'Eccellente'
  },
  { 
    id: 'energy', 
    title: '⚡ Energia Fisica', 
    subtitle: 'Forza e vitalità percepita',
    description: 'La tua forza fisica percepita e la reale voglia/capacità di affrontare la giornata.',
    icon: Zap,
    lowLabel: 'Esaurito',
    highLabel: 'Pieno di energia'
  },
  { 
    id: 'mindset', 
    title: '🧠 Mindset', 
    subtitle: 'Stato mentale e focus',
    description: 'Il tuo stato mentale: quanto sei carico e focalizzato (10) vs stressato, scarico o demotivato (1).',
    icon: Brain,
    lowLabel: 'Sopraffatto',
    highLabel: 'Super focalizzato'
  },
  { 
    id: 'diary', 
    title: '📝 Diario Giornaliero', 
    subtitle: "Racconta la tua giornata",
    description: 'Condividi le tue sensazioni, fatiche o vittorie di oggi.',
    icon: Sparkles,
    lowLabel: '',
    highLabel: ''
  },
];

const CheckinModalRedesign = ({ isOpen, onClose, onComplete, existingCheckin }: CheckinModalRedesignProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [recovery, setRecovery] = useState(5);
  const [nutritionScore, setNutritionScore] = useState(5);
  const [nutritionNotes, setNutritionNotes] = useState("");
  const [trainingScore, setTrainingScore] = useState(5);
  const [isRestDay, setIsRestDay] = useState(false);
  const [energy, setEnergy] = useState(5);
  const [mindset, setMindset] = useState(5);
  const [diary, setDiary] = useState("");
  const [showLowMindsetAlert, setShowLowMindsetAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { saveCheckin } = useCheckins();
  const { toast } = useToast();

  // Load existing data if editing
  useEffect(() => {
    if (existingCheckin) {
      setRecovery(existingCheckin.recovery || 5);
      // Handle legacy nutrition_adherence (boolean) or new nutrition_score
      const existingNutritionScore = (existingCheckin as any).nutrition_score;
      if (existingNutritionScore !== undefined && existingNutritionScore !== null) {
        setNutritionScore(existingNutritionScore);
      } else {
        setNutritionScore(existingCheckin.nutrition_adherence ? 8 : 4);
      }
      setNutritionNotes((existingCheckin as any).nutrition_notes || "");
      
      const existingTrainingScore = (existingCheckin as any).training_score;
      const existingRestDay = (existingCheckin as any).training_rest_day;
      if (existingRestDay) {
        setIsRestDay(true);
      } else if (existingTrainingScore !== undefined && existingTrainingScore !== null) {
        setTrainingScore(existingTrainingScore);
      }
      
      setEnergy(existingCheckin.energy || 5);
      setMindset(existingCheckin.mindset || 5);
      setDiary(existingCheckin.two_percent_edge || "");
    }
  }, [existingCheckin]);

  const handleNext = () => {
    if (currentStep === 4 && mindset < 5) {
      setShowLowMindsetAlert(true);
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const checkinData: any = {
      recovery,
      nutrition_adherence: nutritionScore >= 6, // Legacy compatibility
      energy,
      mindset,
      two_percent_edge: diary,
      nutrition_score: nutritionScore,
      nutrition_notes: nutritionNotes,
      training_score: isRestDay ? null : trainingScore,
      training_rest_day: isRestDay,
    };

    const { error } = await saveCheckin(checkinData);

    setIsSubmitting(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Non è stato possibile salvare il check-in',
      });
    } else {
      toast({
        title: 'Check-in completato! ✨',
        description: 'Il tuo progresso è stato registrato',
      });
      onComplete();
      resetForm();
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setRecovery(5);
    setNutritionScore(5);
    setNutritionNotes("");
    setTrainingScore(5);
    setIsRestDay(false);
    setEnergy(5);
    setMindset(5);
    setDiary("");
    setShowLowMindsetAlert(false);
  };

  const CurrentIcon = steps[currentStep].icon;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md card-elegant-accent rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
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
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <CurrentIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{steps[currentStep].title}</h2>
              <p className="text-sm text-muted-foreground">{steps[currentStep].subtitle}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-6 p-3 rounded-lg bg-muted/30">
            {steps[currentStep].description}
          </p>

          {/* Content */}
          <div className="min-h-[180px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Recovery - Step 0 */}
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
                      <span>{steps[0].lowLabel}</span>
                      <span className="text-3xl font-bold gradient-text">{recovery}</span>
                      <span>{steps[0].highLabel}</span>
                    </div>
                  </div>
                )}

                {/* Nutrition - Step 1 */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <Slider
                      value={[nutritionScore]}
                      onValueChange={([val]) => setNutritionScore(val)}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{steps[1].lowLabel}</span>
                      <span className="text-3xl font-bold gradient-text">{nutritionScore}</span>
                      <span>{steps[1].highLabel}</span>
                    </div>
                    <Textarea
                      placeholder="Note: sgarro, evento speciale, osservazioni..."
                      value={nutritionNotes}
                      onChange={e => setNutritionNotes(e.target.value)}
                      className="min-h-[80px] bg-muted border-muted focus:border-primary resize-none"
                    />
                  </div>
                )}

                {/* Training - Step 2 */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    {/* Rest Day Toggle */}
                    <div className="flex justify-center mb-4">
                      <button
                        onClick={() => setIsRestDay(!isRestDay)}
                        className={cn(
                          "px-6 py-3 rounded-xl border-2 transition-all duration-300 font-medium",
                          isRestDay 
                            ? "border-primary bg-primary/10 text-primary" 
                            : "border-muted hover:border-muted-foreground/30 text-muted-foreground"
                        )}
                      >
                        <X className="w-5 h-5 inline mr-2" />
                        Giorno di Riposo
                      </button>
                    </div>

                    {!isRestDay && (
                      <>
                        <Slider
                          value={[trainingScore]}
                          onValueChange={([val]) => setTrainingScore(val)}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{steps[2].lowLabel}</span>
                          <span className="text-3xl font-bold gradient-text">{trainingScore}</span>
                          <span>{steps[2].highLabel}</span>
                        </div>
                      </>
                    )}

                    {isRestDay && (
                      <div className="text-center p-4 rounded-lg bg-muted/30">
                        <p className="text-muted-foreground">
                          Il punteggio allenamento non influenzerà la media giornaliera
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Energy - Step 3 */}
                {currentStep === 3 && (
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
                      <span>{steps[3].lowLabel}</span>
                      <span className="text-3xl font-bold gradient-text">{energy}</span>
                      <span>{steps[3].highLabel}</span>
                    </div>
                  </div>
                )}

                {/* Mindset - Step 4 */}
                {currentStep === 4 && (
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
                      <span>{steps[4].lowLabel}</span>
                      <span className="text-3xl font-bold gradient-text">{mindset}</span>
                      <span>{steps[4].highLabel}</span>
                    </div>
                  </div>
                )}

                {/* Diary - Step 5 */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    {showLowMindsetAlert && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/30"
                      >
                        <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                        <p className="text-sm">
                          <a 
                            href="https://sso.teachable.com/secure/564301/identity/login/otp" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary underline hover:no-underline"
                          >
                            Ti senti giù? Guarda il video sul mindset nell'Area Privata
                          </a>
                          <br />
                          <span className="text-xs text-muted-foreground">
                            Nota: Usa le stesse credenziali di Teachable
                          </span>
                        </p>
                      </motion.div>
                    )}
                    <Textarea
                      placeholder="Racconta come è andata la tua giornata, le tue sensazioni o le tue fatiche..."
                      value={diary}
                      onChange={e => setDiary(e.target.value)}
                      className="min-h-[120px] bg-muted border-muted focus:border-primary resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-center italic">
                      "Il tuo diario personale per tracciare il percorso verso il 2% extra."
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
              disabled={isSubmitting}
            >
              {currentStep === 0 ? "Annulla" : "Indietro"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 coral-glow"
            >
              {isSubmitting ? "Salvataggio..." : currentStep === steps.length - 1 ? "Completa" : "Avanti"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheckinModalRedesign;
