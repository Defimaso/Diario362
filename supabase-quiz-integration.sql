-- ============================================
-- QUIZ INTEGRATION - Migration Script
-- Aggiunge colonne per profilo 6-needs e referral
-- Eseguire nel SQL Editor di Supabase
-- ============================================

-- 1. Aggiungere colonna need_profile alla tabella profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS need_profile TEXT
CHECK (need_profile IN ('significance', 'intelligence', 'acceptance', 'approval', 'power', 'pity'));

-- 2. Aggiungere colonna referral_source alla tabella profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_source TEXT;

-- 3. Commento esplicativo
COMMENT ON COLUMN public.profiles.need_profile IS 'Profilo 6-needs dal quiz 362gradi.ae (Chase Hughes framework)';
COMMENT ON COLUMN public.profiles.referral_source IS 'Fonte di registrazione (quiz, direct, referral, etc.)';
