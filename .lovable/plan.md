

# Piano di Implementazione: Redirect Collaboratori su /diario

## Situazione Attuale

Il sistema utilizza una whitelist di email per identificare i collaboratori nel file `Auth.tsx`:

```typescript
const STAFF_WHITELIST: Record<string, { role: 'admin' | 'coach'; name: string }> = {
  'info@362gradi.it': { role: 'admin', name: '362 Gradi Admin' },
  'valentina362g@gmail.com': { role: 'admin', name: 'Valentina' },
  'michela.amadei@hotmail.it': { role: 'coach', name: 'Michela' },
  'martina.fienga@hotmail.it': { role: 'coach', name: 'Martina' },
  'spicri@gmail.com': { role: 'coach', name: 'Cristina' },
};
```

La logica di redirect attuale (linee 137-149) invia gli staff a `/gestione-diario`:

```typescript
useEffect(() => {
  if (user) {
    const userEmail = user.email?.toLowerCase() || '';
    const isStaff = userEmail in STAFF_WHITELIST;
    
    if (isStaff) {
      navigate('/gestione-diario');  // <- Da cambiare
    } else {
      navigate('/diario');
    }
  }
}, [user, navigate]);
```

---

## Modifica Richiesta

Cambiare la destinazione post-login per tutti i collaboratori da `/gestione-diario` a `/diario`.

---

## Dettagli Tecnici

### File da Modificare

| File | Modifica |
|------|----------|
| `src/pages/Auth.tsx` | Cambiare redirect da `/gestione-diario` a `/diario` |

### Codice Aggiornato

Modificare la linea 144 in `Auth.tsx`:

```typescript
// PRIMA (linea 144):
navigate('/gestione-diario');

// DOPO:
navigate('/diario');
```

Il codice finale sara:

```typescript
// Reindirizzamento post-login intelligente
useEffect(() => {
  if (user) {
    // Tutti gli utenti (staff e clienti) vanno al Diario
    navigate('/diario');
  }
}, [user, navigate]);
```

---

## Comportamento Risultante

| Tipo Utente | Destinazione Post-Login | Navigazione Staff |
|-------------|------------------------|-------------------|
| Admin (info@362gradi.it, valentina362g@gmail.com) | `/diario` | Menu staff disponibile |
| Coach (michela, martina, cristina) | `/diario` | Menu staff disponibile |
| Cliente | `/diario` | Menu cliente standard |

---

## Note Importanti

1. **Menu di Navigazione Invariato**: Il menu (Bottom Bar/Sidebar) continuera a mostrare le opzioni staff appropriate basandosi sui ruoli dell'utente, non sulla pagina di atterraggio

2. **Accesso a /gestionediario**: I collaboratori potranno comunque accedere alla gestione clienti tramite il menu di navigazione

3. **Semplificazione del Codice**: Poiche tutti ora atterrano su `/diario`, la logica di verifica `isStaff` nel redirect diventa superflua e puo essere semplificata

---

## Vantaggi

- I collaboratori vedranno immediatamente i check e le attivita giornaliere
- Esperienza coerente per tutti gli utenti all'accesso
- La navigazione verso le funzioni staff rimane accessibile dal menu

