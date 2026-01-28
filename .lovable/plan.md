

# Piano di Implementazione: Restyling Badge "Kawaii Glow"

## Riepilogo Cambiamenti

| Aspetto | Stato Attuale | Nuovo Stato |
|---------|---------------|-------------|
| Stile icone | Lucide icons (vettoriali, astratte) | Emoji Kawaii (colorate, arrotondate) |
| Animali | Colibri, Libellula, Geco... | Leone, Tartaruga, Ape... (nuova lista) |
| Layout mobile | 4 colonne | 3 colonne |
| Effetto glow | Solo badge corrente | Tutti i badge sbloccati |
| Badge bloccati | Opacita ridotta | Grayscale + 40% opacita |
| Animazione sblocco | Scala + rotazione | Bounce animation |

---

## Nuova Mappatura dei 20 Animali

La lista richiesta con emoji garantite cross-platform:

| ID | Nome | Emoji | Colore Glow |
|----|------|-------|-------------|
| 1 | Leone | 🦁 | Arancione/Dorato |
| 2 | Tartaruga | 🐢 | Verde |
| 3 | Ape | 🐝 | Giallo |
| 4 | Formica | 🐜 | Rosso scuro |
| 5 | Aquila | 🦅 | Marrone/Oro |
| 6 | Lupo | 🐺 | Grigio/Argento |
| 7 | Farfalla | 🦋 | Blu/Viola |
| 8 | Delfino | 🐬 | Azzurro |
| 9 | Tigre | 🐯 | Arancione |
| 10 | Elefante | 🐘 | Grigio |
| 11 | Ghepardo | 🐆 | Oro/Ambra |
| 12 | Scimmia | 🐒 | Marrone |
| 13 | Cavallo | 🐎 | Marrone/Oro |
| 14 | Gufo | 🦉 | Viola |
| 15 | Canguro | 🦘 | Arancione |
| 16 | Orso | 🐻 | Marrone |
| 17 | Pavone | 🦚 | Verde/Blu |
| 18 | Squalo | 🦈 | Blu scuro |
| 19 | Cane | 🐕 | Marrone/Dorato |
| 20 | Toro | 🐂 | Rosso/Oro |

---

## Modifiche Tecniche

### 1. Aggiornamento `src/lib/badges.ts`

Sostituire completamente la lista ELITE_BADGES con i nuovi 20 animali:

```typescript
export const ELITE_BADGES: Badge[] = [
  { id: 1, name: 'Leone', emoji: '🦁', ... },
  { id: 2, name: 'Tartaruga', emoji: '🐢', ... },
  // ... fino al Toro
];
```

Ogni badge manterra la stessa struttura:
- requiredStreak progressivi (1, 2, 4, 6, 7, 15, 30, 45, 60, 75, 95, 115, 135, 155, 175, 205, 235, 265, 295, 300)
- Fasi: immediate (1-5), consolidation (6-10), transformation (11-15), mastery (16-20)

### 2. Nuovo File: `src/lib/badgeEmojis.ts`

Sostituisce `badgeIcons.ts` con mappatura emoji e colori glow:

```typescript
export interface BadgeStyle {
  emoji: string;
  glowColor: string;  // HSL color per il glow
  name: string;
}

export const BADGE_STYLES: Record<number, BadgeStyle> = {
  1: { emoji: '🦁', glowColor: 'hsla(35, 100%, 50%, 0.6)', name: 'Leone' },
  2: { emoji: '🐢', glowColor: 'hsla(120, 60%, 40%, 0.6)', name: 'Tartaruga' },
  3: { emoji: '🐝', glowColor: 'hsla(50, 100%, 50%, 0.6)', name: 'Ape' },
  // ... tutti i 20 animali
};

export const getBadgeEmoji = (badgeId: number): string => {
  return BADGE_STYLES[badgeId]?.emoji || '⭐';
};

export const getBadgeGlow = (badgeId: number): string => {
  return BADGE_STYLES[badgeId]?.glowColor || 'hsla(45, 100%, 50%, 0.5)';
};
```

### 3. Aggiornamento `src/lib/badgeSpirits.ts`

