import { useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { MessageSquare, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { CoachNote } from '@/hooks/useCoachNotes';
import { cn } from '@/lib/utils';

interface CoachNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  clientId: string;
  notes: CoachNote[];
  onAddNote: (clientId: string, content: string) => Promise<boolean>;
  onMarkAsRead: (noteId: string) => Promise<boolean>;
}

const CoachNotesDialog = ({
  open,
  onOpenChange,
  clientName,
  clientId,
  notes,
  onAddNote,
  onMarkAsRead
}: CoachNotesDialogProps) => {
  const [newNote, setNewNote] = useState('');
  const [sending, setSending] = useState(false);
  const { user, isSuperAdmin } = useAuth();

  const handleSend = async () => {
    if (!newNote.trim() || sending) return;
    
    setSending(true);
    const success = await onAddNote(clientId, newNote);
    if (success) {
      setNewNote('');
    }
    setSending(false);
  };

  const handleMarkRead = async (noteId: string) => {
    await onMarkAsRead(noteId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Note interne: {clientName}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 max-h-[300px]">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nessuna nota per questo cliente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => {
                const isRead = note.read_by.includes(user?.id || '');
                const isAuthor = note.author_id === user?.id;
                
                return (
                  <div
                    key={note.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      isAuthor ? "bg-primary/5 border-primary/20" : "bg-muted/50 border-border",
                      !isRead && !isAuthor && "border-badge-gold border-2"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(note.created_at), "d MMM yyyy, HH:mm", { locale: it })}
                      </span>
                      {!isRead && !isAuthor && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs text-badge-gold hover:text-badge-gold"
                          onClick={() => handleMarkRead(note.id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Segna letto
                        </Button>
                      )}
                      {isRead && !isAuthor && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Letto
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Add note form - only for super admin */}
        {isSuperAdmin && (
          <div className="pt-4 border-t border-border space-y-3">
            <Textarea
              placeholder="Scrivi una nota per i coach assegnati..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <Button
              onClick={handleSend}
              disabled={!newNote.trim() || sending}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {sending ? 'Invio...' : 'Invia nota'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CoachNotesDialog;
