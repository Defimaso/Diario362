import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import FunnelProgressBar from "@/components/funnel/FunnelProgressBar";
import FunnelInterstitial from "@/components/funnel/FunnelInterstitial";
import FunnelResult from "@/components/funnel/FunnelResult";
import SingleChoiceStep from "@/components/funnel/steps/SingleChoiceStep";
import NumericInputStep from "@/components/funnel/steps/NumericInputStep";
import TextInputStep from "@/components/funnel/steps/TextInputStep";
import MultiChoiceStep from "@/components/funnel/steps/MultiChoiceStep";
import BooleanStep from "@/components/funnel/steps/BooleanStep";

interface FunnelData {
  // Block 1: Bio & Goal
  gender: string;
  age: number | null;
  height: number | null;
  current_weight: number | null;
  target_weight: number | null;
  body_type: string;
  min_historic_size: string;
  special_event: string;
  
  // Block 2: Metabolism & Health
  metabolism: string;
  health_conditions: string[];
  medications: string;
  digestion: string;
  energy_level: string;
  sleep_hours: number | null;
  wake_quality: string;
  water_liters: number | null;
  
  // Block 3: Nutrition
  meals_per_day: number | null;
  snacking_habit: string;
  late_eating: boolean | null;
  weakness: string;
  eating_out_frequency: string;
  alcohol_frequency: string;
  skip_breakfast: boolean | null;
  allergies: string;
  diet_type: string;
  
  // Block 4: Psychology
  why_now: string;
  previous_diets: string[];
  past_obstacle: string;
  stress_eating: boolean | null;
  post_cheat_feeling: string;
  biggest_fear: string;
  home_support: boolean | null;
  motivation_source: string;
  weekend_challenge: string;
  
  // Block 5: Training
  daily_activity: string;
  preferred_location: string;
  weekly_sessions: string;
  session_duration: string;
  cardio_preference: string;
  home_equipment: string;
  injuries: string;
  experience_level: string;
  commit_daily_diary: boolean | null;
  
  // Final
  name: string;
  email: string;

  // Tracking
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  user_agent: string | null;
  referrer: string | null;
}

const initialData: FunnelData = {
  gender: "",
  age: null,
  height: null,
  current_weight: null,
  target_weight: null,
  body_type: "",
  min_historic_size: "",
  special_event: "",
  metabolism: "",
  health_conditions: [],
  medications: "",
  digestion: "",
  energy_level: "",
  sleep_hours: null,
  wake_quality: "",
  water_liters: null,
  meals_per_day: null,
  snacking_habit: "",
  late_eating: null,
  weakness: "",
  eating_out_frequency: "",
  alcohol_frequency: "",
  skip_breakfast: null,
  allergies: "",
  diet_type: "",
  why_now: "",
  previous_diets: [],
  past_obstacle: "",
  stress_eating: null,
  post_cheat_feeling: "",
  biggest_fear: "",
  home_support: null,
  motivation_source: "",
  weekend_challenge: "",
  daily_activity: "",
  preferred_location: "",
  weekly_sessions: "",
  session_duration: "",
  cardio_preference: "",
  home_equipment: "",
  injuries: "",
  experience_level: "",
  commit_daily_diary: null,
  name: "",
  email: "",
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null,
  user_agent: null,
  referrer: null,
};

type StepType = "question" | "interstitial" | "result";

interface Step {
  type: StepType;
  id: string;
  interstitialType?: "bio" | "metabolism" | "nutrition" | "psychology" | "training";
}

