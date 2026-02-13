import { useState } from 'react';
import { Lock, Crown, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const benefits = [
  'Un coach dedicato: trainer e nutrizionista',
  'Allenamento personalizzato',
  'Piano alimentare su misura',
  'Assistenza continua e correzioni video',
  'Tracking progressi con foto e peso',
  'Statistiche avanzate e grafici settimanali',
];

export function PremiumGate() {
  const [code, setCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const { activateCode } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleActivate = async () => {
    if (!code.trim()) return;
    setIsActivating(true);

    const { success, error } = await activateCode(code);

    setIsActivating(false);

    if (success) {
      toast({
        title: 'Premium attivato!',
        description: 'Ora hai accesso a tutte le funzionalita\'',
      });
      navigate('/diario');
    } else {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: error || 'Codice non valido',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Icon + Title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <Crown className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Funzionalita' Premium</h2>
        <p className="text-muted-foreground">
          Sblocca tutte le funzionalita' del percorso 362gradi
        </p>
      </motion.div>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-elegant p-5 rounded-2xl"
      >
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Cosa include Premium
        </h3>
        <ul className="space-y-3">
          {benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* CTA: Buy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 coral-glow"
          size="lg"
          onClick={() => window.open('https://sso.teachable.com/secure/564301/identity/login/otp', '_blank')}
        >
          <Crown className="w-4 h-4 mr-2" />
          Acquista il Percorso
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Verrai reindirizzato alla piattaforma Teachable
        </p>
      </motion.div>

      {/* Activation Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-elegant p-5 rounded-2xl"
      >
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          Hai gia' un codice di attivazione?
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Se sei gia' iscritto al percorso 362gradi, il tuo coach ti fornira' un codice per sbloccare tutte le funzionalita' dell'app.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Es. 362-ABCDE"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
          />
          <Button
            onClick={handleActivate}
            disabled={isActivating || !code.trim()}
          >
            {isActivating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Attiva'
            )}
          </Button>
        </div>
      </motion.div>

      {/* Back */}
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/diario')}
          className="text-muted-foreground"
        >
          Torna al Diario
        </Button>
      </div>
    </div>
  );
}
