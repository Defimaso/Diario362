import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserChecks, UserCheck } from '@/hooks/useUserChecks';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumGate } from '@/components/PremiumGate';
import Footer from '@/components/legal/Footer';
import CheckSlotCard from '@/components/checks/CheckSlotCard';
import CheckFormModal from '@/components/checks/CheckFormModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BottomDock from '@/components/BottomDock';

const Checks = () => {
  const { isPremium, isLoading: subLoading } = useSubscription();
  const {
    loading,
    uploading,
    getCheckSlots,
    saveCheck,
    completedChecksCount,
    totalChecks,
    getFirstCheckWithPhotos
  } = useUserChecks();
  const [selectedCheck, setSelectedCheck] = useState<{
    checkNumber: number;
    data: UserCheck | null;
  } | null>(null);

  const checkSlots = getCheckSlots();
  const completedSlots = checkSlots.filter(s => s.isCompleted);
  const pendingSlots = checkSlots.filter(s => !s.isCompleted);
  
  // Get first check data for ghost overlay
  const firstCheck = getFirstCheckWithPhotos();

  if (!subLoading && !isPremium) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-5 py-6 sm:py-8">
          <PremiumGate />
        </div>
        <BottomDock />
        <Footer />
      </div>
    );
  }

  if (loading || subLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-10 w-full" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">I Tuoi Check</h1>
            <p className="text-sm text-muted-foreground">
              {completedChecksCount} di {totalChecks} completati
            </p>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progressi</span>
          <span className="font-medium">{Math.round((completedChecksCount / totalChecks) * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedChecksCount / totalChecks) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary to-primary/70"
          />
        </div>
      </div>

      {/* Tabs */}
      <main className="p-4">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Da Fare ({pendingSlots.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Completati ({completedSlots.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3">
            {pendingSlots.length === 0 ? (
              <div className="text-center py-12">
                <Check className="w-16 h-16 mx-auto text-primary mb-4" />
                <p className="text-lg font-medium">Fantastico!</p>
                <p className="text-muted-foreground">Hai completato tutti i check disponibili.</p>
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

          <TabsContent value="completed" className="space-y-3">
            {completedSlots.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Nessun check completato</p>
                <p className="text-sm text-muted-foreground">Inizia con il Check #1!</p>
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

      {/* Bottom Dock */}
      <BottomDock />
    </div>
  );
};

export default Checks;
