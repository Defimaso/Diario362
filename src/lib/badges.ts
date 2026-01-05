// Elite Evolution Badge System - 20 Levels of Mastery

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
  // Phase 1: Retention Immediata (Week 1) - Days 1, 2, 4, 6, 7
  {
    id: 1,
    name: 'Colibrì',
    emoji: '🐦',
    description: 'Agilità iniziale',
    motivationalQuote: 'Il viaggio di mille miglia inizia con un singolo battito d\'ali.',
    requiredStreak: 1,
    requiredTotalCheckins: 1,
    phase: 'immediate',
  },
  {
    id: 2,
    name: 'Libellula',
    emoji: '🪰',
    description: 'Precisione',
    motivationalQuote: 'La precisione è la madre del successo.',
    requiredStreak: 2,
    requiredTotalCheckins: 2,
    phase: 'immediate',
  },
  {
    id: 3,
    name: 'Geco',
    emoji: '🦎',
    description: 'Capacità di adattamento',
    motivationalQuote: 'L\'adattamento è la chiave della sopravvivenza.',
    requiredStreak: 4,
    requiredTotalCheckins: 4,
    phase: 'immediate',
  },
  {
    id: 4,
    name: 'Volpe',
    emoji: '🦊',
    description: 'Astuzia e strategia',
    motivationalQuote: 'La strategia batte la forza bruta.',
    requiredStreak: 6,
    requiredTotalCheckins: 6,
    phase: 'immediate',
  },
  {
    id: 5,
    name: 'Lince',
    emoji: '🐱',
    description: 'Primo Milestone: Visione',
    motivationalQuote: 'Hai la visione della Lince. La prima settimana è tua!',
    requiredStreak: 7,
    requiredTotalCheckins: 7,
    phase: 'immediate',
  },

  // Phase 2: Consolidamento (Months 1-3) - Every 15 consecutive days
  {
    id: 6,
    name: 'Gazzella',
    emoji: '🦌',
    description: 'Velocità',
    motivationalQuote: 'La velocità è nulla senza costanza.',
    requiredStreak: 15,
    requiredTotalCheckins: 15,
    phase: 'consolidation',
  },
  {
    id: 7,
    name: 'Falco',
    emoji: '🦅',
    description: 'Prospettiva',
    motivationalQuote: 'Vedi il mondo dall\'alto. La prospettiva è tutto.',
    requiredStreak: 30,
    requiredTotalCheckins: 30,
    phase: 'consolidation',
  },
  {
    id: 8,
    name: 'Pantera',
    emoji: '🐆',
    description: 'Potenza silenziosa',
    motivationalQuote: 'La vera potenza non ha bisogno di rumore.',
    requiredStreak: 45,
    requiredTotalCheckins: 45,
    phase: 'consolidation',
  },
  {
    id: 9,
    name: 'Lupo',
    emoji: '🐺',
    description: 'Lealtà al percorso',
    motivationalQuote: 'Il branco segue chi è leale al proprio percorso.',
    requiredStreak: 60,
    requiredTotalCheckins: 60,
    phase: 'consolidation',
  },
  {
    id: 10,
    name: 'Tigre',
    emoji: '🐅',
    description: 'Secondo Milestone: Determinazione',
    motivationalQuote: 'La determinazione della Tigre scorre nelle tue vene!',
    requiredStreak: 75,
    requiredTotalCheckins: 75,
    phase: 'consolidation',
  },

  // Phase 3: Trasformazione (Months 4-6) - Every 20 consecutive days
  {
    id: 11,
    name: 'Giaguaro',
    emoji: '🐆',
    description: 'Esplosività',
    motivationalQuote: 'L\'esplosività nasce dalla pazienza.',
    requiredStreak: 95,
    requiredTotalCheckins: 95,
    phase: 'transformation',
  },
  {
    id: 12,
    name: 'Leone',
    emoji: '🦁',
    description: 'Comando e coraggio',
    motivationalQuote: 'Il Re non cerca approvazione. Comanda con coraggio.',
    requiredStreak: 115,
    requiredTotalCheckins: 115,
    phase: 'transformation',
  },
  {
    id: 13,
    name: 'Aquila Reale',
    emoji: '🦅',
    description: 'Dominio',
    motivationalQuote: 'Dominare significa servire con eccellenza.',
    requiredStreak: 135,
    requiredTotalCheckins: 135,
    phase: 'transformation',
  },
  {
    id: 14,
    name: 'Squalo Bianco',
    emoji: '🦈',
    description: 'Focus implacabile',
    motivationalQuote: 'Il focus implacabile non conosce distrazioni.',
    requiredStreak: 155,
    requiredTotalCheckins: 155,
    phase: 'transformation',
  },
  {
    id: 15,
    name: 'Condor',
    emoji: '🦅',
    description: 'Resistenza estrema',
    motivationalQuote: 'La resistenza estrema è il tuo superpotere.',
    requiredStreak: 175,
    requiredTotalCheckins: 175,
    phase: 'transformation',
  },

  // Phase 4: Mastery (Months 7-12) - Every 30 consecutive days
  {
    id: 16,
    name: 'Leopardo delle Nevi',
    emoji: '🐆',
    description: 'Rarità e resilienza',
    motivationalQuote: 'Sei raro. La resilienza è la tua firma.',
    requiredStreak: 205,
    requiredTotalCheckins: 205,
    phase: 'mastery',
  },
  {
    id: 17,
    name: 'Stallone Nero',
    emoji: '🐴',
    description: 'Forza ed eleganza',
    motivationalQuote: 'Forza ed eleganza danzano insieme.',
    requiredStreak: 235,
    requiredTotalCheckins: 235,
    phase: 'mastery',
  },
  {
    id: 18,
    name: 'Ghepardo',
    emoji: '🐆',
    description: 'Il picco della performance',
    motivationalQuote: 'Sei al picco. La performance è arte.',
    requiredStreak: 265,
    requiredTotalCheckins: 265,
    phase: 'mastery',
  },
  {
    id: 19,
    name: 'Fenice',
    emoji: '🔥',
    description: 'Rinascita totale',
    motivationalQuote: 'Dalle ceneri sei rinato. Nulla può fermarti.',
    requiredStreak: 295,
    requiredTotalCheckins: 295,
    phase: 'mastery',
  },
  {
    id: 20,
    name: 'Drago 362°',
    emoji: '🐉',
    description: 'Lo Stato di Maestro',
    motivationalQuote: 'Sei diventato il Drago 362°. La Maestria è tua!',
    requiredStreak: 300, // Special: requires 300 total check-ins
    requiredTotalCheckins: 300,
    phase: 'mastery',
  },
];

