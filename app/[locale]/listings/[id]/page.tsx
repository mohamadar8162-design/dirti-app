import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import { notFound } from 'next/navigation'
import type { Listing } from '@/types'
import Link from 'next/link'
import Image from 'next/image'

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const t = await getTranslations('listing')

  const supabase = await createClient()
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (!listing) notFound()

  // Increment views (fire and forget)
  supabase.rpc('increment_listing_views', { listing_id: id }).then(() => {})

  const l = listing as Listing
  const photos = l.photos?.filter(Boolean) ?? []
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  const whatsappNumber = l.contact_phone.replace(/[^0-9]/g, '').replace(/^0/, '972')
  const whatsappMsg = locale === 'ar'
    ? `مرحبا، رأيت إعلانك "${l.title}" على ديرتي وأريد الاستفسار`
    : `שלום, ראיתי את המודעה שלך "${l.title}" בדירתי ואני מעוניין לברר`
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`

  const features = [
    { key: 'furnished', label: t('furnished'), active: l.furnished },
    { key: 'parking', label: t('parking'), active: l.parking },
    { key: 'elevator', label: t('elevator'), active: l.elevator },
    { key: 'balcony', label: t('balcony'), active: l.balcony },
  ].filter(f => f.active)

  const postedDate = new Date(l.created_at).toLocaleDateString(
    locale === 'ar' ? 'ar-IL' : 'he-IL',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--off-white)', paddingBottom: 80 }}>
        <div className="container" style={{ paddingTop: 32 }}>
          {/* Back */}
          <Link href={`/${locale}/listings`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--gray-500)', fontSize: 14, marginBottom: 24 }}>
            {locale === 'ar' ? '→ العودة للإعلانات' : '← חזרה למודעות'}
          </Link>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr min(360px, 100%)', gap: 32, alignItems: 'start' }}>
            {/* Left column */}
            <div>
              {/* Photos */}
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--gray-100)', marginBottom: 24 }}>
                {photos.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: photos.length > 1 ? '1fr 1fr' : '1fr', gap: 2 }}>
                    {photos.slice(0, 4).map((photo, i) => (
                      <div key={i} style={{ position: 'relative', height: i === 0 && photos.length > 1 ? 320 : 200, gridColumn: i === 0 && photos.length > 1 ? 'span 2' : undefined }}>
                        <Image
                          src={`${supabaseUrl}/storage/v1/object/public/listing-photos/${photo}`}
                          alt={`${l.title} - صورة ${i + 1}`}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 100vw, 60vw"
                          priority={i === 0}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ height: 280, background: 'var(--blue-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 48, opacity: 0.2 }}>&#x1F3E0;</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {l.description && (
                <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', padding: '24px 28px', marginBottom: 24 }}>
                  <h3 style={{ marginBottom: 12 }}>{t('description')}</h3>
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{l.description}</p>
                </div>
              )}

              {/* Details */}
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', padding: '24px 28px' }}>
                <h3 style={{ marginBottom: 18 }}>{t('details')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
                  {[
                    { label: t('rooms'), value: l.rooms },
                    l.floor !== null ? { label: t('floor'), value: l.floor } : null,
                    l.size_sqm ? { label: t('size'), value: `${l.size_sqm} ${t('sqm')}` } : null,
                  ].filter(Boolean).map((d, i) => (
                    <div key={i} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
                      <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>{d!.label}</p>
                      <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--navy)' }}>{d!.value}</p>
                    </div>
                  ))}
                </div>

                {features.length > 0 && (
                  <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {features.map(f => (
                      <span key={f.key} className="feature-pill">{f.label}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: sticky sidebar */}
            <div style={{ position: 'sticky', top: 90 }}>
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-md)', padding: '28px 24px' }}>
                {/* Title */}
                <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
                  {l.title}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 20 }}>
                  {l.neighborhood ? `${l.neighborhood}، ` : ''}{l.city}
                </p>

                {/* Price */}
                <div style={{ borderTop: '1px solid var(--gray-100)', borderBottom: '1px solid var(--gray-100)', padding: '16px 0', marginBottom: 20 }}>
                  <span className="text-price" style={{ fontSize: '1.75rem' }}>
                    {t('ils')}{l.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--gray-400)', marginInlineStart: 6 }}>{t('per_month')}</span>
                  {l.price_negotiable && (
                    <p style={{ fontSize: 13, color: 'var(--blue-600)', marginTop: 4 }}>{t('price_negotiable')}</p>
                  )}
                </div>

                {/* Contact */}
                <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 6 }}>
                  {t('posted_by')}: <strong style={{ color: 'var(--gray-800)' }}>{l.contact_name}</strong>
                </p>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-blue"
                  style={{ width: '100%', marginTop: 12, fontSize: 15, padding: '13px 20px' }}
                >
                  {t('contact_whatsapp')}
                </a>

                {/* Meta */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--gray-100)' }}>
                  <p className="text-muted">{t('posted_at')}: {postedDate}</p>
                  <p className="text-muted" style={{ marginTop: 4 }}>{l.views} {t('views')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
