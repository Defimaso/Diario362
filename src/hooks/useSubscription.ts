import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Subscription {
  plan: 'free' | 'premium';
  activated_at: string | null;
  activation_code: string | null;
  trial_ends_at: string | null;
}

// Track whether migration has been attempted this session
let migrationAttempted = false;

async function ensureMigration() {
  if (migrationAttempted) return;
  migrationAttempted = true;
  try {
    await supabase.functions.invoke('toggle-premium', {
      body: { action: 'migrate' },
    });
    console.log('Premium migration completed');
  } catch (e) {
    console.warn('Premium migration skipped:', e);
  }
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
      // Trigger migration to add premium columns (runs once per session)
      await ensureMigration();

      // Use select('*') so it never fails even if premium columns don't exist yet
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        console.warn('useSubscription fetch error:', error?.message);
        setSubscription({ plan: 'free', activated_at: null, activation_code: null, trial_ends_at: null });
      } else {
        // Premium columns may or may not exist — gracefully default
        const d = data as any;
        setSubscription({
          plan: d.plan || 'free',
          activated_at: d.activated_at || null,
          activation_code: d.activation_code || null,
          trial_ends_at: d.trial_ends_at || null,
        });
      }
      setIsLoading(false);
    };

    fetchSubscription();
  }, [user, isStaff]);

  const activateCode = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Non autenticato' };

    // Use edge function for activation (bypasses schema cache issues)
    const { data, error } = await supabase.functions.invoke('toggle-premium', {
      body: { action: 'activate-code', code: code.trim().toUpperCase() },
    });

    if (error) {
      console.error('activate-code edge function error:', error);
      return { success: false, error: 'Errore durante l\'attivazione. Riprova.' };
    }

    const result = data as any;
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
