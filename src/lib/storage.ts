export interface DailyCheckin {
  id: string;
  date: string;
  recovery: number;
  nutritionHit: boolean;
  energy: number;
  mindset: number;
  twoPercentEdge: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  streak: number;
  lastCheckinDate: string | null;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  streak: number;
  lastCheckin: DailyCheckin | null;
  status: 'green' | 'yellow' | 'red';
}

// Demo mode flag - set to true for sales presentations
const DEMO_MODE = true;

// Generate demo checkins for the past week
const generateDemoCheckins = (): DailyCheckin[] => {
  const checkins: DailyCheckin[] = [];
  const today = new Date();
  
  const demoData = [
    { daysAgo: 6, recovery: 7, nutritionHit: true, energy: 6, mindset: 7, edge: "Sveglia 30 min prima" },
    { daysAgo: 5, recovery: 8, nutritionHit: true, energy: 7, mindset: 8, edge: "Meditazione mattutina" },
    { daysAgo: 4, recovery: 6, nutritionHit: false, energy: 7, mindset: 6, edge: "Camminata serale" },
    { daysAgo: 3, recovery: 9, nutritionHit: true, energy: 8, mindset: 9, edge: "Doccia fredda + journaling" },
    { daysAgo: 2, recovery: 8, nutritionHit: true, energy: 9, mindset: 8, edge: "Allenamento extra HIIT" },
    { daysAgo: 1, recovery: 9, nutritionHit: true, energy: 9, mindset: 9, edge: "Preparazione pasti settimana" },
    { daysAgo: 0, recovery: 9, nutritionHit: true, energy: 8, mindset: 9, edge: "Visualizzazione obiettivi" },
  ];

  demoData.forEach((data, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - data.daysAgo);
    checkins.push({
      id: `demo-${index}`,
      date: date.toISOString().split('T')[0],
      recovery: data.recovery,
      nutritionHit: data.nutritionHit,
      energy: data.energy,
      mindset: data.mindset,
      twoPercentEdge: data.edge,
      timestamp: date.getTime(),
    });
  });

  return checkins;
};

const getDemoProfile = (): UserProfile => ({
  name: "Alessandro",
  streak: 12,
  lastCheckinDate: new Date().toISOString().split('T')[0],
});

export const getStoredCheckins = (): DailyCheckin[] => {
  if (DEMO_MODE) return generateDemoCheckins();
  const stored = localStorage.getItem('362_checkins');
  return stored ? JSON.parse(stored) : [];
};

export const saveCheckin = (checkin: Omit<DailyCheckin, 'id' | 'timestamp'>): DailyCheckin => {
  const checkins = getStoredCheckins();
  const newCheckin: DailyCheckin = {
    ...checkin,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  checkins.push(newCheckin);
  localStorage.setItem('362_checkins', JSON.stringify(checkins));
  updateStreak();
  return newCheckin;
};

export const getTodayCheckin = (): DailyCheckin | null => {
  const checkins = getStoredCheckins();
  const today = new Date().toISOString().split('T')[0];
  return checkins.find(c => c.date === today) || null;
};

export const getWeeklyCheckins = (): DailyCheckin[] => {
  const checkins = getStoredCheckins();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return checkins.filter(c => new Date(c.date) >= weekAgo).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

export const getUserProfile = (): UserProfile => {
  if (DEMO_MODE) return getDemoProfile();
  const stored = localStorage.getItem('362_profile');
  return stored ? JSON.parse(stored) : { name: 'Navigator', streak: 0, lastCheckinDate: null };
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem('362_profile', JSON.stringify(profile));
};

export const updateStreak = (): number => {
  const profile = getUserProfile();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (profile.lastCheckinDate === today) {
    return profile.streak;
  }
  
  if (profile.lastCheckinDate === yesterdayStr || profile.lastCheckinDate === null) {
    profile.streak += 1;
  } else {
    profile.streak = 1;
  }
  
  profile.lastCheckinDate = today;
  saveUserProfile(profile);
  return profile.streak;
};

export const calculateDailyScore = (checkin: DailyCheckin): number => {
  const nutritionScore = checkin.nutritionHit ? 10 : 5;
  const average = (checkin.recovery + nutritionScore + checkin.energy + checkin.mindset) / 4;
  return Math.round(average * 10) / 10;
};

export const getDailyCompletionPercentage = (): number => {
  const todayCheckin = getTodayCheckin();
  if (!todayCheckin) return 0;
  
  const score = calculateDailyScore(todayCheckin);
  return (score / 10) * 100;
};

// Mock clients for admin view - realistic Italian data
export const getMockClients = (): Client[] => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  return [
    {
      id: '1',
      name: 'Marco Rossi',
      email: 'marco.rossi@gmail.com',
      streak: 28,
      lastCheckin: { id: '1', date: today, recovery: 9, nutritionHit: true, energy: 9, mindset: 9, twoPercentEdge: 'Sveglia alle 5:30 per meditazione', timestamp: Date.now() },
      status: 'green'
    },
    {
      id: '2',
      name: 'Elena Bianchi',
      email: 'elena.bianchi@outlook.it',
      streak: 15,
      lastCheckin: { id: '2', date: today, recovery: 8, nutritionHit: true, energy: 8, mindset: 9, twoPercentEdge: 'Journaling serale 15 minuti', timestamp: Date.now() },
      status: 'green'
    },
    {
      id: '3',
      name: 'Luca Ferrari',
      email: 'luca.ferrari@yahoo.it',
      streak: 7,
      lastCheckin: { id: '3', date: today, recovery: 6, nutritionHit: true, energy: 5, mindset: 6, twoPercentEdge: 'Camminata 30 min', timestamp: Date.now() },
      status: 'yellow'
    },
    {
      id: '4',
      name: 'Sofia Conti',
      email: 'sofia.conti@gmail.com',
      streak: 42,
      lastCheckin: { id: '4', date: today, recovery: 10, nutritionHit: true, energy: 9, mindset: 10, twoPercentEdge: 'Cold shower + stretching mattutino', timestamp: Date.now() },
      status: 'green'
    },
    {
      id: '5',
      name: 'Andrea Romano',
      email: 'andrea.romano@libero.it',
      streak: 3,
      lastCheckin: { id: '5', date: today, recovery: 5, nutritionHit: false, energy: 6, mindset: 5, twoPercentEdge: 'Lettura 20 pagine', timestamp: Date.now() },
      status: 'yellow'
    },
    {
      id: '6',
      name: 'Giulia Marino',
      email: 'giulia.marino@gmail.com',
      streak: 0,
      lastCheckin: null,
      status: 'red'
    },
    {
      id: '7',
      name: 'Francesco Greco',
      email: 'f.greco@hotmail.it',
      streak: 1,
      lastCheckin: { id: '7', date: yesterdayStr, recovery: 3, nutritionHit: false, energy: 4, mindset: 3, twoPercentEdge: '', timestamp: Date.now() - 86400000 },
      status: 'red'
    },
    {
      id: '8',
      name: 'Alessia Lombardi',
      email: 'alessia.lombardi@gmail.com',
      streak: 21,
      lastCheckin: { id: '8', date: today, recovery: 8, nutritionHit: true, energy: 7, mindset: 8, twoPercentEdge: 'Meal prep domenicale completo', timestamp: Date.now() },
      status: 'green'
    },
  ];
};
