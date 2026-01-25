import { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DeleteAccountDialogProps {
  onDeleted?: () => void;
}

const DeleteAccountDialog = ({ onDeleted }: DeleteAccountDialogProps) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const CONFIRM_PHRASE = 'ELIMINA';

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_PHRASE) {
      toast({
        variant: 'destructive',
        title: 'Conferma non valida',
        description: `Digita "${CONFIRM_PHRASE}" per confermare`,
      });
      return;
    }

    if (!user) return;

    setIsDeleting(true);

    try {
      // Call the edge function to delete user and all their data
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId: user.id },
      });

      if (error) throw error;

      toast({
        title: 'Account eliminato',
        description: 'Tutti i tuoi dati sono stati cancellati definitivamente.',
      });

      // Sign out and redirect
      await signOut();
      onDeleted?.();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: error.message || 'Impossibile eliminare l\'account. Riprova più tardi.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full gap-2">
          <Trash2 className="w-4 h-4" />
          Elimina Account e Dati
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle>Eliminazione Account</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              Stai per eliminare definitivamente il tuo account. Questa azione è{' '}
              <strong className="text-destructive">irreversibile</strong>.
            </p>
            <p>Verranno eliminati permanentemente:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Tutti i tuoi check giornalieri</li>
              <li>Le foto di progresso</li>
              <li>Le note e i dati del peso</li>
              <li>Le impostazioni del profilo</li>
              <li>I consensi e le preferenze</li>
            </ul>
            <div className="pt-4 space-y-2">
              <Label htmlFor="confirm">
                Digita <strong>{CONFIRM_PHRASE}</strong> per confermare:
              </Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder={CONFIRM_PHRASE}
                className="font-mono"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annulla</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={confirmText !== CONFIRM_PHRASE || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Eliminazione...
              </>
            ) : (
              'Elimina definitivamente'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountDialog;
