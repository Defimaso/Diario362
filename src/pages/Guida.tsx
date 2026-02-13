import { motion } from 'framer-motion';
import {
  ArrowLeft, Smartphone, ClipboardCheck, Trophy, TrendingUp, Users,
  FolderOpen, MessageCircle, Bell, Settings, ChevronRight, Crown,
  BookOpen, Camera, Apple, FileText, Dumbbell, MessageSquare, Sparkles
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
  action?: { label: string; path: string };
  tip?: string;
  premium?: boolean;
  comingSoon?: boolean;
  delay: number;
}

const StepCard = ({ step, title, description, icon, color, details, action, tip, premium, comingSoon, delay }: StepProps) => {
  const navigate = useNavigate();

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
    description: 'Il primo passo: aggiungi 362gradi alla schermata Home',
    icon: <Smartphone className="w-5 h-5 text-cyan-500" />,
    color: 'bg-cyan-500/15',
    details: [
      'iPhone: Apri in Safari > Condividi > "Aggiungi alla schermata Home"',
      'Android: Apri in Chrome > Menu (tre puntini) > "Installa app"',
      'Installare l\'app e\' necessario per ricevere le notifiche push su iPhone',
    ],
    action: { label: 'Guida Installazione', path: '/install' },
    tip: 'Dopo l\'installazione, apri l\'app dalla schermata Home per un\'esperienza ottimale.',
  },
  {
    step: 1,
    title: 'Compila il Diario',
    description: 'La tua attivita\' principale quotidiana',
    icon: <ClipboardCheck className="w-5 h-5 text-[hsl(var(--section-red))]" />,
    color: 'bg-[hsl(var(--section-red))]/15',
    details: [
      'Ogni giorno compila il diario: recupero, energia, mindset, aderenza nutrizionale',
      'Scrivi il tuo "2% Edge": la cosa in piu\' che hai fatto oggi',
      'Il Cerchio Momentum mostra la percentuale di completamento settimanale',
      'Il Grafico Settimanale visualizza i tuoi punteggi degli ultimi 7 giorni',
      'Nel "Mio Diario" rivedi tutti i tuoi pensieri passati',
    ],
    action: { label: 'Vai al Diario', path: '/diario' },
    tip: 'Compila il diario alla stessa ora ogni giorno per creare un\'abitudine.',
  },
  {
    step: 2,
    title: 'Badges & Streak',
    description: 'La gamification che ti motiva ogni giorno',
    icon: <Trophy className="w-5 h-5 text-yellow-500" />,
    color: 'bg-yellow-500/15',
    details: [
      'Ogni giorno di diario consecutivo aumenta la tua Streak',
      'Sblocca badge: Scintilla (1-2gg) > Momentum (3-6gg) > Costanza (7-13gg) > Leggenda (14+gg)',
      'Tocca la barra dei badges nel Diario per vedere tutti i traguardi',
      'Un\'animazione speciale celebra ogni nuovo badge sbloccato!',
    ],
    tip: 'Non spezzare la streak! Anche un diario veloce conta.',
  },
  {
    step: 3,
    title: 'Progressi & Check Mensili',
    description: 'Check peso/foto + grafici di progresso',
    icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
    color: 'bg-emerald-500/15',
    details: [
      'Compila i check mensili: inserisci peso e scatta 3 foto (fronte, lato, retro)',
      'Puoi ritagliare le foto direttamente nell\'app',
      'Confronta le foto di check diversi fianco a fianco',
      'Grafico peso: vedi l\'andamento nel tempo',
      'Storico misurazioni: tabella con tutte le tue rilevazioni',
    ],
    action: { label: 'Vai ai Progressi', path: '/progressi' },
    tip: 'Per foto migliori, usa sempre la stessa luce e lo stesso sfondo.',
  },
  {
    step: 4,
    title: 'Community',
    description: 'Confrontati con gli altri del percorso',
    icon: <Users className="w-5 h-5 text-indigo-500" />,
    color: 'bg-indigo-500/15',
    details: [
      'Condividi pensieri, domande e motivazione con la community',
      'Puoi scrivere con il tuo nome o in modo anonimo',
      'Presto disponibile!',
    ],
    comingSoon: true,
  },

  // === PREMIUM FEATURES ===
  {
    step: 5,
    title: 'Area Personale — Materiali',
    description: 'Piano alimentare, documenti e video allenamenti',
    icon: <FolderOpen className="w-5 h-5 text-primary" />,
    color: 'bg-primary/15',
    premium: true,
    details: [
      'Piano Alimentare: visualizza e scarica il PDF caricato dal tuo coach',
      'Documenti: accedi a schede, guide e protocolli condivisi dal coach',
      'Video Allenamenti: carica un video di un esercizio e ricevi feedback dal coach',
      'Il coach puo\' rispondere con correzioni testuali o video',
      'Ricevi notifiche push quando il coach carica nuovi materiali',
    ],
    action: { label: 'Vai ai Materiali', path: '/area-personale' },
    tip: 'Controlla regolarmente: il coach aggiorna i tuoi materiali nel tempo.',
  },
  {
    step: 6,
    title: 'Messaggi col Coach',
    description: 'Chat diretta con il tuo coach dedicato',
    icon: <MessageCircle className="w-5 h-5 text-green-500" />,
    color: 'bg-green-500/15',
    premium: true,
    details: [
      'Chat in tempo reale con il tuo coach',
      'Fai domande su allenamento, nutrizione o qualsiasi dubbio',
      'Ricevi notifiche push quando il coach ti risponde',
      'Lo storico dei messaggi e\' sempre disponibile',
    ],
    action: { label: 'Vai ai Messaggi', path: '/messaggi' },
  },

  // === SETUP ===
  {
    step: 7,
    title: 'Attiva le Notifiche',
    description: 'Non perderti nessun aggiornamento',
    icon: <Bell className="w-5 h-5 text-amber-500" />,
    color: 'bg-amber-500/15',
    details: [
      'Vai in Impostazioni (ingranaggio in alto nel Diario)',
      'Nella sezione "Notifiche", attiva il toggle',
      'Il browser ti chiedera\' il permesso: tocca "Consenti"',
      'Riceverai notifiche per: messaggi coach, nuovi materiali, feedback video',
    ],
    action: { label: 'Vai alle Impostazioni', path: '/settings' },
    tip: 'Su iPhone devi prima installare l\'app (Step 1), poi attivare le notifiche.',
  },
  {
    step: 8,
    title: 'Impostazioni',
    description: 'Gestisci il tuo account',
    icon: <Settings className="w-5 h-5 text-gray-500" />,
    color: 'bg-gray-500/15',
    details: [
      'Modifica il tuo nome visualizzato',
      'Cambia la password di accesso',
      'Gestisci le notifiche push',
      'Elimina il tuo account se necessario (GDPR Art. 17)',
    ],
    action: { label: 'Vai alle Impostazioni', path: '/settings' },
  },
];

const Guida = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
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
            <h1 className="text-xl font-bold">Come usare 362gradi</h1>
            <p className="text-xs text-muted-foreground">Segui i passi per iniziare</p>
          </div>
        </motion.header>

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
          <p className="text-center text-[11px] text-muted-foreground">Disponibili per tutti gli utenti</p>
        </motion.div>

        {/* Free steps */}
        <div className="space-y-6 mb-8">
          {steps.filter((_, i) => i <= 4).map((step, i) => (
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
              Funzioni Premium
            </span>
            <div className="h-px flex-1 bg-amber-500/30" />
          </div>
          <p className="text-center text-[11px] text-muted-foreground">Incluse nel percorso 362gradi</p>
        </motion.div>

        {/* Premium steps */}
        <div className="space-y-6 mb-8">
          {steps.filter((_, i) => i >= 5 && i <= 6).map((step, i) => (
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
          {steps.filter((_, i) => i >= 7).map((step, i) => (
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
              href="mailto:info@362gradi.it"
              className="text-sm font-medium text-primary hover:underline"
            >
              info@362gradi.it
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
