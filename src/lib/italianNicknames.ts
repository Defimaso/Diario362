const adjectives = [
  'Allegro', 'Coraggioso', 'Curioso', 'Furbo', 'Gentile',
  'Luminoso', 'Paziente', 'Saggio', 'Tenace', 'Veloce',
  'Audace', 'Brillante', 'Creativo', 'Dinamico', 'Elegante',
  'Forte', 'Giocoso', 'Instancabile', 'Leale', 'Nobile',
];

const animals = [
  'Gufo', 'Panda', 'Delfino', 'Falco', 'Leone',
  'Volpe', 'Lupo', 'Aquila', 'Fenice', 'Tigre',
  'Orso', 'Cervo', 'Drago', 'Gatto', 'Cavallo',
  'Koala', 'Lince', 'Pinguino', 'Tartaruga', 'Unicorno',
];

/**
 * Generates a deterministic Italian nickname from a UUID.
 * Same userId always produces the same nickname.
 */
export function generateNickname(userId: string): string {
  // Simple hash from UUID characters
  let hash = 0;
  const clean = userId.replace(/-/g, '');
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) - hash + clean.charCodeAt(i)) | 0;
  }
  // Make positive
  hash = Math.abs(hash);

  const adjIndex = hash % adjectives.length;
  const animalIndex = Math.floor(hash / adjectives.length) % animals.length;

  return `${animals[animalIndex]} ${adjectives[adjIndex]}`;
}
