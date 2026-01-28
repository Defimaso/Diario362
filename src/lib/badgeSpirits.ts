// Contenuti estesi "Lo Spirito dell'Animale" per ogni badge (Kawaii Edition)
// Ogni animale ha qualità positive, descrizione e messaggi motivazionali

export interface SpiritContent {
  traits: string[];
  description: string;
  unlockMessage: string;
}

export const SPIRIT_CONTENTS: Record<number, SpiritContent> = {
  1: {
    traits: ['Coraggio', 'Leadership', 'Protezione', 'Nobiltà'],
    description: 'Il Leone è il re della savana. Con la sua criniera maestosa, simboleggia il coraggio di iniziare un nuovo percorso. Ogni grande viaggio inizia con un singolo passo coraggioso.',
    unlockMessage: 'Completa il tuo primo check-in per risvegliare lo spirito del Leone',
  },
  2: {
    traits: ['Costanza', 'Pazienza', 'Saggezza', 'Longevità'],
    description: 'La Tartaruga ci insegna che la fretta è nemica del successo. Con passo lento ma costante, arriva sempre alla meta. La pazienza è la tua arma segreta.',
    unlockMessage: 'Continua i tuoi check giornalieri per risvegliare lo spirito della Tartaruga',
  },
  3: {
    traits: ['Operosità', 'Collaborazione', 'Dolcezza', 'Produttività'],
    description: 'L\'Ape lavora instancabilmente per creare qualcosa di dolce. Ogni piccolo sforzo quotidiano si trasforma nel miele del successo.',
    unlockMessage: 'Mantieni la costanza per risvegliare lo spirito dell\'Ape',
  },
  4: {
    traits: ['Disciplina', 'Forza', 'Organizzazione', 'Tenacia'],
    description: 'La Formica può sollevare 50 volte il suo peso. La disciplina quotidiana costruisce una forza straordinaria. Tu sei più forte di quanto pensi.',
    unlockMessage: 'Prosegui nel tuo percorso per risvegliare lo spirito della Formica',
  },
  5: {
    traits: ['Visione', 'Libertà', 'Prospettiva', 'Maestosità'],
    description: 'L\'Aquila vola più in alto di ogni altro uccello. Dalla sua prospettiva vede ciò che altri non vedono. Hai la visione del successo!',
    unlockMessage: 'Una settimana di costanza ti attende. Risveglia lo spirito dell\'Aquila!',
  },
  6: {
    traits: ['Lealtà', 'Istinto', 'Comunità', 'Resilienza'],
    description: 'Il Lupo è leale al branco e al proprio percorso. La fedeltà ai tuoi obiettivi ti renderà inarrestabile. Il branco interiore ti sostiene.',
    unlockMessage: 'Raggiungi 15 giorni consecutivi per risvegliare lo spirito del Lupo',
  },
  7: {
    traits: ['Trasformazione', 'Bellezza', 'Rinascita', 'Leggerezza'],
    description: 'La Farfalla nasce bruco e diventa la creatura più bella. La tua trasformazione è in corso, e sarà magnifica.',
    unlockMessage: 'Un mese di dedizione ti attende. Risveglia lo spirito della Farfalla!',
  },
  8: {
    traits: ['Armonia', 'Intelligenza', 'Gioia', 'Comunicazione'],
    description: 'Il Delfino naviga le onde con grazia e gioia. L\'intelligenza emotiva e l\'armonia ti guidano verso il successo.',
    unlockMessage: 'Mantieni la rotta per risvegliare lo spirito del Delfino',
  },
  9: {
    traits: ['Potenza', 'Coraggio', 'Determinazione', 'Eleganza'],
    description: 'La Tigre combina potenza e grazia in ogni movimento. La tua determinazione è bella da vedere. Ruggisci verso il successo!',
    unlockMessage: 'Due mesi di costanza per risvegliare lo spirito della Tigre',
  },
  10: {
    traits: ['Memoria', 'Saggezza', 'Famiglia', 'Longevità'],
    description: 'L\'Elefante non dimentica mai. La saggezza accumulata in 75 giorni ti accompagnerà per sempre. Sei diventato il custode del tuo percorso.',
    unlockMessage: 'Raggiungi 75 giorni per risvegliare lo spirito dell\'Elefante!',
  },
  11: {
    traits: ['Velocità', 'Agilità', 'Focus', 'Precisione'],
    description: 'Il Ghepardo è l\'animale più veloce sulla terra. La velocità nasce dalla preparazione. Sei pronto a correre verso i tuoi obiettivi.',
    unlockMessage: 'Continua il percorso per risvegliare lo spirito del Ghepardo',
  },
  12: {
    traits: ['Intelligenza', 'Adattabilità', 'Curiosità', 'Socialità'],
    description: 'La Scimmia usa l\'intelligenza per risolvere ogni problema. L\'adattabilità è la tua forza. Ogni ostacolo diventa un\'opportunità.',
    unlockMessage: 'La saggezza della Scimmia ti attende. Raggiungi 115 giorni!',
  },
  13: {
    traits: ['Libertà', 'Nobiltà', 'Potenza', 'Eleganza'],
    description: 'Il Cavallo corre libero nelle praterie. La nobiltà del tuo percorso ispira chi ti circonda. Galoppa verso la grandezza.',
    unlockMessage: 'Continua a galoppare per risvegliare lo spirito del Cavallo',
  },
  14: {
    traits: ['Saggezza', 'Intuizione', 'Mistero', 'Visione Notturna'],
    description: 'Il Gufo vede nell\'oscurità ciò che altri non vedono. La tua saggezza profonda illumina il cammino. Sei diventato la luce nella notte.',
    unlockMessage: 'La saggezza del Gufo richiede 155 giorni di dedizione',
  },
  15: {
    traits: ['Resilienza', 'Equilibrio', 'Forza', 'Protezione'],
    description: 'Il Canguro salta sempre in avanti, mai indietro. Ogni salto ti avvicina alla meta. La resilienza è il tuo superpotere.',
    unlockMessage: 'Raggiungi 175 giorni per risvegliare lo spirito del Canguro',
  },
  16: {
    traits: ['Forza', 'Protezione', 'Riflessione', 'Potenza'],
    description: 'L\'Orso combina forza bruta e saggezza pacifica. La vera forza nasce dalla quiete interiore. Sei diventato un guerriero saggio.',
    unlockMessage: 'Solo i più determinati raggiungono lo spirito dell\'Orso',
  },
  17: {
    traits: ['Bellezza', 'Orgoglio', 'Magnificenza', 'Autenticità'],
    description: 'Il Pavone mostra al mondo la sua bellezza senza timore. La tua trasformazione merita di essere celebrata. Mostra i tuoi colori!',
    unlockMessage: 'La magnificenza del Pavone richiede 235 giorni di percorso',
  },
  18: {
    traits: ['Focus', 'Determinazione', 'Potenza', 'Persistenza'],
    description: 'Lo Squalo non smette mai di muoversi. Il focus implacabile ti ha portato fin qui. Nulla può fermarti adesso.',
    unlockMessage: 'Il focus dello Squalo ti aspetta a 265 giorni',
  },
  19: {
    traits: ['Fedeltà', 'Amore', 'Protezione', 'Gioia'],
    description: 'Il Cane è il simbolo della fedeltà assoluta. La fedeltà ai tuoi obiettivi ti ha reso chi sei oggi. Sei il miglior amico di te stesso.',
    unlockMessage: 'La fedeltà del Cane attende chi raggiunge 295 giorni',
  },
  20: {
    traits: ['Maestria', 'Potenza', 'Determinazione', 'Immortalità'],
    description: 'Il Toro 362° è lo stato supremo di maestria. Hai trasceso i limiti ordinari e raggiunto ciò che pochi osano sognare. Sei diventato il Toro.',
    unlockMessage: 'Solo 300 check-in totali sbloccano il leggendario Toro 362°',
  },
};

export const getSpiritContent = (badgeId: number): SpiritContent => {
  return SPIRIT_CONTENTS[badgeId] || {
    traits: ['Mistero', 'Scoperta'],
    description: 'Uno spirito ancora da scoprire nel tuo percorso.',
    unlockMessage: 'Continua il percorso per scoprire questo spirito',
  };
};
