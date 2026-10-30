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
| `pnpm test` | Pruebas unitarias del frontend (Vitest, 20 pruebas) |
| `pnpm lint` | ESLint (quedan errores heredados, ver `plan_seguridad.md`) |
| `pnpm db:migrate` | `prisma migrate deploy`. No reinicia la base |
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
├── components/ui/            # Primitivas reutilizables: Popover, PhoneInput, InstagramInput,
│                             # WebsiteInput, ImageCarousel, SectionTabs, FormInput, Modal...
├── features/
│   ├── business/             # Micro-sitio: BusinessForm (pestañas), OfferItems, AboutImages,
│   │                         # BusinessHours, BusinessOwnerBar, CreateBusinessPage, offer.ts
│   └── media/                # ImagePicker, MediaUploader
├── lib/                      # Código compartido cliente/servidor (sin 'use client'):
│                             # hours.ts, media-limits.ts, api-error.ts, business.ts
├── constants/                # Comunas, categorías, comodidades
├── api/                      # Cliente axios (baseURL /api)
└── server/                   # Solo servidor
    ├── db.ts                 # Cliente Prisma (singleton, omit de aboutImages)
    ├── http.ts               # route(), errores { statusCode, message }, validación zod
    ├── validation.ts         # Esquemas de entrada
    ├── auth/session.ts       # JWT, cookie, requireUser / requireAdmin
    ├── rate-limit.ts         # Límites en memoria (ver plan de seguridad)
    ├── services/             # auth, users, events, attendees, categories, businesses,
    │                         # media, social, admin, mail, seed
    └── storage/              # Puerto de almacenamiento: local o Supabase
