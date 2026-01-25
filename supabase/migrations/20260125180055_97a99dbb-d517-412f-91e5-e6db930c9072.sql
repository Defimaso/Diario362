-- Update the can_collaborator_see_client function to handle new coach combinations
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
        -- Michela assignments (keep old logic + new combinations)
        OR (p.email = 'michela@362gradi.it' AND (
          ca.coach_name = 'Michela' OR 
          ca.coach_name = 'Michela_Martina' OR
          ca.coach_name = 'Ilaria_Marco_Michela' OR
          ca.coach_name = 'Ilaria_Michela' OR
          ca.coach_name = 'Martina_Michela'
        ))
        -- Martina assignments (keep old logic + new combinations)
        OR (p.email = 'martina@362gradi.it' AND (
          ca.coach_name = 'Martina' OR 
          ca.coach_name = 'Michela_Martina' OR
          ca.coach_name = 'Ilaria_Martina' OR
          ca.coach_name = 'Martina_Michela'
        ))
        -- Cristina assignments
        OR (p.email = 'cristina@362gradi.it' AND ca.coach_name = 'Cristina')
      )
  )
$$;

-- Update the get_collaborator_coach_name function
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
      WHEN p.email = 'martina@362gradi.it' THEN 'Martina'
      WHEN p.email = 'michela@362gradi.it' THEN 'Michela'
      WHEN p.email = 'cristina@362gradi.it' THEN 'Cristina'
      ELSE NULL
    END
  FROM public.profiles p
  WHERE p.id = _user_id
$$;