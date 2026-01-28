

# Piano: Import Video Completo + Fix Shorts Compatibilità

## Analisi del Documento

Ho estratto **tutti i video con URL validi** dalla lista. Ecco il riepilogo:

### Video MASO con URL Completi

| Categoria | Numero Video | Tipo |
|-----------|--------------|------|
| Manubri Playlist | 8 | standard |
| Manubri Shorts/3Ways | 24 | shorts |
| Bilanciere | 18 | standard |
| Loop Band / Elastici | 8 | standard |
| Mobilità / Stretching | 24 | standard |
| Macchinari / Gym | 55+ | standard |
| Kettlebell | 6 | standard |
| Corpo Libero | 46 | standard |
| **Totale Maso** | **~189** | |

### Video MARTINA con URL Completi (da Page 8)

| Categoria | Numero Video | Tipo |
|-----------|--------------|------|
| Mobilità / Stretching | 20 | shorts + standard |
| Corpo Libero | 24 | shorts |
| **Totale Martina** | **~44** | |

### Video SENZA URL (solo "Video" o "Watch")

Circa 100 esercizi di Maso nelle sezioni Kettlebell e Manubri hanno solo placeholder "Watch" senza URL reali. Questi NON verranno inseriti.

---

## Parte 1: Fix Shorts - Compatibilità Massima

Il problema degli Shorts che non si vedono nell'anteprima è dovuto alle restrizioni di YouTube sugli iframe. Implementeremo:

### Modifiche a `VideoPlayerModal.tsx`

```typescript
// Parametri ottimizzati per massima compatibilità
const shortsParams = new URLSearchParams({
  autoplay: '1',
  rel: '0',
  modestbranding: '1',
  playsinline: '1',
  mute: '1',              // NUOVO: molti browser bloccano autoplay con audio
  enablejsapi: '1',       // NUOVO: consente controlli
  origin: window.location.origin,  // NUOVO: specifica origine
});

// Uso youtube-nocookie.com per privacy
src={`https://www.youtube-nocookie.com/embed/${videoId}?${shortsParams}`}
```

### Modifiche Chiave

1. **`mute=1`**: I browser moderni bloccano l'autoplay con audio. Il video parte muto e l'utente può attivare l'audio.

2. **`youtube-nocookie.com`**: Dominio privacy-enhanced che evita alcuni blocchi di tracking.

3. **`origin`**: Specifica l'origine esatta per sicurezza CORS.

4. **`enablejsapi=1`**: Abilita l'API JavaScript per gestione eventi.

---

## Parte 2: Import Database - Solo Nuovi Video

### Strategia di Insert

```sql
-- Uso INSERT con ON CONFLICT DO NOTHING
-- Conflitto basato su (title, trainer) o video_url

INSERT INTO exercise_videos (title, category, trainer, video_url, video_type, sort_order)
VALUES (...)
ON CONFLICT (video_url) DO NOTHING;
```

### Nuovo Indice Univoco

Prima di inserire, creiamo un indice univoco su `video_url` per prevenire duplicati:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS exercise_videos_url_unique 
ON exercise_videos(video_url);
```

### Video da Inserire

#### Maso - Manubri Playlist (8 video standard)

| Titolo | URL |
|--------|-----|
| Back Lunges | youtube.com/watch?v=yp7bGETJSBY |
| Curl | youtube.com/watch?v=55VCQp-lV0k |
| Deadlift | youtube.com/watch?v=pr8xWzwuO3A |
| Press | youtube.com/watch?v=eHV-deENTDc |
| Row | youtube.com/watch?v=Y6QDUOA4oUc |
| Squat | youtube.com/watch?v=5TKbe55T_U4 |
| Triceps Extension | youtube.com/watch?v=Fcv4orfBxTA |
| Upright Row | youtube.com/watch?v=J72c9jOc_0M |

#### Maso - Manubri Shorts (24 video shorts)

