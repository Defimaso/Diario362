import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserDietPlan {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  uploaded_at: string;
  updated_at: string;
}

export const useUserDiet = (clientId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dietPlan, setDietPlan] = useState<UserDietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const targetUserId = clientId || user?.id;

  const fetchDietPlan = useCallback(async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_diet_plans')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching diet plan:', error);
        return;
      }

      setDietPlan(data as UserDietPlan | null);
    } catch (err) {
      console.error('Fetch diet plan error:', err);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchDietPlan();
  }, [fetchDietPlan]);

  const uploadDietPlan = async (file: File): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: 'Errore',
        description: 'Devi essere autenticato per caricare un file.',
        variant: 'destructive',
      });
      return false;
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Formato non valido',
        description: 'Puoi caricare solo file PDF.',
        variant: 'destructive',
      });
      return false;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'File troppo grande',
        description: 'Il file non può superare i 10MB.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setUploading(true);

      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/${timestamp}_${sanitizedName}`;

      // Delete existing file if present
      if (dietPlan) {
        await supabase.storage
          .from('user-diets')
          .remove([dietPlan.file_path]);

        await supabase
          .from('user_diet_plans')
          .delete()
          .eq('user_id', user.id);
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
        return false;
      }

      // Insert metadata record
      const { error: insertError } = await supabase
        .from('user_diet_plans')
        .insert({
          user_id: user.id,
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
        return false;
      }

      toast({
        title: 'Piano caricato!',
        description: 'Il tuo piano alimentare è stato salvato.',
      });

      await fetchDietPlan();
      return true;
    } catch (err) {
      console.error('Upload diet plan error:', err);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante il caricamento.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  const deleteDietPlan = async (): Promise<boolean> => {
    if (!user?.id || !dietPlan) return false;

    try {
      setUploading(true);

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user-diets')
        .remove([dietPlan.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete metadata record
      const { error: deleteError } = await supabase
        .from('user_diet_plans')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        toast({
          title: 'Errore',
          description: 'Impossibile eliminare il piano.',
          variant: 'destructive',
        });
        return false;
      }

      setDietPlan(null);
      toast({
        title: 'Piano eliminato',
        description: 'Il piano alimentare è stato rimosso.',
      });
      return true;
    } catch (err) {
      console.error('Delete diet plan error:', err);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const getSignedUrl = async (): Promise<string | null> => {
    if (!dietPlan) return null;

    try {
      const { data, error } = await supabase.storage
        .from('user-diets')
        .createSignedUrl(dietPlan.file_path, 3600); // 1 hour expiry

      if (error) {
        console.error('Signed URL error:', error);
        toast({
          title: 'Errore',
          description: 'Impossibile generare il link per il download.',
          variant: 'destructive',
        });
        return null;
      }

      return data.signedUrl;
    } catch (err) {
      console.error('Get signed URL error:', err);
      return null;
    }
  };

  const downloadDietPlan = async () => {
    const url = await getSignedUrl();
    if (url && dietPlan) {
      const link = document.createElement('a');
      link.href = url;
      link.download = dietPlan.file_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    dietPlan,
    loading,
    uploading,
    uploadDietPlan,
    deleteDietPlan,
    downloadDietPlan,
    getSignedUrl,
    refetch: fetchDietPlan,
  };
};
