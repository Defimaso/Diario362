// Elite Evolution Badge System - 20 Levels of Mastery (Percorso Edition)

export interface Badge {
  id: number;
  name: string;
  emoji: string;
  description: string;
  motivationalQuote: string;
  requiredStreak: number;
  requiredTotalCheckins: number;
  phase: 'immediate' | 'consolidation' | 'transformation' | 'mastery';
}

export const ELITE_BADGES: Badge[] = [
  // Phase 1: Inizio Percorso (Week 1) - Days 1, 2, 4, 6, 7
  {
    id: 1,
    name: 'Primo Passo',
    emoji: '👣',
    description: 'Il viaggio inizia',
    motivationalQuote: 'Ogni grande cambiamento inizia con un singolo passo.',
    requiredStreak: 1,
    requiredTotalCheckins: 1,
    phase: 'immediate',
  },
  {
    id: 2,
    name: 'Doppio Check',
    emoji: '✌️',
    description: 'Due giorni di fila',
    motivationalQuote: 'Due giorni consecutivi: la costanza sta nascendo.',
    requiredStreak: 2,
    requiredTotalCheckins: 2,
    phase: 'immediate',
  },
  {
    id: 3,
    name: 'Ritmo',
    emoji: '🎯',
    description: 'Stai trovando il ritmo',
    motivationalQuote: 'Il ritmo si costruisce giorno dopo giorno. Continua cosi\'!',
    requiredStreak: 4,
    requiredTotalCheckins: 4,
    phase: 'immediate',
  },
  {
    id: 4,
    name: 'Determinazione',
    emoji: '💪',
    description: 'Sei determinata',
    motivationalQuote: 'La determinazione e\' il carburante del cambiamento.',
    requiredStreak: 6,
    requiredTotalCheckins: 6,
    phase: 'immediate',
  },
  {
    id: 5,
    name: 'Prima Settimana',
    emoji: '⭐',
    description: 'Una settimana intera!',
    motivationalQuote: '7 giorni di costanza. La prima grande milestone e\' tua!',
    requiredStreak: 7,
    requiredTotalCheckins: 7,
    phase: 'immediate',
  },

  // Phase 2: Consolidamento (Months 1-3)
  {
    id: 6,
    name: 'Abitudine',
    emoji: '🔄',
    description: 'L\'abitudine si consolida',
    motivationalQuote: 'Ci vogliono 15 giorni per iniziare a formare un\'abitudine. Ce l\'hai fatta.',
    requiredStreak: 15,
    requiredTotalCheckins: 15,
    phase: 'consolidation',
  },
  {
    id: 7,
    name: 'Un Mese',
    emoji: '🌙',
    description: '30 giorni di percorso',
    motivationalQuote: 'Un mese intero di dedizione. La trasformazione e\' in corso.',
    requiredStreak: 30,
    requiredTotalCheckins: 30,
    phase: 'consolidation',
  },
  {
    id: 8,
    name: 'Equilibrio',
    emoji: '⚖️',
    description: 'Hai trovato il tuo equilibrio',
    motivationalQuote: 'L\'equilibrio tra corpo e mente si costruisce con la pratica quotidiana.',
    requiredStreak: 45,
    requiredTotalCheckins: 45,
    phase: 'consolidation',
  },
  {
    id: 9,
    name: 'Due Mesi',
    emoji: '🔥',
    description: '60 giorni inarrestabili',
    motivationalQuote: 'Due mesi di costanza. La tua forza interiore brilla.',
    requiredStreak: 60,
    requiredTotalCheckins: 60,
    phase: 'consolidation',
  },
  {
    id: 10,
    name: 'Radici Profonde',
    emoji: '🌳',
    description: '75 giorni: le radici sono solide',
    motivationalQuote: 'Le radici della tua nuova vita sono profonde. Niente puo\' fermarti.',
    requiredStreak: 75,
    requiredTotalCheckins: 75,
    phase: 'consolidation',
  },

  // Phase 3: Trasformazione (Months 4-6)
  {
    id: 11,
    name: 'Slancio',
    emoji: '🚀',
    description: 'Velocita\' e focus',
    motivationalQuote: 'Lo slancio e\' dalla tua parte. Corri verso i tuoi obiettivi.',
    requiredStreak: 95,
    requiredTotalCheckins: 95,
    phase: 'transformation',
  },
  {
    id: 12,
    name: 'Resilienza',
    emoji: '🛡️',
    description: 'Niente ti ferma piu\'',
    motivationalQuote: 'La resilienza non e\' evitare le difficolta\', ma attraversarle.',
    requiredStreak: 115,
    requiredTotalCheckins: 115,
    phase: 'transformation',
  },
  {
    id: 13,
    name: 'Liberta\'',
    emoji: '🕊️',
    description: 'Il percorso ti ha liberata',
    motivationalQuote: 'La vera liberta\' e\' sentirsi bene nel proprio corpo e nella propria mente.',
    requiredStreak: 135,
    requiredTotalCheckins: 135,
    phase: 'transformation',
  },
  {
    id: 14,
    name: 'Saggezza',
    emoji: '💎',
    description: 'La consapevolezza e\' il tuo diamante',
    motivationalQuote: 'La saggezza viene dall\'esperienza. Tu l\'hai costruita giorno dopo giorno.',
    requiredStreak: 155,
    requiredTotalCheckins: 155,
    phase: 'transformation',
  },
  {
    id: 15,
    name: 'Mezzo Anno',
    emoji: '🏔️',
    description: '175 giorni: sei in vetta',
    motivationalQuote: 'Sei arrivata sulla montagna. Il panorama da qui e\' incredibile.',
    requiredStreak: 175,
    requiredTotalCheckins: 175,
    phase: 'transformation',
  },

  // Phase 4: Mastery (Months 7-12)
  {
    id: 16,
    name: 'Forza Interiore',
    emoji: '🏋️‍♀️',
    description: 'La vera forza e\' dentro di te',
    motivationalQuote: 'La forza non viene dal corpo, viene dalla volonta\' indomabile.',
    requiredStreak: 205,
    requiredTotalCheckins: 205,
    phase: 'mastery',
  },
  {
    id: 17,
    name: 'Splendore',
    emoji: '✨',
    description: 'Brilli di luce propria',
    motivationalQuote: 'La tua trasformazione ispira chi ti circonda. Brilla!',
    requiredStreak: 235,
    requiredTotalCheckins: 235,
    phase: 'mastery',
  },
  {
    id: 18,
    name: 'Inarrestabile',
    emoji: '⚡',
    description: 'Nulla puo\' fermarti',
    motivationalQuote: 'Sei una forza della natura. Il focus e\' il tuo superpotere.',
    requiredStreak: 265,
    requiredTotalCheckins: 265,
    phase: 'mastery',
  },
  {
    id: 19,
    name: 'Dedizione',
    emoji: '👑',
    description: 'La corona della costanza',
    motivationalQuote: 'La dedizione ai tuoi obiettivi ti ha resa una regina.',
    requiredStreak: 295,
    requiredTotalCheckins: 295,
    phase: 'mastery',
  },
  {
    id: 20,
    name: 'Maestra 362°',
    emoji: '🏆',
    description: 'Lo Stato di Maestra',
    motivationalQuote: 'Sei diventata la Maestra del tuo percorso. 362 gradi di evoluzione!',
    requiredStreak: 300,
    requiredTotalCheckins: 300,
    phase: 'mastery',
  },
];