| Titolo | URL |
|--------|-----|
| Reverse Fly | youtube.com/shorts/n94-KZ15SXI |
| Upright Row | youtube.com/shorts/5rdRxULkQyc |
| Triceps Extension | youtube.com/shorts/IehhyupTFzI |
| Sumo Squat | youtube.com/shorts/Vs-p9Ahocv8 |
| SDHP | youtube.com/shorts/iyVa786uTMc |
| Step Up | youtube.com/shorts/lDCpuHeYlF0 |
| Squat | youtube.com/shorts/Yk_0rcwJIZU |
| Situps | youtube.com/shorts/tj0J4X9KWww |
| Single Leg Deadlift | youtube.com/shorts/495-KA96xpg |
| Row | youtube.com/shorts/qniV-PtoNXg |
| Romanian Deadlift | youtube.com/shorts/VP7cxb87Lns |
| Pushup | youtube.com/shorts/bSDoTMeZMII |
| Push Press | youtube.com/shorts/6EGOb1KRum4 |
| Press | youtube.com/shorts/d8pHS_jX4RE |
| Plank | youtube.com/shorts/sfzFg_Z2gB8 |
| One Arm Row | youtube.com/shorts/drnGd6YCASE |
| Frontal Raises | youtube.com/shorts/n5xQWndDfSc |
| Front Lunges | youtube.com/shorts/jqJN4tDjfpQ |
| Floor Press | youtube.com/shorts/hmC0JHdEfjA |
| Deadlift | youtube.com/shorts/rIZIw8ZmztI |
| Curl | youtube.com/shorts/oWVStCiTwwA |
| Crunch | youtube.com/shorts/iUZ4MISyzME |
| Burpees | youtube.com/shorts/S5rFcEKwd88 |
| Back Lunges | youtube.com/shorts/S5rFcEKwd88 |

#### Maso - Bilanciere (18 video)

Affondi, Back Squat, Curl, Chinup, Dip, Front Squat, Overhead Squat, Panca Piana, Push Press, Press, Pendlay Row, Reverse Row, Stacco da Terra, Stacco Sumo, Thrusters

#### Maso - Loop Band / Elastici (8 video)

Già inseriti nel database.

#### Maso - Mobilità / Stretching (24 video)

Già inseriti nel database.

#### Maso - Gym / Macchinari (55+ video)

Tutti con URL validi dal documento.

#### Maso - Kettlebell (6 video con URL)

KB ONE ARM SWING, KB MUSCLE CLEAN, KB RACK LUNGES, KB DH CLEAN, KB POWER CLEAN, KB DH SNATCH

#### Maso - Corpo Libero (46 video)

Tutti i bodyweight exercises con URL validi.

#### Martina - Mobilità (20 video)

Shorts di stretching e routine.

#### Martina - Corpo Libero (24 video)

Tutti con URL shorts validi.

---

## Parte 3: Modifiche ai File

### File da Modificare

| File | Modifica |
|------|----------|
| `src/components/VideoPlayerModal.tsx` | Parametri iframe per compatibilità massima |
| Database | INSERT di ~200 nuovi video |

### File NON Modificati

- Badge system
- Ghost Crop
- Nutrizione
- BottomDock
- Progressi

---

## Riepilogo Finale

### Archivio Video Atteso Post-Import

| Categoria | Prima | Dopo |
|-----------|-------|------|
| Manubri | ~15 | ~47 |
| Corpo Libero | ~21 | ~91 |
| Kettlebell | ~4 | ~10 |
| Bilanciere | ~13 | ~31 |
| Macchinari | ~7 | ~62 |
| Elastici | ~3 | ~11 |
| Mobilità | ~12 | ~56 |
| TRX | ~1 | ~1 |
| **TOTALE** | **~68** | **~309** |

### Fix Shorts

Il player utilizzerà:
- `youtube-nocookie.com` per privacy
- `mute=1` per autoplay garantito
- `origin` per CORS
- Parametri ottimizzati per embed

---

## Sezione Tecnica

### VideoPlayerModal.tsx - Nuovi Parametri

```typescript
const getShortsEmbedUrl = (videoId: string) => {
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    mute: '1',
    enablejsapi: '1',
    loop: '1',
    playlist: videoId,
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
};
```

### SQL Insert - Esempio

```sql
-- Maso Manubri Shorts
INSERT INTO exercise_videos (title, category, trainer, video_url, video_type, sort_order)
SELECT * FROM (VALUES
  ('Reverse Fly', 'manubri', 'maso', 'https://www.youtube.com/shorts/n94-KZ15SXI', 'shorts', 100),
  ('Upright Row Shorts', 'manubri', 'maso', 'https://www.youtube.com/shorts/5rdRxULkQyc', 'shorts', 101),
  -- ... altri video
) AS v(title, category, trainer, video_url, video_type, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM exercise_videos e 
  WHERE e.video_url = v.video_url
);
```

