-- Update handle_new_user function to include all authorized collaborator emails
-- The email whitelist includes: ilaria@362gradi.it, marco@362gradi.it, martina@362gradi.it, michela@362gradi.it, cristina@362gradi.it

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone_number)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.raw_user_meta_data ->> 'phone_number'
  );
  
  -- Assign default client role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  -- Check if user is a super admin
  IF NEW.email = 'info@362gradi.it' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  -- Check if user is a collaborator (email whitelist)
  ELSIF NEW.email IN (
    'ilaria@362gradi.it',
    'marco@362gradi.it',
    'martina@362gradi.it',
    'michela@362gradi.it',
    'cristina@362gradi.it'
  ) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'collaborator');
  END IF;
  
  RETURN NEW;
END;
$$;