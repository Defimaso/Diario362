import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import FunnelButton from "./FunnelButton";
import { TrendingDown, Award, ArrowRight } from "lucide-react";

interface FunnelResultProps {
  currentWeight: number;
  targetWeight: number;
  weeklyWorkouts: string;
  profileBadge: string;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

const FunnelResult = ({
  currentWeight,
  targetWeight,
  weeklyWorkouts,
  profileBadge,
  onPrimaryClick,
  onSecondaryClick,
}: FunnelResultProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Calculate predicted weeks based on workout frequency
  const weightDiff = currentWeight - targetWeight;
  const baseWeeks = Math.ceil(weightDiff / 0.5); // 0.5kg per week baseline
  const workoutMultiplier = weeklyWorkouts === "5+" ? 0.7 : weeklyWorkouts === "3-4" ? 0.85 : 1;
  const predictedWeeks = Math.max(4, Math.ceil(baseWeeks * workoutMultiplier));
  
  // Draw the weight prediction chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate data points
    const steps = 10;
    const points: { x: number; y: number }[] = [];
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const week = Math.round(progress * predictedWeeks);
      
      // Exponential decay curve for more realistic weight loss
      const weightLoss = weightDiff * (1 - Math.pow(1 - progress, 1.5));
      const weight = currentWeight - weightLoss;
      
      const x = padding + (width - padding * 2) * progress;
      const y = padding + (height - padding * 2) * (1 - (currentWeight - weight) / weightDiff);
      
      points.push({ x, y });
    }
    
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, "rgba(34, 197, 94, 0.1)");
    gradient.addColorStop(1, "rgba(34, 197, 94, 0)");
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.lineTo(points[0].x, height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((point, i) => {
      if (i === 0) return;
      const prev = points[i - 1];
      const cpx = (prev.x + point.x) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + point.y) / 2);
    });
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw start and end points
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(points[points.length - 1].x, points[points.length - 1].y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(points[points.length - 1].x, points[points.length - 1].y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    
    // Draw labels
    ctx.fillStyle = "#6b7280";
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "center";
    
    // Start label
    ctx.fillText(`${currentWeight} kg`, points[0].x, points[0].y - 15);
    ctx.fillText("Oggi", points[0].x, height - 15);
    
    // End label
    ctx.fillStyle = "#22c55e";
    ctx.font = "bold 14px Inter, sans-serif";
    ctx.fillText(`${targetWeight} kg`, points[points.length - 1].x, points[points.length - 1].y - 15);
    ctx.fillStyle = "#6b7280";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText(`${predictedWeeks} sett.`, points[points.length - 1].x, height - 15);
    
  }, [currentWeight, targetWeight, predictedWeeks, weightDiff]);

  return (
    <motion.div
      className="min-h-screen flex flex-col px-6 py-12 bg-gradient-to-b from-white to-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Il Tuo Percorso Personalizzato
          </h1>
          <p className="text-gray-600">
            Ecco cosa possiamo raggiungere insieme
          </p>
        </motion.div>
        
        {/* Profile Badge */}
        <motion.div
          className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-green-600 font-medium">Il Tuo Profilo</p>
            <p className="text-lg font-bold text-gray-900">{profileBadge}</p>
          </div>
        </motion.div>
        
        {/* Weight Chart */}
        <motion.div
          className="bg-white rounded-2xl border-2 border-gray-100 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900">Proiezione del Peso</h3>
          </div>
          
          <canvas
            ref={canvasRef}
            width={350}
            height={200}
            className="w-full h-auto"
          />
          
          <div className="flex justify-between mt-4 text-sm">
            <div className="text-center">
              <p className="text-gray-500">Peso Attuale</p>
              <p className="font-bold text-gray-900">{currentWeight} kg</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Obiettivo</p>
              <p className="font-bold text-green-600">{targetWeight} kg</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Tempo Stimato</p>
              <p className="font-bold text-gray-900">{predictedWeeks} settimane</p>
            </div>
          </div>
        </motion.div>
        
        {/* Stats Summary */}
        <motion.div
          className="grid grid-cols-2 gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">-{weightDiff.toFixed(1)} kg</p>
            <p className="text-sm text-gray-500">Perdita Totale</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              -{(weightDiff / predictedWeeks).toFixed(1)} kg
            </p>
            <p className="text-sm text-gray-500">A Settimana</p>
          </div>
        </motion.div>
        
        {/* CTAs */}
        <motion.div
          className="space-y-4 mt-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <FunnelButton onClick={onPrimaryClick} variant="primary">
            <span className="flex items-center justify-center gap-2">
              VOGLIO IL MIO PERCORSO PERSONALIZZATO
              <ArrowRight className="w-5 h-5" />
            </span>
          </FunnelButton>
          
          <FunnelButton onClick={onSecondaryClick} variant="secondary">
            Accedi all'App Diario 362
          </FunnelButton>
        </motion.div>
        
        <motion.p
          className="text-center text-xs text-gray-400 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          © 2026 MerryProject Global - Dubai
        </motion.p>
      </div>
    </motion.div>
  );
};

export default FunnelResult;
