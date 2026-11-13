import Link from 'next/link';
import type { AccordionItem } from '@/components/ui/Accordion';
import { LegalPage, LegalSubheading, LegalTable, legalHeading as heading, legalLink as link } from '@/components/shared/LegalPage';
import { CookieSettingsButton } from '@/components/shared/CookieSettingsButton';
import { ANALYTICS_COOKIES, MAPS_COOKIES, NECESSARY_COOKIES, type StorageRow } from '@/lib/cookie-list';
import { DATA_CONTROLLER, PRIVACY_POLICY_DATE, PRIVACY_POLICY_VERSION } from '@/lib/legal';

const cookieRows = (rows: StorageRow[]) => rows.map((r) => [r.name, r.owner, r.purpose, r.duration]);

const DATA_ROWS = [
  ['Cuenta', 'Nombre comercial, nombre y apellido del administrador, correo electrónico, teléfono, comuna y contraseña (guardada cifrada, nunca en texto legible).', 'Tú, al registrarte.'],
  ['Datos del negocio', 'RUT y giro de la empresa, RUT del administrador, dirección, teléfono, Instagram, sitio web, WhatsApp, enlace de ubicación, horarios, descripción, logo, portada y fotos.', 'Tú, si decides completarlos.'],
  ['Contenido que publicas', 'Eventos, imágenes, productos, servicios y destacados.', 'Tú.'],
  ['Instagram', 'Identificador y nombre de usuario, foto de perfil, publicaciones e identificador de acceso a la API.', 'Instagram (Meta), solo si conectas tu cuenta.'],
  ['Google', 'Nombre, correo electrónico y foto de perfil.', 'Google, solo si inicias sesión con Google.'],
  ['Actividad en el sitio', 'Inscripciones a eventos, reseñas que escribes (calificación y comentario) y clics hacia Instagram asociados a tu cuenta. Las vistas de eventos se cuentan sin identificar a nadie.', 'Tu uso del sitio.'],
  ['Analítica', 'Páginas visitadas, clics, desplazamientos y movimientos del puntero, tipo de dispositivo y navegador, ubicación aproximada y dirección IP, asociados a un identificador aleatorio y no a tu cuenta.', 'Tu navegador, solo si aceptas la analítica en el aviso de cookies.'],
  ['Datos técnicos', 'Dirección IP, que se usa para limitar intentos de inicio de sesión y registro y se guarda junto a las acciones de administración. Cookie de sesión.', 'Tu navegador.'],
];

const PURPOSE_ROWS = [
  ['Crear y administrar tu cuenta, iniciar sesión, publicar eventos y tu página de negocio, y mostrarte sus estadísticas.', 'Ejecución del contrato que aceptas al registrarte (art. 13, letra c).'],
  ['Enviarte el correo para recuperar tu contraseña cuando lo pides.', 'Ejecución del contrato (art. 13, letra c).'],
  ['Conectar Instagram para importar tus publicaciones como eventos.', 'Tu consentimiento (art. 12). Puedes retirarlo desconectando Instagram desde tu perfil.'],
  ['Mostrar mapas de Google Maps en el detalle de los eventos.', 'Tu consentimiento (art. 12), que se pide en el aviso de cookies.'],
  ['Medir cómo se usa el sitio para mejorarlo, con Google Analytics y Microsoft Clarity, cargados por Google Tag Manager.', 'Tu consentimiento (art. 12), que se pide en el aviso de cookies. Puedes retirarlo en Configurar cookies.'],
  ['Proteger el servicio y las cuentas: limitar intentos por dirección IP y registrar acciones de administración.', 'Interés legítimo (art. 13, letra d): evitar accesos indebidos, fraudes y abusos.'],
  ['Responder requerimientos de autoridades o cumplir otras obligaciones.', 'Obligación legal (art. 13, letra b).'],
];

const RECIPIENT_ROWS = [
  ['Vercel Inc.', 'Alojamiento del sitio y de su servidor.', 'Estados Unidos'],
  ['Supabase Inc.', 'Base de datos y almacenamiento de imágenes.', 'Estados Unidos'],
  ['Meta Platforms, Inc.', 'Conexión con Instagram, si la activas.', 'Estados Unidos'],
  ['Google LLC', 'Inicio de sesión con Google y mapas, si los usas. Analítica con Google Tag Manager y Google Analytics, si la aceptas.', 'Estados Unidos'],
  ['Microsoft Corporation', 'Analítica de uso con Microsoft Clarity, si la aceptas.', 'Estados Unidos'],
  ['Proveedor de correo electrónico', 'Envío de correos de recuperación de contraseña.', 'Según el proveedor'],
];

