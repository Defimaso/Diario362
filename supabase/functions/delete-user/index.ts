import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Security: Restrict CORS to specific origins only
const allowedOrigins = [
  'https://diario.362gradi.ae',
  'https://362gradi.ae',
  'http://localhost:5173', // Development
  'http://localhost:8081', // Development
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the authorization header to verify the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Non autorizzato' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a client with the user's token to verify identity
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the current user
    const { data: { user: caller }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !caller) {
      console.error('Failed to get caller:', userError);
      return new Response(
        JSON.stringify({ error: 'Non autorizzato' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Delete user request from:', caller.email);

    // Get the user to delete from request body
    const { userId } = await req.json();
    if (!userId) {
      console.error('No userId provided');
      return new Response(
        JSON.stringify({ error: 'ID utente mancante' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if caller is deleting their own account OR is super admin
    const isSelfDelete = caller.id === userId;
    
    const { data: isSuperAdmin } = await supabaseAdmin
      .rpc('is_super_admin', { _user_id: caller.id });

    if (!isSelfDelete && !isSuperAdmin) {
      console.error('Unauthorized delete attempt by:', caller.email);
      return new Response(
        JSON.stringify({ error: 'Non autorizzato a eliminare questo account' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Attempting to delete user:', userId, isSelfDelete ? '(self-delete)' : '(admin-delete)');

    // Prevent deleting super admin
    const { data: targetIsSuperAdmin } = await supabaseAdmin
      .rpc('is_super_admin', { _user_id: userId });

    if (targetIsSuperAdmin && !isSelfDelete) {
      console.error('Cannot delete super admin');
      return new Response(
        JSON.stringify({ error: 'Non puoi eliminare il super admin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete all user data (GDPR Right to Erasure)
    
    // 1. Delete photos from storage
    try {
      const { data: files } = await supabaseAdmin.storage
        .from('progress-photos')
        .list(userId);
      
      if (files && files.length > 0) {
        const filePaths = files.map(f => `${userId}/${f.name}`);
        await supabaseAdmin.storage.from('progress-photos').remove(filePaths);
        console.log('Deleted storage files:', filePaths.length);
      }
    } catch (storageError) {
      console.error('Error deleting storage files:', storageError);
    }

    // 2. Delete user_consents (GDPR)
    const { error: consentsError } = await supabaseAdmin
      .from('user_consents')
      .delete()
      .eq('user_id', userId);
    
    if (consentsError) {
      console.error('Error deleting user_consents:', consentsError);
    }

    // 3. Delete audit_logs related to user
    const { error: auditError } = await supabaseAdmin
      .from('audit_logs')
      .delete()
      .or(`actor_id.eq.${userId},target_user_id.eq.${userId}`);
    
    if (auditError) {
      console.error('Error deleting audit_logs:', auditError);
    }

    // 4. Delete progress_checks
    const { error: progressError } = await supabaseAdmin
      .from('progress_checks')
      .delete()
      .eq('user_id', userId);
    
    if (progressError) {
      console.error('Error deleting progress_checks:', progressError);
    }

    // 5. Delete user_checks
    const { error: userChecksError } = await supabaseAdmin
      .from('user_checks')
      .delete()
      .eq('user_id', userId);
    
    if (userChecksError) {
      console.error('Error deleting user_checks:', userChecksError);
    }

    // 6. Delete monthly_checks
    const { error: monthlyError } = await supabaseAdmin
      .from('monthly_checks')
      .delete()
      .eq('user_id', userId);
    
    if (monthlyError) {
      console.error('Error deleting monthly_checks:', monthlyError);
    }

    // 7. Delete push_subscriptions
    const { error: pushError } = await supabaseAdmin
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);
    
    if (pushError) {
      console.error('Error deleting push_subscriptions:', pushError);
    }

    // 8. Delete coach_notes where client_id or author_id matches
    const { error: notesError } = await supabaseAdmin
      .from('coach_notes')
      .delete()
      .or(`client_id.eq.${userId},author_id.eq.${userId}`);
    
    if (notesError) {
      console.error('Error deleting coach_notes:', notesError);
    }

    // 9. Delete daily_checkins
    const { error: checkinsError } = await supabaseAdmin
      .from('daily_checkins')
      .delete()
      .eq('user_id', userId);
    
    if (checkinsError) {
      console.error('Error deleting daily_checkins:', checkinsError);
    }

    // 10. Delete coach_assignments
    const { error: assignmentsError } = await supabaseAdmin
      .from('coach_assignments')
      .delete()
      .eq('client_id', userId);
    
    if (assignmentsError) {
      console.error('Error deleting coach_assignments:', assignmentsError);
    }

    // 11. Delete user_roles
    const { error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    
    if (rolesError) {
      console.error('Error deleting user_roles:', rolesError);
    }

    // 12. Delete profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error deleting profile:', profileError);
    }

    // 13. Delete from auth.users using admin API
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.error('Error deleting auth user:', authError);
      return new Response(
        JSON.stringify({ error: 'Errore durante l\'eliminazione dell\'utente: ' + authError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully deleted user and all data:', userId);

    return new Response(
      JSON.stringify({ success: true, message: 'Account e tutti i dati eliminati con successo' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Errore interno del server' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});