import { motion } from "framer-motion";
import { Battery, Zap, Brain, Apple, TrendingUp } from "lucide-react";
import MetricChart from "./MetricChart";
import { getWeeklyCheckins } from "@/lib/storage";

const StatsOverview = () => {
  const checkins = getWeeklyCheckins();
  
  const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  const today = new Date().getDay();
  
  const getLast7Days = (metric: keyof typeof checkins[0]) => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const dayIndex = (today - i + 7) % 7;
      const dayName = days[dayIndex];
      
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      const dateStr = targetDate.toISOString().split('T')[0];
      
      const checkin = checkins.find(c => c.date === dateStr);
      
      if (metric === 'nutritionHit') {
        result.push({
          date: dayName,
          value: checkin ? (checkin.nutritionHit ? 10 : 0) : 0,
        });
      } else {
        result.push({
          date: dayName,
          value: checkin ? (checkin[metric] as number) : 0,
        });
      }
    }
    return result;
  };

  const recoveryData = getLast7Days('recovery');
  const energyData = getLast7Days('energy');
  const mindsetData = getLast7Days('mindset');
  const nutritionData = getLast7Days('nutritionHit');

  // Calculate averages
  const calcAverage = (data: { value: number }[]) => {
    const nonZero = data.filter(d => d.value > 0);
    if (nonZero.length === 0) return 0;
    return (nonZero.reduce((sum, d) => sum + d.value, 0) / nonZero.length).toFixed(1);
  };

  const avgRecovery = calcAverage(recoveryData);
  const avgEnergy = calcAverage(energyData);
  const avgMindset = calcAverage(mindsetData);
  const nutritionSuccess = nutritionData.filter(d => d.value === 10).length;

  if (checkins.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="font-semibold">Analisi Dettagliata</h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card-elegant rounded-xl p-3 flex items-center gap-3 sm:flex-col sm:text-center"
        >
          <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 sm:mx-auto">
            <Battery className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col sm:items-center">
            <p className="text-lg font-bold text-primary leading-tight">{avgRecovery}</p>
            <p className="text-xs text-muted-foreground">Recupero</p>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card-elegant rounded-xl p-3 flex items-center gap-3 sm:flex-col sm:text-center"
        >
          <div className="flex-shrink-0 p-2 rounded-lg bg-amber-500/10 sm:mx-auto">
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex flex-col sm:items-center">
            <p className="text-lg font-bold text-amber-500 leading-tight">{avgEnergy}</p>
            <p className="text-xs text-muted-foreground">Energia</p>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card-elegant rounded-xl p-3 flex items-center gap-3 sm:flex-col sm:text-center"
        >
          <div className="flex-shrink-0 p-2 rounded-lg bg-purple-500/10 sm:mx-auto">
            <Brain className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex flex-col sm:items-center">
            <p className="text-lg font-bold text-purple-500 leading-tight">{avgMindset}</p>
            <p className="text-xs text-muted-foreground">Mindset</p>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="card-elegant rounded-xl p-3 flex items-center gap-3 sm:flex-col sm:text-center"
        >
          <div className="flex-shrink-0 p-2 rounded-lg bg-accent/10 sm:mx-auto">
            <Apple className="w-4 h-4 text-accent" />
          </div>
          <div className="flex flex-col sm:items-center">
            <p className="text-lg font-bold text-accent leading-tight">{nutritionSuccess}/7</p>
            <p className="text-xs text-muted-foreground">Nutrizione</p>
          </div>
        </motion.div>
      </div>

      {/* Individual Charts */}
      <div className="grid grid-cols-2 gap-3">
        <MetricChart
          title="Recupero"
          icon={Battery}
          data={recoveryData}
          color="teal"
        />
        <MetricChart
          title="Energia"
          icon={Zap}
          data={energyData}
          color="amber"
        />
        <MetricChart
          title="Mindset"
          icon={Brain}
          data={mindsetData}
          color="purple"
        />
        <MetricChart
          title="Nutrizione"
          icon={Apple}
          data={nutritionData}
          color="coral"
          unit="%"
        />
      </div>
    </motion.div>
  );
};

export default StatsOverview;
