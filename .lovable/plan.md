
# Piano: Fix Video Audio, Push Notifications e Nutrium Deep Link

## Analisi dei Problemi

### 1. Audio Video Caricati (Staff)
I componenti `StaffVideoFeedbackPanel.tsx` e `VideoFeedbackList.tsx` usano un player video con l'attributo `controls` ma mancano alcuni attributi critici per garantire l'audio funzionante su tutti i browser.

**Linee interessate:**
- `StaffVideoFeedbackPanel.tsx`, linea 132-136
- `VideoFeedbackList.tsx`, linea 142-147

### 2. Push Notifications Non Funzionanti
I log mostrano un errore critico nell'edge function `notify-video-correction`:

```
TypeError: Object prototype may only be an Object or null: undefined
at https://esm.sh/jws@4.0.1/es2022/jws.mjs
```

Il problema deriva dalla libreria `web-push` (`https://esm.sh/web-push@3.6.7`) che ha problemi di compatibilita con Deno Edge Runtime. La libreria dipende da `jws` che a sua volta usa `util.inherits` - un pattern Node.js non supportato in Deno.

### 3. Nutrium Deep Link
Attualmente manca il pulsante per aprire l'app Nutrium direttamente dalla sezione Nutrizione.

### 4. Dashboard Staff - Notifiche Manuali
Manca un tasto per inviare notifiche push manuali ai clienti.

---

## Parte 1: Fix Audio Video Player

### Modifiche ai File

| File | Linee | Modifica |
|------|-------|----------|
| `StaffVideoFeedbackPanel.tsx` | 132-136 | Aggiunta attributi audio |
| `VideoFeedbackList.tsx` | 142-147 | Aggiunta attributi audio |

### Codice Video Player Corretto

```tsx
<video
  src={video.video_url}
  className="w-full aspect-video object-contain"
  controls
  playsInline          // Safari iOS compatibility
  preload="metadata"   // Carica solo metadata inizialmente
  // NO autoplay, NO muted - l'utente deve cliccare play
/>
```

**Attributi chiave:**
- `controls` - Mostra i controlli del player (volume incluso)
- `playsInline` - Impedisce fullscreen automatico su iOS Safari
- `preload="metadata"` - Carica solo le info iniziali
- **NON** usare `autoplay` - causa muting forzato
- **NON** usare `muted` - rimuove l'audio

---

## Parte 2: Fix Push Notifications (Libreria Deno-Native)

### Problema Identificato

La libreria `web-push` da npm non e compatibile con Deno Edge Runtime. Dobbiamo usare una libreria nativa per Deno.

### Soluzione: JSR @negrel/webpush

Questa libreria e stata specificamente creata per Deno e non ha dipendenze Node.js problematiche.

### Nuova Edge Function

```typescript
// supabase/functions/notify-video-correction/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  ApplicationServer,
  type PushSubscription 
} from 'jsr:@negrel/webpush@0.5.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, ...',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!
    
    // Crea ApplicationServer con VAPID keys
    const appServer = await ApplicationServer.new({
      contactInformation: 'mailto:info@362gradi.it',
      vapidKeys: {
        publicKey: vapidPublicKey,
        privateKey: vapidPrivateKey,
      }
    })
    
    // ... logica esistente per determinare destinatari
    
    // Per ogni subscription
    const pushSubscription: PushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth
      }
    }
    
    const subscriber = appServer.subscribe(pushSubscription)
    await subscriber.pushTextMessage(JSON.stringify(payload), {})
    
  } catch (error) {
    // error handling
  }
})
```

### Stessa Fix per send-push-notification

Applicare la stessa modifica alla funzione `send-push-notification/index.ts`.

---

## Parte 3: Nutrium Deep Link

### Logica Deep Link Cross-Platform

```typescript
const openNutrium = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(userAgent);
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  
  if (isAndroid) {
    // Intent per Android
    window.location.href = 'intent://#Intent;package=com.nutrium.nutrium;scheme=nutrium;end';
    // Fallback dopo timeout
    setTimeout(() => {
      window.location.href = 'https://app.nutrium.com';
    }, 2000);
  } else if (isIOS) {
    // Schema URL per iOS
    window.location.href = 'nutrium://';
    // Fallback dopo timeout
    setTimeout(() => {
      window.location.href = 'https://apps.apple.com/app/nutrium/id1111111111';
    }, 2000);
  } else {
    // Desktop - apri webapp
    window.open('https://app.nutrium.com', '_blank');
  }
};
```

### Modifica a Nutrizione.tsx

Aggiungi un nuovo pulsante sotto la sezione del piano alimentare:

