import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Subscription {
  plan: 'free' | 'premium';
  activated_at: string | null;
  activation_code: string | null;
  trial_ends_at: string | null;
}

// Premium API lives on the secondary Supabase project (ppbbqchycxffsfavtsjp)
// because we can't deploy edge functions on the Lovable-managed production project
const PREMIUM_API_URL = 'https://ppbbqchycxffsfavtsjp.supabase.co/functions/v1/toggle-premium';

async function callPremiumApi(action: string, body: Record<string, unknown> = {}, authToken?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  const res = await fetch(PREMIUM_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, ...body }),
  });
  return res.json();
}

export function useSubscription() {
  const { user, isAdmin, isCollaborator, isSuperAdmin } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Admin/collaborator/superAdmin are always premium
  const isStaff = isAdmin || isCollaborator || isSuperAdmin;

  // Trial logic
  const isTrialActive = useCallback(() => {
    if (!subscription?.trial_ends_at) return false;
    if (subscription.plan === 'premium') return false;
    return new Date(subscription.trial_ends_at) > new Date();
  }, [subscription]);

  const trialDaysLeft = useCallback(() => {
    if (!subscription?.trial_ends_at) return 0;
    if (subscription.plan === 'premium') return 0;
    const diff = new Date(subscription.trial_ends_at).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [subscription]);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    if (isStaff) {
      setSubscription({ plan: 'premium', activated_at: null, activation_code: 'STAFF', trial_ends_at: null });
      setIsLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const data = await callPremiumApi('check-status', { userId: user.id });
        setSubscription({
          plan: data?.plan || 'free',
          activated_at: data?.activated_at || null,
          activation_code: data?.activation_code || null,
          trial_ends_at: null,
        });
      } catch (e) {
        console.warn('useSubscription fetch error:', e);
        setSubscription({ plan: 'free', activated_at: null, activation_code: null, trial_ends_at: null });
      }
      setIsLoading(false);
    };

    fetchSubscription();
  }, [user, isStaff]);

  const activateCode = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Non autenticato' };

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) return { success: false, error: 'Sessione scaduta. Riprova il login.' };

      const result = await callPremiumApi('activate-code', { code: code.trim().toUpperCase() }, token);

      if (result?.error) {
        return { success: false, error: result.error };
      }

      // Update local state
      setSubscription({
        plan: 'premium',
        activated_at: new Date().toISOString(),
        activation_code: code.trim().toUpperCase(),
        trial_ends_at: null,
      });

      return { success: true };
    } catch (e) {
      console.error('activate-code error:', e);
      return { success: false, error: 'Errore durante l\'attivazione. Riprova.' };
    }
  }, [user]);

  const isTrial = isTrialActive();

  return {
    isPremium: isStaff || subscription?.plan === 'premium' || isTrial,
    isTrial,
    trialDaysLeft: trialDaysLeft(),
    plan: isStaff ? 'premium' as const : (subscription?.plan || 'free' as const),
    isLoading,
    subscription,
    activateCode,
  };
}
