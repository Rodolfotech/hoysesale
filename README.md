# HoySeSale.cl

Directorio de negocios y cartelera de eventos de La Araucanía. Frontend y backend en una sola app de **Next.js 16** (App Router): las páginas están en `src/app/`, y la API en `src/app/api/` (route handlers).

Migrado desde el backend NestJS (`eventos/backend-evento`), con el frontend Next de ese mismo proyecto como base visual.

## Stack

- Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 (pnpm)
- Prisma 7 con `@prisma/adapter-pg` (PostgreSQL / Supabase)
- Sesión con cookie httpOnly `access_token` (JWT de 7 días)
- Imágenes: Supabase Storage (producción) o `uploads/` (desarrollo)
- zod para validar entradas · nodemailer para la recuperación de contraseña

## Puesta en marcha

```bash
pnpm install
cp .env.example .env        # completa DATABASE_URL, JWT_SECRET y las demás variables
pnpm db:migrate             # aplica las migraciones pendientes (prisma migrate deploy)
pnpm seed                   # crea el admin si no existe (ADMIN_EMAIL / ADMIN_PASSWORD)
pnpm dev                    # http://localhost:5173
```

El puerto 5173 se mantiene porque las URL de redirección de Google e Instagram ya están registradas con él.

### Scripts

| Script | Qué hace |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Servidor de desarrollo, build de producción y arranque (puerto 5173) |
| `pnpm db:migrate` | `prisma migrate deploy` (no reinicia la base) |
| `pnpm db:generate` | Regenera el cliente de Prisma en `src/generated/prisma` |
| `pnpm seed` | Crea la cuenta admin si no existe. No sobrescribe nada |
| `pnpm test` | Pruebas unitarias del frontend (Vitest) |
| `pnpm lint` | ESLint |

## Estructura

```
src/
├── app/                    # Páginas (App Router) y API
│   ├── (main)/             # Páginas públicas con Navbar y Footer
│   ├── api/                # Route handlers: auth, users, events, attendees, categories,
│   │                       # businesses, media, uploads, social, control-panel-7f3a (admin), health
│   ├── uploads/[...path]/  # Sirve uploads/ en desarrollo (STORAGE_DRIVER=local)
│   ├── sitemap.ts · robots.ts
├── views/                  # Pantallas (componentes cliente)
├── components/ui/          # Primitivas reutilizables
├── features/<dominio>/     # Componentes y hooks por dominio
├── api/                    # Cliente axios (baseURL /api)
├── constants/              # Comunas, categorías, comodidades (las usa también el servidor)
├── lib/business.ts         # Tipos del micro-sitio y SITE_URL
└── server/                 # Lógica del backend (solo servidor)
    ├── db.ts               # Cliente Prisma (singleton)
    ├── http.ts             # route(), errores { statusCode, message }, validación con zod
    ├── validation.ts       # Esquemas de entrada (reemplazan los DTO de NestJS)
    ├── auth/session.ts     # JWT, cookie de sesión, requireUser / requireAdmin
    ├── rate-limit.ts       # 300/min global y 5/min en login, por IP (en memoria)
    ├── services/           # auth, users, events, attendees, categories, businesses, media, social, admin, mail
    └── storage/            # Puerto de almacenamiento: local o Supabase
prisma/
├── schema.prisma · migrations/ · seed.ts
└── production/pendiente.sql   # SQL de las tablas nuevas para producción (NO aplicado)
```

## Configuración

Variables en `.env` (ver `.env.example`). Las más importantes:

- `DATABASE_URL`: Postgres. En local, la base `eventos`.
- `JWT_SECRET`: obligatorio. Sin valor por defecto.
- `FRONTEND_URL`, `PUBLIC_BASE_URL`: URL pública de la app (OAuth y enlaces de imágenes locales).
- `STORAGE_DRIVER=local`: solo desarrollo. En producción no definirlo.
- `CRON_SECRET`: protege `/api/social/refresh-images` (cron diario en `vercel.json`).

## Base de datos

- **Local:** las 13 migraciones están aplicadas (`prisma migrate status` no muestra pendientes).
- **Producción:** no se ha tocado. Según `prisma/production/pendiente.sql`, hay que crear las tablas nuevas y registrar `_prisma_migrations`. Se hace solo con confirmación explícita.

## Despliegue (Vercel)

Un solo proyecto con Root Directory en la raíz, framework Next.js. Variables: las de `.env.example` sin `STORAGE_DRIVER`. Con Vercel la app usa `DATABASE_URL` del pooler de Supabase.

## Notas de la migración

- Las rutas de la API conservan las mismas URL y formas de respuesta que el backend NestJS, así que el frontend no cambió en sus llamadas.
- Se corrigieron tres problemas del backend original:
  - `PUT /users/profile` aceptaba cualquier campo del body (incluido `role`). Ahora solo se aceptan los campos del perfil.
  - `PUT /events/:id` aceptaba `ownerId` y otros campos internos. Ahora solo se aceptan los campos editables.
  - `POST /attendees` aceptaba un `userId` ajeno. Ahora siempre usa la sesión.
- El webhook de Instagram ya no tiene token por defecto: sin `INSTAGRAM_WEBHOOK_TOKEN` queda cerrado.
- Swagger no se portó.
