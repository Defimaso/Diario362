import { motion } from "framer-motion";

interface MomentumCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

const MomentumCircle = ({ percentage, size = 240, strokeWidth = 8 }: MomentumCircleProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background glow */}
      <div 
        className="absolute inset-0 rounded-full opacity-20 blur-xl"
        style={{ 
          background: `radial-gradient(circle, hsl(51, 100%, 50%) 0%, transparent 70%)` 
        }}
      />
      
      {/* Background ring */}
      <svg
        className="absolute transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(0, 0%, 15%)"
          strokeWidth={strokeWidth}
        />
      </svg>
      
      {/* Progress ring */}
      <svg
        className="absolute transform -rotate-90"
        width={size}
        height={size}
      >
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="momentum-ring"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      
      {/* Center content */}
      <div className="relative flex flex-col items-center justify-center">
        <motion.span 
          className="text-5xl font-bold gold-text"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {Math.round(percentage)}%
        </motion.span>
        <span className="text-sm text-muted-foreground mt-1">MOMENTUM</span>
      </div>
    </div>
  );
};

export default MomentumCircle;
