-- =============================================
-- Tabella quiz_leads: salva i lead dal quiz 362gradi.ae
-- Ogni riga = 1 completamento quiz con email
-- =============================================

CREATE TABLE IF NOT EXISTS quiz_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  name text,
  need_profile text NOT NULL,
  profile_name text NOT NULL,
  hook_choice text,
  source text DEFAULT 'quiz_popup',
  quiz_mode text DEFAULT 'short',
  all_answers jsonb,
  email_sent boolean DEFAULT false,
  resend_email_id text,
  created_at timestamptz DEFAULT now()
);

-- Indice per email (ricerche e dedup)
CREATE INDEX IF NOT EXISTS idx_quiz_leads_email ON quiz_leads (email);

-- Indice per profilo (analytics)
CREATE INDEX IF NOT EXISTS idx_quiz_leads_profile ON quiz_leads (need_profile);

-- Indice per data (ordinamento)
CREATE INDEX IF NOT EXISTS idx_quiz_leads_created ON quiz_leads (created_at DESC);

-- RLS: solo service_role può inserire (dalla Edge Function)
ALTER TABLE quiz_leads ENABLE ROW LEVEL SECURITY;

-- Policy: admin/coach possono leggere tutti i lead
CREATE POLICY "Admins can read quiz leads" ON quiz_leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin', 'coach')
    )
  );

-- Policy: service role può inserire (Edge Function usa service_role key)
CREATE POLICY "Service role can insert quiz leads" ON quiz_leads
  FOR INSERT
  WITH CHECK (true);
