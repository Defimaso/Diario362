-- Create notifications table for in-app notification bell system
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all notifications (for debugging)
CREATE POLICY "Admins can view all notifications"
ON public.notifications
FOR SELECT
USING (public.is_admin(auth.uid()) OR public.is_super_admin(auth.uid()));

-- Only service role can insert (edge functions)
-- Note: Edge functions use service_role key which bypasses RLS

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);

-- Add RLS policies for storage bucket to allow coaches to upload diets for clients
CREATE POLICY "Admins can upload diet files for clients"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'user-diets' 
  AND (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()))
);

CREATE POLICY "Collaborators can upload diet files for assigned clients"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'user-diets' 
  AND public.has_role(auth.uid(), 'collaborator')
  AND public.can_collaborator_see_client(auth.uid(), (storage.foldername(name))[1]::uuid)
);

-- Update user_diet_plans RLS for coach insert
CREATE POLICY "Admins can insert diet plans for clients"
ON public.user_diet_plans
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()));

CREATE POLICY "Collaborators can insert diet plans for assigned clients"
ON public.user_diet_plans
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'collaborator') 
  AND public.can_collaborator_see_client(auth.uid(), user_id)
);

-- Allow admins/collaborators to update diet plans they manage
CREATE POLICY "Admins can update diet plans for clients"
ON public.user_diet_plans
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()));

CREATE POLICY "Collaborators can update diet plans for assigned clients"
ON public.user_diet_plans
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'collaborator') 
  AND public.can_collaborator_see_client(auth.uid(), user_id)
);