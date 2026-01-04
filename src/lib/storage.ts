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

export const getStoredCheckins = (): DailyCheckin[] => {
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

// Mock clients for admin view
export const getMockClients = (): Client[] => {
  return [
    {
      id: '1',
      name: 'Marco Rossi',
      email: 'marco@example.com',
      streak: 14,
      lastCheckin: { id: '1', date: new Date().toISOString().split('T')[0], recovery: 9, nutritionHit: true, energy: 8, mindset: 9, twoPercentEdge: 'Extra 10 min meditation', timestamp: Date.now() },
      status: 'green'
    },
    {
      id: '2',
      name: 'Elena Bianchi',
      email: 'elena@example.com',
      streak: 7,
      lastCheckin: { id: '2', date: new Date().toISOString().split('T')[0], recovery: 6, nutritionHit: true, energy: 5, mindset: 6, twoPercentEdge: 'Walked 5000 steps', timestamp: Date.now() },
      status: 'yellow'
    },
    {
      id: '3',
      name: 'Luca Ferrari',
      email: 'luca@example.com',
      streak: 2,
      lastCheckin: { id: '3', date: new Date().toISOString().split('T')[0], recovery: 4, nutritionHit: false, energy: 3, mindset: 4, twoPercentEdge: '', timestamp: Date.now() },
      status: 'red'
    },
    {
      id: '4',
      name: 'Sofia Conti',
      email: 'sofia@example.com',
      streak: 21,
      lastCheckin: { id: '4', date: new Date().toISOString().split('T')[0], recovery: 8, nutritionHit: true, energy: 9, mindset: 8, twoPercentEdge: 'Cold shower', timestamp: Date.now() },
      status: 'green'
    },
    {
      id: '5',
      name: 'Andrea Romano',
      email: 'andrea@example.com',
      streak: 0,
      lastCheckin: null,
      status: 'red'
    },
  ];
};
