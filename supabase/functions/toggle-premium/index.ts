import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const getCorsHeaders = (origin: string | null) => {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller identity
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorizzato' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user: caller }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !caller) {
      return new Response(
        JSON.stringify({ error: 'Non autorizzato' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check caller is admin, collaborator, or super_admin
    const { data: callerRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id);

    const { data: isSuperAdmin } = await supabaseAdmin
      .rpc('is_super_admin', { _user_id: caller.id });

    const isStaff = isSuperAdmin ||
      callerRoles?.some((r: any) => r.role === 'admin' || r.role === 'collaborator');

    if (!isStaff) {
      return new Response(
        JSON.stringify({ error: 'Non autorizzato: solo admin e collaboratori' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId, grantPremium } = await req.json();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'ID utente mancante' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update profiles.is_premium using service role (bypasses RLS and schema cache)
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_premium: !!grantPremium,
        premium_activated_at: grantPremium ? new Date().toISOString() : null,
        premium_activated_by: grantPremium ? caller.id : null,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error toggling premium:', updateError);
      return new Response(
        JSON.stringify({ error: 'Errore aggiornamento: ' + updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, premium: !!grantPremium }),
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
