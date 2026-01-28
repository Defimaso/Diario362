// Badge Emoji and Glow Color Mapping - Kawaii Style
// Each badge has a colorful emoji and a themed glow color

export interface BadgeStyle {
  emoji: string;
  glowColor: string;  // HSLA color for the glow effect
  solidColor: string; // HSL color for borders
}

export const BADGE_STYLES: Record<number, BadgeStyle> = {
  1: { 
    emoji: '🦁', 
    glowColor: 'hsla(35, 100%, 50%, 0.6)', 
    solidColor: 'hsl(35, 100%, 50%)' 
  },
  2: { 
    emoji: '🐢', 
    glowColor: 'hsla(120, 60%, 40%, 0.6)', 
    solidColor: 'hsl(120, 60%, 40%)' 
  },
  3: { 
    emoji: '🐝', 
    glowColor: 'hsla(50, 100%, 50%, 0.6)', 
    solidColor: 'hsl(50, 100%, 50%)' 
  },
  4: { 
    emoji: '🐜', 
    glowColor: 'hsla(0, 60%, 35%, 0.6)', 
    solidColor: 'hsl(0, 60%, 35%)' 
  },
  5: { 
    emoji: '🦅', 
    glowColor: 'hsla(30, 80%, 45%, 0.6)', 
    solidColor: 'hsl(30, 80%, 45%)' 
  },
  6: { 
    emoji: '🐺', 
    glowColor: 'hsla(210, 20%, 60%, 0.6)', 
    solidColor: 'hsl(210, 20%, 60%)' 
  },
  7: { 
    emoji: '🦋', 
    glowColor: 'hsla(270, 70%, 55%, 0.6)', 
    solidColor: 'hsl(270, 70%, 55%)' 
  },
  8: { 
    emoji: '🐬', 
    glowColor: 'hsla(195, 80%, 50%, 0.6)', 
    solidColor: 'hsl(195, 80%, 50%)' 
  },
  9: { 
    emoji: '🐯', 
    glowColor: 'hsla(25, 100%, 50%, 0.6)', 
    solidColor: 'hsl(25, 100%, 50%)' 
  },
  10: { 
    emoji: '🐘', 
    glowColor: 'hsla(220, 15%, 55%, 0.6)', 
    solidColor: 'hsl(220, 15%, 55%)' 
  },
  11: { 
    emoji: '🐆', 
    glowColor: 'hsla(40, 90%, 50%, 0.6)', 
    solidColor: 'hsl(40, 90%, 50%)' 
  },
  12: { 
    emoji: '🐒', 
    glowColor: 'hsla(25, 50%, 40%, 0.6)', 
    solidColor: 'hsl(25, 50%, 40%)' 
  },
  13: { 
    emoji: '🐎', 
    glowColor: 'hsla(30, 70%, 45%, 0.6)', 
    solidColor: 'hsl(30, 70%, 45%)' 
  },
  14: { 
    emoji: '🦉', 
    glowColor: 'hsla(280, 50%, 45%, 0.6)', 
    solidColor: 'hsl(280, 50%, 45%)' 
  },
  15: { 
    emoji: '🦘', 
    glowColor: 'hsla(20, 80%, 50%, 0.6)', 
    solidColor: 'hsl(20, 80%, 50%)' 
  },
  16: { 
    emoji: '🐻', 
    glowColor: 'hsla(20, 45%, 35%, 0.6)', 
    solidColor: 'hsl(20, 45%, 35%)' 
  },
  17: { 
    emoji: '🦚', 
    glowColor: 'hsla(160, 80%, 40%, 0.6)', 
    solidColor: 'hsl(160, 80%, 40%)' 
  },
  18: { 
    emoji: '🦈', 
    glowColor: 'hsla(210, 60%, 40%, 0.6)', 
    solidColor: 'hsl(210, 60%, 40%)' 
  },
  19: { 
    emoji: '🐕', 
    glowColor: 'hsla(35, 70%, 45%, 0.6)', 
    solidColor: 'hsl(35, 70%, 45%)' 
  },
  20: { 
    emoji: '🐂', 
    glowColor: 'hsla(0, 70%, 45%, 0.6)', 
    solidColor: 'hsl(0, 70%, 45%)' 
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
