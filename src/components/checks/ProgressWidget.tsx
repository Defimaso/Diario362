import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Camera, ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useUserChecks } from '@/hooks/useUserChecks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

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
      <Card className="section-green border-0">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-white/20" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-40 w-full bg-white/20" />
          <Skeleton className="h-24 w-full bg-white/20" />
        </CardContent>
      </Card>
    );
  }

  if (completedChecksCount === 0) {
    return (
      <Card className="section-green border-0 shadow-lg shadow-green-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5" />
            I Tuoi Progressi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Camera className="w-12 h-12 mx-auto text-white/60 mb-3" />
            <p className="text-white/80 mb-4">
              Inizia a registrare i tuoi check per vedere i progressi!
            </p>
            <Link to="/checks">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
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
    <Card className="section-green border-0 shadow-lg shadow-green-500/20 overflow-hidden">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="progress" className="border-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-2">
              <div className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold text-lg">I Tuoi Progressi</span>
              </div>
              {comparison?.weightDifference !== null && comparison?.weightDifference !== undefined && (
                <span className={cn(
                  "text-sm font-medium px-2 py-0.5 rounded-full",
                  comparison.weightDifference < 0
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/80'
                )}>
                  {comparison.weightDifference > 0 ? '+' : ''}{comparison.weightDifference.toFixed(1)} kg
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              {/* Weight Chart */}
              {chartData.length > 0 && (
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-white/80 mb-3">Andamento Peso</h4>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(val) => format(new Date(val), 'dd/MM', { locale: it })}
                          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)' }}
                          stroke="rgba(255,255,255,0.3)"
                        />
                        <YAxis 
                          domain={['dataMin - 2', 'dataMax + 2']}
                          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)' }}
                          stroke="rgba(255,255,255,0.3)"
                          width={35}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="white"
                          strokeWidth={2}
                          dot={{ fill: 'white', strokeWidth: 0, r: 4 }}
                          activeDot={{ r: 6, fill: 'white' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Photo Comparison */}
              {comparison ? (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-white/80">
                    Confronto Foto: Check #{comparison.first.check_number} vs #{comparison.last.check_number}
                  </h4>

                  {/* Weight Difference Badge */}
                  {comparison.weightDifference !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                        comparison.weightDifference < 0
                          ? 'bg-white/20 text-white'
                          : 'bg-white/10 text-white/80'
                      )}
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
                <div className="text-center py-4 bg-white/10 rounded-lg">
                  <Camera className="w-8 h-8 mx-auto text-white/60 mb-2" />
                  <p className="text-sm text-white/80">
                    Carica almeno due check per vedere il confronto fotografico!
                  </p>
                </div>
              ) : null}

              {/* Link to full checks */}
              <Link to="/checks" className="block">
                <Button variant="outline" size="sm" className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20">
                  Tutti i Check <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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
      <p className="text-xs text-white/70 font-medium">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-white/10">
          {firstPhoto ? (
            <img src={firstPhoto} alt={`${label} - Check #${firstCheckNumber}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-6 h-6 text-white/50" />
            </div>
          )}
          <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-2 py-0.5 rounded">
            #{firstCheckNumber}
          </span>
        </div>
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-white/10">
          {lastPhoto ? (
            <img src={lastPhoto} alt={`${label} - Check #${lastCheckNumber}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-6 h-6 text-white/50" />
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
