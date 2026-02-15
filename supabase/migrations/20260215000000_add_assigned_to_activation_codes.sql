-- ============================================
-- Add assigned_to field to activation_codes
-- Permette di assegnare un codice a un cliente specifico
-- ============================================

-- 1. Add assigned_to column
ALTER TABLE public.activation_codes
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_activation_codes_assigned_to
ON public.activation_codes(assigned_to);

-- 3. Update RLS policy to allow users to see codes assigned to them
CREATE POLICY "Users can view codes assigned to them"
  ON public.activation_codes FOR SELECT
  USING (assigned_to = auth.uid() OR is_used = false);

-- 4. Drop old policy that allowed viewing all unused codes
DROP POLICY IF EXISTS "Users can view unused codes for redemption" ON public.activation_codes;

-- 5. Comment
COMMENT ON COLUMN public.activation_codes.assigned_to IS
'UUID del cliente a cui questo codice è stato assegnato. NULL = codice generico utilizzabile da chiunque';
