import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Video, Loader2, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useVideoCorrections } from '@/hooks/useVideoCorrections';
import { formatFileSize } from '@/lib/videoCompression';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const VideoUploadCard = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadVideo } = useVideoCorrections();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        variant: 'destructive',
        title: 'Formato non valido',
        description: 'Seleziona un file video (MP4, MOV, WebM)',
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: 'destructive',
        title: 'File troppo grande',
        description: `Il video deve essere inferiore a ${formatFileSize(MAX_FILE_SIZE)}`,
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !exerciseName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Dati mancanti',
        description: 'Inserisci il nome dell\'esercizio',
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload original file to preserve audio
      // Note: Compression was disabled because it strips audio on mobile browsers
      const { error } = await uploadVideo(selectedFile, exerciseName.trim(), notes.trim());

      if (error) {
        throw error;
      }

      toast({
        title: 'Video caricato!',
        description: 'Il tuo coach lo esaminerà presto',
      });

      // Reset form
      setExerciseName('');
      setNotes('');
      handleClearFile();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Errore upload',
        description: 'Non è stato possibile caricare il video',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elegant rounded-xl p-5"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-primary" />
        Carica Video per Correzione
      </h3>

      <div className="space-y-4">
        {/* File Input */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="video-upload"
          />
          
          {!selectedFile ? (
            <label
              htmlFor="video-upload"
              className={cn(
                "flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
                "border-muted hover:border-primary/50 bg-muted/30 hover:bg-muted/50"
              )}
            >
              <Video className="w-10 h-10 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Tocca per selezionare un video
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Max {formatFileSize(MAX_FILE_SIZE)}
              </span>
            </label>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video
                src={previewUrl || undefined}
                className="w-full aspect-video object-contain"
                controls
              />
              <button
                onClick={handleClearFile}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
                {formatFileSize(selectedFile.size)}
              </div>
            </div>
          )}
        </div>

        {/* Exercise Name */}
        <div className="space-y-2">
          <Label htmlFor="exercise-name">Nome Esercizio *</Label>
          <Input
            id="exercise-name"
            placeholder="Es. Squat, Stacco, Panca..."
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            disabled={isUploading}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Note (opzionale)</Label>
          <Textarea
            id="notes"
            placeholder="Descrivi eventuali dubbi o sensazioni..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isUploading}
            className="resize-none"
            rows={2}
          />
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !exerciseName.trim() || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Caricamento...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Carica Video
            </>
          )}
        </Button>

        {/* Info */}
        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          I video vengono caricati nel formato originale per preservare l'audio.
        </p>
      </div>
    </motion.div>
  );
};

export default VideoUploadCard;