const RETENTION_ROWS = [
  ['Cuenta, datos del negocio y contenido publicado', 'Mientras tu cuenta exista. Al eliminarla se borran de inmediato; el detalle está en la página Eliminar datos.'],
  ['Conexión con Instagram', 'Hasta que la desconectes o elimines tu cuenta.'],
  ['Cookie de sesión', '7 días o hasta que cierres sesión.'],
  ['Datos de analítica', 'Las cookies duran hasta 2 años (Google Analytics) y 1 año (Clarity). Cada proveedor guarda los datos según su configuración: en Google Analytics, 2 meses por defecto; en Clarity, las sesiones grabadas 30 días y los datos agregados hasta 13 meses.'],
  ['Enlace para recuperar la contraseña', '1 hora.'],
  ['Contadores de intentos', 'Unos minutos. La dirección IP se guarda transformada (cifrado de un solo sentido) y el contador se borra al vencer.'],
  ['Registro de acciones de administración', 'Mientras sea necesario para investigar incidentes de seguridad.'],
];

const c = DATA_CONTROLLER;

// Secciones de la política según la Ley 21.719, artículo 14 ter (letras a a l). El id es el ancla de cada una.
const SECTIONS: AccordionItem[] = [
  {
    id: 'responsable',
    title: 'Responsable de tus datos',
    content: (
      <>
        <ul className="list-disc pl-5 space-y-1">
          <li>Responsable: {c.legalName ?? c.brand}{c.rut && `, RUT ${c.rut}`}.</li>
          {c.representative && <li>Representante legal: {c.representative}.</li>}
          {c.postalAddress && <li>Domicilio: {c.postalAddress}.</li>}
          <li>Correo para solicitudes y consultas: <a href={`mailto:${c.email}`} className="underline" style={link}>{c.email}</a>.</li>
          <li>Ubicación: {c.region}.</li>
          <li>No hemos designado un encargado de prevención.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'datos',
    title: 'Qué datos tratamos y de dónde vienen',
    content: (
      <>
        <p>Tratamos datos de los negocios y organizadores que crean una cuenta, de sus administradores, de las personas registradas y de quienes visitan el sitio.</p>
        <LegalTable head={['Categoría', 'Datos', 'Origen']} rows={DATA_ROWS} />
        <p className="mt-3">No tratamos datos sensibles, como salud, origen étnico u opiniones políticas, ni datos biométricos.</p>
      </>
    ),
  },
  {
    id: 'finalidades',
    title: 'Para qué los usamos y con qué fundamento',
    content: (
      <>
        <LegalTable head={['Finalidad', 'Base de legitimidad (Ley 21.719)']} rows={PURPOSE_ROWS} />
        <p className="mt-3">No usamos tus datos para publicidad, no los vendemos y no creamos perfiles de comportamiento.</p>
      </>
    ),
  },
  {
    id: 'informacion-publica',
    title: 'Qué información es pública',
    content: (
      <>
        <p>Los eventos y la página de tu negocio son públicos: cualquier visitante ve el nombre del negocio, el contenido publicado y los datos de contacto que decidas mostrar. Puedes ocultar pestañas de tu página, como Contáctanos, y esos datos dejan de enviarse a los visitantes. Tu correo, tu contraseña, los RUT y los datos del administrador no se publican.</p>
      </>
    ),
  },
  {
    id: 'destinatarios',
    title: 'Con quién compartimos tus datos',
    content: (
      <>
        <p>Para funcionar usamos proveedores que tratan datos por encargo nuestro y solo para prestar el servicio:</p>
        <LegalTable head={['Destinatario', 'Para qué', 'País']} rows={RECIPIENT_ROWS} />
        <p className="mt-3">También podemos comunicar datos a tribunales u otras autoridades cuando la ley lo exija. No cedemos tus datos a terceros para sus propios fines.</p>
      </>
    ),
  },
  {
    id: 'transferencia-internacional',
    title: 'Transferencia internacional',
    content: (
      <>
        <p>Los proveedores indicados almacenan o procesan datos en Estados Unidos. A la fecha de esta versión, Estados Unidos no cuenta con una declaración de nivel adecuado de protección por parte de la Agencia de Protección de Datos Personales. Estas transferencias son necesarias para prestar el servicio que solicitas, y los proveedores publican compromisos contractuales de protección y seguridad de datos para sus clientes.</p>
      </>
    ),
  },
  {
    id: 'conservacion',
    title: 'Cuánto tiempo guardamos tus datos',
    content: (
      <>
        <LegalTable head={['Datos', 'Plazo']} rows={RETENTION_ROWS} />
      </>
    ),
  },
  {
    id: 'seguridad',
    title: 'Cómo protegemos tus datos',
    content: (
      <>
        <ul className="list-disc pl-5 space-y-1">
          <li>Conexión cifrada (HTTPS) en todo el sitio.</li>
          <li>Contraseñas guardadas con cifrado de un solo sentido (bcrypt).</li>
          <li>Sesión en una cookie protegida a la que no puede acceder el código de las páginas.</li>
          <li>Cada cambio se valida en el servidor, que verifica que seas el dueño de lo que modificas.</li>
          <li>Los datos privados se filtran en el servidor antes de enviar una página a un visitante.</li>
          <li>Límites de intentos para frenar ataques de contraseña y registros masivos.</li>
          <li>Encabezados de seguridad que restringen qué contenido externo puede cargar el sitio.</li>
          <li>Acceso a la base de datos restringido con políticas de seguridad y credenciales que no se publican.</li>
        </ul>
        <p className="mt-3">Si ocurre una vulneración de seguridad que ponga en riesgo tus derechos, la informaremos a la Agencia de Protección de Datos Personales y, cuando corresponda, a las personas afectadas, como exige la ley.</p>
      </>
    ),
  },
  {
    id: 'derechos',
    title: 'Tus derechos',
    content: (
      <>
        <p>Puedes solicitar en cualquier momento y de forma gratuita:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong style={heading}>Acceso:</strong> saber qué datos tuyos tratamos y cómo.</li>
          <li><strong style={heading}>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
          <li><strong style={heading}>Supresión:</strong> eliminar tus datos.</li>
          <li><strong style={heading}>Oposición:</strong> que dejemos de tratarlos para una finalidad.</li>
          <li><strong style={heading}>Portabilidad:</strong> recibir tus datos en un formato estructurado y de uso común.</li>
          <li><strong style={heading}>Bloqueo temporal:</strong> suspender el tratamiento mientras se resuelve una solicitud.</li>
        </ul>
        <p className="mt-3">Escríbenos a <a href={`mailto:${c.email}`} className="underline" style={link}>{c.email}</a> indicando tu nombre, el correo de tu cuenta y qué derecho quieres ejercer. Acusaremos recibo y responderemos dentro de 30 días corridos, prorrogables una vez por 30 días más. Las solicitudes de bloqueo temporal se responden dentro de 2 días hábiles. Para eliminar tu cuenta también puedes seguir los pasos de <Link href="/eliminacion-datos" className="underline" style={link}>Eliminar datos</Link>.</p>
        <p className="mt-2">Cuando el tratamiento se basa en tu consentimiento, puedes retirarlo en cualquier momento, sin que eso afecte lo realizado mientras estuvo vigente.</p>
        <p className="mt-2">Si rechazamos tu solicitud o no respondemos a tiempo, puedes reclamar ante la Agencia de Protección de Datos Personales dentro de 30 días hábiles.</p>
      </>
    ),
  },
  {
    id: 'decisiones-automatizadas',
    title: 'Decisiones automatizadas',
    content: (
      <>
        <p>No tomamos decisiones automatizadas ni elaboramos perfiles que produzcan efectos sobre ti.</p>
      </>
    ),
  },
  {
    id: 'menores',
    title: 'Niños, niñas y adolescentes',
    content: (
      <>
        <p>Para tratar datos de menores de 14 años se necesita el consentimiento de su madre, padre o representante legal. Si eres madre, padre o representante y crees que un menor nos entregó datos sin ese consentimiento, escríbenos y los eliminaremos.</p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies',
    content: (
      <>
        <p>Las cookies y el almacenamiento local son pequeños datos que el sitio guarda en tu navegador. Usamos cookies necesarias y, solo si las aceptas, cookies de mapas y de analítica. No usamos cookies de publicidad ni compartimos datos para mostrarte anuncios.</p>

        <LegalSubheading>Cookies necesarias</LegalSubheading>
        <p className="mt-1">Son indispensables para prestar el servicio que solicitas, como iniciar sesión o no perder un formulario a medio llenar. Están siempre activas y no requieren tu consentimiento (art. 13, letra c).</p>
        <LegalTable head={['Nombre', 'Responsable', 'Para qué sirve', 'Duración']} rows={cookieRows(NECESSARY_COOKIES)} />

        <LegalSubheading>Cookies de terceros opcionales</LegalSubheading>
        <p className="mt-1">Solo se cargan si das tu consentimiento previo, libre, informado y específico (art. 12), y cada grupo se acepta por separado. Si las rechazas, el sitio funciona igual.</p>

        <p className="mt-3 font-medium">Mapas</p>
        <p className="mt-1">Si no los aceptas, en lugar del mapa verás un aviso y un enlace para abrir la ubicación en Google Maps por tu cuenta.</p>
        <LegalTable head={['Nombre', 'Responsable', 'Para qué sirve', 'Duración']} rows={cookieRows(MAPS_COOKIES)} />

        <p className="mt-3 font-medium">Analítica</p>
        <p className="mt-1">Nos dice qué páginas se visitan y cómo se usa el sitio, para mejorarlo. Google Tag Manager carga Google Analytics y Microsoft Clarity solo después de que aceptas; no se cargan en la primera visita ni si rechazas. Clarity registra clics, desplazamientos y movimientos del puntero para mostrarnos cómo se navega. Si retiras el consentimiento, borramos sus cookies de este sitio y dejamos de cargarlos.</p>
        <LegalTable head={['Nombre', 'Responsable', 'Para qué sirve', 'Duración']} rows={cookieRows(ANALYTICS_COOKIES)} />
        <p className="mt-3">Google LLC y Microsoft Corporation tratan estos datos en Estados Unidos. Puedes revisar cómo los usan en sus políticas de privacidad: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline" style={link}>policies.google.com/privacy</a> y <a href="https://privacy.microsoft.com/es-es/privacystatement" target="_blank" rel="noopener noreferrer" className="underline" style={link}>privacy.microsoft.com</a>.</p>

        <LegalSubheading>Contenido externo sin cookies</LegalSubheading>
        <p className="mt-1">Las imágenes de los eventos pueden cargarse desde Instagram (Meta) o desde nuestro almacenamiento en Supabase. Esos servicios reciben tu dirección IP como en cualquier visita a un sitio web, pero no instalamos cookies suyas.</p>

        <LegalSubheading>Cómo aceptar, rechazar o cambiar tu decisión</LegalSubheading>
        <p className="mt-1">La primera vez que visitas el sitio te preguntamos si aceptas las cookies opcionales. Aceptar y rechazar tienen la misma importancia, y nada opcional se carga antes de que decidas. Puedes cambiar o retirar tu consentimiento en cualquier momento, sin dar motivos y de forma gratuita, desde &ldquo;Configurar cookies&rdquo; en el pie de cada página o con este botón:</p>
        <CookieSettingsButton className="mt-3 inline-flex px-4 py-2 rounded-full text-sm font-medium" style={{ color: '#2563EB', border: '1px solid #2563EB' }} />
        <p className="mt-3">Retirar el consentimiento no afecta lo que ya se hizo mientras estuvo vigente. Te volveremos a preguntar si cambiamos estas condiciones o si pasan 12 meses desde tu elección. También puedes borrar o bloquear las cookies desde la configuración de tu navegador; si bloqueas las necesarias, no podrás iniciar sesión.</p>
      </>
    ),
  },
  {
    id: 'cambios',
    title: 'Cambios a esta política',
    content: (
      <>
        <p>Si modificamos esta política, publicaremos la nueva versión en esta página con su número y fecha. Si el cambio afecta un tratamiento basado en tu consentimiento, te lo pediremos de nuevo.</p>
      </>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Política de Privacidad"
      version={PRIVACY_POLICY_VERSION}
      date={PRIVACY_POLICY_DATE}
      intro={<p>Esta política explica qué datos personales trata {c.brand} ({c.website}), para qué, con quién los comparte, cuánto tiempo los guarda, cómo puedes ejercer tus derechos y qué cookies usamos. Se rige por la Ley N° 19.628 sobre protección de la vida privada y, desde el 1 de diciembre de 2026, por las modificaciones de la Ley N° 21.719.</p>}
      sections={SECTIONS}
    />
  );
}
