'use client'

import { useState, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CITIES, LISTING_TYPES, type ListingFormData, type CityName, type ListingType } from '@/types'

export default function AddListingForm() {
  const t = useTranslations('form')
  const locale = useLocale()
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreview, setPhotoPreview] = useState<string[]>([])

  const [form, setForm] = useState<ListingFormData>({
    title: '',
    description: '',
    listing_type: 'apartment',
    city: '',
    neighborhood: '',
    rooms: 2,
    floor: '',
    size_sqm: '',
    furnished: false,
    parking: false,
    elevator: false,
    balcony: false,
    price: 0,
    price_negotiable: false,
    contact_name: '',
    contact_phone: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const valid = files.filter(f => f.size <= 5 * 1024 * 1024 && ['image/jpeg', 'image/png', 'image/webp'].includes(f.type))
    const combined = [...photos, ...valid].slice(0, 10)
    setPhotos(combined)
    setPhotoPreview(combined.map(f => URL.createObjectURL(f)))
  }

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
    setPhotoPreview(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/${locale}/login`)
        return
      }

      // Upload photos
      const uploadedPaths: string[] = []
      for (const photo of photos) {
        const ext = photo.name.split('.').pop()
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('listing-photos')
          .upload(path, photo, { contentType: photo.type, upsert: false })
        if (uploadErr) throw new Error('Photo upload failed')
        uploadedPaths.push(path)
      }

      // Insert listing
      const { error: insertErr } = await supabase.from('listings').insert({
        user_id: user.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        listing_type: form.listing_type,
        city: form.city as CityName,
        neighborhood: form.neighborhood.trim() || null,
        rooms: form.rooms,
        floor: form.floor !== '' ? Number(form.floor) : null,
        size_sqm: form.size_sqm !== '' ? Number(form.size_sqm) : null,
        furnished: form.furnished,
        parking: form.parking,
        elevator: form.elevator,
        balcony: form.balcony,
        price: Number(form.price),
        price_negotiable: form.price_negotiable,
        contact_name: form.contact_name.trim(),
        contact_phone: form.contact_phone.trim(),
        photos: uploadedPaths,
        status: 'pending',
      })

      if (insertErr) throw insertErr

      setSuccess(true)
      setTimeout(() => router.push(`/${locale}/my-listings`), 2500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('error'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
        <h2 style={{ marginBottom: 12 }}>{locale === 'ar' ? 'تم الإرسال' : 'נשלח בהצלחה'}</h2>
        <p>{t('success')}</p>
      </div>
    )
  }

  const sectionStyle = {
    background: 'var(--white)',
    border: '1px solid var(--gray-100)',
    borderRadius: 'var(--radius-lg)',
    padding: '28px',
    marginBottom: 24,
  }

  const sectionTitle = {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--navy)',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: '1px solid var(--gray-100)',
    fontFamily: 'var(--font-body)',
  } as React.CSSProperties

  const grid2 = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Basic info */}
      <div style={sectionStyle}>
        <p style={sectionTitle}>{t('section_basic')}</p>
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="form-group">
            <label>{t('listing_title')} *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder={t('listing_title_placeholder')} required maxLength={100} />
          </div>
          <div style={grid2}>
            <div className="form-group">
              <label>{t('listing_type')} *</label>
              <select name="listing_type" value={form.listing_type} onChange={handleChange} required>
                {LISTING_TYPES.map(l => (
                  <option key={l.value} value={l.value}>{locale === 'ar' ? l.label : l.labelHe}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>{t('description')}</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder={t('description_placeholder')} rows={4} maxLength={2000} />
          </div>
        </div>
      </div>

      {/* Location */}
      <div style={sectionStyle}>
        <p style={sectionTitle}>{t('section_location')}</p>
        <div style={grid2}>
          <div className="form-group">
            <label>{t('city')} *</label>
            <select name="city" value={form.city} onChange={handleChange} required>
              <option value="">-- {locale === 'ar' ? 'اختر المدينة' : 'בחר עיר'} --</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>{t('neighborhood')}</label>
            <input name="neighborhood" value={form.neighborhood} onChange={handleChange} maxLength={100} />
          </div>
        </div>
      </div>

      {/* Details */}
      <div style={sectionStyle}>
        <p style={sectionTitle}>{t('section_details')}</p>
        <div style={{ ...grid2, marginBottom: 16 }}>
          <div className="form-group">
            <label>{t('rooms')} *</label>
            <input type="number" name="rooms" value={form.rooms} onChange={handleChange} min={0.5} max={20} step={0.5} required />
          </div>
          <div className="form-group">
            <label>{t('floor')}</label>
            <input type="number" name="floor" value={form.floor} onChange={handleChange} min={0} max={50} />
          </div>
          <div className="form-group">
            <label>{t('size')}</label>
            <input type="number" name="size_sqm" value={form.size_sqm} onChange={handleChange} min={1} max={1000} />
          </div>
          <div className="form-group">
            <label>{t('price')} *</label>
            <input type="number" name="price" value={form.price || ''} onChange={handleChange} min={100} max={50000} required />
          </div>
        </div>

        {/* Checkboxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { name: 'furnished', label: t('furnished') },
            { name: 'parking', label: t('parking') },
            { name: 'elevator', label: t('elevator') },
            { name: 'balcony', label: t('balcony') },
            { name: 'price_negotiable', label: t('price_negotiable') },
          ].map(cb => (
            <label key={cb.name} className="checkbox-group" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                name={cb.name}
                checked={form[cb.name as keyof ListingFormData] as boolean}
                onChange={handleChange}
              />
              <span style={{ fontSize: 14 }}>{cb.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div style={sectionStyle}>
        <p style={sectionTitle}>{t('section_contact')}</p>
        <div style={grid2}>
          <div className="form-group">
            <label>{t('contact_name')} *</label>
            <input name="contact_name" value={form.contact_name} onChange={handleChange} required maxLength={60} />
          </div>
          <div className="form-group">
            <label>{t('contact_phone')} *</label>
            <input name="contact_phone" value={form.contact_phone} onChange={handleChange} required placeholder={t('contact_phone_hint')} />
            <span className="text-muted">{t('contact_phone_hint')}</span>
          </div>
        </div>
      </div>

      {/* Photos */}
      <div style={sectionStyle}>
        <p style={sectionTitle}>{t('section_photos')}</p>
        <div
          className="photo-upload-area"
          onClick={() => fileInputRef.current?.click()}
        >
          <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>{t('photos')}</p>
          <p className="text-muted" style={{ marginTop: 4 }}>{t('photos_hint')}</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={handlePhotos}
        />
        {photoPreview.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, marginTop: 16 }}>
            {photoPreview.map((src, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={src} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  style={{
                    position: 'absolute', top: 4, insetInlineEnd: 4,
                    background: 'rgba(0,0,0,0.6)', color: '#fff',
                    border: 'none', borderRadius: '50%', width: 20, height: 20,
                    fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >x</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="error-msg" style={{ marginBottom: 16, fontSize: 15 }}>{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: 16 }}>
        {loading ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
