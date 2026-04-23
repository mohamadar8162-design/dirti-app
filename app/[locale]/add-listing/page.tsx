import { getTranslations } from 'next-intl/server'
import Navbar from '@/components/Navbar'
import AddListingForm from '@/components/listings/AddListingForm'

export default async function AddListingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('form')

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--off-white)', paddingBottom: 80 }}>
        <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-100)', padding: '32px 0 28px' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: 6 }}>{t('title')}</h1>
            <p style={{ color: 'var(--gray-500)' }}>{t('subtitle')}</p>
          </div>
        </div>
        <div className="container" style={{ paddingTop: 32, maxWidth: 720 }}>
          <AddListingForm />
        </div>
      </main>
    </>
  )
}
