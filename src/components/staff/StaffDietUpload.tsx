import { useState, useRef } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StaffDietUploadProps {
  clientId: string;
  clientName: string;
  onUploadComplete?: () => void;
}

const StaffDietUpload = ({ clientId, clientName, onUploadComplete }: StaffDietUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Formato non valido',
        description: 'Puoi caricare solo file PDF.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'File troppo grande',
        description: 'Il file non può superare i 10MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);

      // Generate unique file path under client's folder
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${clientId}/${timestamp}_${sanitizedName}`;

      // Delete existing diet plan for client
      const { data: existingPlan } = await supabase
        .from('user_diet_plans')
        .select('file_path')
        .eq('user_id', clientId)
        .maybeSingle();

      if (existingPlan) {
        await supabase.storage
          .from('user-diets')
          .remove([existingPlan.file_path]);

        await supabase
          .from('user_diet_plans')
          .delete()
          .eq('user_id', clientId);
      }

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from('user-diets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: 'Errore upload',
          description: 'Impossibile caricare il file. Riprova.',
          variant: 'destructive',
        });
        return;
      }

      // Insert metadata record
      const { error: insertError } = await supabase
        .from('user_diet_plans')
        .insert({
          user_id: clientId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        // Cleanup uploaded file on error
        await supabase.storage.from('user-diets').remove([filePath]);
        toast({
          title: 'Errore',
          description: 'Impossibile salvare i dati del file.',
          variant: 'destructive',
        });
        return;
      }

      // Send notification to client
      try {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            userId: clientId,
            title: '🥗 Nuovo Piano Alimentare',
            body: 'Il tuo coach ha caricato un nuovo piano alimentare!',
            url: '/nutrizione',
          }
        });
      } catch (notifyError) {
        console.warn('Failed to send notification:', notifyError);
      }

      toast({
        title: 'Piano caricato!',
        description: `Piano alimentare caricato per ${clientName}.`,
      });

      onUploadComplete?.();

    } catch (err) {
      console.error('Upload diet plan error:', err);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante il caricamento.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileSelect}
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="gap-1"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Caricamento...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Carica Dieta
          </>
        )}
      </Button>
    </>
  );
};

export default StaffDietUpload;
