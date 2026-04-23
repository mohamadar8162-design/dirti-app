import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import ListingCard from '@/components/listings/ListingCard'
import Link from 'next/link'
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
  const t = await getTranslations('home')
  const tL = await getTranslations('listing')

  const supabase = await createClient()

  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(9)

  if (sp.city) query = query.eq('city', sp.city)
  if (sp.type) query = query.eq('listing_type', sp.type)
  if (sp.rooms) query = query.gte('rooms', parseFloat(sp.rooms))

  const { data: listings } = await query

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="hero-gradient" style={{ padding: '72px 0 80px' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <p style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              ديرتي
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              color: '#fff',
              marginBottom: 16,
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            }}>
              {t('hero_title')}
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: 18,
              marginBottom: 48,
              maxWidth: 480,
              margin: '0 auto 48px',
            }}>
              {t('hero_subtitle')}
            </p>

            {/* Search filters */}
            <form method="GET" style={{
              background: 'rgba(255,255,255,0.97)',
              borderRadius: 'var(--radius-xl)',
              padding: '20px 24px',
              maxWidth: 780,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}>
              <div className="form-group">
                <label style={{ fontSize: 12 }}>{t('filter_city')}</label>
                <select name="city" defaultValue={sp.city ?? ''}>
                  <option value="">{t('all_cities')}</option>
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontSize: 12 }}>{t('filter_type')}</label>
                <select name="type" defaultValue={sp.type ?? ''}>
                  <option value="">{t('all_types')}</option>
                  {LISTING_TYPES.map(l => (
                    <option key={l.value} value={l.value}>
                      {locale === 'ar' ? l.label : l.labelHe}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontSize: 12 }}>{t('filter_rooms')}</label>
                <select name="rooms" defaultValue={sp.rooms ?? ''}>
                  <option value="">{t('any_rooms')}</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
              <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                <label style={{ fontSize: 12, opacity: 0 }}>.</label>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  {t('search_btn')}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Stats bar */}
        <section style={{ borderBottom: '1px solid var(--gray-100)', background: 'var(--off-white)' }}>
          <div className="container" style={{ padding: '16px 24px', display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { num: '+500', label: locale === 'ar' ? 'إعلان نشط' : 'מודעות פעילות' },
              { num: '18', label: locale === 'ar' ? 'مدينة عربية' : 'ערים ערביות' },
              { num: '100%', label: locale === 'ar' ? 'مجاني للباحثين' : 'חינם לדיירים' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--navy)' }}>
                  {s.num}
                </span>
                <span style={{ fontSize: 13, color: 'var(--gray-500)', marginInlineStart: 8 }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Listings */}
        <section style={{ padding: '56px 0 80px' }}>
          <div className="container">
            <div className="section-divider">
              <h2>{t('latest_listings')}</h2>
            </div>

            {listings && listings.length > 0 ? (
              <>
                <div className="listing-grid">
                  {listings.map((listing, i) => (
                    <div key={listing.id} className="fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                      <ListingCard listing={listing as Listing} locale={locale} />
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: 48 }}>
                  <Link href={`/${locale}/listings`} className="btn btn-outline" style={{ padding: '12px 32px' }}>
                    {t('view_all')}
                  </Link>
                </div>
              </>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '80px 0',
                color: 'var(--gray-400)',
              }}>
                <p style={{ fontSize: 18, marginBottom: 8 }}>
                  {locale === 'ar' ? 'لا توجد إعلانات حالياً' : 'אין מודעות כרגע'}
                </p>
                <p style={{ fontSize: 14 }}>
                  {locale === 'ar' ? 'كن أول من ينشر إعلاناً' : 'היה הראשון לפרסם מודעה'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA for landlords */}
        <section style={{
          background: 'var(--blue-50)',
          borderTop: '1px solid var(--blue-100)',
          borderBottom: '1px solid var(--blue-100)',
          padding: '56px 0',
        }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: 12 }}>
              {locale === 'ar' ? 'هل لديك عقار للإيجار؟' : 'יש לך נכס להשכרה?'}
            </h2>
            <p style={{ maxWidth: 480, margin: '0 auto 32px', fontSize: 16 }}>
              {locale === 'ar'
                ? 'انشر إعلانك مجاناً وتواصل مع مستأجرين جديين مباشرة'
                : 'פרסם מודעה בחינם והתחבר לשוכרים רציניים ישירות'}
            </p>
            <Link href={`/${locale}/add-listing`} className="btn btn-primary" style={{ padding: '13px 36px', fontSize: 16 }}>
              {locale === 'ar' ? 'انشر إعلانك الآن' : 'פרסם מודעה עכשיו'}
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        background: 'var(--navy)',
        color: 'rgba(255,255,255,0.6)',
        padding: '32px 0',
        textAlign: 'center',
        fontSize: 14,
      }}>
        <div className="container">
          <p style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>
            ديرتي
          </p>
          <p>
            {locale === 'ar'
              ? 'منصة الإيجار العربية الأولى في إسرائيل'
              : 'פלטפורמת השכירות הערבית הראשונה בישראל'}
          </p>
        </div>
      </footer>
    </>
  )
}
