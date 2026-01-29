import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  ApplicationServer,
  importVapidKeys,
  type PushSubscription 
} from 'jsr:@negrel/webpush@0.5.0'

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

// Convert base64url VAPID keys to JWK format for ECDSA P-256
function vapidKeysToJwk(publicKeyBase64: string, privateKeyBase64: string): { publicKey: JsonWebKey; privateKey: JsonWebKey } {
  // Decode base64url to Uint8Array
  const base64urlToUint8Array = (base64url: string): Uint8Array => {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    const padding = '='.repeat((4 - (base64.length % 4)) % 4)
    const binary = atob(base64 + padding)
    return new Uint8Array([...binary].map(c => c.charCodeAt(0)))
  }

  // Convert Uint8Array to base64url
  const uint8ArrayToBase64url = (arr: Uint8Array): string => {
    return btoa(String.fromCharCode(...arr))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  const publicKeyBytes = base64urlToUint8Array(publicKeyBase64)
  const privateKeyBytes = base64urlToUint8Array(privateKeyBase64)

  // For P-256, public key is 65 bytes (uncompressed: 0x04 + 32 bytes X + 32 bytes Y)
  // Skip the first byte (0x04) and split into X and Y
  const x = publicKeyBytes.slice(1, 33)
  const y = publicKeyBytes.slice(33, 65)

  const publicKeyJwk: JsonWebKey = {
    kty: 'EC',
    crv: 'P-256',
    x: uint8ArrayToBase64url(x),
    y: uint8ArrayToBase64url(y),
  }

  const privateKeyJwk: JsonWebKey = {
    kty: 'EC',
    crv: 'P-256',
    x: uint8ArrayToBase64url(x),
    y: uint8ArrayToBase64url(y),
    d: uint8ArrayToBase64url(privateKeyBytes),
  }

  return { publicKey: publicKeyJwk, privateKey: privateKeyJwk }
}

async function createInAppNotification(
  supabaseUrl: string,
  supabaseServiceKey: string,
  userId: string,
  type: string,
  title: string,
  message: string,
  link: string,
  metadata?: Record<string, unknown>
) {
  try {
    // Create a fresh client to avoid type issues with generated types
    const client = createClient(supabaseUrl, supabaseServiceKey)
    const { error } = await client.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      link,
      metadata: metadata || null,
      is_read: false,
    } as never) // Type cast to bypass generated types until they sync
    if (error) {
      console.error('Error creating in-app notification:', error)
    } else {
      console.log('In-app notification created for user:', userId)
    }
  } catch (err) {
    console.error('Error creating in-app notification:', err)
  }
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

    // Convert base64url VAPID keys to JWK format
    const { publicKey, privateKey } = vapidKeysToJwk(vapidPublicKey, vapidPrivateKey)

    // Import VAPID keys from JWK format to CryptoKeyPair
    const vapidKeys = await importVapidKeys({
      publicKey,
      privateKey,
    })

    // Create ApplicationServer with VAPID keys (Deno-native webpush)
    const appServer = await ApplicationServer.new({
      contactInformation: 'mailto:info@362gradi.it',
      vapidKeys,
    })

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { type, videoId, clientId, clientName, exerciseName, coachId } = await req.json() as NotifyRequest

    console.log('Video notification request:', { type, videoId, clientId })

    let targetUserIds: string[] = []
    let title = ''
    let body = ''
    let url = '/allenamento'

    if (type === 'video_uploaded') {
      // Notify coaches assigned to this client
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
        emails.push('info@362gradi.it') // Always include super admin

        if (emails.length > 0) {
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

    // Create in-app notifications for all target users
    for (const userId of targetUserIds) {
      await createInAppNotification(
        supabaseUrl,
        supabaseServiceKey,
        userId,
        type,
        title,
        body,
        url,
        { videoId, exerciseName }
      )
    }

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
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found, in-app notifications created' }),
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
        const pushSubscription: PushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }

        const subscriber = appServer.subscribe(pushSubscription)
        await subscriber.pushTextMessage(payload, {})
        successCount++
        console.log('Push sent successfully to:', sub.endpoint.substring(0, 50))
      } catch (error: unknown) {
        const err = error as { status?: number; message?: string }
        console.error('Push failed:', err.message)
        
        // If subscription expired (410/404), remove it
        if (err.status === 410 || err.status === 404) {
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
