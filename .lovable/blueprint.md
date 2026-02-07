# BLUEPRINT TECNICO COMPLETO — App Coaching "Diario Smart"

> Documento progettato per essere incollato in un nuovo progetto Lovable.
> Contiene TUTTA la logica, lo schema DB, le convenzioni e le istruzioni per ricostruire l'app identica.

---

## 1. STACK TECNOLOGICO

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Animazioni | Framer Motion |
| State | React Query (TanStack) |
| Auth | Supabase Auth (email/password) |
| Database | Supabase Postgres con RLS |
| Storage | Supabase Storage (4 bucket) |
| Backend Logic | Supabase Edge Functions (Deno) |
| Notifiche | Web Push (VAPID) + in-app (tabella `notifications`) |
| Grafici | Recharts |
| Cropping | react-easy-crop |
| PWA | vite-plugin-pwa |

---

## 2. ROUTING (App.tsx)

```
/              → Redirect a /diario
/auth          → Login/Registrazione
/diario        → Dashboard giornaliera (check-in, streak, badge)
/gestionediario → Admin dashboard (lista clienti, coach filter)
/checks        → Sistema 100 Check (foto progress + peso)
/nutrizione    → Visualizzazione/upload piano PDF
/documenti     → Archivio documenti PDF dal coach
/allenamento   → Mini-chat video correzioni esercizi
/progressi     → Grafici peso + confronto foto
/settings      → Profilo, cambio password, elimina account
/install       → Prompt installazione PWA
/inizia        → Funnel onboarding (multi-step)
```

---

## 3. SCHEMA DATABASE COMPLETO

### 3.1 Tabelle Principali

