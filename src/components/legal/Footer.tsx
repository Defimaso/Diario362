import { useState } from 'react';
import { Shield, Mail } from 'lucide-react';
import LegalModal from './LegalModal';

const Footer = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <footer className="border-t border-border bg-card/50 mt-8">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Logo */}
        <div className="text-center mb-4">
          <span className="text-lg font-bold">
            <span className="text-primary">Diario</span>
            <span className="text-foreground">362</span>
          </span>
        </div>

        {/* Legal Links */}
        <div className="flex justify-center gap-4 text-sm mb-4">
          <button
            onClick={() => setShowTerms(true)}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Termini e Condizioni
          </button>
          <span className="text-muted-foreground/50">|</span>
          <button
            onClick={() => setShowPrivacy(true)}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Privacy Policy
          </button>
        </div>

        {/* Company Info */}
        <div className="text-center space-y-2 text-xs text-muted-foreground">
          <p>© 2026 MerryProject Global - Dubai</p>
          <p className="text-primary/80">Ecosystem: 362gradi.ae</p>
          
          <div className="flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Responsabile Trattamento Dati: 362gradi.ae</span>
          </div>
          
          <div className="flex items-center justify-center gap-1">
            <Mail className="w-3 h-3" />
            <span>
              Email DPO:{' '}
              <a 
                href="mailto:dpo@362gradi.ae" 
                className="text-primary hover:underline"
              >
                dpo@362gradi.ae
              </a>
            </span>
          </div>
        </div>
      </div>

      <LegalModal open={showTerms} onOpenChange={setShowTerms} type="terms" />
      <LegalModal open={showPrivacy} onOpenChange={setShowPrivacy} type="privacy" />
    </footer>
  );
};

export default Footer;
