import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import { redirect } from 'next/navigation'
import type { Listing } from '@/types'
import Image from 'next/image'

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect(`/${locale}`)

  const { data: pending } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const approve = async (id: string) => {
    'use server'
    const sb = await createClient()
    await sb.from('listings').update({ status: 'active' }).eq('id', id)
  }

  const reject = async (formData: FormData) => {
    'use server'
    const id = formData.get('id') as string
    const reason = formData.get('reason') as string
    const sb = await createClient()
    await sb.from('listings').update({ status: 'rejected', rejection_reason: reason || 'لا يستوفي المعايير' }).eq('id', id)
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--off-white)', paddingBottom: 80 }}>
        <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-100)', padding: '32px 0 28px' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: 4 }}>
              {locale === 'ar' ? 'لوحة الإدارة' : 'לוח ניהול'}
            </h1>
            <p style={{ color: 'var(--gray-500)' }}>
              {pending?.length ?? 0} {locale === 'ar' ? 'إعلان قيد المراجعة' : 'מודעות ממתינות'}
            </p>
          </div>
        </div>

        <div className="container" style={{ paddingTop: 32 }}>
          {!pending || pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-400)' }}>
              <p style={{ fontSize: 18 }}>{locale === 'ar' ? 'لا توجد إعلانات للمراجعة' : 'אין מודעות לבדיקה'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 20 }}>
              {pending.map((listing) => {
                const l = listing as Listing
                const firstPhoto = l.photos?.[0]
                const photoUrl = firstPhoto
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-photos/${firstPhoto}`
                  : null

                return (
                  <div key={l.id} style={{
                    background: 'var(--white)',
                    border: '1px solid var(--gray-100)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 20, marginBottom: 20 }}>
                      <div style={{ width: 100, height: 100, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--blue-50)' }}>
                        {photoUrl ? (
                          <Image src={photoUrl} alt={l.title} width={100} height={100} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, opacity: 0.2 }}>&#x1F3E0;</div>
                        )}
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{l.title}</h3>
                        <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 4 }}>
                          {l.city}{l.neighborhood ? ` — ${l.neighborhood}` : ''} · {l.rooms} غرف · ₪{l.price.toLocaleString()}
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4 }}>
                          {locale === 'ar' ? 'للتواصل' : 'ליצירת קשר'}: {l.contact_name} — {l.contact_phone}
                        </p>
                        {l.description && (
                          <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 8, lineHeight: 1.7 }}>{l.description}</p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', borderTop: '1px solid var(--gray-100)', paddingTop: 16 }}>
                      <form action={approve.bind(null, l.id)}>
                        <button type="submit" className="btn btn-primary" style={{ fontSize: 14, padding: '9px 20px', background: '#16a34a', borderColor: '#16a34a' }}>
                          {locale === 'ar' ? 'قبول' : 'אשר'}
                        </button>
                      </form>
                      <form action={reject} style={{ display: 'flex', gap: 8, flex: 1 }}>
                        <input type="hidden" name="id" value={l.id} />
                        <input
                          type="text"
                          name="reason"
                          placeholder={locale === 'ar' ? 'سبب الرفض (اختياري)' : 'סיבת הדחייה (אופציונלי)'}
                          style={{ flex: 1, height: 38, padding: '0 12px', fontSize: 14 }}
                        />
                        <button type="submit" className="btn" style={{ fontSize: 14, padding: '9px 20px', color: '#dc2626', borderColor: '#fecaca' }}>
                          {locale === 'ar' ? 'رفض' : 'דחה'}
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
