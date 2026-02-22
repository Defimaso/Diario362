# Diario362 — Claude Code Context

## Info Progetto
- **App:** PWA diario nutrizione/allenamento per clienti 362gradi
- **Dominio:** diario.362gradi.ae
- **Deploy:** Vercel (auto-deploy da git push su main) → https://diario362.vercel.app
- **Repo:** github.com/Defimaso/Diario362
- **Stack:** React 18 + Vite + TypeScript + Tailwind + shadcn/ui + Framer Motion + Supabase
- **Supabase:** ppbbqchycxffsfavtsjp (condiviso con 362gradi.ae)
- **DNS:** A record `76.76.21.21` su tasjeel.ae → diario.362gradi.ae

## Regole Base
- Lingua: **Italiano**
- Autonomia: NON chiedere conferme, procedere direttamente
- 99% utenti su mobile — ogni modifica deve funzionare perfettamente su mobile
- Deploy: `git add . && git commit -m "msg" && git push` (Vercel auto-deploy)

## Pagine (`src/pages/`)
| Route | File | Note |
|-------|------|------|
| `/` | `Landing.tsx` | Landing pubblica |
| `/auth` | `Auth.tsx` | Login/Signup |
| `/dashboard` | `Dashboard.tsx` | Area utente |
| `/diario` | `Diario.tsx` | Home principale cliente — onboarding tour qui |
| `/gestione-diario` | `GestioneDiario.tsx` | Vista coach — check clienti |
| `/allenamento` | `Allenamento.tsx` / `AllenamentoRedesign.tsx` | Scheda allenamento |
| `/nutrizione` | `Nutrizione.tsx` | Piano nutrizionale |
| `/progressi` | `Progressi.tsx` | Foto + misure + grafici |
| `/area-personale` | `AreaPersonale.tsx` | Profilo cliente |
| `/community` | `Community.tsx` | Feed community |
| `/messaggi` | `Messaggi.tsx` | Chat con coach |
| `/guida` | `Guida.tsx` | Guida funzioni app + pulsante "Ripeti tour" |
| `/settings` | `Settings.tsx` | Impostazioni + sezione Beta |
| `/admin` | `AdminDashboard.tsx` | Dashboard admin coach |
| `/checks` | `Checks.tsx` | Lista check giornalieri |
| `/documenti` | `Documenti.tsx` | Documenti |
| `/inizia` | `Inizia.tsx` | Primo accesso |
| `/upgrade` | `Upgrade.tsx` | Upgrade premium |
| `/installa-app` | `InstallApp.tsx` | Guida installazione PWA |

## Componenti Chiave (`src/components/`)
| File | Scopo |
|------|-------|
| `BottomDock.tsx` | Navigazione bottom — z-50 — copre tutto sotto |
| `GuideOnboarding.tsx` | Tour interattivo 5 step per nuovi clienti |
| `checks/ImageCropperModal.tsx` | Crop foto profilo — z-[200] per stare sopra BottomDock |
| `checks/CheckFormModal.tsx` | Modal inserimento check giornaliero |
| `MomentumCircle.tsx` | Cerchio momentum visivo in Diario.tsx |
| `ClientExpandedView.tsx` | Vista espansa cliente per coach |
| `progress/HistoryTable.tsx` | Tabella/card storico check |
| `WeeklyChart.tsx` | Grafico settimanale |

## Contesti e Auth
- `src/contexts/AuthContext.tsx` — `useAuth()` → `{ user, profile, signOut, ... }`
- `user.id` = UUID Supabase dell'utente loggato

## Onboarding Tour (`GuideOnboarding.tsx`)
- Si mostra al primo accesso su `/diario`
- Storage key: `diario_guide_seen_${userId}_v2` in localStorage
- Per forzare ri-mostra: rimuovere la chiave da localStorage
- 5 step: welcome → checkin → momentum → actions → start
- Target IDs in Diario.tsx: `id="tour-checkin"`, `id="tour-momentum"`, `id="tour-actions"`
- Pulsante "Ripeti tour" in `/guida` → cancella localStorage key + navigate('/diario')

## Note Mobile Critiche
- **z-index**: BottomDock = z-50, modal overlay = z-[200] (obbligatorio)
- **flex layout**: usare `min-h-0` su `flex-1` per evitare overflow su mobile
- **safe-area**: `env(safe-area-inset-bottom/top)` per iPhone notch
- **testi**: minimo `text-xs` (mai `text-[10px]`)
- **inputMode="decimal"**: per input numerici su mobile

## Feature Attive
- ✅ Beta banner in Diario.tsx e Settings.tsx
- ✅ Header mobile: Settings + LogOut in dropdown `...` (sm:hidden sui singoli bottoni)
- ✅ ImageCropperModal fullscreen z-[200]
- ✅ HistoryTable: card layout mobile + table desktop
- ✅ Tour guidato con 4-div overlay technique
- ✅ Pulsante "Ripeti tour guidato" in /guida

## Deploy
```bash
git add . && git commit -m "msg" && git push
# → auto-deploy su Vercel → diario.362gradi.ae
```
