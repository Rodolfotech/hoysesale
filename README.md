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
│                             # Accordion, FormInput, PhoneInput, InstagramInput, WebsiteInput...
│                             # FormInput, PhoneInput y WebsiteInput aceptan `info` (popover junto al nombre)
├── components/shared/        # Navbar, Footer, CookieBanner, CookieSettingsButton,
│                             # LegalPage (páginas legales con acordeón e índice)
├── features/
│   ├── profile/              # CompleteProfileModal: aviso "Completa tu perfil" con progreso y datos pendientes
│   ├── business/             # Micro-sitio
│   │                         # Formulario: BusinessForm, OfferItemForm, OfferExtras, AboutImages,
│   │                         #   BusinessScheduleForm, BusinessImagePicker, BusinessDescriptionField
│   │                         # Página pública: BusinessTabs, ProductsSection, ServicesSection, EventsCountdown,
│   │                         #   ReviewsSection, BusinessHoursCard, BusinessStatusBadge, AmenityList, BottomBar
│   │                         # Edición en la página: BusinessOwnerBar, BusinessImageEdit, BusinessDescriptionEdit,
│   │                         #   BusinessHoursEdit, BusinessContactEdit, AboutImagesEdit, OfferItemActions,
│   │                         #   TabVisibilitySwitch, ContactVisibility
│   │                         # Lógica: useIsOwner, useAboutImages, offer.ts, format.ts
│   ├── events/               # Detalle de eventos, EventMap (Google Maps con consentimiento)
│   ├── auth/                 # Botón de Google y googleMessage.ts (código de Google: mismo origen y un solo uso)
│   └── media/                # ImagePicker (con `droppable`: arrastrar a la imagen o al botón), MediaUploader
├── hooks/                    # usePersistentState, usePagedItems, useFileDrop, useRefresh, useCountdown, useConsent
├── lib/                      # Código compartido cliente/servidor (sin 'use client'):
│                             # hours.ts, media-limits.ts, api-error.ts, business.ts (tipos, listas y redactHiddenTabs),
│                             # rut.ts (validar y formatear RUT), event-price.ts (valor de entrada), map-embed.ts,
│                             # consent.ts y cookie-list.ts (cookies), legal.ts (responsable y versiones de las políticas)
├── constants/                # Comunas, categorías de la empresa (agrupadas), giros del SII (giros.ts), comodidades
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
- **Datos obligatorios del perfil:** todos los datos de la empresa (nombre, Instagram, RUT, giro, teléfono, calle, número, categoría, ciudad y comuna), salvo el **sitio web**, y todos los del administrador (nombre, apellidos, RUT y teléfono). El administrador es el representante legal de la empresa: es quien se registra e inicia sesión. El servidor rechaza vaciarlos (`null` o texto vacío) también desde Contáctanos. El registro no pide RUT, giro ni dirección: se completan en el perfil.
- **Guardado parcial del perfil:** Guardar datos envía solo los campos completos, así que se puede avanzar de a poco y nunca se borra un dato guardado. Lo escrito se valida igual (RUT, teléfono, calle y número juntos). Después de guardar, el aviso indica cuántos datos obligatorios faltan.
- **Aviso "Completa tu perfil"** (`CompleteProfileModal`): al entrar al perfil con datos obligatorios pendientes (13 en total: 9 de la empresa y 4 del administrador). Muestra el progreso y un botón por dato que abre la edición con el cursor en ese campo. "Recordar más tarde" lo cierra hasta la próxima visita. Cada campo obligatorio tiene asterisco y un popover con su explicación (`info` de `ProfileField`).
- **RUT:** se valida el dígito verificador (módulo 11, `src/lib/rut.ts`) en el formulario y el servidor. El de la **empresa** además debe ser de persona jurídica (desde 50.000.000). Se formatea mientras se escribe (`formatRutInput`: `74.000.888-5`) y se guarda con ese formato.
- **Categoría de la empresa:** select con 24 categorías en 6 grupos (`BUSINESS_CATEGORY_GROUPS` en `src/constants/business.ts`). Se guarda el nombre visible. Una categoría antigua (Café, Cervecería…) se muestra vacía y hay que elegir de nuevo.
- **Giro de la empresa:** select con 65 giros del SII en los mismos 6 grupos (`src/constants/giros.ts`). Se guarda como `Nombre (código)`, por ejemplo `Restaurantes y servicio móvil de comidas (561000)`. Un giro escrito a mano antes se muestra vacío. Los códigos no están verificados contra el SII (ver `plan.md`).
- **Comuna:** solo las 32 comunas de La Araucanía (`src/constants/comunas.ts`). Una empresa **solo publica eventos de su comuna**: el servidor rechaza otra al crear o editar, también si edita un administrador, y en los formularios la comuna del evento aparece fija. Sin comuna no se pueden publicar eventos.
- **Crear la página:** el único dato obligatorio es la **URL**, que debe ser única en el sitio. Lo demás se completa después. Las pestañas de la página las define el tipo de categoría (`availableTabs` en `src/lib/business-rules.ts`). Se calculan al mostrarla, así que cambian si cambia la categoría:

  | Tipo | Categorías | Pestañas |
  |---|---|---|
  | Servicios (9) | Restaurantes, Cafeterías, Artesanías, Moda, Estética, Spas y las 3 de Servicios profesionales | Contáctanos, Horario, Nosotros, Reseñas y Servicios |
  | Productos (7) | Bares, Comida rápida, Productores, Hogar, Tecnología, Mundo animal y Salud | Contáctanos, Horario, Nosotros, Productos y Reseñas |
  | Eventos (8) | Las 4 de Turismo y las 4 de Panoramas | Contáctanos, Eventos, Horario, Nosotros y Reseñas |
  | Sin categoría válida | — | Contáctanos, Horario, Nosotros y Reseñas |

  Las pestañas que no corresponden no las ve nadie, tampoco el dueño, y el servidor no envía su contenido. El dueño ve las mismas pestañas que el visitante, edita su contenido y puede ocultarlas con su interruptor; una pestaña que ocultó la sigue viendo él para poder volver a mostrarla.

