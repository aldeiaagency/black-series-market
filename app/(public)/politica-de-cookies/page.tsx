// NOTA INTERNA: Esta página es una versión provisional.
// El contenido legal definitivo debe ser revisado y aprobado por un asesor jurídico
// especializado en RGPD y normativa española antes de la puesta en producción real.

import type { Metadata } from 'next'
import Link from 'next/link'
import CookieSettingsButton from '@/components/legal/CookieSettingsButton'

export const metadata: Metadata = {
  title: 'Política de cookies — Black Label Market',
  description: 'Información sobre el uso de cookies en Black Label Market.',
  robots: { index: false, follow: false },
}

export default function PoliticaDeCookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-12 pt-28 pb-20">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Legal</span>
        </div>
        <h1 className="font-display text-4xl font-light text-bsm-text-primary mb-4">
          Política de cookies
        </h1>
        <p className="text-sm text-bsm-text-muted">
          Última actualización: pendiente de revisión legal definitiva
        </p>
      </div>

      {/* Provisional notice */}
      <div className="border border-[#C6A64B]/20 bg-[#C6A64B]/5 p-4 mb-10 text-xs text-[#C6A64B] leading-relaxed">
        Este documento es una versión provisional. El contenido está pendiente de revisión
        jurídica especializada en RGPD y normativa española de cookies.
      </div>

      <div className="prose-bsm space-y-8 text-sm text-bsm-text-secondary leading-relaxed">

        {/* Qué son */}
        <section>
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-3">¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo cuando los visitas.
            Permiten que el sitio recuerde tus acciones y preferencias durante un período de tiempo.
          </p>
        </section>

        {/* Qué usamos */}
        <section>
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-3">Cookies que utilizamos</h2>

          {/* Técnicas */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-sm font-medium text-bsm-text-primary">Técnicas necesarias</h3>
              <span className="text-[9px] tracking-widest uppercase text-[#C6A64B] border border-[#C6A64B]/40 px-1.5 py-0.5 leading-none">
                Siempre activas
              </span>
            </div>
            <p className="text-bsm-text-muted mb-3">
              Son imprescindibles para el funcionamiento de la web. Sin ellas, servicios básicos como
              la navegación, la sesión de usuario o la seguridad no podrían funcionar correctamente.
              No requieren consentimiento previo.
            </p>
            <div className="border border-bsm-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-bsm-border">
                    <th className="text-left px-4 py-2.5 text-bsm-text-muted font-medium">Nombre</th>
                    <th className="text-left px-4 py-2.5 text-bsm-text-muted font-medium">Finalidad</th>
                    <th className="text-left px-4 py-2.5 text-bsm-text-muted font-medium">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-bsm-border last:border-0">
                    <td className="px-4 py-2.5 text-bsm-text-primary font-mono">sb-* (Supabase)</td>
                    <td className="px-4 py-2.5 text-bsm-text-secondary">Gestión de sesión de usuario autenticado</td>
                    <td className="px-4 py-2.5 text-bsm-text-muted">Sesión / 1 año</td>
                  </tr>
                  <tr className="border-b border-bsm-border last:border-0">
                    <td className="px-4 py-2.5 text-bsm-text-primary font-mono">black_label_cookie_consent</td>
                    <td className="px-4 py-2.5 text-bsm-text-secondary">Almacena tus preferencias de cookies</td>
                    <td className="px-4 py-2.5 text-bsm-text-muted">1 año</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Analítica */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-sm font-medium text-bsm-text-primary">Analítica</h3>
              <span className="text-[9px] tracking-widest uppercase text-[#737373] border border-[#2A2A2A] px-1.5 py-0.5 leading-none">
                Requiere consentimiento
              </span>
            </div>
            <p className="text-bsm-text-muted">
              Nos permiten analizar el uso de la web para mejorar su funcionamiento y la experiencia de usuario.
              Los datos recogidos son agregados y no incluyen información personal identificable.
              Solo se activan si aceptas esta categoría.
            </p>
          </div>

          {/* Marketing */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-sm font-medium text-bsm-text-primary">Marketing</h3>
              <span className="text-[9px] tracking-widest uppercase text-[#737373] border border-[#2A2A2A] px-1.5 py-0.5 leading-none">
                Actualmente no en uso
              </span>
            </div>
            <p className="text-bsm-text-muted">
              Black Label Market no utiliza actualmente cookies de marketing o publicidad personalizada.
              Esta categoría está reservada para uso futuro y no activará ningún script aunque se acepte.
            </p>
          </div>
        </section>

        {/* Gestión */}
        <section>
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-3">Cómo gestionar tus preferencias</h2>
          <p className="mb-4">
            Puedes revisar y modificar tus preferencias de cookies en cualquier momento pulsando
            el botón de abajo o a través del enlace &quot;Configurar cookies&quot; en el pie de página.
          </p>
          <CookieSettingsButton
            className="inline-flex items-center px-5 py-2.5 text-sm border border-[#C6A64B]/40
              text-[#C6A64B] hover:bg-[#C6A64B]/10 transition-colors"
          />
        </section>

        {/* Más info */}
        <section>
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-3">Más información</h2>
          <p>
            Para más información sobre cómo tratamos tus datos personales, consulta nuestra{' '}
            <Link href="/legal/privacidad" className="text-gold hover:text-gold-light transition-colors">
              Política de privacidad
            </Link>.
            Black Label Market está operado por KAZAWEB, S.L.U. (NIF B42761254).
          </p>
        </section>

      </div>
    </div>
  )
}
