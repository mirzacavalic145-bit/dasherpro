// POST /api/coach
// Streams AI coach responses for any dasher market

export async function POST(req) {
  try {
    const { messages, city } = await req.json()

    const systemPrompt = `You are DasherPro's AI strategy coach — an expert on maximizing DoorDash earnings for dashers across the entire United States.

The user is dashing in: ${city || 'their local market'}.

Your role: give direct, specific, actionable advice. No fluff. When you mention zones, use real neighborhood names for their city. When you mention earnings, use realistic dollar ranges. When you mention timing, be specific (e.g. "4:30–9 PM Friday" not "evenings").

Key knowledge you apply to every market:
- Peak hours are always lunch (11 AM–2 PM) and dinner (4:30–8:30 PM)
- Friday dinner is universally the best single shift of the week
- $2/mile is the minimum order threshold; $2.50+/mile is the target
- Bad weather = fewer dashers + more orders = your biggest opportunity
- Positioning near restaurant clusters (not in residential areas) is the #1 efficiency lever
- Mileage deduction is $0.67/mile for 2024 taxes (IRS rate)
- Texas has no state income tax; other states vary significantly
- Set aside 25–30% of gross for self-employment taxes

Keep responses concise: 2–4 short paragraphs max. Be like a veteran dasher mentor who knows every city — honest, direct, and specific to their market.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: systemPrompt,
        messages,
      }),
    })

    const data = await response.json()
    const reply = data.content?.[0]?.text || "I'm having trouble right now — try again in a moment."

    return Response.json({ reply })

  } catch (err) {
    console.error('Coach error:', err)
    return Response.json({ reply: 'Connection issue — please try again.' }, { status: 500 })
  }
}
