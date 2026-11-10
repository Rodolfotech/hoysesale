import Link from 'next/link';
import type { AccordionItem } from '@/components/ui/Accordion';
import { LegalPage, legalLink as link } from '@/components/shared/LegalPage';
import { DATA_CONTROLLER, TERMS_DATE, TERMS_VERSION } from '@/lib/legal';

const c = DATA_CONTROLLER;

// Reglas de uso del servicio. Lo relativo a datos personales vive solo en la política de privacidad.
const SECTIONS: AccordionItem[] = [
  {
    id: 'aceptacion',
    title: 'Aceptación de los términos',
    content: (
      <>
        <p>Al crear una cuenta o usar {c.brand} aceptas estos términos. Si no estás de acuerdo, no uses la plataforma.</p>
        <p className="mt-2">Aceptar estos términos no significa consentir tratamientos opcionales de tus datos: esos se piden por separado y puedes rechazarlos sin perder el acceso al servicio.</p>
      </>
    ),
  },
  {
    id: 'servicio',
    title: 'Qué es HoySeSale',
    content: (
      <>
        <p>{c.brand} es una plataforma para publicar y descubrir eventos en La Araucanía. Los organizadores y negocios con cuenta pueden:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Publicar eventos, escribiéndolos o importándolos desde sus publicaciones de Instagram.</li>
          <li>Crear la página de su negocio con productos, servicios, horarios, fotos y datos de contacto.</li>
        </ul>
        <p className="mt-2">Cualquier persona puede ver los eventos y páginas sin crear una cuenta. Las personas registradas pueden, además, dejar reseñas de los negocios.</p>
        <p className="mt-2">{c.brand} difunde eventos: no los organiza ni vende entradas. El precio y las condiciones de cada evento los fija quien lo publica.</p>
      </>
    ),
  },
  {
    id: 'cuenta',
    title: 'Tu cuenta',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Debes entregar información verdadera y mantenerla actualizada.</li>
        <li>Eres responsable de cuidar tu contraseña y de lo que se haga con tu cuenta.</li>
        <li>Si crees que alguien entró a tu cuenta sin permiso, cambia tu contraseña y escríbenos.</li>
        <li>Puedes eliminar tu cuenta cuando quieras: los pasos están en <Link href="/eliminacion-datos" className="underline" style={link}>Eliminar datos</Link>.</li>
      </ul>
    ),
  },
  {
    id: 'contenido',
    title: 'Contenido que publicas',
    content: (
      <>
        <p>Eres responsable de los eventos, imágenes, textos y datos de contacto que publicas. Al publicarlos declaras que tienes derecho a usarlos y nos autorizas a mostrarlos en la plataforma mientras estén publicados.</p>
        <p className="mt-2">No está permitido publicar:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Contenido ilegal, engañoso, ofensivo o que infrinja derechos de terceros.</li>
          <li>Datos personales de otras personas sin su autorización.</li>
          <li>Eventos falsos o información que pueda inducir a error a los asistentes.</li>
        </ul>
        <p className="mt-2">Podemos retirar contenido que incumpla estas reglas. Cuando sea posible, te avisaremos el motivo.</p>
      </>
    ),
  },
  {
    id: 'instagram',
    title: 'Conexión con Instagram',
    content: (
      <p>Conectar Instagram es opcional. Al hacerlo aceptas también los términos de Meta, y solo accedemos a lo que autorices en ese momento. Puedes desconectarlo cuando quieras desde tu perfil. Qué datos obtenemos de Instagram y cómo los tratamos se explica en la <Link href="/privacidad#datos" className="underline" style={link}>Política de privacidad</Link>.</p>
    ),
  },
  {
    id: 'suspension',
    title: 'Suspensión de cuentas',
    content: (
      <p>Podemos suspender o cerrar cuentas que incumplan estos términos o que se usen para fraudes o abusos. Salvo que la ley o la seguridad de otros usuarios lo impidan, te informaremos el motivo y podrás responder escribiéndonos.</p>
    ),
  },
  {
    id: 'responsabilidad',
    title: 'Responsabilidad',
    content: (
      <>
        <p>La información de cada evento y negocio es responsabilidad de quien la publica. Revisa directamente con el organizador los detalles importantes, como fecha, lugar y precio.</p>
        <p className="mt-2">Procuramos que la plataforma funcione de forma continua y segura, pero puede tener interrupciones por mantención o fallas técnicas. Nada en estos términos limita los derechos que te reconoce la Ley N° 19.496 sobre protección de los derechos de los consumidores.</p>
      </>
    ),
  },
  {
    id: 'datos-personales',
    title: 'Datos personales',
    content: (
      <p>El tratamiento de tus datos personales, tus derechos y el uso de cookies se rigen por nuestra <Link href="/privacidad" className="underline" style={link}>Política de privacidad</Link>.</p>
    ),
  },
  {
    id: 'cambios',
    title: 'Cambios en los términos',
    content: (
      <p>Si modificamos estos términos, publicaremos la nueva versión en esta página con su número y fecha. Si el cambio es importante, te avisaremos con anticipación a tu correo o en la plataforma antes de que empiece a regir.</p>
    ),
  },
  {
    id: 'ley-aplicable',
    title: 'Ley aplicable y contacto',
    content: (
      <p>Estos términos se rigen por las leyes de la República de Chile. Para consultas o reclamos escríbenos a <a href={`mailto:${c.email}`} className="underline" style={link}>{c.email}</a>.</p>
    ),
  },
];

export default function TermsOfService() {
  return (
    <LegalPage
      title="Términos y Condiciones"
      version={TERMS_VERSION}
      date={TERMS_DATE}
      intro={<p>Estos términos regulan el uso de {c.brand} ({c.website}): qué ofrece la plataforma, qué puedes publicar y qué responsabilidades tenemos cada uno.</p>}
      sections={SECTIONS}
    />
  );
}
