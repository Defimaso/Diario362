

# Piano di Implementazione: Sistema Whitelist Collaboratori

## Riepilogo Richieste

| Requisito | Stato Attuale | Azione |
|-----------|---------------|--------|
| Whitelist estesa (nuove email) | Solo @362gradi.it | Aggiornare |
| Password predefinita 362@diario | Non implementata | Creare |
| Cambio password dopo primo accesso | Non esiste | Aggiungere |
| Filtro Coach per Admin | Solo SuperAdmin | Estendere |
| Logica "contains" per coach condivisi | Parzialmente | Verificare/Correggere |

---

## Nuova Whitelist Completa

### ADMIN (accesso completo + filtro coach)
- `info@362gradi.it` (Super Admin esistente)
- `valentina362g@gmail.com` (NUOVO)
- `ilaria@362gradi.it` (esistente)
- `marco@362gradi.it` (esistente)

### COACH (visualizzazione limitata ai propri clienti)
- `michela@362gradi.it` -> Michela (esistente)
- `michela.amadei@hotmail.it` -> Michela (NUOVO - stesso coach)
- `martina@362gradi.it` -> Martina (esistente)
- `martina.fienga@hotmail.it` -> Martina (NUOVO - stesso coach)
- `cristina@362gradi.it` -> Cristina (esistente)
- `spicri@gmail.com` -> Cristina (NUOVO - stesso coach)

---

## Modifiche Tecniche

### 1. Database: Aggiornare funzione `handle_new_user`

Modificare il trigger per riconoscere le nuove email nella whitelist:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone_number)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.raw_user_meta_data ->> 'phone_number'
  );
  
  -- Assign default client role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  -- Super Admin
  IF NEW.email = 'info@362gradi.it' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  
  -- Admin group (full access)
  ELSIF NEW.email IN (
    'valentina362g@gmail.com',
    'ilaria@362gradi.it',
    'marco@362gradi.it'
  ) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  
  -- Collaborator/Coach group
  ELSIF NEW.email IN (
    'martina@362gradi.it',
    'martina.fienga@hotmail.it',
    'michela@362gradi.it',
    'michela.amadei@hotmail.it',
    'cristina@362gradi.it',
    'spicri@gmail.com'
  ) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'collaborator');
  END IF;
  
  RETURN NEW;
END;
$$;
```

### 2. Database: Aggiornare `can_collaborator_see_client`

Aggiungere le nuove email per la visibilita dei client condivisi:

```sql
CREATE OR REPLACE FUNCTION public.can_collaborator_see_client(_collaborator_id uuid, _client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.coach_assignments ca
    JOIN public.profiles p ON p.id = _collaborator_id
    WHERE ca.client_id = _client_id
      AND (
        -- Ilaria assignments
        (p.email = 'ilaria@362gradi.it' AND (
          ca.coach_name = 'Ilaria' OR 
          ca.coach_name = 'Ilaria_Marco' OR 
          ca.coach_name = 'Ilaria_Marco_Michela' OR 
          ca.coach_name = 'Ilaria_Michela' OR 
          ca.coach_name = 'Ilaria_Martina'
        ))
        -- Marco assignments
        OR (p.email = 'marco@362gradi.it' AND (
          ca.coach_name = 'Marco' OR 
          ca.coach_name = 'Ilaria_Marco' OR 
          ca.coach_name = 'Ilaria_Marco_Michela'
        ))
        -- Michela assignments (include nuova email)
        OR (p.email IN ('michela@362gradi.it', 'michela.amadei@hotmail.it') AND (
          ca.coach_name = 'Michela' OR 
          ca.coach_name = 'Michela_Martina' OR
          ca.coach_name = 'Ilaria_Marco_Michela' OR
          ca.coach_name = 'Ilaria_Michela' OR
          ca.coach_name = 'Martina_Michela'
        ))
        -- Martina assignments (include nuova email)
        OR (p.email IN ('martina@362gradi.it', 'martina.fienga@hotmail.it') AND (
          ca.coach_name = 'Martina' OR 
          ca.coach_name = 'Michela_Martina' OR
          ca.coach_name = 'Ilaria_Martina' OR
          ca.coach_name = 'Martina_Michela'
        ))
        -- Cristina assignments (include nuova email)
        OR (p.email IN ('cristina@362gradi.it', 'spicri@gmail.com') AND ca.coach_name = 'Cristina')
      )
  )
