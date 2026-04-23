'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
        },
      },
    })

    if (error) {
      setError(error.message)
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
            {t('register_title')}
          </h1>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'grid', gap: 16 }}>
          <div className="form-group">
            <label>{t('full_name')}</label>
            <input name="full_name" value={form.full_name} onChange={handleChange} required maxLength={60} autoComplete="name" />
          </div>
          <div className="form-group">
            <label>{t('phone')}</label>
            <input name="phone" value={form.phone} onChange={handleChange} required placeholder="05XXXXXXXX" autoComplete="tel" />
          </div>
          <div className="form-group">
            <label>{t('email')}</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label>{t('password')}</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} autoComplete="new-password" />
            <span className="text-muted">{locale === 'ar' ? '8 أحرف على الأقل' : 'לפחות 8 תווים'}</span>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '13px', fontSize: 15, marginTop: 4 }}>
            {loading ? '...' : t('register_btn')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--gray-500)' }}>
          {t('has_account')}{' '}
          <Link href={`/${locale}/login`} style={{ color: 'var(--blue-600)', fontWeight: 500 }}>
            {t('login')}
          </Link>
        </p>
      </div>
    </main>
  )
}
