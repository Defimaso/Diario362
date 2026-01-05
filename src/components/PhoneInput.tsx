import { useState } from 'react';
import { Phone, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string;
}

const countryCodes = [
  { code: '+39', country: 'IT', flag: '🇮🇹' },
  { code: '+971', country: 'AE', flag: '🇦🇪' },
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'GB', flag: '🇬🇧' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+34', country: 'ES', flag: '🇪🇸' },
  { code: '+41', country: 'CH', flag: '🇨🇭' },
  { code: '+31', country: 'NL', flag: '🇳🇱' },
  { code: '+32', country: 'BE', flag: '🇧🇪' },
  { code: '+43', country: 'AT', flag: '🇦🇹' },
  { code: '+351', country: 'PT', flag: '🇵🇹' },
  { code: '+48', country: 'PL', flag: '🇵🇱' },
  { code: '+46', country: 'SE', flag: '🇸🇪' },
  { code: '+47', country: 'NO', flag: '🇳🇴' },
  { code: '+45', country: 'DK', flag: '🇩🇰' },
  { code: '+358', country: 'FI', flag: '🇫🇮' },
  { code: '+30', country: 'GR', flag: '🇬🇷' },
  { code: '+353', country: 'IE', flag: '🇮🇪' },
  { code: '+7', country: 'RU', flag: '🇷🇺' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+82', country: 'KR', flag: '🇰🇷' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+55', country: 'BR', flag: '🇧🇷' },
  { code: '+52', country: 'MX', flag: '🇲🇽' },
  { code: '+54', country: 'AR', flag: '🇦🇷' },
];

const PhoneInput = ({ value, onChange, className, error }: PhoneInputProps) => {
  // Parse the current value to extract country code and number
  const parsePhoneValue = (val: string) => {
    if (!val) return { countryCode: '+39', number: '' };
    
    // Find matching country code
    const matchingCode = countryCodes.find(c => val.startsWith(c.code));
    if (matchingCode) {
      return {
        countryCode: matchingCode.code,
        number: val.slice(matchingCode.code.length)
      };
    }
    
    return { countryCode: '+39', number: val };
  };

  const { countryCode: initialCode, number: initialNumber } = parsePhoneValue(value);
  const [selectedCode, setSelectedCode] = useState(initialCode);
  const [phoneNumber, setPhoneNumber] = useState(initialNumber);

  const handleCodeChange = (code: string) => {
    setSelectedCode(code);
    onChange(`${code}${phoneNumber}`);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const cleaned = e.target.value.replace(/\D/g, '');
    setPhoneNumber(cleaned);
    onChange(`${selectedCode}${cleaned}`);
  };

  const selectedCountry = countryCodes.find(c => c.code === selectedCode);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <Select value={selectedCode} onValueChange={handleCodeChange}>
          <SelectTrigger className="w-[100px] shrink-0">
            <SelectValue>
              <span className="flex items-center gap-1">
                <span>{selectedCountry?.flag}</span>
                <span className="text-xs">{selectedCode}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-card border-border z-50 max-h-[300px]">
            {countryCodes.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.country}</span>
                  <span className="text-muted-foreground">{country.code}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="tel"
            placeholder="333 123 4567"
            value={phoneNumber}
            onChange={handleNumberChange}
            className="pl-10"
          />
        </div>
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};

export default PhoneInput;
