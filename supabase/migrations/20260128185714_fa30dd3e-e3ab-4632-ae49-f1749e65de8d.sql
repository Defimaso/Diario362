-- ===========================================
-- 1. VIDEO CORRECTIONS SYSTEM
-- ===========================================

-- Create storage bucket for client exercise videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-corrections', 'exercise-corrections', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for exercise-corrections bucket
CREATE POLICY "Users can upload their own exercise videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exercise-corrections' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own exercise videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'exercise-corrections' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Staff can view all exercise videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'exercise-corrections' 
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'collaborator') OR is_super_admin(auth.uid()))
);

CREATE POLICY "Users can delete their own exercise videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'exercise-corrections' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create table for client video corrections
CREATE TABLE public.video_corrections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for coach feedback on videos
CREATE TABLE public.video_correction_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.video_corrections(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_correction_feedback ENABLE ROW LEVEL SECURITY;

-- RLS for video_corrections
CREATE POLICY "Users can insert their own videos"
ON public.video_corrections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own videos"
ON public.video_corrections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
ON public.video_corrections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
ON public.video_corrections FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all videos"
ON public.video_corrections FOR SELECT
USING (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

CREATE POLICY "Collaborators can view assigned client videos"
ON public.video_corrections FOR SELECT
USING (has_role(auth.uid(), 'collaborator') AND can_collaborator_see_client(auth.uid(), user_id));

-- RLS for video_correction_feedback
CREATE POLICY "Users can view feedback on their videos"
ON public.video_correction_feedback FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.video_corrections vc 
    WHERE vc.id = video_id AND vc.user_id = auth.uid()
  )
);

CREATE POLICY "Users can mark feedback as read"
ON public.video_correction_feedback FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.video_corrections vc 
    WHERE vc.id = video_id AND vc.user_id = auth.uid()
  )
);

CREATE POLICY "Staff can insert feedback"
ON public.video_correction_feedback FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'collaborator') OR is_super_admin(auth.uid()))
  AND coach_id = auth.uid()
);

CREATE POLICY "Staff can view all feedback"
ON public.video_correction_feedback FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'collaborator') OR is_super_admin(auth.uid()));

CREATE POLICY "Coaches can update their own feedback"
ON public.video_correction_feedback FOR UPDATE
USING (coach_id = auth.uid());

CREATE POLICY "Coaches can delete their own feedback"
ON public.video_correction_feedback FOR DELETE
USING (coach_id = auth.uid());

-- Trigger to update updated_at on video_corrections
CREATE TRIGGER update_video_corrections_updated_at
BEFORE UPDATE ON public.video_corrections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- 2. UPDATE DAILY_CHECKINS TABLE
-- ===========================================

-- Add nutrition_score column (1-10 instead of boolean)
ALTER TABLE public.daily_checkins 
ADD COLUMN IF NOT EXISTS nutrition_score INTEGER;

-- Add nutrition_notes for additional comments
ALTER TABLE public.daily_checkins 
ADD COLUMN IF NOT EXISTS nutrition_notes TEXT;

-- Add training_score column (1-10 or NULL for rest day)
ALTER TABLE public.daily_checkins 
ADD COLUMN IF NOT EXISTS training_score INTEGER;

-- Add training_rest_day flag (X option)
ALTER TABLE public.daily_checkins 
ADD COLUMN IF NOT EXISTS training_rest_day BOOLEAN DEFAULT false;

-- Enable realtime for video feedback (for notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_correction_feedback;