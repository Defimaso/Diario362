import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    // Create a client with the user's token to verify they are super admin
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

    // Verify caller is super admin (info@362gradi.it)
    const { data: isSuperAdmin } = await supabaseAdmin
      .rpc('is_super_admin', { _user_id: caller.id });

    if (!isSuperAdmin) {
      console.error('Caller is not super admin:', caller.email);
      return new Response(
        JSON.stringify({ error: 'Solo il super admin può eliminare utenti' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user to delete from request body
    const { userId } = await req.json();
    if (!userId) {
      console.error('No userId provided');
      return new Response(
        JSON.stringify({ error: 'ID utente mancante' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Attempting to delete user:', userId);

    // Prevent deleting super admin
    const { data: targetIsSuperAdmin } = await supabaseAdmin
      .rpc('is_super_admin', { _user_id: userId });

    if (targetIsSuperAdmin) {
      console.error('Cannot delete super admin');
      return new Response(
        JSON.stringify({ error: 'Non puoi eliminare il super admin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete related data first (due to foreign key constraints)
    // 1. Delete coach_notes where client_id or author_id matches
    const { error: notesError } = await supabaseAdmin
      .from('coach_notes')
      .delete()
      .or(`client_id.eq.${userId},author_id.eq.${userId}`);
    
    if (notesError) {
      console.error('Error deleting coach_notes:', notesError);
    }

    // 2. Delete daily_checkins
    const { error: checkinsError } = await supabaseAdmin
      .from('daily_checkins')
      .delete()
      .eq('user_id', userId);
    
    if (checkinsError) {
      console.error('Error deleting daily_checkins:', checkinsError);
    }

    // 3. Delete coach_assignments
    const { error: assignmentsError } = await supabaseAdmin
      .from('coach_assignments')
      .delete()
      .eq('client_id', userId);
    
    if (assignmentsError) {
      console.error('Error deleting coach_assignments:', assignmentsError);
    }

    // 4. Delete user_roles
    const { error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    
    if (rolesError) {
      console.error('Error deleting user_roles:', rolesError);
    }

    // 5. Delete profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error deleting profile:', profileError);
    }

    // 6. Delete from auth.users using admin API
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.error('Error deleting auth user:', authError);
      return new Response(
        JSON.stringify({ error: 'Errore durante l\'eliminazione dell\'utente: ' + authError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully deleted user:', userId);

    return new Response(
      JSON.stringify({ success: true, message: 'Utente eliminato con successo' }),
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