```sql
-- ═══════════════════════════════════════
-- PROFILES (creato automaticamente da trigger)
-- ═══════════════════════════════════════
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY, -- = auth.users.id
  email TEXT NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════
-- USER ROLES
-- ═══════════════════════════════════════
CREATE TYPE public.app_role AS ENUM ('admin', 'collaborator', 'client');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'client'
);

-- ═══════════════════════════════════════
-- COACH ASSIGNMENTS
-- ═══════════════════════════════════════
-- NOTA: coach_name è un ENUM nel progetto originale.
-- Per whitelabel, usare TEXT e gestire i valori via admin panel.
CREATE TYPE public.coach_name AS ENUM (
  'Martina','Michela','Cristina','Michela_Martina',
  'Ilaria','Ilaria_Marco','Ilaria_Marco_Michela',
  'Ilaria_Michela','Ilaria_Martina','Martina_Michela','Marco'
);

CREATE TABLE public.coach_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  coach_name coach_name NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════
-- DAILY CHECKINS (Diario giornaliero)
-- ═══════════════════════════════════════
CREATE TABLE public.daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  recovery INTEGER,           -- 1-10
  nutrition_adherence BOOLEAN,
  energy INTEGER,             -- 1-10
  mindset INTEGER,            -- 1-10
  nutrition_score INTEGER,    -- 1-10
  nutrition_notes TEXT,
  training_score INTEGER,     -- 1-10
  training_rest_day BOOLEAN DEFAULT false,
  two_percent_edge TEXT,      -- Testo libero: la sfida quotidiana
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════
-- USER CHECKS (Sistema 100 Check con foto)
-- ═══════════════════════════════════════
CREATE TABLE public.user_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  check_number INTEGER NOT NULL,    -- 1-100
  weight NUMERIC,
  photo_front_url TEXT,
  photo_side_url TEXT,
  photo_back_url TEXT,
  notes TEXT,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════
-- MONTHLY CHECKS (legacy/sincronizzazione)
-- ═══════════════════════════════════════
CREATE TABLE public.monthly_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  email TEXT NOT NULL,
  current_weight NUMERIC,
  photo_front_url TEXT,
  photo_side_url TEXT,
  photo_back_url TEXT,
  check_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════
-- PROGRESS CHECKS (storico progress)
-- ═══════════════════════════════════════
CREATE TABLE public.progress_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC,
  photo_front_url TEXT,
  photo_side_url TEXT,
  photo_back_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════
-- USER DIET PLANS (Nutrizione PDF)
-- ═══════════════════════════════════════
CREATE TABLE public.user_diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,    -- path nel bucket 'user-diets'
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════
-- CLIENT DOCUMENTS (Archivio documenti dal coach)
-- ═══════════════════════════════════════
CREATE TABLE public.client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,    -- path nel bucket 'client-documents'
  file_size INTEGER,
  uploaded_by UUID NOT NULL,  -- coach/admin che ha caricato
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════
-- VIDEO CORRECTIONS (Upload video esercizi dal client)
-- ═══════════════════════════════════════
CREATE TABLE public.video_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_url TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════
-- VIDEO CORRECTION FEEDBACK (Risposte coach)
-- ═══════════════════════════════════════
CREATE TABLE public.video_correction_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.video_corrections(id),
  coach_id UUID NOT NULL,
  feedback TEXT NOT NULL,
  video_url TEXT,             -- video risposta del coach (opzionale)
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════
-- EXERCISE VIDEOS (Libreria esercizi admin)
-- ═══════════════════════════════════════
CREATE TABLE public.exercise_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  trainer TEXT NOT NULL,
  video_url TEXT NOT NULL,
  video_type TEXT DEFAULT 'shorts',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════
-- NOTIFICATIONS (in-app con realtime)
-- ═══════════════════════════════════════
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════
-- PUSH SUBSCRIPTIONS (Web Push)
-- ═══════════════════════════════════════
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════
-- COACH NOTES (note private tra coach)
-- ═══════════════════════════════════════
CREATE TABLE public.coach_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════
-- ONBOARDING LEADS (funnel pre-registrazione)
-- ═══════════════════════════════════════
CREATE TABLE public.onboarding_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT, email TEXT, gender TEXT, age INTEGER,
  height INTEGER, current_weight NUMERIC, target_weight NUMERIC,
  body_type TEXT, sleep_hours INTEGER, water_liters NUMERIC,
  meals_per_day INTEGER, skip_breakfast BOOLEAN, stress_eating BOOLEAN,
  late_eating BOOLEAN, energy_level TEXT, digestion TEXT,
  snacking_habit TEXT, alcohol_frequency TEXT, allergies TEXT,
  diet_type TEXT, previous_diets TEXT[], health_conditions TEXT[],
  medications TEXT, metabolism TEXT, wake_quality TEXT,
  daily_activity TEXT, preferred_location TEXT, weekly_sessions TEXT,
  session_duration TEXT, home_equipment TEXT, cardio_preference TEXT,
  flexibility TEXT, injuries TEXT, experience_level TEXT,
  biggest_fear TEXT, motivation_source TEXT, why_now TEXT,
  past_obstacle TEXT, post_cheat_feeling TEXT, weekend_challenge TEXT,
  weakness TEXT, eating_out_frequency TEXT, min_historic_size TEXT,
  special_event TEXT, home_support BOOLEAN, commit_daily_diary BOOLEAN,
  predicted_weeks INTEGER, profile_badge TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════
-- USER CONSENTS (GDPR)
-- ═══════════════════════════════════════
CREATE TABLE public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  biometric_consent BOOLEAN NOT NULL DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,
  biometric_consent_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════
-- AUDIT LOGS
-- ═══════════════════════════════════════
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_table TEXT,
  target_user_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.2 Functions & Triggers

```sql
-- Auto-crea profilo e ruolo alla registrazione
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone_number)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.raw_user_meta_data ->> 'phone_number'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client');
  -- Aggiungere qui la logica per promuovere admin/collaborator
  -- basata su email o tabella di configurazione
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Aggiorna updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Applicare a tutte le tabelle con updated_at:
CREATE TRIGGER update_daily_checkins_updated_at BEFORE UPDATE ON daily_checkins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_checks_updated_at BEFORE UPDATE ON user_checks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- (ripetere per ogni tabella con colonna updated_at)

