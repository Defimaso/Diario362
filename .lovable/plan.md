
# Piano di Implementazione: Archivio Video e Fix Tab Progressi

## Panoramica Modifiche

| Componente | Stato Attuale | Nuovo Stato |
|------------|---------------|-------------|
| Tab Progressi | Mostra form per inserire check | Solo analytics (grafici + foto) |
| Dock | 4 icone (Diario, Nutrizione, Progressi, Profilo) | 4 icone (Diario, Nutrizione, Allenamento, Progressi) |
| Allenamento | Non esiste | Nuova sezione archivio video |
| Profilo | In Dock | Spostato in header/menu |

---

## Parte 1: Database - Tabella `exercise_videos`

### Schema Tabella

```sql
CREATE TABLE public.exercise_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,  -- 'kettlebell', 'manubri', 'corpo_libero', etc.
  trainer TEXT NOT NULL,   -- 'maso' o 'martina'
  video_url TEXT NOT NULL,
  video_type TEXT DEFAULT 'shorts',  -- 'shorts' (9:16) o 'standard' (16:9)
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Categorie Previste

| Categoria | Display Name | Icona |
|-----------|--------------|-------|
| kettlebell | Kettlebell | Dumbbell |
| manubri | Manubri | Dumbbell |
| bilanciere | Bilanciere | Dumbbell |
| corpo_libero | Corpo Libero | PersonStanding |
| macchinari | Macchinari | Settings |
| elastici | Elastici/Loop Band | Circle |
| trx | TRX/Anelli | Link |
| mobilita | Mobilita e Stretching | Waves |

### RLS Policies

```sql
-- Tutti gli utenti autenticati possono vedere i video
CREATE POLICY "Authenticated users can view exercises"
ON public.exercise_videos FOR SELECT
TO authenticated
USING (true);

