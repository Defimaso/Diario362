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

    // 1. Check if code exists and is unused
    const { data: codeData, error: codeError } = await supabase
      .from('activation_codes' as any)
      .select('id, is_used, assigned_to')
      .eq('code', trimmedCode)
      .eq('is_used', false)
      .single();

    if (codeError || !codeData) {
      return { success: false, error: 'Codice non valido o gia\' utilizzato' };
    }

    // 1.1 Check if code is assigned to a specific user
    const assignedTo = (codeData as any).assigned_to;
    if (assignedTo && assignedTo !== user.id) {
      return { success: false, error: 'Questo codice non e\' assegnato a te' };
    }

    // 2. Mark code as used
    await supabase
      .from('activation_codes' as any)
      .update({
        is_used: true,
        used_by: user.id,
        used_at: new Date().toISOString(),
      } as any)
      .eq('id', (codeData as any).id);

    // 3. Update subscription to premium
    const { error: subError } = await supabase
      .from('user_subscriptions' as any)
      .upsert({
        user_id: user.id,
        plan: 'premium',
        activated_at: new Date().toISOString(),
        activation_code: trimmedCode,
        trial_ends_at: null,
      } as any, { onConflict: 'user_id' });

    if (subError) {
      return { success: false, error: 'Errore durante l\'attivazione. Riprova.' };
    }

    // 4. Update local state
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
