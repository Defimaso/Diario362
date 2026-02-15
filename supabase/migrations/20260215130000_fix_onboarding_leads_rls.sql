-- ============================================
-- Fix RLS Policy for onboarding_leads
-- SECURITY FIX: Prevent anyone from updating any lead
-- ============================================

-- Drop the insecure update policy
DROP POLICY IF EXISTS "Anyone can update their own lead" ON public.onboarding_leads;

-- Create secure policy: Only admins can update leads
CREATE POLICY "Only admins can update leads"
  ON public.onboarding_leads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

COMMENT ON POLICY "Only admins can update leads" ON public.onboarding_leads IS
'Security fix: Only admins can modify leads after submission. Anonymous users can only INSERT.';

-- Note: INSERT policy remains unchanged to allow anonymous lead submissions
-- SELECT policy remains unchanged (admins only)
