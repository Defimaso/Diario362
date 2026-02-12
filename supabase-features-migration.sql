-- ============================================
-- FEATURES MIGRATION - Trial, Messaggi, Challenge, Leaderboard, Recap
-- Eseguire nel SQL Editor di Supabase
-- ============================================

-- =====================
-- 1. TRIAL PREMIUM 7 GIORNI
-- Aggiunge colonna trial_ends_at a user_subscriptions
-- =====================
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Aggiornare il trigger per dare 7gg trial ai nuovi utenti
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan, trial_ends_at)
  VALUES (NEW.id, 'free', now() + interval '7 days')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- 2. MESSAGGISTICA COACH-CLIENTE
-- =====================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(
  LEAST(sender_id, receiver_id),
  GREATEST(sender_id, receiver_id),
  created_at DESC
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id);

CREATE POLICY "Admins can view all messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'collaborator')
    )
  );

CREATE POLICY "Admins can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'collaborator')
    )
  );

-- =====================
-- 3. CHALLENGE SYSTEM
-- =====================
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'weekly' CHECK (type IN ('weekly', 'monthly', 'custom')),
  target_value INTEGER NOT NULL DEFAULT 7,
  target_metric TEXT NOT NULL DEFAULT 'checkin_streak' CHECK (target_metric IN ('checkin_streak', 'avg_score', 'total_checkins', 'custom')),
  created_by UUID REFERENCES auth.users(id),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  badge_emoji TEXT DEFAULT '🏆',
  badge_name TEXT DEFAULT 'Sfida Completata',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON public.challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON public.challenge_participants(challenge_id);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- Tutti possono vedere le challenge attive
CREATE POLICY "Anyone can view active challenges"
  ON public.challenges FOR SELECT
  USING (is_active = true);

-- Admin creano challenge
CREATE POLICY "Admins can manage challenges"
  ON public.challenges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'collaborator')
    )
  );

-- Utenti vedono le proprie partecipazioni
CREATE POLICY "Users can view own participation"
  ON public.challenge_participants FOR SELECT
  USING (auth.uid() = user_id);

-- Utenti possono unirsi
CREATE POLICY "Users can join challenges"
  ON public.challenge_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Utenti possono aggiornare il proprio progresso
CREATE POLICY "Users can update own progress"
  ON public.challenge_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin vedono tutti i partecipanti
CREATE POLICY "Admins can view all participants"
  ON public.challenge_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'collaborator')
    )
  );

CREATE POLICY "Admins can manage participants"
  ON public.challenge_participants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'collaborator')
    )
  );

-- =====================
-- 4. LEADERBOARD (opt-in)
-- =====================
CREATE TABLE IF NOT EXISTS public.leaderboard_opt_in (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  opted_in_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.leaderboard_opt_in ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own opt-in"
  ON public.leaderboard_opt_in FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view leaderboard"
  ON public.leaderboard_opt_in FOR SELECT
  USING (true);

-- =====================
-- 5. MILESTONES / JOURNEY
-- =====================
CREATE TABLE IF NOT EXISTS public.user_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  milestone_type TEXT NOT NULL,
  milestone_value TEXT,
  achieved_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, milestone_type)
);

ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON public.user_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert milestones"
  ON public.user_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all milestones"
  ON public.user_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'collaborator')
    )
  );

-- =====================
-- 6. WEEKLY RECAP TRACKING
-- =====================
CREATE TABLE IF NOT EXISTS public.weekly_recaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_checkins INTEGER DEFAULT 0,
  avg_recovery NUMERIC(3,1),
  avg_energy NUMERIC(3,1),
  avg_mindset NUMERIC(3,1),
  streak_at_end INTEGER DEFAULT 0,
  highlights TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.weekly_recaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recaps"
  ON public.weekly_recaps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert recaps"
  ON public.weekly_recaps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all recaps"
  ON public.weekly_recaps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'collaborator')
    )
  );

-- =====================
-- 7. Realtime per messaggi
-- =====================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
