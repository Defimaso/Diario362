import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import FunnelButton from "../FunnelButton";

interface NumericInputStepProps {
  question: string;
  subtitle?: string;
  placeholder: string;
  unit?: string;
  min?: number;
  max?: number;
  value: number | null;
  onChange: (value: number | null) => void;
  onNext: () => void;
}

const NumericInputStep = ({ 
  question, 
  subtitle, 
  placeholder, 
  unit,
  min,
  max,
  value, 
  onChange, 
  onNext 
}: NumericInputStepProps) => {
  const [inputValue, setInputValue] = useState(value?.toString() || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const numVal = parseFloat(val);
    if (!isNaN(numVal)) {
      onChange(numVal);
    } else if (val === "") {
      onChange(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value !== null) {
      onNext();
    }
  };

  const isValid = value !== null && 
    (min === undefined || value >= min) && 
    (max === undefined || value <= max);

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
          className="mt-8 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <Input
              type="number"
              value={inputValue}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              min={min}
              max={max}
              className="text-center text-2xl h-16 border-2 border-gray-200 focus:border-green-500 rounded-xl"
            />
            {unit && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                {unit}
              </span>
            )}
          </div>
          
          <FunnelButton
            onClick={onNext}
            variant="primary"
            className={!isValid ? "opacity-50 cursor-not-allowed" : ""}
          >
            Continua
          </FunnelButton>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NumericInputStep;