// Define all steps (51 total: 45 questions + 5 interstitials + 1 result)
const steps: Step[] = [
  // Block 1: Bio & Goal (8 domande + 1 interstitial)
  { type: "question", id: "gender" },
  { type: "question", id: "age" },
  { type: "question", id: "height" },
  { type: "question", id: "current_weight" },
  { type: "question", id: "target_weight" },
  { type: "question", id: "body_type" },
  { type: "question", id: "min_historic_size" },
  { type: "question", id: "special_event" },
  { type: "interstitial", id: "interstitial_bio", interstitialType: "bio" },
  
  // Block 2: Metabolism & Health (8 domande + 1 interstitial)
  { type: "question", id: "metabolism" },
  { type: "question", id: "health_conditions" },
  { type: "question", id: "medications" },
  { type: "question", id: "digestion" },
  { type: "question", id: "energy_level" },
  { type: "question", id: "sleep_hours" },
  { type: "question", id: "wake_quality" },
  { type: "question", id: "water_liters" },
  { type: "interstitial", id: "interstitial_metabolism", interstitialType: "metabolism" },
  
  // Block 3: Nutrition (9 domande + 1 interstitial)
  { type: "question", id: "meals_per_day" },
  { type: "question", id: "snacking_habit" },
  { type: "question", id: "late_eating" },
  { type: "question", id: "weakness" },
  { type: "question", id: "eating_out_frequency" },
  { type: "question", id: "alcohol_frequency" },
  { type: "question", id: "skip_breakfast" },
  { type: "question", id: "allergies" },
  { type: "question", id: "diet_type" },
  { type: "interstitial", id: "interstitial_nutrition", interstitialType: "nutrition" },
  
  // Block 4: Psychology (9 domande + 1 interstitial)
  { type: "question", id: "why_now" },
  { type: "question", id: "previous_diets" },
  { type: "question", id: "past_obstacle" },
  { type: "question", id: "stress_eating" },
  { type: "question", id: "post_cheat_feeling" },
  { type: "question", id: "biggest_fear" },
  { type: "question", id: "home_support" },
  { type: "question", id: "motivation_source" },
  { type: "question", id: "weekend_challenge" },
  { type: "interstitial", id: "interstitial_psychology", interstitialType: "psychology" },
  
  // Block 5: Training (9 domande + 1 interstitial)
  { type: "question", id: "daily_activity" },
  { type: "question", id: "preferred_location" },
  { type: "question", id: "weekly_sessions" },
  { type: "question", id: "session_duration" },
  { type: "question", id: "cardio_preference" },
  { type: "question", id: "home_equipment" },
  { type: "question", id: "injuries" },
  { type: "question", id: "experience_level" },
  { type: "question", id: "commit_daily_diary" },
  { type: "interstitial", id: "interstitial_training", interstitialType: "training" },
  
  // Final (2 domande + 1 result)
  { type: "question", id: "name" },
  { type: "question", id: "email" },
  { type: "result", id: "result" },
];

