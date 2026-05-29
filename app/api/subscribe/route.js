// POST /api/subscribe
// Captures email leads from landing page

export const dynamic = 'force-dynamic'

import { getSupabaseAdmin } from '../../../lib/supabase'

export async function POST(req) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email required' }, { status: 400 })
    }

    const cleaned = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleaned) || cleaned.length > 254) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 })
    }

    try {
      const supabase = getSupabaseAdmin()
      await supabase
        .from('email_leads')
        .upsert({ email: cleaned, source: 'landing_page' }, { onConflict: 'email' })
    } catch (dbErr) {
      console.error('DB error:', dbErr.message)
      return Response.json({ error: 'Failed to save email' }, { status: 500 })
    }

    return Response.json({ success: true })

  } catch (err) {
    console.error('Subscribe error:', err)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
