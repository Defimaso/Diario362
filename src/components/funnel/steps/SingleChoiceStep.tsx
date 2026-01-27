import { motion } from "framer-motion";
import FunnelButton from "../FunnelButton";

interface Option {
  value: string;
  label: string;
  emoji?: string;
}

interface SingleChoiceStepProps {
  question: string;
  subtitle?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

const SingleChoiceStep = ({ 
  question, 
  subtitle, 
  options, 
  value, 
  onChange, 
  onNext 
}: SingleChoiceStepProps) => {
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    // Auto-advance after short delay
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
          {options.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <FunnelButton
                onClick={() => handleSelect(option.value)}
                selected={value === option.value}
              >
                {option.emoji && <span className="mr-2">{option.emoji}</span>}
                {option.label}
              </FunnelButton>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SingleChoiceStep;
