import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Subscription {
  plan: 'free' | 'premium';
  activated_at: string | null;
  activation_code: string | null;
}

export function useSubscription() {
  const { user, isAdmin, isCollaborator, isSuperAdmin } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Admin/collaborator/superAdmin are always premium
  const isStaff = isAdmin || isCollaborator || isSuperAdmin;

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    if (isStaff) {
      setSubscription({ plan: 'premium', activated_at: null, activation_code: 'STAFF' });
      setIsLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      const { data, error } = await supabase
        .from('user_subscriptions' as any)
        .select('plan, activated_at, activation_code')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        // No subscription found -> treat as free
        setSubscription({ plan: 'free', activated_at: null, activation_code: null });
      } else {
        setSubscription({
          plan: (data as any).plan || 'free',
          activated_at: (data as any).activated_at,
          activation_code: (data as any).activation_code,
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
      .select('id, is_used')
      .eq('code', trimmedCode)
      .eq('is_used', false)
      .single();

    if (codeError || !codeData) {
      return { success: false, error: 'Codice non valido o gia\' utilizzato' };
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
      } as any, { onConflict: 'user_id' });

    if (subError) {
      return { success: false, error: 'Errore durante l\'attivazione. Riprova.' };
    }

    // 4. Update local state
    setSubscription({
      plan: 'premium',
      activated_at: new Date().toISOString(),
      activation_code: trimmedCode,
    });

    return { success: true };
  }, [user]);

  return {
    isPremium: isStaff || subscription?.plan === 'premium',
    plan: isStaff ? 'premium' as const : (subscription?.plan || 'free' as const),
    isLoading,
    subscription,
    activateCode,
  };
}
