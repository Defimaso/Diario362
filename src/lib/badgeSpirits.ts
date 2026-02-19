// Contenuti estesi per ogni milestone del Percorso
// Ogni livello ha qualita', descrizione e messaggi motivazionali

export interface SpiritContent {
  traits: string[];
  description: string;
  unlockMessage: string;
}

export const SPIRIT_CONTENTS: Record<number, SpiritContent> = {
  1: {
    traits: ['Coraggio', 'Inizio', 'Volonta\'', 'Apertura'],
    description: 'Il primo passo e\' il piu\' importante. Hai avuto il coraggio di iniziare, e questo ti distingue dalla maggior parte delle persone che rimandano a domani.',
    unlockMessage: 'Completa il tuo primo diario per sbloccare questo livello',
  },
  2: {
    traits: ['Costanza', 'Ritorno', 'Impegno', 'Continuita\''],
    description: 'Sei tornata il secondo giorno. Non e\' scontato. Dimostra che non era un impulso, ma una decisione consapevole.',
    unlockMessage: 'Compila il diario per 2 giorni consecutivi',
  },
  3: {
    traits: ['Ritmo', 'Disciplina', 'Focus', 'Dedizione'],
    description: 'Il ritmo e\' la base di ogni trasformazione. 4 giorni di costanza significano che stai creando una routine che funziona.',
    unlockMessage: 'Mantieni 4 giorni consecutivi di diario',
  },
  4: {
    traits: ['Determinazione', 'Forza', 'Tenacia', 'Grinta'],
    description: 'Sei quasi alla prima settimana. La determinazione che dimostri ogni giorno sta costruendo le fondamenta di una nuova te.',
    unlockMessage: 'Prosegui per 6 giorni consecutivi',
  },
  5: {
    traits: ['Milestone', 'Celebrazione', 'Orgoglio', 'Fiducia'],
    description: 'Una settimana intera! Questa e\' la prima grande milestone. Hai dimostrato che sei capace di mantener un impegno quotidiano. Celebra questo traguardo!',
    unlockMessage: 'Completa 7 giorni consecutivi per la prima grande milestone!',
  },
  6: {
    traits: ['Abitudine', 'Automatismo', 'Consistenza', 'Crescita'],
    description: '15 giorni consecutivi. Le neuroscienze dicono che l\'abitudine si sta formando. Il diario non e\' piu\' uno sforzo, sta diventando parte di te.',
    unlockMessage: 'Raggiungi 15 giorni consecutivi',
  },
  7: {
    traits: ['Trasformazione', 'Perseveranza', 'Evoluzione', 'Profondita\''],
    description: 'Un mese intero di percorso. Guarda quanto sei cambiata in 30 giorni. I dati del diario raccontano la tua evoluzione.',
    unlockMessage: 'Un mese di costanza ti attende — 30 giorni consecutivi!',
  },
  8: {
    traits: ['Equilibrio', 'Armonia', 'Stabilita\'', 'Benessere'],
    description: '45 giorni di equilibrio. Corpo, mente e nutrizione stanno trovando la loro armonia. Il benessere e\' diventato il tuo stile di vita.',
    unlockMessage: 'Mantieni l\'equilibrio per 45 giorni consecutivi',
  },
  9: {
    traits: ['Potenza', 'Energia', 'Intensita\'', 'Passione'],
    description: 'Due mesi di fuoco. La tua energia e\' al massimo, la motivazione non e\' piu\' necessaria — hai la disciplina. Sei inarrestabile.',
    unlockMessage: 'Raggiungi 60 giorni consecutivi',
  },
  10: {
    traits: ['Solidita\'', 'Fondamenta', 'Radicamento', 'Stabilita\''],
    description: '75 giorni. Le radici del tuo nuovo stile di vita sono profonde e solide. Nessuna tentazione, nessun ostacolo puo\' sradicare quello che hai costruito.',
    unlockMessage: 'Raggiungi 75 giorni per piantare radici profonde!',
  },
  11: {
    traits: ['Velocita\'', 'Slancio', 'Accelerazione', 'Dinamismo'],
    description: 'Lo slancio e\' dalla tua parte. 95 giorni di costanza ti hanno dato una velocita\' che gli altri possono solo invidiare. Vola!',
    unlockMessage: 'Continua il percorso fino a 95 giorni',
  },
  12: {
    traits: ['Resilienza', 'Forza d\'animo', 'Adattamento', 'Tenacia'],
    description: 'In 115 giorni hai affrontato giornate no, imprevisti, stanchezza — e non ti sei mai fermata. La resilienza e\' la qualita\' piu\' preziosa che hai sviluppato.',
    unlockMessage: 'La resilienza si sblocca a 115 giorni',
  },
  13: {
    traits: ['Liberta\'', 'Leggerezza', 'Serenita\'', 'Autenticita\''],
    description: 'La vera liberta\' e\' sentirsi bene nel proprio corpo e nella propria mente. 135 giorni di percorso ti hanno regalato questa leggerezza.',
    unlockMessage: 'Raggiungi 135 giorni per sbloccare la liberta\'',
  },
  14: {
    traits: ['Saggezza', 'Consapevolezza', 'Intuizione', 'Chiarezza'],
    description: 'La consapevolezza e\' il tuo diamante. Dopo 155 giorni sai ascoltare il tuo corpo, capisci cosa ti fa bene e cosa no. Questa saggezza e\' per sempre.',
    unlockMessage: 'La saggezza richiede 155 giorni di dedizione',
  },
  15: {
    traits: ['Vetta', 'Visione', 'Panoramica', 'Conquista'],
    description: 'Sei arrivata in vetta. 175 giorni, mezzo anno di trasformazione. Da quassu\' il panorama e\' mozzafiato e puoi vedere quanto lontano sei arrivata.',
    unlockMessage: 'Raggiungi 175 giorni — la vetta ti aspetta!',
  },
  16: {
    traits: ['Forza interiore', 'Potere personale', 'Autostima', 'Presenza'],
    description: 'La vera forza non viene dai muscoli, ma dalla volonta\' indomabile. 205 giorni hanno forgiato una forza interiore che nessuno puo\' toglierti.',
    unlockMessage: 'Solo le piu\' determinate raggiungono 205 giorni',
  },
  17: {
    traits: ['Splendore', 'Ispirazione', 'Luce', 'Magnetismo'],
    description: 'Brilli di luce propria. 235 giorni di percorso ti hanno trasformata in un esempio per chi ti circonda. La tua energia e\' contagiosa.',
    unlockMessage: 'Lo splendore richiede 235 giorni di percorso',
  },
  18: {
    traits: ['Inarrestabilita\'', 'Focus', 'Potenza', 'Determinazione'],
    description: 'Sei una forza della natura. 265 giorni di costanza assoluta. Il tuo focus e\' laser, la tua determinazione e\' d\'acciaio. Nulla puo\' fermarti.',
    unlockMessage: 'Diventa inarrestabile a 265 giorni',
  },
  19: {
    traits: ['Regalita\'', 'Eccellenza', 'Nobilta\'', 'Maestria'],
    description: 'La corona della costanza. 295 giorni di dedizione totale ti hanno resa una regina del tuo percorso. L\'eccellenza e\' il tuo standard.',
    unlockMessage: 'La corona della costanza attende chi raggiunge 295 giorni',
  },
  20: {
    traits: ['Maestria', 'Completezza', 'Trascendenza', 'Evoluzione Totale'],
    description: 'Sei la Maestra 362°. 300 diari completati. Hai trasceso ogni limite e raggiunto lo stato supremo del percorso. Sei l\'evoluzione incarnata.',
    unlockMessage: 'Solo 300 diari totali sbloccano la Maestra 362°',
  },
};

export const getSpiritContent = (badgeId: number): SpiritContent => {
  return SPIRIT_CONTENTS[badgeId] || {
    traits: ['Mistero', 'Scoperta'],
    description: 'Un livello ancora da scoprire nel tuo percorso.',
    unlockMessage: 'Continua il percorso per scoprire questo livello',
  };
};
