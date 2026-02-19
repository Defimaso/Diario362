import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  ArrowLeft, Smartphone, ClipboardCheck, Trophy, TrendingUp, Users,
  FolderOpen, MessageCircle, Bell, Settings, ChevronRight, Crown,
  BookOpen, BarChart3, PenLine, Dumbbell, UtensilsCrossed,
  MessageSquare, Sparkles, Lock, ChevronDown, ChevronUp,
  Target, Zap, Heart, Brain, Flame, Camera, Scale, Table2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/legal/Footer';
import BottomDock from '@/components/BottomDock';

interface StepProps {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  details: string[];
  howTo?: string[];
  action?: { label: string; path: string };
  tip?: string;
  premium?: boolean;
  premiumNote?: string;
  comingSoon?: boolean;
  delay: number;
}

const StepCard = ({ step, title, description, icon, color, details, howTo, action, tip, premium, premiumNote, comingSoon, delay }: StepProps) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="relative"
    >
      {/* Connector line */}
      {step > 0 && (
        <div className="absolute -top-6 left-[23px] w-0.5 h-6 bg-border" />
      )}

      <div className={`card-elegant rounded-2xl overflow-hidden ${comingSoon ? 'opacity-60' : ''}`}>
        {/* Header */}
        <div className="p-4 pb-3 flex items-start gap-3">
          {/* Step number + icon */}
          <div className="relative shrink-0">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              {icon}
            </div>
            <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold">
              {step + 1}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm">{title}</h3>
              {premium && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  <Crown className="w-2.5 h-2.5" />
                  PREMIUM
                </span>
              )}
              {!premium && !comingSoon && (
                <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  GRATIS
                </span>
              )}
              {comingSoon && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" />
                  IN ARRIVO
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>

        {/* Details */}
        <div className="px-4 pb-3">
          <ul className="space-y-1.5">
            {details.map((detail, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* How-to expandable */}
        {howTo && howTo.length > 0 && (
          <div className="px-4 pb-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {expanded ? 'Nascondi dettagli' : 'Come funziona passo per passo'}
            </button>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 bg-primary/5 rounded-xl p-3 space-y-2"
              >
                {howTo.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-foreground/80">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[9px] font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Premium note */}
        {premiumNote && (
          <div className="mx-4 mb-3 bg-amber-500/5 border border-amber-500/15 rounded-lg p-2.5 flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed">
              {premiumNote}
            </p>
          </div>
        )}

        {/* Tip */}
        {tip && (
          <div className="mx-4 mb-3 bg-primary/5 rounded-lg p-2.5">
            <p className="text-[11px] text-primary">
              <strong>Tip:</strong> {tip}
            </p>
          </div>
        )}

        {/* Action button */}
        {action && !comingSoon && (
          <div className="px-4 pb-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate(action.path)}
            >
              {action.label}
              <ChevronRight className="w-3.5 h-3.5 ml-auto" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const steps: Omit<StepProps, 'delay'>[] = [
  // === FREE FEATURES ===
  {
    step: 0,
    title: 'Installa l\'App',
    description: 'Il primo passo: aggiungi Diario362 alla schermata Home',
    icon: <Smartphone className="w-5 h-5 text-cyan-500" />,
    color: 'bg-cyan-500/15',
    details: [
      'L\'app funziona direttamente dal browser, ma installarla la rende un\'esperienza nativa',
      'Avrai un\'icona sulla schermata Home come una vera app',
      'Fondamentale per ricevere le notifiche push (soprattutto su iPhone)',
    ],
    howTo: [
      'iPhone: Apri diario.362gradi.ae in Safari (non Chrome/Firefox!)',
      'Tocca il pulsante "Condividi" (quadrato con freccia in su)',
      'Scorri e seleziona "Aggiungi alla schermata Home"',
      'Android: Apri in Chrome > Menu (tre puntini) > "Installa app"',
      'Dopo l\'installazione, apri sempre l\'app dalla schermata Home',
    ],
    action: { label: 'Guida Installazione Dettagliata', path: '/install' },
    tip: 'Su iPhone DEVI usare Safari. Se usi Chrome o Firefox l\'opzione non appare.',
  },
  {
    step: 1,
    title: 'Il Diario Quotidiano',
    description: 'La tua attivita\' principale: 2 minuti al giorno che fanno la differenza',
    icon: <ClipboardCheck className="w-5 h-5 text-[hsl(var(--section-red))]" />,
    color: 'bg-[hsl(var(--section-red))]/15',
    details: [
      'Ogni giorno compila 4 parametri veloci: Recupero, Energia, Mindset e Aderenza Nutrizionale',
      'Usa gli slider (1-10) per Recupero, Energia e Mindset',
      'Per la Nutrizione rispondi Si/No alla domanda se hai seguito il piano',
      'Scrivi il tuo "2% Extra": la cosa in piu\' che hai fatto oggi per migliorarti',
      'Il Cerchio Momentum in alto mostra la tua % di completamento settimanale',
    ],
    howTo: [
      'Apri il Diario dalla schermata principale (sei gia\' qui!)',
      'Scorri fino alla sezione "Check-in Giornaliero"',
      'Sposta gli slider per dare un voto da 1 a 10 a Recupero, Energia e Mindset',
      'Tocca Si o No per la domanda sulla Nutrizione',
      'Scrivi nel campo "2% Extra" il tuo piccolo miglioramento di oggi',
      'Premi "Salva Check-in" — fatto! Il cerchio Momentum si aggiornera\'',
    ],
    action: { label: 'Vai al Diario', path: '/diario' },
    tip: 'Compilalo alla stessa ora ogni giorno per creare un\'abitudine. Bastano 2 minuti!',
  },
  {
    step: 2,
    title: 'Percorso & Streak',
    description: 'Piu\' giorni consecutivi compili, piu\' milestone sblocchi',
    icon: <Trophy className="w-5 h-5 text-yellow-500" />,
    color: 'bg-yellow-500/15',
    details: [
      'La Streak conta i giorni consecutivi in cui hai compilato il diario',
      'Ogni traguardo sblocca una milestone con animazione celebrativa',
      '20 livelli in 4 fasi: Inizio (settimana 1), Consolidamento (mesi 1-3), Trasformazione (mesi 4-6), Mastery (mesi 7-12)',
      'Primo Passo (1gg) > Prima Settimana (7gg) > Un Mese (30gg) > Maestra 362° (300gg)',
      'Tocca la barra del percorso nel Diario per vedere tutti i livelli',
    ],
    howTo: [
      'Compila il diario ogni giorno — la streak si aggiorna automaticamente',
      'Quando sblocchi una nuova milestone, vedrai un\'animazione celebrativa',
      'Tocca il percorso nel Diario per la Galleria completa dei 20 livelli',
      'Nella Galleria vedi tutte le milestone e quali hai gia\' sbloccato',
    ],
    tip: 'Non spezzare la streak! Anche un check-in veloce (senza il 2% Extra) conta.',
  },
  {
    step: 3,
    title: 'Progressi & Check Mensili',
    description: 'Foto e peso per vedere la tua trasformazione nel tempo',
    icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
    color: 'bg-emerald-500/15',
    details: [
      'Hai 3 slot di check disponibili da completare',
      'Per ogni check: inserisci il peso attuale e scatta 2 foto (fronte e lato)',
      'Puoi ritagliare le foto direttamente nell\'app prima di salvare',
      'Vedi la tab "Completati" per rivedere i check fatti',
    ],
    howTo: [
      'Tocca "Progressi" nel menu in basso',
      'Scegli uno dei check "Da Fare" e tocca "Compila"',
      'Inserisci il tuo peso attuale',
      'Scatta o carica una foto frontale e una laterale',
      'Ritaglia se necessario e salva il check',
      'Completa tutti e 3 i check per avere un quadro completo',
    ],
    premiumNote: 'Il grafico peso nel tempo, il confronto foto fianco a fianco e lo storico misurazioni sono disponibili col percorso personalizzato.',
    action: { label: 'Vai ai Progressi', path: '/progressi' },
    tip: 'Per foto confrontabili, usa sempre la stessa luce, posizione e sfondo.',
  },
  {
    step: 4,
    title: 'Recap Settimanale',
    description: 'Ogni settimana vedi come sei andato',
    icon: <BarChart3 className="w-5 h-5 text-violet-500" />,
    color: 'bg-violet-500/15',
    details: [
      'La card "Recap" nel Diario mostra un riassunto della tua settimana',
      'Vedi l\'andamento di Recupero, Energia, Mindset e Nutrizione',
      'Il Cerchio Momentum ti dice quanti giorni hai compilato su 7',
    ],
    premiumNote: 'Le statistiche dettagliate (medie, grafici a barre, trend) e il grafico settimanale interattivo si sbloccano col percorso personalizzato.',
    tip: 'Controlla il recap ogni lunedi\' per capire cosa migliorare nella settimana nuova.',
  },
  {
    step: 5,
    title: 'Community',
    description: 'Confrontati con le altre ragazze del percorso',
    icon: <Users className="w-5 h-5 text-indigo-500" />,
    color: 'bg-indigo-500/15',
    details: [
      'Condividi pensieri, domande e motivazione con la community',
      'Puoi scrivere con il tuo nome o in modo anonimo',
      'Questa funzione sara\' disponibile a breve!',
    ],
    comingSoon: true,
  },

  // === PREMIUM FEATURES ===
  {
    step: 6,
    title: 'Statistiche & Grafici Avanzati',
    description: 'Analisi dettagliata dei tuoi dati quotidiani',
    icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
    color: 'bg-blue-500/15',
    premium: true,
    details: [
      'Grafico settimanale interattivo con l\'andamento di tutti i parametri',
      'Medie settimanali per Recupero, Energia, Mindset e Nutrizione',
      'Confronto tra settimane diverse per vedere i miglioramenti',
      'Accesso completo alla sezione "Statistiche" nel Diario',
    ],
    premiumNote: 'Nella versione gratuita queste sezioni appaiono sfocate con anteprima. Si sbloccano attivando il percorso personalizzato.',
  },
  {
    step: 7,
    title: 'Diario dei Pensieri',
    description: 'Scrivi liberamente i tuoi pensieri e rileggili nel tempo',
    icon: <PenLine className="w-5 h-5 text-rose-500" />,
    color: 'bg-rose-500/15',
    premium: true,
    details: [
      'Sezione "Mio Diario" dove puoi scrivere pensieri liberi ogni giorno',
      'Diverso dal check-in: qui scrivi quello che vuoi, senza limiti',
      'Rileggi i tuoi pensieri passati nella timeline',
      'Utile per tracciare emozioni, riflessioni e momenti importanti',
    ],
    premiumNote: 'Questa sezione e\' visibile e utilizzabile solo con il percorso personalizzato attivo.',
  },
  {
    step: 8,
    title: 'Area Personale — Materiali',
    description: 'Piano alimentare, documenti e video dal tuo coach',
    icon: <FolderOpen className="w-5 h-5 text-primary" />,
    color: 'bg-primary/15',
    premium: true,
    details: [
      'Piano Alimentare: il PDF della tua dieta caricato direttamente dal coach',
      'Documenti: schede allenamento, guide e protocolli condivisi',
      'Video Allenamenti: carica un video di un tuo esercizio e ricevi la correzione dal coach',
      'Il coach risponde con commenti testuali o video-correzione',
      'Notifiche push quando il coach carica nuovi materiali o risponde ai tuoi video',
    ],
    action: { label: 'Vai ai Materiali', path: '/area-personale' },
    premiumNote: 'Questa sezione e\' completamente bloccata senza il percorso personalizzato. Attivandolo, il tuo coach carichera\' tutto il materiale qui.',
    tip: 'Controlla regolarmente: il coach aggiorna i tuoi materiali nel tempo.',
  },
  {
    step: 9,
    title: 'Allenamento Personalizzato',
    description: 'Accesso diretto alla tua scheda di allenamento',
    icon: <Dumbbell className="w-5 h-5 text-orange-500" />,
    color: 'bg-orange-500/15',
    premium: true,
    details: [
      'Link diretto alla tua scheda su Teachable con accesso automatico (SSO)',
      'Il coach prepara il programma personalizzato in base ai tuoi obiettivi',
      'Video dimostrativi per ogni esercizio',
    ],
    premiumNote: 'Disponibile solo col percorso personalizzato. Il link appare nella dashboard dopo l\'attivazione.',
  },
  {
    step: 10,
    title: 'Dieta Personalizzata',
    description: 'Accesso al tuo piano nutrizionale su Nutrium',
    icon: <UtensilsCrossed className="w-5 h-5 text-lime-500" />,
    color: 'bg-lime-500/15',
    premium: true,
    details: [
      'Link diretto a Nutrium con accesso automatico (SSO)',
      'Il nutrizionista prepara il piano in base al tuo metabolismo e obiettivi',
      'Aggiornamenti periodici del piano in base ai tuoi progressi',
    ],
    premiumNote: 'Disponibile solo col percorso personalizzato. Il link appare nella dashboard dopo l\'attivazione.',
  },
  {
    step: 11,
    title: 'Messaggi col Coach',
    description: 'Chat diretta con il tuo coach dedicato',
    icon: <MessageCircle className="w-5 h-5 text-green-500" />,
    color: 'bg-green-500/15',
    premium: true,
    details: [
      'Chat in tempo reale con il tuo coach personale',
      'Fai domande su allenamento, nutrizione o qualsiasi dubbio',
      'Ricevi notifiche push quando il coach ti risponde',
      'Lo storico dei messaggi e\' sempre disponibile',
    ],
    action: { label: 'Vai ai Messaggi', path: '/messaggi' },
    premiumNote: 'La chat e\' accessibile solo con il percorso personalizzato attivo. Senza, verrai reindirizzata alla pagina di upgrade.',
  },

  // === SETUP ===
  {
    step: 12,
    title: 'Attiva le Notifiche',
    description: 'Non perderti nessun aggiornamento',
    icon: <Bell className="w-5 h-5 text-amber-500" />,
    color: 'bg-amber-500/15',
    details: [
      'Ricevi promemoria per compilare il diario',
      'Notifiche quando il coach ti scrive o carica materiale',
      'Alert per nuovi feedback sui tuoi video',
    ],
    howTo: [
      'Tocca l\'icona ingranaggio in alto a destra nel Diario',
      'Nella sezione "Notifiche", attiva il toggle',
      'Il browser ti chiedera\' il permesso: tocca "Consenti"',
      'Se su iPhone: devi PRIMA installare l\'app (Step 1), poi attivare da dentro l\'app',
    ],
    action: { label: 'Vai alle Impostazioni', path: '/settings' },
    tip: 'Su iPhone le notifiche funzionano SOLO se hai installato l\'app dalla schermata Home.',
  },
  {
    step: 13,
    title: 'Impostazioni & Account',
    description: 'Gestisci profilo, password e preferenze',
    icon: <Settings className="w-5 h-5 text-gray-500" />,
    color: 'bg-gray-500/15',
    details: [
      'Modifica il tuo nome visualizzato e la foto profilo',
      'Cambia la password di accesso',
      'Inserisci un codice di attivazione premium (se lo hai ricevuto)',
      'Gestisci le notifiche push',
      'Elimina il tuo account se necessario (GDPR Art. 17)',
    ],
    howTo: [
      'Tocca l\'icona ingranaggio in alto a destra nel Diario',
      'Nella sezione "Profilo" puoi cambiare nome e foto',
      'In "Sicurezza" puoi cambiare la password',
      'In "Abbonamento" puoi inserire un codice premium o vedere il tuo piano',
      'In fondo trovi l\'opzione per eliminare l\'account',
    ],
    action: { label: 'Vai alle Impostazioni', path: '/settings' },
  },
];

const Guida = () => {
  const navigate = useNavigate();

  const freeSteps = steps.filter((_, i) => i <= 5);
  const premiumSteps = steps.filter((_, i) => i >= 6 && i <= 11);
  const setupSteps = steps.filter((_, i) => i >= 12);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-5 py-6 sm:py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Come usare Diario362</h1>
            <p className="text-xs text-muted-foreground">Guida completa a tutte le funzioni</p>
          </div>
        </motion.header>

        {/* Intro card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.02 }}
          className="card-elegant rounded-2xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm mb-1">Benvenuta in Diario362!</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                L'app ti aiuta a monitorare ogni giorno recupero, energia, mindset e nutrizione.
                Le funzioni base sono gratuite per tutti. Le funzioni premium si sbloccano
                attivando il percorso personalizzato con il tuo coach.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Section: Free */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px flex-1 bg-emerald-500/30" />
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Funzioni Gratuite</span>
            <div className="h-px flex-1 bg-emerald-500/30" />
          </div>
          <p className="text-center text-[11px] text-muted-foreground">Disponibili per tutti — nessun costo</p>
        </motion.div>

        {/* Free steps */}
        <div className="space-y-6 mb-8">
          {freeSteps.map((step, i) => (
            <StepCard key={step.step} {...step} delay={0.1 + i * 0.06} />
          ))}
        </div>

        {/* Section: Premium */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px flex-1 bg-amber-500/30" />
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Percorso Personalizzato
            </span>
            <div className="h-px flex-1 bg-amber-500/30" />
          </div>
          <p className="text-center text-[11px] text-muted-foreground">
            Si sbloccano attivando il percorso col tuo coach
          </p>
        </motion.div>

        {/* Premium explanation card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="mb-6 bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-foreground/80 leading-relaxed">
                Le funzioni premium includono coaching 1:1, piano alimentare,
                scheda allenamento, chat diretta col coach e statistiche avanzate.
                Si attivano con un codice che ricevi dopo aver acquistato il percorso.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 text-xs text-amber-600 dark:text-amber-400 border-amber-500/30"
                onClick={() => navigate('/upgrade')}
              >
                Scopri il percorso personalizzato
                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Premium steps */}
        <div className="space-y-6 mb-8">
          {premiumSteps.map((step, i) => (
            <StepCard key={step.step} {...step} delay={0.45 + i * 0.06} />
          ))}
        </div>

        {/* Section: Setup */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Setup & Impostazioni</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </motion.div>

        {/* Setup steps */}
        <div className="space-y-6 mb-8">
          {setupSteps.map((step, i) => (
            <StepCard key={step.step} {...step} delay={0.6 + i * 0.06} />
          ))}
        </div>

        {/* Support */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="card-elegant p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-primary/10">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold text-sm">Hai bisogno di aiuto?</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Se hai domande o problemi con l'app, contatta il tuo coach o scrivi a:
            </p>
            <a
              href="mailto:info@362gradi.ae"
              className="text-sm font-medium text-primary hover:underline"
            >
              info@362gradi.ae
            </a>
          </div>
        </motion.section>
      </div>

      <BottomDock />
      <Footer />
    </div>
  );
};

export default Guida;
