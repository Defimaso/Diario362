import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Camera, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useUserChecks } from '@/hooks/useUserChecks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const ProgressWidget = () => {
  const { loading, getComparisonData, getWeightChartData, completedChecksCount } = useUserChecks();
  const [chartData, setChartData] = useState<{ date: string; weight: number; checkNumber: number }[]>([]);
  const [comparison, setComparison] = useState<ReturnType<typeof getComparisonData>>(null);

  useEffect(() => {
    if (!loading) {
      setChartData(getWeightChartData());
      setComparison(getComparisonData());
    }
  }, [loading, getWeightChartData, getComparisonData]);

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (completedChecksCount === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            I Tuoi Progressi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              Inizia a registrare i tuoi check per vedere i progressi!
            </p>
            <Link to="/checks">
              <Button variant="outline">
                Vai ai Check <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
          <p className="text-sm font-medium">{payload[0].value} kg</p>
          <p className="text-xs text-muted-foreground">
            Check #{payload[0].payload.checkNumber}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          I Tuoi Progressi
        </CardTitle>
        <Link to="/checks">
          <Button variant="ghost" size="sm">
            Tutti i Check <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weight Chart */}
        {chartData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Andamento Peso</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => format(new Date(val), 'dd/MM', { locale: it })}
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                    width={35}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Photo Comparison */}
        {comparison ? (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Confronto Foto: Check #{comparison.first.check_number} vs #{comparison.last.check_number}
            </h4>

            {/* Weight Difference Badge */}
            {comparison.weightDifference !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  comparison.weightDifference < 0
                    ? 'bg-green-500/10 text-green-500'
                    : comparison.weightDifference > 0
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {comparison.weightDifference < 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                {comparison.weightDifference > 0 ? '+' : ''}{comparison.weightDifference.toFixed(1)} kg
              </motion.div>
            )}

            {/* Photo Grid */}
            <div className="space-y-3">
              {/* Front Row */}
              <PhotoComparisonRow
                label="Fronte"
                firstPhoto={comparison.first.photo_front_url}
                lastPhoto={comparison.last.photo_front_url}
                firstCheckNumber={comparison.first.check_number}
                lastCheckNumber={comparison.last.check_number}
              />
              
              {/* Side Row */}
              <PhotoComparisonRow
                label="Lato"
                firstPhoto={comparison.first.photo_side_url}
                lastPhoto={comparison.last.photo_side_url}
                firstCheckNumber={comparison.first.check_number}
                lastCheckNumber={comparison.last.check_number}
              />
              
              {/* Back Row */}
              <PhotoComparisonRow
                label="Schiena"
                firstPhoto={comparison.first.photo_back_url}
                lastPhoto={comparison.last.photo_back_url}
                firstCheckNumber={comparison.first.check_number}
                lastCheckNumber={comparison.last.check_number}
              />
            </div>
          </div>
        ) : completedChecksCount === 1 ? (
          <div className="text-center py-4 bg-muted/30 rounded-lg">
            <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Carica almeno due check per vedere il confronto fotografico!
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

interface PhotoComparisonRowProps {
  label: string;
  firstPhoto: string | null;
  lastPhoto: string | null;
  firstCheckNumber: number;
  lastCheckNumber: number;
}

const PhotoComparisonRow = ({ label, firstPhoto, lastPhoto, firstCheckNumber, lastCheckNumber }: PhotoComparisonRowProps) => {
  const hasPhotos = firstPhoto || lastPhoto;
  
  if (!hasPhotos) return null;

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
          {firstPhoto ? (
            <img src={firstPhoto} alt={`${label} - Check #${firstCheckNumber}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-2 py-0.5 rounded">
            #{firstCheckNumber}
          </span>
        </div>
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
          {lastPhoto ? (
            <img src={lastPhoto} alt={`${label} - Check #${lastCheckNumber}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-2 py-0.5 rounded">
            #{lastCheckNumber}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressWidget;
