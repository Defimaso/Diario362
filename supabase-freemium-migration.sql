-- ============================================
-- FREEMIUM SYSTEM - Migration Script
-- Eseguire nel SQL Editor di Supabase
-- ============================================

-- 1. Tabella sottoscrizioni utente
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  activated_at TIMESTAMPTZ,
  activation_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabella codici di attivazione
CREATE TABLE IF NOT EXISTS public.activation_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  used_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ,
  is_used BOOLEAN DEFAULT false
);

-- 3. RLS per user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
  ON public.user_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'collaborator')
    )
  );

-- 4. RLS per activation_codes
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage activation codes"
  ON public.activation_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'collaborator')
    )
  );

CREATE POLICY "Users can view unused codes for redemption"
  ON public.activation_codes FOR SELECT
  USING (is_used = false);

CREATE POLICY "Users can redeem codes"
  ON public.activation_codes FOR UPDATE
  USING (is_used = false AND auth.uid() IS NOT NULL);

-- 5. GRANDFATHERING: Tutti gli utenti esistenti diventano premium
INSERT INTO public.user_subscriptions (user_id, plan, activated_at, activation_code)
SELECT id, 'premium', now(), 'GRANDFATHERED'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 6. Trigger: nuovi utenti ottengono piano free di default
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();
