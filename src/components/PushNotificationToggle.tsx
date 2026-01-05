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
    
    return (
      <Card className="border-destructive/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BellOff className="h-5 w-5 text-destructive" />
            Notifiche Bloccate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Le notifiche sono state bloccate. Per attivarle, modifica le impostazioni del browser.
          </p>
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
            Promemoria check-in
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
            ? 'Riceverai un promemoria se non hai compilato il check-in' 
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
