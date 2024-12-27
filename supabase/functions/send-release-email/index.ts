import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  releaseNoteId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Processing release note email request')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    const { releaseNoteId }: EmailRequest = await req.json()
    console.log('Release note ID:', releaseNoteId)

    // Get release note details
    const { data: releaseNote, error: releaseError } = await supabase
      .from('release_notes')
      .select('*')
      .eq('id', releaseNoteId)
      .single()

    if (releaseError) throw releaseError
    if (!releaseNote) throw new Error('Release note not found')

    // Get all users with email notifications enabled
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email_notifications', true)

    if (profilesError) throw profilesError

    // Get user emails from auth.users
    const userIds = profiles.map(profile => profile.id)
    const { data: users, error: usersError } = await supabase
      .auth.admin.listUsers()

    if (usersError) throw usersError

    const emailRecipients = users.users
      .filter(user => userIds.includes(user.id))
      .map(user => user.email)

    if (emailRecipients.length === 0) {
      console.log('No recipients found with email notifications enabled')
      return new Response(
        JSON.stringify({ message: 'No recipients found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare email content
    const emailHtml = `
      <h2>New Release: ${releaseNote.title}</h2>
      <p><strong>Version:</strong> ${releaseNote.version}</p>
      ${releaseNote.is_major ? '<p><strong>🌟 Major Update!</strong></p>' : ''}
      <div style="margin: 20px 0;">
        ${releaseNote.description}
      </div>
    `

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'updates@resend.dev',
        to: emailRecipients,
        subject: `New Release: ${releaseNote.title}`,
        html: emailHtml,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Resend API error: ${error}`)
    }

    // Update last_email_sent timestamp
    const { error: updateError } = await supabase
      .from('release_notes')
      .update({ last_email_sent: new Date().toISOString() })
      .eq('id', releaseNoteId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true, recipientCount: emailRecipients.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending release note email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

serve(handler)