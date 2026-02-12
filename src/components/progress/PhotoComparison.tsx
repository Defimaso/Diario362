import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, ArrowRight, Calendar } from 'lucide-react';
import { ProgressCheck } from '@/hooks/useProgressChecks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface PhotoComparisonProps {
  datesWithPhotos: ProgressCheck[];
  getSignedPhotoUrl: (path: string) => Promise<string | null>;
  comparisonDefaults: { start: ProgressCheck | null; end: ProgressCheck | null };
}

type PhotoType = 'front' | 'side' | 'back';

const photoTypeLabels: Record<PhotoType, string> = {
  front: 'Fronte',
  side: 'Lato',
  back: 'Retro',
};

const PhotoComparison = ({ 
  datesWithPhotos, 
  getSignedPhotoUrl,
  comparisonDefaults,
}: PhotoComparisonProps) => {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<PhotoType>('front');
  const [startPhotoUrl, setStartPhotoUrl] = useState<string | null>(null);
  const [endPhotoUrl, setEndPhotoUrl] = useState<string | null>(null);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Set defaults on mount
  useEffect(() => {
    if (comparisonDefaults.start && comparisonDefaults.end) {
      setStartDate(comparisonDefaults.start.date);
      setEndDate(comparisonDefaults.end.date);
    }
  }, [comparisonDefaults]);

  // Load photos when dates or type change
  useEffect(() => {
    const loadPhotos = async () => {
      setLoadingPhotos(true);
      
      const startCheck = datesWithPhotos.find(d => d.date === startDate);
      const endCheck = datesWithPhotos.find(d => d.date === endDate);

      const getPhotoUrl = (check: ProgressCheck | undefined) => {
        if (!check) return null;
        switch (photoType) {
          case 'front': return check.photo_front_url;
          case 'side': return check.photo_side_url;
          case 'back': return check.photo_back_url;
          default: return null;
        }
      };

      const startPath = getPhotoUrl(startCheck);
      const endPath = getPhotoUrl(endCheck);

      const [signedStart, signedEnd] = await Promise.all([
        startPath ? getSignedPhotoUrl(startPath) : Promise.resolve(null),
        endPath ? getSignedPhotoUrl(endPath) : Promise.resolve(null),
      ]);

      setStartPhotoUrl(signedStart);
      setEndPhotoUrl(signedEnd);
      setLoadingPhotos(false);
    };

    if (startDate && endDate) {
      loadPhotos();
    }
  }, [startDate, endDate, photoType, datesWithPhotos, getSignedPhotoUrl]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Check which photo types are available for both selected dates
  const getAvailablePhotoTypes = (): PhotoType[] => {
    const startCheck = datesWithPhotos.find(d => d.date === startDate);
    const endCheck = datesWithPhotos.find(d => d.date === endDate);
    
    const types: PhotoType[] = [];
    if (startCheck?.photo_front_url && endCheck?.photo_front_url) types.push('front');
    if (startCheck?.photo_side_url && endCheck?.photo_side_url) types.push('side');
    if (startCheck?.photo_back_url && endCheck?.photo_back_url) types.push('back');
    
    return types;
  };

  if (datesWithPhotos.length < 2) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elegant rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Comparazione Foto</h3>
        </div>
        <div className="h-[150px] flex items-center justify-center text-muted-foreground text-sm text-center px-4">
          Aggiungi almeno 2 check con foto per vedere la comparazione del tuo progresso
        </div>
      </motion.div>
    );
  }

  const availableTypes = getAvailablePhotoTypes();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elegant rounded-xl p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Comparazione Foto</h3>
      </div>

      {/* Date Selectors */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Inizio</label>
          <Select value={startDate || ''} onValueChange={setStartDate}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleziona data">
                {startDate ? formatDate(startDate) : 'Seleziona'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {datesWithPhotos.map((check) => (
                <SelectItem 
                  key={check.id} 
                  value={check.date}
                  disabled={check.date === endDate}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {formatDate(check.date)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Fine</label>
          <Select value={endDate || ''} onValueChange={setEndDate}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleziona data">
                {endDate ? formatDate(endDate) : 'Seleziona'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {datesWithPhotos.map((check) => (
                <SelectItem 
                  key={check.id} 
                  value={check.date}
                  disabled={check.date === startDate}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {formatDate(check.date)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Photo Type Selector */}
      {startDate && endDate && availableTypes.length > 0 && (
        <div className="flex gap-2 mb-4">
          {availableTypes.map((type) => (
            <button
              key={type}
              onClick={() => setPhotoType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                photoType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {photoTypeLabels[type]}
            </button>
          ))}
        </div>
      )}

      {/* Photo Comparison */}
      {startDate && endDate && (
        <div className="grid grid-cols-2 gap-3">
          {/* Start Photo */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              {formatDate(startDate)}
            </p>
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {loadingPhotos ? (
                <Skeleton className="w-full h-full" />
              ) : startPhotoUrl ? (
                <img
                  src={startPhotoUrl}
                  alt="Foto inizio"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="text-muted-foreground text-xs text-center p-2">
                  Foto non disponibile
                </div>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden">
            <ArrowRight className="w-6 h-6 text-primary" />
          </div>

          {/* End Photo */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              {formatDate(endDate)}
            </p>
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {loadingPhotos ? (
                <Skeleton className="w-full h-full" />
              ) : endPhotoUrl ? (
                <img
                  src={endPhotoUrl}
                  alt="Foto fine"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="text-muted-foreground text-xs text-center p-2">
                  Foto non disponibile
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PhotoComparison;
