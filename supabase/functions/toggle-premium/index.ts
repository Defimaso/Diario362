import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Production project credentials (where users authenticate)
const PROD_URL = "https://ezjtheshclmruzlgwyfa.supabase.co";
const PROD_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6anRoZXNoY2xtcnV6bGd3eWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTE0NDgsImV4cCI6MjA4MzE4NzQ0OH0.dakb7Pe8JnGS-Rj0Z80TQMT62HprSraxE8jnJYzVris";

const getCorsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
});

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // This project's admin client (ppbbqchycxffsfavtsjp) — for premium_clients table
    const localUrl = Deno.env.get('SUPABASE_URL')!;
    const localServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const localAdmin = createClient(localUrl, localServiceKey);

    const body = await req.json();
    const { action } = body;

    // ACTION: check-status — check if a user is premium (no auth needed)
    if (action === 'check-status') {
      const { userId } = body;
      if (!userId) {
        return new Response(
          JSON.stringify({ plan: 'free' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data } = await localAdmin
        .from('premium_clients')
        .select('plan, activation_code, activated_at')
        .eq('user_id', userId)
        .single();

      return new Response(
        JSON.stringify({
          plan: data?.plan || 'free',
          activation_code: data?.activation_code || null,
          activated_at: data?.activated_at || null,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // All other actions require authentication against PRODUCTION project
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorizzato' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user against production project
    const token = authHeader.replace('Bearer ', '');
    const prodClient = createClient(PROD_URL, PROD_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: authError } = await prodClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non autorizzato' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if caller is staff on the PRODUCTION project
    const { data: callerRoles } = await prodClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isStaff = callerRoles?.some((r: any) =>
      r.role === 'admin' || r.role === 'collaborator'
    );

    // ACTION: set-premium — staff directly toggles a client's premium status (no code needed)
    if (action === 'set-premium' && isStaff) {
      const { clientId, premium } = body;
      if (!clientId) {
        return new Response(
          JSON.stringify({ error: 'clientId mancante' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const newPlan = premium ? 'premium' : 'free';
      const { error: upsertError } = await localAdmin
        .from('premium_clients')
        .upsert({
          user_id: clientId,
          plan: newPlan,
          activated_at: premium ? new Date().toISOString() : null,
          activation_code: null,
        }, { onConflict: 'user_id' });

      if (upsertError) {
        return new Response(
          JSON.stringify({ error: upsertError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, plan: newPlan }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: generate-code — coach generates a premium code for a client
    if (action === 'generate-code' && isStaff) {
      const { clientId } = body;
      if (!clientId) {
        return new Response(
          JSON.stringify({ error: 'clientId mancante' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '362-';
      for (let j = 0; j < 5; j++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }

      // Upsert into premium_clients on THIS project
      const { error: upsertError } = await localAdmin
        .from('premium_clients')
        .upsert({
          user_id: clientId,
          activation_code: code,
          plan: 'free',
        }, { onConflict: 'user_id' });

      if (upsertError) {
        return new Response(
          JSON.stringify({ error: upsertError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, code }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: activate-code — client activates a premium code
    if (action === 'activate-code') {
      const { code } = body;
      if (!code) {
        return new Response(
          JSON.stringify({ error: 'Codice mancante' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const trimmedCode = code.trim().toUpperCase();

      // Fetch the user's premium record from THIS project
      const { data: record, error: fetchError } = await localAdmin
        .from('premium_clients')
        .select('activation_code')
        .eq('user_id', user.id)
        .single();

      if (fetchError || !record) {
        return new Response(
          JSON.stringify({ error: 'Nessun codice assegnato. Chiedi al tuo coach.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (record.activation_code !== trimmedCode) {
        return new Response(
          JSON.stringify({ error: 'Codice non valido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Code matches — activate premium
      const { error: updateError } = await localAdmin
        .from('premium_clients')
        .update({
          plan: 'premium',
          activated_at: new Date().toISOString(),
          activation_code: null, // clear code after use
        })
        .eq('user_id', user.id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Azione non valida o non autorizzata' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
    );
  }
});
