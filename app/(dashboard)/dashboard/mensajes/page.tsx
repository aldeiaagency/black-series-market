import { redirect } from 'next/navigation'

// Redirigir al kanban oficial de oportunidades.
export default function MensajesRedirect() {
  redirect('/dashboard/oportunidades')
}
