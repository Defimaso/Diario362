import { motion } from 'framer-motion';
import { Camera, Check, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { UserCheck } from '@/hooks/useUserChecks';

interface CheckSlotCardProps {
  checkNumber: number;
  data: UserCheck | null;
  isCompleted: boolean;
  onClick: () => void;
}

const CheckSlotCard = ({ checkNumber, data, isCompleted, onClick }: CheckSlotCardProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full p-4 rounded-xl border transition-all text-left ${
        isCompleted
          ? 'bg-primary/10 border-primary/30 hover:border-primary/50'
          : 'bg-card border-border hover:border-muted-foreground/30'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isCompleted
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {isCompleted ? (
              <Check className="w-5 h-5" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
              Check #{checkNumber}
            </p>
            {isCompleted && data ? (
              <p className="text-sm text-muted-foreground">
                {format(new Date(data.check_date), 'd MMMM yyyy', { locale: it })}
                {data.weight && ` • ${data.weight} kg`}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Da completare</p>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </motion.button>
  );
};

export default CheckSlotCard;
