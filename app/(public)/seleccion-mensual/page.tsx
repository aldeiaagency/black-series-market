import type { Metadata } from 'next'
import NewsletterSignupForm from '@/components/marketplace/NewsletterSignupForm'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'
const PAGE_PATH = '/seleccion-mensual'

export const metadata: Metadata = {
  title: 'Selección mensual — Black Label Market',
  description: 'Una vez al mes, una selección editada de unidades y hallazgos del mercado premium y de colección. Sin spam, baja en un clic.',
  alternates: { canonical: PAGE_PATH },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Selección mensual — Black Label Market',
    description: 'Lo nuevo del catálogo, sin tener que buscarlo tú.',
    type: 'website',
    url: PAGE_PATH,
  },
}

export default function SeleccionMensualPage() {
  return (
    <div className="max-w-screen-sm mx-auto px-6 lg:px-8 pt-28 pb-24 text-center">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="h-px w-6 bg-gold" />
        <span className="text-xs text-gold tracking-widest uppercase">Selección mensual</span>
        <div className="h-px w-6 bg-gold" />
      </div>

      <h1 className="font-display text-3xl lg:text-4xl font-light text-bsm-text-primary mb-5 leading-tight">
        Lo nuevo del catálogo,<br />sin tener que <em className="not-italic text-gold">buscarlo</em> tú
      </h1>

      <p className="text-bsm-text-secondary text-[15px] leading-relaxed max-w-md mx-auto mb-12">
        Una vez al mes, una selección editada de unidades y hallazgos del mercado premium y de colección —
        no un listado de anuncios. Sin spam, baja en un clic.
      </p>

      <NewsletterSignupForm variant="landing" />
    </div>
  )
}