-- Solo admin possono modificare
CREATE POLICY "Admins can manage exercises"
ON public.exercise_videos FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()));
```

### Dati Iniziali - Martina (estratti dal documento)

| Categoria | Esercizi Estratti |
|-----------|-------------------|
| Kettlebell | Stacchi, Sumo Deadlift High Pull, Goblet Squat, One Leg Deadlift |
| Manubri | Curl, Thruster, Russian Twist, Push Jerk, French Press, Affondi Posteriori, Rematore, Renegade Row, Stacchi Rumeni, Alzate Laterali, Rematore su Panca, Spinte, Hammer Curl, Hip Thrust One Leg, Reverse Fly |
| Corpo Libero | Sit Up Butterfly, Reverse Lunge, Sit Up, Plank Up and Down, Dips, V-Pushups, Affondi in Camminata, Crunch Inverso, Crunch, Trazioni, Pushups, Step Ups, Ponte Glutei, Plank, Squat Jump, Burpees, Hollow Hold, V-Sit Up, Air Squat, Side Plank, Mountain Climbers |
| Bilanciere | Squat, Push Press, Rematore, Stacchi Rumeni, Hip Thrust, Press, Abduzioni con Disco, Stacco da Terra |
| Macchinari | Shoulder Press, Leg Press, Row, Hip Thrust, Pulley, Push Down, Lat Machine |
| Elastici | Curl Bicipiti, Abduzioni, Glute Bridge |
| Mobilita | Foam Roller Routine, Mobilita Corpo Libero, Ciciling Spalla, Windmill, Halo, Cat Cow, Squat Reach, Mobility Spalle, Mobilita Anche, Stretching vari |
| TRX | Australian Pull Up |

### Dati Iniziali - Maso (da lista testuale)

I video di Maso verranno inseriti con la stessa struttura, organizzati per categoria (Manubri, Bilanciere, Loop Band, etc.).

---

## Parte 2: Nuova Pagina Allenamento

### Struttura UI

```text
+--------------------------------------------------+
|  🏋️ ALLENAMENTO                                   |
+--------------------------------------------------+
|  [🔍 Cerca esercizio...                        ] |
+--------------------------------------------------+
|                                                  |
|  📂 KETTLEBELL                                   |
|  +--------------------------------------------+  |
|  | 🎬 Stacchi         | Martina 🟪           |  |
|  | 🎬 Goblet Squat    | Martina 🟪           |  |
|  +--------------------------------------------+  |
|                                                  |
|  📂 MANUBRI                                      |
|  +--------------------------------------------+  |
|  | 🎬 Curl Manubri    | Maso 🟦              |  |
|  | 🎬 Thruster        | Martina 🟪           |  |
|  | 🎬 French Press    | Maso 🟦              |  |
|  +--------------------------------------------+  |
|                                                  |
|  📂 CORPO LIBERO                                 |
|  +--------------------------------------------+  |
|  | ...                                        |  |
|  +--------------------------------------------+  |
|                                                  |
+--------------------------------------------------+
|     [DOCK: Diario | Nutrizione | Allenamento | Progressi]  |
+--------------------------------------------------+
```

### Componenti

1. **Search Bar**: Filtro in tempo reale per nome esercizio
2. **Category Accordion**: Sezioni espandibili per categoria
3. **Video Card**: Titolo + Trainer Badge (Blu/Viola)
4. **Video Player Modal**: 
   - Shorts: Aspect ratio 9:16 (verticale)
   - Standard: Aspect ratio 16:9 (orizzontale)

### Trainer Badge Colori

| Trainer | Colore | HSL |
|---------|--------|-----|
| Maso | Blu 🟦 | hsl(210, 100%, 50%) |
| Martina | Viola 🟪 | hsl(270, 80%, 60%) |

---

## Parte 3: Fix Tab Progressi

### Pagina Attuale `/checks`

Attualmente mostra:
- Header "I Tuoi Check"
- Progress bar completamento
- Tabs "Da Fare" / "Completati"
- Form per inserire nuovi check

### Nuova Pagina `/progressi`

Mostrera SOLO:
- Grafico andamento peso (WeightChart)
- Comparazione foto (PhotoComparison)
- Storico tabellare (HistoryTable - opzionale)

### Strategia di Implementazione

1. **Rinominare rotta**: `/checks` rimane per la gestione check (accessibile da Diario)
2. **Creare nuova pagina**: `/progressi` con solo analytics
3. **Aggiornare Dock**: Puntare "Progressi" a `/progressi`

### Contenuto Pagina Progressi

```typescript
// src/pages/Progressi.tsx
const Progressi = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header>
        <h1>I Tuoi Progressi</h1>
        <p>Analizza il tuo percorso</p>
      </header>
      
      <main className="p-4 space-y-4">
        {/* Grafico Peso */}
        <WeightChart data={progressChecks} getFilteredData={getFilteredData} />
        
        {/* Comparazione Foto */}
        <PhotoComparison
          datesWithPhotos={datesWithPhotos}
          getSignedPhotoUrl={getSignedPhotoUrl}
          comparisonDefaults={comparisonDefaults}
        />
        
        {/* Storico opzionale */}
        <HistoryTable data={progressChecks} monthlyChecks={monthlyChecks} />
      </main>
      
      <BottomDock />
    </div>
  );
};
```

---

## Parte 4: Aggiornamento Bottom Dock

### Nuova Configurazione

```typescript
const navItems: NavItem[] = [
  { path: '/diario', icon: ClipboardCheck, label: 'Diario' },
  { path: '/nutrizione', icon: Apple, label: 'Nutrizione' },
  { path: '/allenamento', icon: Dumbbell, label: 'Allenamento' },  // NUOVO
  { path: '/progressi', icon: TrendingUp, label: 'Progressi' },    // FIX rotta
];
```

### Accesso a Profilo/Settings

Il Profilo viene spostato dal Dock all'header delle pagine principali (icona utente in alto a destra).

---

## Parte 5: Conferme Logica Esistente

### Redirect Staff su /diario

**Gia implementato** in `Auth.tsx` linea 137-142:
```typescript
useEffect(() => {
  if (user) {
    navigate('/diario');
  }
}, [user, navigate]);
```

Tutti i collaboratori (info@362gradi.it, valentina362g@gmail.com, michela.amadei@hotmail.it, martina.fienga@hotmail.it, spicri@gmail.com) atterrano su `/diario`.

### Branding Footer

**Gia implementato** in `Footer.tsx` linea 39-40:
```typescript
<p>© 2026 MerryProject Global - Dubai</p>
<p className="text-primary/80">Ecosystem: 362gradi.ae | defimasi.ae</p>
```

---

## File da Creare/Modificare

| File | Azione | Priorita |
|------|--------|----------|
| Database Migration | Creare tabella `exercise_videos` + seed data | Alta |
| `src/pages/Allenamento.tsx` | Nuovo - Archivio video | Alta |
| `src/pages/Progressi.tsx` | Nuovo - Solo analytics | Alta |
| `src/hooks/useExerciseVideos.ts` | Nuovo - Hook per video | Alta |
| `src/components/VideoPlayerModal.tsx` | Nuovo - Player verticale/orizzontale | Alta |
| `src/components/BottomDock.tsx` | Modificare - Nuove icone | Alta |
| `src/App.tsx` | Aggiungere routes /allenamento e /progressi | Alta |
| `src/pages/Diario.tsx` | Aggiungere link a /checks per gestione | Media |

---

## Vincoli Tecnici Rispettati

1. **Badge Glow**: Nessuna modifica ai componenti badge
2. **Ghost Crop**: CheckFormModal e ImageCropperModal invariati
3. **Funnel /inizia**: Nessuna modifica
4. **Modulo Nutrizione**: Nessuna modifica
5. **Staff Access**: Redirect confermato su /diario

---

## Video Player - Supporto Multi-Formato

### YouTube Shorts (9:16)

```typescript
// URL format: youtube.com/shorts/VIDEO_ID
const ShortsPlayer = ({ videoId }: { videoId: string }) => (
  <div className="aspect-[9/16] max-h-[80vh] mx-auto">
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      className="w-full h-full rounded-xl"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
      allowFullScreen
    />
  </div>
);
```

### YouTube Standard (16:9)

```typescript
// URL format: youtube.com/watch?v=VIDEO_ID o youtu.be/VIDEO_ID
const StandardPlayer = ({ videoId }: { videoId: string }) => (
  <div className="aspect-video w-full">
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      className="w-full h-full rounded-xl"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
      allowFullScreen
    />
  </div>
);
```

---

## Struttura Dati Video (Esempio Inserimento)

```sql
INSERT INTO exercise_videos (title, category, trainer, video_url, video_type) VALUES
-- Martina - Kettlebell
('Stacchi con Kettlebell', 'kettlebell', 'martina', 'https://youtube.com/shorts/XXX', 'shorts'),
('Goblet Squat Kettlebell', 'kettlebell', 'martina', 'https://youtube.com/shorts/XXX', 'shorts'),

