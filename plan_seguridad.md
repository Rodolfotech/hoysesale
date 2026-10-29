# Plan de seguridad y escalabilidad — HoySeSale.cl

Plan para mejorar la seguridad y la escalabilidad del proyecto. Cada tarea tiene un criterio de éxito verificable.

## Fase 0: desbloquear producción (prioridad inmediata)

1. **Aplicar las migraciones en producción.**
   Requiere confirmación explícita (ver `SPEC.md`). Al aplicarlas, quitar la regla de `omit` de `aboutImages` en `src/server/db.ts` y volver a incluir el campo en `PUBLIC_BUSINESS_SELECT` (`src/server/services/businesses.ts`).
   *Criterio:* `GET /api/businesses/<slug>` responde 200 con `aboutImages`.

2. **Publicar los cambios desde una rama `fix/`.**
   Seguir el flujo de `SPEC.md`: rama, commit, push, merge local con `--no-ff`. Revisar primero el preview de Vercel.
   *Criterio:* en producción, el login (correo y Google) y la página del negocio funcionan; crear y editar página responden sin error.

## Fase 1: seguridad

1. **Límite de peticiones compartido.**
   Hoy el contador vive en memoria de cada instancia de Vercel (`src/server/rate-limit.ts`), así que no es global. Migrar a un almacén compartido (Upstash Redis o similar) para la API general y el login.
   *Criterio:* un cliente que cambia de instancia sigue limitado (prueba con varias peticiones seguidas).

2. **Revisión de URL con menos consultas y con límite.**
   `checkBusinessSlug` carga todas las categorías en cada variante y puede revisar hasta 998 candidatos. Cargar las categorías una sola vez, consultar las variantes en un solo paso y aplicar el límite de peticiones a `/api/businesses/check-slug`.
   *Criterio:* como máximo 2 consultas a categorías por petición; el endpoint responde 429 al superar el límite.

3. **Cabeceras de seguridad.**
   Agregar en `next.config.ts`: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` y `Strict-Transport-Security`.
   *Criterio:* el sitio carga sin errores de CSP y `securityheaders.com` da al menos calificación B.

4. **Auditoría de dependencias.**
   Ejecutar `pnpm audit`, actualizar las dependencias con vulnerabilidades críticas y altas, y documentar las que queden.
   *Criterio:* sin vulnerabilidades críticas ni altas sin justificar.

5. **Rotar secretos y limpiar documentos.**
   Rotar los secretos expuestos en conversaciones (lista en `SPEC.md`). Quitar credenciales de `README.md` y de los documentos del repositorio. Confirmar que `.env` sigue ignorado por git.
   *Criterio:* `git grep` no encuentra contraseñas ni tokens en el historial reciente; los secretos nuevos están solo en Vercel.

6. **Pruebas automáticas de autorización.**
   Pasar la batería de `api-check` (hoy en un script local) al repositorio. Cada endpoint protegido debe tener una prueba de "sin sesión" (401) y otra de "otro usuario" (403).
   *Criterio:* las pruebas corren con `pnpm test` y pasan.

7. **Cookies y sesión.**
   Verificar que la cookie `access_token` sea `httpOnly`, `secure` en producción y `sameSite=lax`. Revisar la duración de 7 días y evaluar una renovación.
   *Criterio:* la cabecera `Set-Cookie` de producción incluye `HttpOnly; Secure; SameSite=Lax`.

## Fase 2: escalabilidad

1. **Caché de la página del negocio.**
   Usar `revalidate` en `src/app/(main)/[slug]/page.tsx` y revalidar por etiqueta (`revalidateTag`) al guardar cambios del negocio.
   *Criterio:* una segunda visita a la misma página no hace consultas a la base (verificar en logs de Prisma).

2. **Listado de categorías liviano.**
   `listCategories` devuelve todos los eventos de cada categoría. Cambiarlo a conteos (`_count`) o paginación.
   *Criterio:* la respuesta de `GET /api/categories` pesa menos de 5 KB con la base actual.

3. **Índices en la base.**
   Revisar las consultas de eventos publicados (por ventana de publicación y fecha) y de eventos por dueño. Agregar índices según `EXPLAIN`.
   *Criterio:* las consultas principales usan índice (sin escaneo secuencial en tablas grandes).

4. **Prueba de carga.**
   Medir la página del negocio y `GET /api/events` con una herramienta de carga (k6 o similar) con carga moderada.
   *Criterio:* el 95% de las respuestas responde en menos de 500 ms.

5. **Monitoreo.**
   Integrar un servicio de errores (Sentry) y alertas de errores 5xx en Vercel.
   *Criterio:* un error de servidor genera una alerta en menos de 5 minutos.

## Fase 3: calidad y proceso

1. **Integración continua en cada PR.**
   Ejecutar type check, lint, pruebas y build en GitHub Actions.
   *Criterio:* un PR con errores no se puede mergear.

2. **Limpiar errores de lint.**
   Quedan 20 errores, la mayoría en código que ya existía (`Profile`, `ReviewsSection`, `BusinessContentManager`, `MediaUploader`).
   *Criterio:* `pnpm lint` sin errores.

3. **Documentación viva.**
   Mantener `PLAN.md`, `SPEC.md` y este archivo al día con cada entrega. Convertir `copia.md` en documentación de arquitectura.
   *Criterio:* cada fase cerrada queda marcada en `PLAN.md`.

## Orden sugerido

Fase 0 → 1.1 → 2.1 → 1.6 → 1.5 → el resto.

La Fase 0 es la única que bloquea el uso del sitio. Las demás pueden hacerse en paralelo, una rama por tarea.
