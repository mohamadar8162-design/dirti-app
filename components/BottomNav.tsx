'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const locale = useLocale()
  const pathname = usePathname()

  const items = [
    {
      href: `/${locale}`,
      label: locale === 'ar' ? 'الرئيسية' : 'בית',
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
      active: pathname === `/${locale}`,
    },
    {
      href: `/${locale}/listings`,
      label: locale === 'ar' ? 'بحث' : 'חיפוש',
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
      active: pathname.includes('/listings'),
    },
    {
      href: `/${locale}/add-listing`,
      label: locale === 'ar' ? 'أضف' : 'הוסף',
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
      active: pathname.includes('/add-listing'),
    },
    {
      href: `/${locale}/my-listings`,
      label: locale === 'ar' ? 'إعلاناتي' : 'שלי',
      icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      active: pathname.includes('/my-listings'),
    },
  ]

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <Link key={item.href} href={item.href} className={`bottom-nav-item${item.active ? ' active' : ''}`}>
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
