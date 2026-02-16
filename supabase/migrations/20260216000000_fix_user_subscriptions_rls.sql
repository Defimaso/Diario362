-- ============================================
-- Fix RLS Policies for user_subscriptions
-- Problema: coach/admin non possono attivare premium per i clienti
-- Mancava super_admin e WITH CHECK per INSERT/UPDATE
-- ============================================

-- Drop existing admin policy (might be missing super_admin)
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.user_subscriptions;

-- Recreate with all staff roles AND explicit WITH CHECK
CREATE POLICY "Staff can manage all subscriptions"
  ON public.user_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin', 'collaborator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin', 'collaborator')
    )
  );

-- Also ensure trial_ends_at column exists (used in useSubscription.ts)
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
