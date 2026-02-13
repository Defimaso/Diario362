import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Check, X, Phone, Mail,
  Flame, Brain, Dumbbell, Salad, ArrowRight, Star,
  Users, Target, Zap, Shield, Clock, Award,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const CTA_URL = 'https://sso.teachable.com/secure/564301/identity/login/otp';
const WHATSAPP_URL = 'https://wa.me/393XXXXXXXXX';

/* ─── Fade-in animation wrapper ─── */
const FadeIn = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.6, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ─── Section wrapper ─── */
const Section = ({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) => (
  <section id={id} className={`py-16 sm:py-20 px-4 sm:px-6 ${className}`}>
    <div className="max-w-5xl mx-auto">{children}</div>
  </section>
);

/* ─── CTA Button ─── */
const CTAButton = ({ className = '' }: { className?: string }) => (
  <a href={CTA_URL} target="_blank" rel="noopener noreferrer">
    <Button
      size="lg"
      className={`bg-[#FFEE58] hover:bg-[#FFE400] text-gray-900 font-bold text-base px-8 py-6 rounded-full shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 transition-all ${className}`}
    >
      Prenota la tua video call gratuita
      <ArrowRight className="w-5 h-5 ml-2" />
    </Button>
  </a>
);

/* ─── FAQ Item ─── */
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="font-semibold text-gray-900 pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pb-5"
        >
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════ */
/*                LANDING PAGE                */
/* ═══════════════════════════════════════════ */

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Manrope', sans-serif" }}>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-yellow-50 pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFEE58]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#503AA8]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-[#503AA8]/10 text-[#503AA8] text-sm font-semibold px-4 py-2 rounded-full mb-8">
              <Star className="w-4 h-4" />
              Dal 2017 — Metodo Scientifico
            </div>
          </FadeIn>

          {/* Headlines */}
          <FadeIn delay={0.1}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6 text-gray-900">
              Hai provato diete, allenamenti, app...{' '}
              <span className="text-[#503AA8]">ma ogni volta torni al punto di partenza?</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
              Trasforma il tuo corpo e mantieni i risultati{' '}
              <span className="underline decoration-[#FFEE58] decoration-4 underline-offset-4">per sempre</span>
            </h2>
            <p className="text-lg text-gray-500 mb-10">Senza sacrifici estremi, senza effetto yo-yo</p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <CTAButton />
          </FadeIn>
        </div>
      </section>

      {/* ─── VALUE PROPOSITION ─── */}
      <Section className="bg-white">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
              Siamo l'unico servizio di coaching online che integra{' '}
              <strong className="text-[#503AA8]">Biologia della Nutrizione</strong>,{' '}
              <strong className="text-[#503AA8]">Psicologia</strong> e{' '}
              <strong className="text-[#503AA8]">Allenamento</strong>.
            </p>
            <p className="text-gray-500 mt-4">
              Non ti diamo solo una scheda o una dieta: costruiamo attorno a te un ecosistema scientifico per trasformare il tuo fisico, la tua performance e il tuo mindset.
            </p>
          </div>
        </FadeIn>

        {/* 4 Pillars */}
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              icon: <Flame className="w-6 h-6" />,
              color: 'text-red-500',
              bg: 'bg-red-50',
              title: 'Ricomposizione corporea reale',
              desc: 'Perdi grasso e costruisci muscoli con un metodo science-based',
            },
            {
              icon: <Brain className="w-6 h-6" />,
              color: 'text-purple-500',
              bg: 'bg-purple-50',
              title: 'Stop all\'effetto Yo-Yo',
              desc: 'Grazie al tuo nuovo Mindset, elimini i blocchi mentali',
            },
            {
              icon: <Zap className="w-6 h-6" />,
              color: 'text-amber-500',
              bg: 'bg-amber-50',
              title: 'Performance al top',
              desc: 'Migliora le tue prestazioni atletiche e l\'energia quotidiana',
            },
            {
              icon: <Salad className="w-6 h-6" />,
              color: 'text-green-500',
              bg: 'bg-green-50',
              title: 'Liberta\', non prigione alimentare',
              desc: 'Piani nutrizionali flessibili senza restrizioni estreme',
            },
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4 ${item.color}`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* ─── CTA BANNER ─── */}
      <section className="bg-[#503AA8] py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <h3 className="text-2xl font-bold text-white mb-4">
              Pronto a iniziare la tua trasformazione?
            </h3>
            <p className="text-purple-200 mb-6">Una video call gratuita e senza impegno per capire il percorso giusto per te.</p>
            <CTAButton />
          </FadeIn>
        </div>
      </section>

      {/* ─── TEAM ─── */}
      <Section className="bg-gray-50" id="team">
        <FadeIn>
          <div className="text-center mb-12">
            <span className="text-sm font-bold text-[#503AA8] uppercase tracking-wider">Il Team</span>
            <h2 className="text-3xl font-extrabold mt-2">Chi ti seguira'</h2>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 gap-8">
          <FadeIn delay={0.1}>
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-10 h-10 text-[#503AA8]" />
              </div>
              <h3 className="font-bold text-xl mb-1">Ilaria Berry</h3>
              <p className="text-sm text-[#503AA8] font-semibold mb-3">Biologa Nutrizionista & Psicologa Clinica</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Con 15 anni di esperienza, ha ideato il metodo 362° per coordinare scienza e mente, guidando oggi il suo Team di esperti verso la tua trasformazione definitiva.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Dumbbell className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="font-bold text-xl mb-1">Marco Masoero</h3>
              <p className="text-sm text-amber-600 font-semibold mb-3">Pioniere del Fitness Funzionale</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Marco supervisiona ogni protocollo atletico. La sua esperienza guida i nostri professionisti nella creazione di abitudini sostenibili, garantendo risultati d'elite a ogni cliente.
              </p>
            </div>
          </FadeIn>
        </div>
      </Section>

      {/* ─── 6-STEP PROCESS ─── */}
      <Section className="bg-white" id="metodo">
        <FadeIn>
          <div className="text-center mb-14">
            <span className="text-sm font-bold text-[#503AA8] uppercase tracking-wider">Il Metodo</span>
            <h2 className="text-3xl font-extrabold mt-2">Come funziona</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Un percorso strutturato in 6 fasi per portarti dai tuoi obiettivi all'autonomia totale.
            </p>
          </div>
        </FadeIn>

        <div className="space-y-6">
          {[
            {
              icon: <Phone className="w-5 h-5" />,
              title: 'Videocall conoscitiva gratuita',
              desc: 'Partiamo da te. Capiamo i tuoi obiettivi, la tua storia, le tue difficolta\' passate. Ti indirizziamo verso il percorso piu\' adatto — senza impegno, senza pressione.',
              highlight: 'Parti gia\' con chiarezza, senza sprecare tempo e soldi in soluzioni sbagliate.',
            },
            {
              icon: <Target className="w-5 h-5" />,
              title: 'Valutazione approfondita',
              desc: 'Analizziamo la tua situazione attuale: composizione corporea, abitudini alimentari, livello di attivita\', eventuali blocchi psicologici. Niente viene lasciato al caso.',
              highlight: 'Un piano costruito su di te, non un template copia-incolla.',
            },
            {
              icon: <Salad className="w-5 h-5" />,
              title: 'Piano d\'azione personalizzato',
              desc: 'Ricevi il tuo programma: alimentazione, allenamento e (nel percorso Holo) lavoro sul mindset. Tutto spiegato, tutto praticabile nella tua vita reale.',
              highlight: 'Sai esattamente cosa fare, giorno per giorno.',
            },
            {
              icon: <Shield className="w-5 h-5" />,
              title: 'Affiancamento continuo',
              desc: 'Hai un dubbio? Il Team risponde. Un momento difficile? Ilaria e Marco sono con te. Non sei mai solo. Gli aggiustamenti sono costanti.',
              highlight: 'Monitoriamo i tuoi progressi e perfezioniamo il piano in tempo reale.',
            },
            {
              icon: <Clock className="w-5 h-5" />,
              title: 'Aggiustamenti in corsa',
              desc: 'Il corpo cambia, la vita cambia. Noi monitoriamo i tuoi progressi e modifichiamo il piano quando serve. Niente rigidita\', solo risultati.',
              highlight: 'Un percorso che si adatta a te, non il contrario.',
            },
            {
              icon: <Award className="w-5 h-5" />,
              title: 'Autonomia finale',
              desc: 'L\'obiettivo non e\' renderti dipendente da noi. E\' darti gli strumenti per continuare da solo, con consapevolezza. Quando finisci, sai camminare con le tue gambe.',
              highlight: 'Risultati che mantieni per sempre.',
            },
          ].map((step, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="flex gap-4 sm:gap-6">
                {/* Step number */}
                <div className="shrink-0 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#503AA8] text-white flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  {i < 5 && <div className="w-0.5 flex-1 bg-[#503AA8]/20 mt-2" />}
                </div>

                {/* Content */}
                <div className="pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#503AA8]">{step.icon}</span>
                    <h3 className="font-bold text-lg">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-2">{step.desc}</p>
                  <p className="text-sm font-semibold text-[#503AA8]">{step.highlight}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.5}>
          <div className="text-center mt-10">
            <CTAButton />
          </div>
        </FadeIn>
      </Section>

      {/* ─── PER TE / NON PER TE ─── */}
      <Section className="bg-gray-50" id="per-chi">
        <FadeIn>
          <div className="text-center mb-12">
            <span className="text-sm font-bold text-[#503AA8] uppercase tracking-wider">Per chi e'</span>
            <h2 className="text-3xl font-extrabold mt-2">Fa per te?</h2>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 gap-6">
          <FadeIn delay={0.1}>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-green-200 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-green-700">E' per te se...</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Hai gia\' provato diete e allenamenti, ma non sei riuscita a mantenere i risultati',
                  'Vuoi un approccio serio, basato sulla scienza, non l\'ennesima moda',
                  'Cerchi professionisti qualificati, non influencer improvvisati',
                  'Sei pronta a impegnarti in un percorso (minimo 3 mesi)',
                  'Vuoi risultati duraturi, non la soluzione magica in 7 giorni',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-red-200 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="font-bold text-lg text-red-700">NON e' per te se...</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Cerchi la pillola magica o la scorciatoia',
                  'Non sei disposta a metterti in gioco',
                  'Vuoi solo qualcuno che ti dia un PDF e scompaia',
                  'Pensi che "non hai tempo" per prenderti cura di te',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </Section>

      {/* ─── CTA BANNER 2 ─── */}
      <section className="bg-gradient-to-r from-[#503AA8] to-[#6B4FCF] py-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              La tua trasformazione inizia con una chiamata
            </h3>
            <p className="text-purple-200 mb-8 text-lg">
              Prenota una video call gratuita e scopri il percorso giusto per te
            </p>
            <CTAButton />
          </FadeIn>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <Section className="bg-white" id="faq">
        <FadeIn>
          <div className="text-center mb-12">
            <span className="text-sm font-bold text-[#503AA8] uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl font-extrabold mt-2">Domande frequenti</h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="max-w-3xl mx-auto">
            <FAQItem
              question="Che cos'e' 362gradi?"
              answer="362gradi e' un approccio completo al benessere che integra nutrizione, allenamento e supporto psicologico. Il nostro team di Biologi Nutrizionisti, Trainer qualificati e Psicologi lavora insieme per creare percorsi personalizzati che ti accompagnano verso una trasformazione duratura a 360°."
            />
            <FAQItem
              question="Come funziona il vostro metodo?"
              answer="Il nostro metodo si basa su tre pilastri fondamentali: alimentazione personalizzata, allenamento mirato e supporto psicologico. Iniziamo con un'analisi approfondita delle tue esigenze, definiamo obiettivi realistici e ti accompagniamo con un supporto costante attraverso videochiamate, piani personalizzati e monitoraggio continuo."
            />
            <FAQItem
              question="Quanto dura un percorso?"
              answer="I nostri percorsi hanno durate di 3, 6 e 12 mesi. La durata ottimale viene stabilita durante la consulenza iniziale in base ai tuoi obiettivi e alla tua situazione di partenza, permettendoti di scegliere il programma piu' adatto alle tue esigenze."
            />
            <FAQItem
              question="E' incluso il supporto psicologico in tutti i percorsi?"
              answer="Si', il supporto psicologico e' parte integrante del nostro approccio olistico. Comprendiamo che la trasformazione fisica passa anche attraverso il benessere mentale, per questo ogni percorso include sessioni con i nostri psicologi specializzati."
            />
            <FAQItem
              question="Posso seguire il programma se ho particolari esigenze alimentari?"
              answer="Assolutamente si'! I nostri Biologi Nutrizionisti creano piani alimentari completamente personalizzati, tenendo conto di intolleranze, allergie, preferenze alimentari e qualsiasi altra esigenza specifica. Ogni piano e' studiato su misura per te."
            />
            <FAQItem
              question="Gli allenamenti sono adatti anche ai principianti?"
              answer="Certamente! I nostri trainer qualificati progettano programmi di allenamento adatti a tutti i livelli, dai principianti agli atleti piu' esperti. Ogni programma e' personalizzato in base alla tua forma fisica attuale e ai tuoi obiettivi."
            />
          </div>
        </FadeIn>
      </Section>

      {/* ─── FINAL CTA ─── */}
      <section className="bg-gray-900 py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Inizia il tuo percorso oggi
            </h3>
            <p className="text-gray-400 mb-8">
              Una video call conoscitiva gratuita, senza impegno, senza pressione.
            </p>
            <CTAButton />
          </FadeIn>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-950 py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-white font-bold text-lg">362gradi</h4>
              <p className="text-gray-500 text-sm mt-1">Nutrizione • Allenamento • Psicologia</p>
            </div>

            <div className="flex items-center gap-6">
              <a href="mailto:info@362gradi.eu" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                <Mail className="w-4 h-4" />
                info@362gradi.eu
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-green-400 text-sm transition-colors">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-xs">&copy; 2026 362 Gradi. Tutti i diritti riservati.</p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <a href="#" className="hover:text-gray-400 transition-colors">Termini e Condizioni</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
