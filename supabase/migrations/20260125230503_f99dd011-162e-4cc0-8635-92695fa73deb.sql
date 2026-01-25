-- Create user_consents table to track GDPR consents
CREATE TABLE public.user_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  biometric_consent BOOLEAN NOT NULL DEFAULT false,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  privacy_accepted_at TIMESTAMP WITH TIME ZONE,
  biometric_consent_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create audit_logs table for GDPR accountability
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID NOT NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_user_id UUID,
  target_table TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- User consents policies
CREATE POLICY "Users can view their own consents"
ON public.user_consents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents"
ON public.user_consents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consents"
ON public.user_consents FOR UPDATE
USING (auth.uid() = user_id);

-- Audit logs policies - only admins/super admin can view
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs FOR SELECT
USING (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() = actor_id);

-- Update storage policies for progress-photos bucket to be more restrictive
-- First drop existing permissive policies if they exist
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;

-- Create strict RLS policies for storage
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'progress-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'progress-photos' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR has_role(auth.uid(), 'admin')
    OR is_super_admin(auth.uid())
    OR (has_role(auth.uid(), 'collaborator') AND can_collaborator_see_client(auth.uid(), ((storage.foldername(name))[1])::uuid))
  )
);

CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'progress-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'progress-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create trigger for updated_at on user_consents
CREATE TRIGGER update_user_consents_updated_at
BEFORE UPDATE ON public.user_consents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();