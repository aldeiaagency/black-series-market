// Constantes compartidas de la newsletter (captura + doble opt-in con Brevo).
// Vive aparte de las rutas API: un route handler de Next.js solo puede exportar
// los métodos HTTP y unas pocas constantes de configuración reservadas, nada más.
// Cliente y servidor importan de aquí para que el texto/versión de consentimiento
// y la lista de temas nunca diverjan entre lo que se muestra y lo que se valida/registra.

export const NEWSLETTER_CONSENT_VERSION = '2026-08-31'

export const NEWSLETTER_CONSENT_TEXT =
  'Quiero recibir comunicaciones comerciales de Black Label Market por email sobre los temas que ' +
  'marque. Puedo retirar mi consentimiento en cualquier momento desde cualquier envío. He leído la ' +
  'Política de Privacidad.'

interface NewsletterTopic {
  id: string
  brevoListId: number
  name: string
  description: string
  active: boolean
}

// Fuente única de los temas — el componente de UI y las rutas API leen de aquí.
// "nuevas_llegadas" (lista Brevo id 5) ya existe en Brevo pero `active: false` hasta
// que el digest EM1 cumpla su propio gate de volumen (S5.3) — mostrarlo antes
// prometería un envío que todavía no puede cumplirse.
export const NEWSLETTER_TOPICS: NewsletterTopic[] = [
  {
    id: 'seleccion_mensual',
    brevoListId: 4,
    name: 'Selección mensual',
    description: 'Una edición al mes: unidades destacadas, un dato de mercado, una guía.',
    active: true,
  },
  {
    id: 'nuevas_llegadas',
    brevoListId: 5,
    name: 'Nuevas llegadas',
    description: 'Aviso cuando entra stock relevante — arranca solo con catálogo suficiente.',
    active: false,
  },
]

export const NEWSLETTER_ACTIVE_TOPICS = NEWSLETTER_TOPICS.filter((t) => t.active).map((t) => t.id)

export const NEWSLETTER_TOPIC_LIST_IDS: Record<string, number> = Object.fromEntries(
  NEWSLETTER_TOPICS.map((t) => [t.id, t.brevoListId]),
)
