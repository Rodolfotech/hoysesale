# Plan de seguridad y escalabilidad — HoySeSale.cl

Estado de la seguridad y la escalabilidad del proyecto. Cada tarea pendiente tiene un criterio de éxito verificable. Actualizado el 30-10-2026.

## Estado actual

- **Producción:** esquema de base de datos al día. Falta desplegar el código de esta entrega.
- **Código:** cabeceras, límite compartido, pruebas de permisos y filtrado de pestañas ocultas terminados y probados en local.
- **Próximo paso:** rotar los secretos y desplegar con revisión del preview.
- **Lecciones aplicadas:** ver "Errores que ya cometimos" en `README.md`.

## Hecho

| Tarea | Resultado |
|---|---|
| Esquema en producción | SQL manual verificado contra `information_schema`. RLS activo en las tablas nuevas |
| Cabeceras de seguridad | CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`. Sin bloqueos en páginas principales con dos instancias de producción local |
| Límite compartido | Login, registro, revisión de correo y contraseña, en Postgres. Si falla, deja pasar. Comprobado entre dos instancias |
| Login justo con redes compartidas | Límite estricto por IP y correo: 20 personas tras una IP no se bloquearon |
| Pestañas ocultas | Filtradas en el servidor, en HTML y API |
| Pruebas de autorización | En `pnpm test`: todas las rutas responden 401 sin sesión, salvo las declaradas públicas |
| Asistentes de eventos | La ruta era pública. Ahora solo el dueño del evento o un administrador |
| Token de recuperación | Ya no sirve como sesión |
| Cookies | `HttpOnly`, `Secure` y `SameSite=Lax` comprobados en un build de producción local |
| Dependencias | `pnpm audit --prod` sin vulnerabilidades conocidas |
| Lint | 0 errores. 11 casos de `set-state-in-effect` quedaron justificados con un comentario, sin rediseñar esos efectos |
| Validaciones de entrada | Teléfono, Instagram, URL, horarios, imágenes y textos de contacto en el servidor |

## Fase 0: publicar

1. **Rotar secretos (lo hace el dueño del proyecto).**
   Cambiar `JWT_SECRET`, la contraseña de la base y la clave de servicio de Supabase en sus paneles, y actualizarlos en Vercel. Al cambiar `JWT_SECRET` se cierran todas las sesiones. La lista de secretos expuestos estaba en `SPEC.md`, que no está en este repositorio.
   *Criterio:* los valores antiguos dejan de funcionar y el sitio sigue operativo.

2. **Desplegar desde una rama con Pull Request.**
   Revisar el preview de Vercel antes del merge. Comprobar que RLS no afecte a la app: si fallan login o micro-sitios, revisar el rol de `DATABASE_URL`.
   *Criterio:* en producción funcionan login, registro, micro-sitios y subida de imágenes a Supabase, sin avisos de CSP en la consola.

3. **Probar uso real desde otras regiones.**
   Esta entrega se probó solo en local.
   *Criterio:* la página del negocio carga en un tiempo aceptable desde fuera de Chile.

## Fase 1: seguridad

1. **Límite global compartido.**
   Las 300 peticiones por minuto por IP siguen en memoria de cada instancia. Evaluar un almacén compartido o el firewall de Vercel.
   *Criterio:* un cliente que cambia de instancia sigue limitado.

2. **Revisión de URL con menos consultas y con límite.**
   `checkBusinessSlug` carga todas las categorías en cada variante y puede revisar hasta 998 candidatos.
   *Criterio:* como máximo 2 consultas a categorías por petición, y el endpoint responde 429 al superar el límite.

3. **CSP más estricta.**
   Hoy usa `'unsafe-inline'` en scripts. Reemplazarlo por nonces requiere páginas dinámicas.
   *Criterio:* CSP sin `'unsafe-inline'` en scripts y sin bloqueos.

4. **Quitar credenciales de los documentos.**
   Confirmar que no queden en documentos externos al repositorio. En este repositorio no se encontraron contraseñas reales en el historial con el patrón revisado.
   *Criterio:* `git grep` no encuentra contraseñas ni tokens.

5. **Duración de la sesión.**
   Revisar los 7 días y evaluar una renovación.
   *Criterio:* decisión documentada.

## Fase 2: escalabilidad

1. **Caché de la página del negocio.**
   La página lee la sesión para filtrar pestañas, así que cualquier caché debe respetar esa diferencia entre dueño y visitante.
   *Criterio:* una segunda visita de un visitante no consulta la base.

2. **Listado de categorías liviano.**
   `listCategories` devuelve todos los eventos de cada categoría.
   *Criterio:* la respuesta de `GET /api/categories` pesa menos de 5 KB con la base actual.

3. **Índices en la base.**
   Revisar las consultas de eventos publicados y de eventos por dueño.
   *Criterio:* las consultas principales usan índice.

4. **Prueba de carga.**
   Medir la página del negocio y `GET /api/events`.
   *Criterio:* el 95% de las respuestas responde en menos de 500 ms.

5. **Monitoreo.**
   Integrar un servicio de errores y alertas de errores 5xx.
   *Criterio:* un error de servidor genera una alerta en menos de 5 minutos.

## Fase 3: calidad y proceso

1. **Integración continua en cada PR.**
   Ejecutar type check, lint, pruebas y build en GitHub Actions.
   *Criterio:* un PR con errores no se puede mergear.

2. **Pruebas de navegador en el repositorio.**
   Las de Playwright se hicieron fuera del repositorio.
   *Criterio:* corren con un comando y cubren login, micro-sitio y edición.

3. **Registrar las migraciones de producción en Prisma.**
   Marcarlas como aplicadas para volver a usar `prisma migrate deploy`.
   *Criterio:* `prisma migrate status` contra producción no muestra pendientes.

4. **Revisar las advertencias de lint y los efectos justificados.**
   *Criterio:* `pnpm lint` sin advertencias.

## Orden sugerido

Fase 0 → 1.1 → 2.1 → 3.1 → el resto.

La Fase 0 es la única que bloquea la publicación. Las demás pueden hacerse en paralelo, una rama por tarea.
