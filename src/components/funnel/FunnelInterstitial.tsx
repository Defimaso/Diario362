import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Brain, Dumbbell, Target, Heart } from "lucide-react";

interface FunnelInterstitialProps {
  type: "bio" | "metabolism" | "nutrition" | "psychology" | "training";
  onComplete: () => void;
}

const interstitialContent = {
  bio: {
    icon: Target,
    title: "Ottimo inizio!",
    message: "Stiamo calcolando il tuo fabbisogno calorico basale...",
    duration: 2500,
  },
  metabolism: {
    icon: Heart,
    title: "Perfetto!",
    message: "Stiamo analizzando il tuo profilo metabolico...",
    duration: 2500,
  },
  nutrition: {
    icon: Sparkles,
    title: "Eccellente!",
    message: "Stiamo elaborando le tue preferenze alimentari...",
    duration: 2500,
  },
  psychology: {
    icon: Brain,
    title: "Grazie per la tua onestà.",
    message: "Molti dei nostri atleti di successo hanno affrontato sfide simili.",
    duration: 3000,
  },
  training: {
    icon: Dumbbell,
    title: "Quasi fatto!",
    message: "Stiamo configurando il tuo piano di movimento ideale...",
    duration: 2500,
  },
};

const FunnelInterstitial = ({ type, onComplete }: FunnelInterstitialProps) => {
  const content = interstitialContent[type];
  const Icon = content.icon;

  // Auto-advance after duration with proper cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, content.duration);
    
    return () => clearTimeout(timer);
  }, [content.duration, onComplete]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-white to-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="text-center"
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center"
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Icon className="w-10 h-10 text-green-600" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {content.title}
        </h2>
        
        <p className="text-lg text-gray-600 max-w-sm mx-auto mb-8">
          {content.message}
        </p>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-green-500 mx-auto" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default FunnelInterstitial;
