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
- **Límites y validaciones:** los mismos valores en formulario y servidor. Fuentes: `src/lib/media-limits.ts`, `src/lib/hours.ts`, `src/lib/business.ts` (límites de servicios), `src/server/validation.ts`.
- **Campos vacíos:** en campos opcionales envía `null`, no `undefined`, para que el servidor borre el dato. Los datos obligatorios de la empresa (todos menos el sitio web) y del administrador no se pueden vaciar: el servidor rechaza `null`.
- **Perfil:** se guarda de a poco: solo se envían los campos completos y lo escrito se valida. Categoría y giro salen de `src/constants/business.ts` y `src/constants/giros.ts`; un valor fuera de esas listas se trata como vacío. RUT de empresa desde 50.000.000. El aviso de datos pendientes es `CompleteProfileModal`: un campo obligatorio nuevo se agrega ahí, en `REQUIRED_INFO` de `Profile.tsx` y en el servidor.
- **Perfil vs micro-sitio:** nombre, comuna y categoría se editan en el perfil. Dirección, teléfono, Instagram y sitio web son las mismas columnas y también se editan en Contáctanos. La URL, WhatsApp y cómo llegar se editan en `BusinessForm`; lo demás, con los botones de la página. Para crear la página solo se exige la URL.
- **Comuna:** una empresa solo publica eventos de su comuna, y sin comuna no publica. La regla vive en `src/server/services/events.ts`.
- **Tipo de categoría** (`src/lib/business-rules.ts`): cada una de las 24 categorías es de servicios (9), productos (7) o eventos (8). Si una regla nueva pone una categoría en dos tipos, manda la más reciente; la prueba `business-rules.test.ts` exige que cada categoría tenga un solo tipo.
- **Quién publica eventos:** solo las categorías de Turismo y de Panoramas (`EVENT_CATEGORIES`), sin giro de comercio funcional (servicios de barrio y ferreterías). El servidor lo aplica al crear eventos, y el botón Publicar evento del navbar aparece deshabilitado para las demás.
- **Pestañas del micro-sitio:** las define la categoría y se calculan al mostrar la página (`availableTabs`/`unavailableTabs`), así que siguen a la categoría si cambia. Servicios: Contáctanos, Horario, Nosotros, Reseñas y Servicios; productos: cambia Servicios por Productos; eventos: cambia Servicios por Eventos; sin categoría válida: Contáctanos, Horario, Nosotros y Reseñas. Las demás no las ve nadie, **tampoco el dueño**, y su contenido no se envía. El dueño ve las mismas pestañas que el visitante, las edita y puede ocultarlas; las que oculta las sigue viendo para volver a mostrarlas. El visitante ve las secciones en una sola página (`BusinessSections`); el dueño edita en pestañas (`SectionTabs`). Un cambio de diseño para el visitante no debe tocar la vista del editor.
- **Páginas legales:** usa `LegalPage` y deja cada tema en una sola página; las demás enlazan con `#seccion`. Verifica cada afirmación contra el código antes de escribirla.
- **Cookies y servicios externos:** lo que instale cookies de terceros se carga solo con consentimiento (`useConsent`), se agrega a `src/lib/cookie-list.ts` y a la CSP de `next.config.ts`.
- **Después de cambios:** corre `pnpm exec tsc --noEmit`, `pnpm test` y `pnpm build`. Tras un build o un cambio de esquema reinicia `pnpm dev`; si la página se recarga sola, borra `.next` antes. Si el usuario tiene `pnpm dev` corriendo, haz el build en una copia para no tocar su `.next`, y prueba reglas del servidor en un build aparte (`next start -p 5199`): `pnpm dev` a veces no recarga el código del servidor.
- **Rutas de API:** toda ruta nueva exige sesión. Si debe ser pública, decláralo en `src/app/api/authorization.test.ts`.
- **Datos privados:** se filtran en el servidor. No basta con ocultarlos en el cliente.
- **Dueño:** usa `useIsOwner` para mostrar controles (así se ocultan en Ver como visitante); el servidor debe validar igual cada cambio.

## Qué no hacer

- No cambies el diseño (estilos, disposición, orden de pantallas) sin pedirlo. Si detectas un problema visual, repórtalo antes de corregirlo.
- No agregues dependencias sin justificarlas.
- No dejes cuentas de prueba (`rea-*@example.com`) en la base local al terminar.
- No subas claves: `opencode.json` tiene la de Context7 y está en `.gitignore`.
- No des por desplegado algo sin verificar el commit del deployment en Vercel.

## Dónde está cada cosa

- Pantallas públicas: `src/views/BusinessPage.tsx`, `src/app/(main)/`.
- Formulario del negocio: `src/features/business/BusinessForm.tsx` (URL, sitio web y botones de la barra).
- Edición desde la página: `src/features/business/*Edit.tsx`, `OfferItemActions`, `TabVisibilitySwitch`, `ContactVisibility`. Disposición: `BusinessTabs` elige `SectionTabs` (dueño) o `BusinessSections` (visitante).
- Perfil: `src/views/Profile.tsx`, `src/components/ui/ProfileField.tsx` (select agrupado y teléfono `+569`), `src/features/profile/CompleteProfileModal.tsx`, `src/lib/rut.ts`.
- Privacidad y cookies: `src/views/PrivacyPolicy.tsx`, `TermsOfService.tsx`, `DataDeletion.tsx`, `src/components/shared/CookieBanner.tsx`, `src/lib/consent.ts`, `src/lib/cookie-list.ts`, `src/lib/legal.ts`.
- Inicio de sesión con Google: `src/views/Login.tsx`, `Register.tsx`, `GoogleCallback.tsx`, `src/features/auth/googleMessage.ts`.
- API: `src/app/api/` y lógica en `src/server/services/`. Límites: `src/server/rate-limit.ts`.
- Base de datos y seguridad: secciones finales de `README.md`.
- Tareas de seguridad: `plan_seguridad.md`.
- Pendientes de la Ley 21.719 y del producto: `plan.md`.
