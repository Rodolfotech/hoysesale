# Plan de protección de datos y pendientes — HoySeSale.cl

Tareas pendientes para cumplir la Ley N° 21.719, que entra en vigencia el **1 de diciembre de 2026**, y otros pendientes del producto. Cada tarea tiene un criterio de éxito verificable. Actualizado el 11-11-2026.

Las tareas de seguridad técnica (rotar secretos, límites, escalabilidad) están en `plan_seguridad.md`.

## Estado actual

- **Producción:** el banner de cookies y la Política de privacidad versión 2.0 se ven en `www.hoysesale.cl` (revisado el 11-11-2026). Falta confirmar en Vercel que el deployment corresponde al último commit de `main`.
- **Sin commit en `main`:** corrección del registro con Google, revisión de origen del código de Google, arrastrar imágenes en productos y servicios, `.gitignore` con `opencode.json`, el aviso "Completa tu perfil", el guardado parcial del perfil, los selects de categoría y giro, el RUT y el teléfono con formato, y la actualización de estos documentos. No requieren cambios en la base de datos.
- **Próximo paso:** completar los datos del responsable (tarea 1) antes del 1 de diciembre de 2026.

## Hecho

| Tarea | Resultado |
|---|---|
| Banner de cookies (art. 12) | Aceptar y Rechazar con el mismo peso, panel "Configurar" con la lista de cookies. Nada opcional se carga antes de decidir |
| Retirar el consentimiento | "Configurar cookies" en el pie de cada página y en la sección Cookies. Se vuelve a preguntar si cambia la versión o pasan 12 meses |
| Google Maps con consentimiento | Sin permiso no se pide nada a Google. Aviso con "Aceptar y ver mapa" y "Abrir en Google Maps" |
| Política de privacidad (art. 14 ter) | 13 secciones que cubren las letras a a l, con versión y fecha |
| Términos y Eliminar datos | Reescritos, con versión y fecha, y sin repetir lo de la Política de privacidad |
| Plazo de respuesta (art. 11) | Corregido a 30 días corridos, prorrogables una vez |
| Supresión al desconectar Instagram (art. 7) | Ahora también se borran el nombre de usuario y la foto. Verificado contra la base local |
| Acordeón reutilizable | `Accordion` y `LegalPage`, usados por las tres páginas legales |
| Datos obligatorios | Todos los de la empresa salvo el sitio web, y todos los del administrador (representante legal). RUT con dígito verificador. El servidor no permite vaciarlos |
| Eventos solo en la comuna de la empresa | Validado en el servidor al crear y editar. Sin comuna no se publica |
| Crear página solo con la URL | La URL es única; si dos cuentas la guardan a la vez, la segunda recibe 409 |
| Registro con Google | Ya no queda en blanco: carga la sesión. El código de Google se acepta solo desde el mismo sitio y una vez |
| Aviso "Completa tu perfil" | Modal con progreso y un botón por dato pendiente que lleva al campo. Popover en cada campo obligatorio |
| Guardado parcial del perfil | Se guarda lo completo aunque falten datos; lo escrito se valida y el aviso indica cuántos faltan |
| Categoría y giro | Selects agrupados: 24 categorías y 65 giros del SII. El servidor rechaza valores fuera de las listas |
| Tipo de categoría | Cada categoría es de servicios (9), productos (7) o eventos (8). Solo publican eventos Turismo y Panoramas. Las pestañas del micro-sitio las define el tipo, para el dueño y los visitantes |
| RUT y teléfono | RUT de empresa desde 50.000.000 y con formato `74.000.888-5` al escribir. Teléfono con `+569` fijo y 8 dígitos (`8765 4321`) |

## Fase 0: antes del 1 de diciembre de 2026

1. **Completar los datos del responsable (lo hace el dueño del proyecto).**
   Llenar en `src/lib/legal.ts`: razón social o nombre, RUT, representante legal y domicilio postal (art. 14 ter, letras b y c). Hoy esos campos están en `null` y no se muestran.
   *Criterio:* la sección 1 de `/privacidad` muestra los cuatro datos.

