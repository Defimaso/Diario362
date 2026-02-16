import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { action } = body;

    // ACTION: migrate — add premium columns to profiles (idempotent, safe to call multiple times)
    if (action === 'migrate') {
      const dbUrl = Deno.env.get('SUPABASE_DB_URL');
      if (!dbUrl) {
        return new Response(
          JSON.stringify({ error: 'DB URL not available' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { default: postgres } = await import("https://deno.land/x/postgresjs@v3.4.5/mod.js");
      const sql = postgres(dbUrl, { ssl: 'require' });

      await sql`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free'`;
      await sql`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activation_code TEXT`;
      await sql`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ`;
      await sql`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ`;
      await sql`UPDATE public.profiles SET plan = 'premium' WHERE plan IS NULL OR plan = 'free'`;
      await sql`NOTIFY pgrst, 'reload schema'`;
      await sql.end();

      return new Response(
        JSON.stringify({ success: true, message: 'Migration completed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // All other actions require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorizzato' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non autorizzato' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if caller is staff
    const { data: callerRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isStaff = callerRoles?.some((r: any) =>
      r.role === 'admin' || r.role === 'collaborator'
    );

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

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ activation_code: code } as any)
        .eq('id', clientId);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
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

      const { data: profile, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('activation_code')
        .eq('id', user.id)
        .single();

      if (fetchError || !profile) {
        return new Response(
          JSON.stringify({ error: 'Profilo non trovato' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if ((profile as any).activation_code !== trimmedCode) {
        return new Response(
          JSON.stringify({ error: 'Codice non valido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          plan: 'premium',
          activated_at: new Date().toISOString(),
        } as any)
        .eq('id', user.id);

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
