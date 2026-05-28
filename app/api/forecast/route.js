// POST /api/forecast
// AI-powered shift earnings forecast for a given city, day, and time window

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const { city, day, startTime, endTime } = await req.json()

    if (!day || !startTime || !endTime) {
      return Response.json({ error: 'day, startTime, endTime required' }, { status: 400 })
    }

    const cityLabel = city?.trim() || 'your market'

    const prompt = `You are DasherPro's earnings forecast engine. A DoorDash dasher in ${cityLabel} wants to know how much they can earn.

Shift details:
- City: ${cityLabel}
- Day: ${day}
- Start time: ${startTime}
- End time: ${endTime}

Return ONLY valid JSON in exactly this structure (no markdown, no explanation):
{
  "low": 42,
  "mid": 67,
  "high": 89,
  "confidence": "High" | "Medium" | "Low",
  "verdict": "One sentence — is this a good shift or not?",
  "bestZone": "Best specific area/neighborhood to start in for this city",
  "peakWindow": "The best 2-hour window within this shift e.g. 5:30–7:30 PM",
  "tips": [
    "Specific tip 1 for maximizing this exact shift",
    "Specific tip 2 for this city/time combo"
  ],
  "warning": "One sentence warning if any — slow period, competition, weather pattern, or null"
}

Rules:
- low = conservative estimate (slow night, bad luck)
- mid = realistic estimate (average conditions)
- high = optimistic estimate (peak conditions, good orders)
- All dollar amounts are integers (no decimals)
- Use real knowledge of ${cityLabel} restaurant districts, traffic, and DoorDash demand patterns
- Friday/Saturday dinner = highest earning potential
- Lunch shifts = lower volume but consistent
- Late night (after 9pm) = declining orders in most markets
- Be honest — don't inflate numbers`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const aiData = await response.json()
    const rawText = aiData.content?.[0]?.text || ''
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in AI response')
    const forecast = JSON.parse(jsonMatch[0])

    return Response.json({ forecast })

  } catch (err) {
    console.error('Forecast error:', err)
    return Response.json({ error: 'Failed to generate forecast. Please try again.' }, { status: 500 })
  }
}
