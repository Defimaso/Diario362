import { motion } from "framer-motion";
import FunnelButton from "../FunnelButton";

interface BooleanStepProps {
  question: string;
  subtitle?: string;
  yesLabel?: string;
  noLabel?: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  onNext: () => void;
}

const BooleanStep = ({ 
  question, 
  subtitle, 
  yesLabel = "Sì",
  noLabel = "No",
  value, 
  onChange, 
  onNext 
}: BooleanStepProps) => {
  const handleSelect = (val: boolean) => {
    onChange(val);
    setTimeout(() => {
      onNext();
    }, 300);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col justify-center px-6 py-12 bg-white"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-md mx-auto w-full">
        <motion.h1
          className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {question}
        </motion.h1>
        
        {subtitle && (
          <motion.p
            className="text-gray-500 text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        )}
        
        <motion.div
          className="space-y-3 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FunnelButton
              onClick={() => handleSelect(true)}
              selected={value === true}
            >
              ✅ {yesLabel}
            </FunnelButton>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <FunnelButton
              onClick={() => handleSelect(false)}
              selected={value === false}
            >
              ❌ {noLabel}
            </FunnelButton>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BooleanStep;