2. **Confirmar el despliegue y subir lo pendiente.**
   El banner y las políticas ya se ven en producción. Falta verificar en Vercel el commit del deployment, y subir con una rama `fix/` lo que sigue sin commit en `main` (ver Estado actual). No requiere cambios en la base de datos.
   *Criterio:* el commit del deployment de producción coincide con `main`. Con rechazo de cookies no hay pedidos a `google.com`, el mapa carga sin avisos de CSP después de aceptar, y el registro con Google termina en el perfil.

3. **Aceptar los acuerdos de tratamiento de datos (DPA) de los proveedores (lo hace el dueño del proyecto).**
   Vercel, Supabase, Google y Meta los ofrecen en sus paneles o sitios. Respaldan la transferencia internacional a Estados Unidos descrita en la sección 6 de la política (art. 14 ter, letra h).
   *Criterio:* queda guardada una copia o constancia de cada acuerdo aceptado.

4. **Revisión legal.**
   Un abogado revisa la Política de privacidad, los Términos y Eliminar datos antes de publicarlos como definitivos.
   *Criterio:* textos aprobados o ajustados según su revisión.

5. **Confirmar el aviso de cambios en los Términos.**
   La sección "Cambios en los términos" promete avisar con anticipación, por correo o en la plataforma, los cambios importantes. Hoy el sitio solo envía el correo de recuperación de contraseña.
   *Criterio:* existe una forma real de avisar, o el texto se ajusta a lo que sí se puede cumplir.

## Fase 1: procesos que exige la ley

1. **Plazo de conservación de los registros de administración.**
   `admin_audit_logs` guarda la IP y no tiene un plazo definido; la política dice "mientras sea necesario para investigar incidentes" (art. 14 ter, letra i). Definir un plazo (por ejemplo, 12 meses) y borrar automáticamente los registros vencidos.
   *Criterio:* el plazo aparece en la sección 7 de la política y un proceso programado borra los registros más antiguos.

2. **Procedimiento para responder solicitudes de derechos (art. 11).**
   La ley exige acusar recibo, responder por escrito dentro de 30 días corridos y **guardar respaldos** que prueben el envío, la fecha y el contenido de cada respuesta. Hoy las solicitudes llegan a `contacto@hoysesale.cl` sin registro.
   *Criterio:* cada solicitud queda registrada con fecha de ingreso, respuesta y copia enviada.

3. **Registro de vulneraciones de seguridad (art. 14 sexies).**
   La ley exige reportar a la Agencia las vulneraciones con riesgo para los titulares y registrar esas comunicaciones. Falta un procedimiento escrito: quién decide, cómo se reporta y dónde se registra.
   *Criterio:* procedimiento documentado (en `README.md` o en este archivo) y un lugar definido para el registro.

4. **Prueba del consentimiento de cookies (art. 12).**
   La elección se guarda solo en el navegador del visitante, y la ley pone en el responsable la carga de probar el consentimiento. Evaluar guardar en el servidor la versión, la fecha y la elección, sin datos que identifiquen a la persona. Requiere una tabla nueva y su migración en producción.
   *Criterio:* decisión tomada y, si se implementa, cada consentimiento queda registrado en la base.

5. **Portabilidad de datos (art. 9).**
   Hoy la portabilidad solo se puede pedir por correo. Agregar en el perfil una opción para descargar los datos de la cuenta en un formato de uso común (JSON).
   *Criterio:* desde el perfil se descarga un archivo con la cuenta, el negocio y los eventos del usuario.

6. **Código de confirmación de Meta.**
   La ruta `/api/social/instagram/deletion` devuelve un código de confirmación que no se guarda, así que no se puede consultar el estado de una solicitud con ese código.
   *Criterio:* el código se guarda con la fecha y `/eliminacion-datos` permite consultar su estado.

## Fase 2: otros pendientes del producto

1. **Validar el valor de entrada en el servidor.**
   El precio del evento se guarda en la columna `address`, que otro formulario usa como dirección, por eso solo el formulario obliga a ingresar números. Requiere una columna propia y su migración en producción.
   *Criterio:* el servidor rechaza un precio con letras.

