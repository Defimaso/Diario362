-- Create storage bucket for diet plans (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-diets', 'user-diets', false);

-- Storage RLS: Users can upload own diet files
CREATE POLICY "Users can upload own diet files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-diets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage RLS: Users can view own diet files
CREATE POLICY "Users can view own diet files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-diets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage RLS: Users can delete own diet files
CREATE POLICY "Users can delete own diet files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-diets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage RLS: Users can update own diet files
CREATE POLICY "Users can update own diet files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-diets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage RLS: Admins can view all diet files
CREATE POLICY "Admins can view all diet files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-diets' AND
  (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()))
);

-- Storage RLS: Collaborators can view assigned client diet files
CREATE POLICY "Collaborators can view assigned client diet files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-diets' AND
  public.has_role(auth.uid(), 'collaborator') AND
  public.can_collaborator_see_client(auth.uid(), (storage.foldername(name))[1]::uuid)
);

-- Create table for diet plan metadata
CREATE TABLE public.user_diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_diet_plans ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view own diet plan
CREATE POLICY "Users can view own diet plan"
ON public.user_diet_plans FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS: Users can insert own diet plan
CREATE POLICY "Users can insert own diet plan"
ON public.user_diet_plans FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS: Users can update own diet plan
CREATE POLICY "Users can update own diet plan"
ON public.user_diet_plans FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- RLS: Users can delete own diet plan
CREATE POLICY "Users can delete own diet plan"
ON public.user_diet_plans FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS: Admins can view all diet plans
CREATE POLICY "Admins can view all diet plans"
ON public.user_diet_plans FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.is_super_admin(auth.uid())
);

-- RLS: Collaborators can view assigned client diet plans
CREATE POLICY "Collaborators can view assigned client diet plans"
ON public.user_diet_plans FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'collaborator') AND
  public.can_collaborator_see_client(auth.uid(), user_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_user_diet_plans_updated_at
BEFORE UPDATE ON public.user_diet_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();