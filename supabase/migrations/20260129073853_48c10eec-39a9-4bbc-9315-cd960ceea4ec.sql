-- Add video_url column to video_correction_feedback for coach video responses
ALTER TABLE public.video_correction_feedback 
ADD COLUMN IF NOT EXISTS video_url text;