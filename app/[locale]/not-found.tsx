import Link from 'next/link'

export default async function NotFound({ params }: { params?: Promise<{ locale?: string }> }) {
  const locale = (await params)?.locale ?? 'ar'
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--off-white)' }}>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', color: 'var(--navy)', marginBottom: 8 }}>404</h1>
        <p style={{ fontSize: 18, color: 'var(--gray-500)', marginBottom: 32 }}>
          {locale === 'ar' ? 'الصفحة غير موجودة' : 'הדף לא נמצא'}
        </p>
        <Link href={`/${locale}`} className="btn btn-primary">
          {locale === 'ar' ? 'العودة للرئيسية' : 'חזרה לדף הבית'}
        </Link>
      </div>
    </main>
  )
}
