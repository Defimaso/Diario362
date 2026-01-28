
# Piano di Implementazione: Fix Totale Visibilità Video e Archivio

## Analisi Situazione Attuale

### Stato del Database
- **Martina**: ~60 video inseriti con URL YouTube Shorts funzionanti
- **Maso**: 0 video nel database - TUTTI mancanti

### Componenti Funzionanti
- `VideoPlayerModal.tsx`: Usa correttamente il formato embed `https://www.youtube.com/embed/{id}?autoplay=1`
- `extractVideoId()`: Gestisce correttamente tutti i formati YouTube (shorts, watch?v=, youtu.be)
- `BottomDock`: Configurato con le 4 icone corrette
- `Progressi`: Mostra solo analytics (grafici e foto)

---

## Parte 1: Popolamento Database con Video di Maso

### Video da Inserire (estratti dal documento)

#### Bilanciere (5 video)
| Titolo | URL | Tipo |
|--------|-----|------|
| Pendlay Row | youtube.com/watch?v=vrYacoEbj38 | standard |
| Reverse Row | youtube.com/watch?v=EbQIbrUNsGM | standard |
| Stacco da Terra | youtube.com/watch?v=dIAOJD_Abhk | standard |
| Stacco Sumo | youtube.com/watch?v=4xJcNYQoc08 | standard |
| Thrusters | youtube.com/watch?v=orMtEDrQBMw | standard |

#### Loop Band / Elastici (8 video)
| Titolo | URL | Tipo |
|--------|-----|------|
| Band Press | youtube.com/watch?v=jGoTff9Kk1k | standard |
| Band Thruster | youtube.com/watch?v=g4pIkPuB_pM | standard |
| Band Affondi | youtube.com/watch?v=YMhUsQhCT2Q | standard |
| Band Row | youtube.com/watch?v=gMjikWoCvR8 | standard |
| Band Pushup | youtube.com/watch?v=CsMPYgApahs | standard |
| Band Front Squat | youtube.com/watch?v=QjE7bqi4oBg | standard |
| Band Good Morning | youtube.com/watch?v=IeQiWgRrKS0 | standard |
| Band Squat | youtube.com/watch?v=EaWpZHMlfqs | standard |

#### Stretching / Mobilita (22 video)
| Titolo | URL |
|--------|-----|
| Psoas | youtube.com/watch?v=U7q0pBMksM4 |
| Psoas Torsione | youtube.com/watch?v=gE1GEaNMO8s |
| Piriforme | youtube.com/watch?v=fqBe8_KRkkU |
| Torsione Tronco | youtube.com/watch?v=Yib3w3w8q5Y |
| Lombari | youtube.com/watch?v=uHJaBVEv46k |
| Gatto Mucca | youtube.com/watch?v=YnZIqN_4VRk |
| Dorsali | youtube.com/watch?v=0Q6KClsElJQ |
| Kneel Torsion | youtube.com/watch?v=nXLZLr9SCOA |
| Adduttori | youtube.com/watch?v=TXLfnSaJFcY |
| Adduttori 2 | youtube.com/watch?v=dVNdx_ldvSY |
| Child Pose | youtube.com/watch?v=KzFIo43x7GY |
| Child Pose 2 | youtube.com/watch?v=pNipg9tYNnw |
| Side Bretzel | youtube.com/watch?v=54sy1_0ntrY |
| Quads | youtube.com/watch?v=lX1VnsN07jQ |
| Collo | youtube.com/watch?v=cWIkiWnWWfM |
| Lombari 2 | youtube.com/watch?v=OrYAzT5c9s0 |
| Glutei | youtube.com/watch?v=psHXMNUAbDs |
| Torsione | youtube.com/watch?v=G78br_pWYSA |
| Pike | youtube.com/watch?v=vVkcNr1Z4AE |
| Straddle | youtube.com/watch?v=DARSNYZ-t28 |
| Spine Extension | youtube.com/watch?v=ES6Clie-NUg |
| The Needle | youtube.com/watch?v=FUeKyRtqSBA |
| Open Book | youtube.com/watch?v=plLlk842MOU |
| Best Stretch | youtube.com/watch?v=eWQlAGKIShY |