- **Quién publica eventos** (`canPublishEvents`): solo las 8 categorías de eventos, salvo con un giro de comercio funcional (servicios de barrio y ferreterías). Servicios y productos no publican eventos. El servidor responde 403 al crear un evento sin permiso, el formulario lo avisa y el botón Publicar evento del navbar aparece deshabilitado (en escritorio el motivo se ve al pasar el mouse; en celular, bajo el botón). Una categoría antigua o vacía no publica.
- **Vaciar un campo opcional:** el formulario envía `null`. Un `undefined` no se guarda y deja el valor anterior. Los campos obligatorios no se pueden vaciar.
- **Formato de datos:**
  - Teléfono: `+569` + 8 dígitos; el primer dígito es de 3 a 9. En el perfil, `+569` va fijo en un campo y al lado los 8 dígitos con un espacio cada 4 (`8765 4321`). Un teléfono guardado con otro formato se muestra vacío.
  - Instagram: `@usuario`, hasta 30 caracteres (letras, números, `_` y `.`).
  - Horario (JSON en `users.hours`): la clave es el día (`lunes`) o una fecha especial (`2026-12-25`), que tiene prioridad. El valor es `cerrado` o uno o más turnos (`09:00-13:00,15:00-19:00`). Un turno como `20:00-02:00` cruza la medianoche.
  - **El estado abierto/cerrado nunca se guarda:** lo calcula `getBusinessStatus()` (`src/lib/hours.ts`) con el horario y la hora de Chile. El antiguo valor manual `abierto` ya no es válido y se trata como día sin horario.
  - Dirección: texto `Calle 123` (se separa en calle y número en el formulario). El servidor exige que tenga número.
  - Valor de entrada de un evento: solo números, se muestra y guarda como `$5.000` (`src/lib/event-price.ts`). Se guarda en `events.address`, que otro formulario usa como dirección, por eso solo el formulario obliga a números.
