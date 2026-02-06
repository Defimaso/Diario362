# 🏗️ Guida Architettura Whitelabel — "Diario Smart"

> Documento di riferimento per creare un progetto whitelabel basato su Diario 362gradi.  
> Generato il 2026-02-06 dall'analisi del codice sorgente esistente.

---

## Indice

1. [Panoramica Architettura](#1-panoramica-architettura)
2. [Schema Database (Supabase)](#2-schema-database-supabase)
3. [Sistema di Configurazione Brand (DB Admin Panel)](#3-sistema-di-configurazione-brand)
4. [Struttura File & Componenti](#4-struttura-file--componenti)
5. [Design System Tematico](#5-design-system-tematico)
6. [Moduli Funzionali](#6-moduli-funzionali)
7. [Autenticazione & Ruoli](#7-autenticazione--ruoli)
8. [UX Fix Integrati](#8-ux-fix-integrati)
9. [Notifiche & Mini-Chat](#9-notifiche--mini-chat)
10. [Checklist di Setup per Nuovo Brand](#10-checklist-di-setup)

---

## 1. Panoramica Architettura

```
┌─────────────────────────────────────────────┐
│               LOVABLE CLOUD                 │
├──────────┬──────────┬──────────┬────────────┤
│ Database │ Storage  │ Edge Fn  │    Auth    │
│ (Tables) │ (Bucket) │ (Push)   │ (Email/PW)│
└──────┬───┴──────┬───┴──────┬───┴──────┬─────┘
       │          │          │          │
┌──────┴──────────┴──────────┴──────────┴─────┐
│          React + Vite + Tailwind             │
├─────────────────────────────────────────────┤
│  AppConfigProvider (brand_config da DB)      │
│  AuthProvider (ruoli: admin/coach/client)    │
├─────────────────────────────────────────────┤
│  Moduli Toggle:                             │
│  ☑ Diario   ☑ Nutrizione  ☑ Allenamento    │
│  ☑ Progressi  ☑ Documenti  ☑ Video Chat    │
└─────────────────────────────────────────────┘
```

### Principi Chiave

- **Zero riferimenti hardcoded**: nomi, colori, URL esterni letti da `brand_config` (DB)
- **Moduli attivabili**: ogni sezione è un toggle nel pannello admin
- **Ruoli generici**: `admin` (proprietario), `coach` (collaboratore), `client` (utente)
- **UX first**: sticky save, autosave draft, navigazione foto risolta nativamente

---

## 2. Schema Database (Supabase)

### 2.1 — Tabella `brand_config` (NUOVA)

Questa è la tabella centrale che configura l'intero brand.

```sql
-- ============================================
-- BRAND CONFIGURATION TABLE
-- ============================================
CREATE TABLE public.brand_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identità
  app_name TEXT NOT NULL DEFAULT 'Diario Smart',
  tagline TEXT DEFAULT 'Il tuo diario fitness',
  logo_url TEXT,
  favicon_url TEXT,
  
  -- Colori (HSL senza "hsl()" wrapper, es: "173 55% 40%")
  color_primary TEXT NOT NULL DEFAULT '173 55% 40%',
  color_primary_foreground TEXT NOT NULL DEFAULT '0 0% 100%',
  color_accent TEXT NOT NULL DEFAULT '0 65% 65%',
  color_accent_foreground TEXT NOT NULL DEFAULT '0 0% 100%',
  color_background TEXT NOT NULL DEFAULT '160 40% 96%',
  color_foreground TEXT NOT NULL DEFAULT '200 25% 20%',
  
  -- Dark mode overrides
  dark_color_primary TEXT DEFAULT '173 55% 45%',
  dark_color_background TEXT DEFAULT '200 30% 8%',
  dark_color_foreground TEXT DEFAULT '160 20% 95%',
  
  -- Moduli Attivi (toggle)
  module_diario BOOLEAN NOT NULL DEFAULT true,
  module_nutrizione BOOLEAN NOT NULL DEFAULT true,
  module_allenamento BOOLEAN NOT NULL DEFAULT true,
  module_progressi BOOLEAN NOT NULL DEFAULT true,
  module_documenti BOOLEAN NOT NULL DEFAULT false,
  module_video_tutorial BOOLEAN NOT NULL DEFAULT false,
  
  -- Integrazioni Esterne
  teachable_url TEXT,
  nutrium_url TEXT,
  
  -- Coach di default (per signup senza scelta)
  default_coach_name TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_config ENABLE ROW LEVEL SECURITY;

-- Solo admin possono leggere/scrivere la config
CREATE POLICY "Admins can manage brand config"
  ON public.brand_config FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Tutti gli utenti autenticati possono LEGGERE la config (per theming)
CREATE POLICY "Authenticated users can read brand config"
  ON public.brand_config FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

### 2.2 — Tabelle Core (Da 362gradi, già pronte)

Copia queste tabelle **così come sono** dal progetto originale:

| Tabella | Scopo | Note Whitelabel |
|---------|-------|-----------------|
| `profiles` | Dati utente (nome, email, telefono) | ✅ Già neutra |
| `user_roles` | Ruoli (admin, collaborator, client) | ✅ Già neutra |
| `coach_assignments` | Associazione coach↔cliente | ⚠️ Rimuovere enum `coach_name`, usare TEXT |
| `daily_checkins` | Check-in giornaliero | ✅ Già neutra |
| `user_checks` | Check mensili (peso + foto) | ✅ Già neutra |
| `user_diet_plans` | Piani alimentari PDF | ✅ Già neutra |
| `notifications` | Sistema notifiche in-app | ✅ Già neutra |
| `push_subscriptions` | Web push tokens | ✅ Già neutra |
| `video_corrections` | Video esercizi clienti | ✅ Già neutra |
| `video_correction_feedback` | Risposte coach (testo/video) | ✅ Già neutra |
| `client_documents` | Documenti generici PDF | ✅ Già neutra |
| `audit_logs` | Log di audit sicurezza | ✅ Già neutra |

### 2.3 — Modifiche per Whitelabel

```sql
-- ============================================
-- COACH ASSIGNMENTS: rimuovere enum, usare TEXT libero
-- ============================================

-- Nella versione whitelabel, NON creare l'enum coach_name.
-- Usa direttamente TEXT per massima flessibilità:

CREATE TABLE public.coach_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  coach_name TEXT NOT NULL,  -- TEXT libero anziché enum
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABELLA COACH (NUOVA) — per gestire i coach da admin
-- ============================================

CREATE TABLE public.coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage coaches"
  ON public.coaches FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches can view their own record"
  ON public.coaches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Clients can view active coaches"
  ON public.coaches FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);
```

### 2.4 — Storage Buckets (Da replicare)

```sql
-- Buckets necessari
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('progress-photos', 'progress-photos', true),
  ('user-diets', 'user-diets', false),
  ('exercise-corrections', 'exercise-corrections', false),
  ('client-documents', 'client-documents', false),
  ('brand-assets', 'brand-assets', true);  -- NUOVO: per logo/favicon
```

---

## 3. Sistema di Configurazione Brand

### 3.1 — Hook `useAppConfig`

```typescript
// src/hooks/useAppConfig.ts
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BrandConfig {
  appName: string;
  tagline: string;
  logoUrl: string | null;
  
  // Colori HSL
  colorPrimary: string;
  colorAccent: string;
  colorBackground: string;
  colorForeground: string;
  
  // Moduli attivi
  modules: {
    diario: boolean;
    nutrizione: boolean;
    allenamento: boolean;
    progressi: boolean;
    documenti: boolean;
    videoTutorial: boolean;
  };
  
  // Integrazioni
  teachableUrl: string | null;
  nutriumUrl: string | null;
  
  defaultCoachName: string | null;
}

const DEFAULT_CONFIG: BrandConfig = {
  appName: 'Diario Smart',
  tagline: 'Il tuo diario fitness',
  logoUrl: null,
  colorPrimary: '173 55% 40%',
  colorAccent: '0 65% 65%',
  colorBackground: '160 40% 96%',
  colorForeground: '200 25% 20%',
  modules: {
    diario: true,
    nutrizione: true,
    allenamento: true,
    progressi: true,
    documenti: false,
    videoTutorial: false,
  },
  teachableUrl: null,
  nutriumUrl: null,
  defaultCoachName: null,
};

const AppConfigContext = createContext<BrandConfig>(DEFAULT_CONFIG);

export const AppConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<BrandConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const fetchConfig = async () => {
      const { data, error } = await supabase
        .from('brand_config')
        .select('*')
        .limit(1)
        .single();

      if (error || !data) return;

      // Applica colori CSS custom
      const root = document.documentElement;
      root.style.setProperty('--primary', data.color_primary);
      root.style.setProperty('--accent', data.color_accent);
      root.style.setProperty('--background', data.color_background);
      root.style.setProperty('--foreground', data.color_foreground);

      setConfig({
        appName: data.app_name,
        tagline: data.tagline || '',
        logoUrl: data.logo_url,
        colorPrimary: data.color_primary,
        colorAccent: data.color_accent,
        colorBackground: data.color_background,
        colorForeground: data.color_foreground,
        modules: {
          diario: data.module_diario,
          nutrizione: data.module_nutrizione,
          allenamento: data.module_allenamento,
          progressi: data.module_progressi,
          documenti: data.module_documenti,
          videoTutorial: data.module_video_tutorial,
        },
        teachableUrl: data.teachable_url,
        nutriumUrl: data.nutrium_url,
        defaultCoachName: data.default_coach_name,
      });

      // Aggiorna titolo pagina
      document.title = data.app_name;
    };

    fetchConfig();
  }, []);

  return (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => useContext(AppConfigContext);
```

### 3.2 — Come usarlo nei componenti

```tsx
// Header Example
const Header = () => {
  const { appName, tagline, logoUrl } = useAppConfig();
  
  return (
    <header className="flex items-center gap-3">
      {logoUrl && <img src={logoUrl} alt={appName} className="h-8" />}
      <div>
        <h1 className="text-xl font-bold text-primary">{appName}</h1>
        <p className="text-xs text-muted-foreground">{tagline}</p>
      </div>
    </header>
  );
};

// Bottom Dock — filtra per moduli attivi
const BottomDock = () => {
  const { modules, teachableUrl, nutriumUrl } = useAppConfig();
  
  const navItems = [
    modules.diario && { path: '/diario', icon: ClipboardCheck, label: 'Diario' },
    modules.nutrizione && { path: '/nutrizione', icon: Apple, label: 'Nutrizione' },
    modules.documenti && { path: '/documenti', icon: FileText, label: 'Documenti' },
    modules.allenamento && { path: '/allenamento', icon: Dumbbell, label: 'Allenamento' },
    modules.progressi && { path: '/progressi', icon: TrendingUp, label: 'Progressi' },
  ].filter(Boolean);
  
  return (/* render solo le voci attive */);
};
```

---

## 4. Struttura File & Componenti

```
src/
├── contexts/
│   ├── AuthContext.tsx          # Auth + ruoli (NEUTRO)
│   └── AppConfigContext.tsx     # Brand config da DB
│
├── hooks/
│   ├── useAppConfig.ts         # NUOVO - Legge brand_config da DB
│   ├── useCheckins.ts          # Check-in giornaliero
│   ├── useUserChecks.ts        # Check mensili (peso/foto)
│   ├── useCheckDraft.ts        # Autosave localStorage
│   ├── useNotifications.ts     # Campanella notifiche
│   ├── useVideoCorrections.ts  # Video upload + feedback
│   ├── useCoachNotes.ts        # Note coach → coach
│   ├── useClientDocuments.ts   # PDF documenti
│   ├── useUserDiet.ts          # PDF nutrizione
│   ├── usePushNotifications.ts # Web push
│   └── useBadges.ts            # Sistema badge (opzionale)
│
├── components/
│   ├── layout/
│   │   ├── AppHeader.tsx        # NUOVO — legge appName/logo da config
│   │   ├── BottomDock.tsx       # NEUTRO — filtra per moduli attivi
│   │   └── PageWrapper.tsx      # NUOVO — layout base con sticky footer
│   │
│   ├── checkin/
│   │   ├── CheckinModal.tsx     # Check-in giornaliero (da CheckinModalRedesign)
│   │   ├── MomentumCircle.tsx   # Cerchio progresso
│   │   ├── StatsOverview.tsx    # Riepilogo giornata
│   │   └── WeeklyChart.tsx      # Grafico settimanale
│   │
│   ├── checks/
│   │   ├── CheckFormModal.tsx   # Form check mensile + STICKY SAVE + AUTOSAVE
│   │   ├── ImageCropperModal.tsx # Crop foto + "Conferma e Continua"
│   │   ├── CheckSlotCard.tsx    # Slot per ogni check
│   │   └── ProgressWidget.tsx   # Widget peso/foto
│   │
│   ├── video/
│   │   ├── VideoUploadCard.tsx  # Upload video cliente
│   │   ├── VideoChatBubble.tsx  # Mini-chat bubble (WhatsApp style)
│   │   └── VideoFeedbackList.tsx # Lista feedback per video
│   │
│   ├── nutrition/
│   │   ├── DietViewer.tsx       # Visualizzatore PDF cliente
│   │   └── DietUpload.tsx       # Upload PDF lato coach
│   │
│   ├── notifications/
│   │   └── NotificationBell.tsx # Campanella + popover
│   │
│   ├── staff/
│   │   ├── ClientCard.tsx       # Card cliente nel dashboard coach
│   │   ├── ClientExpandedView.tsx # Vista espansa cliente
│   │   ├── CoachNotesDialog.tsx # Note tra coach
│   │   └── SendNotificationButton.tsx # Notifica manuale
│   │
│   └── admin/
│       └── BrandConfigPanel.tsx # NUOVO — pannello config admin
│
├── pages/
│   ├── Auth.tsx                 # Login/Signup (NEUTRO)
│   ├── Diario.tsx               # Dashboard principale
│   ├── Checks.tsx               # Check mensili
│   ├── Nutrizione.tsx           # Piano alimentare PDF
│   ├── Allenamento.tsx          # Video correzioni
│   ├── Progressi.tsx            # Grafici e confronto foto
│   ├── Documenti.tsx            # Archivio documenti
│   ├── Settings.tsx             # Impostazioni utente
│   ├── StaffDashboard.tsx       # Dashboard coach/admin
│   └── AdminConfig.tsx          # NUOVO — pannello config brand
│
├── lib/
│   ├── utils.ts
│   ├── imageCompression.ts
│   ├── videoCompression.ts
│   ├── storage.ts
│   └── badges.ts
│
└── integrations/
    └── supabase/
        ├── client.ts            # Auto-generato
        └── types.ts             # Auto-generato
```

---

## 5. Design System Tematico

### 5.1 — `index.css` (Template Neutro)

I colori vengono sovrascritti a runtime da `useAppConfig`, ma servono come fallback:

```css
@layer base {
  :root {
    /* Fallback — sovrascritti da brand_config a runtime */
    --background: 0 0% 97%;
    --foreground: 220 20% 15%;
    --card: 0 0% 100%;
    --card-foreground: 220 20% 15%;
    --primary: 220 70% 50%;
    --primary-foreground: 0 0% 100%;
    --accent: 340 65% 55%;
    --accent-foreground: 0 0% 100%;
    --secondary: 220 20% 92%;
    --secondary-foreground: 220 20% 15%;
    --muted: 220 15% 90%;
    --muted-foreground: 220 10% 45%;
    --destructive: 0 84% 60%;
    --border: 220 15% 88%;
    --input: 220 15% 88%;
    --ring: 220 70% 50%;
    --radius: 0.75rem;
    
    /* Sezioni (condizionali ai moduli) */
    --section-red: 0 72% 51%;
    --section-blue: 217 91% 60%;
    --section-green: 142 76% 36%;
    --section-orange: 25 95% 53%;
    --section-purple: 271 81% 56%;
  }
}
```

### 5.2 — Tailwind Config (identico a 362gradi)

Il `tailwind.config.ts` resta identico — riferisce solo variabili CSS che vengono iniettate dinamicamente.

---

## 6. Moduli Funzionali

### 6.1 — Diario (Check-in Giornaliero)

**File da copiare:**
- `useCheckins.ts` — logica CRUD check-in
- `CheckinModalRedesign.tsx` → rinomina `CheckinModal.tsx`
- `MomentumCircle.tsx`, `StatsOverview.tsx`, `WeeklyChart.tsx`
- `useBadges.ts`, `BadgeProgress.tsx`, `BadgeGallery.tsx` (opzionale)

**Cosa neutralizzare:**
```tsx
// PRIMA (362gradi):
<h1><span className="text-primary">362</span>gradi</h1>

// DOPO (whitelabel):
const { appName } = useAppConfig();
<h1 className="text-primary">{appName}</h1>
```

### 6.2 — Check Mensili (Peso + Foto)

**File da copiare:**
- `useUserChecks.ts`, `useCheckDraft.ts`
- `CheckFormModal.tsx` (con sticky save + autosave già integrati)
- `CheckSlotCard.tsx`, `ImageCropperModal.tsx`, `ProgressWidget.tsx`

**UX Fix già inclusi:**
- ✅ Sticky "Salva Check" button con `safe-area-inset-bottom`
- ✅ Autosave bozza ogni 1s su localStorage
- ✅ Dialog "Continua da dove eri?" al rientro
- ✅ "Conferma e Continua" nel cropper foto

### 6.3 — Video Correzioni (Mini-Chat)

**File da copiare:**
- `useVideoCorrections.ts`
- `VideoUploadCard.tsx`, `VideoChatBubble.tsx`, `VideoFeedbackList.tsx`
- `StaffVideoFeedbackPanel.tsx`

**Architettura Mini-Chat:**
```
[Cliente carica video] → video_corrections (row)
    ↓
[Coach vede nella dashboard] → video_correction_feedback (risposta testo/video)
    ↓
[Chat bubble WhatsApp-style] → ordinata per created_at
    ↓
[Notifica push + campanella] → notifications table
```

### 6.4 — Nutrizione (PDF)

**File da copiare:**
- `useUserDiet.ts`
- `StaffDietUpload.tsx` (coach side)
- `Nutrizione.tsx` page (client side)

### 6.5 — Documenti (PDF generico)

**File da copiare:**
- `useClientDocuments.ts`
- `StaffDocumentUpload.tsx`
- `ClientDocumentsSection.tsx`

---

## 7. Autenticazione & Ruoli

### 7.1 — AuthContext Neutro

Il `AuthContext.tsx` attuale è quasi pronto. Modifiche necessarie:

```typescript
// RIMUOVERE: email hardcoded per admin/super-admin
// PRIMA:
const isSuperAdmin = user?.email === 'info@362gradi.it';
const isFullAdmin = ['info@362gradi.it', ...].includes(user?.email);

// DOPO: basato esclusivamente su user_roles
const isSuperAdmin = roles.includes('admin'); // il primo admin è super
const isFullAdmin = roles.includes('admin');
```

### 7.2 — Trigger `handle_new_user` (Neutro)

```sql
-- Versione whitelabel: nessun email hardcoded
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone_number)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.raw_user_meta_data ->> 'phone_number'
  );
  
  -- Assegna ruolo client di default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 7.3 — Promozione a Coach/Admin

Nella versione whitelabel, la promozione avviene dal **pannello admin** (non da email hardcoded):

```sql
-- Admin promuove un utente a coach
INSERT INTO public.user_roles (user_id, role) VALUES ('uuid-here', 'collaborator');
-- E rimuove il ruolo client se necessario
DELETE FROM public.user_roles WHERE user_id = 'uuid-here' AND role = 'client';
```

### 7.4 — Funzioni DB Security Definer (Da copiare)

```sql
-- has_role — identica, nessuna modifica necessaria
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- can_collaborator_see_client — SEMPLIFICATA (senza enum)
CREATE OR REPLACE FUNCTION public.can_coach_see_client(_coach_id uuid, _client_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.coach_assignments ca
    JOIN public.coaches c ON c.user_id = _coach_id
    WHERE ca.client_id = _client_id
      AND ca.coach_name = c.display_name
  )
$$;
```

### 7.5 — Persistenza Sessione

Già configurata nel client Supabase:

```typescript
export const supabase = createClient<Database>(URL, KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,     // ✅ Sessione persistente
    autoRefreshToken: true,   // ✅ Auto-refresh token
  }
});
```

---

## 8. UX Fix Integrati

### 8.1 — Sticky Action Bar (Pattern)

Usato in `CheckFormModal.tsx`, da applicare a **tutte** le pagine di compilazione:

```tsx
// Pattern: Modal con Sticky Footer
<motion.div className="fixed inset-x-0 bottom-0 top-auto max-h-[90vh] bg-card rounded-t-2xl z-50 flex flex-col">
  {/* Header Sticky */}
  <div className="sticky top-0 bg-card/95 backdrop-blur-sm p-4 border-b shrink-0">
    {/* titolo + close */}
  </div>

  {/* Contenuto Scrollabile */}
  <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-5">
    {/* form fields */}
  </div>

  {/* Footer Sticky con Safe Area */}
  <div className="sticky bottom-0 p-4 bg-card/95 backdrop-blur-sm border-t shrink-0 
    pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
    <Button className="w-full" size="lg">Salva</Button>
  </div>
</motion.div>
```

### 8.2 — Autosave Draft (Pattern)

Da `useCheckDraft.ts`, riutilizzabile:

```typescript
// Hook generico per draft
const DRAFT_EXPIRY_HOURS = 24;

export const useDraft = <T extends Record<string, any>>(key: string) => {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftData, setDraftData] = useState<T | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const draft = JSON.parse(stored);
        const hoursSince = (Date.now() - draft._timestamp) / (1000 * 60 * 60);
        if (hoursSince < DRAFT_EXPIRY_HOURS) {
          setHasDraft(true);
          setDraftData(draft);
        } else {
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key);
      }
    }
  }, [key]);

  const saveDraft = useCallback((data: T) => {
    const draft = { ...data, _timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(draft));
    setDraftData(data);
    setHasDraft(true);
  }, [key]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    setHasDraft(false);
    setDraftData(null);
  }, [key]);

  return { hasDraft, draftData, saveDraft, clearDraft };
};
```

### 8.3 — Navigazione Foto (Fix)

Nel `ImageCropperModal.tsx`:
- ✅ Bottone "Conferma e Continua" chiaro
- ✅ X per annullare (non "Indietro" del browser)
- ✅ Modal overlay separato → click fuori = chiude solo il cropper
- ✅ `onClose` resetta stato senza ricaricare pagina

---

## 9. Notifiche & Mini-Chat

### 9.1 — Sistema Notifiche

**Tabella `notifications`** — già neutra, nessuna modifica.

**Tipi di notifica standard:**
| Type | Trigger | Link |
|------|---------|------|
| `video_feedback` | Coach risponde a video | `/allenamento` |
| `video_uploaded` | Cliente carica video | `/gestionediario` |
| `diet_uploaded` | Coach carica PDF dieta | `/nutrizione` |
| `document_uploaded` | Coach carica documento | `/documenti` |
| `manual` | Coach invia manualmente | custom |

**Edge Function `send-push-notification`** — già neutra, da copiare.

### 9.2 — Mini-Chat Video

Il modulo `VideoChatBubble.tsx` è già completamente neutro (nessun riferimento a 362gradi). Pattern:

```
video_corrections (1) ← → video_correction_feedback (N)
         ↓
  VideoChatBubble × N, ordinati per created_at
         ↓
  Stile WhatsApp: coach a destra, cliente a sinistra
```

---

## 10. Checklist di Setup per Nuovo Brand

### 📋 Domande di Setup

Quando crei un nuovo progetto whitelabel, rispondi a queste domande:

```
┌─────────────────────────────────────────────────┐
│           🔧 SETUP NUOVO BRAND                  │
├─────────────────────────────────────────────────┤
│                                                 │
│ 1. Nome App: _______________                    │
│ 2. Tagline: _______________                     │
│ 3. Logo URL: _______________                    │
│ 4. Colore Primario (HSL): _______________       │
│ 5. Colore Accent (HSL): _______________         │
│                                                 │
│ MODULI ATTIVI:                                  │
│ ☐ Diario (check-in giornaliero)                │
│ ☐ Nutrizione (PDF piano alimentare)            │
│ ☐ Allenamento (video + mini-chat)              │
│ ☐ Progressi (grafici peso + foto)              │
│ ☐ Documenti (PDF generici)                     │
│ ☐ Video Tutorial (libreria video)              │
│                                                 │
│ INTEGRAZIONI:                                   │
│ URL Teachable: _______________                  │
│ URL Nutrium: _______________                    │
│                                                 │
│ COACH:                                          │
│ Email Admin Principale: _______________         │
│ Coach 1 (nome + email): _______________         │
│ Coach 2 (nome + email): _______________         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 🚀 Procedura Passo-Passo

1. **Crea nuovo progetto Lovable** con Cloud abilitato
2. **Esegui le migrazioni SQL** (sezione 2) per creare tutte le tabelle
3. **Copia i componenti** seguendo la struttura file (sezione 4)
4. **Inserisci la prima riga in `brand_config`** con i dati del brand:
   ```sql
   INSERT INTO public.brand_config (
     app_name, tagline, color_primary, color_accent,
     module_diario, module_nutrizione, module_allenamento,
     module_progressi, module_documenti
   ) VALUES (
     'FitCoach Pro', 'Il tuo percorso fitness',
     '220 70% 50%', '340 65% 55%',
     true, true, true, true, false
   );
   ```
5. **Configura VAPID keys** per push notifications (secrets)
6. **Crea l'account admin** e promuovilo:
   ```sql
   INSERT INTO public.user_roles (user_id, role) 
   VALUES ('admin-uuid', 'admin');
   ```
7. **Aggiungi i coach** dalla UI admin o via SQL
8. **Testa il flusso** client → coach → notifiche

---

## RLS Policies Riepilogo

Tutte le RLS policies del progetto 362gradi sono **già neutre** (usano `has_role()` e `auth.uid()`).  
L'unica funzione da modificare è `can_collaborator_see_client` → rinominata `can_coach_see_client` e semplificata per usare la tabella `coaches` anziché email hardcoded.

---

## Edge Functions da Copiare

| Funzione | Scopo | Modifiche |
|----------|-------|-----------|
| `send-push-notification` | Push web | ✅ Già neutra |
| `send-daily-reminder` | Reminder giornaliero | ⚠️ Togliere testo "362gradi" |
| `notify-video-correction` | Notifica video upload | ✅ Già neutra |
| `delete-user` | Cancellazione account | ✅ Già neutra |
| `sync-monthly-check` | Sync check mensili | ✅ Già neutra |

---

*Fine della guida. Per domande specifiche sull'implementazione di un singolo modulo, chiedi e fornirò il codice dettagliato.*
