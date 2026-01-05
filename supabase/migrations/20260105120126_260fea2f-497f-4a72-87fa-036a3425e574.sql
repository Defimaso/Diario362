-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'collaborator', 'client');

-- Create enum for coaches
CREATE TYPE public.coach_name AS ENUM ('Martina', 'Michela', 'Cristina', 'Michela_Martina');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'client',
  UNIQUE (user_id, role)
);

-- Create coach_assignments table for client-coach relationships
CREATE TABLE public.coach_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_name coach_name NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, coach_name)
);

-- Create daily_checkins table
CREATE TABLE public.daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  recovery INTEGER CHECK (recovery >= 1 AND recovery <= 10),
  nutrition_adherence BOOLEAN,
  energy INTEGER CHECK (energy >= 1 AND energy <= 10),
  mindset INTEGER CHECK (mindset >= 1 AND mindset <= 10),
  two_percent_edge TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer function to check if user is super admin (info@362gradi.it)
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND email = 'info@362gradi.it'
  )
$$;

-- Security definer function to get collaborator's coach name
CREATE OR REPLACE FUNCTION public.get_collaborator_coach_name(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN p.email = 'martina@362gradi.it' THEN 'Martina'
      WHEN p.email = 'michela@362gradi.it' THEN 'Michela'
      WHEN p.email = 'cristina@362gradi.it' THEN 'Cristina'
      ELSE NULL
    END
  FROM public.profiles p
  WHERE p.id = _user_id
$$;

-- Security definer function to check if collaborator can see client
CREATE OR REPLACE FUNCTION public.can_collaborator_see_client(_collaborator_id UUID, _client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.coach_assignments ca
    JOIN public.profiles p ON p.id = _collaborator_id
    WHERE ca.client_id = _client_id
      AND (
        (p.email = 'martina@362gradi.it' AND (ca.coach_name = 'Martina' OR ca.coach_name = 'Michela_Martina'))
        OR (p.email = 'michela@362gradi.it' AND (ca.coach_name = 'Michela' OR ca.coach_name = 'Michela_Martina'))
        OR (p.email = 'cristina@362gradi.it' AND ca.coach_name = 'Cristina')
      )
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins and collaborators can view all profiles" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'collaborator')
    OR public.is_super_admin(auth.uid())
  );

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.is_super_admin(auth.uid())
  );

-- RLS Policies for coach_assignments
CREATE POLICY "Clients can view their own assignments" ON public.coach_assignments
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert their own assignments" ON public.coach_assignments
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins can view all assignments" ON public.coach_assignments
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "Collaborators can view assigned client assignments" ON public.coach_assignments
  FOR SELECT USING (
    public.has_role(auth.uid(), 'collaborator')
    AND public.can_collaborator_see_client(auth.uid(), client_id)
  );

-- RLS Policies for daily_checkins
CREATE POLICY "Users can view their own checkins" ON public.daily_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checkins" ON public.daily_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checkins" ON public.daily_checkins
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all checkins" ON public.daily_checkins
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "Collaborators can view assigned client checkins" ON public.daily_checkins
  FOR SELECT USING (
    public.has_role(auth.uid(), 'collaborator')
    AND public.can_collaborator_see_client(auth.uid(), user_id)
  );

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  
  -- Assign default client role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  -- Check if user is a collaborator or admin
  IF NEW.email = 'info@362gradi.it' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSIF NEW.email IN ('martina@362gradi.it', 'michela@362gradi.it', 'cristina@362gradi.it') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'collaborator');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_checkins_updated_at
  BEFORE UPDATE ON public.daily_checkins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();