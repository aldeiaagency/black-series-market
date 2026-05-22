import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const LEGAL_CONTENT: Record<string, { title: string; content: string }> = {
  'aviso-legal': {
    title: 'Aviso Legal',
    content: `
**Titular del sitio web**

Black Series Agency, en adelante "Black Series Market", es la entidad responsable de la operación de este marketplace de vehículos premium.

**Objeto del sitio**

Black Series Market es una plataforma de intermediación digital que facilita el contacto entre concesionarios y compraventas de vehículos premium con posibles compradores. Black Series Market no es parte en las transacciones de compraventa entre usuarios y dealers, actuando exclusivamente como plataforma de intermediación.

**Propiedad intelectual**

Todos los contenidos del sitio web, incluyendo diseño, textos, imágenes y código fuente, son propiedad de Black Series Market o de sus licenciantes y están protegidos por las leyes de propiedad intelectual vigentes.

**Responsabilidad de los contenidos**

Los concesionarios registrados son los únicos responsables de la veracidad y exactitud de la información publicada sobre los vehículos de su inventario. Black Series Market realiza revisión editorial básica pero no garantiza la exactitud de las especificaciones técnicas ni del estado real de los vehículos.

**Legislación aplicable**

Este aviso legal se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de España.
    `.trim(),
  },
  'privacidad': {
    title: 'Política de Privacidad',
    content: `
**Responsable del tratamiento**

Black Series Market trata los datos personales de sus usuarios de conformidad con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales (LOPDGDD).

**Datos que recogemos**

- **Concesionarios:** nombre, email, teléfono, información de empresa, datos de facturación.
- **Compradores:** nombre, email, teléfono (únicamente cuando contactan a través del formulario de lead).
- **Datos de uso:** páginas visitadas, vehículos consultados, búsquedas realizadas.

**Finalidad del tratamiento**

- Gestión del contrato de suscripción con concesionarios.
- Facilitar el contacto entre compradores y dealers.
- Mejora de la plataforma y análisis de uso.
- Comunicaciones comerciales (solo con consentimiento explícito).

**Conservación de datos**

Los datos se conservan durante el tiempo necesario para la prestación del servicio y durante los plazos legalmente exigibles.

**Derechos**

Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición escribiendo a: privacidad@blackseriesmarket.com

**Cookies**

Utilizamos cookies técnicas necesarias para el funcionamiento del sitio y, con tu consentimiento, cookies analíticas. Consulta nuestra Política de Cookies para más información.
    `.trim(),
  },
  'cookies': {
    title: 'Política de Cookies',
    content: `
**¿Qué son las cookies?**

Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web.

**Cookies que utilizamos**

| Tipo | Finalidad | Duración |
|------|-----------|----------|
| Técnicas (sesión) | Mantener la sesión del usuario autenticado | Sesión |
| Preferencias | Recordar idioma y configuración | 1 año |
| Analíticas | Analizar el uso del sitio (datos agregados y anonimizados) | 90 días |

**Gestión de cookies**

Puedes configurar tu navegador para rechazar todas las cookies o para que te avise cuando se envía una cookie. Ten en cuenta que algunas funcionalidades del sitio pueden no estar disponibles si rechazas las cookies técnicas.

**Cookies de terceros**

Podemos utilizar servicios de análisis de terceros (como Supabase Analytics) que instalan sus propias cookies bajo sus propias políticas de privacidad.
    `.trim(),
  },
  'terminos': {
    title: 'Términos de Uso',
    content: `
**Aceptación de los términos**

Al registrarte en Black Series Market como concesionario, aceptas estos términos de uso en su totalidad.

**Condiciones para concesionarios**

1. Debes ser un profesional del sector de la automoción con actividad económica registrada.
2. Los vehículos publicados deben cumplir los criterios de calidad editorial del marketplace.
3. La información publicada sobre los vehículos debe ser veraz y actualizada.
4. Estás obligado a retirar o marcar como vendido cualquier vehículo que ya no esté disponible.
5. Queda prohibida la publicación de vehículos con documentación incompleta, robados o con cargas ocultas.

**Criterios de admisión de vehículos**

- Coches: precio de mercado superior a 40.000€
- Motos: precio de mercado superior a 15.000€
- Marcas convencionales (BMW, Mercedes-Benz, Audi, Ford, etc.): solo modelos de altas prestaciones verificados

**Suscripciones y pagos**

Las suscripciones se facturan mensualmente mediante pago automático con tarjeta de crédito a través de Stripe. La cancelación es posible en cualquier momento con efecto al final del periodo facturado.

**Resolución de cuenta**

Black Series Market se reserva el derecho de suspender o cancelar cuentas que incumplan estos términos, sin reembolso de la parte proporcional del periodo en curso.

**Modificaciones**

Black Series Market puede modificar estos términos notificándolo con 30 días de antelación por email.
    `.trim(),
  },
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = LEGAL_CONTENT[slug]
  return { title: page?.title || 'Legal' }
}

export default async function LegalPage({ params }: PageProps) {
  const { slug } = await params
  const page = LEGAL_CONTENT[slug]
  if (!page) notFound()

  // Simple markdown-like rendering
  function renderContent(text: string) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
        return <h2 key={i} className="font-display text-xl font-light text-bsm-text-primary mt-8 mb-3">{line.slice(2, -2)}</h2>
      }
      if (line.startsWith('| ')) {
        return null // Skip table lines (rendered separately below if needed)
      }
      if (line.match(/^\d+\./)) {
        return <li key={i} className="text-bsm-text-secondary text-sm leading-relaxed mb-2 ml-4">{line.replace(/^\d+\. /, '')}</li>
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="text-bsm-text-secondary text-sm leading-relaxed mb-2 ml-4">{line.slice(2)}</li>
      }
      if (line.trim() === '') {
        return <div key={i} className="h-2" />
      }
      return <p key={i} className="text-bsm-text-secondary text-sm leading-relaxed mb-2">{line}</p>
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Legal</span>
        </div>
        <h1 className="section-title">{page.title}</h1>
        <p className="text-xs text-bsm-text-muted mt-3">
          Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="bg-surface border border-bsm-border p-8">
        {renderContent(page.content)}
      </div>
    </div>
  )
}
