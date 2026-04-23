'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const switchLocale = () => {
    const next = locale === 'ar' ? 'he' : 'ar'
    router.push(pathname.replace(`/${locale}`, `/${next}`))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push(`/${locale}`)
    router.refresh()
  }

  return (
    <>
      <nav className="navbar">
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <Link href={`/${locale}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#0EA5E9', fontFamily: 'Cairo, sans-serif', letterSpacing: '-0.5px' }}>ديرتي</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <>
                <Link href={`/${locale}/add-listing`} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
                  {t('add_listing')}
                </Link>
                <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: '1.5px solid var(--gray-200)', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" fill="none" stroke="var(--gray-700)" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link href={`/${locale}/login`} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>
                  {t('login')}
                </Link>
                <Link href={`/${locale}/register`} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
                  {t('register')}
                </Link>
              </>
            )}
            <button onClick={switchLocale} style={{ background: 'var(--gray-100)', border: '1.5px solid var(--gray-200)', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo, sans-serif' }}>
              {locale === 'ar' ? 'ע' : 'ع'}
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && user && (
        <div style={{ position: 'fixed', top: 64, insetInlineEnd: 16, background: 'white', border: '1px solid var(--gray-100)', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200, minWidth: 180, overflow: 'hidden' }}>
          <Link href={`/${locale}/my-listings`} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '14px 18px', fontSize: 14, fontWeight: 600, color: 'var(--gray-700)', borderBottom: '1px solid var(--gray-100)' }}>
            {t('my_listings')}
          </Link>
          <button onClick={handleLogout} style={{ display: 'block', width: '100%', padding: '14px 18px', fontSize: 14, fontWeight: 600, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'inherit', fontFamily: 'Cairo, sans-serif' }}>
            {t('logout')}
          </button>
        </div>
      )}
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />}
    </>
  )
}
