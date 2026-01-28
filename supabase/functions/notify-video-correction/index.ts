import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface NotifyRequest {
  type: 'video_uploaded' | 'feedback_added';
  videoId: string;
  clientId: string;
  clientName?: string;
  exerciseName?: string;
  coachId?: string;
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
    const { type, videoId, clientId, clientName, exerciseName, coachId } = await req.json() as NotifyRequest

    console.log('Video notification request:', { type, videoId, clientId })

    let targetUserIds: string[] = []
    let title = ''
    let body = ''
    let url = '/allenamento'

    if (type === 'video_uploaded') {
      // Notify coaches assigned to this client
      // First get the coach assignment
      const { data: assignment } = await supabase
        .from('coach_assignments')
        .select('coach_name')
        .eq('client_id', clientId)
        .single()

      if (assignment) {
        // Map coach names to emails
        const coachEmailMap: Record<string, string[]> = {
          'Ilaria': ['ilaria@362gradi.it'],
          'Marco': ['marco@362gradi.it'],
          'Martina': ['martina@362gradi.it', 'martina.fienga@hotmail.it'],
          'Michela': ['michela@362gradi.it', 'michela.amadei@hotmail.it'],
          'Cristina': ['cristina@362gradi.it', 'spicri@gmail.com'],
          'Ilaria_Marco': ['ilaria@362gradi.it', 'marco@362gradi.it'],
          'Ilaria_Michela': ['ilaria@362gradi.it', 'michela@362gradi.it', 'michela.amadei@hotmail.it'],
          'Ilaria_Martina': ['ilaria@362gradi.it', 'martina@362gradi.it', 'martina.fienga@hotmail.it'],
          'Ilaria_Marco_Michela': ['ilaria@362gradi.it', 'marco@362gradi.it', 'michela@362gradi.it'],
          'Michela_Martina': ['michela@362gradi.it', 'michela.amadei@hotmail.it', 'martina@362gradi.it', 'martina.fienga@hotmail.it'],
          'Martina_Michela': ['martina@362gradi.it', 'martina.fienga@hotmail.it', 'michela@362gradi.it', 'michela.amadei@hotmail.it'],
        }

        const emails = coachEmailMap[assignment.coach_name] || []
        
        // Also add super admin
        emails.push('info@362gradi.it')

        if (emails.length > 0) {
          // Get user IDs from emails
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id')
            .in('email', emails)

          if (profiles) {
            targetUserIds = profiles.map(p => p.id)
          }
        }
      } else {
        // No assignment, notify all admins
        const { data: adminRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin')

        if (adminRoles) {
          targetUserIds = adminRoles.map(r => r.user_id)
        }
      }

      title = '🎥 Nuovo Video Caricato'
      body = `${clientName || 'Un cliente'} ha caricato un video: ${exerciseName || 'Esercizio'}`
      url = '/gestionediario'

    } else if (type === 'feedback_added') {
      // Notify the client who owns the video
      targetUserIds = [clientId]
      title = '💪 Nuovo Feedback dal Coach'
      body = `Il tuo coach ha risposto al video "${exerciseName || 'Esercizio'}"`
      url = '/allenamento'
    }

    if (targetUserIds.length === 0) {
      console.log('No target users found for notification')
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No target users' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Sending notifications to users:', targetUserIds)

    // Get subscriptions for target users
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', targetUserIds)

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      throw subError
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found for target users')
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${subscriptions.length} subscriptions`)

    const payload = JSON.stringify({
      title,
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: { url }
    })

    let successCount = 0
    let failCount = 0

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
          console.log('Subscription expired, removing:', sub.endpoint.substring(0, 50))
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        }
        
        failCount++
      }
    }

    console.log(`Push notifications sent: ${successCount} success, ${failCount} failed`)

    return new Response(
      JSON.stringify({ success: true, sent: successCount, failed: failCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const err = error as { message?: string }
    console.error('Error in notify-video-correction:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
