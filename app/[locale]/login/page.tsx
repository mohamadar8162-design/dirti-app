'use client'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
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
    if (error) setError(locale === 'ar' ? 'البريد أو كلمة المرور غير صحيحة' : 'אימייל או סיסמה שגויים')
    else { router.push(`/${locale}`); router.refresh() }
    setLoading(false)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href={`/${locale}`}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#0EA5E9', fontFamily: 'Cairo, sans-serif' }}>ديرتي</span>
          </Link>
          <p style={{ fontSize: 18, fontWeight: 700, marginTop: 16, color: 'var(--gray-900)' }}>
            {locale === 'ar' ? 'تسجيل الدخول' : 'כניסה'}
          </p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'grid', gap: 14 }}>
          <div className="form-group">
            <label>{locale === 'ar' ? 'البريد الإلكتروني' : 'אימייל'}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label>{locale === 'ar' ? 'كلمة المرور' : 'סיסמה'}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="current-password" />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '13px', fontSize: 15, marginTop: 4 }}>
            {loading ? '...' : (locale === 'ar' ? 'دخول' : 'כניסה')}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--gray-500)' }}>
          {locale === 'ar' ? 'ليس لديك حساب؟' : 'אין לך חשבון?'}{' '}
          <Link href={`/${locale}/register`} style={{ color: '#0EA5E9', fontWeight: 600 }}>
            {locale === 'ar' ? 'إنشاء حساب' : 'הרשמה'}
          </Link>
        </p>
      </div>
    </div>
  )
}
