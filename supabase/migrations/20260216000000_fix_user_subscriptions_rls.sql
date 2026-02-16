-- ============================================
-- Fix RLS Policies for user_subscriptions
-- Problema: coach/admin non possono attivare premium per i clienti
-- app_role enum: admin, collaborator, client (no super_admin)
-- super_admin is checked via is_super_admin() function
-- ============================================

-- Drop existing admin policy
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.user_subscriptions;

-- Recreate with correct role checks + is_super_admin function
CREATE POLICY "Staff can manage all subscriptions"
  ON public.user_subscriptions FOR ALL
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

-- Also ensure trial_ends_at column exists (used in useSubscription.ts)
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