Riscrivere i contenuti per i nuovi 20 animali con:
- Traits (4 qualita positive)
- Description (descrizione spirito)
- unlockMessage (messaggio per badge bloccati)

Esempio:
```typescript
1: {
  traits: ['Coraggio', 'Leadership', 'Protezione', 'Nobilta'],
  description: 'Il Leone e il re della savana. Comanda con...',
  unlockMessage: 'Completa il tuo primo check-in per risvegliare...',
},
```

### 4. Aggiornamento `src/components/BadgeGallery.tsx`

**4.1 Layout 3 colonne:**
```typescript
// Da:
<div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">

// A:
<div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4">
```

**4.2 Emoji invece di icone:**
```typescript
import { getBadgeEmoji, getBadgeGlow } from '@/lib/badgeEmojis';

// Nel BadgeCard:
const emoji = getBadgeEmoji(badge.id);
const glowColor = getBadgeGlow(badge.id);

// Render:
<div 
  className={cn(
    "w-16 h-16 sm:w-14 sm:h-14 rounded-full flex items-center justify-center",
    isUnlocked ? "border-2" : "grayscale opacity-40"
  )}
  style={isUnlocked ? {
    borderColor: glowColor.replace('0.6', '1'),
    boxShadow: `0 0 20px ${glowColor}`,
  } : undefined}
>
  <span className="text-3xl sm:text-2xl">{emoji}</span>
</div>
```

**4.3 Rimuovere Lock overlay per badge bloccati:**
Invece dell'icona Lock sovrapposta, usare solo grayscale + opacita.

### 5. Aggiornamento `src/components/BadgeProgress.tsx`

Sostituire Lucide icons con emoji:

```typescript
import { getBadgeEmoji, getBadgeGlow } from '@/lib/badgeEmojis';

// Render badge corrente:
<div 
  className="w-14 h-14 rounded-full flex items-center justify-center"
  style={{ 
    boxShadow: `0 0 25px ${getBadgeGlow(currentBadge.id)}`,
    border: `2px solid ${getBadgeGlow(currentBadge.id).replace('0.6', '1')}`
  }}
>
  <span className="text-4xl">{getBadgeEmoji(currentBadge.id)}</span>
</div>
```

### 6. Aggiornamento `src/components/SpiritAnimalDrawer.tsx`

Emoji grande nel drawer:

```typescript
import { getBadgeEmoji, getBadgeGlow } from '@/lib/badgeEmojis';

// Badge Icon section:
<div 
  className={cn(
    "w-28 h-28 rounded-full flex items-center justify-center",
    isUnlocked ? "" : "grayscale opacity-40"
  )}
  style={isUnlocked ? {
    boxShadow: `0 0 40px ${getBadgeGlow(badge.id)}`,
    border: `3px solid ${getBadgeGlow(badge.id).replace('0.6', '1')}`
  } : undefined}
>
  <span className="text-6xl">{getBadgeEmoji(badge.id)}</span>
</div>
```

### 7. Aggiornamento `src/components/BadgeUnlockAnimation.tsx`

Aggiungere bounce animation al momento dello sblocco:

```typescript
import { getBadgeEmoji, getBadgeGlow } from '@/lib/badgeEmojis';

// Animazione bounce:
<motion.div
  initial={{ scale: 0, rotate: -180 }}
  animate={{ 
    scale: [0, 1.3, 0.9, 1.1, 1],  // Bounce effect
    rotate: 0 
  }}
  transition={{ 
    duration: 1,
    times: [0, 0.4, 0.6, 0.8, 1],
    ease: "easeOut"
  }}
  style={{
    filter: `drop-shadow(0 0 30px ${getBadgeGlow(badge.id)})`
  }}
>
  <span className="text-8xl">{getBadgeEmoji(badge.id)}</span>
</motion.div>
```

### 8. Aggiornamento `src/index.css`

Aggiungere utility classes per glow colorati:

```css
@layer utilities {
  .emoji-glow-gold {
    filter: drop-shadow(0 0 15px hsla(45, 100%, 50%, 0.6));
  }
  
  .emoji-glow-green {
    filter: drop-shadow(0 0 15px hsla(120, 60%, 40%, 0.6));
  }
  
  /* Bounce animation keyframes */
  @keyframes badge-bounce {
    0% { transform: scale(0); }
    40% { transform: scale(1.3); }
    60% { transform: scale(0.9); }
    80% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  .animate-badge-bounce {
    animation: badge-bounce 0.8s ease-out;
  }
}
```

### 9. Aggiornamento `tailwind.config.ts`

Aggiungere keyframe bounce:

```typescript
keyframes: {
  // ... esistenti
  "badge-bounce": {
    "0%": { transform: "scale(0)" },
    "40%": { transform: "scale(1.3)" },
    "60%": { transform: "scale(0.9)" },
    "80%": { transform: "scale(1.1)" },
    "100%": { transform: "scale(1)" },
  },
},
animation: {
  // ... esistenti
  "badge-bounce": "badge-bounce 0.8s ease-out",
}
```

---

## Struttura UI Finale

### Griglia Badge (Mobile - 3 colonne)

```text
+------------+------------+------------+
|    🦁      |    🐢      |    🐝      |
|   Leone    |  Tartaruga |    Ape     |
|  [GLOW]    |  [GLOW]    |  [GLOW]    |
+------------+------------+------------+
|    🐜      |    🦅      |    🐺      |
|  Formica   |   Aquila   |   Lupo     |
| [LOCKED]   | [LOCKED]   | [LOCKED]   |
|  grayscale |  grayscale |  grayscale |
+------------+------------+------------+
```

### Badge Sbloccato

```text
+------------------+
|                  |
|   🦁   <- 60px   |
|  [====GLOW====]  |  <- Alone arancione/dorato
|                  |
|     Leone        |
|      1gg         |
+------------------+
```

### Badge Bloccato

```text
+------------------+
|                  |
|   🦅   <- Grigio |
|  opacity: 40%    |  <- Nessun glow
|  grayscale       |
|                  |
|      ???         |
|      5gg         |
+------------------+
```

---

## File da Modificare

| File | Azione | Priorita |
|------|--------|----------|
| `src/lib/badges.ts` | Riscrivere lista 20 animali | Alta |
| `src/lib/badgeEmojis.ts` | Nuovo - mappatura emoji + colori glow | Alta |
| `src/lib/badgeSpirits.ts` | Riscrivere contenuti spirito | Alta |
| `src/components/BadgeGallery.tsx` | Layout 3 col + emoji + glow | Alta |
| `src/components/BadgeProgress.tsx` | Emoji invece di Lucide | Media |
| `src/components/SpiritAnimalDrawer.tsx` | Emoji grande + glow | Media |
| `src/components/BadgeUnlockAnimation.tsx` | Bounce animation + emoji | Media |
| `src/index.css` | Utility glow classes | Bassa |
| `tailwind.config.ts` | Keyframe bounce | Bassa |
| `src/lib/badgeIcons.ts` | Eliminare (non piu necessario) | Bassa |

---

## Vantaggi dell'Implementazione

1. **Estetica Kawaii**: Emoji colorate e "cute" creano un'esperienza piu amichevole
2. **Glow Tematico**: Ogni animale ha un alone del proprio colore, rendendo ogni badge unico
3. **Layout Generoso**: 3 colonne su mobile = icone piu grandi (60px+) e piu leggibili
4. **Feedback Visivo Chiaro**: Grayscale netto distingue immediatamente bloccati/sbloccati
5. **Celebrazione Sblocco**: Bounce animation rende lo sblocco memorabile
6. **Cross-Platform**: Tutte le emoji scelte (🦁🐢🐝...) sono supportate su iOS, Android e Web

---

## Note Tecniche

- Le emoji renderizzano in modo nativo su ogni piattaforma (Apple/Google/Windows)
- Il `filter: grayscale(1)` CSS funziona perfettamente sulle emoji
- Il `filter: drop-shadow()` crea il glow attorno alla forma dell'emoji
- La dimensione 60px garantisce leggibilita su tutti gli schermi mobile