-- Martina - Manubri  
('Stacchi Rumeni Manubri', 'manubri', 'martina', 'https://youtube.com/shorts/M-ue6r1gMcU', 'shorts'),
('Alzate Laterali Manubri', 'manubri', 'martina', 'https://youtube.com/shorts/kAmDh4QVvoA', 'shorts'),

-- Martina - Corpo Libero
('Sit Up Butterfly', 'corpo_libero', 'martina', 'https://youtube.com/shorts/sGGSN6ozpSw', 'shorts'),
('Mountain Climbers', 'corpo_libero', 'martina', 'https://youtube.com/shorts/wcl4bpMDBr0', 'shorts'),

-- Martina - Mobilita
('Routine Completa Foam Roller', 'mobilita', 'martina', 'https://youtu.be/CmIWyGE1q9k', 'standard'),
('Mobilita a Corpo Libero', 'mobilita', 'martina', 'https://youtu.be/y3c44hq9N8E', 'standard');

-- Maso videos da aggiungere con stessa struttura
```

---

## Riepilogo Navigazione Finale

| Icona Dock | Destinazione | Contenuto |
|------------|--------------|-----------|
| Diario | `/diario` | Check giornalieri + link a gestione check mensili |
| Nutrizione | `/nutrizione` | Upload/download PDF dieta |
| Allenamento | `/allenamento` | Archivio video esercizi |
| Progressi | `/progressi` | Grafici peso + comparazione foto |

Accesso Settings/Profilo tramite icona nell'header delle pagine.
