'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { getSupabase } from '../../lib/supabase'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  const next = searchParams.get('next')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = getSupabase()
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    if (plan) {
      const { data: { session } } = await getSupabase().auth.getSession()
      if (session?.access_token) {
        const res = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ planKey: plan }),
        })
        const { url } = await res.json()
        if (url) { window.location.href = url; return }
      }
    }

    router.push(next || '/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-light)', padding: '24px' }}>
      <div style={{ background: 'var(--white)', borderRadius: 16, padding: '40px 36px', maxWidth: 420, width: '100%', boxShadow: '0 4px 32px rgba(0,0,0,.08)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--black)' }}>DasherPro</span>
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 6, color: 'var(--black)' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray)', marginBottom: 28, lineHeight: 1.6 }}>
          Sign in to your DasherPro account.
        </p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding: '13px 16px', border: '1.5px solid var(--gray-mid)', borderRadius: 10, fontSize: 14, outline: 'none', background: 'var(--white)' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ padding: '13px 16px', border: '1.5px solid var(--gray-mid)', borderRadius: 10, fontSize: 14, outline: 'none', background: 'var(--white)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--gray)', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>
          {error && (
            <p style={{ color: 'var(--red)', fontSize: 13, margin: 0 }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '14px', background: 'var(--green)', color: 'var(--white)', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray)', marginTop: 20 }}>
          Don&apos;t have an account?{' '}
          <Link href={`/signup${plan ? `?plan=${plan}` : next ? `?next=${next}` : ''}`} style={{ color: 'var(--green)', fontWeight: 500 }}>
            Start free trial
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
