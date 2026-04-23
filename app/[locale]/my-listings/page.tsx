import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Listing } from '@/types'
import { LISTING_TYPES } from '@/types'
import Image from 'next/image'

export default async function MyListingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const statusLabel: Record<string, { ar: string; he: string; cls: string }> = {
    pending:  { ar: 'قيد المراجعة', he: 'ממתין לבדיקה', cls: 'status-pending' },
    active:   { ar: 'نشط',          he: 'פעיל',         cls: 'status-active' },
    rejected: { ar: 'مرفوض',        he: 'נדחה',         cls: 'status-rejected' },
    expired:  { ar: 'منتهي',        he: 'פג תוקף',      cls: 'status-expired' },
  }

  const handleDelete = async (id: string) => {
    'use server'
    const sb = await createClient()
    await sb.from('listings').delete().eq('id', id)
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--off-white)', paddingBottom: 80 }}>
        <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-100)', padding: '32px 0 28px' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: 4 }}>
                {locale === 'ar' ? 'إعلاناتي' : 'המודעות שלי'}
              </h1>
              <p style={{ color: 'var(--gray-500)' }}>
                {listings?.length ?? 0} {locale === 'ar' ? 'إعلان' : 'מודעות'}
              </p>
            </div>
            <Link href={`/${locale}/add-listing`} className="btn btn-primary">
              {locale === 'ar' ? '+ إعلان جديد' : '+ מודעה חדשה'}
            </Link>
          </div>
        </div>

        <div className="container" style={{ paddingTop: 32 }}>
          {!listings || listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-400)' }}>
              <p style={{ fontSize: 18, marginBottom: 16 }}>
                {locale === 'ar' ? 'لا توجد إعلانات بعد' : 'אין מודעות עדיין'}
              </p>
              <Link href={`/${locale}/add-listing`} className="btn btn-primary">
                {locale === 'ar' ? 'انشر أول إعلان' : 'פרסם מודעה ראשונה'}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {listings.map((listing) => {
                const l = listing as Listing
                const st = statusLabel[l.status] ?? statusLabel.pending
                const firstPhoto = l.photos?.[0]
                const photoUrl = firstPhoto
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-photos/${firstPhoto}`
                  : null
                const typeLabel = LISTING_TYPES.find(t => t.value === l.listing_type)

                return (
                  <div key={l.id} style={{
                    background: 'var(--white)',
                    border: '1px solid var(--gray-100)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr auto',
                    gap: 20,
                    alignItems: 'center',
                  }}>
                    {/* Thumbnail */}
                    <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--blue-50)', flexShrink: 0 }}>
                      {photoUrl ? (
                        <Image src={photoUrl} alt={l.title} width={80} height={80} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, opacity: 0.3 }}>&#x1F3E0;</div>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                        <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--gray-900)' }}>{l.title}</h3>
                        <span className={`badge ${st.cls}`} style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99 }}>
                          {locale === 'ar' ? st.ar : st.he}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4 }}>
                        {l.city}{l.neighborhood ? ` — ${l.neighborhood}` : ''}
                        {' · '}
                        {locale === 'ar' ? typeLabel?.label : typeLabel?.labelHe}
                        {' · '}
                        {l.rooms} {locale === 'ar' ? 'غرف' : 'חדרים'}
                      </p>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--navy)' }}>
                        ₪{l.price.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--gray-400)', fontFamily: 'var(--font-body)' }}>/ {locale === 'ar' ? 'شهر' : 'חודש'}</span>
                      </p>
                      {l.status === 'rejected' && l.rejection_reason && (
                        <p style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>
                          {locale === 'ar' ? 'سبب الرفض: ' : 'סיבת הדחייה: '}{l.rejection_reason}
                        </p>
                      )}
                      <p className="text-muted" style={{ marginTop: 4 }}>
                        {l.views} {locale === 'ar' ? 'مشاهدة' : 'צפיות'}
                        {' · '}
                        {locale === 'ar' ? 'ينتهي' : 'פג'}: {new Date(l.expires_at).toLocaleDateString(locale === 'ar' ? 'ar-IL' : 'he-IL')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                      {l.status === 'active' && (
                        <Link href={`/${locale}/listings/${l.id}`} className="btn btn-outline" style={{ fontSize: 13, padding: '7px 14px' }}>
                          {locale === 'ar' ? 'عرض' : 'צפה'}
                        </Link>
                      )}
                      <form action={handleDelete.bind(null, l.id)}>
                        <button type="submit" className="btn" style={{ fontSize: 13, padding: '7px 14px', color: '#dc2626', borderColor: '#fecaca' }}>
                          {locale === 'ar' ? 'حذف' : 'מחק'}
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
