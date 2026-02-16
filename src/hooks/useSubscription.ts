import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Subscription {
  plan: 'free' | 'premium';
  activated_at: string | null;
  activation_code: string | null;
  trial_ends_at: string | null;
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
      const { data, error } = await supabase
        .from('user_subscriptions' as any)
        .select('plan, activated_at, activation_code, trial_ends_at')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        setSubscription({ plan: 'free', activated_at: null, activation_code: null, trial_ends_at: null });
      } else {
        setSubscription({
          plan: (data as any).plan || 'free',
          activated_at: (data as any).activated_at,
          activation_code: (data as any).activation_code,
          trial_ends_at: (data as any).trial_ends_at || null,
        });
      }
      setIsLoading(false);
    };

    fetchSubscription();
  }, [user, isStaff]);

  const activateCode = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Non autenticato' };

    const trimmedCode = code.trim().toUpperCase();

    // 1. Fetch own subscription to verify the code
    const { data: sub, error: fetchError } = await supabase
      .from('user_subscriptions' as any)
      .select('activation_code')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !sub) {
      return { success: false, error: 'Nessun codice assegnato. Chiedi al tuo coach.' };
    }

    if ((sub as any).activation_code !== trimmedCode) {
      return { success: false, error: 'Codice non valido' };
    }

    // 2. Code matches — activate premium
    const { error: updateError } = await supabase
      .from('user_subscriptions' as any)
      .update({
        plan: 'premium',
        activated_at: new Date().toISOString(),
      } as any)
      .eq('user_id', user.id);

    if (updateError) {
      return { success: false, error: 'Errore durante l\'attivazione. Riprova.' };
    }

    // 3. Update local state
    setSubscription({
      plan: 'premium',
      activated_at: new Date().toISOString(),
      activation_code: trimmedCode,
      trial_ends_at: null,
    });

    return { success: true };
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
