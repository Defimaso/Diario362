import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!

    // Configure web-push
    webpush.setVapidDetails(
      'mailto:info@362gradi.it',
      vapidPublicKey,
      vapidPrivateKey
    )

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting daily reminder job...')

    // Get today's date
    const today = new Date().toISOString().split('T')[0]

    // Get all users with push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      throw subError
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No subscriptions found')
      return new Response(
        JSON.stringify({ success: true, reminded: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get unique user IDs
    const userIds = [...new Set(subscriptions.map(s => s.user_id))]
    console.log(`Found ${userIds.length} users with subscriptions`)

    // Get today's check-ins
    const { data: checkins, error: checkinError } = await supabase
      .from('daily_checkins')
      .select('user_id')
      .eq('date', today)

    if (checkinError) {
      console.error('Error fetching checkins:', checkinError)
      throw checkinError
    }

    const usersWithCheckin = new Set(checkins?.map(c => c.user_id) || [])
    
    // Filter users who haven't checked in today
    const usersToRemind = userIds.filter(userId => !usersWithCheckin.has(userId))
    console.log(`${usersToRemind.length} users need reminders`)

    const payload = JSON.stringify({
      title: '📝 Check-in Giornaliero',
      body: 'Non hai ancora compilato il check-in di oggi. Prenditi un momento per riflettere sulla tua giornata!',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: { url: '/diario' }
    })

    let remindedCount = 0

    // Send notification to each user who hasn't checked in
    for (const userId of usersToRemind) {
      const userSubscriptions = subscriptions.filter(s => s.user_id === userId)
      
      for (const sub of userSubscriptions) {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          }

          await webpush.sendNotification(pushSubscription, payload)
          remindedCount++
          console.log('Reminder sent to user:', userId)
        } catch (error: unknown) {
          const err = error as { statusCode?: number; message?: string }
          console.error('Failed to send reminder to user:', userId, err.message)
          
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id)
          }
        }
      }
    }

    console.log(`Daily reminders complete: ${remindedCount} notifications sent`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalUsers: userIds.length,
        usersNeedingReminder: usersToRemind.length,
        reminded: remindedCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const err = error as { message?: string }
    console.error('Error in send-daily-reminder:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
