import { motion } from 'framer-motion';
import { TrendingUp, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useProgressChecks } from '@/hooks/useProgressChecks';
import { useMonthlyChecks } from '@/hooks/useMonthlyChecks';
import WeightChart from '@/components/progress/WeightChart';
import PhotoComparison from '@/components/progress/PhotoComparison';
import HistoryTable from '@/components/progress/HistoryTable';
import BottomDock from '@/components/BottomDock';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/NotificationBell';

const Progressi = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    progressChecks,
    loading,
    getFilteredData,
    getDatesWithPhotos,
    getComparisonDefaults,
    getSignedPhotoUrl,
  } = useProgressChecks();

  const { monthlyChecks, loading: monthlyLoading } = useMonthlyChecks();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const datesWithPhotos = getDatesWithPhotos();
  const comparisonDefaults = getComparisonDefaults();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-green-500/20 via-background to-background pt-12 pb-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/20">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">I Tuoi Progressi</h1>
                <p className="text-sm text-muted-foreground">
                  Analizza il tuo percorso
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <NotificationBell />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                className="text-muted-foreground"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="px-4 space-y-4">
        <div className="max-w-lg mx-auto space-y-4">
          {loading || monthlyLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[280px] w-full rounded-xl" />
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
          ) : (
            <>
              {/* Weight Chart */}
              <WeightChart data={progressChecks} getFilteredData={getFilteredData} />

              {/* Photo Comparison */}
              <PhotoComparison
                datesWithPhotos={datesWithPhotos}
                getSignedPhotoUrl={getSignedPhotoUrl}
                comparisonDefaults={comparisonDefaults}
              />

              {/* History Table */}
              <HistoryTable data={progressChecks} monthlyChecks={monthlyChecks} />
            </>
          )}
        </div>
      </main>

      <BottomDock />
    </div>
  );
};

export default Progressi;
