'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(locale === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'אימייל או סיסמה שגויים')
    } else {
      router.push(`/${locale}`)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href={`/${locale}`}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--navy)', fontWeight: 600 }}>ديرتي</span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-body)', fontSize: 20, fontWeight: 600, marginTop: 20, color: 'var(--gray-800)' }}>
            {t('login_title')}
          </h1>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: 16 }}>
          <div className="form-group">
            <label>{t('email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label>{t('password')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" minLength={8} />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '13px', fontSize: 15, marginTop: 4 }}>
            {loading ? '...' : t('login_btn')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--gray-500)' }}>
          {t('no_account')}{' '}
          <Link href={`/${locale}/register`} style={{ color: 'var(--blue-600)', fontWeight: 500 }}>
            {t('register')}
          </Link>
        </p>
      </div>
    </main>
  )
}
