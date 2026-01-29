
# Piano: Sistema Notifiche In-App, Fix Audio e Deep Linking

## Panoramica

Questo piano implementa un sistema di notifiche centralizzato con icona "campanella", corregge i problemi audio nei video caricati, e migliora il deep linking per le app native.

---

## Parte 1: Sistema Notifiche "Campanella"

### 1.1 Nuova Tabella Database `notifications`

Creare una tabella per gestire tutte le notifiche in-app.

```text
+------------------+--------------------------------------+
| Colonna          | Tipo                                 |
+------------------+--------------------------------------+
| id               | uuid (PK, default gen_random_uuid()) |
| user_id          | uuid (FK -> auth.users, NOT NULL)    |
| type             | text (NOT NULL)                      |
| title            | text (NOT NULL)                      |
| message          | text (NOT NULL)                      |
| link             | text (nullable)                      |
| is_read          | boolean (default false)              |
| metadata         | jsonb (nullable)                     |
| created_at       | timestamptz (default now())          |
+------------------+--------------------------------------+
```

**Tipi di notifica supportati:**
- `video_feedback` - Coach ha risposto a un video
- `video_uploaded` - Cliente ha caricato un video (per Coach)
- `diet_uploaded` - Coach ha caricato un piano alimentare
- `checkin_reminder` - Promemoria check-in
- `manual` - Notifica manuale dallo staff

**RLS Policies:**
- SELECT: Utenti vedono solo le proprie notifiche
- UPDATE: Utenti possono marcare come lette solo le proprie
- INSERT: Solo service role (Edge Functions)

### 1.2 Nuovo Componente `NotificationBell.tsx`

**Posizione:** Header di ogni pagina principale (Diario, Allenamento, Nutrizione, Progressi)

**Funzionalita:**
- Icona Bell con badge numerico (contatore non lette)
- Click apre Popover con lista notifiche
- Ogni notifica e un link cliccabile
- Pulsante "Segna tutte come lette"

```text
Struttura UI:
+---------------------------------------------+
| [Bell Icon] (3)                             |
+---------------------------------------------+
| Notifiche                    [Segna lette]  |
+---------------------------------------------+
| [Unread] Nuova correzione video       2h fa |
|          Il coach ha risposto al...   >     |
+---------------------------------------------+
| [Read] Piano alimentare aggiornato    1g fa |
|        Nuovo PDF disponibile          >     |
+---------------------------------------------+
```

### 1.3 Nuovo Hook `useNotifications.ts`

```typescript
// Funzionalita:
- fetchNotifications() - Carica notifiche utente
- unreadCount - Contatore non lette
- markAsRead(id) - Marca singola come letta
- markAllAsRead() - Marca tutte come lette
- Realtime subscription per aggiornamenti live
```

### 1.4 Aggiornamento Edge Functions per Creare Notifiche

Modificare le seguenti Edge Functions per creare record nella tabella `notifications`:

| Edge Function | Trigger | Notifica a |
|---------------|---------|------------|
| `notify-video-correction` | Video caricato | Coach assegnati |
| `notify-video-correction` | Feedback aggiunto | Cliente |
| (Nuovo trigger) | Diet PDF caricato | Cliente |

### 1.5 Integrazione Service Worker

Il Service Worker `public/sw.js` gestisce gia le push notifications. Le notifiche in-app saranno sincronizzate con le push per una esperienza unificata.

---

## Parte 2: Fix Definitivo Audio Video

### 2.1 Analisi Attuale

I video player in `StaffVideoFeedbackPanel.tsx` (linea 133-139) e `VideoFeedbackList.tsx` (linea 143-149) hanno:
- `controls` - OK
- `playsInline` - OK
- `preload="metadata"` - OK

**Mancante:** Nessun attributo `muted` (che e corretto), ma potrebbe esserci un problema con il formato video o il browser.

### 2.2 Soluzione Aggiuntiva

Aggiungere attributi espliciti per garantire l'audio:

```tsx
<video
  src={video.video_url}
  className="w-full aspect-video object-contain"
  controls                    // Controlli visibili
  playsInline                 // No fullscreen automatico iOS
  preload="metadata"          // Carica solo metadata
  controlsList="nodownload"   // Nasconde download
  // IMPORTANTE: NO autoplay, NO muted
/>
```

**Nota:** Il codice attuale e gia corretto. Il problema potrebbe essere:
1. Il video originale non ha traccia audio
2. Il browser blocca l'audio se l'utente non ha interagito con la pagina
3. La compressione video rimuove l'audio

### 2.3 Verifica Compressione Video

Controllare `src/lib/videoCompression.ts` per assicurarsi che l'audio venga preservato durante la compressione MediaRecorder.

---

## Parte 3: Deep Linking Potenziato

### 3.1 Funzione `openNativeApp` Centralizzata

Creare `src/lib/deepLinks.ts`:

