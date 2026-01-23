import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Plus } from 'lucide-react';
import { useProgressChecks } from '@/hooks/useProgressChecks';
import { useMonthlyChecks } from '@/hooks/useMonthlyChecks';
import WeightChart from './WeightChart';
import HistoryTable from './HistoryTable';
import PhotoComparison from './PhotoComparison';
import AddProgressCheckModal from './AddProgressCheckModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ProgressAnalysisProps {
  clientId?: string;
  showAddButton?: boolean;
}

const ProgressAnalysis = ({ clientId, showAddButton = true }: ProgressAnalysisProps) => {
  const {
    progressChecks,
    loading,
    uploading,
    getFilteredData,
    getDatesWithPhotos,
    getComparisonDefaults,
    saveProgressCheck,
    getSignedPhotoUrl,
  } = useProgressChecks(clientId);

  const { monthlyChecks, loading: monthlyLoading } = useMonthlyChecks(clientId);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  if (loading || monthlyLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[280px] w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  const datesWithPhotos = getDatesWithPhotos();
  const comparisonDefaults = getComparisonDefaults();

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Analisi Progresso</h2>
        </div>
        
        {showAddButton && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuovo Check
          </Button>
        )}
      </motion.div>

      {/* Weight Chart */}
      <WeightChart 
        data={progressChecks} 
        getFilteredData={getFilteredData} 
      />

      {/* Photo Comparison */}
      <PhotoComparison
        datesWithPhotos={datesWithPhotos}
        getSignedPhotoUrl={getSignedPhotoUrl}
        comparisonDefaults={comparisonDefaults}
      />

      {/* History Table - now with monthly checks data */}
      <HistoryTable 
        data={progressChecks} 
        monthlyChecks={monthlyChecks}
      />

      {/* Add Modal */}
      <AddProgressCheckModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={saveProgressCheck}
        uploading={uploading}
      />
    </div>
  );
};

export default ProgressAnalysis;
