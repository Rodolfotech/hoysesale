'use client';

import { Link } from '@/lib/router';

export default function DataDeletion() {
  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="rounded-2xl p-8 md:p-12" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1D1D1F' }}>Eliminación de Datos</h1>
          <p className="text-sm mb-10" style={{ color: '#1D1D1F99' }}>
            En HoySeSale respetamos tu privacidad y te garantizamos control total sobre la información que almacenamos.
          </p>

          <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#1D1D1F99' }}>

            {/* Qué datos almacenamos */}
            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>¿Qué datos almacenamos?</h2>
              <p className="mb-3">Al usar la plataforma, podemos guardar la siguiente información según cómo uses el servicio:</p>
              <ul className="space-y-2">
                {[
                  { label: 'Cuenta de usuario', desc: 'Nombre, correo electrónico y contraseña cifrada.' },
                  { label: 'Eventos publicados', desc: 'Título, descripción, fechas, ubicación, categoría e imagen de los eventos que creas.' },
                  { label: 'Inscripciones', desc: 'Registro de los eventos a los que te has inscrito.' },
                  { label: 'Conexión con Instagram', desc: 'ID de usuario de Instagram, nombre de usuario y token de acceso (solo si conectaste tu cuenta).' },
                  { label: 'Publicaciones de Instagram', desc: 'Imágenes y descripciones de tus posts sincronizados para mostrarlos en tus eventos.' },
                ].map(({ label, desc }) => (
                  <li key={label} className="flex gap-3">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#2563EB', marginTop: '6px' }} />
                    <span><strong style={{ color: '#1D1D1F' }}>{label}:</strong> {desc}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Opción 1: Desconectar Instagram */}
            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>Desconectar Instagram desde tu perfil</h2>
              <p className="mb-3">Si solo quieres eliminar tu vinculación con Instagram, puedes hacerlo directamente desde la plataforma:</p>
              <ol className="space-y-2 list-decimal pl-5">
                <li>Inicia sesión en tu cuenta de HoySeSale.</li>
                <li>Ve a tu <Link to="/profile" className="font-medium underline" style={{ color: '#2563EB' }}>Perfil</Link>.</li>
                <li>En la sección <strong style={{ color: '#1D1D1F' }}>Redes sociales</strong>, haz clic en <strong style={{ color: '#1D1D1F' }}>Desconectar</strong> junto a Instagram.</li>
                <li>Tu ID de Instagram, nombre de usuario y token de acceso serán eliminados de forma inmediata.</li>
              </ol>
            </section>

            {/* Opción 2: Eliminar cuenta completa */}
            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>Solicitar la eliminación completa de tu cuenta</h2>
              <p className="mb-3">Si deseas eliminar todos tus datos de HoySeSale (cuenta, eventos, inscripciones y conexión con Instagram), envíanos un correo a:</p>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: '#E4EBFA', color: '#2563EB' }}>
                contacto@hoysesale.cl
              </div>
              <p className="mt-3">Incluye en el asunto: <strong style={{ color: '#1D1D1F' }}>"Solicitud de eliminación de datos"</strong> y tu correo registrado en la plataforma.</p>
              <p className="mt-2">Procesaremos tu solicitud en un plazo máximo de <strong style={{ color: '#1D1D1F' }}>30 días hábiles</strong> y te confirmaremos por correo cuando esté completada.</p>
            </section>

            {/* Qué se elimina */}
            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>¿Qué se elimina al dar de baja tu cuenta?</h2>
              <ul className="space-y-2">
                {[
                  'Tu perfil (nombre y correo electrónico)',
                  'Todos los eventos que hayas creado en la plataforma',
                  'Tus inscripciones a eventos',
                  'La conexión con Instagram y el token de acceso',
                  'Las publicaciones de Instagram sincronizadas',
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#2563EB', marginTop: '6px' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Nota Meta */}
            <section className="rounded-xl p-5" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E4EBFA' }}>
              <h2 className="text-base font-semibold mb-2" style={{ color: '#1D1D1F' }}>Información para Meta / Instagram</h2>
              <p>
                Esta página cumple con el requisito de <em>Data Deletion Callback</em> de Meta. Cuando un usuario revoca los permisos de HoySeSale desde su cuenta de Instagram, procesamos automáticamente la eliminación del token de acceso y los datos de Instagram vinculados a esa cuenta.
              </p>
              <p className="mt-2">
                Para cualquier consulta técnica sobre este proceso, escríbenos a <strong style={{ color: '#1D1D1F' }}>contacto@hoysesale.cl</strong>.
              </p>
            </section>

            <p className="text-xs pt-2" style={{ color: '#1D1D1F66' }}>Última actualización: Junio 2026 · HoySeSale — La Araucanía, Chile</p>
          </div>
        </div>
      </div>
    </div>
  );
}
