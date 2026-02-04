import { FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClientDocuments } from '@/hooks/useClientDocuments';
import StaffDocumentUpload from './StaffDocumentUpload';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ClientDocumentsSectionProps {
  clientId: string;
}

const ClientDocumentsSection = ({ clientId }: ClientDocumentsSectionProps) => {
  const {
    documents,
    loading,
    uploading,
    uploadDocument,
    deleteDocument,
    downloadDocument,
  } = useClientDocuments(clientId);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="bg-card rounded-xl p-3 sm:p-4 border border-primary/30">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h4 className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Documenti Cliente ({documents.length})
        </h4>
        <StaffDocumentUpload onUpload={uploadDocument} uploading={uploading} />
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-12 bg-muted rounded-lg animate-pulse" />
          <div className="h-12 bg-muted rounded-lg animate-pulse" />
        </div>
      ) : documents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nessun documento caricato. Usa il pulsante sopra per aggiungere PDF.
        </p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{doc.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: it })}</span>
                    {doc.file_size && (
                      <>
                        <span>•</span>
                        <span>{formatFileSize(doc.file_size)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => downloadDocument(doc)}
                  title="Scarica"
                >
                  <Download className="w-4 h-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Elimina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Elimina documento</AlertDialogTitle>
                      <AlertDialogDescription>
                        Sei sicuro di voler eliminare "{doc.title}"? 
                        Questa azione non può essere annullata.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteDocument(doc.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Elimina
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDocumentsSection;
