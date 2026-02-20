-- =============================================
-- Migrazione: Lead ID sequenziale + UTM tracking
-- Per tracking completo storico su quiz_leads e onboarding_leads
-- =============================================

-- ===================
-- 1. QUIZ_LEADS: lead_id sequenziale + UTM
-- ===================

-- Sequenza per lead_id leggibile (QL-0001, QL-0002, ...)
CREATE SEQUENCE IF NOT EXISTS quiz_leads_seq START 1;

-- Lead ID leggibile (auto-generato)
ALTER TABLE quiz_leads
  ADD COLUMN IF NOT EXISTS lead_id TEXT UNIQUE
    DEFAULT 'QL-' || LPAD(nextval('quiz_leads_seq')::text, 4, '0');

-- UTM tracking columns
ALTER TABLE quiz_leads
  ADD COLUMN IF NOT EXISTS utm_source   TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium   TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_content  TEXT,
  ADD COLUMN IF NOT EXISTS utm_term     TEXT;

-- Device/browser info per analytics
ALTER TABLE quiz_leads
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS referrer   TEXT;

-- Indice per lead_id (ricerche veloci)
CREATE INDEX IF NOT EXISTS idx_quiz_leads_lead_id ON quiz_leads (lead_id);

-- Indice per UTM source (analytics)
CREATE INDEX IF NOT EXISTS idx_quiz_leads_utm ON quiz_leads (utm_source, utm_campaign);

-- Backfill: assegna lead_id ai record esistenti che non ce l'hanno
UPDATE quiz_leads
  SET lead_id = 'QL-' || LPAD(nextval('quiz_leads_seq')::text, 4, '0')
  WHERE lead_id IS NULL;

-- ===================
-- 2. ONBOARDING_LEADS: lead_id sequenziale + UTM
-- ===================

-- Sequenza per lead_id leggibile (OL-0001, OL-0002, ...)
CREATE SEQUENCE IF NOT EXISTS onboarding_leads_seq START 1;

-- Lead ID leggibile (auto-generato)
ALTER TABLE onboarding_leads
  ADD COLUMN IF NOT EXISTS lead_id TEXT UNIQUE
    DEFAULT 'OL-' || LPAD(nextval('onboarding_leads_seq')::text, 4, '0');

-- UTM tracking columns
ALTER TABLE onboarding_leads
  ADD COLUMN IF NOT EXISTS utm_source   TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium   TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_content  TEXT,
  ADD COLUMN IF NOT EXISTS utm_term     TEXT;

-- Device/browser info
ALTER TABLE onboarding_leads
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS referrer   TEXT;

-- Indice per lead_id
CREATE INDEX IF NOT EXISTS idx_onboarding_leads_lead_id ON onboarding_leads (lead_id);

-- Indice per UTM
CREATE INDEX IF NOT EXISTS idx_onboarding_leads_utm ON onboarding_leads (utm_source, utm_campaign);

-- Backfill: assegna lead_id ai record esistenti
UPDATE onboarding_leads
  SET lead_id = 'OL-' || LPAD(nextval('onboarding_leads_seq')::text, 4, '0')
  WHERE lead_id IS NULL;
