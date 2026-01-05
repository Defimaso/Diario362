import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { LucideIcon } from "lucide-react";

interface MetricChartProps {
  title: string;
  icon: LucideIcon;
  data: { date: string; value: number }[];
  color: "teal" | "coral" | "amber" | "purple";
  unit?: string;
}

const colorMap = {
  teal: {
    stroke: "hsl(174, 52%, 45%)",
    fill: "tealGradient",
  },
  coral: {
    stroke: "hsl(0, 70%, 65%)",
    fill: "coralGradient",
  },
  amber: {
    stroke: "hsl(45, 90%, 50%)",
    fill: "amberGradient",
  },
  purple: {
    stroke: "hsl(270, 60%, 55%)",
    fill: "purpleGradient",
  },
};

const MetricChart = ({ title, icon: Icon, data, color, unit = "/10" }: MetricChartProps) => {
  const colors = colorMap[color];
  const latestValue = data.length > 0 ? data[data.length - 1].value : 0;
  const previousValue = data.length > 1 ? data[data.length - 2].value : latestValue;
  const trend = latestValue - previousValue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elegant rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${colors.stroke}20` }}
          >
            <Icon className="w-4 h-4" style={{ color: colors.stroke }} />
          </div>
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold" style={{ color: colors.stroke }}>
            {latestValue}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
          {trend !== 0 && (
            <span className={`text-xs ml-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'}{Math.abs(trend).toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <div className="h-[80px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`${color}Gradient`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.3} />
                <stop offset="100%" stopColor={colors.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(180, 10%, 55%)', fontSize: 10 }}
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
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(180, 25%, 20%)' }}
              formatter={(value: number) => [`${value}${unit}`, title]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors.stroke}
              strokeWidth={2}
              fill={`url(#${color}Gradient)`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default MetricChart;