const Inizia = () => {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [data, setData] = useState<FunnelData>(initialData);
  const [leadId, setLeadId] = useState<string | null>(null);
  
  const currentStep = steps[currentStepIndex];
  const totalQuestionSteps = steps.filter(s => s.type === "question").length;
  const currentQuestionIndex = steps.slice(0, currentStepIndex + 1).filter(s => s.type === "question").length;

  // Capture UTM params and tracking info on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tracking = {
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_content: params.get("utm_content"),
      utm_term: params.get("utm_term"),
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    };
    setData(prev => ({ ...prev, ...tracking }));
  }, []);
  
  // Create or update lead in Supabase
  const saveLead = async (newData: Partial<FunnelData>) => {
    try {
      if (leadId) {
        await supabase
          .from("onboarding_leads")
          .update(newData)
          .eq("id", leadId);
      } else {
        const { data: insertedData } = await supabase
          .from("onboarding_leads")
          .insert(newData)
          .select("id")
          .single();
        
        if (insertedData) {
          setLeadId(insertedData.id);
        }
      }
    } catch (error) {
      console.error("Error saving lead:", error);
    }
  };
  
  const goToNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };
  
  const updateData = <K extends keyof FunnelData>(key: K, value: FunnelData[K]) => {
    const newData = { ...data, [key]: value };
    setData(newData);
    saveLead({ [key]: value });
  };
  
  // Calculate profile badge based on answers
  const getProfileBadge = (): string => {
    if (data.metabolism === "slow" || data.health_conditions.includes("thyroid")) {
      return "Metabolismo da Risvegliare";
    }
    if (data.experience_level === "pro" && data.weekly_sessions === "5+") {
      return "Ottimizzazione Performance";
    }
    if (data.stress_eating === true) {
      return "Equilibrio Emotivo";
    }
    if (data.weekly_sessions === "1-2") {
      return "Riattivazione Graduale";
    }
    return "Trasformazione Completa";
  };
  
  // Render the current step
  const renderStep = () => {
    if (currentStep.type === "interstitial") {
      return (
        <FunnelInterstitial
          key={currentStep.id}
          type={currentStep.interstitialType!}
          onComplete={goToNext}
        />
      );
    }
    
    if (currentStep.type === "result") {
      return (
        <FunnelResult
          currentWeight={data.current_weight || 80}
          targetWeight={data.target_weight || 70}
          weeklyWorkouts={data.weekly_sessions}
          profileBadge={getProfileBadge()}
          onPrimaryClick={() => window.open("https://362gradi.ae/contatti", "_blank")}
          onSecondaryClick={() => navigate("/diario")}
        />
      );
    }
    
    // Question steps
    switch (currentStep.id) {
      case "gender":
        return (
          <SingleChoiceStep
            question="Qual è il tuo sesso?"
            options={[
              { value: "male", label: "Uomo", emoji: "👨" },
              { value: "female", label: "Donna", emoji: "👩" },
            ]}
            value={data.gender}
            onChange={(v) => updateData("gender", v)}
            onNext={goToNext}
          />
        );
        
      case "age":
        return (
          <NumericInputStep
            question="Quanti anni hai?"
            placeholder="Es. 35"
            unit="anni"
            min={16}
            max={100}
            value={data.age}
            onChange={(v) => updateData("age", v)}
            onNext={goToNext}
          />
        );
        
      case "height":
        return (
          <NumericInputStep
            question="Quanto sei alto/a?"
            placeholder="Es. 175"
            unit="cm"
            min={100}
            max={250}
            value={data.height}
            onChange={(v) => updateData("height", v)}
            onNext={goToNext}
          />
        );
        
      case "current_weight":
        return (
          <NumericInputStep
            question="Qual è il tuo peso attuale?"
            placeholder="Es. 75"
            unit="kg"
            min={30}
            max={300}
            value={data.current_weight}
            onChange={(v) => updateData("current_weight", v)}
            onNext={goToNext}
          />
        );
        
      case "target_weight":
        return (
          <NumericInputStep
            question="Qual è il tuo peso obiettivo?"
            placeholder="Es. 68"
            unit="kg"
            min={30}
            max={300}
            value={data.target_weight}
            onChange={(v) => updateData("target_weight", v)}
            onNext={goToNext}
          />
        );
        
      case "body_type":
        return (
          <SingleChoiceStep
            question="Quale descrizione si avvicina di più al tuo fisico?"
            options={[
              { value: "ectomorph", label: "Magro, fatico a prendere peso", emoji: "🦴" },
              { value: "mesomorph", label: "Atletico, prendo/perdo peso facilmente", emoji: "💪" },
              { value: "endomorph", label: "Robusto, tendo ad accumulare", emoji: "🐻" },
              { value: "mixed", label: "Un mix di questi", emoji: "🔀" },
            ]}
            value={data.body_type}
            onChange={(v) => updateData("body_type", v)}
            onNext={goToNext}
          />
        );
        
      case "min_historic_size":
        return (
          <SingleChoiceStep
            question="Qual è stata la taglia minima che hai raggiunto da adulto/a?"
            options={[
              { value: "xs", label: "XS (36-38)" },
              { value: "s", label: "S (40-42)" },
              { value: "m", label: "M (44-46)" },
              { value: "l", label: "L (48-50)" },
              { value: "xl", label: "XL (52+)" },
            ]}
            value={data.min_historic_size}
            onChange={(v) => updateData("min_historic_size", v)}
            onNext={goToNext}
          />
        );
        
      case "special_event":
        return (
          <SingleChoiceStep
            question="Hai un evento speciale in arrivo?"
            subtitle="Questo ci aiuta a personalizzare il tuo percorso"
            options={[
              { value: "wedding", label: "Matrimonio", emoji: "💒" },
              { value: "vacation", label: "Vacanza", emoji: "🏖️" },
              { value: "birthday", label: "Compleanno", emoji: "🎂" },
              { value: "competition", label: "Gara/Competizione", emoji: "🏆" },
              { value: "none", label: "Nessun evento particolare", emoji: "✨" },
            ]}
            value={data.special_event}
            onChange={(v) => updateData("special_event", v)}
            onNext={goToNext}
          />
        );
        
      case "metabolism":
        return (
          <SingleChoiceStep
            question="Come descriveresti il tuo metabolismo?"
            options={[
              { value: "slow", label: "Lento - Faccio fatica a perdere peso", emoji: "🐢" },
              { value: "normal", label: "Normale - Dipende dalle mie abitudini", emoji: "⚖️" },
              { value: "fast", label: "Veloce - Perdo peso facilmente", emoji: "🚀" },
            ]}
            value={data.metabolism}
            onChange={(v) => updateData("metabolism", v)}
            onNext={goToNext}
          />
        );
        
      case "health_conditions":
        return (
          <MultiChoiceStep
            question="Hai qualcuna di queste condizioni?"
            subtitle="Seleziona tutte quelle che si applicano"
            options={[
              { value: "thyroid", label: "Problemi alla tiroide", emoji: "🦋" },
              { value: "pcos", label: "PCOS", emoji: "🌸" },
              { value: "diabetes", label: "Diabete", emoji: "💉" },
              { value: "menopause", label: "Menopausa", emoji: "🌡️" },
              { value: "insulin_resistance", label: "Resistenza insulinica", emoji: "⚡" },
            ]}
            values={data.health_conditions}
            onChange={(v) => updateData("health_conditions", v)}
            onNext={goToNext}
            allowNone
          />
        );
        
      case "medications":
        return (
          <TextInputStep
            question="Assumi farmaci regolarmente?"
            subtitle="Se sì, quali? Se no, lascia vuoto"
            placeholder="Es. Levotiroxina, Metformina..."
            value={data.medications}
            onChange={(v) => updateData("medications", v)}
            onNext={goToNext}
            optional
          />
        );
        
      case "digestion":
        return (
          <SingleChoiceStep
            question="Come va la tua digestione?"
            options={[
              { value: "excellent", label: "Ottima, nessun problema", emoji: "✅" },
              { value: "good", label: "Buona, occasionali fastidi", emoji: "👍" },
              { value: "bloating", label: "Spesso gonfiore", emoji: "🎈" },
              { value: "irregular", label: "Irregolare", emoji: "🔄" },
              { value: "problematic", label: "Problematica", emoji: "⚠️" },
            ]}
            value={data.digestion}
            onChange={(v) => updateData("digestion", v)}
            onNext={goToNext}
          />
        );
        
      case "energy_level":
        return (
          <SingleChoiceStep
            question="Come valuti il tuo livello di energia durante il giorno?"
            options={[
              { value: "very_low", label: "Molto basso, sempre stanco/a", emoji: "😴" },
              { value: "low", label: "Basso, crolli pomeridiani", emoji: "😪" },
              { value: "moderate", label: "Moderato, alti e bassi", emoji: "😐" },
              { value: "good", label: "Buono, abbastanza costante", emoji: "😊" },
              { value: "high", label: "Alto, energia tutto il giorno", emoji: "⚡" },
            ]}
            value={data.energy_level}
            onChange={(v) => updateData("energy_level", v)}
            onNext={goToNext}
          />
        );
        
      case "sleep_hours":
        return (
          <SingleChoiceStep
            question="Quante ore dormi in media?"
            options={[
              { value: "less_than_5", label: "Meno di 5 ore", emoji: "😴" },
              { value: "5_to_6", label: "5-6 ore", emoji: "😪" },
              { value: "6_to_7", label: "6-7 ore", emoji: "😐" },
              { value: "7_to_8", label: "7-8 ore", emoji: "😊" },
              { value: "more_than_8", label: "Più di 8 ore", emoji: "😇" },
            ]}
            value={data.sleep_hours?.toString() || ""}
            onChange={(v) => updateData("sleep_hours", parseInt(v))}
            onNext={goToNext}
          />
        );
        
      case "wake_quality":
        return (
          <SingleChoiceStep
            question="Come ti senti quando ti svegli?"
            options={[
              { value: "tired", label: "Stanco/a e affaticato/a", emoji: "😫" },
              { value: "neutral", label: "Né stanco né energico", emoji: "😐" },
              { value: "energetic", label: "Riposato/a e energico/a", emoji: "⚡" },
            ]}
            value={data.wake_quality}
            onChange={(v) => updateData("wake_quality", v)}
            onNext={goToNext}
          />
        );
        
      case "water_liters":
        return (
          <SingleChoiceStep
            question="Quanta acqua bevi al giorno?"
            options={[
              { value: "less_than_1", label: "Meno di 1 litro", emoji: "💧" },
              { value: "1_to_1.5", label: "1-1.5 litri", emoji: "💧💧" },
              { value: "1.5_to_2", label: "1.5-2 litri", emoji: "💧💧💧" },
              { value: "more_than_2", label: "Più di 2 litri", emoji: "🌊" },
            ]}
            value={data.water_liters?.toString() || ""}
            onChange={(v) => updateData("water_liters", parseFloat(v))}
            onNext={goToNext}
          />
        );
        
      case "meals_per_day":
        return (
          <SingleChoiceStep
            question="Quanti pasti fai al giorno?"
            options={[
              { value: "1-2", label: "1-2 pasti" },
              { value: "3", label: "3 pasti" },
              { value: "4-5", label: "4-5 pasti (inclusi spuntini)" },
              { value: "irregular", label: "È molto variabile" },
            ]}
            value={data.meals_per_day?.toString() || ""}
            onChange={(v) => updateData("meals_per_day", parseInt(v) || 3)}
            onNext={goToNext}
          />
        );
        
      case "snacking_habit":
        return (
          <SingleChoiceStep
            question="Fai spuntini tra i pasti?"
            options={[
              { value: "never", label: "Mai o quasi mai", emoji: "🚫" },
              { value: "sometimes", label: "A volte, quando ho fame", emoji: "🤷" },
              { value: "often", label: "Spesso, anche senza fame", emoji: "🍪" },
              { value: "always", label: "Sempre, è un'abitudine", emoji: "🔄" },
            ]}
            value={data.snacking_habit}
            onChange={(v) => updateData("snacking_habit", v)}
            onNext={goToNext}
          />
        );
        
      case "late_eating":
        return (
          <BooleanStep
            question="Mangi spesso dopo le 21?"
            yesLabel="Sì, ceno tardi o faccio spuntini serali"
            noLabel="No, finisco di mangiare presto"
            value={data.late_eating}
            onChange={(v) => updateData("late_eating", v)}
            onNext={goToNext}
          />
        );
        
      case "weakness":
        return (
          <SingleChoiceStep
            question="Qual è il tuo punto debole?"
            options={[
              { value: "sweets", label: "Dolci", emoji: "🍰" },
              { value: "salty", label: "Salati/Snack", emoji: "🍟" },
              { value: "alcohol", label: "Alcol", emoji: "🍷" },
              { value: "bread", label: "Pane e carboidrati", emoji: "🍞" },
              { value: "portions", label: "Porzioni abbondanti", emoji: "🍽️" },
            ]}
            value={data.weakness}
            onChange={(v) => updateData("weakness", v)}
            onNext={goToNext}
          />
        );
        
      case "eating_out_frequency":
        return (
          <SingleChoiceStep
            question="Quante volte mangi fuori casa?"
            options={[
              { value: "rarely", label: "Raramente (1-2 volte/mese)" },
              { value: "sometimes", label: "A volte (1 volta/settimana)" },
              { value: "often", label: "Spesso (2-3 volte/settimana)" },
              { value: "daily", label: "Quasi ogni giorno" },
            ]}
            value={data.eating_out_frequency}
            onChange={(v) => updateData("eating_out_frequency", v)}
            onNext={goToNext}
          />
        );
        
      case "alcohol_frequency":
        return (
          <SingleChoiceStep
            question="Quante volte bevi alcolici a settimana?"
            options={[
              { value: "never", label: "Mai", emoji: "🚫" },
              { value: "rarely", label: "Raramente (1-2 volte/mese)", emoji: "🍷" },
              { value: "weekly", label: "1-2 volte a settimana", emoji: "🍺" },
              { value: "often", label: "3+ volte a settimana", emoji: "🍻" },
            ]}
            value={data.alcohol_frequency}
            onChange={(v) => updateData("alcohol_frequency", v)}
            onNext={goToNext}
          />
        );
        
      case "skip_breakfast":
        return (
          <BooleanStep
            question="Salti spesso la colazione?"
            yesLabel="Sì, spesso la salto"
            noLabel="No, faccio sempre colazione"
            value={data.skip_breakfast}
            onChange={(v) => updateData("skip_breakfast", v)}
            onNext={goToNext}
          />
        );
        
      case "allergies":
        return (
          <TextInputStep
            question="Hai allergie o intolleranze?"
            subtitle="Se sì, quali? Se no, lascia vuoto"
            placeholder="Es. Lattosio, glutine, frutta secca..."
            value={data.allergies}
            onChange={(v) => updateData("allergies", v)}
            onNext={goToNext}
            optional
          />
        );
        
      case "diet_type":
        return (
          <SingleChoiceStep
            question="Che tipo di alimentazione segui?"
            options={[
              { value: "omnivore", label: "Onnivoro", emoji: "🥩" },
              { value: "vegetarian", label: "Vegetariano", emoji: "🥗" },
              { value: "vegan", label: "Vegano", emoji: "🌱" },
              { value: "pescatarian", label: "Pescetariano", emoji: "🐟" },
              { value: "keto", label: "Chetogenico/Low-carb", emoji: "🥑" },
            ]}
            value={data.diet_type}
            onChange={(v) => updateData("diet_type", v)}
            onNext={goToNext}
          />
        );
        
      case "why_now":
        return (
          <SingleChoiceStep
            question="Perché hai deciso di iniziare proprio adesso?"
            options={[
              { value: "feel_better", label: "Voglio sentirmi meglio con me stesso/a", emoji: "💪" },
              { value: "health", label: "Per motivi di salute", emoji: "❤️" },
              { value: "aesthetics", label: "Per ragioni estetiche", emoji: "✨" },
              { value: "energy", label: "Voglio avere più energia", emoji: "⚡" },
              { value: "example", label: "Voglio essere un esempio per altri", emoji: "🌟" },
            ]}
            value={data.why_now}
            onChange={(v) => updateData("why_now", v)}
            onNext={goToNext}
          />
        );
        
      case "previous_diets":
        return (
          <MultiChoiceStep
            question="Hai seguito diete in passato?"
            subtitle="Seleziona tutte quelle che hai provato"
            options={[
              { value: "calorie_counting", label: "Conteggio calorie", emoji: "🔢" },
              { value: "low_carb", label: "Low-carb/Chetogenica", emoji: "🥑" },
              { value: "intermittent_fasting", label: "Digiuno intermittente", emoji: "⏰" },
              { value: "meal_replacement", label: "Pasti sostitutivi", emoji: "🥤" },
              { value: "nutritionist", label: "Seguita da nutrizionista", emoji: "👨‍⚕️" },
            ]}
            values={data.previous_diets}
            onChange={(v) => updateData("previous_diets", v)}
            onNext={goToNext}
            allowNone
          />
        );
        
      case "past_obstacle":
        return (
          <SingleChoiceStep
            question="Qual è stato il tuo più grande ostacolo in passato?"
            options={[
              { value: "boredom", label: "Noia - Mi stancavo subito", emoji: "😴" },
              { value: "stress", label: "Stress - Mangiavo per compensare", emoji: "😰" },
              { value: "loneliness", label: "Solitudine - Mancava il supporto", emoji: "😔" },
              { value: "consistency", label: "Costanza - Non riuscivo a mantenere", emoji: "📉" },
              { value: "time", label: "Tempo - Troppi impegni", emoji: "⏰" },
            ]}
            value={data.past_obstacle}
            onChange={(v) => updateData("past_obstacle", v)}
            onNext={goToNext}
          />
        );
        
      case "stress_eating":
        return (
          <BooleanStep
            question="Tendi a mangiare quando sei stressato/a?"
            yesLabel="Sì, è il mio modo di sfogarmi"
            noLabel="No, lo stress mi toglie l'appetito"
            value={data.stress_eating}
            onChange={(v) => updateData("stress_eating", v)}
            onNext={goToNext}
          />
        );
        
      case "post_cheat_feeling":
        return (
          <SingleChoiceStep
            question="Come ti senti dopo uno 'sgarro'?"
            options={[
              { value: "guilt", label: "In colpa e frustrato/a", emoji: "😞" },
              { value: "restart", label: "\"Da domani ricomincio\"", emoji: "🔄" },
              { value: "spiral", label: "Tendo a continuare per giorni", emoji: "📉" },
              { value: "balanced", label: "Non mi preoccupo troppo", emoji: "😌" },
            ]}
            value={data.post_cheat_feeling}
            onChange={(v) => updateData("post_cheat_feeling", v)}
            onNext={goToNext}
          />
        );
        
      case "biggest_fear":
        return (
          <SingleChoiceStep
            question="Qual è la tua più grande paura in questo percorso?"
            options={[
              { value: "failure", label: "Fallire di nuovo", emoji: "😰" },
              { value: "giving_up", label: "Mollare dopo poco tempo", emoji: "🏳️" },
              { value: "restrictions", label: "Dovermi privare troppo", emoji: "🚫" },
              { value: "social", label: "Rinunciare alla vita sociale", emoji: "🎉" },
              { value: "results", label: "Non vedere risultati", emoji: "📉" },
            ]}
            value={data.biggest_fear}
            onChange={(v) => updateData("biggest_fear", v)}
            onNext={goToNext}
          />
        );
        
      case "home_support":
        return (
          <BooleanStep
            question="Hai supporto in casa per il tuo percorso?"
            subtitle="Partner, famiglia o coinquilini che ti sostengono"
            yesLabel="Sì, ho persone che mi supportano"
            noLabel="No, sono solo/a in questo"
            value={data.home_support}
            onChange={(v) => updateData("home_support", v)}
            onNext={goToNext}
          />
        );
        
      case "motivation_source":
        return (
          <SingleChoiceStep
            question="Chi ti motiva di più?"
            options={[
              { value: "myself", label: "Me stesso/a", emoji: "💪" },
              { value: "partner", label: "Il/La mio/a partner", emoji: "❤️" },
              { value: "children", label: "I miei figli", emoji: "👨‍👩‍👧" },
              { value: "health", label: "I medici/La mia salute", emoji: "🏥" },
              { value: "community", label: "Una community/Gruppo", emoji: "👥" },
            ]}
            value={data.motivation_source}
            onChange={(v) => updateData("motivation_source", v)}
            onNext={goToNext}
          />
        );
        
      case "weekend_challenge":
        return (
          <SingleChoiceStep
            question="Qual è la tua sfida principale nel weekend?"
            options={[
              { value: "dinners", label: "Cene e aperitivi", emoji: "🍽️" },
              { value: "social", label: "Eventi sociali", emoji: "🎉" },
              { value: "laziness", label: "Pigrizia e relax", emoji: "🛋️" },
              { value: "routine", label: "Perdita della routine", emoji: "🔄" },
              { value: "none", label: "Nessuna sfida particolare", emoji: "✅" },
            ]}
            value={data.weekend_challenge}
            onChange={(v) => updateData("weekend_challenge", v)}
            onNext={goToNext}
          />
        );
        
      case "daily_activity":
        return (
          <SingleChoiceStep
            question="Come descriveresti la tua attività quotidiana?"
            options={[
              { value: "sedentary", label: "Sedentaria (lavoro d'ufficio)", emoji: "🪑" },
              { value: "light", label: "Leggera (cammino poco)", emoji: "🚶" },
              { value: "moderate", label: "Moderata (in piedi/cammino)", emoji: "🏃" },
              { value: "active", label: "Attiva (lavoro fisico)", emoji: "💪" },
              { value: "very_active", label: "Molto attiva (sport/lavoro pesante)", emoji: "🔥" },
            ]}
            value={data.daily_activity}
            onChange={(v) => updateData("daily_activity", v)}
            onNext={goToNext}
          />
        );
        
      case "preferred_location":
        return (
          <SingleChoiceStep
            question="Dove preferisci allenarti?"
            options={[
              { value: "home", label: "A casa", emoji: "🏠" },
              { value: "gym", label: "In palestra", emoji: "🏋️" },
              { value: "outdoor", label: "All'aperto", emoji: "🌳" },
              { value: "mixed", label: "Un mix di tutto", emoji: "🔀" },
            ]}
            value={data.preferred_location}
            onChange={(v) => updateData("preferred_location", v)}
            onNext={goToNext}
          />
        );
        
      case "weekly_sessions":
        return (
          <SingleChoiceStep
            question="Quante sessioni di allenamento puoi fare a settimana?"
            options={[
              { value: "1-2", label: "1-2 sessioni", emoji: "🌱" },
              { value: "3-4", label: "3-4 sessioni", emoji: "💪" },
              { value: "5+", label: "5 o più sessioni", emoji: "🔥" },
            ]}
            value={data.weekly_sessions}
            onChange={(v) => updateData("weekly_sessions", v)}
            onNext={goToNext}
          />
        );
        
      case "session_duration":
        return (
          <SingleChoiceStep
            question="Quanto tempo puoi dedicare a ogni sessione?"
            options={[
              { value: "15", label: "15 minuti", emoji: "⏱️" },
              { value: "30", label: "30 minuti", emoji: "⏱️" },
              { value: "45", label: "45 minuti", emoji: "⏱️" },
              { value: "60", label: "60 minuti o più", emoji: "⏱️" },
            ]}
            value={data.session_duration}
            onChange={(v) => updateData("session_duration", v)}
            onNext={goToNext}
          />
        );
        
      case "cardio_preference":
        return (
          <SingleChoiceStep
            question="Preferisci allenamenti cardio o forza?"
            options={[
              { value: "cardio", label: "Cardio (corsa, bici, camminata)", emoji: "🏃" },
              { value: "strength", label: "Forza (pesi, resistenza)", emoji: "🏋️" },
              { value: "mixed", label: "Un mix equilibrato", emoji: "⚖️" },
              { value: "flexibility", label: "Flessibilità (yoga, stretching)", emoji: "🧘" },
            ]}
            value={data.cardio_preference}
            onChange={(v) => updateData("cardio_preference", v)}
            onNext={goToNext}
          />
        );
        
      case "home_equipment":
        return (
          <SingleChoiceStep
            question="Che attrezzatura hai a casa?"
            options={[
              { value: "none", label: "Nulla", emoji: "🚫" },
              { value: "basic", label: "Base (tappetino, elastici)", emoji: "🧘" },
              { value: "weights", label: "Pesi/Manubri", emoji: "🏋️" },
              { value: "complete", label: "Attrezzatura completa", emoji: "💯" },
            ]}
            value={data.home_equipment}
            onChange={(v) => updateData("home_equipment", v)}
            onNext={goToNext}
          />
        );
        
      case "injuries":
        return (
          <SingleChoiceStep
            question="Hai infortuni o limitazioni fisiche?"
            options={[
              { value: "none", label: "Nessuno", emoji: "✅" },
              { value: "back", label: "Schiena", emoji: "🔙" },
              { value: "knees", label: "Ginocchia", emoji: "🦵" },
              { value: "shoulders", label: "Spalle", emoji: "💪" },
              { value: "other", label: "Altro", emoji: "⚠️" },
            ]}
            value={data.injuries}
            onChange={(v) => updateData("injuries", v)}
            onNext={goToNext}
          />
        );
        
      case "experience_level":
        return (
          <SingleChoiceStep
            question="Qual è il tuo livello di esperienza?"
            options={[
              { value: "beginner", label: "Principiante - Mai o quasi mai allenato", emoji: "🌱" },
              { value: "intermediate", label: "Intermedio - Qualche esperienza", emoji: "📈" },
              { value: "pro", label: "Avanzato - Mi alleno regolarmente", emoji: "🏆" },
            ]}
            value={data.experience_level}
            onChange={(v) => updateData("experience_level", v)}
            onNext={goToNext}
          />
        );
        
      case "commit_daily_diary":
        return (
          <BooleanStep
            question="Dedicherai 15 minuti al giorno al tuo Diario 362?"
            subtitle="Questo è l'impegno che ti chiediamo per massimizzare i risultati"
            yesLabel="Sì, mi impegno!"
            noLabel="Devo pensarci"
            value={data.commit_daily_diary}
            onChange={(v) => updateData("commit_daily_diary", v)}
            onNext={goToNext}
          />
        );
        
      case "name":
        return (
          <TextInputStep
            question="Come ti chiami?"
            subtitle="Piacere di conoscerti!"
            placeholder="Il tuo nome"
            value={data.name}
            onChange={(v) => updateData("name", v)}
            onNext={goToNext}
          />
        );
        
      case "email":
        return (
          <TextInputStep
            question="Dove dovremmo inviarti il tuo report personalizzato?"
            subtitle="Inserisci la tua email migliore"
            placeholder="tuaemail@esempio.com"
            type="email"
            value={data.email}
            onChange={(v) => updateData("email", v)}
            onNext={() => {
              // Mark lead as completed before showing result
              if (leadId) {
                supabase
                  .from("onboarding_leads")
                  .update({ 
                    email: data.email,
                    name: data.name,
                    profile_badge: getProfileBadge(),
                    completed_at: new Date().toISOString()
                  })
                  .eq("id", leadId);
              }
              goToNext();
            }}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {currentStep.type !== "result" && (
        <FunnelProgressBar 
          currentStep={currentQuestionIndex} 
          totalSteps={totalQuestionSteps} 
        />
      )}
      
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
};

export default Inizia;
