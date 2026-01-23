import { motion } from 'framer-motion';
import { 
  TrendingDown,
  X,
  Scale
} from 'lucide-react';
import { MonthlyCheck } from '@/hooks/useMonthlyChecks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface MonthlyCheckDetailsProps {
  check: MonthlyCheck;
  onClose: () => void;
}

const MonthlyCheckDetails = ({ check, onClose }: MonthlyCheckDetailsProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-bold">
              Check del {formatDate(check.check_date)}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="max-h-[calc(85vh-80px)]">
          <div className="p-4 space-y-6">
            {/* Weight Section */}
            {check.current_weight && (
              <div className="card-elegant rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  Peso
                </h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{check.current_weight} kg</p>
                </div>
              </div>
            )}

            {/* Photos */}
            {(check.photo_front_url || check.photo_side_url || check.photo_back_url) && (
              <div className="card-elegant rounded-lg p-4">
                <h3 className="font-semibold mb-3">Foto</h3>
                <div className="grid grid-cols-3 gap-2">
                  {check.photo_front_url && (
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={check.photo_front_url} 
                        alt="Front" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {check.photo_side_url && (
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={check.photo_side_url} 
                        alt="Side" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {check.photo_back_url && (
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={check.photo_back_url} 
                        alt="Back" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
};

export default MonthlyCheckDetails;
