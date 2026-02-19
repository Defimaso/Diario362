// Badge Emoji and Glow Color Mapping - Percorso Edition
// Each badge has a colorful emoji and a themed glow color

export interface BadgeStyle {
  emoji: string;
  glowColor: string;  // HSLA color for the glow effect
  solidColor: string; // HSL color for borders
}

export const BADGE_STYLES: Record<number, BadgeStyle> = {
  1: {
    emoji: '👣',
    glowColor: 'hsla(35, 100%, 50%, 0.6)',
    solidColor: 'hsl(35, 100%, 50%)'
  },
  2: {
    emoji: '✌️',
    glowColor: 'hsla(120, 60%, 40%, 0.6)',
    solidColor: 'hsl(120, 60%, 40%)'
  },
  3: {
    emoji: '🎯',
    glowColor: 'hsla(0, 80%, 50%, 0.6)',
    solidColor: 'hsl(0, 80%, 50%)'
  },
  4: {
    emoji: '💪',
    glowColor: 'hsla(25, 90%, 50%, 0.6)',
    solidColor: 'hsl(25, 90%, 50%)'
  },
  5: {
    emoji: '⭐',
    glowColor: 'hsla(45, 100%, 50%, 0.6)',
    solidColor: 'hsl(45, 100%, 50%)'
  },
  6: {
    emoji: '🔄',
    glowColor: 'hsla(195, 80%, 50%, 0.6)',
    solidColor: 'hsl(195, 80%, 50%)'
  },
  7: {
    emoji: '🌙',
    glowColor: 'hsla(240, 60%, 55%, 0.6)',
    solidColor: 'hsl(240, 60%, 55%)'
  },
  8: {
    emoji: '⚖️',
    glowColor: 'hsla(173, 55%, 45%, 0.6)',
    solidColor: 'hsl(173, 55%, 45%)'
  },
  9: {
    emoji: '🔥',
    glowColor: 'hsla(15, 100%, 50%, 0.6)',
    solidColor: 'hsl(15, 100%, 50%)'
  },
  10: {
    emoji: '🌳',
    glowColor: 'hsla(140, 60%, 40%, 0.6)',
    solidColor: 'hsl(140, 60%, 40%)'
  },
  11: {
    emoji: '🚀',
    glowColor: 'hsla(210, 80%, 55%, 0.6)',
    solidColor: 'hsl(210, 80%, 55%)'
  },
  12: {
    emoji: '🛡️',
    glowColor: 'hsla(220, 50%, 45%, 0.6)',
    solidColor: 'hsl(220, 50%, 45%)'
  },
  13: {
    emoji: '🕊️',
    glowColor: 'hsla(200, 30%, 70%, 0.6)',
    solidColor: 'hsl(200, 30%, 70%)'
  },
  14: {
    emoji: '💎',
    glowColor: 'hsla(280, 70%, 55%, 0.6)',
    solidColor: 'hsl(280, 70%, 55%)'
  },
  15: {
    emoji: '🏔️',
    glowColor: 'hsla(210, 40%, 50%, 0.6)',
    solidColor: 'hsl(210, 40%, 50%)'
  },
  16: {
    emoji: '🏋️‍♀️',
    glowColor: 'hsla(340, 70%, 50%, 0.6)',
    solidColor: 'hsl(340, 70%, 50%)'
  },
  17: {
    emoji: '✨',
    glowColor: 'hsla(50, 100%, 55%, 0.6)',
    solidColor: 'hsl(50, 100%, 55%)'
  },
  18: {
    emoji: '⚡',
    glowColor: 'hsla(55, 100%, 50%, 0.6)',
    solidColor: 'hsl(55, 100%, 50%)'
  },
  19: {
    emoji: '👑',
    glowColor: 'hsla(40, 100%, 50%, 0.6)',
    solidColor: 'hsl(40, 100%, 50%)'
  },
  20: {
    emoji: '🏆',
    glowColor: 'hsla(45, 100%, 50%, 0.6)',
    solidColor: 'hsl(45, 100%, 50%)'
  },
};

export const getBadgeEmoji = (badgeId: number): string => {
  return BADGE_STYLES[badgeId]?.emoji || '⭐';
};

export const getBadgeGlowColor = (badgeId: number): string => {
  return BADGE_STYLES[badgeId]?.glowColor || 'hsla(45, 100%, 50%, 0.6)';
};

export const getBadgeSolidColor = (badgeId: number): string => {
  return BADGE_STYLES[badgeId]?.solidColor || 'hsl(45, 100%, 50%)';
};
