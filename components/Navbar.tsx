'use client'

import { useTranslations, useLocale } from 'next-intl'
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
    const newPath = pathname.replace(`/${locale}`, `/${next}`)
    router.push(newPath)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push(`/${locale}`)
    router.refresh()
  }

  return (
    <nav className="navbar">
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link href={`/${locale}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34,
            background: 'var(--navy)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>د</span>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', letterSpacing: '-0.01em' }}>
            ديرتي
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="nav-desktop">
          <Link href={`/${locale}/listings`} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 14 }}>
            {t('listings')}
          </Link>
          {user ? (
            <>
              <Link href={`/${locale}/add-listing`} className="btn btn-blue" style={{ padding: '8px 16px', fontSize: 14 }}>
                {t('add_listing')}
              </Link>
              <Link href={`/${locale}/my-listings`} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 14 }}>
                {t('my_listings')}
              </Link>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 14 }}>
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link href={`/${locale}/login`} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 14 }}>
                {t('login')}
              </Link>
              <Link href={`/${locale}/register`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 14 }}>
                {t('register')}
              </Link>
            </>
          )}
          <button onClick={switchLocale} style={{
            background: 'var(--gray-100)', border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-md)', padding: '7px 12px',
            fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', cursor: 'pointer',
          }}>
            {locale === 'ar' ? 'עב' : 'ع'}
          </button>
        </div>

        {/* Mobile: lang + hamburger */}
        <div className="nav-mobile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={switchLocale} style={{
            background: 'var(--gray-100)', border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-md)', padding: '6px 10px',
            fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', cursor: 'pointer',
          }}>
            {locale === 'ar' ? 'עב' : 'ع'}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none', border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)', padding: '7px 10px',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4,
            }}
          >
            <span style={{ width: 18, height: 2, background: 'var(--navy)', display: 'block', borderRadius: 2 }} />
            <span style={{ width: 18, height: 2, background: 'var(--navy)', display: 'block', borderRadius: 2 }} />
            <span style={{ width: 18, height: 2, background: 'var(--navy)', display: 'block', borderRadius: 2 }} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: 'var(--nav-height)', insetInlineStart: 0, insetInlineEnd: 0,
          background: 'var(--white)', borderBottom: '1px solid var(--gray-100)',
          boxShadow: 'var(--shadow-md)', zIndex: 200,
          display: 'flex', flexDirection: 'column', padding: '12px 16px', gap: 8,
        }}>
          <Link href={`/${locale}/listings`} className="btn btn-outline" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'center' }}>
            {t('listings')}
          </Link>
          {user ? (
            <>
              <Link href={`/${locale}/add-listing`} className="btn btn-blue" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'center' }}>
                {t('add_listing')}
              </Link>
              <Link href={`/${locale}/my-listings`} className="btn btn-outline" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'center' }}>
                {t('my_listings')}
              </Link>
              <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%' }}>
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link href={`/${locale}/login`} className="btn btn-outline" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'center' }}>
                {t('login')}
              </Link>
              <Link href={`/${locale}/register`} className="btn btn-primary" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'center' }}>
                {t('register')}
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-desktop { display: flex !important; }
          .nav-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  )
}

