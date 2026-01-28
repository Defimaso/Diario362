
# Piano di Implementazione: Dock di Navigazione e Modulo Nutrizione

## Panoramica Architettura

```text
+------------------+     +------------------+     +------------------+
|     App.tsx      |     |   BottomDock     |     |    Nutrizione    |
|   (Routes)       | --> | (Glassmorphism)  | --> |   (PDF Upload)   |
|   + /nutrizione  |     | Fixed Bottom Bar |     |   user-diets     |
+------------------+     +------------------+     +------------------+
         |                       |                        |
         v                       v                        v
+------------------+     +------------------+     +------------------+
| ClientExpanded   |     |   Diario.tsx     |     |   Supabase       |
| (Staff Nutrition)|     |   Checks.tsx     |     |   Storage        |
| (PDF Viewer)     |     |   Settings.tsx   |     |   + RLS          |
+------------------+     +------------------+     +------------------+
```

---

## Parte 1: Dock di Navigazione (Bottom Bar)

### Struttura del Componente `BottomDock.tsx`

**Icone e Destinazioni:**

| Posizione | Nome | Icona | Rotta | Descrizione |
|-----------|------|-------|-------|-------------|
| 1 | Diario | `ClipboardCheck` | `/diario` | Home con check giornalieri |
| 2 | Nutrizione | `Apple` | `/nutrizione` | Nuovo modulo PDF |
| 3 | Progressi | `TrendingUp` | `/checks` | Tab verde esistente |
| 4 | Profilo | `User` | `/settings` | Badge + impostazioni |

**Design Glassmorphism:**
```typescript
// Stile del Dock
<nav className="fixed bottom-0 left-0 right-0 z-50">
  <div className="mx-auto max-w-lg px-4 pb-safe">
    <div className={cn(
      "flex justify-around items-center py-3 px-4 rounded-2xl mb-2",
      "bg-card/80 backdrop-blur-xl border border-border/50",
      "shadow-lg"
    )}>
      {/* Nav Items */}
    </div>
  </div>
</nav>
```

**Stato Attivo (Rosso 362gradi):**
```typescript
// Colore attivo per l'icona corrente
const isActive = currentPath === item.path;

<item.icon className={cn(
  "w-6 h-6 transition-colors",
  isActive 
    ? "text-[hsl(var(--section-red))]"  // Rosso 362gradi
    : "text-muted-foreground"
)} />
```

### File da Creare: `src/components/BottomDock.tsx`

Componente standalone che:
- Usa `useLocation` per determinare la pagina attiva
- Applica stile glassmorphism con `backdrop-blur-xl`
- Colora l'icona attiva in rosso (`--section-red`)
- Supporta `pb-safe` per iPhone con notch

---

## Parte 2: Modulo Nutrizione (Pagina Cliente)

### Struttura Pagina `Nutrizione.tsx`

```text
+--------------------------------------------------+
|  <- Indietro              NUTRIZIONE              |
+--------------------------------------------------+
|                                                  |
|  +--------------------------------------------+  |
|  |                                            |  |
|  |     🍎  Il Tuo Piano Alimentare           |  |
|  |                                            |  |
|  |  [Se nessun file caricato:]                |  |
|  |  +--------------------------------------+  |  |
|  |  |  📄 Carica il tuo PDF               |  |  |
|  |  |     (solo formato .pdf)             |  |  |
|  |  +--------------------------------------+  |  |
|  |                                            |  |
|  |  [Se file presente:]                       |  |
|  |  +--------------------------------------+  |  |
|  |  |  📄 piano_alimentare.pdf            |  |  |
|  |  |  Caricato il: 28/01/2026            |  |  |
|  |  |  [Scarica]  [Sostituisci]           |  |  |
|  |  +--------------------------------------+  |  |
|  |                                            |  |
|  +--------------------------------------------+  |
|                                                  |
|  +--------------------------------------------+  |
|  |  ℹ️ Info                                  |  |
|  |  Il tuo piano e visibile solo a te        |  |
|  |  e ai tuoi coach assegnati.               |  |
|  +--------------------------------------------+  |
|                                                  |
+--------------------------------------------------+
|           [====== DOCK ======]                   |
+--------------------------------------------------+
```

