-- Create user_checks table for manual monthly checks
CREATE TABLE public.user_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_number INTEGER NOT NULL,
  weight NUMERIC,
  photo_front_url TEXT,
  photo_side_url TEXT,
  photo_back_url TEXT,
  notes TEXT,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, check_number)
);

-- Enable RLS
ALTER TABLE public.user_checks ENABLE ROW LEVEL SECURITY;

-- Users can view their own checks
CREATE POLICY "Users can view their own checks"
ON public.user_checks
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own checks
CREATE POLICY "Users can insert their own checks"
ON public.user_checks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own checks
CREATE POLICY "Users can update their own checks"
ON public.user_checks
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own checks
CREATE POLICY "Users can delete their own checks"
ON public.user_checks
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all checks
CREATE POLICY "Admins can view all user checks"
ON public.user_checks
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

-- Collaborators can view assigned client checks
CREATE POLICY "Collaborators can view assigned client checks"
ON public.user_checks
FOR SELECT
USING (has_role(auth.uid(), 'collaborator') AND can_collaborator_see_client(auth.uid(), user_id));

-- Create trigger for updated_at
CREATE TRIGGER update_user_checks_updated_at
BEFORE UPDATE ON public.user_checks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_user_checks_user_id ON public.user_checks(user_id);
CREATE INDEX idx_user_checks_check_number ON public.user_checks(user_id, check_number);