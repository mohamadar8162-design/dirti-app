import Link from 'next/link'
import Image from 'next/image'
import type { Listing } from '@/types'
import { useLocale, useTranslations } from 'next-intl'

interface Props {
  listing: Listing
  locale: string
}

export default function ListingCard({ listing, locale }: Props) {
  const t = useTranslations('listing')

  const firstPhoto = listing.photos?.[0]
  const photoUrl = firstPhoto
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-photos/${firstPhoto}`
    : null

  const roomLabel = listing.rooms === 1 ? t('room') : t('rooms')

  return (
    <Link href={`/${locale}/listings/${listing.id}`} style={{ textDecoration: 'none' }}>
      <article className="card" style={{ cursor: 'pointer' }}>
        {/* Photo */}
        <div style={{ position: 'relative', height: 200, background: 'var(--gray-100)', overflow: 'hidden' }}>
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={listing.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div style={{
              height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--blue-50)',
            }}>
              <span style={{ fontSize: 36, opacity: 0.3 }}>&#x1F3E0;</span>
            </div>
          )}
          {/* Type badge */}
          <div style={{ position: 'absolute', top: 12, insetInlineStart: 12 }}>
            <span className="badge badge-blue">
              {listing.city}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 18px' }}>
          <h3 style={{
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--gray-900)',
            marginBottom: 6,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {listing.title}
          </h3>

          {/* Location */}
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>
            {listing.neighborhood ? `${listing.neighborhood}، ` : ''}{listing.city}
          </p>

          {/* Features row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <span className="text-muted">
              {listing.rooms} {roomLabel}
            </span>
            {listing.size_sqm && (
              <span className="text-muted">{listing.size_sqm} {t('sqm')}</span>
            )}
            {listing.floor !== null && listing.floor !== undefined && (
              <span className="text-muted">{t('floor')} {listing.floor}</span>
            )}
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {listing.furnished && <span className="feature-pill">{t('furnished')}</span>}
            {listing.parking && <span className="feature-pill">{t('parking')}</span>}
            {listing.elevator && <span className="feature-pill">{t('elevator')}</span>}
            {listing.balcony && <span className="feature-pill">{t('balcony')}</span>}
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="text-price">
              {t('ils')}{listing.price.toLocaleString()}
            </span>
            <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>{t('per_month')}</span>
            {listing.price_negotiable && (
              <span style={{ fontSize: 12, color: 'var(--blue-600)', marginInlineStart: 'auto' }}>
                {t('price_negotiable')}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
