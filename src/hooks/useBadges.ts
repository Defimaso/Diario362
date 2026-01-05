import { useState, useEffect, useCallback } from 'react';
import { 
  Badge, 
  getCurrentBadge, 
  getNextBadge, 
  ELITE_BADGES 
} from '@/lib/badges';

const LAST_BADGE_KEY = 'diario_last_badge_id';

export const useBadges = (streak: number, totalCheckins: number) => {
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Badge | null>(null);
  
  const currentBadge = getCurrentBadge(streak, totalCheckins);
  const nextBadge = getNextBadge(streak, totalCheckins);
  
  // Check for newly unlocked badges
  useEffect(() => {
    const lastBadgeId = localStorage.getItem(LAST_BADGE_KEY);
    const lastId = lastBadgeId ? parseInt(lastBadgeId, 10) : 0;
    
    if (currentBadge.id > lastId && lastId > 0) {
      // New badge unlocked!
      setNewlyUnlockedBadge(currentBadge);
      setShowUnlockAnimation(true);
      localStorage.setItem(LAST_BADGE_KEY, currentBadge.id.toString());
    } else if (!lastBadgeId && streak > 0) {
      // First time user, set current badge
      localStorage.setItem(LAST_BADGE_KEY, currentBadge.id.toString());
    }
  }, [currentBadge.id, streak]);
  
  const closeUnlockAnimation = useCallback(() => {
    setShowUnlockAnimation(false);
    setNewlyUnlockedBadge(null);
  }, []);
  
  // Manual trigger for testing
  const triggerBadgeUnlock = useCallback((badgeId: number) => {
    const badge = ELITE_BADGES.find(b => b.id === badgeId);
    if (badge) {
      setNewlyUnlockedBadge(badge);
      setShowUnlockAnimation(true);
    }
  }, []);
  
  return {
    currentBadge,
    nextBadge,
    showUnlockAnimation,
    newlyUnlockedBadge,
    closeUnlockAnimation,
    triggerBadgeUnlock,
  };
};
