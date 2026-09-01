// Serializacion segura de JSON-LD para <script type="application/ld+json">.
//
// `JSON.stringify()` no neutraliza `</script>` ni los separadores de linea U+2028/U+2029, asi
// que interpolarlo directo en `dangerouslySetInnerHTML` permite a un dealer con control sobre
// campos como descripcion/nombre/direccion (ficha de vehiculo, ficha de showroom) cerrar el
// <script> JSON-LD con "</script><script>...</script>" e inyectar JS ejecutable en la pagina
// publica (auditoria de seguridad 2026-09-02, P0.1). Escapar estos caracteres es el fix
// estandar recomendado por OWASP para JSON embebido en HTML.
const LINE_SEPARATOR = String.fromCharCode(0x2028)
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029)

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .split('<').join('\\u003c')
    .split(LINE_SEPARATOR).join('\\u2028')
    .split(PARAGRAPH_SEPARATOR).join('\\u2029')
}
