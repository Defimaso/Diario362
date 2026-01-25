import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Consents {
  terms: boolean;
  privacy: boolean;
  biometric: boolean;
}

export const useConsents = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveConsents = async (userId: string, consents: Consents) => {
    setIsSubmitting(true);
    const now = new Date().toISOString();

    try {
      const { error } = await supabase.from('user_consents').upsert({
        user_id: userId,
        terms_accepted: consents.terms,
        privacy_accepted: consents.privacy,
        biometric_consent: consents.biometric,
        terms_accepted_at: consents.terms ? now : null,
        privacy_accepted_at: consents.privacy ? now : null,
        biometric_consent_at: consents.biometric ? now : null,
        user_agent: navigator.userAgent,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error saving consents:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConsents = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching consents:', error);
      return null;
    }
  };

  return { saveConsents, getConsents, isSubmitting };
};
