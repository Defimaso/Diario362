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

// Decode JWT payload without verification (verification done by auth.getUser)
function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Admin client for THIS project (where the data lives)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorizzato' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const jwtPayload = decodeJwtPayload(token);

    if (!jwtPayload || !jwtPayload.sub) {
      return new Response(
        JSON.stringify({ error: 'Token non valido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine which Supabase project issued the token
    const tokenRef = jwtPayload.iss?.replace('https://','').split('.')[0] || '';
    const tokenUrl = tokenRef ? `https://${tokenRef}.supabase.co` : supabaseUrl;

    // Verify user against the ISSUING project's auth
    let callerId: string;

    // Try verifying against the token's project first, then fallback to this project
    for (const url of [tokenUrl, supabaseUrl]) {
      try {
        const anonKey = url === supabaseUrl ? Deno.env.get('SUPABASE_ANON_KEY')! : token;
        const userClient = createClient(url, anonKey, {
          global: { headers: { Authorization: authHeader } }
        });
        const { data: { user }, error } = await userClient.auth.getUser();
        if (user && !error) {
          callerId = user.id;
          break;
        }
      } catch { /* try next */ }
    }

    if (!callerId!) {
      return new Response(
        JSON.stringify({ error: 'Non autorizzato - token non verificato' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check caller is admin/collaborator/super_admin using THIS project's data
    const { data: callerRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId);

    const { data: isSuperAdmin } = await supabaseAdmin
      .rpc('is_super_admin', { _user_id: callerId });

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

    // Update profiles.is_premium using service role
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_premium: !!grantPremium,
        premium_activated_at: grantPremium ? new Date().toISOString() : null,
        premium_activated_by: grantPremium ? callerId : null,
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
      JSON.stringify({ error: 'Errore interno del server: ' + (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
