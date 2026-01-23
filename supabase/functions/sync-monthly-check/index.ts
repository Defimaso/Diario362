import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify API key
    const apiKey = req.headers.get("x-api-key");
    const expectedKey = Deno.env.get("MAKE_WEBHOOK_KEY");
    
    if (!expectedKey) {
      console.error("MAKE_WEBHOOK_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (apiKey !== expectedKey) {
      console.error("Invalid API key provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { email, current_weight, photo_front_url, photo_side_url, photo_back_url, check_date } = body;

    // Validate required fields
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine the date to use (default to today)
    const targetDate = check_date || new Date().toISOString().split("T")[0];

    // Check if a record already exists for this email and date
    const { data: existingRecord, error: selectError } = await supabase
      .from("monthly_checks")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .eq("check_date", targetDate)
      .maybeSingle();

    if (selectError) {
      console.error("Error checking existing record:", selectError);
      return new Response(
        JSON.stringify({ error: "Database query error", details: selectError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare data object
    const recordData: Record<string, unknown> = {
      email: email.toLowerCase().trim(),
      check_date: targetDate,
    };

    // Only include fields that have values
    if (current_weight !== undefined && current_weight !== null && current_weight !== "") {
      recordData.current_weight = parseFloat(current_weight);
    }
    if (photo_front_url) recordData.photo_front_url = photo_front_url;
    if (photo_side_url) recordData.photo_side_url = photo_side_url;
    if (photo_back_url) recordData.photo_back_url = photo_back_url;

    let result;

    if (existingRecord) {
      // UPDATE existing record
      const { data, error } = await supabase
        .from("monthly_checks")
        .update(recordData)
        .eq("id", existingRecord.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating record:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update record", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      result = { action: "updated", record: data };
    } else {
      // INSERT new record
      const { data, error } = await supabase
        .from("monthly_checks")
        .insert(recordData)
        .select()
        .single();

      if (error) {
        console.error("Error inserting record:", error);
        return new Response(
          JSON.stringify({ error: "Failed to insert record", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      result = { action: "inserted", record: data };
    }

    console.log(`Successfully ${result.action} monthly check for ${email}`);
    
    return new Response(
      JSON.stringify({ success: true, ...result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
