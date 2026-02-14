# Piano Automazioni, Funnel & Tracking

## Panoramica Strategica (Chase Hughes Framework)

Il funnel applica i principi di Chase Hughes:
- **Reciprocita'**: valore gratuito prima di chiedere (app free + guida gratuita)
- **Impegno progressivo**: micro-azioni nell'app → commitment crescente
- **Autorita'**: credenziali team in ogni touchpoint
- **Prova sociale**: contatori utenti, trasformazioni
- **Scarsita'**: posti limitati, timer nelle email
- **Coerenza**: una volta che compilano il diario, il cervello li tiene nel percorso

## Flusso Funnel Completo

```
AD (Meta/Google)
  → /landing (CTA: Prenota videocall Calendly)
  → /inizia (Quiz 51 step → raccolta email)
  → Welcome Email (Resend) con link app gratuita
  → Sequenza Nurturing (7 email in 14 giorni)
     Email 1: "Scarica l'app e compila il tuo primo diario" (Day 0)
     Email 2: "Il tuo 2% Edge di oggi" (Day 1)
     Email 3: "3 giorni di streak! Ecco cosa succede al tuo cervello" (Day 3)
     Email 4: "Il segreto che il 92% ignora" (Day 5) — psicologia
     Email 5: "I tuoi progressi questa settimana" (Day 7) — recap
     Email 6: "Stai gia' cambiando (ecco i dati)" (Day 10)
     Email 7: "Pronta per il passo successivo?" (Day 14) — CTA premium
  → In-App Upsell (dopo 7+ giorni di uso gratuito)
  → Conversione Premium (Calendly videocall → codice attivazione)
```

## Implementazione in 6 Fasi

---

### FASE 1: Tracking & Analytics (Frontend)
**File da modificare:** `index.html`, nuovo `src/lib/analytics.ts`

1. **Meta Pixel** — aggiungere script nel `<head>` di index.html
   - Track: PageView, Lead (signup), Purchase (premium), ViewContent
   - Custom events: DiaryCompleted, CheckCompleted, StreakMilestone

2. **Google Analytics 4** — aggiungere gtag.js
   - Track: page_view, sign_up, generate_lead, purchase
   - Custom events: diary_completed, streak_day_X, premium_upgrade

3. **Utility `analytics.ts`** — wrapper per tutti gli eventi
   - `trackEvent(name, params)` — invia a Meta + GA4
   - `trackConversion(type)` — specifico per conversioni ads
   - Rispetta cookie consent dal CookieBanner

4. **UTM Parameters** — catturare e salvare in localStorage
   - `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`
   - Salvare nel profilo utente al signup

**Env vars da aggiungere:**
```
VITE_META_PIXEL_ID="..."
VITE_GA_MEASUREMENT_ID="..."
```

---

### FASE 2: Aggiornamento Landing + CTA (Frontend)
**File da modificare:** `src/pages/Landing.tsx`

1. Cambiare `CTA_URL` da Teachable a Calendly:
   `https://calendly.com/info-xjs/call-362`

2. Aggiungere tracking conversion su click CTA
3. Aggiungere contatore social proof ("600+ clienti trasformati")
4. Aggiungere urgenza ("Solo 5 posti disponibili questo mese")

---

### FASE 3: Resend Email Infrastructure (Backend - Supabase)
**Approccio:** Supabase Edge Functions che chiamano Resend API

1. **Tabella `email_queue`** — coda email da inviare
   ```sql
   CREATE TABLE email_queue (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid REFERENCES auth.users(id),
     email text NOT NULL,
     template text NOT NULL,
     scheduled_at timestamptz NOT NULL,
     sent_at timestamptz,
     status text DEFAULT 'pending',
     metadata jsonb DEFAULT '{}',
     created_at timestamptz DEFAULT now()
   );
   ```

2. **Tabella `email_templates`** — template email
   ```sql
   CREATE TABLE email_templates (
     id text PRIMARY KEY,
     subject text NOT NULL,
     html_body text NOT NULL,
     sequence_order int,
     delay_days int,
     created_at timestamptz DEFAULT now()
   );
   ```

3. **Supabase Edge Function `send-email`** — invia email via Resend
   - Triggered via pg_cron ogni 5 minuti
   - Prende email pending dalla coda
   - Invia tramite Resend API
   - Aggiorna status a 'sent'