- **Imagen de un evento:** al editarlo se puede quitar con la X y subir otra, o arrastrarla. No se puede guardar sin imagen, porque desaparecería de Publicaciones activas.
- **Mapa del evento:** el detalle muestra un mapa de Google con el lugar del evento, el enlace Cómo llegar del negocio, su dirección o la comuna, en ese orden (`src/lib/map-embed.ts`). Solo se carga con consentimiento de cookies. Si el dueño ocultó Contáctanos, no se usa su dirección.
- **Eventos vigentes:** los listados públicos y la página del negocio muestran solo eventos publicados cuya fecha no pasó (`activeEvents()`). Un evento sigue visible hasta que termina su día en Chile, porque no tiene hora de término.
- **Servicios:** tarjetas con imagen, nombre (hasta 60 caracteres), descripción (hasta 200), hasta 8 etiquetas de texto libre (20 caracteres cada una, con sugerencias) y botón Cotizar por WhatsApp. El formulario Agregar servicio (`ServiceFields`, `ServiceImageDrop`) muestra contadores y un recuadro para arrastrar la imagen.
- **Imágenes:** logo JPG, PNG, WEBP o GIF (se recomienda WEBP) y máximo 10 KB; portada JPG, JPEG o WEBP, 1200 × 400 px y máximo 90 KB; fotos de Nosotros JPG, PNG o WEBP, máximo 4 MB y 3 fotos; imagen de producto solo WEBP e imagen de servicio WEBP (recomendado), JPG o PNG, ambas de máximo 2 MB (subida propia en `/api/businesses/me/item-image`, con `?type=services` para servicios, que también revisa el contenido real del archivo). Las imágenes de eventos, logo, portada, productos y servicios se pueden arrastrar sobre la imagen o sobre el botón de subir.

## Micro-sitio público

Cada negocio tiene su página en `/<slug>`. La pestaña del navegador muestra el slug y el ícono de HoySeSale (`src/app/icon.svg`).

- **Cabecera:** portada centrada y completa (proporción 3:1), logo con borde blanco sobre su borde, el nombre (`h1`) debajo del logo y las estadísticas.
- **Ancho:** el mismo contenedor de Eventos (`max-w-7xl mx-auto px-4`).
- **Orden de las pestañas** (`TAB_ORDER`, igual para visitante y dueño): Nosotros, la principal de la categoría (Servicios, Productos o Eventos), Horario, Contáctanos y Reseñas.
- **Vista del visitante** (`BusinessSections`): todas las secciones en una sola página. En escritorio, a la izquierda Nosotros (fotos, descripción con Ver más y Lo que encontrarás) y debajo la sección principal de la categoría (Servicios, Productos o Eventos); a la derecha Horario y Contacto y ubicación (con Cómo llegar), y Reseñas a la altura de la sección principal. En celular se apilan en el orden de las pestañas. La barra de pestañas lleva a cada sección y marca la que se está viendo.
- **Vista del dueño (editor):** las pestañas de siempre (`SectionTabs`), con sus controles. Abre en Eventos o, si está oculta, en la primera visible, y cada navegador recuerda la pestaña por negocio mientras dura la sesión. "Mostrar en todas las pestañas" solo aplica a esta vista: para el visitante el contacto siempre está en la columna derecha.

