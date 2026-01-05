import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { getWeeklyCheckins, calculateDailyScore } from "@/lib/storage";

const WeeklyChart = () => {
  const checkins = getWeeklyCheckins();
  
  const data = checkins.map(c => ({
    date: new Date(c.date).toLocaleDateString('it-IT', { weekday: 'short' }),
    score: calculateDailyScore(c),
    recovery: c.recovery,
    energy: c.energy,
    mindset: c.mindset,
  }));

  // Fill in missing days
  const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  const today = new Date().getDay();
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const dayIndex = (today - i + 7) % 7;
    const dayName = days[dayIndex];
    const existingData = data.find(d => d.date.toLowerCase() === dayName.toLowerCase());
    last7Days.push(existingData || { date: dayName, score: 0 });
  }

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elegant rounded-xl p-5"
      >
        <h3 className="font-semibold mb-4">Progresso Settimanale</h3>
        <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm">
          Completa i check-in per vedere il tuo progresso
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elegant rounded-xl p-4 sm:p-5"
    >
      <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Progresso Settimanale</h3>
      <div className="h-[100px] sm:h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={last7Days} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(174, 52%, 45%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(174, 52%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(180, 10%, 45%)', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[0, 10]} 
              hide 
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(165, 20%, 88%)',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: 'hsl(180, 25%, 20%)' }}
              itemStyle={{ color: 'hsl(174, 52%, 45%)' }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(174, 52%, 45%)"
              strokeWidth={2}
              fill="url(#tealGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default WeeklyChart;