```tsx
<motion.section
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.25 }}
>
  <div className="card-elegant rounded-2xl p-4 border border-[hsl(var(--section-purple))]/30">
    <div className="flex items-center gap-3 mb-3">
      <ExternalLink className="w-5 h-5 text-[hsl(var(--section-purple))]" />
      <h2 className="font-semibold">Nutrium</h2>
    </div>
    
    <p className="text-sm text-muted-foreground mb-4">
      Accedi alla versione completa della tua dieta su Nutrium.
    </p>
    
    <p className="text-xs text-muted-foreground mb-4 italic">
      Nota: Usa le stesse credenziali che utilizzi per Nutrium.
    </p>
    
    <Button onClick={openNutrium} className="w-full">
      <ExternalLink className="w-4 h-4 mr-2" />
      Apri Dieta su Nutrium
    </Button>
  </div>
</motion.section>
```

---

## Parte 4: Staff Dashboard - Notifiche Manuali

### Nuovo Componente SendNotificationButton

Crea un pulsante che permette allo staff di inviare una notifica push manuale a un cliente specifico.

```tsx
// src/components/staff/SendNotificationButton.tsx

interface SendNotificationButtonProps {
  clientId: string;
  clientName: string;
}

const SendNotificationButton = ({ clientId, clientName }: Props) => {
  const [sending, setSending] = useState(false);
  
  const sendNotification = async () => {
    setSending(true);
    try {
      await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: clientId,
          title: '📢 Promemoria dal tuo Coach',
          body: 'Non dimenticare di compilare il tuo check-in giornaliero!',
          data: { url: '/diario' }
        }
      });
      toast.success('Notifica inviata!');
    } catch (error) {
      toast.error('Errore nell\'invio della notifica');
    }
    setSending(false);
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={sendNotification}
      disabled={sending}
    >
      <Bell className="w-4 h-4 mr-1" />
      {sending ? 'Invio...' : 'Invia Promemoria'}
    </Button>
  );
};
```

### Integrazione in ClientExpandedView

Aggiungi il pulsante nella vista espansa del cliente nella dashboard staff:

```tsx
// In ClientExpandedView.tsx, nella sezione header o actions
<SendNotificationButton 
  clientId={clientId} 
  clientName={clientName} 
/>
```

---

## Riepilogo File da Modificare

| File | Tipo | Descrizione |
|------|------|-------------|
| `StaffVideoFeedbackPanel.tsx` | Edit | Fix attributi video player |
| `VideoFeedbackList.tsx` | Edit | Fix attributi video player |
| `notify-video-correction/index.ts` | Rewrite | Usa @negrel/webpush |
| `send-push-notification/index.ts` | Rewrite | Usa @negrel/webpush |
| `Nutrizione.tsx` | Edit | Aggiungi pulsante Nutrium |
| `SendNotificationButton.tsx` | New | Componente notifica manuale |
| `ClientExpandedView.tsx` | Edit | Integra pulsante notifica |

---

## Sezione Tecnica: Web Push con @negrel/webpush

### Import e Setup

```typescript
import { 
  ApplicationServer,
  type PushSubscription 
} from 'jsr:@negrel/webpush@0.5.0'

// Crea server con VAPID keys
const appServer = await ApplicationServer.new({
  contactInformation: 'mailto:info@362gradi.it',
  vapidKeys: {
    publicKey: Deno.env.get('VAPID_PUBLIC_KEY')!,
    privateKey: Deno.env.get('VAPID_PRIVATE_KEY')!,
  }
})
```

### Invio Notifica

```typescript
// Converti subscription dal database
const pushSub: PushSubscription = {
  endpoint: dbSubscription.endpoint,
  keys: {
    p256dh: dbSubscription.p256dh,
    auth: dbSubscription.auth
  }
}

// Crea subscriber e invia
const subscriber = appServer.subscribe(pushSub)
await subscriber.pushTextMessage(JSON.stringify({
  title: 'Titolo',
  body: 'Messaggio',
  icon: '/pwa-192x192.png',
  data: { url: '/allenamento' }
}), {})
```

### Gestione Errori

```typescript
try {
  await subscriber.pushTextMessage(payload, {})
  successCount++
} catch (error) {
  // Se subscription scaduta (410/404), rimuovila dal DB
  if (error.status === 410 || error.status === 404) {
    await supabase.from('push_subscriptions').delete().eq('id', sub.id)
  }
  failCount++
}
```

---

## Note Importanti

1. **VAPID Keys**: Le chiavi esistenti (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`) sono gia configurate come secrets e funzioneranno con la nuova libreria.

2. **Service Worker**: Il file `public/sw.js` non richiede modifiche - gestisce gia correttamente il parsing del payload JSON.

3. **Archivio YouTube**: Non viene toccato. Le modifiche riguardano solo i video caricati dai clienti nel bucket `exercise-corrections`.

4. **Compatibilita Browser**: La libreria @negrel/webpush genera payload conformi allo standard Web Push, compatibili con tutti i browser moderni (Chrome, Firefox, Safari, Edge).
