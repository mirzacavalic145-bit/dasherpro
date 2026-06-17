'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabase } from '../../lib/supabase'

function UpdatePasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const { error: updateError } = await getSupabase().auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-light)', padding: '24px' }}>
      <div style={{ background: 'var(--white)', borderRadius: 16, padding: '40px 36px', maxWidth: 420, width: '100%', boxShadow: '0 4px 32px rgba(0,0,0,.08)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--black)' }}>DasherPro</span>
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 6, color: 'var(--black)' }}>
          Set new password
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray)', marginBottom: 28, lineHeight: 1.6 }}>
          Choose a strong password for your account.
        </p>

        {done ? (
          <div style={{ background: 'var(--green-light)', border: '1px solid var(--green)', borderRadius: 10, padding: '16px', fontSize: 14, color: 'var(--green-dark)' }}>
            ✓ Password updated! Taking you to the dashboard...
          </div>
        ) : (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="password"
              placeholder="New password (min 8 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              style={{ padding: '13px 16px', border: '1.5px solid var(--gray-mid)', borderRadius: 10, fontSize: 14, outline: 'none', background: 'var(--white)' }}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              style={{ padding: '13px 16px', border: '1.5px solid var(--gray-mid)', borderRadius: 10, fontSize: 14, outline: 'none', background: 'var(--white)' }}
            />
            {error && (
              <p style={{ color: 'var(--red)', fontSize: 13, margin: 0 }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '14px', background: 'var(--green)', color: 'var(--white)', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Updating...' : 'Update password →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function UpdatePasswordPage() {
  return (
    <Suspense>
      <UpdatePasswordForm />
    </Suspense>
  )
}
