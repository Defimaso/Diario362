// =============================================
// Edge Function: send-quiz-email
// Riceve dati quiz dal sito 362gradi.ae
// 1. Salva il lead in quiz_leads (DB)
// 2. Invia email personalizzata via Resend
// =============================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QuizEmailRequest {
  email: string
  name?: string
  needProfile: string
  profileName: string
  hookChoice?: string | null
  source?: string
  quizMode?: string
  allAnswers?: string[]
}

// Contenuto email per ogni profilo
// Tono: "ti abbiamo capito", non "ti abbiamo profilato"
// Call = valutazione reciproca, non consulenza gratuita
const profileEmails: Record<string, { subject: string; emoji: string; intro: string; guideHook: string; callHook: string }> = {
  significance: {
    subject: 'La tua guida personalizzata — Il Protagonista',
    emoji: '⭐',
    intro: 'Vuoi risultati che contano davvero — visibili, concreti, che ti rendano orgoglioso/a. Meriti un percorso all\'altezza della trasformazione che immagini.',
    guideHook: 'La guida include strategie specifiche per chi, come te, punta a una trasformazione che si vede e si sente.',
    callHook: 'Nella videocall valutiamo insieme se il nostro percorso è quello giusto per la trasformazione che hai in mente.',
  },
  intelligence: {
    subject: 'La tua guida personalizzata — Lo Stratega',
    emoji: '🧠',
    intro: 'Non ti accontenti di "fai così e basta". Vuoi capire il perché dietro ogni scelta. È l\'approccio più intelligente al benessere.',
    guideHook: 'La guida spiega la scienza dietro ogni errore — dati, meccanismi, e soluzioni basate su evidenze.',
    callHook: 'Nella videocall ti spieghiamo il metodo nel dettaglio e valutiamo insieme se è l\'approccio giusto per te.',
  },
  acceptance: {
    subject: 'La tua guida personalizzata — Il Connettore',
    emoji: '🤝',
    intro: 'Il percorso più efficace è quello che si fa insieme. Cerchi un team che ti capisca e una community che ti sostenga.',
    guideHook: 'La guida ti mostra come le persone con i migliori risultati lo hanno fatto sentendosi parte di qualcosa di più grande.',
    callHook: 'Nella videocall ci conosciamo e vediamo se il nostro team è quello giusto per accompagnarti.',
  },
  approval: {
    subject: 'La tua guida personalizzata — L\'Eccellente',
    emoji: '🏆',
    intro: 'Dai il massimo in tutto quello che fai e vuoi qualcuno che riconosca i tuoi sforzi. Con la giusta guida, ogni passo viene visto e valorizzato.',
    guideHook: 'La guida ti dà un framework chiaro per ogni fase — così saprai sempre che stai facendo la cosa giusta.',
    callHook: 'Nella videocall capiamo dove sei e valutiamo insieme se il percorso è il passo giusto per te.',
  },
  power: {
    subject: 'La tua guida personalizzata — Il Leader',
    emoji: '💪',
    intro: 'Vuoi riprendere il controllo — del tuo corpo, della tua energia, della tua vita. Con gli strumenti giusti sarai inarrestabile.',
    guideHook: 'La guida ti dà gli strumenti per prendere decisioni autonome e consapevoli sul tuo benessere.',
    callHook: 'Nella videocall vediamo la tua situazione e valutiamo insieme se il nostro percorso ti dà quello che cerchi.',
  },
  pity: {
    subject: 'La tua guida personalizzata — Il Resiliente',
    emoji: '🔥',
    intro: 'Hai affrontato più ostacoli di quanti gli altri immaginino. Il fatto che tu sia qui dimostra una forza incredibile. Questa volta sarà diverso.',
    guideHook: 'La guida spiega perché i metodi precedenti non hanno funzionato e cosa cambiare.',
    callHook: 'Nella videocall ascoltiamo la tua storia e valutiamo insieme se possiamo davvero aiutarti questa volta.',
  },
}