#### Gym / Macchinari (55+ video)
Tutti i video con URL completi dal documento (Aperture Laterali, Arnold Press, Aperture Frontali, Abductor Machine, Adductor Machine, Back Squat, Bike, Bulgarian Split Squat, etc.)

### SQL di Inserimento

```sql
-- Maso - Bilanciere (standard videos)
INSERT INTO exercise_videos (title, category, trainer, video_url, video_type, sort_order) VALUES
('Pendlay Row', 'bilanciere', 'maso', 'https://www.youtube.com/watch?v=vrYacoEbj38', 'standard', 1),
('Reverse Row', 'bilanciere', 'maso', 'https://www.youtube.com/watch?v=EbQIbrUNsGM', 'standard', 2),
('Stacco da Terra', 'bilanciere', 'maso', 'https://www.youtube.com/watch?v=dIAOJD_Abhk', 'standard', 3),
('Stacco Sumo', 'bilanciere', 'maso', 'https://www.youtube.com/watch?v=4xJcNYQoc08', 'standard', 4),
('Thrusters Bilanciere', 'bilanciere', 'maso', 'https://www.youtube.com/watch?v=orMtEDrQBMw', 'standard', 5);

-- Maso - Loop Band / Elastici (standard videos)
INSERT INTO exercise_videos (title, category, trainer, video_url, video_type, sort_order) VALUES
('Band Press', 'elastici', 'maso', 'https://www.youtube.com/watch?v=jGoTff9Kk1k', 'standard', 1),
('Band Thruster', 'elastici', 'maso', 'https://www.youtube.com/watch?v=g4pIkPuB_pM', 'standard', 2),
('Band Affondi', 'elastici', 'maso', 'https://www.youtube.com/watch?v=YMhUsQhCT2Q', 'standard', 3),
('Band Row', 'elastici', 'maso', 'https://www.youtube.com/watch?v=gMjikWoCvR8', 'standard', 4),
('Band Pushup', 'elastici', 'maso', 'https://www.youtube.com/watch?v=CsMPYgApahs', 'standard', 5),
('Band Front Squat', 'elastici', 'maso', 'https://www.youtube.com/watch?v=QjE7bqi4oBg', 'standard', 6),
('Band Good Morning', 'elastici', 'maso', 'https://www.youtube.com/watch?v=IeQiWgRrKS0', 'standard', 7),
('Band Squat', 'elastici', 'maso', 'https://www.youtube.com/watch?v=EaWpZHMlfqs', 'standard', 8);

-- Maso - Stretching / Mobilita (standard videos)
INSERT INTO exercise_videos (title, category, trainer, video_url, video_type, sort_order) VALUES
('Psoas', 'mobilita', 'maso', 'https://www.youtube.com/watch?v=U7q0pBMksM4', 'standard', 1),
('Psoas Torsione', 'mobilita', 'maso', 'https://www.youtube.com/watch?v=gE1GEaNMO8s', 'standard', 2),
('Piriforme', 'mobilita', 'maso', 'https://www.youtube.com/watch?v=fqBe8_KRkkU', 'standard', 3),
-- ... altri 19 video di mobilita ...
('Best Stretch', 'mobilita', 'maso', 'https://www.youtube.com/watch?v=eWQlAGKIShY', 'standard', 22);

-- Maso - Gym / Macchinari (standard videos)
INSERT INTO exercise_videos (title, category, trainer, video_url, video_type, sort_order) VALUES
('Aperture Laterali', 'macchinari', 'maso', 'https://www.youtube.com/watch?v=qKHqP3koS1A', 'standard', 1),
('Arnold Press', 'macchinari', 'maso', 'https://www.youtube.com/watch?v=fXfTVqyxYXM', 'standard', 2),
-- ... altri ~53 video di macchinari ...
```

