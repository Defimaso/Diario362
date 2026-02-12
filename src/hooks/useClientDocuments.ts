import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ClientDocument {
  id: string;
  user_id: string;
  title: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export const useClientDocuments = (clientId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        return;
      }

      setDocuments(data as ClientDocument[]);
    } catch (err) {
      console.error('Fetch documents error:', err);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = async (file: File, title: string): Promise<boolean> => {
    if (!user?.id || !clientId) {
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

      // Generate unique file path under client's folder
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${clientId}/${timestamp}_${sanitizedName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('client-documents')
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
        .from('client_documents')
        .insert({
          user_id: clientId,
          title: title || file.name.replace(/\.pdf$/i, ''),
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          uploaded_by: user.id,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        // Cleanup uploaded file on error
        await supabase.storage.from('client-documents').remove([filePath]);
        toast({
          title: 'Errore',
          description: 'Impossibile salvare i dati del file.',
          variant: 'destructive',
        });
        return false;
      }

      // Send notification to client
      try {
        await supabase.functions.invoke('clever-responder', {
          body: {
            userId: clientId,
            title: '📄 Nuovo Documento',
            body: `È stato caricato un nuovo documento: ${title || file.name}`,
            url: '/documenti',
          }
        });
      } catch (notifyError) {
        console.warn('Failed to send notification:', notifyError);
      }

      toast({
        title: 'Documento caricato!',
        description: 'Il documento è stato aggiunto correttamente.',
      });

      await fetchDocuments();
      return true;
    } catch (err) {
      console.error('Upload document error:', err);
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

  const deleteDocument = async (documentId: string): Promise<boolean> => {
    if (!user?.id) return false;

    const doc = documents.find(d => d.id === documentId);
    if (!doc) return false;

    try {
      setUploading(true);

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('client-documents')
        .remove([doc.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete metadata record
      const { error: deleteError } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        toast({
          title: 'Errore',
          description: 'Impossibile eliminare il documento.',
          variant: 'destructive',
        });
        return false;
      }

      setDocuments(prev => prev.filter(d => d.id !== documentId));
      toast({
        title: 'Documento eliminato',
        description: 'Il documento è stato rimosso.',
      });
      return true;
    } catch (err) {
      console.error('Delete document error:', err);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const downloadDocument = async (document: ClientDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('client-documents')
        .createSignedUrl(document.file_path, 3600);

      if (error) {
        console.error('Signed URL error:', error);
        toast({
          title: 'Errore',
          description: 'Impossibile generare il link per il download.',
          variant: 'destructive',
        });
        return;
      }

      const link = window.document.createElement('a');
      link.href = data.signedUrl;
      link.download = document.file_name;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  return {
    documents,
    loading,
    uploading,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    refetch: fetchDocuments,
  };
};
