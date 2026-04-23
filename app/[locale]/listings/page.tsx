import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import ListingCard from '@/components/listings/ListingCard'
import type { Listing } from '@/types'
import { CITIES, LISTING_TYPES } from '@/types'

export default async function ListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ city?: string; type?: string; rooms?: string; min?: string; max?: string; page?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations('home')
  const PAGE_SIZE = 12
  const page = parseInt(sp.page ?? '1')
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (sp.city) query = query.eq('city', sp.city)
  if (sp.type) query = query.eq('listing_type', sp.type)
  if (sp.rooms) query = query.gte('rooms', parseFloat(sp.rooms))
  if (sp.min) query = query.gte('price', parseInt(sp.min))
  if (sp.max) query = query.lte('price', parseInt(sp.max))

  const { data: listings, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const all = { city: sp.city, type: sp.type, rooms: sp.rooms, min: sp.min, max: sp.max, page: sp.page, ...overrides }
    Object.entries(all).forEach(([k, v]) => { if (v) params.set(k, v) })
    return `/${locale}/listings?${params.toString()}`
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
        {/* Filter bar */}
        <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-100)', padding: '16px 0' }}>
          <div className="container">
            <form method="GET" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ minWidth: 140 }}>
                <label style={{ fontSize: 12 }}>{t('filter_city')}</label>
                <select name="city" defaultValue={sp.city ?? ''} style={{ height: 38, padding: '0 10px' }}>
                  <option value="">{t('all_cities')}</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ minWidth: 130 }}>
                <label style={{ fontSize: 12 }}>{t('filter_type')}</label>
                <select name="type" defaultValue={sp.type ?? ''} style={{ height: 38, padding: '0 10px' }}>
                  <option value="">{t('all_types')}</option>
                  {LISTING_TYPES.map(l => <option key={l.value} value={l.value}>{locale === 'ar' ? l.label : l.labelHe}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ minWidth: 110 }}>
                <label style={{ fontSize: 12 }}>{t('filter_rooms')}</label>
                <select name="rooms" defaultValue={sp.rooms ?? ''} style={{ height: 38, padding: '0 10px' }}>
                  <option value="">{t('any_rooms')}</option>
                  {['1','2','3','4','5'].map(r => <option key={r} value={r}>{r}+</option>)}
                </select>
              </div>
              <div className="form-group" style={{ minWidth: 100 }}>
                <label style={{ fontSize: 12 }}>{locale === 'ar' ? 'سعر من' : 'מחיר מ'}</label>
                <input type="number" name="min" defaultValue={sp.min} placeholder="₪" style={{ height: 38, padding: '0 10px' }} />
              </div>
              <div className="form-group" style={{ minWidth: 100 }}>
                <label style={{ fontSize: 12 }}>{locale === 'ar' ? 'سعر إلى' : 'מחיר עד'}</label>
                <input type="number" name="max" defaultValue={sp.max} placeholder="₪" style={{ height: 38, padding: '0 10px' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: 38, padding: '0 20px', fontSize: 14 }}>
                {t('search_btn')}
              </button>
              {(sp.city || sp.type || sp.rooms || sp.min || sp.max) && (
                <a href={`/${locale}/listings`} className="btn btn-outline" style={{ height: 38, padding: '0 16px', fontSize: 14 }}>
                  {locale === 'ar' ? 'مسح' : 'נקה'}
                </a>
              )}
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="container" style={{ padding: '32px 24px' }}>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24 }}>
            {count ?? 0} {locale === 'ar' ? 'نتيجة' : 'תוצאות'}
          </p>

          {listings && listings.length > 0 ? (
            <div className="listing-grid">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing as Listing} locale={locale} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-400)' }}>
              <p style={{ fontSize: 18 }}>{locale === 'ar' ? 'لا توجد نتائج' : 'אין תוצאות'}</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
              {page > 1 && (
                <a href={buildUrl({ page: String(page - 1) })} className="btn btn-outline">
                  {locale === 'ar' ? 'السابق' : 'הקודם'}
                </a>
              )}
              <span style={{ padding: '10px 16px', fontSize: 14, color: 'var(--gray-600)' }}>
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <a href={buildUrl({ page: String(page + 1) })} className="btn btn-outline">
                  {locale === 'ar' ? 'التالي' : 'הבא'}
                </a>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
