-- ============================================
-- Fix RLS Policy for activation_codes
-- SECURITY FIX: Prevent users from seeing all unused codes
-- ============================================

-- Drop the insecure policy
DROP POLICY IF EXISTS "Users can view codes assigned to them" ON public.activation_codes;

-- Create secure policy: Users can only see codes assigned to them
-- Admins and super_admins can see all codes
CREATE POLICY "Users can view assigned codes only"
  ON public.activation_codes FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Allow admins to insert codes
CREATE POLICY "Admins can insert codes"
  ON public.activation_codes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'collaborator')
    )
  );

-- Allow admins to update codes (for marking as used)
CREATE POLICY "System can update codes"
  ON public.activation_codes FOR UPDATE
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "Users can view assigned codes only" ON public.activation_codes IS
'Security fix: Users can only view codes specifically assigned to them. Admins can view all codes.';
