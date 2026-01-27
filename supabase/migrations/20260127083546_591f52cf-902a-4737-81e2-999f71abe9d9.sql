-- Add new columns for extended funnel questions
ALTER TABLE public.onboarding_leads ADD COLUMN IF NOT EXISTS body_type text;
ALTER TABLE public.onboarding_leads ADD COLUMN IF NOT EXISTS energy_level text;
ALTER TABLE public.onboarding_leads ADD COLUMN IF NOT EXISTS digestion text;
ALTER TABLE public.onboarding_leads ADD COLUMN IF NOT EXISTS snacking_habit text;
ALTER TABLE public.onboarding_leads ADD COLUMN IF NOT EXISTS late_eating boolean;
ALTER TABLE public.onboarding_leads ADD COLUMN IF NOT EXISTS alcohol_frequency text;
ALTER TABLE public.onboarding_leads ADD COLUMN IF NOT EXISTS previous_diets text[];
ALTER TABLE public.onboarding_leads ADD COLUMN IF NOT EXISTS biggest_fear text;
ALTER TABLE public.onboarding_leads ADD COLUMN IF NOT EXISTS motivation_source text;
ALTER TABLE public.onboarding_leads ADD COLUMN IF NOT EXISTS daily_activity text;
ALTER TABLE public.onboarding_leads ADD COLUMN IF NOT EXISTS cardio_preference text;
ALTER TABLE public.onboarding_leads ADD COLUMN IF NOT EXISTS flexibility text;
ALTER TABLE public.onboarding_leads ADD COLUMN IF NOT EXISTS name text;