# Plan de protección de datos y pendientes — HoySeSale.cl

Tareas pendientes para cumplir la Ley N° 21.719, que entra en vigencia el **1 de diciembre de 2026**, y otros pendientes del producto. Cada tarea tiene un criterio de éxito verificable. Actualizado el 10-11-2026.

Las tareas de seguridad técnica (rotar secretos, límites, escalabilidad) están en `plan_seguridad.md`.

## Estado actual

- **Código:** banner de cookies, Política de privacidad (con la sección Cookies), Términos y Eliminar datos con acordeón, y la corrección de "Desconectar Instagram" están en la rama `feature/consentimiento-cookies`, **sin commit ni despliegue**.
- **Próximo paso:** completar los datos del responsable (tarea 1) y desplegar (tarea 2) antes del 1 de diciembre de 2026.

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

## Fase 0: antes del 1 de diciembre de 2026

1. **Completar los datos del responsable (lo hace el dueño del proyecto).**
   Llenar en `src/lib/legal.ts`: razón social o nombre, RUT, representante legal y domicilio postal (art. 14 ter, letras b y c). Hoy esos campos están en `null` y no se muestran.
   *Criterio:* la sección 1 de `/privacidad` muestra los cuatro datos.

2. **Desplegar la rama `feature/consentimiento-cookies`.**
   Commit, Pull Request y revisión del preview de Vercel antes del merge. No requiere cambios en la base de datos.
   *Criterio:* en `www.hoysesale.cl` aparecen el banner y "Configurar cookies" en el pie. Con rechazo no hay pedidos a `google.com`, y el mapa carga sin avisos de CSP después de aceptar.

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

## Orden sugerido

1. Fase 0, tareas 1 a 5, antes del 1 de diciembre de 2026.
2. Fase 1, tareas 1 a 3: son obligaciones de la ley y no requieren cambios grandes de código.
3. Fase 1, tareas 4 a 6, y Fase 2, según prioridad.