export const getPhaseInfo = (phase: Badge['phase']) => {
  switch (phase) {
    case 'immediate':
      return { name: 'Retention Immediata', description: 'Settimana 1', color: 'hsl(38, 92%, 50%)' };
    case 'consolidation':
      return { name: 'Consolidamento', description: 'Mesi 1-3', color: 'hsl(173, 55%, 45%)' };
    case 'transformation':
      return { name: 'Trasformazione', description: 'Mesi 4-6', color: 'hsl(280, 70%, 50%)' };
    case 'mastery':
      return { name: 'Mastery', description: 'Mesi 7-12', color: 'hsl(45, 100%, 50%)' };
  }
};

export const getCurrentBadge = (streak: number, totalCheckins: number): Badge => {
  // Find the highest badge the user has unlocked
  let currentBadge = ELITE_BADGES[0];
  
  for (const badge of ELITE_BADGES) {
    // Special case for Dragon - needs 300 total check-ins
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
    return null; // Already at max level
  }
  
  return ELITE_BADGES[nextBadgeIndex];
};

export const getCheckinsToNextBadge = (streak: number, totalCheckins: number): number => {
  const nextBadge = getNextBadge(streak, totalCheckins);
  if (!nextBadge) return 0;
  
  // For Dragon, use total check-ins
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
  
  if (!nextBadge) return 100; // Max level reached
  
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
  // If client hasn't checked in for more than 3 days, they're at risk
  if (daysSinceLastCheckin > 3) return true;
  
  // If stuck on same badge for too long based on phase
  if (!previousBadge) return false;
  
  // Different thresholds based on phase
  const riskThresholds = {
    immediate: 7,
    consolidation: 20,
    transformation: 25,
    mastery: 35,
  };
  
  return daysSinceLastCheckin > riskThresholds[currentBadge.phase];
};