function buildEmailHtml(name: string, needProfile: string, profileName: string): string {
  const profile = profileEmails[needProfile] || profileEmails.significance
  const greeting = name ? `Ciao ${name}` : 'Ciao'
  const guideUrl = `https://362gradi.ae/guide/${needProfile}`
  const appUrl = 'https://diario.362gradi.ae'
  const calendlyUrl = 'https://calendly.com/info-xjs/call-362'

  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:20px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;max-width:100%;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1A535C,#4ECDC4);padding:40px 30px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">${profile.emoji}</div>
          <h1 style="color:#ffffff;font-size:24px;margin:0 0 8px;font-weight:700;">${greeting}!</h1>
          <p style="color:rgba(255,255,255,0.9);font-size:16px;margin:0;">Il tuo profilo: <strong>${profileName}</strong></p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:30px;">
          <p style="font-size:15px;line-height:1.6;color:#333;margin:0 0 16px;">
            ${profile.intro}
          </p>

          <!-- Guida -->
          <div style="background-color:#f0faf8;border:1px solid #d0ece7;border-radius:8px;padding:16px;margin:0 0 20px;">
            <p style="font-size:14px;color:#1A535C;margin:0;line-height:1.5;">
              📖 ${profile.guideHook}
            </p>
          </div>

          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 24px;">
            <a href="${guideUrl}" target="_blank" style="display:inline-block;background-color:#1A535C;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">
              Leggi la tua Guida Personalizzata →
            </a>
          </td></tr></table>

          <!-- Divider -->
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">

          <!-- CTA PRIMARIO: Videocall -->
          <div style="background-color:#FFF5F5;border:1px solid #FFD4D4;border-radius:10px;padding:20px;text-align:center;">
            <p style="font-size:15px;font-weight:700;color:#1A535C;margin:0 0 8px;">
              📞 Il prossimo passo?
            </p>
            <p style="font-size:13px;color:#555;line-height:1.6;margin:0 0 6px;">
              ${profile.callHook}
            </p>
            <p style="font-size:12px;color:#888;margin:0 0 16px;">
              Nessun impegno, solo una chiacchierata per capire insieme se possiamo lavorare bene.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
              <a href="${calendlyUrl}" target="_blank" style="display:inline-block;background-color:#FF6B6B;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">
                Prenota la Videocall Gratuita →
              </a>
            </td></tr></table>
            <p style="font-size:11px;color:#aaa;margin:8px 0 0;">
              30 minuti · Gratuita · Nessun impegno
            </p>
          </div>

          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">

          <!-- App secondaria -->
          <div style="text-align:center;">
            <p style="font-size:13px;color:#888;margin:0 0 4px;">
              📱 Intanto puoi provare l'app gratuita:
            </p>
            <a href="${appUrl}" target="_blank" style="color:#4ECDC4;text-decoration:underline;font-size:13px;font-weight:600;">
              Apri l'App Gratis →
            </a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
          <p style="font-size:12px;color:#999;margin:0 0 4px;">
            362gradi — nutrizione, allenamento, psicologia
          </p>
          <p style="font-size:11px;color:#bbb;margin:0;">
            Ricevi questa email perché hai completato il quiz su 362gradi.ae
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const { email, name, needProfile, profileName, hookChoice, source, quizMode, allAnswers }: QuizEmailRequest = await req.json()

    if (!email || !needProfile) {
      return new Response(
        JSON.stringify({ error: 'email and needProfile are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const profile = profileEmails[needProfile]
    if (!profile) {
      return new Response(
        JSON.stringify({ error: `Unknown profile: ${needProfile}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ─── 1. Salva lead nel DB ───
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Build email HTML
    const html = buildEmailHtml(name || '', needProfile, profileName || profile.subject)

    // ─── 2. Invia email via Resend ───
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: '362gradi <noreply@send.362gradi.ae>',
        to: [email],
        subject: profile.subject,
        html,
      }),
    })

    const resendData = await resendResponse.json()
    const emailSent = resendResponse.ok

    if (!emailSent) {
      console.error('[send-quiz-email] Resend error:', resendData)
    }

    // ─── 3. Salva lead (anche se email fallisce) ───
    const { error: dbError } = await supabase.from('quiz_leads').insert({
      email,
      name: name || null,
      need_profile: needProfile,
      profile_name: profileName || profile.subject,
      hook_choice: hookChoice || null,
      source: source || 'quiz_popup',
      quiz_mode: quizMode || 'short',
      all_answers: allAnswers || null,
      email_sent: emailSent,
      resend_email_id: resendData?.id || null,
    })

    if (dbError) {
      console.error('[send-quiz-email] DB error:', dbError)
    }

    // ─── 4. Aggiungi lead a MailerLite (per nurturing sequence) ───
    const MAILERLITE_API_KEY = Deno.env.get('MAILERLITE_API_KEY')
    if (MAILERLITE_API_KEY) {
      try {
        const mlResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            email,
            fields: {
              name: name || '',
              last_name: '',
              need_profile: needProfile,
              profile_name: profileName || profile.subject,
            },
            groups: ['179312799620531759'], // Quiz Leads group
            status: 'active',
          }),
        })
        const mlData = await mlResponse.json()
        if (mlResponse.ok) {
          console.log('[send-quiz-email] MailerLite: subscriber added', mlData?.data?.id)
        } else {
          console.error('[send-quiz-email] MailerLite error:', mlData)
        }
      } catch (mlErr) {
        console.error('[send-quiz-email] MailerLite network error:', mlErr)
      }
    }

    if (!emailSent) {
      return new Response(
        JSON.stringify({ error: 'Email send failed', details: resendData, leadSaved: !dbError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[send-quiz-email] Lead saved + email sent:', {
      to: email,
      profile: needProfile,
      source: source || 'unknown',
      quizMode: quizMode || 'short',
      hookChoice: hookChoice || 'none',
      resendId: resendData.id,
      dbSaved: !dbError,
    })

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const err = error as { message?: string }
    console.error('[send-quiz-email] Error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
