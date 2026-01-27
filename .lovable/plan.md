

# Piano di Implementazione: Modulo Avanzato Foto con Ghost Overlay

## Riepilogo Obiettivi

| Funzionalita | Stato Attuale | Azione |
|--------------|---------------|--------|
| Caricamento da galleria mobile | Bloccato (`capture="environment"`) | Rimuovere attributo |
| Ritaglio immagini | Non esiste | Implementare con react-easy-crop |
| Compressione client-side | Non esiste | Implementare con Canvas API |
| Ghost Overlay (riferimento Check #1) | Non esiste | Implementare overlay trasparente |
| Confronto coerente nel widget | Parzialmente | Usare versioni ritagliate |

---

## Architettura Soluzione

```text
+-------------------+     +-------------------+     +-------------------+
|  Input File       | --> |  Image Cropper    | --> |  Compressione     |
|  (senza capture)  |     |  + Ghost Overlay  |     |  + Upload         |
+-------------------+     +-------------------+     +-------------------+
       |                        |                         |
       v                        v                         v
   Galleria/Camera          Aspect 3:4              Blob ottimizzato
   a scelta utente          Griglia 3x3             Max 1200px, 85% quality
                            Opacita 35%
```

---

## Dettagli Tecnici

### 1. Nuova Dipendenza

Installare `react-easy-crop`:

```bash
npm install react-easy-crop
```

### 2. Nuovo Componente: ImageCropperModal.tsx

Creare `src/components/checks/ImageCropperModal.tsx`:

```typescript
// Componente principale per ritaglio foto
interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;                    // Blob URL dell'immagine selezionata
  ghostImageSrc?: string | null;       // URL foto Check #1 (se checkNumber > 1)
  aspectRatio?: number;                // Default 3/4
  onCropComplete: (croppedBlob: Blob) => void;
}

// Funzionalita:
// - Cropper con area fissa 3:4
// - Griglia 3x3 sovrapposta
// - Ghost overlay al 35% opacita se ghostImageSrc presente
// - Slider per zoom
// - Pulsanti Annulla / Conferma
```

### 3. Utility: imageCompression.ts

Creare `src/lib/imageCompression.ts`:

```typescript
// Funzione per comprimere e ridimensionare immagini
export const compressImage = async (
  blob: Blob,
  maxWidth: number = 1200,
  maxHeight: number = 1600,
  quality: number = 0.85
): Promise<Blob> => {
  // 1. Crea immagine da blob
  // 2. Calcola dimensioni mantenendo aspect ratio
  // 3. Disegna su canvas ridimensionato
  // 4. Esporta come JPEG con qualita specificata
  // 5. Ritorna Blob compresso
};

// Funzione per creare crop area
export const getCroppedImg = (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> => {
  // 1. Carica immagine
  // 2. Crea canvas con dimensioni crop
  // 3. Disegna porzione ritagliata
  // 4. Ritorna Blob
};
```

### 4. Modifica CheckFormModal.tsx

Aggiornare la gestione foto:

**4.1. Rimuovere attributo capture:**
```typescript
// PRIMA (linea 114):
capture="environment"

// DOPO:
// Rimuovere completamente l'attributo
```

**4.2. Aggiungere stato per cropper:**
```typescript
const [cropperState, setCropperState] = useState<{
  isOpen: boolean;
  imageSrc: string | null;
  photoType: 'front' | 'side' | 'back' | null;
}>({ isOpen: false, imageSrc: null, photoType: null });
```

**4.3. Aggiungere prop per Check #1 photos:**
```typescript
interface CheckFormModalProps {
  // ... props esistenti
  firstCheckData?: UserCheck | null;  // Dati del Check #1 per ghost overlay
}
```

**4.4. Flusso file selection:**
```typescript
const handleFileSelect = (file: File, photoType: 'front' | 'side' | 'back') => {
  const objectUrl = URL.createObjectURL(file);
  setCropperState({
    isOpen: true,
    imageSrc: objectUrl,
    photoType,
  });
};

const handleCropComplete = async (croppedBlob: Blob) => {
  const compressed = await compressImage(croppedBlob);
  const file = new File([compressed], `${cropperState.photoType}.jpg`, { type: 'image/jpeg' });
  
  // Aggiorna stato in base a photoType
  switch (cropperState.photoType) {
    case 'front':
      setPhotoFront(file);
      setPhotoFrontPreview(URL.createObjectURL(compressed));
      break;
    // ... altri casi
  }
  
  setCropperState({ isOpen: false, imageSrc: null, photoType: null });
};
```

### 5. Logica Ghost Overlay

Nel ImageCropperModal, se `ghostImageSrc` e presente:

```typescript
// Render ghost overlay sotto il cropper
{ghostImageSrc && (
  <div 
    className="absolute inset-0 pointer-events-none z-0"
    style={{ opacity: 0.35 }}
  >
    <img 
      src={ghostImageSrc} 
      alt="Reference" 
      className="w-full h-full object-contain"
    />
  </div>
)}
```

### 6. Modifica useUserChecks.ts

Aggiungere metodo per ottenere Check #1:

```typescript
// Nuovo metodo per ottenere il primo check con foto
const getFirstCheckWithPhotos = useCallback(() => {
  return checks.find(c => 
    c.check_number === 1 && 
    (c.photo_front_url || c.photo_side_url || c.photo_back_url)
  ) || null;
}, [checks]);

// Aggiungere al return
return {
  // ... esistenti
  getFirstCheckWithPhotos,
};
```

### 7. Modifica Checks.tsx

Passare dati Check #1 al modal:

```typescript
const Checks = () => {
  const { 
    // ... esistenti
    getFirstCheckWithPhotos 
  } = useUserChecks();
  
  const firstCheck = getFirstCheckWithPhotos();

  return (
    // ...
    <CheckFormModal
      // ... props esistenti
      firstCheckData={selectedCheck?.checkNumber > 1 ? firstCheck : null}
    />
  );
};
```

---

## Componente ImageCropperModal - Struttura UI

```text
+------------------------------------------+
|           Ritaglia Foto Fronte           |  <- Header
+------------------------------------------+
|                                          |
|    +------------------------------+      |
|    |                              |      |
|    |   [Ghost Image @ 35%]        |      |  <- Ghost overlay
|    |                              |      |
|    |   +----------------------+   |      |
|    |   |                      |   |      |
|    |   |   CROPPER AREA       |   |      |  <- Area di ritaglio
|    |   |   (Aspect 3:4)       |   |      |
|    |   |   [Griglia 3x3]      |   |      |
|    |   |                      |   |      |
|    |   +----------------------+   |      |
|    |                              |      |
|    +------------------------------+      |
|                                          |
|    [-------- Zoom Slider --------]       |
|                                          |
|    [Annulla]              [Conferma]     |
+------------------------------------------+
```

---

## File da Creare/Modificare

| File | Azione |
|------|--------|
| `package.json` | Aggiungere `react-easy-crop` |
| `src/lib/imageCompression.ts` | Nuovo - utility compressione |
| `src/components/checks/ImageCropperModal.tsx` | Nuovo - cropper con ghost |
| `src/components/checks/CheckFormModal.tsx` | Modificare - integrare cropper |
| `src/hooks/useUserChecks.ts` | Aggiungere `getFirstCheckWithPhotos` |
| `src/pages/Checks.tsx` | Passare firstCheckData al modal |

---

## Flusso Utente Completo

1. Utente apre Check #5
2. Clicca su "Fronte" per caricare foto
3. Sistema operativo mostra scelta: Scatta Foto / Libreria
4. Utente seleziona immagine
5. Si apre ImageCropperModal con:
   - Immagine selezionata in primo piano
   - Foto Fronte del Check #1 in trasparenza (35%)
   - Griglia 3x3 per allineamento
6. Utente sposta/scala fino ad allineare le sagome
7. Clicca "Conferma"
8. Immagine viene ritagliata e compressa (max 1200px, 85% qualita)
9. Preview aggiornata nel form
10. Al salvataggio, viene caricata solo la versione finale

---

## Vantaggi per 362gradi

- **Coerenza Visiva**: Confronti "Prima vs Dopo" mostrano cambiamenti reali
- **Facilita d'Uso**: Guida visiva aiuta utenti a posizionarsi correttamente
- **Performance**: Compressione riduce tempi di upload e costi storage
- **Flessibilita**: Scelta tra galleria e camera soddisfa tutti i casi d'uso

