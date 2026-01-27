import { motion } from "framer-motion";
import FunnelButton from "../FunnelButton";
import { Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
  emoji?: string;
}

interface MultiChoiceStepProps {
  question: string;
  subtitle?: string;
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  onNext: () => void;
  allowNone?: boolean;
}

const MultiChoiceStep = ({ 
  question, 
  subtitle, 
  options, 
  values, 
  onChange, 
  onNext,
  allowNone = false
}: MultiChoiceStepProps) => {
  const handleSelect = (optionValue: string) => {
    if (optionValue === "none") {
      onChange(values.includes("none") ? [] : ["none"]);
      return;
    }
    
    const newValues = values.filter(v => v !== "none");
    if (newValues.includes(optionValue)) {
      onChange(newValues.filter(v => v !== optionValue));
    } else {
      onChange([...newValues, optionValue]);
    }
  };

  const allOptions = allowNone 
    ? [...options, { value: "none", label: "Nessuna", emoji: "✓" }]
    : options;

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
          {allOptions.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <FunnelButton
                onClick={() => handleSelect(option.value)}
                selected={values.includes(option.value)}
              >
                <div className="flex items-center justify-between w-full">
                  <span>
                    {option.emoji && <span className="mr-2">{option.emoji}</span>}
                    {option.label}
                  </span>
                  {values.includes(option.value) && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </FunnelButton>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <FunnelButton
            onClick={onNext}
            variant="primary"
            className={values.length === 0 ? "opacity-50" : ""}
          >
            Continua
          </FunnelButton>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MultiChoiceStep;
