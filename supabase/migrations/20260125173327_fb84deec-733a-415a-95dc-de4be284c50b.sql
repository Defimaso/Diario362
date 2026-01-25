-- Drop existing restrictive policies for service role
DROP POLICY IF EXISTS "Service role can insert monthly checks" ON public.monthly_checks;
DROP POLICY IF EXISTS "Service role can update monthly checks" ON public.monthly_checks;

-- Create PERMISSIVE policies (default) that allow all inserts/updates
-- These will work with the service role key which bypasses RLS anyway
-- But we need permissive policies for the anon key used by edge functions

CREATE POLICY "Allow insert for service operations"
ON public.monthly_checks
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow update for service operations"
ON public.monthly_checks
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);