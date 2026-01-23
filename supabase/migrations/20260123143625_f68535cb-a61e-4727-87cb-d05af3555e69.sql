-- Drop existing table and recreate with simplified structure
DROP TABLE IF EXISTS public.monthly_checks CASCADE;

-- Create simplified monthly_checks table
CREATE TABLE public.monthly_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    email TEXT NOT NULL,
    current_weight NUMERIC,
    photo_front_url TEXT,
    photo_side_url TEXT,
    photo_back_url TEXT,
    check_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.monthly_checks ENABLE ROW LEVEL SECURITY;

-- Recreate trigger function to link user via email
CREATE OR REPLACE FUNCTION public.link_monthly_check_to_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  SELECT id INTO NEW.user_id 
  FROM public.profiles 
  WHERE LOWER(email) = LOWER(NEW.email);
  RETURN NEW;
END;
$function$;

-- Create trigger
CREATE TRIGGER link_monthly_check_user
    BEFORE INSERT ON public.monthly_checks
    FOR EACH ROW
    EXECUTE FUNCTION public.link_monthly_check_to_user();

-- RLS Policies
CREATE POLICY "Users can view their own monthly checks"
ON public.monthly_checks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all monthly checks"
ON public.monthly_checks FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

CREATE POLICY "Collaborators can view assigned client monthly checks"
ON public.monthly_checks FOR SELECT
USING (has_role(auth.uid(), 'collaborator'::app_role) AND can_collaborator_see_client(auth.uid(), user_id));

CREATE POLICY "Service role can insert monthly checks"
ON public.monthly_checks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update monthly checks"
ON public.monthly_checks FOR UPDATE
USING (true);

-- Updated_at trigger
CREATE TRIGGER update_monthly_checks_updated_at
    BEFORE UPDATE ON public.monthly_checks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();