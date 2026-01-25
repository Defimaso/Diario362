import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  variant?: "default" | "gold" | "primary" | "red" | "blue" | "green" | "orange" | "purple";
  className?: string;
}

const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  variant = "default",
  className 
}: QuickActionCardProps) => {
  const isColoredVariant = ["red", "blue", "green", "orange", "purple", "primary"].includes(variant);
  
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "w-full p-5 rounded-xl text-left transition-all duration-300",
        "flex items-start gap-4",
        variant === "default" && "card-elegant hover:border-primary/30",
        variant === "gold" && "card-elegant-accent hover:shadow-[0_0_30px_hsla(174,52%,45%,0.3)]",
        variant === "primary" && "bg-accent text-accent-foreground hover:bg-accent/90 coral-glow",
        variant === "red" && "section-red hover:opacity-90 shadow-lg shadow-red-500/20",
        variant === "blue" && "section-blue hover:opacity-90 shadow-lg shadow-blue-500/20",
        variant === "green" && "section-green hover:opacity-90 shadow-lg shadow-green-500/20",
        variant === "orange" && "section-orange hover:opacity-90 shadow-lg shadow-orange-500/20",
        variant === "purple" && "section-purple hover:opacity-90 shadow-lg shadow-purple-500/20",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={cn(
        "p-3 rounded-lg",
        isColoredVariant ? "bg-white/20" : "bg-muted"
      )}>
        <Icon className={cn(
          "w-6 h-6",
          variant === "gold" && "text-primary",
          isColoredVariant && "text-white"
        )} />
      </div>
      <div className="flex-1">
        <h3 className={cn(
          "font-semibold text-lg",
          isColoredVariant ? "text-white" : "text-foreground"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-sm mt-1",
          isColoredVariant ? "text-white/80" : "text-muted-foreground"
        )}>
          {description}
        </p>
      </div>
    </motion.button>
  );
};

export default QuickActionCard;
