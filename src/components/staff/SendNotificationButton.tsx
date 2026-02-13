import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendNotificationButtonProps {
  clientId: string;
  clientName: string;
}

const SendNotificationButton = ({ clientId, clientName }: SendNotificationButtonProps) => {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const sendNotification = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('clever-responder', {
        body: {
          userId: clientId,
          title: '📢 Promemoria dal tuo Coach',
          body: 'Non dimenticare di compilare il tuo diario giornaliero!',
          data: { url: '/diario' }
        }
      });

      if (error) throw error;

      if (data?.sent > 0) {
        toast({
          title: 'Notifica inviata',
          description: `Promemoria inviato a ${clientName}`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Nessuna subscription',
          description: `${clientName} non ha le notifiche push attive`,
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: "Non è stato possibile inviare la notifica",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={sendNotification}
      disabled={sending}
      className="gap-1.5"
    >
      <Bell className="w-4 h-4" />
      {sending ? 'Invio...' : 'Invia Promemoria'}
    </Button>
  );
};

export default SendNotificationButton;
