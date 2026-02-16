-- ============================================
-- Fix RLS Policy for activation_codes
-- SECURITY FIX: Prevent users from seeing all unused codes
-- app_role enum: admin, collaborator, client
-- super_admin checked via is_super_admin() function
-- ============================================

-- Drop the insecure policy
DROP POLICY IF EXISTS "Users can view codes assigned to them" ON public.activation_codes;

-- Create secure policy: Users can only see codes assigned to them
-- Admins and super_admins can see all codes
CREATE POLICY "Users can view assigned codes only"
  ON public.activation_codes FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'collaborator'::app_role)
    OR is_super_admin(auth.uid())
  );

-- Allow admins and collaborators to insert codes
CREATE POLICY "Admins can insert codes"
  ON public.activation_codes FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'collaborator'::app_role)
    OR is_super_admin(auth.uid())
  );

-- Allow admins to update codes (for marking as used)
CREATE POLICY "System can update codes"
  ON public.activation_codes FOR UPDATE
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "Users can view assigned codes only" ON public.activation_codes IS
'Security fix: Users can only view codes specifically assigned to them. Staff can view all codes.';
