# Legal — decisiones pendientes de H (no auto-resueltas)

> Generado 2026-08-27 tras la auditoría legal de la plataforma (RGPD/LSSI-CE/DSA/P2B) y la aplicación de
> las correcciones textuales sobre `/legal/condiciones-profesionales`, `/legal/aviso-legal`,
> `/legal/privacidad`, `/legal/terminos`. Estos tres puntos dependen de datos de negocio reales o de una
> decisión que no corresponde tomar por defecto — el texto legal se ha dejado en formulación neutra/de
> capacidad ("podrá solicitar y verificar...") mientras no haya respuesta, nunca afirmando un cumplimiento
> no verificado.

## 1. DSA art. 19 — ¿KAZAWEB, S.L.U. es "microempresa o pequeña empresa"?

El Reglamento de Servicios Digitales (UE) 2022/2065 exime a microempresas y pequeñas empresas (recomendación
2003/361/CE: <50 empleados y <10M€ de facturación/balance anual) de las obligaciones de los arts. 20-28
(sistema interno de gestión de reclamaciones más formal, resolución extrajudicial de litigios reforzada,
medidas contra notificantes/notificados abusivos, comprobación reforzada frente a menores, etc.). Los
arts. 30-32 (verificación de comerciantes / trazabilidad KYBC) están sujetos a una exención de tamaño
distinta (art. 29).

**Qué falta para decidir:** nº de empleados y facturación/balance anual de KAZAWEB, S.L.U.

**Impacto si NO se cumple la exención:** habría que construir un sistema más formal de gestión de
reclamaciones internas y confirmar el resto de obligaciones DSA de plataforma "no exenta" antes de escalar
volumen. Si SÍ se cumple, el texto actual (capacidad discrecional, sin comprometerse a procesos que hoy no
existen) ya es conforme.

**Mientras no haya respuesta:** el texto legal no afirma ni niega la exención — se limita a describir lo que
la plataforma hace hoy (revisión por soporte, sin herramienta de reclamaciones formal separada).

## 2. DSA art. 30 — ¿aplica la verificación reforzada de comerciantes (KYBC) y hace falta construirla?

Ver también `docs/legal-pending-data.md` §2 (análisis previo de 2026-07-20, sigue vigente). El art. 30
exige, si es aplicable: copia de documento de identidad del representante, extracto del registro mercantil,
autocertificación del profesional, y **mostrar esos datos a los compradores** en el perfil público del
showroom (no solo recopilarlos en el alta).

Hoy `condiciones-profesionales` describe la verificación como una **facultad** de KAZAWEB, S.L.U.
("podrá solicitar y verificar...", "podrá dar lugar a la suspensión hasta su subsanación") — es
correcto y no compromete a nada que no exista, pero **no implementa** el sistema completo del art. 30 si
resultara aplicable: no hay recopilación estructurada de documento de identidad/registro mercantil en el
formulario de alta, ni visualización pública de esos datos en el perfil del showroom.

**Qué falta para decidir:** si el volumen/naturaleza de la actividad hace aplicable el art. 30 (sujeto a la
misma exención de tamaño del punto 1, vía art. 29), y si se decide construir el flujo completo de alta con
subida de documento + extracto registral + su visualización en el perfil público.

**Mientras no haya respuesta:** no construir el flujo de verificación reforzada; el texto legal se mantiene
en formulación de capacidad, no de compromiso.

## 3. Garantía legal en vehículos de segunda mano — el texto ya describe el marco legal, no un compromiso propio

Nota aparte, no bloqueante: el texto de `/legal/terminos` y `/legal/condiciones-profesionales` ya explica el
régimen legal general (3 años por defecto, pactable a un mínimo de 1 año, decisión entre vendedor
profesional y consumidor) — es información normativa, no una promesa de Black Label Market, que no vende los
vehículos. No requiere decisión salvo que en el futuro KAZAWEB quiera imponer contractualmente a los
showrooms un plazo mínimo superior al legal como condición de publicación (no se ha planteado).

---

Otros TODO puntuales quedan marcados inline en el propio código legal, no repetidos aquí:
- `app/(public)/legal/[slug]/page.tsx` — exportación de datos en 30 días tras baja: marcado como aspiracional
  hasta que exista el mecanismo operativo real.