### Funzionalita

1. **Upload PDF**: Input file con validazione `.pdf`
2. **Visualizzazione**: Nome file + data caricamento
3. **Download**: Link diretto al file
4. **Sostituzione**: Elimina vecchio + carica nuovo

---

## Parte 3: Database - Storage Bucket

### Nuovo Bucket: `user-diets`

```sql
-- Crea bucket per i piani alimentari
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-diets', 'user-diets', false);

-- Il bucket e PRIVATO (public: false)
-- L'accesso avviene tramite signed URLs
```

### RLS Policies per Storage

```sql
-- Policy: Utenti possono caricare nella propria cartella
CREATE POLICY "Users can upload own diet files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-diets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Utenti possono vedere i propri file
CREATE POLICY "Users can view own diet files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-diets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Utenti possono eliminare i propri file
CREATE POLICY "Users can delete own diet files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-diets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Utenti possono aggiornare i propri file
CREATE POLICY "Users can update own diet files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-diets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Parte 4: Database - Tabella Metadata

### Nuova Tabella: `user_diet_plans`

```sql
CREATE TABLE public.user_diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id) -- Un solo piano per utente
);

-- Enable RLS
ALTER TABLE public.user_diet_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Utenti vedono il proprio piano
CREATE POLICY "Users can view own diet plan"
ON public.user_diet_plans FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Utenti possono inserire il proprio piano
CREATE POLICY "Users can insert own diet plan"
ON public.user_diet_plans FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Utenti possono aggiornare il proprio piano
CREATE POLICY "Users can update own diet plan"
ON public.user_diet_plans FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Utenti possono eliminare il proprio piano
CREATE POLICY "Users can delete own diet plan"
ON public.user_diet_plans FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Admin vedono tutti i piani
CREATE POLICY "Admins can view all diet plans"
ON public.user_diet_plans FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.is_super_admin(auth.uid())
);

-- Policy: Collaboratori vedono piani dei clienti assegnati
CREATE POLICY "Collaborators can view assigned client diet plans"
ON public.user_diet_plans FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'collaborator') AND
  public.can_collaborator_see_client(auth.uid(), user_id)
);
```

---

## Parte 5: Hook per la Gestione Nutrizione

### Nuovo Hook: `src/hooks/useUserDiet.ts`

```typescript
interface UserDietPlan {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  uploaded_at: string;
}

export const useUserDiet = (clientId?: string) => {
  // Funzioni:
  // - fetchDietPlan(): Recupera piano esistente
  // - uploadDietPlan(file: File): Carica nuovo PDF
  // - deleteDietPlan(): Elimina piano
  // - getSignedUrl(): Ottiene URL firmato per download
  // - replaceDietPlan(file: File): Sostituisce piano
}
```

---

## Parte 6: Integrazione Staff Dashboard

### Modifica: `src/components/ClientExpandedView.tsx`

Aggiungere sezione "Nutrizione" dopo "Storico Check":

```typescript
// Nuova sezione nel ClientExpandedView
{/* Nutrition Section */}
<div className="bg-card rounded-xl p-3 sm:p-4 border border-section-purple/30">
  <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
    <Apple className="w-4 h-4" />
    Piano Alimentare
  </h4>
  
  {dietPlan ? (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-section-purple" />
        <div>
          <p className="font-medium">{dietPlan.file_name}</p>
          <p className="text-xs text-muted-foreground">
            Caricato: {format(new Date(dietPlan.uploaded_at), 'dd/MM/yyyy')}
          </p>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={handleDownload}>
        <Download className="w-4 h-4 mr-1" />
        Scarica
      </Button>
    </div>
  ) : (
    <p className="text-sm text-muted-foreground text-center py-4">
      Nessun piano alimentare caricato
    </p>
  )}
