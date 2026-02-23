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
          {/* Backdrop — z-[200] sopra il BottomDock (z-50) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[250]"
            onClick={handleClose}
          />

          {/* Modal — fullscreen, sopra tutto incluso BottomDock */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-card z-[250] flex flex-col overflow-hidden"
          >
            {/* Header — altezza fissa, non si comprime */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
              <h2 className="text-base font-bold">
                Ritaglia Foto {PHOTO_TYPE_LABELS[photoType]}
              </h2>
              <div className="flex items-center gap-2">
                {ghostImageSrc && (
                  <Button
                    variant={showGhost ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setShowGhost(!showGhost)}
                    className="flex items-center gap-1 h-8 text-xs"
                  >
                    <Ghost className="w-3.5 h-3.5" />
                    Riferimento
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Cropper Area — flex-1 + min-h-0 è il fix critico per mobile */}
            <div className="flex-1 min-h-0 relative bg-black">
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

              {/* Hint testo — solo se ghost attivo */}
              {ghostImageSrc && showGhost && (
                <div className="absolute bottom-3 left-0 right-0 text-center z-20">
                  <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                    Allinea la tua sagoma con il riferimento
                  </span>
                </div>
              )}
            </div>

            {/* Controls — altezza fissa, sempre visibili, padding per notch */}
            <div
              className="shrink-0 px-4 pt-3 border-t border-border bg-card space-y-3"
              style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
            >
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

              <p className="text-xs text-muted-foreground text-center leading-tight">
                Trascina per posizionare • slider per zoom
              </p>

              {/* Bottoni — Annulla piccolo, Conferma grande e verde */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="h-12 px-4 text-sm shrink-0"
                  onClick={handleClose}
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  className="flex-1 h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
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
                      <Check className="w-5 h-5 mr-2" />
                      Conferma Ritaglio
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
