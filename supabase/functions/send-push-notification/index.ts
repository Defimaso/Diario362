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

    const { userId, title, body, data } = await req.json()

    console.log('Sending push notification to user:', userId)

    // Get user's push subscriptions
    let query = supabase.from('push_subscriptions').select('*')
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data: subscriptions, error: subError } = await query

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      throw subError
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No subscriptions found for user:', userId)
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${subscriptions.length} subscriptions`)

    const payload = JSON.stringify({
      title: title || 'Check-in Giornaliero',
      body: body || 'Non dimenticare di compilare il tuo check-in oggi!',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: data || { url: '/diario' }
    })

    let successCount = 0
    let failCount = 0
    const failedEndpoints: string[] = []

    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }

        await webpush.sendNotification(pushSubscription, payload)
        successCount++
        console.log('Push sent successfully to:', sub.endpoint.substring(0, 50))
      } catch (error: unknown) {
        const err = error as { statusCode?: number; message?: string }
        console.error('Push failed:', err.message)
        
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription expired or not found, remove it
          console.log('Subscription expired, removing:', sub.endpoint.substring(0, 50))
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        }
        
        failCount++
        failedEndpoints.push(sub.endpoint.substring(0, 50))
      }
    }

    console.log(`Push notifications sent: ${successCount} success, ${failCount} failed`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount, 
        failed: failCount,
        failedEndpoints 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const err = error as { message?: string }
    console.error('Error in send-push-notification:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
