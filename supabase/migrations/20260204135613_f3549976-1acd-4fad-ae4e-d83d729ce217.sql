
-- Add policy for collaborators to view client roles (needed for dashboard filtering)
CREATE POLICY "Collaborators can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'collaborator'::app_role)
);
