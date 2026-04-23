import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import Image from 'next/image'
import type { Listing } from '@/types'
import { CITIES, LISTING_TYPES } from '@/types'

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ city?: string; type?: string; rooms?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(12)

  if (sp.city) query = query.eq('city', sp.city)
  if (sp.type) query = query.eq('listing_type', sp.type)
  if (sp.rooms) query = query.gte('rooms', parseFloat(sp.rooms))

  const { data: listings } = await query
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  const typeLabel: Record<string, { ar: string; he: string }> = {
    apartment: { ar: 'شقة', he: 'דירה' },
    house: { ar: 'بيت', he: 'בית' },
    room: { ar: 'غرفة', he: 'חדר' },
    studio: { ar: 'استوديو', he: 'סטודיו' },
  }

  return (
    <>
      <Navbar />
      <main>

        {/* Search + filters */}
        <div style={{ background: 'white', borderBottom: '1px solid var(--gray-100)', padding: '16px 0 12px' }}>
          <div className="container">
            <form method="GET">
              <div className="search-bar" style={{ marginBottom: 12 }}>
                <svg width="16" height="16" fill="none" stroke="var(--gray-400)" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input name="city" defaultValue={sp.city ?? ''} placeholder={locale === 'ar' ? 'ابحث في كل المدن...' : 'חפש בכל הערים...'} list="city-list" />
                <datalist id="city-list">
                  {CITIES.map(c => <option key={c} value={c} />)}
                </datalist>
                <button type="submit" style={{ background: '#0EA5E9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </button>
              </div>

              <div className="city-pills">
                <a href={`/${locale}`} className={`pill${!sp.city ? ' active' : ''}`}>
                  {locale === 'ar' ? 'كل المدن' : 'כל הערים'}
                </a>
                {CITIES.slice(0, 8).map(city => (
                  <a key={city} href={`/${locale}?city=${encodeURIComponent(city)}`} className={`pill${sp.city === city ? ' active' : ''}`}>
                    {city}
                  </a>
                ))}
              </div>
            </form>
          </div>
        </div>

        {/* Listings */}
        <div className="container" style={{ padding: '24px 20px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>
              {sp.city ? sp.city : (locale === 'ar' ? 'كل الإعلانات' : 'כל המודעות')}
            </h2>
            {listings && listings.length > 0 && (
              <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                {listings.length}+ {locale === 'ar' ? 'إعلان' : 'מודעות'}
              </span>
            )}
          </div>

          {listings && listings.length > 0 ? (
            <div className="listing-grid">
              {listings.map((listing, i) => {
                const l = listing as Listing
                const firstPhoto = l.photos?.[0]
                const photoUrl = firstPhoto ? `${supabaseUrl}/storage/v1/object/public/listing-photos/${firstPhoto}` : null
                const tl = typeLabel[l.listing_type]

                return (
                  <Link key={l.id} href={`/${locale}/listings/${l.id}`} className="listing-card fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div style={{ position: 'relative' }}>
                      {photoUrl ? (
                        <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                          <Image src={photoUrl} alt={l.title} width={400} height={300} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div className="card-photo-placeholder" />
                      )}
                      <span className="card-type-badge">{locale === 'ar' ? tl?.ar : tl?.he}</span>
                    </div>
                    <div className="card-body">
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>
                        {l.city}{l.neighborhood ? ` — ${l.neighborhood}` : ''} · {l.rooms} {locale === 'ar' ? 'غرف' : 'חד׳'}
                      </p>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                        {l.furnished && <span className="feature-tag">{locale === 'ar' ? 'مفروش' : 'מרוהט'}</span>}
                        {l.parking && <span className="feature-tag">{locale === 'ar' ? 'مواقف' : 'חניה'}</span>}
                        {l.elevator && <span className="feature-tag">{locale === 'ar' ? 'مصعد' : 'מעלית'}</span>}
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-900)' }}>
                        ₪{l.price.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--gray-400)' }}>/{locale === 'ar' ? 'شهر' : 'חודש'}</span>
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 16px', display: 'block' }}>
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <p style={{ fontSize: 16, marginBottom: 8 }}>{locale === 'ar' ? 'لا توجد إعلانات حالياً' : 'אין מודעות כרגע'}</p>
              <Link href={`/${locale}/add-listing`} className="btn btn-primary" style={{ marginTop: 12 }}>
                {locale === 'ar' ? 'أضف أول إعلان' : 'הוסף מודעה ראשונה'}
              </Link>
            </div>
          )}

          {/* CTA */}
          <div className="cta-banner" style={{ marginTop: 40 }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#0C4A6E', marginBottom: 6 }}>
              {locale === 'ar' ? 'هل لديك عقار للإيجار؟' : 'יש לך נכס להשכרה?'}
            </p>
            <p style={{ fontSize: 13, color: '#0369A1', marginBottom: 16 }}>
              {locale === 'ar' ? 'انشر مجاناً وتواصل مع مستأجرين جديين' : 'פרסם בחינם והתחבר לשוכרים רציניים'}
            </p>
            <Link href={`/${locale}/add-listing`} className="btn btn-primary">
              {locale === 'ar' ? 'انشر إعلانك' : 'פרסם מודעה'}
            </Link>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