4. **Trigger DB** — su nuovo utente → inserisce 7 email nella coda
   ```sql
   CREATE OR REPLACE FUNCTION queue_welcome_sequence()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO email_queue (user_id, email, template, scheduled_at)
     VALUES
       (NEW.id, NEW.email, 'welcome', NOW()),
       (NEW.id, NEW.email, 'day1_diary', NOW() + INTERVAL '1 day'),
       (NEW.id, NEW.email, 'day3_streak', NOW() + INTERVAL '3 days'),
       (NEW.id, NEW.email, 'day5_psychology', NOW() + INTERVAL '5 days'),
       (NEW.id, NEW.email, 'day7_recap', NOW() + INTERVAL '7 days'),
       (NEW.id, NEW.email, 'day10_progress', NOW() + INTERVAL '10 days'),
       (NEW.id, NEW.email, 'day14_premium', NOW() + INTERVAL '14 days');
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   ```

**Env vars Edge Function (Supabase Dashboard > Secrets):**
```
RESEND_API_KEY="re_..."
SENDER_EMAIL="info@362gradi.ae"
```

---

### FASE 4: App come Lead Magnet (Frontend)
**File da modificare:** `src/pages/Guida.tsx`, `src/pages/Diario.tsx`

1. **Guida aggiornata** — ogni step della guida diventa un'azione pratica
   che l'utente compie DENTRO l'app, creando impegno progressivo

2. **Diario first-time experience** — al primo accesso:
   - Mostra un banner "Benvenuto! Compila il tuo primo diario"
   - Dopo primo diario: "Fantastico! Domani torna per la tua streak"
   - Dopo 3 giorni: "Sblocca il badge Momentum!"

3. **Share card** — dopo milestone (badge, streak 7gg):
   - Genera immagine condivisibile con stats
   - "Condividi il tuo progresso" → social sharing

4. **Referral program** — nella pagina Diario:
   - "Invita un amico" → link personalizzato con `?ref=USER_ID`
   - Traccia referral nel profilo

---

### FASE 5: Template Email Nurturing (Content)
7 email scritte con principi Chase Hughes:

| # | Giorno | Oggetto | Azione nell'App | Tecnica |
|---|--------|---------|-----------------|---------|
| 1 | 0 | "Il tuo percorso inizia adesso" | Installa app + primo diario | Reciprocita' |
| 2 | 1 | "Il tuo 2% Edge di oggi" | Compila diario giorno 2 | Impegno |
| 3 | 3 | "3 giorni! Ecco cosa succede al cervello" | Guarda badge Momentum | Prova sociale |
| 4 | 5 | "Il segreto che il 92% ignora" | Leggi sezione psicologia | Autorita' |
| 5 | 7 | "La tua prima settimana (i numeri)" | Guarda Progressi | Coerenza |
| 6 | 10 | "Stai gia' cambiando" | Compila primo Check | Impegno |
| 7 | 14 | "Pronta per il passo successivo?" | Prenota videocall | Scarsita' |

---

### FASE 6: Monitoring Dashboard per Ads (Frontend)
**Nuovo file:** `src/pages/AdminAds.tsx` (solo per admin)

1. **Metriche funnel**:
   - Visite landing → Lead (quiz completati) → Signup app → Premium
   - Conversion rate per step
   - Costo per lead (input manuale)

2. **Metriche email**:
   - Email inviate / aperte / cliccate (da Resend webhooks)
   - Unsubscribe rate

3. **Metriche in-app**:
   - DAU/WAU (utenti attivi)
   - Streak media
   - Tempo alla conversione premium

---

## Ordine di Esecuzione

1. **FASE 1** — Analytics (Meta Pixel + GA4) — servono PRIMA di lanciare ads
2. **FASE 2** — Landing CTA Calendly — pronto per ricevere traffico
3. **FASE 3** — Email Resend — automazioni post-signup
4. **FASE 4** — App lead magnet — engagement hooks
5. **FASE 5** — Contenuti email — copywriting nurturing
6. **FASE 6** — Dashboard ads — monitoring ROI

## Note Tecniche

- Le Edge Functions si deployano dal Supabase Dashboard
- I SQL (tabelle, trigger) si eseguono dal SQL Editor di Supabase
- Meta Pixel e GA4 vanno in `index.html` (condizionati al cookie consent)
- Le API key sensibili vanno nelle Supabase Secrets, non nel .env frontend
