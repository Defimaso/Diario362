import { motion } from 'framer-motion';
import { 
  Star, 
  Dumbbell, 
  Apple, 
  Brain, 
  Target, 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  X 
} from 'lucide-react';
import { MonthlyCheck } from '@/hooks/useMonthlyChecks';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface MonthlyCheckDetailsProps {
  check: MonthlyCheck;
  onClose: () => void;
}

const RatingDisplay = ({ label, value, icon: Icon }: { label: string; value: number | null; icon: React.ElementType }) => {
  if (value === null) return null;
  
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= value ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`}
          />
        ))}
      </div>
    </div>
  );
};

const WeightTrend = ({ starting, current }: { starting: number | null; current: number | null }) => {
  if (!starting || !current) return null;
  
  const diff = current - starting;
  const percentage = ((diff / starting) * 100).toFixed(1);
  
  return (
    <div className="flex items-center gap-2">
      {diff < 0 ? (
        <>
          <TrendingDown className="w-4 h-4 text-green-500" />
          <span className="text-green-500 font-medium">{Math.abs(diff).toFixed(1)} kg ({percentage}%)</span>
        </>
      ) : diff > 0 ? (
        <>
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <span className="text-orange-500 font-medium">+{diff.toFixed(1)} kg (+{percentage}%)</span>
        </>
      ) : (
        <>
          <Minus className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Stabile</span>
        </>
      )}
    </div>
  );
};

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
            {check.check_number && (
              <Badge variant="secondary" className="mt-1">
                {check.check_number}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="max-h-[calc(85vh-80px)]">
          <div className="p-4 space-y-6">
            {/* Weight Section */}
            <div className="card-elegant rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-primary" />
                Peso
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Inizio</p>
                  <p className="text-lg font-bold">{check.starting_weight || '-'} kg</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ultimo Check</p>
                  <p className="text-lg font-bold">{check.last_check_weight || '-'} kg</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Attuale</p>
                  <p className="text-lg font-bold text-primary">{check.current_weight || '-'} kg</p>
                </div>
              </div>
              <div className="flex justify-center">
                <WeightTrend starting={check.starting_weight} current={check.current_weight} />
              </div>
            </div>

            {/* Program Info */}
            {check.program_type && (
              <div className="card-elegant rounded-lg p-4">
                <h3 className="font-semibold mb-3">Percorso</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo</span>
                    <span>{check.program_type}</span>
                  </div>
                  {check.coach_name && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coach</span>
                      <span>{check.coach_name}</span>
                    </div>
                  )}
                  {check.start_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inizio percorso</span>
                      <span>{check.start_date}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Training & Nutrition */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card-elegant rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  Allenamento
                </h3>
                <div className="space-y-2 text-sm">
                  {check.training_type && (
                    <p className="text-muted-foreground">{check.training_type}</p>
                  )}
                  {check.training_consistency && (
                    <Badge variant="outline">{check.training_consistency}</Badge>
                  )}
                  {check.activity_level && (
                    <p className="text-xs text-muted-foreground">{check.activity_level}</p>
                  )}
                </div>
              </div>

              <div className="card-elegant rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Apple className="w-4 h-4 text-primary" />
                  Nutrizione
                </h3>
                <div className="space-y-2 text-sm">
                  {check.nutrition_type && (
                    <p className="text-muted-foreground">{check.nutrition_type}</p>
                  )}
                  {check.off_program_meals && (
                    <Badge variant="outline">Pasti extra: {check.off_program_meals}</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Ratings */}
            <div className="card-elegant rounded-lg p-4">
              <h3 className="font-semibold mb-3">Valutazioni</h3>
              <div className="divide-y">
                <RatingDisplay label="Programma Allenamento" value={check.training_program_rating} icon={Dumbbell} />
                <RatingDisplay label="Percorso Nutrizionale" value={check.nutrition_program_rating} icon={Apple} />
                <RatingDisplay label="Assistenza" value={check.assistance_rating} icon={MessageSquare} />
              </div>
            </div>

            {/* Commitment */}
            <div className="card-elegant rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                Impegno Personale
              </h3>
              <div className="space-y-3">
                {check.training_commitment !== null && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Allenamento</span>
                      <span>{check.training_commitment}/5</span>
                    </div>
                    <Progress value={(check.training_commitment / 5) * 100} />
                  </div>
                )}
                {check.nutrition_commitment !== null && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Nutrizione</span>
                      <span>{check.nutrition_commitment}/5</span>
                    </div>
                    <Progress value={(check.nutrition_commitment / 5) * 100} />
                  </div>
                )}
                {check.mindset_commitment !== null && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Mindset</span>
                      <span>{check.mindset_commitment}/5</span>
                    </div>
                    <Progress value={(check.mindset_commitment / 5) * 100} />
                  </div>
                )}
              </div>
            </div>

            {/* Goals */}
            {check.next_month_goal && (
              <div className="card-elegant rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Obiettivo Prossimo Mese
                </h3>
                <p className="text-sm text-muted-foreground">{check.next_month_goal}</p>
              </div>
            )}

            {/* Testimonial */}
            {check.testimonial && (
              <div className="card-elegant rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Testimonianza
                </h3>
                <p className="text-sm text-muted-foreground italic">"{check.testimonial}"</p>
              </div>
            )}

            {/* Difficulties & Improvements */}
            {(check.lifestyle_difficulty || check.next_phase_improvement) && (
              <div className="card-elegant rounded-lg p-4">
                <h3 className="font-semibold mb-3">Riflessioni</h3>
                <div className="space-y-3 text-sm">
                  {check.lifestyle_difficulty && (
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Difficoltà riscontrate</p>
                      <p>{check.lifestyle_difficulty}</p>
                    </div>
                  )}
                  {check.next_phase_improvement && (
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Cosa migliorare</p>
                      <p>{check.next_phase_improvement}</p>
                    </div>
                  )}
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
