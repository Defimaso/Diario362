// Contenuti estesi "Lo Spirito dell'Animale" per ogni badge
// Ogni animale ha qualità positive, descrizione e messaggi motivazionali

export interface SpiritContent {
  traits: string[];
  description: string;
  unlockMessage: string;
}

export const SPIRIT_CONTENTS: Record<number, SpiritContent> = {
  1: {
    traits: ['Agilità', 'Leggerezza', 'Persistenza', 'Gioia'],
    description: 'Il Colibrì è l\'unico uccello che può volare in tutte le direzioni. Rappresenta la capacità di adattarsi rapidamente e trovare dolcezza in ogni momento del percorso.',
    unlockMessage: 'Completa il tuo primo check-in per risvegliare lo spirito del Colibrì',
  },
  2: {
    traits: ['Precisione', 'Trasformazione', 'Chiarezza', 'Equilibrio'],
    description: 'La Libellula simboleggia il cambiamento profondo. Nasce nell\'acqua e conquista l\'aria, proprio come tu stai trasformando il tuo corpo e la tua mente.',
    unlockMessage: 'Continua i tuoi check giornalieri per risvegliare lo spirito della Libellula',
  },
  3: {
    traits: ['Adattamento', 'Resilienza', 'Pazienza', 'Rinnovamento'],
    description: 'Il Geco può rigenerare la sua coda e adattarsi a qualsiasi ambiente. Incarna la capacità di riprendersi dalle difficoltà e prosperare in ogni situazione.',
    unlockMessage: 'Mantieni la costanza per risvegliare lo spirito del Geco',
  },
  4: {
    traits: ['Astuzia', 'Strategia', 'Intelligenza', 'Adattabilità'],
    description: 'La Volpe è maestra di strategia e adattamento. Usa l\'intelligenza per superare gli ostacoli, non la forza bruta. Ogni problema ha una soluzione elegante.',
    unlockMessage: 'Prosegui nel tuo percorso per risvegliare lo spirito della Volpe',
  },
  5: {
    traits: ['Visione', 'Concentrazione', 'Intuizione', 'Indipendenza'],
    description: 'La Lince vede ciò che altri non vedono. Con occhi che penetrano l\'oscurità, rappresenta la visione chiara del proprio obiettivo e la capacità di restare focalizzati.',
    unlockMessage: 'Una settimana di costanza ti attende. Risveglia lo spirito della Lince!',
  },
  6: {
    traits: ['Velocità', 'Grazia', 'Consapevolezza', 'Libertà'],
    description: 'La Gazzella corre con grazia e velocità. Non fugge, danza. Rappresenta il movimento elegante verso i propri obiettivi, con leggerezza ma determinazione.',
    unlockMessage: 'Raggiungi 15 giorni consecutivi per risvegliare lo spirito della Gazzella',
  },
  7: {
    traits: ['Prospettiva', 'Precisione', 'Pazienza', 'Libertà'],
    description: 'Il Falco osserva dall\'alto prima di agire. Vede il quadro completo e colpisce con precisione chirurgica. La prospettiva cambia tutto.',
    unlockMessage: 'Un mese di dedizione ti attende. Risveglia lo spirito del Falco!',
  },
  8: {
    traits: ['Potenza', 'Silenzio', 'Eleganza', 'Mistero'],
    description: 'La Pantera si muove nell\'ombra con potenza silente. Non ha bisogno di ruggire per essere temuta. La vera forza non richiede dimostrazione.',
    unlockMessage: 'Mantieni la rotta per risvegliare lo spirito della Pantera',
  },
  9: {
    traits: ['Lealtà', 'Comunità', 'Istinto', 'Protezione'],
    description: 'Il Lupo è fedele al branco e al proprio percorso. La lealtà verso i tuoi obiettivi ti renderà inarrestabile. Il branco interiore ti sostiene.',
    unlockMessage: 'Due mesi di costanza per risvegliare lo spirito del Lupo',
  },
  10: {
    traits: ['Determinazione', 'Coraggio', 'Potenza', 'Nobiltà'],
    description: 'La Tigre non si scusa per la sua potenza. La determinazione della Tigre scorre nelle tue vene, pronta a manifestarsi in ogni sfida.',
    unlockMessage: 'Raggiungi 75 giorni per risvegliare lo spirito della Tigre!',
  },
  11: {
    traits: ['Esplosività', 'Agilità', 'Ferocia', 'Precisione'],
    description: 'Il Giaguaro combina la ferocia con la grazia. L\'esplosività nasce dalla pazienza, dalla quiete prima della tempesta.',
    unlockMessage: 'Continua il percorso per risvegliare lo spirito del Giaguaro',
  },
  12: {
    traits: ['Coraggio', 'Leadership', 'Protezione', 'Nobiltà'],
    description: 'Il Leone non cerca approvazione. Comanda con il cuore e protegge con la forza. Hai raggiunto il livello dove la tua determinazione ispira gli altri.',
    unlockMessage: 'La corona del Leone ti attende. Raggiungi 115 giorni!',
  },
  13: {
    traits: ['Dominio', 'Visione', 'Libertà', 'Maestà'],
    description: 'L\'Aquila Reale domina i cieli. Vola così in alto che le tempeste restano sotto di lei. Dominare significa servire con eccellenza.',
    unlockMessage: 'Continua a volare alto per risvegliare lo spirito dell\'Aquila Reale',
  },
  14: {
    traits: ['Focus', 'Persistenza', 'Adattamento', 'Potenza'],
    description: 'Lo Squalo Bianco è puro focus. Non si ferma mai, non si distrae mai. Il focus implacabile non conosce distrazioni.',
    unlockMessage: 'Il focus dello Squalo richiede 155 giorni di dedizione',
  },
  15: {
    traits: ['Resistenza', 'Visione', 'Maestà', 'Pazienza'],
    description: 'Il Condor può planare per ore senza un battito d\'ala. La resistenza estrema è il tuo superpotere, costruita giorno dopo giorno.',
    unlockMessage: 'Raggiungi 175 giorni per risvegliare lo spirito del Condor',
  },
  16: {
    traits: ['Rarità', 'Resilienza', 'Mistero', 'Eleganza'],
    description: 'Il Leopardo delle Nevi vive dove altri non osano. Sei raro. La resilienza è la tua firma in un mondo che preferisce la mediocrità.',
    unlockMessage: 'Solo i più determinati raggiungono il Leopardo delle Nevi',
  },
  17: {
    traits: ['Forza', 'Eleganza', 'Nobiltà', 'Libertà'],
    description: 'Lo Stallone Nero unisce forza grezza ed eleganza pura. Forza ed eleganza danzano insieme, mai in conflitto.',
    unlockMessage: 'La forza dello Stallone richiede 235 giorni di percorso',
  },
  18: {
    traits: ['Velocità', 'Precisione', 'Performance', 'Eccellenza'],
    description: 'Il Ghepardo è il pinnacolo della velocità terrestre. Sei al picco. La performance è arte quando eseguita con maestria.',
    unlockMessage: 'Il picco della performance ti aspetta a 265 giorni',
  },
  19: {
    traits: ['Rinascita', 'Trasformazione', 'Immortalità', 'Potere'],
    description: 'La Fenice risorge dalle proprie ceneri, più forte di prima. Dalle ceneri sei rinato. Nulla può fermarti, ogni caduta è un nuovo inizio.',
    unlockMessage: 'La rinascita della Fenice attende chi raggiunge 295 giorni',
  },
  20: {
    traits: ['Maestria', 'Saggezza', 'Potere Supremo', 'Immortalità'],
    description: 'Il Drago 362° è lo stato supremo di maestria. Hai trasceso i limiti ordinari e raggiunto ciò che pochi osano sognare. Sei diventato il Drago.',
    unlockMessage: 'Solo 300 check-in totali sbloccano il leggendario Drago 362°',
  },
};

export const getSpiritContent = (badgeId: number): SpiritContent => {
  return SPIRIT_CONTENTS[badgeId] || {
    traits: ['Mistero', 'Scoperta'],
    description: 'Uno spirito ancora da scoprire nel tuo percorso.',
    unlockMessage: 'Continua il percorso per scoprire questo spirito',
  };
};
