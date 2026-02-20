import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper, { Area } from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut, Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getCroppedImg, compressImage } from '@/lib/imageCompression';
import { toast } from 'sonner';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  ghostImageSrc?: string | null;
  photoType: 'front' | 'side' | 'back';
  onCropComplete: (croppedBlob: Blob) => void;
}

const PHOTO_TYPE_LABELS = {
  front: 'Fronte',
  side: 'Lato',
  back: 'Schiena',
};

const ImageCropperModal = ({
  isOpen,
  onClose,
  imageSrc,
  ghostImageSrc,
  photoType,
  onCropComplete,
}: ImageCropperModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGhost, setShowGhost] = useState(true);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((value: number) => {
    setZoom(value);
  }, []);

  const onCropCompleteHandler = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      // Crop the image
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      // Compress the cropped image
      const compressedBlob = await compressImage(croppedBlob);

      onCropComplete(compressedBlob);
      onClose();
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Errore nel ritaglio della foto. Riprova con un\'altra immagine.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-2 sm:inset-4 bg-card rounded-2xl z-50 flex flex-col overflow-hidden shadow-2xl"
            style={{ bottom: 'max(8px, env(safe-area-inset-bottom, 8px))' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold">
                Ritaglia Foto {PHOTO_TYPE_LABELS[photoType]}
              </h2>
              <div className="flex items-center gap-2">
                {ghostImageSrc && (
                  <Button
                    variant={showGhost ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setShowGhost(!showGhost)}
                    className="flex items-center gap-1"
                  >
                    <Ghost className="w-4 h-4" />
                    <span className="text-xs">Riferimento</span>
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Cropper Area */}
            <div className="flex-1 relative bg-black">
              {/* Ghost Overlay */}
              {ghostImageSrc && showGhost && (
                <div 
                  className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
                  style={{ opacity: 0.35 }}
                >
                  <img 
                    src={ghostImageSrc} 
                    alt="Reference from Check #1" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}

              {/* Cropper */}
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={3 / 4}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onCropComplete={onCropCompleteHandler}
                showGrid={true}
                style={{
                  containerStyle: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  },
                }}
              />

              {/* Alignment Guide Text */}
              {ghostImageSrc && showGhost && (
                <div className="absolute bottom-4 left-0 right-0 text-center z-20">
                  <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                    Allinea la tua sagoma con il riferimento
                  </span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-3 sm:p-4 space-y-3 border-t border-border bg-card">
              {/* Zoom Slider */}
              <div className="flex items-center gap-3">
                <ZoomOut className="w-4 h-4 text-muted-foreground shrink-0" />
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.1}
                  onValueChange={(value) => setZoom(value[0])}
                  className="flex-1"
                />
                <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>

              {/* Info Text */}
              <p className="text-xs text-muted-foreground text-center">
                Trascina per posizionare, usa lo slider per lo zoom
              </p>

              {/* Action Buttons — prominenti su mobile */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-12 text-sm"
                  onClick={handleClose}
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4 mr-1.5" />
                  Annulla
                </Button>
                <Button
                  className="flex-2 h-12 text-sm font-semibold bg-primary min-w-[160px]"
                  onClick={handleConfirm}
                  disabled={isProcessing || !croppedAreaPixels}
                >
                  {isProcessing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      Conferma ✓
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ImageCropperModal;
