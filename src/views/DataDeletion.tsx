import Link from 'next/link';
import type { AccordionItem } from '@/components/ui/Accordion';
import { LegalPage, legalHeading as heading, legalLink as link } from '@/components/shared/LegalPage';
import { DATA_CONTROLLER, DATA_DELETION_DATE, DATA_DELETION_VERSION } from '@/lib/legal';

const c = DATA_CONTROLLER;

// Cómo ejercer el derecho de supresión (Ley 21.719, art. 7). Qué datos tratamos y los plazos están en la política de privacidad.
const SECTIONS: AccordionItem[] = [
  {
    id: 'eliminar-cuenta',
    title: 'Eliminar tu cuenta desde el perfil',
    content: (
      <>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Inicia sesión y entra a tu <Link href="/profile" className="underline" style={link}>Perfil</Link>.</li>
          <li>Al final de la página, presiona <strong style={heading}>Eliminar cuenta</strong>.</li>
          <li>Confirma la eliminación.</li>
        </ol>
        <p className="mt-2">La eliminación es inmediata y no se puede deshacer.</p>
      </>
    ),
  },
  {
    id: 'que-se-elimina',
    title: 'Qué se elimina',
    content: (
      <>
        <p>Al eliminar tu cuenta borramos:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Tu cuenta y los datos de tu negocio.</li>
          <li>Tus eventos, productos, servicios y destacados, junto con la página de tu negocio.</li>
          <li>Las reseñas que escribiste y las que recibió tu negocio.</li>
          <li>Tus inscripciones a eventos y los registros de actividad asociados a tu cuenta.</li>
          <li>Las imágenes que subiste.</li>
          <li>La conexión con Instagram y su permiso de acceso.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'desconectar-instagram',
    title: 'Desconectar solo Instagram',
    content: (
      <>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Inicia sesión y entra a tu <Link href="/profile" className="underline" style={link}>Perfil</Link>.</li>
          <li>En <strong style={heading}>Redes sociales</strong>, presiona <strong style={heading}>Desconectar</strong> junto a Instagram.</li>
        </ol>
        <p className="mt-2">Borramos de inmediato tu identificador, nombre de usuario, foto de Instagram y el permiso de acceso. Los eventos que ya creaste se mantienen hasta que los elimines.</p>
      </>
    ),
  },
  {
    id: 'desde-instagram',
    title: 'Si quitas el acceso desde Instagram',
    content: (
      <p>Si eliminas el acceso de {c.brand} desde la configuración de Instagram, Meta nos avisa y borramos automáticamente los mismos datos que al desconectarlo desde tu perfil. Meta te entregará un código de confirmación de la solicitud.</p>
    ),
  },
  {
    id: 'por-correo',
    title: 'Solicitar la eliminación por correo',
    content: (
      <>
        <p>Si no puedes entrar a tu cuenta, o quieres eliminar solo algunos datos, escríbenos a <a href={`mailto:${c.email}`} className="underline" style={link}>{c.email}</a> con el asunto <strong style={heading}>&ldquo;Solicitud de eliminación de datos&rdquo;</strong> e indica el correo de tu cuenta. Podemos pedirte información para comprobar que la cuenta es tuya.</p>
        <p className="mt-2">Los plazos de respuesta y cómo reclamar si no respondemos están en <Link href="/privacidad#derechos" className="underline" style={link}>Tus derechos</Link>, en la Política de privacidad.</p>
      </>
    ),
  },
];

export default function DataDeletion() {
  return (
    <LegalPage
      title="Eliminación de Datos"
      version={DATA_DELETION_VERSION}
      date={DATA_DELETION_DATE}
      intro={<p>Puedes eliminar tus datos tú mismo o pedírnoslo. Qué datos tratamos y tus demás derechos se explican en la <Link href="/privacidad" className="underline" style={link}>Política de privacidad</Link>.</p>}
      sections={SECTIONS}
    />
  );
}
