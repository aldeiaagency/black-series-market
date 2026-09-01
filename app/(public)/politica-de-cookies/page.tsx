import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Política de cookies — Black Label Market',
  description: 'Información sobre el uso de cookies en Black Label Market.',
  alternates: { canonical: '/legal/cookies' },
}

export default function PoliticaDeCookiesPage() {
  permanentRedirect('/legal/cookies')
}
