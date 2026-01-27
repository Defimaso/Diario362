import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FunnelButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  selected?: boolean;
  className?: string;
  variant?: "option" | "primary" | "secondary";
}

const FunnelButton = ({ 
  children, 
  onClick, 
  selected = false, 
  className,
  variant = "option" 
}: FunnelButtonProps) => {
  const baseStyles = "w-full py-4 px-6 rounded-xl border-2 text-lg font-medium transition-all duration-200";
  
  const variantStyles = {
    option: cn(
      baseStyles,
      "bg-white hover:bg-gray-50",
      selected 
        ? "border-green-500 bg-green-50 text-green-700" 
        : "border-gray-200 text-gray-700 hover:border-gray-300"
    ),
    primary: cn(
      baseStyles,
      "bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600"
    ),
    secondary: cn(
      baseStyles,
      "bg-blue-500 border-blue-500 text-white hover:bg-blue-600 hover:border-blue-600"
    ),
  };

  return (
    <motion.button
      className={cn(variantStyles[variant], className)}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  );
};

export default FunnelButton;