---

## Parte 2: Verifica Sistema Embed

### Flusso Conversione URL (gia implementato correttamente)

```text
URL Originale                         extractVideoId()         Embed URL
------------------------------        ----------------         --------------------------
youtube.com/shorts/ABC123        -->  "ABC123"            -->  youtube.com/embed/ABC123
youtube.com/watch?v=XYZ789       -->  "XYZ789"            -->  youtube.com/embed/XYZ789
youtu.be/DEF456                  -->  "DEF456"            -->  youtube.com/embed/DEF456
```

### Codice Esistente (FUNZIONANTE)

```typescript
// useExerciseVideos.ts - linea 97-111
const extractVideoId = (url: string): string | null => {
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) return shortsMatch[1];

  const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return watchMatch[1];

  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];

  return null;
};

// VideoPlayerModal.tsx - linea 66
src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
```

Nessuna modifica necessaria al sistema di embed.

---

## Parte 3: Conferma Navigazione

### Dock Attuale (CORRETTO)

| Posizione | Icona | Label | Rotta | Contenuto |
|-----------|-------|-------|-------|-----------|
| 1 | ClipboardCheck | Diario | /diario | Check giornalieri |
| 2 | Apple | Nutrizione | /nutrizione | PDF Dieta |
| 3 | Dumbbell | Allenamento | /allenamento | Archivio Video |
| 4 | TrendingUp | Progressi | /progressi | Grafici + Foto |

Nessuna modifica necessaria.

### Progressi Page (CORRETTO)

Mostra solo:
- WeightChart (grafico peso)
- PhotoComparison (confronto foto)
- HistoryTable (storico)

Nessuna modifica necessaria.

---

## Parte 4: Riepilogo Modifiche

### Database Migration

Una singola migration SQL per inserire tutti i video di Maso (~90 video) nelle categorie:

| Categoria | Trainer | Numero Video | Tipo |
|-----------|---------|--------------|------|
| bilanciere | maso | 5 | standard |
| elastici | maso | 8 | standard |
| mobilita | maso | 22 | standard |
| macchinari | maso | 55 | standard |
| **Totale Maso** | | **~90** | |

### File da Modificare

| File | Azione |
|------|--------|
| Database Migration | Nuovo - INSERT di ~90 video Maso |

### File NON Modificati (preservati)

- Badge system: `BadgeGallery.tsx`, `BadgeProgress.tsx`, `BadgeUnlockAnimation.tsx`
- Ghost Crop: `CheckFormModal.tsx`, `ImageCropperModal.tsx`
- Nutrizione: `Nutrizione.tsx`, `useUserDiet.ts`
- BottomDock: gia configurato correttamente
- VideoPlayerModal: gia funzionante
- extractVideoId(): gia funzionante
- Progressi: gia configurato correttamente

---

## Risultato Finale

### Archivio Video Completo

| Categoria | Maso | Martina | Totale |
|-----------|------|---------|--------|
| Corpo Libero | 46 | 21 | 67 |
| Manubri | 75 | 15 | 90 |
| Kettlebell | 25 | 4 | 29 |
| Bilanciere | 5 | 8 | 13 |
| Macchinari | 55 | 7 | 62 |
| Elastici | 8 | 3 | 11 |
| Mobilita | 22 | 12 | 34 |
| TRX | 0 | 1 | 1 |
| **TOTALE** | **~236** | **~71** | **~307** |

### Navigazione Funzionante

```text
[Diario] -> Check giornalieri
[Nutrizione] -> PDF Dieta  
[Allenamento] -> 300+ Video (Maso + Martina)
[Progressi] -> Solo grafici e foto (NO check form)
```

### Video Player

- Shorts (9:16): Per video YouTube Shorts
- Standard (16:9): Per video YouTube lunghi
- Autoplay: Abilitato per tutti