$$;
```

### 3. Database: Aggiornare `get_collaborator_coach_name`

```sql
CREATE OR REPLACE FUNCTION public.get_collaborator_coach_name(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE 
      WHEN p.email = 'ilaria@362gradi.it' THEN 'Ilaria'
      WHEN p.email = 'marco@362gradi.it' THEN 'Marco'
      WHEN p.email IN ('martina@362gradi.it', 'martina.fienga@hotmail.it') THEN 'Martina'
      WHEN p.email IN ('michela@362gradi.it', 'michela.amadei@hotmail.it') THEN 'Michela'
      WHEN p.email IN ('cristina@362gradi.it', 'spicri@gmail.com') THEN 'Cristina'
      ELSE NULL
    END
  FROM public.profiles p
  WHERE p.id = _user_id
$$;
```

### 4. Database: Creare `is_admin` function

Nuova funzione per verificare se un utente e admin (non solo super admin):

```sql
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = _user_id
      AND p.email IN (
        'info@362gradi.it',
        'valentina362g@gmail.com',
        'ilaria@362gradi.it',
        'marco@362gradi.it'
      )
  )
$$;
```

### 5. Frontend: Aggiornare `useAdminClients.ts`

Aggiornare la funzione `getCollaboratorCoachName` per includere le nuove email:

```typescript
const getCollaboratorCoachName = (email: string): CoachName | null => {
  switch (email) {
    case 'ilaria@362gradi.it': return 'Ilaria';
    case 'marco@362gradi.it': return 'Marco';
    case 'martina@362gradi.it':
    case 'martina.fienga@hotmail.it': return 'Martina';
    case 'michela@362gradi.it':
    case 'michela.amadei@hotmail.it': return 'Michela';
    case 'cristina@362gradi.it':
    case 'spicri@gmail.com': return 'Cristina';
    default: return null;
  }
};
```

### 6. Frontend: Aggiornare `AuthContext.tsx`

Aggiungere verifica per nuovi admin:

```typescript
const isAdmin = roles.includes('admin');
const isSuperAdmin = user?.email === 'info@362gradi.it';
const isFullAdmin = isAdmin || [
  'valentina362g@gmail.com',
  'ilaria@362gradi.it', 
  'marco@362gradi.it'
].includes(user?.email || '');
```

### 7. Frontend: Aggiornare `GestioneDiario.tsx`

Mostrare filtro Coach per tutti gli Admin, non solo SuperAdmin:

```typescript
// Cambiare da:
{isSuperAdmin && (
  <Select ...>

// A:
{(isSuperAdmin || isAdmin) && (
  <Select ...>
```

### 8. Frontend: Nuova pagina Profilo con cambio password

Creare nuovo componente `ChangePasswordDialog.tsx`:

```typescript
// Componente per cambiare password usando supabase.auth.updateUser
const ChangePasswordDialog = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    // Gestione errori e feedback
  };
};
```

Aggiungere questo componente alla pagina `Settings.tsx` nella sezione Account.

---

## File da Modificare

| File | Modifica |
|------|----------|
| `supabase/migrations/` | Nuova migrazione per aggiornare funzioni DB |
| `src/hooks/useAdminClients.ts` | Aggiornare `getCollaboratorCoachName` |
| `src/contexts/AuthContext.tsx` | Aggiungere logica `isFullAdmin` |
| `src/pages/GestioneDiario.tsx` | Estendere filtro Coach a tutti gli Admin |
| `src/pages/Settings.tsx` | Aggiungere sezione cambio password |
| `src/components/account/ChangePasswordDialog.tsx` | Nuovo componente |

---

## Flusso di Primo Accesso Collaboratore

1. Collaboratore accede con email whitelisted + password `362@diario`
2. Sistema crea automaticamente profilo + ruolo corretto
3. Dopo login, collaboratore viene invitato a cambiare password
4. Nuova password viene salvata con `supabase.auth.updateUser`

---

## Note di Sicurezza

- Le password predefinite sono gestite lato Supabase Auth
- I collaboratori devono essere pre-registrati o il sistema li crea al primo login
- RLS policies garantiscono che i coach vedano solo i propri clienti
- Gli Admin possono vedere tutti i clienti con filtro opzionale

