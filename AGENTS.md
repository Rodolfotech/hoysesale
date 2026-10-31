<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Reglas del proyecto HoySeSale.cl para agentes

Lee `README.md` antes de cambiar nada. Este archivo resume lo que un agente debe respetar.

## Antes de editar

- Revisa `git status` y la rama. Trabaja en `main` solo si el usuario lo pide; si no, crea una rama `feature/`, `fix/` o `chore/` (`SPEC.md` está en el backend anterior).
- No hagas commit ni push sin confirmación del usuario.
- No toques producción: no ejecutes migraciones ni comandos contra la base de producción sin confirmación explícita.
- Nunca uses `prisma migrate deploy` contra producción: su esquema se aplicó con SQL manual y Prisma no lo tiene registrado.
- Nunca imprimas valores de `.env` ni de `~/.config/hoysesale/produccion.env`.

## Al cambiar código

- **Servidor vs cliente:** los componentes de `src/app/(main)/**/page.tsx` y `src/views/BusinessPage.tsx` son de servidor. No importes en ellos funciones de archivos con `'use client'`. Lo compartido va en `src/lib/` o en un `.ts` sin esa marca.
- **Esquema:** cualquier columna nueva necesita migración y agregarla a `prisma/production/pendiente.sql`. Debe aplicarse en producción **antes** de desplegar: sin ella fallan login, registro y micro-sitios.
- **Límites y validaciones:** los mismos valores en formulario y servidor. Fuentes: `src/lib/media-limits.ts`, `src/lib/hours.ts`, `src/server/validation.ts`.
- **Campos vacíos:** envía `null`, no `undefined`, para que el servidor borre el dato.
- **Perfil vs micro-sitio:** nombre, comuna y categoría se editan en el perfil. Dirección, teléfono, Instagram y sitio web son las mismas columnas y también se editan en Contáctanos. La URL, WhatsApp y cómo llegar se editan en `BusinessForm`; lo demás, con los botones de la página.
- **Después de cambios:** corre `pnpm exec tsc --noEmit`, `pnpm test` y `pnpm build`. Tras un build o un cambio de esquema reinicia `pnpm dev`; si la página se recarga sola, borra `.next` antes.
- **Rutas de API:** toda ruta nueva exige sesión. Si debe ser pública, decláralo en `src/app/api/authorization.test.ts`.
- **Datos privados:** se filtran en el servidor. No basta con ocultarlos en el cliente.
- **Dueño:** usa `useIsOwner` para mostrar controles; el servidor debe validar igual cada cambio.

## Qué no hacer

- No cambies el diseño (estilos, disposición, orden de pantallas) sin pedirlo. Si detectas un problema visual, repórtalo antes de corregirlo.
- No agregues dependencias sin justificarlas.
- No dejes cuentas de prueba (`rea-*@example.com`) en la base local al terminar.
- No des por desplegado algo sin verificar el commit del deployment en Vercel.

## Dónde está cada cosa

- Pantallas públicas: `src/views/BusinessPage.tsx`, `src/app/(main)/`.
- Formulario del negocio: `src/features/business/BusinessForm.tsx` (URL, sitio web y botones de la barra).
- Edición desde la página: `src/features/business/*Edit.tsx`, `OfferItemActions`, `TabVisibilitySwitch`, `ContactVisibility`.
- Perfil: `src/views/Profile.tsx`.
- API: `src/app/api/` y lógica en `src/server/services/`. Límites: `src/server/rate-limit.ts`.
- Base de datos y seguridad: secciones finales de `README.md`.
- Tareas de seguridad: `plan_seguridad.md`.