| Pestaña | Contenido |
|---|---|
| Contáctanos | Dirección, teléfono, Instagram (`@usuario`) y sitio web (dominio), cada uno con su texto elegido |
| Eventos | Eventos vigentes con cuenta regresiva y Reservar cupo |
| Horario | Estado actual y horario de la semana |
| Nosotros | Carrusel de fotos y descripción (máximo 2000 caracteres) con comodidades |
| Productos | Tarjetas con imagen, precio y + Agregar por WhatsApp; 6 por página |
| Reseñas | Valoración y comentarios. El visitante ve el promedio, una barra por cada estrella (`stats.ratingCounts`, contado en el servidor) y Escribir una reseña, que abre el formulario o lleva a iniciar sesión |
| Servicios | Tarjetas con imagen, etiquetas y Cotizar por WhatsApp; 6 por página, con la paginación siempre visible |

### Controles del dueño

Solo los ve el dueño (`useIsOwner`). El servidor valida cada cambio por separado.

- **Ver como visitante** (`OwnerPreview`): botón junto a Encuéntranos. Muestra la página como la ve un visitante (diseño de una página, sin controles y sin las pestañas ocultas) y un aviso fijo con Volver a editar. Solo cambia lo que ve el navegador; mientras dura, `useIsOwner` devuelve `false`. Para los controles nuevos usa `useIsOwner`, no compares la sesión a mano, o seguirán visibles en la vista previa.

- **Logo:** reemplazar la imagen y elegir marco redondo o cuadrado. El marco en uso se ve opaco.
- **Portada:** reemplazar la imagen. Logo y portada aceptan arrastrar archivos.
- **Fotos de Nosotros:** agregar, quitar, arrastrar archivos y reordenar. Se publican con Guardar.
- **Descripción, Horario y Contacto:** cada uno con su Editar y su ventana.
- **Productos y servicios:** Editar y Eliminar en cada tarjeta. Eliminar pide confirmación. Agregar producto y Agregar servicio abren su formulario con Eventos y Comodidades (`OfferExtras`); allí cada comodidad se guarda al marcarla.
- **Eventos:** Ir a publicaciones activas (`/create-event?tab=activas`).
- **Interruptores:** Ocultar pestaña en cada pestaña que su categoría tiene (Contáctanos, Eventos, Horario, Productos, Reseñas o Servicios). Nosotros siempre queda visible. En Contáctanos, Mostrar en todas las pestañas pone los datos de contacto debajo de cada una.

### Textos de contacto

| Dato | Opciones | Por defecto |
|---|---|---|
| Dirección | Dirección, Ubicación, Dónde estamos, Visítanos en | Dirección |
| Teléfono | Llámanos, Llámanos al, Haz tu pedido al, Reserva al, Atención, Consultas, Contacto | Llámanos al |
| Instagram | Instagram, Síguenos en Instagram, Nuestro Instagram, Síguenos, Ver, Conoce más en Instagram, Descubre nuestras novedades | Síguenos en Instagram |
| Sitio web | Sitio web, Página web, Web, Web oficial, Visitar sitio web, Ir al sitio web, Conoce más en nuestra web, Sitio oficial | Página web |

Las listas están en `src/lib/business.ts` y el servidor rechaza cualquier otro valor. Instagram y sitio web solo se muestran si el negocio los tiene. Se muestran con dos puntos, y el teléfono con espacios: `Reserva al: +569 3333 1333` (`formatPhone` en `src/lib/phone.ts`).

## Formulario del negocio

**Crear página** (botón del menú de navegación, entre Publicar evento y Cerrar sesión, mientras la cuenta no tenga página) y **Editar página** (botón Encuéntranos del micro-sitio) usan `BusinessForm`, con una sola pestaña:

- **Encuéntranos:** URL (con validación de disponibilidad en vivo), sitio web (prefijo `https://`), WhatsApp y cómo llegar. Al editar, WhatsApp y cómo llegar están bloqueados y cada uno tiene su botón Editar (`EditableField`). Se guardan con Guardar, que solo los envía si cambiaron.
- **Popovers de ayuda:** URL (letras minúsculas y números, preferentemente el nombre del negocio), sitio web (opcional), WhatsApp y cómo llegar (se pueden agregar más adelante).
- **URL única:** se revisa al escribir y otra vez al guardar. Si dos cuentas guardan la misma URL a la vez, la segunda recibe 409 "Esa URL ya está en uso" (índice único `users_slug_key`).

