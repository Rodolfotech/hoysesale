# HoySeSale.cl

Directorio de negocios y cartelera de eventos de La Araucanía. Frontend y backend son **una sola app de Next.js 16** (App Router): las páginas están en `src/app/` y la API en `src/app/api/` (route handlers).

## Stack

- Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · pnpm 12
- Prisma 7 con `@prisma/adapter-pg` (PostgreSQL / Supabase)
- Sesión con cookie httpOnly `access_token` (JWT de 7 días)
- Imágenes: Supabase Storage en producción; `uploads/` solo en desarrollo
- zod para validar entradas · nodemailer para recuperar contraseña · image-size para medidas de imágenes

## Puesta en marcha (local)

```bash
pnpm install                # también genera el cliente de Prisma (postinstall)
cp .env.example .env        # completa DATABASE_URL, JWT_SECRET y las demás variables
pnpm db:migrate             # aplica migraciones pendientes en la base local
pnpm seed                   # crea el admin si no existe (ADMIN_EMAIL / ADMIN_PASSWORD)
pnpm dev                    # http://localhost:5173
```

El puerto **5173** se mantiene porque las URL de redirección de Google e Instagram están registradas con él.

### Scripts

| Script | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo en el puerto 5173 |
| `pnpm build` | `prisma generate && next build` |
| `pnpm start` | Arranca el build de producción en el puerto 5173 |
| `pnpm test` | Pruebas unitarias y de permisos de la API (Vitest) |
| `pnpm lint` | ESLint. Sin errores; quedan advertencias |
| `pnpm db:migrate` | `prisma migrate deploy`. Solo en local: ver [Base de datos](#base-de-datos) |
| `pnpm db:generate` | Regenera el cliente de Prisma en `src/generated/prisma` |
| `pnpm seed` | Crea la cuenta admin si no existe. No sobrescribe nada |

## Estructura

```
src/
├── app/                      # Rutas (App Router) y API
│   ├── (main)/               # Páginas públicas (Navbar y Footer)
│   ├── api/                  # Route handlers (ver lista abajo)
│   ├── uploads/[...path]/    # Sirve uploads/ solo con STORAGE_DRIVER=local
│   └── sitemap.ts · robots.ts
├── views/                    # Pantallas (Profile, BusinessPage, Login, etc.)
├── components/ui/            # Primitivas reutilizables: Button, Card, Modal, ConfirmDialog, Popover, Switch,
│                             # EditableField, Pagination, SectionTabs, UnderlineTabs, ImageCarousel, TagInput,
│                             # FormInput, PhoneInput, InstagramInput, WebsiteInput...
├── features/
│   ├── business/             # Micro-sitio
│   │                         # Formulario: BusinessForm, OfferItemForm, OfferExtras, AboutImages,
│   │                         #   BusinessScheduleForm, BusinessImagePicker, BusinessDescriptionField
│   │                         # Página pública: BusinessTabs, ProductsSection, ServicesSection, EventsCountdown,
│   │                         #   ReviewsSection, BusinessHoursCard, BusinessStatusBadge, AmenityList, BottomBar
│   │                         # Edición en la página: BusinessOwnerBar, BusinessImageEdit, BusinessDescriptionEdit,
│   │                         #   BusinessHoursEdit, BusinessContactEdit, AboutImagesEdit, OfferItemActions,
│   │                         #   TabVisibilitySwitch, ContactVisibility
│   │                         # Lógica: useIsOwner, useAboutImages, offer.ts, format.ts
│   └── media/                # ImagePicker, MediaUploader
├── hooks/                    # usePersistentState, usePagedItems, useFileDrop, useRefresh, useCountdown
├── lib/                      # Código compartido cliente/servidor (sin 'use client'):
│                             # hours.ts, media-limits.ts, api-error.ts, business.ts (tipos, listas y redactHiddenTabs)
├── constants/                # Comunas, categorías, comodidades
├── api/                      # Cliente axios (baseURL /api)
└── server/                   # Solo servidor
    ├── db.ts                 # Cliente Prisma (singleton)
    ├── http.ts               # route(), errores { statusCode, message }, validación zod
    ├── validation.ts         # Esquemas de entrada
    ├── auth/session.ts       # JWT, cookie, requireUser / requireAdmin
    ├── rate-limit.ts         # Límite en memoria (global) y compartido en Postgres (acciones sensibles)
    ├── services/             # auth, users, events, attendees, categories, businesses,
    │                         # media, social, admin, mail, seed
    └── storage/              # Puerto de almacenamiento: local o Supabase
prisma/
├── schema.prisma · migrations/ · seed.ts
└── production/pendiente.sql  # Último SQL manual para producción (ya aplicado)
```

### Rutas de API principales

`/api/auth/*` (login, register, me, logout, google, instagram, forgot-password, reset-password) · `/api/users/*` (perfil, eliminar cuenta) · `/api/events/*` (listado, detalle, medios, interacciones) · `/api/attendees/*` · `/api/categories` · `/api/businesses/*` (micro-sitio, productos, servicios, destacados, reseñas, `check-slug`, `me/about-images`, `me/item-image`) · `/api/social/*` (Instagram, cron `refresh-images`) · `/api/control-panel-7f3a/*` (admin) · `/api/health`.

## Reglas de datos (importante)

- **El perfil es la fuente de verdad** de nombre, comuna y categoría de la empresa. Se editan en **Perfil → Datos de empresa**.
- **Datos de contacto:** dirección, teléfono, Instagram y sitio web son las mismas columnas de `users`. Se editan en el perfil o con **Editar** en la pestaña Contáctanos, y el cambio se ve en ambos lados. Instagram y sitio web avisan esto antes de guardar.
- **El resto del micro-sitio:** la URL, el WhatsApp y cómo llegar se editan en `BusinessForm`. Todo lo demás se edita con los botones de la propia página, que solo ve el dueño.
- Al crear la página, la URL se calcula desde el nombre del perfil. El servidor también toma nombre y dirección del perfil si la petición no los trae.
- **Campos obligatorios para crear:** URL disponible. Nombre y dirección vienen del perfil y deben estar completos ahí.
- **Vaciar un campo:** el formulario envía `null` para los campos opcionales vacíos. Un `undefined` no se guarda y deja el valor anterior.
- **Formato de datos:**
  - Teléfono: `+569` + 8 dígitos; el primer dígito es de 3 a 9.
  - Instagram: `@usuario`, hasta 30 caracteres (letras, números, `_` y `.`).
  - Horario (JSON en `users.hours`): la clave es el día (`lunes`) o una fecha especial (`2026-12-25`), que tiene prioridad. El valor es `cerrado` o uno o más turnos (`09:00-13:00,15:00-19:00`). Un turno como `20:00-02:00` cruza la medianoche.
  - **El estado abierto/cerrado nunca se guarda:** lo calcula `getBusinessStatus()` (`src/lib/hours.ts`) con el horario y la hora de Chile. El antiguo valor manual `abierto` ya no es válido y se trata como día sin horario.
  - Dirección: texto `Calle 123` (se separa en calle y número en el formulario).
- **Eventos vigentes:** los listados públicos y la página del negocio muestran solo eventos publicados cuya fecha no pasó (`activeEvents()`). Un evento sigue visible hasta que termina su día en Chile, porque no tiene hora de término.
- **Servicios:** tarjetas con imagen, hasta 3 etiquetas de texto libre (20 caracteres cada una) y botón Cotizar por WhatsApp.
- **Imágenes:** logo JPG, PNG, WEBP o GIF (se recomienda WEBP) y máximo 10 KB; portada JPG, JPEG o WEBP, 1200 × 400 px y máximo 90 KB; fotos de Nosotros JPG, PNG o WEBP, máximo 4 MB y 3 fotos; imagen de producto o servicio solo WEBP y máximo 2 MB (subida propia en `/api/businesses/me/item-image`, que también revisa el contenido real del archivo).

## Micro-sitio público

Cada negocio tiene su página en `/<slug>`. La pestaña del navegador muestra el slug y el ícono de HoySeSale (`src/app/icon.svg`).

- **Cabecera:** portada centrada y completa (proporción 3:1), logo sobre su borde, estadísticas debajo. El nombre queda como `h1` oculto para buscadores y lectores de pantalla.
- **Ancho:** el mismo contenedor de Eventos (`max-w-7xl mx-auto px-4`).
- **Pestañas:** en orden alfabético. Abre en Eventos o, si está oculta, en la primera visible. Cada navegador recuerda la pestaña por negocio mientras dura la sesión.

| Pestaña | Contenido |
|---|---|
| Contáctanos | Dirección, teléfono, Instagram (`@usuario`) y sitio web (dominio), cada uno con su texto elegido |
| Eventos | Eventos vigentes con cuenta regresiva y Reservar cupo |
| Horario | Estado actual y horario de la semana |
| Nosotros | Carrusel de fotos y descripción (máximo 2000 caracteres) con comodidades |
| Productos | Tarjetas con imagen, precio y + Agregar por WhatsApp; 6 por página |
| Reseñas | Valoración y comentarios |
| Servicios | Tarjetas con imagen, etiquetas y Cotizar por WhatsApp; 6 por página |

### Controles del dueño

Solo los ve el dueño (`useIsOwner`). El servidor valida cada cambio por separado.

- **Logo:** reemplazar la imagen y elegir marco redondo o cuadrado. El marco en uso se ve opaco.
- **Portada:** reemplazar la imagen. Logo y portada aceptan arrastrar archivos.
- **Fotos de Nosotros:** agregar, quitar, arrastrar archivos y reordenar. Se publican con Guardar.
- **Descripción, Horario y Contacto:** cada uno con su Editar y su ventana.
- **Productos y servicios:** Editar y Eliminar en cada tarjeta. Eliminar pide confirmación. Agregar producto y Agregar servicio abren su formulario con Eventos y Comodidades (`OfferExtras`); allí cada comodidad se guarda al marcarla.
- **Eventos:** Ir a publicaciones activas (`/create-event?tab=activas`).
- **Interruptores:** Ocultar pestaña en Contáctanos, Eventos, Horario, Productos, Reseñas y Servicios. Nosotros siempre queda visible. En Contáctanos, Mostrar en todas las pestañas pone los datos de contacto debajo de cada una.

### Textos de contacto

| Dato | Opciones | Por defecto |
|---|---|---|
| Dirección | Dirección, Ubicación, Dónde estamos, Visítanos en | Dirección |
| Teléfono | Llámanos, Llámanos al, Haz tu pedido al, Reserva al, Atención, Consultas, Contacto | Llámanos al |
| Instagram | Instagram, Síguenos en Instagram, Nuestro Instagram, Síguenos, Ver, Conoce más en Instagram, Descubre nuestras novedades | Síguenos en Instagram |
| Sitio web | Sitio web, Página web, Web, Web oficial, Visitar sitio web, Ir al sitio web, Conoce más en nuestra web, Sitio oficial | Página web |

Las listas están en `src/lib/business.ts` y el servidor rechaza cualquier otro valor. Instagram y sitio web solo se muestran si el negocio los tiene. Se muestran con dos puntos: `Reserva al: +569...`.

## Formulario del negocio

**Crear página** y **Editar página** (botón Encuéntranos del micro-sitio) usan `BusinessForm`, con una sola pestaña:

- **Encuéntranos:** URL (con validación de disponibilidad en vivo), sitio web (prefijo `https://`), WhatsApp y cómo llegar. Al editar, WhatsApp y cómo llegar están bloqueados y cada uno tiene su botón Editar (`EditableField`). Se guardan con Guardar, que solo los envía si cambiaron.

Horario, productos, servicios, comodidades, descripción, fotos, logo y portada se agregan y cambian con los botones de la propia página.

El dueño también puede eliminar la página desde el micro-sitio. Se borra solo el micro-sitio; el perfil, la cuenta y los eventos se conservan.

## Configuración

Variables en `.env` (ver `.env.example`). Nunca subas `.env` al repositorio.

- `DATABASE_URL`: Postgres. En local, la base `eventos`. En Vercel debe estar disponible también durante el build, porque el sitemap consulta la base.
- `JWT_SECRET`: obligatorio, sin valor por defecto.
- `FRONTEND_URL`, `PUBLIC_BASE_URL`: URL pública (OAuth y enlaces de imágenes locales).
- `STORAGE_DRIVER=local`: solo desarrollo. En producción no definirlo.
- `CRON_SECRET`: protege `/api/social/refresh-images` (cron diario en `vercel.json`).
- Google, Instagram, SMTP, Supabase: ver `.env.example`.

## Base de datos

- **Local:** 24 migraciones en `prisma/migrations`. Se aplican con `pnpm db:migrate`.
- **Producción (Supabase):** esquema al día desde el 30-10-2026. Se aplicó con SQL manual y se verificó contra `information_schema`. Prisma no lo tiene registrado, así que **no ejecutes `prisma migrate deploy` contra producción** sin marcar antes esas migraciones como aplicadas.
- **RLS:** activado en las tablas nuevas de producción para que la API pública de Supabase no las exponga. La app se conecta directo con `DATABASE_URL`.

### Tablas

| Tabla | Contenido |
|---|---|
| `users` | Cuenta, perfil y datos del micro-sitio |
| `events` | Eventos |
| `categories` | Categorías de eventos |
| `attendees` | Asistentes a eventos |
| `event_media` | Medios de eventos |
| `event_interactions` | Métricas de eventos |
| `instagram_clicks` | Clics a Instagram |
| `admin_audit_logs` | Auditoría del panel de administración |
| `business_products` | Productos, con imagen, precio y etiqueta |
| `business_services` | Servicios, con imagen y etiquetas (`imageUrl`, `tags`) |
| `business_highlights` | Destacados |
| `business_reviews` | Reseñas, una por autor y negocio |
| `rate_limits` | Contadores de intentos. Se guarda un hash: no contiene correos ni IP |

### Columnas del micro-sitio

- **`users`:** `slug`, `category`, `logoUrl`, `logoShape`, `coverUrl`, `businessDescription`, `aboutImages`, `hours`, `amenities`, `whatsappReservations`, `mapUrl`.
- **Textos:** `phoneLabel`, `addressLabel`, `instagramLabel`, `websiteLabel`.
- **Visibilidad:** `hiddenTabs` (lista de pestañas ocultas) y `contactInAllTabs`.
- **`events`:** `entryType`, `audience`, `indoor`, `amenities`.

### Cambios futuros de esquema

Una columna nueva en `users` afecta a casi todo: sin ella fallan login y registro. Aplícala en producción **antes** de desplegar, y agrégala a `prisma/production/pendiente.sql`.

## Despliegue (Vercel)

Un solo proyecto con Root Directory en la raíz y framework Next.js. Variables de `.env.example`, sin `STORAGE_DRIVER`. El build ejecuta `prisma generate` y no aplica migraciones. Usa un Pull Request y revisa el preview antes del merge: si comparte la base de producción, lo que crees ahí son datos reales. Después verifica en Vercel que el deployment de producción corresponda al commit esperado.

## Errores que ya cometimos (no repetir)

1. **Funciones `'use client'` en componentes de servidor.** La página del negocio es un componente de servidor: no puede llamar funciones de un archivo con `'use client'`. Pon las funciones compartidas en `src/lib/` o `src/features/*/*.ts` sin esa marca. En desarrollo no siempre falla; el build de producción sí.
2. **Columna nueva sin migración en producción.** Si el código usa una columna que la base no tiene, fallan login, registro y micro-sitios con 500. Aplica el cambio en producción antes de desplegar. Un `omit` de Prisma protege las lecturas, pero no el registro.
3. **Cambios de Prisma sin reiniciar.** Después de `prisma generate` o de cambiar el esquema, reinicia `pnpm dev`: el servidor conserva el cliente anterior.
4. **Build con el dev corriendo.** `pnpm build` y `pnpm dev` comparten `.next`. Si la página se recarga sola (`HMR hash mismatch`), detén `pnpm dev`, borra `.next` y arráncalo otra vez.
5. **Límites distintos en frontend y servidor.** El navegador aceptaba 5 MB y el servidor 4 MB. Los límites viven en `src/lib/media-limits.ts`: úsalos en ambos lados.
6. **`undefined` en vez de `null`.** Un campo `undefined` no se actualiza, así que el dato viejo queda guardado.
7. **Dar por desplegado algo sin verificarlo.** Un merge en `main` no significa que Vercel lo haya publicado. Verifica el commit del deployment de producción.
8. **Límite de login.** Son 5 intentos por minuto por IP y correo, solo fuera de desarrollo. Antes era solo por IP, y una red compartida podía bloquear a varias personas a la vez.
9. **Cuentas de prueba sobrantes.** Las pruebas crean usuarios `rea-*@example.com`. Bórralos al terminar (`delete from users where email like 'rea-%@example.com'`).
10. **Datos sensibles en la terminal.** No imprimas valores de `.env` ni de `~/.config/hoysesale/produccion.env`.
11. **Pruebas fuera del repositorio.** La batería de API vivía en un directorio temporal y se perdió al limpiarse. Las pruebas que importan van en el repositorio.
12. **Estado guardado a mano.** Lo que se puede calcular (como abierto o cerrado) no se guarda: un valor manual termina mostrando datos falsos.
13. **Ocultar no es proteger.** Esconder algo con CSS o en el cliente lo deja en el HTML. Lo privado se filtra en el servidor (`getBusinessPageFor`).
14. **SQL distinto al del código.** Una tabla creada con otras columnas no da error al crearla, pero la app no la puede usar. Usa el SQL del repositorio y verifícalo con `information_schema`.

## Pruebas

- `pnpm test`: 96 pruebas. Cubren horarios, utilidades, filtrado de pestañas ocultas y permisos.
- `src/app/api/authorization.test.ts` recorre todas las rutas de la API. Una ruta nueva debe responder 401 sin sesión, salvo que se declare pública en esa prueba. También comprueba el panel de administración, los datos de otros usuarios y el token de recuperación de contraseña.
- Las pruebas de navegador con Playwright se hicieron fuera del repositorio. Agregarlas sigue pendiente.

## Documentos del proyecto

- `plan_seguridad.md`: estado de seguridad y escalabilidad, con criterios de éxito.
- `AGENTS.md`: reglas para agentes.
- `prisma/production/pendiente.sql`: último SQL manual aplicado en producción.
- `SPEC.md` y `PLAN.md` no están en este repositorio: están en el backend anterior.

## Seguridad en producción

- **Sesión:** cookie `access_token` con `HttpOnly`, `Secure` en producción y `SameSite=Lax`. Un token de recuperación de contraseña no sirve como sesión.
- **Cabeceras:** `next.config.ts` define CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`. Solo aplican en producción. CSP usa `'unsafe-inline'` porque la app no usa nonces, y permite imágenes de cualquier dominio `https` por Supabase e Instagram.
- **Intentos:** login, registro, revisión de correo y contraseña usan `sharedRateLimit`, con contadores en `rate_limits`, compartidos entre instancias. Si esa tabla falla, deja pasar y queda el límite en memoria: un problema interno no debe bloquear usuarios. El resto de la API tiene 300 peticiones por minuto por IP, en memoria de cada instancia.
- **Pestañas ocultas:** `getBusinessPageFor` quita su contenido en el servidor. Los visitantes no lo reciben ni en el HTML ni en la API. El contacto se conserva si está activo Mostrar en todas las pestañas.
- **Permisos:** cada ruta valida la sesión y la propiedad del dato. La lista de asistentes solo la ve el dueño del evento o un administrador. El reordenamiento de fotos solo acepta las del propio negocio.
- **Imágenes:** el servidor revisa el contenido real del archivo en logo, portada y productos. SVG no se acepta porque puede llevar código.
- **Dependencias:** `pnpm audit --prod` sin vulnerabilidades conocidas al 30-10-2026.
- **Pendiente:** ver `plan_seguridad.md`. Lo principal es rotar los secretos.

