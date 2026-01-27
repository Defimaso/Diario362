-- Update handle_new_user function to include extended whitelist
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
  
  -- Collaborator/Coach group (extended whitelist)
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

-- Update can_collaborator_see_client to include new email addresses
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
        -- Michela assignments (extended with new email)
        OR (p.email IN ('michela@362gradi.it', 'michela.amadei@hotmail.it') AND (
          ca.coach_name = 'Michela' OR 
          ca.coach_name = 'Michela_Martina' OR
          ca.coach_name = 'Ilaria_Marco_Michela' OR
          ca.coach_name = 'Ilaria_Michela' OR
          ca.coach_name = 'Martina_Michela'
        ))
        -- Martina assignments (extended with new email)
        OR (p.email IN ('martina@362gradi.it', 'martina.fienga@hotmail.it') AND (
          ca.coach_name = 'Martina' OR 
          ca.coach_name = 'Michela_Martina' OR
          ca.coach_name = 'Ilaria_Martina' OR
          ca.coach_name = 'Martina_Michela'
        ))
        -- Cristina assignments (extended with new email)
        OR (p.email IN ('cristina@362gradi.it', 'spicri@gmail.com') AND ca.coach_name = 'Cristina')
      )
  )
$$;

-- Update get_collaborator_coach_name to include new email addresses
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

-- Create is_admin function to check admin status
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