-- ============================================
-- Fix RLS Policy for onboarding_leads
-- SECURITY FIX: Prevent anyone from updating any lead
-- app_role enum: admin, collaborator, client
-- ============================================

-- Drop the insecure update policy
DROP POLICY IF EXISTS "Anyone can update their own lead" ON public.onboarding_leads;

-- Create secure policy: Only admins can update leads
CREATE POLICY "Only admins can update leads"
  ON public.onboarding_leads FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR is_super_admin(auth.uid())
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR is_super_admin(auth.uid())
  );

COMMENT ON POLICY "Only admins can update leads" ON public.onboarding_leads IS
'Security fix: Only admins can modify leads after submission. Anonymous users can only INSERT.';

-- Note: INSERT policy remains unchanged to allow anonymous lead submissions
-- SELECT policy remains unchanged (admins only)