export const getPhaseInfo = (phase: Badge['phase']) => {
  switch (phase) {
    case 'immediate':
      return { name: 'Inizio Percorso', description: 'Settimana 1', color: 'hsl(38, 92%, 50%)' };
    case 'consolidation':
      return { name: 'Consolidamento', description: 'Mesi 1-3', color: 'hsl(173, 55%, 45%)' };
    case 'transformation':
      return { name: 'Trasformazione', description: 'Mesi 4-6', color: 'hsl(280, 70%, 50%)' };
    case 'mastery':
      return { name: 'Mastery', description: 'Mesi 7-12', color: 'hsl(45, 100%, 50%)' };
  }
};

export const getCurrentBadge = (streak: number, totalCheckins: number): Badge => {
  let currentBadge = ELITE_BADGES[0];

  for (const badge of ELITE_BADGES) {
    if (badge.id === 20) {
      if (totalCheckins >= 300) {
        currentBadge = badge;
      }
    } else if (streak >= badge.requiredStreak || totalCheckins >= badge.requiredTotalCheckins) {
      currentBadge = badge;
    }
  }

  return currentBadge;
};

export const getNextBadge = (streak: number, totalCheckins: number): Badge | null => {
  const currentBadge = getCurrentBadge(streak, totalCheckins);
  const nextBadgeIndex = ELITE_BADGES.findIndex(b => b.id === currentBadge.id) + 1;

  if (nextBadgeIndex >= ELITE_BADGES.length) {
    return null;
  }

  return ELITE_BADGES[nextBadgeIndex];
};

export const getCheckinsToNextBadge = (streak: number, totalCheckins: number): number => {
  const nextBadge = getNextBadge(streak, totalCheckins);
  if (!nextBadge) return 0;

  if (nextBadge.id === 20) {
    return Math.max(0, 300 - totalCheckins);
  }

  return Math.max(0, nextBadge.requiredStreak - streak);
};

export const getUnlockedBadges = (streak: number, totalCheckins: number): Badge[] => {
  return ELITE_BADGES.filter(badge => {
    if (badge.id === 20) {
      return totalCheckins >= 300;
    }
    return streak >= badge.requiredStreak || totalCheckins >= badge.requiredTotalCheckins;
  });
};

export const getLockedBadges = (streak: number, totalCheckins: number): Badge[] => {
  return ELITE_BADGES.filter(badge => {
    if (badge.id === 20) {
      return totalCheckins < 300;
    }
    return streak < badge.requiredStreak && totalCheckins < badge.requiredTotalCheckins;
  });
};

export const getBadgeProgress = (streak: number, totalCheckins: number): number => {
  const currentBadge = getCurrentBadge(streak, totalCheckins);
  const nextBadge = getNextBadge(streak, totalCheckins);

  if (!nextBadge) return 100;

  const currentReq = currentBadge.requiredStreak;
  const nextReq = nextBadge.id === 20 ? 300 : nextBadge.requiredStreak;
  const currentValue = nextBadge.id === 20 ? totalCheckins : streak;

  const progress = ((currentValue - currentReq) / (nextReq - currentReq)) * 100;
  return Math.min(100, Math.max(0, progress));
};

export const isClientAtRisk = (
  currentBadge: Badge,
  daysSinceLastCheckin: number,
  previousBadge?: Badge
): boolean => {
  if (daysSinceLastCheckin > 3) return true;

  if (!previousBadge) return false;

  const riskThresholds = {
    immediate: 7,
    consolidation: 20,
    transformation: 25,
    mastery: 35,
  };

  return daysSinceLastCheckin > riskThresholds[currentBadge.phase];
};
