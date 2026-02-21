-- Aggiunge coach_id a profiles (UUID del coach assegnato)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- RPC: admin/collaborator assegna un coach a un client
CREATE OR REPLACE FUNCTION public.assign_coach(p_client_id uuid, p_coach_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles SET coach_id = p_coach_id, updated_at = now()
  WHERE id = p_client_id;
$$;
GRANT EXECUTE ON FUNCTION public.assign_coach(uuid, uuid) TO authenticated;

-- RPC: admin rimuove il coach da un client
CREATE OR REPLACE FUNCTION public.remove_coach(p_client_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles SET coach_id = NULL, updated_at = now()
  WHERE id = p_client_id;
$$;
GRANT EXECUTE ON FUNCTION public.remove_coach(uuid) TO authenticated;

-- RPC: cliente vede il proprio coach assegnato
CREATE OR REPLACE FUNCTION public.get_my_coach()
RETURNS TABLE(id uuid, name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p2.id, COALESCE(p2.full_name, p2.email) AS name
  FROM profiles p1
  JOIN profiles p2 ON p2.id = p1.coach_id
  WHERE p1.id = auth.uid() AND p1.coach_id IS NOT NULL;
$$;
GRANT EXECUTE ON FUNCTION public.get_my_coach() TO authenticated;
