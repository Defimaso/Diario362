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

interface InteractionRequest {
  type: 'coach_note' | 'daily_checkin' | 'check_submitted' | 'diet_uploaded' | 'app_feedback'
  clientId: string
  authorId: string
  authorName?: string
  metadata?: Record<string, unknown>
}

function vapidKeysToJwk(publicKeyBase64: string, privateKeyBase64: string) {
  const base64urlToUint8Array = (base64url: string): Uint8Array => {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    const padding = '='.repeat((4 - (base64.length % 4)) % 4)
    const binary = atob(base64 + padding)
    return new Uint8Array([...binary].map(c => c.charCodeAt(0)))
  }

  const uint8ArrayToBase64url = (arr: Uint8Array): string => {
    return btoa(String.fromCharCode(...arr))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  const publicKeyBytes = base64urlToUint8Array(publicKeyBase64)
  const privateKeyBytes = base64urlToUint8Array(privateKeyBase64)

  const x = publicKeyBytes.slice(1, 33)
  const y = publicKeyBytes.slice(33, 65)

  return {
    publicKey: { kty: 'EC', crv: 'P-256', x: uint8ArrayToBase64url(x), y: uint8ArrayToBase64url(y) } as JsonWebKey,
    privateKey: { kty: 'EC', crv: 'P-256', x: uint8ArrayToBase64url(x), y: uint8ArrayToBase64url(y), d: uint8ArrayToBase64url(privateKeyBytes) } as JsonWebKey,
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

    const { publicKey, privateKey } = vapidKeysToJwk(vapidPublicKey, vapidPrivateKey)
    const vapidKeys = await importVapidKeys({ publicKey, privateKey })
    const appServer = await ApplicationServer.new({
      contactInformation: 'mailto:info@362gradi.it',
      vapidKeys,
    })

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { type, clientId, authorId, authorName, metadata } = await req.json() as InteractionRequest

    console.log('Interaction notification:', { type, clientId, authorId })

    // Get client name
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', clientId)
      .single()

    const clientName = clientProfile?.full_name || 'Cliente'

    // Determine targets and notification content based on type
    let targetUserIds: string[] = []
    let title = ''
    let body = ''
    let url = '/diario'
    let notificationType = type

    // Helper: get coach user IDs for a client
    const getCoachUserIds = async (excludeAuthor?: string): Promise<string[]> => {
      const { data: assignment } = await supabase
        .from('coach_assignments')
        .select('coach_name')
        .eq('client_id', clientId)
        .single()

      if (!assignment) return []

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

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .in('email', emails)

      if (!profiles) return []
      return profiles.map(p => p.id).filter(id => id !== excludeAuthor)
    }

    switch (type) {
      case 'coach_note': {
        // Coach added a note → notify other coaches assigned to same client
        targetUserIds = await getCoachUserIds(authorId)
        title = '📝 Nuova Nota Coach'
        body = `${authorName || 'Un coach'} ha aggiunto una nota per ${clientName}`
        url = '/gestionediario'
        break
      }
      case 'daily_checkin': {
        // Client submitted daily check-in → notify assigned coaches
        targetUserIds = await getCoachUserIds()
        title = '✅ Nuovo Check-in'
        body = `${clientName} ha compilato il check-in giornaliero`
        url = '/gestionediario'
        break
      }
      case 'check_submitted': {
        // Client submitted numbered check (with photos) → notify coaches
        targetUserIds = await getCoachUserIds()
        const checkNum = metadata?.checkNumber || ''
        title = '📸 Nuovo Check Foto'
        body = `${clientName} ha inviato il Check #${checkNum}`
        url = '/gestionediario'
        break
      }
      case 'diet_uploaded': {
        // Coach uploaded diet plan → notify client
        targetUserIds = [clientId]
        title = '🥗 Nuovo Piano Alimentare'
        body = `Il tuo coach ha caricato un nuovo piano alimentare`
        url = '/nutrizione'
        break
      }
      case 'app_feedback': {
        // User submitted app feedback → notify super admin (info@362gradi.it)
        const { data: adminProfiles, error: adminError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', 'info@362gradi.it')
        
        console.log('Admin profiles query result:', { adminProfiles, adminError })
        
        if (adminError) {
          console.error('Error fetching admin profiles:', adminError)
        }
        
        targetUserIds = adminProfiles?.map(p => p.id) || []
        
        // If the sender IS info@362gradi.it, still notify them (self-notification for feedback)
        // No need to filter out the author for feedback
        
        const feedbackRating = metadata?.rating || 'N/A'
        const feedbackBugs = metadata?.bugs || 'Nessuno'
        const feedbackWishlist = metadata?.wishlist || 'Nessuna'
        title = '💬 Nuovo Feedback App'
        body = `${clientName} ha lasciato un feedback:\nVoto: ${feedbackRating}\nBug: ${feedbackBugs}\nDesideri: ${feedbackWishlist}`
        url = '/gestionediario'
        break
      }
    }

    if (targetUserIds.length === 0) {
      console.log('No target users found')
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No target users' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Sending to users:', targetUserIds)

    // Create in-app notifications
    for (const userId of targetUserIds) {
      try {
        const { error: insertError } = await supabase.from('notifications').insert({
          user_id: userId,
          type: notificationType,
          title,
          message: body,
          link: url,
          metadata: metadata || null,
          is_read: false,
        } as never)
        if (insertError) {
          console.error('Error creating in-app notification for', userId, ':', insertError)
        }
      } catch (err) {
        console.error('Exception creating in-app notification:', err)
      }
    }

    // Get push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', targetUserIds)

    if (subError || !subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found, in-app only')
      return new Response(
        JSON.stringify({ success: true, sent: 0, inApp: targetUserIds.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: { url },
      tag: type,
    })

    let successCount = 0

    for (const sub of subscriptions) {
      try {
        const pushSubscription: PushSubscription = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        }
        const subscriber = appServer.subscribe(pushSubscription)
        await subscriber.pushTextMessage(payload, {})
        successCount++
      } catch (error: unknown) {
        const err = error as { status?: number }
        if (err.status === 410 || err.status === 404) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        }
      }
    }

    console.log(`Sent ${successCount} push notifications + ${targetUserIds.length} in-app`)

    return new Response(
      JSON.stringify({ success: true, sent: successCount, inApp: targetUserIds.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const err = error as { message?: string }
    console.error('Error in notify-interaction:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
