// Whitelist email collaboratori/coach che possono gestire i clienti
export const STAFF_WHITELIST: Record<string, { role: 'admin' | 'coach'; name: string }> = {
  // ADMIN
  'info@362gradi.it': { role: 'admin', name: '362 Gradi Admin' },
  'valentina362g@gmail.com': { role: 'admin', name: 'Valentina' },
  // COACH
  'michela.amadei@hotmail.it': { role: 'coach', name: 'Michela' },
  'martina.fienga@hotmail.it': { role: 'coach', name: 'Martina' },
  'spicri@gmail.com': { role: 'coach', name: 'Cristina' },
};

// Estrai solo i coach (sia admin che coach)
export const getAvailableCoaches = async (supabase: any) => {
  const staffEmails = Object.entries(STAFF_WHITELIST).map(([email, info]) => ({
    email,
    ...info,
  }));

  // Carica i profili di questi collaboratori
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .in('email', staffEmails.map(s => s.email));

  if (!profiles) return [];

  // Mappa email → id e nome
  return profiles.map(p => ({
    id: p.id,
    name: p.full_name || STAFF_WHITELIST[p.email]?.name || p.email,
    email: p.email,
  }));
};
