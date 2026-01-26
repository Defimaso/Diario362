import { useState, useEffect, forwardRef } from 'react';
import { Camera, TrendingDown, TrendingUp, Scale, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import DailyCheckinStatus from './DailyCheckinStatus';
import { useAuditLog } from '@/hooks/useAuditLog';

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

interface ClientExpandedViewProps {
  clientId: string;
  clientName: string;
  coachNames: string[];
}

const ClientExpandedView = ({ clientId, clientName, coachNames }: ClientExpandedViewProps) => {
  const [checks, setChecks] = useState<UserCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const { logAction } = useAuditLog();

  useEffect(() => {
    const fetchChecks = async () => {
      setLoading(true);
      
      // Log audit action for GDPR accountability
      await logAction({
        action: 'view_client_data',
        targetUserId: clientId,
        targetTable: 'user_checks',
        details: { clientName },
      });

      const { data, error } = await supabase
        .from('user_checks')
        .select('*')
        .eq('user_id', clientId)
        .order('check_number', { ascending: true });

      if (!error && data) {
        setChecks(data);
      }
      setLoading(false);
    };

    fetchChecks();
  }, [clientId, clientName, logAction]);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
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
      {/* Daily Check-in Status - NEW SECTION */}
      <DailyCheckinStatus clientId={clientId} />

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
      {chartData.length > 0 && (
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
      )}

      {/* Photo Comparison */}
      {firstCheck && lastCheck && (
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
      )}

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

      {/* Empty state if no checks */}
      {checks.length === 0 && (
        <div className="text-center py-8">
          <Camera className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            {clientName} non ha ancora registrato check
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
