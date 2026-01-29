import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useConsents } from '@/hooks/useConsents';
import PhoneInput from '@/components/PhoneInput';
import ConsentCheckboxes from '@/components/legal/ConsentCheckboxes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

// Whitelist collaboratori per auto-provisioning
const STAFF_WHITELIST: Record<string, { role: 'admin' | 'coach'; name: string }> = {
  // ADMIN
  'info@362gradi.it': { role: 'admin', name: '362 Gradi Admin' },
  'valentina362g@gmail.com': { role: 'admin', name: 'Valentina' },
  // COACH
  'michela.amadei@hotmail.it': { role: 'coach', name: 'Michela' },
  'martina.fienga@hotmail.it': { role: 'coach', name: 'Martina' },
  'spicri@gmail.com': { role: 'coach', name: 'Cristina' },
};

const DEFAULT_STAFF_PASSWORD = '362@diario';

const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Il nome deve avere almeno 2 caratteri'),
  phoneNumber: z.string().min(8, 'Inserisci un numero di telefono valido'),
  coachName: z.string().min(1, 'Seleziona il tuo coach'),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: 'Devi accettare i Termini e Condizioni' }) }),
  privacyAccepted: z.literal(true, { errorMap: () => ({ message: 'Devi accettare l\'Informativa sulla Privacy' }) }),
  biometricConsent: z.literal(true, { errorMap: () => ({ message: 'Il consenso al trattamento dati biometrici è obbligatorio' }) }),
});

