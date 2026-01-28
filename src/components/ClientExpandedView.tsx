import { useState, useEffect, forwardRef } from 'react';
import { Camera, TrendingDown, TrendingUp, Scale, FileText, Apple, Download, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import DailyCheckinStatus from './DailyCheckinStatus';
import DailyCheckinDetails from './DailyCheckinDetails';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useUserDiet } from '@/hooks/useUserDiet';
import StaffVideoFeedbackPanel from './staff/StaffVideoFeedbackPanel';

interface UserCheck {
  id: string;
  check_number: number;
  weight: number | null;
  photo_front_url: string | null;
  photo_side_url: string | null;
  photo_back_url: string | null;
  notes: string | null;
  check_date: string;
}

interface DailyCheckin {
  id: string;
  date: string;
  recovery: number | null;
  nutrition_adherence: boolean | null;
  energy: number | null;
  mindset: number | null;
  two_percent_edge: string | null;
}

interface ClientExpandedViewProps {
  clientId: string;
  clientName: string;
  coachNames: string[];
}

const ClientExpandedView = ({ clientId, clientName, coachNames }: ClientExpandedViewProps) => {
  const [checks, setChecks] = useState<UserCheck[]>([]);
  const [dailyCheckins, setDailyCheckins] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const { logAction } = useAuditLog();
  const { dietPlan, loading: dietLoading, downloadDietPlan } = useUserDiet(clientId);

  useEffect(() => {
    const fetchChecks = async () => {
      setLoading(true);
      
      try {
        // Fetch user checks
        const { data: checksData, error: checksError } = await supabase
          .from('user_checks')
          .select('*')
          .eq('user_id', clientId)
          .order('check_number', { ascending: true });

        if (!checksError && checksData) {
          setChecks(checksData);
          console.log('ClientExpandedView - Checks loaded:', checksData.length, 'for client:', clientName);
        } else if (checksError) {
          console.error('ClientExpandedView - Error loading checks:', checksError);
        }
        
        // Fetch daily checkins (last 30 days for detailed view)
        const thirtyDaysAgo = subDays(new Date(), 30);
        const { data: dailyData, error: dailyError } = await supabase
          .from('daily_checkins')
          .select('id, date, recovery, nutrition_adherence, energy, mindset, two_percent_edge')
          .eq('user_id', clientId)
          .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
          .order('date', { ascending: false });

        if (!dailyError && dailyData) {
          setDailyCheckins(dailyData);
          console.log('ClientExpandedView - Daily checkins loaded:', dailyData.length);
        } else if (dailyError) {
          console.error('ClientExpandedView - Error loading daily checkins:', dailyError);
        }
        
        // Log audit action asynchronously (don't await, don't block UI)
        logAction({
          action: 'view_client_data',
          targetUserId: clientId,
          targetTable: 'user_checks',
          details: { clientName },
        }).catch(err => console.warn('Audit log failed:', err));
        
      } catch (err) {
        console.error('ClientExpandedView - Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChecks();
  }, [clientId, clientName]); // Removed logAction from deps to prevent infinite loop

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
        <div className="h-24 bg-muted rounded-xl animate-pulse" />
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  // Get first and last check for comparison
  const firstCheck = checks.length > 0 ? checks[0] : null;
  const lastCheck = checks.length > 1 ? checks[checks.length - 1] : null;
  
  // Calculate weight difference
  const weightDifference = firstCheck?.weight && lastCheck?.weight
    ? Number(lastCheck.weight) - Number(firstCheck.weight)
    : null;

  // Chart data
  const chartData = checks
    .filter(c => c.weight)
    .map(c => ({
      date: c.check_date,
      weight: Number(c.weight),
      checkNumber: c.check_number,
    }));

  // Format coach name display
  const formatCoachName = (name: string) => {
    return name.replace(/_/g, ' / ');
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 bg-muted/30 rounded-lg mt-2">
      {/* Daily Check-in Status - 7 day overview */}
      <DailyCheckinStatus clientId={clientId} />

      {/* Daily Check-in Details - Expandable history with metrics breakdown */}
      <div className="bg-card rounded-xl p-3 sm:p-4 border border-section-red/30">
        <DailyCheckinDetails checkins={dailyCheckins} />
      </div>

      {/* Client Info */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Coach:</span>
          <span className="font-medium text-primary">
            {coachNames.map(formatCoachName).join(', ') || 'Non assegnato'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Check completati:</span>
          <span className="font-medium">{checks.length} / 100</span>
        </div>
      </div>

      {/* Weight Chart */}
      {chartData.length > 0 ? (
        <div className="bg-card rounded-xl p-3 sm:p-4 border border-border">
          <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3 flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Andamento Peso
          </h4>
          <div className="h-32 sm:h-40">
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
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value} kg`, 'Peso']}
                  labelFormatter={(label) => format(new Date(label), 'dd MMMM yyyy', { locale: it })}
                />
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
          
          {/* Weight difference badge */}
          {weightDifference !== null && (
            <div className={cn(
              "mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
              weightDifference < 0
                ? 'bg-success/10 text-success'
                : weightDifference > 0
                ? 'bg-warning/10 text-warning'
                : 'bg-muted text-muted-foreground'
            )}>
              {weightDifference < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              {weightDifference > 0 ? '+' : ''}{weightDifference.toFixed(1)} kg dal primo check
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-xl p-4 sm:p-6 border border-border/50 text-center">
          <Scale className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-sm font-semibold text-muted-foreground mb-1">
            📊 Grafico non disponibile
          </p>
          <p className="text-xs text-muted-foreground/70">
            Il cliente non ha ancora registrato peso nei check mensili
          </p>
        </div>
      )}

      {/* Photo Comparison */}
      {firstCheck && lastCheck ? (
        <div className="bg-card rounded-xl p-3 sm:p-4 border border-border">
          <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span className="truncate">Confronto: #{firstCheck.check_number} vs #{lastCheck.check_number}</span>
          </h4>
          
          <div className="space-y-4">
            {/* Front photos */}
            {(firstCheck.photo_front_url || lastCheck.photo_front_url) && (
              <PhotoRow 
                label="Fronte"
                first={firstCheck.photo_front_url}
                last={lastCheck.photo_front_url}
                firstNum={firstCheck.check_number}
                lastNum={lastCheck.check_number}
              />
            )}
            
            {/* Side photos */}
            {(firstCheck.photo_side_url || lastCheck.photo_side_url) && (
              <PhotoRow 
                label="Lato"
                first={firstCheck.photo_side_url}
                last={lastCheck.photo_side_url}
                firstNum={firstCheck.check_number}
                lastNum={lastCheck.check_number}
              />
            )}
            
            {/* Back photos */}
            {(firstCheck.photo_back_url || lastCheck.photo_back_url) && (
              <PhotoRow 
                label="Schiena"
                first={firstCheck.photo_back_url}
                last={lastCheck.photo_back_url}
                firstNum={firstCheck.check_number}
                lastNum={lastCheck.check_number}
              />
            )}
          </div>
        </div>
      ) : checks.length === 1 ? (
        <div className="bg-card rounded-xl p-4 sm:p-6 border border-border/50 text-center">
          <Camera className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-sm font-semibold text-muted-foreground mb-1">
            📸 Confronto foto non disponibile
          </p>
          <p className="text-xs text-muted-foreground/70">
            Serve almeno 2 check per il confronto. Attualmente: {checks.length} check.
          </p>
        </div>
      ) : null}

      {/* Check History Table */}
      <div className="bg-card rounded-xl p-3 sm:p-4 border border-border overflow-hidden">
        <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Storico Check ({checks.length})
        </h4>
        
        {checks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nessun check registrato
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">#</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Data</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Peso</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Foto</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((check) => (
                  <tr key={check.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2 px-2 font-medium">{check.check_number}</td>
                    <td className="py-2 px-2">
                      {format(new Date(check.check_date), 'dd/MM/yy', { locale: it })}
                    </td>
                    <td className="py-2 px-2">
                      {check.weight ? `${check.weight} kg` : '-'}
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex gap-1">
                        {check.photo_front_url && <span className="text-xs bg-primary/10 text-primary px-1 rounded">F</span>}
                        {check.photo_side_url && <span className="text-xs bg-primary/10 text-primary px-1 rounded">L</span>}
                        {check.photo_back_url && <span className="text-xs bg-primary/10 text-primary px-1 rounded">S</span>}
                        {!check.photo_front_url && !check.photo_side_url && !check.photo_back_url && '-'}
                      </div>
                    </td>
                    <td className="py-2 px-2 max-w-[150px] truncate text-muted-foreground">
                      {check.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Video Corrections Section */}
      <div className="bg-card rounded-xl p-3 sm:p-4 border border-primary/30">
        <StaffVideoFeedbackPanel clientId={clientId} />
      </div>

      {/* Nutrition Section */}
      <div className="bg-card rounded-xl p-3 sm:p-4 border border-[hsl(var(--section-purple))]/30">
        <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3 flex items-center gap-2">
          <Apple className="w-4 h-4 text-[hsl(var(--section-purple))]" />
          Piano Alimentare
        </h4>
        
        {dietLoading ? (
          <div className="h-16 bg-muted rounded-lg animate-pulse" />
        ) : dietPlan ? (
          <div className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-[hsl(var(--section-purple))]/10">
                <FileText className="w-5 h-5 text-[hsl(var(--section-purple))]" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{dietPlan.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  Caricato: {format(new Date(dietPlan.uploaded_at), 'dd/MM/yyyy', { locale: it })}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={downloadDietPlan}>
              <Download className="w-4 h-4 mr-1" />
              Scarica
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nessun piano alimentare caricato
          </p>
        )}
      </div>

      {/* Empty state if no checks */}
      {!loading && checks.length === 0 && (
        <div className="text-center py-8">
          <Camera className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm sm:text-base text-muted-foreground font-medium mb-1">
            Nessun check registrato
          </p>
          <p className="text-xs text-muted-foreground/70">
            {clientName} non ha ancora completato check mensili
          </p>
        </div>
      )}
    </div>
  );
};

// Photo comparison row component
interface PhotoRowProps {
  label: string;
  first: string | null;
  last: string | null;
  firstNum: number;
  lastNum: number;
}

const PhotoRow = forwardRef<HTMLDivElement, PhotoRowProps>(
  ({ label, first, last, firstNum, lastNum }, ref) => (
    <div className="space-y-1" ref={ref}>
      <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{label}</p>
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
          {first ? (
            <img src={first} alt={`${label} - Check #${firstNum}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
            </div>
          )}
          <span className="absolute bottom-0.5 left-0.5 sm:bottom-1 sm:left-1 text-[10px] sm:text-xs bg-black/60 text-white px-1.5 sm:px-2 py-0.5 rounded">
            #{firstNum}
          </span>
        </div>
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
          {last ? (
            <img src={last} alt={`${label} - Check #${lastNum}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
            </div>
          )}
          <span className="absolute bottom-0.5 left-0.5 sm:bottom-1 sm:left-1 text-[10px] sm:text-xs bg-black/60 text-white px-1.5 sm:px-2 py-0.5 rounded">
            #{lastNum}
          </span>
        </div>
      </div>
    </div>
  )
);

PhotoRow.displayName = 'PhotoRow';

export default ClientExpandedView;