prisma/
├── schema.prisma · migrations/ · seed.ts
└── production/pendiente.sql  # Tablas nuevas para producción (NO aplicado)
```

### Rutas de API principales

`/api/auth/*` (login, register, me, logout, google, instagram, reset-password) · `/api/users/*` (perfil, eliminar cuenta) · `/api/events/*` (listado, detalle, medios, interacciones) · `/api/attendees/*` · `/api/categories` · `/api/businesses/*` (micro-sitio, productos, servicios, destacados, reseñas, `check-slug`, `me/about-images`) · `/api/social/*` (Instagram, cron `refresh-images`) · `/api/control-panel-7f3a/*` (admin) · `/api/health`.

## Reglas de datos (importante)

- **El perfil es la fuente de verdad** de nombre, dirección (calle y número), teléfono, Instagram, comuna y categoría de la empresa. Se editan en **Perfil → Datos de empresa**.
- **El micro-sitio** (URL, sitio web, WhatsApp, cómo llegar, horarios, comodidades, productos, servicios, eventos, descripción, fotos y logo/portada) se edita **solo** desde **Crear página** y **Editar página**, que usan el mismo `BusinessForm`.
- Al crear la página, la URL se calcula desde el nombre del perfil. El servidor también toma nombre y dirección del perfil si la petición no los trae.
- **Campos obligatorios para crear:** URL disponible. Nombre y dirección vienen del perfil y deben estar completos ahí.
- **Vaciar un campo:** el formulario envía `null` para los campos opcionales vacíos. Un `undefined` no se guarda y deja el valor anterior.
- **Formato de datos:**
  - Teléfono: `+569` + 8 dígitos; el primer dígito es de 3 a 9.
  - Instagram: `@usuario`, hasta 30 caracteres (letras, números, `_` y `.`).
  - Horario: `12:00-23:00`, `abierto` o `cerrado`.
  - Dirección: texto `Calle 123` (se separa en calle y número en el formulario).
- **Imágenes:** logo solo WEBP y máximo 10 KB; portada WEBP, 1200 × 400 px y máximo 90 KB; fotos de Nosotros JPG, PNG o WEBP, máximo 4 MB y 3 fotos.

## Formulario del negocio (pestañas)

1. **Información del negocio:** URL (con validación de disponibilidad en vivo).
2. **Encuéntranos:** sitio web (prefijo `https://`), WhatsApp y cómo llegar.
3. **Horario:** desde/hasta en 24 horas por día, y un desplegable `-` / `Abierto` (sábado y domingo también `Cerrado`).
4. **Oferta:** productos, servicios (alta y baja inmediata), eventos (enlace para crear) y comodidades.
5. **Nosotros:** fotos del negocio (carrusel en la página pública) y descripción.
6. **Identidad:** logo y portada.

## Configuración

Variables en `.env` (ver `.env.example`). Nunca subas `.env` al repositorio.

- `DATABASE_URL`: Postgres. En local, la base `eventos`.
- `JWT_SECRET`: obligatorio, sin valor por defecto.
- `FRONTEND_URL`, `PUBLIC_BASE_URL`: URL pública (OAuth y enlaces de imágenes locales).
- `STORAGE_DRIVER=local`: solo desarrollo. En producción no definirlo.
- `CRON_SECRET`: protege `/api/social/refresh-images` (cron diario en `vercel.json`).
- Google, Instagram, SMTP, Supabase: ver `.env.example`.

## Base de datos

- **Local:** 14 migraciones aplicadas, incluida `20261029100000_about_images` (columna `users.aboutImages`).
- **Producción:** las migraciones nuevas **no están aplicadas**. Mientras tanto, `aboutImages` se omite en las consultas (`omit` en `src/server/db.ts`), para que el login y los micro-sitios no fallen. Aplicar las migraciones solo con confirmación explícita.
- Cuando se apliquen en producción: quitar el `omit` de `db.ts` y volver a incluir `aboutImages` en `PUBLIC_BUSINESS_SELECT` (`src/server/services/businesses.ts`).

## Despliegue (Vercel)

Un solo proyecto con Root Directory en la raíz y framework Next.js. Variables de `.env.example`, sin `STORAGE_DRIVER`. El build ejecuta `prisma generate`. Antes de un deploy, revisa en Vercel que el deployment de producción corresponda al commit esperado (campo *Source*).

## Errores que ya cometimos (no repetir)

1. **Funciones `'use client'` en componentes de servidor.** La página del negocio es un componente de servidor: no puede llamar funciones de un archivo con `'use client'`. Pon las funciones compartidas en `src/lib/` o `src/features/*/*.ts` sin esa marca. En desarrollo no siempre falla; el build de producción sí.
2. **Columna nueva sin migración en producción.** Si el código consulta una columna que la base de producción no tiene, falla todo lo que lea esa tabla (login, sesión, micro-sitios) con 500. Antes de desplegar, aplica la migración o quita el campo de las consultas comunes.
3. **Cambios de Prisma sin reiniciar.** Después de `prisma generate` o de cambiar el esquema, reinicia `pnpm dev`: el servidor conserva el cliente anterior.
4. **Build con el dev corriendo.** `pnpm build` escribe en `.next`, la misma carpeta que usa `pnpm dev`. Reinicia el dev después de cada build.
5. **Límites distintos en frontend y servidor.** El navegador aceptaba 5 MB y el servidor 4 MB. Los límites viven en `src/lib/media-limits.ts`: úsalos en ambos lados.
6. **`undefined` en vez de `null`.** Un campo `undefined` no se actualiza, así que el dato viejo queda guardado.
7. **Dar por desplegado algo sin verificarlo.** Un merge en `main` no significa que Vercel lo haya publicado. Verifica el commit del deployment de producción.
8. **Login con límite de 5 por minuto.** Las pruebas repetidas en el mismo minuto dan 429. Espera 60 segundos o reinicia el servidor de desarrollo.
9. **Cuentas de prueba sobrantes.** Las pruebas crean usuarios `rea-*@example.com`. Bórralos al terminar (`delete from users where email like 'rea-%@example.com'`).
10. **Datos sensibles en la terminal.** No imprimas valores de `.env` ni de `~/.config/hoysesale/produccion.env`.

## Pruebas

- `pnpm test`: pruebas del frontend (formato de horarios, validaciones, utilidades).
- La batería de API (autorización, flujos de negocio, fotos, horarios, teléfono, Instagram) hoy vive fuera del repositorio. Pasarla al repositorio es la tarea 1.6 de `plan_seguridad.md`.

## Documentos del proyecto

- `plan_seguridad.md`: plan de seguridad y escalabilidad, con criterios de éxito.
- `SPEC.md` y `PLAN.md` (en el repositorio backend anterior): flujo de ramas y estado del plan.
- `prisma/production/pendiente.sql`: tablas pendientes en producción.
