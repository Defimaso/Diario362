import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  variant?: "default" | "gold" | "primary";
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
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "w-full p-5 rounded-xl text-left transition-all duration-300",
        "flex items-start gap-4",
        variant === "default" && "card-premium hover:border-muted-foreground/30",
        variant === "gold" && "card-premium-gold hover:shadow-[0_0_30px_hsla(51,100%,50%,0.4)]",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90 gold-glow",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={cn(
        "p-3 rounded-lg",
        variant === "primary" ? "bg-primary-foreground/10" : "bg-muted"
      )}>
        <Icon className={cn(
          "w-6 h-6",
          variant === "gold" && "text-primary",
          variant === "primary" && "text-primary-foreground"
        )} />
      </div>
      <div className="flex-1">
        <h3 className={cn(
          "font-semibold text-lg",
          variant === "primary" ? "text-primary-foreground" : "text-foreground"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-sm mt-1",
          variant === "primary" ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {description}
        </p>
      </div>
    </motion.button>
  );
};

export default QuickActionCard;
