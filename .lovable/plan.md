
# Piano di Implementazione: Auto-Provisioning Collaboratori

## Problema Identificato

Quando i collaboratori in whitelist provano ad accedere con la password predefinita `362@diario`, ricevono l'errore "Email o password non corretti" perché l'account non esiste ancora in Supabase Auth.

## Soluzione Tecnica

### Whitelist da Gestire

| Tipo | Email | Nome Metadata |
|------|-------|---------------|
| ADMIN | `info@362gradi.it` | 362 Gradi Admin |
| ADMIN | `valentina362g@gmail.com` | Valentina |
| COACH | `michela.amadei@hotmail.it` | Michela |
| COACH | `martina.fienga@hotmail.it` | Martina |
| COACH | `spicri@gmail.com` | Cristina |

### Flusso Auto-Provisioning

```text
1. Utente inserisce email + password "362@diario"
2. Sistema verifica se email e in whitelist
3. SE email in whitelist E password == "362@diario":
   a. Tenta signUp con metadata (full_name, role)
   b. SE signUp ha successo -> utente creato e loggato
   c. SE signUp fallisce (utente esiste) -> tenta signIn
4. SE email NON in whitelist:
   a. Procedi con normale signIn
5. Reindirizzamento post-login:
   - Admin -> /gestione-diario
   - Coach -> /gestione-diario (filtro automatico)
```

---

## Modifiche al File: `src/pages/Auth.tsx`

### 1. Aggiungere Costanti Whitelist

Definire la mappa delle email con i relativi ruoli e nomi:

```typescript
const STAFF_WHITELIST = {
  // ADMIN
  'info@362gradi.it': { role: 'admin', name: '362 Gradi Admin' },
  'valentina362g@gmail.com': { role: 'admin', name: 'Valentina' },
  // COACH
  'michela.amadei@hotmail.it': { role: 'coach', name: 'Michela' },
  'martina.fienga@hotmail.it': { role: 'coach', name: 'Martina' },
  'spicri@gmail.com': { role: 'coach', name: 'Cristina' },
};

const DEFAULT_STAFF_PASSWORD = '362@diario';
```

### 2. Nuova Funzione di Auto-Provisioning

Creare una funzione dedicata per gestire il login staff:

```typescript
const handleStaffLogin = async (email: string, password: string) => {
  const staffInfo = STAFF_WHITELIST[email.toLowerCase()];
  
  // Se non e in whitelist o la password non e quella predefinita,
  // procedi con login normale
  if (!staffInfo || password !== DEFAULT_STAFF_PASSWORD) {
    return signIn(email, password);
  }
  
  // Prova prima il login normale
  const signInResult = await signIn(email, password);
  
  // Se il login fallisce per credenziali invalide, prova a creare l'utente
  if (signInResult.error?.message === 'Invalid login credentials') {
    // Tenta la registrazione automatica
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: DEFAULT_STAFF_PASSWORD,
      options: {
        data: {
          full_name: staffInfo.name,
          staff_role: staffInfo.role,
        }
      }
    });
    
    // Se la registrazione ha successo, il trigger handle_new_user
    // assegnera automaticamente il ruolo corretto
    if (!signUpError) {
      // Dopo signUp con auto-confirm, riprova il login
      return signIn(email, password);
    }
    
    // Se fallisce per "already registered", riprova login
    if (signUpError.message?.includes('already registered')) {
      return signIn(email, password);
    }
    
    return { error: signUpError };
  }
  
  return signInResult;
};
```

### 3. Modificare handleSubmit

Aggiornare la logica di submit per usare la nuova funzione:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setIsLoading(true);

  try {
    if (isCollaborator || isLogin) {
      // Usa la nuova funzione per gestire auto-provisioning staff
      const { error } = await handleStaffLogin(email.toLowerCase(), password);
      
      if (error) {
        // Non mostrare errore generico per staff in whitelist
        const isStaffEmail = email.toLowerCase() in STAFF_WHITELIST;
        
        toast({
          variant: 'destructive',
          title: 'Errore di accesso',
          description: error.message === 'Invalid login credentials' 
            ? isStaffEmail 
              ? 'Errore durante la configurazione dell\'account. Riprova.'
              : 'Email o password non corretti' 
            : error.message,
        });
      }
    } else {
      // ... logica registrazione cliente esistente
    }
  } finally {
    setIsLoading(false);
  }
};
```

### 4. Migliorare Feedback Visivo Durante Provisioning

Aggiungere uno stato specifico per il provisioning staff:

```typescript
const [isProvisioning, setIsProvisioning] = useState(false);

// Nel button:
{isLoading ? (
  isProvisioning 
    ? 'Configurazione account in corso...' 
    : 'Caricamento...'
) : (isCollaborator || isLogin) ? 'Accedi' : 'Registrati'}
```

---

## Modifiche al File: `src/contexts/AuthContext.tsx`

### 5. Reindirizzamento Post-Login Intelligente

Aggiornare `Auth.tsx` per reindirizzare in base al ruolo:

```typescript
useEffect(() => {
  if (user) {
    const userEmail = user.email?.toLowerCase() || '';
    const isStaff = userEmail in STAFF_WHITELIST;
    
    if (isStaff) {
      // Staff va alla dashboard gestione
      navigate('/gestione-diario');
    } else {
      // Clienti vanno al diario
      navigate('/diario');
    }
  }
}, [user, navigate]);
```

---

## Riepilogo File da Modificare

| File | Modifiche |
|------|-----------|
| `src/pages/Auth.tsx` | Aggiungere whitelist, funzione auto-provisioning, aggiornare handleSubmit e reindirizzamento |

---

## Test Case Richiesto

**Scenario:** `michela.amadei@hotmail.it` con password `362@diario`

1. Utente clicca switch "Collaboratore"
2. Inserisce email: `michela.amadei@hotmail.it`
3. Inserisce password: `362@diario`
4. Clicca "Accedi"
5. Sistema:
   - Verifica email in whitelist -> SI
   - Verifica password == 362@diario -> SI
   - Tenta signIn -> Fallisce (utente non esiste)
   - Tenta signUp automatico con metadata -> Successo
   - Trigger `handle_new_user` assegna ruolo `collaborator`
   - Utente viene reindirizzato a `/gestione-diario`
6. Michela vede solo i propri clienti assegnati

---

## Note di Sicurezza

- La password predefinita e usata SOLO per la prima creazione dell'account
- Dopo il primo accesso, i collaboratori sono invitati a cambiare password tramite Settings
- Il ruolo viene assegnato dal trigger database `handle_new_user`, non dal frontend
- La whitelist frontend serve solo per abilitare l'auto-provisioning, i ruoli effettivi sono gestiti lato database
