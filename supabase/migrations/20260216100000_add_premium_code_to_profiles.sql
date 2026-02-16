-- ============================================
-- Add premium_code column to profiles
-- Allows coaches to generate per-client activation codes
-- ============================================

-- 1. Add premium_code column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS premium_code TEXT;

-- 2. Unique partial index: no two profiles share the same active code
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_premium_code
  ON public.profiles(premium_code)
  WHERE premium_code IS NOT NULL;

-- 3. Staff can update any profile (needed for coaches to set premium_code)
DROP POLICY IF EXISTS "Staff can update all profiles" ON public.profiles;
CREATE POLICY "Staff can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'collaborator'::app_role)
    OR is_super_admin(auth.uid())
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'collaborator'::app_role)
    OR is_super_admin(auth.uid())
  );

-- 4. RPC function: client calls this to activate their premium code
--    SECURITY DEFINER so it can update profiles and user_subscriptions
CREATE OR REPLACE FUNCTION public.activate_premium_code(_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _target_user_id UUID;
  _caller_id UUID;
BEGIN
  _caller_id := auth.uid();
  IF _caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Non autenticato');
  END IF;

  -- Find the profile with this premium_code
  SELECT id INTO _target_user_id
  FROM public.profiles
  WHERE premium_code = _code
  LIMIT 1;

  IF _target_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Codice non valido o già utilizzato');
  END IF;

  -- Verify the code belongs to the calling user
  IF _target_user_id != _caller_id THEN
    RETURN json_build_object('success', false, 'error', 'Questo codice non è assegnato a te');
  END IF;

  -- Upsert user_subscriptions to premium
  INSERT INTO public.user_subscriptions (user_id, plan, activated_at, activation_code)
  VALUES (_caller_id, 'premium', now(), _code)
  ON CONFLICT (user_id) DO UPDATE
  SET plan = 'premium',
      activated_at = now(),
      activation_code = _code,
      trial_ends_at = NULL;

  -- Clear the premium_code (one-time use)
  UPDATE public.profiles
  SET premium_code = NULL, updated_at = now()
  WHERE id = _target_user_id;

  RETURN json_build_object('success', true);
END;
$$;