2. **Borrar las imágenes reemplazadas.**
   Al cambiar la imagen de un evento, la anterior queda en el almacenamiento sin uso.
   *Criterio:* al guardar una imagen nueva, la anterior se elimina de Supabase Storage.

3. **Mapa de Google con clave oficial.**
   El mapa usa la vista incrustada de Google sin clave de API, que no tiene garantías y podría cambiar. Con enlaces cortos (`maps.app.goo.gl`) no hay coordenadas y se usa la dirección o la comuna.
   *Criterio:* el mapa usa la Embed API con una clave restringida al dominio, o se decide mantener la versión actual.

4. **Títulos de sección muy grandes.**
   Los estilos globales de `h2` en `globals.css` pisan las clases de tamaño. Las páginas legales ya lo evitan con estilos en línea, pero el problema sigue en otras pantallas.
   *Criterio:* se revisan las pantallas afectadas y se corrige el estilo global sin cambiar el diseño acordado.

5. **Revisar en producción las cuentas sin comuna y los eventos fuera de su comuna.**
   Desde ahora una empresa solo publica eventos de su comuna, y sin comuna no puede publicar ni crear su página. Las cuentas creadas con Google o Instagram no tienen comuna hasta que la completan en el perfil. Consulta de solo lectura para el SQL Editor de Supabase:
   `select u.email, u.comuna, e.title, e.city from events e join users u on u.id = e."ownerId" where e.city is distinct from u.comuna;`
   *Criterio:* se decide qué hacer con cada evento listado (moverlo a la comuna de la empresa o despublicarlo) y las cuentas sin comuna la completan.

6. **Decidir si se quita "Continuar con Google".**
   Solo el representante legal debe registrarse e iniciar sesión, con su correo. Las cuentas de Google se crean sin contraseña, comuna ni datos del administrador. Quitar el botón del login y del registro (y la creación de cuentas por Instagram) haría que toda cuenta nueva tenga sus datos desde el registro.
   *Criterio:* decisión tomada; si se quita, no quedan rutas que creen cuentas sin datos obligatorios.

7. **Cuentas existentes con datos incompletos.**
   Al entrar al perfil, el aviso "Completa tu perfil" les muestra lo que falta. También cuentan como faltantes la categoría o el giro antiguos, un teléfono con otro formato y un RUT de empresa menor a 50.000.000. Falta decidir si se les exige completarlos antes de publicar.
   *Criterio:* decisión tomada y, si aplica, publicar exige los datos completos.

8. **Ajustar los textos legales al representante legal.**
   La Política de privacidad y los Términos hablan de "administrador". Deben decir que la cuenta la crea el representante legal de la empresa y que sus datos son obligatorios.
   *Criterio:* textos revisados y verificados contra el código.

9. **Verificar los códigos de giro con el SII.**
   La lista de `src/constants/giros.ts` se cargó tal como se entregó y sus códigos no se revisaron contra el clasificador oficial del SII (por ejemplo, 802000 no parece ser cerrajería). Tampoco se usa el dato "afecto a IVA".
   *Criterio:* cada código coincide con el clasificador del SII, o se corrige o quita.

10. **Decidir si el RUT de empresa admite personas naturales.**
   Hoy se exige RUT desde 50.000.000 (persona jurídica). Una persona natural con giro comercial factura con su RUT personal y no puede completar el perfil.
   *Criterio:* decisión tomada; si se admiten, se quita el límite en `src/lib/rut.ts`.

11. **Mostrar solo los giros de la categoría elegida.**
   Hoy el select de giro ofrece todos los grupos, sin importar la categoría.
   *Criterio:* decisión tomada y, si aplica, el giro se filtra por el grupo de la categoría.

## Orden sugerido

1. Fase 0, tareas 1 a 5, antes del 1 de diciembre de 2026.
2. Fase 1, tareas 1 a 3: son obligaciones de la ley y no requieren cambios grandes de código.
3. Fase 2, tareas 6, 8, 9 y 10, junto con la revisión legal.
4. Fase 1, tareas 4 a 6, y el resto de la Fase 2, según prioridad.
