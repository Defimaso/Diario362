import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'collaborator' | 'client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  isAdmin: boolean;
  isCollaborator: boolean;
  isClient: boolean;
  isSuperAdmin: boolean;
  isFullAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, phoneNumber?: string, coachName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  const fetchRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
    
    return (data || []).map(r => r.role as AppRole);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout
          setTimeout(async () => {
            const userRoles = await fetchRoles(session.user.id);
            setRoles(userRoles);
            setLoading(false);
          }, 0);
        } else {
          setRoles([]);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchRoles(session.user.id).then(userRoles => {
          setRoles(userRoles);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phoneNumber?: string, coachName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
        }
      }
    });

    if (error) {
      return { error };
    }

    // If sign up successful and coach selected, create assignment
    if (data.user && coachName) {
      // Map display names to enum values
      const coachMap: Record<string, string> = {
        'Ilaria': 'Ilaria',
        'Ilaria / Marco': 'Ilaria_Marco',
        'Ilaria / Marco / Michela': 'Ilaria_Marco_Michela',
        'Ilaria / Michela': 'Ilaria_Michela',
        'Ilaria / Martina': 'Ilaria_Martina',
        'Martina / Michela': 'Martina_Michela',
        'Marco': 'Marco',
        'Cristina': 'Cristina',
        // Legacy values
        'Martina': 'Martina',
        'Michela': 'Michela',
        'Michela / Martina': 'Michela_Martina',
      };
      
      const coachValue = coachMap[coachName] || coachName;
      
      await supabase.from('coach_assignments').insert({
        client_id: data.user.id,
        coach_name: coachValue as any
      });
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
  };

  const isAdmin = roles.includes('admin');
  const isCollaborator = roles.includes('collaborator');
  const isClient = roles.includes('client');
  const isSuperAdmin = user?.email === 'info@362gradi.it';
  
  // Full admin includes all admin emails (for coach filter visibility)
  const isFullAdmin = isAdmin || [
    'info@362gradi.it',
    'valentina362g@gmail.com',
    'ilaria@362gradi.it',
    'marco@362gradi.it'
  ].includes(user?.email || '');

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      roles,
      isAdmin,
      isCollaborator,
      isClient,
      isSuperAdmin,
      isFullAdmin,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
