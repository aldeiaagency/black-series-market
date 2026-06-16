import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GuideAuthorBox, GuideFaq, GuideHeroImage, GuideToc } from '../_components/GuideSeoBlocks'
import { commercialGuides, getCommercialGuide, guideTocItems } from '../_data/commercialGuides'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return commercialGuides.map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = getCommercialGuide(slug)
  if (!guide) return {}

  const path = `/guias/${guide.slug}`

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: path },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: 'article',
      url: path,
      images: [{ url: guide.image, width: 1200, height: 675, alt: guide.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.description,
      images: [guide.image],
    },
  }
}

export default async function CommercialGuidePage({ params }: PageProps) {
  const { slug } = await params
  const guide = getCommercialGuide(slug)

  if (!guide) notFound()

  const pageUrl = `${SITE_URL}/guias/${guide.slug}`
  const imageUrl = `${SITE_URL}${guide.image}`

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline: guide.title,
    description: guide.description,
    url: pageUrl,
    inLanguage: 'es-ES',
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 675,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    datePublished: guide.datePublished,
    dateModified: guide.dateModified,
    publisher: { '@type': 'Organization', name: 'Black Label Market', url: SITE_URL, '@id': `${SITE_URL}/#organization` },
    author: { '@type': 'Organization', name: 'Black Label Market', url: SITE_URL, '@id': `${SITE_URL}/#organization` },
    isPartOf: { '@id': `${SITE_URL}/#website` },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guías', item: `${SITE_URL}/guias` },
      { '@type': 'ListItem', position: 3, name: guide.h1 },
    ],
  }

  return (
    <div className="max-w-screen-lg mx-auto px-6 lg:px-12 pt-28 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="mb-12">
        <nav aria-label="breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-xs text-bsm-text-muted">
            <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li><Link href="/guias" className="hover:text-gold transition-colors">Guías</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li className="text-bsm-text-secondary" aria-current="page">{guide.tag}</li>
          </ol>
        </nav>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">{guide.tag}</span>
        </div>
        <h1 className="section-title mb-4">{guide.h1}</h1>
        <p className="text-sm text-bsm-text-muted">Por el equipo editorial de Black Label Market · Actualizado en junio de 2026</p>
      </div>

      <GuideHeroImage src={guide.image} alt={guide.imageAlt} />
      <GuideToc items={guideTocItems(guide)} />

      <article className="space-y-10 text-bsm-text-secondary leading-relaxed">
        <section className="space-y-4">
          {guide.intro.map((paragraph) => (
            <p key={paragraph} className="text-base leading-relaxed">{paragraph}</p>
          ))}
        </section>

        {guide.sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2 className="font-display text-2xl font-light text-bsm-text-primary mb-4">{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-relaxed mb-4">{paragraph}</p>
            ))}
            {section.bullets && (
              <ul className="space-y-3 text-sm list-none pl-0">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="text-gold flex-shrink-0">—</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <GuideFaq items={guide.faq} />
        <GuideAuthorBox />
      </article>

      <div className="mt-16 pt-10 border-t border-bsm-border space-y-8">
        <div>
          <p className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">Explorar catálogo</p>
          <div className="flex flex-wrap gap-3">
            {guide.catalogLinks.map((item, index) => (
              <Link key={item.href} href={item.href} className={index === 0 ? 'btn-gold text-sm px-5' : 'btn-outline text-sm px-5'}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-bsm-text-muted uppercase tracking-widest mb-3">Guías relacionadas</p>
          <div className="flex flex-wrap gap-4">
            {guide.relatedLinks.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-bsm-text-muted hover:text-gold transition-colors">
                {item.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
