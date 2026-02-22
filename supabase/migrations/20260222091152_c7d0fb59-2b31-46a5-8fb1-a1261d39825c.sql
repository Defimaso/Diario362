CREATE OR REPLACE FUNCTION public.get_my_coach()
RETURNS TABLE(id uuid, name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $func$
  SELECT p2.id, COALESCE(p2.full_name, p2.email) AS name
  FROM profiles p1
  JOIN profiles p2 ON p2.id = p1.coach_id
  WHERE p1.id = auth.uid()
    AND p1.coach_id IS NOT NULL;
$func$;

GRANT EXECUTE ON FUNCTION public.get_my_coach() TO authenticated;