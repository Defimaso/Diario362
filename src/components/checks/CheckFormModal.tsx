import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Scale, Calendar, Upload, Check, AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserCheck } from '@/hooks/useUserChecks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createObjectURLFromFile, compressImage } from '@/lib/imageCompression';
import { toast } from 'sonner';
import { useCheckDraft } from '@/hooks/useCheckDraft';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  firstCheckData?: UserCheck | null;
}

const CheckFormModal = ({
  isOpen,
  onClose,
  checkNumber,
  existingData,
  onSave,
  uploading,
  firstCheckData,
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
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftChecked, setDraftChecked] = useState(false);

  // Draft system
  const { hasDraft, saveDraft, clearDraft, getDraft } = useCheckDraft(checkNumber);

  // Check for draft when opening modal
  useEffect(() => {
    if (isOpen && !draftChecked && !existingData) {
      if (hasDraft) {
        setShowDraftDialog(true);
      }
      setDraftChecked(true);
    }
  }, [isOpen, hasDraft, draftChecked, existingData]);

  // Reset draftChecked when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDraftChecked(false);
    }
  }, [isOpen]);

  // Auto-save draft when fields change
  const autoSaveDraft = useCallback(() => {
    if (!isOpen || existingData) return;

    // Only save if there's actual data
    if (weight || notes || photoFrontPreview || photoSidePreview || photoBackPreview) {
      saveDraft({
        checkNumber,
        date,
        weight,
        notes,
        photoFrontPreview: photoFrontPreview || undefined,
        photoSidePreview: photoSidePreview || undefined,
        photoBackPreview: photoBackPreview || undefined,
      });
    }
  }, [isOpen, existingData, checkNumber, date, weight, notes, photoFrontPreview, photoSidePreview, photoBackPreview, saveDraft]);

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(autoSaveDraft, 1000);
    return () => clearTimeout(timer);
  }, [autoSaveDraft]);

  // Track which previews are "draft-only" (no File object — need re-upload)
  const [draftOnlyPreviews, setDraftOnlyPreviews] = useState<Set<string>>(new Set());

  // Handle restoring draft
  const handleRestoreDraft = () => {
    const draft = getDraft();
    if (draft) {
      setDate(draft.date || new Date().toISOString().split('T')[0]);
      setWeight(draft.weight || '');
      setNotes(draft.notes || '');
      // Restore previews but mark them as "draft-only" since File objects can't be serialized
      const draftOnly = new Set<string>();
      if (draft.photoFrontPreview) { setPhotoFrontPreview(draft.photoFrontPreview); draftOnly.add('front'); }
      if (draft.photoSidePreview) { setPhotoSidePreview(draft.photoSidePreview); draftOnly.add('side'); }
      if (draft.photoBackPreview) { setPhotoBackPreview(draft.photoBackPreview); draftOnly.add('back'); }
      setDraftOnlyPreviews(draftOnly);
      if (draftOnly.size > 0) {
        toast.info('Le foto della bozza sono solo anteprima. Tocca per ricaricarle prima di salvare.');
      }
    }
    setShowDraftDialog(false);
  };

  // Handle discarding draft
  const handleDiscardDraft = () => {
    clearDraft();
    resetForm();
    setShowDraftDialog(false);
  };

  // Reset form helper
  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setWeight('');
    setNotes('');
    setPhotoFront(null);
    setPhotoSide(null);
    setPhotoBack(null);
    setPhotoFrontPreview(null);
    setPhotoSidePreview(null);
    setPhotoBackPreview(null);
    setDraftOnlyPreviews(new Set());
  };

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
      } else if (!hasDraft) {
        resetForm();
      }
      setPhotoFront(null);
      setPhotoSide(null);
      setPhotoBack(null);
    }
  }, [isOpen, existingData, hasDraft]);

  // Track object URLs for cleanup to prevent memory leaks
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
      objectUrlsRef.current = [];
    };
  }, []);

  // Handle file selection - compress and set directly (no cropper)
  const handleFileSelect = async (
    file: File | null,
    photoType: 'front' | 'side' | 'back'
  ) => {
    if (!file) return;

    try {
      // Security: Validate MIME type - only allow images
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
      const fileType = file.type?.toLowerCase() || '';
      const ext = file.name?.split('.').pop()?.toLowerCase() || '';
      const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
      if (fileType && !allowedTypes.includes(fileType) && !allowedExts.includes(ext)) {
        toast.error('Formato non supportato. Usa JPG, PNG, WEBP o HEIC.');
        return;
      }
      if (!fileType && !allowedExts.includes(ext)) {
        toast.error('Formato non supportato. Usa JPG, PNG, WEBP o HEIC.');
        return;
      }

      if (file.size > 25 * 1024 * 1024) {
        toast.error('Foto troppo grande. Massimo 25MB.');
        return;
      }

      // Compress image directly (no cropper)
      const compressed = await compressImage(file);
      const compressedFile = new File(
        [compressed],
        `${photoType}_${Date.now()}.jpg`,
        { type: 'image/jpeg' }
      );
      const previewUrl = URL.createObjectURL(compressed);
      objectUrlsRef.current.push(previewUrl);

      switch (photoType) {
        case 'front':
          setPhotoFront(compressedFile);
          setPhotoFrontPreview(previewUrl);
          break;
        case 'side':
          setPhotoSide(compressedFile);
          setPhotoSidePreview(previewUrl);
          break;
        case 'back':
          setPhotoBack(compressedFile);
          setPhotoBackPreview(previewUrl);
          break;
      }

      // Remove "draft-only" flag
      setDraftOnlyPreviews(prev => {
        const next = new Set(prev);
        next.delete(photoType);
        return next;
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Impossibile leggere la foto. Prova con un\'altra immagine.');
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
      clearDraft(); // Clear draft on successful save
      onClose();
    }
  };

  const handleClose = () => {
    // Draft is already auto-saved, just close
    onClose();
  };

  const PhotoUploadBox = ({
    label,
    preview,
    photoType,
  }: {
    label: string;
    preview: string | null;
    photoType: 'front' | 'side' | 'back';
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const isDraftOnly = draftOnlyPreviews.has(photoType);

    const triggerFileSelect = () => {
      inputRef.current?.click();
    };

    return (
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFileSelect(e.target.files?.[0] || null, photoType);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={triggerFileSelect}
          className={`relative block w-full aspect-[3/4] rounded-lg border-2 border-dashed transition-colors cursor-pointer overflow-hidden bg-muted/30 ${
            isDraftOnly ? 'border-amber-400' : 'border-border hover:border-primary/50 active:border-primary'
          }`}
        >
          {preview ? (
            <div className="relative w-full h-full">
              <img src={preview} alt={label} className="w-full h-full object-cover" />
              {isDraftOnly ? (
                <div className="absolute inset-0 bg-amber-500/30 flex flex-col items-center justify-center">
                  <Upload className="w-5 h-5 text-white mb-1" />
                  <span className="text-[10px] text-white font-medium bg-amber-600/80 px-1.5 py-0.5 rounded">
                    Ricarica
                  </span>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 active:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Upload className="w-6 h-6" />
              <span className="text-xs">Carica</span>
            </div>
          )}
        </button>
      </div>
    );
  };

  const hasAnyData = weight || photoFront || photoSide || photoBack ||
    (existingData && (existingData.weight || existingData.photo_front_url || existingData.photo_side_url || existingData.photo_back_url));

  return (
    <>
      {/* Draft Restore Dialog */}
      <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Save className="w-5 h-5 text-primary" />
              Bozza Trovata
            </AlertDialogTitle>
            <AlertDialogDescription>
              Hai una bozza salvata per questo check. Vuoi continuare da dove eri rimasto?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardDraft}>
              Ricomincia
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreDraft}>
              Continua Bozza
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
              onClick={handleClose}
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-x-0 bottom-0 top-auto max-h-[90vh] bg-card rounded-t-2xl z-[201] shadow-2xl flex flex-col"
            >
              {/* Sticky Header */}
              <div className="sticky top-0 bg-card/95 backdrop-blur-sm p-4 border-b border-border flex items-center justify-between shrink-0 rounded-t-2xl">
                <h2 className="text-lg font-bold">Check #{checkNumber}</h2>
                <div className="flex items-center gap-2">
                  {hasDraft && !existingData && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Save className="w-3 h-3" />
                      Bozza salvata
                    </span>
                  )}
                  <Button variant="ghost" size="icon" onClick={handleClose}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-5">
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
                    inputMode="decimal"
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
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                    <PhotoUploadBox
                      label="Fronte"
                      preview={photoFrontPreview}
                      photoType="front"
                    />
                    <PhotoUploadBox
                      label="Lato"
                      preview={photoSidePreview}
                      photoType="side"
                    />
                    <PhotoUploadBox
                      label="Schiena"
                      preview={photoBackPreview}
                      photoType="back"
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
              </div>

              {/* Sticky Submit Button - Fixed at bottom */}
              <div className="sticky bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-sm border-t border-border shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={uploading || !hasAnyData}
                  size="lg"
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
    </>
  );
};

export default CheckFormModal;
