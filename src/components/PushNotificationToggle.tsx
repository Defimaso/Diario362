import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PushNotificationToggleProps {
  variant?: 'card' | 'inline';
}

export function PushNotificationToggle({ variant = 'card' }: PushNotificationToggleProps) {
  const { isSubscribed, isLoading, isSupported, permission, subscribe, unsubscribe } = usePushNotifications();

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  if (!isSupported) {
    if (variant === 'inline') return null;
    
    return (
      <Card className="border-muted">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            Notifiche Push
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Le notifiche push non sono supportate su questo browser o dispositivo.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (permission === 'denied') {
    if (variant === 'inline') return null;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    return (
      <Card className="border-destructive/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BellOff className="h-5 w-5 text-destructive" />
            Notifiche Bloccate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Le notifiche sono state bloccate. Segui questi passaggi per riattivarle:
          </p>
          {isIOS ? (
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Installa l'app sulla Home: tocca <strong>Condividi</strong> → <strong>Aggiungi a schermata Home</strong></li>
              <li>Vai in <strong>Impostazioni iPhone</strong> → <strong>Notifiche</strong></li>
              <li>Cerca l'app <strong>362gradi</strong> nella lista</li>
              <li>Attiva <strong>Consenti notifiche</strong></li>
              <li>Torna qui e ricarica la pagina</li>
            </ol>
          ) : isAndroid ? (
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Tocca l'icona <strong>lucchetto</strong> (o <strong>i</strong>) nella barra degli indirizzi</li>
              <li>Tocca <strong>Autorizzazioni</strong> → <strong>Notifiche</strong></li>
              <li>Seleziona <strong>Consenti</strong></li>
              <li>Torna qui e ricarica la pagina</li>
            </ol>
          ) : (
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Clicca l'icona <strong>lucchetto</strong> nella barra degli indirizzi</li>
              <li>Trova <strong>Notifiche</strong> e cambia in <strong>Consenti</strong></li>
              <li>Ricarica la pagina</li>
            </ol>
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="push-notifications" className="text-sm">
            Promemoria diario
          </Label>
        </div>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Switch
            id="push-notifications"
            checked={isSubscribed}
            onCheckedChange={handleToggle}
          />
        )}
      </div>
    );
  }

  return (
    <Card className={isSubscribed ? 'border-primary/50 bg-primary/5' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className={`h-5 w-5 ${isSubscribed ? 'text-primary' : 'text-muted-foreground'}`} />
          Notifiche Push
        </CardTitle>
        <CardDescription>
          {isSubscribed 
            ? 'Riceverai un promemoria se non hai compilato il diario' 
            : 'Attiva le notifiche per ricevere promemoria giornalieri'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleToggle}
          disabled={isLoading}
          variant={isSubscribed ? 'outline' : 'default'}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Caricamento...
            </>
          ) : isSubscribed ? (
            <>
              <BellOff className="h-4 w-4 mr-2" />
              Disattiva Notifiche
            </>
          ) : (
            <>
              <Bell className="h-4 w-4 mr-2" />
              Attiva Notifiche
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
