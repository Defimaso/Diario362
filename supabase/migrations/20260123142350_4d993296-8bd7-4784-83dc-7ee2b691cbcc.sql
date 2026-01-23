-- Create monthly_checks table for Google Form data synced via Make
CREATE TABLE public.monthly_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  email TEXT NOT NULL,
  
  -- Dati personali
  first_name TEXT,
  last_name TEXT,
  
  -- Percorso
  program_type TEXT,
  coach_name TEXT,
  coach_rating INTEGER,
  
  -- Date e progressione
  check_date DATE DEFAULT CURRENT_DATE,
  start_date TEXT,
  check_number TEXT,
  
  -- Allenamento
  training_type TEXT,
  training_consistency TEXT,
  wants_to_change_training BOOLEAN,
  activity_level TEXT,
  
  -- Nutrizione
  nutrition_type TEXT,
  wants_to_change_nutrition BOOLEAN,
  off_program_meals TEXT,
  off_meals_location TEXT,
  off_meals_feeling TEXT,
  after_off_meals_feeling TEXT,
  
  -- Peso
  starting_weight NUMERIC,
  last_check_weight NUMERIC,
  current_weight NUMERIC,
  
  -- Salute
  intestinal_function_start TEXT,
  intestinal_function_now TEXT,
  
  -- Valutazioni (1-5)
  training_program_rating INTEGER,
  nutrition_program_rating INTEGER,
  assistance_rating INTEGER,
  training_commitment INTEGER,
  nutrition_commitment INTEGER,
  mindset_commitment INTEGER,
  
  -- Feedback
  testimonial TEXT,
  improvement_feedback TEXT,
  next_phase_improvement TEXT,
  lifestyle_difficulty TEXT,
  next_month_goal TEXT,
  
  -- Foto (URL diretti da Google Drive)
  photo_front_url TEXT,
  photo_side_url TEXT,
  photo_back_url TEXT,
  photo_consent TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.monthly_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own monthly checks"
ON public.monthly_checks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all monthly checks"
ON public.monthly_checks
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

CREATE POLICY "Collaborators can view assigned client monthly checks"
ON public.monthly_checks
FOR SELECT
USING (has_role(auth.uid(), 'collaborator') AND can_collaborator_see_client(auth.uid(), user_id));

-- Allow service role to insert (for Make integration)
CREATE POLICY "Service role can insert monthly checks"
ON public.monthly_checks
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update monthly checks"
ON public.monthly_checks
FOR UPDATE
USING (true);

-- Trigger to update updated_at
CREATE TRIGGER update_monthly_checks_updated_at
BEFORE UPDATE ON public.monthly_checks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-link user by email
CREATE OR REPLACE FUNCTION public.link_monthly_check_to_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT id INTO NEW.user_id 
  FROM public.profiles 
  WHERE LOWER(email) = LOWER(NEW.email);
  RETURN NEW;
END;
$$;

-- Trigger to auto-link on insert
CREATE TRIGGER auto_link_monthly_check_user
BEFORE INSERT ON public.monthly_checks
FOR EACH ROW
EXECUTE FUNCTION public.link_monthly_check_to_user();