'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const PANELS = [
  { id: 'overview',  label: 'Overview',      icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { id: 'zones',     label: 'Zone map',       icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' },
  { id: 'schedule',  label: 'Schedule',       icon: 'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18' },
  { id: 'grader',    label: 'Order grader',   icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'coach',     label: 'AI coach',       icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
  { id: 'forecast',  label: 'Shift forecast', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { id: 'earnings',  label: 'Earnings',       icon: 'M22 7L13.5 15.5l-5-5L2 17M16 7h6v6' },
  { id: 'tax',       label: 'Tax tracker',    icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
]

export default function DashboardPage() {
  const [panel, setPanel] = useState('overview')
  const [city, setCity] = useState('')
  const [savedCity, setSavedCity] = useState('')
  const [guide, setGuide] = useState(null)
  const [guideLoading, setGuideLoading] = useState(false)
  const [guideError, setGuideError] = useState('')

  // Order grader
  const [gPay, setGPay] = useState(''), [gMiles, setGMiles] = useState('')
  const [gWait, setGWait] = useState(''), [gTime, setGTime] = useState('')
  const [verdict, setVerdict] = useState(null)

  // AI coach
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: "Hey! I'm your DasherPro AI coach. Tell me your city and ask me anything about your dash strategy, zones, orders, or earnings. 🚗" }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatRef = useRef(null)

  // Earnings calc
  const [sliders, setSliders] = useState({ hrs: 20, ord: 9, oph: 2, pk: 50, gas: 30 })

  // Tax
  const [taxGross, setTaxGross] = useState(''), [taxMiles, setTaxMiles] = useState('')

  // Shift forecast
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const TIMES = ['6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','4:30 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM']
  const [fcDay, setFcDay] = useState('Friday')
  const [fcStart, setFcStart] = useState('4:30 PM')
  const [fcEnd, setFcEnd] = useState('9:00 PM')
  const [fcResult, setFcResult] = useState(null)
  const [fcLoading, setFcLoading] = useState(false)
  const [fcError, setFcError] = useState('')

  const runForecast = async () => {
    setFcLoading(true)
    setFcError('')
    setFcResult(null)
    try {
      const res = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: savedCity, day: fcDay, startTime: fcStart, endTime: fcEnd }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setFcResult(data.forecast)
    } catch (e) {
      setFcError(e.message || 'Failed to generate forecast')
    }
    setFcLoading(false)
  }

  useEffect(() => {
    const stored = localStorage.getItem('dasherpro_city')
    if (stored) { setSavedCity(stored); setCity(stored) }
  }, [])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [chatHistory])

  // ── City / market guide ──────────────────────────────────────
  const fetchGuide = async () => {
    if (!city.trim()) return
    setGuideLoading(true)
    setGuideError('')
    try {
      const res = await fetch('/api/market-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: city.trim() }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setGuide(data.guide)
      setSavedCity(city.trim())
      localStorage.setItem('dasherpro_city', city.trim())
    } catch (e) {
      setGuideError(e.message || 'Failed to load market guide')
    }
    setGuideLoading(false)
  }

  // ── Order grader ─────────────────────────────────────────────
  const gradeOrder = () => {
    const pay = parseFloat(gPay), miles = parseFloat(gMiles)
    const wait = parseFloat(gWait) || 5, time = parseFloat(gTime) || 10
    if (!pay || !miles) return
    const ppm = pay / miles
    const gasCost = miles * 0.18
    const netPay = pay - gasCost
    const totalMin = wait + time + 3
    const effHr = (netPay / totalMin * 60)
    let type, head, detail
    if (ppm >= 2.0 && netPay >= 6 && effHr >= 14) {
      type = 'accept'; head = '✅ Accept this order'
      detail = `At $${ppm.toFixed(2)}/mile and ~$${Math.round(effHr)}/hr effective, this is a solid order. Take it.`
    } else if (ppm < 1.25 || pay < 6) {
      type = 'decline'; head = '❌ Decline this order'
      detail = `At $${ppm.toFixed(2)}/mile, this doesn't clear your $2.00/mile minimum. A better order will come — hold out.`
    } else {
      type = 'maybe'; head = '⚠️ Borderline — use judgment'
      detail = `$${ppm.toFixed(2)}/mile is marginal. During peak hours, decline and wait. During slow periods, consider accepting.`
    }
    setVerdict({ type, head, detail, math: `$${pay.toFixed(2)} ÷ ${miles.toFixed(1)}mi = $${ppm.toFixed(2)}/mi · gas ~$${gasCost.toFixed(2)} · net $${netPay.toFixed(2)} · ~$${Math.round(effHr)}/hr` })
  }

  // ── AI coach ─────────────────────────────────────────────────
  const sendChat = async () => {
    const msg = chatInput.trim()
    if (!msg || chatLoading) return
    setChatInput('')
    const userMsg = { role: 'user', content: msg }
    setChatHistory(h => [...h, userMsg])
    setChatLoading(true)
    try {
      // Only send the last 10 messages to keep tokens low
      const context = [...chatHistory.slice(-9), userMsg]
        .filter(m => m.role !== 'assistant' || chatHistory.indexOf(m) > 0)
        .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: context, city: savedCity }),
      })
      const data = await res.json()
      setChatHistory(h => [...h, { role: 'assistant', content: data.reply }])
    } catch {
      setChatHistory(h => [...h, { role: 'assistant', content: 'Connection issue — please try again.' }])
    }
    setChatLoading(false)
  }

  // ── Earnings calc ────────────────────────────────────────────
  const gross = Math.round(sliders.hrs * sliders.oph * sliders.ord * (1 + sliders.pk / 100 * 0.4))
  const net = Math.round(gross - sliders.gas)
  const effHr = (net / sliders.hrs).toFixed(2)
  const monthly = Math.round(net * 4)

  // ── Tax calc ─────────────────────────────────────────────────
  const tGross = parseFloat(taxGross) || 0
  const tMiles = parseFloat(taxMiles) || 0
  const tDeduction = (tMiles * 0.67).toFixed(2)
  const tTaxable = Math.max(0, tGross - parseFloat(tDeduction)).toFixed(2)
  const tSetAside = Math.round(parseFloat(tTaxable) * 0.28)
  const tTakeHome = Math.round(tGross - tSetAside)

  // ── Schedule data ────────────────────────────────────────────
  const schedule = [
    { day: 'Monday',    dots: 2, est: '$40–60',   shifts: [{ label: 'Lunch 11a–2p', tier: 'warm' }, { label: 'Dinner 5p–8p', tier: 'warm' }] },
    { day: 'Tuesday',   dots: 2, est: '$40–60',   shifts: [{ label: 'Lunch 11a–2p', tier: 'ok'   }, { label: 'Dinner 5p–8p', tier: 'warm' }] },
    { day: 'Wednesday', dots: 2, est: '$40–60',   shifts: [{ label: 'Lunch 11a–2p', tier: 'ok'   }, { label: 'Dinner 5p–9p', tier: 'warm' }] },
    { day: 'Thursday',  dots: 3, est: '$60–80',   shifts: [{ label: 'Lunch 10:30a–2p', tier: 'ok' }, { label: '🔥 Dinner 4:30p–9p', tier: 'hot' }], best: true },
    { day: 'Friday',    dots: 5, est: '$90–120',  shifts: [{ label: 'Lunch 11a–2p', tier: 'ok'   }, { label: '🔥 Dinner 4:30p–9p', tier: 'hot'  }, { label: 'Late 9p–11p', tier: 'warm' }], best: true },
    { day: 'Saturday',  dots: 4, est: '$80–110',  shifts: [{ label: 'Brunch 10a–1p', tier: 'warm' }, { label: '🔥 Dinner 5p–9p', tier: 'hot'   }, { label: 'Late 9p–11p', tier: 'warm' }], best: true },
    { day: 'Sunday',    dots: 3, est: '$60–80',   shifts: [{ label: '🔥 Brunch 10a–2p', tier: 'hot' }, { label: 'Dinner 5p–8p', tier: 'warm' }, { label: 'Late — skip', tier: 'skip' }] },
  ]
  const shiftClass = { hot: 'z-hot', warm: 'z-warm', ok: 'z-ok', skip: 'ztag' }

  return (
    <div className="dash-wrap">
      {/* SIDEBAR */}
      <div className="sidebar">
        <Link href="/" className="sidebar-logo"><span className="logo-dot" />DasherPro</Link>
        <div className="sb-label">Main</div>
        {PANELS.slice(0, 3).map(p => (
          <button key={p.id} className={`sb-item ${panel === p.id ? 'active' : ''}`} onClick={() => setPanel(p.id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={p.icon} /></svg>
            {p.label}
          </button>
        ))}
        <div className="sb-label">Tools</div>
        {PANELS.slice(3).map(p => (
          <button key={p.id} className={`sb-item ${panel === p.id ? 'active' : ''}`} onClick={() => setPanel(p.id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={p.icon} /></svg>
            {p.label}
          </button>
        ))}
        <div className="sb-bottom">
          <div className="sb-plan">
            <div className="sb-plan-name">Pro Dasher</div>
            <div className="sb-plan-desc">Unlimited AI · All cities</div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="main-area">
        <div className="main-topbar">
          <h2>{PANELS.find(p => p.id === panel)?.label}</h2>
          <span style={{ fontSize: 12, color: 'var(--gray)' }}>{savedCity || 'Set your city →'}</span>
        </div>
        <div className="main-body">

          {/* ── OVERVIEW ── */}
          {panel === 'overview' && (
            <>
              <div className="metrics-row">
                <div className="metric-card"><div className="metric-label">Best shift today</div><div className="metric-val">Fri dinner</div><div className="metric-sub">4:30–9 PM · Your top zone</div></div>
                <div className="metric-card"><div className="metric-label">Est. today</div><div className="metric-val clr-green">$90–120</div><div className="metric-sub">Working dinner shift</div></div>
                <div className="metric-card"><div className="metric-label">Your city</div><div className="metric-val" style={{ fontSize: 16, paddingTop: 4 }}>{savedCity || '—'}</div><div className="metric-sub">{savedCity ? 'Market loaded' : 'Set in Zone map'}</div></div>
                <div className="metric-card"><div className="metric-label">Weekly target</div><div className="metric-val clr-green">$290–370</div><div className="metric-sub">18–22h recommended</div></div>
              </div>
              <div className="dash-card">
                <h3>🔥 Your best shift this week</h3>
                <p style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.65, marginBottom: 10 }}>
                  Friday dinner (4:30–9 PM) is the single highest-earning shift of the week in virtually every US market. Position yourself near your city's densest restaurant cluster before 4:30 PM. Orders stack almost immediately when the rush hits.
                </p>
                <div className="tip-box"><strong>Action:</strong> Use the Zone map panel to get AI-generated zone rankings for your specific city. Then position yourself in Zone 1 before your shift starts.</div>
              </div>
              <div className="dash-card">
                <h3>📋 New dasher checklist</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Download Stride app for automatic mileage tracking',
                    'Buy an insulated delivery bag ($20–30)',
                    'Set minimum order threshold ($7+ to accept)',
                    'Open a separate bank account for Dasher income',
                    'Set your city in the Zone map panel',
                    'Do your first real shift: Friday 4:30–9 PM',
                    'Set aside 28% of every payout for taxes',
                  ].map(item => (
                    <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer', padding: 8, borderRadius: 8 }}>
                      <input type="checkbox" style={{ accentColor: 'var(--green)', width: 15, height: 15 }} />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── ZONES ── */}
          {panel === 'zones' && (
            <>
              <div className="dash-card">
                <h3>🗺️ Get your local market guide</h3>
                <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 16, lineHeight: 1.5 }}>
                  Enter any US city where DoorDash operates. Our AI will generate zone rankings, peak times, and local tips specific to your market.
                </p>
                <div className="city-wrap">
                  <span className="city-icon">📍</span>
                  <input
                    className="city-input"
                    type="text"
                    placeholder="e.g. Austin TX, Chicago IL, Miami FL..."
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchGuide()}
                  />
                </div>
                <button className="city-btn" onClick={fetchGuide} disabled={guideLoading || !city.trim()}>
                  {guideLoading ? 'Generating your market guide...' : 'Get my market guide →'}
                </button>
                {guideError && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 10 }}>{guideError}</p>}
              </div>

              {guideLoading && (
                <div className="dash-card">
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div className="loading-shimmer" style={{ width: '60%', marginBottom: 6 }} />
                      <div className="loading-shimmer" style={{ width: '90%' }} />
                    </div>
                  ))}
                </div>
              )}

              {guide && !guideLoading && (
                <div className="market-guide">
                  <div className="metrics-row">
                    <div className="metric-card"><div className="metric-label">Market</div><div className="metric-val" style={{ fontSize: 16 }}>{guide.city}</div></div>
                    <div className="metric-card"><div className="metric-label">Rating</div><div className={`metric-val ${guide.marketRating === 'Strong' ? 'clr-green' : ''}`}>{guide.marketRating}</div></div>
                    <div className="metric-card"><div className="metric-label">Best shift</div><div className="metric-val" style={{ fontSize: 14 }}>{guide.peakTimes?.bestShift}</div></div>
                    <div className="metric-card"><div className="metric-label">Min order</div><div className="metric-val">${guide.orderThreshold?.minimum}</div></div>
                  </div>

                  <div className="dash-card">
                    <h3>📍 Your earning zones</h3>
                    {guide.zones?.map(z => (
                      <div key={z.rank} className="zone-row">
                        <div className="zone-rank">{z.rank}</div>
                        <div>
                          <div className="zone-name">{z.name}</div>
                          <div className="zone-desc">{z.description}</div>
                          <div className="zone-tags">
                            <span className={`ztag ${z.tier === 'hot' ? 'z-hot' : z.tier === 'warm' ? 'z-warm' : 'z-ok'}`}>
                              {z.tier === 'hot' ? '🔥 Top zone' : z.tier === 'warm' ? '⭐ Good zone' : '✓ Decent zone'}
                            </span>
                            {z.tags?.map(tag => <span key={tag} className="ztag z-ok">{tag}</span>)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="dash-card">
                    <h3>⏰ Peak times for {guide.city}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { label: 'Lunch window', val: guide.peakTimes?.lunchWindow },
                        { label: 'Dinner window', val: guide.peakTimes?.dinnerWindow },
                        { label: 'Best day', val: guide.peakTimes?.bestDay },
                        { label: 'Weekend pattern', val: guide.peakTimes?.weekendNote },
                      ].map(row => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-mid)', fontSize: 13 }}>
                          <span style={{ color: 'var(--gray)' }}>{row.label}</span>
                          <span style={{ fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>{row.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="dash-card">
                    <h3>💡 Local tips for {guide.city}</h3>
                    {guide.tips?.map((tip, i) => (
                      <div key={i} className="tip-box" style={{ marginBottom: 8 }}>{tip}</div>
                    ))}
                    {guide.marketNotes && <p style={{ fontSize: 13, color: 'var(--gray)', marginTop: 12, lineHeight: 1.6 }}>{guide.marketNotes}</p>}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── SCHEDULE ── */}
          {panel === 'schedule' && (
            <div className="dash-card">
              <h3>📅 Weekly schedule — optimized for your market</h3>
              {!savedCity && <div className="warn-box" style={{ marginBottom: 16 }}>Set your city in the Zone map panel to get a market-specific schedule.</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {schedule.map(day => (
                  <div key={day.day} style={{ background: 'var(--gray-light)', borderRadius: 11, border: day.best ? '2px solid var(--green)' : 'none', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, minWidth: 74 }}>{day.day}</span>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i <= day.dots ? 'var(--green)' : 'var(--gray-mid)' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--gray)', marginLeft: 'auto' }}>Est {day.est}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 14px 12px' }}>
                      {day.shifts.map(s => (
                        <span key={s.label} className={`ztag ${shiftClass[s.tier]}`}>{s.label}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── GRADER ── */}
          {panel === 'grader' && (
            <>
              <div className="dash-card">
                <h3>✅ Order grader</h3>
                <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 16 }}>Enter order details for an instant accept/decline verdict.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div className="inp-group"><label>Order pay ($)</label><input type="number" placeholder="e.g. 8.50" value={gPay} onChange={e => setGPay(e.target.value)} /></div>
                  <div className="inp-group"><label>Distance (miles)</label><input type="number" placeholder="e.g. 3.2" value={gMiles} onChange={e => setGMiles(e.target.value)} /></div>
                  <div className="inp-group"><label>Pickup wait (min)</label><input type="number" placeholder="e.g. 5" value={gWait} onChange={e => setGWait(e.target.value)} /></div>
                  <div className="inp-group"><label>Drive time (min)</label><input type="number" placeholder="e.g. 12" value={gTime} onChange={e => setGTime(e.target.value)} /></div>
                </div>
                <button onClick={gradeOrder} disabled={!gPay || !gMiles} style={{ padding: '12px 22px', background: 'var(--black)', color: 'var(--white)', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 500 }}>Grade this order →</button>
                {verdict && (
                  <div style={{ marginTop: 16, padding: '16px 18px', borderRadius: 12, background: verdict.type === 'accept' ? 'var(--green-light)' : verdict.type === 'decline' ? '#fef2f2' : 'var(--amber-light)', border: `1.5px solid ${verdict.type === 'accept' ? 'var(--green)' : verdict.type === 'decline' ? '#fca5a5' : '#fcd34d'}` }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 5, color: verdict.type === 'accept' ? 'var(--green-dark)' : verdict.type === 'decline' ? 'var(--red)' : 'var(--amber)' }}>{verdict.head}</div>
                    <div style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.6, marginBottom: 8 }}>{verdict.detail}</div>
                    <div style={{ fontSize: 12, padding: '8px 12px', background: 'rgba(0,0,0,.05)', borderRadius: 7 }}>{verdict.math}</div>
                  </div>
                )}
              </div>
              <div className="dash-card">
                <h3>📏 Your order rules</h3>
                {[['Minimum $/mile', '$2.00', 'var(--green)'], ['Target $/mile', '$2.50+', 'var(--green)'], ['Auto-decline pay under', '$7.00', 'var(--red)'], ['Auto-decline distance over', '8 miles for under $10', 'var(--red)']].map(([l,v,c]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--gray-mid)', fontSize: 13 }}>
                    <span style={{ color: 'var(--gray)' }}>{l}</span><span style={{ fontWeight: 600, color: c }}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── AI COACH ── */}
          {panel === 'coach' && (
            <div className="dash-card">
              <h3>🤖 AI strategy coach — powered by Claude</h3>
              <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 14 }}>Ask anything about your market, strategy, or earnings. Real AI, real answers.</p>
              <div className="quick-btns">
                {['Best zones tonight?', 'Should I dash in rain?', 'How to maximize tips?', 'Slow period strategy?', `Taxes in my state?`].map(q => (
                  <button key={q} className="qbtn" onClick={() => { setChatInput(q); setTimeout(sendChat, 50) }}>{q}</button>
                ))}
              </div>
              <div className="chat-wrap" ref={chatRef}>
                {chatHistory.map((m, i) => (
                  <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'ai'}`}>{m.content}</div>
                ))}
                {chatLoading && <div className="msg ai thinking">Thinking...</div>}
              </div>
              <div className="chat-input-row">
                <input className="chat-inp" type="text" placeholder={`Ask your coach anything${savedCity ? ` about ${savedCity}` : ''}...`} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} />
                <button className="chat-send" onClick={sendChat} disabled={chatLoading || !chatInput.trim()}>Send</button>
              </div>
            </div>
          )}

          {/* ── SHIFT FORECAST ── */}
          {panel === 'forecast' && (
            <>
              <div className="dash-card">
                <h3>⚡ Shift earnings forecast</h3>
                <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 20, lineHeight: 1.5 }}>
                  Pick a day and shift window — AI predicts your earnings range based on your city's demand patterns.
                </p>

                {/* Day picker */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 12, color: 'var(--gray)', fontWeight: 500, marginBottom: 8 }}>Day</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {DAYS.map(d => (
                      <button key={d} onClick={() => setFcDay(d)} style={{
                        padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, border: 'none',
                        background: fcDay === d ? 'var(--black)' : 'var(--gray-light)',
                        color: fcDay === d ? 'var(--white)' : 'var(--black)',
                        cursor: 'pointer', transition: 'all .15s',
                      }}>{d.slice(0, 3)}</button>
                    ))}
                  </div>
                </div>

                {/* Time pickers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                  <div className="inp-group">
                    <label>Shift start</label>
                    <select value={fcStart} onChange={e => setFcStart(e.target.value)}
                      style={{ padding: '11px 13px', border: '1.5px solid var(--gray-mid)', borderRadius: 9, fontSize: 14, background: 'var(--white)', outline: 'none' }}>
                      {TIMES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="inp-group">
                    <label>Shift end</label>
                    <select value={fcEnd} onChange={e => setFcEnd(e.target.value)}
                      style={{ padding: '11px 13px', border: '1.5px solid var(--gray-mid)', borderRadius: 9, fontSize: 14, background: 'var(--white)', outline: 'none' }}>
                      {TIMES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {!savedCity && <div className="warn-box" style={{ marginBottom: 14 }}>Set your city in Zone map for a city-specific forecast.</div>}

                <button onClick={runForecast} disabled={fcLoading}
                  style={{ width: '100%', padding: 13, background: 'var(--green)', color: 'var(--white)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                  {fcLoading ? 'Forecasting your shift...' : `Forecast ${fcDay} ${fcStart} – ${fcEnd} →`}
                </button>
                {fcError && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 10 }}>{fcError}</p>}
              </div>

              {fcResult && (
                <>
                  {/* Earnings range */}
                  <div className="dash-card">
                    <h3>📊 Earnings forecast — {fcDay} {fcStart}–{fcEnd}{savedCity ? ` · ${savedCity}` : ''}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                      {[
                        { label: 'Conservative', val: `$${fcResult.low}`, color: 'var(--amber)' },
                        { label: 'Realistic', val: `$${fcResult.mid}`, color: 'var(--green)' },
                        { label: 'Best case', val: `$${fcResult.high}`, color: 'var(--green-dark)' },
                      ].map(({ label, val, color }) => (
                        <div key={label} style={{ background: 'var(--gray-light)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--gray)', marginBottom: 6 }}>{label}</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color, letterSpacing: '-.03em' }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '12px 14px', background: 'var(--green-light)', borderRadius: 10, fontSize: 13, color: 'var(--green-dark)', fontWeight: 500, marginBottom: 12 }}>
                      {fcResult.verdict}
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 180, background: 'var(--gray-light)', borderRadius: 10, padding: 14 }}>
                        <div style={{ fontSize: 11, color: 'var(--gray)', marginBottom: 4 }}>Best zone to start</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{fcResult.bestZone}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 180, background: 'var(--gray-light)', borderRadius: 10, padding: 14 }}>
                        <div style={{ fontSize: 11, color: 'var(--gray)', marginBottom: 4 }}>Peak window</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{fcResult.peakWindow}</div>
                      </div>
                    </div>
                  </div>

                  {/* Tips + warning */}
                  <div className="dash-card">
                    <h3>💡 Tips for this shift</h3>
                    {fcResult.tips?.map((tip, i) => (
                      <div key={i} className="tip-box" style={{ marginBottom: 8 }}>{tip}</div>
                    ))}
                    {fcResult.warning && (
                      <div className="warn-box" style={{ marginTop: 8 }}>⚠️ {fcResult.warning}</div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── EARNINGS ── */}
          {panel === 'earnings' && (
            <div className="dash-card">
              <h3>💰 Earnings estimator</h3>
              {[
                { key: 'hrs', label: 'Hours per week', min: 5, max: 40, step: 1, fmt: v => `${v}h` },
                { key: 'ord', label: 'Avg order value', min: 5, max: 18, step: 0.5, fmt: v => `$${parseFloat(v).toFixed(2)}` },
                { key: 'oph', label: 'Orders per hour', min: 1, max: 4, step: 0.5, fmt: v => parseFloat(v).toFixed(1) },
                { key: 'pk',  label: '% peak hours',   min: 0, max: 100, step: 5, fmt: v => `${v}%` },
                { key: 'gas', label: 'Gas cost/week',   min: 10, max: 80, step: 5, fmt: v => `$${v}` },
              ].map(s => (
                <div key={s.key} className="slider-row">
                  <span className="slider-label">{s.label}</span>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={sliders[s.key]} onChange={e => setSliders(p => ({ ...p, [s.key]: e.target.value }))} />
                  <span className="slider-val">{s.fmt(sliders[s.key])}</span>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10, marginTop: 6 }}>
                {[['Gross weekly', `$${gross.toLocaleString()}`, ''], ['Net weekly', `$${net.toLocaleString()}`, 'clr-green'], ['Effective $/hr', `$${effHr}`, 'clr-green'], ['Monthly est.', `$${monthly.toLocaleString()}`, 'clr-green']].map(([l,v,c]) => (
                  <div key={l} style={{ background: 'var(--gray-light)', borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, color: 'var(--gray)', marginBottom: 4 }}>{l}</div>
                    <div className={`metric-val ${c}`} style={{ fontSize: 22 }}>{v}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--gray)', marginTop: 12 }}>* Set aside 28% for self-employment taxes. Estimates only — actual results vary.</p>
            </div>
          )}

          {/* ── TAX ── */}
          {panel === 'tax' && (
            <div className="dash-card">
              <h3>🧾 Tax dashboard</h3>
              <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 16, lineHeight: 1.5 }}>As an independent contractor, you owe self-employment + federal income tax. Track your mileage — every mile saves you ~$0.19 in taxes.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                {[['Gross earnings this period ($)', taxGross, setTaxGross, '2000'], ['Miles driven this period', taxMiles, setTaxMiles, '400']].map(([label, val, setter, ph]) => (
                  <div key={label} className="inp-group"><label>{label}</label><input type="number" placeholder={ph} value={val} onChange={e => setter(e.target.value)} /></div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
                {[['Mileage deduction', `$${tDeduction}`, 'clr-green', 'At $0.67/mile (2024 IRS rate)'], ['Taxable income', `$${tTaxable}`, '', 'After mileage deduction'], ['Set aside (28%)', `$${tSetAside.toLocaleString()}`, 'clr-red', 'SE tax + federal estimate'], ['Take-home estimate', `$${tTakeHome.toLocaleString()}`, 'clr-green', 'Net after taxes & deductions']].map(([l,v,c,note]) => (
                  <div key={l} style={{ background: 'var(--gray-light)', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 6 }}>{l}</div>
                    <div className={`metric-val ${c}`} style={{ fontSize: 22 }}>{v}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 4 }}>{note}</div>
                  </div>
                ))}
              </div>
              <div className="tip-box" style={{ marginTop: 14 }}>💡 File quarterly estimated taxes (Jan 15, Apr 15, Jun 15, Sep 15) using IRS Form 1040-ES to avoid underpayment penalties. Use the Stride app to track mileage automatically every shift.</div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
