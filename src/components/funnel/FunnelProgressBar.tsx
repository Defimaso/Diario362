import { motion } from "framer-motion";

interface FunnelProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const FunnelProgressBar = ({ currentStep, totalSteps }: FunnelProgressBarProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
      <motion.div
        className="h-full bg-green-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  );
};

export default FunnelProgressBar;
