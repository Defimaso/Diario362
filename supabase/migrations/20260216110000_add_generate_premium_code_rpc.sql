-- RPC function for staff to generate a premium code for a client
-- SECURITY DEFINER bypasses RLS
CREATE OR REPLACE FUNCTION public.generate_premium_code(_client_id UUID, _code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller_id UUID;
  _is_staff BOOLEAN;
BEGIN
  _caller_id := auth.uid();
  IF _caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Non autenticato');
  END IF;

  -- Check caller is staff
  SELECT (
    has_role(_caller_id, 'admin'::app_role)
    OR has_role(_caller_id, 'collaborator'::app_role)
    OR is_super_admin(_caller_id)
  ) INTO _is_staff;

  IF NOT _is_staff THEN
    RETURN json_build_object('success', false, 'error', 'Non autorizzato');
  END IF;

  -- Set premium_code on the client's profile
  UPDATE public.profiles
  SET premium_code = _code, updated_at = now()
  WHERE id = _client_id;

  RETURN json_build_object('success', true, 'code', _code);
END;
$$;