Horario, productos, servicios, comodidades, descripción, fotos, logo y portada se agregan y cambian con los botones de la propia página.

El dueño también puede eliminar la página desde el micro-sitio. Se borra solo el micro-sitio; el perfil, la cuenta y los eventos se conservan.

## Privacidad y cookies (Ley 21.719)

La Ley N° 21.719 entra en vigencia el 1 de diciembre de 2026. Lo pendiente para cumplirla está en `plan.md`.

- **Banner de cookies** (`CookieBanner`): Aceptar, Rechazar y Configurar, con el mismo peso. Nada opcional se carga antes de decidir. La elección se guarda en `localStorage` (`hss_consent`) con versión y fecha, y se vuelve a preguntar si cambia `COOKIE_POLICY_VERSION` (`src/lib/consent.ts`) o pasan 12 meses.
- **Cookies opcionales:** solo Google Maps. Las cookies que existen están en `src/lib/cookie-list.ts`, que usan el panel del banner y la sección Cookies de la política. Un servicio externo nuevo que instale cookies debe pasar por el consentimiento, agregarse a esa lista y a la CSP.
- **Retirar el consentimiento:** "Configurar cookies" en el pie de cada página y en la política.
- **Páginas legales** (`LegalPage`, acordeón con índice y anclas `#seccion`): `/privacidad` (13 secciones, incluida `#cookies`), `/terminosdelservicio` y `/eliminacion-datos`. Cada tema está en una sola página y las demás enlazan a ella. `/politica-cookies` redirige a `/privacidad#cookies`.
- **Responsable de los datos:** `src/lib/legal.ts`. Faltan razón social, RUT, representante legal y domicilio; mientras estén en `null` no se muestran.
- **Pie de página:** Política de privacidad y Configurar cookies en la franja inferior; Términos y Eliminar datos en la columna Legal.

## Inicio de sesión con Google

"Continuar con Google" (login y registro) crea la cuenta con lo que entrega Google: nombre, correo y foto. Queda **sin contraseña, comuna ni datos del administrador**, y debe completarlos en el perfil antes de publicar. El código de Google solo se acepta desde el mismo sitio y se usa una vez (`src/features/auth/googleMessage.ts`). Está pendiente decidir si se quita el botón: ver `plan.md`.

## Configuración

Variables en `.env` (ver `.env.example`). Nunca subas `.env` al repositorio.

- `DATABASE_URL`: Postgres. En local, la base `eventos`. En Vercel debe estar disponible también durante el build, porque el sitemap consulta la base.
- `JWT_SECRET`: obligatorio, sin valor por defecto.
- `FRONTEND_URL`, `PUBLIC_BASE_URL`: URL pública (OAuth y enlaces de imágenes locales).
- `STORAGE_DRIVER=local`: solo desarrollo. En producción no definirlo.
- `CRON_SECRET`: protege `/api/social/refresh-images` (cron diario en `vercel.json`).
- Google, Instagram, SMTP, Supabase: ver `.env.example`.
- `opencode.json`: configuración local de OpenCode (MCP `chrome-devtools` y `context7`). Contiene la clave de Context7, por eso está en `.gitignore`.

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
15. **Sesión creada pero no cargada.** El registro con Google creaba la cookie pero no cargaba el usuario en `AuthContext`: el perfil rebotaba al login y quedaba en blanco. Después de un login que deja cookie, llama a `setUser`.
16. **Mensajes entre ventanas sin revisar el origen.** Un `postMessage` aceptado desde cualquier sitio permite que otro sitio inicie sesión por el usuario. Revisa `e.origin` y envía con `window.location.origin`, nunca con `'*'`.
17. **Servidor de desarrollo con código de servidor viejo.** A veces `pnpm dev` no recarga los servicios del servidor. Para probar reglas del servidor, reinícialo o usa un build aparte en otro puerto (`next start -p 5199`).
18. **Textos legales que prometen lo que el código no hace.** Eliminar datos decía que desconectar Instagram borraba el usuario y la foto, y no era así. Antes de publicar un texto legal, verifica cada afirmación contra el código.
19. **Bases local y de producción distintas.** Un negocio creado en `localhost:5173` no existe en `www.hoysesale.cl`. Para ver qué hay en producción, usa `GET /api/businesses`.
20. **Validación que impide avanzar.** Exigir todos los datos obligatorios para guardar dejaba al usuario sin poder guardar nada. Guarda lo completo, valida lo escrito y muestra lo que falta.

