-- Create coach_notes table for internal communication
CREATE TABLE public.coach_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_notes ENABLE ROW LEVEL SECURITY;

-- Super admin can do everything
CREATE POLICY "Super admin can manage all notes"
ON public.coach_notes
FOR ALL
USING (is_super_admin(auth.uid()));

-- Collaborators can read notes for their assigned clients
CREATE POLICY "Collaborators can view notes for assigned clients"
ON public.coach_notes
FOR SELECT
USING (
  has_role(auth.uid(), 'collaborator'::app_role) 
  AND can_collaborator_see_client(auth.uid(), client_id)
);

-- Collaborators can update read_by on notes they can see
CREATE POLICY "Collaborators can mark notes as read"
ON public.coach_notes
FOR UPDATE
USING (
  has_role(auth.uid(), 'collaborator'::app_role) 
  AND can_collaborator_see_client(auth.uid(), client_id)
)
WITH CHECK (
  has_role(auth.uid(), 'collaborator'::app_role) 
  AND can_collaborator_see_client(auth.uid(), client_id)
);

-- Create index for faster queries
CREATE INDEX idx_coach_notes_client_id ON public.coach_notes(client_id);
CREATE INDEX idx_coach_notes_created_at ON public.coach_notes(created_at DESC);