const coaches = [
  'Ilaria',
  'Ilaria / Marco',
  'Ilaria / Marco / Michela',
  'Ilaria / Michela',
  'Ilaria / Martina',
  'Martina / Michela',
  'Marco',
  'Michela',
  'Martina',
  'Cristina'
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+39');
  const [coachName, setCoachName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    biometric: false,
  });
  const [isProvisioning, setIsProvisioning] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const { saveConsents } = useConsents();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Funzione per auto-provisioning staff
  const handleStaffLogin = async (email: string, password: string): Promise<{ error: Error | null }> => {
    const normalizedEmail = email.toLowerCase();
    const staffInfo = STAFF_WHITELIST[normalizedEmail];
    
    // Se non è in whitelist o la password non è quella predefinita, procedi con login normale
    if (!staffInfo || password !== DEFAULT_STAFF_PASSWORD) {
      return signIn(email, password);
    }
    
    setIsProvisioning(true);
    
    // Prova prima il login normale
    const signInResult = await signIn(email, password);
    
    // Se il login fallisce per credenziali invalide, prova a creare l'utente
    if (signInResult.error?.message === 'Invalid login credentials') {
      // Tenta la registrazione automatica
      const { error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: DEFAULT_STAFF_PASSWORD,
        options: {
          data: {
            full_name: staffInfo.name,
            staff_role: staffInfo.role,
          }
        }
      });
      
      // Se la registrazione ha successo, il trigger handle_new_user assegnerà il ruolo corretto
      if (!signUpError) {
        // Dopo signUp con auto-confirm, riprova il login
        const retryResult = await signIn(email, password);
        setIsProvisioning(false);
        return retryResult;
      }
      
      // Se fallisce per "already registered", riprova login
      if (signUpError.message?.includes('already registered')) {
        const retryResult = await signIn(email, password);
        setIsProvisioning(false);
        return retryResult;
      }
      
      setIsProvisioning(false);
      return { error: signUpError };
    }
    
    setIsProvisioning(false);
    return signInResult;
  };

  // Reindirizzamento post-login - tutti atterrano su /diario
  useEffect(() => {
    if (user) {
      navigate('/diario');
    }
  }, [user, navigate]);

  const validateForm = () => {
    try {
      if (isCollaborator || isLogin) {
        loginSchema.parse({ email, password });
      } else {
        signupSchema.parse({ 
          email, 
          password, 
          fullName, 
          phoneNumber, 
          coachName,
          termsAccepted: consents.terms,
          privacyAccepted: consents.privacy,
          biometricConsent: consents.biometric,
        });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isCollaborator || isLogin) {
        // Usa la nuova funzione per gestire auto-provisioning staff
        const { error } = await handleStaffLogin(email.toLowerCase(), password);
        
        if (error) {
          const isStaffEmail = email.toLowerCase() in STAFF_WHITELIST;
          
          toast({
            variant: 'destructive',
            title: 'Errore di accesso',
            description: error.message === 'Invalid login credentials' 
              ? isStaffEmail 
                ? 'Errore durante la configurazione dell\'account. Riprova.'
                : 'Email o password non corretti' 
              : error.message,
          });
        }
      } else {
        const { error } = await signUp(email, password, fullName, phoneNumber, coachName);
        if (error) {
          toast({
            variant: 'destructive',
            title: 'Errore di registrazione',
            description: error.message.includes('already registered')
              ? 'Questa email è già registrata'
              : error.message,
          });
        } else {
          toast({
            title: 'Registrazione completata!',
            description: 'Benvenuto nel Diario 362gradi',
          });
        }
      }
    } finally {
      setIsLoading(false);
      setIsProvisioning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-primary">362</span>
            <span className="text-foreground">gradi</span>
          </h1>
          <p className="text-muted-foreground mt-2">Il Diario del tuo 2% Extra</p>
        </div>

        {/* Card */}
        <div className="card-elegant p-6 rounded-2xl">
          {/* User Type Switch */}
          <div className="flex items-center justify-center gap-3 mb-6 pb-4 border-b border-border">
            <span className={`text-sm font-medium transition-colors ${!isCollaborator ? 'text-foreground' : 'text-muted-foreground'}`}>
              Utente
            </span>
            <Switch
              checked={isCollaborator}
              onCheckedChange={setIsCollaborator}
            />
            <span className={`text-sm font-medium transition-colors ${isCollaborator ? 'text-primary' : 'text-muted-foreground'}`}>
              Collaboratore
            </span>
          </div>

          {/* Login/Register Toggle - only for Utente */}
          {!isCollaborator && (
            <div className="flex rounded-lg bg-muted p-1 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  isLogin ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Accedi
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  !isLogin ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Registrati
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isCollaborator && !isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Il tuo nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}

            {!isCollaborator && !isLogin && (
              <div className="space-y-2">
                <Label htmlFor="phone">Numero di Telefono</Label>
                <PhoneInput
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  error={errors.phoneNumber}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {/* Email sync notice - only for signup */}
              {!isCollaborator && !isLogin && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                  <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-foreground/80">
                    <strong>IMPORTANTE:</strong> Usa la stessa email che utilizzerai per i check tecnici (Google Form). 
                    Questo è necessario per sincronizzare i tuoi progressi.
                  </p>
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="la.tua@email.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            {!isCollaborator && !isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="coach">Il tuo Coach</Label>
                  <Select value={coachName} onValueChange={setCoachName}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleziona il tuo coach" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border z-50">
                      {coaches.map((coach) => (
                        <SelectItem key={coach} value={coach}>
                        {coach}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.coachName && (
                    <p className="text-xs text-destructive">{errors.coachName}</p>
                  )}
                </div>

                {/* GDPR Consent Checkboxes */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <Label className="text-sm font-medium">Consensi Obbligatori</Label>
                  <ConsentCheckboxes
                    consents={consents}
                    onChange={setConsents}
                    errors={{
                      terms: errors.termsAccepted,
                      privacy: errors.privacyAccepted,
                      biometric: errors.biometricConsent,
                    }}
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading 
                ? (isProvisioning ? 'Configurazione account...' : 'Caricamento...') 
                : (isCollaborator || isLogin) ? 'Accedi' : 'Registrati'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          "Non accontentarti di 360°. Trova il tuo 2% extra."
        </p>

        {/* Install App Link */}
        <Link 
          to="/install" 
          className="flex items-center justify-center gap-2 mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <Smartphone className="w-4 h-4" />
          <span>Installa l'app sul tuo telefono</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default Auth;
