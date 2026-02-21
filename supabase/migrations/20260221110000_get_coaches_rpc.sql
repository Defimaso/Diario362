-- Funzione per ottenere la lista dei coach (admin/collaborator) visibile a tutti gli utenti auth
-- security definer = bypassa RLS e gira con i permessi del proprietario della funzione
CREATE OR REPLACE FUNCTION public.get_coaches()
RETURNS TABLE(id uuid, name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, COALESCE(p.full_name, p.email) AS name
  FROM profiles p
  INNER JOIN user_roles r ON r.user_id = p.id
  WHERE r.role IN ('admin', 'collaborator')
  ORDER BY name;
$$;

-- Permetti agli utenti autenticati di eseguire la funzione
GRANT EXECUTE ON FUNCTION public.get_coaches() TO authenticated;
