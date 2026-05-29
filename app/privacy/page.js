import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — DasherPro',
  description: 'Privacy policy for DasherPro, the AI-powered DoorDash strategy tool.',
}

export default function PrivacyPage() {
  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <span className="logo-dot" />
            DasherPro
          </Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">← Back to home</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '56px 32px 80px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 8 }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--gray)', fontSize: 14, marginBottom: 48 }}>
          Last updated: May 29, 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 12 }}>
              1. Overview
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: '#333' }}>
              DasherPro ("we", "our", "the app") is a web-based strategy tool for DoorDash independent contractors.
              We are not affiliated with DoorDash, Inc. This policy explains what data we collect, how we use it,
              and how we protect it. We are committed to collecting as little data as possible.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 12 }}>
              2. Data We Collect
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  title: 'City name',
                  detail: 'When you enter or auto-detect your city in the Zone map, we store your city name in your browser\'s localStorage. This stays on your device. We also cache AI-generated market guides in our database (Supabase) indexed by city name only — no personal information is attached.',
                },
                {
                  title: 'AI coach messages',
                  detail: 'Messages you send to the AI coach are transmitted to Anthropic\'s API to generate responses. We do not store your chat history on our servers. Anthropic\'s privacy policy applies to message processing.',
                },
                {
                  title: 'Location data',
                  detail: 'If you tap the GPS button in Zone map, your device\'s location is used only to determine your city name. Raw coordinates are never sent to our servers or stored anywhere. Location access requires your explicit browser permission and can be denied at any time.',
                },
                {
                  title: 'Payment information',
                  detail: 'Payments are processed entirely by Stripe. We never see, store, or handle your card number or banking details. Stripe\'s privacy policy governs payment data. We receive only a subscription status confirmation.',
                },
                {
                  title: 'Usage data',
                  detail: 'We may collect basic anonymous usage metrics (page views, feature usage counts) through Vercel\'s built-in analytics. This data is aggregated and never linked to individual users.',
                },
              ].map(({ title, detail }) => (
                <div key={title} style={{ padding: '16px 20px', background: 'var(--gray-light)', borderRadius: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{title}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.7, color: '#555' }}>{detail}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 12 }}>
              3. Data We Do NOT Collect
            </h2>
            <ul style={{ fontSize: 15, lineHeight: 2, color: '#333', paddingLeft: 20 }}>
              <li>We do not require account creation or collect email addresses</li>
              <li>We do not collect your real name, address, or phone number</li>
              <li>We do not store GPS coordinates or precise location data</li>
              <li>We do not sell, rent, or share your data with third parties for marketing</li>
              <li>We do not use tracking cookies or advertising pixels</li>
              <li>We do not store your DoorDash credentials or account information</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 12 }}>
              4. Third-Party Services
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Anthropic', 'Powers AI coach and market guide generation. Messages are processed per Anthropic\'s usage policies.'],
                ['Stripe', 'Handles subscription payments. Card data never touches our servers.'],
                ['Supabase', 'Stores cached market guides (city name + AI-generated content only).'],
                ['Vercel', 'Hosts the application. May collect standard web server logs (IP, timestamp, page).'],
                ['OpenStreetMap Nominatim', 'Used for reverse geocoding (GPS → city name). No personal data sent.'],
              ].map(([name, desc]) => (
                <div key={name} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--gray-mid)', fontSize: 14 }}>
                  <span style={{ fontWeight: 600, minWidth: 160, color: 'var(--black)' }}>{name}</span>
                  <span style={{ color: '#555', lineHeight: 1.6 }}>{desc}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 12 }}>
              5. Data Retention
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: '#333' }}>
              City-based market guides are cached for up to 30 days to reduce API costs. After 30 days, guides
              are regenerated fresh. Your city preference stored in localStorage can be cleared at any time by
              clearing your browser data. We do not retain chat history or order grader inputs.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 12 }}>
              6. Children's Privacy
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: '#333' }}>
              DasherPro is intended for adults (18+) who are independent contractors. We do not knowingly
              collect data from anyone under 18.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 12 }}>
              7. Changes to This Policy
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: '#333' }}>
              We may update this policy as the app evolves. Changes will be posted on this page with an updated
              date. Continued use of DasherPro after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 12 }}>
              8. Contact
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: '#333' }}>
              Questions about this policy? Email us at{' '}
              <a href="mailto:mirzacavalic145@gmail.com" style={{ color: 'var(--green)', fontWeight: 500 }}>
                mirzacavalic145@gmail.com
              </a>
            </p>
          </section>

        </div>

        <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid var(--gray-mid)', fontSize: 13, color: 'var(--gray)' }}>
          DasherPro is not affiliated with DoorDash, Inc. DoorDash and Dasher are trademarks of DoorDash, Inc.
        </div>
      </div>

      <footer>
        © {new Date().getFullYear()} DasherPro · <Link href="/privacy" style={{ color: 'var(--gray)' }}>Privacy Policy</Link> · Not affiliated with DoorDash, Inc.
      </footer>
    </>
  )
}
