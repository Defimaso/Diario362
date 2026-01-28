// Elite Evolution Badge System - 20 Levels of Mastery (Kawaii Edition)

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
    name: 'Leone',
    emoji: '🦁',
    description: 'Coraggio iniziale',
    motivationalQuote: 'Il coraggio non è l\'assenza di paura, ma agire nonostante essa.',
    requiredStreak: 1,
    requiredTotalCheckins: 1,
    phase: 'immediate',
  },
  {
    id: 2,
    name: 'Tartaruga',
    emoji: '🐢',
    description: 'Costanza',
    motivationalQuote: 'Lento e costante vince la corsa.',
    requiredStreak: 2,
    requiredTotalCheckins: 2,
    phase: 'immediate',
  },
  {
    id: 3,
    name: 'Ape',
    emoji: '🐝',
    description: 'Operosità',
    motivationalQuote: 'Ogni piccolo sforzo costruisce il grande successo.',
    requiredStreak: 4,
    requiredTotalCheckins: 4,
    phase: 'immediate',
  },
  {
    id: 4,
    name: 'Formica',
    emoji: '🐜',
    description: 'Disciplina',
    motivationalQuote: 'La disciplina è il ponte tra obiettivi e risultati.',
    requiredStreak: 6,
    requiredTotalCheckins: 6,
    phase: 'immediate',
  },
  {
    id: 5,
    name: 'Aquila',
    emoji: '🦅',
    description: 'Prima Milestone: Visione',
    motivationalQuote: 'Vola alto e vedi oltre l\'orizzonte. La prima settimana è tua!',
    requiredStreak: 7,
    requiredTotalCheckins: 7,
    phase: 'immediate',
  },

  // Phase 2: Consolidamento (Months 1-3)
  {
    id: 6,
    name: 'Lupo',
    emoji: '🐺',
    description: 'Lealtà al percorso',
    motivationalQuote: 'Il branco segue chi è fedele al proprio cammino.',
    requiredStreak: 15,
    requiredTotalCheckins: 15,
    phase: 'consolidation',
  },
  {
    id: 7,
    name: 'Farfalla',
    emoji: '🦋',
    description: 'Trasformazione',
    motivationalQuote: 'La metamorfosi richiede tempo, ma il risultato è magnifico.',
    requiredStreak: 30,
    requiredTotalCheckins: 30,
    phase: 'consolidation',
  },
  {
    id: 8,
    name: 'Delfino',
    emoji: '🐬',
    description: 'Armonia',
    motivationalQuote: 'Naviga le onde della vita con grazia e intelligenza.',
    requiredStreak: 45,
    requiredTotalCheckins: 45,
    phase: 'consolidation',
  },
  {
    id: 9,
    name: 'Tigre',
    emoji: '🐯',
    description: 'Potenza controllata',
    motivationalQuote: 'La vera forza sta nel controllo, non nell\'impeto.',
    requiredStreak: 60,
    requiredTotalCheckins: 60,
    phase: 'consolidation',
  },
  {
    id: 10,
    name: 'Elefante',
    emoji: '🐘',
    description: 'Secondo Milestone: Memoria e Saggezza',
    motivationalQuote: 'La memoria del percorso ti rende saggio. 75 giorni di costanza!',
    requiredStreak: 75,
    requiredTotalCheckins: 75,
    phase: 'consolidation',
  },

  // Phase 3: Trasformazione (Months 4-6)
  {
    id: 11,
    name: 'Ghepardo',
    emoji: '🐆',
    description: 'Velocità e agilità',
    motivationalQuote: 'La velocità senza direzione è inutile. Tu hai entrambe.',
    requiredStreak: 95,
    requiredTotalCheckins: 95,
    phase: 'transformation',
  },
  {
    id: 12,
    name: 'Scimmia',
    emoji: '🐒',
    description: 'Intelligenza adattiva',
    motivationalQuote: 'L\'intelligenza è sapersi adattare al cambiamento.',
    requiredStreak: 115,
    requiredTotalCheckins: 115,
    phase: 'transformation',
  },
  {
    id: 13,
    name: 'Cavallo',
    emoji: '🐎',
    description: 'Libertà e nobiltà',
    motivationalQuote: 'Corri libero verso i tuoi sogni, nobile guerriero.',
    requiredStreak: 135,
    requiredTotalCheckins: 135,
    phase: 'transformation',
  },
  {
    id: 14,
    name: 'Gufo',
    emoji: '🦉',
    description: 'Saggezza profonda',
    motivationalQuote: 'La saggezza viene dall\'osservare e imparare in silenzio.',
    requiredStreak: 155,
    requiredTotalCheckins: 155,
    phase: 'transformation',
  },
  {
    id: 15,
    name: 'Canguro',
    emoji: '🦘',
    description: 'Resilienza',
    motivationalQuote: 'Ogni salto in avanti ti avvicina alla meta.',
    requiredStreak: 175,
    requiredTotalCheckins: 175,
    phase: 'transformation',
  },

  // Phase 4: Mastery (Months 7-12)
  {
    id: 16,
    name: 'Orso',
    emoji: '🐻',
    description: 'Forza interiore',
    motivationalQuote: 'La vera forza nasce dalla quiete interiore.',
    requiredStreak: 205,
    requiredTotalCheckins: 205,
    phase: 'mastery',
  },
  {
    id: 17,
    name: 'Pavone',
    emoji: '🦚',
    description: 'Bellezza autentica',
    motivationalQuote: 'Mostra al mondo la bellezza della tua trasformazione.',
    requiredStreak: 235,
    requiredTotalCheckins: 235,
    phase: 'mastery',
  },
  {
    id: 18,
    name: 'Squalo',
    emoji: '🦈',
    description: 'Focus implacabile',
    motivationalQuote: 'Muoviti sempre in avanti, senza mai fermarti.',
    requiredStreak: 265,
    requiredTotalCheckins: 265,
    phase: 'mastery',
  },
  {
    id: 19,
    name: 'Cane',
    emoji: '🐕',
    description: 'Fedeltà assoluta',
    motivationalQuote: 'La fedeltà ai tuoi obiettivi è la chiave del successo.',
    requiredStreak: 295,
    requiredTotalCheckins: 295,
    phase: 'mastery',
  },
  {
    id: 20,
    name: 'Toro',
    emoji: '🐂',
    description: 'Lo Stato di Maestro',
    motivationalQuote: 'Sei diventato il Toro 362°. La Maestria è tua!',
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
