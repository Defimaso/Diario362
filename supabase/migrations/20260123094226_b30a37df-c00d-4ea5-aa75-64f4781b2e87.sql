-- Create storage bucket for progress photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', false);

-- Create RLS policies for progress photos bucket
CREATE POLICY "Users can upload their own progress photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own progress photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own progress photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins and collaborators can view client progress photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'progress-photos' 
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR is_super_admin(auth.uid())
    OR (
      has_role(auth.uid(), 'collaborator'::app_role) 
      AND can_collaborator_see_client(auth.uid(), (storage.foldername(name))[1]::uuid)
    )
  )
);

-- Create progress_checks table for monthly weight and photo tracking
CREATE TABLE public.progress_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight DECIMAL(5,2),
  photo_front_url TEXT,
  photo_side_url TEXT,
  photo_back_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on progress_checks
ALTER TABLE public.progress_checks ENABLE ROW LEVEL SECURITY;

-- RLS policies for progress_checks
CREATE POLICY "Users can view their own progress checks"
ON public.progress_checks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress checks"
ON public.progress_checks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress checks"
ON public.progress_checks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress checks"
ON public.progress_checks FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress checks"
ON public.progress_checks FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

CREATE POLICY "Collaborators can view assigned client progress checks"
ON public.progress_checks FOR SELECT
USING (
  has_role(auth.uid(), 'collaborator'::app_role) 
  AND can_collaborator_see_client(auth.uid(), user_id)
);

-- Create trigger for updated_at
CREATE TRIGGER update_progress_checks_updated_at
BEFORE UPDATE ON public.progress_checks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();