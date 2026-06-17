'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { getSupabase } from '../../lib/supabase'

function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await getSupabase().auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/update-password` }
    )

    setLoading(false)
    if (error) {
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-light)', padding: '24px' }}>
      <div style={{ background: 'var(--white)', borderRadius: 16, padding: '40px 36px', maxWidth: 420, width: '100%', boxShadow: '0 4px 32px rgba(0,0,0,.08)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--black)' }}>DasherPro</span>
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 6, color: 'var(--black)' }}>
          Reset your password
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray)', marginBottom: 28, lineHeight: 1.6 }}>
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {status === 'sent' ? (
          <div style={{ background: 'var(--green-light)', border: '1px solid var(--green)', borderRadius: 10, padding: '16px', fontSize: 14, color: 'var(--green-dark)', lineHeight: 1.6 }}>
            ✓ Check your email — reset link sent to <strong>{email}</strong>. It may take a minute to arrive.
          </div>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ padding: '13px 16px', border: '1.5px solid var(--gray-mid)', borderRadius: 10, fontSize: 14, outline: 'none', background: 'var(--white)' }}
            />
            {status === 'error' && (
              <p style={{ color: 'var(--red)', fontSize: 13, margin: 0 }}>Something went wrong — try again.</p>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '14px', background: 'var(--green)', color: 'var(--white)', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Sending...' : 'Send reset link →'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray)', marginTop: 20 }}>
          Remember it?{' '}
          <Link href="/login" style={{ color: 'var(--green)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  )
}
