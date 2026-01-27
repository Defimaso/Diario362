import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import FunnelButton from "../FunnelButton";

interface TextInputStepProps {
  question: string;
  subtitle?: string;
  placeholder: string;
  type?: "text" | "email";
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  optional?: boolean;
}

const TextInputStep = ({ 
  question, 
  subtitle, 
  placeholder, 
  type = "text",
  value, 
  onChange, 
  onNext,
  optional = false
}: TextInputStepProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (optional || value.trim())) {
      onNext();
    }
  };

  const isValid = optional || value.trim().length > 0;
  const isEmail = type === "email";
  const emailValid = !isEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

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
          <Input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="text-center text-xl h-14 border-2 border-gray-200 focus:border-green-500 rounded-xl"
          />
          
          {optional && (
            <p className="text-sm text-gray-400 text-center">
              Questo campo è opzionale
            </p>
          )}
          
          <FunnelButton
            onClick={onNext}
            variant="primary"
            className={!(isValid && emailValid) ? "opacity-50 cursor-not-allowed" : ""}
          >
            Continua
          </FunnelButton>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TextInputStep;
