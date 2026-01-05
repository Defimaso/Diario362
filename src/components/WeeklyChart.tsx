import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface CheckinData {
  date: string;
  recovery: number;
  nutritionHit: boolean;
  energy: number;
  mindset: number;
  twoPercentEdge: string;
}

interface WeeklyChartProps {
  data?: CheckinData[];
}

const WeeklyChart = ({ data = [] }: WeeklyChartProps) => {
  const calculateScore = (checkin: CheckinData): number => {
    const nutritionScore = checkin.nutritionHit ? 10 : 5;
    const average = (checkin.recovery + nutritionScore + checkin.energy + checkin.mindset) / 4;
    return Math.round(average * 10) / 10;
  };

  const chartData = data.map(c => ({
    date: new Date(c.date).toLocaleDateString('it-IT', { weekday: 'short' }),
    score: calculateScore(c),
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
    const existingData = chartData.find(d => d.date.toLowerCase() === dayName.toLowerCase());
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
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(45, 100%, 50%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(45, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(0, 0%, 60%)', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[0, 10]} 
              hide 
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(0, 0%, 7%)',
                border: '1px solid hsl(0, 0%, 18%)',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: 'hsl(0, 0%, 95%)' }}
              itemStyle={{ color: 'hsl(45, 100%, 50%)' }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(45, 100%, 50%)"
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
