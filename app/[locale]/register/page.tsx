'use client'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const locale = useLocale()
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name.trim(), phone: form.phone.trim() } },
    })
    if (error) setError(error.message)
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
            {locale === 'ar' ? 'إنشاء حساب جديد' : 'יצירת חשבון'}
          </p>
        </div>
        <form onSubmit={handleRegister} style={{ display: 'grid', gap: 14 }}>
          <div className="form-group">
            <label>{locale === 'ar' ? 'الاسم الكامل' : 'שם מלא'}</label>
            <input name="full_name" value={form.full_name} onChange={handleChange} required maxLength={60} autoComplete="name" />
          </div>
          <div className="form-group">
            <label>{locale === 'ar' ? 'رقم الهاتف' : 'מספר טלפון'}</label>
            <input name="phone" value={form.phone} onChange={handleChange} required placeholder="05XXXXXXXX" autoComplete="tel" />
          </div>
          <div className="form-group">
            <label>{locale === 'ar' ? 'البريد الإلكتروني' : 'אימייל'}</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label>{locale === 'ar' ? 'كلمة المرور' : 'סיסמה'}</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} autoComplete="new-password" />
            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{locale === 'ar' ? '8 أحرف على الأقل' : 'לפחות 8 תווים'}</span>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '13px', fontSize: 15, marginTop: 4 }}>
            {loading ? '...' : (locale === 'ar' ? 'إنشاء الحساب' : 'הרשמה')}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--gray-500)' }}>
          {locale === 'ar' ? 'لديك حساب؟' : 'יש לך חשבון?'}{' '}
          <Link href={`/${locale}/login`} style={{ color: '#0EA5E9', fontWeight: 600 }}>
            {locale === 'ar' ? 'دخول' : 'כניסה'}
          </Link>
        </p>
      </div>
    </div>
  )
}