-- Helper: controlla ruolo utente
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Helper: check admin (personalizzare con proprie email)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = _user_id AND p.email IN ('admin@tuodominio.it')
  )
$$;

-- Helper: check super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = _user_id AND email = 'admin@tuodominio.it'
  )
$$;

-- Helper: coach può vedere il client (personalizzare per proprio team)
CREATE OR REPLACE FUNCTION public.can_collaborator_see_client(_collaborator_id UUID, _client_id UUID)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coach_assignments ca
    JOIN public.profiles p ON p.id = _collaborator_id
    WHERE ca.client_id = _client_id
    -- Aggiungere logica di matching coach_name ↔ email coach
  )
$$;

-- Link monthly_check al profilo per email
CREATE OR REPLACE FUNCTION public.link_monthly_check_to_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  SELECT id INTO NEW.user_id FROM public.profiles WHERE LOWER(email) = LOWER(NEW.email);
  RETURN NEW;
END;
$$;
```

### 3.3 Storage Buckets

```sql
-- 1. Foto progress (pubblico per rendering)
INSERT INTO storage.buckets (id, name, public) VALUES ('progress-photos', 'progress-photos', true);

-- 2. Piani alimentari PDF (privato, signed URL)
INSERT INTO storage.buckets (id, name, public) VALUES ('user-diets', 'user-diets', false);

-- 3. Video correzioni esercizi (privato, signed URL)
INSERT INTO storage.buckets (id, name, public) VALUES ('exercise-corrections', 'exercise-corrections', false);

-- 4. Documenti dal coach (privato, signed URL)
INSERT INTO storage.buckets (id, name, public) VALUES ('client-documents', 'client-documents', false);
```

### 3.4 Realtime

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_correction_feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_corrections;
```

---

## 4. DESIGN SYSTEM (index.css)

I colori sono definiti come variabili HSL in `:root` e `.dark`. Per whitelabel, basta cambiare questi valori:

```css
:root {
  --primary: 173 55% 40%;          /* Colore principale (teal) */
  --primary-foreground: 0 0% 100%;
  --accent: 0 65% 65%;             /* Colore accento (coral) */
  --accent-foreground: 0 0% 100%;
  --background: 160 40% 96%;
  --foreground: 200 25% 20%;
  --card: 0 0% 100%;
  --muted: 160 20% 90%;
  --border: 160 20% 88%;
  --destructive: 0 84% 60%;
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --badge-gold: 45 100% 50%;       /* Colore badge system */
}
```

Utility CSS personalizzate: `.teal-glow`, `.coral-glow`, `.gradient-text`, `.card-elegant`, `.card-elegant-accent`, `.momentum-ring`, `.status-green/yellow/red`.

---

## 5. AUTENTICAZIONE (AuthContext.tsx)

**Flusso:**
1. Supabase Auth `onAuthStateChange` → setta `user` e `session`
2. Dopo login, fetch da `user_roles` → determina `roles[]`
3. Derivati: `isAdmin`, `isCollaborator`, `isClient`, `isSuperAdmin`, `isFullAdmin`

**Registrazione (`signUp`):**
- Crea utente via `supabase.auth.signUp` con `full_name` e `phone_number` in metadata
- Se selezionato un coach, inserisce riga in `coach_assignments`
- Trigger DB `handle_new_user` crea automaticamente profilo + ruolo `client`

**Ruoli:**
- `admin`: accesso completo alla dashboard di gestione
- `collaborator`: coach, vede solo i propri clienti assegnati
- `client`: utente finale

---

## 6. LOGICA GHOST CROP (Sistema foto con riferimento)

### Flusso completo:
1. **Utente seleziona foto** (camera o galleria) per un check (front/side/back)
2. **Si apre `ImageCropperModal`** con:
   - `react-easy-crop` in aspect ratio 3:4
   - Griglia di allineamento
   - Slider zoom (1x-3x)
