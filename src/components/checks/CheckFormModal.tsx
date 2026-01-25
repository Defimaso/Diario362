import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Scale, Calendar, Upload, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserCheck } from '@/hooks/useUserChecks';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CheckFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkNumber: number;
  existingData: UserCheck | null;
  onSave: (data: {
    checkNumber: number;
    weight?: number;
    photoFront?: File;
    photoSide?: File;
    photoBack?: File;
    notes?: string;
    checkDate: string;
  }) => Promise<{ error: Error | null }>;
  uploading: boolean;
}

const CheckFormModal = ({
  isOpen,
  onClose,
  checkNumber,
  existingData,
  onSave,
  uploading,
}: CheckFormModalProps) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [photoFront, setPhotoFront] = useState<File | null>(null);
  const [photoSide, setPhotoSide] = useState<File | null>(null);
  const [photoBack, setPhotoBack] = useState<File | null>(null);
  const [photoFrontPreview, setPhotoFrontPreview] = useState<string | null>(null);
  const [photoSidePreview, setPhotoSidePreview] = useState<string | null>(null);
  const [photoBackPreview, setPhotoBackPreview] = useState<string | null>(null);

  // Reset form when opening with existing data
  useEffect(() => {
    if (isOpen) {
      if (existingData) {
        setDate(existingData.check_date);
        setWeight(existingData.weight?.toString() || '');
        setNotes(existingData.notes || '');
        setPhotoFrontPreview(existingData.photo_front_url);
        setPhotoSidePreview(existingData.photo_side_url);
        setPhotoBackPreview(existingData.photo_back_url);
      } else {
        setDate(new Date().toISOString().split('T')[0]);
        setWeight('');
        setNotes('');
        setPhotoFrontPreview(null);
        setPhotoSidePreview(null);
        setPhotoBackPreview(null);
      }
      setPhotoFront(null);
      setPhotoSide(null);
      setPhotoBack(null);
    }
  }, [isOpen, existingData]);

  const handleFileChange = (
    file: File | null,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void
  ) => {
    setFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const result = await onSave({
      checkNumber,
      weight: weight ? parseFloat(weight) : undefined,
      photoFront: photoFront || undefined,
      photoSide: photoSide || undefined,
      photoBack: photoBack || undefined,
      notes: notes || undefined,
      checkDate: date,
    });

    if (!result.error) {
      onClose();
    }
  };

  const PhotoUploadBox = ({
    label,
    preview,
    onChange,
  }: {
    label: string;
    preview: string | null;
    onChange: (f: File | null) => void;
  }) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <label className="block aspect-[3/4] rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden bg-muted/30">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
        {preview ? (
          <div className="relative w-full h-full">
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Upload className="w-6 h-6" />
            <span className="text-xs">Carica</span>
          </div>
        )}
      </label>
    </div>
  );

  const hasAnyData = weight || photoFront || photoSide || photoBack || 
    (existingData && (existingData.weight || existingData.photo_front_url || existingData.photo_side_url || existingData.photo_back_url));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-4 bottom-4 top-auto max-h-[85vh] overflow-y-auto bg-card rounded-2xl z-50 shadow-2xl"
          >
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold">Check #{checkNumber}</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 space-y-5">
              {/* Reminder Alert */}
              <Alert className="bg-amber-500/10 border-amber-500/30">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-sm text-amber-700 dark:text-amber-300">
                  Promemoria: Compila questa sezione ogni volta che invii il modulo ufficiale su Google 
                  per mantenere aggiornati i tuoi progressi nell'app.
                </AlertDescription>
              </Alert>

              {/* Date */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Data del Check
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  Peso (kg)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Es: 72.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-primary" />
                  Foto Progresso
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <PhotoUploadBox
                    label="Fronte"
                    preview={photoFrontPreview}
                    onChange={(f) => handleFileChange(f, setPhotoFront, setPhotoFrontPreview)}
                  />
                  <PhotoUploadBox
                    label="Lato"
                    preview={photoSidePreview}
                    onChange={(f) => handleFileChange(f, setPhotoSide, setPhotoSidePreview)}
                  />
                  <PhotoUploadBox
                    label="Schiena"
                    preview={photoBackPreview}
                    onChange={(f) => handleFileChange(f, setPhotoBack, setPhotoBackPreview)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Note Personali (opzionale)</Label>
                <Textarea
                  placeholder="Come ti senti? Cambiamenti notati? Obiettivi raggiunti?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={uploading || !hasAnyData}
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Upload className="w-4 h-4" />
                    </motion.div>
                    Salvataggio...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {existingData ? 'Aggiorna Check' : 'Salva Check'}
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CheckFormModal;
