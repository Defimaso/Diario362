import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type AuditAction = 
  | 'view_client_data'
  | 'view_client_photos'
  | 'view_client_checks'
  | 'view_client_progress'
  | 'export_client_data'
  | 'delete_client';

interface AuditLogParams {
  action: AuditAction;
  targetUserId?: string;
  targetTable?: string;
  details?: Record<string, any>;
}

export const useAuditLog = () => {
  const { user } = useAuth();

  const logAction = async ({
    action,
    targetUserId,
    targetTable,
    details,
  }: AuditLogParams) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('audit_logs').insert({
        actor_id: user.id,
        actor_email: user.email,
        action,
        target_user_id: targetUserId,
        target_table: targetTable,
        details,
        user_agent: navigator.userAgent,
      });

      if (error) {
        console.error('Failed to log audit action:', error);
      }
    } catch (err) {
      console.error('Audit log error:', err);
    }
  };

  return { logAction };
};
