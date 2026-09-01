import { serializeJsonLd } from '@/lib/json-ld'

// Unico punto de entrada para insertar JSON-LD en el arbol. Ver lib/json-ld.ts para el porque
// del escapado (auditoria de seguridad 2026-09-02, P0.1 — XSS persistente).
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
