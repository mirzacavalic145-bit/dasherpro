// POST /api/market-guide
// Generates an AI-powered local market guide for any US city
// Results are cached in Supabase for 7 days to minimize API costs

export const dynamic = 'force-dynamic'

import { getSupabaseAdmin } from '../../../lib/supabase'

export async function POST(req) {
  try {
    const { city } = await req.json()
    if (!city || city.trim().length < 2) {
      return Response.json({ error: 'City name required' }, { status: 400 })
    }

    const cityKey = city.trim().toLowerCase().replace(/\s+/g, '-')

    // ── 1. Check cache first (7-day TTL) — non-fatal if Supabase unavailable ──
    try {
      const supabaseAdmin = getSupabaseAdmin()
      const { data: cached } = await supabaseAdmin
        .from('market_guides')
        .select('guide, created_at')
        .eq('city_key', cityKey)
        .single()

      if (cached) {
        const age = Date.now() - new Date(cached.created_at).getTime()
        const sevenDays = 7 * 24 * 60 * 60 * 1000
        if (age < sevenDays) {
          return Response.json({ guide: cached.guide, cached: true })
        }
      }
    } catch (cacheErr) {
      console.warn('Cache check skipped:', cacheErr.message)
    }

    // ── 2. Generate fresh guide with Claude ───────────────────────
    const prompt = `You are DasherPro's local market intelligence engine. Generate a detailed, actionable DoorDash market guide for: ${city}

Return ONLY valid JSON in exactly this structure (no markdown, no explanation):
{
  "city": "Full city name, State",
  "marketRating": "Strong" | "Good" | "Average" | "Competitive",
  "zones": [
    {
      "rank": 1,
      "name": "Zone name / neighborhood",
      "description": "2-sentence description of why this zone is good for dashing",
      "tags": ["tag1", "tag2", "tag3"],
      "tier": "hot" | "warm" | "ok"
    }
  ],
  "peakTimes": {
    "bestDay": "Day name",
    "bestShift": "e.g. Friday dinner 4:30–9 PM",
    "lunchWindow": "e.g. 11 AM – 2 PM",
    "dinnerWindow": "e.g. 4:30 PM – 8:30 PM",
    "weekendNote": "One sentence about weekend pattern"
  },
  "tips": [
    "Specific actionable tip 1 for this city",
    "Specific actionable tip 2 for this city",
    "Specific actionable tip 3 for this city"
  ],
  "orderThreshold": {
    "minimum": 7,
    "targetPerMile": 2.0,
    "note": "One sentence about order selection in this market"
  },
  "marketNotes": "2-3 sentences about what makes this specific market unique for dashers — weather, demographics, traffic patterns, etc."
}

Use your knowledge of ${city}'s geography, restaurant districts, demographics, and traffic patterns. Be specific — name real neighborhoods, areas, and patterns. If you don't know the city well, give general but honest guidance. Always return 4 zones.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const aiData = await response.json()
    const rawText = aiData.content?.[0]?.text || ''

    // Parse JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in AI response')
    const guide = JSON.parse(jsonMatch[0])

    // ── 3. Cache in Supabase — non-fatal ─────────────────────────
    try {
      const supabaseAdmin = getSupabaseAdmin()
      await supabaseAdmin
        .from('market_guides')
        .upsert({ city_key: cityKey, city_name: city, guide, created_at: new Date().toISOString() })
    } catch (writeErr) {
      console.warn('Cache write skipped:', writeErr.message)
    }

    return Response.json({ guide, cached: false })

  } catch (err) {
    console.error('Market guide error:', err)
    return Response.json({ error: 'Failed to generate guide. Please try again.' }, { status: 500 })
  }
}