3. **Ghost Overlay** (solo per Check 2+):
   - `useUserChecks().getFirstCheckWithPhotos()` recupera le foto del Check #1
   - La foto corrispondente (front→front, side→side, back→back) viene sovrapposta al 35% di opacità
   - Testo guida: "Allinea la tua sagoma con il riferimento"
   - Toggle on/off con icona Ghost
4. **Conferma** → `getCroppedImg()` (canvas crop) → `compressImage()` (max 1200×1600, quality 0.85) → Blob → upload

### Codice chiave (`imageCompression.ts`):

```typescript
getCroppedImg(imageSrc, pixelCrop): Promise<Blob>
// Canvas drawImage con coordinate pixel, output JPEG quality 0.95

compressImage(blob, maxWidth=1200, maxHeight=1600, quality=0.85): Promise<Blob>
// Ridimensiona mantenendo aspect ratio, high-quality smoothing

readFileAsDataURL(file): Promise<string>
// FileReader → base64 data URL
```

### Upload foto (`useUserChecks.saveCheck`):
- Upload parallelo delle 3 foto su bucket `progress-photos`
- Path: `{userId}/check_{checkNumber}_{type}_{timestamp}.{ext}`
- URL pubblica (bucket è public)
- Upsert su tabella `user_checks`

---

## 7. SISTEMA BADGE "Elite Evolution" (20 livelli)

### Struttura Badge:

```typescript
interface Badge {
  id: number;          // 1-20
  name: string;        // Nome animale
  emoji: string;       // Emoji kawaii
  description: string;
  motivationalQuote: string;
  requiredStreak: number;      // Giorni consecutivi necessari
  requiredTotalCheckins: number;
  phase: 'immediate' | 'consolidation' | 'transformation' | 'mastery';
}
```

### Progressione (20 badge):

| ID | Nome | Emoji | Streak | Fase |
|----|------|-------|--------|------|
| 1 | Leone | 🦁 | 1 | Inizio |
| 2 | Tartaruga | 🐢 | 2 | Inizio |
| 3 | Ape | 🐝 | 4 | Inizio |
| 4 | Formica | 🐜 | 6 | Inizio |
| 5 | Aquila | 🦅 | 7 | Inizio |
| 6 | Lupo | 🐺 | 15 | Consolidamento |
| 7 | Farfalla | 🦋 | 30 | Consolidamento |
| 8 | Delfino | 🐬 | 45 | Consolidamento |
| 9 | Tigre | 🐯 | 60 | Consolidamento |
| 10 | Elefante | 🐘 | 75 | Consolidamento |
| 11 | Ghepardo | 🐆 | 95 | Trasformazione |
| 12 | Scimmia | 🐒 | 115 | Trasformazione |
| 13 | Cavallo | 🐎 | 135 | Trasformazione |
| 14 | Gufo | 🦉 | 155 | Trasformazione |
| 15 | Canguro | 🦘 | 175 | Trasformazione |
| 16 | Orso | 🐻 | 205 | Mastery |
| 17 | Pavone | 🦚 | 235 | Mastery |
| 18 | Squalo | 🦈 | 265 | Mastery |
| 19 | Cane | 🐕 | 295 | Mastery |
| 20 | Toro | 🐂 | 300 | Mastery |

### Logica (`badges.ts`):
- `getCurrentBadge(streak, totalCheckins)` → scorre tutti i badge, ritorna l'ultimo sbloccato
- `getNextBadge()` → badge successivo
- `getBadgeProgress()` → percentuale 0-100 verso il prossimo
- Badge 20 (Toro) si sblocca SOLO con `totalCheckins >= 300`
- `isClientAtRisk()` → flag per coach se il client rischia di perdere il badge

### Hook (`useBadges.ts`):
- Salva ultimo badge in `localStorage('diario_last_badge_id')`
- Confronta ad ogni render: se `currentBadge.id > lastId` → trigger animazione unlock
- `BadgeUnlockAnimation` → overlay full-screen con confetti

---

## 8. MINI-CHAT VIDEO CORREZIONI

