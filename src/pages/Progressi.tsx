import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Settings, Camera, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useProgressChecks } from '@/hooks/useProgressChecks';
import { useUserChecks, UserCheck } from '@/hooks/useUserChecks';
import Footer from '@/components/legal/Footer';
import WeightChart from '@/components/progress/WeightChart';
import PhotoComparison from '@/components/progress/PhotoComparison';
import HistoryTable from '@/components/progress/HistoryTable';
import CheckSlotCard from '@/components/checks/CheckSlotCard';
import CheckFormModal from '@/components/checks/CheckFormModal';
import BottomDock from '@/components/BottomDock';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  const {
    loading: checksLoading,
    uploading,
    getCheckSlots,
    saveCheck,
    completedChecksCount,
    totalChecks,
    getFirstCheckWithPhotos,
  } = useUserChecks();

  const [selectedCheck, setSelectedCheck] = useState<{
    checkNumber: number;
    data: UserCheck | null;
  } | null>(null);

  // Monthly checks are already merged inside useProgressChecks - no separate fetch needed
  const monthlyChecks = progressChecks.filter(c => c.source === 'external');

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
  const checkSlots = getCheckSlots();
  const completedSlots = checkSlots.filter(s => s.isCompleted);
  const pendingSlots = checkSlots.filter(s => !s.isCompleted);
  const firstCheck = getFirstCheckWithPhotos();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-green-500/20 via-background to-background pt-6 sm:pt-12 pb-4 sm:pb-6 px-4">
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
                  Check, peso e foto
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
          {/* Check Slots Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="card-elegant rounded-2xl p-5 border border-primary/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">I Tuoi Check</h2>
                </div>
                <span className="text-xs text-muted-foreground">
                  {completedChecksCount} di {totalChecks} completati
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedChecksCount / totalChecks) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-primary to-primary/70"
                  />
                </div>
              </div>

              {checksLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <Tabs defaultValue="pending">
                  <TabsList className="grid w-full grid-cols-2 mb-3">
                    <TabsTrigger value="pending" className="flex items-center gap-1.5 text-xs">
                      <Camera className="w-3.5 h-3.5" />
                      Da Fare ({pendingSlots.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="flex items-center gap-1.5 text-xs">
                      <Check className="w-3.5 h-3.5" />
                      Completati ({completedSlots.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending" className="space-y-2">
                    {pendingSlots.length === 0 ? (
                      <div className="text-center py-6">
                        <Check className="w-10 h-10 mx-auto text-primary mb-2" />
                        <p className="text-sm font-medium">Fantastico!</p>
                        <p className="text-xs text-muted-foreground">Hai completato tutti i check disponibili.</p>
                      </div>
                    ) : (
                      pendingSlots.map((slot) => (
                        <CheckSlotCard
                          key={slot.checkNumber}
                          checkNumber={slot.checkNumber}
                          data={slot.data}
                          isCompleted={slot.isCompleted}
                          onClick={() => setSelectedCheck({ checkNumber: slot.checkNumber, data: slot.data })}
                        />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-2">
                    {completedSlots.length === 0 ? (
                      <div className="text-center py-6">
                        <Camera className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm font-medium text-muted-foreground">Nessun check completato</p>
                        <p className="text-xs text-muted-foreground">Inizia con il Check #1!</p>
                      </div>
                    ) : (
                      completedSlots.map((slot) => (
                        <CheckSlotCard
                          key={slot.checkNumber}
                          checkNumber={slot.checkNumber}
                          data={slot.data}
                          isCompleted={slot.isCompleted}
                          onClick={() => setSelectedCheck({ checkNumber: slot.checkNumber, data: slot.data })}
                        />
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </motion.section>

          {/* Progress Charts */}
          {loading ? (
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

      {/* Check Form Modal */}
      <CheckFormModal
        isOpen={!!selectedCheck}
        onClose={() => setSelectedCheck(null)}
        checkNumber={selectedCheck?.checkNumber || 1}
        existingData={selectedCheck?.data || null}
        onSave={saveCheck}
        uploading={uploading}
        firstCheckData={selectedCheck && selectedCheck.checkNumber > 1 ? firstCheck : null}
      />

      <BottomDock />
    </div>
  );
};

export default Progressi;
