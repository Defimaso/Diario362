
# Piano di Correzione Funnel /inizia

## Problemi Identificati

### 1. Bug Critico: FunnelInterstitial.tsx
Il `setTimeout` viene chiamato nel corpo del componente invece che dentro `useEffect`. Questo causa:
- Memory leaks (timeout non cancellati)
- Comportamento imprevedibile 
- Gli interstitial potrebbero non avanzare correttamente

### 2. Warning Console: FunnelButton.tsx
Il componente non usa `React.forwardRef`, causando warning React quando usato con animazioni Framer Motion.

### 3. Step Mancanti (32 attuali vs 45+ richiesti)
Alcune domande richieste nelle specifiche originali non sono state implementate.

---

## Correzioni Pianificate

### Fix 1: FunnelInterstitial.tsx
Correggere l'uso del setTimeout con useEffect e cleanup:

```typescript
import { useEffect } from "react";
// ...

const FunnelInterstitial = ({ type, onComplete }: FunnelInterstitialProps) => {
  const content = interstitialContent[type];
  const Icon = content.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, content.duration);
    
    return () => clearTimeout(timer);
  }, [content.duration, onComplete]);

  // ... rest of component
};
```

### Fix 2: FunnelButton.tsx
Aggiungere React.forwardRef per supportare ref:

```typescript
import * as React from "react";

const FunnelButton = React.forwardRef<
  HTMLButtonElement, 
  FunnelButtonProps
>(({ children, onClick, selected, className, variant = "option" }, ref) => {
  // ...
  return (
    <motion.button
      ref={ref}
      // ... props
    />
  );
});

FunnelButton.displayName = "FunnelButton";
```

### Fix 3: Aggiungere Step Mancanti
Aggiungere le domande mancanti per raggiungere 45+ step:

**Nuove domande da aggiungere:**

| # | ID | Domanda | Tipo |
|---|-----|---------|------|
| 1 | `body_type` | Quale descrizione si avvicina di piu al tuo fisico? | SingleChoice |
| 2 | `energy_level` | Come valuti il tuo livello di energia durante il giorno? | SingleChoice |
| 3 | `digestion` | Come va la tua digestione? | SingleChoice |
| 4 | `snacking_habit` | Fai spuntini tra i pasti? | SingleChoice |
| 5 | `late_eating` | Mangi spesso dopo le 21? | Boolean |
| 6 | `alcohol_frequency` | Quante volte bevi alcolici a settimana? | SingleChoice |
| 7 | `previous_diets` | Hai seguito diete in passato? | MultiChoice |
| 8 | `biggest_fear` | Qual e la tua piu grande paura nel percorso? | SingleChoice |
| 9 | `motivation_source` | Chi ti motiva di piu? | SingleChoice |
| 10 | `daily_activity` | Come descriveresti la tua attivita quotidiana? | SingleChoice |
| 11 | `cardio_preference` | Preferisci allenamenti cardio o forza? | SingleChoice |
| 12 | `flexibility` | Quanto sei flessibile con gli orari? | SingleChoice |
| 13 | `name` | Come ti chiami? | TextInput |

---

## Sequenza Step Finale (45 step)

```text
BLOCCO 1: BIO & GOAL (8 domande + 1 interstitial)
1. gender
2. age  
3. height
4. current_weight
5. target_weight
6. body_type (NUOVO)
7. min_historic_size
8. special_event
9. [INTERSTITIAL BIO]

BLOCCO 2: METABOLISMO & SALUTE (8 domande + 1 interstitial)
10. metabolism
11. health_conditions
12. medications
13. digestion (NUOVO)
14. energy_level (NUOVO)
15. sleep_hours
16. wake_quality
17. water_liters
18. [INTERSTITIAL METABOLISM]

BLOCCO 3: NUTRIZIONE (9 domande + 1 interstitial)
19. meals_per_day
20. snacking_habit (NUOVO)
21. late_eating (NUOVO)
22. weakness
23. eating_out_frequency
24. alcohol_frequency (NUOVO)
25. skip_breakfast
26. allergies
27. diet_type
28. [INTERSTITIAL NUTRITION]

BLOCCO 4: PSICOLOGIA (9 domande + 1 interstitial)
29. why_now
30. previous_diets (NUOVO)
31. past_obstacle
32. stress_eating
33. post_cheat_feeling
34. biggest_fear (NUOVO)
35. home_support
36. motivation_source (NUOVO)
37. weekend_challenge
38. [INTERSTITIAL PSYCHOLOGY]

BLOCCO 5: ALLENAMENTO (9 domande + 1 interstitial)
39. daily_activity (NUOVO)
40. preferred_location
41. weekly_sessions
42. session_duration
43. cardio_preference (NUOVO)
44. home_equipment
45. injuries
46. experience_level
47. commit_daily_diary
48. [INTERSTITIAL TRAINING]

FINALE (3 step)
49. name (NUOVO)
50. email
51. [RESULT]
```

---

## File da Modificare

| File | Modifica |
|------|----------|
| `src/components/funnel/FunnelInterstitial.tsx` | Correggere setTimeout con useEffect |
| `src/components/funnel/FunnelButton.tsx` | Aggiungere forwardRef |
| `src/pages/Inizia.tsx` | Aggiungere 13 nuove domande e aggiornare steps array |
| `supabase migration` | Aggiungere nuove colonne al database per i nuovi campi |

---

## Dettagli Tecnici

### Nuove Colonne Database
```sql
ALTER TABLE onboarding_leads ADD COLUMN body_type text;
ALTER TABLE onboarding_leads ADD COLUMN energy_level text;
ALTER TABLE onboarding_leads ADD COLUMN digestion text;
ALTER TABLE onboarding_leads ADD COLUMN snacking_habit text;
ALTER TABLE onboarding_leads ADD COLUMN late_eating boolean;
ALTER TABLE onboarding_leads ADD COLUMN alcohol_frequency text;
ALTER TABLE onboarding_leads ADD COLUMN previous_diets text[];
ALTER TABLE onboarding_leads ADD COLUMN biggest_fear text;
ALTER TABLE onboarding_leads ADD COLUMN motivation_source text;
ALTER TABLE onboarding_leads ADD COLUMN daily_activity text;
ALTER TABLE onboarding_leads ADD COLUMN cardio_preference text;
ALTER TABLE onboarding_leads ADD COLUMN flexibility text;
ALTER TABLE onboarding_leads ADD COLUMN name text;
```

### Risultato Atteso
- 51 step totali (48 domande + 5 interstitial + 1 result - 3 interstitial condivisi)
- Funnel fluido senza bug
- Nessun warning in console
- Tutti i dati salvati correttamente in Supabase
