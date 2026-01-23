import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { ProgressCheck, TimeFilter } from '@/hooks/useProgressChecks';
import { Button } from '@/components/ui/button';

interface WeightChartProps {
  data: ProgressCheck[];
  getFilteredData: (filter: TimeFilter) => ProgressCheck[];
}

const timeFilterLabels: Record<TimeFilter, string> = {
  '3months': 'Ultimi 3 mesi',
  '6months': 'Ultimi 6 mesi',
  'all': 'Tutto',
};

const WeightChart = ({ data, getFilteredData }: WeightChartProps) => {
  const [filter, setFilter] = useState<TimeFilter>('3months');
  
  const filteredData = getFilteredData(filter);
  
  // Prepare chart data (reverse to show oldest first on left)
  const chartData = filteredData
    .filter(check => check.weight !== null)
    .map(check => ({
      date: new Date(check.date).toLocaleDateString('it-IT', { 
        day: '2-digit',
        month: 'short',
      }),
      fullDate: check.date,
      weight: check.weight,
    }))
    .reverse();

  // Calculate trend
  const calculateTrend = () => {
    if (chartData.length < 2) return { value: 0, direction: 'stable' as const };
    
    const first = chartData[0].weight || 0;
    const last = chartData[chartData.length - 1].weight || 0;
    const diff = last - first;
    
    return {
      value: Math.abs(diff).toFixed(1),
      direction: diff > 0.1 ? 'up' : diff < -0.1 ? 'down' : 'stable',
    };
  };

  const trend = calculateTrend();
  const latestWeight = chartData.length > 0 ? chartData[chartData.length - 1].weight : null;

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elegant rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Andamento Peso</h3>
        </div>
        <div className="h-[150px] flex items-center justify-center text-muted-foreground text-sm">
          Aggiungi il tuo primo check mensile per vedere l'andamento
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
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Andamento Peso</h3>
        </div>
        
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(Object.keys(timeFilterLabels) as TimeFilter[]).map((filterKey) => (
            <Button
              key={filterKey}
              variant={filter === filterKey ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(filterKey)}
              className="text-xs px-2 py-1 h-7"
            >
              {timeFilterLabels[filterKey]}
            </Button>
          ))}
        </div>
      </div>

      {/* Current weight and trend */}
      {latestWeight && (
        <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm text-muted-foreground">Peso attuale</p>
            <p className="text-2xl font-bold">{latestWeight} kg</p>
          </div>
          <div className="flex items-center gap-2">
            {trend.direction === 'down' && (
              <>
                <TrendingDown className="w-5 h-5 text-green-500" />
                <span className="text-green-500 font-medium">-{trend.value} kg</span>
              </>
            )}
            {trend.direction === 'up' && (
              <>
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <span className="text-orange-500 font-medium">+{trend.value} kg</span>
              </>
            )}
            {trend.direction === 'stable' && (
              <>
                <Minus className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground font-medium">Stabile</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={['dataMin - 2', 'dataMax + 2']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              width={40}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [`${value} kg`, 'Peso']}
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#weightGradient)"
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default WeightChart;
