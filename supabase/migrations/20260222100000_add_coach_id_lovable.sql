-- Aggiunge coach_id a profiles se non esiste (fix per Lovable Supabase ezjtheshclmruzlgwyfa)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- RLS: permetti agli utenti autenticati di aggiornare coach_id (staff)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'staff_can_update_coach_id'
  ) THEN
    CREATE POLICY "staff_can_update_coach_id"
      ON public.profiles
      FOR UPDATE
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;