## Pruebas

- `pnpm test`: 122 pruebas. Cubren horarios, utilidades, filtrado de pestañas ocultas, permisos, RUT (incluido el rango de empresa y el formato al escribir), consentimiento de cookies, valor de entrada, URL del mapa y reglas por categoría.
- `src/app/api/authorization.test.ts` recorre todas las rutas de la API. Una ruta nueva debe responder 401 sin sesión, salvo que se declare pública en esa prueba. También comprueba el panel de administración, los datos de otros usuarios y el token de recuperación de contraseña.
- Las pruebas de navegador con Playwright se hicieron fuera del repositorio. Agregarlas sigue pendiente.

## Documentos del proyecto

- `plan.md`: pendientes de la Ley 21.719 y del producto, con criterios de éxito.
- `plan_seguridad.md`: estado de seguridad y escalabilidad, con criterios de éxito.
- `AGENTS.md`: reglas para agentes.
- `prisma/production/pendiente.sql`: último SQL manual aplicado en producción.
- `SPEC.md` y `PLAN.md` no están en este repositorio: están en el backend anterior (`../../eventos/backend-evento/`). `SPEC.md` tiene un resumen de lo que se hizo en esta app.

## Seguridad en producción

- **Sesión:** cookie `access_token` con `HttpOnly`, `Secure` en producción y `SameSite=Lax`. Un token de recuperación de contraseña no sirve como sesión.
- **Cabeceras:** `next.config.ts` define CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`. Solo aplican en producción. CSP usa `'unsafe-inline'` porque la app no usa nonces, permite imágenes de cualquier dominio `https` por Supabase e Instagram, y marcos (`frame-src`) solo de `https://www.google.com` para el mapa de eventos.
- **Intentos:** login, registro, revisión de correo y contraseña usan `sharedRateLimit`, con contadores en `rate_limits`, compartidos entre instancias. Si esa tabla falla, deja pasar y queda el límite en memoria: un problema interno no debe bloquear usuarios. El resto de la API tiene 300 peticiones por minuto por IP, en memoria de cada instancia.
- **Pestañas ocultas:** `getBusinessPageFor` quita su contenido en el servidor. Los visitantes no lo reciben ni en el HTML ni en la API, y nadie recibe el de las pestañas que su categoría no tiene. El giro se usa para calcularlas, pero no se publica. El contacto se conserva si está activo Mostrar en todas las pestañas.
- **Permisos:** cada ruta valida la sesión y la propiedad del dato. La lista de asistentes solo la ve el dueño del evento o un administrador. El reordenamiento de fotos solo acepta las del propio negocio.
- **Imágenes:** el servidor revisa el contenido real del archivo en logo, portada y productos. SVG no se acepta porque puede llevar código.
- **Datos del evento:** la URL de la imagen solo acepta `http` o `https` (evita `javascript:`).
- **Inicio de sesión con Google:** el código se acepta solo desde el mismo origen y una vez.
- **Dependencias:** `pnpm audit --prod` sin vulnerabilidades conocidas al 30-10-2026.
- **Pendiente:** ver `plan_seguridad.md`. Lo principal es rotar los secretos.

