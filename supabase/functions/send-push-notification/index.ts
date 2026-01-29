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
  link: string
) {
  try {
    const client = createClient(supabaseUrl, supabaseServiceKey)
    const { error } = await client.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      link,
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

    const { userId, title, body, data } = await req.json()

    console.log('Sending push notification to user:', userId)

    // Create in-app notification
    if (userId) {
      await createInAppNotification(
        supabaseUrl,
        supabaseServiceKey,
        userId,
        'manual',
        title || 'Check-in Giornaliero',
        body || 'Non dimenticare di compilare il tuo check-in oggi!',
        data?.url || '/diario'
      )
    }

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
