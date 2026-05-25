'use client'
import Link from 'next/link'
import { PLANS } from '../lib/stripe'

export default function HomePage() {
  const handleCheckout = async (planKey) => {
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planKey }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <span className="logo-dot" />
            DasherPro
          </Link>
          <div className="nav-links">
            <button className="nav-link" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>Features</button>
            <button className="nav-link" onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}>Pricing</button>
            <Link href="/dashboard" className="nav-cta">Open App →</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-tag">🚗 Available for every DoorDash market in the US</div>
        <h1>Dash smarter.<br /><em>Earn more.</em></h1>
        <p className="hero-sub">
          The AI-powered tool that tells you when to dash, where to position,
          and which orders to take — personalized to your exact city.
        </p>
        <div className="hero-btns">
          <Link href="/dashboard" className="btn-primary">Try the app free →</Link>
          <button className="btn-secondary" onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}>See pricing</button>
        </div>
        <div className="hero-stats">
          <div>
            <div className="hero-stat-num" style={{ color: 'var(--green)' }}>4,000+</div>
            <div className="hero-stat-label">US cities supported</div>
          </div>
          <div>
            <div className="hero-stat-num">2–3×</div>
            <div className="hero-stat-label">More $/hr at peak windows</div>
          </div>
          <div>
            <div className="hero-stat-num">AI</div>
            <div className="hero-stat-label">Strategy coach for your city</div>
          </div>
          <div>
            <div className="hero-stat-num" style={{ color: 'var(--green)' }}>$14.99</div>
            <div className="hero-stat-label">Less than 1 hour of dashing</div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="section" id="features">
        <div className="section-eyebrow">What you get</div>
        <div className="section-h">Everything you need<br />to max your earnings</div>
        <div className="feat-grid">
          {[
            { icon: '🗺️', title: 'Local zone intelligence', desc: 'Enter your city and get AI-generated zone rankings, hotspot locations, and positioning tips specific to your market. Works for any US city.' },
            { icon: '⏰', title: 'Peak time tracker', desc: 'A weekly heat map showing exactly when to be on the road in your area — and when to rest. Stop guessing, start earning more per hour.' },
            { icon: '🤖', title: 'AI strategy coach', desc: 'Powered by Claude AI. Ask anything — "should I take this order?", "what\'s my best zone tonight?", "how do I earn more on Sundays?" Real answers, instantly.' },
            { icon: '✅', title: 'Order grader', desc: 'Enter pay and miles. Get an instant accept/decline verdict with the math — $X/mile, effective hourly rate, and a clear recommendation.' },
            { icon: '💰', title: 'Earnings tracker', desc: 'Track your true $/hr after gas. Log orders, see weekly trends, and know exactly what\'s going in your pocket versus what\'s going to taxes.' },
            { icon: '🧾', title: 'Tax dashboard', desc: 'Mileage deduction calculator, quarterly tax estimates, and expense tracking. The #1 thing new dashers get wrong — we make it dead simple.' },
          ].map((f) => (
            <div key={f.title} className="feat-card">
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="social-band">
        <h2>Dashers are earning more</h2>
        <p className="social-sub">Real results from dashers across the US</p>
        <div className="testi-grid">
          {[
            { initials: 'MR', name: 'Marcus R.', role: 'Dallas TX · Pro Dasher', text: '"I was making $12/hr my first two weeks. After using DasherPro\'s zone map and schedule, I\'m consistently hitting $19–22/hr. The city intelligence feature is unlike anything else out there."' },
            { initials: 'JL', name: 'Janelle L.', role: 'Chicago IL · Hustler plan', text: '"The order grader stopped me from taking losing orders. I used to accept everything out of anxiety. Now I know exactly what a good order looks like and my hourly jumped by $5."' },
            { initials: 'TK', name: 'Trey K.', role: 'Atlanta GA · Annual plan', text: '"The AI coach is wild. I asked it what zones to hit on Saturday dinner in my city and it gave me a real breakdown with reasoning. Felt like talking to a veteran dasher who knows my market."' },
          ].map((t) => (
            <div key={t.name} className="testi">
              <div className="testi-text">{t.text}</div>
              <div className="testi-author">
                <div className="testi-avatar">{t.initials}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <div className="section" id="pricing" style={{ textAlign: 'center', maxWidth: 960 }}>
        <div className="section-eyebrow">Pricing</div>
        <div className="section-h">One hour of dashing<br />pays for a whole month</div>
        <div className="pricing-grid">
          {/* Hustler */}
          <div className="price-card">
            <div className="price-tier">Hustler</div>
            <div className="price-num">$7.99</div>
            <div className="price-period">per month</div>
            <ul className="price-features">
              {PLANS.hustler.features.map(f => <li key={f}><span className="chk">✓</span>{f}</li>)}
            </ul>
            <button className="price-btn pbtn-light" onClick={() => handleCheckout('hustler')}>Get started</button>
          </div>

          {/* Pro */}
          <div className="price-card popular">
            <div className="price-badge-wrap badge-pop">Most popular</div>
            <div className="price-tier">Pro Dasher</div>
            <div className="price-num">$14.99</div>
            <div className="price-period">per month</div>
            <ul className="price-features">
              {PLANS.pro.features.map(f => <li key={f}><span className="chk">✓</span>{f}</li>)}
            </ul>
            <button className="price-btn pbtn-dark" onClick={() => handleCheckout('pro')}>Start free trial</button>
          </div>

          {/* Annual */}
          <div className="price-card annual">
            <div className="price-badge-wrap" style={{ background: 'var(--green-dark)', color: 'var(--white)' }}>Best value — save $81/yr</div>
            <div className="price-tier">Pro Annual</div>
            <div className="price-num">$99</div>
            <div className="price-period">per year · <strong>$8.25/mo effective</strong></div>
            <ul className="price-features">
              {PLANS.annual.features.map(f => <li key={f}><span className="chk">✓</span>{f}</li>)}
            </ul>
            <button className="price-btn pbtn-green" onClick={() => handleCheckout('annual')}>Get annual deal</button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-band">
        <h2>Ready to earn what you're worth?</h2>
        <p>Join dashers across the US making smarter decisions every shift.</p>
        <Link href="/dashboard"><button className="btn-white">Open DasherPro free →</button></Link>
      </div>

      <footer>
        © {new Date().getFullYear()} DasherPro · Not affiliated with DoorDash, Inc. · Built for independent contractors.
      </footer>
    </>
  )
}
