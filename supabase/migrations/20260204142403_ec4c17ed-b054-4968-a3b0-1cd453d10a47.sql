-- Create table for client documents (multiple PDFs per client)
CREATE TABLE public.client_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

-- Clients can view their own documents
CREATE POLICY "Users can view their own documents"
ON public.client_documents
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins can manage all documents"
ON public.client_documents
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Collaborators can manage documents for their assigned clients
CREATE POLICY "Collaborators can view assigned client documents"
ON public.client_documents
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'collaborator'::public.app_role)
  AND public.can_collaborator_see_client(user_id, auth.uid())
);

CREATE POLICY "Collaborators can insert documents for assigned clients"
ON public.client_documents
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'collaborator'::public.app_role)
  AND public.can_collaborator_see_client(user_id, auth.uid())
);

CREATE POLICY "Collaborators can delete documents for assigned clients"
ON public.client_documents
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'collaborator'::public.app_role)
  AND public.can_collaborator_see_client(user_id, auth.uid())
);

-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-documents', 'client-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for client-documents bucket
CREATE POLICY "Users can view their own client documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can manage all client documents storage"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'client-documents'
  AND public.is_admin(auth.uid())
);

CREATE POLICY "Collaborators can upload documents for assigned clients"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-documents'
  AND public.has_role(auth.uid(), 'collaborator'::public.app_role)
  AND public.can_collaborator_see_client((storage.foldername(name))[1]::uuid, auth.uid())
);

CREATE POLICY "Collaborators can view documents for assigned clients"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-documents'
  AND public.has_role(auth.uid(), 'collaborator'::public.app_role)
  AND public.can_collaborator_see_client((storage.foldername(name))[1]::uuid, auth.uid())
);

CREATE POLICY "Collaborators can delete documents for assigned clients"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'client-documents'
  AND public.has_role(auth.uid(), 'collaborator'::public.app_role)
  AND public.can_collaborator_see_client((storage.foldername(name))[1]::uuid, auth.uid())
);

-- Trigger for updated_at
CREATE TRIGGER update_client_documents_updated_at
BEFORE UPDATE ON public.client_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();