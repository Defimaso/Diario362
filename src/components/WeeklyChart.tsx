import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { getWeeklyCheckins, calculateDailyScore } from "@/lib/storage";

const WeeklyChart = () => {
  const checkins = getWeeklyCheckins();
  
  const data = checkins.map(c => ({
    date: new Date(c.date).toLocaleDateString('en-US', { weekday: 'short' }),
    score: calculateDailyScore(c),
    recovery: c.recovery,
    energy: c.energy,
    mindset: c.mindset,
  }));

  // Fill in missing days
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const dayIndex = (today - i + 7) % 7;
    const dayName = days[dayIndex];
    const existingData = data.find(d => d.date === dayName);
    last7Days.push(existingData || { date: dayName, score: 0 });
  }

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium rounded-xl p-5"
      >
        <h3 className="font-semibold mb-4">Weekly Progress</h3>
        <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm">
          Complete check-ins to see your progress
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium rounded-xl p-5"
    >
      <h3 className="font-semibold mb-4">Weekly Progress</h3>
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={last7Days}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(51, 100%, 50%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(51, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(215, 16%, 57%)', fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 10]} 
              hide 
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(0, 0%, 7%)',
                border: '1px solid hsl(0, 0%, 15%)',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
              labelStyle={{ color: 'white' }}
              itemStyle={{ color: 'hsl(51, 100%, 50%)' }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(51, 100%, 50%)"
              strokeWidth={2}
              fill="url(#goldGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default WeeklyChart;
