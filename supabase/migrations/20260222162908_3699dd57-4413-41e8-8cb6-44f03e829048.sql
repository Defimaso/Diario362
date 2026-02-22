CREATE POLICY "admins_manage_coach_assignments" ON public.coach_assignments FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "admins_update_any_profile" ON public.profiles FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION assign_coach(p_client_id UUID, p_coach_id UUID, p_coach_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles SET coach_id = p_coach_id WHERE id = p_client_id;
  DELETE FROM coach_assignments WHERE client_id = p_client_id;
  IF p_coach_name IS NOT NULL AND p_coach_name != '' THEN
    INSERT INTO coach_assignments (client_id, coach_name)
    VALUES (p_client_id, p_coach_name::coach_name);
  END IF;
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION remove_coach(p_client_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles SET coach_id = NULL WHERE id = p_client_id;
  DELETE FROM coach_assignments WHERE client_id = p_client_id;
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;