```typescript
interface DeepLinkConfig {
  android: {
    intent: string;      // intent://...
    fallback: string;    // Play Store URL
  };
  ios: {
    scheme: string;      // appname://
    fallback: string;    // App Store URL
  };
  web: string;           // Web app URL
}

export const DEEP_LINKS = {
  nutrium: {
    android: {
      intent: 'intent://#Intent;package=com.nutrium.nutrium;scheme=nutrium;end',
      fallback: 'https://play.google.com/store/apps/details?id=com.nutrium.nutrium'
    },
    ios: {
      scheme: 'nutrium://',
      fallback: 'https://apps.apple.com/app/nutrium/id1448823099'
    },
    web: 'https://app.nutrium.com'
  },
  teachable: {
    android: {
      intent: 'intent://#Intent;package=com.teachable.teachable;scheme=teachable;end',
      fallback: 'https://sso.teachable.com/secure/564301/identity/login/otp'
    },
    ios: {
      scheme: 'teachable://',
      fallback: 'https://sso.teachable.com/secure/564301/identity/login/otp'
    },
    web: 'https://sso.teachable.com/secure/564301/identity/login/otp'
  }
};

export function openNativeApp(appKey: keyof typeof DEEP_LINKS): void {
  const config = DEEP_LINKS[appKey];
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(ua);
  const isIOS = /iphone|ipad|ipod/.test(ua);
  
  if (isAndroid) {
    window.location.href = config.android.intent;
    setTimeout(() => {
      window.location.href = config.android.fallback;
    }, 2500);
  } else if (isIOS) {
    window.location.href = config.ios.scheme;
    setTimeout(() => {
      window.location.href = config.ios.fallback;
    }, 2500);
  } else {
    window.open(config.web, '_blank');
  }
}
```

### 3.2 Aggiornamento Pagina Nutrizione

Il file `src/pages/Nutrizione.tsx` ha gia la funzione `openNutrium` (linee 46-68). Sostituire con la versione centralizzata e aggiornare l'App Store ID corretto (1448823099).

### 3.3 Aggiornamento Link Teachable

Aggiornare `src/pages/Diario.tsx` (linea 281) per usare la funzione centralizzata invece di `window.open`.

---

## Parte 4: Login Persistente e Upload Dieta Coach

### 4.1 Verifica Configurazione Auth

Il file `src/integrations/supabase/client.ts` gia include:

```typescript
auth: {
  storage: localStorage,
  persistSession: true,
  autoRefreshToken: true,
}
```

**Stato:** OK - Nessuna modifica necessaria.

### 4.2 Upload Dieta da Coach

Il sistema attuale permette al cliente di caricare il proprio PDF. Per permettere al Coach di caricare:

**Opzione 1 (Consigliata):** Creare una funzione separata per l'upload da parte del Coach:

```typescript
// In useUserDiet.ts, aggiungere:
const uploadDietForClient = async (clientId: string, file: File) => {
  // Verifica che l'utente sia admin/collaborator
  // Carica il file nel path del cliente
  // Crea/aggiorna record in user_diet_plans
  // Invia notifica al cliente
};
```

**Aggiornare RLS:**
- Policy INSERT per permettere a Coach assegnati di caricare per i propri clienti

### 4.3 Componente Upload Dieta per Staff

Aggiungere in `ClientExpandedView.tsx` un pulsante "Carica Piano Alimentare" che:
1. Apre un file picker per PDF
2. Carica il file nel bucket `user-diets` con path del cliente
3. Crea/aggiorna record in `user_diet_plans`
4. Invia notifica push al cliente
5. Il cliente vede istantaneamente il PDF nella sua sezione Nutrizione

---

## Riepilogo File da Modificare

| File | Azione | Descrizione |
|------|--------|-------------|
| `supabase/migrations/xxx.sql` | Nuovo | Tabella notifications + RLS |
| `src/hooks/useNotifications.ts` | Nuovo | Hook per gestire notifiche |
| `src/components/NotificationBell.tsx` | Nuovo | Componente campanella |
| `src/lib/deepLinks.ts` | Nuovo | Utility deep linking |
| `src/pages/Diario.tsx` | Edit | Aggiungi NotificationBell in header |
| `src/pages/AllenamentoRedesign.tsx` | Edit | Aggiungi NotificationBell in header |
| `src/pages/Nutrizione.tsx` | Edit | Usa deepLinks centralizzato |
| `src/pages/Progressi.tsx` | Edit | Aggiungi NotificationBell in header |
| `src/components/ClientExpandedView.tsx` | Edit | Aggiungi upload dieta per Coach |
| `src/hooks/useUserDiet.ts` | Edit | Aggiungi funzione upload per Coach |
| `supabase/functions/notify-video-correction/index.ts` | Edit | Crea record in notifications |
| `supabase/functions/send-push-notification/index.ts` | Edit | Crea record in notifications |

---

## Diagramma Flusso Notifiche

```text
+------------------+     +-------------------+     +------------------+
| Azione Trigger   | --> | Edge Function     | --> | Tabella          |
| (Video/Dieta/    |     | (notify-video-    |     | notifications    |
|  Feedback)       |     |  correction)      |     |                  |
+------------------+     +-------------------+     +------------------+
                                |                          |
                                v                          v
                         +-------------+            +-------------+
                         | Web Push    |            | Realtime    |
                         | (sw.js)     |            | Subscription|
                         +-------------+            +-------------+
                                |                          |
                                v                          v
                         +-------------+            +-------------+
                         | Notifica    |            | Badge       |
                         | Blocco      |            | Campanella  |
                         | Schermo     |            | In-App      |
                         +-------------+            +-------------+
```

---

## Note Tecniche

1. **Realtime per Notifiche:** Usare `supabase.channel('notifications').on('postgres_changes', ...)` per aggiornare il contatore in tempo reale.

2. **Migration Realtime:** Aggiungere `ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;` nella migration.

3. **Popover vs Drawer:** Usare Popover da Radix per desktop e Drawer (vaul) per mobile.

4. **Performance:** Limitare le notifiche caricate a 50 piu recenti, con paginazione lazy.

5. **Notifiche Duplicate:** La logica deve evitare di creare notifiche duplicate per la stessa azione.
