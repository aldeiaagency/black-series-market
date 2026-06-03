import { redirect } from 'next/navigation'

// URL canónica movida a /vehiculos-a-la-carta
// Este redirect mantiene compatibilidad con enlaces antiguos
export default function BusquedaPrivadaPage() {
  redirect('/vehiculos-a-la-carta')
}
