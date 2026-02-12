// Edge Function: check-absences
// Da schedulare via cron (pg_cron o cron esterno) ogni giorno alle 10:00
// Controlla i clienti assenti e inserisce notifiche

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Get absent clients
    const { data: absentClients, error } = await supabase.rpc('check_absent_clients')

    if (error) {
      console.error('Error fetching absent clients:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const today = new Date().toISOString().split('T')[0]
    const results = { day2: 0, day5: 0, coach_alerts: 0 }

    for (const client of absentClients || []) {
      // Day 2 notification
      if (client.days_absent >= 2 && client.days_absent < 5) {
        const { error: notifError } = await supabase
          .from('absence_notifications')
          .insert({
            user_id: client.user_id,
            notification_type: 'day2',
          })

        if (!notifError) {
          results.day2++
          console.log(`Day 2 notification for ${client.full_name}`)
        }
      }

      // Day 5 notification + coach alert
      if (client.days_absent >= 5) {
        const { error: notifError } = await supabase
          .from('absence_notifications')
          .insert({
            user_id: client.user_id,
            notification_type: 'day5',
          })

        if (!notifError) {
          results.day5++
          console.log(`Day 5 notification for ${client.full_name}`)
        }

        // Also insert coach_alert
        const { error: coachError } = await supabase
          .from('absence_notifications')
          .insert({
            user_id: client.user_id,
            notification_type: 'coach_alert',
          })

        if (!coachError) {
          results.coach_alerts++
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      total_absent: absentClients?.length || 0,
      ...results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
