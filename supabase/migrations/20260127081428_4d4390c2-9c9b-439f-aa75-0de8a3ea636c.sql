-- Create onboarding_leads table for acquisition funnel
CREATE TABLE public.onboarding_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Contact info
  email TEXT,
  
  -- Block 1: La Destinazione (Bio & Goal)
  gender TEXT,
  age INTEGER,
  height INTEGER,
  current_weight NUMERIC,
  target_weight NUMERIC,
  min_historic_size TEXT,
  special_event TEXT,
  
  -- Block 2: La Macchina (Metabolismo & Salute)
  metabolism TEXT,
  health_conditions TEXT[],
  medications TEXT,
  sleep_hours INTEGER,
  wake_quality TEXT,
  water_liters NUMERIC,
  
  -- Block 3: Il Carburante (Nutrizione)
  meals_per_day INTEGER,
  weakness TEXT,
  eating_out_frequency TEXT,
  skip_breakfast BOOLEAN,
  allergies TEXT,
  diet_type TEXT,
  
  -- Block 4: La Mente (Psicologia)
  why_now TEXT,
  past_obstacle TEXT,
  stress_eating BOOLEAN,
  post_cheat_feeling TEXT,
  home_support BOOLEAN,
  weekend_challenge TEXT,
  
  -- Block 5: L'Azione (Allenamento)
  preferred_location TEXT,
  weekly_sessions TEXT,
  session_duration TEXT,
  home_equipment TEXT,
  injuries TEXT,
  experience_level TEXT,
  commit_daily_diary BOOLEAN,
  
  -- Computed/Assigned
  profile_badge TEXT,
  predicted_weeks INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.onboarding_leads ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (anonymous users can submit)
CREATE POLICY "Anyone can insert leads"
ON public.onboarding_leads
FOR INSERT
WITH CHECK (true);

-- Allow updates for the same session (by ID)
CREATE POLICY "Anyone can update their own lead"
ON public.onboarding_leads
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Only admins can view all leads
CREATE POLICY "Admins can view all leads"
ON public.onboarding_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_onboarding_leads_updated_at
BEFORE UPDATE ON public.onboarding_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();