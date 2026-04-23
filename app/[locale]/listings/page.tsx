import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import Image from 'next/image'
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  const typeLabel: Record<string, { ar: string; he: string }> = {
    apartment: { ar: 'شقة', he: 'דירה' },
    house: { ar: 'بيت', he: 'בית' },
    room: { ar: 'غرفة', he: 'חדר' },
    studio: { ar: 'استوديو', he: 'סטודיו' },
  }

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    const all = { city: sp.city, type: sp.type, rooms: sp.rooms, min: sp.min, max: sp.max, ...overrides }
    Object.entries(all).forEach(([k, v]) => { if (v) p.set(k, v) })
    return `/${locale}/listings?${p.toString()}`
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
        <div style={{ background: 'white', borderBottom: '1px solid var(--gray-100)', padding: '14px 0' }}>
          <div className="container">
            <form method="GET" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <select name="city" defaultValue={sp.city ?? ''} style={{ height: 40, padding: '0 12px', borderRadius: 99, fontSize: 13, minWidth: 130 }}>
                <option value="">{locale === 'ar' ? 'كل المدن' : 'כל הערים'}</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select name="type" defaultValue={sp.type ?? ''} style={{ height: 40, padding: '0 12px', borderRadius: 99, fontSize: 13, minWidth: 120 }}>
                <option value="">{locale === 'ar' ? 'كل الأنواع' : 'כל הסוגים'}</option>
                {LISTING_TYPES.map(l => <option key={l.value} value={l.value}>{locale === 'ar' ? l.label : l.labelHe}</option>)}
              </select>
              <select name="rooms" defaultValue={sp.rooms ?? ''} style={{ height: 40, padding: '0 12px', borderRadius: 99, fontSize: 13, minWidth: 110 }}>
                <option value="">{locale === 'ar' ? 'الغرف' : 'חדרים'}</option>
                {['1','2','3','4','5'].map(r => <option key={r} value={r}>{r}+</option>)}
              </select>
              <input type="number" name="min" defaultValue={sp.min} placeholder="₪ من" style={{ height: 40, borderRadius: 99, width: 90, fontSize: 13 }} />
              <input type="number" name="max" defaultValue={sp.max} placeholder="₪ إلى" style={{ height: 40, borderRadius: 99, width: 90, fontSize: 13 }} />
              <button type="submit" className="btn btn-primary" style={{ height: 40, padding: '0 20px', fontSize: 13 }}>
                {locale === 'ar' ? 'بحث' : 'חיפוש'}
              </button>
              {(sp.city || sp.type || sp.rooms || sp.min || sp.max) && (
                <a href={`/${locale}/listings`} className="btn btn-outline" style={{ height: 40, padding: '0 16px', fontSize: 13 }}>
                  {locale === 'ar' ? 'مسح' : 'נקה'}
                </a>
              )}
            </form>
          </div>
        </div>

        <div className="container" style={{ padding: '24px 20px 40px' }}>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20 }}>
            {count ?? 0} {locale === 'ar' ? 'نتيجة' : 'תוצאות'}
          </p>

          {listings && listings.length > 0 ? (
            <div className="listing-grid">
              {listings.map((listing) => {
                const l = listing as Listing
                const firstPhoto = l.photos?.[0]
                const photoUrl = firstPhoto ? `${supabaseUrl}/storage/v1/object/public/listing-photos/${firstPhoto}` : null
                const tl = typeLabel[l.listing_type]
                return (
                  <Link key={l.id} href={`/${locale}/listings/${l.id}`} className="listing-card">
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
                      <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>{l.city}{l.neighborhood ? ` — ${l.neighborhood}` : ''} · {l.rooms} {locale === 'ar' ? 'غرف' : 'חד׳'}</p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-900)' }}>₪{l.price.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--gray-400)' }}>/{locale === 'ar' ? 'شهر' : 'חודש'}</span></p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
              <p style={{ fontSize: 16 }}>{locale === 'ar' ? 'لا توجد نتائج' : 'אין תוצאות'}</p>
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
              {page > 1 && <a href={buildUrl({ page: String(page - 1) })} className="btn btn-outline">{locale === 'ar' ? 'السابق' : 'הקודם'}</a>}
              <span style={{ padding: '10px 16px', fontSize: 14, color: 'var(--gray-600)' }}>{page} / {totalPages}</span>
              {page < totalPages && <a href={buildUrl({ page: String(page + 1) })} className="btn btn-outline">{locale === 'ar' ? 'التالي' : 'הבא'}</a>}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