### Flusso Client (Allenamento tab):
1. **Upload video** → `VideoUploadCard` → file picker (accetta video/*)
2. `useVideoCorrections().uploadVideo(file, exerciseName, notes)`:
   - Upload su bucket `exercise-corrections` (privato, signed URL 1 anno)
   - Insert in `video_corrections`
   - Invoca edge function `notify-video-correction` → notifica push ai coach
3. **Visualizzazione feedback** → `VideoChatBubble`:
   - Layout WhatsApp-style: bolle destra (coach) / sinistra (client)
   - Avatar con iniziale coach
   - Video inline con play/pause
   - Timestamp + doppia spunta (is_read)
4. **Realtime**: canale `video-feedback-updates` → auto-refresh su INSERT

### Flusso Coach (Admin dashboard):
1. `useStaffVideoCorrections()` → fetch tutti i video (RLS filtra per ruolo)
2. `StaffVideoFeedbackPanel` → lista video per client, mini-chat per rispondere
3. `addFeedback(videoId, text, videoFile?)`:
   - Se video allegato → upload su `exercise-corrections/coach-feedback/`
   - Insert in `video_correction_feedback`
   - Invoca `notify-video-correction` → notifica push al client
4. **Realtime**: canale `staff-video-updates` → auto-refresh

### Notifica unread:
- `unreadCount` calcolato da feedback con `is_read = false`
- Mostrato come badge rosso sull'icona "Allenamento" nella dock

---

## 9. NUTRIZIONE (PDF Module)

### Flusso Client:
1. `useUserDiet()` → fetch singolo record da `user_diet_plans` per `user_id`
2. Se presente: mostra nome file, pulsante download, pulsante elimina
3. Download via `createSignedUrl(path, 3600)` → link temporaneo 1 ora
4. Upload: solo PDF, max 10MB, cancella precedente prima di caricare

### Flusso Coach (Staff):
1. `StaffDietUpload` → dialog con file picker + conferma
2. Upload su bucket `user-diets` con path `{clientId}/{timestamp}_{filename}`
3. Delete/replace automatico del piano precedente
4. Invoca `send-push-notification` per notificare il client

---

## 10. DOCUMENTI (Archivio PDF dal Coach)

### Flusso identico a Nutrizione ma multi-documento:
- Bucket: `client-documents`
- Tabella: `client_documents` (multiple righe per client)
- Il coach può caricare N documenti con titolo personalizzato
- Il client li vede nella tab `/documenti` e può scaricarli
- Notifica push + in-app al caricamento

---

## 11. DIARIO GIORNALIERO (Check-in)

### Campi del check-in:
| Campo | Tipo | Range |
|-------|------|-------|
| recovery | integer | 1-10 |
| energy | integer | 1-10 |
| mindset | integer | 1-10 |
| nutrition_score | integer | 1-10 |
| nutrition_adherence | boolean | sì/no |
| nutrition_notes | text | libero |
| training_score | integer | 1-10 (null se rest day) |
| training_rest_day | boolean | |
| two_percent_edge | text | La sfida del 2% quotidiano |

### Calcolo streak (`useCheckins`):
```typescript
// Scorre indietro da oggi, giorno per giorno
// Incrementa streak per ogni giorno con checkin
// Si ferma al primo buco (skippa oggi se mancante)
for (let i = 0; i < 365; i++) {
  if (hasCheckin) currentStreak++;
  else if (i > 0) break;
}
```

### Calcolo score:
```
dailyScore = (recovery + nutritionScore + energy + mindset) / 4
// nutritionScore = adherence ? 10 : 5
```

---

## 12. DASHBOARD ADMIN (`useAdminClients`)

### Dati mostrati per ogni client:
- Nome, email, telefono
- Coach assegnati
- Streak attuale
- Ultimo check-in (data + punteggi)
- Status semaforo: 🟢 avg > 7 | 🟡 avg 4-7 | 🔴 avg < 4 o assente oggi

### Filtro collaborator:
- Se l'utente è `collaborator`, vede SOLO i clienti dove `coach_assignments.coach_name` matcha la sua identità coach

---

## 13. SISTEMA NOTIFICHE

### In-app (`useNotifications`):
- Tabella `notifications` con subscription realtime (`postgres_changes INSERT`)
- `NotificationBell` mostra contatore unread
- Click → popover con lista, segna come letto

### Push (`usePushNotifications`):
- Service Worker (`/sw.js`) per Web Push
- Registrazione: `push_subscriptions` con endpoint + chiavi VAPID
- Edge function `send-push-notification` per invio
- Edge function `send-daily-reminder` per reminder automatico

---

## 14. EDGE FUNCTIONS (6 totali)

| Funzione | Scopo | JWT |
|----------|-------|-----|
| `delete-user` | Elimina account utente e dati associati | No |
| `send-push-notification` | Invia push notification a un utente | No |
| `send-daily-reminder` | Reminder giornaliero per check-in | No |
| `notify-video-correction` | Notifica coach/client per video | No |
| `sync-monthly-check` | Sincronizza monthly_checks con profili | No |

---

## 15. DRAFT AUTOSAVE (useCheckDraft)

```typescript
// Salva bozza in localStorage con expiry 24h
// Chiave: 'check_draft'
// Dati: checkNumber, date, weight, notes, photoPreview (base64)
// Al mount del form: se esiste draft per stesso checkNumber e non scaduto → pre-popola
// Al submit: clearDraft()
```

---

## 16. COMPRESSIONE VIDEO

```typescript
// videoCompression.ts
// La compressione canvas è DISABILITATA perché strappa l'audio su mobile
// Il file originale viene restituito direttamente
export const compressVideo = async (file: File): Promise<File> => file;
```

---

## 17. DEEP LINKS (App esterne)

```typescript
// Supporta Nutrium e Teachable
// Android: intent:// con fallback Play Store
// iOS: custom scheme con fallback App Store
// Desktop: apre URL web in nuovo tab
```

---

## 18. STRUTTURA FILE COMPONENTI

```
src/
├── App.tsx                    # Router principale
├── main.tsx                   # Entry point con QueryClient
├── index.css                  # Design tokens HSL
├── contexts/
│   └── AuthContext.tsx         # Auth + ruoli
├── hooks/
│   ├── useCheckins.ts          # Diario giornaliero
│   ├── useUserChecks.ts        # Sistema 100 Check + foto
│   ├── useMonthlyChecks.ts     # Monthly checks legacy
│   ├── useProgressChecks.ts    # Progress checks
│   ├── useVideoCorrections.ts  # Client: video esercizi
│   ├── useStaffVideoCorrections.ts # Coach: gestione video
│   ├── useUserDiet.ts          # Nutrizione PDF
│   ├── useClientDocuments.ts   # Documenti coach
│   ├── useNotifications.ts     # Notifiche in-app + realtime
│   ├── usePushNotifications.ts # Web Push
│   ├── useBadges.ts            # Badge unlock logic
│   ├── useCheckDraft.ts        # Autosave bozza check
│   ├── useAdminClients.ts      # Dashboard admin
│   ├── useCoachNotes.ts        # Note private tra coach
│   └── useConsents.ts          # GDPR consents
├── lib/
│   ├── badges.ts               # 20 badge + getCurrentBadge
│   ├── imageCompression.ts     # getCroppedImg + compressImage
│   ├── videoCompression.ts     # Passthrough (no compress)
│   ├── deepLinks.ts            # Nutrium/Teachable deep link
│   ├── storage.ts              # Demo data + localStorage helpers
│   └── utils.ts                # cn() utility
├── components/
│   ├── checks/
│   │   ├── CheckFormModal.tsx   # Form compilazione check
│   │   ├── CheckSlotCard.tsx    # Card singolo slot (1-100)
│   │   ├── ImageCropperModal.tsx # Crop + ghost overlay
│   │   └── ProgressWidget.tsx   # Widget progresso
│   ├── allenamento/
│   │   ├── VideoUploadCard.tsx  # Upload video client
│   │   ├── VideoChatBubble.tsx  # Bolla chat stile WhatsApp
│   │   └── VideoFeedbackList.tsx # Lista feedback
│   ├── staff/
│   │   ├── StaffDietUpload.tsx  # Upload dieta per client
│   │   ├── StaffDocumentUpload.tsx # Upload documento per client
│   │   ├── StaffVideoFeedbackPanel.tsx # Risposta video coach
│   │   ├── ClientDocumentsSection.tsx  # Sezione documenti nel pannello staff
│   │   └── SendNotificationButton.tsx  # Invio notifica manuale
│   ├── progress/
│   │   ├── WeightChart.tsx      # Grafico peso (Recharts)
│   │   ├── PhotoComparison.tsx  # Before/after photos
│   │   └── ProgressAnalysis.tsx # Analisi statistiche
│   ├── BadgeGallery.tsx         # Galleria tutti i badge
│   ├── BadgeProgress.tsx        # Barra progresso badge
│   ├── BadgeUnlockAnimation.tsx # Animazione full-screen unlock
│   ├── BottomDock.tsx           # Navigazione bottom tab
│   ├── DailyCheckinModal*.tsx   # Modal check-in giornaliero
│   ├── MomentumCircle.tsx       # Cerchio score giornaliero
│   ├── NotificationBell.tsx     # Campanella notifiche
│   ├── StreakBadge.tsx          # Badge streak corrente
│   ├── WeeklyChart.tsx          # Grafico settimana
│   └── funnel/                  # Componenti onboarding
│       ├── steps/               # Step individuali del funnel
│       ├── FunnelButton.tsx
│       ├── FunnelProgressBar.tsx
│       └── FunnelResult.tsx
└── pages/
    ├── Auth.tsx
    ├── Diario.tsx
    ├── GestioneDiario.tsx       # Admin dashboard
    ├── Checks.tsx               # 100 Check system
    ├── Nutrizione.tsx
    ├── Documenti.tsx
    ├── AllenamentoRedesign.tsx  # Mini-chat video
    ├── Progressi.tsx
    ├── Settings.tsx
    ├── Inizia.tsx               # Funnel onboarding
    └── InstallApp.tsx           # PWA install prompt
```

---

## 19. DIPENDENZE NPM ESSENZIALI

```json
{
  "@supabase/supabase-js": "^2.89.0",
  "@tanstack/react-query": "^5.83.0",
  "react-easy-crop": "^5.5.6",
  "framer-motion": "^12.23.26",
  "recharts": "^2.15.4",
  "react-router-dom": "^6.30.1",
  "date-fns": "^3.6.0",
  "lucide-react": "^0.462.0",
  "sonner": "^1.7.4",
  "vaul": "^0.9.9",
  "vite-plugin-pwa": "^1.2.0",
  "zod": "^3.25.76",
  "react-hook-form": "^7.61.1",
  "@hookform/resolvers": "^3.10.0"
}
```

---

## 20. SECRETS NECESSARI

| Nome | Scopo |
|------|-------|
| `SUPABASE_URL` | URL del progetto |
| `SUPABASE_ANON_KEY` | Chiave pubblica |
| `SUPABASE_SERVICE_ROLE_KEY` | Chiave admin per edge functions |
| `VAPID_PUBLIC_KEY` | Web Push (generare coppia VAPID) |
| `VAPID_PRIVATE_KEY` | Web Push |

---

## 21. WHITELABEL: COSA CAMBIARE

Per un nuovo brand, modificare SOLO:
1. **`index.css`**: variabili HSL in `:root` e `.dark`
2. **`is_admin()` / `is_super_admin()`**: email degli admin
3. **`handle_new_user()`**: logica promozione ruoli
4. **`can_collaborator_see_client()`**: mapping coach↔email
5. **`coach_name` ENUM**: nomi dei coach del nuovo brand
6. **`AuthContext.tsx`**: `coachMap` nella registrazione
7. **`useAdminClients.ts`**: `getCollaboratorCoachName()`
8. **Testi UI**: nome app, loghi, copy

---

*Fine Blueprint — Versione completa per clonazione*