</div>
```

---

## Parte 7: Routing e Layout

### Modifica: `src/App.tsx`

```typescript
// Aggiungere import
import Nutrizione from "./pages/Nutrizione";

// Aggiungere route
<Route path="/nutrizione" element={<Nutrizione />} />
```

### Pagine con Dock Visibile

| Pagina | Mostra Dock | Note |
|--------|-------------|------|
| `/diario` | Si | Home cliente |
| `/nutrizione` | Si | Nuovo modulo |
| `/checks` | Si | Progressi |
| `/settings` | Si | Profilo |
| `/auth` | No | Login/Signup |
| `/gestionediario` | No | Dashboard staff |
| `/inizia` | No | Funnel onboarding |

### Struttura Layout con Dock

```typescript
// Layout wrapper per pagine con dock
const PageWithDock = ({ children }) => (
  <div className="min-h-screen bg-background pb-20">
    {children}
    <BottomDock />
  </div>
);
```

---

## File da Creare/Modificare

| File | Azione | Priorita |
|------|--------|----------|
| `src/components/BottomDock.tsx` | Nuovo - Dock navigation | Alta |
| `src/pages/Nutrizione.tsx` | Nuovo - Pagina nutrizione | Alta |
| `src/hooks/useUserDiet.ts` | Nuovo - Hook gestione PDF | Alta |
| `src/App.tsx` | Modificare - Aggiungere route | Alta |
| `src/pages/Diario.tsx` | Modificare - Integrare Dock + padding bottom | Alta |
| `src/pages/Checks.tsx` | Modificare - Integrare Dock | Media |
| `src/pages/Settings.tsx` | Modificare - Integrare Dock | Media |
| `src/components/ClientExpandedView.tsx` | Modificare - Sezione nutrizione staff | Media |
| Database Migration | Nuovo - Tabella + bucket + RLS | Alta |

---

## Vincoli Tecnici Rispettati

1. **Badge Glow**: Nessuna modifica a `BadgeGallery.tsx`, `BadgeProgress.tsx`, `BadgeUnlockAnimation.tsx`

2. **Ghost Crop**: Nessuna modifica a `CheckFormModal.tsx`, `ImageCropperModal.tsx`

3. **Funnel /inizia**: Nessuna modifica a `Inizia.tsx` e componenti funnel

4. **Accessi Staff**: Il redirect `/diario` rimane invariato. Il Dock non appare in `/gestionediario`

5. **RLS Privacy**: I PDF sono accessibili solo al proprietario e ai coach assegnati tramite `can_collaborator_see_client()`

---

## Dettaglio Stile Glassmorphism

```css
/* Effetto vetro per il Dock */
.dock-glass {
  background: hsla(var(--card), 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid hsla(var(--border), 0.5);
  box-shadow: 
    0 -4px 30px hsla(0, 0%, 0%, 0.1),
    inset 0 1px 0 hsla(255, 255%, 255%, 0.1);
}
```

---

## Flusso Upload PDF

```text
1. Utente clicca "Carica PDF"
      |
2. Input file apre file picker (accept=".pdf")
      |
3. Validazione client-side:
   - Tipo file: application/pdf
   - Dimensione max: 10MB
      |
4. Upload a Supabase Storage:
   - Bucket: user-diets
   - Path: {user_id}/{timestamp}_{filename}.pdf
      |
5. Inserimento record in user_diet_plans:
   - file_name, file_path, file_size, uploaded_at
      |
6. UI aggiornata con nome file e opzioni
```

---

## Vantaggi dell'Implementazione

1. **Navigazione Intuitiva**: Dock sempre visibile per accesso rapido alle sezioni
2. **Privacy Garantita**: PDF privati con RLS, visibili solo a proprietario e coach
3. **Gestione Semplice**: Upload/download/sostituzione in un click
4. **Integrazione Staff**: Coach vedono i piani nella dashboard esistente
5. **Preservazione Funzionalita**: Badge, Crop, Funnel e Staff access rimangono intatti
6. **Mobile-First**: Dock ottimizzato per touch con safe-area-inset
