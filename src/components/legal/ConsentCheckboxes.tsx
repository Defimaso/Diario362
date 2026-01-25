import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import LegalModal from './LegalModal';

interface ConsentCheckboxesProps {
  consents: {
    terms: boolean;
    privacy: boolean;
    biometric: boolean;
  };
  onChange: (consents: { terms: boolean; privacy: boolean; biometric: boolean }) => void;
  errors?: {
    terms?: string;
    privacy?: string;
    biometric?: string;
  };
}

const ConsentCheckboxes = ({ consents, onChange, errors }: ConsentCheckboxesProps) => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-start space-x-3">
        <Checkbox
          id="terms"
          checked={consents.terms}
          onCheckedChange={(checked) =>
            onChange({ ...consents, terms: checked as boolean })
          }
          className="mt-1"
        />
        <div className="space-y-1">
          <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
            Accetto i{' '}
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-primary underline hover:text-primary/80"
            >
              Termini e Condizioni
            </button>{' '}
            di 362gradi.ae
          </Label>
          {errors?.terms && (
            <p className="text-xs text-destructive">{errors.terms}</p>
          )}
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <Checkbox
          id="privacy"
          checked={consents.privacy}
          onCheckedChange={(checked) =>
            onChange({ ...consents, privacy: checked as boolean })
          }
          className="mt-1"
        />
        <div className="space-y-1">
          <Label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
            Ho letto e accetto l'{' '}
            <button
              type="button"
              onClick={() => setShowPrivacy(true)}
              className="text-primary underline hover:text-primary/80"
            >
              Informativa sulla Privacy
            </button>{' '}
            (GDPR compliant)
          </Label>
          {errors?.privacy && (
            <p className="text-xs text-destructive">{errors.privacy}</p>
          )}
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <Checkbox
          id="biometric"
          checked={consents.biometric}
          onCheckedChange={(checked) =>
            onChange({ ...consents, biometric: checked as boolean })
          }
          className="mt-1"
        />
        <div className="space-y-1">
          <Label htmlFor="biometric" className="text-sm leading-relaxed cursor-pointer">
            Presto il mio consenso esplicito al trattamento dei dati biometrici e 
            sensibili (foto e peso) per finalità di coaching
          </Label>
          {errors?.biometric && (
            <p className="text-xs text-destructive">{errors.biometric}</p>
          )}
        </div>
      </div>

      <LegalModal 
        open={showTerms} 
        onOpenChange={setShowTerms} 
        type="terms" 
      />
      <LegalModal 
        open={showPrivacy} 
        onOpenChange={setShowPrivacy} 
        type="privacy" 
      />
    </div>
  );
};

export default ConsentCheckboxes;
