import { 
  Bird, 
  Sparkles, 
  Repeat, 
  Target, 
  Eye, 
  Zap, 
  Telescope, 
  Moon, 
  Shield, 
  Flame, 
  Rocket, 
  Crown, 
  Mountain, 
  Crosshair,
  Wind, 
  Snowflake, 
  Sword, 
  Timer, 
  Sunrise, 
  Star,
  LucideIcon
} from 'lucide-react';

// Mappatura centralizzata tra badge ID e icone Lucide
// Queste icone rappresentano simbolicamente le qualità di ogni animale
export const BADGE_ICONS: Record<number, LucideIcon> = {
  1: Bird,         // Colibrì - Agilità iniziale
  2: Sparkles,     // Libellula - Precisione/Trasformazione
  3: Repeat,       // Geco - Adattamento
  4: Target,       // Volpe - Strategia
  5: Eye,          // Lince - Visione
  6: Zap,          // Gazzella - Velocità
  7: Telescope,    // Falco - Prospettiva
  8: Moon,         // Pantera - Potenza silenziosa
  9: Shield,       // Lupo - Lealtà
  10: Flame,       // Tigre - Determinazione
  11: Rocket,      // Giaguaro - Esplosività
  12: Crown,       // Leone - Comando
  13: Mountain,    // Aquila Reale - Dominio
  14: Crosshair,   // Squalo Bianco - Focus
  15: Wind,        // Condor - Resistenza
  16: Snowflake,   // Leopardo delle Nevi - Rarità
  17: Sword,       // Stallone Nero - Forza/Eleganza
  18: Timer,       // Ghepardo - Performance
  19: Sunrise,     // Fenice - Rinascita
  20: Star,        // Drago 362° - Maestria
};

export const getBadgeIcon = (badgeId: number): LucideIcon => {
  return BADGE_ICONS[badgeId] || Star;
};
